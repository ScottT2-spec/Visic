import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createMarketplaceItemSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// Browse marketplace (public within platform)
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

  const where: Record<string, unknown> = { status: "APPROVED" };
  if (type) where.type = type;
  if (category) where.category = category;
  if (search) where.name = { contains: search, mode: "insensitive" };

  const [items, total] = await Promise.all([
    prisma.marketplaceItem.findMany({
      where: where as any, orderBy: { downloads: "desc" },
      skip: (page - 1) * limit, take: limit,
      include: { theme: { select: { id: true, name: true, slug: true, thumbnail: true } }, plugin: { select: { id: true, name: true, slug: true, icon: true } } },
    }),
    prisma.marketplaceItem.count({ where: where as any }),
  ]);

  // Categories
  const categories = await prisma.marketplaceItem.findMany({ where: { status: "APPROVED" }, select: { category: true }, distinct: ["category"] });

  return success({
    items, categories: categories.map((c) => c.category).filter(Boolean),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// Publish to marketplace
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createMarketplaceItemSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const item = await prisma.marketplaceItem.create({
      data: { ...parsed.data, authorId: ctx.user!.id, authorName: `${ctx.user!.firstName} ${ctx.user!.lastName}`.trim() || ctx.user!.email, tags: parsed.data.tags || [] },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "marketplace_item", entityId: item.id, after: item });
    return success(item, 201);
  } catch (err) { console.error("Create marketplace item error:", err); return error("Internal server error", 500); }
}
