import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/storefront/:slug/blogs — public blog listing
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
      },
      select: { id: true, name: true, slug: true },
    });

    if (!site) {
      return json({ success: false, error: "Store not found" }, 404);
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "10")));
    const category = url.searchParams.get("category");
    const tag = url.searchParams.get("tag");
    const search = url.searchParams.get("search");

    const where: Record<string, unknown> = {
      siteId: site.id,
      status: "PUBLISHED",
    };
    if (category) where.category = category;
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    const [blogs, total, categories] = await Promise.all([
      prisma.blog.findMany({
        where: where as any,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          author: true,
          category: true,
          tags: true,
          publishedAt: true,
          createdAt: true,
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blog.count({ where: where as any }),
      // Get distinct categories for filtering
      prisma.blog.findMany({
        where: { siteId: site.id, status: "PUBLISHED", category: { not: null } },
        select: { category: true },
        distinct: ["category"],
      }),
    ]);

    return json({
      success: true,
      data: {
        site: { id: site.id, name: site.name, slug: site.slug },
        blogs,
        categories: categories.map((c) => c.category).filter(Boolean),
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
    console.error("GET storefront blogs error:", err);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
