import "dotenv/config";
import { prisma } from "./src/lib/db";

async function investigateHeaderFooter() {
  console.log('Investigating header/footer block data...\n');
  
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

    const chromeBlockTypes = [
      'perfumesHeader', 'perfumesFooter',
      'handmadeBagsHeader', 'handmadeBagsFooter',
      'cosmeticsHeader', 'cosmeticsFooter',
      'kidsHeader', 'kidsFooter',
      'tShirtsPrintsHeader', 'tShirtsPrintsFooter'
    ];

    for (const site of sites) {
      const templateSlug = site.templates[0]?.template?.slug || 'unknown';
      
      // Check if this site has chrome blocks
      const siteChromeBlocks = new Map<string, any[]>();
      
      for (const page of site.pages) {
        const content = page.content as any;
        
        if (content?.blocks && Array.isArray(content.blocks)) {
          for (const block of content.blocks) {
            if (chromeBlockTypes.includes(block.type)) {
              if (!siteChromeBlocks.has(block.type)) {
                siteChromeBlocks.set(block.type, []);
              }
              siteChromeBlocks.get(block.type)!.push({
                pageId: page.id,
                pageTitle: page.title,
                pageSlug: page.slug,
                blockId: block.id,
                props: block.props
              });
            }
          }
        }
      }

      if (siteChromeBlocks.size > 0) {
        console.log(`=== SITE: ${site.name} (${templateSlug}) ===`);
        console.log(`Site ID: ${site.id}\n`);
        
        for (const [blockType, occurrences] of siteChromeBlocks) {
          console.log(`Block type: ${blockType}`);
          console.log(`Found on ${occurrences.length} page(s):`);
          
          // Check if props are identical across all pages
          const firstProps = JSON.stringify(occurrences[0].props);
          const allIdentical = occurrences.every(o => JSON.stringify(o.props) === firstProps);
          
          console.log(`  Props identical across all pages: ${allIdentical ? 'YES' : 'NO'}`);
          
          if (!allIdentical) {
            console.log(`  First page props: ${JSON.stringify(occurrences[0].props, null, 2)}`);
            console.log(`  Second page props: ${JSON.stringify(occurrences[1].props, null, 2)}`);
          } else {
            console.log(`  Shared props: ${JSON.stringify(occurrences[0].props, null, 2)}`);
          }
          
          occurrences.forEach(o => {
            console.log(`    - ${o.pageTitle} (${o.pageSlug})`);
          });
          console.log('');
        }
        console.log('---\n');
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

investigateHeaderFooter();
