import { NextRequest } from "next/server";
import { getAdminUser, adminRequired } from "@/lib/admin-auth";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const { id } = await params;
    const body = await req.json();

    const theme = await prisma.theme.update({ where: { id }, data: body });
    return success(theme);
  } catch (err) {
    console.error("Admin update theme error:", err);
    return error("Failed to update theme", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const { id } = await params;

    // Check if any stores are using this theme
    const inUse = await prisma.siteTheme.count({ where: { themeId: id } });
    if (inUse > 0) return error(`Cannot delete: ${inUse} store(s) are using this theme`, 400);

    await prisma.theme.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    console.error("Admin delete theme error:", err);
    return error("Failed to delete theme", 500);
  }
}
