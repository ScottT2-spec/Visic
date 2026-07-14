import "dotenv/config";
import { prisma } from "./src/lib/db";

async function dumpPageContent() {
  console.log('Dumping raw page content from database...\n');
  
  try {
    // Find sites with perfumes template
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

    const perfumeSite = sites.find(s => s.templates[0]?.template?.slug === 'perfumes');

    if (perfumeSite) {
      console.log('=== PERFUMES TEMPLATE SITE ===');
      console.log(`Site: ${perfumeSite.name} (${perfumeSite.id})\n`);
      
      for (const page of perfumeSite.pages.slice(0, 3)) {
        console.log(`--- Page: ${page.title} (${page.slug}) ---`);
        console.log(`Page ID: ${page.id}`);
        console.log(`Page Type: ${page.type}`);
        console.log(`Template: ${page.template || 'N/A'}`);
        console.log(`Is Published: ${page.isPublished}`);
        console.log(`\nRAW CONTENT FIELD (JSON):`);
        console.log(JSON.stringify(page.content, null, 2));
        console.log('\n' + '='.repeat(80) + '\n');
      }
    }

    // Also check a vegetable template site
    const vegetableSite = sites.find(s => s.templates[0]?.template?.slug === 'vegetables');
    
    if (vegetableSite) {
      console.log('=== VEGETABLES TEMPLATE SITE ===');
      console.log(`Site: ${vegetableSite.name} (${vegetableSite.id})\n`);
      
      for (const page of vegetableSite.pages.slice(0, 3)) {
        console.log(`--- Page: ${page.title} (${page.slug}) ---`);
        console.log(`Page ID: ${page.id}`);
        console.log(`Page Type: ${page.type}`);
        console.log(`Template: ${page.template || 'N/A'}`);
        console.log(`Is Published: ${page.isPublished}`);
        console.log(`\nRAW CONTENT FIELD (JSON):`);
        console.log(JSON.stringify(page.content, null, 2));
        console.log('\n' + '='.repeat(80) + '\n');
      }
    }

    if (!perfumeSite && !vegetableSite) console.log('No perfumes or vegetables template site found');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

dumpPageContent();
