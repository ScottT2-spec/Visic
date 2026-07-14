import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; cartId: string }> };

// PATCH — update cart status (mark recovered, send reminder, etc.)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, cartId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const cart = await prisma.abandonedCart.findUnique({ where: { id: cartId } });
  if (!cart || cart.siteId !== siteId) return error("Cart not found", 404);

  const body = await req.json();
  const { status, recoveredOrderId } = body;

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (status === "RECOVERED") data.recoveredAt = new Date();
  if (status === "REMINDED") {
    data.remindersSent = cart.remindersSent + 1;
    data.lastReminderAt = new Date();
  }
  if (recoveredOrderId) data.recoveredOrderId = recoveredOrderId;

  const updated = await prisma.abandonedCart.update({
    where: { id: cartId },
    data,
  });

  return success(updated);
}

// DELETE
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, cartId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const cart = await prisma.abandonedCart.findUnique({ where: { id: cartId } });
  if (!cart || cart.siteId !== siteId) return error("Cart not found", 404);

  await prisma.abandonedCart.delete({ where: { id: cartId } });
  return success({ deleted: true });
}
