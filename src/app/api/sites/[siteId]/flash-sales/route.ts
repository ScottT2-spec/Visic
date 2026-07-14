import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const sales = await prisma.flashSale.findMany({
    where: { siteId },
    include: {
      products: {
        include: { product: { select: { id: true, name: true, slug: true, price: true, images: { take: 1, orderBy: { position: "asc" } } } } },
      },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return success(sales);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const { name, description, discountType = "PERCENTAGE", discountValue, startsAt, endsAt, productIds = [], maxUses } = body;

  if (!name) return error("Name is required");
  if (!discountValue || discountValue <= 0) return error("Discount value must be positive");
  if (discountType === "PERCENTAGE" && discountValue > 100) return error("Percentage cannot exceed 100");
  if (!startsAt || !endsAt) return error("Start and end dates are required");
  if (new Date(endsAt) <= new Date(startsAt)) return error("End date must be after start date");

  const sale = await prisma.flashSale.create({
    data: {
      siteId,
      name,
      description,
      discountType,
      discountValue,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      maxUses: maxUses || null,
      products: productIds.length > 0 ? {
        create: productIds.map((pid: string) => ({ productId: pid })),
      } : undefined,
    },
    include: {
      products: { include: { product: { select: { id: true, name: true } } } },
    },
  });

  return success(sale, 201);
}
