/**
 * AfroStore RAG Engine — Query Retriever
 *
 * The main orchestrator for retrieval queries. Handles:
 * - Query preprocessing and intent detection
 * - Search strategy selection
 * - Result deduplication across chunks
 * - Multi-chunk document reassembly
 * - Search result caching
 */

import type { PrismaClient } from '@/generated/prisma';
import type {
  SearchQuery,
  SearchResponse,
  SearchResult,
  EmbeddingProvider,
  RAGConfig,
  DocumentType,
} from '../types';
import { SearchStrategy } from '../types';
import { TenantIsolationError } from '../errors';
import { HybridSearch } from '../search/hybrid';
import { BM25Search } from '../search/bm25';
import { VectorSearch } from '../search/vector';
import { Reranker } from '../search/reranker';
import { createLogger } from '../logger';
import { fnv1aHash } from '../utils/hash';

const logger = createLogger('retrieval.retriever');

interface CacheEntry {
  response: SearchResponse;
  createdAt: number;
}

export class Retriever {
  private readonly hybrid: HybridSearch;
  private readonly reranker: Reranker;
  private readonly config: RAGConfig;

  /** Simple in-memory search cache */
  private readonly cache: Map<string, CacheEntry>;
  private readonly cacheTtlMs: number;
  private readonly cacheEnabled: boolean;

  constructor(
    prisma: PrismaClient,
    embedder: EmbeddingProvider,
    config: RAGConfig
  ) {
    const bm25 = new BM25Search(prisma, config);
    const vector = new VectorSearch(prisma, embedder, config);
    this.hybrid = new HybridSearch(bm25, vector, config.search);
    this.reranker = new Reranker();
    this.config = config;
    this.cache = new Map();
    this.cacheTtlMs = config.cache.searchTtlSeconds * 1000;
    this.cacheEnabled = config.cache.enabled;
  }

  /**
   * Execute a retrieval query. This is the primary public search method.
   *
   * Flow:
   * 1. Preprocess query
   * 2. Check cache
   * 3. Execute hybrid search
   * 4. Deduplicate results
   * 5. Optionally rerank
   * 6. Cache results
   */
  async retrieve(query: SearchQuery): Promise<SearchResponse> {
    if (!query.siteId) throw new TenantIsolationError();

    // Normalize query
    const normalizedQuery = this.preprocessQuery(query);

    // Check cache
    if (this.cacheEnabled) {
      const cached = this.getCached(normalizedQuery);
      if (cached) {
        logger.debug('Cache hit', { query: query.query });
        return cached;
      }
    }

    // Execute search
    let response = await this.hybrid.search(normalizedQuery);

    // Deduplicate chunks from the same document
    response = {
      ...response,
      results: this.deduplicateResults(response.results),
    };

    // Rerank if strategy calls for it
    if (
      normalizedQuery.strategy === SearchStrategy.HYBRID_RERANK ||
      this.config.search.defaultStrategy === SearchStrategy.HYBRID_RERANK
    ) {
      const reranked = await this.reranker.rerank(
        normalizedQuery.query,
        response.results
      );
      response = { ...response, results: reranked };
    }

    // Cache
    if (this.cacheEnabled) {
      this.setCache(normalizedQuery, response);
    }

    return response;
  }

  /**
   * Retrieve with automatic strategy selection based on query characteristics.
   * - Short queries (1-2 words) → prefer BM25 (keyword precision)
   * - Long queries (natural language) → prefer vector (semantic understanding)
   * - Medium queries → hybrid
   */
  async retrieveAuto(query: SearchQuery): Promise<SearchResponse> {
    const strategy = this.selectStrategy(query.query);
    return this.retrieve({ ...query, strategy });
  }

  /**
   * Multi-query retrieval: run multiple queries and merge results.
   * Useful for complex questions that benefit from query decomposition.
   */
  async retrieveMulti(
    queries: SearchQuery[],
    mergeLimit?: number
  ): Promise<SearchResponse> {
    if (queries.length === 0) {
      return { results: [], totalCount: 0, meta: this.emptyMeta() };
    }

    if (queries.length === 1) {
      return this.retrieve(queries[0]);
    }

    // Execute all queries in parallel
    const responses = await Promise.all(queries.map((q) => this.retrieve(q)));

    // Merge results using RRF across all query results
    const allResults = new Map<string, { result: SearchResult; ranks: number[] }>();

    for (let qIdx = 0; qIdx < responses.length; qIdx++) {
      for (let rIdx = 0; rIdx < responses[qIdx].results.length; rIdx++) {
        const result = responses[qIdx].results[rIdx];
        const key = `${result.documentId}:${result.chunkIndex}`;

        if (!allResults.has(key)) {
          allResults.set(key, {
            result,
            ranks: new Array(responses.length).fill(responses[qIdx].results.length + 1),
          });
        }
        allResults.get(key)!.ranks[qIdx] = rIdx + 1;
      }
    }

    // Compute multi-query RRF scores
    const k = this.config.search.rrf.k;
    const scored = Array.from(allResults.values())
      .map(({ result, ranks }) => {
        const rrfScore = ranks.reduce((sum, rank) => sum + 1 / (k + rank), 0);
        return { ...result, score: rrfScore };
      })
      .sort((a, b) => b.score - a.score);

    // Normalize scores
    const maxScore = scored[0]?.score ?? 1;
    const normalized = scored.map((r) => ({
      ...r,
      score: r.score / maxScore,
    }));

    const limit = mergeLimit || this.config.search.defaultLimit;

    return {
      results: normalized.slice(0, limit),
      totalCount: normalized.length,
      meta: {
        strategy: SearchStrategy.HYBRID,
        query: queries.map((q) => q.query).join(' | '),
        latencyMs: responses.reduce((sum, r) => sum + r.meta.latencyMs, 0),
        timings: { totalMs: responses.reduce((sum, r) => sum + r.meta.latencyMs, 0) },
        counts: { returned: Math.min(normalized.length, limit) },
      },
    };
  }

  /** Clear the search cache */
  clearCache(): void {
    this.cache.clear();
  }

  /** Get cache stats */
  getCacheStats(): { size: number; maxTtlMs: number } {
    return { size: this.cache.size, maxTtlMs: this.cacheTtlMs };
  }

  // ─── INTERNAL ─────────────────────────────────────────

  private preprocessQuery(query: SearchQuery): SearchQuery {
    return {
      ...query,
      query: query.query.trim(),
      limit: Math.min(
        query.limit || this.config.search.defaultLimit,
        this.config.search.maxLimit
      ),
      strategy: query.strategy || this.config.search.defaultStrategy,
      includeContent: query.includeContent ?? true,
    };
  }

  /** Auto-select search strategy based on query characteristics */
  private selectStrategy(query: string): SearchStrategy {
    const words = query.trim().split(/\s+/).length;

    if (words <= 2) {
      // Short queries: keyword search is more precise
      // e.g., "red dress", "iPhone 15", "SKU-12345"
      return SearchStrategy.HYBRID; // Still hybrid but BM25 will naturally dominate
    }

    if (words >= 8) {
      // Long natural language queries: semantic search shines
      // e.g., "what products do I have that are similar to Nike shoes under 50000 naira"
      return SearchStrategy.HYBRID_RERANK;
    }

    // Medium queries: balanced hybrid
    return SearchStrategy.HYBRID;
  }

  /**
   * Deduplicate results from the same document.
   * When multiple chunks from the same document appear,
   * keep the highest-scoring one and boost its score slightly
   * (more chunks matching = more relevant document).
   */
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Map<string, SearchResult>();

    for (const result of results) {
      const existing = seen.get(result.documentId);
      if (!existing) {
        seen.set(result.documentId, result);
      } else if (result.score > existing.score) {
        // Keep higher score, boost by 5% for having multiple chunk hits
        seen.set(result.documentId, {
          ...result,
          score: result.score * 1.05,
        });
      } else {
        // Boost existing for having another chunk match
        existing.score *= 1.05;
      }
    }

    return Array.from(seen.values()).sort((a, b) => b.score - a.score);
  }

  // ─── CACHE ────────────────────────────────────────────

  private getCacheKey(query: SearchQuery): string {
    const keyData = `${query.siteId}:${query.query}:${query.strategy}:${JSON.stringify(query.documentTypes || [])}:${JSON.stringify(query.filters || [])}:${query.limit}`;
    return fnv1aHash(keyData);
  }

  private getCached(query: SearchQuery): SearchResponse | null {
    const key = this.getCacheKey(query);
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.createdAt > this.cacheTtlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  private setCache(query: SearchQuery, response: SearchResponse): void {
    const key = this.getCacheKey(query);
    this.cache.set(key, { response, createdAt: Date.now() });

    // Evict old entries if cache is too large
    if (this.cache.size > 1000) {
      const oldest = Array.from(this.cache.entries())
        .sort((a, b) => a[1].createdAt - b[1].createdAt)
        .slice(0, 100);
      for (const [k] of oldest) {
        this.cache.delete(k);
      }
    }
  }

  private emptyMeta() {
    return {
      strategy: SearchStrategy.HYBRID,
      query: '',
      latencyMs: 0,
      timings: { totalMs: 0 },
      counts: { returned: 0 },
    };
  }
}
