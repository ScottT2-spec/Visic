"use client";
import { ArrowRight, ChevronRight, Loader2, X } from "lucide-react";
import { Heart, Menu, MessageCircle, Phone, Search, ShoppingBag, ShoppingCart } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RenderBlocks, type BuilderBlock, type StoreProduct } from "@/components/storefront/BlockRenderer";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { FashionFooter } from "@/components/storefront/FashionStoreChrome";
import { TShirtsPrintsFooter, TShirtsPrintsHeader } from "@/components/storefront/TShirtsPrintsStoreChrome";
import { TShirtsPrintsFontLoader } from "@/components/storefront/TShirtsPrintsTemplateBlocks";
import { parsePageContent, getLinkedPageHref } from "@/lib/page-content";
import { mergeBespokeTemplateBlocks } from "@/lib/templates/bespoke-page-content";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { useWishlist } from "@/hooks/useWishlist";
import { applyPageCustomization, buildPageBackgroundStyle, buildThemeDataWithCustomization, filterVisiblePages, getResolvedPageSettings, normalizeSiteCustomization, type SiteCustomizationDocument } from "@/lib/site-customization";
import { VegetableAboutPage, VegetableContactPage, VegetableMenuPage, VegetableRecipePage, VegetableReservationPage } from "@/components/storefront/VegetableTemplatePages";
import { VegetableFooter, VegetableHeader } from "@/components/storefront/VegetableStoreChrome";
import { KidsFontLoader, KidsFooterFull, KidsHeader } from "@/components/storefront/KidsTemplateBlocks";
import { PerfumesFontLoader, PerfumesFooter, PerfumesHeader } from "@/components/storefront/PerfumesTemplateBlocks";
import { HealthFontLoader, HealthHeader, HealthFooterFull } from "@/components/storefront/HealthTemplateBlocks";
import { CosmeticsFontLoader, CosmeticsHeader, CosmeticsFooter } from "@/components/storefront/CosmeticsTemplateBlocks";

/* ─── TYPES ─────────────────────────────────────────────────── */

interface PageData {
  store: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    currency: string;
    country: string;
    businessType: string;
  };
  page: {
    id: string;
    title: string;
    slug: string;
    type: string;
    content: unknown;
    metaTitle?: string;
    metaDescription?: string;
  };
  settings: {
    whatsappOrdering?: boolean;
    whatsappNumber?: string;
  };
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  products: StoreProduct[];
  blogs?: Array<{
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
  }>;
  categories: Array<{ id: string; name: string; slug: string; _count: { products: number } }>;
  deliveryZones: Array<{ id: string; name: string; fee: number; freeAbove?: number }>;
  pages: Array<{ id: string; title: string; slug: string; type: string }>;
  templateSlug: string | null;
  theme: ThemeData | null;
  customization?: SiteCustomizationDocument | null;
}

/* ─── HELPERS ───────────────────────────────────────────────── */

function formatCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/* ─── MAIN PAGE ─────────────────────────────────────────────── */

export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const pageSlug = params.pageSlug as string;

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draftCustomization, setDraftCustomization] = useState<SiteCustomizationDocument | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  // Cart state
  const cartKey = `afrostore_cart_${slug}`;
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number; product: StoreProduct }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; }
    } catch { /* ignore */ }
    return [];
  });

  const { isWishlisted, toggleWishlist, wishlistCount } = useWishlist(data?.store?.id || "");

  useEffect(() => {
    (async () => {
      try {
      const res = await fetch(`/api/storefront/${slug}/pages/${pageSlug}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setDraftCustomization(normalizeSiteCustomization(json.data.customization || null));
        const title = json.data.page.metaTitle || `${json.data.page.title} — ${json.data.store.name}`;
        document.title = title;
      } else {
          setError(json.error || "Page not found");
        }
      } catch {
        setError("Failed to load page");
      }
      setLoading(false);
    })();
  }, [slug, pageSlug]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data || event.data.type !== "afro-site-customization-preview") return;
      setDraftCustomization(normalizeSiteCustomization(event.data.customization || null));
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Persist cart
  useEffect(() => {
    if (data) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
      localStorage.setItem("afrostore_cart_active_slug", slug);
      localStorage.setItem("afrostore_siteId", data.store.id);
    }
  }, [cart, data, cartKey, slug]);

  const resolvedTheme = useMemo(() => buildThemeDataWithCustomization(data?.theme || null, draftCustomization), [data?.theme, draftCustomization]);

  const addToCart = useCallback((product: StoreProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, quantity: 1, product }];
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 1500);
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-surface-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <ShoppingBag className="h-12 w-12 text-surface-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Page not found</h1>
          <p className="text-surface-500 mb-6">{error || "This page doesn't exist."}</p>
          <Link
            href={`/store/${slug}`}
            className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm hover:text-brand-700"
          >
            <ArrowRight className="h-4 w-4 rotate-180" /> Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const { store, page, settings, socialLinks, products, categories, blogs = [] } = data;
  const currency = store.currency || "NGN";
  const whatsappNumber = settings?.whatsappNumber || socialLinks?.whatsapp;
  const resolvedPage = applyPageCustomization(page, draftCustomization);
  const parsedContent = parsePageContent(resolvedPage.content);
  const resolvedPageSettings = getResolvedPageSettings(resolvedPage, parsedContent.settings, draftCustomization);
  // Filter out chrome blocks (header/footer) from editable content - they're rendered via conditional rendering based on template
  const CHROME_BLOCK_TYPES = new Set([
    'perfumesHeader', 'perfumesFooter',
    'handmadeBagsHeader', 'handmadeBagsFooter',
    'cosmeticsHeader', 'cosmeticsFooter',
    'kidsHeader', 'kidsFooter', 'kidsFooterFull',
    'tShirtsPrintsHeader', 'tShirtsPrintsFooter',
    'fashionFooter', 'bakeryFooter', 'interiorFooter',
    'groceryFooter', 'healthFooterFull', 'healthFooter',
    'electronicsFooter', 'makeupFooter',
  ]);
  // Use parsed blocks if available; only fall back to template-specific page presets if original content was truly empty
  const parsedBlocks = parsedContent.blocks.filter((block) => !CHROME_BLOCK_TYPES.has(block.type));
  const hasOriginalBlocks = parsedContent.blocks.length > 0;
  const blocks: BuilderBlock[] = hasOriginalBlocks
    ? parsedBlocks
    : (mergeBespokeTemplateBlocks(data.templateSlug, pageSlug, resolvedPage.content, { pageSlug: pageSlug as string, pageTitle: resolvedPage.title, pageType: resolvedPage.type, templateSlug: data.templateSlug }) as unknown as BuilderBlock[]);
  const visiblePages = filterVisiblePages(data.pages, draftCustomization);
  const customizedPages = visiblePages.map((item) => applyPageCustomization(item, draftCustomization));

  // Navigation pages — exclude current page type HOME (we link to store root for that)
  const navPageOrder: Record<string, number> = { ABOUT: 0, FAQ: 1, CONTACT: 2, POLICY: 3, CUSTOM: 4, LANDING: 5 };
  const navPages = customizedPages
    .filter((p) => p.type !== "HOME")
    .sort((a, b) => (navPageOrder[a.type] ?? 99) - (navPageOrder[b.type] ?? 99));

  const isKidsTemplate = data.templateSlug === "kids" || slug === "kids" || data.store.slug === "kids" || data.store.name?.toLowerCase().includes("kids");
  const isTShirtsPrintsTemplate = data.templateSlug === "t-shirts-prints" || slug === "t-shirts-prints" || data.store.slug === "t-shirts-prints" || data.store.name?.toLowerCase().includes("t-shirts");
  const tshirtsSocialLinks = [
    ...(socialLinks?.facebook ? [{ label: "Facebook", href: socialLinks.facebook }] : []),
    ...(socialLinks?.twitter ? [{ label: "X (Twitter)", href: socialLinks.twitter }] : []),
    ...(socialLinks?.instagram ? [{ label: "Instagram", href: socialLinks.instagram }] : []),
    ...((socialLinks as any)?.youtube ? [{ label: "Youtube", href: (socialLinks as any).youtube }] : []),
  ];

  if (isTShirtsPrintsTemplate) {
    return (
      <ThemeProvider theme={resolvedTheme}>
        <div className="min-h-screen bg-white text-[#1d1d1d]" style={{ fontFamily: "'Manrope', Arial, sans-serif" }}>
          <TShirtsPrintsFontLoader />
          <TShirtsPrintsHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            <RenderTemplateBlocks blocks={blocks} />
          </main>
          <TShirtsPrintsFooter
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            socialLinks={[
              ...(socialLinks?.facebook ? [{ platform: "facebook", url: socialLinks.facebook }] : []),
              ...(socialLinks?.twitter ? [{ platform: "twitter", url: socialLinks.twitter }] : []),
              ...(socialLinks?.instagram ? [{ platform: "instagram", url: socialLinks.instagram }] : []),
              ...((socialLinks as any)?.youtube ? [{ platform: "youtube", url: (socialLinks as any).youtube }] : []),
            ]}
          />
        </div>
      </ThemeProvider>
    );
  }

  if (isKidsTemplate) {
    return (
      <ThemeProvider theme={resolvedTheme}>
        <div className="min-h-screen bg-[#fffef8] text-[#3b3344]">
          <KidsFontLoader />
          <KidsHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            templateSlug="kids"
            cartCount={cartCount}
            wishlistCount={wishlistCount}
          />
          <main>
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5857c]">Page</p>
                <h1 className="mt-3 font-serif text-4xl text-[#3b3344]">{resolvedPage.title}</h1>
              </div>
              <RenderBlocks blocks={blocks} storeSlug={slug} products={products} currency={currency} addToCart={(p) => addToCart(p as unknown as StoreProduct)} isWishlisted={isWishlisted} toggleWishlist={toggleWishlist} addedToCart={addedToCart} />
            </div>
          </main>
          <KidsFooterFull
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            templateSlug="kids"
            description={store.description || "Playful kidswear, gifts, and accessories with a premium WoodMart-inspired finish."}
          />
        </div>
      </ThemeProvider>
    );
  }

  const isPerfumesTemplate = data.templateSlug === "perfumes" || slug === "perfumes" || data.store.slug === "perfumes" || data.store.name?.toLowerCase().includes("perfumes");

  if (isPerfumesTemplate) {
    const perfumeCollectionSlugs = ["etheria", "celeste-aura", "opus-essence", "velours-noir", "nocturne-essence", "elysian-bloom"];
    const fallbackCollections = [
      { name: "Étheria", slug: "etheria" },
      { name: "Celeste Aura", slug: "celeste-aura" },
      { name: "Opus Essence", slug: "opus-essence" },
      { name: "Velours Noir", slug: "velours-noir" },
      { name: "Nocturne Essence", slug: "nocturne-essence" },
      { name: "Elysian Bloom", slug: "elysian-bloom" },
    ];
    const perfumeCollections = categories.filter((category) => perfumeCollectionSlugs.includes(category.slug));
    const renderedCollections = perfumeCollections.length > 0 ? perfumeCollections : fallbackCollections;
    const herCollections = renderedCollections.filter((category) => ["etheria", "celeste-aura", "opus-essence"].includes(category.slug));
    const himCollections = renderedCollections.filter((category) => ["velours-noir", "nocturne-essence", "elysian-bloom"].includes(category.slug));
    const pageBody = (() => {
      switch (pageSlug) {
        case "fragrances":
          return (
            <main>
              <section className="bg-[#f6f0eb] px-4 py-16">
                <div className="mx-auto max-w-6xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b6798]">Fragrances</p>
                  <h1 className="mt-4 font-serif text-4xl text-[#241f24] sm:text-5xl">Fragrances</h1>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-[#6f6573]">
                    Explore the collection structure exactly as presented in the reference storefront.
                  </p>
                </div>
              </section>
              <section className="px-4 pb-12">
                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
                  <article className="rounded-[32px] bg-white p-6 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                    <h2 className="font-serif text-2xl text-[#241f24]">Collections for Her</h2>
                    <div className="mt-4 grid gap-3">
                      {herCollections.map((collection) => (
                        <Link key={collection.slug} href={`/store/${slug}/shop?category=${collection.slug}`} className="rounded-2xl border border-[#eee4de] bg-[#fcfaf8] px-4 py-3 text-sm font-semibold text-[#241f24]">
                          {collection.name}
                        </Link>
                      ))}
                    </div>
                  </article>
                  <article className="rounded-[32px] bg-white p-6 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                    <h2 className="font-serif text-2xl text-[#241f24]">Collections for Him</h2>
                    <div className="mt-4 grid gap-3">
                      {himCollections.map((collection) => (
                        <Link key={collection.slug} href={`/store/${slug}/shop?category=${collection.slug}`} className="rounded-2xl border border-[#eee4de] bg-[#fcfaf8] px-4 py-3 text-sm font-semibold text-[#241f24]">
                          {collection.name}
                        </Link>
                      ))}
                    </div>
                  </article>
                  <article className="rounded-[32px] bg-[#1a1a1a] px-6 py-8 text-white shadow-[0_20px_50px_rgba(47,34,46,0.08)]">
                    <h2 className="font-serif text-3xl">Opus Essence</h2>
                    <p className="mt-3 text-sm leading-7 text-white/85">
                      A collection of delicate, weightless fragrances that capture the essence of air and light. Soft florals, sheer musks, and dewy accords.
                    </p>
                    <Link href={`/store/${slug}/shop?category=opus-essence`} className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#111]">
                      View Collection
                    </Link>
                  </article>
                </div>
              </section>
              <section className="px-4 pb-16">
                <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {perfumeCollections.map((collection) => {
                    const categoryProducts = products.filter((product) => product.category?.slug === collection.slug).slice(0, 3);
                    const collectionDescription = categoryProducts[0]?.description || "";
                    return (
                      <article key={collection.slug} className="rounded-[32px] bg-white p-6 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b6798]">Collection</p>
                        <h3 className="mt-3 font-serif text-3xl text-[#241f24]">{collection.name}</h3>
                        <p className="mt-4 text-sm leading-7 text-[#6f6573]">{collectionDescription}</p>
                        <div className="mt-6 grid gap-3">
                          {categoryProducts.map((product) => (
                            <Link key={product.id} href={`/store/${slug}/product/${product.slug}`} className="flex items-center justify-between rounded-2xl border border-[#eee4de] bg-[#fcfaf8] px-4 py-3 text-sm font-medium text-[#241f24]">
                              <span>{product.name}</span>
                              <span>{formatCurrency(Number(product.price), currency)}</span>
                            </Link>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </main>
          );
        case "journal":
          return (
            <main className="px-4 py-16">
              <div className="mx-auto max-w-6xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b6798]">Journal</p>
                <h1 className="mt-4 font-serif text-4xl text-[#241f24] sm:text-5xl">Journal</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-[#6f6573]">
                  Stories, rituals, and editorial notes from the Perfumes collection.
                </p>
                <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {blogs.map((blog) => (
                    <article key={blog.id} className="overflow-hidden rounded-[30px] bg-white shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                      <div className="aspect-[4/3] overflow-hidden bg-[#efe7ea]">
                        {blog.coverImage ? <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="p-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-[#8b6798]">{blog.category || "Journal"}</p>
                        <h2 className="mt-3 font-serif text-2xl text-[#241f24]">{blog.title}</h2>
                        <p className="mt-3 text-sm leading-7 text-[#6f6573]">{blog.excerpt || ""}</p>
                        <Link href={`/store/${slug}/blog/${blog.slug}`} className="mt-4 inline-flex text-sm font-semibold text-[#8b6798]">
                          Read article
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </main>
          );
        case "about-us":
          return (
            <main className="px-4 py-16">
              <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b6798]">About Us</p>
                  <h1 className="mt-4 font-serif text-4xl leading-tight text-[#241f24] sm:text-5xl">Our approach to fragrance is emotional, not decorative.</h1>
                  <p className="mt-6 text-base leading-8 text-[#6f6573]">
                    Perfume is memory, identity, and atmosphere captured in a bottle. We build collections that feel editorial, tactile, and deeply personal.
                  </p>
                  <p className="mt-4 text-base leading-8 text-[#6f6573]">
                    Every scent collection is designed to remain editable for merchants while preserving the structure from the reference site.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <img src="https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-collection-opus-essence.jpg" alt="Perfumes collection" className="h-full w-full rounded-[28px] object-cover" />
                  <div className="grid gap-4">
                    <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b6798]">Collections</p>
                      <p className="mt-3 text-sm leading-7 text-[#6f6573]">Étheria, Celeste Aura, Opus Essence, Velours Noir, Nocturne Essence, and Elysian Bloom.</p>
                    </div>
                    <div className="rounded-[28px] bg-[#1a1a1a] p-6 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Contact</p>
                      <p className="mt-3 text-sm leading-7 text-white/80">Use Contact Us or FAQ for direct help and store support.</p>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          );
        case "contact-us":
          return (
            <main className="px-4 py-16">
              <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b6798]">Contact Us</p>
                  <h1 className="mt-4 font-serif text-4xl text-[#241f24]">Get in touch</h1>
                  <p className="mt-4 text-base leading-8 text-[#6f6573]">
                    Reach out for product guidance, store support, or collection inquiries.
                  </p>
                  <div className="mt-8 space-y-3 text-sm text-[#6f6573]">
                    <p>Call Us: (064) 332-1233</p>
                    <p>Hours: 9:00am - 5:00pm</p>
                    <p>Monday - Friday</p>
                  </div>
                </div>
                <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_50px_rgba(47,34,46,0.05)]">
                  <form className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none" placeholder="Your name" />
                      <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none" placeholder="Email address" />
                    </div>
                    <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none" placeholder="Subject" />
                    <textarea className="min-h-[180px] rounded-[24px] border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none" placeholder="How can we help?" />
                    <button type="button" className="inline-flex items-center justify-center rounded-full bg-[#8b6798] px-6 py-3 text-sm font-semibold text-white">
                      Send message
                    </button>
                  </form>
                </div>
              </div>
            </main>
          );
        default:
          return (
            <main className="px-4 py-16">
              <div className="mx-auto max-w-4xl">
                <h1 className="font-serif text-4xl text-[#241f24]">{resolvedPage.title}</h1>
                <RenderBlocks blocks={blocks} storeSlug={slug} products={products} currency={currency} addToCart={(p) => addToCart(p as unknown as StoreProduct)} isWishlisted={isWishlisted} toggleWishlist={toggleWishlist} addedToCart={addedToCart} />
              </div>
            </main>
          );
      }
    })();

    return (
      <ThemeProvider theme={resolvedTheme}>
        <div className="min-h-screen bg-[#f6f0eb] text-[#241f24]">
          <PerfumesFontLoader />
          <PerfumesHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            categories={categories}
            cartCount={cartCount}
            wishlistCount={wishlistCount}
          />
          {pageBody}
          <PerfumesFooter
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            description={store.description || "Discover a curated collection of modern fragrances designed to hold memory, emotion, and identity in every bottle."}
          />
        </div>
      </ThemeProvider>
    );
  }

  // ─── COSMETICS PAGES ───
  const isCosmeticsTemplate =
    data.templateSlug === "cosmetics" ||
    slug === "cosmetics" ||
    data.store.slug === "cosmetics" ||
    data.store.name?.toLowerCase().includes("cosmetics");

  if (isCosmeticsTemplate) {
    return (
      <ThemeProvider theme={resolvedTheme}>
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Lato', Arial, sans-serif" }}>
          <CosmeticsFontLoader />
          <CosmeticsHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            cartCount={0}
            wishlistCount={0}
          />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            <RenderBlocks
              blocks={blocks}
              storeSlug={slug}
              products={products}
              currency={currency}
              addToCart={(p) => addToCart(p as unknown as StoreProduct)}
              isWishlisted={isWishlisted}
              toggleWishlist={toggleWishlist}
              addedToCart={addedToCart}
            />
          </main>
          <CosmeticsFooter
            storeName={store.name}
            storeSlug={slug}
            description={store.description}
            contactInfo={{
              address: (store as any).address,
              phone: (store as any).phone,
              email: (store as any).email,
            }}
            socialLinks={[
              ...(socialLinks?.facebook ? [{ platform: "facebook", url: socialLinks.facebook }] : []),
              ...(socialLinks?.instagram ? [{ platform: "instagram", url: socialLinks.instagram }] : []),
              ...(socialLinks?.twitter ? [{ platform: "twitter", url: socialLinks.twitter }] : []),
            ]}
          />
        </div>
      </ThemeProvider>
    );
  }

  // ─── HEALTH / PILLS PAGES ───
  const isHealthTemplate =
    data.templateSlug === "pills" ||
    slug === "pills" ||
    data.store.slug === "pills" ||
    data.store.name?.toLowerCase().includes("pill") ||
    data.store.name?.toLowerCase().includes("supplement") ||
    data.store.name?.toLowerCase().includes("health");

  if (isHealthTemplate) {
    if (pageSlug === "about-us") {
      return (
        <div className="min-h-screen bg-white text-[#333]" style={{ fontFamily: "'Cabin', Arial, sans-serif" }}>
          <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600;700;800&family=Cabin:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <HealthHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
          <main>
            <section style={{ background: "linear-gradient(135deg, #f0f5f2 0%, #fff 50%, #f7f7f7 100%)" }}>
              <div style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px 80px", textAlign: "center" }}>
                <h1 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "48px", fontWeight: 700, color: "#333", marginBottom: "24px" }}>About Us</h1>
                <h2 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "28px", fontWeight: 600, color: "#333", maxWidth: "700px", margin: "0 auto 20px" }}>
                  Our Company&apos;s Goal Is to Make You Healthy
                </h2>
                <p style={{ fontSize: "16px", lineHeight: "1.8", color: "#777", maxWidth: "720px", margin: "0 auto 30px" }}>
                  The best vitamins and supplements are often backed by scientific research and manufactured by reputable companies. They can play a valuable role in filling nutritional gaps and supporting optimal health when used as part.
                </p>
              </div>
            </section>
            <section style={{ maxWidth: "1222px", margin: "-40px auto 0", padding: "0 15px 60px", position: "relative", zIndex: 1 }}>
              <div style={{ borderRadius: "15px", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}>
                <img src="https://woodmart.xtemos.com/pills/wp-content/uploads/sites/15/2023/09/w-pas-video-placehollder.jpg" alt="About video" style={{ width: "100%", display: "block" }} />
              </div>
            </section>
            <section style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px" }}>
              <h2 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "32px", fontWeight: 700, color: "#333", textAlign: "center", marginBottom: "48px" }}>Company Values</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px" }}>
                {[
                  { title: "Focus on the Consumer", text: "Anyway, you still use Lorem Ipsum and rightly so, as it will always have a place in the web workers toolbox, as things happen, not always the way you like it, not always in the preferred order." },
                  { title: "Maintain the Highest Standards", text: "No typography, no colors, no layout, no styles, all those things that convey the important signals that go beyond the mere textual, hierarchies of information, weight, emphasis." },
                  { title: "Continuous Improvement", text: "That's not so bad, there's dummy copy to the rescue. But worse, what if the fish doesn't fit in the can, the foot's too big for the boot? Or too small?" },
                  { title: "Consumer Confidence", text: "The best vitamins and supplements are often backed by scientific research and manufactured by reputable companies. They can play a valuable role in filling nutritional gaps." },
                ].map((v) => (
                  <div key={v.title} style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                    <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "12px" }}>{v.title}</h3>
                    <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777" }}>{v.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
          <HealthFooterFull storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description || "Your trusted source for vitamins, supplements, and wellness products."} contact={{ address: "1901 Thornridge Cir. Shiloh, Hawaii 81063", phone: "(956) 238-7908", email: "hello@store.com" }} />
        </div>
      );
    }

    if (pageSlug === "contact-us") {
      return (
        <div className="min-h-screen bg-white text-[#333]" style={{ fontFamily: "'Cabin', Arial, sans-serif" }}>
          <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600;700;800&family=Cabin:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <HealthHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
          <main>
            <section style={{ background: "linear-gradient(135deg, #f0f5f2 0%, #fff 50%, #f7f7f7 100%)" }}>
              <div style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px 80px", textAlign: "center" }}>
                <h1 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "48px", fontWeight: 700, color: "#333", marginBottom: "24px" }}>Contact Us</h1>
                <p style={{ fontSize: "16px", lineHeight: "1.8", color: "#777", maxWidth: "720px", margin: "0 auto" }}>
                  Have questions about our products? We&apos;re here to help you find the right supplements for your wellness journey.
                </p>
              </div>
            </section>
            <section style={{ maxWidth: "1222px", margin: "0 auto", padding: "0 15px 60px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
                <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "40px" }}>
                  <h2 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "24px", fontWeight: 700, color: "#333", marginBottom: "24px" }}>Get in Touch</h2>
                  <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <input style={{ padding: "14px 18px", borderRadius: "10px", border: "1px solid #e0e0e0", fontSize: "14px", background: "#fff" }} placeholder="Your name" />
                    <input style={{ padding: "14px 18px", borderRadius: "10px", border: "1px solid #e0e0e0", fontSize: "14px", background: "#fff" }} placeholder="Email address" />
                    <input style={{ padding: "14px 18px", borderRadius: "10px", border: "1px solid #e0e0e0", fontSize: "14px", background: "#fff" }} placeholder="Subject" />
                    <textarea style={{ padding: "14px 18px", borderRadius: "10px", border: "1px solid #e0e0e0", fontSize: "14px", background: "#fff", minHeight: "140px", resize: "vertical" }} placeholder="How can we help?" />
                    <button type="button" style={{ padding: "14px 28px", borderRadius: "10px", background: "#6dab3c", color: "#fff", fontWeight: 600, fontSize: "14px", border: "none", cursor: "pointer" }}>Send Message</button>
                  </form>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                    <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "12px" }}>Address</h3>
                    <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777" }}>1901 Thornridge Cir. Shiloh, Hawaii 81063</p>
                  </div>
                  <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                    <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "12px" }}>Phone</h3>
                    <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777" }}>(956) 238-7908</p>
                  </div>
                  <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                    <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "12px" }}>Email</h3>
                    <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777" }}>hello@store.com</p>
                  </div>
                  <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                    <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "12px" }}>Hours</h3>
                    <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777" }}>Monday - Friday: 9:00am - 5:00pm</p>
                  </div>
                </div>
              </div>
            </section>
          </main>
          <HealthFooterFull storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description || "Your trusted source for vitamins, supplements, and wellness products."} contact={{ address: "1901 Thornridge Cir. Shiloh, Hawaii 81063", phone: "(956) 238-7908", email: "hello@store.com" }} />
        </div>
      );
    }

    // Generic Health page (catch-all)
    return (
      <div className="min-h-screen bg-white text-[#333]" style={{ fontFamily: "'Cabin', Arial, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600;700;800&family=Cabin:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <HealthHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
        <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
          <div style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.35em", color: "#6dab3c", marginBottom: "12px" }}>Page</p>
            <h1 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "40px", fontWeight: 700, color: "#333", marginBottom: "32px" }}>{resolvedPage.title}</h1>
            <RenderBlocks blocks={blocks} storeSlug={slug} products={products} currency={currency} addToCart={(p) => addToCart(p as unknown as StoreProduct)} isWishlisted={isWishlisted} toggleWishlist={toggleWishlist} addedToCart={addedToCart} />
          </div>
        </main>
        <HealthFooterFull storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description || "Your trusted source for vitamins, supplements, and wellness products."} contact={{ address: "1901 Thornridge Cir. Shiloh, Hawaii 81063", phone: "(956) 238-7908", email: "hello@store.com" }} />
      </div>
    );
  }

  if (data.templateSlug === "vegetables") {
    const vegetableNavItems = [
      { label: "Home", href: `/store/${slug}` },
      { label: "Menu", href: `/store/${slug}/menu` },
      { label: "Recipe", href: `/store/${slug}/recipe` },
      { label: "About", href: `/store/${slug}/about` },
      { label: "Contact", href: `/store/${slug}/contact` },
    ];
    const vegetableSocialLinks = [
      ...(socialLinks?.facebook ? [{ platform: "facebook", url: socialLinks.facebook }] : []),
      ...(socialLinks?.instagram ? [{ platform: "instagram", url: socialLinks.instagram }] : []),
      ...(socialLinks?.twitter ? [{ platform: "twitter", url: socialLinks.twitter }] : []),
      ...(socialLinks?.tiktok ? [{ platform: "tiktok", url: socialLinks.tiktok }] : []),
    ];

    // Use block-based rendering for all vegetables pages to enable editor persistence
    return (
      <ThemeProvider theme={resolvedTheme}>
        <div className="min-h-screen bg-[#fffdf7] text-[#243226]">
          <VegetableHeader
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            navItems={vegetableNavItems}
            reservationHref={`/store/${slug}/reservation`}
          />
          <main style={buildPageBackgroundStyle(resolvedPageSettings)}>
            <RenderTemplateBlocks blocks={blocks} />
          </main>
          <VegetableFooter
            storeName={store.name}
            storeSlug={slug}
            logo={store.logo}
            description={store.description}
            navItems={vegetableNavItems}
            socialLinks={vegetableSocialLinks}
          />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={resolvedTheme}>
    <div className="min-h-screen bg-white">
      {/* Announcement Bar — same as store homepage */}
      <div className="bg-brand-600 text-white text-center py-2 text-xs font-medium">
        <div className="flex items-center justify-center gap-2">
          Welcome to {store.name}
        </div>
      </div>

      {/* Store Nav — identical to store homepage */}
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
            <Link href={`/store/${slug}/shop`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Shop</Link>
            <Link href={`/store/${slug}/reviews`} className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">Reviews</Link>
            {navPages.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={getLinkedPageHref(p as { slug: string; template?: string | null }, slug)}
                className={`text-sm font-medium transition-colors ${p.slug === pageSlug ? "text-brand-700 font-bold" : "text-surface-600 hover:text-surface-900"}`}
              >
                {p.title}
              </Link>
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
      </header>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="sm:hidden bg-white border-b border-surface-200 px-4 py-4 space-y-2">
          <Link href={`/store/${slug}`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Home</Link>
          <Link href={`/store/${slug}/shop`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Shop</Link>
          <Link href={`/store/${slug}/reviews`} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-surface-600 py-2">Reviews</Link>
          {navPages.map((p) => (
            <Link
              key={p.id}
              href={getLinkedPageHref(p as { slug: string; template?: string | null }, slug)}
              onClick={() => setMobileMenu(false)}
              className={`block text-sm font-medium py-2 ${p.slug === pageSlug ? "text-brand-700 font-bold" : "text-surface-600"}`}
            >
              {p.title}
            </Link>
          ))}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-surface-400">
          <Link href={`/store/${slug}`} className="hover:text-surface-600 transition-colors">{store.name}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-surface-700 font-medium">{resolvedPage.title}</span>
        </nav>
      </div>

      {/* Page content — full width like homepage, blocks define their own max-width */}
      <main
        className="relative overflow-hidden"
        style={buildPageBackgroundStyle(resolvedPageSettings)}
      >
        {resolvedPageSettings.backgroundImage && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: String(resolvedPageSettings.overlayColor || "#000000"),
              opacity: Number(resolvedPageSettings.overlayOpacity ?? 0.25),
            }}
          />
        )}
        {resolvedPageSettings.backgroundColor && (
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: String(resolvedPageSettings.backgroundColor) }} />
        )}
        {blocks.length === 0 ? (
          <div className="text-center py-20 relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            <ShoppingBag className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-surface-900 mb-2">{page.title}</h1>
            <p className="text-surface-400">This page has no content yet.</p>
          </div>
        ) : (
          <div className="relative z-10">
            <RenderBlocks
              blocks={blocks}
              storeSlug={slug}
              products={products}
              currency={currency}
              addToCart={addToCart}
              isWishlisted={isWishlisted}
              toggleWishlist={toggleWishlist}
              addedToCart={addedToCart}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <FashionFooter
        storeName={store.name}
        storeSlug={slug}
        logo={store.logo}
        navPages={navPages}
        description={store.description}
        socialLinks={[
          ...(socialLinks?.facebook ? [{ platform: "facebook", url: socialLinks.facebook }] : []),
          ...(socialLinks?.instagram ? [{ platform: "instagram", url: socialLinks.instagram }] : []),
          ...(socialLinks?.twitter ? [{ platform: "twitter", url: socialLinks.twitter }] : []),
        ]}
        contactInfo={{
          phone: whatsappNumber || undefined,
          email: undefined,
        }}
      />

      {/* Floating WhatsApp */}
      {settings?.whatsappOrdering && whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/30 hover:bg-green-600 hover:scale-110 transition-all"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
    </div>
    </ThemeProvider>
  );
}
