import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { builtInPlugins } from "./src/lib/plugins/built-in";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔌 Seeding built-in plugins...\n");

  for (const manifest of builtInPlugins) {
    const existing = await prisma.plugin.findUnique({ where: { slug: manifest.slug } });

    if (existing) {
      // Update existing plugin with latest manifest
      await prisma.plugin.update({
        where: { slug: manifest.slug },
        data: {
          name: manifest.name,
          description: manifest.description,
          icon: manifest.icon,
          category: manifest.category,
          author: manifest.author,
          version: manifest.version,
          isPremium: manifest.isPremium,
          config: manifest as any,
          permissions: manifest.permissions,
        },
      });
      console.log(`  ✅ Updated: ${manifest.name}`);
    } else {
      await prisma.plugin.create({
        data: {
          name: manifest.name,
          slug: manifest.slug,
          description: manifest.description,
          icon: manifest.icon,
          category: manifest.category,
          author: manifest.author,
          version: manifest.version,
          isPremium: manifest.isPremium,
          isActive: true,
          config: manifest as any,
          permissions: manifest.permissions,
          installs: Math.floor(Math.random() * 500) + 50,
        },
      });
      console.log(`  ✅ Created: ${manifest.name}`);
    }
  }

  console.log(`\n🎉 ${builtInPlugins.length} plugins seeded!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
