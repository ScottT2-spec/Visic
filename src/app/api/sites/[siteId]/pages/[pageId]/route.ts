import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, ensureUniqueSlug, logAudit } from "@/lib/api-helpers";
import { updatePageSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";
import { findStoredTemplatePage } from "@/lib/templates/site-instance";
import type { Prisma } from "@/generated/prisma";

type Params = { params: Promise<{ siteId: string; pageId: string }> };

// GET /api/sites/:siteId/pages/:pageId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, pageId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const [page, activeTemplate] = await Promise.all([
    prisma.page.findFirst({ where: { id: pageId, siteId } }),
    prisma.siteTemplate.findFirst({
      where: { siteId, isActive: true },
      select: { pages: true, template: { select: { slug: true } } },
    }),
  ]);

  if (!page) return error("Page not found", 404);
  const mergedPage = { ...page, template: null };
  return success({ ...mergedPage, templateSlug: activeTemplate?.template?.slug || null });
}

// PATCH /api/sites/:siteId/pages/:pageId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, pageId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = updatePageSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const existing = await prisma.page.findFirst({ where: { id: pageId, siteId } });
    if (!existing) return error("Page not found", 404);

    const updateData: Record<string, unknown> = { ...parsed.data };

    // If title is changing, regenerate slug
    if (parsed.data.title && parsed.data.title !== existing.title) {
      updateData.slug = await ensureUniqueSlug(parsed.data.title, siteId, "page");
    }

    const page = await prisma.page.update({
      where: { id: pageId },
      data: updateData as Prisma.PageUpdateInput,
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "UPDATE",
      entity: "page",
      entityId: pageId,
      before: existing,
      after: page,
    });

    return success(page);
  } catch (err) {
    console.error("Update page error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/sites/:siteId/pages/:pageId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, pageId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const existing = await prisma.page.findFirst({ where: { id: pageId, siteId } });
    if (!existing) return error("Page not found", 404);

    await prisma.page.delete({ where: { id: pageId } });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "DELETE",
      entity: "page",
      entityId: pageId,
      before: existing,
    });

    return success({ deleted: true });
  } catch (err) {
    console.error("Delete page error:", err);
    return error("Internal server error", 500);
  }
}