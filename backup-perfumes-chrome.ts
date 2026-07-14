import "dotenv/config";
import { prisma } from "./src/lib/db";
import fs from 'fs';
import path from 'path';

async function backupPerfumesChrome() {
  console.log('Backing up perfumes header/footer props...\n');
  
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

    const backupData: any[] = [];

    for (const site of sites) {
      const templateSlug = site.templates[0]?.template?.slug;
      
      if (templateSlug !== 'perfumes') continue;

      console.log(`=== SITE: ${site.name} (${site.id}) ===`);
      
      for (const page of site.pages) {
        const content = page.content as any;
        
        if (content?.blocks && Array.isArray(content.blocks)) {
          for (const block of content.blocks) {
            if (block.type === 'perfumesHeader' || block.type === 'perfumesFooter') {
              backupData.push({
                siteId: site.id,
                siteName: site.name,
                pageId: page.id,
                pageTitle: page.title,
                pageSlug: page.slug,
                blockType: block.type,
                blockId: block.id,
                props: block.props
              });
              
              console.log(`  ${block.type} on ${page.title} (${page.slug}):`);
              console.log(`    Block ID: ${block.id}`);
              console.log(`    Props:`, JSON.stringify(block.props, null, 2));
            }
          }
        }
      }
    }

    // Write backup to JSON file
    const backupPath = path.join(process.cwd(), 'perfumes-chrome-backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`\n✅ Backup written to: ${backupPath}`);
    console.log(`Total records backed up: ${backupData.length}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

backupPerfumesChrome();
