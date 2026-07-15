import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { moolreValidateName, moolreTransfer } from "@/lib/payments";
import { generateId } from "@/lib/utils";

type Params = { params: Promise<{ siteId: string }> };

// POST /api/sites/:siteId/disbursements — pay out to a seller/vendor via Moolre
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const { receiver, channel, amount, currency, description, validate } = body as {
      receiver: string;
      channel: string; // "1"=MTN, "6"=Telecel, "7"=AT, "2"=Bank
      amount: number;
      currency: string;
      description?: string;
      validate?: boolean;
    };

    if (!receiver || !channel || !amount || !currency) {
      return error("receiver, channel, amount, and currency are required", 400);
    }

    const gateway = await prisma.paymentGateway.findUnique({
      where: { siteId_provider: { siteId, provider: "MOOLRE" } },
    });
    if (!gateway || !gateway.isEnabled) {
      return error("Moolre is not configured for this store", 400);
    }

    const config = gateway.config as Record<string, string> | null;
    const apiUser = config?.apiUser;
    const accountNumber = config?.accountNumber;
    const baseUrl = config?.baseUrl || "https://api.moolre.com";

    if (!apiUser || !accountNumber) {
      return error("Moolre API user or account number not configured", 400);
    }

    // Validate recipient name first if requested
    if (validate) {
      const recipientName = await moolreValidateName({
        apiUser,
        apiKey: gateway.secretKey!,
        receiver,
        channel,
        currency,
        accountNumber,
        baseUrl,
      });
      return success({ recipientName, validated: true });
    }

    // Execute the transfer
    const reference = `visic_payout_${generateId()}_${Date.now()}`;
    const result = await moolreTransfer({
      apiUser,
      privateKey: gateway.secretKey!,
      channel,
      currency,
      amount,
      receiver,
      reference,
      accountNumber,
      description: description || `Payout from store`,
      baseUrl,
    });

    return success({
      reference,
      transactionId: result.transactionid,
      receiverName: result.receivername,
      amount: result.amount,
      fee: result.fee,
      totalCharged: result.amountfee,
    });
  } catch (err: any) {
    console.error("Disbursement error:", err);
    return error(err.message || "Disbursement failed", 500);
  }
}
