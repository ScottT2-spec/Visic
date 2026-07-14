import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { chatWithAI } from "@/lib/ai-service";

export const maxDuration = 120;

type Params = { params: Promise<{ siteId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const { prompt, category, industry } = await req.json();
    if (!prompt) return error("Prompt is required", 400);

    const aiPrompt = `You are an expert web designer. Generate a complete theme configuration as JSON.

Return ONLY valid JSON:
{
  "name": "Theme Name",
  "description": "Brief description",
  "category": "${category || "ecommerce"}",
  "industry": "${industry || "general"}",
  "config": {
    "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex", "surface": "#hex", "text": "#hex", "textMuted": "#hex", "border": "#hex", "success": "#hex", "warning": "#hex", "error": "#hex" },
    "fonts": { "heading": "font family", "body": "font family", "mono": "font family" },
    "borderRadius": "sm|md|lg|xl|2xl|full",
    "spacing": "compact|normal|relaxed",
    "layout": { "maxWidth": "1200px|1400px|1600px", "headerStyle": "minimal|classic|centered|transparent", "footerStyle": "minimal|standard|detailed", "sidebarPosition": "left|right|none", "productCardStyle": "minimal|bordered|shadow|overlay" },
    "typography": { "headingWeight": "600|700|800|900", "bodySize": "14px|15px|16px", "lineHeight": "1.5|1.6|1.7|1.8" },
    "effects": { "buttonStyle": "flat|rounded|pill|outline", "cardShadow": "none|sm|md|lg", "hoverEffect": "none|scale|lift|glow", "imageStyle": "square|rounded|circle" }
  },
  "tags": ["tag1", "tag2"]
}

Make it professional and cohesive. Colors should work well together.

User request: ${prompt}`;

    const aiResult = await chatWithAI({ siteId, message: aiPrompt });

    if (!aiResult.content) return error("AI failed to generate theme", 500);

    let themeData: Record<string, any>;
    try {
      const cleaned = aiResult.content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      themeData = JSON.parse(cleaned);
    } catch {
      return error("AI returned invalid theme. Try again.", 422);
    }

    const slug = `ai-${(themeData.name as string)?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || Date.now()}`;
    const theme = await prisma.theme.create({
      data: {
        name: (themeData.name as string) || `AI Theme ${Date.now()}`,
        slug,
        description: (themeData.description as string) || prompt,
        category: (themeData.category as string) || category || "ecommerce",
        industry: (themeData.industry as string) || industry,
        config: themeData.config || {},
        tags: Array.isArray(themeData.tags) ? themeData.tags : [],
        isAIGenerated: true,
        authorId: ctx.user!.id,
      },
    });

    // Auto-install on current site
    await prisma.siteTheme.upsert({
      where: { siteId_themeId: { siteId, themeId: theme.id } },
      create: { siteId, themeId: theme.id, isActive: true, customConfig: themeData.config },
      update: { isActive: true, customConfig: themeData.config },
    });

    // Deactivate other themes
    await prisma.siteTheme.updateMany({
      where: { siteId, themeId: { not: theme.id } },
      data: { isActive: false },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "ai_theme", entityId: theme.id, after: { prompt, name: theme.name } });
    return success({ theme: { id: theme.id, name: theme.name, slug: theme.slug }, config: themeData.config });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    console.error("AI theme generate error:", err);
    return error(msg, 500);
  }
}
