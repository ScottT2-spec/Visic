import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createEmailCampaignSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/campaigns/email
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { siteId };
  if (status) where.status = status;
  if (search) where.name = { contains: search, mode: "insensitive" };

  const [campaigns, total] = await Promise.all([
    prisma.emailCampaign.findMany({
      where: where as any,
      select: {
        id: true, name: true, subject: true, fromName: true, fromEmail: true,
        status: true, type: true, scheduledAt: true, sentAt: true,
        totalSent: true, totalOpened: true, totalClicked: true, totalBounced: true,
        createdAt: true, updatedAt: true,
        _count: { select: { recipients: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.emailCampaign.count({ where: where as any }),
  ]);

  return success({ campaigns, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

// POST /api/sites/:siteId/campaigns/email
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createEmailCampaignSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { scheduledAt, ...rest } = parsed.data;
    const campaign = await prisma.emailCampaign.create({
      data: {
        siteId,
        ...rest,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "email_campaign", entityId: campaign.id, after: campaign });
    return success(campaign, 201);
  } catch (err) {
    console.error("Create email campaign error:", err);
    return error("Internal server error", 500);
  }
}
