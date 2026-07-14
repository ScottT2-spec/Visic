import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/referrals — get program + affiliates
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const program = await prisma.referralProgram.findUnique({
    where: { siteId },
    include: {
      affiliates: {
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { referrals: true, payouts: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return success(program);
}

// POST /api/sites/:siteId/referrals — create or update program
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const {
    enabled = true,
    commissionType = "PERCENTAGE",
    commissionValue = 10,
    cookieDays = 30,
    minPayoutAmount = 5000,
    autoApprove = false,
    welcomeMessage,
    termsText,
  } = body;

  if (commissionValue < 0) return error("Commission value must be positive");
  if (commissionType === "PERCENTAGE" && commissionValue > 100) return error("Percentage cannot exceed 100");

  const program = await prisma.referralProgram.upsert({
    where: { siteId },
    create: {
      siteId,
      enabled,
      commissionType,
      commissionValue,
      cookieDays,
      minPayoutAmount,
      autoApprove,
      welcomeMessage,
      termsText,
    },
    update: {
      enabled,
      commissionType,
      commissionValue,
      cookieDays,
      minPayoutAmount,
      autoApprove,
      welcomeMessage,
      termsText,
    },
  });

  return success(program);
}
