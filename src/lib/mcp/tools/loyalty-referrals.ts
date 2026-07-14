/**
 * MCP Tools — Loyalty Program & Referral/Affiliate Program
 */

import { prisma } from "@/lib/db";
import type { MCPToolDef } from "../types";

// ─── LOYALTY ────────────────────────────────────────────────

const getLoyaltyProgram: MCPToolDef = {
  name: "get_loyalty_program",
  description: "Get loyalty program configuration and stats (total members, points issued, points redeemed).",
  category: "loyalty",
  parameters: { type: "object", properties: {}, required: [] },
  mutates: false,
  requiresVerification: false,
  execute: async (_params, ctx) => {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { siteId: ctx.siteId },
      include: {
        members: {
          include: { customer: { select: { firstName: true, lastName: true, email: true } } },
          orderBy: { totalPoints: "desc" },
          take: 10,
        },
      },
    });

    if (!program) {
      return {
        action: "data",
        message: "No loyalty program set up yet. Would you like me to help create one?",
        data: { program: null },
      };
    }

    const stats = await prisma.loyaltyMember.aggregate({
      where: { programId: program.id },
      _count: { id: true },
      _sum: { totalPoints: true, redeemedPoints: true, availablePoints: true },
    });

    return {
      action: "data",
      message: `Loyalty program: ${program.enabled ? "Active" : "Disabled"}`,
      data: {
        program: {
          enabled: program.enabled,
          pointsPerCurrency: program.pointsPerCurrency,
          currencyPerPoint: program.currencyPerPoint,
          redemptionRate: program.redemptionRate,
          minRedeemPoints: program.minRedeemPoints,
          welcomePoints: program.welcomePoints,
          referralPoints: program.referralPoints,
          reviewPoints: program.reviewPoints,
        },
        stats: {
          totalMembers: stats._count.id,
          totalPointsIssued: stats._sum.totalPoints || 0,
          totalPointsRedeemed: stats._sum.redeemedPoints || 0,
          totalPointsAvailable: stats._sum.availablePoints || 0,
        },
        topMembers: program.members.map((m) => ({
          name: `${m.customer.firstName} ${m.customer.lastName}`,
          email: m.customer.email,
          points: m.totalPoints,
          available: m.availablePoints,
          tier: m.tier,
        })),
        currency: ctx.currency,
      },
    };
  },
};

const setupLoyaltyProgram: MCPToolDef = {
  name: "setup_loyalty_program",
  description: `Create or update the loyalty program. Before calling, ask:
- Points earning rate (e.g., 1 point per ₦100 spent)
- Point redemption value
- Minimum points to redeem
- Welcome bonus points
- Points for reviews and referrals

Suggest loyalty strategies based on the store's business.`,
  category: "loyalty",
  parameters: {
    type: "object",
    properties: {
      enabled: { type: "boolean" },
      points_per_currency: { type: "number", description: "Points earned per currency unit threshold" },
      currency_per_point: { type: "number", description: "Spend threshold for 1 point" },
      redemption_rate: { type: "number", description: "Currency value per point" },
      min_redeem_points: { type: "number", description: "Minimum points to redeem" },
      welcome_points: { type: "number", description: "Points for new members" },
      referral_points: { type: "number", description: "Points for referrals" },
      review_points: { type: "number", description: "Points for reviews" },
    },
    required: [],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    return {
      action: "verify",
      message: "I'll set up the loyalty program. Taking you to the loyalty page to review the configuration.",
      navigateTo: "loyalty",
      prefill: {
        enabled: params.enabled ?? true,
        pointsPerCurrency: params.points_per_currency,
        currencyPerPoint: params.currency_per_point,
        redemptionRate: params.redemption_rate,
        minRedeemPoints: params.min_redeem_points,
        welcomePoints: params.welcome_points,
        referralPoints: params.referral_points,
        reviewPoints: params.review_points,
        _action: "setup",
      },
    };
  },
};

// ─── REFERRALS ──────────────────────────────────────────────

const getReferralProgram: MCPToolDef = {
  name: "get_referral_program",
  description: "Get the referral/affiliate program configuration, affiliates list, and performance stats.",
  category: "referrals",
  parameters: { type: "object", properties: {}, required: [] },
  mutates: false,
  requiresVerification: false,
  execute: async (_params, ctx) => {
    const program = await prisma.referralProgram.findUnique({
      where: { siteId: ctx.siteId },
      include: {
        affiliates: {
          include: {
            customer: { select: { firstName: true, lastName: true, email: true } },
            _count: { select: { referrals: true } },
          },
          orderBy: { totalEarnings: "desc" },
          take: 10,
        },
      },
    });

    if (!program) {
      return {
        action: "data",
        message: "No referral program set up. Would you like me to help create one?",
        data: { program: null },
      };
    }

    return {
      action: "data",
      message: `Referral program: ${program.enabled ? "Active" : "Disabled"}`,
      data: {
        program: {
          enabled: program.enabled,
          commissionType: program.commissionType,
          commissionValue: program.commissionValue,
          cookieDays: program.cookieDays,
          minPayoutAmount: program.minPayoutAmount,
          autoApprove: program.autoApprove,
        },
        affiliates: program.affiliates.map((a) => ({
          id: a.id,
          name: `${a.customer.firstName} ${a.customer.lastName}`,
          email: a.customer.email,
          code: a.code,
          status: a.status,
          totalClicks: a.totalClicks,
          totalOrders: a.totalOrders,
          totalEarnings: a.totalEarnings,
          pendingEarnings: a.pendingEarnings,
          referrals: a._count.referrals,
        })),
        currency: ctx.currency,
      },
    };
  },
};

const setupReferralProgram: MCPToolDef = {
  name: "setup_referral_program",
  description: `Create or update the referral/affiliate program. Before calling, ask:
- Commission type (percentage or flat)
- Commission value
- Cookie duration (how long referral link tracks)
- Minimum payout amount
- Auto-approve referrals?`,
  category: "referrals",
  parameters: {
    type: "object",
    properties: {
      enabled: { type: "boolean" },
      commission_type: { type: "string", enum: ["PERCENTAGE", "FLAT"] },
      commission_value: { type: "number" },
      cookie_days: { type: "number" },
      min_payout_amount: { type: "number" },
      auto_approve: { type: "boolean" },
      welcome_message: { type: "string" },
      terms_text: { type: "string" },
    },
    required: [],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    if (params.commission_type === "PERCENTAGE" && params.commission_value && (params.commission_value as number) > 100) {
      return { action: "error", message: "Commission percentage can't exceed 100%.", errorCode: "INVALID_VALUE" };
    }

    return {
      action: "verify",
      message: "I'll set up the referral program. Taking you to the referrals page to review.",
      navigateTo: "referrals",
      prefill: {
        enabled: params.enabled ?? true,
        commissionType: params.commission_type,
        commissionValue: params.commission_value,
        cookieDays: params.cookie_days,
        minPayoutAmount: params.min_payout_amount,
        autoApprove: params.auto_approve,
        welcomeMessage: params.welcome_message,
        termsText: params.terms_text,
        _action: "setup",
      },
    };
  },
};

const manageAffiliate: MCPToolDef = {
  name: "manage_affiliate",
  description: "Approve, suspend, or reject an affiliate application.",
  category: "referrals",
  parameters: {
    type: "object",
    properties: {
      affiliate_id: { type: "string" },
      action: { type: "string", enum: ["approve", "suspend", "reject"] },
    },
    required: ["affiliate_id", "action"],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const affiliate = await prisma.affiliate.findFirst({
      where: { id: params.affiliate_id as string, program: { siteId: ctx.siteId } },
      include: { customer: { select: { firstName: true, lastName: true } } },
    });
    if (!affiliate) return { action: "error", message: "Affiliate not found.", errorCode: "NOT_FOUND" };

    const statusMap: Record<string, string> = {
      approve: "APPROVED",
      suspend: "SUSPENDED",
      reject: "REJECTED",
    };

    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { status: statusMap[params.action as string] as any },
    });

    return {
      action: "done",
      message: `Affiliate ${affiliate.customer.firstName} ${affiliate.customer.lastName} has been ${params.action}${(params.action as string).endsWith("e") ? "d" : "ed"}.`,
    };
  },
};

export const loyaltyReferralTools: MCPToolDef[] = [
  getLoyaltyProgram,
  setupLoyaltyProgram,
  getReferralProgram,
  setupReferralProgram,
  manageAffiliate,
];
