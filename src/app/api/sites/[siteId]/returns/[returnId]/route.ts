import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateReturnSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";
import { Prisma } from "@/generated/prisma";

type Params = { params: Promise<{ siteId: string; returnId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, returnId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const ret = await prisma.return.findFirst({
    where: { id: returnId, siteId },
    include: { order: { select: { id: true, orderNumber: true, total: true, items: true, customer: { select: { id: true, firstName: true, lastName: true, email: true } } } } },
  });
  if (!ret) return error("Return not found", 404);
  return success(ret);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, returnId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.return.findFirst({ where: { id: returnId, siteId } });
  if (!existing) return error("Return not found", 404);

  try {
    const body = await req.json();
    const parsed = updateReturnSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.refundAmount !== undefined) data.refundAmount = new Prisma.Decimal(parsed.data.refundAmount);
    if (parsed.data.status === "REFUNDED" || parsed.data.status === "CLOSED") data.resolvedAt = new Date();

    const ret = await prisma.return.update({ where: { id: returnId }, data });
    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "return", entityId: returnId, before: existing, after: ret });
    return success(ret);
  } catch (err) { console.error("Update return error:", err); return error("Internal server error", 500); }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, returnId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.return.findFirst({ where: { id: returnId, siteId } });
  if (!existing) return error("Return not found", 404);

  await prisma.return.delete({ where: { id: returnId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "return", entityId: returnId, before: existing });
  return success({ deleted: true });
}
