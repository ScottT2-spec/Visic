/**
 * AfroStore RAG Engine — Type Definitions
 *
 * Production-grade types for the hybrid search and retrieval system.
 * Every interface is strict, every enum is exhaustive.
 */

// ─── DOCUMENT TYPES ─────────────────────────────────────────

/** Supported document types for indexing */
export enum DocumentType {
  PRODUCT = 'product',
  ORDER = 'order',
  CUSTOMER = 'customer',
  PAGE = 'page',
  PLUGIN = 'plugin',
  CATEGORY = 'category',
  COUPON = 'coupon',
  REVIEW = 'review',
  DELIVERY_ZONE = 'delivery_zone',
  STORE_SETTINGS = 'store_settings',
  ANALYTICS_SUMMARY = 'analytics_summary',
}

/** Document lifecycle states */
export enum DocumentStatus {
  ACTIVE = 'active',
  STALE = 'stale',
  DELETED = 'deleted',
  INDEXING = 'indexing',
  FAILED = 'failed',
}

/** Core document structure for indexing */
export interface RagDocument {
  /** Unique ID for this chunk (auto-generated) */
  id?: string;
  /** Store this document belongs to — MANDATORY for multi-tenant isolation */
  siteId: string;
  /** External entity ID (e.g., product ID, order ID) */
  documentId: string;
  /** Type of document */
  documentType: DocumentType;
  /** Plain-text content for search */
  content: string;
  /** Structured metadata for filtering and context */
  metadata: DocumentMetadata;
  /** Chunk index (0-based) when document is split */
  chunkIndex: number;
  /** Total chunks for this document */
  chunkTotal: number;
  /** Document status */
  status: DocumentStatus;
  /** Content hash for dedup and change detection */
  contentHash: string;
  /** Embedding vector (populated during indexing) */
  embedding?: number[];
  /** ISO timestamp */
  createdAt?: string;
  /** ISO timestamp */
  updatedAt?: string;
}

/** Flexible metadata attached to every document */
export interface DocumentMetadata {
  /** Human-readable title */
  title: string;
  /** Source entity type for traceability */
  sourceType: DocumentType;
  /** Source entity ID */
  sourceId: string;
  /** Store ID (redundant for safety) */
  siteId: string;
  /** Additional fields vary by document type */
  [key: string]: unknown;
}

// ─── PRODUCT-SPECIFIC METADATA ──────────────────────────────

export interface ProductMetadata extends DocumentMetadata {
  sourceType: DocumentType.PRODUCT;
  price: number;
  compareAtPrice?: number;
  currency: string;
  category?: string;
  categoryId?: string;
  stock: number;
  status: string;
  tags: string[];
  sku?: string;
  isFeatured: boolean;
  variantCount: number;
  imageCount: number;
}

export interface OrderMetadata extends DocumentMetadata {
  sourceType: DocumentType.ORDER;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  total: number;
  currency: string;
  itemCount: number;
  customerEmail: string;
  customerId?: string;
  createdAt: string;
}

export interface CustomerMetadata extends DocumentMetadata {
  sourceType: DocumentType.CUSTOMER;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  currency: string;
  tags: string[];
  city?: string;
  state?: string;
  country?: string;
}

export interface PageMetadata extends DocumentMetadata {
  sourceType: DocumentType.PAGE;
  pageType: string;
  slug: string;
  isPublished: boolean;
}

export interface PluginMetadata extends DocumentMetadata {
  sourceType: DocumentType.PLUGIN;
  category: string;
  author: string;
  version: string;
  isPremium: boolean;
  rating: number;
  installs: number;
  isAIGenerated: boolean;
}

export interface ReviewMetadata extends DocumentMetadata {
  sourceType: DocumentType.REVIEW;
  productId: string;
  productName: string;
  rating: number;
  isVerified: boolean;
  isApproved: boolean;
}

// ─── SEARCH TYPES ───────────────────────────────────────────

/** Search query configuration */
export interface SearchQuery {
  /** Natural language query */
  query: string;
  /** Store scope — REQUIRED */
  siteId: string;
  /** Filter by document types */
  documentTypes?: DocumentType[];
  /** Maximum results to return */
  limit?: number;
  /** Metadata filters */
  filters?: MetadataFilter[];
  /** Minimum relevance score (0-1) */
  minScore?: number;
  /** Search strategy override */
  strategy?: SearchStrategy;
  /** Whether to include full content or just snippets */
  includeContent?: boolean;
  /** Boost factors per document type */
  typeBoosts?: Partial<Record<DocumentType, number>>;
}

/** Search strategy options */
export enum SearchStrategy {
  /** BM25 keyword search only */
  BM25 = 'bm25',
  /** Vector similarity search only */
  VECTOR = 'vector',
  /** Hybrid BM25 + Vector with RRF fusion */
  HYBRID = 'hybrid',
  /** Hybrid with reranking */
  HYBRID_RERANK = 'hybrid_rerank',
}

/** Metadata filter for search refinement */
export interface MetadataFilter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export enum FilterOperator {
  EQ = 'eq',
  NEQ = 'neq',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  IN = 'in',
  NOT_IN = 'not_in',
  CONTAINS = 'contains',
  EXISTS = 'exists',
}

// ─── SEARCH RESULTS ─────────────────────────────────────────

/** Individual search result */
export interface SearchResult {
  /** Document chunk ID */
  id: string;
  /** Original document ID */
  documentId: string;
  /** Document type */
  documentType: DocumentType;
  /** Store ID */
  siteId: string;
  /** Relevance score (0-1, normalized) */
  score: number;
  /** Content snippet or full content */
  content: string;
  /** Document metadata */
  metadata: DocumentMetadata;
  /** Chunk position info */
  chunkIndex: number;
  chunkTotal: number;
  /** Score breakdown for debugging */
  scoreBreakdown?: ScoreBreakdown;
}

/** Detailed score breakdown for transparency */
export interface ScoreBreakdown {
  bm25Score?: number;
  vectorScore?: number;
  rrfScore?: number;
  rerankScore?: number;
  typeBoost?: number;
  finalScore: number;
}

/** Aggregated search response */
export interface SearchResponse {
  /** Ranked results */
  results: SearchResult[];
  /** Total matching documents (before limit) */
  totalCount: number;
  /** Search metadata */
  meta: SearchMeta;
}

/** Search performance and debug metadata */
export interface SearchMeta {
  /** Search strategy used */
  strategy: SearchStrategy;
  /** Query processed */
  query: string;
  /** Total search time in milliseconds */
  latencyMs: number;
  /** Time breakdown */
  timings: {
    embeddingMs?: number;
    bm25Ms?: number;
    vectorMs?: number;
    fusionMs?: number;
    rerankMs?: number;
    filterMs?: number;
    totalMs: number;
  };
  /** Result counts per stage */
  counts: {
    bm25Candidates?: number;
    vectorCandidates?: number;
    fusedResults?: number;
    afterFilter?: number;
    returned: number;
  };
  /** Whether any fallback was used */
  fallbackUsed?: boolean;
  fallbackReason?: string;
}

// ─── INDEXING TYPES ─────────────────────────────────────────

/** Configuration for the indexing pipeline */
export interface IndexingOptions {
  /** Batch size for parallel processing */
  batchSize?: number;
  /** Max concurrent embedding requests */
  concurrency?: number;
  /** Whether to update existing documents or skip */
  upsert?: boolean;
  /** Force re-index even if content hash matches */
  force?: boolean;
  /** Callback for progress tracking */
  onProgress?: (progress: IndexingProgress) => void;
}

export interface IndexingProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  currentBatch: number;
  totalBatches: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
}

export interface IndexingResult {
  success: boolean;
  totalDocuments: number;
  indexed: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: IndexingError[];
  durationMs: number;
}

export interface IndexingError {
  documentId: string;
  documentType: DocumentType;
  error: string;
  stack?: string;
}

// ─── CHUNKING TYPES ─────────────────────────────────────────

export interface ChunkingStrategy {
  /** Maximum tokens per chunk */
  maxTokens: number;
  /** Overlap tokens between chunks */
  overlapTokens: number;
  /** Separator priority for splitting */
  separators: string[];
  /** Whether to preserve sentence boundaries */
  preserveSentences: boolean;
}

export interface Chunk {
  content: string;
  index: number;
  totalChunks: number;
  startOffset: number;
  endOffset: number;
  tokenCount: number;
}

// ─── EMBEDDING TYPES ────────────────────────────────────────

export interface EmbeddingProvider {
  /** Generate embedding for a single text */
  embed(text: string): Promise<number[]>;
  /** Generate embeddings for multiple texts (batched) */
  embedBatch(texts: string[]): Promise<number[][]>;
  /** Embedding dimension */
  readonly dimension: number;
  /** Provider name for logging */
  readonly name: string;
}

export interface EmbeddingCacheEntry {
  hash: string;
  embedding: number[];
  createdAt: number;
  accessedAt: number;
  accessCount: number;
}

// ─── CONTEXT BUILDER TYPES ──────────────────────────────────

/** Configuration for LLM context assembly */
export interface ContextBuilderOptions {
  /** Maximum tokens for the context window */
  maxContextTokens: number;
  /** Include metadata in context */
  includeMetadata: boolean;
  /** Group results by document type */
  groupByType: boolean;
  /** Include source references */
  includeSources: boolean;
  /** Custom preamble for the context */
  preamble?: string;
  /** Priority ordering for document types */
  typePriority?: DocumentType[];
}

/** Assembled context ready for LLM consumption */
export interface RetrievalContext {
  /** Formatted context string */
  context: string;
  /** Token count estimate */
  estimatedTokens: number;
  /** Source documents used */
  sources: ContextSource[];
  /** Whether context was truncated */
  truncated: boolean;
  /** Search response used to build this context */
  searchResponse: SearchResponse;
}

export interface ContextSource {
  documentId: string;
  documentType: DocumentType;
  title: string;
  relevanceScore: number;
  chunkRange: [number, number];
}

// ─── CONFIGURATION TYPES ────────────────────────────────────

export interface RAGConfig {
  /** Embedding provider configuration */
  embedding: {
    provider: 'openai' | 'cohere' | 'local';
    model: string;
    dimension: number;
    apiKey: string;
    baseUrl?: string;
    maxRetries: number;
    retryDelayMs: number;
    requestTimeoutMs: number;
    maxBatchSize: number;
    /** Rate limit: max requests per minute */
    rateLimitRpm: number;
  };

  /** Chunking configuration */
  chunking: {
    defaultStrategy: ChunkingStrategy;
    /** Per-type overrides */
    typeStrategies?: Partial<Record<DocumentType, ChunkingStrategy>>;
  };

  /** Search configuration */
  search: {
    defaultStrategy: SearchStrategy;
    defaultLimit: number;
    maxLimit: number;
    /** BM25 configuration */
    bm25: {
      /** PostgreSQL text search configuration (language) */
      tsConfig: string;
      /** Number of candidates to retrieve */
      candidateLimit: number;
      /** Weight for title matches vs content */
      titleWeight: 'A' | 'B' | 'C' | 'D';
      contentWeight: 'A' | 'B' | 'C' | 'D';
    };
    /** Vector search configuration */
    vector: {
      /** Distance metric */
      metric: 'cosine' | 'l2' | 'inner_product';
      /** Number of candidates to retrieve */
      candidateLimit: number;
      /** HNSW ef_search parameter */
      efSearch: number;
    };
    /** RRF fusion configuration */
    rrf: {
      /** RRF constant k (typically 60) */
      k: number;
      /** Weight for BM25 in fusion (0-1) */
      bm25Weight: number;
      /** Weight for vector in fusion (0-1) */
      vectorWeight: number;
    };
    /** Minimum score threshold (0-1) */
    minScore: number;
  };

  /** Context builder configuration */
  context: ContextBuilderOptions;

  /** Database configuration */
  database: {
    /** Table name for RAG documents */
    tableName: string;
    /** Schema name */
    schema: string;
    /** Connection pool size for RAG operations */
    poolSize: number;
  };

  /** Cache configuration */
  cache: {
    enabled: boolean;
    /** Embedding cache TTL in seconds */
    embeddingTtlSeconds: number;
    /** Search result cache TTL in seconds */
    searchTtlSeconds: number;
    /** Maximum cache entries */
    maxEntries: number;
  };

  /** Logging and metrics */
  observability: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    /** Log search queries and results */
    logSearches: boolean;
    /** Log indexing operations */
    logIndexing: boolean;
    /** Track latency metrics */
    trackMetrics: boolean;
  };
}

// ─── EVENT TYPES ────────────────────────────────────────────

export enum RAGEvent {
  DOCUMENT_INDEXED = 'document.indexed',
  DOCUMENT_UPDATED = 'document.updated',
  DOCUMENT_DELETED = 'document.deleted',
  SEARCH_COMPLETED = 'search.completed',
  SEARCH_FAILED = 'search.failed',
  INDEX_BATCH_STARTED = 'index.batch.started',
  INDEX_BATCH_COMPLETED = 'index.batch.completed',
  INDEX_BATCH_FAILED = 'index.batch.failed',
  EMBEDDING_GENERATED = 'embedding.generated',
  EMBEDDING_CACHED = 'embedding.cached',
  EMBEDDING_FAILED = 'embedding.failed',
  FALLBACK_TRIGGERED = 'fallback.triggered',
}

export interface RAGEventPayload {
  event: RAGEvent;
  timestamp: number;
  siteId?: string;
  data: Record<string, unknown>;
  durationMs?: number;
}

export type RAGEventHandler = (payload: RAGEventPayload) => void | Promise<void>;
