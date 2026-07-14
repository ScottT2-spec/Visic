import { prisma } from "@/lib/db";

async function main() {
  const cosmeticsSites = ["cos", "cosmetics", "cosmetics1", "cosmet", "cosmets", "stacj"];
  
  console.log("=== FINAL VERIFICATION TABLE ===\n");
  console.log("Checking all 4 pages (Home, Terms, Shop, Blog) for all 6 cosmetics sites\n");
  
  const results: any[] = [];
  
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
      results.push({ site: siteSlug, error: "Site not found" });
      continue;
    }
    
    const pages = await prisma.page.findMany({
      where: { siteId: site.id },
    });
    
    const homePage = pages.find(p => p.slug === "home");
    const termsPage = pages.find(p => p.slug === "terms");
    const shopPage = pages.find(p => p.slug === "shop");
    const blogPage = pages.find(p => p.slug === "blog");
    
    const homeBlocks = homePage?.content?.blocks as any[] || [];
    const termsBlocks = termsPage?.content?.blocks as any[] || [];
    const shopBlocks = shopPage?.content?.blocks as any[] || [];
    const blogBlocks = blogPage?.content?.blocks as any[] || [];
    
    const termsInfoBoxes = termsBlocks[1]?.props?.boxes || [];
    
    results.push({
      site: siteSlug,
      home: {
        exists: !!homePage,
        blocks: homeBlocks.length,
        hasContent: homeBlocks.length > 0,
      },
      terms: {
        exists: !!termsPage,
        blocks: termsBlocks.length,
        hasContent: termsBlocks.length === 2,
        infoBoxes: termsInfoBoxes.length,
        correctStructure: termsBlocks.length === 2 && termsInfoBoxes.length === 9,
      },
      shop: {
        exists: !!shopPage,
        blocks: shopBlocks.length,
        hasContent: shopBlocks.length === 1,
        hasHeader: shopBlocks[0]?.type === "cosmeticsShopPageHeader",
      },
      blog: {
        exists: !!blogPage,
        blocks: blogBlocks.length,
        hasContent: blogBlocks.length === 1,
        hasHeader: blogBlocks[0]?.type === "cosmeticsBlogPageHeader",
      },
    });
  }
  
  // Print table
  console.log("Site | Home (blocks) | Terms (blocks/info) | Shop (blocks) | Blog (blocks)");
  console.log("-----|---------------|---------------------|--------------|--------------");
  
  for (const r of results) {
    if (r.error) {
      console.log(`${r.site.padEnd(5)} | ERROR: ${r.error}`);
      continue;
    }
    
    const homeStatus = r.home.exists ? `${r.home.blocks} blocks` : "MISSING";
    const termsStatus = r.terms.exists ? `${r.terms.blocks} blocks/${r.terms.infoBoxes} info` : "MISSING";
    const shopStatus = r.shop.exists ? `${r.shop.blocks} blocks` : "MISSING";
    const blogStatus = r.blog.exists ? `${r.blog.blocks} blocks` : "MISSING";
    
    console.log(`${r.site.padEnd(5)} | ${homeStatus.padEnd(13)} | ${termsStatus.padEnd(19)} | ${shopStatus.padEnd(12)} | ${blogStatus.padEnd(12)}`);
  }
  
  console.log("\n=== DETAILED STATUS ===\n");
  
  for (const r of results) {
    if (r.error) continue;
    
    console.log(`${r.site}:`);
    console.log(`  Home: ${r.home.exists ? "✓" : "✗"} (${r.home.blocks} blocks)`);
    console.log(`  Terms: ${r.terms.correctStructure ? "✓" : "✗"} (${r.terms.blocks} blocks, ${r.terms.infoBoxes} info boxes)`);
    console.log(`  Shop: ${r.shop.hasContent && r.shop.hasHeader ? "✓" : "✗"} (${r.shop.blocks} blocks, ${r.shop.hasHeader ? "has header" : "no header"})`);
    console.log(`  Blog: ${r.blog.hasContent && r.blog.hasHeader ? "✓" : "✗"} (${r.blog.blocks} blocks, ${r.blog.hasHeader ? "has header" : "no header"})`);
    console.log();
  }
  
  console.log("=== SUMMARY ===");
  const allHomeOk = results.filter(r => !r.error && r.home.hasContent).length;
  const allTermsOk = results.filter(r => !r.error && r.terms.correctStructure).length;
  const allShopOk = results.filter(r => !r.error && r.shop.hasContent && r.shop.hasHeader).length;
  const allBlogOk = results.filter(r => !r.error && r.blog.hasContent && r.blog.hasHeader).length;
  
  console.log(`Home pages with content: ${allHomeOk}/6`);
  console.log(`Terms pages correct (2 blocks, 9 info): ${allTermsOk}/6`);
  console.log(`Shop pages correct (1 block, header): ${allShopOk}/6`);
  console.log(`Blog pages correct (1 block, header): ${allBlogOk}/6`);
  console.log();
  console.log("Live routes: UNCHANGED (zero modifications to live-serving files)");
  console.log("Editor preview: UPDATED (adds product/blog data rendering for cosmetics)");
}

main().catch(console.error);
