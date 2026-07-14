/**
 * AfroStore RAG Engine — Error Classes
 *
 * Typed errors for every failure mode. No generic Error throws.
 */

export class RAGError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: string,
    opts: { retryable?: boolean; context?: Record<string, unknown>; cause?: Error } = {}
  ) {
    super(message);
    this.name = 'RAGError';
    this.code = code;
    this.retryable = opts.retryable ?? false;
    this.context = opts.context;
    if (opts.cause) this.cause = opts.cause;
  }
}

/** Embedding API call failed */
export class EmbeddingError extends RAGError {
  constructor(message: string, opts: { cause?: Error; retryable?: boolean } = {}) {
    super(message, 'EMBEDDING_ERROR', { retryable: opts.retryable ?? true, cause: opts.cause });
    this.name = 'EmbeddingError';
  }
}

/** Rate limit hit on embedding API */
export class RateLimitError extends RAGError {
  public readonly retryAfterMs: number;

  constructor(retryAfterMs: number, opts: { cause?: Error } = {}) {
    super(`Rate limit exceeded. Retry after ${retryAfterMs}ms`, 'RATE_LIMIT', {
      retryable: true,
      cause: opts.cause,
      context: { retryAfterMs },
    });
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

/** Search query execution failed */
export class SearchError extends RAGError {
  constructor(message: string, opts: { cause?: Error; context?: Record<string, unknown> } = {}) {
    super(message, 'SEARCH_ERROR', { retryable: false, ...opts });
    this.name = 'SearchError';
  }
}

/** Indexing pipeline error */
export class IndexingError extends RAGError {
  public readonly documentId?: string;

  constructor(
    message: string,
    opts: { documentId?: string; cause?: Error; retryable?: boolean } = {}
  ) {
    super(message, 'INDEXING_ERROR', {
      retryable: opts.retryable ?? false,
      cause: opts.cause,
      context: opts.documentId ? { documentId: opts.documentId } : undefined,
    });
    this.name = 'IndexingError';
    this.documentId = opts.documentId;
  }
}

/** Document validation failed */
export class ValidationError extends RAGError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', {
      retryable: false,
      context: field ? { field } : undefined,
    });
    this.name = 'ValidationError';
    this.field = field;
  }
}

/** Multi-tenant isolation violation */
export class TenantIsolationError extends RAGError {
  constructor(message: string = 'Store ID is required for all RAG operations') {
    super(message, 'TENANT_ISOLATION', { retryable: false });
    this.name = 'TenantIsolationError';
  }
}

/** Database operation failed */
export class DatabaseError extends RAGError {
  constructor(message: string, opts: { cause?: Error } = {}) {
    super(message, 'DATABASE_ERROR', { retryable: true, cause: opts.cause });
    this.name = 'DatabaseError';
  }
}

/** Configuration is invalid */
export class ConfigError extends RAGError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR', { retryable: false });
    this.name = 'ConfigError';
  }
}
