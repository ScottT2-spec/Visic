/**
 * MCP Tools — Products
 *
 * Every product operation a merchant can do:
 * list, search, get, create, update, delete, bulk update status,
 * manage images, manage variants, duplicate.
 */

import { prisma } from "@/lib/db";
import { ensureUniqueSlug, logAudit } from "@/lib/api-helpers";
import type { MCPToolDef, MCPContext, MCPToolResult } from "../types";

// ─── LIST PRODUCTS ──────────────────────────────────────────

const listProducts: MCPToolDef = {
  name: "list_products",
  description:
    "List products in the store with optional filters. Returns product names, prices, stock, status, and category. Use this to see what products exist before making changes.",
  category: "products",
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["ACTIVE", "DRAFT", "ARCHIVED"],
        description: "Filter by product status",
      },
      category: {
        type: "string",
        description: "Filter by category ID",
      },
      search: {
        type: "string",
        description: "Search by product name, SKU, or tag",
      },
      page: {
        type: "number",
        description: "Page number (default 1)",
      },
      limit: {
        type: "number",
        description: "Items per page (default 20, max 100)",
      },
      featured_only: {
        type: "boolean",
        description: "Only return featured products",
      },
      low_stock: {
        type: "boolean",
        description: "Only return products with stock below their low stock alert threshold",
      },
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
    if (params.category) where.categoryId = params.category;
    if (params.featured_only) where.isFeatured = true;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search as string, mode: "insensitive" } },
        { sku: { contains: params.search as string, mode: "insensitive" } },
        { tags: { has: params.search as string } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: where as any,
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          category: { select: { id: true, name: true } },
          _count: { select: { reviews: true, orderItems: true, variants: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: where as any }),
    ]);

    // Filter low stock if requested
    let filtered = products;
    if (params.low_stock) {
      filtered = products.filter((p) => p.trackInventory && p.stock <= p.lowStockAlert);
    }

    const formatted = filtered.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      stock: p.stock,
      status: p.status,
      isFeatured: p.isFeatured,
      category: p.category?.name || "Uncategorized",
      categoryId: p.categoryId,
      image: p.images[0]?.url || null,
      reviews: p._count.reviews,
      orders: p._count.orderItems,
      variants: p._count.variants,
      tags: p.tags,
      sku: p.sku,
      trackInventory: p.trackInventory,
      lowStockAlert: p.lowStockAlert,
      createdAt: p.createdAt.toISOString(),
    }));

    return {
      action: "data",
      message: `Found ${total} product${total !== 1 ? "s" : ""}${params.status ? ` with status ${params.status}` : ""}${params.search ? ` matching "${params.search}"` : ""}.`,
      data: {
        products: formatted,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  },
};

// ─── GET PRODUCT DETAILS ────────────────────────────────────

const getProduct: MCPToolDef = {
  name: "get_product",
  description:
    "Get full details of a specific product including all images, variants, reviews, and order history. Use product ID or slug.",
  category: "products",
  parameters: {
    type: "object",
    properties: {
      product_id: {
        type: "string",
        description: "Product ID",
      },
      slug: {
        type: "string",
        description: "Product slug (alternative to product_id)",
      },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const where = params.product_id
      ? { id: params.product_id as string, siteId: ctx.siteId }
      : params.slug
        ? { siteId_slug: { siteId: ctx.siteId, slug: params.slug as string } }
        : null;

    if (!where) {
      return { action: "error", message: "Please provide either a product_id or slug.", errorCode: "MISSING_PARAM" };
    }

    const product = await prisma.product.findFirst({
      where: where as any,
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { position: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, rating: true, title: true, body: true, createdAt: true },
        },
        _count: { select: { reviews: true, orderItems: true } },
      },
    });

    if (!product) {
      return { action: "error", message: "Product not found.", errorCode: "NOT_FOUND" };
    }

    return {
      action: "data",
      message: `Here are the full details for "${product.name}".`,
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        costPrice: product.costPrice ? Number(product.costPrice) : null,
        currency: product.currency,
        sku: product.sku,
        barcode: product.barcode,
        stock: product.stock,
        lowStockAlert: product.lowStockAlert,
        trackInventory: product.trackInventory,
        weight: product.weight ? Number(product.weight) : null,
        status: product.status,
        isFeatured: product.isFeatured,
        tags: product.tags,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        category: product.category,
        images: product.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt })),
        variants: product.variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: v.price ? Number(v.price) : null,
          stock: v.stock,
          options: v.options,
          image: v.image,
        })),
        recentReviews: product.reviews,
        totalReviews: product._count.reviews,
        totalOrders: product._count.orderItems,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
    };
  },
};

// ─── CREATE PRODUCT (VERIFY) ────────────────────────────────

const createProduct: MCPToolDef = {
  name: "create_product",
  description: `Prepare a new product for the store. This will pre-fill the product form and navigate the merchant to review it before saving. The merchant can add images and make final adjustments.

IMPORTANT: Before calling this, ask the merchant for:
- Product name
- Price
- Description (or offer to generate one)
- Category (show available categories)
- Stock quantity
- Whether it has variants (sizes, colors, etc.)
- Any tags

Generate a compelling, conversion-focused product description if the merchant doesn't provide one.`,
  category: "products",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Product name" },
      description: { type: "string", description: "Product description (rich, conversion-focused)" },
      price: { type: "number", description: "Price in store currency" },
      compare_at_price: { type: "number", description: "Original/compare-at price (for showing discounts)" },
      cost_price: { type: "number", description: "Cost price (for profit tracking)" },
      sku: { type: "string", description: "SKU code" },
      stock: { type: "number", description: "Initial stock quantity" },
      track_inventory: { type: "boolean", description: "Whether to track inventory (default true)" },
      category_id: { type: "string", description: "Category ID to assign to" },
      status: {
        type: "string",
        enum: ["ACTIVE", "DRAFT"],
        description: "Product status (default DRAFT so merchant can add images first)",
      },
      is_featured: { type: "boolean", description: "Whether to feature this product" },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "Product tags for search and filtering",
      },
      meta_title: { type: "string", description: "SEO title" },
      meta_description: { type: "string", description: "SEO meta description" },
      variants: {
        type: "array",
        description: "Product variants (sizes, colors, etc.)",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Variant name (e.g. 'Large / Red')" },
            sku: { type: "string" },
            price: { type: "number", description: "Variant-specific price (optional)" },
            stock: { type: "number", description: "Variant stock" },
            options: {
              type: "object",
              description: "Key-value pairs like {size: 'L', color: 'Red'}",
              additionalProperties: { type: "string" },
            },
          },
          required: ["name", "options"],
        },
      },
    },
    required: ["name", "price"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    // Validate category exists if provided
    if (params.category_id) {
      const cat = await prisma.category.findFirst({
        where: { id: params.category_id as string, siteId: ctx.siteId },
      });
      if (!cat) {
        return {
          action: "error",
          message: "The specified category doesn't exist. Let me show you the available categories.",
          errorCode: "INVALID_CATEGORY",
        };
      }
    }

    // Validate pricing
    if (params.cost_price && (params.cost_price as number) >= (params.price as number)) {
      return {
        action: "error",
        message: "Cost price must be lower than the selling price.",
        errorCode: "INVALID_PRICE",
      };
    }

    const prefill: Record<string, unknown> = {
      name: params.name,
      description: params.description || "",
      price: params.price,
      compareAtPrice: params.compare_at_price || null,
      costPrice: params.cost_price || null,
      sku: params.sku || "",
      stock: params.stock ?? 0,
      trackInventory: params.track_inventory !== false,
      categoryId: params.category_id || null,
      status: params.status || "DRAFT",
      isFeatured: params.is_featured || false,
      tags: params.tags || [],
      metaTitle: params.meta_title || "",
      metaDescription: params.meta_description || "",
      images: [],
      variants: params.variants
        ? (params.variants as any[]).map((v) => ({
            name: v.name,
            sku: v.sku || "",
            price: v.price || null,
            stock: v.stock || 0,
            options: v.options || {},
            image: null,
          }))
        : [],
    };

    return {
      action: "verify",
      message: `I've prepared the product "${params.name}" with a price of ${ctx.currency} ${(params.price as number).toLocaleString()}. I'm taking you to the product form so you can review everything, add images, and save it when you're ready.`,
      navigateTo: "products/new",
      prefill,
    };
  },
};

// ─── UPDATE PRODUCT (VERIFY) ────────────────────────────────

const updateProduct: MCPToolDef = {
  name: "update_product",
  description: `Update an existing product. This will navigate the merchant to the product edit form pre-filled with the updated values so they can review before saving.

Use get_product first to see current values, then only change what's needed.`,
  category: "products",
  parameters: {
    type: "object",
    properties: {
      product_id: { type: "string", description: "Product ID to update" },
      name: { type: "string" },
      description: { type: "string" },
      price: { type: "number" },
      compare_at_price: { type: "number" },
      cost_price: { type: "number" },
      sku: { type: "string" },
      stock: { type: "number" },
      track_inventory: { type: "boolean" },
      category_id: { type: "string" },
      status: { type: "string", enum: ["ACTIVE", "DRAFT", "ARCHIVED"] },
      is_featured: { type: "boolean" },
      tags: { type: "array", items: { type: "string" } },
      meta_title: { type: "string" },
      meta_description: { type: "string" },
    },
    required: ["product_id"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    const product = await prisma.product.findFirst({
      where: { id: params.product_id as string, siteId: ctx.siteId },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { position: "asc" } },
      },
    });

    if (!product) {
      return { action: "error", message: "Product not found.", errorCode: "NOT_FOUND" };
    }

    // Merge existing data with updates
    const prefill: Record<string, unknown> = {
      name: (params.name as string) ?? product.name,
      description: (params.description as string) ?? product.description ?? "",
      price: (params.price as number) ?? Number(product.price),
      compareAtPrice: params.compare_at_price ?? (product.compareAtPrice ? Number(product.compareAtPrice) : null),
      costPrice: params.cost_price ?? (product.costPrice ? Number(product.costPrice) : null),
      sku: (params.sku as string) ?? product.sku ?? "",
      stock: (params.stock as number) ?? product.stock,
      trackInventory: params.track_inventory ?? product.trackInventory,
      categoryId: (params.category_id as string) ?? product.categoryId,
      status: (params.status as string) ?? product.status,
      isFeatured: params.is_featured ?? product.isFeatured,
      tags: (params.tags as string[]) ?? product.tags,
      metaTitle: (params.meta_title as string) ?? product.metaTitle ?? "",
      metaDescription: (params.meta_description as string) ?? product.metaDescription ?? "",
      images: product.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt })),
      variants: product.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku || "",
        price: v.price ? Number(v.price) : null,
        stock: v.stock,
        options: v.options,
        image: v.image,
      })),
    };

    const changes: string[] = [];
    if (params.name && params.name !== product.name) changes.push(`name → "${params.name}"`);
    if (params.price && params.price !== Number(product.price)) changes.push(`price → ${ctx.currency} ${(params.price as number).toLocaleString()}`);
    if (params.stock !== undefined && params.stock !== product.stock) changes.push(`stock → ${params.stock}`);
    if (params.status && params.status !== product.status) changes.push(`status → ${params.status}`);
    if (params.description) changes.push("description updated");

    return {
      action: "verify",
      message: `I've prepared updates for "${product.name}"${changes.length > 0 ? `: ${changes.join(", ")}` : ""}. Taking you to the edit form to review and save.`,
      navigateTo: `products/${params.product_id}/edit` as any,
      prefill,
    };
  },
};

// ─── DELETE PRODUCT ─────────────────────────────────────────

const deleteProduct: MCPToolDef = {
  name: "delete_product",
  description:
    "Delete a product from the store. This is permanent. Always confirm with the merchant before deleting.",
  category: "products",
  parameters: {
    type: "object",
    properties: {
      product_id: { type: "string", description: "Product ID to delete" },
    },
    required: ["product_id"],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const product = await prisma.product.findFirst({
      where: { id: params.product_id as string, siteId: ctx.siteId },
      include: { _count: { select: { orderItems: true } } },
    });

    if (!product) {
      return { action: "error", message: "Product not found.", errorCode: "NOT_FOUND" };
    }

    if (product._count.orderItems > 0) {
      return {
        action: "error",
        message: `"${product.name}" has ${product._count.orderItems} order(s) linked to it. Consider archiving it instead of deleting.`,
        errorCode: "HAS_ORDERS",
      };
    }

    await prisma.product.delete({ where: { id: product.id } });

    await logAudit({
      siteId: ctx.siteId,
      userId: ctx.userId,
      action: "DELETE",
      entity: "product",
      entityId: product.id,
      before: { name: product.name, price: Number(product.price) },
    });

    return {
      action: "done",
      message: `Product "${product.name}" has been permanently deleted.`,
    };
  },
};

// ─── BULK UPDATE PRODUCT STATUS ─────────────────────────────

const bulkUpdateProductStatus: MCPToolDef = {
  name: "bulk_update_product_status",
  description:
    "Update the status of multiple products at once (e.g., publish all drafts, archive old products).",
  category: "products",
  parameters: {
    type: "object",
    properties: {
      product_ids: {
        type: "array",
        items: { type: "string" },
        description: "Array of product IDs to update",
      },
      status: {
        type: "string",
        enum: ["ACTIVE", "DRAFT", "ARCHIVED"],
        description: "New status for all specified products",
      },
    },
    required: ["product_ids", "status"],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const ids = params.product_ids as string[];
    const status = params.status as string;

    const result = await prisma.product.updateMany({
      where: { id: { in: ids }, siteId: ctx.siteId },
      data: { status: status as any },
    });

    await logAudit({
      siteId: ctx.siteId,
      userId: ctx.userId,
      action: "BULK_UPDATE",
      entity: "product",
      after: { ids, status, count: result.count },
    });

    return {
      action: "done",
      message: `Updated ${result.count} product${result.count !== 1 ? "s" : ""} to ${status}.`,
      data: { updated: result.count },
    };
  },
};

// ─── DUPLICATE PRODUCT ──────────────────────────────────────

const duplicateProduct: MCPToolDef = {
  name: "duplicate_product",
  description:
    "Duplicate an existing product. Creates a copy with '(Copy)' appended to the name, set to DRAFT status. Navigates merchant to the form to review.",
  category: "products",
  parameters: {
    type: "object",
    properties: {
      product_id: { type: "string", description: "Product ID to duplicate" },
      new_name: { type: "string", description: "Optional new name for the copy" },
    },
    required: ["product_id"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    const product = await prisma.product.findFirst({
      where: { id: params.product_id as string, siteId: ctx.siteId },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { position: "asc" } },
      },
    });

    if (!product) {
      return { action: "error", message: "Product not found.", errorCode: "NOT_FOUND" };
    }

    const newName = (params.new_name as string) || `${product.name} (Copy)`;

    const prefill: Record<string, unknown> = {
      name: newName,
      description: product.description || "",
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      sku: "",
      stock: product.stock,
      trackInventory: product.trackInventory,
      categoryId: product.categoryId,
      status: "DRAFT",
      isFeatured: false,
      tags: product.tags,
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
      variants: product.variants.map((v) => ({
        name: v.name,
        sku: "",
        price: v.price ? Number(v.price) : null,
        stock: v.stock,
        options: v.options,
        image: v.image,
      })),
    };

    return {
      action: "verify",
      message: `I've prepared a copy of "${product.name}" as "${newName}". Taking you to the form to review and save.`,
      navigateTo: "products/new",
      prefill,
    };
  },
};

// ─── GET PRODUCT ANALYTICS ──────────────────────────────────

const getProductAnalytics: MCPToolDef = {
  name: "get_product_analytics",
  description:
    "Get performance analytics for a specific product: views, add-to-carts, purchases, revenue, and conversion rate.",
  category: "products",
  parameters: {
    type: "object",
    properties: {
      product_id: { type: "string", description: "Product ID" },
      days: { type: "number", description: "Number of days to look back (default 30)" },
    },
    required: ["product_id"],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const productId = params.product_id as string;
    const days = (params.days as number) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const product = await prisma.product.findFirst({
      where: { id: productId, siteId: ctx.siteId },
      select: { name: true, price: true },
    });

    if (!product) {
      return { action: "error", message: "Product not found.", errorCode: "NOT_FOUND" };
    }

    const [views, addToCarts, purchases, orderItems] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { siteId: ctx.siteId, productId, event: "page_view", createdAt: { gte: since } },
      }),
      prisma.analyticsEvent.count({
        where: { siteId: ctx.siteId, productId, event: "add_to_cart", createdAt: { gte: since } },
      }),
      prisma.analyticsEvent.count({
        where: { siteId: ctx.siteId, productId, event: "purchase", createdAt: { gte: since } },
      }),
      prisma.orderItem.findMany({
        where: {
          productId,
          order: { siteId: ctx.siteId, createdAt: { gte: since }, paymentStatus: "PAID" },
        },
        select: { quantity: true, total: true },
      }),
    ]);

    const totalRevenue = orderItems.reduce((sum, item) => sum + Number(item.total), 0);
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const conversionRate = views > 0 ? ((purchases / views) * 100).toFixed(1) : "0";

    return {
      action: "data",
      message: `Analytics for "${product.name}" over the last ${days} days.`,
      data: {
        productName: product.name,
        period: `${days} days`,
        views,
        addToCarts,
        purchases,
        addToCartRate: views > 0 ? `${((addToCarts / views) * 100).toFixed(1)}%` : "0%",
        conversionRate: `${conversionRate}%`,
        unitsSold: totalQuantity,
        revenue: totalRevenue,
        currency: ctx.currency,
      },
    };
  },
};

export const productTools: MCPToolDef[] = [
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProductStatus,
  duplicateProduct,
  getProductAnalytics,
];
