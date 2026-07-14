import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError } from "@/lib/api-helpers";
import { analyticsEventSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/analytics
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const event = url.searchParams.get("event");
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const groupBy = url.searchParams.get("groupBy") || "day"; // day | week | month
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const skip = (page - 1) * limit;

  try {
    const where: Record<string, unknown> = { siteId };
    if (event) where.event = event;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }

    // Get events with pagination
    const [events, total] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: where as any,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.analyticsEvent.count({ where: where as any }),
    ]);

    // Aggregated metrics
    const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const metricsWhere: Record<string, unknown> = {
      siteId,
      createdAt: {
        gte: startDate ? new Date(startDate) : defaultStart,
        ...(endDate ? { lte: new Date(endDate) } : {}),
      },
    };

    const [pageViews, addToCart, checkoutStarts, purchases] = await Promise.all([
      prisma.analyticsEvent.count({ where: { ...metricsWhere, event: "page_view" } as any }),
      prisma.analyticsEvent.count({ where: { ...metricsWhere, event: "add_to_cart" } as any }),
      prisma.analyticsEvent.count({ where: { ...metricsWhere, event: "checkout" } as any }),
      prisma.analyticsEvent.count({ where: { ...metricsWhere, event: "purchase" } as any }),
    ]);

    const conversionRate = pageViews > 0 ? Math.round((purchases / pageViews) * 10000) / 100 : 0;
    const cartRate = pageViews > 0 ? Math.round((addToCart / pageViews) * 10000) / 100 : 0;

    // Group by time period
    let dateTrunc: string;
    if (groupBy === "week") dateTrunc = "week";
    else if (groupBy === "month") dateTrunc = "month";
    else dateTrunc = "day";

    const timeline = await prisma.$queryRawUnsafe<
      { date: string; event: string; count: number }[]
    >(
      `SELECT DATE_TRUNC($1, "createdAt")::date as date, event, COUNT(*)::int as count
       FROM analytics_events
       WHERE "siteId" = $2 AND "createdAt" >= $3 ${endDate ? 'AND "createdAt" <= $4' : ""}
       GROUP BY DATE_TRUNC($1, "createdAt")::date, event
       ORDER BY date ASC`,
      dateTrunc,
      siteId,
      startDate ? new Date(startDate) : defaultStart,
      ...(endDate ? [new Date(endDate)] : [])
    );

    return success({
      events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      metrics: { pageViews, addToCart, checkoutStarts, purchases, conversionRate, cartRate },
      timeline,
    });
  } catch (err) {
    console.error("Analytics GET error:", err);
    return error("Internal server error", 500);
  }
}

// POST /api/sites/:siteId/analytics — record an analytics event (public)
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;

  // Verify store exists (no auth required — storefront tracking)
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return error("Store not found", 404);

  try {
    const body = await req.json();
    const parsed = analyticsEventSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { metadata, ...rest } = parsed.data;
    const analyticsEvent = await prisma.analyticsEvent.create({
      data: {
        siteId,
        ...rest,
        metadata: metadata ? (metadata as any) : undefined,
      },
    });

    return success(analyticsEvent, 201);
  } catch (err) {
    console.error("Analytics POST error:", err);
    return error("Internal server error", 500);
  }
}
