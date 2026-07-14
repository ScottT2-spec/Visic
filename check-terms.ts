import "dotenv/config";
import { prisma } from "./src/lib/db";

async function main() {
  const page = await prisma.page.findFirst({
    where: { site: { slug: "cosmetics" }, slug: "terms" },
  });
  console.log(JSON.stringify(page?.content, null, 2));
}

main().finally(() => prisma.$disconnect());
