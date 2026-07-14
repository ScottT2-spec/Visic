/**
 * MCP Tools — Analytics, Dashboard, Abandoned Carts, Store Management
 */

import { prisma } from "@/lib/db";
import { generateSubdomain } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";
import type { MCPToolDef } from "../types";

// ─── DASHBOARD ──────────────────────────────────────────────

const getDashboard: MCPToolDef = {
  name: "get_dashboard",
  description: "Get the full dashboard overview: revenue, orders, customers, top products, recent orders — everything the merchant sees on the main dashboard.",
  category: "analytics",
  parameters: {
    type: "object",
    properties: {
      days: { type: "number", description: "Period in days (default 30)" },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const days = (params.days as number) || 30;
    const since = new Date(Date.now() - days * 86400000);
    const prevSince = new Date(Date.now() - days * 2 * 86400000);

    const [
      currentRevenue,
      prevRevenue,
      currentOrders,
      prevOrders,
      currentCustomers,
      prevCustomers,
      topProducts,
      recentOrders,
      pendingOrders,
      lowStockProducts,
      pendingReviews,
      unreadMessages,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { siteId: ctx.siteId, paymentStatus: "PAID", createdAt: { gte: since } },
        _sum: { total: true }, _count: { id: true },
      }),
      prisma.order.aggregate({
        where: { siteId: ctx.siteId, paymentStatus: "PAID", createdAt: { gte: prevSince, lt: since } },
        _sum: { total: true }, _count: { id: true },
      }),
      prisma.order.count({ where: { siteId: ctx.siteId, createdAt: { gte: since } } }),
      prisma.order.count({ where: { siteId: ctx.siteId, createdAt: { gte: prevSince, lt: since } } }),
      prisma.customer.count({ where: { siteId: ctx.siteId, createdAt: { gte: since } } }),
      prisma.customer.count({ where: { siteId: ctx.siteId, createdAt: { gte: prevSince, lt: since } } }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: { siteId: ctx.siteId, createdAt: { gte: since } } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 5,
      }),
      prisma.order.findMany({
        where: { siteId: ctx.siteId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { orderNumber: true, status: true, total: true, email: true, createdAt: true },
      }),
      prisma.order.count({ where: { siteId: ctx.siteId, status: "PENDING" } }),
      prisma.product.findMany({
        where: { siteId: ctx.siteId, trackInventory: true, status: "ACTIVE" },
        orderBy: { stock: "asc" },
        take: 5,
        select: { name: true, stock: true, lowStockAlert: true },
      }),
      prisma.review.count({ where: { product: { siteId: ctx.siteId }, isApproved: false } }),
      prisma.contactMessage.count({ where: { siteId: ctx.siteId, isRead: false } }),
    ]);

    // Get product names for top products
    const topProductIds = topProducts.map((p) => p.productId).filter(Boolean) as string[];
    const productNames = topProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true },
        })
      : [];
    const nameMap = new Map(productNames.map((p) => [p.id, p.name]));

    const currRev = Number(currentRevenue._sum.total || 0);
    const prevRev = Number(prevRevenue._sum.total || 0);
    const revenueChange = prevRev > 0 ? (((currRev - prevRev) / prevRev) * 100).toFixed(1) : "N/A";
    const orderChange = prevOrders > 0 ? (((currentOrders - prevOrders) / prevOrders) * 100).toFixed(1) : "N/A";

    return {
      action: "data",
      message: `Dashboard overview for the last ${days} days.`,
      data: {
        period: `${days} days`,
        revenue: { current: currRev, previous: prevRev, change: `${revenueChange}%` },
        orders: { current: currentOrders, previous: prevOrders, change: `${orderChange}%` },
        newCustomers: { current: currentCustomers, previous: prevCustomers },
        paidOrders: currentRevenue._count.id,
        averageOrderValue: currentRevenue._count.id > 0
          ? Math.round(currRev / currentRevenue._count.id)
          : 0,
        currency: ctx.currency,
        topProducts: topProducts.map((p) => ({
          name: nameMap.get(p.productId!) || "Unknown",
          unitsSold: p._sum.quantity || 0,
          revenue: Number(p._sum.total || 0),
        })),
        recentOrders: recentOrders.map((o) => ({
          orderNumber: o.orderNumber,
          status: o.status,
          total: Number(o.total),
          customer: o.email,
          date: o.createdAt.toISOString(),
        })),
        alerts: {
          pendingOrders,
          lowStockProducts: lowStockProducts.filter((p) => p.stock <= p.lowStockAlert).map((p) => ({
            name: p.name,
            stock: p.stock,
            threshold: p.lowStockAlert,
          })),
          pendingReviews,
          unreadMessages,
        },
      },
    };
  },
};

// ─── ANALYTICS ──────────────────────────────────────────────

const getAnalytics: MCPToolDef = {
  name: "get_analytics",
  description: "Get detailed analytics: page views, conversions, traffic sources, top pages, device breakdown.",
  category: "analytics",
  parameters: {
    type: "object",
    properties: {
      days: { type: "number", description: "Period (default 30)" },
      event: { type: "string", description: "Filter by event type (page_view, add_to_cart, checkout, purchase)" },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const days = (params.days as number) || 30;
    const since = new Date(Date.now() - days * 86400000);

    const where: Record<string, unknown> = { siteId: ctx.siteId, createdAt: { gte: since } };
    if (params.event) where.event = params.event;

    const [eventCounts, topPages, sources, devices] = await Promise.all([
      prisma.analyticsEvent.groupBy({
        by: ["event"],
        where: where as any,
        _count: { id: true },
      }),
      prisma.analyticsEvent.groupBy({
        by: ["page"],
        where: { ...where, event: "page_view" } as any,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.analyticsEvent.groupBy({
        by: ["source"],
        where: where as any,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.analyticsEvent.groupBy({
        by: ["device"],
        where: where as any,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
    ]);

    const events = eventCounts.reduce((acc, e) => {
      acc[e.event] = e._count.id;
      return acc;
    }, {} as Record<string, number>);

    const pageViews = events["page_view"] || 0;
    const addToCarts = events["add_to_cart"] || 0;
    const checkouts = events["checkout"] || 0;
    const purchases = events["purchase"] || 0;

    return {
      action: "data",
      message: `Analytics for the last ${days} days.`,
      data: {
        period: `${days} days`,
        funnel: {
          pageViews,
          addToCarts,
          checkouts,
          purchases,
          addToCartRate: pageViews > 0 ? `${((addToCarts / pageViews) * 100).toFixed(1)}%` : "0%",
          checkoutRate: addToCarts > 0 ? `${((checkouts / addToCarts) * 100).toFixed(1)}%` : "0%",
          purchaseRate: checkouts > 0 ? `${((purchases / checkouts) * 100).toFixed(1)}%` : "0%",
          overallConversion: pageViews > 0 ? `${((purchases / pageViews) * 100).toFixed(2)}%` : "0%",
        },
        topPages: topPages.map((p) => ({ page: p.page || "unknown", views: p._count.id })),
        trafficSources: sources.map((s) => ({ source: s.source || "direct", visits: s._count.id })),
        devices: devices.map((d) => ({ device: d.device || "unknown", visits: d._count.id })),
      },
    };
  },
};

// ─── ABANDONED CARTS ────────────────────────────────────────

const getAbandonedCarts: MCPToolDef = {
  name: "get_abandoned_carts",
  description: "Get abandoned cart data with recovery stats and cart details.",
  category: "abandoned_carts",
  parameters: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["ACTIVE", "REMINDED", "RECOVERED", "EXPIRED"] },
      limit: { type: "number" },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const where: Record<string, unknown> = { siteId: ctx.siteId };
    if (params.status) where.status = params.status;

    const [carts, stats] = await Promise.all([
      prisma.abandonedCart.findMany({
        where: where as any,
        include: { customer: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: (params.limit as number) || 20,
      }),
      Promise.all([
        prisma.abandonedCart.count({ where: { siteId: ctx.siteId } }),
        prisma.abandonedCart.count({ where: { siteId: ctx.siteId, status: "ACTIVE" } }),
        prisma.abandonedCart.count({ where: { siteId: ctx.siteId, status: "RECOVERED" } }),
        prisma.abandonedCart.aggregate({ where: { siteId: ctx.siteId }, _sum: { totalAmount: true } }),
        prisma.abandonedCart.aggregate({
          where: { siteId: ctx.siteId, status: "RECOVERED" },
          _sum: { totalAmount: true },
        }),
      ]),
    ]);

    const [total, active, recovered, totalValue, recoveredValue] = stats;

    return {
      action: "data",
      message: `${active} active abandoned cart${active !== 1 ? "s" : ""}${recovered > 0 ? `, ${recovered} recovered` : ""}.`,
      data: {
        carts: carts.map((c) => ({
          id: c.id,
          customer: c.customer
            ? `${c.customer.firstName} ${c.customer.lastName}`
            : c.email || "Anonymous",
          email: c.email,
          phone: c.phone,
          items: c.items,
          totalAmount: c.totalAmount,
          status: c.status,
          remindersSent: c.remindersSent,
          createdAt: c.createdAt.toISOString(),
        })),
        stats: {
          total,
          active,
          recovered,
          recoveryRate: total > 0 ? `${((recovered / total) * 100).toFixed(1)}%` : "0%",
          totalValue: totalValue._sum.totalAmount || 0,
          recoveredValue: recoveredValue._sum.totalAmount || 0,
        },
        currency: ctx.currency,
      },
    };
  },
};

// ─── STORE CREATION ─────────────────────────────────────────

const createStore: MCPToolDef = {
  name: "create_store",
  description: `Help the merchant create a new store. Before calling, have a conversation to gather:
- Store name
- What kind of business (fashion, electronics, food, beauty, etc.)
- Brief description
- Country and currency
- Any specific theme preference

Make it conversational — suggest good names if they're stuck, help them articulate their business.`,
  category: "store",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Store name" },
      description: { type: "string", description: "Store description" },
      business_type: { type: "string", description: "Business type (fashion, electronics, food, beauty, general, etc.)" },
      country: { type: "string", description: "Country code (e.g., NG, GH, KE)" },
      currency: { type: "string", description: "Currency code (e.g., NGN, GHS, KES)" },
    },
    required: ["name"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    return {
      action: "verify",
      message: `I'll create your new store "${params.name}". Taking you to the store creation page to review everything before we set it up.`,
      navigateTo: "new-store",
      prefill: {
        name: params.name,
        description: params.description || "",
        businessType: params.business_type || "general",
        country: params.country || "NG",
        currency: params.currency || "NGN",
        _action: "create",
      },
    };
  },
};

export const analyticsTools: MCPToolDef[] = [
  getDashboard,
  getAnalytics,
  getAbandonedCarts,
  createStore,
];
