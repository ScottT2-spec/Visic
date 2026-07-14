import "dotenv/config";
import { prisma } from "@/lib/db";

async function aggressiveCleanupPerfumesDuplicates() {
  console.log("🔥 AGGRESSIVE CLEANUP: Deleting all about-us and contact-us pages from perfumes sites...\n");

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
      pages: true,
    },
  });

  let deletedAbout = 0;
  let deletedContact = 0;

  for (const site of sites) {
    console.log(`\n📝 Site: ${site.name} (${site.slug})`);

    // Find and delete ALL about-us pages (regardless of block count)
    const aboutUsPages = site.pages.filter(p => p.slug === "about-us");
    for (const page of aboutUsPages) {
      await prisma.page.delete({
        where: { id: page.id },
      });
      console.log(`   ✗ DELETED About Us page (slug: about-us, ID: ${page.id})`);
      deletedAbout++;
    }

    // Find and delete ALL contact-us pages (regardless of block count)
    const contactUsPages = site.pages.filter(p => p.slug === "contact-us");
    for (const page of contactUsPages) {
      await prisma.page.delete({
        where: { id: page.id },
      });
      console.log(`   ✗ DELETED Contact Us page (slug: contact-us, ID: ${page.id})`);
      deletedContact++;
    }
  }

  console.log(`\n✅ Aggressive cleanup complete!`);
  console.log(`   Deleted ${deletedAbout} About Us pages (about-us slug)`);
  console.log(`   Deleted ${deletedContact} Contact Us pages (contact-us slug)`);
}

aggressiveCleanupPerfumesDuplicates()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
