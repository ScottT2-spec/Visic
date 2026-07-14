import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; saleId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, saleId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const sale = await prisma.flashSale.findUnique({
    where: { id: saleId },
    include: {
      products: {
        include: { product: { select: { id: true, name: true, slug: true, price: true, images: { take: 1, orderBy: { position: "asc" } } } } },
      },
    },
  });

  if (!sale || sale.siteId !== siteId) return error("Flash sale not found", 404);
  return success(sale);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, saleId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.flashSale.findUnique({ where: { id: saleId } });
  if (!existing || existing.siteId !== siteId) return error("Flash sale not found", 404);

  const body = await req.json();
  const { name, description, discountType, discountValue, startsAt, endsAt, isActive, maxUses, productIds } = body;

  // Update products if provided
  if (Array.isArray(productIds)) {
    await prisma.flashSaleProduct.deleteMany({ where: { flashSaleId: saleId } });
    if (productIds.length > 0) {
      await prisma.flashSaleProduct.createMany({
        data: productIds.map((pid: string) => ({ flashSaleId: saleId, productId: pid })),
      });
    }
  }

  const sale = await prisma.flashSale.update({
    where: { id: saleId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(discountType !== undefined && { discountType }),
      ...(discountValue !== undefined && { discountValue }),
      ...(startsAt !== undefined && { startsAt: new Date(startsAt) }),
      ...(endsAt !== undefined && { endsAt: new Date(endsAt) }),
      ...(isActive !== undefined && { isActive }),
      ...(maxUses !== undefined && { maxUses: maxUses || null }),
    },
    include: {
      products: { include: { product: { select: { id: true, name: true } } } },
    },
  });

  return success(sale);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, saleId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.flashSale.findUnique({ where: { id: saleId } });
  if (!existing || existing.siteId !== siteId) return error("Flash sale not found", 404);

  await prisma.flashSale.delete({ where: { id: saleId } });
  return success({ deleted: true });
}
