import "dotenv/config";
import { prisma } from "./src/lib/db";
import { ensureTemplatePages } from "./src/lib/templates/template-pages";

async function reseedTshirtBlogOnly() {
  console.log('=== RE-SEEDING T-SHIRTS & PRINTS BLOG PAGE ONLY ===\n');

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

    for (const site of tshirtSites) {
      console.log(`\n--- Site: ${site.name} (${site.slug}) ---`);
      const templateSlug = site.templates[0]?.template?.slug || 't-shirts-prints';
      console.log(`  Template: ${templateSlug}`);
      
      // Get blog page before
      const blogBefore = await prisma.page.findFirst({
        where: { siteId: site.id, slug: 'blog' },
        select: { title: true, slug: true, content: true }
      });
      
      if (blogBefore) {
        const content = blogBefore.content as any;
        const blocks = content?.blocks || [];
        console.log(`  Blog page before: ${blocks.length} blocks`);
        blocks.slice(0, 3).forEach((b: any) => console.log(`    - ${b.type}`));
      } else {
        console.log(`  Blog page before: NOT FOUND`);
      }

      // Force re-seed all pages (ensureTemplatePages doesn't support single page re-seed)
      await ensureTemplatePages(site.id, templateSlug, true);

      // Get blog page after
      const blogAfter = await prisma.page.findFirst({
        where: { siteId: site.id, slug: 'blog' },
        select: { title: true, slug: true, content: true }
      });
      
      if (blogAfter) {
        const content = blogAfter.content as any;
        const blocks = content?.blocks || [];
        console.log(`  Blog page after: ${blocks.length} blocks`);
        blocks.forEach((b: any) => console.log(`    - ${b.type}`));
      } else {
        console.log(`  Blog page after: NOT FOUND`);
      }
    }

    console.log(`\n=== RE-SEEDING COMPLETE ===`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

reseedTshirtBlogOnly();
