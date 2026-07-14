import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== DIAGNOSTIC QUERY ===\n');

  // Step 1: Find a kids site
  console.log('Step 1: Finding a kids site...');
  const kidsSites = await prisma.site.findMany({
    where: {
      subdomain: {
        contains: 'kids'
      }
    },
    select: {
      id: true,
      name: true,
      subdomain: true,
    }
  });

  if (kidsSites.length === 0) {
    console.log('No kids sites found. Looking for any site...');
    const anySite = await prisma.site.findFirst({
      select: {
        id: true,
        name: true,
        subdomain: true,
      }
    });
    if (!anySite) {
      console.log('No sites found at all!');
      return;
    }
    kidsSites.push(anySite);
  }

  const site = kidsSites[0];
  console.log(`Found site: ${site.name} (${site.subdomain}) - ID: ${site.id}\n`);

  // Step 2: Get all pages for this site
  console.log('Step 2: Getting all pages for this site...');
  const pages = await prisma.page.findMany({
    where: {
      siteId: site.id
    },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      isPublished: true,
      content: true,
    },
    orderBy: {
      slug: 'asc'
    }
  });

  console.log(`Found ${pages.length} pages:\n`);
  
  for (const page of pages) {
    console.log(`--- Page: ${page.title} (${page.slug}) ---`);
    console.log(`ID: ${page.id}`);
    console.log(`Type: ${page.type}`);
    console.log(`Published: ${page.isPublished}`);
    
    const content = page.content as any;
    if (content && content.blocks) {
      console.log(`Blocks count: ${content.blocks.length}`);
      console.log(`Blocks types: ${content.blocks.map((b: any) => b.type).join(', ')}`);
    } else {
      console.log(`Blocks: EMPTY or MISSING`);
    }
    console.log(`\nFULL content.blocks JSON:`);
    console.log(JSON.stringify(content?.blocks || null, null, 2));
    console.log('\n');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
