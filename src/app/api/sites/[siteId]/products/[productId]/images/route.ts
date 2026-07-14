import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createProductImageSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; productId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, productId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const product = await prisma.product.findFirst({ where: { id: productId, siteId } });
  if (!product) return error("Product not found", 404);

  const images = await prisma.productImage.findMany({ where: { productId }, orderBy: { position: "asc" } });
  return success({ images });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId, productId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const product = await prisma.product.findFirst({ where: { id: productId, siteId } });
  if (!product) return error("Product not found", 404);

  try {
    const body = await req.json();
    const parsed = createProductImageSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const image = await prisma.productImage.create({ data: { productId, ...parsed.data } });
    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "product_image", entityId: image.id, after: image });
    return success(image, 201);
  } catch (err) { console.error("Create product image error:", err); return error("Internal server error", 500); }
}

// Bulk reorder
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, productId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const product = await prisma.product.findFirst({ where: { id: productId, siteId } });
  if (!product) return error("Product not found", 404);

  try {
    const body = await req.json();
    const { order } = body as { order: string[] };
    if (!Array.isArray(order)) return error("order array is required", 400);

    for (let i = 0; i < order.length; i++) {
      await prisma.productImage.updateMany({ where: { id: order[i], productId }, data: { position: i } });
    }
    return success({ reordered: true });
  } catch (err) { console.error("Reorder images error:", err); return error("Internal server error", 500); }
}
