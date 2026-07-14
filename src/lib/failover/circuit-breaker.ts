/**
 * AfroStore Failover Engine — Circuit Breaker
 *
 * Prevents cascading failures by stopping requests to unhealthy providers.
 *
 * States:
 *   CLOSED  → normal operation, requests flow through
 *   OPEN    → provider is down, requests rejected immediately (use fallback)
 *   HALF_OPEN → recovery probe, limited requests to test if provider is back
 *
 * Transitions:
 *   CLOSED → OPEN: when failures in sliding window exceed threshold
 *   OPEN → HALF_OPEN: after recoveryTimeoutMs elapses
 *   HALF_OPEN → CLOSED: after halfOpenSuccessThreshold consecutive successes
 *   HALF_OPEN → OPEN: on any failure
 */

import {
  CircuitState,
  type CircuitBreakerConfig,
  type CircuitBreakerState,
  type FailoverEvent,
  type FailoverEventHandler,
} from './types';

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeoutMs: 30_000,      // 30 seconds
  halfOpenSuccessThreshold: 3,
  failureWindowMs: 60_000,        // 1 minute sliding window
  requestTimeoutMs: 15_000,       // 15 seconds per request
};

export class CircuitBreaker {
  private readonly providerId: string;
  private readonly config: CircuitBreakerConfig;
  private state: CircuitBreakerState;
  private readonly onEvent?: FailoverEventHandler;

  constructor(
    providerId: string,
    config: Partial<CircuitBreakerConfig> = {},
    onEvent?: FailoverEventHandler
  ) {
    this.providerId = providerId;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.onEvent = onEvent;
    this.state = {
      state: CircuitState.CLOSED,
      failures: 0,
      successes: 0,
      lastFailureAt: 0,
      lastSuccessAt: 0,
      lastStateChangeAt: Date.now(),
      recentFailures: [],
    };
  }

  /**
   * Execute a function through the circuit breaker.
   * Throws if circuit is OPEN and recovery timeout hasn't elapsed.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if request is allowed
    if (!this.canExecute()) {
      throw new CircuitOpenError(this.providerId, this.getTimeUntilHalfOpen());
    }

    const startTime = performance.now();

    try {
      // Add timeout
      const result = await this.withTimeout(fn(), this.config.requestTimeoutMs);
      this.onSuccess();
      return result;
    } catch (error) {
      const latencyMs = performance.now() - startTime;
      this.onFailure(error as Error, latencyMs);
      throw error;
    }
  }

  /** Check if the circuit allows requests */
  canExecute(): boolean {
    this.pruneOldFailures();

    switch (this.state.state) {
      case CircuitState.CLOSED:
        return true;

      case CircuitState.OPEN: {
        // Check if recovery timeout has elapsed
        const elapsed = Date.now() - this.state.lastStateChangeAt;
        if (elapsed >= this.config.recoveryTimeoutMs) {
          this.transitionTo(CircuitState.HALF_OPEN);
          return true;
        }
        return false;
      }

      case CircuitState.HALF_OPEN:
        return true;

      default:
        return true;
    }
  }

  /** Record a successful request */
  private onSuccess(): void {
    this.state.lastSuccessAt = Date.now();
    this.state.successes++;

    switch (this.state.state) {
      case CircuitState.HALF_OPEN:
        if (this.state.successes >= this.config.halfOpenSuccessThreshold) {
          this.transitionTo(CircuitState.CLOSED);
        }
        break;

      case CircuitState.CLOSED:
        // Reset failure count on success
        this.state.failures = 0;
        break;
    }
  }

  /** Record a failed request */
  private onFailure(error: Error, latencyMs: number): void {
    const now = Date.now();
    this.state.lastFailureAt = now;
    this.state.failures++;
    this.state.recentFailures.push(now);

    this.emit({
      type: 'failure',
      provider: this.providerId,
      error: error.message,
      latencyMs,
      timestamp: now,
    });

    switch (this.state.state) {
      case CircuitState.CLOSED:
        this.pruneOldFailures();
        if (this.state.recentFailures.length >= this.config.failureThreshold) {
          this.transitionTo(CircuitState.OPEN);
        }
        break;

      case CircuitState.HALF_OPEN:
        // Any failure in half-open trips back to open
        this.transitionTo(CircuitState.OPEN);
        break;
    }
  }

  /** Transition to a new state */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state.state;
    this.state.state = newState;
    this.state.lastStateChangeAt = Date.now();
    this.state.successes = 0;

    if (newState === CircuitState.CLOSED) {
      this.state.failures = 0;
      this.state.recentFailures = [];
    }

    const eventType = newState === CircuitState.OPEN
      ? 'circuit_open'
      : newState === CircuitState.CLOSED
        ? 'circuit_close'
        : 'circuit_half_open';

    this.emit({
      type: eventType as FailoverEvent['type'],
      provider: this.providerId,
      timestamp: Date.now(),
      metadata: { from: oldState, to: newState },
    });
  }

  /** Remove failures outside the sliding window */
  private pruneOldFailures(): void {
    const cutoff = Date.now() - this.config.failureWindowMs;
    this.state.recentFailures = this.state.recentFailures.filter((t) => t > cutoff);
  }

  /** Add timeout to a promise */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Request timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /** Emit a failover event */
  private emit(event: FailoverEvent): void {
    if (this.onEvent) {
      try {
        const result = this.onEvent(event);
        if (result instanceof Promise) {
          result.catch(() => {}); // Fire and forget
        }
      } catch {}
    }
  }

  // ─── PUBLIC STATUS ────────────────────────────────────

  getState(): CircuitState {
    // Check for auto-transition to half-open
    if (this.state.state === CircuitState.OPEN) {
      const elapsed = Date.now() - this.state.lastStateChangeAt;
      if (elapsed >= this.config.recoveryTimeoutMs) {
        this.transitionTo(CircuitState.HALF_OPEN);
      }
    }
    return this.state.state;
  }

  getStatus(): {
    state: CircuitState;
    failures: number;
    recentFailures: number;
    lastFailureAt: number;
    lastSuccessAt: number;
    timeUntilHalfOpen: number | null;
  } {
    this.pruneOldFailures();
    return {
      state: this.getState(),
      failures: this.state.failures,
      recentFailures: this.state.recentFailures.length,
      lastFailureAt: this.state.lastFailureAt,
      lastSuccessAt: this.state.lastSuccessAt,
      timeUntilHalfOpen: this.getTimeUntilHalfOpen(),
    };
  }

  /** Force reset to CLOSED state (manual recovery) */
  reset(): void {
    this.transitionTo(CircuitState.CLOSED);
  }

  /** Force trip to OPEN state (manual disable) */
  trip(): void {
    this.transitionTo(CircuitState.OPEN);
  }

  private getTimeUntilHalfOpen(): number | null {
    if (this.state.state !== CircuitState.OPEN) return null;
    const elapsed = Date.now() - this.state.lastStateChangeAt;
    return Math.max(0, this.config.recoveryTimeoutMs - elapsed);
  }
}

/** Error thrown when circuit is open */
export class CircuitOpenError extends Error {
  public readonly provider: string;
  public readonly retryAfterMs: number | null;

  constructor(provider: string, retryAfterMs: number | null) {
    super(`Circuit breaker OPEN for provider "${provider}". Retry after ${retryAfterMs}ms.`);
    this.name = 'CircuitOpenError';
    this.provider = provider;
    this.retryAfterMs = retryAfterMs;
  }
}
