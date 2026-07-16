"use client";
import { Check, ChevronDown, ChevronRight, Loader2, Plus, X } from "lucide-react";
import { BadgeCheck, CreditCard, Heart, ImageIcon, MessageCircle, Minus, Pencil, Share2, Shield, ShoppingBag, ShoppingCart, Star, Truck } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductImage { id: string; url: string; alt?: string }
interface Variant { id: string; name: string; price: number; stock: number; inStock: boolean; options: Record<string, string> | null }
interface Review { id: string; name: string; rating: number; title?: string; body?: string; isVerified: boolean; createdAt: string }

interface ProductData {
  store: { id: string; name: string; slug: string; currency: string; logo?: string; whatsapp?: string };
  product: {
    id: string; name: string; slug: string; description?: string;
    price: number; compareAtPrice?: number; currency: string;
    inStock: boolean; stock?: number; isFeatured: boolean;
    tags: string[]; images: ProductImage[]; variants: Variant[];
    category?: { id: string; name: string; slug: string };
    metaTitle?: string; metaDescription?: string;
  };
  reviews: {
    items: Review[];
    stats: { averageRating: number; totalCount: number; ratingDistribution: { rating: number; count: number }[] };
  };
  relatedProducts: { id: string; name: string; slug: string; price: number; compareAtPrice?: number; currency: string; inStock: boolean; images: ProductImage[] }[];
}

function formatPrice(amount: number, currency: string) {
  const symbols: Record<string, string> = { GHS: "GH₵", GHS: "₵", KES: "KSh", USD: "$", GBP: "£", EUR: "€" };
  return `${symbols[currency] || currency + " "}${Number(amount).toLocaleString()}`;
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

export default function ProductDetailPage() {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);
  const { isWishlisted, toggleWishlist } = useWishlist(data?.store?.id || "");

  useEffect(() => {
    fetch(`/api/storefront/${slug}/products/${productSlug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.error || "Product not found");
        setLoading(false);
      })
      .catch(() => { setError("Failed to load product"); setLoading(false); });
  }, [slug, productSlug]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-surface-400" />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <ShoppingBag className="h-12 w-12 text-surface-300" />
      <p className="text-surface-500">{error || "Product not found"}</p>
      <Link href={`/store/${slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        ← Back to store
      </Link>
    </div>
  );

  const { store, product, reviews, relatedProducts } = data;
  const currency = product.currency || store.currency;
  const images = product.images.length > 0 ? product.images : [{ id: "placeholder", url: "", alt: "No image" }];
  const activeVariant = product.variants.find((v) => v.id === selectedVariant);
  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const isInStock = activeVariant ? activeVariant.inStock : product.inStock;
  const discount = product.compareAtPrice && product.compareAtPrice > displayPrice
    ? Math.round(((Number(product.compareAtPrice) - displayPrice) / Number(product.compareAtPrice)) * 100)
    : 0;

  const handleAddToCart = () => {
    // Store in localStorage cart
    const cart = JSON.parse(localStorage.getItem(`cart_${store.id}`) || "[]");
    const existing = cart.find((item: any) => item.productId === product.id && item.variantId === (selectedVariant || null));
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        variantId: selectedVariant || null,
        name: product.name,
        variant: activeVariant?.name || null,
        price: displayPrice,
        image: images[0]?.url,
        quantity,
      });
    }
    localStorage.setItem(`cart_${store.id}`, JSON.stringify(cart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const whatsappOrder = () => {
    if (!store.whatsapp) return;
    const text = `Hi! I'd like to order:\n\n*${product.name}*${activeVariant ? ` (${activeVariant.name})` : ""}\nQuantity: ${quantity}\nPrice: ${formatPrice(displayPrice * quantity, currency)}\n\nFrom: ${store.name}`;
    window.open(`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={`/store/${slug}`} className="flex items-center gap-2.5">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="font-display font-bold text-surface-900">{store.name}</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={share} className="p-2 rounded-xl text-surface-500 hover:bg-surface-50">
              <Share2 className="h-5 w-5" />
            </button>
            <Link href={`/store/${slug}`} className="p-2 rounded-xl text-surface-500 hover:bg-surface-50 relative">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-surface-400 mb-6">
          <Link href={`/store/${slug}`} className="hover:text-surface-600">{store.name}</Link>
          <ChevronRight className="h-3 w-3" />
          {product.category && (
            <>
              <span className="hover:text-surface-600">{product.category.name}</span>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-surface-700 font-medium">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-50 border border-surface-100">
              {images[selectedImage]?.url ? (
                <img src={images[selectedImage].url} alt={images[selectedImage].alt || product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-surface-200" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === selectedImage ? "border-brand-600 ring-2 ring-brand-100" : "border-surface-200 hover:border-surface-300"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              {product.category && (
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">{product.category.name}</span>
              )}
              <h1 className="text-2xl lg:text-3xl font-bold text-surface-900 font-display mt-1">{product.name}</h1>

              {reviews.stats.totalCount > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Stars rating={reviews.stats.averageRating} />
                  <span className="text-sm text-surface-500">({reviews.stats.totalCount} review{reviews.stats.totalCount !== 1 ? "s" : ""})</span>
                </div>
              )}

              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-bold text-surface-900">{formatPrice(displayPrice, currency)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-surface-400 line-through">{formatPrice(Number(product.compareAtPrice), currency)}</span>
                    <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">-{discount}%</span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${isInStock ? "bg-green-500" : "bg-red-500"}`} />
              <span className={`text-sm font-medium ${isInStock ? "text-green-700" : "text-red-700"}`}>
                {isInStock ? (product.stock !== undefined ? `In Stock (${product.stock} available)` : "In Stock") : "Out of Stock"}
              </span>
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Options</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id === selectedVariant ? null : v.id)}
                      disabled={!v.inStock}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        v.id === selectedVariant
                          ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100"
                          : v.inStock
                          ? "border-surface-200 text-surface-700 hover:border-surface-300"
                          : "border-surface-100 text-surface-300 cursor-not-allowed"
                      }`}
                    >
                      {v.name}
                      {v.price !== Number(product.price) && ` · ${formatPrice(v.price, currency)}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Quantity</label>
              <div className="inline-flex items-center rounded-xl border border-surface-200">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 text-surface-500 hover:text-surface-700">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-5 py-2 text-sm font-bold text-surface-900 min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 text-surface-500 hover:text-surface-700">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-surface-900 text-white py-3.5 px-6 text-sm font-bold hover:bg-surface-800 disabled:bg-surface-200 disabled:text-surface-400 disabled:cursor-not-allowed transition-all"
              >
                {addedToCart ? <><Check className="h-4 w-4" /> Added to Cart</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
              </button>
              {store.whatsapp && (
                <button
                  onClick={whatsappOrder}
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white py-3.5 px-6 text-sm font-bold hover:bg-green-700 transition-all"
                >
                  <MessageCircle className="h-4 w-4" /> Order via WhatsApp
                </button>
              )}
              <button
                onClick={() => {
                  const added = toggleWishlist(product.id);
                  setWishlistToast(added ? "Added to wishlist" : "Removed from wishlist");
                  setTimeout(() => setWishlistToast(null), 1500);
                }}
                className={`p-3.5 rounded-xl border transition-all ${isWishlisted(product.id) ? "border-red-200 bg-red-50 text-red-500" : "border-surface-200 text-surface-400 hover:text-red-500"}`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted(product.id) ? "fill-red-500" : ""}`} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: "Fast Delivery", sub: "To your doorstep" },
                { icon: Shield, label: "Secure Payment", sub: "100% protected" },
                { icon: CreditCard, label: "Easy Payment", sub: "Card, transfer, mobile" },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-surface-50">
                  <badge.icon className="h-5 w-5 text-brand-600 mb-1.5" />
                  <span className="text-[10px] font-bold text-surface-800">{badge.label}</span>
                  <span className="text-[9px] text-surface-400">{badge.sub}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-4 border-t border-surface-100">
                <h3 className="text-sm font-bold text-surface-900 mb-2">Description</h3>
                <div className="text-sm text-surface-600 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg bg-surface-50 text-[10px] font-medium text-surface-500">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection slug={slug} productSlug={productSlug} initialReviews={reviews} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-surface-100">
            <h2 className="text-xl font-bold text-surface-900 font-display mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/store/${slug}/product/${p.slug}`} className="group rounded-2xl border border-surface-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square bg-surface-50">
                    {p.images[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-8 w-8 text-surface-200" /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-surface-900 truncate">{p.name}</h3>
                    <p className="text-sm font-bold text-surface-900 mt-1">{formatPrice(p.price, p.currency || currency)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Wishlist Toast */}
      {wishlistToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-2 rounded-full bg-surface-900 text-white px-5 py-2.5 text-sm font-medium shadow-xl">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            {wishlistToast}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-surface-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-xs text-surface-400">© {new Date().getFullYear()} {store.name}. Powered by AfroStore.</p>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ReviewsSection — full-featured reviews UI
   ═══════════════════════════════════════════════════════════ */

function InteractiveStars({ rating, onRate, onHover, size = 24 }: { rating: number; onRate: (r: number) => void; onHover?: (r: number | null) => void; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onRate(i)}
          onMouseEnter={() => onHover?.(i)}
          onMouseLeave={() => onHover?.(null)}
          className="transition-transform hover:scale-110"
        >
          <span className="inline-flex" style={{ width: size, height: size }}>
            <Star className={i <= rating ? "h-full w-full text-amber-400 fill-amber-400" : "h-full w-full text-surface-200 hover:text-amber-200"} />
          </span>
        </button>
      ))}
    </div>
  );
}

interface ReviewsData {
  items: Review[];
  stats: { averageRating: number; totalCount: number; ratingDistribution: { rating: number; count: number }[] };
}

function ReviewsSection({ slug, productSlug, initialReviews }: { slug: string; productSlug: string; initialReviews: ReviewsData }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews.items);
  const [stats, setStats] = useState(initialReviews.stats);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialReviews.items.length >= 5);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState("newest");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formRating, setFormRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchReviews = useCallback(async (p: number, s: string, append: boolean) => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/storefront/${slug}/products/${productSlug}/reviews?page=${p}&limit=5&sort=${s}`);
      const data = await res.json();
      if (data.success) {
        if (append) {
          setReviews((prev) => [...prev, ...data.data.items]);
        } else {
          setReviews(data.data.items);
        }
        setStats(data.data.stats);
        setHasMore(data.data.pagination.hasMore);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [slug, productSlug]);

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
    fetchReviews(1, newSort, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, sort, true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRating === 0) {
      setSubmitResult({ type: "error", message: "Please select a rating" });
      return;
    }
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await fetch(`/api/storefront/${slug}/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          rating: formRating,
          title: formTitle || undefined,
          body: formBody || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitResult({ type: "success", message: "Thank you! Your review will appear after approval." });
        setFormRating(0);
        setFormName("");
        setFormEmail("");
        setFormTitle("");
        setFormBody("");
        setTimeout(() => setShowForm(false), 3000);
      } else {
        setSubmitResult({ type: "error", message: data.error || "Failed to submit review" });
      }
    } catch {
      setSubmitResult({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating ?? formRating;
  const isEmpty = stats.totalCount === 0 && reviews.length === 0;

  return (
    <section id="reviews" className="mt-16 pt-10 border-t border-surface-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-surface-900 font-display">Customer Reviews</h2>
        <button
          onClick={() => { setShowForm(!showForm); setSubmitResult(null); }}
          className="flex items-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-brand-700 transition-all"
        >
          <Pencil className="h-4 w-4" /> Write a Review
        </button>
      </div>

      {/* Write Review Form */}
      {showForm && (
        <div className="mb-8 rounded-2xl border border-surface-200 bg-surface-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-surface-900 font-display">Write a Review</h3>
            <button onClick={() => setShowForm(false)} className="p-1 text-surface-400 hover:text-surface-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {submitResult?.type === "success" ? (
            <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">{submitResult.message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Your Rating *</label>
                <InteractiveStars rating={displayRating} onRate={setFormRating} onHover={setHoverRating} size={28} />
                {submitResult?.type === "error" && submitResult.message === "Please select a rating" && (
                  <p className="text-xs text-red-500 mt-1">Please select a rating</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <p className="text-[10px] text-surface-400 mt-1">Your email won&apos;t be displayed publicly</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">Title <span className="text-surface-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">Review <span className="text-surface-400 font-normal">(optional but encouraged)</span></label>
                <textarea
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Tell others about your experience with this product..."
                  rows={4}
                  className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                />
              </div>

              {submitResult?.type === "error" && submitResult.message !== "Please select a rating" && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-600">{submitResult.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-surface-900 text-white px-6 py-3 text-sm font-bold hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      )}

      {isEmpty ? (
        /* Empty state */
        <div className="rounded-2xl border border-dashed border-surface-200 p-10 text-center">
          <Star className="h-10 w-10 text-surface-200 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-surface-900 font-display">No reviews yet</h3>
          <p className="text-sm text-surface-500 mt-1 mb-4">Be the first to share your experience!</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-brand-700 transition-all"
            >
              <Pencil className="h-4 w-4" /> Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-surface-50 p-6 text-center sticky top-24">
              <div className="text-5xl font-bold text-surface-900 font-display">{stats.averageRating.toFixed(1)}</div>
              <div className="flex justify-center mt-2">
                <Stars rating={stats.averageRating} size={22} />
              </div>
              <p className="text-sm text-surface-500 mt-2">{stats.totalCount} review{stats.totalCount !== 1 ? "s" : ""}</p>

              <div className="mt-6 space-y-2">
                {[...stats.ratingDistribution].reverse().map((d) => {
                  const pct = stats.totalCount > 0 ? (d.count / stats.totalCount) * 100 : 0;
                  return (
                    <div key={d.rating} className="flex items-center gap-2">
                      <span className="text-xs text-surface-500 w-3 text-right">{d.rating}</span>
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-2.5 rounded-full bg-surface-200 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400 transition-all duration-300" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-surface-400 w-6 text-right">{d.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2">
            {/* Sort */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-surface-500">{stats.totalCount} review{stats.totalCount !== 1 ? "s" : ""}</p>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none rounded-xl border border-surface-200 bg-white px-4 py-2 pr-9 text-sm text-surface-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-surface-100 p-5 hover:border-surface-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {review.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-surface-900">{review.name}</span>
                          {review.isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                              <BadgeCheck className="h-3 w-3" /> Verified
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-surface-400">{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                  <Stars rating={review.rating} size={14} />
                  {review.title && <p className="text-sm font-bold text-surface-900 mt-2">{review.title}</p>}
                  {review.body && <p className="text-sm text-surface-600 mt-1.5 leading-relaxed">{review.body}</p>}
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-6 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50 disabled:opacity-50 transition-all"
                >
                  {loadingMore ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</> : "Load More Reviews"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
