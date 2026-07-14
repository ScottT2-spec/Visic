/**
 * AfroStore Failover Engine — Type Definitions
 *
 * Shared types for payment gateway and AI provider failover.
 */

// ─── CORE FAILOVER TYPES ────────────────────────────────────

/** Health status of a provider */
export enum ProviderHealth {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

/** Result of a health check */
export interface HealthCheckResult {
  provider: string;
  healthy: boolean;
  latencyMs: number;
  statusCode?: number;
  error?: string;
  checkedAt: number;
}

/** Circuit breaker states */
export enum CircuitState {
  CLOSED = 'closed',       // Normal — requests flow through
  OPEN = 'open',           // Tripped — requests rejected, using fallback
  HALF_OPEN = 'half_open', // Testing — limited requests to check recovery
}

/** Circuit breaker configuration */
export interface CircuitBreakerConfig {
  /** Failures before tripping to OPEN */
  failureThreshold: number;
  /** Time in ms before transitioning OPEN → HALF_OPEN */
  recoveryTimeoutMs: number;
  /** Successful requests in HALF_OPEN before returning to CLOSED */
  halfOpenSuccessThreshold: number;
  /** Time window for counting failures (sliding window) */
  failureWindowMs: number;
  /** Timeout for individual requests */
  requestTimeoutMs: number;
}

/** Provider priority and configuration */
export interface ProviderEntry<TConfig = Record<string, unknown>> {
  /** Unique provider identifier */
  id: string;
  /** Display name */
  name: string;
  /** Priority (lower = preferred). Ties broken by health. */
  priority: number;
  /** Whether this provider is enabled */
  enabled: boolean;
  /** Provider-specific configuration */
  config: TConfig;
  /** Circuit breaker state (managed internally) */
  circuit?: CircuitBreakerState;
}

/** Internal circuit breaker state tracking */
export interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureAt: number;
  lastSuccessAt: number;
  lastStateChangeAt: number;
  /** Timestamps of recent failures for sliding window */
  recentFailures: number[];
}

/** Failover attempt result */
export interface FailoverResult<T> {
  success: boolean;
  data?: T;
  provider: string;
  attemptedProviders: string[];
  failedProviders: Array<{ provider: string; error: string; latencyMs: number }>;
  totalLatencyMs: number;
  fallbackUsed: boolean;
}

/** Failover event for logging/monitoring */
export interface FailoverEvent {
  type: 'attempt' | 'success' | 'failure' | 'circuit_open' | 'circuit_close' | 'circuit_half_open' | 'fallback';
  provider: string;
  error?: string;
  latencyMs?: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export type FailoverEventHandler = (event: FailoverEvent) => void | Promise<void>;

// ─── PAYMENT FAILOVER TYPES ────────────────────────────────

export interface PaymentProviderConfig {
  provider: 'paystack' | 'flutterwave' | 'monnify';
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
  /** Monnify-specific */
  apiKey?: string;
  contractCode?: string;
  baseUrl?: string;
  /** Supported payment methods */
  methods: PaymentMethod[];
  /** Supported currencies */
  currencies: string[];
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  USSD = 'ussd',
  MOBILE_MONEY = 'mobile_money',
  PAY_ON_DELIVERY = 'pay_on_delivery',
}

export interface PaymentInitRequest {
  siteId: string;
  orderId: string;
  amount: number;
  currency: string;
  email: string;
  customerName: string;
  reference: string;
  redirectUrl: string;
  callbackUrl: string;
  preferredMethod?: PaymentMethod;
  preferredProvider?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentInitResponse {
  provider: string;
  checkoutUrl: string;
  reference: string;
  externalRef?: string;
  accessCode?: string;
}

// ─── AI PROVIDER FAILOVER TYPES ─────────────────────────────

export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'groq' | 'deepseek' | 'cohere' | string;
  apiKey: string;
  baseUrl?: string;
  /** Default model for this provider */
  model: string;
  /** Fallback models (tried in order if default fails) */
  fallbackModels?: string[];
  /** Max tokens per request */
  maxTokens?: number;
  /** Requests per minute limit */
  rateLimitRpm?: number;
  /** Supported capabilities */
  capabilities: AICapability[];
}

export enum AICapability {
  CHAT = 'chat',
  COMPLETION = 'completion',
  EMBEDDING = 'embedding',
  IMAGE_GENERATION = 'image_generation',
  FUNCTION_CALLING = 'function_calling',
  VISION = 'vision',
  STREAMING = 'streaming',
}

export interface AIRequest {
  /** Required capability */
  capability: AICapability;
  /** Messages for chat */
  messages?: AIMessage[];
  /** Prompt for completion */
  prompt?: string;
  /** Model override (optional) */
  model?: string;
  /** Preferred provider (optional) */
  preferredProvider?: string;
  /** Max tokens for response */
  maxTokens?: number;
  /** Temperature */
  temperature?: number;
  /** Function/tool definitions */
  tools?: AITool[];
  /** Whether to stream */
  stream?: boolean;
  /** Request timeout override */
  timeoutMs?: number;
}

export type AIMessageContent = string | Array<
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } }
>;

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: AIMessageContent;
  name?: string;
  toolCallId?: string;
  toolCalls?: AIToolCall[];
}

export interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AIResponse {
  provider: string;
  model: string;
  content: string;
  toolCalls?: AIToolCall[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  latencyMs: number;
}
