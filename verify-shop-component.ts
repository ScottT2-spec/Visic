import { prisma } from "@/lib/db";

async function main() {
  const sites = ["cosmetics", "stacj"];
  
  for (const siteSlug of sites) {
    console.log(`\n=== Testing ShopPageContent for ${siteSlug} ===\n`);
    
    // Fetch site data
    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { slug: siteSlug },
          { subdomain: siteSlug },
        ],
      },
    });
    
    if (!site) {
      console.log(`Site ${siteSlug} not found`);
      continue;
    }
    
    console.log(`Site found: ${site.name} (ID: ${site.id}, template: ${site.templateSlug})`);
    
    // Fetch products
    const products = await prisma.product.findMany({
      where: { siteId: site.id },
      include: {
        images: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 24,
    });
    
    console.log(`Products found: ${products.length}`);
    
    // Fetch categories
    const categories = await prisma.category.findMany({
      where: { siteId: site.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    
    console.log(`Categories found: ${categories.length}`);
    
    // Fetch pages for nav
    const pages = await prisma.page.findMany({
      where: { siteId: site.id },
      select: { id: true, title: true, slug: true, type: true },
    });
    
    console.log(`Pages found: ${pages.length}`);
    
    // Fetch shop page blocks for labelOverrides
    const shopPage = await prisma.page.findFirst({
      where: {
        siteId: site.id,
        slug: "shop",
      },
    });
    
    let labelOverrides = undefined;
    if (shopPage && shopPage.content?.blocks) {
      const blocks = shopPage.content.blocks as any[];
      const headerBlock = blocks.find(b => b.type === "cosmeticsShopPageHeader");
      if (headerBlock) {
        labelOverrides = headerBlock.props;
        console.log(`Label overrides found:`, JSON.stringify(labelOverrides, null, 2));
      }
    }
    
    console.log(`\n--- Data structure for ShopPageContent ---`);
    console.log(`storeData: {`);
    console.log(`  store: { id: "${site.id}", name: "${site.name}", slug: "${site.slug}", templateSlash: "${site.templateSlug}", currency: "${site.currency}" },`);
    console.log(`  products: ${products.length} items,`);
    console.log(`  pagination: { page: 1, limit: 24, total: ${products.length}, pages: 1 },`);
    console.log(`  categories: ${categories.length} items,`);
    console.log(`  pages: ${pages.length} items,`);
    console.log(`}`);
    console.log(`labelOverrides: ${labelOverrides ? JSON.stringify(labelOverrides) : 'undefined'}`);
    
    console.log(`\n--- Live curl command for comparison ---`);
    console.log(`curl -s http://localhost:3000/store/${site.slug}/shop > /tmp/live-${site.slug}-shop.html`);
  }
}

main().catch(console.error);
