import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateEmailCampaignSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; campaignId: string }> };

// GET /api/sites/:siteId/campaigns/email/:campaignId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, campaignId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const campaign = await prisma.emailCampaign.findFirst({
    where: { id: campaignId, siteId },
    include: {
      recipients: {
        select: { id: true, email: true, status: true, sentAt: true, openedAt: true, clickedAt: true },
        take: 50,
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { recipients: true } },
    },
  });

  if (!campaign) return error("Campaign not found", 404);

  const openRate = campaign.totalSent > 0 ? Math.round((campaign.totalOpened / campaign.totalSent) * 10000) / 100 : 0;
  const clickRate = campaign.totalSent > 0 ? Math.round((campaign.totalClicked / campaign.totalSent) * 10000) / 100 : 0;
  const bounceRate = campaign.totalSent > 0 ? Math.round((campaign.totalBounced / campaign.totalSent) * 10000) / 100 : 0;

  return success({ ...campaign, stats: { openRate, clickRate, bounceRate } });
}

// PATCH /api/sites/:siteId/campaigns/email/:campaignId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, campaignId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.emailCampaign.findFirst({ where: { id: campaignId, siteId } });
  if (!existing) return error("Campaign not found", 404);

  if (existing.status === "SENT") return error("Cannot edit a sent campaign", 400);

  try {
    const body = await req.json();
    const parsed = updateEmailCampaignSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { scheduledAt, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

    const campaign = await prisma.emailCampaign.update({ where: { id: campaignId }, data });
    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "email_campaign", entityId: campaignId, before: existing, after: campaign });
    return success(campaign);
  } catch (err) {
    console.error("Update email campaign error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/sites/:siteId/campaigns/email/:campaignId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, campaignId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.emailCampaign.findFirst({ where: { id: campaignId, siteId } });
  if (!existing) return error("Campaign not found", 404);

  await prisma.emailCampaign.delete({ where: { id: campaignId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "email_campaign", entityId: campaignId, before: existing });
  return success({ deleted: true });
}
