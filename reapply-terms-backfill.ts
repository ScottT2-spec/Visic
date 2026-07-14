import { prisma } from "@/lib/db";
import { COSMETICS_TERMS_BLOCKS } from "@/lib/templates/presets/cosmetics-pages-preset";

async function main() {
  const cosmeticsSites = ["cos", "cosmetics", "cosmetics1", "cosmet", "cosmets", "stacj"];
  
  console.log("=== Re-applying Terms backfill for all cosmetics sites ===\n");
  
  for (const siteSlug of cosmeticsSites) {
    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { slug: siteSlug },
          { subdomain: siteSlug },
        ],
      },
    });
    
    if (!site) {
      console.log(`${siteSlug}: Site not found, skipping`);
      continue;
    }
    
    console.log(`\n--- ${siteSlug} ---`);
    
    const termsPage = await prisma.page.findFirst({
      where: {
        siteId: site.id,
        slug: "terms",
      },
    });
    
    if (termsPage) {
      const currentBlocks = termsPage.content?.blocks as any[] || [];
      console.log(`Terms page: ${currentBlocks.length} blocks -> updating to ${COSMETICS_TERMS_BLOCKS.length} blocks`);
      
      await prisma.page.update({
        where: { id: termsPage.id },
        data: {
          content: {
            blocks: COSMETICS_TERMS_BLOCKS,
          },
        },
      });
    } else {
      console.log(`Terms page: MISSING - creating new page`);
      await prisma.page.create({
        data: {
          siteId: site.id,
          title: "Terms",
          slug: "terms",
          type: "CUSTOM",
          position: 12,
          content: {
            blocks: COSMETICS_TERMS_BLOCKS,
          },
        },
      });
    }
  }
  
  console.log("\n=== Verification ===");
  for (const siteSlug of cosmeticsSites) {
    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { slug: siteSlug },
          { subdomain: siteSlug },
        ],
      },
    });
    
    if (!site) continue;
    
    const termsPage = await prisma.page.findFirst({
      where: { siteId: site.id, slug: "terms" },
    });
    
    if (!termsPage) {
      console.log(`${siteSlug}: Terms page MISSING`);
      continue;
    }
    
    const blocks = termsPage.content?.blocks as any[] || [];
    const infoBoxes = blocks[1]?.props?.boxes || [];
    
    console.log(`${siteSlug}: ${blocks.length} blocks, ${infoBoxes.length} info boxes`);
  }
}

main().catch(console.error);
