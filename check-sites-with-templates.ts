import "dotenv/config";
import { prisma } from "./src/lib/db";

async function checkSitesWithTemplates() {
  console.log('Checking sites with active templates...');
  
  try {
    const sites = await prisma.site.findMany({
      include: {
        templates: {
          where: { isActive: true },
          include: { template: true }
        },
        pages: {
          orderBy: { position: 'asc' },
          take: 3
        }
      }
    });

    console.log(`\nFound ${sites.length} total sites`);
    const sitesWithTemplates = sites.filter(s => s.templates.length > 0);
    console.log(`${sitesWithTemplates.length} sites have active templates\n`);

    for (const site of sitesWithTemplates.slice(0, 3)) {
      const activeTemplate = site.templates[0];
      console.log(`\n=== Site: ${site.name} (${site.id}) ===`);
      console.log(`Template: ${activeTemplate?.template?.slug}`);
      console.log(`Pages count: ${site.pages.length}\n`);

      for (const page of site.pages) {
        console.log(`\n--- Page: ${page.title} (${page.slug}) ---`);
        
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
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkSitesWithTemplates();
