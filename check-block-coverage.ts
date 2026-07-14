import "dotenv/config";
import { prisma } from "./src/lib/db";

async function checkBlockCoverage() {
  console.log('Checking block type coverage...\n');
  
  try {
    const sites = await prisma.site.findMany({
      include: {
        templates: {
          where: { isActive: true },
          include: { template: true }
        },
        pages: {
          orderBy: { position: 'asc' }
        }
      }
    });

    const allBlockTypes = new Set<string>();
    const blockTypesByTemplate = new Map<string, Set<string>>();

    for (const site of sites) {
      const templateSlug = site.templates[0]?.template?.slug || 'unknown';
      
      if (!blockTypesByTemplate.has(templateSlug)) {
        blockTypesByTemplate.set(templateSlug, new Set());
      }

      for (const page of site.pages) {
        const content = page.content as any;
        
        if (content?.blocks && Array.isArray(content.blocks)) {
          for (const block of content.blocks) {
            if (block.type) {
              allBlockTypes.add(block.type);
              blockTypesByTemplate.get(templateSlug)!.add(block.type);
            }
          }
        }
      }
    }

    // Block types supported by ALL_TEMPLATE_BLOCKS
    const supportedTemplateBlocks = new Set([
      // Fashion
      'fashionHeroSlider', 'fashionPromoBanners', 'fashionSectionTitle', 'fashionProductGrid',
      'fashionCategoryCards', 'fashionTestimonials', 'fashionBlogPosts', 'fashionNewsletter',
      'fashionFooter', 'fashionFeatures', 'fashionInstagram', 'fashionMarquee', 'fashionCoverBanners',
      // Electronics
      'electronicsHeroSlider', 'electronicsPromoBanners', 'electronicsProductTabs', 'electronicsBannerGrid',
      'electronicsHotDeals', 'electronicsSideBanner', 'electronicsGamingCTA', 'electronicsBlogPosts',
      'electronicsPartners', 'electronicsFooter', 'electronicsSectionTitle',
      // Bakery
      'bakeryHeroSlider', 'bakerySectionTitle', 'bakeryCategoryInfoBoxes', 'bakeryHandmade',
      'bakeryProductGrid', 'bakeryProcess', 'bakeryBlogPosts', 'bakeryCta', 'bakeryFooter',
      // Cosmetics
      'cosmeticsHeroSlider', 'cosmeticsPromoBanners', 'cosmeticsSectionTitle', 'cosmeticsProductGrid',
      'cosmeticsCategoryCards', 'cosmeticsDiscovery', 'cosmeticsCountdownBanner', 'cosmeticsInfoBoxes',
      'cosmeticsBlogPosts', 'cosmeticsInstagram', 'cosmeticsNewsletter',
      // Grocery
      'groceryHeroSlider', 'groceryFeaturesBar', 'grocerySectionTitle', 'groceryProductGrid',
      'groceryPromoBanners', 'groceryCategoryGrid', 'groceryNewsletter', 'groceryBestSellers', 'groceryFooter',
      // Health
      'healthHero', 'healthMarquee', 'healthPromoBanners', 'healthSectionTitle', 'healthCategoryCards',
      'healthProductGrid', 'healthVideoSection', 'healthFeatureSection', 'healthTestimonials',
      'healthBlogPosts', 'healthNewsletter', 'healthBrandMarquee', 'healthFooter', 'healthFooterFull',
      'healthAboutPage', 'healthContactPage', 'healthBlogPage', 'healthIngredientsPage',
      // Interior/Garden
      'interiorHeroSlider', 'interiorSectionTitle', 'interiorCategoryGrid', 'interiorProductGrid',
      'interiorInfoBoxes', 'interiorGardenProducts', 'interiorPromoBanners', 'interiorFurnitureCategories',
      'interiorFurnitureProducts', 'interiorBlogPosts', 'interiorBrandsBar', 'interiorCta', 'interiorFooter',
      'gardenHeroBanner', 'gardenCategoryBanner', 'gardenDiscountBanner', 'gardenNewArrivals',
      'gardenFeatures', 'gardenTestimonials', 'gardenAboutPage', 'gardenContactPage', 'gardenProductCategory',
      // Kids
      'kidsAnnouncementBar', 'kidsHeroSlider', 'kidsSectionTitle', 'kidsCategoryCards', 'kidsProductGrid',
      'kidsBundlePromo', 'kidsBlogPosts', 'kidsInstagram', 'kidsNewsletter', 'kidsFooter', 'kidsFooterFull',
      // Makeup
      'makeupHeroSlider', 'makeupCategorySidebar', 'makeupSectionTitle', 'makeupProductGrid',
      'makeupProductTypeCards', 'makeupBeforeAfter', 'makeupPromoBannerCards', 'makeupVideoBlog',
      'makeupBlogPosts', 'makeupBrandsCarousel', 'makeupFooter',
      // Perfumes
      'perfumesHeroSlider', 'perfumesSectionTitle', 'perfumesProductGrid', 'perfumesOlfactoryTags',
      'perfumesMarquee', 'perfumesFeaturedBanners', 'perfumesTabbedProducts', 'perfumesCollectionBanners',
      'perfumesBlogArticles', 'perfumesInstagram', 'perfumesFooter',
    ]);

    // Block types supported by BlockRenderer's internal renderers
    const supportedGenericBlocks = new Set([
      'heading', 'text', 'image', 'button', 'hero', 'columns', 'grid', 'spacer', 'divider',
      'product', 'products', 'whatsapp', 'social', 'countdown', 'testimonial', 'cta',
      'imageHeroBanner', 'staticProductGrid', 'linkCards', 'imageCategoryCards', 'imageBrands',
      'promoSplit', 'featured_products', 'collections', 'categories', 'new_arrivals', 'best_sellers',
      'brands', 'header', 'footer', 'product-grid', 'productGrid', 'whatsapp-cta', 'features',
      'imageText', 'faq', 'contactForm',
    ]);

    const allSupported = new Set([...supportedTemplateBlocks, ...supportedGenericBlocks]);

    console.log('=== BLOCK TYPES IN DATABASE BUT NOT SUPPORTED ===');
    const unsupported = Array.from(allBlockTypes).filter(type => !allSupported.has(type));
    if (unsupported.length === 0) {
      console.log('None - all block types are supported!');
    } else {
      unsupported.forEach(type => console.log(`  - ${type}`));
    }

    console.log('\n=== BLOCK TYPES SUPPORTED BUT NOT IN DATABASE ===');
    const unused = Array.from(allSupported).filter(type => !allBlockTypes.has(type));
    if (unused.length === 0) {
      console.log('None - all supported types are used!');
    } else {
      unused.forEach(type => console.log(`  - ${type}`));
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total unique block types in database: ${allBlockTypes.size}`);
    console.log(`Total supported block types: ${allSupported.size}`);
    console.log(`Unsupported block types: ${unsupported.length}`);
    console.log(`Unused supported types: ${unused.length}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkBlockCoverage();
