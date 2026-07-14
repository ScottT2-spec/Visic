import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string; productSlug: string }> };

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function notFound(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

// GET /api/storefront/:slug/products/:productSlug — public product page
export async function GET(req: NextRequest, { params }: Params) {
  const { slug, productSlug } = await params;

  try {
    // Resolve store
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [
          { slug },
          { subdomain: slug },
          { customDomain: slug },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        currency: true,
        country: true,
        logo: true,
        settings: {
          select: { showStockCount: true, whatsappOrdering: true, whatsappNumber: true },
        },
        socialLinks: {
          select: { whatsapp: true },
        },
      },
    });

    if (!site) return notFound("Store not found");

    // Fetch product
    const product = await prisma.product.findFirst({
      where: {
        siteId: site.id,
        slug: productSlug,
        status: "ACTIVE",
      },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            options: true,
            position: true,
          },
        },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) return notFound("Product not found");

    // Fetch approved reviews (last 10) + aggregate stats
    const [reviews, reviewStats, ratingDistribution] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId: product.id,
          isApproved: true,
        },
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
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      prisma.review.aggregate({
        where: {
          productId: product.id,
          isApproved: true,
        },
        _avg: { rating: true },
        _count: { rating: true },
      }),

      prisma.review.groupBy({
        by: ["rating"],
        where: {
          productId: product.id,
          isApproved: true,
        },
        _count: { rating: true },
        orderBy: { rating: "asc" },
      }),
    ]);

    const distribution = [1, 2, 3, 4, 5].map((r) => {
      const found = ratingDistribution.find((d) => d.rating === r);
      return { rating: r, count: found?._count.rating || 0 };
    });

    // Fetch related products from same category (up to 4)
    let relatedProducts: unknown[] = [];
    if (product.categoryId) {
      relatedProducts = await prisma.product.findMany({
        where: {
          siteId: site.id,
          categoryId: product.categoryId,
          status: "ACTIVE",
          id: { not: product.id },
        },
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
        },
        take: 4,
        orderBy: { position: "asc" },
      });

      relatedProducts = (relatedProducts as any[]).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        currency: p.currency,
        inStock: p.stock > 0,
        images: p.images,
      }));
    }

    // Clean output — hide cost price, sensitive fields
    const showStock = site.settings?.showStockCount ?? false;
    const publicProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      currency: product.currency,
      sku: product.sku,
      stock: showStock ? product.stock : undefined,
      inStock: product.stock > 0,
      isFeatured: product.isFeatured,
      tags: product.tags,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      images: product.images,
      variants: product.variants.map((v) => ({
        ...v,
        stock: showStock ? v.stock : undefined,
        inStock: v.stock > 0,
      })),
      category: product.category,
    };

    return success({
      store: {
        id: site.id,
        name: site.name,
        slug: site.slug,
        currency: site.currency,
        logo: site.logo,
        whatsapp: site.settings?.whatsappOrdering
          ? (site.settings?.whatsappNumber || site.socialLinks?.whatsapp)
          : undefined,
      },
      product: publicProduct,
      reviews: {
        items: reviews,
        stats: {
          averageRating: reviewStats._avg.rating || 0,
          totalCount: reviewStats._count.rating,
          ratingDistribution: distribution,
        },
      },
      relatedProducts,
    });
  } catch (err) {
    console.error("Storefront product fetch error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
