/**
 * MCP Tools — Categories
 */

import { prisma } from "@/lib/db";
import { ensureUniqueSlug, logAudit } from "@/lib/api-helpers";
import type { MCPToolDef, MCPContext, MCPToolResult } from "../types";

const listCategories: MCPToolDef = {
  name: "list_categories",
  description: "List all product categories in the store with product counts. Use this before creating products to know available categories, or before suggesting category creation.",
  category: "categories",
  parameters: { type: "object", properties: {}, required: [] },
  mutates: false,
  requiresVerification: false,
  execute: async (_params, ctx) => {
    const categories = await prisma.category.findMany({
      where: { siteId: ctx.siteId },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        _count: { select: { products: true } },
      },
      orderBy: { position: "asc" },
    });

    return {
      action: "data",
      message: categories.length > 0
        ? `Found ${categories.length} categor${categories.length !== 1 ? "ies" : "y"}.`
        : "No categories yet. Would you like me to create some?",
      data: {
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image,
          productCount: c._count.products,
          parent: c.parent,
          children: c.children,
        })),
      },
    };
  },
};

const createCategory: MCPToolDef = {
  name: "create_category",
  description: `Create a new product category. Ask the merchant for:
- Category name
- Description (optional)
- Parent category (if it's a subcategory)

Suggest good category structures based on the store's business type.`,
  category: "categories",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Category name" },
      description: { type: "string", description: "Category description" },
      image: { type: "string", description: "Category image URL" },
      parent_id: { type: "string", description: "Parent category ID for subcategories" },
    },
    required: ["name"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    if (params.parent_id) {
      const parent = await prisma.category.findFirst({
        where: { id: params.parent_id as string, siteId: ctx.siteId },
      });
      if (!parent) {
        return { action: "error", message: "Parent category not found.", errorCode: "NOT_FOUND" };
      }
    }

    // Check for duplicate name
    const existing = await prisma.category.findFirst({
      where: { siteId: ctx.siteId, name: { equals: params.name as string, mode: "insensitive" } },
    });
    if (existing) {
      return { action: "error", message: `A category named "${params.name}" already exists.`, errorCode: "DUPLICATE" };
    }

    return {
      action: "verify",
      message: `I'll create the category "${params.name}"${params.parent_id ? " as a subcategory" : ""}. Taking you to the categories page to review.`,
      navigateTo: "categories",
      prefill: {
        name: params.name,
        description: params.description || "",
        image: params.image || null,
        parentId: params.parent_id || null,
        _action: "create",
      },
    };
  },
};

const updateCategory: MCPToolDef = {
  name: "update_category",
  description: "Update an existing category's name, description, or image.",
  category: "categories",
  parameters: {
    type: "object",
    properties: {
      category_id: { type: "string", description: "Category ID" },
      name: { type: "string" },
      description: { type: "string" },
      image: { type: "string" },
      parent_id: { type: "string", description: "New parent category ID (null to make top-level)" },
    },
    required: ["category_id"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    const cat = await prisma.category.findFirst({
      where: { id: params.category_id as string, siteId: ctx.siteId },
    });
    if (!cat) {
      return { action: "error", message: "Category not found.", errorCode: "NOT_FOUND" };
    }

    return {
      action: "verify",
      message: `I'll update the category "${cat.name}". Taking you to categories to review.`,
      navigateTo: "categories",
      prefill: {
        id: cat.id,
        name: (params.name as string) ?? cat.name,
        description: (params.description as string) ?? cat.description ?? "",
        image: (params.image as string) ?? cat.image,
        parentId: params.parent_id !== undefined ? params.parent_id : cat.parentId,
        _action: "update",
      },
    };
  },
};

const deleteCategory: MCPToolDef = {
  name: "delete_category",
  description: "Delete a product category. Products in this category will become uncategorized. Confirm with merchant first.",
  category: "categories",
  parameters: {
    type: "object",
    properties: {
      category_id: { type: "string", description: "Category ID to delete" },
    },
    required: ["category_id"],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const cat = await prisma.category.findFirst({
      where: { id: params.category_id as string, siteId: ctx.siteId },
      include: { _count: { select: { products: true, children: true } } },
    });
    if (!cat) {
      return { action: "error", message: "Category not found.", errorCode: "NOT_FOUND" };
    }

    await prisma.category.updateMany({ where: { parentId: cat.id }, data: { parentId: null } });
    await prisma.product.updateMany({ where: { categoryId: cat.id }, data: { categoryId: null } });
    await prisma.category.delete({ where: { id: cat.id } });

    await logAudit({
      siteId: ctx.siteId, userId: ctx.userId,
      action: "DELETE", entity: "category", entityId: cat.id,
      before: { name: cat.name, products: cat._count.products },
    });

    return {
      action: "done",
      message: `Category "${cat.name}" deleted. ${cat._count.products} product(s) are now uncategorized${cat._count.children > 0 ? ` and ${cat._count.children} subcategories are now top-level` : ""}.`,
    };
  },
};

const bulkCreateCategories: MCPToolDef = {
  name: "bulk_create_categories",
  description: "Create multiple categories at once. Great for initial store setup. Navigates to categories page for review.",
  category: "categories",
  parameters: {
    type: "object",
    properties: {
      categories: {
        type: "array",
        description: "Array of categories to create",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
          },
          required: ["name"],
        },
      },
    },
    required: ["categories"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    const cats = params.categories as Array<{ name: string; description?: string }>;

    return {
      action: "verify",
      message: `I've prepared ${cats.length} categories: ${cats.map((c) => c.name).join(", ")}. Taking you to the categories page to review.`,
      navigateTo: "categories",
      prefill: {
        _action: "bulk_create",
        categories: cats,
      },
    };
  },
};

export const categoryTools: MCPToolDef[] = [
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkCreateCategories,
];
