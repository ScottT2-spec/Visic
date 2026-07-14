import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateBrandSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; brandId: string }> };

// GET /api/sites/:siteId/brands/:brandId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, brandId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, siteId },
    include: {
      _count: { select: { products: true } },
      products: {
        where: { status: "ACTIVE" },
        select: { id: true, name: true, slug: true, price: true, status: true },
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!brand) return error("Brand not found", 404);
  return success(brand);
}

// PATCH /api/sites/:siteId/brands/:brandId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, brandId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const existing = await prisma.brand.findFirst({ where: { id: brandId, siteId } });
    if (!existing) return error("Brand not found", 404);

    const body = await req.json();
    const parsed = updateBrandSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const brand = await prisma.brand.update({
      where: { id: brandId },
      data: parsed.data,
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "UPDATE",
      entity: "brand",
      entityId: brandId,
      before: existing,
      after: brand,
    });

    return success(brand);
  } catch (err) {
    console.error("Update brand error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/sites/:siteId/brands/:brandId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, brandId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.brand.findFirst({
    where: { id: brandId, siteId },
    include: { _count: { select: { products: true } } },
  });
  if (!existing) return error("Brand not found", 404);

  if (existing._count.products > 0) {
    return error(`Cannot delete brand with ${existing._count.products} product(s). Remove or reassign them first.`, 409);
  }

  await prisma.brand.delete({ where: { id: brandId } });

  await logAudit({
    siteId,
    userId: ctx.user!.id,
    action: "DELETE",
    entity: "brand",
    entityId: brandId,
    before: existing,
  });

  return success({ deleted: true });
}
