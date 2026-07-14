import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateAutomationSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; automationId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, automationId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const automation = await prisma.automation.findFirst({
    where: { id: automationId, siteId },
    include: { logs: { orderBy: { executedAt: "desc" }, take: 20 }, _count: { select: { logs: true } } },
  });
  if (!automation) return error("Automation not found", 404);
  return success(automation);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, automationId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.automation.findFirst({ where: { id: automationId, siteId } });
  if (!existing) return error("Automation not found", 404);

  try {
    const body = await req.json();
    const parsed = updateAutomationSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { trigger, actions, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (trigger) data.trigger = trigger as any;
    if (actions) data.actions = actions as any;

    const automation = await prisma.automation.update({ where: { id: automationId }, data });
    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "automation", entityId: automationId, before: existing, after: automation });
    return success(automation);
  } catch (err) { console.error("Update automation error:", err); return error("Internal server error", 500); }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, automationId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.automation.findFirst({ where: { id: automationId, siteId } });
  if (!existing) return error("Automation not found", 404);

  await prisma.automation.delete({ where: { id: automationId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "automation", entityId: automationId, before: existing });
  return success({ deleted: true });
}
