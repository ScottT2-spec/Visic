/**
 * AfroStore RAG Engine — Public API
 *
 * This is the single entry point for the entire RAG system.
 * Import { RAGService } from '@/lib/rag' and you're done.
 *
 * Usage:
 *
 *   import { RAGService } from '@/lib/rag';
 *   import { prisma } from '@/lib/db';
 *
 *   // Initialize once at app startup
 *   const rag = RAGService.create(prisma);
 *
 *   // Index a product
 *   await rag.index('product', productData, siteId);
 *
 *   // Index many products
 *   await rag.indexBatch('product', productsArray, siteId);
 *
 *   // Search
 *   const results = await rag.search({
 *     query: 'red leather bag under 50000',
 *     siteId: 'store_abc123',
 *   });
 *
 *   // Search with filters
 *   const results = await rag.search({
 *     query: 'best selling items',
 *     siteId: 'store_abc123',
 *     documentTypes: ['product'],
 *     filters: [{ field: 'status', operator: 'eq', value: 'active' }],
 *   });
 *
 *   // Get LLM-ready context
 *   const context = await rag.retrieveContext(
 *     'Why are my customers not buying?',
 *     siteId,
 *     { documentTypes: ['analytics_summary', 'order', 'product'] }
 *   );
 *   // Pass context.context to your LLM prompt
 *
 *   // Remove a document
 *   await rag.remove(productId, siteId);
 *
 *   // Get index stats
 *   const stats = await rag.getStats(siteId);
 */

import type { PrismaClient } from '@/generated/prisma';
import type {
  RAGConfig,
  SearchQuery,
  SearchResponse,
  RetrievalContext,
  IndexingOptions,
  IndexingResult,
  EmbeddingProvider,
  DocumentType,
  RAGEventHandler,
  RAGEventPayload,
  ContextBuilderOptions,
} from './types';
import {
  DocumentType as DocType,
  SearchStrategy,
  RAGEvent,
} from './types';
import { createDefaultConfig, validateConfig } from './config';
import { ConfigError } from './errors';
import { createEmbeddingProvider } from './embeddings/provider';
import { CachedEmbeddingProvider } from './embeddings/cache';
import { IndexingPipeline } from './indexing/pipeline';
import { Retriever } from './retrieval/retriever';
import { ContextBuilder } from './retrieval/context-builder';
import { createLogger } from './logger';
import { metrics } from './utils/metrics';

const logger = createLogger('service');

export class RAGService {
  private readonly prisma: PrismaClient;
  private readonly config: RAGConfig;
  private readonly embedder: EmbeddingProvider;
  private readonly indexer: IndexingPipeline;
  private readonly retriever: Retriever;
  private readonly contextBuilder: ContextBuilder;
  private readonly eventHandlers: Map<string, RAGEventHandler[]>;
  private initialized = false;

  private constructor(
    prisma: PrismaClient,
    config: RAGConfig,
    embedder: EmbeddingProvider
  ) {
    this.prisma = prisma;
    this.config = config;
    this.embedder = embedder;
    this.indexer = new IndexingPipeline(prisma, embedder, config);
    this.retriever = new Retriever(prisma, embedder, config);
    this.contextBuilder = new ContextBuilder(config.context);
    this.eventHandlers = new Map();
  }

  /**
   * Create a new RAGService instance with default configuration.
   * This is the recommended way to instantiate.
   */
  static create(
    prisma: PrismaClient,
    overrides: Partial<Record<string, unknown>> = {}
  ): RAGService {
    const config = createDefaultConfig(overrides as any);

    const errors = validateConfig(config);
    if (errors.length > 0) {
      throw new ConfigError(`Invalid RAG configuration:\n${errors.join('\n')}`);
    }

    const rawEmbedder = createEmbeddingProvider(config.embedding);
    const embedder = new CachedEmbeddingProvider(rawEmbedder, config.cache);

    logger.info('RAG service created', {
      embeddingProvider: config.embedding.provider,
      embeddingModel: config.embedding.model,
      dimension: config.embedding.dimension,
      searchStrategy: config.search.defaultStrategy,
      cacheEnabled: config.cache.enabled,
    });

    return new RAGService(prisma, config, embedder);
  }

  /**
   * Create with a custom embedding provider (for testing or custom models).
   */
  static createWithProvider(
    prisma: PrismaClient,
    embedder: EmbeddingProvider,
    overrides: Partial<Record<string, unknown>> = {}
  ): RAGService {
    const config = createDefaultConfig(overrides as any);
    const cachedEmbedder = new CachedEmbeddingProvider(embedder, config.cache);
    return new RAGService(prisma, config, cachedEmbedder);
  }

  // ═══════════════════════════════════════════════════════
  // INDEXING
  // ═══════════════════════════════════════════════════════

  /**
   * Index a single document.
   *
   * @param type - Document type ('product', 'order', etc.)
   * @param data - Entity data (must include 'id' field)
   * @param siteId - Store ID for multi-tenant isolation
   * @param options - Optional indexing configuration
   */
  async index(
    type: DocumentType | string,
    data: Record<string, unknown>,
    siteId: string,
    options?: IndexingOptions
  ): Promise<IndexingResult> {
    const docType = this.resolveDocType(type);
    const result = await this.indexer.indexOne(docType, data, siteId, options);

    this.emit(RAGEvent.DOCUMENT_INDEXED, {
      siteId,
      documentId: String(data.id),
      documentType: type,
      success: result.success,
    });

    return result;
  }

  /**
   * Index multiple documents of the same type.
   * Handles batching, rate limiting, and partial failures internally.
   *
   * @param type - Document type
   * @param dataArray - Array of entity data objects
   * @param siteId - Store ID
   * @param options - Indexing options (batch size, concurrency, progress callback)
   */
  async indexBatch(
    type: DocumentType | string,
    dataArray: Record<string, unknown>[],
    siteId: string,
    options?: IndexingOptions
  ): Promise<IndexingResult> {
    const docType = this.resolveDocType(type);

    this.emit(RAGEvent.INDEX_BATCH_STARTED, {
      siteId,
      documentType: type,
      count: dataArray.length,
    });

    const result = await this.indexer.indexMany(docType, dataArray, siteId, options);

    this.emit(
      result.success ? RAGEvent.INDEX_BATCH_COMPLETED : RAGEvent.INDEX_BATCH_FAILED,
      {
        siteId,
        documentType: type,
        ...result,
      }
    );

    return result;
  }

  /**
   * Re-index all documents of a type for a store.
   * Deletes existing index entries first, then re-indexes.
   *
   * @param type - Document type to reindex
   * @param dataArray - Fresh entity data
   * @param siteId - Store ID
   */
  async reindex(
    type: DocumentType | string,
    dataArray: Record<string, unknown>[],
    siteId: string,
    options?: IndexingOptions
  ): Promise<IndexingResult> {
    const docType = this.resolveDocType(type);

    logger.info('Starting reindex', { type, siteId, count: dataArray.length });

    await this.indexer.removeByType(docType, siteId);
    return this.indexer.indexMany(docType, dataArray, siteId, {
      ...options,
      upsert: false,
      force: true,
    });
  }

  /**
   * Remove a document from the index.
   */
  async remove(documentId: string, siteId: string): Promise<void> {
    await this.indexer.removeDocument(documentId, siteId);
    this.emit(RAGEvent.DOCUMENT_DELETED, { siteId, documentId });
  }

  /**
   * Remove all indexed documents for a store.
   */
  async removeAll(siteId: string): Promise<number> {
    return this.indexer.removeAllForStore(siteId);
  }

  // ═══════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════

  /**
   * Search indexed documents.
   *
   * @param query - Search query with filters and options
   * @returns Ranked search results with scores and metadata
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const response = await this.retriever.retrieve(query);

    this.emit(RAGEvent.SEARCH_COMPLETED, {
      siteId: query.siteId,
      query: query.query,
      strategy: query.strategy,
      resultCount: response.results.length,
      latencyMs: response.meta.latencyMs,
    });

    return response;
  }

  /**
   * Search with automatic strategy selection.
   * Short queries use BM25-heavy search, long queries use vector-heavy search.
   */
  async searchAuto(query: SearchQuery): Promise<SearchResponse> {
    return this.retriever.retrieveAuto(query);
  }

  /**
   * Multi-query search: decompose a complex question into sub-queries
   * and merge results using cross-query RRF.
   */
  async searchMulti(queries: SearchQuery[]): Promise<SearchResponse> {
    return this.retriever.retrieveMulti(queries);
  }

  /**
   * Quick search shorthand. Returns just the results array.
   */
  async find(
    query: string,
    siteId: string,
    options: {
      types?: (DocumentType | string)[];
      limit?: number;
      strategy?: SearchStrategy;
    } = {}
  ): Promise<SearchResponse['results']> {
    const response = await this.search({
      query,
      siteId,
      documentTypes: options.types?.map((t) => this.resolveDocType(t)),
      limit: options.limit,
      strategy: options.strategy,
    });
    return response.results;
  }

  // ═══════════════════════════════════════════════════════
  // CONTEXT RETRIEVAL (for LLM)
  // ═══════════════════════════════════════════════════════

  /**
   * Retrieve and format context for LLM consumption.
   * This is the main method for the AI assistant integration.
   *
   * @param query - Natural language question
   * @param siteId - Store ID
   * @param options - Search and context options
   * @returns Formatted context string, token count, and sources
   */
  async retrieveContext(
    query: string,
    siteId: string,
    options: {
      documentTypes?: (DocumentType | string)[];
      limit?: number;
      maxTokens?: number;
      preamble?: string;
      strategy?: SearchStrategy;
    } = {}
  ): Promise<RetrievalContext> {
    const searchResponse = await this.search({
      query,
      siteId,
      documentTypes: options.documentTypes?.map((t) => this.resolveDocType(t)),
      limit: options.limit || 15,
      strategy: options.strategy,
      includeContent: true,
    });

    // Build context with optional overrides
    const builder = options.maxTokens || options.preamble
      ? new ContextBuilder({
          ...this.config.context,
          ...(options.maxTokens && { maxContextTokens: options.maxTokens }),
          ...(options.preamble && { preamble: options.preamble }),
        })
      : this.contextBuilder;

    return builder.build(searchResponse, query);
  }

  // ═══════════════════════════════════════════════════════
  // ADMIN / MANAGEMENT
  // ═══════════════════════════════════════════════════════

  /**
   * Get indexing statistics for a store.
   */
  async getStats(siteId: string): Promise<Record<string, number>> {
    return this.indexer.getStats(siteId);
  }

  /**
   * Get search and system metrics.
   */
  getMetrics(): ReturnType<typeof metrics.getSnapshot> {
    return metrics.getSnapshot();
  }

  /**
   * Get embedding cache statistics.
   */
  getCacheStats(): {
    embedding: ReturnType<CachedEmbeddingProvider['getCacheStats']>;
    search: ReturnType<Retriever['getCacheStats']>;
  } {
    return {
      embedding: (this.embedder as CachedEmbeddingProvider).getCacheStats(),
      search: this.retriever.getCacheStats(),
    };
  }

  /**
   * Clear all caches.
   */
  clearCaches(): void {
    (this.embedder as CachedEmbeddingProvider).clear();
    this.retriever.clearCache();
    logger.info('All caches cleared');
  }

  /**
   * Health check: verify database connectivity and extension availability.
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    database: boolean;
    pgvector: boolean;
    fts: boolean;
    documentCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let database = false;
    let pgvector = false;
    let fts = false;
    let documentCount = 0;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = true;
    } catch (e) {
      errors.push(`Database: ${(e as Error).message}`);
    }

    try {
      await this.prisma.$queryRaw`SELECT '[1,2,3]'::vector`;
      pgvector = true;
    } catch (e) {
      errors.push(`pgvector: ${(e as Error).message}`);
    }

    try {
      await this.prisma.$queryRaw`SELECT to_tsvector('english', 'test')`;
      fts = true;
    } catch (e) {
      errors.push(`Full-text search: ${(e as Error).message}`);
    }

    try {
      const result = await this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*) as count FROM "${this.config.database.schema}"."${this.config.database.tableName}" WHERE status = 'active'`
      );
      documentCount = Number(result[0]?.count || 0);
    } catch (e) {
      errors.push(`Table check: ${(e as Error).message}`);
    }

    return {
      healthy: database && pgvector && fts && errors.length <= 1,
      database,
      pgvector,
      fts,
      documentCount,
      errors,
    };
  }

  /**
   * Get the current configuration (read-only).
   */
  getConfig(): Readonly<RAGConfig> {
    return this.config;
  }

  // ═══════════════════════════════════════════════════════
  // EVENTS
  // ═══════════════════════════════════════════════════════

  /**
   * Subscribe to RAG events (indexing, search, errors).
   */
  on(event: RAGEvent | string, handler: RAGEventHandler): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
  }

  /**
   * Unsubscribe from RAG events.
   */
  off(event: RAGEvent | string, handler: RAGEventHandler): void {
    const handlers = this.eventHandlers.get(event) || [];
    this.eventHandlers.set(
      event,
      handlers.filter((h) => h !== handler)
    );
  }

  private emit(event: RAGEvent, data: Record<string, unknown>): void {
    const payload: RAGEventPayload = {
      event,
      timestamp: Date.now(),
      siteId: data.siteId as string,
      data,
    };

    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      try {
        const result = handler(payload);
        if (result instanceof Promise) {
          result.catch((err) => {
            logger.error('Event handler error', err, { event });
          });
        }
      } catch (err) {
        logger.error('Event handler error', err, { event });
      }
    }
  }

  // ─── HELPERS ──────────────────────────────────────────

  private resolveDocType(type: DocumentType | string): DocumentType {
    const enumValues = Object.values(DocType) as string[];
    if (enumValues.includes(type as string)) {
      return type as DocumentType;
    }
    // Try lowercase match
    const lower = (type as string).toLowerCase();
    if (enumValues.includes(lower)) {
      return lower as DocumentType;
    }
    logger.warn(`Unknown document type "${type}", using as-is`);
    return type as DocumentType;
  }
}

// ─── RE-EXPORTS ─────────────────────────────────────────

export {
  // Types
  type RAGConfig,
  type SearchQuery,
  type SearchResponse,
  type SearchResult,
  type RetrievalContext,
  type IndexingOptions,
  type IndexingResult,
  type EmbeddingProvider,
  type DocumentMetadata,
  type MetadataFilter,
  type ScoreBreakdown,
  type SearchMeta,
  type ContextSource,
  type ContextBuilderOptions,
  type RAGEventPayload,
  type RAGEventHandler,
  type RagDocument,
  type Chunk,
  type ChunkingStrategy,
} from './types';

export {
  DocumentType,
  DocumentStatus,
  SearchStrategy,
  FilterOperator,
  RAGEvent,
} from './types';

export { createDefaultConfig, validateConfig } from './config';
export {
  RAGError,
  EmbeddingError,
  RateLimitError,
  SearchError,
  IndexingError,
  ValidationError,
  TenantIsolationError,
  DatabaseError,
  ConfigError,
} from './errors';
