import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createWhatsAppCampaignSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

  const where: Record<string, unknown> = { siteId };
  if (status) where.status = status;

  const [campaigns, total] = await Promise.all([
    prisma.whatsAppCampaign.findMany({ where: where as any, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.whatsAppCampaign.count({ where: where as any }),
  ]);

  return success({ campaigns, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createWhatsAppCampaignSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { scheduledAt, ...rest } = parsed.data;
    const campaign = await prisma.whatsAppCampaign.create({
      data: { siteId, ...rest, scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "whatsapp_campaign", entityId: campaign.id, after: campaign });
    return success(campaign, 201);
  } catch (err) {
    console.error("Create WhatsApp campaign error:", err);
    return error("Internal server error", 500);
  }
}
