import "dotenv/config";
import { prisma } from "@/lib/db";

async function checkPerfumesPages() {
  console.log("🔍 Checking perfumes template pages...\n");

  const sites = await prisma.site.findMany({
    where: {
      templates: {
        some: {
          template: {
            slug: "perfumes",
          },
          isActive: true,
        },
      },
    },
    include: {
      pages: {
        orderBy: { position: "asc" },
      },
    },
  });

  for (const site of sites) {
    console.log(`\n📝 Site: ${site.name} (${site.slug})`);
    console.log(`   Total pages: ${site.pages.length}\n`);

    // Group by title to find duplicates
    const pagesByTitle: Record<string, any[]> = {};
    for (const page of site.pages) {
      if (!pagesByTitle[page.title]) {
        pagesByTitle[page.title] = [];
      }
      pagesByTitle[page.title].push(page);
    }

    // Show duplicates
    for (const [title, pages] of Object.entries(pagesByTitle)) {
      if (pages.length > 1) {
        console.log(`   ⚠️  DUPLICATE: "${title}" (${pages.length} copies)`);
        for (const p of pages) {
          const hasContent = p.content && typeof p.content === "object" && "blocks" in p.content && Array.isArray((p.content as any).blocks);
          const blockCount = hasContent ? (p.content as any).blocks.length : 0;
          console.log(`      - ID: ${p.id}, Slug: ${p.slug}, Blocks: ${blockCount}`);
        }
      }
    }

    // Show all pages with block counts
    console.log(`\n   All pages:`);
    for (const page of site.pages) {
      const hasContent = page.content && typeof page.content === "object" && "blocks" in page.content && Array.isArray((page.content as any).blocks);
      const blockCount = hasContent ? (page.content as any).blocks.length : 0;
      console.log(`      ${page.title} (${page.slug}) - ${blockCount} blocks [ID: ${page.id}]`);
    }
  }
}

checkPerfumesPages()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
