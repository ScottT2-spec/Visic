import "dotenv/config";
import { prisma } from "./src/lib/db";

async function main() {
  // Find all sites with cosmetics template
  const cosmeticsSites = await prisma.site.findMany({
    where: {
      templates: {
        some: {
          template: {
            slug: { contains: "cosmetics" }
          }
        }
      }
    },
    include: {
      templates: {
        include: {
          template: true
        }
      }
    }
  });

  console.log("=== COSMETICS TEMPLATE SITES ===");
  console.log(`Found ${cosmeticsSites.length} sites\n`);

  for (const site of cosmeticsSites) {
    console.log(`\n--- Site: ${site.name} (${site.slug}) ---`);
    console.log(`ID: ${site.id}`);

    const templates = site.templates.map((st: any) => st.template.slug).join(", ");
    console.log(`Templates: ${templates}`);

    // Get Home page
    const homePage = await prisma.page.findFirst({
      where: { siteId: site.id, type: "HOME" },
      select: { id: true, slug: true, content: true }
    });
    
    if (homePage) {
      console.log(`\nHome page (${homePage.slug}):`);
      console.log(`  Content type: ${typeof homePage.content}`);
      const content = homePage.content as any;
      if (content && content.blocks) {
        console.log(`  Blocks count: ${content.blocks.length}`);
        console.log(`  First block ID: ${content.blocks[0]?.id}`);
        console.log(`  First block type: ${content.blocks[0]?.type}`);
      } else {
        console.log(`  Content: ${JSON.stringify(content).substring(0, 200)}...`);
      }
    } else {
      console.log("\nNo Home page found");
    }

    // Get Terms page
    const termsPage = await prisma.page.findFirst({
      where: { siteId: site.id, slug: "terms" },
      select: { id: true, slug: true, content: true }
    });

    if (termsPage) {
      console.log(`\nTerms page (${termsPage.slug}):`);
      console.log(`  Content type: ${typeof termsPage.content}`);
      const content = termsPage.content as any;
      if (content && content.blocks) {
        console.log(`  Blocks count: ${content.blocks.length}`);
        console.log(`  First block ID: ${content.blocks[0]?.id}`);
        console.log(`  First block type: ${content.blocks[0]?.type}`);
      } else {
        console.log(`  Content: ${JSON.stringify(content).substring(0, 200)}...`);
      }
    } else {
      console.log("\nNo Terms page found");
    }
  }

  // Also check for any site with slug containing "cosmetics"
  console.log("\n\n=== SITES WITH 'cosmetics' IN SLUG ===");
  const slugCosmetics = await prisma.site.findMany({
    where: {
      slug: { contains: "cosmetics" }
    },
    select: { id: true, name: true, slug: true }
  });

  for (const site of slugCosmetics) {
    console.log(`- ${site.name} (${site.slug}) - ID: ${site.id}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
