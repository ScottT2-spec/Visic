import "dotenv/config";
import { prisma } from "./src/lib/db";
import { mergeBespokeTemplateBlocks } from "./src/lib/templates/bespoke-page-content";

async function debugSeeding() {
  console.log('=== DEBUGGING SEEDING FAILURES ===\n');

  try {
    // Get one of the failing pages
    const failingPage = await prisma.page.findFirst({
      where: {
        slug: 'menu',
        site: {
          slug: 'samara-beauty'
        }
      },
      include: {
        site: {
          include: {
            templates: {
              where: { isActive: true },
              include: { template: true }
            }
          }
        }
      }
    });

    if (!failingPage) {
      console.log('No failing page found');
      return;
    }

    console.log('Failing page:', failingPage.title, failingPage.slug);
    console.log('Site:', failingPage.site.name);
    console.log('Template:', failingPage.site.templates[0]?.template?.slug);
    console.log('Current content blocks:', (failingPage.content as any)?.blocks?.length || 0);

    const templateSlug = failingPage.site.templates[0]?.template?.slug;
    const pageSlug = failingPage.slug;
    const pageTitle = failingPage.title;
    const pageType = failingPage.type;

    console.log('\nAttempting to generate blocks...');
    const generatedBlocks = mergeBespokeTemplateBlocks(
      templateSlug,
      pageSlug,
      null,
      {
        pageSlug,
        pageTitle,
        pageType,
        templateSlug
      }
    );

    console.log('Generated blocks:', generatedBlocks?.length || 0);
    if (generatedBlocks && generatedBlocks.length > 0) {
      console.log('First block:', JSON.stringify(generatedBlocks[0], null, 2));
    } else {
      console.log('No blocks generated!');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

debugSeeding();
