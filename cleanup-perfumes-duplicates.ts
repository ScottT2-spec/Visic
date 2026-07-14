import "dotenv/config";
import { prisma } from "@/lib/db";

async function cleanupPerfumesDuplicates() {
  console.log("🧹 Cleaning up perfumes template duplicate pages...\n");

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

    // Find and delete about-us pages (keep 'about')
    const aboutUsPages = site.pages.filter(p => p.slug === "about-us");
    for (const page of aboutUsPages) {
      await prisma.page.delete({
        where: { id: page.id },
      });
      console.log(`   ✗ Deleted duplicate About Us page (slug: about-us, ID: ${page.id})`);
      deletedAbout++;
    }

    // Find and delete contact-us pages (keep 'contact')
    const contactUsPages = site.pages.filter(p => p.slug === "contact-us");
    for (const page of contactUsPages) {
      await prisma.page.delete({
        where: { id: page.id },
      });
      console.log(`   ✗ Deleted duplicate Contact Us page (slug: contact-us, ID: ${page.id})`);
      deletedContact++;
    }
  }

  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Deleted ${deletedAbout} duplicate About Us pages`);
  console.log(`   Deleted ${deletedContact} duplicate Contact Us pages`);
}

cleanupPerfumesDuplicates()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
