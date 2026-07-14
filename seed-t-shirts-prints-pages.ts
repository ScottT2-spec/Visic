import "dotenv/config";
import { prisma } from "./src/lib/db";
import { TSHIRTS_PRINTS_ABOUT_PAGE_BLOCKS, TSHIRTS_PRINTS_CONTACT_PAGE_BLOCKS, TSHIRTS_PRINTS_BLOG_PAGE_BLOCKS, TSHIRTS_PRINTS_SHOP_PAGE_BLOCKS } from "./src/lib/templates/presets/t-shirts-prints-page-presets";
import { T_SHIRTS_PRINTS_PRESET } from "./src/lib/templates/presets/t-shirts-prints-preset";

async function seedTShirtsPrintsPages() {
  console.log('=== SEEDING T-SHIRTS & PRINTS PAGES WITH REAL CONTENT ===\n');

  try {
    const tshirtSites = await prisma.site.findMany({
      where: {
        OR: [
          { slug: { in: ['t-shirts-prints', 'tshirts', 'huty'] } },
          { name: { contains: 't-shirt', mode: 'insensitive' } },
          { name: { contains: 'print', mode: 'insensitive' } },
        ]
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

    for (const site of tshirtSites) {
      console.log(`\n--- Site: ${site.name} (${site.slug}) ---`);
      const templateSlug = site.templates[0]?.template?.slug || 't-shirts-prints';
      
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
          blocksToSeed = TSHIRTS_PRINTS_ABOUT_PAGE_BLOCKS;
        } else if (pageSlug === 'contact' || pageSlug === 'contact-us') {
          blocksToSeed = TSHIRTS_PRINTS_CONTACT_PAGE_BLOCKS;
        } else if (pageSlug === 'blog') {
          blocksToSeed = TSHIRTS_PRINTS_BLOG_PAGE_BLOCKS;
        } else if (pageSlug === 'shop' || pageSlug === 'products' || pageSlug === 'store') {
          blocksToSeed = TSHIRTS_PRINTS_SHOP_PAGE_BLOCKS;
        } else if (pageSlug === 'home' || pageSlug === '/') {
          blocksToSeed = T_SHIRTS_PRINTS_PRESET;
        } else {
          console.log(`  Skipping ${page.title} (${page.slug}): No preset available for this page type`);
          skippedCount++;
          continue;
        }

        // Update store name and slug in blocks
        const updatedBlocks = blocksToSeed.map(block => {
          if (block.type === 'tShirtsPrintsHeader' || block.type === 'tShirtsPrintsFooter') {
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

seedTShirtsPrintsPages();
