import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/storefront/:slug/reviews — all approved reviews for the store
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
      },
      select: { id: true, name: true },
    });

    if (!site) {
      return json({ success: false, error: "Store not found" }, 404);
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "10")));
    const ratingFilter = url.searchParams.get("rating");
    const ratingVal = ratingFilter ? parseInt(ratingFilter) : null;

    // Base where clause: approved reviews for products in this store
    const where: Record<string, unknown> = {
      isApproved: true,
      product: { siteId: site.id, status: "ACTIVE" },
    };
    if (ratingVal && ratingVal >= 1 && ratingVal <= 5) {
      where.rating = ratingVal;
    }

    const [reviews, total, aggregateStats, ratingDistribution] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          name: true,
          rating: true,
          title: true,
          body: true,
          images: true,
          isVerified: true,
          createdAt: true,
          product: {
            select: {
              name: true,
              slug: true,
              images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where: {
          isApproved: true,
          product: { siteId: site.id, status: "ACTIVE" },
        },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.review.groupBy({
        by: ["rating"],
        where: {
          isApproved: true,
          product: { siteId: site.id, status: "ACTIVE" },
        },
        _count: { rating: true },
        orderBy: { rating: "asc" },
      }),
    ]);

    const distribution = [1, 2, 3, 4, 5].map((r) => {
      const found = ratingDistribution.find((d) => d.rating === r);
      return { rating: r, count: found?._count.rating || 0 };
    });

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      name: r.name,
      rating: r.rating,
      title: r.title,
      body: r.body,
      images: r.images,
      isVerified: r.isVerified,
      createdAt: r.createdAt,
      product: {
        name: r.product.name,
        slug: r.product.slug,
        image: r.product.images[0]?.url || null,
      },
    }));

    return json({
      success: true,
      data: {
        items: formattedReviews,
        stats: {
          averageRating: aggregateStats._avg.rating || 0,
          totalCount: aggregateStats._count.rating,
          ratingDistribution: distribution,
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      },
    });
  } catch (err) {
    console.error("GET store reviews error:", err);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
