import "dotenv/config";
import { prisma } from "./src/lib/db";

async function checkKidsSites() {
  console.log('Checking kids3 and kids4 sites...\n');
  
  try {
    const sites = await prisma.site.findMany({
      where: {
        OR: [
          { slug: 'kids3' },
          { slug: 'kids4' },
          { subdomain: 'kids3' },
          { subdomain: 'kids4' },
        ]
      },
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

    console.log(`Found ${sites.length} kids sites\n`);

    for (const site of sites) {
      console.log(`=== Site: ${site.name} (${site.id}) ===`);
      console.log(`Slug: ${site.slug}, Subdomain: ${site.subdomain}`);
      console.log(`Template: ${site.templates[0]?.template?.slug || 'N/A'}`);
      console.log(`Pages: ${site.pages.length}`);
      
      for (const page of site.pages.slice(0, 5)) {
        console.log(`  - ${page.title} (${page.slug}) - ID: ${page.id}`);
        const content = page.content as any;
        const blocks = content?.blocks || [];
        console.log(`    Blocks: ${blocks.length}`);
      }
      console.log('');
    }

    if (sites.length === 0) {
      console.log('No kids3/kids4 sites found. Listing all sites with kids template...');
      
      const kidsTemplateSites = await prisma.site.findMany({
        where: {
          templates: {
            some: {
              template: {
                slug: 'kids'
              }
            }
          }
        },
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

      console.log(`Found ${kidsTemplateSites.length} sites with kids template\n`);
      
      for (const site of kidsTemplateSites) {
        console.log(`=== Site: ${site.name} (${site.id}) ===`);
        console.log(`Slug: ${site.slug}, Subdomain: ${site.subdomain}`);
        console.log(`Pages: ${site.pages.length}`);
        
        for (const page of site.pages.slice(0, 5)) {
          console.log(`  - ${page.title} (${page.slug}) - ID: ${page.id}`);
        }
        console.log('');
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkKidsSites();
