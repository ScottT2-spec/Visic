import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateFormSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; formId: string }> };

// GET /api/sites/:siteId/forms/:formId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, formId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const form = await prisma.form.findFirst({
    where: { id: formId, siteId },
    include: {
      _count: { select: { submissions: true } },
    },
  });

  if (!form) return error("Form not found", 404);
  return success(form);
}

// PATCH /api/sites/:siteId/forms/:formId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, formId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const existing = await prisma.form.findFirst({ where: { id: formId, siteId } });
    if (!existing) return error("Form not found", 404);

    const body = await req.json();
    const parsed = updateFormSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { settings, fields, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (fields) data.fields = fields as any;
    if (settings !== undefined) data.settings = settings ? (settings as any) : null;

    const form = await prisma.form.update({
      where: { id: formId },
      data,
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "UPDATE",
      entity: "form",
      entityId: formId,
      before: existing,
      after: form,
    });

    return success(form);
  } catch (err) {
    console.error("Update form error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/sites/:siteId/forms/:formId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, formId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.form.findFirst({ where: { id: formId, siteId } });
  if (!existing) return error("Form not found", 404);

  await prisma.form.delete({ where: { id: formId } });

  await logAudit({
    siteId,
    userId: ctx.user!.id,
    action: "DELETE",
    entity: "form",
    entityId: formId,
    before: existing,
  });

  return success({ deleted: true });
}
