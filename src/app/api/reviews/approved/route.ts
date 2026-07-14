import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/reviews/approved — approved reviews across all stores (for landing page)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));

    const reviews = await prisma.review.findMany({
      where: {
        isApproved: true,
        product: { status: "ACTIVE", site: { status: "ACTIVE" } },
      },
      select: {
        id: true,
        name: true,
        rating: true,
        title: true,
        body: true,
        isVerified: true,
        createdAt: true,
        product: {
          select: {
            name: true,
            site: {
              select: {
                name: true,
                slug: true,
                businessType: true,
                country: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      name: r.name,
      rating: r.rating,
      title: r.title,
      body: r.body,
      isVerified: r.isVerified,
      createdAt: r.createdAt,
      productName: r.product.name,
      storeName: r.product.site.name,
      storeSlug: r.product.site.slug,
      businessType: r.product.site.businessType,
      country: r.product.site.country,
    }));

    return json({ success: true, data: formatted });
  } catch (err) {
    console.error("GET approved reviews error:", err);
    return json({ success: true, data: [] });
  }
}
