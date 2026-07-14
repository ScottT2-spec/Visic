/**
 * AfroStore RAG Engine — Embedding Cache
 *
 * LRU cache with TTL for embeddings. Avoids re-computing embeddings
 * for identical content. Uses content hash as key.
 *
 * Production: swap to Redis adapter for multi-instance deployments.
 */

import type { EmbeddingProvider, RAGConfig } from '../types';
import { createLogger } from '../logger';
import { createContentHash } from '../utils/hash';

const logger = createLogger('embeddings.cache');

interface CacheEntry {
  embedding: number[];
  createdAt: number;
  accessedAt: number;
  accessCount: number;
}

export class CachedEmbeddingProvider implements EmbeddingProvider {
  public readonly dimension: number;
  public readonly name: string;

  private readonly inner: EmbeddingProvider;
  private readonly cache: Map<string, CacheEntry>;
  private readonly maxEntries: number;
  private readonly ttlMs: number;
  private readonly enabled: boolean;

  /** Cache metrics */
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(inner: EmbeddingProvider, config: RAGConfig['cache']) {
    this.inner = inner;
    this.dimension = inner.dimension;
    this.name = `cached(${inner.name})`;
    this.cache = new Map();
    this.maxEntries = config.maxEntries;
    this.ttlMs = config.embeddingTtlSeconds * 1000;
    this.enabled = config.enabled;
  }

  async embed(text: string): Promise<number[]> {
    if (!this.enabled) return this.inner.embed(text);

    const hash = createContentHash(text);
    const cached = this.get(hash);
    if (cached) return cached;

    const embedding = await this.inner.embed(text);
    this.set(hash, embedding);
    return embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.enabled) return this.inner.embedBatch(texts);

    const results: (number[] | null)[] = new Array(texts.length);
    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];

    // Check cache for each text
    for (let i = 0; i < texts.length; i++) {
      const hash = createContentHash(texts[i]);
      const cached = this.get(hash);
      if (cached) {
        results[i] = cached;
      } else {
        results[i] = null;
        uncachedIndices.push(i);
        uncachedTexts.push(texts[i]);
      }
    }

    // Compute uncached embeddings
    if (uncachedTexts.length > 0) {
      const computed = await this.inner.embedBatch(uncachedTexts);
      for (let j = 0; j < uncachedIndices.length; j++) {
        const idx = uncachedIndices[j];
        results[idx] = computed[j];
        this.set(createContentHash(texts[idx]), computed[j]);
      }
    }

    logger.debug('Batch embedding with cache', {
      total: texts.length,
      cached: texts.length - uncachedTexts.length,
      computed: uncachedTexts.length,
      hitRate: this.getHitRate(),
    });

    return results as number[][];
  }

  // ─── CACHE OPERATIONS ─────────────────────────────────

  private get(hash: string): number[] | null {
    const entry = this.cache.get(hash);
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.createdAt > this.ttlMs) {
      this.cache.delete(hash);
      this.misses++;
      return null;
    }

    entry.accessedAt = Date.now();
    entry.accessCount++;
    this.hits++;
    return entry.embedding;
  }

  private set(hash: string, embedding: number[]): void {
    // Evict if at capacity (LRU based on accessedAt)
    if (this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }

    this.cache.set(hash, {
      embedding,
      createdAt: Date.now(),
      accessedAt: Date.now(),
      accessCount: 1,
    });
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.accessedAt < oldestTime) {
        oldestTime = entry.accessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.evictions++;
    }
  }

  // ─── METRICS ──────────────────────────────────────────

  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  getCacheStats(): {
    size: number;
    hits: number;
    misses: number;
    evictions: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: this.getHitRate(),
    };
  }

  /** Flush all cached embeddings */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    logger.info('Embedding cache cleared');
  }

  /** Remove expired entries */
  prune(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.cache) {
      if (now - entry.createdAt > this.ttlMs) {
        this.cache.delete(key);
        pruned++;
      }
    }
    if (pruned > 0) {
      logger.debug('Pruned expired cache entries', { pruned });
    }
    return pruned;
  }
}
