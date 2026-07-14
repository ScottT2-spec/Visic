import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter});

async function main() {
  console.log("Removing fashionFooter block from homepage content...");

  // Get the homepage for dewqa store
  const store = await prisma.site.findFirst({
    where: { slug: "dewqa" },
    select: { id: true },
  });

  if (!store) {
    console.error("Store not found");
    process.exit(1);
  }

  const homePage = await prisma.page.findFirst({
    where: { siteId: store.id, type: "HOME" },
  });

  if (!homePage) {
    console.error("Homepage not found");
    process.exit(1);
  }

  console.log("Current homepage content:", JSON.stringify(homePage.content, null, 2));

  // Remove the fashionFooter block from content
  const content = homePage.content as any;
  if (content && content.blocks && Array.isArray(content.blocks)) {
    const filteredBlocks = content.blocks.filter((block: any) => block.type !== "fashionFooter");
    
    if (filteredBlocks.length !== content.blocks.length) {
      console.log(`Removed ${content.blocks.length - filteredBlocks.length} footer blocks`);
      
      await prisma.page.update({
        where: { id: homePage.id },
        data: {
          content: {
            ...content,
            blocks: filteredBlocks,
          },
        },
      });
      
      console.log("✅ Footer block removed from homepage");
    } else {
      console.log("No footer blocks found in homepage content");
    }
  } else {
    console.log("Homepage content is not in expected format");
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
