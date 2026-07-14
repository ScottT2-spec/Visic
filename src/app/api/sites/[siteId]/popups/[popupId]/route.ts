import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updatePopupSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; popupId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, popupId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const popup = await prisma.popup.findFirst({ where: { id: popupId, siteId } });
  if (!popup) return error("Popup not found", 404);
  return success(popup);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, popupId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.popup.findFirst({ where: { id: popupId, siteId } });
  if (!existing) return error("Popup not found", 404);

  try {
    const body = await req.json();
    const parsed = updatePopupSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { trigger, displayRules, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (trigger !== undefined) data.trigger = trigger ? (trigger as any) : null;
    if (displayRules !== undefined) data.displayRules = displayRules ? (displayRules as any) : null;

    const popup = await prisma.popup.update({ where: { id: popupId }, data });
    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "popup", entityId: popupId, before: existing, after: popup });
    return success(popup);
  } catch (err) { console.error("Update popup error:", err); return error("Internal server error", 500); }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, popupId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.popup.findFirst({ where: { id: popupId, siteId } });
  if (!existing) return error("Popup not found", 404);

  await prisma.popup.delete({ where: { id: popupId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "popup", entityId: popupId, before: existing });
  return success({ deleted: true });
}
