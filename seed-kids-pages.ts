import "dotenv/config";
import { prisma } from "./src/lib/db";
import { KIDS_ABOUT_PAGE_BLOCKS, KIDS_CONTACT_PAGE_BLOCKS, KIDS_BLOG_PAGE_BLOCKS, KIDS_SHOP_PAGE_BLOCKS } from "./src/lib/templates/presets/kids-page-presets";
import { KIDS_TEMPLATE_PRESET } from "./src/lib/templates/presets/kids-preset";

async function seedKidsPages() {
  console.log('=== SEEDING KIDS PAGES WITH REAL CONTENT ===\n');

  try {
    const kidsSites = await prisma.site.findMany({
      where: {
        slug: { in: ['kids', 'kids2', 'kids3', 'kids4'] }
      },
      include: {
        pages: true,
        templates: {
          where: { isActive: true },
          include: { template: true }
        }
      }
    });

    let seededCount = 0;
    let skippedCount = 0;

    for (const site of kidsSites) {
      console.log(`\n--- Site: ${site.name} (${site.slug}) ---`);
      const templateSlug = site.templates[0]?.template?.slug || 'kids';
      
      for (const page of site.pages) {
        const content = page.content as any;
        const blocks = content?.blocks || [];
        const pageSlug = page.slug.toLowerCase();
        
        // Force re-seed if page has generic content (simple hero blocks)
        // or if it's one of the pages we want to re-seed with rich content
        const shouldReseed = ['about', 'about-us', 'contact', 'contact-us', 'blog', 'shop'].includes(pageSlug);
        if (blocks.length > 0 && !shouldReseed) {
          console.log(`  Skipping ${page.title} (${page.slug}): ${blocks.length} blocks (already has content)`);
          skippedCount++;
          continue;
        }

        // Map page slug to appropriate preset
        let blocksToSeed: any[] = [];
        
        if (pageSlug === 'about' || pageSlug === 'about-us') {
          blocksToSeed = KIDS_ABOUT_PAGE_BLOCKS;
        } else if (pageSlug === 'contact' || pageSlug === 'contact-us') {
          blocksToSeed = KIDS_CONTACT_PAGE_BLOCKS;
        } else if (pageSlug === 'blog') {
          blocksToSeed = KIDS_BLOG_PAGE_BLOCKS;
        } else if (pageSlug === 'shop' || pageSlug === 'products' || pageSlug === 'store') {
          blocksToSeed = KIDS_SHOP_PAGE_BLOCKS;
        } else if (pageSlug === 'home' || pageSlug === '/') {
          blocksToSeed = KIDS_TEMPLATE_PRESET;
        } else {
          console.log(`  Skipping ${page.title} (${page.slug}): No preset available for this page type`);
          skippedCount++;
          continue;
        }

        // Update store name and slug in blocks
        const updatedBlocks = blocksToSeed.map(block => {
          if (block.type === 'kidsHeader' || block.type === 'kidsFooter') {
            return {
              ...block,
              props: {
                ...block.props,
                storeName: site.name,
                storeSlug: site.slug,
              }
            };
          }
          return block;
        });

        await prisma.page.update({
          where: { id: page.id },
          data: {
            content: { blocks: updatedBlocks }
          }
        });

        console.log(`  Seeded ${page.title} (${page.slug}): ${updatedBlocks.length} blocks`);
        seededCount++;
      }
    }

    console.log(`\n=== SEEDING COMPLETE ===`);
    console.log(`Seeded: ${seededCount} pages`);
    console.log(`Skipped: ${skippedCount} pages`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedKidsPages();
