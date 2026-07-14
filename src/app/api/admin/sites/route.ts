import { NextRequest } from "next/server";
import { getAdminUser, adminRequired } from "@/lib/admin-auth";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;

    const [sites, total] = await Promise.all([
      prisma.site.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          workspace: {
            include: {
              owner: { select: { firstName: true, lastName: true, email: true } },
            },
          },
          _count: { select: { products: true, orders: true, customers: true } },
        },
      }),
      prisma.site.count({ where }),
    ]);

    return success({ sites, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Admin sites list error:", err);
    return error("Failed to fetch sites", 500);
  }
}
