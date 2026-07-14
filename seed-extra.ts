import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Create a store for admin
  const admin = await prisma.user.findUnique({ where: { email: "admin@afrostore.com" } });
  if (!admin) throw new Error("Admin not found");

  // Create or find a workspace for admin
  const adminWorkspace = await prisma.workspace.upsert({
    where: { slug: "afrostore-hq" },
    update: {},
    create: {
      ownerId: admin.id,
      name: "AfroStore HQ",
      slug: "afrostore-hq",
      plan: "ENTERPRISE",
    },
  });

  const adminStore = await prisma.site.upsert({
    where: { slug: "afrostore-hq" },
    update: {},
    create: {
      workspaceId: adminWorkspace.id,
      name: "AfroStore HQ",
      slug: "afrostore-hq",
      description: "The official AfroStore headquarters — platform admin store.",
      subdomain: "afrostore-hq",
      businessType: "general",
      country: "GH",
      currency: "GHS",
      status: "ACTIVE",
      settings: {
        create: {
          allowGuestCheckout: true,
          payOnDelivery: true,
          bankTransfer: true,
          whatsappOrdering: true,
        },
      },
      socialLinks: { create: {} },
      members: { create: { userId: admin.id, role: "OWNER" } },
    },
  });
  console.log("✅ Admin store created:", adminStore.name);

  // 2. Add sample orders to Merchant's store
  const merchantStore = await prisma.site.findUnique({ where: { slug: "kwame-fashion-hub" } });
  if (!merchantStore) throw new Error("Merchant store not found");

  const products = await prisma.product.findMany({ where: { siteId: merchantStore.id }, take: 4 });
  const customers = await prisma.customer.findMany({ where: { siteId: merchantStore.id }, take: 3 });

  const orderData = [
    { customer: customers[0], items: [products[0], products[3]], status: "CONFIRMED" as const, payStatus: "PAID" as const },
    { customer: customers[1], items: [products[2]], status: "PROCESSING" as const, payStatus: "PAID" as const },
    { customer: customers[2], items: [products[1], products[4] || products[0]], status: "SHIPPED" as const, payStatus: "PAID" as const },
    { customer: customers[0], items: [products[5] || products[0]], status: "DELIVERED" as const, payStatus: "PAID" as const },
    { customer: customers[1], items: [products[0], products[2]], status: "PENDING" as const, payStatus: "PENDING" as const },
  ];

  let orderNum = 1000;
  for (const od of orderData) {
    orderNum++;
    const subtotal = od.items.reduce((sum, p) => sum + Number(p.price), 0);
    const deliveryFee = 15;
    const total = subtotal + deliveryFee;

    await prisma.order.create({
      data: {
        siteId: merchantStore.id,
        customerId: od.customer.id,
        orderNumber: `AF-${orderNum}`,
        email: od.customer.email,
        phone: od.customer.phone,
        status: od.status,
        paymentStatus: od.payStatus,
        paymentMethod: "bank_transfer",
        subtotal,
        deliveryFee,
        total,
        currency: "GHS",
        deliveryAddress: {
          street: "123 Independence Ave",
          city: "Accra",
          region: "Greater Accra",
          country: "Ghana",
        },
        items: {
          create: od.items.map((p) => ({
            productId: p.id,
            name: p.name,
            price: p.price,
            quantity: 1,
            total: p.price,
          })),
        },
        timeline: {
          create: {
            status: od.status,
            note: `Order ${od.status.toLowerCase()}`,
          },
        },
      },
    });
  }
  console.log("✅ Sample orders created:", orderData.length);

  // 3. Update customer order counts
  for (const c of customers) {
    const count = await prisma.order.count({ where: { customerId: c.id } });
    const totalSpent = await prisma.order.aggregate({ where: { customerId: c.id, paymentStatus: "PAID" }, _sum: { total: true } });
    await prisma.customer.update({
      where: { id: c.id },
      data: { totalOrders: count, totalSpent: totalSpent._sum.total || 0 },
    });
  }
  console.log("✅ Customer stats updated");

  console.log("\n🎉 Extra seed complete!");
  console.log("Admin now has 'AfroStore HQ' store");
  console.log("Merchant now has 5 sample orders");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
