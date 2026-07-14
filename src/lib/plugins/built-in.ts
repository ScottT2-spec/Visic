/**
 * Built-in Plugin Manifests
 *
 * These are the "first-party" plugins that ship with AfroStore.
 * Each one is a complete manifest with hooks, settings schema, and defaults.
 */

import type { PluginManifest } from "./types";

export const builtInPlugins: PluginManifest[] = [
  // ─── Delivery Fee by Area ─────────────────────────────
  {
    slug: "delivery-fee-by-area",
    name: "Delivery Fee by Area",
    version: "1.0.0",
    description: "Charge different delivery fees based on customer location. Set zones like Lagos Mainland, Island, etc. with custom fees. Supports free delivery above a threshold.",
    author: "AfroStore",
    category: "delivery",
    icon: "🚚",
    isPremium: false,
    tags: ["delivery", "shipping", "logistics", "fees"],
    hooks: [
      { hook: "checkout:before", priority: 10, handler: "delivery_fee_by_area", description: "Calculate delivery fee based on selected zone" },
    ],
    settingsSchema: [
      { key: "defaultFee", label: "Default Delivery Fee", type: "number", description: "Fee when no zone is selected", default: 1500, placeholder: "1500" },
      { key: "freeDeliveryAbove", label: "Free Delivery Above", type: "number", description: "Cart total above which delivery is free (0 = disabled)", default: 0, placeholder: "50000" },
      {
        key: "zones", label: "Delivery Zones", type: "json",
        description: 'Add zones as JSON array: [{"name": "Mainland", "fee": 2000}, {"name": "Island", "fee": 3500}]',
        default: [
          { name: "Lagos Mainland", fee: 2000 },
          { name: "Lagos Island", fee: 3500 },
          { name: "Outside Lagos", fee: 5000 },
        ],
      },
    ],
    defaultSettings: {
      defaultFee: 1500,
      freeDeliveryAbove: 0,
      zones: [
        { name: "Lagos Mainland", fee: 2000 },
        { name: "Lagos Island", fee: 3500 },
        { name: "Outside Lagos", fee: 5000 },
      ],
    },
    permissions: ["modify:checkout"],
  },

  // ─── WhatsApp Order Notifications ─────────────────────
  {
    slug: "whatsapp-order-notifications",
    name: "WhatsApp Order Notifications",
    version: "1.0.0",
    description: "Get instant WhatsApp notifications when customers place orders. Also notify customers about order status updates (confirmed, shipped, delivered).",
    author: "AfroStore",
    category: "communication",
    icon: "💬",
    isPremium: false,
    tags: ["whatsapp", "notifications", "orders", "communication"],
    hooks: [
      { hook: "order:created", priority: 10, handler: "whatsapp_order_notify", description: "Notify merchant of new order" },
      { hook: "order:status_changed", priority: 10, handler: "whatsapp_status_notify", description: "Notify customer of status change" },
    ],
    settingsSchema: [
      { key: "merchantPhone", label: "Your WhatsApp Number", type: "phone", description: "Number to receive order notifications (with country code)", placeholder: "+2348012345678", required: true },
      { key: "notifyOnStatusChange", label: "Customer Status Updates", type: "toggle", description: "Send customers WhatsApp updates when order status changes", default: true },
    ],
    defaultSettings: { merchantPhone: "", notifyOnStatusChange: true },
    permissions: ["read:orders", "send:notifications"],
  },

  // ─── Tracking Pixels ──────────────────────────────────
  {
    slug: "tracking-pixels",
    name: "Tracking Pixels & Analytics",
    version: "1.0.0",
    description: "Add Facebook Pixel, TikTok Pixel, and Google Analytics to your storefront. Track page views, add-to-cart events, and purchases for better ad targeting.",
    author: "AfroStore",
    category: "analytics",
    icon: "📊",
    isPremium: false,
    tags: ["analytics", "facebook", "tiktok", "google", "pixel", "tracking"],
    hooks: [
      { hook: "storefront:head", priority: 5, handler: "inject_tracking_pixels", description: "Inject tracking scripts into storefront" },
    ],
    settingsSchema: [
      { key: "facebookPixelId", label: "Facebook Pixel ID", type: "text", placeholder: "123456789012345" },
      { key: "tiktokPixelId", label: "TikTok Pixel ID", type: "text", placeholder: "ABCDEFGHIJ1234567890" },
      { key: "googleAnalyticsId", label: "Google Analytics ID", type: "text", placeholder: "G-XXXXXXXXXX" },
    ],
    defaultSettings: { facebookPixelId: "", tiktokPixelId: "", googleAnalyticsId: "" },
    permissions: ["modify:storefront"],
  },

  // ─── Minimum Order Amount ─────────────────────────────
  {
    slug: "min-order-amount",
    name: "Minimum Order Amount",
    version: "1.0.0",
    description: "Set a minimum order value before customers can checkout. Useful for delivery-based businesses that need to cover logistics costs.",
    author: "AfroStore",
    category: "payments",
    icon: "💰",
    isPremium: false,
    tags: ["checkout", "validation", "minimum", "order"],
    hooks: [
      { hook: "checkout:validate", priority: 5, handler: "validate_min_order", description: "Block checkout if order is below minimum" },
    ],
    settingsSchema: [
      { key: "minOrderAmount", label: "Minimum Order Amount", type: "number", description: "Minimum cart total required to checkout", required: true, placeholder: "5000", min: 0 },
    ],
    defaultSettings: { minOrderAmount: 5000 },
    permissions: ["modify:checkout"],
  },

  // ─── Low Stock Alerts ─────────────────────────────────
  {
    slug: "low-stock-alerts",
    name: "Low Stock Alerts",
    version: "1.0.0",
    description: "Get WhatsApp alerts when product stock falls below your threshold. Never miss a restock moment.",
    author: "AfroStore",
    category: "inventory",
    icon: "📦",
    isPremium: false,
    tags: ["inventory", "stock", "alerts", "notifications"],
    hooks: [
      { hook: "product:updated", priority: 10, handler: "low_stock_alert", description: "Alert when stock is low" },
    ],
    settingsSchema: [
      { key: "threshold", label: "Low Stock Threshold", type: "number", description: "Alert when stock falls to this number", default: 5, min: 1 },
      { key: "alertPhone", label: "Alert WhatsApp Number", type: "phone", description: "Number to receive stock alerts", placeholder: "+2348012345678", required: true },
    ],
    defaultSettings: { threshold: 5, alertPhone: "" },
    permissions: ["read:products", "send:notifications"],
  },

  // ─── Post-Purchase Thank You Coupon ───────────────────
  {
    slug: "thank-you-coupon",
    name: "Post-Purchase Thank You Coupon",
    version: "1.0.0",
    description: "Automatically send customers a discount coupon after they make a purchase. Drives repeat orders and builds loyalty.",
    author: "AfroStore",
    category: "marketing",
    icon: "🎁",
    isPremium: false,
    tags: ["marketing", "coupon", "retention", "loyalty"],
    hooks: [
      { hook: "order:paid", priority: 20, handler: "post_purchase_coupon", description: "Generate and send thank-you coupon" },
    ],
    settingsSchema: [
      { key: "enabled", label: "Enable Auto-Coupon", type: "toggle", description: "Automatically send coupons after purchase", default: true },
      { key: "discountPercent", label: "Discount (%)", type: "number", description: "Percentage discount for the coupon", default: 10, min: 1, max: 50 },
      { key: "validDays", label: "Valid For (days)", type: "number", description: "How many days the coupon is valid", default: 30, min: 1 },
    ],
    defaultSettings: { enabled: true, discountPercent: 10, validDays: 30 },
    permissions: ["manage:coupons", "send:notifications"],
  },

  // ─── Trust Badges ─────────────────────────────────────
  {
    slug: "trust-badges",
    name: "Trust Badges",
    version: "1.0.0",
    description: "Add trust badges to your storefront footer — Secure Payment, Fast Delivery, Money-Back Guarantee, and more. Builds customer confidence.",
    author: "AfroStore",
    category: "design",
    icon: "🛡️",
    isPremium: false,
    tags: ["trust", "badges", "conversion", "design"],
    hooks: [
      { hook: "storefront:footer", priority: 10, handler: "inject_trust_badges", description: "Display trust badges on storefront" },
    ],
    settingsSchema: [
      {
        key: "badges", label: "Select Badges", type: "json",
        description: 'Choose badges: ["secure_payment", "fast_delivery", "money_back", "verified_business", "customer_support"]',
        default: ["secure_payment", "fast_delivery", "money_back"],
      },
    ],
    defaultSettings: { badges: ["secure_payment", "fast_delivery", "money_back"] },
    permissions: ["modify:storefront"],
  },

  // ─── SEO Optimizer ────────────────────────────────────
  {
    slug: "seo-optimizer",
    name: "SEO Optimizer",
    version: "1.0.0",
    description: "Add Open Graph tags, Twitter cards, canonical URLs, robots directives, and structured data (JSON-LD) to your storefront for better search rankings.",
    author: "AfroStore",
    category: "seo",
    icon: "🔍",
    isPremium: true,
    tags: ["seo", "search", "google", "meta", "opengraph"],
    hooks: [
      { hook: "storefront:head", priority: 10, handler: "inject_seo_meta", description: "Inject SEO meta tags" },
    ],
    settingsSchema: [
      { key: "ogTitle", label: "OG Title", type: "text", placeholder: "Your Store Name — Tagline" },
      { key: "ogDescription", label: "OG Description", type: "textarea", placeholder: "A short description of your store..." },
      { key: "ogImage", label: "OG Image URL", type: "url", placeholder: "https://..." },
      { key: "twitterCard", label: "Twitter Card Type", type: "select", options: [{ label: "Summary", value: "summary" }, { label: "Large Image", value: "summary_large_image" }], default: "summary_large_image" },
      { key: "canonicalUrl", label: "Canonical URL", type: "url", placeholder: "https://yourstore.com" },
      { key: "robotsTxt", label: "Robots Directive", type: "text", default: "index, follow" },
    ],
    defaultSettings: { twitterCard: "summary_large_image", robotsTxt: "index, follow" },
    permissions: ["modify:storefront"],
  },
];
