import { T_SHIRTS_PRINTS_PRESET } from './presets/t-shirts-prints-preset';
import { TSHIRTS_PRINTS_ABOUT_PAGE_BLOCKS, TSHIRTS_PRINTS_CONTACT_PAGE_BLOCKS, TSHIRTS_PRINTS_SHOP_PAGE_BLOCKS, TSHIRTS_PRINTS_BLOG_PAGE_BLOCKS } from './presets/t-shirts-prints-page-presets';
import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Converts TemplateBlock[] to database-ready format
 * This is the seeding function that converts the hardcoded preset into database-ready sections
 */
export function seedTShirtsPrintsPageSections(blocks: TemplateBlock[]): any[] {
  return blocks.map((block, index) => ({
    id: block.id,
    type: block.type,
    order: index + 1,
    props: block.props,
    styleOverrides: {},
  }));
}

/**
 * Default page configurations for T-Shirts & Prints template
 * Following the Prokip ensurePagesExist pattern
 */
export const TSHIRTS_PRINTS_DEFAULT_PAGES = {
  home: {
    id: 'home',
    name: 'Home',
    slug: '/',
    sections: seedTShirtsPrintsPageSections(T_SHIRTS_PRINTS_PRESET),
    isSystem: true,
  },
  shop: {
    id: 'shop',
    name: 'Shop All',
    slug: '/shop',
    sections: seedTShirtsPrintsPageSections(TSHIRTS_PRINTS_SHOP_PAGE_BLOCKS),
    isSystem: true,
  },
  blog: {
    id: 'blog',
    name: 'Blog',
    slug: '/blog',
    sections: seedTShirtsPrintsPageSections(TSHIRTS_PRINTS_BLOG_PAGE_BLOCKS),
    isSystem: false,
  },
  'about-us': {
    id: 'about-us',
    name: 'About Us',
    slug: '/about-us',
    sections: seedTShirtsPrintsPageSections(TSHIRTS_PRINTS_ABOUT_PAGE_BLOCKS),
    isSystem: false,
  },
  'contact-us': {
    id: 'contact-us',
    name: 'Contact Us',
    slug: '/contact-us',
    sections: seedTShirtsPrintsPageSections(TSHIRTS_PRINTS_CONTACT_PAGE_BLOCKS),
    isSystem: false,
  },
};

/**
 * Ensures T-Shirts & Prints pages exist with seeded content
 * Call this when a T-Shirts & Prints template site is created or opened
 */
export function ensureTShirtsPrintsPagesExist(siteId: string, existingPages: any[] = []) {
  const existingSlugs = new Set(existingPages.map(p => p.slug));
  const pagesToCreate: any[] = [];

  for (const [key, pageConfig] of Object.entries(TSHIRTS_PRINTS_DEFAULT_PAGES)) {
    if (!existingSlugs.has(pageConfig.slug)) {
      pagesToCreate.push({
        siteId,
        title: pageConfig.name,
        slug: pageConfig.slug,
        type: key === 'home' ? 'HOME' : 'CUSTOM',
        content: {
          sections: pageConfig.sections,
        },
        isPublished: true,
        position: Object.keys(TSHIRTS_PRINTS_DEFAULT_PAGES).indexOf(key),
      });
    }
  }

  return pagesToCreate;
}
