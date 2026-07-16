"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2, X, ArrowUpDown, CheckCircle2, Heart, Search, ShoppingBag, ShoppingCart, SlidersHorizontal, Star, Menu } from "lucide-react";
import { ImageIcon } from "@/components/icons/FilledIcons";
import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import { CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";

/* ───────── Types ───────── */

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  stock?: number;
  inStock: boolean;
  isFeatured: boolean;
  tags: string[];
  images: ProductImage[];
  category?: ProductCategory;
  reviewCount: number;
}

interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface StoreData {
  store: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    currency: string;
    templateSlug?: string;
  };
  products: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
  categories: StoreCategory[];
  pages: Array<{ id: string; title: string; slug: string; type: string }>;
}

interface LabelOverrides {
  title?: string;
  allLabel?: string;
  subtitle?: string;
  emptyState?: string;
  filterLabel?: string;
  loadMoreText?: string;
  categoriesLabel?: string;
  sortLabelNewest?: string;
  sortLabelPriceLow?: string;
  sortLabelPriceHigh?: string;
  searchPlaceholder?: string;
}

interface ShopPageContentProps {
  storeSlug: string;
  storeData: StoreData;
  labelOverrides?: LabelOverrides;
  cartCount?: number;
  wishlistCount?: number;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
}

/* ───────── Helpers ───────── */

function formatCurrency(amount: number, currency: string = "GHS"): string {
  const symbols: Record<string, string> = { GHS: "GH₵", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-amber-600 to-yellow-600",
  "from-green-400 to-emerald-500",
  "from-blue-400 to-indigo-500",
  "from-red-400 to-pink-500",
  "from-teal-400 to-cyan-500",
  "from-purple-400 to-violet-500",
];

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => Number(a.price) - Number(b.price));
    case "price-desc":
      return sorted.sort((a, b) => Number(b.price) - Number(a.price));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
    default:
      return sorted;
  }
}

/* ───────── Component ───────── */

export function ShopPageContent({
  storeSlug,
  storeData,
  labelOverrides = {},
  cartCount = 0,
  wishlistCount = 0,
  onCartClick,
  onWishlistClick,
}: ShopPageContentProps) {
  const { store } = storeData;
  const currency = store.currency || "GHS";
  
  const [products, setProducts] = useState<Product[]>(storeData.products || []);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(storeData.pagination || { page: 1, limit: 24, total: 0, pages: 0 });
  const [categories, setCategories] = useState<StoreCategory[]>(storeData.categories || []);
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  
  const cartKey = `afrostore_cart_${storeSlug}`;
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number; product: Product }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; }
    } catch { /* ignore */ }
    return [];
  });
  
  const compareKey = `afrostore_compare_${storeSlug}`;
  const [compareList, setCompareList] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { const s = localStorage.getItem(compareKey); if (s) { const p = JSON.parse(s); if (Array.isArray(p)) return p.map((x: any) => x.id); } } catch {} return [];
  });
  
  const toggleCompare = useCallback((product: Product) => {
    setCompareList(prev => {
      const exists = prev.includes(product.id);
      const next = exists ? prev.filter(id => id !== product.id) : prev.length < 4 ? [...prev, product.id] : prev;
      try {
        const saved = localStorage.getItem(compareKey);
        let items: Product[] = saved ? JSON.parse(saved) : [];
        if (exists) { items = items.filter(p => p.id !== product.id); } else if (items.length < 4) { items.push(product); }
        localStorage.setItem(compareKey, JSON.stringify(items));
      } catch {}
      return next;
    });
  }, [compareKey]);

  const { isWishlisted, toggleWishlist } = useWishlist(store.id);

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "24");
        if (selectedCategory) params.set("category", selectedCategory);
        if (searchQuery) params.set("search", searchQuery);

        const res = await fetch(`/api/storefront/${storeSlug}?${params.toString()}`);
        const json = await res.json();

        if (json.success && json.data) {
          if (append) {
            setProducts((prev) => [...prev, ...json.data.products]);
          } else {
            setProducts(json.data.products);
          }
          setPagination(json.data.pagination);
        }
      } catch {
        // Error handling
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [storeSlug, selectedCategory, searchQuery]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (storeData) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
      localStorage.setItem("afrostore_cart_active_slug", storeSlug);
      localStorage.setItem("afrostore_siteId", store.id);
      localStorage.setItem("afrostore_storeSlug", store.slug);
      localStorage.setItem("afrostore_storeName", store.name);
      localStorage.setItem("afrostore_currency", store.currency);
    }
  }, [cart, storeData, storeSlug, store.id, store.name, store.currency, cartKey]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product.id, quantity: 1, product }];
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 1500);
  };

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setMobileFilters(false);
  };

  const handleSearch = (query?: string) => {
    const nextQuery = (query ?? searchInput).trim();
    setSearchInput(nextQuery);
    setSearchQuery(nextQuery);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setSearchInput("");
  };

  const hasFilters = selectedCategory || searchQuery;
  const sortedProducts = sortProducts(products, sort);
  const activeCategoryName = categories.find((c) => c.slug === selectedCategory)?.name;

  const SORT_LABELS: Record<SortOption, string> = {
    newest: labelOverrides.sortLabelNewest || "Newest",
    "price-asc": labelOverrides.sortLabelPriceLow || "Price: Low → High",
    "price-desc": labelOverrides.sortLabelPriceHigh || "Price: High → Low",
    "name-asc": "Name: A → Z",
  };

  const navPageOrder: Record<string, number> = { ABOUT: 0, FAQ: 1, CONTACT: 2, POLICY: 3, CUSTOM: 4, LANDING: 5 };
  const navPages = (storeData.pages || [])
    .filter((p) => p.type !== "HOME")
    .sort((a, b) => (navPageOrder[a.type] ?? 99) - (navPageOrder[b.type] ?? 99));

  return (
    <div className="min-h-screen bg-white text-[#242424]" style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
      <CosmeticsHeader
        storeName={store.name}
        storeSlug={storeSlug}
        logo={store.logo}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        isLanding={false}
      />

      {/* ── Breadcrumb ── */}
      <div className="max-w-[1222px] mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2 text-sm text-[#767676]">
          <Link href={`/store/${storeSlug}`} className="hover:text-[#242424] transition-colors">{store.name}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#242424] font-medium">
            {labelOverrides.title || "Shop"}
          </span>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div className="max-w-[1222px] mx-auto px-4 sm:px-6 pt-4 pb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#242424]">
          {labelOverrides.title || "Shop"}
        </h1>
        <p className="text-[#767676] text-sm mt-1">
          {labelOverrides.subtitle?.replace("{store name}", store.name) || `Browse all products at ${store.name}`}
        </p>
      </div>

      <div className="max-w-[1222px] mx-auto px-4 sm:px-6 pb-16">
        <div className="flex gap-8">
          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(searchInput);
              }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-3 py-2.5">
                <Search className="h-4 w-4 text-[#767676]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={labelOverrides.searchPlaceholder || "Search products..."}
                  className="flex-1 bg-transparent text-sm placeholder:text-[#767676] focus:outline-none"
                />
              </div>
            </form>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold text-[#767676] uppercase tracking-wider mb-3">{labelOverrides.categoriesLabel || "Categories"}</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange("")}
                  className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    !selectedCategory ? "bg-[#242424] text-white" : "text-[#242424] hover:bg-[#f5f5f5]"
                  }`}
                >
                  {labelOverrides.allLabel || "All"}
                  <span className="ml-auto float-right text-xs opacity-60">{pagination.total || "—"}</span>
                </button>
                {categories
                  .filter((c) => c._count.products > 0)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        selectedCategory === cat.slug ? "bg-[#242424] text-white" : "text-[#242424] hover:bg-[#f5f5f5]"
                      }`}
                    >
                      {cat.name}
                      <span className="ml-auto float-right text-xs opacity-60">{cat._count.products}</span>
                    </button>
                  ))}
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 w-full text-center text-sm font-medium text-red-600 hover:text-red-700 py-2"
              >
                Clear all filters
              </button>
            )}
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-6">
              {/* Mobile search */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(searchInput);
                }}
                className="lg:hidden flex-1"
              >
                <div className="flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-3 py-2.5">
                  <Search className="h-4 w-4 text-[#767676]" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={labelOverrides.searchPlaceholder || "Search..."}
                    className="flex-1 bg-transparent text-sm placeholder:text-[#767676] focus:outline-none"
                  />
                </div>
              </form>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFilters(!mobileFilters)}
                className="lg:hidden flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-3 py-2.5 text-sm font-medium text-[#242424]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {labelOverrides.filterLabel || "Filter"}
                {selectedCategory && <span className="h-2 w-2 rounded-full bg-red-600" />}
              </button>

              {/* Sort */}
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-3 py-2.5 text-sm font-medium text-[#242424] hover:border-[#d4d4d4] transition-colors"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
                </button>
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-[#e5e5e5] shadow-xl z-20 py-1">
                      {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => { setSort(key); setShowSortMenu(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === key ? "bg-[#f5f5f5] text-red-600 font-semibold" : "text-[#242424] hover:bg-[#f5f5f5]"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile category chips */}
            {mobileFilters && (
              <div className="lg:hidden mb-6 rounded-2xl border border-[#e5e5e5] bg-white p-4">
                <h3 className="text-xs font-bold text-[#767676] uppercase tracking-wider mb-3">{labelOverrides.categoriesLabel || "Categories"}</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange("")}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      !selectedCategory ? "bg-[#242424] text-white" : "bg-[#f5f5f5] text-[#242424]"
                    }`}
                  >
                    {labelOverrides.allLabel || "All"}
                  </button>
                  {categories
                    .filter((c) => c._count.products > 0)
                    .map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedCategory === cat.slug ? "bg-[#242424] text-white" : "bg-[#f5f5f5] text-[#242424]"
                        }`}
                      >
                        {cat.name} ({cat._count.products})
                      </button>
                    ))}
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-3 text-sm font-medium text-red-600">
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Active filter badges */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {activeCategoryName && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-600 px-3 py-1.5 text-xs font-medium">
                    {activeCategoryName}
                    <button onClick={() => handleCategoryChange("")} className="hover:text-red-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] text-[#242424] px-3 py-1.5 text-xs font-medium">
                    &ldquo;{searchQuery}&rdquo;
                    <button onClick={() => { setSearchQuery(""); setSearchInput(""); }} className="hover:text-[#242424]">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Loading overlay for filter changes */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            )}

            {/* Empty state */}
            {!loading && sortedProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#e5e5e5]">
                <ShoppingBag className="h-12 w-12 text-[#d4d4d4] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#242424] mb-2">{labelOverrides.emptyState || "No products found"}</h3>
                <p className="text-sm text-[#767676] mb-6">
                  {hasFilters
                    ? "Try adjusting your filters or search terms."
                    : "This store hasn't added any products yet."}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="inline-flex items-center gap-2 rounded-xl bg-[#242424] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#1a1a1a] transition-colors">
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Product Grid */}
            {!loading && sortedProducts.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {sortedProducts.map((product) => {
                    const hasImage = product.images.length > 0 && product.images[0].url;
                    const discount = product.compareAtPrice
                      ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
                      : 0;
                    const justAdded = addedToCart === product.id;

                    return (
                      <div key={product.id} className="group">
                        <Link href={`/store/${storeSlug}/product/${product.slug}`} className="block">
                          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-white">
                            {hasImage ? (
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(product.id)} transition-transform duration-500 group-hover:scale-110 flex items-center justify-center`}>
                                <ImageIcon className="h-10 w-10 text-white/40" />
                              </div>
                            )}
                            {product.isFeatured && (
                              <div className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white bg-red-600">Featured</div>
                            )}
                            {!product.inStock && (
                              <div className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white bg-red-500">Sold Out</div>
                            )}
                            {discount > 0 && (
                              <div className="absolute top-3 left-3 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white z-10">-{discount}%</div>
                            )}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                                className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-110 shadow-sm ${isWishlisted(product.id) ? "ring-1 ring-red-200" : ""}`}
                              >
                                <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-[#767676]"}`} />
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (product.inStock) addToCart(product); }}
                                disabled={!product.inStock}
                                className={`h-8 w-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm disabled:opacity-40 ${
                                  justAdded ? "bg-green-500 text-white" : "bg-white/90 text-[#767676] hover:bg-white"
                                }`}
                              >
                                {justAdded ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                              </button>
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        </Link>
                        <Link href={`/store/${storeSlug}/product/${product.slug}`}>
                          <h3 className="text-sm font-semibold text-[#242424] group-hover:text-red-600 transition-colors line-clamp-1">{product.name}</h3>
                        </Link>
                        {product.category && (
                          <p className="text-[10px] text-[#767676] mt-0.5">{product.category.name}</p>
                        )}
                        {product.reviewCount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] text-[#767676]">({product.reviewCount})</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-base font-bold text-[#242424]">{formatCurrency(Number(product.price), currency)}</span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-[#767676] line-through">{formatCurrency(Number(product.compareAtPrice), currency)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More */}
                {pagination.page < pagination.pages && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => fetchProducts(pagination.page + 1, true)}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 rounded-full bg-[#242424] px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#1a1a1a] disabled:opacity-50"
                    >
                      {loadingMore ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</> : <>{labelOverrides.loadMoreText || "Load More Products"}</>}
                    </button>
                    <p className="mt-3 text-xs text-[#767676]">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <CosmeticsFooter
        storeName={store.name}
        storeSlug={storeSlug}
        logo={store.logo}
      />
    </div>
  );
}
