import { NextRequest, NextResponse } from "next/server";
import { processPaymentConfirmation } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Moolre webhook payload: { status, code, message, data: { txstatus, payer, amount, transactionid, externalref, thirdpartyref, ... } }
    const { status, data } = body;

    if (!data?.externalref) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const paymentStatus = status === 1 && data.txstatus === 1 ? "SUCCESS" : "FAILED";

    await processPaymentConfirmation({
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

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Moolre webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
