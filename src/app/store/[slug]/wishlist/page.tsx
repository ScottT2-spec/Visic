"use client";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { Heart, ImageIcon, ShoppingBag, ShoppingCart, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  inStock: boolean;
  images: ProductImage[];
}

interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  currency: string;
}

function formatCurrency(amount: number, currency: string = "GHS"): string {
  const symbols: Record<string, string> = {
    GHS: "GH₵", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€",
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function WishlistPage() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const siteId = store?.id || "";
  const { wishlist, removeFromWishlist, clearWishlist, wishlistCount } = useWishlist(siteId);

  // Fetch store data
  useEffect(() => {
    fetch(`/api/storefront/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const s = res.data.store;
          setStore({ id: s.id, name: s.name, slug: s.slug, logo: s.logo, currency: s.currency });
          setAllProducts(res.data.products);
        } else {
          setError(res.error || "Store not found");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load store");
        setLoading(false);
      });
  }, [slug]);

  // Filter products that are in the wishlist; remove stale IDs silently
  const wishlistedProducts = allProducts.filter((p) => wishlist.includes(p.id));

  // Clean up stale product IDs (products that no longer exist)
  useEffect(() => {
    if (!siteId || allProducts.length === 0) return;
    const validIds = new Set(allProducts.map((p) => p.id));
    wishlist.forEach((id) => {
      if (!validIds.has(id)) {
        removeFromWishlist(id);
      }
    });
  }, [allProducts, wishlist, siteId, removeFromWishlist]);

  const addToCart = (product: Product) => {
    if (!store) return;
    const cartKey = `cart_${store.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existing = cart.find((item: any) => item.productId === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        variantId: null,
        name: product.name,
        variant: null,
        price: product.price,
        image: product.images[0]?.url || null,
        quantity: 1,
      });
    }
    localStorage.setItem(cartKey, JSON.stringify(cart));
    // Also update the store-scoped cart used by the store page
    const storeCartKey = `afrostore_cart_${slug}`;
    const afroCart = JSON.parse(localStorage.getItem(storeCartKey) || "[]");
    const existingAfro = afroCart.find((item: any) => item.productId === product.id);
    if (existingAfro) {
      existingAfro.quantity += 1;
    } else {
      afroCart.push({ productId: product.id, quantity: 1, product });
    }
    localStorage.setItem(storeCartKey, JSON.stringify(afroCart));
    localStorage.setItem("afrostore_cart_active_slug", slug as string);

    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 1500);
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
        <Link href={`/store/${slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          ← Back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-surface-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={`/store/${slug}`} className="flex items-center gap-2.5">
            {store?.logo ? (
              <img src={store.logo} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="font-display font-bold text-surface-900">{store?.name || "Store"}</span>
          </Link>
          <Link
            href={`/store/${slug}`}
            className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to store
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-surface-900 font-display">
              My Wishlist
            </h1>
            <p className="text-sm text-surface-500 mt-1">
              {wishlistCount === 0
                ? "No items saved"
                : `${wishlistCount} item${wishlistCount !== 1 ? "s" : ""} saved`}
            </p>
          </div>
          {wishlistCount > 0 && (
            <button
              onClick={clearWishlist}
              className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Clear All
            </button>
          )}
        </div>

        {wishlistedProducts.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-surface-200 p-16 text-center">
            <Heart className="h-12 w-12 text-surface-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 font-display">
              Your wishlist is empty
            </h3>
            <p className="text-sm text-surface-500 mt-2 mb-6">
              Save products you love and come back to them later.
            </p>
            <Link
              href={`/store/${slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-brand-700 transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistedProducts.map((product) => {
              const hasImage = product.images.length > 0 && product.images[0].url;
              const discount =
                product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)
                  ? Math.round(
                      ((Number(product.compareAtPrice) - Number(product.price)) /
                        Number(product.compareAtPrice)) *
                        100
                    )
                  : 0;
              const justAdded = addedToCart === product.id;
              const currency = product.currency || store?.currency || "GHS";

              return (
                <div key={product.id} className="group relative rounded-2xl border border-surface-100 overflow-hidden hover:shadow-lg transition-all">
                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-surface-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                    title="Remove from wishlist"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Discount badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      -{discount}%
                    </div>
                  )}

                  {/* Image / Link */}
                  <Link href={`/store/${slug}/product/${product.slug}`}>
                    <div className="aspect-square bg-surface-50">
                      {hasImage ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-surface-200" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-3 sm:p-4">
                    <Link href={`/store/${slug}/product/${product.slug}`}>
                      <h3 className="text-sm font-semibold text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-base font-bold text-surface-900">
                        {formatCurrency(Number(product.price), currency)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-surface-400 line-through">
                          {formatCurrency(Number(product.compareAtPrice), currency)}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart */}
                    <button
                      onClick={() => product.inStock && addToCart(product)}
                      disabled={!product.inStock}
                      className={`mt-3 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                        !product.inStock
                          ? "bg-surface-100 text-surface-400 cursor-not-allowed"
                          : justAdded
                          ? "bg-green-500 text-white"
                          : "bg-surface-900 text-white hover:bg-surface-800"
                      }`}
                    >
                      {!product.inStock ? (
                        "Out of Stock"
                      ) : justAdded ? (
                        <>✓ Added!</>
                      ) : (
                        <>
                          <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="text-xs text-surface-400">
            © {new Date().getFullYear()} {store?.name}. Powered by AfroStore.
          </p>
        </div>
      </footer>
    </div>
  );
}
