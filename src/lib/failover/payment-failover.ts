/**
 * AfroStore Failover Engine — Payment Gateway Failover
 *
 * Automatic failover between Paystack, Flutterwave, and Monnify.
 *
 * When a merchant's checkout request fails on their preferred provider,
 * the system automatically tries the next healthy provider.
 *
 * Priority: Store's preferred → highest priority healthy → any available
 *
 * Features:
 * - Per-store provider preferences
 * - Circuit breaker per provider
 * - Health-check aware routing
 * - Payment method compatibility matching
 * - Currency support validation
 * - Audit trail of failover attempts
 */

import type {
  PaymentProviderConfig,
  PaymentInitRequest,
  PaymentInitResponse,
  FailoverResult,
  FailoverEventHandler,
  PaymentMethod,
} from './types';
import { CircuitBreaker, CircuitOpenError } from './circuit-breaker';
import {
  HealthChecker,
  paystackHealthCheck,
  flutterwaveHealthCheck,
  monnifyHealthCheck,
} from './health-checker';
import { ProviderHealth } from './types';
import {
  initializePaystackPayment,
  initializeFlutterwavePayment,
  initializeMonnifyPayment,
  getMonnifyAccessToken,
} from '../payments';

export interface PaymentFailoverConfig {
  /** Provider configurations */
  providers: PaymentProviderConfig[];
  /** Priority order (provider IDs). First = most preferred. */
  priorityOrder: string[];
  /** Circuit breaker settings */
  circuitBreaker?: {
    failureThreshold?: number;
    recoveryTimeoutMs?: number;
  };
  /** Health check interval in ms (0 = disabled) */
  healthCheckIntervalMs?: number;
  /** Event handler for monitoring */
  onEvent?: FailoverEventHandler;
}

export class PaymentFailover {
  private readonly providers: Map<string, PaymentProviderConfig>;
  private readonly circuits: Map<string, CircuitBreaker>;
  private readonly healthChecker: HealthChecker;
  private readonly priorityOrder: string[];
  private readonly onEvent?: FailoverEventHandler;

  constructor(config: PaymentFailoverConfig) {
    this.providers = new Map();
    this.circuits = new Map();
    this.priorityOrder = config.priorityOrder;
    this.onEvent = config.onEvent;

    // Initialize providers and circuit breakers
    for (const provider of config.providers) {
      this.providers.set(provider.provider, provider);
      this.circuits.set(
        provider.provider,
        new CircuitBreaker(provider.provider, config.circuitBreaker, config.onEvent)
      );
    }

    // Initialize health checker
    this.healthChecker = new HealthChecker(
      { intervalMs: config.healthCheckIntervalMs || 30_000 },
      config.onEvent
    );

    for (const provider of config.providers) {
      const checkFn = this.createHealthCheck(provider);
      if (checkFn) {
        this.healthChecker.register(provider.provider, checkFn);
      }
    }
  }

  /**
   * Initialize a payment with automatic failover.
   *
   * Tries providers in order:
   * 1. Preferred provider (from request or store config)
   * 2. Priority-ordered providers filtered by health and compatibility
   * 3. Any remaining provider as last resort
   */
  async initializePayment(
    request: PaymentInitRequest
  ): Promise<FailoverResult<PaymentInitResponse>> {
    const startTime = performance.now();
    const attemptedProviders: string[] = [];
    const failedProviders: Array<{ provider: string; error: string; latencyMs: number }> = [];

    // Build ordered provider list
    const orderedProviders = this.getOrderedProviders(
      request.preferredProvider,
      request.preferredMethod,
      request.currency
    );

    if (orderedProviders.length === 0) {
      return {
        success: false,
        provider: '',
        attemptedProviders: [],
        failedProviders: [],
        totalLatencyMs: Math.round(performance.now() - startTime),
        fallbackUsed: false,
      };
    }

    for (let i = 0; i < orderedProviders.length; i++) {
      const providerId = orderedProviders[i];
      const providerConfig = this.providers.get(providerId);
      const circuit = this.circuits.get(providerId);

      if (!providerConfig || !circuit) continue;

      attemptedProviders.push(providerId);
      const attemptStart = performance.now();

      try {
        const response = await circuit.execute(async () => {
          return this.executePaymentInit(providerConfig, request);
        });

        this.emit({
          type: 'success',
          provider: providerId,
          latencyMs: Math.round(performance.now() - attemptStart),
          timestamp: Date.now(),
          metadata: {
            reference: request.reference,
            fallback: i > 0,
            attemptNumber: i + 1,
          },
        });

        return {
          success: true,
          data: response,
          provider: providerId,
          attemptedProviders,
          failedProviders,
          totalLatencyMs: Math.round(performance.now() - startTime),
          fallbackUsed: i > 0,
        };
      } catch (error) {
        const latencyMs = Math.round(performance.now() - attemptStart);
        const errorMsg = error instanceof CircuitOpenError
          ? `Circuit open (retry after ${error.retryAfterMs}ms)`
          : (error as Error).message;

        failedProviders.push({ provider: providerId, error: errorMsg, latencyMs });

        this.emit({
          type: i < orderedProviders.length - 1 ? 'fallback' : 'failure',
          provider: providerId,
          error: errorMsg,
          latencyMs,
          timestamp: Date.now(),
          metadata: { reference: request.reference, attemptNumber: i + 1 },
        });
      }
    }

    // All providers failed
    return {
      success: false,
      provider: '',
      attemptedProviders,
      failedProviders,
      totalLatencyMs: Math.round(performance.now() - startTime),
      fallbackUsed: attemptedProviders.length > 1,
    };
  }

  /** Start health checks */
  startHealthChecks(): void {
    this.healthChecker.start();
  }

  /** Stop health checks */
  stopHealthChecks(): void {
    this.healthChecker.stop();
  }

  /** Get status of all providers */
  getStatus(): Record<string, {
    health: ProviderHealth;
    circuitState: string;
    methods: PaymentMethod[];
    currencies: string[];
  }> {
    const status: Record<string, any> = {};
    for (const [id, config] of this.providers) {
      const circuit = this.circuits.get(id);
      status[id] = {
        health: this.healthChecker.getHealth(id),
        circuitState: circuit?.getState() || 'unknown',
        methods: config.methods,
        currencies: config.currencies,
      };
    }
    return status;
  }

  /** Manually reset a provider's circuit breaker */
  resetCircuit(providerId: string): void {
    this.circuits.get(providerId)?.reset();
  }

  // ─── INTERNAL ─────────────────────────────────────────

  /**
   * Get providers ordered by preference, health, and compatibility.
   */
  private getOrderedProviders(
    preferred?: string,
    method?: PaymentMethod,
    currency?: string
  ): string[] {
    const ordered: string[] = [];
    const added = new Set<string>();

    // 1. Preferred provider first (if healthy and compatible)
    if (preferred && this.isCompatible(preferred, method, currency)) {
      ordered.push(preferred);
      added.add(preferred);
    }

    // 2. Priority-ordered, healthy providers
    for (const providerId of this.priorityOrder) {
      if (added.has(providerId)) continue;
      if (!this.isCompatible(providerId, method, currency)) continue;

      const health = this.healthChecker.getHealth(providerId);
      if (health === ProviderHealth.HEALTHY || health === ProviderHealth.UNKNOWN) {
        ordered.push(providerId);
        added.add(providerId);
      }
    }

    // 3. Degraded providers (better than nothing)
    for (const providerId of this.priorityOrder) {
      if (added.has(providerId)) continue;
      if (!this.isCompatible(providerId, method, currency)) continue;

      const health = this.healthChecker.getHealth(providerId);
      if (health === ProviderHealth.DEGRADED) {
        ordered.push(providerId);
        added.add(providerId);
      }
    }

    // 4. Last resort: unhealthy providers (circuit breaker will gate them)
    for (const providerId of this.priorityOrder) {
      if (added.has(providerId)) continue;
      if (!this.isCompatible(providerId, method, currency)) continue;
      ordered.push(providerId);
    }

    return ordered;
  }

  /** Check if a provider supports the requested method and currency */
  private isCompatible(
    providerId: string,
    method?: PaymentMethod,
    currency?: string
  ): boolean {
    const config = this.providers.get(providerId);
    if (!config) return false;

    if (method && !config.methods.includes(method)) return false;
    if (currency && !config.currencies.includes(currency)) return false;

    return true;
  }

  /** Execute payment initialization for a specific provider */
  private async executePaymentInit(
    config: PaymentProviderConfig,
    request: PaymentInitRequest
  ): Promise<PaymentInitResponse> {
    switch (config.provider) {
      case 'paystack':
        return this.initPaystack(config, request);
      case 'flutterwave':
        return this.initFlutterwave(config, request);
      case 'monnify':
        return this.initMonnify(config, request);
      default:
        throw new Error(`Unknown payment provider: ${config.provider}`);
    }
  }

  private async initPaystack(
    config: PaymentProviderConfig,
    request: PaymentInitRequest
  ): Promise<PaymentInitResponse> {
    const result = await initializePaystackPayment({
      secretKey: config.secretKey,
      email: request.email,
      amount: Math.round(request.amount * 100), // Convert to kobo
      reference: request.reference,
      callbackUrl: request.callbackUrl,
      metadata: {
        siteId: request.siteId,
        orderId: request.orderId,
        ...request.metadata,
      },
    });

    return {
      provider: 'paystack',
      checkoutUrl: result.authorization_url,
      reference: result.reference,
      accessCode: result.access_code,
    };
  }

  private async initFlutterwave(
    config: PaymentProviderConfig,
    request: PaymentInitRequest
  ): Promise<PaymentInitResponse> {
    const result = await initializeFlutterwavePayment({
      secretKey: config.secretKey,
      amount: request.amount,
      currency: request.currency,
      email: request.email,
      reference: request.reference,
      redirectUrl: request.redirectUrl,
      customerName: request.customerName,
      meta: {
        siteId: request.siteId,
        orderId: request.orderId,
        ...request.metadata,
      },
    });

    return {
      provider: 'flutterwave',
      checkoutUrl: result.link,
      reference: request.reference,
    };
  }

  private async initMonnify(
    config: PaymentProviderConfig,
    request: PaymentInitRequest
  ): Promise<PaymentInitResponse> {
    const baseUrl = config.baseUrl || 'https://api.monnify.com';

    // Get fresh access token
    const accessToken = await getMonnifyAccessToken(
      config.apiKey!,
      config.secretKey,
      baseUrl
    );

    const result = await initializeMonnifyPayment({
      accessToken,
      baseUrl,
      amount: request.amount,
      customerName: request.customerName,
      customerEmail: request.email,
      reference: request.reference,
      description: `Payment for order ${request.orderId}`,
      contractCode: config.contractCode!,
      redirectUrl: request.redirectUrl,
    });

    return {
      provider: 'monnify',
      checkoutUrl: result.checkoutUrl,
      reference: request.reference,
      externalRef: result.transactionReference,
    };
  }

  /** Create provider-specific health check function */
  private createHealthCheck(config: PaymentProviderConfig) {
    switch (config.provider) {
      case 'paystack':
        return paystackHealthCheck(config.secretKey);
      case 'flutterwave':
        return flutterwaveHealthCheck(config.secretKey);
      case 'monnify':
        return monnifyHealthCheck(
          config.apiKey!,
          config.secretKey,
          config.baseUrl || 'https://api.monnify.com'
        );
      default:
        return null;
    }
  }

  private emit(event: Parameters<FailoverEventHandler>[0]): void {
    if (this.onEvent) {
      try {
        const result = this.onEvent(event);
        if (result instanceof Promise) result.catch(() => {});
      } catch {}
    }
  }
}
