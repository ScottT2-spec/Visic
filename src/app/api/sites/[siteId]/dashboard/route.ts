import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/dashboard
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Current period aggregates
    const [
      currentOrders,
      previousOrders,
      totalCustomers,
      previousCustomers,
      totalProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { siteId, createdAt: { gte: thirtyDaysAgo } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { siteId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.customer.count({ where: { siteId, createdAt: { gte: thirtyDaysAgo } } }),
      prisma.customer.count({ where: { siteId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.product.count({ where: { siteId } }),
      prisma.order.findMany({
        where: { siteId },
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Top products by sales
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: { siteId, createdAt: { gte: thirtyDaysAgo } },
        productId: { not: null },
      },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });

    const topProductIds = topProducts.map((p) => p.productId).filter(Boolean) as string[];
    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, slug: true, price: true, images: { take: 1, select: { url: true } } },
    });
    const productMap = new Map(topProductDetails.map((p) => [p.id, p]));

    const topProductsWithDetails = topProducts.map((p) => ({
      ...productMap.get(p.productId!),
      totalSold: p._sum.quantity || 0,
      totalRevenue: p._sum.total || 0,
    }));

    // Revenue over time (last 30 days)
    const revenueByDay = await prisma.$queryRawUnsafe<
      { date: string; revenue: number; orders: number }[]
    >(
      `SELECT DATE("createdAt") as date, 
              COALESCE(SUM(total), 0)::float as revenue, 
              COUNT(*)::int as orders
       FROM orders 
       WHERE "siteId" = $1 AND "createdAt" >= $2
       GROUP BY DATE("createdAt") 
       ORDER BY date ASC`,
      siteId,
      thirtyDaysAgo
    );

    // Calculate percentage changes
    const currentRevenue = Number(currentOrders._sum.total || 0);
    const previousRevenue = Number(previousOrders._sum.total || 0);
    const revenueChange = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : currentRevenue > 0 ? 100 : 0;

    const currentOrderCount = currentOrders._count;
    const previousOrderCount = previousOrders._count;
    const ordersChange = previousOrderCount > 0
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100
      : currentOrderCount > 0 ? 100 : 0;

    const customersChange = previousCustomers > 0
      ? ((totalCustomers - previousCustomers) / previousCustomers) * 100
      : totalCustomers > 0 ? 100 : 0;

    return success({
      stats: {
        totalRevenue: currentRevenue,
        revenueChange: Math.round(revenueChange * 10) / 10,
        totalOrders: currentOrderCount,
        ordersChange: Math.round(ordersChange * 10) / 10,
        totalCustomers,
        customersChange: Math.round(customersChange * 10) / 10,
        totalProducts,
      },
      recentOrders,
      topProducts: topProductsWithDetails,
      revenueOverTime: revenueByDay,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return error("Internal server error", 500);
  }
}
