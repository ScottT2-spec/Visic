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
    const { role } = body;

    if (role && !["MERCHANT", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return error("Invalid role", 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { ...(role && { role }) },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    return success(user);
  } catch (err) {
    console.error("Admin update user error:", err);
    return error("Failed to update user", 500);
  }
}
