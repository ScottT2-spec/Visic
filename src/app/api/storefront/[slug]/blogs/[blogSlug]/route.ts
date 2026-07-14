import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string; blogSlug: string }> };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/storefront/:slug/blogs/:blogSlug — public single blog post
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug, blogSlug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
      },
      select: { id: true, name: true, slug: true, logo: true },
    });

    if (!site) {
      return json({ success: false, error: "Store not found" }, 404);
    }

    const blog = await prisma.blog.findFirst({
      where: {
        siteId: site.id,
        slug: blogSlug,
        status: "PUBLISHED",
      },
    });

    if (!blog) {
      return json({ success: false, error: "Blog post not found" }, 404);
    }

    // Fetch related posts (same category, excluding current)
    let relatedPosts: unknown[] = [];
    if (blog.category) {
      relatedPosts = await prisma.blog.findMany({
        where: {
          siteId: site.id,
          status: "PUBLISHED",
          category: blog.category,
          id: { not: blog.id },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          author: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 3,
      });
    }

    return json({
      success: true,
      data: {
        site: { id: site.id, name: site.name, slug: site.slug, logo: site.logo },
        blog: {
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          content: blog.content,
          contentHtml: blog.contentHtml,
          coverImage: blog.coverImage,
          author: blog.author,
          category: blog.category,
          tags: blog.tags,
          metaTitle: blog.metaTitle,
          metaDescription: blog.metaDescription,
          publishedAt: blog.publishedAt,
          createdAt: blog.createdAt,
        },
        relatedPosts,
      },
    });
  } catch (err) {
    console.error("GET storefront blog post error:", err);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
