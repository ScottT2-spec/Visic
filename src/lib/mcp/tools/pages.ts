/**
 * MCP Tools — Pages (Builder)
 */

import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/api-helpers";
import type { MCPToolDef } from "../types";

const listPages: MCPToolDef = {
  name: "list_pages",
  description: "List all store pages (home, about, FAQ, contact, policies, custom, landing).",
  category: "pages",
  parameters: {
    type: "object",
    properties: {
      type: { type: "string", enum: ["HOME", "ABOUT", "CONTACT", "FAQ", "POLICY", "CUSTOM", "LANDING"] },
      published_only: { type: "boolean" },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const where: Record<string, unknown> = { siteId: ctx.siteId };
    if (params.type) where.type = params.type;
    if (params.published_only) where.isPublished = true;

    const pages = await prisma.page.findMany({
      where: where as any,
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });

    return {
      action: "data",
      message: `Found ${pages.length} page${pages.length !== 1 ? "s" : ""}.`,
      data: {
        pages: pages.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          type: p.type,
          isPublished: p.isPublished,
          metaTitle: p.metaTitle,
          updatedAt: p.updatedAt.toISOString(),
        })),
      },
    };
  },
};

const createPage: MCPToolDef = {
  name: "create_page",
  description: `Create a new store page. Navigates to the pages section for review.
Great for: landing pages, policy pages, about pages, custom content.
The page builder supports blocks like hero, text, images, features, FAQ, testimonials, etc.`,
  category: "pages",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Page title" },
      type: { type: "string", enum: ["HOME", "ABOUT", "CONTACT", "FAQ", "POLICY", "CUSTOM", "LANDING"], description: "Page type" },
      meta_title: { type: "string", description: "SEO title" },
      meta_description: { type: "string", description: "SEO description" },
      is_published: { type: "boolean", description: "Publish immediately" },
    },
    required: ["title"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    return {
      action: "verify",
      message: `I'll create a "${params.title}" page. Taking you to the pages section to build and review it.`,
      navigateTo: "pages",
      prefill: {
        title: params.title,
        type: params.type || "CUSTOM",
        metaTitle: params.meta_title || "",
        metaDescription: params.meta_description || "",
        isPublished: params.is_published ?? false,
        _action: "create",
      },
    };
  },
};

const deletePage: MCPToolDef = {
  name: "delete_page",
  description: "Delete a store page. Confirm with the merchant first.",
  category: "pages",
  parameters: {
    type: "object",
    properties: {
      page_id: { type: "string" },
    },
    required: ["page_id"],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const page = await prisma.page.findFirst({
      where: { id: params.page_id as string, siteId: ctx.siteId },
    });
    if (!page) return { action: "error", message: "Page not found.", errorCode: "NOT_FOUND" };

    await prisma.page.delete({ where: { id: page.id } });
    await logAudit({
      siteId: ctx.siteId, userId: ctx.userId,
      action: "DELETE", entity: "page", entityId: page.id,
      before: { title: page.title, type: page.type },
    });

    return { action: "done", message: `Page "${page.title}" deleted.` };
  },
};

const generateStorePages: MCPToolDef = {
  name: "generate_store_pages",
  description: "Use AI to generate complete store pages (Home, About, FAQ, Contact, Policies) with professional content tailored to the business. This replaces any existing generated pages.",
  category: "pages",
  parameters: {
    type: "object",
    properties: {
      business_description: { type: "string", description: "Description of the business for content generation" },
    },
    required: [],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    return {
      action: "verify",
      message: "I'll generate professional store pages (Home, About, FAQ, Contact, Policies) using AI. Taking you to the AI page to trigger the generation and review the results.",
      navigateTo: "pages",
      prefill: {
        _action: "ai_generate",
        businessDescription: params.business_description || "",
      },
    };
  },
};

export const pageTools: MCPToolDef[] = [
  listPages,
  createPage,
  deletePage,
  generateStorePages,
];
