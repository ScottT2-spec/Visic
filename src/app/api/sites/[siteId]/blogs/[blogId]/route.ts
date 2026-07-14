import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateBlogSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; blogId: string }> };

// GET /api/sites/:siteId/blogs/:blogId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, blogId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const blog = await prisma.blog.findFirst({
    where: { id: blogId, siteId },
  });

  if (!blog) return error("Blog post not found", 404);
  return success(blog);
}

// PATCH /api/sites/:siteId/blogs/:blogId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, blogId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const existing = await prisma.blog.findFirst({ where: { id: blogId, siteId } });
    if (!existing) return error("Blog post not found", 404);

    const body = await req.json();
    const parsed = updateBlogSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { publishedAt, ...rest } = parsed.data;

    // Auto-set publishedAt when publishing for the first time
    const data: Record<string, unknown> = { ...rest };
    if (publishedAt !== undefined) {
      data.publishedAt = publishedAt ? new Date(publishedAt) : null;
    } else if (parsed.data.status === "PUBLISHED" && !existing.publishedAt) {
      data.publishedAt = new Date();
    }

    const blog = await prisma.blog.update({
      where: { id: blogId },
      data,
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "UPDATE",
      entity: "blog",
      entityId: blogId,
      before: existing,
      after: blog,
    });

    return success(blog);
  } catch (err) {
    console.error("Update blog error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/sites/:siteId/blogs/:blogId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, blogId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.blog.findFirst({ where: { id: blogId, siteId } });
  if (!existing) return error("Blog post not found", 404);

  await prisma.blog.delete({ where: { id: blogId } });

  await logAudit({
    siteId,
    userId: ctx.user!.id,
    action: "DELETE",
    entity: "blog",
    entityId: blogId,
    before: existing,
  });

  return success({ deleted: true });
}
