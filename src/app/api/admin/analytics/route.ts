import { NextRequest } from "next/server";
import { getAdminUser, adminRequired } from "@/lib/admin-auth";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get raw data for last 30 days
    // Overall totals
    const [totalUsers, totalStores, totalOrders, totalRevenueAgg] = await Promise.all([
      prisma.user.count(),
      prisma.site.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    ]);

    const [users, stores, orders] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.site.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, total: true, paymentStatus: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Group by date
    const groupByDate = <T extends { createdAt: Date }>(items: T[]) => {
      const map = new Map<string, number>();
      // Fill all 30 days
      for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
        map.set(d.toISOString().split("T")[0], 0);
      }
      items.forEach((item) => {
        const key = item.createdAt.toISOString().split("T")[0];
        map.set(key, (map.get(key) || 0) + 1);
      });
      return Array.from(map.entries()).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      }));
    };

    // Revenue by date
    const revenueByDate = () => {
      const map = new Map<string, number>();
      for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
        map.set(d.toISOString().split("T")[0], 0);
      }
      orders
        .filter((o) => o.paymentStatus === "PAID")
        .forEach((o) => {
          const key = o.createdAt.toISOString().split("T")[0];
          map.set(key, (map.get(key) || 0) + Number(o.total));
        });
      return Array.from(map.entries()).map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        amount,
      }));
    };

    return success({
      signups: groupByDate(users),
      stores: groupByDate(stores),
      orders: groupByDate(orders),
      revenue: revenueByDate(),
      totals: {
        users: totalUsers,
        stores: totalStores,
        orders: totalOrders,
        revenue: Number(totalRevenueAgg._sum.total || 0),
      },
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    return error("Failed to fetch analytics", 500);
  }
}
