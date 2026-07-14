import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// POST — create a payout for an affiliate
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const { affiliateId, amount, reference, note } = body;

  if (!affiliateId) return error("affiliateId is required");
  if (!amount || amount <= 0) return error("Valid amount is required");

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    include: { program: true },
  });

  if (!affiliate || affiliate.program.siteId !== siteId) {
    return error("Affiliate not found", 404);
  }

  // Check they have enough approved earnings
  const approvedUnpaid = affiliate.totalEarnings - affiliate.paidEarnings;
  if (amount > approvedUnpaid) {
    return error(`Amount exceeds available balance (₦${approvedUnpaid.toLocaleString()})`, 400);
  }

  const payout = await prisma.payout.create({
    data: {
      affiliateId,
      amount,
      status: "COMPLETED",
      reference,
      note,
      paidAt: new Date(),
    },
  });

  // Update affiliate paid earnings
  await prisma.affiliate.update({
    where: { id: affiliateId },
    data: {
      paidEarnings: { increment: amount },
    },
  });

  return success(payout, 201);
}
