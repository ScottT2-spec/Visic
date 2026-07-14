import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError } from "@/lib/api-helpers";
import { createFunnelStepSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; funnelId: string }> };

// POST /api/sites/:siteId/funnels/:funnelId/steps — add a step
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId, funnelId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const funnel = await prisma.funnel.findFirst({ where: { id: funnelId, siteId } });
  if (!funnel) return error("Funnel not found", 404);

  try {
    const body = await req.json();
    const parsed = createFunnelStepSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    // Auto-position at end if not specified
    const maxPos = await prisma.funnelStep.aggregate({
      where: { funnelId },
      _max: { position: true },
    });
    const position = parsed.data.position ?? ((maxPos._max.position ?? -1) + 1);

    const { settings, ...rest } = parsed.data;
    const step = await prisma.funnelStep.create({
      data: {
        funnelId,
        ...rest,
        position,
        settings: settings ? (settings as any) : undefined,
      },
    });

    return success(step, 201);
  } catch (err) {
    console.error("Add funnel step error:", err);
    return error("Internal server error", 500);
  }
}

// PATCH /api/sites/:siteId/funnels/:funnelId/steps — reorder steps
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, funnelId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const funnel = await prisma.funnel.findFirst({ where: { id: funnelId, siteId } });
  if (!funnel) return error("Funnel not found", 404);

  try {
    const body = await req.json();
    const { order } = body as { order: string[] };

    if (!Array.isArray(order)) return error("order must be an array of step IDs", 400);

    // Batch update positions
    await Promise.all(
      order.map((stepId, idx) =>
        prisma.funnelStep.updateMany({
          where: { id: stepId, funnelId },
          data: { position: idx },
        })
      )
    );

    const steps = await prisma.funnelStep.findMany({
      where: { funnelId },
      orderBy: { position: "asc" },
    });

    return success({ steps });
  } catch (err) {
    console.error("Reorder funnel steps error:", err);
    return error("Internal server error", 500);
  }
}
