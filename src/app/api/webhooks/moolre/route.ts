import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processPaymentConfirmation, moolreSendSms } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Moolre webhook payload: { status, code, message, data: { txstatus, payer, amount, transactionid, externalref, thirdpartyref, ... } }
    const { status, data } = body;

    if (!data?.externalref) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const paymentStatus = status === 1 && data.txstatus === 1 ? "SUCCESS" : "FAILED";

    const transaction = await processPaymentConfirmation({
      reference: data.externalref,
      status: paymentStatus,
      method: "MOOLRE_MOMO",
      externalRef: data.transactionid || data.thirdpartyref,
      metadata: {
        payer: data.payer,
        amount: data.amount,
        thirdpartyref: data.thirdpartyref,
        provider: "MOOLRE",
      },
    });

    // Auto-send SMS confirmation on successful payment
    if (paymentStatus === "SUCCESS" && transaction?.orderId) {
      try {
        const order = await prisma.order.findUnique({
          where: { id: transaction.orderId },
          include: { site: true },
        });

        if (order?.phone) {
          const gateway = await prisma.paymentGateway.findUnique({
            where: { siteId_provider: { siteId: order.siteId, provider: "MOOLRE" } },
          });
          const config = gateway?.config as Record<string, string> | null;
          const vasKey = config?.vasKey;
          const senderId = config?.smsSenderId || "Visic";
          const baseUrl = config?.baseUrl || "https://api.moolre.com";

          if (vasKey) {
            await moolreSendSms({
              vasKey,
              senderId,
              messages: [{
                recipient: order.phone,
                message: `Payment confirmed! Your order #${order.orderNumber} of ${order.currency} ${order.total} has been received. Thank you for shopping with ${order.site?.name || "us"}!`,
              }],
              baseUrl,
            });
          }
        }
      } catch (smsErr) {
        // SMS is best-effort — don't fail the webhook if SMS fails
        console.error("Auto-SMS failed:", smsErr);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Moolre webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
