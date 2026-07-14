import "dotenv/config";
import { prisma } from "./src/lib/db";

async function investigateFailure() {
  console.log('=== INVESTIGATING REMAINING FAILURES ===\n');

  try {
    // Find the fashion-classic page with empty blocks
    const failingPages = await prisma.page.findMany({
      where: {
        site: {
          templates: {
            some: {
              template: { slug: 'fashion-classic' },
              isActive: true
            }
          }
        },
        content: {
          equals: { blocks: [] }
        }
      },
      include: {
        site: {
          include: {
            templates: {
              where: { isActive: true },
              include: { template: true }
            }
          }
        }
      }
    });

    console.log(`Found ${failingPages.length} failing pages in fashion-classic template:`);
    
    for (const page of failingPages) {
      console.log(`\n--- Page: ${page.title} (${page.slug}) ---`);
      console.log(`Site: ${page.site.name}`);
      console.log(`Template: ${page.site.templates[0]?.template?.slug}`);
      console.log(`Page Type: ${page.type}`);
      console.log(`Content:`, JSON.stringify(page.content, null, 2));
    }

    // Also check sites without template
    const sitesWithoutTemplate = await prisma.site.findMany({
      where: {
        templates: {
          none: { isActive: true }
        }
      },
      include: {
        pages: true
      }
    });

    console.log(`\n\n=== SITES WITHOUT TEMPLATE (${sitesWithoutTemplate.length}) ===`);
    for (const site of sitesWithoutTemplate) {
      console.log(`- ${site.name} (${site.slug}) - ${site.pages.length} pages`);
      const emptyPages = site.pages.filter(p => {
        const content = p.content as any;
        return !content?.blocks || content.blocks.length === 0;
      });
      if (emptyPages.length > 0) {
        console.log(`  Empty pages: ${emptyPages.map(p => p.slug).join(', ')}`);
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

investigateFailure();
