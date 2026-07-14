import { NextRequest, NextResponse } from "next/server";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { mcpChat, getMCPStatus } from "@/lib/mcp-ai-service";

export const maxDuration = 120; // Longer timeout for tool calling loops

type Params = { params: Promise<{ siteId: string }> };

// POST /api/sites/:siteId/ai — MCP-powered AI chat
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const { message, conversationHistory, images } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return error("Message is required", 400);
    }

    if (message.length > 5000) {
      return error("Message too long (max 5000 characters)", 400);
    }

    // Validate images
    let validImages: string[] | undefined;
    if (images && Array.isArray(images)) {
      validImages = images
        .filter((img: unknown): img is string => typeof img === "string")
        .filter((img) => img.startsWith("data:image/") || img.startsWith("https://"))
        .slice(0, 4);
    }

    // Validate conversation history
    let history: Array<{ role: "user" | "assistant"; content: string }> | undefined;
    if (conversationHistory && Array.isArray(conversationHistory)) {
      history = conversationHistory
        .filter(
          (m: unknown): m is { role: string; content: string } =>
            typeof m === "object" &&
            m !== null &&
            "role" in m &&
            "content" in m &&
            typeof (m as any).role === "string" &&
            typeof (m as any).content === "string" &&
            ((m as any).role === "user" || (m as any).role === "assistant")
        )
        .slice(-10)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    }

    const response = await mcpChat({
      siteId,
      userId: ctx.user!.id,
      message: message.trim(),
      images: validImages,
      conversationHistory: history,
    });

    return success(response);
  } catch (err) {
    console.error("MCP AI chat error:", err);
    const message = (err as Error).message || "AI service unavailable";

    if (message.includes("No AI providers configured")) {
      return NextResponse.json(
        {
          success: false,
          error: "AI is not configured. Please set up an AI provider API key.",
          details: "Set OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_KEY, GROQ_API_KEY, or DEEPSEEK_API_KEY.",
        },
        { status: 503 }
      );
    }

    if (message.includes("AI request failed")) {
      return NextResponse.json(
        { success: false, error: "AI service temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// GET /api/sites/:siteId/ai — Get MCP + AI status
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const status = getMCPStatus();
  return success(status);
}
