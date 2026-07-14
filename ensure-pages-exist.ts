import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Ensuring Handmade Bags pages exist for all active sites...");

  const sites = await prisma.site.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, slug: true },
  });

  console.log(`Found ${sites.length} active sites`);

  for (const site of sites) {
    console.log(`Processing site: ${site.slug}`);

    // Check if pages already exist
    const existingPages = await prisma.page.findMany({
      where: {
        siteId: site.id,
        slug: { in: ["about", "our-story", "contact", "reviews"] },
      },
      select: { slug: true },
    });

    const existingSlugs = new Set(existingPages.map((p) => p.slug));

    // Create About Us page if it doesn't exist
    if (!existingSlugs.has("about")) {
      await prisma.page.create({
        data: {
          siteId: site.id,
          title: "About Us",
          slug: "about",
          type: "CUSTOM",
          content: [],
          isPublished: true,
          position: 10,
        },
      });
      console.log(`  ✓ Created About Us page for ${site.slug}`);
    } else {
      console.log(`  - About Us page already exists for ${site.slug}`);
    }

    // Create Our Story page if it doesn't exist
    if (!existingSlugs.has("our-story")) {
      await prisma.page.create({
        data: {
          siteId: site.id,
          title: "Our Story",
          slug: "our-story",
          type: "CUSTOM",
          content: [],
          isPublished: true,
          position: 11,
        },
      });
      console.log(`  ✓ Created Our Story page for ${site.slug}`);
    } else {
      console.log(`  - Our Story page already exists for ${site.slug}`);
    }

    // Create Contact Us page if it doesn't exist
    if (!existingSlugs.has("contact")) {
      await prisma.page.create({
        data: {
          siteId: site.id,
          title: "Contact Us",
          slug: "contact",
          type: "CUSTOM",
          content: [],
          isPublished: true,
          position: 12,
        },
      });
      console.log(`  ✓ Created Contact Us page for ${site.slug}`);
    } else {
      console.log(`  - Contact Us page already exists for ${site.slug}`);
    }

    // Create Reviews page if it doesn't exist
    if (!existingSlugs.has("reviews")) {
      await prisma.page.create({
        data: {
          siteId: site.id,
          title: "Reviews",
          slug: "reviews",
          type: "CUSTOM",
          content: [],
          isPublished: true,
          position: 13,
        },
      });
      console.log(`  ✓ Created Reviews page for ${site.slug}`);
    } else {
      console.log(`  - Reviews page already exists for ${site.slug}`);
    }
  }

  console.log("\n✅ Handmade Bags pages ensured successfully!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
