/**
 * AfroStore RAG Engine — Configuration
 *
 * Sensible production defaults. Override via environment or constructor.
 */

import {
  type RAGConfig,
  type ChunkingStrategy,
  DocumentType,
  SearchStrategy,
} from './types';

// ─── CHUNKING DEFAULTS ──────────────────────────────────────

const DEFAULT_CHUNKING: ChunkingStrategy = {
  maxTokens: 512,
  overlapTokens: 64,
  separators: ['\n\n', '\n', '. ', ', ', ' '],
  preserveSentences: true,
};

/** Products are small — single chunk usually */
const PRODUCT_CHUNKING: ChunkingStrategy = {
  maxTokens: 384,
  overlapTokens: 0,
  separators: ['\n\n', '\n', '. '],
  preserveSentences: true,
};

/** Pages can be large — need splitting */
const PAGE_CHUNKING: ChunkingStrategy = {
  maxTokens: 512,
  overlapTokens: 96,
  separators: ['\n\n', '\n', '. ', ', ', ' '],
  preserveSentences: true,
};

/** Orders are structured — small chunks */
const ORDER_CHUNKING: ChunkingStrategy = {
  maxTokens: 256,
  overlapTokens: 0,
  separators: ['\n', '. '],
  preserveSentences: false,
};

// ─── FULL DEFAULT CONFIG ────────────────────────────────────

export function createDefaultConfig(
  overrides: Partial<DeepPartial<RAGConfig>> = {}
): RAGConfig {
  const env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {};

  const defaults: RAGConfig = {
    embedding: {
      provider: 'openai',
      model: env.RAG_EMBEDDING_MODEL || 'text-embedding-3-small',
      dimension: parseInt(env.RAG_EMBEDDING_DIMENSION || '1536', 10),
      apiKey: env.OPENAI_API_KEY || '',
      baseUrl: env.OPENAI_BASE_URL,
      maxRetries: 3,
      retryDelayMs: 1000,
      requestTimeoutMs: 30_000,
      maxBatchSize: 100,
      rateLimitRpm: 3000,
    },

    chunking: {
      defaultStrategy: DEFAULT_CHUNKING,
      typeStrategies: {
        [DocumentType.PRODUCT]: PRODUCT_CHUNKING,
        [DocumentType.PAGE]: PAGE_CHUNKING,
        [DocumentType.ORDER]: ORDER_CHUNKING,
        [DocumentType.REVIEW]: PRODUCT_CHUNKING,
        [DocumentType.CUSTOMER]: ORDER_CHUNKING,
      },
    },

    search: {
      defaultStrategy: SearchStrategy.HYBRID,
      defaultLimit: 10,
      maxLimit: 50,
      bm25: {
        tsConfig: 'english',
        candidateLimit: 100,
        titleWeight: 'A',
        contentWeight: 'B',
      },
      vector: {
        metric: 'cosine',
        candidateLimit: 100,
        efSearch: 200,
      },
      rrf: {
        k: 60,
        bm25Weight: 1.0,
        vectorWeight: 1.0,
      },
      minScore: 0.0,
    },

    context: {
      maxContextTokens: 4096,
      includeMetadata: true,
      groupByType: true,
      includeSources: true,
      typePriority: [
        DocumentType.PRODUCT,
        DocumentType.ORDER,
        DocumentType.CUSTOMER,
        DocumentType.PAGE,
        DocumentType.REVIEW,
        DocumentType.PLUGIN,
        DocumentType.CATEGORY,
        DocumentType.ANALYTICS_SUMMARY,
      ],
    },

    database: {
      tableName: 'rag_documents',
      schema: 'public',
      poolSize: 5,
    },

    cache: {
      enabled: true,
      embeddingTtlSeconds: 86400, // 24 hours
      searchTtlSeconds: 300, // 5 minutes
      maxEntries: 10_000,
    },

    observability: {
      logLevel: (env.RAG_LOG_LEVEL as RAGConfig['observability']['logLevel']) || 'info',
      logSearches: env.RAG_LOG_SEARCHES === 'true',
      logIndexing: env.RAG_LOG_INDEXING !== 'false',
      trackMetrics: true,
    },
  };

  return deepMerge(defaults as any, overrides as any) as RAGConfig;
}

// ─── VALIDATION ─────────────────────────────────────────────

export function validateConfig(config: RAGConfig): string[] {
  const errors: string[] = [];

  if (!config.embedding.apiKey) {
    errors.push('embedding.apiKey is required (set OPENAI_API_KEY)');
  }
  if (config.embedding.dimension < 1 || config.embedding.dimension > 4096) {
    errors.push('embedding.dimension must be between 1 and 4096');
  }
  if (config.search.rrf.k < 1) {
    errors.push('search.rrf.k must be >= 1');
  }
  if (config.search.rrf.bm25Weight < 0 || config.search.rrf.vectorWeight < 0) {
    errors.push('search.rrf weights must be non-negative');
  }
  if (config.search.defaultLimit < 1 || config.search.defaultLimit > config.search.maxLimit) {
    errors.push(`search.defaultLimit must be between 1 and ${config.search.maxLimit}`);
  }
  if (config.chunking.defaultStrategy.maxTokens < 64) {
    errors.push('chunking.defaultStrategy.maxTokens must be >= 64');
  }
  if (config.context.maxContextTokens < 256) {
    errors.push('context.maxContextTokens must be >= 256');
  }

  return errors;
}

// ─── HELPERS ────────────────────────────────────────────────

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceVal = source[key];
    const targetVal = target[key];
    if (
      sourceVal !== undefined &&
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal) &&
      targetVal !== null
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>
      ) as T[keyof T];
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as T[keyof T];
    }
  }
  return result;
}
