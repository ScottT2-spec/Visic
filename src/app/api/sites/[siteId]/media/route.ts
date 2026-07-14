import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createMediaItemSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const folder = url.searchParams.get("folder");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "30"), 100);

  const where: Record<string, unknown> = { siteId };
  if (type) where.type = type;
  if (folder) where.folder = folder;
  if (search) where.name = { contains: search, mode: "insensitive" };

  const [items, total] = await Promise.all([
    prisma.mediaItem.findMany({ where: where as any, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.mediaItem.count({ where: where as any }),
  ]);

  // Get unique folders
  const folders = await prisma.mediaItem.findMany({ where: { siteId }, select: { folder: true }, distinct: ["folder"] });

  return success({ items, folders: folders.map((f) => f.folder).filter(Boolean), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createMediaItemSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const item = await prisma.mediaItem.create({ data: { siteId, ...parsed.data } });
    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "media_item", entityId: item.id, after: item });
    return success(item, 201);
  } catch (err) { console.error("Create media error:", err); return error("Internal server error", 500); }
}
