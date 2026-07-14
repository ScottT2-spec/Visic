import "dotenv/config";
import { prisma } from "./src/lib/db";
import { ensureTemplatePages } from "./src/lib/templates/template-pages";

async function reinitializePagesWithRichContent() {
  console.log('Starting FORCE re-initialization of pages with rich content...');
  console.log('This will UPDATE ALL existing pages with new rich template-specific content\n');
  
  try {
    // Get all sites with active templates
    const sites = await prisma.site.findMany({
      include: {
        templates: {
          where: { isActive: true },
          include: { template: true }
        }
      }
    });

    console.log(`Found ${sites.length} sites to process\n`);

    for (const site of sites) {
      const activeTemplate = site.templates[0];
      if (!activeTemplate) {
        console.log(`Site ${site.id} (${site.name}) has no active template, skipping`);
        continue;
      }

      const templateSlug = activeTemplate.template.slug;
      console.log(`Processing site ${site.id} (${site.name}) with template ${templateSlug}`);

      try {
        // Force re-initialization by ensuring template pages with forceRefresh=true
        await ensureTemplatePages(site.id, templateSlug, true); // forceRefresh = true
        console.log(`✓ Successfully force-updated pages for site ${site.id}\n`);
      } catch (err) {
        console.error(`✗ Error re-initializing pages for site ${site.id}:`, err);
      }
    }

    console.log('Force re-initialization complete!');
  } catch (err) {
    console.error('Fatal error during re-initialization:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

reinitializePagesWithRichContent();
