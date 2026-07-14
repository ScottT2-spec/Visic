import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createProductVariantSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; productId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, productId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const product = await prisma.product.findFirst({ where: { id: productId, siteId } });
  if (!product) return error("Product not found", 404);

  const variants = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: { position: "asc" },
  });
  return success({ variants });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId, productId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const product = await prisma.product.findFirst({ where: { id: productId, siteId } });
  if (!product) return error("Product not found", 404);

  try {
    const body = await req.json();
    const parsed = createProductVariantSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const variant = await prisma.productVariant.create({
      data: { productId, ...parsed.data, options: parsed.data.options as any, price: parsed.data.price ?? undefined },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "product_variant", entityId: variant.id, after: variant });
    return success(variant, 201);
  } catch (err) { console.error("Create variant error:", err); return error("Internal server error", 500); }
}
