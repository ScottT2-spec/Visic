/**
 * Backfill script: seeds block content into existing handmade-bags template pages
 * that currently have empty content (content: []).
 *
 * Run: npx tsx scripts/backfill-handmade-bags-pages.ts
 */
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  HANDMADE_BAGS_ABOUT_BLOCKS,
  HANDMADE_BAGS_CONTACT_BLOCKS,
  HANDMADE_BAGS_OUR_STORY_BLOCKS,
  HANDMADE_BAGS_REVIEWS_BLOCKS,
} from "../src/lib/templates/presets/handmade-bags-pages";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const PAGE_BLOCKS: Record<string, unknown[]> = {
  about: HANDMADE_BAGS_ABOUT_BLOCKS,
  contact: HANDMADE_BAGS_CONTACT_BLOCKS,
  "our-story": HANDMADE_BAGS_OUR_STORY_BLOCKS,
  reviews: HANDMADE_BAGS_REVIEWS_BLOCKS,
};

async function main() {
  // Find all sites using the handmade-bags template
  const sites = await prisma.site.findMany({
    where: {
      templates: {
        some: {
          isActive: true,
          template: { slug: "handmade-bags" },
        },
      },
    },
    select: { id: true, slug: true },
  });

  console.log(`Found ${sites.length} sites with handmade-bags template`);

  for (const site of sites) {
    console.log(`\nProcessing: ${site.slug}`);

    for (const [pageSlug, blocks] of Object.entries(PAGE_BLOCKS)) {
      const page = await prisma.page.findUnique({
        where: { siteId_slug: { siteId: site.id, slug: pageSlug } },
        select: { id: true, content: true },
      });

      if (!page) {
        // Create the page with blocks
        await prisma.page.create({
          data: {
            siteId: site.id,
            title: pageSlug === "our-story" ? "Our Story" : pageSlug === "about" ? "About Us" : pageSlug === "contact" ? "Contact Us" : "Reviews",
            slug: pageSlug,
            type: "CUSTOM",
            content: blocks as any,
            isPublished: true,
            position: pageSlug === "about" ? 10 : pageSlug === "contact" ? 11 : pageSlug === "our-story" ? 12 : 14,
          },
        });
        console.log(`  ✓ Created ${pageSlug} with blocks`);
        continue;
      }

      // Check if content is empty
      const hasContent = Array.isArray(page.content)
        ? (page.content as unknown[]).length > 0
        : false;

      if (!hasContent) {
        await prisma.page.update({
          where: { id: page.id },
          data: { content: blocks as any },
        });
        console.log(`  ✓ Backfilled ${pageSlug} with ${(blocks as unknown[]).length} blocks`);
      } else {
        console.log(`  - ${pageSlug} already has content, skipping`);
      }
    }
  }

  console.log("\n✅ Done!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
