import { NextRequest } from "next/server";
import { getAdminUser, adminRequired } from "@/lib/admin-auth";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const plugins = await prisma.plugin.findMany({ orderBy: { createdAt: "desc" } });
    return success(plugins);
  } catch (err) {
    console.error("Admin plugins list error:", err);
    return error("Failed to fetch plugins", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const body = await req.json();
    const { name, slug, description, category, author, version, isPremium, permissions } = body;

    if (!name || !slug || !category) return error("Name, slug, and category are required", 400);

    const existing = await prisma.plugin.findUnique({ where: { slug } });
    if (existing) return error("A plugin with this slug already exists", 409);

    const plugin = await prisma.plugin.create({
      data: {
        name, slug, description, category, author: author || "AfroStore",
        version: version || "1.0.0", isPremium: isPremium || false,
        permissions: permissions || [], reviewStatus: "APPROVED",
      },
    });

    return success(plugin, 201);
  } catch (err) {
    console.error("Admin create plugin error:", err);
    return error("Failed to create plugin", 500);
  }
}
