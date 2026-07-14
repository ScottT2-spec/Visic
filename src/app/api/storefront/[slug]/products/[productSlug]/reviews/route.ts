import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ slug: string; productSlug: string }> };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// ── Inline validation schema ──
const CreateReviewSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

// ── Resolve store + product ──
async function resolveStoreAndProduct(slug: string, productSlug: string) {
  const site = await prisma.site.findFirst({
    where: {
      status: "ACTIVE",
      OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
    },
    select: { id: true },
  });
  if (!site) return null;

  const product = await prisma.product.findFirst({
    where: { siteId: site.id, slug: productSlug, status: "ACTIVE" },
    select: { id: true },
  });
  if (!product) return null;

  return { siteId: site.id, productId: product.id };
}

// ── GET: paginated approved reviews + stats ──
export async function GET(req: NextRequest, { params }: Params) {
  const { slug, productSlug } = await params;

  try {
    const resolved = await resolveStoreAndProduct(slug, productSlug);
    if (!resolved) {
      return json({ success: false, error: "Product not found" }, 404);
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "5")));
    const sort = url.searchParams.get("sort") || "newest";

    let orderBy: Record<string, string>;
    switch (sort) {
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const where = { productId: resolved.productId, isApproved: true };

    const [reviews, total, reviewStats, ratingDistribution] = await Promise.all([
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
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.review.groupBy({
        by: ["rating"],
        where,
        _count: { rating: true },
        orderBy: { rating: "asc" },
      }),
    ]);

    const distribution = [1, 2, 3, 4, 5].map((r) => {
      const found = ratingDistribution.find((d) => d.rating === r);
      return { rating: r, count: found?._count.rating || 0 };
    });

    return json({
      success: true,
      data: {
        items: reviews,
        stats: {
          averageRating: reviewStats._avg.rating || 0,
          totalCount: reviewStats._count.rating,
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
    console.error("GET reviews error:", err);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

// ── POST: submit a new review ──
export async function POST(req: NextRequest, { params }: Params) {
  const { slug, productSlug } = await params;

  try {
    const rawBody = await req.json();
    const parsed = CreateReviewSchema.safeParse(rawBody);
    if (!parsed.success) {
      return json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        400
      );
    }

    const { name, email, rating, title, body, images } = parsed.data;

    const resolved = await resolveStoreAndProduct(slug, productSlug);
    if (!resolved) {
      return json({ success: false, error: "Product not found" }, 404);
    }

    // Check for duplicate (same email + product)
    const existingReview = await prisma.review.findFirst({
      where: { productId: resolved.productId, email },
    });
    if (existingReview) {
      return json(
        { success: false, error: "You've already reviewed this product" },
        409
      );
    }

    // Check if verified purchaser
    let isVerified = false;
    let customerId: string | null = null;

    const customer = await prisma.customer.findUnique({
      where: { siteId_email: { siteId: resolved.siteId, email } },
      select: { id: true },
    });

    if (customer) {
      customerId = customer.id;
      const purchaseOrder = await prisma.order.findFirst({
        where: {
          siteId: resolved.siteId,
          customerId: customer.id,
          status: "DELIVERED",
          items: { some: { productId: resolved.productId } },
        },
        select: { id: true },
      });
      isVerified = !!purchaseOrder;
    }

    const review = await prisma.review.create({
      data: {
        productId: resolved.productId,
        customerId,
        name,
        email,
        rating,
        title: title || null,
        body: body || null,
        images: images || [],
        isVerified,
        isApproved: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        rating: true,
        title: true,
        body: true,
        images: true,
        isVerified: true,
        isApproved: true,
        createdAt: true,
      },
    });

    return json({ success: true, data: review }, 201);
  } catch (err) {
    console.error("POST review error:", err);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
