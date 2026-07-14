import "dotenv/config";
import { prisma } from "./src/lib/db";

async function revertKidsGenericContent() {
  console.log('=== REVERTING GENERIC CONTENT FROM KIDS2, KIDS3, KIDS4 ===\n');

  try {
    const kidsSites = await prisma.site.findMany({
      where: {
        slug: { in: ['kids2', 'kids3', 'kids4'] }
      },
      include: {
        pages: true
      }
    });

    let revertedCount = 0;

    for (const site of kidsSites) {
      console.log(`\n--- Site: ${site.name} (${site.slug}) ---`);
      
      for (const page of site.pages) {
        const content = page.content as any;
        const blocks = content?.blocks || [];
        
        // Check if this page has generic hero blocks (the wrong content)
        const hasGenericHero = blocks.length > 0 && blocks[0].type === 'hero' && 
                              blocks[0].props?.heading && 
                              ['About', 'Blog', 'Contact'].includes(blocks[0].props.heading);
        
        if (hasGenericHero) {
          console.log(`  Reverting ${page.title} (${page.slug}): ${blocks.length} generic blocks -> 0 blocks`);
          
          await prisma.page.update({
            where: { id: page.id },
            data: {
              content: { blocks: [] }
            }
          });
          
          revertedCount++;
        } else {
          console.log(`  Skipping ${page.title} (${page.slug}): ${blocks.length} blocks (not generic)`);
        }
      }
    }

    console.log(`\n=== REVERT COMPLETE ===`);
    console.log(`Reverted ${revertedCount} pages to empty blocks`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

revertKidsGenericContent();
