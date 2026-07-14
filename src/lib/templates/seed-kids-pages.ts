import { KIDS_TEMPLATE_PRESET } from './presets/kids-preset';
import type { KidsSection } from '@/components/storefront/KidsPageRenderer';

/**
 * Converts TemplateBlock[] to KidsSection[] format
 * This is the seeding function that converts the hardcoded preset into database-ready sections
 */
export function seedKidsPageSections(): KidsSection[] {
  return KIDS_TEMPLATE_PRESET.map((block, index) => ({
    id: block.id,
    type: block.type,
    order: index + 1,
    props: block.props,
    styleOverrides: {},
  }));
}

/**
 * Default page configurations for Kids template
 * Following the Prokip ensurePagesExist pattern
 */
export const KIDS_DEFAULT_PAGES = {
  home: {
    id: 'home',
    name: 'Home',
    slug: '/',
    sections: seedKidsPageSections(),
    isSystem: true,
  },
  shop: {
    id: 'shop',
    name: 'Shop All',
    slug: '/shop',
    sections: seedKidsPageSections().filter(s => 
      s.type === 'kidsHeroSlider' || 
      s.type === 'kidsProductGrid' ||
      s.type === 'kidsCategoryCards'
    ),
    isSystem: true,
  },
  about: {
    id: 'about',
    name: 'About Us',
    slug: '/about-us',
    sections: [
      {
        id: 'about-hero',
        type: 'kidsHeroSlider',
        order: 1,
        props: {
          autoplaySpeed: 5000,
          minHeight: '560px',
          slides: [
            {
              title: 'About Our Kids Store',
              description: 'We provide the best quality clothes and toys for your little ones.',
              buttonText: 'Learn More',
              buttonLink: '/about-us',
              backgroundImage: 'https://woodmart.xtemos.com/wp-content/uploads/2022/01/kids-slide-1.jpg',
              colorScheme: 'dark',
            },
          ],
        },
        styleOverrides: {},
      },
    ],
    isSystem: false,
  },
  contact: {
    id: 'contact',
    name: 'Contact Us',
    slug: '/contact-us',
    sections: [
      {
        id: 'contact-hero',
        type: 'kidsHeroSlider',
        order: 1,
        props: {
          autoplaySpeed: 5000,
          minHeight: '560px',
          slides: [
            {
              title: 'Get In Touch',
              description: 'We would love to hear from you. Contact us for any questions.',
              buttonText: 'Contact Us',
              buttonLink: '/contact-us',
              backgroundImage: 'https://woodmart.xtemos.com/wp-content/uploads/2022/01/kids-slide-2.jpg',
              colorScheme: 'dark',
            },
          ],
        },
        styleOverrides: {},
      },
    ],
    isSystem: false,
  },
};

/**
 * Ensures Kids pages exist with seeded content
 * Call this when a Kids template site is created or opened
 */
export function ensureKidsPagesExist(siteId: string, existingPages: any[] = []) {
  const existingSlugs = new Set(existingPages.map(p => p.slug));
  const pagesToCreate: any[] = [];

  for (const [key, pageConfig] of Object.entries(KIDS_DEFAULT_PAGES)) {
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
        position: Object.keys(KIDS_DEFAULT_PAGES).indexOf(key),
      });
    }
  }

  return pagesToCreate;
}
