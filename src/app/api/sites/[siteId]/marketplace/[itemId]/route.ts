import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateMarketplaceItemSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; itemId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, itemId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const item = await prisma.marketplaceItem.findUnique({
    where: { id: itemId },
    include: { theme: { select: { id: true, name: true, slug: true, thumbnail: true, config: true } }, plugin: { select: { id: true, name: true, slug: true, icon: true, description: true } } },
  });
  if (!item) return error("Marketplace item not found", 404);
  return success(item);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, itemId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.marketplaceItem.findUnique({ where: { id: itemId } });
  if (!existing) return error("Marketplace item not found", 404);
  // Only author or admin can edit
  if (existing.authorId !== ctx.user!.id) return error("Not authorized to edit this item", 403);

  try {
    const body = await req.json();
    const parsed = updateMarketplaceItemSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const item = await prisma.marketplaceItem.update({ where: { id: itemId }, data: parsed.data });
    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "marketplace_item", entityId: itemId, before: existing, after: item });
    return success(item);
  } catch (err) { console.error("Update marketplace item error:", err); return error("Internal server error", 500); }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, itemId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.marketplaceItem.findUnique({ where: { id: itemId } });
  if (!existing) return error("Marketplace item not found", 404);
  if (existing.authorId !== ctx.user!.id) return error("Not authorized to delete this item", 403);

  await prisma.marketplaceItem.delete({ where: { id: itemId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "marketplace_item", entityId: itemId, before: existing });
  return success({ deleted: true });
}
