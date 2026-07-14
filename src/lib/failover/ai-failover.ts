/**
 * AfroStore Failover Engine — AI Provider Failover
 *
 * Automatic failover between AI providers (OpenAI, Anthropic, Google, Groq, DeepSeek).
 *
 * When a merchant's AI request fails on the primary provider,
 * the system seamlessly falls back to the next available provider.
 * The merchant never knows the switch happened.
 *
 * Features:
 * - Multi-provider support with unified API
 * - Circuit breaker per provider
 * - Health-check aware routing
 * - Capability matching (chat, embedding, vision, function calling)
 * - Model-level failover within a provider
 * - Rate limit aware (429 triggers immediate failover)
 * - Request/response normalization across providers
 * - Cost tracking per provider
 */

import type {
  AIProviderConfig,
  AIRequest,
  AIResponse,
  AIMessage,
  FailoverResult,
  FailoverEventHandler,
} from './types';
import { AICapability, ProviderHealth } from './types';
import { CircuitBreaker, CircuitOpenError } from './circuit-breaker';
import {
  HealthChecker,
  openaiHealthCheck,
  anthropicHealthCheck,
  googleHealthCheck,
  groqHealthCheck,
  deepseekHealthCheck,
} from './health-checker';

export interface AIFailoverConfig {
  /** Provider configurations */
  providers: AIProviderConfig[];
  /** Priority order (provider IDs). First = most preferred. */
  priorityOrder: string[];
  /** Circuit breaker settings */
  circuitBreaker?: {
    failureThreshold?: number;
    recoveryTimeoutMs?: number;
  };
  /** Health check interval in ms (0 = disabled) */
  healthCheckIntervalMs?: number;
  /** Default request timeout */
  requestTimeoutMs?: number;
  /** Event handler for monitoring */
  onEvent?: FailoverEventHandler;
}

/** Cost per 1M tokens (input/output) for tracking */
const COST_PER_MILLION: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  'claude-3-opus-20240229': { input: 15, output: 75 },
  'gemini-1.5-pro': { input: 1.25, output: 5 },
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
  'llama-3.1-70b-versatile': { input: 0.59, output: 0.79 },
  'deepseek-chat': { input: 0.14, output: 0.28 },
};

export class AIFailover {
  private readonly providers: Map<string, AIProviderConfig>;
  private readonly circuits: Map<string, CircuitBreaker>;
  private readonly healthChecker: HealthChecker;
  private readonly priorityOrder: string[];
  private readonly requestTimeoutMs: number;
  private readonly onEvent?: FailoverEventHandler;

  /** Usage tracking */
  private usage: Map<string, { requests: number; inputTokens: number; outputTokens: number; costUsd: number }>;

  constructor(config: AIFailoverConfig) {
    this.providers = new Map();
    this.circuits = new Map();
    this.priorityOrder = config.priorityOrder;
    this.requestTimeoutMs = config.requestTimeoutMs || 30_000;
    this.onEvent = config.onEvent;
    this.usage = new Map();

    for (const provider of config.providers) {
      this.providers.set(provider.provider, provider);
      this.circuits.set(
        provider.provider,
        new CircuitBreaker(provider.provider, {
          ...config.circuitBreaker,
          requestTimeoutMs: config.requestTimeoutMs || 30_000,
        }, config.onEvent)
      );
      this.usage.set(provider.provider, { requests: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 });
    }

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
   * Send a chat completion request with automatic failover.
   *
   * Provider order:
   * 1. Preferred provider (if specified and healthy)
   * 2. Priority-ordered by health and capability
   * 3. Any available as last resort
   */
  async chat(request: AIRequest): Promise<FailoverResult<AIResponse>> {
    return this.executeWithFailover(request);
  }

  /**
   * Convenience method for simple chat completion.
   */
  async complete(
    messages: AIMessage[],
    options: {
      model?: string;
      preferredProvider?: string;
      maxTokens?: number;
      temperature?: number;
      tools?: AIRequest['tools'];
    } = {}
  ): Promise<AIResponse> {
    const result = await this.chat({
      capability: AICapability.CHAT,
      messages,
      ...options,
    });

    if (!result.success || !result.data) {
      const errors = result.failedProviders.map((f) => `${f.provider}: ${f.error}`).join('; ');
      throw new Error(`All AI providers failed: ${errors}`);
    }

    return result.data;
  }

  /**
   * Simple text completion shorthand.
   */
  async ask(
    userMessage: string,
    systemPrompt?: string,
    options: { model?: string; preferredProvider?: string; maxTokens?: number } = {}
  ): Promise<string> {
    const messages: AIMessage[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userMessage });

    const response = await this.complete(messages, options);
    return response.content;
  }

  /** Start health checks */
  startHealthChecks(): void {
    this.healthChecker.start();
  }

  /** Stop health checks */
  stopHealthChecks(): void {
    this.healthChecker.stop();
  }

  /** Get provider status */
  getStatus(): Record<string, {
    health: ProviderHealth;
    circuitState: string;
    model: string;
    capabilities: AICapability[];
    usage: { requests: number; inputTokens: number; outputTokens: number; costUsd: number };
  }> {
    const status: Record<string, any> = {};
    for (const [id, config] of this.providers) {
      const circuit = this.circuits.get(id);
      status[id] = {
        health: this.healthChecker.getHealth(id),
        circuitState: circuit?.getState() || 'unknown',
        model: config.model,
        capabilities: config.capabilities,
        usage: this.usage.get(id) || { requests: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 },
      };
    }
    return status;
  }

  /** Get total cost across all providers */
  getTotalCost(): { totalUsd: number; byProvider: Record<string, number> } {
    let totalUsd = 0;
    const byProvider: Record<string, number> = {};
    for (const [id, data] of this.usage) {
      totalUsd += data.costUsd;
      byProvider[id] = data.costUsd;
    }
    return { totalUsd, byProvider };
  }

  /** Reset a provider's circuit breaker */
  resetCircuit(providerId: string): void {
    this.circuits.get(providerId)?.reset();
  }

  // ─── CORE FAILOVER LOGIC ─────────────────────────────

  private async executeWithFailover(
    request: AIRequest
  ): Promise<FailoverResult<AIResponse>> {
    const startTime = performance.now();
    const attemptedProviders: string[] = [];
    const failedProviders: Array<{ provider: string; error: string; latencyMs: number }> = [];

    const orderedProviders = this.getOrderedProviders(
      request.preferredProvider,
      request.capability
    );

    if (orderedProviders.length === 0) {
      return {
        success: false,
        provider: '',
        attemptedProviders: [],
        failedProviders: [{ provider: 'none', error: 'No compatible providers configured', latencyMs: 0 }],
        totalLatencyMs: Math.round(performance.now() - startTime),
        fallbackUsed: false,
      };
    }

    for (let i = 0; i < orderedProviders.length; i++) {
      const providerId = orderedProviders[i];
      const providerConfig = this.providers.get(providerId);
      const circuit = this.circuits.get(providerId);

      if (!providerConfig || !circuit) continue;

      // Try main model, then fallback models
      const models = [
        request.model || providerConfig.model,
        ...(providerConfig.fallbackModels || []),
      ];

      for (const model of models) {
        attemptedProviders.push(`${providerId}/${model}`);
        const attemptStart = performance.now();

        try {
          const response = await circuit.execute(async () => {
            return this.executeRequest(providerConfig, { ...request, model });
          });

          // Track usage
          this.trackUsage(providerId, model, response);

          this.emit({
            type: 'success',
            provider: providerId,
            latencyMs: Math.round(performance.now() - attemptStart),
            timestamp: Date.now(),
            metadata: { model, fallback: i > 0 },
          });

          return {
            success: true,
            data: response,
            provider: providerId,
            attemptedProviders,
            failedProviders,
            totalLatencyMs: Math.round(performance.now() - startTime),
            fallbackUsed: i > 0 || model !== (request.model || providerConfig.model),
          };
        } catch (error) {
          const latencyMs = Math.round(performance.now() - attemptStart);
          const errorMsg = error instanceof CircuitOpenError
            ? `Circuit open (retry after ${error.retryAfterMs}ms)`
            : (error as Error).message;

          failedProviders.push({
            provider: `${providerId}/${model}`,
            error: errorMsg,
            latencyMs,
          });

          // If rate limited (429), skip to next provider immediately
          if (this.isRateLimitError(error as Error)) {
            break; // Don't try fallback models on same provider
          }

          this.emit({
            type: 'fallback',
            provider: providerId,
            error: errorMsg,
            latencyMs,
            timestamp: Date.now(),
            metadata: { model },
          });
        }
      }
    }

    return {
      success: false,
      provider: '',
      attemptedProviders,
      failedProviders,
      totalLatencyMs: Math.round(performance.now() - startTime),
      fallbackUsed: attemptedProviders.length > 1,
    };
  }

  // ─── PROVIDER EXECUTION ──────────────────────────────

  private async executeRequest(
    config: AIProviderConfig,
    request: AIRequest
  ): Promise<AIResponse> {
    switch (config.provider) {
      case 'openai':
        return this.callOpenAI(config, request);
      case 'anthropic':
        return this.callAnthropic(config, request);
      case 'google':
        return this.callGoogle(config, request);
      case 'groq':
        return this.callGroq(config, request);
      case 'deepseek':
        return this.callDeepSeek(config, request);
      default:
        // Support numbered variants (e.g. groq_2, groq_3) that use the same API
        if (config.provider.startsWith('groq')) return this.callGroq(config, request);
        throw new Error(`Unknown AI provider: ${config.provider}`);
    }
  }

  /** OpenAI / OpenAI-compatible API call */
  private async callOpenAI(config: AIProviderConfig, request: AIRequest): Promise<AIResponse> {
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    const startTime = performance.now();

    const body: Record<string, unknown> = {
      model: request.model || config.model,
      messages: request.messages,
      max_tokens: request.maxTokens || config.maxTokens || 4096,
    };

    if (request.temperature !== undefined) body.temperature = request.temperature;
    if (request.tools && request.tools.length > 0) body.tools = request.tools;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      const err = new Error(`OpenAI ${response.status}: ${errorText}`);
      (err as any).status = response.status;
      throw err;
    }

    const data = await response.json() as any;
    const choice = data.choices?.[0];

    return {
      provider: config.provider,
      model: data.model,
      content: choice?.message?.content || '',
      toolCalls: choice?.message?.tool_calls,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      finishReason: choice?.finish_reason || 'unknown',
      latencyMs: Math.round(performance.now() - startTime),
    };
  }

  /** Anthropic Claude API call */
  private async callAnthropic(config: AIProviderConfig, request: AIRequest): Promise<AIResponse> {
    const startTime = performance.now();

    // Extract system message (Anthropic handles it separately)
    const systemMsg = request.messages?.find((m) => m.role === 'system');
    const nonSystemMessages = request.messages?.filter((m) => m.role !== 'system') || [];

    const body: Record<string, unknown> = {
      model: request.model || config.model,
      max_tokens: request.maxTokens || config.maxTokens || 4096,
      messages: nonSystemMessages.map((m) => ({
        role: m.role,
        content: Array.isArray(m.content)
          ? m.content.map((part) => {
              if (part.type === 'image_url') {
                // Anthropic uses a different format for images
                const url = part.image_url.url;
                if (url.startsWith('data:')) {
                  const match = url.match(/^data:(image\/[^;]+);base64,(.+)$/);
                  if (match) {
                    return { type: 'image' as const, source: { type: 'base64' as const, media_type: match[1], data: match[2] } };
                  }
                }
                return { type: 'image' as const, source: { type: 'url' as const, url } };
              }
              return part;
            })
          : m.content,
      })),
    };

    if (systemMsg) body.system = systemMsg.content;
    if (request.temperature !== undefined) body.temperature = request.temperature;

    if (request.tools && request.tools.length > 0) {
      body.tools = request.tools.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: t.function.parameters,
      }));
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      const err = new Error(`Anthropic ${response.status}: ${errorText}`);
      (err as any).status = response.status;
      throw err;
    }

    const data = await response.json() as any;

    // Extract text content
    const textContent = data.content
      ?.filter((c: any) => c.type === 'text')
      ?.map((c: any) => c.text)
      ?.join('') || '';

    // Extract tool calls
    const toolUseBlocks = data.content?.filter((c: any) => c.type === 'tool_use') || [];
    const toolCalls = toolUseBlocks.length > 0
      ? toolUseBlocks.map((t: any) => ({
          id: t.id,
          type: 'function' as const,
          function: { name: t.name, arguments: JSON.stringify(t.input) },
        }))
      : undefined;

    return {
      provider: config.provider,
      model: data.model,
      content: textContent,
      toolCalls,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      finishReason: data.stop_reason || 'unknown',
      latencyMs: Math.round(performance.now() - startTime),
    };
  }

  /** Google Gemini API call */
  private async callGoogle(config: AIProviderConfig, request: AIRequest): Promise<AIResponse> {
    const startTime = performance.now();
    const model = request.model || config.model;

    // Convert messages to Gemini format
    const systemMsg = request.messages?.find((m) => m.role === 'system');
    const contents = (request.messages || [])
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        maxOutputTokens: request.maxTokens || config.maxTokens || 4096,
        ...(request.temperature !== undefined && { temperature: request.temperature }),
      },
    };

    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${config.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      const err = new Error(`Google ${response.status}: ${errorText}`);
      (err as any).status = response.status;
      throw err;
    }

    const data = await response.json() as any;
    const candidate = data.candidates?.[0];
    const content = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';

    return {
      provider: config.provider,
      model,
      content,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
      finishReason: candidate?.finishReason || 'unknown',
      latencyMs: Math.round(performance.now() - startTime),
    };
  }

  /** Groq API call (OpenAI-compatible) */
  private async callGroq(config: AIProviderConfig, request: AIRequest): Promise<AIResponse> {
    const groqConfig = { ...config, baseUrl: 'https://api.groq.com/openai/v1' };
    const result = await this.callOpenAI(groqConfig, request);
    return { ...result, provider: 'groq' };
  }

  /** DeepSeek API call (OpenAI-compatible) */
  private async callDeepSeek(config: AIProviderConfig, request: AIRequest): Promise<AIResponse> {
    const dsConfig = { ...config, baseUrl: 'https://api.deepseek.com/v1' };
    const result = await this.callOpenAI(dsConfig, request);
    return { ...result, provider: 'deepseek' };
  }

  // ─── HELPERS ──────────────────────────────────────────

  private getOrderedProviders(
    preferred?: string,
    capability?: AICapability
  ): string[] {
    const ordered: string[] = [];
    const added = new Set<string>();

    // 1. Preferred provider
    if (preferred && this.hasCapability(preferred, capability)) {
      ordered.push(preferred);
      added.add(preferred);
    }

    // 2. Healthy providers in priority order
    for (const id of this.priorityOrder) {
      if (added.has(id)) continue;
      if (!this.hasCapability(id, capability)) continue;
      const health = this.healthChecker.getHealth(id);
      if (health === ProviderHealth.HEALTHY || health === ProviderHealth.UNKNOWN) {
        ordered.push(id);
        added.add(id);
      }
    }

    // 3. Degraded providers
    for (const id of this.priorityOrder) {
      if (added.has(id)) continue;
      if (!this.hasCapability(id, capability)) continue;
      const health = this.healthChecker.getHealth(id);
      if (health === ProviderHealth.DEGRADED) {
        ordered.push(id);
        added.add(id);
      }
    }

    // 4. Last resort
    for (const id of this.priorityOrder) {
      if (added.has(id)) continue;
      if (!this.hasCapability(id, capability)) continue;
      ordered.push(id);
    }

    return ordered;
  }

  private hasCapability(providerId: string, capability?: AICapability): boolean {
    if (!capability) return true;
    const config = this.providers.get(providerId);
    return config?.capabilities.includes(capability) ?? false;
  }

  private isRateLimitError(error: Error): boolean {
    return (error as any).status === 429 || error.message.includes('429') || error.message.toLowerCase().includes('rate limit');
  }

  private trackUsage(providerId: string, model: string, response: AIResponse): void {
    const usage = this.usage.get(providerId);
    if (!usage) return;

    usage.requests++;
    usage.inputTokens += response.usage.promptTokens;
    usage.outputTokens += response.usage.completionTokens;

    const cost = COST_PER_MILLION[model];
    if (cost) {
      usage.costUsd += (response.usage.promptTokens * cost.input + response.usage.completionTokens * cost.output) / 1_000_000;
    }
  }

  private createHealthCheck(config: AIProviderConfig) {
    switch (config.provider) {
      case 'openai': return openaiHealthCheck(config.apiKey, config.baseUrl);
      case 'anthropic': return anthropicHealthCheck(config.apiKey);
      case 'google': return googleHealthCheck(config.apiKey);
      case 'groq': return groqHealthCheck(config.apiKey);
      case 'deepseek': return deepseekHealthCheck(config.apiKey);
      default:
        if (config.provider.startsWith('groq')) return groqHealthCheck(config.apiKey);
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
