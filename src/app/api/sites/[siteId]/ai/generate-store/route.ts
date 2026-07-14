import { NextRequest, NextResponse } from "next/server";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { generateStore } from "@/lib/ai-store-generator";

// Allow up to 60 seconds for AI generation
export const maxDuration = 60;

type Params = { params: Promise<{ siteId: string }> };

// POST /api/sites/:siteId/ai/generate-store
// Generates a full set of pages (Home, About, FAQ, Contact, Policies) using AI
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json().catch(() => ({}));

    // Get store info
    const site = ctx.site!;

    const result = await generateStore({
      siteId,
      storeSlug: site.slug,
      storeName: (body.storeName as string) || site.name,
      businessType: (body.businessType as string) || site.businessType || "general",
      description: (body.description as string) || site.description || undefined,
      country: site.country || "NG",
      currency: site.currency || "NGN",
    });

    return success({
      message: "Store pages generated successfully",
      pages: result.pages,
      provider: result.provider,
      model: result.model,
    });
  } catch (err) {
    console.error("AI store generation error:", err);

    const message = (err as Error).message || "Store generation failed";

    if (message.includes("No AI providers configured")) {
      return NextResponse.json(
        {
          success: false,
          error: "AI is not configured. Set up an AI provider API key to use the store builder.",
        },
        { status: 503 }
      );
    }

    if (message.includes("invalid content")) {
      return NextResponse.json(
        { success: false, error: "AI generated invalid content. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
