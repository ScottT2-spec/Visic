import { prisma } from "@/lib/db";
import { HANDMADE_BAGS_PAGE_BLOCKS } from "./presets/handmade-bags-pages";
import { HEALTH_PAGE_BLOCKS } from "./presets/health-pages";
import { COSMETICS_TERMS_BLOCKS, COSMETICS_SHOP_BLOCKS, COSMETICS_BLOG_BLOCKS } from "./presets/cosmetics-pages-preset";
import { TSHIRTS_PRINTS_ABOUT_PAGE_BLOCKS, TSHIRTS_PRINTS_CONTACT_PAGE_BLOCKS, TSHIRTS_PRINTS_BLOG_PAGE_BLOCKS } from "./presets/t-shirts-prints-page-presets";
import { VEGETABLE_HOME_PAGE_BLOCKS, VEGETABLE_MENU_PAGE_BLOCKS, VEGETABLE_RECIPE_PAGE_BLOCKS, VEGETABLE_ABOUT_PAGE_BLOCKS, VEGETABLE_CONTACT_PAGE_BLOCKS, VEGETABLE_RESERVATION_PAGE_BLOCKS } from "./presets/vegetables-page-presets";
import { PERFUMES_HOME_PAGE_BLOCKS, PERFUMES_ABOUT_PAGE_BLOCKS, PERFUMES_CONTACT_PAGE_BLOCKS, PERFUMES_FRAGRANCES_PAGE_BLOCKS, PERFUMES_JOURNAL_PAGE_BLOCKS, PERFUMES_REVIEWS_PAGE_BLOCKS } from "./presets/perfumes-page-presets";

/**
 * Template-specific page definitions.
 * Each template that has custom storefront pages (about, contact, journal, etc.)
 * needs its pages registered in the DB so they appear in the page editor.
 */

type PageDef = { title: string; slug: string; type: string; position: number };

const KIDS_PAGES: PageDef[] = [
  { title: "About", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
];

const PERFUMES_PAGES: PageDef[] = [
  { title: "About Us", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Journal", slug: "journal", type: "CUSTOM", position: 12 },
  { title: "Fragrances", slug: "fragrances", type: "CUSTOM", position: 13 },
  { title: "Reviews", slug: "reviews", type: "CUSTOM", position: 14 },
];

const HANDMADE_BAGS_PAGES: PageDef[] = [
  { title: "About", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Our Story", slug: "our-story", type: "CUSTOM", position: 12 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 13 },
  { title: "Reviews", slug: "reviews", type: "CUSTOM", position: 14 },
];

const COSMETICS_PAGES: PageDef[] = [
  { title: "Shop", slug: "shop", type: "CUSTOM", position: 10 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 11 },
  { title: "Terms", slug: "terms", type: "CUSTOM", position: 12 },
];

const FASHION_PAGES: PageDef[] = [
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 10 },
];

const ELECTRONICS_PAGES: PageDef[] = [
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 10 },
];

const HEALTH_PAGES: PageDef[] = [
  { title: "About Us", slug: "about", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
  { title: "Ingredients", slug: "ingredients", type: "CUSTOM", position: 13 },
];

const MAKEUP_PAGES: PageDef[] = [
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 10 },
];

const TSHIRTS_PRINTS_PAGES: PageDef[] = [
  { title: "About Us", slug: "about-us", type: "CUSTOM", position: 10 },
  { title: "Contact Us", slug: "contact-us", type: "CUSTOM", position: 11 },
  { title: "Blog", slug: "blog", type: "CUSTOM", position: 12 },
];

const VEGETABLE_PAGES: PageDef[] = [
  { title: "Menu", slug: "menu", type: "CUSTOM", position: 10 },
  { title: "Recipe", slug: "recipe", type: "CUSTOM", position: 11 },
  { title: "About", slug: "about", type: "CUSTOM", position: 12 },
  { title: "Contact", slug: "contact", type: "CUSTOM", position: 13 },
  { title: "Reservation", slug: "reservation", type: "CUSTOM", position: 14 },
];

/** Map of template slug → pages to ensure */
const TEMPLATE_PAGE_MAP: Record<string, PageDef[]> = {
  kids: KIDS_PAGES,
  perfumes: PERFUMES_PAGES,
  "handmade-bags": HANDMADE_BAGS_PAGES,
  cosmetics: COSMETICS_PAGES,
  fashion: FASHION_PAGES,
  "fashion-colored": FASHION_PAGES,
  electronics: ELECTRONICS_PAGES,
  "electronics-accessories": ELECTRONICS_PAGES,
  health: HEALTH_PAGES,
  pills: HEALTH_PAGES,
  makeup: MAKEUP_PAGES,
  "t-shirts-prints": TSHIRTS_PRINTS_PAGES,
  vegetables: VEGETABLE_PAGES,
};

/** Map of template slug → default page block content (keyed by page slug) */
const TEMPLATE_PAGE_CONTENT_MAP: Record<string, Record<string, unknown[]>> = {
  "handmade-bags": HANDMADE_BAGS_PAGE_BLOCKS,
  health: HEALTH_PAGE_BLOCKS,
  pills: HEALTH_PAGE_BLOCKS,
  cosmetics: {
    shop: COSMETICS_SHOP_BLOCKS,
    blog: COSMETICS_BLOG_BLOCKS,
    terms: COSMETICS_TERMS_BLOCKS
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

/**
 * Ensure template-specific pages exist in the DB for a given site.
 * Called on template import so pages show up in the editor.
 * For templates with default block content, seeds the blocks so pages are
 * editable from day one instead of relying on hardcoded fallbacks.
 */
export async function ensureTemplatePages(siteId: string, templateSlug: string, forceUpdate = false) {
  const pages = TEMPLATE_PAGE_MAP[templateSlug];
  if (!pages || pages.length === 0) return;

  const contentMap = TEMPLATE_PAGE_CONTENT_MAP[templateSlug] || {};

  for (const page of pages) {
    const defaultContent = contentMap[page.slug] || [];
    const existing = await prisma.page.findUnique({
      where: { siteId_slug: { siteId, slug: page.slug } },
      select: { content: true },
    });

    if (existing) {
      // If page exists but has empty content, seed the default blocks
      const hasContent = Array.isArray(existing.content)
        ? (existing.content as unknown[]).length > 0
        : existing.content && typeof existing.content === "object" && Array.isArray((existing.content as any).blocks)
          ? ((existing.content as any).blocks as unknown[]).length > 0
          : false;

      if ((!hasContent && defaultContent.length > 0) || forceUpdate) {
        await prisma.page.update({
          where: { siteId_slug: { siteId, slug: page.slug } },
          data: { content: { blocks: defaultContent } as any },
        });
      }
    } else {
      await prisma.page.create({
        data: {
          siteId,
          title: page.title,
          slug: page.slug,
          type: page.type,
          content: { blocks: defaultContent } as any,
          isPublished: true,
          position: page.position,
        },
      });
    }
  }
}
