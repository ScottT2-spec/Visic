/**
 * AfroStore Plugin Handlers
 *
 * Each handler is a pure function that takes HookContext and returns HookResult.
 * Plugins reference these by name in their hook definitions.
 * This is the "sandboxed execution" layer — plugins can't run arbitrary code,
 * only call predefined handlers with their settings.
 */

import type { HookContext, HookResult } from "./types";

type HandlerFn = (ctx: HookContext) => HookResult | Promise<HookResult>;

const handlers: Record<string, HandlerFn> = {};

export function registerHandler(name: string, fn: HandlerFn) {
  handlers[name] = fn;
}

export function getHandler(name: string): HandlerFn | undefined {
  return handlers[name];
}

// ─── Built-in Handlers ──────────────────────────────────────

// Delivery fee by area/zone
registerHandler("delivery_fee_by_area", (ctx) => {
  const settings = ctx.pluginSettings;
  const zones = (settings.zones || []) as Array<{ name: string; fee: number }>;
  const selectedZone = ctx.data.deliveryZone as string | undefined;
  const cartTotal = (ctx.data.cartTotal as number) || 0;
  const freeAbove = (settings.freeDeliveryAbove as number) || 0;

  if (freeAbove > 0 && cartTotal >= freeAbove) {
    return { fees: [{ name: "Delivery", amount: 0, description: "Free delivery" }] };
  }

  const zone = zones.find((z) => z.name.toLowerCase() === selectedZone?.toLowerCase());
  if (zone) {
    return { fees: [{ name: `Delivery (${zone.name})`, amount: zone.fee }] };
  }

  const defaultFee = (settings.defaultFee as number) || 0;
  return { fees: [{ name: "Delivery", amount: defaultFee }] };
});

// WhatsApp order notification to merchant
registerHandler("whatsapp_order_notify", (ctx) => {
  const phone = ctx.pluginSettings.merchantPhone as string;
  if (!phone) return {};

  const order = ctx.data as Record<string, unknown>;
  const items = (order.items as Array<{ name: string; quantity: number }>) || [];
  const itemList = items.map((i) => `• ${i.name} x${i.quantity}`).join("\n");

  return {
    notifications: [{
      channel: "whatsapp",
      to: phone,
      message: `🛍️ New Order #${order.orderNumber}\n\n${itemList}\n\nTotal: ${ctx.store.currency} ${order.total}\nCustomer: ${order.customerName || "Guest"}\n${order.customerPhone ? `Phone: ${order.customerPhone}` : ""}`,
    }],
  };
});

// WhatsApp order status update to customer
registerHandler("whatsapp_status_notify", (ctx) => {
  const phone = ctx.data.customerPhone as string;
  if (!phone) return {};
  const enabled = ctx.pluginSettings.notifyOnStatusChange as boolean;
  if (!enabled) return {};

  const statusMessages: Record<string, string> = {
    CONFIRMED: `✅ Your order #${ctx.data.orderNumber} has been confirmed!`,
    PROCESSING: `⚙️ Your order #${ctx.data.orderNumber} is being prepared.`,
    SHIPPED: `🚚 Your order #${ctx.data.orderNumber} has been shipped!${ctx.data.trackingNumber ? ` Tracking: ${ctx.data.trackingNumber}` : ""}`,
    DELIVERED: `📦 Your order #${ctx.data.orderNumber} has been delivered! Thank you for shopping with ${ctx.store.name}.`,
    CANCELLED: `❌ Your order #${ctx.data.orderNumber} has been cancelled.`,
  };

  const status = ctx.data.newStatus as string;
  const msg = statusMessages[status];
  if (!msg) return {};

  return { notifications: [{ channel: "whatsapp", to: phone, message: msg }] };
});

// Facebook/TikTok/Google pixel injection
registerHandler("inject_tracking_pixels", (ctx) => {
  const settings = ctx.pluginSettings;
  const scripts: string[] = [];

  if (settings.facebookPixelId) {
    scripts.push(`<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${settings.facebookPixelId}');fbq('track','PageView');</script>`);
  }
  if (settings.tiktokPixelId) {
    scripts.push(`<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${settings.tiktokPixelId}');ttq.page()}(window,document,'ttq');</script>`);
  }
  if (settings.googleAnalyticsId) {
    scripts.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.googleAnalyticsId}');</script>`);
  }

  return { inject: scripts.join("\n") };
});

// Checkout validation — min order amount
registerHandler("validate_min_order", (ctx) => {
  const min = (ctx.pluginSettings.minOrderAmount as number) || 0;
  const total = (ctx.data.cartTotal as number) || 0;
  const currency = ctx.store.currency;
  const symbol = currency === "NGN" ? "₦" : currency === "GHS" ? "₵" : currency;

  if (min > 0 && total < min) {
    return { errors: [`Minimum order amount is ${symbol}${min.toLocaleString()}. Your cart total is ${symbol}${total.toLocaleString()}.`] };
  }
  return {};
});

// Stock warning — low stock notification
registerHandler("low_stock_alert", (ctx) => {
  const threshold = (ctx.pluginSettings.threshold as number) || 5;
  const stock = (ctx.data.stock as number) || 0;
  const productName = ctx.data.name as string;
  const phone = ctx.pluginSettings.alertPhone as string;

  if (stock <= threshold && stock > 0 && phone) {
    return {
      notifications: [{
        channel: "whatsapp",
        to: phone,
        message: `⚠️ Low stock alert: "${productName}" has only ${stock} units left!`,
      }],
    };
  }
  return {};
});

// Auto-generate coupon after purchase
registerHandler("post_purchase_coupon", (ctx) => {
  const discount = (ctx.pluginSettings.discountPercent as number) || 10;
  const validDays = (ctx.pluginSettings.validDays as number) || 30;
  const enabled = ctx.pluginSettings.enabled as boolean;
  if (!enabled) return {};

  const code = `THANKS${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return {
    actions: [{
      type: "create_coupon",
      params: {
        code,
        type: "PERCENTAGE",
        value: discount,
        maxUses: 1,
        expiresAt: new Date(Date.now() + validDays * 86400000).toISOString(),
      },
    }],
    notifications: ctx.data.customerPhone ? [{
      channel: "whatsapp",
      to: ctx.data.customerPhone as string,
      message: `🎁 Thanks for your order at ${ctx.store.name}! Here's ${discount}% off your next purchase. Use code: ${code}`,
    }] : [],
  };
});

// Trust badge injection
registerHandler("inject_trust_badges", (ctx) => {
  const badges = ctx.pluginSettings.badges as string[] || ["secure_payment", "fast_delivery", "money_back"];
  const badgeHtml: Record<string, string> = {
    secure_payment: '<div class="trust-badge">🔒 Secure Payment</div>',
    fast_delivery: '<div class="trust-badge">🚚 Fast Delivery</div>',
    money_back: '<div class="trust-badge">💰 Money-Back Guarantee</div>',
    verified_business: '<div class="trust-badge">✅ Verified Business</div>',
    customer_support: '<div class="trust-badge">💬 24/7 Support</div>',
  };

  const html = `<div class="trust-badges-container" style="display:flex;gap:12px;justify-content:center;padding:16px;flex-wrap:wrap">${badges.map((b) => badgeHtml[b] || "").join("")}</div>`;
  return { inject: html };
});

// SEO meta injection
registerHandler("inject_seo_meta", (ctx) => {
  const settings = ctx.pluginSettings;
  const tags: string[] = [];

  if (settings.ogTitle) tags.push(`<meta property="og:title" content="${settings.ogTitle}" />`);
  if (settings.ogDescription) tags.push(`<meta property="og:description" content="${settings.ogDescription}" />`);
  if (settings.ogImage) tags.push(`<meta property="og:image" content="${settings.ogImage}" />`);
  if (settings.twitterCard) tags.push(`<meta name="twitter:card" content="${settings.twitterCard}" />`);
  if (settings.robotsTxt) tags.push(`<meta name="robots" content="${settings.robotsTxt}" />`);
  if (settings.canonicalUrl) tags.push(`<link rel="canonical" href="${settings.canonicalUrl}" />`);
  if (settings.jsonLd) tags.push(`<script type="application/ld+json">${JSON.stringify(settings.jsonLd)}</script>`);

  return { inject: tags.join("\n") };
});

export { handlers };
