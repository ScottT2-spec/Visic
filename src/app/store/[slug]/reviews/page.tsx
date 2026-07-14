"use client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BadgeCheck, ImageIcon, ShoppingBag, Star } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { HandmadeBagsHeader, HandmadeBagsFooter } from "@/components/storefront/HandmadeBagsStoreChrome";
import { RenderBlocks } from "@/components/storefront/BlockRenderer";
import { RenderTemplateBlocks } from "@/components/storefront/TemplateBlockRenderer";
import { RETAIL_REVIEWS_BLOCKS } from "@/lib/templates/presets/retail-pages";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { KidsFontLoader, KidsFooterFull, KidsHeader } from "@/components/storefront/KidsTemplateBlocks";
import { HealthHeader, HealthFooterFull } from "@/components/storefront/HealthTemplateBlocks";
import { TShirtsPrintsHeader, TShirtsPrintsFooter } from "@/components/storefront/TShirtsPrintsStoreChrome";
import { PerfumesHeader, PerfumesFooter } from "@/components/storefront/PerfumesStoreChrome";
import { PerfumesStoreContext } from "@/components/storefront/PerfumesTemplateBlocks";
import { PERFUMES_REVIEWS_PAGE_BLOCKS } from "@/lib/templates/presets/perfumes-page-presets";

interface ReviewProduct {
  name: string;
  slug: string;
  image: string | null;
}

interface StoreReview {
  id: string;
  name: string;
  rating: number;
  title?: string;
  body?: string;
  isVerified: boolean;
  createdAt: string;
  product: ReviewProduct;
}

interface ReviewStats {
  averageRating: number;
  totalCount: number;
  ratingDistribution: { rating: number; count: number }[];
}

interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="inline-flex" style={{ width: size, height: size }}>
          <Star className={i <= Math.round(rating) ? "h-full w-full text-amber-400 fill-amber-400" : "h-full w-full text-surface-200"} />
        </span>
      ))}
    </div>
  );
}

export default function StoreReviewsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [themeData, setThemeData] = useState<ThemeData | null>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const isKidsTemplate = slug === "kids";
  const isHealthTemplate = slug === "pills" || store?.slug === "pills" || store?.name?.toLowerCase().includes("pill") || store?.name?.toLowerCase().includes("supplement") || store?.name?.toLowerCase().includes("health");
  const isTShirtsPrintsTemplate = slug === "huty" || store?.slug === "huty" || store?.name?.toLowerCase().includes("t-shirts") || store?.name?.toLowerCase().includes("prints");
  const activeTemplateSlug = storeData?.store?.templates?.[0]?.template?.slug || null;
  const isPerfumesTemplate = activeTemplateSlug === "perfumes" || slug === "perfumes" || store?.slug === "perfumes" || store?.name?.toLowerCase().includes("perfumes");

  const fetchReviews = useCallback(async (p: number, rating: number | null, append: boolean) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      let url = `/api/storefront/${slug}/reviews?page=${p}&limit=10`;
      if (rating) url += `&rating=${rating}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        if (append) {
          setReviews((prev) => [...prev, ...data.data.items]);
        } else {
          setReviews(data.data.items);
        }
        setStats(data.data.stats);
        setHasMore(data.data.pagination.hasMore);
      } else {
        setError(data.error || "Failed to load reviews");
      }
    } catch {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [slug]);

  // Fetch store info and customization
  useEffect(() => {
    Promise.all([
      fetch(`/api/storefront/${slug}`).then(r => r.json()),
      fetch(`/api/storefront/${slug}/pages/reviews`).then(r => r.json().catch(() => ({ success: false })))
    ])
      .then(([storeRes, pageRes]) => {
        if (storeRes.success) {
          const s = storeRes.data.store;
          setStore({ id: s.id, name: s.name, slug: s.slug, logo: s.logo });
          setStoreData(storeRes.data);
          // Set theme data from customization
          const customization = storeRes.data.customization;
          if (customization?.themeSettings) {
            setThemeData({
              id: "default",
              name: "Default Theme",
              slug: "default",
              config: {
                colors: {
                  primary: customization.themeSettings.colors?.primary || "#c27843",
                  secondary: customization.themeSettings.colors?.secondary || "#242424",
                  accent: customization.themeSettings.colors?.accent || "#767676",
                  background: customization.themeSettings.colors?.background || "#ffffff",
                  text: customization.themeSettings.colors?.text || "#242424",
                },
                fonts: {
                  heading: customization.themeSettings.typography?.headingFont,
                  body: customization.themeSettings.typography?.bodyFont,
                },
                layout: customization.themeSettings.layout,
              },
            });
          }
          if (pageRes?.success && pageRes?.data) {
            setPageData(pageRes.data);
          }
        }
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    fetchReviews(1, ratingFilter, false);
  }, [fetchReviews, ratingFilter]);

  const handleFilterChange = (rating: number | null) => {
    setRatingFilter(rating);
    setPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, ratingFilter, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-surface-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-surface-500">{error}</p>
        <Link href={`/store/${slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">← Back to store</Link>
      </div>
    );
  }

  const ratingTabs = [
    { label: "All", value: null },
    { label: "5 Stars", value: 5 },
    { label: "4 Stars", value: 4 },
    { label: "3 Stars", value: 3 },
    { label: "2 Stars", value: 2 },
    { label: "1 Star", value: 1 },
  ];

  // ─── PERFUMES REVIEWS ───
  if (isPerfumesTemplate) {
    const socialLinksArray = Object.entries(storeData?.socialLinks || {}).filter(([, url]: any) => url).map(([p, u]: any) => ({ platform: p, url: u as string }));
    const ctxValue = {
      products: storeData?.products || [],
      blogs: storeData?.blogs || [],
      currency: storeData?.store?.currency || "USD",
      storeSlug: slug,
      socialLinks: socialLinksArray,
    };
    const blocks = pageData?.content?.blocks && pageData.content.blocks.length > 0 
      ? pageData.content.blocks 
      : PERFUMES_REVIEWS_PAGE_BLOCKS;

    return (
      <div style={{ minHeight: "100vh", background: "#fff" }}>
        <PerfumesHeader storeName={store?.name || "Store"} storeSlug={slug} logo={store?.logo} />
        <PerfumesStoreContext.Provider value={ctxValue}>
          <RenderTemplateBlocks blocks={blocks} />
        </PerfumesStoreContext.Provider>
        <PerfumesFooter storeName={store?.name || "Store"} storeSlug={slug} logo={store?.logo} description={storeData?.store?.description} socialLinks={socialLinksArray} />
      </div>
    );
  }

  // ─── RETAIL REVIEWS ───
  const isRetailTemplate = activeTemplateSlug === "retail" || (storeData?.store as any)?.templates?.[0]?.template?.slug === "retail";
  if (isRetailTemplate) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <RenderBlocks blocks={RETAIL_REVIEWS_BLOCKS} storeSlug={slug} products={[]} />
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={themeData}>
      <div className="min-h-screen bg-white">
        {isKidsTemplate ? (
          <>
            <KidsFontLoader />
            <KidsHeader
              storeName={store?.name || "Store"}
              storeSlug={slug}
              logo={store?.logo}
              templateSlug="kids"
              cartCount={0}
              wishlistCount={0}
            />
          </>
        ) : isHealthTemplate ? (
          <>
            <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600;700;800&family=Cabin:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <HealthHeader storeName={store?.name || "Store"} storeSlug={slug} logo={store?.logo} />
          </>
        ) : isTShirtsPrintsTemplate ? (
          <TShirtsPrintsHeader storeName={store?.name || "Store"} storeSlug={slug} logo={store?.logo} />
        ) : (
          <HandmadeBagsHeader
            storeName={store?.name || "Store"}
            storeSlug={slug}
            logo={store?.logo}
            isLanding={false}
          />
        )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-surface-900 font-display mb-4">Customer Reviews</h1>
          <p className="text-lg text-surface-600 max-w-2xl mx-auto">See what our customers are saying about their handcrafted leather pieces</p>
        </div>

        {/* Marquee */}
        <div className="mb-12 py-6 border-t border-b border-surface-200 overflow-hidden">
          <div className="flex items-center gap-16 animate-marquee">
            {["⭐⭐⭐⭐⭐", "Quality Craftsmanship", "Fast Shipping", "Excellent Service", "Premium Leather", "Satisfied Customers"].map((text, i) => (
              <span key={i} className="text-xl font-semibold text-surface-700 whitespace-nowrap">{text}</span>
            ))}
          </div>
        </div>

        {stats && stats.totalCount > 0 ? (
          <>
            {/* Aggregate Stats */}
            <div className="rounded-2xl bg-surface-50 p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center sm:text-left">
                  <div className="text-5xl font-bold text-surface-900 font-display">{stats.averageRating.toFixed(1)}</div>
                  <div className="flex justify-center sm:justify-start mt-2">
                    <Stars rating={stats.averageRating} size={22} />
                  </div>
                  <p className="text-sm text-surface-500 mt-1">{stats.totalCount} review{stats.totalCount !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex-1 w-full max-w-sm space-y-1.5">
                  {[...stats.ratingDistribution].reverse().map((d) => {
                    const pct = stats.totalCount > 0 ? (d.count / stats.totalCount) * 100 : 0;
                    return (
                      <div key={d.rating} className="flex items-center gap-2">
                        <span className="text-xs text-surface-500 w-3 text-right">{d.rating}</span>
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-2.5 rounded-full bg-surface-200 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-surface-400 w-6 text-right">{d.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
              {ratingTabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => handleFilterChange(tab.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    ratingFilter === tab.value
                      ? "bg-surface-900 text-white"
                      : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Reviews Grid */}
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-surface-100 p-5 hover:border-surface-200 transition-colors">
                    {/* Product Info */}
                    <Link
                      href={`/store/${slug}/product/${review.product.slug}`}
                      className="flex items-center gap-3 mb-4 group"
                    >
                      <div className="h-10 w-10 rounded-lg bg-surface-50 overflow-hidden flex-shrink-0 border border-surface-100">
                        {review.product.image ? (
                          <img src={review.product.image} alt={review.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-surface-200" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-surface-500 group-hover:text-brand-600 transition-colors truncate">
                        {review.product.name}
                      </span>
                    </Link>

                    {/* Reviewer */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {review.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-surface-900">{review.name}</span>
                            {review.isVerified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                <BadgeCheck className="h-3 w-3" /> Verified
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-surface-400">
                            {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Stars rating={review.rating} size={14} />
                    {review.title && <p className="text-sm font-bold text-surface-900 mt-2">{review.title}</p>}
                    {review.body && <p className="text-sm text-surface-600 mt-1 leading-relaxed line-clamp-4">{review.body}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-8 w-8 text-surface-200 mx-auto mb-2" />
                <p className="text-sm text-surface-500">No reviews with this rating yet.</p>
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-6 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50 disabled:opacity-50 transition-all"
                >
                  {loadingMore ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</> : "Load More Reviews"}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-surface-200 p-16 text-center">
            <Star className="h-12 w-12 text-surface-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 font-display">No reviews yet</h3>
            <p className="text-sm text-surface-500 mt-2 mb-6">This store hasn&apos;t received any reviews yet.</p>
            <Link
              href={`/store/${slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-brand-700 transition-all"
            >
              Browse Products
            </Link>
          </div>
        )}
      </main>

      {/* Footer - Handmade Bags Style */}
      {isKidsTemplate ? (
        <KidsFooterFull
          storeName={store?.name || "Store"}
          storeSlug={slug}
          logo={store?.logo}
          templateSlug="kids"
        />
      ) : isHealthTemplate ? (
        <HealthFooterFull
          storeName={store?.name || "Store"}
          storeSlug={slug}
          logo={store?.logo}
        />
      ) : isTShirtsPrintsTemplate ? (
        <TShirtsPrintsFooter
          storeName={store?.name || "Store"}
          storeSlug={slug}
          logo={store?.logo}
        />
      ) : (
        <HandmadeBagsFooter
          storeName={store?.name || "Store"}
          storeSlug={slug}
          logo={store?.logo}
        />
      )}
    </div>
    </ThemeProvider>
  );
}
