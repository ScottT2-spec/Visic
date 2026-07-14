import "dotenv/config";
import { prisma } from "./src/lib/db";

async function inventoryBlockTypes() {
  console.log('Inventorying all block types from database...\n');
  
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

    console.log('=== ALL BLOCK TYPES ACROSS ALL SITES ===');
    console.log(`Total unique block types: ${allBlockTypes.size}\n`);
    const sortedTypes = Array.from(allBlockTypes).sort();
    sortedTypes.forEach(type => console.log(`  - ${type}`));

    console.log('\n=== BLOCK TYPES BY TEMPLATE ===');
    for (const [template, types] of blockTypesByTemplate) {
      console.log(`\n${template} (${types.size} types):`);
      Array.from(types).sort().forEach(type => console.log(`  - ${type}`));
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inventoryBlockTypes();
