/**
 * AfroStore RAG Engine — Search Result Reranker
 *
 * Post-retrieval reranking for improved relevance.
 * Supports multiple strategies:
 *
 * 1. Cross-encoder reranking (most accurate, higher latency)
 *    - Sends (query, document) pairs to a reranking model
 *    - Much more accurate than embedding similarity alone
 *    - Use for top-K results only (expensive per pair)
 *
 * 2. LLM-based reranking (flexible, highest latency)
 *    - Ask an LLM to rank results by relevance
 *    - Good for complex queries with nuance
 *
 * 3. Metadata-weighted reranking (fast, no API calls)
 *    - Boost results based on recency, popularity, status
 *    - Always applied as a final pass
 *
 * For Phase 2: Add Cohere Rerank API integration.
 * For now: metadata-weighted reranking is production-ready.
 */

import type { SearchResult, DocumentType, RAGConfig } from '../types';
import { createLogger } from '../logger';
import { metrics, METRIC } from '../utils/metrics';

const logger = createLogger('search.reranker');

export interface RerankerConfig {
  /** Enable metadata-based reranking */
  metadataReranking: boolean;
  /** Recency boost: multiply score by (1 + recencyBoost) for recent documents */
  recencyBoostFactor: number;
  /** How many days counts as "recent" */
  recencyWindowDays: number;
  /** Boost for featured/popular items */
  popularityBoostFactor: number;
  /** Penalize draft/inactive content */
  statusPenalty: number;
  /** Maximum results to rerank (for API-based rerankers) */
  maxRerankCandidates: number;
}

const DEFAULT_RERANKER_CONFIG: RerankerConfig = {
  metadataReranking: true,
  recencyBoostFactor: 0.1,
  recencyWindowDays: 7,
  popularityBoostFactor: 0.05,
  statusPenalty: 0.5,
  maxRerankCandidates: 50,
};

export class Reranker {
  private readonly config: RerankerConfig;

  constructor(config: Partial<RerankerConfig> = {}) {
    this.config = { ...DEFAULT_RERANKER_CONFIG, ...config };
  }

  /**
   * Rerank search results using metadata signals.
   * This is always fast (no API calls) and improves relevance
   * by incorporating business signals that pure text matching misses.
   */
  async rerank(
    query: string,
    results: SearchResult[],
    options: { documentTypes?: DocumentType[] } = {}
  ): Promise<SearchResult[]> {
    if (results.length === 0) return results;
    if (!this.config.metadataReranking) return results;

    const startTime = performance.now();

    const reranked = results.map((result) => {
      let boost = 1.0;

      // Recency boost
      const createdAt = result.metadata?.createdAt;
      if (createdAt) {
        const daysSince = this.daysSince(createdAt as string);
        if (daysSince <= this.config.recencyWindowDays) {
          const recencyFactor = 1 - (daysSince / this.config.recencyWindowDays);
          boost += this.config.recencyBoostFactor * recencyFactor;
        }
      }

      // Popularity boost (for products, plugins, themes)
      const metadata = result.metadata as Record<string, unknown>;
      if (metadata.isFeatured === true) {
        boost += this.config.popularityBoostFactor;
      }
      if (typeof metadata.rating === 'number' && metadata.rating >= 4) {
        boost += this.config.popularityBoostFactor * 0.5;
      }
      if (typeof metadata.installs === 'number' && metadata.installs > 100) {
        boost += this.config.popularityBoostFactor * 0.3;
      }

      // Stock status boost (prefer in-stock products)
      if (typeof metadata.stock === 'number') {
        if (metadata.stock === 0) {
          boost *= this.config.statusPenalty; // Penalize out-of-stock
        }
      }

      // Status penalty (penalize drafts, archived)
      if (metadata.status === 'draft' || metadata.status === 'archived') {
        boost *= this.config.statusPenalty;
      }

      // Payment status boost (for orders)
      if (metadata.paymentStatus === 'paid') {
        boost += this.config.popularityBoostFactor * 0.2;
      }

      // Verified purchase boost (for reviews)
      if (metadata.isVerified === true) {
        boost += this.config.popularityBoostFactor * 0.3;
      }

      return {
        ...result,
        score: result.score * boost,
        scoreBreakdown: result.scoreBreakdown
          ? {
              ...result.scoreBreakdown,
              rerankScore: boost,
              finalScore: (result.scoreBreakdown.finalScore ?? result.score) * boost,
            }
          : undefined,
      };
    });

    // Re-sort by boosted score
    reranked.sort((a, b) => b.score - a.score);

    const durationMs = performance.now() - startTime;
    metrics.observe(METRIC.SEARCH_RERANK_LATENCY, durationMs);

    logger.debug('Reranking completed', {
      results: results.length,
      durationMs: Math.round(durationMs),
    });

    return reranked;
  }

  private daysSince(dateStr: string): number {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      return Math.max(0, (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return Infinity;
    }
  }
}
