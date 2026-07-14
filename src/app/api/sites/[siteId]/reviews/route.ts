import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createReviewSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/reviews
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  const isApproved = url.searchParams.get("isApproved");
  const rating = url.searchParams.get("rating");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    product: { siteId },
  };
  if (productId) where.productId = productId;
  if (isApproved !== null && isApproved !== undefined) {
    where.isApproved = isApproved === "true";
  }
  if (rating) {
    where.rating = { gte: parseInt(rating) };
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: where as any,
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: where as any }),
  ]);

  // Calculate aggregate stats
  const stats = await prisma.review.aggregate({
    where: where as any,
    _avg: { rating: true },
    _count: { rating: true },
  });

  const ratingDistribution = await prisma.review.groupBy({
    by: ['rating'],
    where: where as any,
    _count: { rating: true },
    orderBy: { rating: 'asc' },
  });

  const distribution = [1, 2, 3, 4, 5].map(rating => {
    const found = ratingDistribution.find(d => d.rating === rating);
    return { rating, count: found?._count.rating || 0 };
  });

  return success({
    reviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    stats: {
      averageRating: stats._avg.rating || 0,
      totalCount: stats._count.rating,
      ratingDistribution: distribution,
    },
  });
}

// POST /api/sites/:siteId/reviews
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    // Verify the product belongs to this store
    const product = await prisma.product.findFirst({
      where: { id: parsed.data.productId, siteId },
    });
    if (!product) return error("Product not found in this store", 404);

    // Auto-link customer if exists
    const customer = await prisma.customer.findUnique({
      where: { siteId_email: { siteId, email: parsed.data.email } },
    });

    const review = await prisma.review.create({
      data: {
        productId: parsed.data.productId,
        customerId: customer?.id,
        name: parsed.data.name,
        email: parsed.data.email,
        rating: parsed.data.rating,
        title: parsed.data.title,
        body: parsed.data.body,
        images: parsed.data.images,
        isApproved: false,
        isVerified: false,
      },
      include: {
        product: { select: { id: true, name: true } },
      },
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "CREATE",
      entity: "review",
      entityId: review.id,
      after: review,
    });

    return success(review, 201);
  } catch (err) {
    console.error("Create review error:", err);
    return error("Internal server error", 500);
  }
}