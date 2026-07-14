import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createCrmContactSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/crm/contacts
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const status = url.searchParams.get("status");
  const source = url.searchParams.get("source");
  const tag = url.searchParams.get("tag");
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortDir = url.searchParams.get("sortDir") || "desc";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { siteId };
  if (status) where.status = status;
  if (source) where.source = source;
  if (tag) where.tags = { has: tag };
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
    ];
  }

  const validSortFields = ["createdAt", "score", "lastActivityAt", "email", "firstName"];
  const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  const [contacts, total, statusCounts] = await Promise.all([
    prisma.crmContact.findMany({
      where: where as any,
      include: {
        _count: { select: { activities: true } },
      },
      orderBy: { [orderField]: sortDir === "asc" ? "asc" : "desc" },
      skip,
      take: limit,
    }),
    prisma.crmContact.count({ where: where as any }),
    prisma.crmContact.groupBy({
      by: ["status"],
      where: { siteId },
      _count: { status: true },
    }),
  ]);

  const stats = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.status])
  );

  return success({
    contacts,
    stats,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/sites/:siteId/crm/contacts
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createCrmContactSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    // Check duplicate email
    const existing = await prisma.crmContact.findUnique({
      where: { siteId_email: { siteId, email: parsed.data.email } },
    });
    if (existing) return error("A contact with this email already exists", 409);

    const { customFields, ...rest } = parsed.data;
    const contact = await prisma.crmContact.create({
      data: {
        siteId,
        ...rest,
        customFields: customFields ? (customFields as any) : undefined,
      },
    });

    // Log activity
    await prisma.crmActivity.create({
      data: {
        contactId: contact.id,
        type: "contact_created",
        details: { source: parsed.data.source || "manual" } as any,
      },
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "CREATE",
      entity: "crm_contact",
      entityId: contact.id,
      after: contact,
    });

    return success(contact, 201);
  } catch (err) {
    console.error("Create CRM contact error:", err);
    return error("Internal server error", 500);
  }
}
