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

    const plugin = await prisma.plugin.update({ where: { id }, data: body });
    return success(plugin);
  } catch (err) {
    console.error("Admin update plugin error:", err);
    return error("Failed to update plugin", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const { id } = await params;

    const inUse = await prisma.sitePlugin.count({ where: { pluginId: id } });
    if (inUse > 0) return error(`Cannot delete: ${inUse} store(s) are using this plugin`, 400);

    await prisma.plugin.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    console.error("Admin delete plugin error:", err);
    return error("Failed to delete plugin", 500);
  }
}
