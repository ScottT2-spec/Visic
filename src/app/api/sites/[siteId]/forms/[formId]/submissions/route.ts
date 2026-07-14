import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; formId: string }> };

// GET /api/sites/:siteId/forms/:formId/submissions
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, formId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  // Verify form belongs to site
  const form = await prisma.form.findFirst({ where: { id: formId, siteId } });
  if (!form) return error("Form not found", 404);

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const isRead = url.searchParams.get("isRead");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { formId };
  if (isRead !== null && isRead !== undefined && isRead !== "") {
    where.isRead = isRead === "true";
  }

  const [submissions, total, unreadCount] = await Promise.all([
    prisma.formSubmission.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.formSubmission.count({ where: where as any }),
    prisma.formSubmission.count({ where: { formId, isRead: false } }),
  ]);

  return success({
    submissions,
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// PATCH /api/sites/:siteId/forms/:formId/submissions — bulk mark as read
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, formId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const form = await prisma.form.findFirst({ where: { id: formId, siteId } });
  if (!form) return error("Form not found", 404);

  try {
    const body = await req.json();
    const { ids, isRead } = body as { ids?: string[]; isRead?: boolean };

    if (ids && Array.isArray(ids)) {
      await prisma.formSubmission.updateMany({
        where: { formId, id: { in: ids } },
        data: { isRead: isRead !== false },
      });
    } else {
      // Mark all as read
      await prisma.formSubmission.updateMany({
        where: { formId },
        data: { isRead: isRead !== false },
      });
    }

    return success({ updated: true });
  } catch (err) {
    console.error("Update submissions error:", err);
    return error("Internal server error", 500);
  }
}
