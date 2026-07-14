import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError } from "@/lib/api-helpers";
import { updateSettingsSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const settings = await prisma.siteSettings.findUnique({ where: { siteId } });
  return success(settings);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  // Filter out null values for non-nullable fields (language has a default)
  const { language, ...rest } = parsed.data;
  const updateData = { ...rest, ...(language !== null && language !== undefined ? { language } : {}) };
  const createData = { siteId, ...rest, ...(language ? { language } : {}) };

  const settings = await prisma.siteSettings.upsert({
    where: { siteId },
    update: updateData,
    create: createData,
  });

  return success(settings);
}
