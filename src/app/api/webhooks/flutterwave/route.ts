import { NextRequest, NextResponse } from "next/server";
import { verifyFlutterwaveWebhook, processPaymentConfirmation } from "@/lib/payments";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("verif-hash") || "";

    const gateways = await prisma.paymentGateway.findMany({
      where: { provider: "FLUTTERWAVE", isEnabled: true, webhookSecret: { not: null } },
    });

    let verified = false;
    for (const gw of gateways) {
      if (gw.webhookSecret && verifyFlutterwaveWebhook(signature, gw.webhookSecret)) {
        verified = true;
        break;
      }
    }

    if (!verified) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = await req.json();

    if (event.event === "charge.completed" && event.data?.status === "successful") {
      await processPaymentConfirmation({
        reference: event.data.tx_ref,
        status: "SUCCESS",
        method: `Flutterwave (${event.data.payment_type || "card"})`,
        externalRef: event.data.id?.toString(),
        metadata: event.data.meta,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Flutterwave webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
