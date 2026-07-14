/**
 * MCP Tool Executor
 *
 * Executes tool calls from the AI, handles errors gracefully,
 * and manages the tool call → result → AI response loop.
 */

import type { MCPContext, MCPToolResult } from "./types";
import { getTool } from "./registry";

/**
 * Execute a single tool call by name with given parameters.
 */
export async function executeTool(
  toolName: string,
  params: Record<string, unknown>,
  context: MCPContext
): Promise<MCPToolResult> {
  const tool = getTool(toolName);

  if (!tool) {
    return {
      action: "error",
      message: `Unknown tool: ${toolName}. This tool doesn't exist in the system.`,
      errorCode: "UNKNOWN_TOOL",
    };
  }

  try {
    // Parse params if they come as a string (from AI function calling)
    const parsedParams =
      typeof params === "string" ? JSON.parse(params) : params;

    const result = await tool.execute(parsedParams, context);
    return result;
  } catch (error) {
    console.error(`MCP tool execution error [${toolName}]:`, error);

    // Handle specific error types
    const err = error as Error;

    if (err.message?.includes("Unique constraint")) {
      return {
        action: "error",
        message: "This item already exists. Try a different name or code.",
        errorCode: "DUPLICATE",
      };
    }

    if (err.message?.includes("Record to update not found")) {
      return {
        action: "error",
        message: "The item you're trying to update no longer exists.",
        errorCode: "NOT_FOUND",
      };
    }

    if (err.message?.includes("Foreign key constraint")) {
      return {
        action: "error",
        message:
          "This item is linked to other data and can't be modified this way.",
        errorCode: "CONSTRAINT",
      };
    }

    return {
      action: "error",
      message: `Something went wrong while executing ${toolName}: ${err.message}`,
      errorCode: "EXECUTION_ERROR",
    };
  }
}

/**
 * Execute multiple tool calls in sequence, collecting results.
 * (AI might call multiple tools in one turn)
 */
export async function executeToolCalls(
  calls: Array<{
    id: string;
    name: string;
    arguments: string | Record<string, unknown>;
  }>,
  context: MCPContext
): Promise<
  Array<{
    callId: string;
    toolName: string;
    result: MCPToolResult;
  }>
> {
  const results: Array<{
    callId: string;
    toolName: string;
    result: MCPToolResult;
  }> = [];

  for (const call of calls) {
    const params =
      typeof call.arguments === "string"
        ? JSON.parse(call.arguments)
        : call.arguments;

    const result = await executeTool(call.name, params, context);

    results.push({
      callId: call.id,
      toolName: call.name,
      result,
    });

    // If a tool returned a verification action, stop processing further tools.
    // The merchant needs to verify before we continue.
    if (result.action === "verify") {
      break;
    }

    // If there was a critical error, stop.
    if (
      result.action === "error" &&
      result.errorCode === "EXECUTION_ERROR"
    ) {
      break;
    }
  }

  return results;
}
