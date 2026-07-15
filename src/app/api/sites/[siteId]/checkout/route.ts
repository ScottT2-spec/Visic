import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import {
  initializePaystackPayment,
  initializeFlutterwavePayment,
  initializeMonnifyPayment,
  getMonnifyAccessToken,
  initializeMoolrePaymentLink,
} from "@/lib/payments";
import { generateId } from "@/lib/utils";

type Params = { params: Promise<{ siteId: string }> };

// POST /api/sites/:siteId/checkout — initialize payment after order creation
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;

  try {
    const body = await req.json();
    const { orderId, provider, callbackUrl } = body as {
      orderId: string;
      provider: "MONNIFY" | "PAYSTACK" | "FLUTTERWAVE" | "MOOLRE";
      callbackUrl: string;
    };

    if (!orderId || !provider) {
      return error("orderId and provider are required", 400);
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, siteId },
      include: { customer: true },
    });
    if (!order) return error("Order not found", 404);
    if (order.paymentStatus === "PAID") return error("Order already paid", 400);

    const gateway = await prisma.paymentGateway.findUnique({
      where: { siteId_provider: { siteId, provider } },
    });
    if (!gateway || !gateway.isEnabled) {
      return error(`${provider} is not configured for this store`, 400);
    }

    const reference = `visic_${generateId()}_${Date.now()}`;
    const amountNum = Number(order.total);

    // Create transaction record
    await prisma.paymentTransaction.create({
      data: {
        gatewayId: gateway.id,
        orderId: order.id,
        reference,
        amount: order.total,
        currency: order.currency,
        status: "PENDING",
      },
    });

    let paymentUrl: string;

    if (provider === "PAYSTACK") {
      const result = await initializePaystackPayment({
        secretKey: gateway.secretKey!,
        email: order.email,
        amount: Math.round(amountNum * 100), // kobo
        reference,
        callbackUrl: callbackUrl || `${req.headers.get("origin")}/checkout/verify`,
      });
      paymentUrl = result.authorization_url;
    } else if (provider === "FLUTTERWAVE") {
      const result = await initializeFlutterwavePayment({
        secretKey: gateway.secretKey!,
        amount: amountNum,
        currency: order.currency,
        email: order.email,
        reference,
        redirectUrl: callbackUrl || `${req.headers.get("origin")}/checkout/verify`,
        customerName: order.customer
          ? `${order.customer.firstName} ${order.customer.lastName}`
          : order.email,
      });
      paymentUrl = result.link;
    } else if (provider === "MONNIFY") {
      const config = gateway.config as Record<string, string> | null;
      const baseUrl = config?.baseUrl || "https://api.monnify.com";
      const contractCode = config?.contractCode;
      if (!contractCode) return error("Monnify contract code not configured", 400);

      const accessToken = await getMonnifyAccessToken(
        gateway.publicKey!,
        gateway.secretKey!,
        baseUrl
      );
      const result = await initializeMonnifyPayment({
        accessToken,
        baseUrl,
        amount: amountNum,
        customerName: order.customer
          ? `${order.customer.firstName} ${order.customer.lastName}`
          : "Customer",
        customerEmail: order.email,
        reference,
        description: `Order ${order.orderNumber}`,
        contractCode,
        redirectUrl: callbackUrl || `${req.headers.get("origin")}/checkout/verify`,
      });
      paymentUrl = result.checkoutUrl;
    } else if (provider === "MOOLRE") {
      const config = gateway.config as Record<string, string> | null;
      const apiUser = config?.apiUser;
      const accountNumber = config?.accountNumber;
      const baseUrl = config?.baseUrl || "https://api.moolre.com";
      if (!apiUser || !accountNumber) return error("Moolre API user or account number not configured", 400);

      const result = await initializeMoolrePaymentLink({
        apiUser,
        publicKey: gateway.publicKey!,
        amount: amountNum,
        email: order.email,
        reference,
        callbackUrl: `${req.headers.get("origin")}/api/webhooks/moolre`,
        redirectUrl: callbackUrl || `${req.headers.get("origin")}/checkout/verify`,
        currency: order.currency,
        accountNumber,
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
        baseUrl,
      });
      paymentUrl = result.authorization_url;
    } else {
      return error("Unsupported payment provider", 400);
    }

    // Update order with payment reference
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentReference: reference, paymentMethod: provider },
    });

    return success({ paymentUrl, reference });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return error(err.message || "Payment initialization failed", 500);
  }
}
