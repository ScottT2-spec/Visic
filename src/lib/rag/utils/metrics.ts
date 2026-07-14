/**
 * AfroStore RAG Engine — Metrics Collector
 *
 * In-process metrics for search quality, latency, and throughput.
 * Export to your APM of choice (Datadog, Prometheus, etc.) via getMetrics().
 */

export interface MetricPoint {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
}

export interface HistogramStats {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

export class MetricsCollector {
  private counters: Map<string, { value: number; tags: Record<string, string> }> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private readonly maxHistogramSize: number;

  constructor(maxHistogramSize = 10_000) {
    this.maxHistogramSize = maxHistogramSize;
  }

  /** Increment a counter */
  increment(name: string, value = 1, tags: Record<string, string> = {}): void {
    const key = this.counterKey(name, tags);
    const existing = this.counters.get(key);
    if (existing) {
      existing.value += value;
    } else {
      this.counters.set(key, { value, tags });
    }
  }

  /** Record a value in a histogram (e.g., latency) */
  observe(name: string, value: number): void {
    let values = this.histograms.get(name);
    if (!values) {
      values = [];
      this.histograms.set(name, values);
    }
    values.push(value);

    // Ring buffer behavior — drop oldest when full
    if (values.length > this.maxHistogramSize) {
      values.splice(0, values.length - this.maxHistogramSize);
    }
  }

  /** Get histogram statistics */
  getHistogram(name: string): HistogramStats | null {
    const values = this.histograms.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      count,
      sum,
      min: sorted[0],
      max: sorted[count - 1],
      avg: sum / count,
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
    };
  }

  /** Get counter value */
  getCounter(name: string, tags: Record<string, string> = {}): number {
    return this.counters.get(this.counterKey(name, tags))?.value ?? 0;
  }

  /** Get all metrics as a snapshot */
  getSnapshot(): {
    counters: Record<string, number>;
    histograms: Record<string, HistogramStats>;
  } {
    const counters: Record<string, number> = {};
    for (const [key, { value }] of this.counters) {
      counters[key] = value;
    }

    const histograms: Record<string, HistogramStats> = {};
    for (const [name] of this.histograms) {
      const stats = this.getHistogram(name);
      if (stats) histograms[name] = stats;
    }

    return { counters, histograms };
  }

  /** Reset all metrics */
  reset(): void {
    this.counters.clear();
    this.histograms.clear();
  }

  private counterKey(name: string, tags: Record<string, string>): string {
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return tagStr ? `${name}{${tagStr}}` : name;
  }
}

/** Singleton metrics instance */
export const metrics = new MetricsCollector();

// ─── METRIC NAMES ───────────────────────────────────────

export const METRIC = {
  // Search
  SEARCH_LATENCY: 'rag.search.latency_ms',
  SEARCH_RESULTS: 'rag.search.results_count',
  SEARCH_BM25_LATENCY: 'rag.search.bm25.latency_ms',
  SEARCH_VECTOR_LATENCY: 'rag.search.vector.latency_ms',
  SEARCH_FUSION_LATENCY: 'rag.search.fusion.latency_ms',
  SEARCH_RERANK_LATENCY: 'rag.search.rerank.latency_ms',
  SEARCH_TOTAL: 'rag.search.total',
  SEARCH_ERRORS: 'rag.search.errors',
  SEARCH_FALLBACKS: 'rag.search.fallbacks',

  // Indexing
  INDEX_LATENCY: 'rag.index.latency_ms',
  INDEX_DOCUMENTS: 'rag.index.documents',
  INDEX_CHUNKS: 'rag.index.chunks',
  INDEX_ERRORS: 'rag.index.errors',

  // Embeddings
  EMBEDDING_LATENCY: 'rag.embedding.latency_ms',
  EMBEDDING_TOKENS: 'rag.embedding.tokens',
  EMBEDDING_CACHE_HITS: 'rag.embedding.cache.hits',
  EMBEDDING_CACHE_MISSES: 'rag.embedding.cache.misses',

  // Database
  DB_QUERY_LATENCY: 'rag.db.query.latency_ms',
} as const;
