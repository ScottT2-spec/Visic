import "dotenv/config";
import { prisma } from "./src/lib/db";

async function checkSpecificSite() {
  console.log('Checking specific sites with Perfumes template...\n');
  
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
      
      for (const page of perfumeSite.pages.slice(0, 6)) {
        console.log(`--- Page: ${page.title} (${page.slug}) ---`);
        const content = page.content as any;
        console.log(`Sections count: ${Array.isArray(content?.sections) ? content.sections.length : 0}`);
        
        if (content?.sections && content.sections.length > 0) {
          const heroSection = content.sections.find((s: any) => s.type === 'hero');
          if (heroSection) {
            console.log(`Hero title: ${heroSection.props?.title || 'N/A'}`);
            console.log(`Hero subtitle: ${heroSection.props?.subtitle || 'N/A'}`);
            console.log(`Hero badge: ${heroSection.props?.badge || 'N/A'}`);
          }
        }
        console.log('');
      }
    }

    if (!perfumeSite) console.log('No perfumes template site found');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificSite();
