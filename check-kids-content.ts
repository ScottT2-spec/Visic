import "dotenv/config";
import { prisma } from "./src/lib/db";

async function checkKidsContent() {
  console.log('=== CHECKING KIDS PAGES CONTENT ===\n');

  try {
    const kidsSites = await prisma.site.findMany({
      where: {
        slug: { in: ['kids', 'kids2', 'kids3', 'kids4'] }
      },
      include: {
        pages: {
          orderBy: { slug: 'asc' }
        },
        templates: {
          where: { isActive: true },
          include: { template: true }
        }
      }
    });

    for (const site of kidsSites) {
      console.log(`\n--- Site: ${site.name} (${site.slug}) ---`);
      console.log(`Template: ${site.templates[0]?.template?.slug}`);
      
      for (const page of site.pages) {
        const content = page.content as any;
        const blocks = content?.blocks || [];
        console.log(`  ${page.title} (${page.slug}): ${blocks.length} blocks`);
        
        if (blocks.length > 0) {
          const firstBlock = blocks[0];
          console.log(`    First block type: ${firstBlock.type}`);
          if (firstBlock.props?.heading) {
            console.log(`    First block heading: ${firstBlock.props.heading}`);
          }
          // Show if it looks like generic content
          if (firstBlock.type === 'hero' && firstBlock.props?.subheading?.includes('summary')) {
            console.log(`    ⚠️ APPEARS TO BE GENERIC CONTENT`);
          }
        }
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkKidsContent();
