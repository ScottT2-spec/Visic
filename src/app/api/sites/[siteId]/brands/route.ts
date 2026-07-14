import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createBrandSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";
import { slugify, generateId } from "@/lib/utils";

type Params = { params: Promise<{ siteId: string }> };

async function ensureUniqueBrandSlug(name: string, siteId: string): Promise<string> {
  let slug = slugify(name) || `brand-${generateId().slice(0, 6)}`;
  let counter = 0;
  while (true) {
    const candidate = counter === 0 ? slug : `${slug}-${counter}`;
    const exists = await prisma.brand.findUnique({
      where: { siteId_slug: { siteId, slug: candidate } },
    });
    if (!exists) return candidate;
    counter++;
  }
}

// GET /api/sites/:siteId/brands
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = { siteId };
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const brands = await prisma.brand.findMany({
    where: where as any,
    include: {
      _count: { select: { products: true } },
    },
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });

  return success({ brands });
}

// POST /api/sites/:siteId/brands
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createBrandSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const slug = await ensureUniqueBrandSlug(parsed.data.name, siteId);

    const brand = await prisma.brand.create({
      data: {
        siteId,
        slug,
        ...parsed.data,
      },
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "CREATE",
      entity: "brand",
      entityId: brand.id,
      after: brand,
    });

    return success(brand, 201);
  } catch (err) {
    console.error("Create brand error:", err);
    return error("Internal server error", 500);
  }
}
