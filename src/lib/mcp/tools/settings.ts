/**
 * MCP Tools — Store Settings, Themes, Plugins, Payments, Team Members
 */

import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/api-helpers";
import type { MCPToolDef } from "../types";

// ─── STORE SETTINGS ─────────────────────────────────────────

const getSettings: MCPToolDef = {
  name: "get_store_settings",
  description: "Get current store settings: checkout options, WhatsApp, SEO, tracking pixels, language, and more.",
  category: "settings",
  parameters: { type: "object", properties: {}, required: [] },
  mutates: false,
  requiresVerification: false,
  execute: async (_params, ctx) => {
    const [settings, social, store] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { siteId: ctx.siteId } }),
      prisma.siteSocialLinks.findUnique({ where: { siteId: ctx.siteId } }),
      prisma.site.findUnique({
        where: { id: ctx.siteId },
        select: { name: true, slug: true, description: true, logo: true, coverImage: true, currency: true, country: true, businessType: true, subdomain: true, customDomain: true },
      }),
    ]);

    return {
      action: "data",
      message: "Current store settings.",
      data: {
        store: store,
        settings: settings ? {
          allowGuestCheckout: settings.allowGuestCheckout,
          payOnDelivery: settings.payOnDelivery,
          bankTransfer: settings.bankTransfer,
          whatsappOrdering: settings.whatsappOrdering,
          showStockCount: settings.showStockCount,
          lowDataMode: settings.lowDataMode,
          language: settings.language,
          whatsappNumber: settings.whatsappNumber,
          metaTitle: settings.metaTitle,
          metaDescription: settings.metaDescription,
          googleAnalyticsId: settings.googleAnalyticsId,
          facebookPixelId: settings.facebookPixelId,
          tiktokPixelId: settings.tiktokPixelId,
        } : "Not configured yet",
        socialLinks: social ? {
          whatsapp: social.whatsapp,
          instagram: social.instagram,
          facebook: social.facebook,
          twitter: social.twitter,
          tiktok: social.tiktok,
        } : "Not configured yet",
      },
    };
  },
};

const updateSettings: MCPToolDef = {
  name: "update_store_settings",
  description: `Update store settings. Navigates to settings page for review. Can update:
- Checkout options (guest checkout, pay on delivery, bank transfer, WhatsApp ordering)
- WhatsApp number for orders
- SEO (meta title, meta description)
- Tracking pixels (Google Analytics, Facebook, TikTok)
- Display options (show stock count, low data mode)
- Language`,
  category: "settings",
  parameters: {
    type: "object",
    properties: {
      allow_guest_checkout: { type: "boolean" },
      pay_on_delivery: { type: "boolean" },
      bank_transfer: { type: "boolean" },
      whatsapp_ordering: { type: "boolean" },
      show_stock_count: { type: "boolean" },
      low_data_mode: { type: "boolean" },
      language: { type: "string" },
      whatsapp_number: { type: "string" },
      meta_title: { type: "string", description: "Store-wide SEO title" },
      meta_description: { type: "string", description: "Store-wide SEO description" },
      google_analytics_id: { type: "string" },
      facebook_pixel_id: { type: "string" },
      tiktok_pixel_id: { type: "string" },
    },
    required: [],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    const changes: string[] = [];
    if (params.whatsapp_number) changes.push("WhatsApp number");
    if (params.meta_title || params.meta_description) changes.push("SEO");
    if (params.google_analytics_id || params.facebook_pixel_id || params.tiktok_pixel_id) changes.push("tracking pixels");
    if (params.allow_guest_checkout !== undefined || params.pay_on_delivery !== undefined) changes.push("checkout options");

    return {
      action: "verify",
      message: `I'll update ${changes.length > 0 ? changes.join(", ") : "store settings"}. Taking you to settings to review.`,
      navigateTo: "settings",
      prefill: {
        allowGuestCheckout: params.allow_guest_checkout,
        payOnDelivery: params.pay_on_delivery,
        bankTransfer: params.bank_transfer,
        whatsappOrdering: params.whatsapp_ordering,
        showStockCount: params.show_stock_count,
        lowDataMode: params.low_data_mode,
        language: params.language,
        whatsappNumber: params.whatsapp_number,
        metaTitle: params.meta_title,
        metaDescription: params.meta_description,
        googleAnalyticsId: params.google_analytics_id,
        facebookPixelId: params.facebook_pixel_id,
        tiktokPixelId: params.tiktok_pixel_id,
        _action: "update",
      },
    };
  },
};

const updateStore: MCPToolDef = {
  name: "update_store_info",
  description: "Update basic store information: name, description, logo, cover image, currency, country, business type.",
  category: "settings",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string" },
      description: { type: "string" },
      logo: { type: "string", description: "Logo URL" },
      cover_image: { type: "string", description: "Cover image URL" },
      currency: { type: "string" },
      country: { type: "string" },
      business_type: { type: "string" },
      custom_domain: { type: "string" },
    },
    required: [],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    return {
      action: "verify",
      message: "I'll update the store info. Taking you to settings to review.",
      navigateTo: "settings",
      prefill: {
        storeName: params.name,
        storeDescription: params.description,
        logo: params.logo,
        coverImage: params.cover_image,
        currency: params.currency,
        country: params.country,
        businessType: params.business_type,
        customDomain: params.custom_domain,
        _action: "update_store",
      },
    };
  },
};

// ─── THEMES ─────────────────────────────────────────────────

const listThemes: MCPToolDef = {
  name: "list_themes",
  description: "List available themes and show which one is currently active.",
  category: "themes",
  parameters: {
    type: "object",
    properties: {
      category: { type: "string", description: "Filter by theme category" },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const where: Record<string, unknown> = { isActive: true };
    if (params.category) where.category = params.category;

    const [themes, installed] = await Promise.all([
      prisma.theme.findMany({ where: where as any, orderBy: [{ isFeatured: "desc" }, { installs: "desc" }] }),
      prisma.siteTheme.findMany({ where: { siteId: ctx.siteId }, include: { theme: true } }),
    ]);

    const installedIds = new Set(installed.map((t) => t.themeId));
    const active = installed.find((t) => t.isActive);

    return {
      action: "data",
      message: `Found ${themes.length} theme${themes.length !== 1 ? "s" : ""}. ${active ? `Active: "${active.theme.name}"` : "No active theme."}`,
      data: {
        themes: themes.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description,
          category: t.category,
          industry: t.industry,
          isPremium: t.isPremium,
          isFeatured: t.isFeatured,
          installs: t.installs,
          rating: Number(t.rating),
          isInstalled: installedIds.has(t.id),
          isActive: active?.themeId === t.id,
        })),
        activeThemeId: active?.themeId || null,
      },
    };
  },
};

const activateTheme: MCPToolDef = {
  name: "activate_theme",
  description: "Install and activate a theme for the store. Navigates to themes page for review.",
  category: "themes",
  parameters: {
    type: "object",
    properties: {
      theme_id: { type: "string", description: "Theme ID to activate" },
    },
    required: ["theme_id"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    const theme = await prisma.theme.findUnique({ where: { id: params.theme_id as string } });
    if (!theme) return { action: "error", message: "Theme not found.", errorCode: "NOT_FOUND" };

    return {
      action: "verify",
      message: `I'll activate the "${theme.name}" theme. Taking you to themes to review.`,
      navigateTo: "themes",
      prefill: { themeId: theme.id, themeName: theme.name, _action: "activate" },
    };
  },
};

// ─── PLUGINS ────────────────────────────────────────────────

const listPlugins: MCPToolDef = {
  name: "list_plugins",
  description: "List available plugins and show which are installed/enabled.",
  category: "plugins",
  parameters: {
    type: "object",
    properties: {
      category: { type: "string" },
      installed_only: { type: "boolean" },
    },
    required: [],
  },
  mutates: false,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const where: Record<string, unknown> = { isActive: true };
    if (params.category) where.category = params.category;

    const [plugins, installed] = await Promise.all([
      prisma.plugin.findMany({ where: where as any, orderBy: { installs: "desc" } }),
      prisma.sitePlugin.findMany({ where: { siteId: ctx.siteId } }),
    ]);

    const installedMap = new Map(installed.map((p) => [p.pluginId, p]));

    let result = plugins.map((p) => {
      const inst = installedMap.get(p.id);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        category: p.category,
        author: p.author,
        isPremium: p.isPremium,
        installs: p.installs,
        rating: Number(p.rating),
        isInstalled: !!inst,
        isEnabled: inst?.isEnabled ?? false,
      };
    });

    if (params.installed_only) result = result.filter((p) => p.isInstalled);

    return {
      action: "data",
      message: `Found ${result.length} plugin${result.length !== 1 ? "s" : ""}.`,
      data: { plugins: result },
    };
  },
};

const managePlugin: MCPToolDef = {
  name: "manage_plugin",
  description: "Install, uninstall, or toggle a plugin.",
  category: "plugins",
  parameters: {
    type: "object",
    properties: {
      plugin_id: { type: "string" },
      action: { type: "string", enum: ["install", "uninstall", "toggle"] },
    },
    required: ["plugin_id", "action"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    const plugin = await prisma.plugin.findUnique({ where: { id: params.plugin_id as string } });
    if (!plugin) return { action: "error", message: "Plugin not found.", errorCode: "NOT_FOUND" };

    return {
      action: "verify",
      message: `I'll ${params.action} the "${plugin.name}" plugin. Taking you to plugins to review.`,
      navigateTo: "plugins",
      prefill: { pluginId: plugin.id, pluginName: plugin.name, _action: params.action },
    };
  },
};

// ─── PAYMENT GATEWAYS ───────────────────────────────────────

const listPaymentGateways: MCPToolDef = {
  name: "list_payment_gateways",
  description: "List configured payment gateways (Paystack, Flutterwave, Monnify) and their status.",
  category: "payments",
  parameters: { type: "object", properties: {}, required: [] },
  mutates: false,
  requiresVerification: false,
  execute: async (_params, ctx) => {
    const gateways = await prisma.paymentGateway.findMany({
      where: { siteId: ctx.siteId },
      select: { id: true, provider: true, isEnabled: true, publicKey: true, createdAt: true },
    });

    return {
      action: "data",
      message: gateways.length > 0
        ? `Found ${gateways.length} payment gateway${gateways.length !== 1 ? "s" : ""}.`
        : "No payment gateways configured. Set up Paystack, Flutterwave, or Monnify to accept online payments.",
      data: {
        gateways: gateways.map((g) => ({
          id: g.id,
          provider: g.provider,
          isEnabled: g.isEnabled,
          hasPublicKey: !!g.publicKey,
          createdAt: g.createdAt.toISOString(),
        })),
        availableProviders: ["PAYSTACK", "FLUTTERWAVE", "MONNIFY"],
      },
    };
  },
};

const setupPaymentGateway: MCPToolDef = {
  name: "setup_payment_gateway",
  description: "Set up or update a payment gateway. Navigates to payments page for the merchant to enter API keys securely.",
  category: "payments",
  parameters: {
    type: "object",
    properties: {
      provider: { type: "string", enum: ["PAYSTACK", "FLUTTERWAVE", "MONNIFY"] },
    },
    required: ["provider"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    return {
      action: "verify",
      message: `I'll take you to set up ${params.provider}. You'll need to enter your API keys there — I don't handle sensitive payment credentials directly for security.`,
      navigateTo: "payments",
      prefill: { provider: params.provider, _action: "setup" },
    };
  },
};

// ─── TEAM MEMBERS ───────────────────────────────────────────

const listMembers: MCPToolDef = {
  name: "list_team_members",
  description: "List all team members with their roles (owner, admin, staff, viewer).",
  category: "team",
  parameters: { type: "object", properties: {}, required: [] },
  mutates: false,
  requiresVerification: false,
  execute: async (_params, ctx) => {
    const [store, members] = await Promise.all([
      prisma.site.findUnique({
        where: { id: ctx.siteId },
        include: { workspace: { include: { owner: { select: { id: true, email: true, firstName: true, lastName: true } } } } },
      }),
      prisma.siteMember.findMany({
        where: { siteId: ctx.siteId },
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return {
      action: "data",
      message: `Team: 1 owner + ${members.length} member${members.length !== 1 ? "s" : ""}.`,
      data: {
        owner: store?.workspace?.owner ? {
          name: `${store.workspace.owner.firstName} ${store.workspace.owner.lastName}`,
          email: store.workspace.owner.email,
          role: "OWNER",
        } : null,
        members: members.map((m) => ({
          id: m.id,
          name: `${m.user.firstName} ${m.user.lastName}`,
          email: m.user.email,
          role: m.role,
          joinedAt: m.createdAt.toISOString(),
        })),
      },
    };
  },
};

const addMember: MCPToolDef = {
  name: "add_team_member",
  description: "Add a team member by email. They must have an AfroStore account. Navigates to team page for review.",
  category: "team",
  parameters: {
    type: "object",
    properties: {
      email: { type: "string", description: "Team member's email" },
      role: { type: "string", enum: ["ADMIN", "STAFF", "VIEWER"], description: "Role to assign" },
    },
    required: ["email", "role"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    const user = await prisma.user.findUnique({ where: { email: params.email as string } });
    if (!user) {
      return { action: "error", message: `No user found with email ${params.email}. They need to sign up first.`, errorCode: "NOT_FOUND" };
    }

    const existing = await prisma.siteMember.findFirst({
      where: { siteId: ctx.siteId, userId: user.id },
    });
    if (existing) {
      return { action: "error", message: `${params.email} is already a team member.`, errorCode: "DUPLICATE" };
    }

    return {
      action: "verify",
      message: `I'll add ${user.firstName} ${user.lastName} (${params.email}) as ${params.role}. Taking you to team page to review.`,
      navigateTo: "team",
      prefill: {
        email: params.email,
        role: params.role,
        userName: `${user.firstName} ${user.lastName}`,
        _action: "add",
      },
    };
  },
};

const removeMember: MCPToolDef = {
  name: "remove_team_member",
  description: "Remove a team member from the store.",
  category: "team",
  parameters: {
    type: "object",
    properties: {
      member_id: { type: "string" },
    },
    required: ["member_id"],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const member = await prisma.siteMember.findFirst({
      where: { id: params.member_id as string, siteId: ctx.siteId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!member) return { action: "error", message: "Team member not found.", errorCode: "NOT_FOUND" };

    await prisma.siteMember.delete({ where: { id: member.id } });
    await logAudit({
      siteId: ctx.siteId, userId: ctx.userId,
      action: "REMOVE", entity: "member", entityId: member.id,
      before: { email: member.user.email, role: member.role },
    });

    return { action: "done", message: `${member.user.firstName} ${member.user.lastName} has been removed from the team.` };
  },
};

export const settingsTools: MCPToolDef[] = [
  getSettings,
  updateSettings,
  updateStore,
  listThemes,
  activateTheme,
  listPlugins,
  managePlugin,
  listPaymentGateways,
  setupPaymentGateway,
  listMembers,
  addMember,
  removeMember,
];
