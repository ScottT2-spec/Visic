/**
 * MCP Tools — Flash Sales
 */

import { prisma } from "@/lib/db";
import type { MCPToolDef } from "../types";

const listFlashSales: MCPToolDef = {
  name: "list_flash_sales",
  description: "List all flash sales (active, upcoming, and ended) with their products and discount info.",
  category: "flash_sales",
  parameters: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["active", "upcoming", "ended"], description: "Filter by flash sale status" },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const now = new Date();
    const sales = await prisma.flashSale.findMany({
      where: { siteId: ctx.siteId },
      include: {
        products: {
          include: { product: { select: { id: true, name: true, price: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let filtered = sales;
    if (params.status === "active") filtered = sales.filter((s) => s.isActive && s.startsAt <= now && s.endsAt > now);
    else if (params.status === "upcoming") filtered = sales.filter((s) => s.startsAt > now);
    else if (params.status === "ended") filtered = sales.filter((s) => s.endsAt <= now);

    return {
      action: "data",
      message: `Found ${filtered.length} flash sale${filtered.length !== 1 ? "s" : ""}.`,
      data: {
        flashSales: filtered.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          discountType: s.discountType,
          discountValue: s.discountValue,
          startsAt: s.startsAt.toISOString(),
          endsAt: s.endsAt.toISOString(),
          isActive: s.isActive,
          isLive: s.isActive && s.startsAt <= now && s.endsAt > now,
          maxUses: s.maxUses,
          usedCount: s.usedCount,
          products: s.products.map((p) => ({
            id: p.product.id,
            name: p.product.name,
            originalPrice: Number(p.product.price),
            overrideDiscount: p.overrideDiscount,
          })),
        })),
        currency: ctx.currency,
      },
    };
  },
};

const createFlashSale: MCPToolDef = {
  name: "create_flash_sale",
  description: `Create a flash sale with time-limited discounts. Before calling, ask:
- Sale name (catchy title)
- Discount type & value
- Start and end dates/times
- Which products to include (list_products first)
- Maximum redemptions (optional)

Suggest compelling flash sale strategies (e.g., "Weekend Madness: 30% off all shoes, 48 hours only!").`,
  category: "flash_sales",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Flash sale name" },
      description: { type: "string" },
      discount_type: { type: "string", enum: ["PERCENTAGE", "FIXED"] },
      discount_value: { type: "number", description: "Discount amount (% or fixed)" },
      starts_at: { type: "string", description: "Start date/time (ISO format)" },
      ends_at: { type: "string", description: "End date/time (ISO format)" },
      product_ids: { type: "array", items: { type: "string" }, description: "Product IDs to include" },
      max_uses: { type: "number", description: "Maximum total redemptions" },
    },
    required: ["name", "discount_type", "discount_value", "starts_at", "ends_at"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    if (params.discount_type === "PERCENTAGE" && (params.discount_value as number) > 100) {
      return { action: "error", message: "Percentage discount can't exceed 100%.", errorCode: "INVALID_VALUE" };
    }
    if (new Date(params.ends_at as string) <= new Date(params.starts_at as string)) {
      return { action: "error", message: "End date must be after start date.", errorCode: "INVALID_DATE" };
    }

    // Validate product IDs if provided
    let productNames: string[] = [];
    if (params.product_ids && (params.product_ids as string[]).length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: params.product_ids as string[] }, siteId: ctx.siteId },
        select: { id: true, name: true },
      });
      productNames = products.map((p) => p.name);
      if (products.length !== (params.product_ids as string[]).length) {
        return { action: "error", message: "Some product IDs are invalid.", errorCode: "INVALID_PRODUCTS" };
      }
    }

    const discountLabel = params.discount_type === "PERCENTAGE"
      ? `${params.discount_value}% off`
      : `${ctx.currency} ${(params.discount_value as number).toLocaleString()} off`;

    return {
      action: "verify",
      message: `I'll create flash sale "${params.name}" with ${discountLabel}, running from ${new Date(params.starts_at as string).toLocaleString()} to ${new Date(params.ends_at as string).toLocaleString()}${productNames.length > 0 ? ` on ${productNames.length} products` : ""}. Taking you to flash sales to review.`,
      navigateTo: "flash-sales",
      prefill: {
        name: params.name,
        description: params.description || "",
        discountType: params.discount_type,
        discountValue: params.discount_value,
        startsAt: params.starts_at,
        endsAt: params.ends_at,
        productIds: params.product_ids || [],
        maxUses: params.max_uses || null,
        _action: "create",
      },
    };
  },
};

const deleteFlashSale: MCPToolDef = {
  name: "delete_flash_sale",
  description: "Delete a flash sale.",
  category: "flash_sales",
  parameters: {
    type: "object",
    properties: {
      flash_sale_id: { type: "string" },
    },
    required: ["flash_sale_id"],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const sale = await prisma.flashSale.findFirst({
      where: { id: params.flash_sale_id as string, siteId: ctx.siteId },
    });
    if (!sale) return { action: "error", message: "Flash sale not found.", errorCode: "NOT_FOUND" };

    await prisma.flashSale.delete({ where: { id: sale.id } });
    return { action: "done", message: `Flash sale "${sale.name}" has been deleted.` };
  },
};

export const flashSaleTools: MCPToolDef[] = [
  listFlashSales,
  createFlashSale,
  deleteFlashSale,
];
