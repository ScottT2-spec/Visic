import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// POST — add loyalty member + award points
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const program = await prisma.loyaltyProgram.findUnique({ where: { siteId } });
  if (!program) return error("Loyalty program not set up", 404);

  const body = await req.json();
  const { customerId, action, points, description, orderId } = body;

  if (!customerId) return error("customerId required");

  // Ensure customer belongs to store
  const customer = await prisma.customer.findFirst({ where: { id: customerId, siteId } });
  if (!customer) return error("Customer not found", 404);

  // Get or create member
  let member = await prisma.loyaltyMember.findUnique({
    where: { programId_customerId: { programId: program.id, customerId } },
  });

  if (!member) {
    member = await prisma.loyaltyMember.create({
      data: {
        programId: program.id,
        customerId,
        totalPoints: program.welcomePoints,
        availablePoints: program.welcomePoints,
      },
    });
    if (program.welcomePoints > 0) {
      await prisma.loyaltyTransaction.create({
        data: { memberId: member.id, type: "bonus", points: program.welcomePoints, description: "Welcome bonus" },
      });
    }
  }

  // Process action
  if (action === "earn" && points && points > 0) {
    await prisma.loyaltyMember.update({
      where: { id: member.id },
      data: { totalPoints: { increment: points }, availablePoints: { increment: points } },
    });
    await prisma.loyaltyTransaction.create({
      data: { memberId: member.id, type: "earn", points, description: description || "Purchase", orderId },
    });
  }

  if (action === "redeem" && points && points > 0) {
    if (member.availablePoints < points) return error("Insufficient points");
    if (points < program.minRedeemPoints) return error(`Minimum ${program.minRedeemPoints} points to redeem`);

    await prisma.loyaltyMember.update({
      where: { id: member.id },
      data: { availablePoints: { decrement: points }, redeemedPoints: { increment: points } },
    });
    await prisma.loyaltyTransaction.create({
      data: { memberId: member.id, type: "redeem", points: -points, description: description || "Redeemed", orderId },
    });
  }

  const updated = await prisma.loyaltyMember.findUnique({
    where: { id: member.id },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      transactions: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  return success(updated);
}
