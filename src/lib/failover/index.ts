/**
 * AfroStore Failover Engine — Public API
 *
 * Two failover systems:
 * 1. PaymentFailover — auto-failover between Paystack, Flutterwave, Monnify
 * 2. AIFailover — auto-failover between OpenAI, Anthropic, Google, Groq, DeepSeek
 *
 * Both share:
 * - Circuit breakers (prevents cascading failures)
 * - Health checks (periodic provider monitoring)
 * - Priority-based routing (preferred → healthy → degraded → last resort)
 * - Event system (monitoring/alerting hooks)
 *
 * Usage:
 *
 *   // Payment failover
 *   import { PaymentFailover } from '@/lib/failover';
 *
 *   const payments = new PaymentFailover({
 *     providers: [
 *       {
 *         provider: 'paystack',
 *         publicKey: process.env.PAYSTACK_PUBLIC_KEY!,
 *         secretKey: process.env.PAYSTACK_SECRET_KEY!,
 *         methods: ['card', 'bank_transfer', 'ussd'],
 *         currencies: ['GHS'],
 *       },
 *       {
 *         provider: 'flutterwave',
 *         publicKey: process.env.FLW_PUBLIC_KEY!,
 *         secretKey: process.env.FLW_SECRET_KEY!,
 *         methods: ['card', 'bank_transfer', 'mobile_money', 'ussd'],
 *         currencies: ['GHS', 'GHS', 'KES', 'ZAR', 'USD'],
 *       },
 *       {
 *         provider: 'monnify',
 *         publicKey: '',
 *         secretKey: process.env.MONNIFY_SECRET_KEY!,
 *         apiKey: process.env.MONNIFY_API_KEY!,
 *         contractCode: process.env.MONNIFY_CONTRACT_CODE!,
 *         methods: ['card', 'bank_transfer', 'ussd'],
 *         currencies: ['GHS'],
 *       },
 *     ],
 *     priorityOrder: ['paystack', 'monnify', 'flutterwave'],
 *   });
 *
 *   payments.startHealthChecks();
 *
 *   const result = await payments.initializePayment({
 *     siteId: 'store_123',
 *     orderId: 'order_456',
 *     amount: 25000,
 *     currency: 'GHS',
 *     email: 'customer@example.com',
 *     customerName: 'Amara Okafor',
 *     reference: 'AF-10042',
 *     redirectUrl: 'https://mystore.com/checkout/success',
 *     callbackUrl: 'https://api.mystore.com/webhooks/payment',
 *   });
 *
 *   if (result.success) {
 *     redirect(result.data.checkoutUrl);
 *   }
 *
 *
 *   // AI failover
 *   import { AIFailover } from '@/lib/failover';
 *
 *   const ai = new AIFailover({
 *     providers: [
 *       {
 *         provider: 'openai',
 *         apiKey: process.env.OPENAI_API_KEY!,
 *         model: 'gpt-4o',
 *         fallbackModels: ['gpt-4o-mini'],
 *         capabilities: ['chat', 'function_calling', 'vision', 'streaming'],
 *       },
 *       {
 *         provider: 'anthropic',
 *         apiKey: process.env.ANTHROPIC_API_KEY!,
 *         model: 'claude-3-5-sonnet-20241022',
 *         fallbackModels: ['claude-3-haiku-20240307'],
 *         capabilities: ['chat', 'function_calling', 'vision'],
 *       },
 *       {
 *         provider: 'google',
 *         apiKey: process.env.GOOGLE_AI_KEY!,
 *         model: 'gemini-1.5-pro',
 *         fallbackModels: ['gemini-1.5-flash'],
 *         capabilities: ['chat', 'function_calling', 'vision'],
 *       },
 *       {
 *         provider: 'groq',
 *         apiKey: process.env.GROQ_API_KEY!,
 *         model: 'llama-3.1-70b-versatile',
 *         capabilities: ['chat', 'function_calling'],
 *       },
 *     ],
 *     priorityOrder: ['openai', 'anthropic', 'google', 'groq'],
 *   });
 *
 *   ai.startHealthChecks();
 *
 *   // Simple usage
 *   const answer = await ai.ask(
 *     'Why are my customers not buying?',
 *     'You are an ecommerce AI assistant for an African business.'
 *   );
 *
 *   // Advanced usage with tool calling
 *   const response = await ai.complete([
 *     { role: 'system', content: 'You are AfroStore AI.' },
 *     { role: 'user', content: 'Generate a product description for ankara fabric' },
 *   ], {
 *     maxTokens: 500,
 *     temperature: 0.7,
 *   });
 */

// Core
export { CircuitBreaker, CircuitOpenError } from './circuit-breaker';
export { HealthChecker } from './health-checker';
export {
  paystackHealthCheck,
  flutterwaveHealthCheck,
  monnifyHealthCheck,
  openaiHealthCheck,
  anthropicHealthCheck,
  googleHealthCheck,
  groqHealthCheck,
  deepseekHealthCheck,
} from './health-checker';

// Payment failover
export { PaymentFailover, type PaymentFailoverConfig } from './payment-failover';

// AI failover
export { AIFailover, type AIFailoverConfig } from './ai-failover';

// Types
export {
  ProviderHealth,
  CircuitState,
  PaymentMethod,
  AICapability,
  type HealthCheckResult,
  type CircuitBreakerConfig,
  type FailoverResult,
  type FailoverEvent,
  type FailoverEventHandler,
  type PaymentProviderConfig,
  type PaymentInitRequest,
  type PaymentInitResponse,
  type AIProviderConfig,
  type AIRequest,
  type AIResponse,
  type AIMessage,
  type AITool,
  type AIToolCall,
} from './types';
