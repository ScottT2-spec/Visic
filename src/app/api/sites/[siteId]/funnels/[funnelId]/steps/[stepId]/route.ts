import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError } from "@/lib/api-helpers";
import { updateFunnelStepSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; funnelId: string; stepId: string }> };

// PATCH /api/sites/:siteId/funnels/:funnelId/steps/:stepId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, funnelId, stepId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const funnel = await prisma.funnel.findFirst({ where: { id: funnelId, siteId } });
  if (!funnel) return error("Funnel not found", 404);

  const existing = await prisma.funnelStep.findFirst({ where: { id: stepId, funnelId } });
  if (!existing) return error("Step not found", 404);

  try {
    const body = await req.json();
    const parsed = updateFunnelStepSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { settings, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (settings !== undefined) data.settings = settings ? (settings as any) : null;

    const step = await prisma.funnelStep.update({
      where: { id: stepId },
      data,
    });

    return success(step);
  } catch (err) {
    console.error("Update funnel step error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/sites/:siteId/funnels/:funnelId/steps/:stepId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, funnelId, stepId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const funnel = await prisma.funnel.findFirst({ where: { id: funnelId, siteId } });
  if (!funnel) return error("Funnel not found", 404);

  const existing = await prisma.funnelStep.findFirst({ where: { id: stepId, funnelId } });
  if (!existing) return error("Step not found", 404);

  await prisma.funnelStep.delete({ where: { id: stepId } });

  return success({ deleted: true });
}
