import "dotenv/config";
import { prisma } from "@/lib/db";
import { PERFUMES_FRAGRANCES_PAGE_BLOCKS, PERFUMES_JOURNAL_PAGE_BLOCKS } from "@/lib/templates/presets/perfumes-page-presets";

async function reseedPerfumesPages() {
  console.log("🔄 Re-seeding Journal and Fragrances pages...\n");

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
  });

  for (const site of sites) {
    console.log(`\n📝 Site: ${site.name} (${site.slug})`);

    // Update Fragrances page
    const fragrancesPage = await prisma.page.findFirst({
      where: { siteId: site.id, slug: "fragrances" },
    });

    if (fragrancesPage) {
      await prisma.page.update({
        where: { id: fragrancesPage.id },
        data: {
          content: { blocks: PERFUMES_FRAGRANCES_PAGE_BLOCKS },
        },
      });
      console.log(`  ✓ Fragrances page updated with ${PERFUMES_FRAGRANCES_PAGE_BLOCKS.length} blocks`);
    } else {
      console.log(`  ⚠ Fragrances page not found`);
    }

    // Update Journal page
    const journalPage = await prisma.page.findFirst({
      where: { siteId: site.id, slug: "journal" },
    });

    if (journalPage) {
      await prisma.page.update({
        where: { id: journalPage.id },
        data: {
          content: { blocks: PERFUMES_JOURNAL_PAGE_BLOCKS },
        },
      });
      console.log(`  ✓ Journal page updated with ${PERFUMES_JOURNAL_PAGE_BLOCKS.length} blocks`);
    } else {
      console.log(`  ⚠ Journal page not found`);
    }
  }

  console.log("\n✅ Re-seeding complete!");
}

reseedPerfumesPages()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
