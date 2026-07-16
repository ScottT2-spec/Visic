import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET — list abandoned carts
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const status = req.nextUrl.searchParams.get("status") || undefined;

  const carts = await prisma.abandonedCart.findMany({
    where: {
      siteId,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Summary stats
  const [total, active, recovered, totalValue, recoveredValue] = await Promise.all([
    prisma.abandonedCart.count({ where: { siteId } }),
    prisma.abandonedCart.count({ where: { siteId, status: "ACTIVE" } }),
    prisma.abandonedCart.count({ where: { siteId, status: "RECOVERED" } }),
    prisma.abandonedCart.aggregate({ where: { siteId }, _sum: { totalAmount: true } }),
    prisma.abandonedCart.aggregate({ where: { siteId, status: "RECOVERED" }, _sum: { totalAmount: true } }),
  ]);

  return success({
    carts,
    stats: {
      total,
      active,
      recovered,
      recoveryRate: total > 0 ? ((recovered / total) * 100).toFixed(1) : "0",
      totalValue: totalValue._sum.totalAmount || 0,
      recoveredValue: recoveredValue._sum.totalAmount || 0,
    },
  });
}

// POST — record an abandoned cart (called from storefront)
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const body = await req.json();
  const { email, phone, sessionId, items, totalAmount, currency, customerId } = body;

  if (!items || !Array.isArray(items) || items.length === 0) return error("Cart items required");
  if (!email && !phone && !sessionId) return error("At least email, phone, or sessionId required");

  // Check for existing active cart with same identifier
  const existing = await prisma.abandonedCart.findFirst({
    where: {
      siteId,
      status: "ACTIVE",
      ...(email ? { email } : sessionId ? { sessionId } : { phone }),
    },
  });

  if (existing) {
    // Update existing cart
    const updated = await prisma.abandonedCart.update({
      where: { id: existing.id },
      data: { items, totalAmount: totalAmount || 0, currency: currency || "GHS" },
    });
    return success(updated);
  }

  const cart = await prisma.abandonedCart.create({
    data: {
      siteId,
      customerId,
      email,
      phone,
      sessionId,
      items,
      totalAmount: totalAmount || 0,
      currency: currency || "GHS",
    },
  });

  return success(cart, 201);
}
