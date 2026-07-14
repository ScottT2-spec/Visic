import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; affiliateId: string }> };

// GET — affiliate detail with referrals & payouts
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, affiliateId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      referrals: {
        include: {
          order: { select: { id: true, orderNumber: true, total: true, status: true, createdAt: true } },
        },
        orderBy: { clickedAt: "desc" },
        take: 50,
      },
      payouts: { orderBy: { createdAt: "desc" }, take: 20 },
      program: true,
    },
  });

  if (!affiliate) return error("Affiliate not found", 404);
  if (affiliate.program.siteId !== siteId) return error("Forbidden", 403);

  return success(affiliate);
}

// PATCH — update affiliate status or payout details
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, affiliateId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    include: { program: true },
  });
  if (!affiliate) return error("Affiliate not found", 404);
  if (affiliate.program.siteId !== siteId) return error("Forbidden", 403);

  const body = await req.json();
  const { status, payoutMethod, payoutDetails } = body;

  const updated = await prisma.affiliate.update({
    where: { id: affiliateId },
    data: {
      ...(status && { status }),
      ...(payoutMethod !== undefined && { payoutMethod }),
      ...(payoutDetails !== undefined && { payoutDetails }),
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  return success(updated);
}

// DELETE — remove affiliate
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, affiliateId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    include: { program: true },
  });
  if (!affiliate) return error("Affiliate not found", 404);
  if (affiliate.program.siteId !== siteId) return error("Forbidden", 403);

  await prisma.affiliate.delete({ where: { id: affiliateId } });
  return success({ deleted: true });
}
