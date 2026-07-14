/**
 * AfroStore RAG Engine — Hybrid Search with Reciprocal Rank Fusion (RRF)
 *
 * Combines BM25 (keyword) and vector (semantic) search results
 * using RRF for optimal ranking. This is the core competitive advantage.
 *
 * Why RRF over simple score interpolation?
 * - Score scales differ between BM25 and cosine similarity
 * - RRF is rank-based, so it's naturally scale-invariant
 * - Proven effective in information retrieval research (Cormack et al., 2009)
 * - Simple, parameter-efficient (just k), and robust
 *
 * Formula: RRF_score(d) = Σ (weight_i / (k + rank_i(d)))
 *
 * Where:
 * - k is a constant (default 60) that dampens the influence of high ranks
 * - rank_i(d) is the rank of document d in result list i (1-indexed)
 * - weight_i is the relative weight of each search method
 */

import type { SearchQuery, SearchResult, SearchResponse, SearchMeta, ScoreBreakdown } from '../types';
import { SearchStrategy, DocumentType } from '../types';
import { SearchError, TenantIsolationError } from '../errors';
import { BM25Search } from './bm25';
import { VectorSearch } from './vector';
import { createLogger } from '../logger';
import { metrics, METRIC } from '../utils/metrics';
import type { RAGConfig } from '../types';

const logger = createLogger('search.hybrid');

export class HybridSearch {
  private readonly bm25: BM25Search;
  private readonly vector: VectorSearch;
  private readonly config: RAGConfig['search'];

  constructor(
    bm25: BM25Search,
    vector: VectorSearch,
    config: RAGConfig['search']
  ) {
    this.bm25 = bm25;
    this.vector = vector;
    this.config = config;
  }

  /**
   * Execute hybrid search: BM25 + Vector with RRF fusion.
   *
   * Runs both searches in parallel, then fuses results.
   * Falls back to single-mode if one search fails.
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    if (!query.siteId) throw new TenantIsolationError();

    const strategy = query.strategy || this.config.defaultStrategy;
    const startTime = performance.now();

    const timings: SearchMeta['timings'] = {
      totalMs: 0,
    };
    const counts: SearchMeta['counts'] = {
      returned: 0,
    };

    let results: SearchResult[];
    let fallbackUsed = false;
    let fallbackReason: string | undefined;

    try {
      switch (strategy) {
        case SearchStrategy.BM25: {
          const bm25Start = performance.now();
          results = await this.bm25.search(query);
          timings.bm25Ms = Math.round(performance.now() - bm25Start);
          counts.bm25Candidates = results.length;
          break;
        }

        case SearchStrategy.VECTOR: {
          const vecStart = performance.now();
          results = await this.vector.search(query);
          timings.vectorMs = Math.round(performance.now() - vecStart);
          counts.vectorCandidates = results.length;
          break;
        }

        case SearchStrategy.HYBRID:
        case SearchStrategy.HYBRID_RERANK: {
          // Run BM25 and Vector in parallel
          const [bm25Result, vectorResult] = await this.executeParallel(query, timings);

          counts.bm25Candidates = bm25Result.results.length;
          counts.vectorCandidates = vectorResult.results.length;

          // Handle fallbacks
          if (bm25Result.error && vectorResult.error) {
            throw new SearchError('Both BM25 and vector search failed', {
              context: {
                bm25Error: bm25Result.error.message,
                vectorError: vectorResult.error.message,
              },
            });
          }

          if (bm25Result.error) {
            fallbackUsed = true;
            fallbackReason = `BM25 failed: ${bm25Result.error.message}. Using vector only.`;
            results = vectorResult.results;
            logger.warn('BM25 search failed, falling back to vector only', {
              error: bm25Result.error.message,
            });
          } else if (vectorResult.error) {
            fallbackUsed = true;
            fallbackReason = `Vector failed: ${vectorResult.error.message}. Using BM25 only.`;
            results = bm25Result.results;
            logger.warn('Vector search failed, falling back to BM25 only', {
              error: vectorResult.error.message,
            });
          } else {
            // Fuse results with RRF
            const fusionStart = performance.now();
            results = this.reciprocalRankFusion(
              bm25Result.results,
              vectorResult.results,
              query
            );
            timings.fusionMs = Math.round(performance.now() - fusionStart);
            counts.fusedResults = results.length;
          }

          if (fallbackUsed) {
            metrics.increment(METRIC.SEARCH_FALLBACKS);
          }
          break;
        }

        default:
          throw new SearchError(`Unknown search strategy: ${strategy}`);
      }
    } catch (error) {
      if (error instanceof SearchError) throw error;
      throw new SearchError(`Hybrid search failed: ${(error as Error).message}`, {
        cause: error as Error,
      });
    }

    // Apply score threshold
    const minScore = query.minScore ?? this.config.minScore;
    if (minScore > 0) {
      results = results.filter((r) => r.score >= minScore);
    }

    // Apply type boosts
    if (query.typeBoosts) {
      results = this.applyTypeBoosts(results, query.typeBoosts);
    }

    // Apply limit
    const limit = Math.min(
      query.limit || this.config.defaultLimit,
      this.config.maxLimit
    );
    results = results.slice(0, limit);
    counts.returned = results.length;
    counts.afterFilter = results.length;

    const totalMs = Math.round(performance.now() - startTime);
    timings.totalMs = totalMs;

    metrics.observe(METRIC.SEARCH_LATENCY, totalMs);
    metrics.increment(METRIC.SEARCH_TOTAL);
    metrics.observe(METRIC.SEARCH_RESULTS, results.length);

    const meta: SearchMeta = {
      strategy,
      query: query.query,
      latencyMs: totalMs,
      timings,
      counts,
      fallbackUsed,
      fallbackReason,
    };

    logger.info('Search completed', {
      strategy,
      query: query.query,
      siteId: query.siteId,
      results: results.length,
      latencyMs: totalMs,
      fallback: fallbackUsed,
    });

    return {
      results,
      totalCount: results.length,
      meta,
    };
  }

  /**
   * Reciprocal Rank Fusion (RRF)
   *
   * For each document, computes:
   *   score = (bm25Weight / (k + bm25Rank)) + (vectorWeight / (k + vectorRank))
   *
   * Documents only in one list get a penalty rank of (listLength + 1).
   */
  private reciprocalRankFusion(
    bm25Results: SearchResult[],
    vectorResults: SearchResult[],
    query: SearchQuery
  ): SearchResult[] {
    const { k, bm25Weight, vectorWeight } = this.config.rrf;

    // Build rank maps (1-indexed)
    // Key by document_id + chunk_index for unique identification
    const bm25Ranks = new Map<string, { rank: number; result: SearchResult }>();
    const vectorRanks = new Map<string, { rank: number; result: SearchResult }>();

    for (let i = 0; i < bm25Results.length; i++) {
      const key = `${bm25Results[i].documentId}:${bm25Results[i].chunkIndex}`;
      bm25Ranks.set(key, { rank: i + 1, result: bm25Results[i] });
    }

    for (let i = 0; i < vectorResults.length; i++) {
      const key = `${vectorResults[i].documentId}:${vectorResults[i].chunkIndex}`;
      vectorRanks.set(key, { rank: i + 1, result: vectorResults[i] });
    }

    // Collect all unique document keys
    const allKeys = new Set([...bm25Ranks.keys(), ...vectorRanks.keys()]);

    // Penalty rank for missing documents
    const bm25Penalty = bm25Results.length + 1;
    const vectorPenalty = vectorResults.length + 1;

    // Compute RRF scores
    const scored: Array<{ key: string; result: SearchResult; rrfScore: number; breakdown: ScoreBreakdown }> = [];

    for (const key of allKeys) {
      const bm25Entry = bm25Ranks.get(key);
      const vectorEntry = vectorRanks.get(key);

      const bm25Rank = bm25Entry?.rank ?? bm25Penalty;
      const vectorRank = vectorEntry?.rank ?? vectorPenalty;

      const bm25Component = bm25Weight / (k + bm25Rank);
      const vectorComponent = vectorWeight / (k + vectorRank);
      const rrfScore = bm25Component + vectorComponent;

      // Use the result from whichever list has it (prefer BM25 for content snippets)
      const result = bm25Entry?.result ?? vectorEntry!.result;

      scored.push({
        key,
        result: {
          ...result,
          score: rrfScore,
        },
        rrfScore,
        breakdown: {
          bm25Score: bm25Entry?.result.score,
          vectorScore: vectorEntry?.result.score,
          rrfScore,
          finalScore: rrfScore,
        },
      });
    }

    // Sort by RRF score descending
    scored.sort((a, b) => b.rrfScore - a.rrfScore);

    // Normalize scores to 0-1 range
    const maxScore = scored.length > 0 ? scored[0].rrfScore : 1;
    const minScoreVal = scored.length > 0 ? scored[scored.length - 1].rrfScore : 0;
    const scoreRange = maxScore - minScoreVal || 1;

    return scored.map(({ result, breakdown }) => ({
      ...result,
      score: (result.score - minScoreVal) / scoreRange,
      scoreBreakdown: {
        ...breakdown,
        finalScore: ((breakdown.rrfScore ?? 0) - minScoreVal) / scoreRange,
      },
    }));
  }

  /** Apply document type boost multipliers */
  private applyTypeBoosts(
    results: SearchResult[],
    boosts: Partial<Record<DocumentType, number>>
  ): SearchResult[] {
    return results
      .map((r) => {
        const boost = boosts[r.documentType] ?? 1.0;
        return {
          ...r,
          score: r.score * boost,
          scoreBreakdown: r.scoreBreakdown
            ? {
                ...r.scoreBreakdown,
                typeBoost: boost,
                finalScore: (r.scoreBreakdown.finalScore ?? r.score) * boost,
              }
            : undefined,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /** Run BM25 and vector search in parallel with error isolation */
  private async executeParallel(
    query: SearchQuery,
    timings: SearchMeta['timings']
  ): Promise<
    [
      { results: SearchResult[]; error?: Error },
      { results: SearchResult[]; error?: Error },
    ]
  > {
    const bm25Promise = (async () => {
      const start = performance.now();
      try {
        const results = await this.bm25.search(query);
        timings.bm25Ms = Math.round(performance.now() - start);
        return { results };
      } catch (error) {
        timings.bm25Ms = Math.round(performance.now() - start);
        return { results: [] as SearchResult[], error: error as Error };
      }
    })();

    const vectorPromise = (async () => {
      const start = performance.now();
      try {
        const results = await this.vector.search(query);
        timings.vectorMs = Math.round(performance.now() - start);
        return { results };
      } catch (error) {
        timings.vectorMs = Math.round(performance.now() - start);
        return { results: [] as SearchResult[], error: error as Error };
      }
    })();

    return Promise.all([bm25Promise, vectorPromise]);
  }
}
