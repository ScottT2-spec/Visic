/**
 * MCP Tool Registry
 *
 * Central registry of all available tools. This is where every tool
 * from every domain gets registered and made available to the AI engine.
 */

import type { MCPToolDef, MCPCategory } from "./types";
import { toAITool } from "./types";
import type { AITool } from "@/lib/failover/types";

// Import all tool modules
import { productTools } from "./tools/products";
import { categoryTools } from "./tools/categories";
import { orderTools } from "./tools/orders";
import { customerTools } from "./tools/customers";
import { couponTools } from "./tools/coupons";
import { flashSaleTools } from "./tools/flash-sales";
import { deliveryTools } from "./tools/delivery";
import { pageTools } from "./tools/pages";
import { settingsTools } from "./tools/settings";
import { reviewTools } from "./tools/reviews";
import { loyaltyReferralTools } from "./tools/loyalty-referrals";
import { analyticsTools } from "./tools/analytics";

// ─── ALL TOOLS ──────────────────────────────────────────────

const ALL_TOOLS: MCPToolDef[] = [
  ...productTools,
  ...categoryTools,
  ...orderTools,
  ...customerTools,
  ...couponTools,
  ...flashSaleTools,
  ...deliveryTools,
  ...pageTools,
  ...settingsTools,
  ...reviewTools,
  ...loyaltyReferralTools,
  ...analyticsTools,
];

// Build lookup map for O(1) access
const TOOL_MAP = new Map<string, MCPToolDef>();
for (const tool of ALL_TOOLS) {
  if (TOOL_MAP.has(tool.name)) {
    throw new Error(`Duplicate MCP tool name: ${tool.name}`);
  }
  TOOL_MAP.set(tool.name, tool);
}

// ─── PUBLIC API ─────────────────────────────────────────────

/**
 * Get all registered tools.
 */
export function getAllTools(): MCPToolDef[] {
  return ALL_TOOLS;
}

/**
 * Get a tool by name.
 */
export function getTool(name: string): MCPToolDef | undefined {
  return TOOL_MAP.get(name);
}

/**
 * Get all tools as AITool format (for function calling).
 */
export function getAllAITools(): AITool[] {
  return ALL_TOOLS.map(toAITool);
}

/**
 * Get tools filtered by category.
 */
export function getToolsByCategory(category: MCPCategory): MCPToolDef[] {
  return ALL_TOOLS.filter((t) => t.category === category);
}

/**
 * Get tool names grouped by category (for debugging/display).
 */
export function getToolSummary(): Record<string, string[]> {
  const summary: Record<string, string[]> = {};
  for (const tool of ALL_TOOLS) {
    if (!summary[tool.category]) summary[tool.category] = [];
    summary[tool.category].push(tool.name);
  }
  return summary;
}

/**
 * Total number of registered tools.
 */
export function getToolCount(): number {
  return ALL_TOOLS.length;
}
