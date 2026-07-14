import { prisma } from "@/lib/db";
import { COSMETICS_SHOP_BLOCKS, COSMETICS_BLOG_BLOCKS } from "@/lib/templates/presets/cosmetics-pages-preset";

async function main() {
  const cosmeticsSites = ["cos", "cosmetics", "cosmetics1", "cosmet", "cosmets", "stacj"];
  
  console.log("=== Re-applying Shop/Blog backfill for all cosmetics sites ===\n");
  
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
    
    // Update Shop page
    const shopPage = await prisma.page.findFirst({
      where: {
        siteId: site.id,
        slug: "shop",
      },
    });
    
    if (shopPage) {
      const currentBlocks = shopPage.content?.blocks as any[] || [];
      console.log(`Shop page: ${currentBlocks.length} blocks -> updating to ${COSMETICS_SHOP_BLOCKS.length} blocks`);
      
      await prisma.page.update({
        where: { id: shopPage.id },
        data: {
          content: {
            blocks: COSMETICS_SHOP_BLOCKS,
          },
        },
      });
    } else {
      console.log(`Shop page: MISSING - creating new page`);
      await prisma.page.create({
        data: {
          siteId: site.id,
          title: "Shop",
          slug: "shop",
          type: "CUSTOM",
          position: 10,
          content: {
            blocks: COSMETICS_SHOP_BLOCKS,
          },
        },
      });
    }
    
    // Update Blog page
    const blogPage = await prisma.page.findFirst({
      where: {
        siteId: site.id,
        slug: "blog",
      },
    });
    
    if (blogPage) {
      const currentBlocks = blogPage.content?.blocks as any[] || [];
      console.log(`Blog page: ${currentBlocks.length} blocks -> updating to ${COSMETICS_BLOG_BLOCKS.length} blocks`);
      
      await prisma.page.update({
        where: { id: blogPage.id },
        data: {
          content: {
            blocks: COSMETICS_BLOG_BLOCKS,
          },
        },
      });
    } else {
      console.log(`Blog page: MISSING - creating new page`);
      await prisma.page.create({
        data: {
          siteId: site.id,
          title: "Blog",
          slug: "blog",
          type: "CUSTOM",
          position: 11,
          content: {
            blocks: COSMETICS_BLOG_BLOCKS,
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
    
    const shopPage = await prisma.page.findFirst({
      where: { siteId: site.id, slug: "shop" },
    });
    const blogPage = await prisma.page.findFirst({
      where: { siteId: site.id, slug: "blog" },
    });
    
    const shopBlocks = shopPage?.content?.blocks as any[] || [];
    const blogBlocks = blogPage?.content?.blocks as any[] || [];
    
    console.log(`${siteSlug}: Shop=${shopBlocks.length} blocks, Blog=${blogBlocks.length} blocks`);
  }
}

main().catch(console.error);
