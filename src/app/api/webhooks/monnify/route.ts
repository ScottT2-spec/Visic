import { NextRequest, NextResponse } from "next/server";
import { verifyMonnifyWebhook, processPaymentConfirmation } from "@/lib/payments";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("monnify-signature") || "";

    // Verify against all Monnify gateways
    const gateways = await prisma.paymentGateway.findMany({
      where: { provider: "MONNIFY", isEnabled: true, webhookSecret: { not: null } },
    });

    let verified = false;
    for (const gw of gateways) {
      if (gw.webhookSecret && verifyMonnifyWebhook(body, signature, gw.webhookSecret)) {
        verified = true;
        break;
      }
    }

    if (!verified) {
      console.error("Monnify webhook verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Monnify sends SUCCESSFUL for completed payments
    if (event.eventType === "SUCCESSFUL_TRANSACTION" || event.eventType === "SUCCESSFUL_DISBURSEMENT") {
      const data = event.eventData;
      await processPaymentConfirmation({
        reference: data.paymentReference || data.transactionReference,
        status: "SUCCESS",
        method: `Monnify (${data.paymentMethod || "transfer"})`,
        externalRef: data.transactionReference,
        metadata: {
          amountPaid: data.amountPaid,
          paidOn: data.paidOn,
          paymentMethod: data.paymentMethod,
          settlementAmount: data.settlementAmount,
          customer: data.customer,
        },
      });
    }

    if (event.eventType === "FAILED_TRANSACTION") {
      const data = event.eventData;
      await processPaymentConfirmation({
        reference: data.paymentReference || data.transactionReference,
        status: "FAILED",
        method: `Monnify (${data.paymentMethod || "unknown"})`,
        externalRef: data.transactionReference,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Monnify webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
