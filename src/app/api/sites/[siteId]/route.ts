import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateStoreSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const store = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      settings: true,
      socialLinks: true,
      paymentGateways: { select: { id: true, provider: true, isEnabled: true, createdAt: true } },
      deliveryZones: { orderBy: { position: "asc" } },
      _count: { select: { products: true, orders: true, customers: true, pages: true } },
    },
  });

  return success(store);
}

// PATCH /api/sites/:siteId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const parsed = updateStoreSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const before = ctx.site;
  const store = await prisma.site.update({
    where: { id: siteId },
    data: parsed.data,
  });

  await logAudit({
    siteId, userId: ctx.user!.id,
    action: "UPDATE", entity: "store", entityId: siteId,
    before, after: store,
  });

  return success(store);
}

// DELETE /api/sites/:siteId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  if (ctx.site!.workspace.ownerId !== ctx.user!.id) {
    return error("Only the store owner can delete it", 403);
  }

  await prisma.site.delete({ where: { id: siteId } });

  return success({ deleted: true });
}
