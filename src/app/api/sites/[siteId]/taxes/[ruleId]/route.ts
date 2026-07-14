import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateTaxRuleSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; ruleId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, ruleId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const rule = await prisma.taxRule.findFirst({ where: { id: ruleId, siteId } });
  if (!rule) return error("Tax rule not found", 404);
  return success(rule);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, ruleId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.taxRule.findFirst({ where: { id: ruleId, siteId } });
  if (!existing) return error("Tax rule not found", 404);

  try {
    const body = await req.json();
    const parsed = updateTaxRuleSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    // If setting as default, unset existing defaults
    if (parsed.data.isDefault) {
      await prisma.taxRule.updateMany({ where: { siteId, isDefault: true, id: { not: ruleId } }, data: { isDefault: false } });
    }

    const rule = await prisma.taxRule.update({ where: { id: ruleId }, data: parsed.data });
    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "tax_rule", entityId: ruleId, before: existing, after: rule });
    return success(rule);
  } catch (err) { console.error("Update tax rule error:", err); return error("Internal server error", 500); }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, ruleId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.taxRule.findFirst({ where: { id: ruleId, siteId } });
  if (!existing) return error("Tax rule not found", 404);

  await prisma.taxRule.delete({ where: { id: ruleId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "tax_rule", entityId: ruleId, before: existing });
  return success({ deleted: true });
}
