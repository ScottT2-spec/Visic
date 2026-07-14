import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

// GET /api/storefront/:slug/orders?email=...
// Public: customers can look up their own orders by email
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
  }

  const site = await prisma.site.findUnique({ where: { slug } });
  if (!site) {
    return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
  }

  const orders = await prisma.order.findMany({
    where: { siteId: site.id, email: { equals: email, mode: "insensitive" } },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      currency: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const data = orders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    total: Number(o.total),
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    itemCount: o._count.items,
  }));

  return NextResponse.json({ success: true, data });
}
