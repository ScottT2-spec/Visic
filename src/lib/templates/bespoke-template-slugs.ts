const BESPOKE_TEMPLATE_SLUGS = new Set([
  "fashion",
  "fashion-colored",
  "fashion-classic",
  "handmade-bags",
  "t-shirts-prints",
  "electronics",
  "electronics-accessories",
  "hardware",
  "hardware-pro",
  "tools",
  "bakery",
  "sweets-bakery",
  "bistro",
  "cosmetics",
  "makeup",
  "grocery",
  "grocery-market",
  "vegetables",
  "health",
  "pills",
  "strada",
  "interior",
  "interior-design",
  "decor",
  "retail",
  "home-decor",
  "kids",
  "toys",
  "children",
  "perfumes",
  "jewellery",
  "jewellery-elegance",
]);

export function isBespokeTemplateSlug(templateSlug?: string | null): boolean {
  if (!templateSlug) return false;
  return BESPOKE_TEMPLATE_SLUGS.has(templateSlug.toLowerCase());
}

export function listBespokeTemplateSlugs(): string[] {
  return Array.from(BESPOKE_TEMPLATE_SLUGS);
}
