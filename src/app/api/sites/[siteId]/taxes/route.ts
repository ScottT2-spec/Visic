import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createTaxRuleSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const rules = await prisma.taxRule.findMany({ where: { siteId }, orderBy: [{ isDefault: "desc" }, { name: "asc" }] });
  return success({ rules });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createTaxRuleSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    // If setting as default, unset existing defaults
    if (parsed.data.isDefault) {
      await prisma.taxRule.updateMany({ where: { siteId, isDefault: true }, data: { isDefault: false } });
    }

    const rule = await prisma.taxRule.create({
      data: { siteId, name: parsed.data.name, rate: parsed.data.rate, country: parsed.data.country, state: parsed.data.state, isDefault: parsed.data.isDefault, isActive: parsed.data.isActive },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "tax_rule", entityId: rule.id, after: rule });
    return success(rule, 201);
  } catch (err) { console.error("Create tax rule error:", err); return error("Internal server error", 500); }
}
