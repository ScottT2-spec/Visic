import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { buildDefaultPageContent, type DefaultPageContentContext } from "@/lib/templates/default-page-content";
import { FASHION_TEMPLATE_PRESET } from "@/lib/templates/presets/fashion-preset";
import { FASHION_COLORED_PRESET } from "@/lib/templates/presets/fashion-colored-preset";
import { HANDMADE_BAGS_PRESET } from "@/lib/templates/presets/handmade-bags-preset";
import { T_SHIRTS_PRINTS_PRESET } from "@/lib/templates/presets/t-shirts-prints-preset";
import { ELECTRONICS_TEMPLATE_PRESET } from "@/lib/templates/presets/electronics-preset";
import { BAKERY_TEMPLATE_PRESET } from "@/lib/templates/presets/bakery-preset";
import { COSMETICS_TEMPLATE_PRESET } from "@/lib/templates/presets/cosmetics-preset";
import {
  COSMETICS_BESTSELLER_BLOCKS,
  COSMETICS_NEW_IN_BLOCKS,
  COSMETICS_SKINCARE_BLOCKS,
  COSMETICS_TERMS_BLOCKS,
} from "@/lib/templates/presets/cosmetics-pages-preset";
import { GROCERY_TEMPLATE_PRESET } from "@/lib/templates/presets/grocery-preset";
import { HEALTH_TEMPLATE_PRESET } from "@/lib/templates/presets/health-preset";
import { INTERIOR_DECOR_PRESET, INTERIOR_RETAIL_PRESET } from "@/lib/templates/presets/interior-preset";
import { KIDS_TEMPLATE_PRESET } from "@/lib/templates/presets/kids-preset";
import { MAKEUP_TEMPLATE_PRESET } from "@/lib/templates/presets/makeup-preset";
import { PERFUMES_TEMPLATE_PRESET } from "@/lib/templates/presets/perfumes-preset";
import { TSHIRTS_PRINTS_ABOUT_PAGE_BLOCKS, TSHIRTS_PRINTS_CONTACT_PAGE_BLOCKS, TSHIRTS_PRINTS_BLOG_PAGE_BLOCKS } from "@/lib/templates/presets/t-shirts-prints-page-presets";
import { VEGETABLE_HOME_PAGE_BLOCKS, VEGETABLE_MENU_PAGE_BLOCKS, VEGETABLE_RECIPE_PAGE_BLOCKS, VEGETABLE_ABOUT_PAGE_BLOCKS, VEGETABLE_CONTACT_PAGE_BLOCKS, VEGETABLE_RESERVATION_PAGE_BLOCKS } from "@/lib/templates/presets/vegetables-page-presets";
import { PERFUMES_HOME_PAGE_BLOCKS, PERFUMES_ABOUT_PAGE_BLOCKS, PERFUMES_CONTACT_PAGE_BLOCKS, PERFUMES_FRAGRANCES_PAGE_BLOCKS, PERFUMES_JOURNAL_PAGE_BLOCKS, PERFUMES_REVIEWS_PAGE_BLOCKS } from "@/lib/templates/presets/perfumes-page-presets";
import { isBespokeTemplateSlug } from "@/lib/templates/bespoke-template-slugs";

export type BespokeOverrides = Record<string, Record<string, unknown>>;

export interface BespokePageContentDocument {
  overrides?: BespokeOverrides;
}

type TemplatePresetMap = Record<string, TemplateBlock[]>;
type RegisteredPageSlug =
  | "home"
  | "shop"
  | "about"
  | "about-us"
  | "our-story"
  | "contact"
  | "contact-us"
  | "blog"
  | "journal"
  | "faq"
  | "reviews"
  | "wishlist"
  | "cart"
  | "compare"
  | "order-tracking"
  | "new-in"
  | "bestseller"
  | "products"
  | "catalog"
  | "store"
  | "menu"
  | "recipe"
  | "services"
  | "terms"
  | "privacy"
  | "policy"
  | "refunds"
  | "shipping"
  | "fragrances"
  | "skincare"
  | "projects"
  | "ingredients"
  | "reservations"
  | "reservation"
  | "gallery"
  | "departments"
  | "doctors"
  | "appointment"
  | "contractor-program"
  | "inspiration"
  | "collections"
  | "deals"
  | "categories"
  | "courses"
  | "instructors"
  | "destinations"
  | "experiences";

export const BESPOKE_TEMPLATE_PRESETS: TemplatePresetMap = {
  fashion: FASHION_TEMPLATE_PRESET,
  "fashion-colored": FASHION_COLORED_PRESET,
  "fashion-classic": FASHION_TEMPLATE_PRESET,
  "handmade-bags": HANDMADE_BAGS_PRESET,
  "t-shirts-prints": T_SHIRTS_PRINTS_PRESET,
  electronics: ELECTRONICS_TEMPLATE_PRESET,
  "electronics-accessories": ELECTRONICS_TEMPLATE_PRESET,
  hardware: ELECTRONICS_TEMPLATE_PRESET,
  "hardware-pro": ELECTRONICS_TEMPLATE_PRESET,
  tools: ELECTRONICS_TEMPLATE_PRESET,
  bakery: BAKERY_TEMPLATE_PRESET,
  "sweets-bakery": BAKERY_TEMPLATE_PRESET,
  bistro: BAKERY_TEMPLATE_PRESET,
  cosmetics: COSMETICS_TEMPLATE_PRESET,
  makeup: MAKEUP_TEMPLATE_PRESET,
  grocery: GROCERY_TEMPLATE_PRESET,
  "grocery-market": GROCERY_TEMPLATE_PRESET,
  vegetables: VEGETABLE_HOME_PAGE_BLOCKS,
  health: HEALTH_TEMPLATE_PRESET,
  pills: HEALTH_TEMPLATE_PRESET,
  interior: INTERIOR_DECOR_PRESET,
  "interior-design": INTERIOR_DECOR_PRESET,
  "home-decor": INTERIOR_DECOR_PRESET,
  decor: INTERIOR_DECOR_PRESET,
  retail: INTERIOR_RETAIL_PRESET,
  kids: KIDS_TEMPLATE_PRESET,
  toys: KIDS_TEMPLATE_PRESET,
  perfumes: PERFUMES_TEMPLATE_PRESET,
  jewellery: ELECTRONICS_TEMPLATE_PRESET,
  "jewellery-elegance": ELECTRONICS_TEMPLATE_PRESET,
  strada: HEALTH_TEMPLATE_PRESET,
};

/** Template-specific page presets (non-home pages). */
const BESPOKE_PAGE_PRESETS: Record<string, Record<string, TemplateBlock[]>> = {
  cosmetics: {
    bestseller: COSMETICS_BESTSELLER_BLOCKS,
    "new-in": COSMETICS_NEW_IN_BLOCKS,
    skincare: COSMETICS_SKINCARE_BLOCKS,
    terms: COSMETICS_TERMS_BLOCKS,
  },
  "t-shirts-prints": {
    "about-us": TSHIRTS_PRINTS_ABOUT_PAGE_BLOCKS,
    "contact-us": TSHIRTS_PRINTS_CONTACT_PAGE_BLOCKS,
    "blog": TSHIRTS_PRINTS_BLOG_PAGE_BLOCKS,
  },
  vegetables: {
    home: VEGETABLE_HOME_PAGE_BLOCKS,
    menu: VEGETABLE_MENU_PAGE_BLOCKS,
    recipe: VEGETABLE_RECIPE_PAGE_BLOCKS,
    about: VEGETABLE_ABOUT_PAGE_BLOCKS,
    contact: VEGETABLE_CONTACT_PAGE_BLOCKS,
    reservation: VEGETABLE_RESERVATION_PAGE_BLOCKS,
  },
  perfumes: {
    home: PERFUMES_HOME_PAGE_BLOCKS,
    about: PERFUMES_ABOUT_PAGE_BLOCKS,
    contact: PERFUMES_CONTACT_PAGE_BLOCKS,
    fragrances: PERFUMES_FRAGRANCES_PAGE_BLOCKS,
    journal: PERFUMES_JOURNAL_PAGE_BLOCKS,
    reviews: PERFUMES_REVIEWS_PAGE_BLOCKS,
  },
};

export const REGISTERED_BESPOKE_PAGE_SLUGS = new Set<RegisteredPageSlug>([
  "home",
  "shop",
  "about",
  "about-us",
  "our-story",
  "contact",
  "contact-us",
  "blog",
  "journal",
  "faq",
  "reviews",
  "wishlist",
  "cart",
  "compare",
  "order-tracking",
  "new-in",
  "bestseller",
  "products",
  "catalog",
  "store",
  "menu",
  "recipe",
  "services",
  "terms",
  "privacy",
  "policy",
  "refunds",
  "shipping",
  "fragrances",
  "skincare",
  "projects",
  "ingredients",
  "reservations",
  "gallery",
  "departments",
  "doctors",
  "appointment",
  "contractor-program",
  "inspiration",
  "collections",
  "deals",
  "categories",
  "courses",
  "instructors",
  "destinations",
  "experiences",
]);

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      if (!isEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
}

function parsePath(path: string): Array<string | number> {
  if (!path) return [];
  return path.split(".").map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment));
}

function setPath(target: Record<string, unknown>, path: string, value: unknown): boolean {
  const parts = parsePath(path);
  if (parts.length === 0) return false;

  let cursor: any = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    const nextPart = parts[index + 1];
    if (typeof part === "number") {
      if (!Array.isArray(cursor)) return false;
      if (cursor[part] == null || typeof cursor[part] !== "object") {
        cursor[part] = typeof nextPart === "number" ? [] : {};
      }
      cursor = cursor[part];
      continue;
    }

    if (!isPlainObject(cursor[part])) {
      cursor[part] = typeof nextPart === "number" ? [] : {};
    }
    cursor = cursor[part];
  }

  const last = parts[parts.length - 1];
  if (typeof last === "number") {
    if (!Array.isArray(cursor)) return false;
    cursor[last] = deepClone(value);
    return true;
  }

  cursor[last] = deepClone(value);
  return true;
}

function getPath(value: unknown, path: string): unknown {
  const parts = parsePath(path);
  let cursor: any = value;
  for (const part of parts) {
    if (cursor == null) return undefined;
    cursor = cursor[part as never];
  }
  return cursor;
}

function diffPaths(defaultValue: unknown, currentValue: unknown, prefix = ""): Record<string, unknown> {
  if (isEqual(defaultValue, currentValue)) return {};

  if (Array.isArray(defaultValue) && Array.isArray(currentValue)) {
    return prefix ? { [prefix]: deepClone(currentValue) } : {};
  }

  if (isPlainObject(defaultValue) && isPlainObject(currentValue)) {
    const result: Record<string, unknown> = {};
    const keys = new Set([...Object.keys(defaultValue), ...Object.keys(currentValue)]);
    for (const key of keys) {
      const childPrefix = prefix ? `${prefix}.${key}` : key;
      Object.assign(result, diffPaths(defaultValue[key], currentValue[key], childPrefix));
    }
    return result;
  }

  return prefix ? { [prefix]: deepClone(currentValue) } : {};
}

function normalizeOverrides(overrides: unknown): BespokeOverrides {
  if (!isPlainObject(overrides)) return {};

  const result: BespokeOverrides = {};
  for (const [sectionId, rawSectionOverrides] of Object.entries(overrides)) {
    if (!isPlainObject(rawSectionOverrides)) continue;
    result[sectionId] = {};
    for (const [propPath, value] of Object.entries(rawSectionOverrides)) {
      result[sectionId][propPath] = deepClone(value);
    }
  }
  return result;
}

function getBaseBlocks(templateSlug: string): TemplateBlock[] | null {
  const blocks = BESPOKE_TEMPLATE_PRESETS[templateSlug.toLowerCase()];
  return blocks ? deepClone(blocks) : null;
}

export function getBespokeTemplateBlocks(templateSlug?: string | null): TemplateBlock[] | null {
  if (!templateSlug) return null;
  return getBaseBlocks(templateSlug);
}

function normalizePageSlug(pageSlug?: string | null): string | null {
  if (!pageSlug) return null;
  const normalized = pageSlug.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "/" || normalized === "index" || normalized === "home-page") return "home";
  return normalized.replace(/^\/+/, "");
}

function getRegisteredPageContent(
  templateSlug: string,
  pageSlug?: string | null,
  context?: Partial<DefaultPageContentContext>,
): { blocks: TemplateBlock[]; settings: Record<string, never> } | null {
  const normalizedPageSlug = normalizePageSlug(pageSlug);
  if (!normalizedPageSlug) {
    console.error(`[BespokePageContent] Invalid pageSlug for ${templateSlug}: ${pageSlug}`);
    return null;
  }
  if (!REGISTERED_BESPOKE_PAGE_SLUGS.has(normalizedPageSlug as RegisteredPageSlug)) {
    console.error(`[BespokePageContent] No default registered for ${templateSlug}.${normalizedPageSlug}. This is a configuration error - the page slug must be registered in REGISTERED_BESPOKE_PAGE_SLUGS.`);
    return null;
  }

  if (normalizedPageSlug === "home") {
    const blocks = getBespokeTemplateBlocks(templateSlug);
    if (!blocks) {
      console.error(`[BespokePageContent] No home preset registered for ${templateSlug}.home. This is a configuration error - the template must be in BESPOKE_TEMPLATE_PRESETS.`);
      return null;
    }
    return { blocks, settings: {} };
  }

  // Check for template-specific page presets before falling back to generic defaults
  const templateKey = templateSlug.toLowerCase();
  const pagePresets = BESPOKE_PAGE_PRESETS[templateKey];
  if (pagePresets && normalizedPageSlug && pagePresets[normalizedPageSlug]) {
    return { blocks: deepClone(pagePresets[normalizedPageSlug]), settings: {} };
  }

  const built = buildDefaultPageContent({
    pageSlug: normalizedPageSlug,
    pageTitle: context?.pageTitle || null,
    pageType: context?.pageType || null,
    templateSlug,
  });
  return { blocks: built.blocks, settings: {} };
}

function extractLegacyBlocks(content: unknown): TemplateBlock[] {
  if (!content || typeof content !== "object") return [];
  const raw = content as Record<string, unknown>;
  const blocks = Array.isArray(raw.blocks) ? raw.blocks : Array.isArray(raw.sections) ? raw.sections : [];
  return blocks
    .map((block, index) => {
      if (!isPlainObject(block)) return null;
      return {
        id: typeof block.id === "string" ? block.id : `section-${index}`,
        type: typeof block.type === "string" ? block.type : "unknown",
        props: isPlainObject(block.props) ? block.props : {},
      } as TemplateBlock;
    })
    .filter((block): block is TemplateBlock => Boolean(block));
}

export function normalizeBespokePageContent(
  content: unknown,
  templateSlug?: string | null,
  pageSlug?: string | null,
  context?: Partial<DefaultPageContentContext>,
): BespokePageContentDocument | null {
  if (!templateSlug || !isBespokeTemplateSlug(templateSlug)) return null;
  const defaultDocument = getRegisteredPageContent(templateSlug, pageSlug, context);
  if (!defaultDocument) return null;

  if (!content || typeof content !== "object") return null;
  const raw = content as Record<string, unknown>;

  const overrides = normalizeOverrides(raw.overrides);
  if (Object.keys(overrides).length > 0) {
    return pruneOverrides(defaultDocument.blocks, overrides);
  }

  const legacyBlocks = extractLegacyBlocks(content);
  if (legacyBlocks.length === 0) return null;

  const legacyOverrides = diffBlocks(defaultDocument.blocks, legacyBlocks);
  if (Object.keys(legacyOverrides).length === 0) return null;

  return { overrides: pruneOverrides(defaultDocument.blocks, legacyOverrides) };
}

export function mergeBespokeTemplateBlocks(templateSlug?: string | null, pageSlug?: string | null, content?: unknown, context?: Partial<DefaultPageContentContext>): TemplateBlock[] {
  // LOUD WARNING: This fallback should rarely be triggered after seeding
  console.warn(`⚠️ FALLBACK CONTENT GENERATED - Template: ${templateSlug}, Page: ${pageSlug}. This page has no real blocks in the database. Run the seeding script to fix this.`);
  
  if (!templateSlug || !isBespokeTemplateSlug(templateSlug)) return [];

  const defaultDocument = getRegisteredPageContent(templateSlug, pageSlug, context);
  if (!defaultDocument) return [];

  const normalized = normalizeBespokePageContent(content, templateSlug, pageSlug, context);
  const overrides = normalized?.overrides || {};

  return applyOverridesToBlocks(defaultDocument.blocks, overrides, templateSlug || "unknown-template");
}

export function mergeBespokePageContent(templateSlug?: string | null, pageSlug?: string | null, content?: unknown, context?: Partial<DefaultPageContentContext>): { blocks: TemplateBlock[]; overrides: BespokeOverrides } {
  const blocks = mergeBespokeTemplateBlocks(templateSlug, pageSlug, content, context);
  const normalized = normalizeBespokePageContent(content, templateSlug, pageSlug, context);
  return {
    blocks,
    overrides: normalized?.overrides || {},
  };
}

export function diffBlocks(defaultBlocks: TemplateBlock[], currentBlocks: TemplateBlock[]): BespokeOverrides {
  const result: BespokeOverrides = {};
  const currentById = new Map(currentBlocks.map((block) => [block.id, block]));

  for (const defaultBlock of defaultBlocks) {
    const currentBlock = currentById.get(defaultBlock.id);
    if (!currentBlock) continue;
    const diff = diffPaths(defaultBlock.props, currentBlock.props);
    if (Object.keys(diff).length > 0) {
      result[defaultBlock.id] = diff;
    }
  }

  for (const block of currentBlocks) {
    if (!defaultBlocks.some((defaultBlock) => defaultBlock.id === block.id)) {
      console.warn(`[BespokePageContent] Ignoring stale or unknown section "${block.id}" while diffing overrides.`);
    }
  }

  return result;
}

export function pruneOverrides(defaultBlocks: TemplateBlock[], overrides: BespokeOverrides): { overrides: BespokeOverrides } {
  const knownSections = new Map(defaultBlocks.map((block) => [block.id, block]));
  const pruned: BespokeOverrides = {};

  for (const [sectionId, sectionOverrides] of Object.entries(overrides)) {
    const defaultBlock = knownSections.get(sectionId);
    if (!defaultBlock) {
      console.warn(`[BespokePageContent] Ignoring stale override for missing section "${sectionId}".`);
      continue;
    }

    const nextSection: Record<string, unknown> = {};
    for (const [propPath, value] of Object.entries(sectionOverrides)) {
      const defaultValue = getPath(defaultBlock.props, propPath);
      if (typeof defaultValue === "undefined" && !(propPath in defaultBlock.props)) {
        console.warn(`[BespokePageContent] Ignoring stale override path "${sectionId}.${propPath}".`);
        continue;
      }
      if (isEqual(defaultValue, value)) {
        continue;
      }
      nextSection[propPath] = deepClone(value);
    }

    if (Object.keys(nextSection).length > 0) {
      pruned[sectionId] = nextSection;
    }
  }

  return { overrides: pruned };
}

export function applyOverridesToBlocks(defaultBlocks: TemplateBlock[], overrides: BespokeOverrides, templateSlug = "unknown-template"): TemplateBlock[] {
  const blocks = deepClone(defaultBlocks);
  const blockById = new Map(blocks.map((block) => [block.id, block]));

  for (const [sectionId, sectionOverrides] of Object.entries(overrides)) {
    const block = blockById.get(sectionId);
    if (!block) {
      console.warn(`[BespokePageContent] Ignoring stale override for missing section "${sectionId}" in ${templateSlug}.`);
      continue;
    }

    for (const [propPath, value] of Object.entries(sectionOverrides)) {
      const set = setPath(block.props as Record<string, unknown>, propPath, value);
      if (!set) {
        console.warn(`[BespokePageContent] Ignoring stale override path "${sectionId}.${propPath}" in ${templateSlug}.`);
      }
    }
  }

  return blocks;
}
