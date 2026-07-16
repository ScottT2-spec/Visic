"use client";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { ArrowUpDown, CheckCircle2, Heart, ImageIcon, Menu, Search, ShoppingBag, ShoppingCart, SlidersHorizontal, Star } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { useWishlist } from "@/hooks/useWishlist";
import { HandmadeBagsHeader, HandmadeBagsFooter } from "@/components/storefront/HandmadeBagsStoreChrome";
import { CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";
import { KidsFontLoader, KidsFooterFull, KidsHeader } from "@/components/storefront/KidsTemplateBlocks";
import { PerfumesFontLoader, PerfumesFooter, PerfumesHeader } from "@/components/storefront/PerfumesTemplateBlocks";
import { TShirtsPrintsFooter, TShirtsPrintsHeader } from "@/components/storefront/TShirtsPrintsStoreChrome";

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
  theme: ThemeData | null;
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

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  "name-asc": "Name: A → Z",
};

/* ───────── Component ───────── */

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, pages: 0 });
  const [categories, setCategories] = useState<StoreCategory[]>([]);

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const cartKey = `afrostore_cart_${slug}`;
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number; product: Product }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; }
    } catch { /* ignore */ }
    return [];
  });
  const [mobileMenu, setMobileMenu] = useState(false);
  const compareKey = `afrostore_compare_${slug}`;
  const [compareList, setCompareList] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { const s = localStorage.getItem(compareKey); if (s) { const p = JSON.parse(s); if (Array.isArray(p)) return p.map((x: any) => x.id); } } catch {} return [];
  });
  const toggleCompare = useCallback((product: Product) => {
    setCompareList(prev => {
      const exists = prev.includes(product.id);
      const next = exists ? prev.filter(id => id !== product.id) : prev.length < 4 ? [...prev, product.id] : prev;
      // Sync full product data to localStorage for compare page
      try {
        const saved = localStorage.getItem(compareKey);
        let items: Product[] = saved ? JSON.parse(saved) : [];
        if (exists) { items = items.filter(p => p.id !== product.id); } else if (items.length < 4) { items.push(product); }
        localStorage.setItem(compareKey, JSON.stringify(items));
      } catch {}
      return next;
    });
  }, [compareKey]);

  const { isWishlisted, toggleWishlist, wishlistCount } = useWishlist(storeData?.store?.id || "");

  // Update URL params
  const updateParams = useCallback(
    (cat: string, search: string) => {
      const params = new URLSearchParams();
      if (cat) params.set("category", cat);
      if (search) params.set("search", search);
      const qs = params.toString();
      router.replace(`/store/${slug}/shop${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [slug, router]
  );

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

        const res = await fetch(`/api/storefront/${slug}?${params.toString()}`);
        const json = await res.json();

        if (json.success && json.data) {
          if (!storeData || page === 1) {
            setStoreData(json.data);
            setCategories(json.data.categories);
          }

          if (append) {
            setProducts((prev) => [...prev, ...json.data.products]);
          } else {
            setProducts(json.data.products);
          }
          setPagination(json.data.pagination);
        } else {
          setError(json.error || "Failed to load products");
        }
      } catch {
        setError("Failed to load products");
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [slug, selectedCategory, searchQuery, storeData]
  );

  // Initial load + refetch on filter changes
  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery]);

  // Save cart to localStorage
  useEffect(() => {
    if (storeData) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
      localStorage.setItem("afrostore_cart_active_slug", slug);
      localStorage.setItem("afrostore_siteId", storeData.store.id);
      localStorage.setItem("afrostore_storeSlug", storeData.store.slug);
      localStorage.setItem("afrostore_storeName", storeData.store.name);
      localStorage.setItem("afrostore_currency", storeData.store.currency);
    }
  }, [cart, storeData]);

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

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    updateParams(catSlug, searchQuery);
    setMobileFilters(false);
  };

  const handleSearch = (query?: string) => {
    const nextQuery = (query ?? searchInput).trim();
    setSearchInput(nextQuery);
    setSearchQuery(nextQuery);
    updateParams(selectedCategory, nextQuery);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setSearchInput("");
    updateParams("", "");
  };

  const hasFilters = selectedCategory || searchQuery;
  const sortedProducts = sortProducts(products, sort);
  const currency = storeData?.store.currency || "GHS";

  const navPageOrder: Record<string, number> = { ABOUT: 0, FAQ: 1, CONTACT: 2, POLICY: 3, CUSTOM: 4, LANDING: 5 };
  const navPages = (storeData?.pages || [])
    .filter((p) => p.type !== "HOME")
    .sort((a, b) => (navPageOrder[a.type] ?? 99) - (navPageOrder[b.type] ?? 99));

  /* ── Loading ── */
  if (loading && !storeData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-surface-500 text-sm">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <ShoppingBag className="h-12 w-12 text-surface-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Store not found</h1>
          <p className="text-surface-500">{error}</p>
        </div>
      </div>
    );
  }

  const { store } = storeData;
  const activeCategoryName = categories.find((c) => c.slug === selectedCategory)?.name;
  const isHandmadeBagsTemplate = store.templateSlug === "handmade-bags";
  const isTShirtsPrintsTemplate = store.templateSlug === "t-shirts-prints" || slug === "t-shirts-prints" || store.slug === "t-shirts-prints";
  const isCosmeticsTemplate = 
    store.templateSlug === "cosmetics" || 
    slug === "stacj" || // Force cosmetics for stacj store
    slug?.toLowerCase().includes("cosmetics") || 
    slug?.toLowerCase().includes("stacj") ||
    store.name?.toLowerCase().includes("cosmetics") ||
    store.name?.toLowerCase().includes("stacj");
  const isKidsTemplate = slug === "kids" || store.templateSlug === "kids";
  const isPerfumesTemplate = slug === "perfumes" || store.templateSlug === "perfumes";

  if (isTShirtsPrintsTemplate) {
    // Standalone T-Shirts & Prints Shop page - exact reference structure
    return (
      <div className="min-h-screen bg-white text-[#1d1d1d]" style={{ fontFamily: "'Manrope', Arial, sans-serif" }}>
        <TShirtsPrintsHeader
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />

        <main className="px-4 py-8">
          <div className="mx-auto max-w-[1320px]">
            <div className="mb-6 flex items-center gap-2 text-sm text-[#7c7c7c]">
              <Link href={`/store/${slug}`} className="hover:text-[#111]">Home</Link>
              <span>/</span>
              <span>Shop</span>
            </div>

            {/* Categories Section */}
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Link href={`/store/${slug}/shop?category=apparel`} className="group">
                <div className="relative overflow-hidden rounded-[28px] bg-gray-100 aspect-square">
                  <img src="https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/02/ps-color-t-shirt.svg" alt="Apparel" className="w-full h-full object-cover p-8" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition">
                    <span className="text-sm font-semibold text-[#111]">Apparel</span>
                  </div>
                </div>
              </Link>
              <Link href={`/store/${slug}/shop?category=home-living`} className="group">
                <div className="relative overflow-hidden rounded-[28px] bg-gray-100 aspect-square">
                  <img src="https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/02/ps-color-tote-bag.svg" alt="Home & Living" className="w-full h-full object-cover p-8" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition">
                    <span className="text-sm font-semibold text-[#111]">Home & Living</span>
                  </div>
                </div>
              </Link>
              <Link href={`/store/${slug}/shop?category=stickers`} className="group">
                <div className="relative overflow-hidden rounded-[28px] bg-gray-100 aspect-square">
                  <img src="https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/02/ps-color-sticker.svg" alt="Stickers" className="w-full h-full object-cover p-8" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition">
                    <span className="text-sm font-semibold text-[#111]">Stickers</span>
                  </div>
                </div>
              </Link>
              <Link href={`/store/${slug}/shop?category=wall-art`} className="group">
                <div className="relative overflow-hidden rounded-[28px] bg-gray-100 aspect-square">
                  <img src="https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/02/ps-color-poster.svg" alt="Wall Art" className="w-full h-full object-cover p-8" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition">
                    <span className="text-sm font-semibold text-[#111]">Wall Art</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="lg:sticky lg:top-28 lg:h-fit">
                <div className="rounded-[30px] border border-[#ececec] bg-white p-6 shadow-[0_20px_50px_rgba(17,17,17,0.05)]">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#111]">Filters</p>
                  
                  <div className="mb-6">
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#a69cad]">Sort by</h2>
                    <div className="grid gap-2">
                      {["Popularity", "Average rating", "Newness", "Price: low to high", "Price: high to low"].map((label) => (
                        <button
                          key={label}
                          className="rounded-2xl px-4 py-3 text-left text-sm font-semibold bg-[#f7f7f7] text-[#1d1d1d] hover:bg-[#ececec] transition"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#a69cad]">Price filter</h2>
                    <div className="space-y-2 text-sm text-[#1d1d1d]">
                      <button className="flex w-full items-center justify-between hover:text-[#111]"><span>All</span><span className="text-[#7c7c7c]">—</span></button>
                      <button className="flex w-full items-center justify-between hover:text-[#111]"><span>$ 0.00 - $ 10.00</span><span className="text-[#7c7c7c]">—</span></button>
                      <button className="flex w-full items-center justify-between hover:text-[#111]"><span>$ 10.00 - $ 20.00</span><span className="text-[#7c7c7c]">—</span></button>
                      <button className="flex w-full items-center justify-between hover:text-[#111]"><span>$ 20.00 +</span><span className="text-[#7c7c7c]">—</span></button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#a69cad]">Color</h2>
                    <div className="space-y-2 text-sm text-[#1d1d1d]">
                      {["Black", "Dark Lava", "Deep Chestnut", "Gray", "Morning Blue", "Olive Green", "Ruddy Brown", "Slate Blue", "White"].map((color) => (
                        <button key={color} className="flex w-full items-center justify-between hover:text-[#111]">
                          <span>{color}</span>
                          <span className="text-[#7c7c7c]">13</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#a69cad]">Size</h2>
                    <div className="space-y-2 text-sm text-[#1d1d1d]">
                      {["L", "M", "S", "XL", "XS"].map((size) => (
                        <button key={size} className="flex w-full items-center justify-between hover:text-[#111]">
                          <span>{size}</span>
                          <span className="text-[#7c7c7c]">5</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              <section>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {sortedProducts.map((product) => {
                    const hasImage = product.images.length > 0 && product.images[0].url;
                    const justAdded = addedToCart === product.id;

                    return (
                      <div key={product.id} className="group">
                        <Link href={`/store/${slug}/product/${product.slug}`} className="block">
                          <div className="relative mb-3 aspect-[3/4] overflow-hidden bg-white">
                            {hasImage ? (
                              <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <ImageIcon className="h-10 w-10 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute right-3 top-3 flex gap-2">
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                                className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 ${isWishlisted(product.id) ? "text-[#111]" : "text-[#1d1d1d]"}`}
                              >
                                <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (product.inStock) addToCart(product); }}
                                disabled={!product.inStock}
                                className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition hover:scale-110 disabled:opacity-40 ${justAdded ? "bg-[#111] text-white" : "bg-white/90 text-[#1d1d1d]"}`}
                              >
                                {justAdded ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                              </button>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-black/0 p-3 opacity-0 transition group-hover:opacity-100">
                              <div className="flex gap-2">
                                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#111]">Compare</span>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#111]">Quick view</span>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#111]">Add to wishlist</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                        <Link href={`/store/${slug}/product/${product.slug}`}>
                          <h3 className="text-sm font-semibold text-[#1d1d1d] transition group-hover:text-[#666]">{product.name}</h3>
                        </Link>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-base font-bold text-[#1d1d1d]">{formatCurrency(Number(product.price), currency)}</span>
                          {product.compareAtPrice && <span className="text-xs text-[#9b9b9b] line-through">{formatCurrency(Number(product.compareAtPrice), currency)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="mt-16 space-y-12">
              <div>
                <h2 className="text-2xl font-semibold text-[#111]">You can create custom design</h2>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-[#666]">
                  The price of a T-shirt with an individual design depends on the circulation, the number of images on one product, their size, and the printing method. brand, material and order urgency.
                </p>
                <Link href={`/store/${slug}/shop`} className="mt-4 inline-flex rounded-full bg-[#111] px-5 py-2.5 text-sm font-semibold text-white">
                  Create design
                </Link>
              </div>

              <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
                <div>
                  <h2 className="text-2xl font-semibold text-[#111]">We Are Open for Your Questions!</h2>
                  <p className="mt-3 text-sm leading-7 text-[#666]">Feel free to communicate with us</p>
                  <button type="button" className="mt-5 inline-flex rounded-full border border-[#111] px-5 py-2.5 text-sm font-semibold text-[#111]">
                    Ask a Question
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#111]">Send Us a Message</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <input className="rounded-2xl border border-[#ececec] px-4 py-3 text-sm" placeholder="Your Name" />
                    <input className="rounded-2xl border border-[#ececec] px-4 py-3 text-sm" placeholder="Your Email" />
                    <input className="rounded-2xl border border-[#ececec] px-4 py-3 text-sm" placeholder="Phone Number" />
                    <input className="rounded-2xl border border-[#ececec] px-4 py-3 text-sm" placeholder="Company" />
                    <textarea className="sm:col-span-2 min-h-[160px] rounded-[24px] border border-[#ececec] px-4 py-3 text-sm" placeholder="Your Message" />
                  </div>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
                <div>
                  <h2 className="text-2xl font-semibold text-[#111]">Contact Information</h2>
                  <div className="mt-4 space-y-2 text-sm text-[#666]">
                    <p>1060 Cudahy Pl, San Diego</p>
                    <p>(686) 492-1041</p>
                    <p>xtemos.studio@gmail.com</p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#666]">
                    Do you have questions about how we can help your company? Send us an email and we'll get in touch shortly.
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#111]">Social links:</h2>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <a href="https://www.facebook.com/xtemos.studio" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#111] hover:text-[#7c7c7c]">
                      Facebook
                    </a>
                    <a href="https://x.com/xtemos_studio" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#111] hover:text-[#7c7c7c]">
                      X (Twitter)
                    </a>
                    <a href="https://www.instagram.com/xtemos.studio/" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#111] hover:text-[#7c7c7c]">
                      Instagram
                    </a>
                    <a href="https://www.youtube.com/channel/UCu3loFwqqOQ9z-YTcnplK8w" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#111] hover:text-[#7c7c7c]">
                      Youtube
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <TShirtsPrintsFooter storeName={store.name} storeSlug={slug} logo={store.logo} />
      </div>
    );
  }

  if (isKidsTemplate) {
    return (
      <div className="min-h-screen bg-[#fffef8] text-[#3b3344]" style={{ fontFamily: "'Inter', Arial, sans-serif" }}>
        <KidsFontLoader />
        <KidsHeader
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          templateSlug="kids"
          cartCount={cartCount}
          wishlistCount={wishlistCount}
        />

        <section className="bg-gradient-to-br from-[#fff7df] via-[#fffdf4] to-[#ffeef1] px-4 py-14">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5857c]">Kids Shop</p>
                <h1 className="mt-4 font-serif text-4xl text-[#3b3344] sm:text-5xl">{activeCategoryName || "All Products"}</h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[#6d6277]">
                  Discover playful clothing, gifts, and everyday essentials from the Kids collection.
                </p>
              </div>
              <div className="rounded-[28px] bg-white px-5 py-4 shadow-[0_16px_40px_rgba(59,51,68,0.06)]">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f5857c]">Products</p>
                <p className="mt-2 text-2xl font-bold text-[#3b3344]">{pagination.total}</p>
                <p className="text-sm text-[#6d6277]">Bright picks for little ones</p>
              </div>
            </div>
          </div>
        </section>

        <main className="px-4 py-10">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-[30px] border border-[#efe6da] bg-white p-6 shadow-[0_20px_50px_rgba(59,51,68,0.05)]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch(searchInput);
                  }}
                  className="mb-6"
                >
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.25em] text-[#a69cad]">Search</label>
                  <div className="flex items-center gap-2 rounded-full border border-[#efe6da] bg-[#fffdf8] px-4 py-3">
                    <Search className="h-4 w-4 text-[#f5857c]" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#a69cad]"
                    />
                  </div>
                </form>

                <div>
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#a69cad]">Categories</h2>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryChange("")}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        !selectedCategory ? "bg-[#3b3344] text-white" : "bg-[#fffaf1] text-[#3b3344] hover:bg-[#fff4de]"
                      }`}
                    >
                      <span>All Products</span>
                      <span className="text-xs opacity-70">{pagination.total || "—"}</span>
                    </button>
                    {categories
                      .filter((c) => c._count.products > 0)
                      .map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryChange(cat.slug)}
                          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                            selectedCategory === cat.slug ? "bg-[#f5857c] text-white" : "bg-[#fffaf1] text-[#3b3344] hover:bg-[#fff4de]"
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span className="text-xs opacity-70">{cat._count.products}</span>
                        </button>
                      ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSort(key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        sort === key ? "bg-[#f5857c] text-white" : "bg-[#fffaf1] text-[#3b3344] hover:bg-[#fff4de]"
                      }`}
                    >
                      {SORT_LABELS[key]}
                    </button>
                  ))}
                </div>

                {hasFilters && (
                  <button onClick={clearFilters} className="mt-6 w-full rounded-full border border-[#f5857c] px-4 py-2.5 text-sm font-semibold text-[#f5857c] transition hover:bg-[#fff0ee]">
                    Clear all filters
                  </button>
                )}
              </div>
            </aside>

            <section>
              <div className="mb-5 flex flex-wrap items-center gap-3 lg:hidden">
                <button
                  onClick={() => setMobileFilters(!mobileFilters)}
                  className="rounded-full bg-[#3b3344] px-4 py-2 text-sm font-semibold text-white"
                >
                  {mobileFilters ? "Hide filters" : "Show filters"}
                </button>
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="rounded-full border border-[#efe6da] bg-white px-4 py-2 text-sm font-semibold text-[#3b3344]"
                >
                  Sort: {SORT_LABELS[sort]}
                </button>
              </div>

              {mobileFilters && (
                <div className="mb-6 rounded-[28px] border border-[#efe6da] bg-white p-5 shadow-[0_20px_50px_rgba(59,51,68,0.05)] lg:hidden">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSearch(searchInput);
                    }}
                    className="mb-5"
                  >
                    <div className="flex items-center gap-2 rounded-full border border-[#efe6da] bg-[#fffdf8] px-4 py-3">
                      <Search className="h-4 w-4 text-[#f5857c]" />
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#a69cad]"
                      />
                    </div>
                  </form>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleCategoryChange("")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${!selectedCategory ? "bg-[#3b3344] text-white" : "bg-[#fffaf1] text-[#3b3344]"}`}>All</button>
                    {categories.filter((c) => c._count.products > 0).map((cat) => (
                      <button key={cat.id} onClick={() => handleCategoryChange(cat.slug)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selectedCategory === cat.slug ? "bg-[#f5857c] text-white" : "bg-[#fffaf1] text-[#3b3344]"}`}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  {hasFilters && <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-[#f5857c]">Clear filters</button>}
                </div>
              )}

              <div className="mb-6 flex flex-wrap items-center gap-2">
                {activeCategoryName && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#fff0ee] px-4 py-2 text-xs font-semibold text-[#f5857c]">
                    {activeCategoryName}
                    <button onClick={() => handleCategoryChange("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#fff4de] px-4 py-2 text-xs font-semibold text-[#3b3344]">
                    “{searchQuery}”
                    <button onClick={() => { setSearchQuery(""); setSearchInput(""); updateParams(selectedCategory, ""); }}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>

              {loading && storeData && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-[#f5857c]" />
                </div>
              )}

              {!loading && sortedProducts.length === 0 && (
                <div className="rounded-[30px] border border-[#efe6da] bg-white px-6 py-20 text-center shadow-[0_20px_50px_rgba(59,51,68,0.05)]">
                  <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-[#d8c9b7]" />
                  <h3 className="text-xl font-bold text-[#3b3344]">No products found</h3>
                  <p className="mt-2 text-sm text-[#6d6277]">
                    {hasFilters ? "Try adjusting your filters or search terms." : "This store hasn't added any products yet."}
                  </p>
                  {hasFilters && (
                    <button onClick={clearFilters} className="mt-6 rounded-full bg-[#3b3344] px-5 py-2.5 text-sm font-semibold text-white">
                      Clear filters
                    </button>
                  )}
                </div>
              )}

              {!loading && sortedProducts.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {sortedProducts.map((product) => {
                      const hasImage = product.images.length > 0 && product.images[0].url;
                      const discount = product.compareAtPrice
                        ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
                        : 0;
                      const justAdded = addedToCart === product.id;

                      return (
                        <div key={product.id} className="group">
                          <Link href={`/store/${slug}/product/${product.slug}`} className="block">
                            <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-[30px] bg-white shadow-[0_14px_32px_rgba(59,51,68,0.08)]">
                              {hasImage ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.images[0].alt || product.name}
                                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${getGradient(product.id)}`}>
                                  <ImageIcon className="h-10 w-10 text-white/50" />
                                </div>
                              )}
                              {discount > 0 && (
                                <span className="absolute left-3 top-3 rounded-full bg-[#f5857c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                  -{discount}%
                                </span>
                              )}
                              {product.isFeatured && (
                                <span className="absolute left-3 top-3 rounded-full bg-[#3b3344] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                  Featured
                                </span>
                              )}
                              {!product.inStock && (
                                <span className="absolute left-3 top-3 rounded-full bg-[#ff7c7c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                  Sold Out
                                </span>
                              )}
                              <div className="absolute right-3 top-3 flex gap-2">
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 ${isWishlisted(product.id) ? "text-[#f5857c]" : "text-[#3b3344]"}`}
                                >
                                  <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
                                </button>
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (product.inStock) addToCart(product); }}
                                  disabled={!product.inStock}
                                  className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition hover:scale-110 disabled:opacity-40 ${justAdded ? "bg-[#5cc48e] text-white" : "bg-white/90 text-[#3b3344]"}`}
                                >
                                  {justAdded ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          </Link>
                          <Link href={`/store/${slug}/product/${product.slug}`}>
                            <h3 className="text-sm font-semibold text-[#3b3344] transition group-hover:text-[#f5857c]">{product.name}</h3>
                          </Link>
                          {product.category && <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#a69cad]">{product.category.name}</p>}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-base font-bold text-[#3b3344]">{formatCurrency(Number(product.price), currency)}</span>
                            {product.compareAtPrice && <span className="text-xs text-[#a69cad] line-through">{formatCurrency(Number(product.compareAtPrice), currency)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {pagination.page < pagination.pages && (
                    <div className="mt-10 text-center">
                      <button
                        onClick={() => fetchProducts(pagination.page + 1, true)}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 rounded-full bg-[#3b3344] px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#2f2937] disabled:opacity-50"
                      >
                        {loadingMore ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</> : <>Load More Products</>}
                      </button>
                      <p className="mt-3 text-xs text-[#a69cad]">
                        Page {pagination.page} of {pagination.pages}
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </main>

        <KidsFooterFull
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          templateSlug="kids"
          description={store.description || "Bright, playful kids fashion and gifts with a premium WoodMart-inspired finish."}
        />
      </div>
    );
  }

  if (isPerfumesTemplate) {
    return (
      <div className="min-h-screen bg-[#f6f0eb] text-[#241f24]" style={{ fontFamily: "'Inter', Arial, sans-serif" }}>
        <PerfumesFontLoader />
        <PerfumesHeader
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          categories={categories}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
        />

        <section className="bg-[#f6f0eb] px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b6798]">Fragrances</p>
            <h1 className="mt-4 font-serif text-4xl text-[#241f24] sm:text-5xl">Fragrances</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#6f6573]">
              Discover the full perfume collection, organized by collection and refined by scent family.
            </p>
          </div>
        </section>

        <main className="px-4 pb-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-[30px] border border-[#e7ddd7] bg-white p-6 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch(searchInput);
                  }}
                  className="mb-6"
                >
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.25em] text-[#a18ea1]">Search</label>
                  <div className="flex items-center gap-2 rounded-full border border-[#e7ddd7] bg-[#fcfaf8] px-4 py-3">
                    <Search className="h-4 w-4 text-[#8b6798]" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#a18ea1]"
                    />
                  </div>
                </form>

                <div>
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#a18ea1]">Collections</h2>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryChange("")}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        !selectedCategory ? "bg-[#241f24] text-white" : "bg-[#fbf7f4] text-[#241f24] hover:bg-[#f4ece7]"
                      }`}
                    >
                      <span>All Collections</span>
                      <span className="text-xs opacity-70">{pagination.total || "—"}</span>
                    </button>
                    {categories
                      .filter((category) => category._count.products > 0)
                      .map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryChange(category.slug)}
                          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                            selectedCategory === category.slug ? "bg-[#8b6798] text-white" : "bg-[#fbf7f4] text-[#241f24] hover:bg-[#f4ece7]"
                          }`}
                        >
                          <span>{category.name}</span>
                          <span className="text-xs opacity-70">{category._count.products}</span>
                        </button>
                      ))}
                  </div>
                </div>

                {hasFilters && (
                  <button onClick={clearFilters} className="mt-6 w-full rounded-full border border-[#8b6798] px-4 py-2.5 text-sm font-semibold text-[#8b6798] transition hover:bg-[#f5edf6]">
                    Clear all filters
                  </button>
                )}
              </div>
            </aside>

            <section>
              {hasFilters && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  {activeCategoryName && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#f2e8f3] px-4 py-2 text-xs font-semibold text-[#8b6798]">
                      {activeCategoryName}
                      <button onClick={() => handleCategoryChange("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#eee8f2] px-4 py-2 text-xs font-semibold text-[#241f24]">
                      “{searchQuery}”
                      <button onClick={() => { setSearchQuery(""); setSearchInput(""); updateParams(selectedCategory, ""); }}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {loading && storeData && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-[#8b6798]" />
                </div>
              )}

              {!loading && sortedProducts.length === 0 && (
                <div className="rounded-[30px] border border-[#e7ddd7] bg-white px-6 py-20 text-center shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                  <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-[#d8c9d5]" />
                  <h3 className="text-xl font-bold text-[#241f24]">No products found</h3>
                  <p className="mt-2 text-sm text-[#6f6573]">
                    {hasFilters ? "Try adjusting your filters or search terms." : "This collection hasn't added any products yet."}
                  </p>
                  {hasFilters && (
                    <button onClick={clearFilters} className="mt-6 rounded-full bg-[#241f24] px-5 py-2.5 text-sm font-semibold text-white">
                      Clear filters
                    </button>
                  )}
                </div>
              )}

              {!loading && sortedProducts.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {sortedProducts.map((product) => {
                      const hasImage = product.images.length > 0 && product.images[0].url;
                      const discount = product.compareAtPrice
                        ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
                        : 0;
                      const justAdded = addedToCart === product.id;

                      return (
                        <div key={product.id} className="group">
                          <Link href={`/store/${slug}/product/${product.slug}`} className="block">
                            <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-[30px] bg-white shadow-[0_14px_32px_rgba(47,34,46,0.08)]">
                              {hasImage ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.images[0].alt || product.name}
                                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${getGradient(product.id)}`}>
                                  <ImageIcon className="h-10 w-10 text-white/50" />
                                </div>
                              )}
                              {discount > 0 && (
                                <span className="absolute left-3 top-3 rounded-full bg-[#8b6798] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                  -{discount}%
                                </span>
                              )}
                              {product.isFeatured && (
                                <span className="absolute left-3 top-3 rounded-full bg-[#241f24] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                  Featured
                                </span>
                              )}
                              {!product.inStock && (
                                <span className="absolute left-3 top-3 rounded-full bg-[#ff7c7c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                  Sold Out
                                </span>
                              )}
                              <div className="absolute right-3 top-3 flex gap-2">
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 ${isWishlisted(product.id) ? "text-[#8b6798]" : "text-[#241f24]"}`}
                                >
                                  <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
                                </button>
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (product.inStock) addToCart(product); }}
                                  disabled={!product.inStock}
                                  className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition hover:scale-110 disabled:opacity-40 ${justAdded ? "bg-[#6db08c] text-white" : "bg-white/90 text-[#241f24]"}`}
                                >
                                  {justAdded ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          </Link>
                          <Link href={`/store/${slug}/product/${product.slug}`}>
                            <h3 className="text-sm font-semibold text-[#241f24] transition group-hover:text-[#8b6798]">{product.name}</h3>
                          </Link>
                          {product.category && <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#a18ea1]">{product.category.name}</p>}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-base font-bold text-[#241f24]">{formatCurrency(Number(product.price), currency)}</span>
                            {product.compareAtPrice && <span className="text-xs text-[#a18ea1] line-through">{formatCurrency(Number(product.compareAtPrice), currency)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {pagination.page < pagination.pages && (
                    <div className="mt-10 text-center">
                      <button
                        onClick={() => fetchProducts(pagination.page + 1, true)}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 rounded-full bg-[#241f24] px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#120f12] disabled:opacity-50"
                      >
                        {loadingMore ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</> : <>Load More Products</>}
                      </button>
                      <p className="mt-3 text-xs text-[#a18ea1]">
                        Page {pagination.page} of {pagination.pages}
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </main>

        <PerfumesFooter
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          description={store.description || "Discover a curated collection of modern fragrances designed to hold memory, emotion, and identity in every bottle."}
        />
      </div>
    );
  }

  // ─── HEALTH / PILLS SHOP ───
  const isHealthTemplate = slug === "pills" || store.templateSlug === "pills" ||
    store.name?.toLowerCase().includes("pill") || store.name?.toLowerCase().includes("supplement") || store.name?.toLowerCase().includes("health");

  if (isHealthTemplate) {
    return (
      <div className="min-h-screen bg-white text-[#333]" style={{ fontFamily: "'Cabin', Arial, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600;700;800&family=Cabin:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <HealthHeader storeName={store.name} storeSlug={slug} logo={store.logo} cartCount={cartCount} wishlistCount={wishlistCount} />
        <main style={{ maxWidth: "1222px", margin: "0 auto", padding: "40px 15px 60px" }}>
          <div style={{ marginBottom: "30px" }}>
            <h1 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "32px", fontWeight: 700, color: "#333" }}>Shop</h1>
            <p style={{ color: "#777", fontSize: "14px", marginTop: "8px" }}>Showing {products.length} products</p>
          </div>
          {/* Filters */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "30px", flexWrap: "wrap" }}>
            {categories.filter((c: any) => c._count?.products > 0).map((cat: any) => (
              <a key={cat.id} href={`/store/${slug}/shop?category=${cat.slug}`} style={{ padding: "8px 18px", borderRadius: "20px", background: "#f7f7f7", color: "#333", fontSize: "13px", fontWeight: 600, textDecoration: "none", transition: "background 0.2s" }}>{cat.name}</a>
            ))}
          </div>
          {/* Product Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
            {products.map((p: any) => {
              const img = p.images?.[0]?.url;
              const price = Number(p.price);
              const comparePrice = p.compareAtPrice ? Number(p.compareAtPrice) : null;
              return (
                <a key={p.id} href={`/store/${slug}/product/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ borderRadius: "15px", overflow: "hidden", background: "#f7f7f7", transition: "box-shadow 0.2s" }}>
                    <div style={{ aspectRatio: "1", position: "relative", overflow: "hidden" }}>
                      {img ? <img src={img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, rgb(136,173,153), #a8d5ba)" }} />}
                      {p.isFeatured && <span style={{ position: "absolute", top: "12px", left: "12px", background: "rgb(136,173,153)", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>Featured</span>}
                    </div>
                    <div style={{ padding: "16px" }}>
                      <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "15px", fontWeight: 600, color: "#333", marginBottom: "8px" }}>{p.name}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px", fontWeight: 700, color: "rgb(136,173,153)" }}>{currency} {price.toLocaleString()}</span>
                        {comparePrice && comparePrice > price && <span style={{ fontSize: "13px", color: "#999", textDecoration: "line-through" }}>{currency} {comparePrice.toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
          {products.length === 0 && <p style={{ textAlign: "center", color: "#777", padding: "60px 0", fontSize: "16px" }}>No products found.</p>}
        </main>
        <HealthFooterFull storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description || "Your trusted source for vitamins, supplements, and wellness products."} contact={{ address: "1901 Thornridge Cir. Shiloh, Hawaii 81063", phone: "(956) 238-7908", email: "hello@store.com" }} />
      </div>
    );
  }

  return (
    <ThemeProvider theme={storeData.theme}>
    <div className="min-h-screen bg-surface-50">
      {/* ── Nav ── */}
      {isTShirtsPrintsTemplate ? (
        <TShirtsPrintsHeader
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />
      ) : isCosmeticsTemplate ? (
        <CosmeticsHeader
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          isLanding={false}
        />
      ) : isHandmadeBagsTemplate ? (
        <HandmadeBagsHeader
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          isLanding={false}
        />
      ) : (
      <header className="sticky top-0 z-40 bg-white border-b border-surface-200 shadow-sm themed-header">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden p-2 -ml-2 text-surface-600">
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href={`/store/${slug}`} className="flex items-center gap-2">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-9 w-9 rounded-xl object-cover" />
              ) : (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="font-display text-lg font-bold text-surface-900">{store.name}</span>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center gap-6">
            <Link href={`/store/${slug}`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Home</Link>
            <Link href={`/store/${slug}/shop`} className="text-sm font-medium text-brand-700 transition-colors">Shop</Link>
            <Link href={`/store/${slug}/reviews`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Reviews</Link>
            {navPages.slice(0, 4).map((page) => (
              <Link key={page.id} href={`/store/${slug}/${page.slug}`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">{page.title}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href={`/store/${slug}/wishlist`} className="relative p-2 text-surface-600 hover:bg-surface-50 rounded-lg hidden sm:flex">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{wishlistCount}</span>
              )}
            </Link>
            <Link href={`/store/${slug}/cart`} className="relative p-2 text-surface-600 hover:bg-surface-50 rounded-lg">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="sm:hidden bg-white border-t border-surface-200 px-4 py-4 space-y-2">
            <Link href={`/store/${slug}`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Home</Link>
            <Link href={`/store/${slug}/shop`} onClick={() => setMobileMenu(false)} className="block text-sm font-bold text-brand-700 py-2">Shop</Link>
            <Link href={`/store/${slug}/reviews`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Reviews</Link>
            {navPages.map((page) => (
              <Link key={page.id} href={`/store/${slug}/${page.slug}`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">{page.title}</Link>
            ))}
          </div>
        )}
      </header>
      )}

      {/* ── Breadcrumb ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <Link href={`/store/${slug}`} className="hover:text-surface-600 transition-colors">{store.name}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-surface-900 font-medium">
            {activeCategoryName || "All Products"}
          </span>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-surface-900">
          {activeCategoryName || "All Products"}
        </h1>
        <p className="text-surface-500 text-sm mt-1">
          {pagination.total === 0
            ? "No products found"
            : `Showing ${products.length} of ${pagination.total} product${pagination.total !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
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
              <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2.5">
                <Search className="h-4 w-4 text-surface-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
                />
              </div>
            </form>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange("")}
                  className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    !selectedCategory ? "bg-surface-900 text-white" : "text-surface-600 hover:bg-surface-100"
                  }`}
                >
                  All Products
                  <span className="ml-auto float-right text-xs opacity-60">{pagination.total || "—"}</span>
                </button>
                {categories
                  .filter((c) => c._count.products > 0)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        selectedCategory === cat.slug ? "bg-surface-900 text-white" : "text-surface-600 hover:bg-surface-100"
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
                <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2.5">
                  <Search className="h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
                  />
                </div>
              </form>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFilters(!mobileFilters)}
                className="lg:hidden flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm font-medium text-surface-600"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
                {selectedCategory && <span className="h-2 w-2 rounded-full bg-brand-600" />}
              </button>

              {/* Sort */}
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm font-medium text-surface-600 hover:border-surface-300 transition-colors"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
                </button>
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-surface-200 shadow-xl z-20 py-1">
                      {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => { setSort(key); setShowSortMenu(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === key ? "bg-surface-50 text-brand-700 font-semibold" : "text-surface-600 hover:bg-surface-50"}`}
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
              <div className="lg:hidden mb-6 rounded-2xl border border-surface-200 bg-white p-4">
                <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange("")}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      !selectedCategory ? "bg-surface-900 text-white" : "bg-surface-100 text-surface-600"
                    }`}
                  >
                    All
                  </button>
                  {categories
                    .filter((c) => c._count.products > 0)
                    .map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedCategory === cat.slug ? "bg-surface-900 text-white" : "bg-surface-100 text-surface-600"
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
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 px-3 py-1.5 text-xs font-medium">
                    {activeCategoryName}
                    <button onClick={() => handleCategoryChange("")} className="hover:text-brand-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 text-surface-700 px-3 py-1.5 text-xs font-medium">
                    &ldquo;{searchQuery}&rdquo;
                    <button onClick={() => { setSearchQuery(""); setSearchInput(""); updateParams(selectedCategory, ""); }} className="hover:text-surface-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Loading overlay for filter changes */}
            {loading && storeData && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            )}

            {/* Empty state */}
            {!loading && sortedProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-surface-100">
                <ShoppingBag className="h-12 w-12 text-surface-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-surface-900 mb-2">No products found</h3>
                <p className="text-sm text-surface-500 mb-6">
                  {hasFilters
                    ? "Try adjusting your filters or search terms."
                    : "This store hasn't added any products yet."}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="inline-flex items-center gap-2 rounded-xl bg-surface-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-surface-800 transition-colors">
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
                        <Link href={`/store/${slug}/product/${product.slug}`} className="block">
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
                              <div className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white bg-brand-600">Featured</div>
                            )}
                            {!product.inStock && (
                              <div className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white bg-red-500">Sold Out</div>
                            )}
                            {discount > 0 && (
                              <div className="absolute top-3 left-3 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white z-10">-{discount}%</div>
                            )}
                            {/* Always-visible wishlist + cart icons */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                                className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-110 shadow-sm ${isWishlisted(product.id) ? "ring-1 ring-red-200" : ""}`}
                              >
                                <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-surface-500"}`} />
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (product.inStock) addToCart(product); }}
                                disabled={!product.inStock}
                                className={`h-8 w-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm disabled:opacity-40 ${
                                  justAdded ? "bg-green-500 text-white" : "bg-white/90 text-surface-500 hover:bg-white"
                                }`}
                              >
                                {justAdded ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(product); }}
                                className={`h-8 w-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm ${compareList.includes(product.id) ? "bg-brand-600 text-white ring-1 ring-brand-300" : "bg-white/90 text-surface-500 hover:bg-white"}`}
                                title={compareList.includes(product.id) ? "Remove from compare" : "Add to compare"}
                              >
                                <SlidersHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        </Link>
                        <Link href={`/store/${slug}/product/${product.slug}`}>
                          <h3 className="text-sm font-semibold text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-1">{product.name}</h3>
                        </Link>
                        {product.category && (
                          <p className="text-[10px] text-surface-400 mt-0.5">{product.category.name}</p>
                        )}
                        {product.reviewCount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] text-surface-400">({product.reviewCount})</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-base font-bold text-surface-900">{formatCurrency(Number(product.price), currency)}</span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-surface-400 line-through">{formatCurrency(Number(product.compareAtPrice), currency)}</span>
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
                      className="inline-flex items-center gap-2 rounded-2xl bg-surface-900 text-white px-8 py-3.5 text-sm font-bold hover:bg-surface-800 transition-all shadow-lg disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
                      ) : (
                        <>Load More Products</>
                      )}
                    </button>
                    <p className="text-xs text-surface-400 mt-3">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      {isTShirtsPrintsTemplate ? (
        <TShirtsPrintsFooter storeName={store.name} storeSlug={slug} logo={store.logo} />
      ) : isCosmeticsTemplate ? (
        <CosmeticsFooter
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          description={store.description}
        />
      ) : isHandmadeBagsTemplate ? (
        <HandmadeBagsFooter
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          description={store.description}
        />
      ) : (
      <footer className="bg-surface-900 text-surface-400 py-10 themed-footer">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-7 w-7 rounded-lg object-cover" />
            ) : (
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ShoppingBag className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <span className="font-display font-bold text-white">{store.name}</span>
          </div>
          <span className="flex items-center gap-1">
            &copy; {new Date().getFullYear()} {store.name}. Powered by <span className="font-semibold text-brand-400">AfroStore</span>
          </span>
        </div>
      </footer>
      )}

      {/* ── Compare floating bar ── */}
      {compareList.length > 0 && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-900 text-white rounded-full px-5 py-2.5 shadow-xl flex items-center gap-3 text-sm">
          <SlidersHorizontal className="h-4 w-4" />
          <span>{compareList.length} item{compareList.length > 1 ? "s" : ""} selected</span>
          <Link href={`/store/${slug}/compare`} className="bg-white text-surface-900 px-3 py-1 rounded-full text-xs font-semibold hover:bg-surface-100 transition-colors">Compare</Link>
          <button onClick={() => { setCompareList([]); localStorage.removeItem(compareKey); }} className="text-surface-400 hover:text-white ml-1"><X className="h-4 w-4" /></button>
        </div>
      )}
      {/* ── Mobile cart bar ── */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-200 shadow-2xl px-4 py-3 sm:hidden">
          <Link href={`/store/${slug}/cart`} className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            View Cart ({cartCount})
          </Link>
        </div>
      )}
    </div>
    </ThemeProvider>
  );
}
