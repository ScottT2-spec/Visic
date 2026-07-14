/**
 * AfroStore AI Service
 *
 * Connects the AI Failover engine + RAG retrieval to power
 * the "Commerce Co-Founder" assistant for each store.
 *
 * This is the single integration point — the API route calls this,
 * and this coordinates RAG context retrieval + AI completion.
 */

import { prisma } from "@/lib/db";
import { AIFailover } from "@/lib/failover";
import type { AIProviderConfig } from "@/lib/failover";
import { AICapability } from "@/lib/failover";
import { RAGService } from "@/lib/rag";

// ─── Singleton instances ────────────────────────────────

let aiFailover: AIFailover | null = null;
let ragService: RAGService | null = null;

function getAIProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [];

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o",
      fallbackModels: ["gpt-4o-mini"],
      capabilities: [
        AICapability.CHAT,
        AICapability.FUNCTION_CALLING,
        AICapability.VISION,
        AICapability.STREAMING,
      ],
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      provider: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-5-sonnet-20241022",
      fallbackModels: ["claude-3-haiku-20240307"],
      capabilities: [
        AICapability.CHAT,
        AICapability.FUNCTION_CALLING,
        AICapability.VISION,
      ],
    });
  }

  if (process.env.GOOGLE_AI_KEY) {
    providers.push({
      provider: "google",
      apiKey: process.env.GOOGLE_AI_KEY,
      model: "gemini-1.5-pro",
      fallbackModels: ["gemini-1.5-flash"],
      capabilities: [
        AICapability.CHAT,
        AICapability.FUNCTION_CALLING,
        AICapability.VISION,
      ],
    });
  }

  // Register all available Groq keys as separate providers for rate-limit failover
  const groqKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_KEY_2,
    process.env.GROQ_KEY_3,
    process.env.GROQ_KEY_4,
  ].filter(Boolean) as string[];

  groqKeys.forEach((key, i) => {
    providers.push({
      provider: i === 0 ? "groq" : `groq_${i + 1}`,
      apiKey: key,
      model: "llama-3.3-70b-versatile",
      capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING],
    });
  });

  if (process.env.DEEPSEEK_API_KEY) {
    providers.push({
      provider: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: "deepseek-chat",
      capabilities: [AICapability.CHAT],
    });
  }

  return providers;
}

function getAIFailover(): AIFailover {
  if (!aiFailover) {
    const providers = getAIProviders();
    if (providers.length === 0) {
      throw new Error("No AI providers configured. Set at least one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_KEY, GROQ_API_KEY, DEEPSEEK_API_KEY");
    }

    aiFailover = new AIFailover({
      providers,
      priorityOrder: ["openai", "anthropic", "google", "groq", "groq_2", "groq_3", "groq_4", "deepseek"],
      circuitBreaker: {
        failureThreshold: 3,
        recoveryTimeoutMs: 30_000,
      },
      healthCheckIntervalMs: 60_000,
      requestTimeoutMs: 45_000,
    });

    aiFailover.startHealthChecks();
  }
  return aiFailover;
}

function getRAGService(): RAGService {
  if (!ragService) {
    ragService = RAGService.create(prisma);
  }
  return ragService;
}

// ─── System prompt ──────────────────────────────────────

function buildSystemPrompt(storeName: string, storeContext?: string): string {
  let prompt = `You are the AI Commerce Co-Founder for "${storeName}" on AfroStore — the ecommerce platform built for African businesses.

Your role:
- Help the merchant grow their business
- Give actionable, specific advice (not generic platitudes)
- Generate copy, descriptions, and marketing content when asked
- Analyze data and suggest improvements
- Be conversational, warm, and direct — like a smart business partner

Guidelines:
- Always tailor advice to the African market context (Nigeria, Ghana, Kenya, etc.)
- Reference local payment methods (Monnify, Paystack, Flutterwave), WhatsApp selling, bank transfers, etc.
- Use the local currency when discussing prices
- Be specific — "add trust badges above your checkout button" not "improve your website"
- When generating product descriptions, make them conversion-focused and mobile-optimized
- If asked to create content, provide it ready to use — don't give templates with [brackets]

You have access to the store's data (products, orders, customers, analytics). Use it to give personalized advice.`;

  if (storeContext) {
    prompt += `\n\nHere is current context about the store:\n${storeContext}`;
  }

  return prompt;
}

// ─── Public API ─────────────────────────────────────────

export interface AIChatRequest {
  siteId: string;
  message: string;
  images?: string[]; // base64 data URLs or public URLs
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface AIChatResponse {
  content: string;
  provider: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  ragContext?: {
    sourcesUsed: number;
    documentTypes: string[];
  };
}

/**
 * Main entry point for the AI assistant.
 * 1. Fetches store context from DB
 * 2. Retrieves relevant RAG context based on the user's message
 * 3. Sends everything to the AI provider with failover
 */
export async function chatWithAI(req: AIChatRequest): Promise<AIChatResponse> {
  const ai = getAIFailover();

  // 1. Get basic store context from DB
  const store = await prisma.site.findUnique({
    where: { id: req.siteId },
    select: {
      name: true,
      currency: true,
      country: true,
      businessType: true,
      _count: {
        select: {
          products: true,
          orders: true,
          customers: true,
        },
      },
    },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  // Quick store summary for the system prompt
  let storeContext = `Store: ${store.name}
Business type: ${store.businessType || "general"}
Country: ${store.country || "NG"}
Currency: ${store.currency || "NGN"}
Products: ${store._count.products}
Orders: ${store._count.orders}
Customers: ${store._count.customers}`;

  // 2. Try RAG retrieval for richer context
  let ragInfo: AIChatResponse["ragContext"] | undefined;
  try {
    const rag = getRAGService();
    const context = await rag.retrieveContext(req.message, req.siteId, {
      documentTypes: ["product", "order", "customer", "analytics_summary", "page", "category"],
      limit: 10,
      maxTokens: 2000,
    });

    if (context.context && context.sources.length > 0) {
      storeContext += `\n\nRelevant store data:\n${context.context}`;
      ragInfo = {
        sourcesUsed: context.sources.length,
        documentTypes: [...new Set(context.sources.map((s) => s.documentType))],
      };
    }
  } catch (err) {
    // RAG not available (no pgvector, tables not created, etc.) — continue without it
    console.warn("RAG retrieval skipped:", (err as Error).message);
  }

  // 3. Build messages
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } }> }> = [
    { role: "system", content: buildSystemPrompt(store.name, storeContext) },
  ];

  // Add conversation history (last 10 messages max)
  if (req.conversationHistory) {
    const recent = req.conversationHistory.slice(-10);
    for (const msg of recent) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  // Add current message (with images if provided)
  if (req.images && req.images.length > 0) {
    const contentParts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } }> = [
      { type: "text", text: req.message },
    ];
    for (const img of req.images.slice(0, 4)) { // max 4 images
      contentParts.push({
        type: "image_url",
        image_url: { url: img, detail: "auto" },
      });
    }
    messages.push({ role: "user", content: contentParts });
  } else {
    messages.push({ role: "user", content: req.message });
  }

  // 4. Call AI with failover
  const result = await ai.chat({
    capability: req.images?.length ? AICapability.VISION : AICapability.CHAT,
    messages,
    maxTokens: 2000,
    temperature: 0.7,
  });

  if (!result.success || !result.data) {
    const errors = result.failedProviders.map((f) => `${f.provider}: ${f.error}`).join("; ");
    throw new Error(`AI request failed: ${errors}`);
  }

  return {
    content: result.data.content,
    provider: result.data.provider,
    model: result.data.model,
    usage: result.data.usage,
    ragContext: ragInfo,
  };
}

/**
 * Get AI provider status (for admin/debugging).
 */
export function getAIStatus() {
  try {
    const ai = getAIFailover();
    return {
      available: true,
      providers: ai.getStatus(),
      cost: ai.getTotalCost(),
    };
  } catch {
    return {
      available: false,
      error: "No AI providers configured",
    };
  }
}

/**
 * Index store data into RAG for better AI context.
 */
export async function indexStoreData(siteId: string) {
  const rag = getRAGService();

  // Index products
  const products = await prisma.product.findMany({
    where: { siteId, status: "ACTIVE" },
    include: { category: true, images: { take: 1 } },
  });

  if (products.length > 0) {
    await rag.indexBatch(
      "product",
      products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        price: Number(p.price),
        currency: p.currency,
        stock: p.stock,
        category: p.category?.name || "",
        tags: p.tags,
        status: p.status,
      })),
      siteId
    );
  }

  // Index categories
  const categories = await prisma.category.findMany({
    where: { siteId },
    include: { _count: { select: { products: true } } },
  });

  if (categories.length > 0) {
    await rag.indexBatch(
      "category",
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description || "",
        productCount: c._count.products,
      })),
      siteId
    );
  }

  return { productsIndexed: products.length, categoriesIndexed: categories.length };
}
