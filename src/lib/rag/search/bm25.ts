/**
 * AfroStore RAG Engine — BM25 Search (PostgreSQL Full-Text Search)
 *
 * Uses PostgreSQL's native tsvector/tsquery with ts_rank_cd (cover density)
 * for BM25-equivalent ranking. This is production-grade:
 *
 * - Uses GIN indexes for O(1) lookup on tsvectors
 * - Supports prefix matching, phrase queries, and boolean operators
 * - Weighted ranking (title > content)
 * - Multi-tenant isolation at query level
 * - Query expansion with stemming
 *
 * Why not in-memory BM25? Because PostgreSQL FTS:
 * - Scales to millions of documents
 * - Uses disk-based indexes (no memory pressure)
 * - Handles concurrent reads without locks
 * - Supports incremental index updates
 * - Is battle-tested in production by thousands of companies
 */

import type { PrismaClient } from '@/generated/prisma';
import type {
  SearchQuery,
  SearchResult,
  DocumentMetadata,
  RAGConfig,
} from '../types';
import { DocumentType, DocumentStatus } from '../types';
import { SearchError, TenantIsolationError } from '../errors';
import { createLogger } from '../logger';
import { normalizeQuery } from '../utils/normalize';
import { metrics, METRIC } from '../utils/metrics';

const logger = createLogger('search.bm25');

interface BM25RawRow {
  id: string;
  document_id: string;
  document_type: string;
  store_id: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  chunk_index: number;
  chunk_total: number;
  rank: number;
}

export class BM25Search {
  private readonly prisma: PrismaClient;
  private readonly config: RAGConfig['search']['bm25'];
  private readonly tableName: string;
  private readonly tsConfig: string;

  constructor(prisma: PrismaClient, config: RAGConfig) {
    this.prisma = prisma;
    this.config = config.search.bm25;
    this.tableName = `"${config.database.schema}"."${config.database.tableName}"`;
    this.tsConfig = config.search.bm25.tsConfig;
  }

  /**
   * Execute BM25 keyword search using PostgreSQL full-text search.
   * Returns ranked results with relevance scores.
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    if (!query.siteId) throw new TenantIsolationError();

    const startTime = performance.now();

    try {
      const tsQuery = this.buildTsQuery(query.query);
      if (!tsQuery) {
        logger.debug('Empty query after processing, returning empty results');
        return [];
      }

      const limit = Math.min(
        query.limit || this.config.candidateLimit,
        this.config.candidateLimit
      );

      // Build the SQL query with filters
      const { whereClause, params } = this.buildWhereClause(query, tsQuery);

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
          ts_rank_cd(
            setweight(to_tsvector('${this.tsConfig}', title), '${this.config.titleWeight}') ||
            setweight(tsv, '${this.config.contentWeight}'),
            to_tsquery('${this.tsConfig}', $1),
            32 -- normalize by document length
          ) AS rank
        FROM ${this.tableName}
        WHERE ${whereClause}
          AND (
            tsv @@ to_tsquery('${this.tsConfig}', $1)
            OR to_tsvector('${this.tsConfig}', title) @@ to_tsquery('${this.tsConfig}', $1)
          )
        ORDER BY rank DESC
        LIMIT ${limit}
      `;

      const rows = await this.prisma.$queryRawUnsafe<BM25RawRow[]>(sql, ...params);

      const results = rows.map((row: BM25RawRow, index: number) => this.rowToResult(row, index, rows.length));

      const durationMs = performance.now() - startTime;
      metrics.observe(METRIC.SEARCH_BM25_LATENCY, durationMs);

      logger.debug('BM25 search completed', {
        query: query.query,
        tsQuery,
        results: results.length,
        durationMs: Math.round(durationMs),
      });

      return results;
    } catch (error) {
      const durationMs = performance.now() - startTime;
      metrics.increment(METRIC.SEARCH_ERRORS, 1, { type: 'bm25' });
      logger.error('BM25 search failed', error, { query: query.query });
      throw new SearchError(`BM25 search failed: ${(error as Error).message}`, {
        cause: error as Error,
        context: { query: query.query, durationMs },
      });
    }
  }

  /**
   * Convert natural language query to PostgreSQL tsquery.
   * Handles:
   * - Multi-word queries (AND by default)
   * - Prefix matching for partial words
   * - Phrase detection (quoted strings)
   * - OR operator support
   */
  private buildTsQuery(rawQuery: string): string {
    const normalized = normalizeQuery(rawQuery);
    if (!normalized) return '';

    // Handle quoted phrases
    const phrases: string[] = [];
    let remaining = normalized;
    const phraseRegex = /"([^"]+)"/g;
    let match;

    while ((match = phraseRegex.exec(normalized)) !== null) {
      const phraseWords = match[1].trim().split(/\s+/).filter(Boolean);
      if (phraseWords.length > 0) {
        phrases.push(phraseWords.map((w) => this.sanitizeTsWord(w)).join(' <-> '));
      }
      remaining = remaining.replace(match[0], ' ');
    }

    // Process remaining words
    const words = remaining
      .split(/\s+/)
      .filter((w) => w.length > 1)
      .map((w) => {
        // Handle OR operator
        if (w.toLowerCase() === 'or') return '|';
        return this.sanitizeTsWord(w) + ':*'; // Prefix matching
      })
      .filter(Boolean);

    // Combine phrases and words with AND
    const parts = [...phrases, ...words];
    if (parts.length === 0) return '';

    // Join with AND (replace consecutive | properly)
    let query = parts[0];
    for (let i = 1; i < parts.length; i++) {
      if (parts[i] === '|' || parts[i - 1] === '|') {
        query += ` ${parts[i]}`;
      } else {
        query += ` & ${parts[i]}`;
      }
    }

    return query;
  }

  /** Sanitize a word for tsquery (prevent injection) */
  private sanitizeTsWord(word: string): string {
    return word
      .replace(/[^a-zA-Z0-9_GH₵\-]/g, '')
      .replace(/-+/g, '-')
      .trim();
  }

  /** Build WHERE clause with multi-tenant isolation and filters */
  private buildWhereClause(
    query: SearchQuery,
    tsQuery: string
  ): { whereClause: string; params: unknown[] } {
    const conditions: string[] = [];
    const params: unknown[] = [tsQuery]; // $1 is always the tsquery
    let paramIdx = 2;

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
        const { sql, filterParams } = this.buildMetadataFilter(filter, paramIdx);
        if (sql) {
          conditions.push(sql);
          params.push(...filterParams);
          paramIdx += filterParams.length;
        }
      }
    }

    return {
      whereClause: conditions.join(' AND '),
      params,
    };
  }

  /** Build a metadata JSONB filter condition */
  private buildMetadataFilter(
    filter: { field: string; operator: string; value: unknown },
    startParam: number
  ): { sql: string; filterParams: unknown[] } {
    const jsonPath = `metadata->>'${filter.field.replace(/'/g, "''")}'`;

    switch (filter.operator) {
      case 'eq':
        return { sql: `${jsonPath} = $${startParam}`, filterParams: [String(filter.value)] };
      case 'neq':
        return { sql: `${jsonPath} != $${startParam}`, filterParams: [String(filter.value)] };
      case 'gt':
        return { sql: `(${jsonPath})::numeric > $${startParam}`, filterParams: [Number(filter.value)] };
      case 'gte':
        return { sql: `(${jsonPath})::numeric >= $${startParam}`, filterParams: [Number(filter.value)] };
      case 'lt':
        return { sql: `(${jsonPath})::numeric < $${startParam}`, filterParams: [Number(filter.value)] };
      case 'lte':
        return { sql: `(${jsonPath})::numeric <= $${startParam}`, filterParams: [Number(filter.value)] };
      case 'contains':
        return { sql: `${jsonPath} ILIKE $${startParam}`, filterParams: [`%${filter.value}%`] };
      case 'in': {
        const values = Array.isArray(filter.value) ? filter.value : [filter.value];
        const placeholders = values.map((_, i) => `$${startParam + i}`).join(',');
        return { sql: `${jsonPath} IN (${placeholders})`, filterParams: values.map(String) };
      }
      case 'exists':
        return { sql: `metadata ? '${filter.field.replace(/'/g, "''")}'`, filterParams: [] };
      default:
        return { sql: '', filterParams: [] };
    }
  }

  /** Convert a database row to a SearchResult */
  private rowToResult(row: BM25RawRow, _index: number, _totalResults: number): SearchResult {
    return {
      id: row.id,
      documentId: row.document_id,
      documentType: row.document_type as DocumentType,
      siteId: row.store_id,
      score: row.rank, // Raw ts_rank_cd score — normalized later in RRF
      content: row.content,
      metadata: row.metadata as DocumentMetadata,
      chunkIndex: row.chunk_index,
      chunkTotal: row.chunk_total,
    };
  }
}
