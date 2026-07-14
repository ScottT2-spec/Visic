import "dotenv/config";
import { prisma } from "@/lib/db";
import { PERFUMES_CONTACT_PAGE_BLOCKS } from "@/lib/templates/presets/perfumes-page-presets";

async function reseedPerfumesContact() {
  console.log("🔄 RESEED: Contact Us page to match editor version...\n");

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

    // Force update Contact page
    const contactPage = await prisma.page.findFirst({
      where: { siteId: site.id, slug: "contact" },
    });

    if (contactPage) {
      await prisma.page.update({
        where: { id: contactPage.id },
        data: {
          content: { blocks: PERFUMES_CONTACT_PAGE_BLOCKS },
        },
      });
      console.log(`  ✓ Contact page UPDATED with ${PERFUMES_CONTACT_PAGE_BLOCKS.length} blocks`);
    } else {
      console.log(`  ⚠ Contact page not found`);
    }
  }

  console.log("\n✅ Contact page reseed complete!");
}

reseedPerfumesContact()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
