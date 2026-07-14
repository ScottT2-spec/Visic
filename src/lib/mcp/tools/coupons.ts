/**
 * MCP Tools — Coupons
 */

import { prisma } from "@/lib/db";
import type { MCPToolDef } from "../types";

const listCoupons: MCPToolDef = {
  name: "list_coupons",
  description: "List all coupons in the store with usage stats and status (active/expired/used up).",
  category: "coupons",
  parameters: {
    type: "object",
    properties: {
      active_only: { type: "boolean", description: "Only show active coupons" },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const where: Record<string, unknown> = { siteId: ctx.siteId };
    if (params.active_only) where.isActive = true;

    const coupons = await prisma.coupon.findMany({
      where: where as any,
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    return {
      action: "data",
      message: `Found ${coupons.length} coupon${coupons.length !== 1 ? "s" : ""}.`,
      data: {
        coupons: coupons.map((c) => ({
          id: c.id,
          code: c.code,
          type: c.type,
          value: Number(c.value),
          minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
          maxUses: c.maxUses,
          usedCount: c.usedCount,
          timesUsed: c._count.orders,
          isActive: c.isActive,
          isExpired: c.expiresAt ? c.expiresAt < now : false,
          isUsedUp: c.maxUses ? c.usedCount >= c.maxUses : false,
          startsAt: c.startsAt?.toISOString(),
          expiresAt: c.expiresAt?.toISOString(),
          createdAt: c.createdAt.toISOString(),
        })),
        currency: ctx.currency,
      },
    };
  },
};

const createCoupon: MCPToolDef = {
  name: "create_coupon",
  description: `Create a new coupon/discount code. Before calling, ask the merchant:
- Coupon code (or suggest a catchy one)
- Discount type: percentage, fixed amount, or free shipping
- Discount value
- Minimum order amount (optional)
- Maximum uses (optional)
- Expiry date (optional)

Suggest strategic coupon ideas based on the store's context (e.g., "WELCOME10" for new customers, "FLASH50" for flash sales).`,
  category: "coupons",
  parameters: {
    type: "object",
    properties: {
      code: { type: "string", description: "Coupon code (will be uppercased)" },
      type: { type: "string", enum: ["PERCENTAGE", "FIXED", "FREE_SHIPPING"], description: "Discount type" },
      value: { type: "number", description: "Discount value (percentage or fixed amount)" },
      min_order_amount: { type: "number", description: "Minimum order amount to use this coupon" },
      max_uses: { type: "number", description: "Maximum number of times this coupon can be used" },
      starts_at: { type: "string", description: "Start date (ISO format)" },
      expires_at: { type: "string", description: "Expiry date (ISO format)" },
    },
    required: ["code", "type", "value"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    const code = (params.code as string).toUpperCase();

    // Check for duplicate
    const existing = await prisma.coupon.findFirst({
      where: { siteId: ctx.siteId, code },
    });
    if (existing) {
      return { action: "error", message: `Coupon code "${code}" already exists. Try a different code.`, errorCode: "DUPLICATE" };
    }

    if (params.type === "PERCENTAGE" && (params.value as number) > 100) {
      return { action: "error", message: "Percentage discount can't exceed 100%.", errorCode: "INVALID_VALUE" };
    }

    const typeLabel = params.type === "PERCENTAGE" ? `${params.value}% off` : params.type === "FIXED" ? `${ctx.currency} ${(params.value as number).toLocaleString()} off` : "Free shipping";

    return {
      action: "verify",
      message: `I'll create coupon "${code}" for ${typeLabel}${params.min_order_amount ? ` on orders over ${ctx.currency} ${(params.min_order_amount as number).toLocaleString()}` : ""}${params.expires_at ? ` expiring ${new Date(params.expires_at as string).toLocaleDateString()}` : ""}. Taking you to coupons to review.`,
      navigateTo: "coupons",
      prefill: {
        code,
        type: params.type,
        value: params.value,
        minOrderAmount: params.min_order_amount || null,
        maxUses: params.max_uses || null,
        startsAt: params.starts_at || null,
        expiresAt: params.expires_at || null,
        _action: "create",
      },
    };
  },
};

const updateCoupon: MCPToolDef = {
  name: "update_coupon",
  description: "Update an existing coupon (toggle active/inactive, change limits, extend expiry, etc.).",
  category: "coupons",
  parameters: {
    type: "object",
    properties: {
      coupon_id: { type: "string", description: "Coupon ID" },
      is_active: { type: "boolean" },
      max_uses: { type: "number" },
      expires_at: { type: "string", description: "New expiry date" },
      value: { type: "number", description: "New discount value" },
      min_order_amount: { type: "number" },
    },
    required: ["coupon_id"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    const coupon = await prisma.coupon.findFirst({
      where: { id: params.coupon_id as string, siteId: ctx.siteId },
    });
    if (!coupon) return { action: "error", message: "Coupon not found.", errorCode: "NOT_FOUND" };

    return {
      action: "verify",
      message: `I'll update coupon "${coupon.code}". Taking you to coupons to review.`,
      navigateTo: "coupons",
      prefill: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: params.value ?? Number(coupon.value),
        minOrderAmount: params.min_order_amount ?? (coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null),
        maxUses: params.max_uses ?? coupon.maxUses,
        startsAt: coupon.startsAt?.toISOString() || null,
        expiresAt: params.expires_at ?? coupon.expiresAt?.toISOString() ?? null,
        isActive: params.is_active ?? coupon.isActive,
        _action: "update",
      },
    };
  },
};

const deleteCoupon: MCPToolDef = {
  name: "delete_coupon",
  description: "Delete a coupon. Confirm with merchant first.",
  category: "coupons",
  parameters: {
    type: "object",
    properties: {
      coupon_id: { type: "string", description: "Coupon ID" },
    },
    required: ["coupon_id"],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const coupon = await prisma.coupon.findFirst({
      where: { id: params.coupon_id as string, siteId: ctx.siteId },
    });
    if (!coupon) return { action: "error", message: "Coupon not found.", errorCode: "NOT_FOUND" };

    await prisma.coupon.delete({ where: { id: coupon.id } });

    return {
      action: "done",
      message: `Coupon "${coupon.code}" has been deleted.`,
    };
  },
};

export const couponTools: MCPToolDef[] = [
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
];
