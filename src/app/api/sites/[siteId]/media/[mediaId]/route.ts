import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateMediaItemSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; mediaId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, mediaId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const item = await prisma.mediaItem.findFirst({ where: { id: mediaId, siteId } });
  if (!item) return error("Media item not found", 404);
  return success(item);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, mediaId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.mediaItem.findFirst({ where: { id: mediaId, siteId } });
  if (!existing) return error("Media item not found", 404);

  try {
    const body = await req.json();
    const parsed = updateMediaItemSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const item = await prisma.mediaItem.update({ where: { id: mediaId }, data: parsed.data });
    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "media_item", entityId: mediaId, before: existing, after: item });
    return success(item);
  } catch (err) { console.error("Update media error:", err); return error("Internal server error", 500); }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, mediaId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.mediaItem.findFirst({ where: { id: mediaId, siteId } });
  if (!existing) return error("Media item not found", 404);

  await prisma.mediaItem.delete({ where: { id: mediaId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "media_item", entityId: mediaId, before: existing });
  return success({ deleted: true });
}
