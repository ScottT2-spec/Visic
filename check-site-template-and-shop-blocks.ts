import { prisma } from "@/lib/db";

async function main() {
  const sites = ["cosmetics", "stacj"];
  
  for (const siteSlug of sites) {
    console.log(`\n=== Checking ${siteSlug} ===\n`);
    
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
    
    console.log(`Site: ${site.name}`);
    console.log(`  slug: ${site.slug}`);
    console.log(`  subdomain: ${site.subdomain}`);
    console.log(`  templateSlug: ${site.templateSlug}`);
    console.log(`  templateId: ${site.templateId}`);
    
    // Check shop page
    const shopPage = await prisma.page.findFirst({
      where: {
        siteId: site.id,
        slug: "shop",
      },
    });
    
    if (shopPage) {
      console.log(`\nShop page found:`);
      console.log(`  id: ${shopPage.id}`);
      console.log(`  title: ${shopPage.title}`);
      console.log(`  slug: ${shopPage.slug}`);
      console.log(`  type: ${shopPage.type}`);
      console.log(`  content.blocks count: ${shopPage.content?.blocks?.length || 0}`);
      
      if (shopPage.content?.blocks && shopPage.content.blocks.length > 0) {
        console.log(`  First block type: ${(shopPage.content.blocks as any[])[0].type}`);
        console.log(`  First block props:`, JSON.stringify((shopPage.content.blocks as any[])[0].props, null, 2));
      }
    } else {
      console.log(`\nShop page NOT found`);
    }
  }
}

main().catch(console.error);
