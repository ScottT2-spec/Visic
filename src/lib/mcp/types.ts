/**
 * AfroStore MCP — Type Definitions
 *
 * The brain of the merchant AI assistant. Every type, every interface,
 * every contract the MCP system uses.
 */

import type { AITool } from "@/lib/failover/types";

// ─── TOOL RESULT TYPES ──────────────────────────────────────

/**
 * When a tool executes, it returns one of these action types:
 *
 * - "data"     → Pure data response (read operations, analytics, etc.)
 * - "verify"   → Requires merchant verification before saving (create/update ops)
 * - "done"     → Write operation completed (no verification needed, e.g. delete, toggle)
 * - "error"    → Something went wrong
 * - "clarify"  → AI needs more info from the merchant
 */
export type MCPActionType = "data" | "verify" | "done" | "error" | "clarify";

/**
 * Navigation targets for verification flows.
 * Maps to actual dashboard routes.
 */
export type VerifyTarget =
  | "products/new"
  | `products/${string}/edit`
  | "categories"
  | "coupons"
  | "flash-sales"
  | "delivery"
  | "orders"
  | "customers"
  | "settings"
  | "pages"
  | "themes"
  | "plugins"
  | "payments"
  | "loyalty"
  | "referrals"
  | "team"
  | "reviews"
  | "messages"
  | "abandoned-carts"
  | "new-store"
  | "domains"
  | "billing"
  | "analytics"
  | "ai";

/**
 * The result of executing an MCP tool.
 */
export interface MCPToolResult {
  /** What kind of result this is */
  action: MCPActionType;

  /** Human-readable message for the AI to relay to the merchant */
  message: string;

  /** The data payload (query results, created entity, etc.) */
  data?: Record<string, unknown>;

  /** For "verify" actions: where to navigate the merchant */
  navigateTo?: VerifyTarget;

  /** For "verify" actions: pre-fill data for the form */
  prefill?: Record<string, unknown>;

  /** For "clarify" actions: what questions to ask */
  questions?: string[];

  /** For "error" actions: error details */
  errorCode?: string;
}

// ─── TOOL DEFINITION ────────────────────────────────────────

/**
 * A single MCP tool definition.
 */
export interface MCPToolDef {
  /** Tool name (snake_case, e.g. "create_product") */
  name: string;

  /** Human-readable description for the AI */
  description: string;

  /** Category for organization */
  category: MCPCategory;

  /** JSON Schema for parameters */
  parameters: Record<string, unknown>;

  /** Whether this tool modifies data (vs read-only) */
  mutates: boolean;

  /** Whether this tool requires merchant verification before saving */
  requiresVerification: boolean;

  /** The execute function */
  execute: (params: Record<string, unknown>, context: MCPContext) => Promise<MCPToolResult>;
}

/**
 * Tool categories for organization.
 */
export type MCPCategory =
  | "store"
  | "products"
  | "categories"
  | "orders"
  | "customers"
  | "coupons"
  | "flash_sales"
  | "delivery"
  | "pages"
  | "themes"
  | "plugins"
  | "settings"
  | "analytics"
  | "reviews"
  | "loyalty"
  | "referrals"
  | "team"
  | "messages"
  | "payments"
  | "abandoned_carts";

/**
 * Execution context passed to every tool.
 */
export interface MCPContext {
  /** The store this request is for */
  siteId: string;

  /** The authenticated user making the request */
  userId: string;

  /** The store's currency (for display) */
  currency: string;

  /** The store's country */
  country: string;

  /** The store name */
  storeName: string;

  /** The store slug */
  storeSlug: string;
}

// ─── AI INTEGRATION TYPES ───────────────────────────────────

/**
 * Extended AI response that includes tool call results.
 */
export interface MCPAIResponse {
  /** The AI's text response to the merchant */
  content: string;

  /** Provider that handled the request */
  provider: string;

  /** Model used */
  model: string;

  /** Token usage */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  /** RAG context info */
  ragContext?: {
    sourcesUsed: number;
    documentTypes: string[];
  };

  /** If the AI triggered a verification action */
  verification?: {
    /** Where to navigate */
    navigateTo: string;
    /** Pre-fill data for the form */
    prefill: Record<string, unknown>;
    /** What the AI created/prepared */
    summary: string;
  };

  /** Tool calls that were executed */
  toolsUsed?: Array<{
    name: string;
    result: MCPToolResult;
  }>;
}

/**
 * Conversation message with tool awareness.
 */
export interface MCPMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  toolCallId?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: string;
  }>;
}

/**
 * Convert an MCPToolDef to an AITool (OpenAI function calling format).
 */
export function toAITool(def: MCPToolDef): AITool {
  return {
    type: "function",
    function: {
      name: def.name,
      description: def.description,
      parameters: def.parameters,
    },
  };
}
