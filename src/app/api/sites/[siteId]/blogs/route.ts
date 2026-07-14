import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { createBlogSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ siteId: string }> };

async function ensureUniqueBlogSlug(title: string, siteId: string): Promise<string> {
  let slug = slugify(title);
  let counter = 0;

  while (true) {
    const candidate = counter === 0 ? slug : `${slug}-${counter}`;
    const exists = await prisma.blog.findUnique({
      where: { siteId_slug: { siteId, slug: candidate } },
    });
    if (!exists) return candidate;
    counter++;
  }
}

// GET /api/sites/:siteId/blogs
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { siteId };
  if (status) where.status = status;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
      { tags: { has: search } },
    ];
  }

  const [blogs, total] = await Promise.all([
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
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.blog.count({ where: where as any }),
  ]);

  return success({
    blogs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/sites/:siteId/blogs
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const parsed = createBlogSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const slug = await ensureUniqueBlogSlug(parsed.data.title, siteId);

    const { publishedAt, ...rest } = parsed.data;
    const blog = await prisma.blog.create({
      data: {
        siteId,
        slug,
        ...rest,
        publishedAt: parsed.data.status === "PUBLISHED"
          ? (publishedAt ? new Date(publishedAt) : new Date())
          : (publishedAt ? new Date(publishedAt) : null),
      },
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "CREATE",
      entity: "blog",
      entityId: blog.id,
      after: blog,
    });

    return success(blog, 201);
  } catch (err) {
    console.error("Create blog error:", err);
    return error("Internal server error", 500);
  }
}
