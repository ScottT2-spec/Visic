import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/notifications
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const isRead = url.searchParams.get("isRead");
  const type = url.searchParams.get("type");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { siteId };
  if (isRead !== null && isRead !== undefined && isRead !== "") {
    where.isRead = isRead === "true";
  }
  if (type) where.type = type;

  const [notifications, total, unreadCount, typeCounts] = await Promise.all([
    prisma.siteNotification.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.siteNotification.count({ where: where as any }),
    prisma.siteNotification.count({ where: { siteId, isRead: false } }),
    prisma.siteNotification.groupBy({
      by: ["type"],
      where: { siteId, isRead: false },
      _count: { type: true },
    }),
  ]);

  const unreadByType = Object.fromEntries(
    typeCounts.map((t) => [t.type, t._count.type])
  );

  return success({
    notifications,
    unreadCount,
    unreadByType,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// PATCH /api/sites/:siteId/notifications — mark as read
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const { ids, isRead, type } = body as { ids?: string[]; isRead?: boolean; type?: string };

    if (ids && Array.isArray(ids)) {
      await prisma.siteNotification.updateMany({
        where: { siteId, id: { in: ids } },
        data: { isRead: isRead !== false },
      });
    } else if (type) {
      await prisma.siteNotification.updateMany({
        where: { siteId, type },
        data: { isRead: isRead !== false },
      });
    } else {
      await prisma.siteNotification.updateMany({
        where: { siteId },
        data: { isRead: isRead !== false },
      });
    }

    return success({ updated: true });
  } catch (err) {
    console.error("Update site notifications error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/sites/:siteId/notifications — clear read notifications
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    await prisma.siteNotification.deleteMany({ where: { id, siteId } });
  } else {
    await prisma.siteNotification.deleteMany({ where: { siteId, isRead: true } });
  }

  return success({ deleted: true });
}
