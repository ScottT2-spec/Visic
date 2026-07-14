import { prisma } from "@/lib/db";

async function main() {
  const cosmeticsSites = ["cos", "cosmetics", "cosmetics1", "cosmet", "cosmets", "stacj"];
  
  console.log("=== Verifying Terms pages for all cosmetics sites ===\n");
  
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
      console.log(`${siteSlug}: Site not found`);
      continue;
    }
    
    const termsPage = await prisma.page.findFirst({
      where: {
        siteId: site.id,
        slug: "terms",
      },
    });
    
    if (!termsPage) {
      console.log(`${siteSlug}: Terms page MISSING`);
      continue;
    }
    
    const blocks = termsPage.content?.blocks as any[] || [];
    
    console.log(`${siteSlug}:`);
    console.log(`  Terms page exists: ${blocks.length} blocks`);
    
    if (blocks.length === 2) {
      const firstBlock = blocks[0];
      const secondBlock = blocks[1];
      
      console.log(`  Block 1 type: ${firstBlock.type}`);
      console.log(`  Block 2 type: ${secondBlock.type}`);
      
      if (firstBlock.type === "cosmeticsHeroSlider" && secondBlock.type === "cosmeticsInfoBoxes") {
        const infoBoxes = secondBlock.props?.infoBoxes || [];
        console.log(`  Info boxes count: ${infoBoxes.length}`);
        console.log(`  ✓ Correct structure (hero + ${infoBoxes.length} info boxes)`);
      } else {
        console.log(`  ✗ Incorrect block types`);
      }
    } else {
      console.log(`  ✗ Expected 2 blocks, got ${blocks.length}`);
    }
    
    console.log();
  }
  
  console.log("\n=== Live curl commands for manual verification ===");
  for (const siteSlug of cosmeticsSites) {
    console.log(`curl -s http://localhost:3000/store/${siteSlug}/terms > /tmp/live-${siteSlug}-terms.html`);
  }
}

main().catch(console.error);
