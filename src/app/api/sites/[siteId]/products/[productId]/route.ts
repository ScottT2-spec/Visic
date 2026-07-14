import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateProductSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; productId: string }> };

// GET /api/sites/:siteId/products/:productId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, productId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const product = await prisma.product.findFirst({
    where: { id: productId, siteId },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
      category: true,
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { reviews: true, orderItems: true } },
    },
  });

  if (!product) return error("Product not found", 404);
  return success(product);
}

// PATCH /api/sites/:siteId/products/:productId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, productId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await prisma.product.findFirst({ where: { id: productId, siteId } });
  if (!existing) return error("Product not found", 404);

  const { images, variants, ...data } = parsed.data;

  // Cost price must be lower than regular price
  const effectivePrice = data.price ?? Number(existing.price);
  if (data.costPrice && data.costPrice >= effectivePrice) {
    return error("Cost price must be lower than the regular price", 400);
  }

  const product = await prisma.$transaction(async (tx) => {
    if (images) {
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productImage.createMany({
        data: images.map((img, i) => ({ productId, url: img.url, alt: img.alt, position: i })),
      });
    }

    if (variants) {
      await tx.productVariant.deleteMany({ where: { productId } });
      await tx.productVariant.createMany({
        data: variants.map((v, i) => ({ productId, ...v, options: v.options as any, image: v.image || null, position: i })),
      });
    }

    return tx.product.update({
      where: { id: productId },
      data,
      include: { images: true, variants: true, category: true },
    });
  });

  await logAudit({
    siteId, userId: ctx.user!.id,
    action: "UPDATE", entity: "product", entityId: productId,
    before: existing, after: product,
  });

  return success(product);
}

// DELETE /api/sites/:siteId/products/:productId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, productId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.product.findFirst({ where: { id: productId, siteId } });
  if (!existing) return error("Product not found", 404);

  await prisma.product.delete({ where: { id: productId } });

  await logAudit({
    siteId, userId: ctx.user!.id,
    action: "DELETE", entity: "product", entityId: productId,
    before: existing,
  });

  return success({ deleted: true });
}
