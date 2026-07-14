/**
 * AfroStore RAG Engine — OpenAI Embedding Provider
 *
 * Production implementation with:
 * - Automatic batching with size limits
 * - Exponential backoff retry with jitter
 * - Rate limiting (token bucket)
 * - Request timeout handling
 * - Dimension validation
 */

import type { EmbeddingProvider, RAGConfig } from '../types';
import { EmbeddingError, RateLimitError } from '../errors';
import { createLogger } from '../logger';

const logger = createLogger('embeddings.openai');

interface OpenAIEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    index: number;
    embedding: number[];
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  public readonly dimension: number;
  public readonly name = 'openai';

  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly requestTimeoutMs: number;
  private readonly maxBatchSize: number;

  /** Token bucket for rate limiting */
  private tokenBucket: number;
  private readonly maxTokens: number;
  private lastRefill: number;
  private readonly refillRatePerMs: number;

  /** Metrics */
  private totalRequests = 0;
  private totalTokensUsed = 0;
  private totalErrors = 0;

  constructor(config: RAGConfig['embedding']) {
    if (!config.apiKey) {
      throw new EmbeddingError('OpenAI API key is required');
    }

    this.apiKey = config.apiKey;
    this.model = config.model;
    this.dimension = config.dimension;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.maxRetries = config.maxRetries;
    this.retryDelayMs = config.retryDelayMs;
    this.requestTimeoutMs = config.requestTimeoutMs;
    this.maxBatchSize = Math.min(config.maxBatchSize, 2048); // OpenAI hard limit

    // Rate limiting: convert RPM to token bucket
    this.maxTokens = config.rateLimitRpm;
    this.tokenBucket = this.maxTokens;
    this.lastRefill = Date.now();
    this.refillRatePerMs = config.rateLimitRpm / 60_000;
  }

  async embed(text: string): Promise<number[]> {
    const results = await this.embedBatch([text]);
    return results[0];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    // Split into sub-batches if exceeding max batch size
    if (texts.length > this.maxBatchSize) {
      const results: number[][] = [];
      for (let i = 0; i < texts.length; i += this.maxBatchSize) {
        const batch = texts.slice(i, i + this.maxBatchSize);
        const batchResults = await this.embedBatch(batch);
        results.push(...batchResults);
      }
      return results;
    }

    await this.waitForRateLimit();

    return this.executeWithRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

      try {
        const body: Record<string, unknown> = {
          model: this.model,
          input: texts,
        };

        // text-embedding-3-* supports dimension parameter
        if (this.model.includes('text-embedding-3')) {
          body.dimensions = this.dimension;
        }

        const response = await fetch(`${this.baseUrl}/embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          const retryMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000;
          throw new RateLimitError(retryMs);
        }

        if (!response.ok) {
          const errorBody = await response.text().catch(() => 'unknown');
          throw new EmbeddingError(
            `OpenAI API error ${response.status}: ${errorBody}`,
            { retryable: response.status >= 500 }
          );
        }

        const data = (await response.json()) as OpenAIEmbeddingResponse;

        this.totalRequests++;
        this.totalTokensUsed += data.usage.total_tokens;

        // Sort by index to ensure correct ordering
        const sorted = data.data.sort((a, b) => a.index - b.index);
        const embeddings = sorted.map((d) => d.embedding);

        // Validate dimensions
        for (let i = 0; i < embeddings.length; i++) {
          if (embeddings[i].length !== this.dimension) {
            throw new EmbeddingError(
              `Dimension mismatch: expected ${this.dimension}, got ${embeddings[i].length} at index ${i}`
            );
          }
        }

        logger.debug('Embeddings generated', {
          count: texts.length,
          tokens: data.usage.total_tokens,
          model: data.model,
        });

        return embeddings;
      } finally {
        clearTimeout(timeout);
      }
    });
  }

  getMetrics(): { totalRequests: number; totalTokensUsed: number; totalErrors: number } {
    return {
      totalRequests: this.totalRequests,
      totalTokensUsed: this.totalTokensUsed,
      totalErrors: this.totalErrors,
    };
  }

  // ─── RATE LIMITING ──────────────────────────────────────

  private async waitForRateLimit(): Promise<void> {
    this.refillBucket();

    if (this.tokenBucket >= 1) {
      this.tokenBucket -= 1;
      return;
    }

    // Wait until a token is available
    const waitMs = Math.ceil((1 - this.tokenBucket) / this.refillRatePerMs);
    logger.debug('Rate limit: waiting', { waitMs });
    await sleep(waitMs);
    this.refillBucket();
    this.tokenBucket -= 1;
  }

  private refillBucket(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokenBucket = Math.min(this.maxTokens, this.tokenBucket + elapsed * this.refillRatePerMs);
    this.lastRefill = now;
  }

  // ─── RETRY LOGIC ────────────────────────────────────────

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        this.totalErrors++;

        if (error instanceof RateLimitError) {
          logger.warn('Rate limited, backing off', {
            attempt,
            retryAfterMs: error.retryAfterMs,
          });
          await sleep(error.retryAfterMs);
          continue;
        }

        if (error instanceof EmbeddingError && !error.retryable) {
          throw error;
        }

        if (attempt < this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
          logger.warn('Retrying embedding request', {
            attempt: attempt + 1,
            maxRetries: this.maxRetries,
            delayMs: Math.round(delay),
            error: (error as Error).message,
          });
          await sleep(delay);
        }
      }
    }

    throw new EmbeddingError(
      `Embedding request failed after ${this.maxRetries + 1} attempts: ${lastError?.message}`,
      { cause: lastError, retryable: false }
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
