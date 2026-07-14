import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateOrderStatusSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; orderId: string }> };

// GET /api/sites/:siteId/orders/:orderId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, orderId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const order = await prisma.order.findFirst({
    where: { id: orderId, siteId },
    include: {
      items: { include: { product: { select: { id: true, name: true, images: { take: 1 } } } } },
      customer: true,
      coupon: true,
      timeline: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) return error("Order not found", 404);
  return success(order);
}

// PATCH /api/sites/:siteId/orders/:orderId — update status
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, orderId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await prisma.order.findFirst({ where: { id: orderId, siteId } });
  if (!existing) return error("Order not found", 404);

  const updateData: Record<string, unknown> = { status: parsed.data.status };

  if (parsed.data.status === "SHIPPED") {
    updateData.shippedAt = new Date();
    if (parsed.data.trackingNumber) updateData.trackingNumber = parsed.data.trackingNumber;
  } else if (parsed.data.status === "DELIVERED") {
    updateData.deliveredAt = new Date();
  } else if (parsed.data.status === "CANCELLED") {
    updateData.cancelledAt = new Date();
    updateData.cancelReason = parsed.data.note;

    // Restore stock
    const items = await prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: { items: true, customer: true, timeline: true },
  });

  // Add timeline entry
  await prisma.orderTimeline.create({
    data: {
      orderId,
      status: parsed.data.status,
      note: parsed.data.note,
      createdBy: ctx.user!.id,
    },
  });

  await logAudit({
    siteId, userId: ctx.user!.id,
    action: "UPDATE_STATUS", entity: "order", entityId: orderId,
    before: { status: existing.status }, after: { status: parsed.data.status },
  });

  return success(order);
}
