import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateWhatsAppCampaignSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; campaignId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, campaignId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const campaign = await prisma.whatsAppCampaign.findFirst({ where: { id: campaignId, siteId } });
  if (!campaign) return error("Campaign not found", 404);
  return success(campaign);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, campaignId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.whatsAppCampaign.findFirst({ where: { id: campaignId, siteId } });
  if (!existing) return error("Campaign not found", 404);
  if (existing.status === "SENT") return error("Cannot edit a sent campaign", 400);

  try {
    const body = await req.json();
    const parsed = updateWhatsAppCampaignSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { scheduledAt, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

    const campaign = await prisma.whatsAppCampaign.update({ where: { id: campaignId }, data });
    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "whatsapp_campaign", entityId: campaignId, before: existing, after: campaign });
    return success(campaign);
  } catch (err) {
    console.error("Update WhatsApp campaign error:", err);
    return error("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, campaignId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.whatsAppCampaign.findFirst({ where: { id: campaignId, siteId } });
  if (!existing) return error("Campaign not found", 404);

  await prisma.whatsAppCampaign.delete({ where: { id: campaignId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "whatsapp_campaign", entityId: campaignId, before: existing });
  return success({ deleted: true });
}
