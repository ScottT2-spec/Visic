import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createReturnSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

  const where: Record<string, unknown> = { siteId };
  if (status) where.status = status;

  const [returns, total] = await Promise.all([
    prisma.return.findMany({
      where: where as any, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      include: { order: { select: { id: true, orderNumber: true, total: true, customer: { select: { id: true, firstName: true, lastName: true, email: true } } } } },
    }),
    prisma.return.count({ where: where as any }),
  ]);

  // Summary stats
  const stats = await prisma.return.groupBy({ by: ["status"], where: { siteId }, _count: true });
  const summary = Object.fromEntries(stats.map((s) => [s.status, s._count]));

  return success({ returns, summary, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createReturnSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    // Verify order belongs to site
    const order = await prisma.order.findFirst({ where: { id: parsed.data.orderId, siteId } });
    if (!order) return error("Order not found", 404);

    const ret = await prisma.return.create({
      data: { siteId, orderId: parsed.data.orderId, reason: parsed.data.reason, items: parsed.data.items as any, notes: parsed.data.notes },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "return", entityId: ret.id, after: ret });
    return success(ret, 201);
  } catch (err) { console.error("Create return error:", err); return error("Internal server error", 500); }
}
