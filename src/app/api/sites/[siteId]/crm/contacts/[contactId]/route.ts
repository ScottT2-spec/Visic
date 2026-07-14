import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateCrmContactSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; contactId: string }> };

// GET /api/sites/:siteId/crm/contacts/:contactId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, contactId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const contact = await prisma.crmContact.findFirst({
    where: { id: contactId, siteId },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { activities: true, emailRecipients: true } },
    },
  });

  if (!contact) return error("Contact not found", 404);
  return success(contact);
}

// PATCH /api/sites/:siteId/crm/contacts/:contactId
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, contactId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const existing = await prisma.crmContact.findFirst({ where: { id: contactId, siteId } });
    if (!existing) return error("Contact not found", 404);

    const body = await req.json();
    const parsed = updateCrmContactSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    // Check email uniqueness if changing
    if (parsed.data.email && parsed.data.email !== existing.email) {
      const dup = await prisma.crmContact.findUnique({
        where: { siteId_email: { siteId, email: parsed.data.email } },
      });
      if (dup) return error("A contact with this email already exists", 409);
    }

    const { customFields, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest, lastActivityAt: new Date() };
    if (customFields !== undefined) data.customFields = customFields ? (customFields as any) : null;

    const contact = await prisma.crmContact.update({
      where: { id: contactId },
      data,
    });

    // Log status change
    if (parsed.data.status && parsed.data.status !== existing.status) {
      await prisma.crmActivity.create({
        data: {
          contactId,
          type: "status_changed",
          details: { from: existing.status, to: parsed.data.status } as any,
        },
      });
    }

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "UPDATE",
      entity: "crm_contact",
      entityId: contactId,
      before: existing,
      after: contact,
    });

    return success(contact);
  } catch (err) {
    console.error("Update CRM contact error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/sites/:siteId/crm/contacts/:contactId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, contactId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.crmContact.findFirst({ where: { id: contactId, siteId } });
  if (!existing) return error("Contact not found", 404);

  await prisma.crmContact.delete({ where: { id: contactId } });

  await logAudit({
    siteId,
    userId: ctx.user!.id,
    action: "DELETE",
    entity: "crm_contact",
    entityId: contactId,
    before: existing,
  });

  return success({ deleted: true });
}
