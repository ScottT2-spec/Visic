import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { updateABTestSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string; testId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId, testId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const test = await prisma.aBTest.findFirst({
    where: { id: testId, siteId },
    include: { page: { select: { id: true, title: true, slug: true } } },
  });
  if (!test) return error("A/B test not found", 404);
  return success(test);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId, testId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.aBTest.findFirst({ where: { id: testId, siteId } });
  if (!existing) return error("A/B test not found", 404);

  try {
    const body = await req.json();
    const parsed = updateABTestSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { startsAt, endsAt, variants, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (variants) data.variants = variants as any;
    if (startsAt !== undefined) data.startsAt = startsAt ? new Date(startsAt) : null;
    if (endsAt !== undefined) data.endsAt = endsAt ? new Date(endsAt) : null;

    const test = await prisma.aBTest.update({ where: { id: testId }, data });
    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "ab_test", entityId: testId, before: existing, after: test });
    return success(test);
  } catch (err) { console.error("Update A/B test error:", err); return error("Internal server error", 500); }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId, testId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await prisma.aBTest.findFirst({ where: { id: testId, siteId } });
  if (!existing) return error("A/B test not found", 404);

  await prisma.aBTest.delete({ where: { id: testId } });
  await logAudit({ siteId, userId: ctx.user!.id, action: "DELETE", entity: "ab_test", entityId: testId, before: existing });
  return success({ deleted: true });
}
