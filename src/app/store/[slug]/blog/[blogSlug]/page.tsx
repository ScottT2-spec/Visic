"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Loader2, Tag, User } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  contentHtml?: string | null;
  coverImage?: string | null;
  author?: string | null;
  category?: string | null;
  tags: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  publishedAt?: string | null;
  createdAt: string;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  author?: string | null;
  publishedAt?: string | null;
}

interface BlogDetailData {
  site: { id: string; name: string; slug: string; logo?: string | null };
  blog: BlogPost;
  relatedPosts: RelatedPost[];
}

export default function StoreBlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const blogSlug = params.blogSlug as string;

  const [data, setData] = useState<BlogDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/storefront/${slug}/blogs/${blogSlug}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.error || "Blog post not found");
        }
      })
      .catch(() => { if (!cancelled) setError("Failed to load blog post"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug, blogSlug]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#767676", fontSize: "16px", marginBottom: "12px" }}>{error || "Blog post not found"}</p>
          <Link
            href={`/store/${slug}/blog`}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 600, color: "#333", textDecoration: "none" }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} /> Back to all posts
          </Link>
        </div>
      </div>
    );
  }

  const { blog, relatedPosts, site } = data;
  const pubDate = blog.publishedAt || blog.createdAt;

  // Render blog content: prefer contentHtml, fallback to plain content with line breaks
  const renderContent = () => {
    if (blog.contentHtml) {
      return <div dangerouslySetInnerHTML={{ __html: blog.contentHtml }} />;
    }
    if (blog.content) {
      // Simple markdown-like rendering: split by double newlines for paragraphs
      return blog.content.split(/\n\n+/).map((para, i) => (
        <p key={i}>{para}</p>
      ));
    }
    return <p style={{ color: "#999" }}>No content available.</p>;
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Lato', Arial, sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Montserrat:wght@700&display=swap');
        .blog-content { font-size: 16px; line-height: 1.8; color: #444; }
        .blog-content p { margin: 0 0 20px; }
        .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4 {
          font-family: 'Montserrat', sans-serif; font-weight: 700; color: #242424;
          margin: 30px 0 15px; line-height: 1.3;
        }
        .blog-content h2 { font-size: 24px; }
        .blog-content h3 { font-size: 20px; }
        .blog-content img { max-width: 100%; height: auto; margin: 20px 0; }
        .blog-content a { color: #da3c3c; text-decoration: underline; }
        .blog-content a:hover { color: #c13030; }
        .blog-content ul, .blog-content ol { margin: 0 0 20px 20px; }
        .blog-content li { margin-bottom: 8px; }
        .blog-content blockquote {
          border-left: 3px solid #da3c3c; margin: 20px 0; padding: 15px 20px;
          background: #fafafa; font-style: italic; color: #555;
        }
      `}} />

      {/* Cover image */}
      {blog.coverImage && (
        <div style={{ width: "100%", maxHeight: "450px", overflow: "hidden", background: "#f0f0f0" }}>
          <img
            src={blog.coverImage}
            alt={blog.title}
            style={{ width: "100%", height: "450px", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#767676", marginBottom: "25px" }}>
          <Link href={`/store/${slug}`} style={{ color: "#767676", textDecoration: "none" }}>{site.name}</Link>
          <span>›</span>
          <Link href={`/store/${slug}/blog`} style={{ color: "#767676", textDecoration: "none" }}>Blog</Link>
          <span>›</span>
          <span style={{ color: "#333" }}>{blog.title}</span>
        </div>

        {/* Category badge */}
        {blog.category && (
          <Link
            href={`/store/${slug}/blog?category=${encodeURIComponent(blog.category)}`}
            style={{
              display: "inline-block", background: "#f0f0f0", color: "#333", fontSize: "11px",
              padding: "4px 12px", textTransform: "uppercase", fontWeight: 600, textDecoration: "none",
              marginBottom: "15px",
            }}
          >
            {blog.category}
          </Link>
        )}

        {/* Title */}
        <h1 style={{
          fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 700, fontSize: "32px",
          color: "#242424", margin: "0 0 15px", lineHeight: 1.3,
        }}>
          {blog.title}
        </h1>

        {/* Meta */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", fontSize: "13px", color: "#767676", marginBottom: "30px", paddingBottom: "25px", borderBottom: "1px solid #eee" }}>
          {blog.author && (
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <User style={{ width: "14px", height: "14px" }} /> {blog.author}
            </span>
          )}
          {pubDate && (
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Calendar style={{ width: "14px", height: "14px" }} /> {formatDate(pubDate)}
            </span>
          )}
        </div>

        {/* Excerpt */}
        {blog.excerpt && (
          <p style={{ fontSize: "18px", color: "#555", lineHeight: 1.6, marginBottom: "30px", fontStyle: "italic" }}>
            {blog.excerpt}
          </p>
        )}

        {/* Content */}
        <div className="blog-content">
          {renderContent()}
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #eee", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <Tag style={{ width: "14px", height: "14px", color: "#767676" }} />
            {blog.tags.map((tag) => (
              <Link
                key={tag}
                href={`/store/${slug}/blog?tag=${encodeURIComponent(tag)}`}
                style={{
                  padding: "4px 12px", fontSize: "12px", background: "#f5f5f5", color: "#555",
                  textDecoration: "none", fontWeight: 500,
                }}
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div style={{ marginTop: "40px", paddingTop: "25px", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            href={`/store/${slug}/blog`}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 600, color: "#333", textDecoration: "none" }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} /> All Posts
          </Link>
          <Link
            href={`/store/${slug}`}
            style={{ fontSize: "14px", fontWeight: 600, color: "#da3c3c", textDecoration: "none" }}
          >
            Visit Store →
          </Link>
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div style={{ background: "#f7f7f7", borderTop: "1px solid #eee", padding: "50px 15px" }}>
          <div style={{ maxWidth: "1222px", margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 700, fontSize: "20px",
              color: "#242424", textAlign: "center", marginBottom: "30px", textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Related Posts
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" }}>
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/store/${slug}/blog/${rp.slug}`}
                  style={{ textDecoration: "none", color: "inherit", background: "#fff", overflow: "hidden" }}
                >
                  <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "#e5e5e5" }}>
                    {rp.coverImage ? (
                      <img src={rp.coverImage} alt={rp.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "30px", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>{rp.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "15px" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "15px", color: "#333", margin: "0 0 6px", lineHeight: 1.4 }}>{rp.title}</h3>
                    {rp.publishedAt && <p style={{ fontSize: "12px", color: "#999", margin: 0 }}>{formatDate(rp.publishedAt)}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
