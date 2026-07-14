import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateProductVariantSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; productId: string; variantId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, productId, variantId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId, product: { siteId } } });
  if (!variant) return error("Variant not found", 404);
  return success(variant);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, productId, variantId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.productVariant.findFirst({ where: { id: variantId, productId, product: { siteId } } });
  if (!existing) return error("Variant not found", 404);

  try {
    const body = await req.json();
    const parsed = updateProductVariantSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { options, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (options) data.options = options as any;

    const variant = await prisma.productVariant.update({ where: { id: variantId }, data });
    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "product_variant", entityId: variantId, before: existing, after: variant });
    return success(variant);
  } catch (err) { console.error("Update variant error:", err); return error("Internal server error", 500); }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, productId, variantId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.productVariant.findFirst({ where: { id: variantId, productId, product: { siteId } } });
  if (!existing) return error("Variant not found", 404);

  await prisma.productVariant.delete({ where: { id: variantId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "product_variant", entityId: variantId, before: existing });
  return success({ deleted: true });
}
