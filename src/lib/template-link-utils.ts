/**
 * Shared link resolution utilities for all template blocks.
 *
 * Handles:
 * - "#" → /store/{slug}/shop
 * - "/shop" → /store/{slug}/shop
 * - "shop" (bare word) → /store/{slug}/shop
 * - "/blog" → /store/{slug}/blog
 * - "/store/..." → pass through
 * - "http..." → pass through (external)
 * - null/undefined/empty → fallback
 */

/** Resolve any link to a proper store-scoped path */
export function resolveStoreLink(link: string | null | undefined, storeSlug: string | null | undefined): string {
  // External links pass through
  if (link && (link.startsWith("http://") || link.startsWith("https://"))) return link;

  // Already resolved store links pass through
  if (link && link.startsWith("/store/")) return link;

  // No store slug — can't resolve, return as-is or "#"
  if (!storeSlug) return link || "#";

  const base = `/store/${storeSlug}`;

  // Null, empty, or "#" → shop page
  if (!link || link === "#") return `${base}/shop`;

  // Strip leading slash for uniform handling
  const clean = link.startsWith("/") ? link.slice(1) : link;

  // Known route mappings
  const routeMap: Record<string, string> = {
    shop: `${base}/shop`,
    blog: `${base}/blog`,
    reviews: `${base}/reviews`,
    wishlist: `${base}/wishlist`,
    cart: `${base}/cart`,
    compare: `${base}/compare`,
    "my-account": `${base}/my-account`,
    "order-tracking": `${base}/order-tracking`,
    journal: `${base}/journal`,
    fragrances: `${base}/fragrances`,
    contact: `${base}/contact`,
    "contact-us": `${base}/contact-us`,
    about: `${base}/about`,
    "about-us": `${base}/about-us`,
    "our-story": `${base}/our-story`,
    faq: `${base}/faq`,
    policy: `${base}/policy`,
    gifts: `${base}/product-category/gifts`,
    "product-category/gifts": `${base}/product-category/gifts`,
  };

  if (routeMap[clean]) return routeMap[clean];

  // If it starts with "shop?", "blog/", "product/" etc. prefix with base
  if (
    clean.startsWith("shop?") ||
    clean.startsWith("shop/") ||
    clean.startsWith("blog/") ||
    clean.startsWith("product/") ||
    clean.startsWith("reviews") ||
    clean.startsWith("wishlist")
  ) {
    return `${base}/${clean}`;
  }

  // Any other relative path — prefix with store base
  if (!clean.startsWith("/")) return `${base}/${clean}`;

  return `${base}${link}`;
}

/** Resolve footer link URLs intelligently based on label text */
export function resolveFooterLink(url: string | null | undefined, label: string, storeSlug: string | null | undefined): string {
  // External or already resolved
  if (url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/store/"))) return url;

  // If url is valid (not "#" or empty), resolve normally
  if (url && url !== "#") return resolveStoreLink(url, storeSlug);

  // url is "#" or empty — try to infer from label
  if (!storeSlug) return "#";

  const base = `/store/${storeSlug}`;
  const lower = label.toLowerCase();

  // Contact
  if (lower.includes("contact")) return `${base}/contact`;

  // Policy / Legal
  if (lower.includes("privacy") || lower.includes("terms") || lower.includes("conditions") || lower.includes("returns") || lower.includes("refund") || lower.includes("policy"))
    return `${base}/policy`;

  // FAQ
  if (lower.includes("faq")) return `${base}/faq`;

  // Blog / News
  if (lower.includes("blog") || lower.includes("news") || lower.includes("latest")) return `${base}/blog`;

  // Shop related
  if (lower.includes("shop") || lower.includes("collection") || lower.includes("product") || lower.includes("catalog") || lower.includes("new arrival") || lower.includes("sale"))
    return `${base}/shop`;

  // About
  if (lower.includes("about") || lower.includes("our story") || lower.includes("who we are")) return `${base}/about`;

  // Reviews
  if (lower.includes("review") || lower.includes("testimonial")) return `${base}/reviews`;

  // Sitemap / Instagram / external-sounding things — leave as "#"
  if (lower.includes("sitemap") || lower.includes("instagram") || lower.includes("facebook") || lower.includes("twitter") || lower.includes("purchase"))
    return "#";

  // Store locations — these are informational, no real page
  // (New York, London, etc.) — leave as "#"
  return "#";
}
