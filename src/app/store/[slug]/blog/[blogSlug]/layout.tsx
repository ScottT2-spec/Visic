import type { Metadata } from "next";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ slug: string; blogSlug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, blogSlug } = await params;

  const site = await prisma.site.findFirst({
    where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    select: { id: true, name: true, slug: true, customDomain: true },
  });

  if (!site) return { title: "Blog Not Found" };

  const blog = await prisma.blog.findFirst({
    where: { siteId: site.id, slug: blogSlug, status: "PUBLISHED" },
    select: { title: true, excerpt: true, coverImage: true, author: true, category: true, publishedAt: true },
  });

  if (!blog) return { title: `Article Not Found | ${site.name}` };

  const description = blog.excerpt || `Read "${blog.title}" on ${site.name}`;
  const storeUrl = site.customDomain ? `https://${site.customDomain}` : `https://afrostore.shop/store/${site.slug}`;
  const blogUrl = `${storeUrl}/blog/${blogSlug}`;

  return {
    title: blog.title,
    description,
    openGraph: {
      type: "article",
      siteName: site.name,
      title: blog.title,
      description,
      url: blogUrl,
      ...(blog.publishedAt ? { publishedTime: blog.publishedAt.toISOString() } : {}),
      ...(blog.author ? { authors: [blog.author] } : {}),
      ...(blog.coverImage ? { images: [{ url: blog.coverImage, width: 1200, height: 630, alt: blog.title }] } : {}),
    },
    twitter: {
      card: blog.coverImage ? "summary_large_image" : "summary",
      title: blog.title,
      description,
      ...(blog.coverImage ? { images: [blog.coverImage] } : {}),
    },
    alternates: { canonical: blogUrl },
  };
}

export default function BlogPostLayout({ children }: Props) {
  return <>{children}</>;
}
