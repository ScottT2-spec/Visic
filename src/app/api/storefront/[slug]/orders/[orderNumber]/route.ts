import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string; orderNumber: string }> };

// GET /api/storefront/:slug/orders/:orderNumber
// Public: look up a specific order by order number (no auth required)
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug, orderNumber } = await params;

  const site = await prisma.site.findUnique({ where: { slug } });
  if (!site) {
    return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
  }

  const order = await prisma.order.findFirst({
    where: { siteId: site.id, orderNumber: { equals: orderNumber, mode: "insensitive" } },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, images: { take: 1, select: { url: true } } },
          },
        },
      },
      timeline: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) {
    return NextResponse.json({ success: false, error: "Order not found. Please check the order number and try again." }, { status: 404 });
  }

  const data = {
    orderNumber: order.orderNumber,
    status: order.status,
    total: Number(order.total),
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
      image: item.product?.images?.[0]?.url || null,
    })),
    timeline: order.timeline.map(t => ({
      status: t.status,
      date: t.createdAt.toISOString(),
      description: t.note || t.status,
    })),
    shippingAddress: order.deliveryAddress ? {
      name: (order.deliveryAddress as Record<string, string>).name || "",
      address: (order.deliveryAddress as Record<string, string>).address || "",
      city: (order.deliveryAddress as Record<string, string>).city || "",
    } : null,
  };

  return NextResponse.json({ success: true, data });
}
