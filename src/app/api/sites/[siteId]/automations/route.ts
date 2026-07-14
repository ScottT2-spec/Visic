import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createAutomationSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const isActive = url.searchParams.get("isActive");

  const where: Record<string, unknown> = { siteId };
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (isActive !== null && isActive !== undefined && isActive !== "") where.isActive = isActive === "true";

  const automations = await prisma.automation.findMany({
    where: where as any,
    include: { _count: { select: { logs: true } } },
    orderBy: { createdAt: "desc" },
  });

  return success({ automations });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createAutomationSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const automation = await prisma.automation.create({
      data: { siteId, name: parsed.data.name, description: parsed.data.description, trigger: parsed.data.trigger as any, actions: parsed.data.actions as any, isActive: parsed.data.isActive },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "automation", entityId: automation.id, after: automation });
    return success(automation, 201);
  } catch (err) { console.error("Create automation error:", err); return error("Internal server error", 500); }
}
