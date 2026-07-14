import "dotenv/config";
import { prisma } from "./src/lib/db";
import { COSMETICS_TEMPLATE_PRESET } from "./src/lib/templates/presets/cosmetics-preset";
import { COSMETICS_TERMS_BLOCKS } from "./src/lib/templates/presets/cosmetics-pages-preset";

async function main() {
  console.log("=== COSMETICS TEMPLATE PRESETS ===\n");
  console.log("Home preset blocks:", COSMETICS_TEMPLATE_PRESET.length);
  console.log("Terms preset blocks:", COSMETICS_TERMS_BLOCKS.length);
  console.log("\nFirst home block ID:", COSMETICS_TEMPLATE_PRESET[0]?.id);
  console.log("First terms block ID:", COSMETICS_TERMS_BLOCKS[0]?.id);

  console.log("\n\n=== COSMETICS SITES CONTENT ===\n");

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

  for (const site of cosmeticsSites) {
    console.log(`\n--- Site: ${site.name} (${site.slug}) ---`);
    console.log(`ID: ${site.id}`);

    // Get Home page
    const homePage = await prisma.page.findFirst({
      where: { siteId: site.id, type: "HOME" },
      select: { id: true, slug: true, content: true }
    });

    if (homePage) {
      console.log(`\nHome page (${homePage.slug}):`);
      const content = homePage.content as any;
      if (content && content.blocks) {
        console.log(`  Blocks count: ${content.blocks.length}`);
        console.log(`  Block IDs: ${content.blocks.map((b: any) => b.id).join(", ")}`);
        console.log(`  First block type: ${content.blocks[0]?.type}`);
        console.log(`  Full content:`, JSON.stringify(content, null, 2));
      } else {
        console.log(`  Content:`, JSON.stringify(content, null, 2));
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
      const content = termsPage.content as any;
      if (content && content.blocks) {
        console.log(`  Blocks count: ${content.blocks.length}`);
        console.log(`  Block IDs: ${content.blocks.map((b: any) => b.id).join(", ")}`);
        console.log(`  First block type: ${content.blocks[0]?.type}`);
        console.log(`  Full content:`, JSON.stringify(content, null, 2));
      } else {
        console.log(`  Content:`, JSON.stringify(content, null, 2));
      }
    } else {
      console.log("\nNo Terms page found");
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
