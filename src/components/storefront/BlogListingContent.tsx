"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Search, X } from "lucide-react";
import { CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";

/* ───────── Types ───────── */

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  author?: string | null;
  category?: string | null;
  tags: string[];
  publishedAt?: string | null;
  createdAt: string;
}

interface BlogData {
  site: { id: string; name: string; slug: string };
  blogs: BlogPost[];
  categories: string[];
  pagination: { page: number; limit: number; total: number; pages: number; hasMore: boolean };
}

interface LabelOverrides {
  title?: string;
  allLabel?: string;
  subtitle?: string;
  emptyState?: string;
  searchPlaceholder?: string;
}

interface BlogListingContentProps {
  storeSlug: string;
  storeData: BlogData;
  labelOverrides?: LabelOverrides;
}

/* ───────── Helpers ───────── */

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/* ───────── Component ───────── */

export function BlogListingContent({
  storeSlug,
  storeData,
  labelOverrides = {},
}: BlogListingContentProps) {
  const { site } = storeData;
  const blogs = storeData.blogs || [];
  const categories = storeData.categories || [];
  const pagination = storeData.pagination;
  const storeName = site.name;

  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlogData | null>(storeData);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "12");
        if (category) params.set("category", category);
        if (search) params.set("search", search);

        const res = await fetch(`/api/storefront/${storeSlug}/blog?${params.toString()}`);
        const json = await res.json();

        if (json.success && json.data) {
          setData(json.data);
        }
      } catch {
        // Error handling
      }
      setLoading(false);
    }
    fetchBlogs();
  }, [storeSlug, page, category, search]);

  const currentBlogs = data?.blogs || blogs;
  const currentCategories = data?.categories || categories;
  const currentPagination = data?.pagination || pagination;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Lato', Arial, sans-serif" }}>
      <CosmeticsHeader
        storeName={storeName}
        storeSlug={storeSlug}
        isLanding={false}
      />

      {/* Header */}
      <div style={{ background: "#f7f7f7", borderBottom: "1px solid #eee", padding: "40px 15px", textAlign: "center" }}>
        <Link
          href={`/store/${storeSlug}`}
          style={{ fontSize: "12px", color: "#767676", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}
        >
          <ArrowLeft style={{ width: "14px", height: "14px" }} /> Back to {storeName}
        </Link>
        <h1 style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 700, fontSize: "32px", color: "#242424", margin: "0 0 8px" }}>
          {labelOverrides.title || "Blog"}
        </h1>
        <p style={{ color: "#767676", fontSize: "15px", maxWidth: "500px", margin: "0 auto" }}>
          {labelOverrides.subtitle?.replace("{site name}", storeName) || `Latest news and updates from ${storeName}`}
        </p>
      </div>

      <div style={{ maxWidth: "1222px", margin: "0 auto", padding: "40px 15px" }}>
        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "30px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => { setCategory(null); setPage(1); }}
              style={{
                padding: "6px 16px", fontSize: "13px", fontWeight: 600, borderRadius: "0", border: "1px solid",
                borderColor: !category ? "#da3c3c" : "#ddd",
                background: !category ? "#da3c3c" : "#fff",
                color: !category ? "#fff" : "#333",
                cursor: "pointer",
              }}
            >
              {labelOverrides.allLabel || "All"}
            </button>
            {currentCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                style={{
                  padding: "6px 16px", fontSize: "13px", fontWeight: 600, borderRadius: "0", border: "1px solid",
                  borderColor: category === cat ? "#da3c3c" : "#ddd",
                  background: category === cat ? "#da3c3c" : "#fff",
                  color: category === cat ? "#fff" : "#333",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #ddd", padding: "4px 10px" }}>
            <Search style={{ width: "14px", height: "14px", color: "#999" }} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
              placeholder={labelOverrides.searchPlaceholder || "Search blog posts..."}
              style={{ border: "none", outline: "none", fontSize: "13px", width: "150px", fontFamily: "inherit" }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "0" }}>
                <X style={{ width: "14px", height: "14px", color: "#999" }} />
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 20px" }}>
            <Loader2 className="h-8 w-8 animate-spin text-[#da3c3c]" />
          </div>
        )}

        {/* Blog grid */}
        {!loading && currentBlogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#767676" }}>
            <p style={{ fontSize: "16px" }}>{labelOverrides.emptyState || "No blog posts found."}</p>
            {(category || search) && (
              <button
                onClick={() => { setCategory(null); setSearch(""); setSearchInput(""); setPage(1); }}
                style={{ marginTop: "12px", background: "none", border: "none", color: "#da3c3c", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "25px" }}>
            {currentBlogs.map((post) => (
              <Link
                key={post.id}
                href={`/store/${storeSlug}/blog/${post.slug}`}
                style={{ textDecoration: "none", color: "inherit", display: "block", overflow: "hidden" }}
              >
                <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", background: "#f0f0f0" }}>
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "40px", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {post.category && (
                    <span style={{
                      position: "absolute", top: "12px", left: "12px", background: "#f0f0f0", color: "#333",
                      fontSize: "11px", padding: "3px 10px", textTransform: "uppercase", fontWeight: 600,
                    }}>
                      {post.category}
                    </span>
                  )}
                  {/* Date badge */}
                  {(post.publishedAt || post.createdAt) && (() => {
                    const d = new Date(post.publishedAt || post.createdAt);
                    return (
                      <div style={{
                        position: "absolute", top: "12px", right: "12px", background: "#da3c3c", color: "#fff",
                        textAlign: "center", padding: "6px 10px", lineHeight: 1,
                      }}>
                        <span style={{ display: "block", fontSize: "18px", fontWeight: 700 }}>{d.getDate()}</span>
                        <span style={{ display: "block", fontSize: "10px", textTransform: "uppercase" }}>
                          {d.toLocaleString("en-US", { month: "short" })}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div style={{ padding: "18px 0" }}>
                  <h2 style={{
                    fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "16px",
                    color: "#333", margin: "0 0 8px", lineHeight: 1.4,
                  }}>
                    {post.title}
                  </h2>
                  <div style={{ fontSize: "12px", color: "#767676", marginBottom: "8px" }}>
                    {post.author && <span>By <strong>{post.author}</strong></span>}
                    {post.author && (post.publishedAt || post.createdAt) && <span> · </span>}
                    {(post.publishedAt || post.createdAt) && <span>{formatDate(post.publishedAt || post.createdAt)}</span>}
                  </div>
                  {post.excerpt && (
                    <p style={{ fontSize: "13px", color: "#767676", lineHeight: 1.6, margin: 0 }}>
                      {post.excerpt.length > 120 ? post.excerpt.slice(0, 120) + "..." : post.excerpt}
                    </p>
                  )}
                  <span style={{
                    display: "inline-block", marginTop: "10px", fontSize: "13px", fontWeight: 600,
                    color: "#333", textDecoration: "none",
                  }}>
                    Continue reading →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && currentPagination && currentPagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "40px", alignItems: "center" }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              style={{
                padding: "8px 16px", fontSize: "13px", fontWeight: 600, borderRadius: "0", border: "1px solid #ddd",
                background: "#fff", color: "#333", cursor: page <= 1 ? "default" : "pointer",
                opacity: page <= 1 ? 0.4 : 1,
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: "13px", color: "#767676" }}>
              Page {page} of {currentPagination.pages}
            </span>
            <button
              onClick={() => setPage(Math.min(currentPagination.pages, page + 1))}
              disabled={!currentPagination.hasMore}
              style={{
                padding: "8px 16px", fontSize: "13px", fontWeight: 600, borderRadius: "0", border: "1px solid #ddd",
                background: "#fff", color: "#333", cursor: !currentPagination.hasMore ? "default" : "pointer",
                opacity: !currentPagination.hasMore ? 0.4 : 1,
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <CosmeticsFooter
        storeName={storeName}
        storeSlug={storeSlug}
      />
    </div>
  );
}
