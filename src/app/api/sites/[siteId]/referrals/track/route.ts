import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/referrals/track?ref=CODE — track click
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const code = req.nextUrl.searchParams.get("ref");
  if (!code) return error("Missing ref code");

  const affiliate = await prisma.affiliate.findUnique({
    where: { code },
    include: { program: true },
  });

  if (!affiliate || affiliate.program.siteId !== siteId) {
    return error("Invalid referral code", 404);
  }
  if (affiliate.status !== "APPROVED") {
    return error("Affiliate not active", 403);
  }
  if (!affiliate.program.enabled) {
    return error("Referral program not active", 403);
  }

  // Record click
  await prisma.affiliate.update({
    where: { id: affiliate.id },
    data: { totalClicks: { increment: 1 } },
  });

  // Create a pending referral for this click
  const referral = await prisma.referral.create({
    data: {
      affiliateId: affiliate.id,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    },
  });

  return success({
    referralId: referral.id,
    affiliateCode: affiliate.code,
    cookieDays: affiliate.program.cookieDays,
  });
}

// POST /api/sites/:siteId/referrals/track — convert referral (called on order completion)
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const body = await req.json();
  const { referralId, orderId, affiliateCode } = body;

  if (!orderId) return error("orderId is required");
  if (!referralId && !affiliateCode) return error("referralId or affiliateCode is required");

  // Find the affiliate
  let affiliate;
  if (affiliateCode) {
    affiliate = await prisma.affiliate.findUnique({
      where: { code: affiliateCode },
      include: { program: true },
    });
  } else if (referralId) {
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: { affiliate: { include: { program: true } } },
    });
    affiliate = referral?.affiliate;
  }

  if (!affiliate || affiliate.program.siteId !== siteId) {
    return error("Invalid referral", 404);
  }

  // Get the order
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.siteId !== siteId) return error("Order not found", 404);

  // Calculate commission
  const orderTotal = Number(order.total);
  const commission = affiliate.program.commissionType === "PERCENTAGE"
    ? (orderTotal * affiliate.program.commissionValue) / 100
    : affiliate.program.commissionValue;

  const status = affiliate.program.autoApprove ? "APPROVED" : "CONVERTED";

  // Update or create referral
  if (referralId) {
    await prisma.referral.update({
      where: { id: referralId },
      data: {
        orderId,
        status,
        commissionAmount: commission,
        convertedAt: new Date(),
        ...(status === "APPROVED" ? { approvedAt: new Date() } : {}),
      },
    });
  } else {
    await prisma.referral.create({
      data: {
        affiliateId: affiliate.id,
        orderId,
        status,
        commissionAmount: commission,
        convertedAt: new Date(),
        ...(status === "APPROVED" ? { approvedAt: new Date() } : {}),
      },
    });
  }

  // Update affiliate stats
  const earningsUpdate = status === "APPROVED"
    ? { totalEarnings: { increment: commission }, pendingEarnings: affiliate.pendingEarnings }
    : { pendingEarnings: { increment: commission } };

  await prisma.affiliate.update({
    where: { id: affiliate.id },
    data: {
      totalOrders: { increment: 1 },
      ...earningsUpdate,
    },
  });

  return success({ converted: true, commission, status });
}
