import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const site = await prisma.site.findUnique({ where: { slug }, select: { id: true } });
  if (!site) return NextResponse.json({ success: false, error: "Site not found" }, { status: 404 });

  const url = new URL(req.url);
  const query = url.searchParams.get("q");
  const type = url.searchParams.get("type"); // products, pages, blogs, all
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ success: false, error: "Search query must be at least 2 characters" }, { status: 400 });
  }

  const searchMode = { contains: query, mode: "insensitive" as const };
  const results: Record<string, unknown[]> = {};

  // Products
  if (!type || type === "products" || type === "all") {
    results.products = await prisma.product.findMany({
      where: { siteId: site.id, status: "ACTIVE", OR: [{ name: searchMode }, { description: searchMode }, { tags: { has: query } }] },
      select: { id: true, name: true, slug: true, price: true, compareAtPrice: true, images: true, currency: true },
      take: limit, orderBy: { name: "asc" },
    });
  }

  // Pages
  if (!type || type === "pages" || type === "all") {
    results.pages = await prisma.page.findMany({
      where: { siteId: site.id, isPublished: true, OR: [{ title: searchMode }, { metaDescription: searchMode }] },
      select: { id: true, title: true, slug: true, metaDescription: true },
      take: limit, orderBy: { title: "asc" },
    });
  }

  // Blogs
  if (!type || type === "blogs" || type === "all") {
    results.blogs = await prisma.blog.findMany({
      where: { siteId: site.id, status: "PUBLISHED", OR: [{ title: searchMode }, { excerpt: searchMode }, { tags: { has: query } }] },
      select: { id: true, title: true, slug: true, excerpt: true, coverImage: true },
      take: limit, orderBy: { publishedAt: "desc" },
    });
  }

  // Categories
  if (!type || type === "categories" || type === "all") {
    results.categories = await prisma.category.findMany({
      where: { siteId: site.id, OR: [{ name: searchMode }, { description: searchMode }] },
      select: { id: true, name: true, slug: true, image: true, _count: { select: { products: true } } },
      take: limit,
    });
  }

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  return NextResponse.json({ success: true, data: { query, results, totalResults } });
}
