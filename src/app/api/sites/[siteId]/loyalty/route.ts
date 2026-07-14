import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET — program + top members
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const program = await prisma.loyaltyProgram.findUnique({
    where: { siteId },
    include: {
      members: {
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { totalPoints: "desc" },
        take: 50,
      },
    },
  });

  // Aggregate stats
  let stats = { totalMembers: 0, totalPointsIssued: 0, totalPointsRedeemed: 0 };
  if (program) {
    const agg = await prisma.loyaltyMember.aggregate({
      where: { programId: program.id },
      _count: { id: true },
      _sum: { totalPoints: true, redeemedPoints: true },
    });
    stats = {
      totalMembers: agg._count.id,
      totalPointsIssued: agg._sum.totalPoints || 0,
      totalPointsRedeemed: agg._sum.redeemedPoints || 0,
    };
  }

  return success({ program, stats });
}

// POST — create/update loyalty program
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const {
    enabled = true,
    pointsPerCurrency = 1,
    currencyPerPoint = 100,
    redemptionRate = 0.01,
    minRedeemPoints = 100,
    welcomePoints = 0,
    referralPoints = 50,
    reviewPoints = 10,
  } = body;

  const program = await prisma.loyaltyProgram.upsert({
    where: { siteId },
    create: {
      siteId, enabled, pointsPerCurrency, currencyPerPoint,
      redemptionRate, minRedeemPoints, welcomePoints, referralPoints, reviewPoints,
    },
    update: {
      enabled, pointsPerCurrency, currencyPerPoint,
      redemptionRate, minRedeemPoints, welcomePoints, referralPoints, reviewPoints,
    },
  });

  return success(program);
}
