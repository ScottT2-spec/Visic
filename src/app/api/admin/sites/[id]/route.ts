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
    const { status } = body;

    if (status && !["ACTIVE", "PAUSED", "SUSPENDED"].includes(status)) {
      return error("Invalid status", 400);
    }

    const store = await prisma.site.update({
      where: { id },
      data: { ...(status && { status }) },
      select: { id: true, name: true, status: true },
    });

    return success(store);
  } catch (err) {
    console.error("Admin update store error:", err);
    return error("Failed to update store", 500);
  }
}
