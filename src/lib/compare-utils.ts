/**
 * Shared compare list utilities for template blocks.
 * Uses localStorage so compare works across pages without prop drilling.
 */

const MAX_COMPARE = 4;

function getCompareKey(storeSlug: string | null | undefined): string {
  return `afrostore_compare_${storeSlug || "unknown"}`;
}

export function getCompareList(storeSlug: string | null | undefined): Array<Record<string, unknown>> {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(getCompareKey(storeSlug));
    if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; }
  } catch {}
  return [];
}

export function isInCompare(productId: string, storeSlug: string | null | undefined): boolean {
  return getCompareList(storeSlug).some(p => p.id === productId);
}

export function toggleCompare(product: { id: string; name: string; slug?: string; price?: unknown; image?: string; images?: Array<{ url: string }> }, storeSlug: string | null | undefined): boolean {
  const key = getCompareKey(storeSlug);
  const list = getCompareList(storeSlug);
  const exists = list.some(p => p.id === product.id);
  
  let updated: Array<Record<string, unknown>>;
  if (exists) {
    updated = list.filter(p => p.id !== product.id);
  } else {
    if (list.length >= MAX_COMPARE) return false; // max reached
    updated = [...list, {
      id: product.id,
      name: product.name,
      slug: product.slug || "",
      price: product.price || 0,
      images: product.images || (product.image ? [{ url: product.image }] : []),
      inStock: true,
    }];
  }
  
  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("afrostore-compare-updated"));
  return true;
}
