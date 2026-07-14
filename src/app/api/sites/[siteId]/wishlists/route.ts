import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

  const [wishlists, total] = await Promise.all([
    prisma.wishlist.findMany({
      where: { siteId },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: { include: { product: { select: { id: true, name: true, slug: true, price: true, images: true } } }, orderBy: { addedAt: "desc" } },
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.wishlist.count({ where: { siteId } }),
  ]);

  // Stats
  const totalItems = await prisma.wishlistItem.count({ where: { wishlist: { siteId } } });
  const topProducts = await prisma.wishlistItem.groupBy({
    by: ["productId"],
    where: { wishlist: { siteId } },
    _count: true,
    orderBy: { _count: { productId: "desc" } },
    take: 10,
  });

  const topProductIds = topProducts.map((p) => p.productId);
  const topProductDetails = topProductIds.length > 0
    ? await prisma.product.findMany({ where: { id: { in: topProductIds } }, select: { id: true, name: true, slug: true, price: true, images: true } })
    : [];

  const mostWishlisted = topProducts.map((p) => ({
    ...topProductDetails.find((d) => d.id === p.productId),
    wishlistCount: p._count,
  }));

  return success({
    wishlists,
    stats: { totalWishlists: total, totalItems, mostWishlisted },
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
