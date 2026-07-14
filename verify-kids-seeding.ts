import "dotenv/config";
import { prisma } from "./src/lib/db";

async function verifyKidsSeeding() {
  console.log('=== VERIFYING KIDS PAGES SEEDING ===\n');

  try {
    const kids3Site = await prisma.site.findFirst({
      where: { slug: 'kids3' },
      include: {
        pages: {
          where: { slug: 'about' }
        }
      }
    });

    if (!kids3Site) {
      console.log('Kids3 site not found');
      return;
    }

    const aboutPage = kids3Site.pages[0];
    if (!aboutPage) {
      console.log('About page not found');
      return;
    }

    const content = aboutPage.content as any;
    const blocks = content?.blocks || [];
    
    console.log(`--- kids3 About Page (${blocks.length} blocks) ---`);
    console.log(JSON.stringify(blocks, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

verifyKidsSeeding();
