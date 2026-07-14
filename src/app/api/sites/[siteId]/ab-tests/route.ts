import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createABTestSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const where: Record<string, unknown> = { siteId };
  if (status) where.status = status;

  const tests = await prisma.aBTest.findMany({
    where: where as any,
    include: { page: { select: { id: true, title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return success({ tests });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createABTestSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { startsAt, endsAt, ...rest } = parsed.data;
    const test = await prisma.aBTest.create({
      data: { siteId, ...rest, variants: rest.variants as any, startsAt: startsAt ? new Date(startsAt) : undefined, endsAt: endsAt ? new Date(endsAt) : undefined },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "ab_test", entityId: test.id, after: test });
    return success(test, 201);
  } catch (err) { console.error("Create A/B test error:", err); return error("Internal server error", 500); }
}
