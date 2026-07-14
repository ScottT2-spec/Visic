import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { chatWithAI } from "@/lib/ai-service";

export const maxDuration = 120;

type Params = { params: Promise<{ siteId: string }> };

const STEP_TYPES = ["LANDING", "LEAD_FORM", "THANK_YOU", "CHECKOUT", "UPSELL", "DOWNSELL", "CONFIRMATION", "WEBINAR", "VIDEO"] as const;

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const { prompt, funnelType } = await req.json();
    if (!prompt) return error("Prompt is required", 400);

    const site = await prisma.site.findUnique({ where: { id: siteId }, select: { name: true } });

    const aiPrompt = `Generate a conversion funnel for "${site?.name || "a business"}".
${funnelType ? `Funnel type: ${funnelType}` : ""}
User request: ${prompt}

Available step types: ${STEP_TYPES.join(", ")}

Return ONLY valid JSON:
{
  "name": "Funnel Name",
  "description": "Brief description",
  "steps": [
    {
      "name": "Step Name",
      "type": "LANDING|LEAD_FORM|THANK_YOU|CHECKOUT|UPSELL|DOWNSELL|CONFIRMATION|WEBINAR|VIDEO",
      "config": { "headline": "Main headline", "subheadline": "Supporting text", "ctaText": "Button text", "content": "Page content" }
    }
  ]
}

Generate 3-7 steps forming a logical conversion path.`;

    const res = await chatWithAI({ siteId, message: aiPrompt });
    if (!res.content) return error("AI failed to generate funnel", 500);

    let funnelData: Record<string, any>;
    try {
      funnelData = JSON.parse(res.content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
    } catch {
      return error("AI returned invalid funnel. Try again.", 422);
    }

    const validTypes = new Set<string>(STEP_TYPES);
    const funnel = await prisma.funnel.create({
      data: {
        siteId,
        name: (funnelData.name as string) || `AI Funnel: ${prompt.slice(0, 40)}`,
        description: funnelData.description as string | undefined,
        status: "DRAFT",
        steps: {
          create: (Array.isArray(funnelData.steps) ? funnelData.steps : []).map((step: any, idx: number) => ({
            name: step.name || `Step ${idx + 1}`,
            type: validTypes.has(step.type) ? step.type : "LANDING",
            config: step.config || {},
            position: idx,
          })),
        },
      },
      include: { steps: { orderBy: { position: "asc" } } },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "ai_funnel", entityId: funnel.id, after: { prompt, steps: funnel.steps.length } });
    return success({ funnel });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    console.error("AI funnel generate error:", err);
    return error(msg, 500);
  }
}
