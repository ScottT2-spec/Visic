/**
 * MCP-Powered AI Service
 *
 * This replaces the basic chat-only AI service with one that has
 * full tool-calling capabilities. The AI can now:
 *
 * 1. Read store data (products, orders, customers, analytics...)
 * 2. Create/update/delete anything in the merchant dashboard
 * 3. Navigate the merchant to pre-filled forms for verification
 * 4. Ask follow-up questions before taking action
 *
 * Architecture:
 * - AI sends a message → we check for tool calls
 * - If tool calls exist → execute them → feed results back to AI
 * - AI generates final response incorporating tool results
 * - If any tool returned a "verify" action → include navigation data in response
 *
 * The tool calling loop runs up to 5 iterations to handle multi-step operations
 * (e.g., "list categories then create a product in the Electronics category").
 */

import { prisma } from "@/lib/db";
import { AIFailover } from "@/lib/failover";
import type { AIProviderConfig, AIMessage, AITool, AIToolCall } from "@/lib/failover/types";
import { AICapability } from "@/lib/failover";
import { RAGService } from "@/lib/rag";
import { getAllAITools } from "@/lib/mcp/registry";
import { executeToolCalls } from "@/lib/mcp/executor";
import type { MCPContext, MCPToolResult, MCPAIResponse } from "@/lib/mcp/types";

// ─── Singletons ─────────────────────────────────────────────

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
      capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING, AICapability.VISION, AICapability.STREAMING],
    });
  }
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      provider: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-5-sonnet-20241022",
      fallbackModels: ["claude-3-haiku-20240307"],
      capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING, AICapability.VISION],
    });
  }
  if (process.env.GOOGLE_AI_KEY) {
    providers.push({
      provider: "google",
      apiKey: process.env.GOOGLE_AI_KEY,
      model: "gemini-1.5-pro",
      fallbackModels: ["gemini-1.5-flash"],
      capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING, AICapability.VISION],
    });
  }
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

function getAI(): AIFailover {
  if (!aiFailover) {
    const providers = getAIProviders();
    if (providers.length === 0) {
      throw new Error("No AI providers configured. Set at least one API key.");
    }
    aiFailover = new AIFailover({
      providers,
      priorityOrder: ["openai", "anthropic", "google", "groq", "groq_2", "groq_3", "groq_4", "deepseek"],
      circuitBreaker: { failureThreshold: 3, recoveryTimeoutMs: 30_000 },
      healthCheckIntervalMs: 60_000,
      requestTimeoutMs: 60_000, // Longer timeout for tool calling
    });
    aiFailover.startHealthChecks();
  }
  return aiFailover;
}

function getRAG(): RAGService {
  if (!ragService) {
    ragService = RAGService.create(prisma);
  }
  return ragService;
}

// ─── System Prompt ──────────────────────────────────────────

function buildMCPSystemPrompt(storeName: string, storeContext: string): string {
  return `You are the AI Commerce Co-Founder for "${storeName}" on AfroStore — the ecommerce platform built for African businesses.

## YOUR ROLE
You are a hands-on business partner. You don't just give advice — you take action. You can:
- View and manage products, orders, customers, categories
- Create coupons, flash sales, delivery zones
- Set up loyalty programs, referral systems
- Configure store settings, themes, plugins, payment gateways
- Analyze sales data, customer behavior, conversion funnels
- Manage team members, reviews, contact messages
- Create and manage store pages

## HOW TO WORK
1. **Before any action, gather information.** Don't create a product without asking what it is. Don't create a coupon without understanding the goal.
2. **Ask follow-up questions.** Be conversational. "What's the product name? What should I price it at? Want me to write a description?"
3. **Use your tools.** When the merchant wants something done, use the appropriate tool. Don't just describe what they should do — do it for them.
4. **When creating or updating things,** the merchant will be taken to a pre-filled form to review, add images, and save. Explain this to them.
5. **Read data before writing.** Before creating a product, check categories. Before creating a coupon, check existing ones. Context makes better decisions.

## CONVERSATION STYLE
- Be warm, direct, and action-oriented
- Use the store's currency (${storeContext.includes("Currency:") ? "" : "check context"})
- Reference African market context (Ghana, Kenya, Nigeria, etc.)
- Give specific, actionable advice — not generic platitudes
- When generating descriptions/copy, make them conversion-focused and mobile-optimized
- Never use placeholder brackets [like this] — write real content
- Suggest strategies: "Your fashion store should run a flash sale before Sallah" not just "consider promotions"

## IMPORTANT RULES
- ALWAYS call list_ tools before suggesting IDs (list_products before creating a related item, list_categories before assigning one)
- For creates/updates: the tool will navigate the merchant to the form. Tell them what to expect.
- For deletes: ALWAYS confirm with the merchant before executing
- Never guess product IDs or category IDs — look them up first
- If a tool returns an error, explain it clearly and suggest alternatives
- If you need to do multiple things, do them step by step with the merchant

## STORE CONTEXT
${storeContext}`;
}

// ─── Main Chat Function ─────────────────────────────────────

export interface MCPChatRequest {
  siteId: string;
  userId: string;
  message: string;
  images?: string[];
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Main entry point for the MCP-powered AI assistant.
 *
 * This handles the full tool-calling loop:
 * 1. Build context (store data + RAG)
 * 2. Send to AI with all tool definitions
 * 3. If AI calls tools → execute them → feed results back
 * 4. Repeat until AI gives a final text response (max 5 iterations)
 * 5. Extract any verification actions for the frontend
 */
export async function mcpChat(req: MCPChatRequest): Promise<MCPAIResponse> {
  const ai = getAI();

  // 1. Fetch store context
  const store = await prisma.site.findUnique({
    where: { id: req.siteId },
    include: {
      workspace: { select: { plan: true } },
      _count: { select: { products: true, orders: true, customers: true } },
    },
  });

  if (!store) throw new Error("Store not found");

  let storeContext = `Store: ${store.name}
Slug: ${store.slug}
Business type: ${store.businessType || "general"}
Country: ${store.country || "NG"}
Currency: ${store.currency || "GHS"}
Plan: ${store.workspace.plan}
Products: ${store._count.products}
Orders: ${store._count.orders}
Customers: ${store._count.customers}`;

  // 2. RAG retrieval
  let ragInfo: MCPAIResponse["ragContext"];
  try {
    const rag = getRAG();
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
  } catch {
    // RAG not available — continue without it
  }

  // 3. Build MCP context for tool execution
  const mcpContext: MCPContext = {
    siteId: req.siteId,
    userId: req.userId,
    currency: store.currency || "GHS",
    country: store.country || "NG",
    storeName: store.name,
    storeSlug: store.slug,
  };

  // 4. Build messages
  const messages: AIMessage[] = [
    { role: "system", content: buildMCPSystemPrompt(store.name, storeContext) },
  ];

  // Add conversation history
  if (req.conversationHistory) {
    for (const msg of req.conversationHistory.slice(-10)) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  // Add current message
  if (req.images && req.images.length > 0) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: req.message },
        ...req.images.slice(0, 4).map((img) => ({
          type: "image_url" as const,
          image_url: { url: img, detail: "auto" as const },
        })),
      ],
    });
  } else {
    messages.push({ role: "user", content: req.message });
  }

  // 5. Get all MCP tools for function calling
  const tools: AITool[] = getAllAITools();

  // 6. Tool calling loop (max 5 iterations)
  let lastResponse: {
    content: string;
    provider: string;
    model: string;
    usage: { promptTokens: number; completionTokens: number; totalTokens: number };
    toolCalls?: AIToolCall[];
  } | null = null;

  const allToolResults: Array<{ name: string; result: MCPToolResult }> = [];
  let verification: MCPAIResponse["verification"] | undefined;
  let totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  for (let iteration = 0; iteration < 5; iteration++) {
    // Call AI with tools
    const result = await ai.chat({
      capability: req.images?.length ? AICapability.VISION : AICapability.FUNCTION_CALLING,
      messages,
      tools: iteration < 4 ? tools : undefined, // Don't send tools on last iteration to force text response
      maxTokens: 4096,
      temperature: 0.7,
    });

    if (!result.success || !result.data) {
      const errors = result.failedProviders.map((f) => `${f.provider}: ${f.error}`).join("; ");
      throw new Error(`AI request failed: ${errors}`);
    }

    const response = result.data;
    totalUsage.promptTokens += response.usage.promptTokens;
    totalUsage.completionTokens += response.usage.completionTokens;
    totalUsage.totalTokens += response.usage.totalTokens;

    lastResponse = response;

    // If no tool calls, we're done — AI gave a text response
    if (!response.toolCalls || response.toolCalls.length === 0) {
      break;
    }

    // Execute tool calls
    const toolCalls = response.toolCalls.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
    }));

    const toolResults = await executeToolCalls(toolCalls, mcpContext);

    // Add assistant message with tool calls to conversation
    messages.push({
      role: "assistant",
      content: response.content || "",
      toolCalls: response.toolCalls,
    });

    // Add tool results to conversation
    for (const tr of toolResults) {
      allToolResults.push({ name: tr.toolName, result: tr.result });

      messages.push({
        role: "tool",
        content: JSON.stringify(tr.result),
        toolCallId: tr.callId,
      });

      // Check for verification action
      if (tr.result.action === "verify" && tr.result.navigateTo && tr.result.prefill) {
        verification = {
          navigateTo: `/dashboard/${tr.result.navigateTo}`,
          prefill: tr.result.prefill,
          summary: tr.result.message,
        };
      }
    }

    // If we got a verification, let the AI generate one more response
    // acknowledging the action, then break
    if (verification) {
      // One more AI call to get a nice response about the verification
      const verifyResult = await ai.chat({
        capability: AICapability.CHAT,
        messages,
        maxTokens: 1000,
        temperature: 0.7,
      });

      if (verifyResult.success && verifyResult.data) {
        lastResponse = verifyResult.data;
        totalUsage.promptTokens += verifyResult.data.usage.promptTokens;
        totalUsage.completionTokens += verifyResult.data.usage.completionTokens;
        totalUsage.totalTokens += verifyResult.data.usage.totalTokens;
      }
      break;
    }
  }

  if (!lastResponse) {
    throw new Error("AI failed to produce a response");
  }

  return {
    content: lastResponse.content || "I've completed the requested action.",
    provider: lastResponse.provider,
    model: lastResponse.model,
    usage: totalUsage,
    ragContext: ragInfo,
    verification,
    toolsUsed: allToolResults.length > 0
      ? allToolResults.map((tr) => ({ name: tr.name, result: tr.result }))
      : undefined,
  };
}

/**
 * Get AI/MCP status info.
 */
export function getMCPStatus() {
  try {
    const ai = getAI();
    const { getToolCount, getToolSummary } = require("@/lib/mcp/registry");
    return {
      available: true,
      providers: ai.getStatus(),
      cost: ai.getTotalCost(),
      tools: {
        total: getToolCount(),
        byCategory: getToolSummary(),
      },
    };
  } catch {
    return { available: false, error: "No AI providers configured" };
  }
}
