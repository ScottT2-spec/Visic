/**
 * MCP Tools — Customers
 */

import { prisma } from "@/lib/db";
import type { MCPToolDef } from "../types";

const listCustomers: MCPToolDef = {
  name: "list_customers",
  description: "List store customers with optional search by name, email, or phone. Shows order count and total spent.",
  category: "customers",
  parameters: {
    type: "object",
    properties: {
      search: { type: "string", description: "Search by name, email, or phone" },
      sort_by: { type: "string", enum: ["recent", "top_spenders", "most_orders"], description: "Sort order" },
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
    const where: Record<string, unknown> = { siteId: ctx.siteId };

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search as string, mode: "insensitive" } },
        { lastName: { contains: params.search as string, mode: "insensitive" } },
        { email: { contains: params.search as string, mode: "insensitive" } },
        { phone: { contains: params.search as string, mode: "insensitive" } },
      ];
    }

    const orderBy: any =
      params.sort_by === "top_spenders" ? { totalSpent: "desc" } :
      params.sort_by === "most_orders" ? { totalOrders: "desc" } :
      { createdAt: "desc" };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: where as any,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where: where as any }),
    ]);

    return {
      action: "data",
      message: `Found ${total} customer${total !== 1 ? "s" : ""}.`,
      data: {
        customers: customers.map((c) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          phone: c.phone,
          totalOrders: c.totalOrders,
          totalSpent: Number(c.totalSpent),
          tags: c.tags,
          createdAt: c.createdAt.toISOString(),
        })),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        currency: ctx.currency,
      },
    };
  },
};

const getCustomer: MCPToolDef = {
  name: "get_customer",
  description: "Get full details of a customer including their order history and notes.",
  category: "customers",
  parameters: {
    type: "object",
    properties: {
      customer_id: { type: "string", description: "Customer ID" },
      email: { type: "string", description: "Customer email (alternative)" },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const where = params.customer_id
      ? { id: params.customer_id as string, siteId: ctx.siteId }
      : params.email
        ? { siteId_email: { siteId: ctx.siteId, email: params.email as string } }
        : null;

    if (!where) return { action: "error", message: "Provide customer_id or email.", errorCode: "MISSING_PARAM" };

    const customer = await prisma.customer.findFirst({
      where: where as any,
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { rating: true, title: true, body: true, createdAt: true },
        },
      },
    });

    if (!customer) return { action: "error", message: "Customer not found.", errorCode: "NOT_FOUND" };

    return {
      action: "data",
      message: `Customer: ${customer.firstName} ${customer.lastName}`,
      data: {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        tags: customer.tags,
        note: customer.note,
        totalOrders: customer.totalOrders,
        totalSpent: Number(customer.totalSpent),
        recentOrders: customer.orders.map((o) => ({
          orderNumber: o.orderNumber,
          status: o.status,
          total: Number(o.total),
          date: o.createdAt.toISOString(),
        })),
        recentReviews: customer.reviews,
        createdAt: customer.createdAt.toISOString(),
        currency: ctx.currency,
      },
    };
  },
};

const createCustomer: MCPToolDef = {
  name: "create_customer",
  description: "Add a new customer to the store. Navigates to customers page for review.",
  category: "customers",
  parameters: {
    type: "object",
    properties: {
      email: { type: "string" },
      first_name: { type: "string" },
      last_name: { type: "string" },
      phone: { type: "string" },
      address: {
        type: "object",
        properties: {
          line1: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          country: { type: "string" },
        },
      },
      tags: { type: "array", items: { type: "string" } },
      note: { type: "string" },
    },
    required: ["email", "first_name", "last_name"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    const existing = await prisma.customer.findFirst({
      where: { siteId: ctx.siteId, email: params.email as string },
    });
    if (existing) {
      return { action: "error", message: `A customer with email ${params.email} already exists.`, errorCode: "DUPLICATE" };
    }

    return {
      action: "verify",
      message: `I'll add ${params.first_name} ${params.last_name} as a customer. Taking you to the customers page to review.`,
      navigateTo: "customers",
      prefill: {
        email: params.email,
        firstName: params.first_name,
        lastName: params.last_name,
        phone: params.phone || "",
        address: params.address || null,
        tags: params.tags || [],
        note: params.note || "",
        _action: "create",
      },
    };
  },
};

const getCustomerStats: MCPToolDef = {
  name: "get_customer_stats",
  description: "Get customer analytics: total customers, new customers, top spenders, repeat customer rate.",
  category: "customers",
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

    const [total, newCustomers, topSpenders, repeatCustomers] = await Promise.all([
      prisma.customer.count({ where: { siteId: ctx.siteId } }),
      prisma.customer.count({ where: { siteId: ctx.siteId, createdAt: { gte: since } } }),
      prisma.customer.findMany({
        where: { siteId: ctx.siteId },
        orderBy: { totalSpent: "desc" },
        take: 5,
        select: { firstName: true, lastName: true, email: true, totalOrders: true, totalSpent: true },
      }),
      prisma.customer.count({ where: { siteId: ctx.siteId, totalOrders: { gte: 2 } } }),
    ]);

    return {
      action: "data",
      message: `Customer stats for the last ${days} days.`,
      data: {
        totalCustomers: total,
        newCustomers,
        repeatCustomers,
        repeatRate: total > 0 ? `${((repeatCustomers / total) * 100).toFixed(1)}%` : "0%",
        topSpenders: topSpenders.map((c) => ({
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          orders: c.totalOrders,
          spent: Number(c.totalSpent),
        })),
        currency: ctx.currency,
      },
    };
  },
};

export const customerTools: MCPToolDef[] = [
  listCustomers,
  getCustomer,
  createCustomer,
  getCustomerStats,
];
