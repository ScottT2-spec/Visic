import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { chatWithAI } from "@/lib/ai-service";

export const maxDuration = 60;

type Params = { params: Promise<{ siteId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const { prompt, type, saveCampaign } = await req.json();
    if (!prompt) return error("Prompt is required", 400);

    const site = await prisma.site.findUnique({ where: { id: siteId }, select: { name: true } });

    const aiPrompt = `Generate a professional email for "${site?.name || "a business"}".
Type: ${type || "custom"}
Request: ${prompt}

Return ONLY valid JSON:
{
  "name": "Campaign Name",
  "subject": "Email subject line",
  "preheader": "Preview text (max 100 chars)",
  "contentHtml": "<full HTML email body with inline styles, responsive design>"
}

Use inline CSS. Make it mobile-friendly. Include a clear CTA button.
Use placeholder {{business_name}}, {{customer_name}}, {{unsubscribe_link}} variables.`;

    const res = await chatWithAI({ siteId, message: aiPrompt });
    if (!res.content) return error("AI failed to generate email", 500);

    let emailData: Record<string, any>;
    try {
      emailData = JSON.parse(res.content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
    } catch {
      return error("AI returned invalid email. Try again.", 422);
    }

    let campaign = null;
    if (saveCampaign) {
      campaign = await prisma.emailCampaign.create({
        data: {
          siteId,
          name: (emailData.name as string) || `AI Email: ${prompt.slice(0, 40)}`,
          subject: (emailData.subject as string) || "No subject",
          contentHtml: emailData.contentHtml as string | undefined,
          type: "BROADCAST",
          status: "DRAFT",
        },
      });
    }

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "ai_email", entityId: campaign?.id || siteId, after: { prompt, type, saved: !!campaign } });
    return success({ email: emailData, campaign: campaign ? { id: campaign.id, name: campaign.name } : null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    console.error("AI email generate error:", err);
    return error(msg, 500);
  }
}
