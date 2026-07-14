import { prisma } from "@/lib/db";

async function main() {
  const cosmeticsSites = ["cos", "cosmetics", "cosmetics1", "cosmet", "cosmets", "stacj"];
  
  console.log("=== Checking all cosmetics-template sites' Shop pages ===\n");
  
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
    
    const shopPage = await prisma.page.findFirst({
      where: {
        siteId: site.id,
        slug: "shop",
      },
    });
    
    if (shopPage) {
      const blocks = shopPage.content?.blocks as any[] || [];
      console.log(`${siteSlug}: Shop page exists, ${blocks.length} blocks`);
      if (blocks.length > 0) {
        console.log(`  First block type: ${blocks[0].type}`);
      }
    } else {
      console.log(`${siteSlug}: Shop page MISSING`);
    }
  }
}

main().catch(console.error);
