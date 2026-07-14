/**
 * MCP Tools — Orders
 */

import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/api-helpers";
import type { MCPToolDef } from "../types";

const listOrders: MCPToolDef = {
  name: "list_orders",
  description: "List orders with optional filters by status, payment status, date range, or customer. Returns order numbers, totals, status, and customer info.",
  category: "orders",
  parameters: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] },
      payment_status: { type: "string", enum: ["PENDING", "PAID", "FAILED", "REFUNDED"] },
      search: { type: "string", description: "Search by order number, customer email, or name" },
      days: { type: "number", description: "Only orders from the last N days" },
      page: { type: "number" },
      limit: { type: "number" },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const page = (params.page as number) || 1;
    const limit = Math.min((params.limit as number) || 20, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { siteId: ctx.siteId };
    if (params.status) where.status = params.status;
    if (params.payment_status) where.paymentStatus = params.payment_status;
    if (params.days) {
      where.createdAt = { gte: new Date(Date.now() - (params.days as number) * 86400000) };
    }
    if (params.search) {
      where.OR = [
        { orderNumber: { contains: params.search as string, mode: "insensitive" } },
        { email: { contains: params.search as string, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: where as any,
        include: {
          customer: { select: { firstName: true, lastName: true, email: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: where as any }),
    ]);

    return {
      action: "data",
      message: `Found ${total} order${total !== 1 ? "s" : ""}${params.status ? ` with status ${params.status}` : ""}.`,
      data: {
        orders: orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customer: o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : o.email,
          email: o.email,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          total: Number(o.total),
          subtotal: Number(o.subtotal),
          deliveryFee: Number(o.deliveryFee),
          discount: Number(o.discount),
          currency: o.currency,
          items: o._count.items,
          createdAt: o.createdAt.toISOString(),
        })),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  },
};

const getOrder: MCPToolDef = {
  name: "get_order",
  description: "Get full details of a specific order including items, timeline, delivery address, and payment info.",
  category: "orders",
  parameters: {
    type: "object",
    properties: {
      order_id: { type: "string", description: "Order ID" },
      order_number: { type: "string", description: "Order number (alternative to order_id)" },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const where = params.order_id
      ? { id: params.order_id as string, siteId: ctx.siteId }
      : params.order_number
        ? { orderNumber: params.order_number as string, siteId: ctx.siteId }
        : null;

    if (!where) return { action: "error", message: "Provide order_id or order_number.", errorCode: "MISSING_PARAM" };

    const order = await prisma.order.findFirst({
      where: where as any,
      include: {
        items: { include: { product: { select: { name: true, images: { take: 1 } } } } },
        customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
        timeline: { orderBy: { createdAt: "desc" } },
        coupon: { select: { code: true, type: true, value: true } },
      },
    });

    if (!order) return { action: "error", message: "Order not found.", errorCode: "NOT_FOUND" };

    return {
      action: "data",
      message: `Order ${order.orderNumber} details.`,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentReference: order.paymentReference,
        customer: order.customer,
        email: order.email,
        phone: order.phone,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        discount: Number(order.discount),
        tax: Number(order.tax),
        total: Number(order.total),
        currency: order.currency,
        deliveryAddress: order.deliveryAddress,
        deliveryMethod: order.deliveryMethod,
        trackingNumber: order.trackingNumber,
        note: order.note,
        coupon: order.coupon ? { code: order.coupon.code, type: order.coupon.type, value: Number(order.coupon.value) } : null,
        items: order.items.map((item) => ({
          name: item.name,
          variantName: item.variantName,
          sku: item.sku,
          price: Number(item.price),
          quantity: item.quantity,
          total: Number(item.total),
          image: item.product?.images?.[0]?.url,
        })),
        timeline: order.timeline.map((t) => ({
          status: t.status,
          note: t.note,
          createdAt: t.createdAt.toISOString(),
        })),
        createdAt: order.createdAt.toISOString(),
        paidAt: order.paidAt?.toISOString(),
        shippedAt: order.shippedAt?.toISOString(),
        deliveredAt: order.deliveredAt?.toISOString(),
      },
    };
  },
};

const updateOrderStatus: MCPToolDef = {
  name: "update_order_status",
  description: `Update the status of an order. Valid transitions:
- PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
- Any status → CANCELLED (with reason)
- DELIVERED → REFUNDED

Optionally add a tracking number when marking as SHIPPED, or a note for any status change.`,
  category: "orders",
  parameters: {
    type: "object",
    properties: {
      order_id: { type: "string", description: "Order ID" },
      status: { type: "string", enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] },
      note: { type: "string", description: "Note for this status change" },
      tracking_number: { type: "string", description: "Tracking number (when shipping)" },
      cancel_reason: { type: "string", description: "Reason for cancellation" },
    },
    required: ["order_id", "status"],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const order = await prisma.order.findFirst({
      where: { id: params.order_id as string, siteId: ctx.siteId },
    });
    if (!order) return { action: "error", message: "Order not found.", errorCode: "NOT_FOUND" };

    const status = params.status as string;
    const updateData: Record<string, unknown> = { status };

    if (status === "SHIPPED") {
      updateData.shippedAt = new Date();
      if (params.tracking_number) updateData.trackingNumber = params.tracking_number;
    } else if (status === "DELIVERED") {
      updateData.deliveredAt = new Date();
    } else if (status === "CANCELLED") {
      updateData.cancelledAt = new Date();
      if (params.cancel_reason) updateData.cancelReason = params.cancel_reason;
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: updateData as any,
    });

    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status,
        note: (params.note as string) || (params.cancel_reason as string) || null,
        createdBy: ctx.userId,
      },
    });

    await logAudit({
      siteId: ctx.siteId, userId: ctx.userId,
      action: "UPDATE_STATUS", entity: "order", entityId: order.id,
      before: { status: order.status },
      after: { status },
    });

    return {
      action: "done",
      message: `Order ${order.orderNumber} updated to ${status}${params.tracking_number ? ` with tracking number ${params.tracking_number}` : ""}.`,
      data: { orderNumber: order.orderNumber, oldStatus: order.status, newStatus: status },
    };
  },
};

const getOrderStats: MCPToolDef = {
  name: "get_order_stats",
  description: "Get order statistics: total orders, revenue, average order value, orders by status. Great for understanding business performance.",
  category: "orders",
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

    const [totalOrders, paidOrders, statusCounts, recentRevenue] = await Promise.all([
      prisma.order.count({ where: { siteId: ctx.siteId, createdAt: { gte: since } } }),
      prisma.order.aggregate({
        where: { siteId: ctx.siteId, paymentStatus: "PAID", createdAt: { gte: since } },
        _count: { id: true },
        _sum: { total: true },
        _avg: { total: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { siteId: ctx.siteId, createdAt: { gte: since } },
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: { siteId: ctx.siteId, paymentStatus: "PAID", createdAt: { gte: since } },
        _sum: { total: true, deliveryFee: true, discount: true },
      }),
    ]);

    return {
      action: "data",
      message: `Order stats for the last ${days} days.`,
      data: {
        period: `${days} days`,
        totalOrders,
        paidOrders: paidOrders._count.id,
        totalRevenue: Number(recentRevenue._sum.total || 0),
        averageOrderValue: Number(paidOrders._avg.total || 0),
        totalDeliveryFees: Number(recentRevenue._sum.deliveryFee || 0),
        totalDiscounts: Number(recentRevenue._sum.discount || 0),
        currency: ctx.currency,
        byStatus: statusCounts.reduce((acc, s) => {
          acc[s.status] = s._count.id;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  },
};

export const orderTools: MCPToolDef[] = [
  listOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
];
