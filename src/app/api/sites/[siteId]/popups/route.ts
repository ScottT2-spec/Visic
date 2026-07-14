import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createPopupSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const popups = await prisma.popup.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
  });
  return success({ popups });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createPopupSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { trigger, displayRules, ...rest } = parsed.data;
    const popup = await prisma.popup.create({
      data: { siteId, ...rest, trigger: trigger ? (trigger as any) : undefined, displayRules: displayRules ? (displayRules as any) : undefined },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "popup", entityId: popup.id, after: popup });
    return success(popup, 201);
  } catch (err) { console.error("Create popup error:", err); return error("Internal server error", 500); }
}
