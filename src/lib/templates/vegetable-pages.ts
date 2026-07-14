import { prisma } from "@/lib/db";

export const VEGETABLE_TEMPLATE_PAGE_DEFS = [
  { title: "Menu", slug: "menu", type: "CUSTOM", position: 10 },
  { title: "Recipe", slug: "recipe", type: "CUSTOM", position: 11 },
  { title: "About", slug: "about", type: "CUSTOM", position: 12 },
  { title: "Contact", slug: "contact", type: "CUSTOM", position: 13 },
] as const;

export const VEGETABLE_NAV_LINKS = [
  { label: "Home", href: "home" },
  { label: "Menu", href: "menu" },
  { label: "Recipe", href: "recipe" },
  { label: "About", href: "about" },
  { label: "Contact", href: "contact" },
] as const;

export type VegetablePageSlug = (typeof VEGETABLE_TEMPLATE_PAGE_DEFS)[number]["slug"];

export async function ensureVegetablePages(siteId: string) {
  for (const page of VEGETABLE_TEMPLATE_PAGE_DEFS) {
    await prisma.page.upsert({
      where: {
        siteId_slug: {
          siteId,
          slug: page.slug,
        },
      },
      update: {
        title: page.title,
        type: page.type,
        isPublished: true,
        position: page.position,
      },
      create: {
        siteId,
        title: page.title,
        slug: page.slug,
        type: page.type,
        content: [],
        isPublished: true,
        position: page.position,
      },
    });
  }
}
