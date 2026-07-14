import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const entity = url.searchParams.get("entity");
  const action = url.searchParams.get("action");
  const userId = url.searchParams.get("userId");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "30"), 100);

  const where: Record<string, unknown> = { siteId };
  if (entity) where.entity = entity;
  if (action) where.action = action;
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where: where as any }),
  ]);

  // Get unique entities and actions for filters
  const entities = await prisma.auditLog.findMany({ where: { siteId }, select: { entity: true }, distinct: ["entity"] });
  const actions = await prisma.auditLog.findMany({ where: { siteId }, select: { action: true }, distinct: ["action"] });

  return success({
    logs,
    filters: { entities: entities.map((e) => e.entity), actions: actions.map((a) => a.action) },
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
