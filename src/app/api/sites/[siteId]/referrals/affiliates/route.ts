import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// POST /api/sites/:siteId/referrals/affiliates — add affiliate
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const program = await prisma.referralProgram.findUnique({ where: { siteId } });
  if (!program) return error("Referral program not set up yet", 404);

  const body = await req.json();
  const { customerId, status = "APPROVED" } = body;

  if (!customerId) return error("customerId is required");

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, siteId },
  });
  if (!customer) return error("Customer not found in this store", 404);

  const existing = await prisma.affiliate.findUnique({
    where: { programId_customerId: { programId: program.id, customerId } },
  });
  if (existing) return error("Customer is already an affiliate", 409);

  let code = generateReferralCode();
  // Ensure uniqueness
  while (await prisma.affiliate.findUnique({ where: { code } })) {
    code = generateReferralCode();
  }

  const affiliate = await prisma.affiliate.create({
    data: {
      programId: program.id,
      customerId,
      code,
      status: status as "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED",
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  return success(affiliate, 201);
}
