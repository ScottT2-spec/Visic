import "dotenv/config";
import { prisma } from "./src/lib/db";

async function checkDatabasePages() {
  console.log('Checking database pages...');
  
  try {
    // Get a sample site with pages
    const sites = await prisma.site.findMany({
      include: {
        templates: {
          where: { isActive: true },
          include: { template: true }
        },
        pages: {
          orderBy: { position: 'asc' },
          take: 5
        }
      },
      take: 3
    });

    console.log(`\nFound ${sites.length} sites\n`);

    for (const site of sites) {
      const activeTemplate = site.templates[0];
      console.log(`\n=== Site: ${site.name} (${site.id}) ===`);
      console.log(`Template: ${activeTemplate?.template?.slug || 'none'}`);
      console.log(`Pages count: ${site.pages.length}\n`);

      for (const page of site.pages) {
        console.log(`\n--- Page: ${page.title} (${page.slug}) ---`);
        console.log(`ID: ${page.id}`);
        console.log(`Type: ${page.type}`);
        
        const content = page.content as any;
        console.log(`Content structure:`, {
          hasBlocks: !!content?.blocks,
          blocksCount: Array.isArray(content?.blocks) ? content.blocks.length : 0,
          hasSections: !!content?.sections,
          sectionsCount: Array.isArray(content?.sections) ? content.sections.length : 0
        });

        if (content?.sections && Array.isArray(content.sections) && content.sections.length > 0) {
          console.log(`\nFirst section:`);
          const firstSection = content.sections[0];
          console.log(JSON.stringify(firstSection, null, 2));
          
          if (content.sections.length > 1) {
            console.log(`\nSecond section:`);
            console.log(JSON.stringify(content.sections[1], null, 2));
          }
        } else if (content?.blocks && Array.isArray(content.blocks) && content.blocks.length > 0) {
          console.log(`\nFirst block:`);
          const firstBlock = content.blocks[0];
          console.log(JSON.stringify(firstBlock, null, 2));
        }
      }
    }
  } catch (err) {
    console.error('Error checking database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabasePages();
