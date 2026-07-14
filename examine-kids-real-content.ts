import "dotenv/config";
import { prisma } from "./src/lib/db";

async function examineKidsRealContent() {
  console.log('=== EXAMINING REAL KIDS CONTENT FROM MAIN KIDS SITE ===\n');

  try {
    const kidsSite = await prisma.site.findFirst({
      where: { slug: 'kids' },
      include: {
        pages: {
          orderBy: { slug: 'asc' }
        }
      }
    });

    if (!kidsSite) {
      console.log('Kids site not found');
      return;
    }

    const aboutPage = kidsSite.pages.find(p => p.slug === 'about-us');
    if (aboutPage) {
      const content = aboutPage.content as any;
      const blocks = content?.blocks || [];
      console.log(`\n--- About Us Page (${blocks.length} blocks) ---`);
      console.log(JSON.stringify(blocks, null, 2));
    }

    const contactPage = kidsSite.pages.find(p => p.slug === 'contact-us');
    if (contactPage) {
      const content = contactPage.content as any;
      const blocks = content?.blocks || [];
      console.log(`\n--- Contact Us Page (${blocks.length} blocks) ---`);
      console.log(JSON.stringify(blocks, null, 2));
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

examineKidsRealContent();
