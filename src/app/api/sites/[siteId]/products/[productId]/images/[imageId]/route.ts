import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateProductImageSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; productId: string; imageId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, productId, imageId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.productImage.findFirst({ where: { id: imageId, productId, product: { siteId } } });
  if (!existing) return error("Image not found", 404);

  try {
    const body = await req.json();
    const parsed = updateProductImageSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const image = await prisma.productImage.update({ where: { id: imageId }, data: parsed.data });
    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "product_image", entityId: imageId, before: existing, after: image });
    return success(image);
  } catch (err) { console.error("Update product image error:", err); return error("Internal server error", 500); }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, productId, imageId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.productImage.findFirst({ where: { id: imageId, productId, product: { siteId } } });
  if (!existing) return error("Image not found", 404);

  await prisma.productImage.delete({ where: { id: imageId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "product_image", entityId: imageId, before: existing });
  return success({ deleted: true });
}
