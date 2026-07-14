import { NextRequest } from "next/server";
import { getAdminUser, adminRequired } from "@/lib/admin-auth";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const themes = await prisma.theme.findMany({ orderBy: { createdAt: "desc" } });
    return success(themes);
  } catch (err) {
    console.error("Admin themes list error:", err);
    return error("Failed to fetch themes", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const body = await req.json();
    const { name, slug, description, category, industry, isPremium, isFeatured, config } = body;

    if (!name || !slug || !category) return error("Name, slug, and category are required", 400);

    const existing = await prisma.theme.findUnique({ where: { slug } });
    if (existing) return error("A theme with this slug already exists", 409);

    const theme = await prisma.theme.create({
      data: {
        name, slug, description, category, industry,
        isPremium: isPremium || false,
        isFeatured: isFeatured || false,
        config: config || {},
      },
    });

    return success(theme, 201);
  } catch (err) {
    console.error("Admin create theme error:", err);
    return error("Failed to create theme", 500);
  }
}
