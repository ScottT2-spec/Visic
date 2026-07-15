import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { moolreSendSms } from "@/lib/payments";

type Params = { params: Promise<{ siteId: string }> };

// POST /api/sites/:siteId/notifications/sms — send SMS via Moolre
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const { type, orderId, recipient, message: customMessage } = body as {
      type: "order_confirmation" | "shipping_update" | "delivery_complete" | "custom";
      orderId?: string;
      recipient?: string;
      message?: string;
    };

    const gateway = await prisma.paymentGateway.findUnique({
      where: { siteId_provider: { siteId, provider: "MOOLRE" } },
    });
    if (!gateway || !gateway.isEnabled) {
      return error("Moolre is not configured for this store", 400);
    }

    const config = gateway.config as Record<string, string> | null;
    const vasKey = config?.vasKey;
    const senderId = config?.smsSenderId || "Visic";
    const baseUrl = config?.baseUrl || "https://api.moolre.com";

    if (!vasKey) {
      return error("Moolre VAS key not configured for SMS", 400);
    }

    let phone = recipient;
    let smsMessage = customMessage || "";

    // Auto-generate message from order if type is not custom
    if (type !== "custom" && orderId) {
      const order = await prisma.order.findFirst({
        where: { id: orderId, siteId },
        include: { customer: true },
      });
      if (!order) return error("Order not found", 404);

      phone = phone || order.phone || order.customer?.phone || "";
      const storeName = ctx.site?.name || "Store";

      switch (type) {
        case "order_confirmation":
          smsMessage = `Hi! Your order #${order.orderNumber} from ${storeName} has been confirmed. Total: ${order.currency} ${order.total}. Thank you for shopping with us!`;
          break;
        case "shipping_update":
          smsMessage = `Your order #${order.orderNumber} from ${storeName} has been shipped and is on its way! Track your delivery in your account.`;
          break;
        case "delivery_complete":
          smsMessage = `Your order #${order.orderNumber} from ${storeName} has been delivered. Enjoy your purchase! Leave a review at ${storeName}.`;
          break;
      }
    }

    if (!phone) return error("No recipient phone number", 400);
    if (!smsMessage) return error("No message content", 400);

    await moolreSendSms({
      vasKey,
      senderId,
      messages: [{ recipient: phone, message: smsMessage }],
      baseUrl,
    });

    return success({ sent: true, recipient: phone });
  } catch (err: any) {
    console.error("SMS notification error:", err);
    return error(err.message || "SMS send failed", 500);
  }
}
