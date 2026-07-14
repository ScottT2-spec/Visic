/**
 * MCP Tools — Reviews & Messages
 */

import { prisma } from "@/lib/db";
import type { MCPToolDef } from "../types";

const listReviews: MCPToolDef = {
  name: "list_reviews",
  description: "List product reviews with optional filters. Shows pending reviews that need moderation.",
  category: "reviews",
  parameters: {
    type: "object",
    properties: {
      product_id: { type: "string", description: "Filter by product" },
      pending_only: { type: "boolean", description: "Only show reviews awaiting approval" },
      min_rating: { type: "number", description: "Minimum rating filter" },
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

    const where: Record<string, unknown> = {
      product: { siteId: ctx.siteId },
    };
    if (params.product_id) where.productId = params.product_id;
    if (params.pending_only) where.isApproved = false;
    if (params.min_rating) where.rating = { gte: params.min_rating };

    const [reviews, total, avgRating] = await Promise.all([
      prisma.review.findMany({
        where: where as any,
        include: { product: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: where as any }),
      prisma.review.aggregate({
        where: { product: { siteId: ctx.siteId }, isApproved: true },
        _avg: { rating: true },
        _count: { id: true },
      }),
    ]);

    const pendingCount = await prisma.review.count({
      where: { product: { siteId: ctx.siteId }, isApproved: false },
    });

    return {
      action: "data",
      message: `Found ${total} review${total !== 1 ? "s" : ""}${pendingCount > 0 ? ` (${pendingCount} pending approval)` : ""}.`,
      data: {
        reviews: reviews.map((r) => ({
          id: r.id,
          productName: r.product.name,
          name: r.name,
          email: r.email,
          rating: r.rating,
          title: r.title,
          body: r.body,
          isApproved: r.isApproved,
          isVerified: r.isVerified,
          images: r.images,
          createdAt: r.createdAt.toISOString(),
        })),
        stats: {
          averageRating: avgRating._avg.rating ? Number(avgRating._avg.rating.toFixed(1)) : 0,
          totalApproved: avgRating._count.id,
          pendingApproval: pendingCount,
        },
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  },
};

const moderateReview: MCPToolDef = {
  name: "moderate_review",
  description: "Approve, reject (delete), or verify a review.",
  category: "reviews",
  parameters: {
    type: "object",
    properties: {
      review_id: { type: "string" },
      action: { type: "string", enum: ["approve", "reject", "verify"], description: "approve=publish, reject=delete, verify=mark as verified purchase" },
    },
    required: ["review_id", "action"],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const review = await prisma.review.findFirst({
      where: { id: params.review_id as string, product: { siteId: ctx.siteId } },
      include: { product: { select: { name: true } } },
    });
    if (!review) return { action: "error", message: "Review not found.", errorCode: "NOT_FOUND" };

    if (params.action === "reject") {
      await prisma.review.delete({ where: { id: review.id } });
      return { action: "done", message: `Review by ${review.name} on "${review.product.name}" has been rejected and removed.` };
    }

    const data: Record<string, unknown> = {};
    if (params.action === "approve") data.isApproved = true;
    if (params.action === "verify") data.isVerified = true;

    await prisma.review.update({ where: { id: review.id }, data });

    return {
      action: "done",
      message: `Review by ${review.name} on "${review.product.name}" has been ${params.action === "approve" ? "approved" : "verified"}.`,
    };
  },
};

const bulkModerateReviews: MCPToolDef = {
  name: "bulk_moderate_reviews",
  description: "Approve or reject multiple reviews at once.",
  category: "reviews",
  parameters: {
    type: "object",
    properties: {
      review_ids: { type: "array", items: { type: "string" } },
      action: { type: "string", enum: ["approve", "reject"] },
    },
    required: ["review_ids", "action"],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const ids = params.review_ids as string[];

    // Verify all reviews belong to this store
    const reviews = await prisma.review.findMany({
      where: { id: { in: ids }, product: { siteId: ctx.siteId } },
    });

    if (reviews.length === 0) return { action: "error", message: "No matching reviews found.", errorCode: "NOT_FOUND" };

    if (params.action === "reject") {
      await prisma.review.deleteMany({ where: { id: { in: reviews.map((r) => r.id) } } });
      return { action: "done", message: `${reviews.length} review(s) rejected and removed.` };
    }

    await prisma.review.updateMany({
      where: { id: { in: reviews.map((r) => r.id) } },
      data: { isApproved: true },
    });

    return { action: "done", message: `${reviews.length} review(s) approved.` };
  },
};

// ─── CONTACT MESSAGES ───────────────────────────────────────

const listMessages: MCPToolDef = {
  name: "list_contact_messages",
  description: "List contact messages from customers. Shows unread count.",
  category: "messages",
  parameters: {
    type: "object",
    properties: {
      unread_only: { type: "boolean" },
      page: { type: "number" },
      limit: { type: "number" },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const page = (params.page as number) || 1;
    const limit = Math.min((params.limit as number) || 20, 50);
    const where: Record<string, unknown> = { siteId: ctx.siteId };
    if (params.unread_only) where.isRead = false;

    const [messages, total, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where: where as any,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactMessage.count({ where: where as any }),
      prisma.contactMessage.count({ where: { siteId: ctx.siteId, isRead: false } }),
    ]);

    return {
      action: "data",
      message: `${total} message${total !== 1 ? "s" : ""}${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}.`,
      data: {
        messages: messages.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          subject: m.subject,
          message: m.message,
          isRead: m.isRead,
          createdAt: m.createdAt.toISOString(),
        })),
        unreadCount,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  },
};

const markMessagesRead: MCPToolDef = {
  name: "mark_messages_read",
  description: "Mark contact messages as read.",
  category: "messages",
  parameters: {
    type: "object",
    properties: {
      message_ids: { type: "array", items: { type: "string" }, description: "Message IDs to mark as read" },
      mark_all: { type: "boolean", description: "Mark all messages as read" },
    },
    required: [],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    if (params.mark_all) {
      const result = await prisma.contactMessage.updateMany({
        where: { siteId: ctx.siteId, isRead: false },
        data: { isRead: true },
      });
      return { action: "done", message: `Marked ${result.count} message(s) as read.` };
    }

    if (params.message_ids && (params.message_ids as string[]).length > 0) {
      await prisma.contactMessage.updateMany({
        where: { siteId: ctx.siteId, id: { in: params.message_ids as string[] } },
        data: { isRead: true },
      });
      return { action: "done", message: `Marked ${(params.message_ids as string[]).length} message(s) as read.` };
    }

    return { action: "error", message: "Provide message_ids or set mark_all to true.", errorCode: "MISSING_PARAM" };
  },
};

export const reviewTools: MCPToolDef[] = [
  listReviews,
  moderateReview,
  bulkModerateReviews,
  listMessages,
  markMessagesRead,
];
