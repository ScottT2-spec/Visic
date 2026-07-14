import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Create Admin
  const adminPassword = await hash("Admin@2026", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@afrostore.com" },
    update: {},
    create: {
      email: "admin@afrostore.com",
      passwordHash: adminPassword,
      firstName: "Afrostore",
      lastName: "Admin",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // 2. Create Merchant
  const merchantPassword = await hash("Merchant@2026", 12);
  const merchant = await prisma.user.upsert({
    where: { email: "merchant@afrostore.com" },
    update: {},
    create: {
      email: "merchant@afrostore.com",
      passwordHash: merchantPassword,
      firstName: "Kwame",
      lastName: "Mensah",
      role: "MERCHANT",
    },
  });
  console.log("✅ Merchant created:", merchant.email);

  // 3. Create Workspace for merchant
  const workspace = await prisma.workspace.upsert({
    where: { slug: "kwame-fashion" },
    update: {},
    create: {
      ownerId: merchant.id,
      name: "Kwame Fashion",
      slug: "kwame-fashion",
    },
  });
  console.log("✅ Workspace created:", workspace.name);

  // 4. Create Site for merchant
  const store = await prisma.site.upsert({
    where: { slug: "kwame-fashion-hub" },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "Kwame Fashion Hub",
      slug: "kwame-fashion-hub",
      description: "Premium African fashion, accessories, and lifestyle products.",
      subdomain: "kwame-fashion-hub",
      siteType: "ECOMMERCE",
      businessType: "fashion",
      country: "GH",
      currency: "GHS",
      status: "ACTIVE",
      settings: {
        create: {
          allowGuestCheckout: true,
          payOnDelivery: true,
          bankTransfer: true,
          whatsappOrdering: true,
          whatsappNumber: "+233200000000",
        },
      },
      socialLinks: { create: { instagram: "kwamefashionhub", tiktok: "kwamefashion" } },
      members: { create: { userId: merchant.id, role: "OWNER" } },
    },
  });
  console.log("✅ Store created:", store.name);

  // 4. Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { siteId_slug: { siteId: store.id, slug: "clothing" } },
      update: {},
      create: { siteId: store.id, name: "Clothing", slug: "clothing", description: "Traditional and modern African clothing" },
    }),
    prisma.category.upsert({
      where: { siteId_slug: { siteId: store.id, slug: "accessories" } },
      update: {},
      create: { siteId: store.id, name: "Accessories", slug: "accessories", description: "Handcrafted jewelry and accessories" },
    }),
    prisma.category.upsert({
      where: { siteId_slug: { siteId: store.id, slug: "footwear" } },
      update: {},
      create: { siteId: store.id, name: "Footwear", slug: "footwear", description: "African-inspired sneakers and sandals" },
    }),
  ]);
  console.log("✅ Categories created:", categories.length);

  // 5. Create Products
  const products = [
    { name: "Ankara Maxi Dress", slug: "ankara-maxi-dress", price: 150, stock: 25, categoryId: categories[0].id, description: "Beautiful hand-sewn Ankara maxi dress with vibrant patterns.", tags: ["ankara", "dress", "women"], isFeatured: true },
    { name: "Kente Cloth Bow Tie", slug: "kente-cloth-bow-tie", price: 35, stock: 50, categoryId: categories[1].id, description: "Authentic Kente cloth bow tie, perfect for formal occasions.", tags: ["kente", "accessories", "men"] },
    { name: "African Print Sneakers", slug: "african-print-sneakers", price: 89, stock: 30, categoryId: categories[2].id, description: "Comfortable sneakers with bold African print designs.", tags: ["sneakers", "footwear", "unisex"], isFeatured: true },
    { name: "Gold Hoop Earrings", slug: "gold-hoop-earrings", price: 45, stock: 40, categoryId: categories[1].id, description: "Handcrafted gold-plated hoop earrings inspired by Ashanti designs.", tags: ["jewelry", "earrings", "women"] },
    { name: "Dashiki Shirt", slug: "dashiki-shirt", price: 65, stock: 35, categoryId: categories[0].id, description: "Classic West African Dashiki shirt with embroidered neckline.", tags: ["dashiki", "shirt", "men", "unisex"] },
    { name: "Leather Crossbody Bag", slug: "leather-crossbody-bag", price: 120, stock: 15, categoryId: categories[1].id, description: "Genuine leather crossbody bag with African-inspired patterns.", tags: ["bag", "leather", "accessories"], isFeatured: true },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { siteId_slug: { siteId: store.id, slug: p.slug } },
      update: {},
      create: {
        siteId: store.id,
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        currency: "GHS",
        stock: p.stock,
        status: "ACTIVE",
        tags: p.tags,
        isFeatured: p.isFeatured || false,
      },
    });
  }
  console.log("✅ Products created:", products.length);

  // 6. Create some customers
  const customers = [
    { firstName: "Ama", lastName: "Owusu", email: "ama@example.com", phone: "+233240000001" },
    { firstName: "Kofi", lastName: "Asante", email: "kofi@example.com", phone: "+233240000002" },
    { firstName: "Fatima", lastName: "Ibrahim", email: "fatima@example.com", phone: "+233240000003" },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { siteId_email: { siteId: store.id, email: c.email } },
      update: {},
      create: { siteId: store.id, ...c },
    });
  }
  console.log("✅ Customers created:", customers.length);

  // 6.5 Create Handmade Bags pages
  const pages = await Promise.all([
    prisma.page.upsert({
      where: { siteId_slug: { siteId: store.id, slug: "about" } },
      update: {},
      create: { siteId: store.id, title: "About Us", slug: "about", type: "CUSTOM", content: [], isPublished: true, position: 10 },
    }),
    prisma.page.upsert({
      where: { siteId_slug: { siteId: store.id, slug: "our-story" } },
      update: {},
      create: { siteId: store.id, title: "Our Story", slug: "our-story", type: "CUSTOM", content: [], isPublished: true, position: 11 },
    }),
    prisma.page.upsert({
      where: { siteId_slug: { siteId: store.id, slug: "contact" } },
      update: {},
      create: { siteId: store.id, title: "Contact Us", slug: "contact", type: "CUSTOM", content: [], isPublished: true, position: 12 },
    }),
    prisma.page.upsert({
      where: { siteId_slug: { siteId: store.id, slug: "reviews" } },
      update: {},
      create: { siteId: store.id, title: "Reviews", slug: "reviews", type: "CUSTOM", content: [], isPublished: true, position: 13 },
    }),
  ]);
  console.log("✅ Pages created:", pages.length);

  // 7. Seed Themes
  const defaultThemes = [
    { name: "Lagos Modern", slug: "lagos-modern", category: "ecommerce", industry: "general", description: "A clean, modern theme perfect for any store", config: { colors: { primary: "#1E293B", accent: "#F59E0B" }, fonts: { heading: "Plus Jakarta Sans", body: "Inter" }, layout: "standard" }, isFeatured: true },
    { name: "Ankara Boutique", slug: "ankara-boutique", category: "fashion", industry: "fashion", description: "Vibrant theme designed for African fashion brands", config: { colors: { primary: "#7C3AED", accent: "#EC4899" }, fonts: { heading: "Plus Jakarta Sans", body: "Inter" }, layout: "boutique" }, isFeatured: true },
    { name: "Market Fresh", slug: "market-fresh", category: "food", industry: "food", description: "Warm and inviting theme for food & grocery stores", config: { colors: { primary: "#059669", accent: "#F97316" }, fonts: { heading: "Plus Jakarta Sans", body: "Inter" }, layout: "grid" } },
    { name: "Tech Hub", slug: "tech-hub", category: "tech", industry: "electronics", description: "Sleek dark theme for gadgets and tech products", config: { colors: { primary: "#0F172A", accent: "#3B82F6" }, fonts: { heading: "Plus Jakarta Sans", body: "Inter" }, layout: "minimal" } },
    { name: "Beauty Glow", slug: "beauty-glow", category: "beauty", industry: "beauty", description: "Elegant theme for beauty and skincare brands", config: { colors: { primary: "#BE185D", accent: "#F472B6" }, fonts: { heading: "Plus Jakarta Sans", body: "Inter" }, layout: "elegant" }, isPremium: true },
    { name: "Naija Express", slug: "naija-express", category: "ecommerce", industry: "general", description: "Fast-loading minimal theme optimized for low data", config: { colors: { primary: "#16A34A", accent: "#EAB308" }, fonts: { heading: "Plus Jakarta Sans", body: "Inter" }, layout: "compact" } },
  ];

  for (const theme of defaultThemes) {
    await prisma.theme.upsert({
      where: { slug: theme.slug },
      update: {},
      create: theme,
    });
  }
  console.log("✅ Themes seeded:", defaultThemes.length);

  console.log("\n🎉 Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Admin Login:");
  console.log("  Email:    admin@afrostore.com");
  console.log("  Password: Admin@2026");
  console.log("");
  console.log("  Merchant Login:");
  console.log("  Email:    merchant@afrostore.com");
  console.log("  Password: Merchant@2026");
  console.log("  Store:    Kwame Fashion Hub");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
