import "dotenv/config";
import { prisma } from "./src/lib/db";
import { ensureTemplatePages } from "./src/lib/templates/template-pages";

async function seedTShirtsPrintsPages() {
  console.log('=== SEEDING T-SHIRTS & PRINTS PAGES USING ensureTemplatePages ===\n');

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
        templates: {
          where: { isActive: true },
          include: { template: true }
        }
      }
    });

    if (tshirtSites.length === 0) {
      console.log('No t-shirts-prints sites found');
      await prisma.$disconnect();
      return;
    }

    let totalCreated = 0;
    let totalUpdated = 0;

    for (const site of tshirtSites) {
      console.log(`\n--- Site: ${site.name} (${site.slug}) ---`);
      const templateSlug = site.templates[0]?.template?.slug || 't-shirts-prints';
      console.log(`  Template: ${templateSlug}`);
      
      // Get existing pages before
      const existingPages = await prisma.page.findMany({
        where: { siteId: site.id },
        orderBy: { position: 'asc' }
      });
      console.log(`  Existing pages: ${existingPages.length}`);
      existingPages.forEach(p => console.log(`    - ${p.title} (${p.slug})`));

      // Call ensureTemplatePages with forceUpdate to re-seed pages
      await ensureTemplatePages(site.id, templateSlug, true);

      // Get pages after
      const newPages = await prisma.page.findMany({
        where: { siteId: site.id },
        orderBy: { position: 'asc' }
      });
      console.log(`  Pages after seeding: ${newPages.length}`);
      newPages.forEach(p => {
        const content = p.content as any;
        const blocks = content?.blocks || [];
        console.log(`    - ${p.title} (${p.slug}): ${blocks.length} blocks`);
        if (blocks.length > 0) {
          blocks.slice(0, 2).forEach((b: any) => console.log(`      * ${b.type}`));
        }
      });

      const createdCount = newPages.length - existingPages.length;
      if (createdCount > 0) {
        totalCreated += createdCount;
        console.log(`  Created: ${createdCount} new pages`);
      } else {
        totalUpdated++;
        console.log(`  Updated existing pages`);
      }
    }

    console.log(`\n=== SEEDING COMPLETE ===`);
    console.log(`Total sites processed: ${tshirtSites.length}`);
    console.log(`Total pages created: ${totalCreated}`);
    console.log(`Total sites updated: ${totalUpdated}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedTShirtsPrintsPages();
