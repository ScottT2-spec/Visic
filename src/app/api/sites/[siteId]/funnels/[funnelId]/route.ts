import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateFunnelSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; funnelId: string }> };

// GET /api/sites/:siteId/funnels/:funnelId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, funnelId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const funnel = await prisma.funnel.findFirst({
    where: { id: funnelId, siteId },
    include: {
      steps: { orderBy: { position: "asc" } },
    },
  });

  if (!funnel) return error("Funnel not found", 404);

  // Calculate total conversion stats
  const totalViews = funnel.steps.reduce((sum, s) => sum + s.viewCount, 0);
  const totalConversions = funnel.steps.reduce((sum, s) => sum + s.conversionCount, 0);

  return success({
    ...funnel,
    stats: {
      totalViews,
      totalConversions,
      overallRate: totalViews > 0 ? Math.round((totalConversions / totalViews) * 10000) / 100 : 0,
    },
  });
}

// PATCH /api/sites/:siteId/funnels/:funnelId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, funnelId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const existing = await prisma.funnel.findFirst({ where: { id: funnelId, siteId } });
    if (!existing) return error("Funnel not found", 404);

    const body = await req.json();
    const parsed = updateFunnelSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const funnel = await prisma.funnel.update({
      where: { id: funnelId },
      data: parsed.data,
      include: { steps: { orderBy: { position: "asc" } } },
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "UPDATE",
      entity: "funnel",
      entityId: funnelId,
      before: existing,
      after: funnel,
    });

    return success(funnel);
  } catch (err) {
    console.error("Update funnel error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/sites/:siteId/funnels/:funnelId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, funnelId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.funnel.findFirst({ where: { id: funnelId, siteId } });
  if (!existing) return error("Funnel not found", 404);

  await prisma.funnel.delete({ where: { id: funnelId } });

  await logAudit({
    siteId,
    userId: ctx.user!.id,
    action: "DELETE",
    entity: "funnel",
    entityId: funnelId,
    before: existing,
  });

  return success({ deleted: true });
}
