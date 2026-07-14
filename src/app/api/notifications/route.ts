import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { getAuthUser, unauthorized } from "@/lib/auth";

// GET /api/notifications — user's notifications
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const isRead = url.searchParams.get("isRead");
  const type = url.searchParams.get("type");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { userId: user.id };
  if (isRead !== null && isRead !== undefined && isRead !== "") {
    where.isRead = isRead === "true";
  }
  if (type) where.type = type;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: where as any }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  return success({
    notifications,
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// PATCH /api/notifications — mark as read (bulk or all)
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const { ids, isRead } = body as { ids?: string[]; isRead?: boolean };

    if (ids && Array.isArray(ids)) {
      await prisma.notification.updateMany({
        where: { userId: user.id, id: { in: ids } },
        data: { isRead: isRead !== false },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: user.id },
        data: { isRead: isRead !== false },
      });
    }

    return success({ updated: true });
  } catch (err) {
    console.error("Update notifications error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/notifications — clear read notifications
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    await prisma.notification.deleteMany({ where: { id, userId: user.id } });
  } else {
    // Delete all read notifications
    await prisma.notification.deleteMany({ where: { userId: user.id, isRead: true } });
  }

  return success({ deleted: true });
}
