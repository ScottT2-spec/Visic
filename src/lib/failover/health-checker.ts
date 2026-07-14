/**
 * AfroStore Failover Engine — Provider Health Checker
 *
 * Periodic health checks for payment gateways and AI providers.
 * Runs in the background and updates provider health status.
 *
 * Health check endpoints:
 * - Paystack: GET https://api.paystack.co/ (returns 200)
 * - Flutterwave: GET https://api.flutterwave.com/v3 (returns 200)
 * - Monnify: POST /api/v1/auth/login (returns auth token)
 * - OpenAI: GET https://api.openai.com/v1/models (returns model list)
 * - Anthropic: POST https://api.anthropic.com/v1/messages (lightweight ping)
 * - Google: GET generativelanguage.googleapis.com (returns 200)
 */

import { ProviderHealth, type HealthCheckResult, type FailoverEventHandler } from './types';

export interface HealthCheckConfig {
  /** Interval between health checks in ms */
  intervalMs: number;
  /** Timeout for each health check request */
  timeoutMs: number;
  /** Number of consecutive failures before marking unhealthy */
  unhealthyThreshold: number;
  /** Number of consecutive successes before marking healthy */
  healthyThreshold: number;
  /** Latency threshold for degraded status (ms) */
  degradedLatencyMs: number;
}

const DEFAULT_CONFIG: HealthCheckConfig = {
  intervalMs: 30_000,         // Check every 30 seconds
  timeoutMs: 10_000,          // 10 second timeout per check
  unhealthyThreshold: 3,      // 3 consecutive failures → unhealthy
  healthyThreshold: 2,        // 2 consecutive successes → healthy
  degradedLatencyMs: 5_000,   // >5s response → degraded
};

interface ProviderState {
  health: ProviderHealth;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastCheck: HealthCheckResult | null;
  history: HealthCheckResult[];
}

type CheckFunction = () => Promise<HealthCheckResult>;

export class HealthChecker {
  private readonly config: HealthCheckConfig;
  private readonly providers: Map<string, { checkFn: CheckFunction; state: ProviderState }>;
  private readonly onEvent?: FailoverEventHandler;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private readonly maxHistory = 100;

  constructor(config: Partial<HealthCheckConfig> = {}, onEvent?: FailoverEventHandler) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.providers = new Map();
    this.onEvent = onEvent;
  }

  /**
   * Register a provider with its health check function.
   */
  register(providerId: string, checkFn: CheckFunction): void {
    this.providers.set(providerId, {
      checkFn,
      state: {
        health: ProviderHealth.UNKNOWN,
        consecutiveFailures: 0,
        consecutiveSuccesses: 0,
        lastCheck: null,
        history: [],
      },
    });
  }

  /**
   * Start periodic health checks.
   */
  start(): void {
    if (this.intervalHandle) return;

    // Run immediately on start
    this.checkAll().catch(() => {});

    this.intervalHandle = setInterval(() => {
      this.checkAll().catch(() => {});
    }, this.config.intervalMs);
  }

  /**
   * Stop periodic health checks.
   */
  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  /**
   * Run health checks on all registered providers.
   */
  async checkAll(): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();

    const promises = Array.from(this.providers.entries()).map(
      async ([id, entry]) => {
        const result = await this.checkOne(id, entry);
        results.set(id, result);
      }
    );

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Run health check on a single provider.
   */
  async checkProvider(providerId: string): Promise<HealthCheckResult> {
    const entry = this.providers.get(providerId);
    if (!entry) {
      return {
        provider: providerId,
        healthy: false,
        latencyMs: 0,
        error: 'Provider not registered',
        checkedAt: Date.now(),
      };
    }
    return this.checkOne(providerId, entry);
  }

  /**
   * Get current health status of a provider.
   */
  getHealth(providerId: string): ProviderHealth {
    return this.providers.get(providerId)?.state.health ?? ProviderHealth.UNKNOWN;
  }

  /**
   * Get all provider health statuses.
   */
  getAllHealth(): Map<string, ProviderHealth> {
    const result = new Map<string, ProviderHealth>();
    for (const [id, entry] of this.providers) {
      result.set(id, entry.state.health);
    }
    return result;
  }

  /**
   * Get healthy providers sorted by recent latency.
   */
  getHealthyProviders(): string[] {
    const healthy: Array<{ id: string; latency: number }> = [];

    for (const [id, entry] of this.providers) {
      if (
        entry.state.health === ProviderHealth.HEALTHY ||
        entry.state.health === ProviderHealth.DEGRADED
      ) {
        healthy.push({
          id,
          latency: entry.state.lastCheck?.latencyMs ?? Infinity,
        });
      }
    }

    return healthy
      .sort((a, b) => a.latency - b.latency)
      .map((h) => h.id);
  }

  /**
   * Get detailed status for all providers.
   */
  getStatus(): Record<string, {
    health: ProviderHealth;
    lastCheck: HealthCheckResult | null;
    consecutiveFailures: number;
    recentLatencyMs: number[];
  }> {
    const status: Record<string, any> = {};
    for (const [id, entry] of this.providers) {
      status[id] = {
        health: entry.state.health,
        lastCheck: entry.state.lastCheck,
        consecutiveFailures: entry.state.consecutiveFailures,
        recentLatencyMs: entry.state.history
          .slice(-10)
          .filter((h) => h.healthy)
          .map((h) => h.latencyMs),
      };
    }
    return status;
  }

  // ─── INTERNAL ─────────────────────────────────────────

  private async checkOne(
    providerId: string,
    entry: { checkFn: CheckFunction; state: ProviderState }
  ): Promise<HealthCheckResult> {
    let result: HealthCheckResult;

    try {
      result = await this.withTimeout(entry.checkFn(), this.config.timeoutMs);
    } catch (error) {
      result = {
        provider: providerId,
        healthy: false,
        latencyMs: this.config.timeoutMs,
        error: (error as Error).message,
        checkedAt: Date.now(),
      };
    }

    // Update state
    if (result.healthy) {
      entry.state.consecutiveSuccesses++;
      entry.state.consecutiveFailures = 0;

      if (result.latencyMs > this.config.degradedLatencyMs) {
        entry.state.health = ProviderHealth.DEGRADED;
      } else if (entry.state.consecutiveSuccesses >= this.config.healthyThreshold) {
        entry.state.health = ProviderHealth.HEALTHY;
      }
    } else {
      entry.state.consecutiveFailures++;
      entry.state.consecutiveSuccesses = 0;

      if (entry.state.consecutiveFailures >= this.config.unhealthyThreshold) {
        entry.state.health = ProviderHealth.UNHEALTHY;
      } else {
        entry.state.health = ProviderHealth.DEGRADED;
      }
    }

    entry.state.lastCheck = result;
    entry.state.history.push(result);
    if (entry.state.history.length > this.maxHistory) {
      entry.state.history.shift();
    }

    return result;
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Health check timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
      promise
        .then((v) => { clearTimeout(timer); resolve(v); })
        .catch((e) => { clearTimeout(timer); reject(e); });
    });
  }
}

// ─── PRE-BUILT HEALTH CHECK FUNCTIONS ───────────────────────

/** Create a health check for Paystack */
export function paystackHealthCheck(secretKey: string): CheckFunction {
  return async (): Promise<HealthCheckResult> => {
    const start = performance.now();
    try {
      const res = await fetch('https://api.paystack.co/transaction/verify/healthcheck_noop', {
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      // 400 is fine — means the API is responding, just invalid reference
      return {
        provider: 'paystack',
        healthy: res.status === 200 || res.status === 400 || res.status === 404,
        latencyMs: Math.round(performance.now() - start),
        statusCode: res.status,
        checkedAt: Date.now(),
      };
    } catch (error) {
      return {
        provider: 'paystack',
        healthy: false,
        latencyMs: Math.round(performance.now() - start),
        error: (error as Error).message,
        checkedAt: Date.now(),
      };
    }
  };
}

/** Create a health check for Flutterwave */
export function flutterwaveHealthCheck(secretKey: string): CheckFunction {
  return async (): Promise<HealthCheckResult> => {
    const start = performance.now();
    try {
      const res = await fetch('https://api.flutterwave.com/v3/transactions?page=1&limit=1', {
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      return {
        provider: 'flutterwave',
        healthy: res.status === 200 || res.status === 401, // 401 = API is up, key issue
        latencyMs: Math.round(performance.now() - start),
        statusCode: res.status,
        checkedAt: Date.now(),
      };
    } catch (error) {
      return {
        provider: 'flutterwave',
        healthy: false,
        latencyMs: Math.round(performance.now() - start),
        error: (error as Error).message,
        checkedAt: Date.now(),
      };
    }
  };
}

/** Create a health check for Monnify */
export function monnifyHealthCheck(apiKey: string, secretKey: string, baseUrl: string): CheckFunction {
  return async (): Promise<HealthCheckResult> => {
    const start = performance.now();
    try {
      const credentials = btoa(`${apiKey}:${secretKey}`);
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}` },
      });
      const data = await res.json();
      return {
        provider: 'monnify',
        healthy: data.requestSuccessful === true,
        latencyMs: Math.round(performance.now() - start),
        statusCode: res.status,
        checkedAt: Date.now(),
      };
    } catch (error) {
      return {
        provider: 'monnify',
        healthy: false,
        latencyMs: Math.round(performance.now() - start),
        error: (error as Error).message,
        checkedAt: Date.now(),
      };
    }
  };
}

/** Create a health check for OpenAI */
export function openaiHealthCheck(apiKey: string, baseUrl?: string): CheckFunction {
  const url = baseUrl || 'https://api.openai.com/v1';
  return async (): Promise<HealthCheckResult> => {
    const start = performance.now();
    try {
      const res = await fetch(`${url}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return {
        provider: 'openai',
        healthy: res.status === 200,
        latencyMs: Math.round(performance.now() - start),
        statusCode: res.status,
        checkedAt: Date.now(),
      };
    } catch (error) {
      return {
        provider: 'openai',
        healthy: false,
        latencyMs: Math.round(performance.now() - start),
        error: (error as Error).message,
        checkedAt: Date.now(),
      };
    }
  };
}

/** Create a health check for Anthropic */
export function anthropicHealthCheck(apiKey: string): CheckFunction {
  return async (): Promise<HealthCheckResult> => {
    const start = performance.now();
    try {
      // Use a minimal request — Anthropic doesn't have a /models endpoint
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
      // 200 = working, 401 = API up but key issue, 529 = overloaded
      return {
        provider: 'anthropic',
        healthy: res.status === 200 || res.status === 401,
        latencyMs: Math.round(performance.now() - start),
        statusCode: res.status,
        checkedAt: Date.now(),
      };
    } catch (error) {
      return {
        provider: 'anthropic',
        healthy: false,
        latencyMs: Math.round(performance.now() - start),
        error: (error as Error).message,
        checkedAt: Date.now(),
      };
    }
  };
}

/** Create a health check for Google Gemini */
export function googleHealthCheck(apiKey: string): CheckFunction {
  return async (): Promise<HealthCheckResult> => {
    const start = performance.now();
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
      );
      return {
        provider: 'google',
        healthy: res.status === 200,
        latencyMs: Math.round(performance.now() - start),
        statusCode: res.status,
        checkedAt: Date.now(),
      };
    } catch (error) {
      return {
        provider: 'google',
        healthy: false,
        latencyMs: Math.round(performance.now() - start),
        error: (error as Error).message,
        checkedAt: Date.now(),
      };
    }
  };
}

/** Create a health check for Groq */
export function groqHealthCheck(apiKey: string): CheckFunction {
  return async (): Promise<HealthCheckResult> => {
    const start = performance.now();
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return {
        provider: 'groq',
        healthy: res.status === 200,
        latencyMs: Math.round(performance.now() - start),
        statusCode: res.status,
        checkedAt: Date.now(),
      };
    } catch (error) {
      return {
        provider: 'groq',
        healthy: false,
        latencyMs: Math.round(performance.now() - start),
        error: (error as Error).message,
        checkedAt: Date.now(),
      };
    }
  };
}

/** Create a health check for DeepSeek */
export function deepseekHealthCheck(apiKey: string): CheckFunction {
  return async (): Promise<HealthCheckResult> => {
    const start = performance.now();
    try {
      const res = await fetch('https://api.deepseek.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return {
        provider: 'deepseek',
        healthy: res.status === 200,
        latencyMs: Math.round(performance.now() - start),
        statusCode: res.status,
        checkedAt: Date.now(),
      };
    } catch (error) {
      return {
        provider: 'deepseek',
        healthy: false,
        latencyMs: Math.round(performance.now() - start),
        error: (error as Error).message,
        checkedAt: Date.now(),
      };
    }
  };
}
