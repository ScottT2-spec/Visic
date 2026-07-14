import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError } from "@/lib/api-helpers";
import { createCouponSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const coupons = await prisma.coupon.findMany({
    where: { siteId },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return success(coupons);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const parsed = createCouponSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await prisma.coupon.findUnique({
    where: { siteId_code: { siteId, code: parsed.data.code } },
  });
  if (existing) return error("Coupon code already exists", 409);

  const coupon = await prisma.coupon.create({
    data: { siteId, ...parsed.data },
  });

  return success(coupon, 201);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return error("Coupon id is required", 400);

  const coupon = await prisma.coupon.findFirst({ where: { id, siteId } });
  if (!coupon) return error("Coupon not found", 404);

  const updated = await prisma.coupon.update({
    where: { id },
    data,
  });

  return success(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return error("Coupon id is required", 400);

  const coupon = await prisma.coupon.findFirst({ where: { id, siteId } });
  if (!coupon) return error("Coupon not found", 404);

  await prisma.coupon.delete({ where: { id } });
  return success({ deleted: true });
}
