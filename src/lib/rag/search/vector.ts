/**
 * AfroStore RAG Engine — Vector Similarity Search (pgvector)
 *
 * Cosine similarity search using pgvector extension.
 * Uses HNSW index for fast approximate nearest neighbor search.
 *
 * Why pgvector over Pinecone/Weaviate/Qdrant?
 * - No extra infrastructure or vendor lock-in
 * - Same database = transactional consistency with documents
 * - HNSW gives sub-10ms query times for <1M vectors
 * - No network hop for vector queries
 * - Cheaper (your existing Postgres, not $70+/month SaaS)
 */

import type { PrismaClient } from '@/generated/prisma';
import type {
  SearchQuery,
  SearchResult,
  DocumentMetadata,
  EmbeddingProvider,
  RAGConfig,
} from '../types';
import { DocumentType, DocumentStatus } from '../types';
import { SearchError, TenantIsolationError } from '../errors';
import { createLogger } from '../logger';
import { metrics, METRIC } from '../utils/metrics';

const logger = createLogger('search.vector');

interface VectorRawRow {
  id: string;
  document_id: string;
  document_type: string;
  store_id: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  chunk_index: number;
  chunk_total: number;
  distance: number;
}

export class VectorSearch {
  private readonly prisma: PrismaClient;
  private readonly embedder: EmbeddingProvider;
  private readonly config: RAGConfig['search']['vector'];
  private readonly tableName: string;
  private readonly dbConfig: RAGConfig['database'];

  constructor(
    prisma: PrismaClient,
    embedder: EmbeddingProvider,
    config: RAGConfig
  ) {
    this.prisma = prisma;
    this.embedder = embedder;
    this.config = config.search.vector;
    this.tableName = `"${config.database.schema}"."${config.database.tableName}"`;
    this.dbConfig = config.database;
  }

  /**
   * Execute vector similarity search.
   * Generates query embedding, then finds nearest neighbors.
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    if (!query.siteId) throw new TenantIsolationError();

    const startTime = performance.now();

    try {
      // Step 1: Generate query embedding
      const embStart = performance.now();
      const queryEmbedding = await this.embedder.embed(query.query);
      const embDuration = performance.now() - embStart;
      metrics.observe(METRIC.EMBEDDING_LATENCY, embDuration);

      const limit = Math.min(
        query.limit || this.config.candidateLimit,
        this.config.candidateLimit
      );

      // Step 2: Build query with filters
      const { whereClause, params } = this.buildWhereClause(query);

      // Set HNSW search parameters for this query
      await this.prisma.$executeRawUnsafe(
        `SET LOCAL hnsw.ef_search = ${this.config.efSearch}`
      );

      // Step 3: Execute similarity search
      const distanceOp = this.getDistanceOperator();
      const embeddingStr = `[${queryEmbedding.join(',')}]`;

      const sql = `
        SELECT
          id,
          document_id,
          document_type,
          store_id,
          title,
          content,
          metadata,
          chunk_index,
          chunk_total,
          embedding ${distanceOp} $1::vector AS distance
        FROM ${this.tableName}
        WHERE ${whereClause}
          AND embedding IS NOT NULL
        ORDER BY embedding ${distanceOp} $1::vector ASC
        LIMIT ${limit}
      `;

      const rows = await this.prisma.$queryRawUnsafe<VectorRawRow[]>(
        sql,
        embeddingStr,
        ...params
      );

      const results = rows.map((row: VectorRawRow) => this.rowToResult(row));

      const durationMs = performance.now() - startTime;
      metrics.observe(METRIC.SEARCH_VECTOR_LATENCY, durationMs);

      logger.debug('Vector search completed', {
        query: query.query,
        results: results.length,
        durationMs: Math.round(durationMs),
        embeddingMs: Math.round(embDuration),
      });

      return results;
    } catch (error) {
      metrics.increment(METRIC.SEARCH_ERRORS, 1, { type: 'vector' });
      logger.error('Vector search failed', error, { query: query.query });
      throw new SearchError(`Vector search failed: ${(error as Error).message}`, {
        cause: error as Error,
      });
    }
  }

  /** Get the pgvector distance operator for the configured metric */
  private getDistanceOperator(): string {
    switch (this.config.metric) {
      case 'cosine':
        return '<=>'; // Cosine distance
      case 'l2':
        return '<->'; // Euclidean distance
      case 'inner_product':
        return '<#>'; // Negative inner product
      default:
        return '<=>'; // Default to cosine
    }
  }

  /** Convert distance to similarity score (0-1 range) */
  private distanceToScore(distance: number): number {
    switch (this.config.metric) {
      case 'cosine':
        // Cosine distance is 1 - cosine_similarity, so similarity = 1 - distance
        return Math.max(0, 1 - distance);
      case 'l2':
        // Convert L2 distance to a 0-1 score
        return 1 / (1 + distance);
      case 'inner_product':
        // Negative inner product → higher is more similar
        return Math.max(0, -distance);
      default:
        return Math.max(0, 1 - distance);
    }
  }

  /** Build WHERE clause with multi-tenant isolation */
  private buildWhereClause(
    query: SearchQuery
  ): { whereClause: string; params: unknown[] } {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 2; // $1 is the query embedding

    // MANDATORY: Store isolation
    conditions.push(`store_id = $${paramIdx}`);
    params.push(query.siteId);
    paramIdx++;

    // Active documents only
    conditions.push(`status = $${paramIdx}`);
    params.push(DocumentStatus.ACTIVE);
    paramIdx++;

    // Document type filter
    if (query.documentTypes && query.documentTypes.length > 0) {
      const typePlaceholders = query.documentTypes
        .map((_, i) => `$${paramIdx + i}`)
        .join(',');
      conditions.push(`document_type IN (${typePlaceholders})`);
      params.push(...query.documentTypes);
      paramIdx += query.documentTypes.length;
    }

    // Metadata filters
    if (query.filters) {
      for (const filter of query.filters) {
        const jsonPath = `metadata->>'${filter.field.replace(/'/g, "''")}'`;

        switch (filter.operator) {
          case 'eq':
            conditions.push(`${jsonPath} = $${paramIdx}`);
            params.push(String(filter.value));
            paramIdx++;
            break;
          case 'gt':
            conditions.push(`(${jsonPath})::numeric > $${paramIdx}`);
            params.push(Number(filter.value));
            paramIdx++;
            break;
          case 'gte':
            conditions.push(`(${jsonPath})::numeric >= $${paramIdx}`);
            params.push(Number(filter.value));
            paramIdx++;
            break;
          case 'lt':
            conditions.push(`(${jsonPath})::numeric < $${paramIdx}`);
            params.push(Number(filter.value));
            paramIdx++;
            break;
          case 'lte':
            conditions.push(`(${jsonPath})::numeric <= $${paramIdx}`);
            params.push(Number(filter.value));
            paramIdx++;
            break;
          case 'contains':
            conditions.push(`${jsonPath} ILIKE $${paramIdx}`);
            params.push(`%${filter.value}%`);
            paramIdx++;
            break;
          case 'in': {
            const values = Array.isArray(filter.value) ? filter.value : [filter.value];
            const ph = values.map((_, i) => `$${paramIdx + i}`).join(',');
            conditions.push(`${jsonPath} IN (${ph})`);
            params.push(...values.map(String));
            paramIdx += values.length;
            break;
          }
        }
      }
    }

    return {
      whereClause: conditions.join(' AND '),
      params,
    };
  }

  /** Convert database row to SearchResult */
  private rowToResult(row: VectorRawRow): SearchResult {
    return {
      id: row.id,
      documentId: row.document_id,
      documentType: row.document_type as DocumentType,
      siteId: row.store_id,
      score: this.distanceToScore(row.distance),
      content: row.content,
      metadata: row.metadata as DocumentMetadata,
      chunkIndex: row.chunk_index,
      chunkTotal: row.chunk_total,
    };
  }
}
