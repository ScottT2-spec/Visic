import { FASHION_TEMPLATE_PRESET } from './presets/fashion-preset';
import type { FashionSection } from '@/components/storefront/FashionPageRenderer';

/**
 * Converts TemplateBlock[] to FashionSection[] format
 * This is the seeding function that converts the hardcoded preset into database-ready sections
 */
export function seedFashionPageSections(): FashionSection[] {
  return FASHION_TEMPLATE_PRESET.map((block, index) => ({
    id: block.id,
    type: block.type,
    order: index + 1,
    props: block.props,
    styleOverrides: {},
  }));
}

/**
 * Default page configurations for Fashion template
 * Following the Visic ensurePagesExist pattern
 */
export const FASHION_DEFAULT_PAGES = {
  home: {
    id: 'home',
    name: 'Home',
    slug: '/',
    sections: seedFashionPageSections(),
    isSystem: true,
  },
  shop: {
    id: 'shop',
    name: 'Shop All',
    slug: '/shop',
    sections: seedFashionPageSections().filter(s => 
      s.type === 'fashionHeroSlider' || 
      s.type === 'fashionProductGrid' ||
      s.type === 'fashionCategoryCards'
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
        type: 'fashionHeroSlider',
        order: 1,
        props: {
          autoplaySpeed: 5000,
          minHeight: '560px',
          slides: [
            {
              subtitle: 'ABOUT US',
              titleLine1: 'Our Story',
              titleLine2: 'Fashion & Style',
              description: 'Discover our journey in creating timeless fashion pieces.',
              buttonText: 'Learn More',
              buttonLink: '/about-us',
              backgroundImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=800&fit=crop',
              textPosition: 'center',
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
        type: 'fashionHeroSlider',
        order: 1,
        props: {
          autoplaySpeed: 5000,
          minHeight: '560px',
          slides: [
            {
              subtitle: 'CONTACT US',
              titleLine1: 'Get In Touch',
              titleLine2: 'We Are Here',
              description: 'Reach out to us for any questions or inquiries.',
              buttonText: 'Contact Us',
              buttonLink: '/contact-us',
              backgroundImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=800&fit=crop',
              textPosition: 'center',
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
 * Ensures Fashion pages exist with seeded content
 * Call this when a Fashion template site is created or opened
 */
export function ensureFashionPagesExist(siteId: string, existingPages: any[] = []) {
  const existingSlugs = new Set(existingPages.map(p => p.slug));
  const pagesToCreate: any[] = [];

  for (const [key, pageConfig] of Object.entries(FASHION_DEFAULT_PAGES)) {
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
        position: Object.keys(FASHION_DEFAULT_PAGES).indexOf(key),
      });
    }
  }

  return pagesToCreate;
}
