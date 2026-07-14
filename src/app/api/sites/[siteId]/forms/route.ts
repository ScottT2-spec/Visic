import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createFormSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";
import { slugify, generateId } from "@/lib/utils";

type Params = { params: Promise<{ siteId: string }> };

async function ensureUniqueFormSlug(name: string, siteId: string): Promise<string> {
  let slug = slugify(name) || `form-${generateId().slice(0, 6)}`;
  let counter = 0;
  while (true) {
    const candidate = counter === 0 ? slug : `${slug}-${counter}`;
    const exists = await prisma.form.findUnique({
      where: { siteId_slug: { siteId, slug: candidate } },
    });
    if (!exists) return candidate;
    counter++;
  }
}

// GET /api/sites/:siteId/forms
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { siteId };
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const [forms, total] = await Promise.all([
    prisma.form.findMany({
      where: where as any,
      include: {
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.form.count({ where: where as any }),
  ]);

  return success({
    forms,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/sites/:siteId/forms
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createFormSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const slug = await ensureUniqueFormSlug(parsed.data.name, siteId);
    const { settings, ...rest } = parsed.data;

    const form = await prisma.form.create({
      data: {
        siteId,
        slug,
        ...rest,
        fields: parsed.data.fields as any,
        settings: settings ? (settings as any) : undefined,
      },
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "CREATE",
      entity: "form",
      entityId: form.id,
      after: form,
    });

    return success(form, 201);
  } catch (err) {
    console.error("Create form error:", err);
    return error("Internal server error", 500);
  }
}
