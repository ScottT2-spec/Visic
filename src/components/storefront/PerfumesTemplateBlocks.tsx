"use client";
import { ChevronDown, Menu, Search, Heart, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { safeSrc, onImgError } from "./image-fallback";

/* ═══════════════════════════════════════════════════════════════
   PERFUMES TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Perfumes template sections.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "var(--color-primary)",
  primaryHover: "var(--color-primary)", // Will use CSS filter for hover effect
  accentColor: "var(--color-accent)",
  titleColor: "var(--color-text)",
  textColor: "var(--color-muted-text)",
  entityTitleColor: "var(--color-text)",
  linkColor: "var(--color-text)",
  starColor: "var(--color-accent)",
  footerBg: "var(--color-background)",
  containerWidth: "1320px",
  borderRadius: "0px",
  titleFont: "'Cormorant Garamond', Georgia, serif",
  bodyFont: "'Inter', Arial, Helvetica, sans-serif",
};

const IMG_BASE = "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32";

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function PerfumesFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    `}} />
  );
}

/* ─── SHARED STYLES ─────────────────────────────────────────── */
const containerStyle: React.CSSProperties = {
  maxWidth: TOKENS.containerWidth,
  margin: "0 auto",
  padding: "0 15px",
  boxSizing: "border-box" as const,
  width: "100%",
};

/* ─── SCOPED STYLE INJECTOR ─────────────────────────────────── */
function ScopedStyles({ id, css }: { id: string; css: string }) {
  return <style data-perfumes-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
}

/* ─── useInView HOOK ────────────────────────────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── STORE CONTEXT ─────────────────────────────────────────── */

export interface PerfumesProduct {
  id: string;
  name: string;
  category?: string;
  categoryLink?: string;
  price: string;
  salePrice?: string;
  image: string;
  hoverImage?: string;
  link: string;
  badge?: string;
}

export interface PerfumesStoreContextData {
  products: Array<{
    id: string; name: string; slug: string; price: number; compareAtPrice?: number;
    currency: string; inStock: boolean; isFeatured: boolean; tags?: string[];
    images: Array<{ id: string; url: string; alt?: string }>;
    category?: { id: string; name: string; slug: string };
  }>;
  categories?: Array<{
    id?: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
  }>;
  blogs: Array<{
    id: string; title: string; slug: string; excerpt?: string | null;
    coverImage?: string | null; author?: string | null; category?: string | null;
    tags: string[]; publishedAt?: string | null; createdAt: string;
  }>;
  currency: string;
  storeSlug: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  addToCart?: (productId: string, quantity?: number) => void;
  toggleWishlist?: (productId: string) => void;
  isWishlisted?: (productId: string) => boolean;
  onQuickView?: (productId: string) => void;
}
export const PerfumesStoreContext = createContext<PerfumesStoreContextData | null>(null);

type PerfumeCategoryData = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
};

const PERFUME_COLLECTIONS = {
  her: [
    { name: "Étheria", slug: "etheria" },
    { name: "Celeste Aura", slug: "celeste-aura" },
    { name: "Opus Essence", slug: "opus-essence" },
  ],
  him: [
    { name: "Velours Noir", slug: "velours-noir" },
    { name: "Nocturne Essence", slug: "nocturne-essence" },
    { name: "Elysian Bloom", slug: "elysian-bloom" },
  ],
};

function usePerfumeCollections(storeCtx: PerfumesStoreContextData | null, categoryOverrides?: PerfumeCategoryData[]) {
  const overrideCategories = (categoryOverrides || storeCtx?.categories || []).map((category) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
  }));

  const perfumeSlugs = [...PERFUME_COLLECTIONS.her, ...PERFUME_COLLECTIONS.him].map((item) => item.slug);
  const hasPerfumeOverrides = overrideCategories.some((category) => perfumeSlugs.includes(category.slug));
  const sourceCategories = hasPerfumeOverrides ? overrideCategories : [...PERFUME_COLLECTIONS.her, ...PERFUME_COLLECTIONS.him];
  const lookup = new Map(sourceCategories.map((category) => [category.slug, category]));
  const her = PERFUME_COLLECTIONS.her.map((item) => lookup.get(item.slug) || item);
  const him = PERFUME_COLLECTIONS.him.map((item) => lookup.get(item.slug) || item);
  const all = [...her, ...him];

  return { her, him, all };
}

export interface PerfumesHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  categories?: PerfumeCategoryData[];
  cartCount?: number;
  wishlistCount?: number;
}

export function PerfumesHeader({ storeName, storeSlug, logo, categories, cartCount = 0, wishlistCount = 0 }: PerfumesHeaderProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const { her, him, all } = usePerfumeCollections(storeCtx, categories);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const navItems = [
    { label: "Home", href: `/store/${storeSlug}` },
    { label: "Fragrances", href: `/store/${storeSlug}/fragrances`, dropdown: true },
    { label: "Journal", href: `/store/${storeSlug}/journal` },
    { label: "About Us", href: `/store/${storeSlug}/about-us` },
    { label: "Contact Us", href: `/store/${storeSlug}/contact-us` },
    { label: "FAQ", href: `/store/${storeSlug}/contact-us` },
  ];

  const goToSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchValue.trim();
    router.push(query ? `/store/${storeSlug}/shop?search=${encodeURIComponent(query)}` : `/store/${storeSlug}/shop`);
    setSearchOpen(false);
  };

  const collectionLink = (slug: string) => `/store/${storeSlug}/shop?category=${slug}`;

  const headerCss = `
    .phx-header {
      position: sticky; top: 0; z-index: 40;
      background: rgba(10, 10, 12, 0.96);
      backdrop-filter: blur(14px);
      color: #fff;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .phx-shell {
      max-width: 1320px; margin: 0 auto; padding: 18px 15px;
      display: grid; grid-template-columns: auto 1fr auto; gap: 24px; align-items: center;
    }
    .phx-logo {
      display: inline-flex; align-items: center; gap: 12px; color: inherit; text-decoration: none;
    }
    .phx-logo img { display: block; width: auto; height: 30px; max-width: 220px; object-fit: contain; }
    .phx-brand {
      font-family: ${TOKENS.titleFont}; font-size: 18px; letter-spacing: 0.12em; text-transform: uppercase;
      white-space: nowrap;
    }
    .phx-nav {
      display: flex; align-items: center; justify-content: center; gap: 28px;
    }
    .phx-nav-item {
      position: relative; display: inline-flex; align-items: center; gap: 6px;
      color: #fff; text-decoration: none; font-family: ${TOKENS.bodyFont}; font-size: 14px; font-weight: 600;
      letter-spacing: 0.04em; text-transform: capitalize;
    }
    .phx-nav-item:hover { color: rgba(255,255,255,0.82); }
    .phx-fragrances:hover .phx-dropdown,
    .phx-fragrances:focus-within .phx-dropdown { opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto; }
    .phx-dropdown {
      position: absolute; top: calc(100% + 18px); left: 50%; transform: translateX(-50%) translateY(10px);
      width: min(1060px, calc(100vw - 30px)); padding: 26px;
      background: #111; color: #fff; border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 24px 80px rgba(0,0,0,0.36); opacity: 0; visibility: hidden; pointer-events: none;
      transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
    }
    .phx-dropdown-grid {
      display: grid; grid-template-columns: 1.05fr 1.05fr 1.2fr; gap: 24px; align-items: stretch;
    }
    .phx-dropdown-group h3 {
      margin: 0 0 18px; font-family: ${TOKENS.titleFont}; font-size: 20px; font-weight: 600;
    }
    .phx-dropdown-list { display: grid; gap: 10px; }
    .phx-dropdown-link {
      color: #fff; text-decoration: none; font-family: ${TOKENS.bodyFont}; font-size: 15px;
      transition: opacity 0.15s ease;
    }
    .phx-dropdown-link:hover { opacity: 0.72; }
    .phx-dropdown-feature {
      position: relative; min-height: 300px; display: flex; align-items: flex-end; padding: 28px; overflow: hidden;
      background: #2a2028 center/cover no-repeat;
    }
    .phx-dropdown-feature::before {
      content: ""; position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.58), rgba(0,0,0,0.1));
    }
    .phx-dropdown-feature-content { position: relative; z-index: 1; max-width: 340px; }
    .phx-dropdown-feature h3 { margin: 0 0 10px; font-family: ${TOKENS.titleFont}; font-size: 42px; font-weight: 600; }
    .phx-dropdown-feature p { margin: 0; color: rgba(255,255,255,0.88); line-height: 1.7; font-size: 15px; }
    .phx-actions { display: flex; align-items: center; justify-content: flex-end; gap: 14px; }
    .phx-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 42px; height: 42px; color: #fff; text-decoration: none;
      border: 1px solid rgba(255,255,255,0.12); border-radius: 999px;
      background: rgba(255,255,255,0.04); transition: background 0.15s ease, transform 0.15s ease;
    }
    .phx-icon:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }
    .phx-icon svg { width: 18px; height: 18px; }
    .phx-badge {
      position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; padding: 0 5px;
      border-radius: 999px; background: #fff; color: #111; font-size: 10px; font-weight: 700;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .phx-search {
      position: absolute; right: 0; top: calc(100% + 16px); width: min(360px, calc(100vw - 30px));
      background: #111; border: 1px solid rgba(255,255,255,0.1); padding: 14px; box-shadow: 0 18px 50px rgba(0,0,0,0.28);
    }
    .phx-search form { display: flex; gap: 10px; }
    .phx-search input {
      flex: 1; min-width: 0; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
      color: #fff; padding: 12px 14px; font-family: ${TOKENS.bodyFont}; font-size: 14px;
    }
    .phx-search input::placeholder { color: rgba(255,255,255,0.48); }
    .phx-search button {
      background: #fff; border: 0; color: #111; font-weight: 700; padding: 12px 16px;
      font-family: ${TOKENS.bodyFont}; cursor: pointer;
    }
    .phx-mobile-toggle { display: none; }
    .phx-mobile-panel {
      display: none; padding: 0 15px 18px; border-top: 1px solid rgba(255,255,255,0.08);
    }
    .phx-mobile-links { display: grid; gap: 8px; padding-top: 16px; }
    .phx-mobile-link { color: #fff; text-decoration: none; font-family: ${TOKENS.bodyFont}; font-size: 15px; }
    .phx-mobile-dropdown { display: grid; gap: 10px; padding-left: 14px; margin-top: 10px; }
    @media (max-width: 1100px) {
      .phx-shell { grid-template-columns: auto auto; }
      .phx-nav, .phx-actions { display: none; }
      .phx-mobile-toggle { display: inline-flex; width: 42px; height: 42px; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: #fff; }
      .phx-mobile-panel { display: ${mobileMenu ? "block" : "none"}; }
    }
    @media (max-width: 767px) {
      .phx-shell { grid-template-columns: 1fr auto; gap: 14px; }
      .phx-brand { display: none; }
      .phx-search { left: 0; right: auto; width: min(100%, calc(100vw - 30px)); }
      .phx-dropdown { width: calc(100vw - 30px); padding: 18px; }
      .phx-dropdown-grid { grid-template-columns: 1fr; }
      .phx-dropdown-feature { min-height: 220px; }
      .phx-dropdown-feature h3 { font-size: 30px; }
    }
  `;

  return (
    <header className="phx-header">
      <ScopedStyles id="header" css={headerCss} />
      <div className="phx-shell">
        <Link href={`/store/${storeSlug}`} className="phx-logo" aria-label={storeName}>
          {logo ? <img src={logo} alt={storeName} /> : <span className="phx-brand">{storeName}</span>}
        </Link>

        <nav className="phx-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <div key={item.label} className={item.dropdown ? "phx-fragrances" : ""}>
              <Link href={item.href} className="phx-nav-item">
                {item.label}
                {item.dropdown && <ChevronDown className="h-3.5 w-3.5" />}
              </Link>
              {item.dropdown && (
                <div className="phx-dropdown" role="menu" aria-label="Fragrances dropdown">
                  <div className="phx-dropdown-grid">
                    <div className="phx-dropdown-group">
                      <h3>Collections for Her</h3>
                      <div className="phx-dropdown-list">
                        {her.map((collection) => (
                          <Link key={collection.slug} href={collectionLink(collection.slug)} className="phx-dropdown-link">
                            {collection.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="phx-dropdown-group">
                      <h3>Collections for Him</h3>
                      <div className="phx-dropdown-list">
                        {him.map((collection) => (
                          <Link key={collection.slug} href={collectionLink(collection.slug)} className="phx-dropdown-link">
                            {collection.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="phx-dropdown-feature" style={{ backgroundImage: "url(https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-collection-opus-essence.jpg)" }}>
                      <div className="phx-dropdown-feature-content">
                        <h3>Opus Essence</h3>
                        <p>A collection of delicate, weightless fragrances that capture the essence of air and light. Soft florals, sheer musks, and dewy accords.</p>
                        <div style={{ marginTop: 18 }}>
                          <Link href={collectionLink("opus-essence")} className="phx-dropdown-link">
                            View collection
                          </Link>
                        </div>
                        <div style={{ marginTop: 16 }}>
                          <div className="phx-dropdown-list">
                            {all.map((collection) => (
                              <Link key={`all-${collection.slug}`} href={collectionLink(collection.slug)} className="phx-dropdown-link">
                                {collection.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="phx-actions">
          <button className="phx-icon" type="button" aria-label="Search" onClick={() => setSearchOpen((value) => !value)}>
            <Search />
          </button>
          <Link href={`/store/${storeSlug}/wishlist`} className="phx-icon" aria-label="Wishlist">
            <Heart />
            {wishlistCount > 0 && <span className="phx-badge">{wishlistCount}</span>}
          </Link>
          <Link href={`/store/${storeSlug}/cart`} className="phx-icon" aria-label="Cart">
            <ShoppingCart />
            {cartCount > 0 && <span className="phx-badge">{cartCount}</span>}
          </Link>
        </div>

        <button className="phx-mobile-toggle" type="button" aria-label="Toggle navigation" onClick={() => setMobileMenu((value) => !value)}>
          <Menu className="h-5 w-5" />
        </button>

        {searchOpen && (
          <div className="phx-search">
            <form onSubmit={goToSearch}>
              <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search for products" />
              <button type="submit">Search</button>
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" style={{ background: "transparent", color: "#fff", border: 0, padding: "0 6px" }}>
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="phx-mobile-panel">
        <div className="phx-mobile-links">
          {navItems.map((item) => (
            <div key={item.label}>
              <Link href={item.href} className="phx-mobile-link">
                {item.label}
              </Link>
              {item.dropdown && (
                <div className="phx-mobile-dropdown">
                  {[...all].map((collection) => (
                    <Link key={`mobile-${collection.slug}-${collection.name}`} href={collectionLink(collection.slug)} className="phx-mobile-link">
                      {collection.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. PERFUMES HERO SLIDER
   Full-viewport slides with solid color backgrounds, centered
   bottle image, large serif title, "Buy now" CTA. Numbered pagination.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesHeroSlide {
  title: string;
  bottleImage: string;
  backgroundImage?: string;
  backgroundColor: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle?: "primary" | "black";
}

export interface PerfumesHeroSliderProps {
  slides: PerfumesHeroSlide[];
  autoplaySpeed?: number;
  minHeight?: string;
}

export function PerfumesHeroSlider({ slides, autoplaySpeed = 6000, minHeight = "100vh" }: PerfumesHeroSliderProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => { setCurrent(idx); }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, autoplaySpeed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, autoplaySpeed]);

  const scopedCss = `
    .ph-slider { position: relative; width: 100%; overflow: hidden; }
    .ph-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: flex-end; justify-content: center; }
    .ph-slide.ph-active { opacity: 1; position: relative; }
    .ph-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; }
    .ph-slide-content {
      position: relative; z-index: 2; width: 100%; text-align: center;
      padding: 120px 15px 100px; display: flex; flex-direction: column; align-items: center;
    }
    .ph-bottle {
      width: 140px; height: auto; margin-bottom: 20px;
    }
    .ph-title {
      font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 56px;
      line-height: 1.2; margin: 0 0 25px; color: #fff; max-width: 660px;
    }
    .ph-btn-primary {
      display: inline-block; padding: 16px 40px;
      background: ${TOKENS.accentColor}; color: #fff; text-transform: none;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 15px;
      text-decoration: none; border: none; cursor: pointer;
      transition: opacity 0.3s;
    }
    .ph-btn-primary:hover { opacity: 0.85; }
    .ph-btn-black {
      display: inline-block; padding: 16px 40px;
      background: ${TOKENS.primaryColor}; color: #fff; text-transform: none;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 15px;
      text-decoration: none; border: none; cursor: pointer;
      transition: opacity 0.3s;
    }
    .ph-btn-black:hover { opacity: 0.85; }
    .ph-nav {
      position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 25px; z-index: 5;
    }
    .ph-nav-item {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; font-weight: 600;
      color: rgba(255,255,255,0.4); background: none; border: none;
      cursor: pointer; padding: 5px 0; position: relative; transition: color 0.3s;
    }
    .ph-nav-item.ph-nav-active { color: #fff; }
    .ph-nav-item.ph-nav-active::after {
      content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
      height: 2px; background: #fff;
    }
    .ph-arrows {
      position: absolute; top: 50%; z-index: 5; display: flex;
      justify-content: space-between; width: 100%; padding: 0 30px;
      transform: translateY(-50%); pointer-events: none;
    }
    .ph-arrow {
      pointer-events: auto; width: 50px; height: 50px; border: 1px solid rgba(255,255,255,0.3);
      background: transparent; color: #fff; font-size: 20px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s;
    }
    .ph-arrow:hover { background: rgba(255,255,255,0.1); border-color: #fff; }
    .ph-anim-in { animation: phSlideDown 0.6s ease forwards; opacity: 0; }
    @keyframes phSlideDown {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 1024px) {
      .ph-slider { min-height: 600px !important; }
      .ph-title { font-size: 48px; }
      .ph-slide-content { padding: 100px 15px 80px; }
    }
    @media (max-width: 767px) {
      .ph-slider { min-height: 500px !important; }
      .ph-title { font-size: 32px; }
      .ph-bottle { width: 120px; }
    }
  `;

  return (
    <div className="ph-slider" style={{ minHeight }}>
      <ScopedStyles id="hero-slider" css={scopedCss} />
      {slides.map((slide, i) => (
        <div key={i} className={`ph-slide ${i === current ? "ph-active" : ""}`}>
          <div className="ph-slide-bg" style={{
            backgroundColor: slide.backgroundColor,
            backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
          }} />
          <div className="ph-slide-content">
            {i === current && (
              <>
                <img src={slide.bottleImage} alt="" className="ph-bottle ph-anim-in" style={{ animationDelay: "0.15s" }}  onError={(e) => onImgError(e, "fallback")} />
                <h2 className="ph-title ph-anim-in" style={{ animationDelay: "0.25s" }}>{slide.title}</h2>
                <div className="ph-anim-in" style={{ animationDelay: "0.35s" }}>
                  <Link href={fixLink(slide.buttonLink)} className={slide.buttonStyle === "black" ? "ph-btn-black" : "ph-btn-primary"}>{slide.buttonText}</Link>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
      {slides.length > 1 && (
        <>
          <div className="ph-arrows">
            <button className="ph-arrow" onClick={() => goTo((current - 1 + slides.length) % slides.length)} aria-label="Previous">←</button>
            <button className="ph-arrow" onClick={() => goTo((current + 1) % slides.length)} aria-label="Next">→</button>
          </div>
          <div className="ph-nav">
            {slides.map((_, i) => (
              <button key={i} className={`ph-nav-item ${i === current ? "ph-nav-active" : ""}`} onClick={() => goTo(i)}>
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. PERFUMES SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesSectionTitleProps {
  title: string;
  align?: "left" | "center";
  marginBottom?: string;
}

export function PerfumesSectionTitle({ title, align = "left", marginBottom = "30px" }: PerfumesSectionTitleProps) {
  return (
    <div style={{ textAlign: align, marginBottom }}>
      <h2 style={{
        fontFamily: TOKENS.titleFont, fontWeight: 600, fontSize: "48px",
        lineHeight: 1.2, color: TOKENS.titleColor, margin: 0,
      }}>{title}</h2>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. PERFUMES PRODUCT GRID
   Bordered grid products — minimal, editorial. Name + price on hover.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesProductGridProps {
  products?: PerfumesProduct[];
  columns?: number;
  sectionTitle?: string;
  marginBottom?: string;
  maxProducts?: number;
  filter?: "featured" | "bestseller" | "new-arrival" | "sale" | "all";
  filterTag?: string;
}

export function PerfumesProductGrid({ products: propProducts, columns = 3, sectionTitle, marginBottom = "120px", maxProducts = 6, filter, filterTag }: PerfumesProductGridProps) {
  const storeCtx = useContext(PerfumesStoreContext);

  const products: PerfumesProduct[] = (() => {
    if (!storeCtx || !storeCtx.products || storeCtx.products.length === 0) return propProducts || [];

    let storeProducts = storeCtx.products;
    if (filter === "featured") {
      const f = storeProducts.filter(p => p.isFeatured);
      if (f.length > 0) storeProducts = f;
    } else if (filter && filter !== "all") {
      const tagged = storeProducts.filter(p =>
        p.tags?.some((t: string) => t.toLowerCase().replace(/[-_ ]/g, "") === filter!.toLowerCase().replace(/[-_ ]/g, ""))
      );
      if (tagged.length > 0) storeProducts = tagged;
    }
    if (filterTag) {
      const tagged = storeProducts.filter(p => p.tags?.some((t: string) => t.toLowerCase() === filterTag.toLowerCase()));
      if (tagged.length > 0) storeProducts = tagged;
    }
    if (storeProducts.length === 0) return propProducts || [];

    const currencySymbols: Record<string, string> = { GHS: "GH₵", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
    const sym = currencySymbols[storeCtx.currency] || storeCtx.currency;

    return storeProducts.slice(0, maxProducts).map(p => ({
      id: p.id, name: p.name,
      category: p.category?.name,
      categoryLink: p.category?.slug ? `/store/${storeCtx.storeSlug}/shop?category=${p.category.slug}` : undefined,
      price: p.compareAtPrice ? `${sym}${p.compareAtPrice.toLocaleString()}` : `${sym}${p.price.toLocaleString()}`,
      salePrice: p.compareAtPrice ? `${sym}${p.price.toLocaleString()}` : undefined,
      image: p.images[0]?.url || safeSrc(null, p.name),
      hoverImage: p.images[1]?.url,
      link: `/store/${storeCtx.storeSlug}/product/${p.slug}`,
      badge: p.compareAtPrice ? "SALE" : undefined,
    }));
  })();

  const resolveLink = (link: string, name: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `/store/${storeCtx.storeSlug}/product/${slug}`;
    }
    return resolveStoreLink(link, storeCtx?.storeSlug);
  };

  const scopedCss = `
    .ppg-section { margin-bottom: ${marginBottom}; }
    .ppg-grid {
      display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 0;
      border: 1px solid var(--color-border);
    }
    .ppg-card {
      position: relative; border-right: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);
      overflow: hidden;
    }
    .ppg-card:nth-child(${columns}n) { border-right: none; }
    .ppg-thumb { position: relative; overflow: hidden; }
    .ppg-img { width: 100%; height: auto; display: block; transition: opacity 0.5s; }
    .ppg-hover-img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      opacity: 0; transition: opacity 0.5s;
    }
    .ppg-card:hover .ppg-hover-img { opacity: 1; }
    .ppg-card:hover .ppg-main-img { opacity: 0; }
    .ppg-info {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 25px 60px 25px 25px; display: flex; flex-direction: column;
      justify-content: flex-end; pointer-events: none; z-index: 3;
    }
    .ppg-name {
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 15px;
      color: ${TOKENS.titleColor}; margin: 0 0 5px;
    }
    .ppg-name a { color: inherit; text-decoration: none; pointer-events: auto; }
    .ppg-name a:hover { opacity: 0.7; }
    .ppg-price-wrap {
      opacity: 0; transform: translateY(100%); transition: all 0.3s ease;
    }
    .ppg-card:hover .ppg-price-wrap { opacity: 1; transform: translateY(0); }
    .ppg-price {
      font-weight: 500; font-size: 16px; font-family: ${TOKENS.bodyFont};
      color: ${TOKENS.titleColor};
    }
    .ppg-price-old {
      text-decoration: line-through; color: #999; font-weight: 400;
      margin-right: 8px; font-size: 14px;
    }
    .ppg-actions {
      position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column;
      gap: 5px; opacity: 0; transition: opacity 0.3s; z-index: 4;
    }
    .ppg-card:hover .ppg-actions { opacity: 1; }
    .ppg-action-btn {
      width: 38px; height: 38px; border-radius: 0; background: #fff;
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 14px; transition: background 0.2s;
    }
    .ppg-action-btn:hover { background: var(--color-background); }
    .ppg-cart-btn {
      position: absolute; bottom: 10px; right: 10px;
      width: 38px; height: 38px; background: #fff; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 16px; opacity: 0; transition: opacity 0.3s; z-index: 4;
    }
    .ppg-card:hover .ppg-cart-btn { opacity: 1; }
    @media (max-width: 1024px) {
      .ppg-grid { grid-template-columns: repeat(3, 1fr); }
      .ppg-info { padding: 15px; }
    }
    @media (max-width: 767px) {
      .ppg-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `;

  if (products.length === 0) {
    return (
      <div className="ppg-section" style={containerStyle}>
        <ScopedStyles id="product-grid" css={scopedCss} />
        {sectionTitle && <PerfumesSectionTitle title={sectionTitle} />}
        <div style={{ textAlign: "center", padding: "40px 20px", color: TOKENS.textColor, fontFamily: TOKENS.bodyFont }}>
          <p>No products yet. Add products from your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ppg-section" style={containerStyle}>
      <ScopedStyles id="product-grid" css={scopedCss} />
      {sectionTitle && <PerfumesSectionTitle title={sectionTitle} />}
      <div className="ppg-grid">
        {products.map((p) => {
          const pLink = resolveLink(p.link, p.name);
          return (
            <div key={p.id} className="ppg-card">
              <div className="ppg-thumb">
                <Link href={pLink}>
                  <img src={p.image || safeSrc(null, p.name)} alt={p.name} className="ppg-img ppg-main-img" loading="lazy" onError={(e) => onImgError(e, p.name)} />
                  {p.hoverImage && <img src={p.hoverImage} alt={p.name} className="ppg-hover-img" loading="lazy"  onError={(e) => onImgError(e, p.name)} />}
                </Link>
                <div className="ppg-info">
                  <h3 className="ppg-name"><Link href={pLink}>{p.name}</Link></h3>
                  <div className="ppg-price-wrap">
                    <div className="ppg-price">
                      {p.salePrice && <span className="ppg-price-old">{p.price}</span>}
                      <span>{p.salePrice || p.price}</span>
                    </div>
                  </div>
                </div>
                <div className="ppg-actions">
                  <button className="ppg-action-btn" title="Wishlist" aria-label="Wishlist" onClick={() => storeCtx?.toggleWishlist?.(String(p.id))} style={storeCtx?.isWishlisted?.(String(p.id)) ? { color: "red" } : undefined}>{storeCtx?.isWishlisted?.(String(p.id)) ? "♥" : "♡"}</button>
                </div>
                <button className="ppg-cart-btn" title="Add to cart" aria-label="Add to cart" onClick={() => storeCtx?.addToCart?.(String(p.id))}>🛒</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. PERFUMES OLFACTORY FAMILY TAGS
   Row of bordered pill buttons for fragrance families.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesOlfactoryTag {
  name: string;
  link: string;
}

export interface PerfumesOlfactoryTagsProps {
  title?: string;
  tags: PerfumesOlfactoryTag[];
  marginBottom?: string;
}

export function PerfumesOlfactoryTags({ title = "Shop by Olfactory Family", tags, marginBottom = "120px" }: PerfumesOlfactoryTagsProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const scopedCss = `
    .pot-section { margin-bottom: ${marginBottom}; }
    .pot-tags {
      display: flex; flex-wrap: wrap; gap: 10px; overflow-y: auto;
    }
    .pot-tag {
      display: inline-block; padding: 14px 28px;
      border: 1px solid ${TOKENS.titleColor}; color: ${TOKENS.titleColor};
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 16px;
      text-decoration: none; transition: all 0.3s; flex: 1 0 auto;
      text-align: center;
    }
    .pot-tag:hover { background: ${TOKENS.titleColor}; color: #fff; }
    @media (max-width: 767px) {
      .pot-tag { font-size: 14px; padding: 10px 20px; }
    }
  `;

  return (
    <div className="pot-section" style={containerStyle}>
      <ScopedStyles id="olfactory-tags" css={scopedCss} />
      {title && <PerfumesSectionTitle title={title} />}
      <div className="pot-tags">
        {tags.map((t, i) => (
          <a key={i} href={fixLink(t.link)} className="pot-tag">{t.name}</a>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. PERFUMES MARQUEE
   Large text scrolling marquee with decorative SVG elements.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesMarqueeProps {
  items: string[];
  speed?: string;
  marginBottom?: string;
}

export function PerfumesMarquee({ items, speed = "45s", marginBottom = "120px" }: PerfumesMarqueeProps) {
  const scopedCss = `
    .pm-section { margin-bottom: ${marginBottom}; overflow: hidden; }
    .pm-track {
      display: flex; gap: 20px; align-items: center;
      animation: pmScroll ${speed} linear infinite;
      white-space: nowrap;
    }
    .pm-item {
      font-family: ${TOKENS.titleFont}; font-size: 84px; font-weight: 400;
      color: ${TOKENS.titleColor}; flex-shrink: 0; line-height: 1.2;
    }
    .pm-sep {
      width: 30px; height: 30px; flex-shrink: 0;
    }
    .pm-sep img { width: 100%; height: 100%; }
    @keyframes pmScroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    .pm-section:hover .pm-track { animation-play-state: paused; }
    @media (max-width: 1024px) { .pm-item { font-size: 48px; } }
    @media (max-width: 767px) { .pm-item { font-size: 36px; } }
  `;

  const sepImg = `${IMG_BASE}/2025/11/prf-marquee-figure.svg`;

  return (
    <div className="pm-section">
      <ScopedStyles id="marquee" css={scopedCss} />
      <div className="pm-track">
        {[...items, ...items].map((text, i) => (
          <span key={i}>
            <span className="pm-item">{text}</span>
            <span className="pm-sep" style={{ display: "inline-block", verticalAlign: "middle", margin: "0 15px" }}>
              <img src={sepImg} alt=""  onError={(e) => onImgError(e, "fallback")} />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. PERFUMES FEATURED BANNERS
   3 square cover-image banners with product name + description
   that slide up on hover. Each has unique background image.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesFeaturedBanner {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  link: string;
}

export interface PerfumesFeaturedBannersProps {
  banners: PerfumesFeaturedBanner[];
  marginBottom?: string;
}

export function PerfumesFeaturedBanners({ banners, marginBottom = "120px" }: PerfumesFeaturedBannersProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const scopedCss = `
    .pfb-section { margin-bottom: ${marginBottom}; }
    .pfb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .pfb-card {
      position: relative; overflow: hidden; aspect-ratio: 900/900;
      background-size: cover; background-position: center; cursor: pointer;
      display: flex; align-items: flex-end; justify-content: center; padding: 50px;
    }
    .pfb-content { text-align: center; color: #fff; max-width: 550px; z-index: 2; }
    .pfb-subtitle {
      font-family: ${TOKENS.bodyFont}; font-size: 25px; color: #fff;
      margin: 0 0 10px;
    }
    .pfb-title {
      font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 62px;
      color: #fff; line-height: 1.2; margin: 0 0 10px;
    }
    .pfb-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; color: rgba(255,255,255,0.8);
      line-height: 1.5; max-width: 600px; margin: 0 auto;
      opacity: 0; transform: translateY(15px); transition: all 0.4s ease;
    }
    .pfb-card:hover .pfb-desc { opacity: 1; transform: translateY(0); }
    .pfb-btn {
      display: inline-block; margin-top: 15px; padding: 12px 30px;
      border: 1px solid rgba(255,255,255,0.5); color: #fff;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px;
      text-decoration: none; transition: all 0.3s;
      opacity: 0; transform: translateY(15px);
    }
    .pfb-card:hover .pfb-btn { opacity: 1; transform: translateY(0); }
    .pfb-btn:hover { background: #fff; color: ${TOKENS.primaryColor}; }
    .pfb-link { position: absolute; inset: 0; z-index: 3; }
    .pfb-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 60%);
      z-index: 1;
    }
    @media (max-width: 1024px) {
      .pfb-title { font-size: 36px; }
      .pfb-subtitle { font-size: 20px; }
      .pfb-card { padding: 30px; }
    }
    @media (max-width: 767px) {
      .pfb-grid { grid-template-columns: 1fr; }
      .pfb-title { font-size: 28px; }
      .pfb-subtitle { font-size: 16px; }
    }
  `;

  return (
    <div className="pfb-section" style={containerStyle}>
      <ScopedStyles id="featured-banners" css={scopedCss} />
      <div className="pfb-grid">
        {banners.map((b, i) => (
          <div key={i} className="pfb-card" style={{ backgroundImage: `url(${b.backgroundImage})` }}>
            <div className="pfb-overlay" />
            <div className="pfb-content">
              <p className="pfb-subtitle">{b.subtitle}</p>
              <h3 className="pfb-title">{b.title}</h3>
              <p className="pfb-desc">{b.description}</p>
              <Link href={fixLink(b.link)} className="pfb-btn">Shop Now</Link>
            </div>
            <Link href={fixLink(b.link)} className="pfb-link" aria-label={b.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. PERFUMES TABBED PRODUCTS
   Tab navigation (e.g. "EDP", "EDT") with product grids below.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesTab {
  label: string;
  filterTag?: string;
}

export interface PerfumesTabbedProductsProps {
  title?: string;
  tabs: PerfumesTab[];
  products?: PerfumesProduct[];
  columns?: number;
  maxProducts?: number;
  marginBottom?: string;
}

export function PerfumesTabbedProducts({ title, tabs, products, columns = 3, maxProducts = 6, marginBottom = "120px" }: PerfumesTabbedProductsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const scopedCss = `
    .ptp-section { margin-bottom: ${marginBottom}; }
    .ptp-header { display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px; }
    .ptp-title {
      font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 48px;
      line-height: 1.2; color: ${TOKENS.titleColor}; margin: 0;
    }
    .ptp-tabs { display: flex; gap: 30px; }
    .ptp-tab {
      font-family: ${TOKENS.titleFont}; font-size: 18px; font-weight: 600;
      color: rgba(0,0,0,0.5); background: none; border: none;
      cursor: pointer; padding: 5px 0; position: relative; transition: color 0.3s;
      text-transform: capitalize;
    }
    .ptp-tab.ptp-tab-active {
      color: ${TOKENS.titleColor};
    }
    .ptp-tab.ptp-tab-active::after {
      content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
      height: 2px; background: ${TOKENS.titleColor};
    }
    .ptp-tab:hover { color: ${TOKENS.titleColor}; }
  `;

  return (
    <div className="ptp-section" style={containerStyle}>
      <ScopedStyles id="tabbed-products" css={scopedCss} />
      <div className="ptp-header">
        {title && <h2 className="ptp-title">{title}</h2>}
        <div className="ptp-tabs">
          {tabs.map((tab, i) => (
            <button key={i} className={`ptp-tab ${i === activeTab ? "ptp-tab-active" : ""}`} onClick={() => setActiveTab(i)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <PerfumesProductGrid
        products={products}
        columns={columns}
        maxProducts={maxProducts}
        marginBottom="0"
        filterTag={tabs[activeTab]?.filterTag}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. PERFUMES COLLECTION BANNERS
   Two large square cover-image banners with collection name +
   "Shop Now" button that appears on hover.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesCollectionBanner {
  title: string;
  image: string;
  link: string;
}

export interface PerfumesCollectionBannersProps {
  banners: PerfumesCollectionBanner[];
  sectionTitle?: string;
  marginBottom?: string;
}

export function PerfumesCollectionBanners({ banners, sectionTitle, marginBottom = "120px" }: PerfumesCollectionBannersProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);
  const { ref, inView } = useInView();

  const scopedCss = `
    .pcb-section { margin-bottom: ${marginBottom}; }
    .pcb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .pcb-card {
      position: relative; overflow: hidden; aspect-ratio: 900/900;
      background-size: cover; background-position: center; cursor: pointer;
      display: flex; align-items: flex-end; justify-content: center; padding: 50px;
    }
    .pcb-card:hover .pcb-bg-img { transform: scale(1.09); }
    .pcb-bg-img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.5s cubic-bezier(0,0,.44,1.18); z-index: 0;
    }
    .pcb-content { text-align: center; z-index: 2; position: relative; }
    .pcb-title {
      font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 48px;
      color: #fff; line-height: 1.2; margin: 0 0 10px;
    }
    .pcb-btn {
      display: inline-block; margin-top: 5px; padding: 12px 30px;
      border: 1px solid rgba(255,255,255,0.5); color: #fff;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px;
      text-decoration: none; transition: all 0.4s;
      opacity: 0; transform: translateY(15px);
    }
    .pcb-card:hover .pcb-btn { opacity: 1; transform: translateY(0); }
    .pcb-btn:hover { background: #fff; color: ${TOKENS.primaryColor}; }
    .pcb-link { position: absolute; inset: 0; z-index: 3; }
    .pcb-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 50%);
      z-index: 1;
    }
    .pcb-animate { opacity: 0; transform: translateY(20px); transition: all 0.6s ease; }
    .pcb-animate.pcb-visible { opacity: 1; transform: translateY(0); }
    @media (max-width: 1024px) { .pcb-title { font-size: 36px; } .pcb-card { padding: 30px; } }
    @media (max-width: 767px) {
      .pcb-grid { grid-template-columns: 1fr; }
      .pcb-title { font-size: 28px; }
    }
  `;

  return (
    <div className="pcb-section" ref={ref} style={containerStyle}>
      <ScopedStyles id="collection-banners" css={scopedCss} />
      {sectionTitle && <PerfumesSectionTitle title={sectionTitle} />}
      <div className="pcb-grid">
        {banners.map((b, i) => (
          <div key={i} className={`pcb-card pcb-animate ${inView ? "pcb-visible" : ""}`} style={{ transitionDelay: `${i * 0.15}s` }}>
            <img src={b.image} alt={b.title} className="pcb-bg-img" loading="lazy"  onError={(e) => onImgError(e, b.title)} />
            <div className="pcb-overlay" />
            <div className="pcb-content">
              <h3 className="pcb-title">{b.title}</h3>
              <Link href={fixLink(b.link)} className="pcb-btn">Shop Now</Link>
            </div>
            <Link href={fixLink(b.link)} className="pcb-link" aria-label={b.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. PERFUMES BLOG ARTICLES
   "Journal Articles" — carousel-style blog cards with large
   featured images, category tag, title, excerpt.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesBlogPost {
  image: string;
  title: string;
  excerpt: string;
  date: string;
  categories: string[];
  link: string;
}

export interface PerfumesBlogArticlesProps {
  posts: PerfumesBlogPost[];
  sectionTitle?: string;
  columns?: number;
  marginBottom?: string;
}

export function PerfumesBlogArticles({ posts: propPosts, sectionTitle = "Journal Articles", columns = 5, marginBottom = "100px" }: PerfumesBlogArticlesProps) {
  const storeCtx = useContext(PerfumesStoreContext);

  const posts: PerfumesBlogPost[] = (() => {
    if (!storeCtx || !storeCtx.blogs || storeCtx.blogs.length === 0) return propPosts || [];
    return storeCtx.blogs.slice(0, columns).map(b => {
      const d = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
      return {
        image: b.coverImage || safeSrc(null, b.title), title: b.title, excerpt: b.excerpt || "",
        date: d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
        categories: b.category ? [b.category] : [],
        link: `/store/${storeCtx.storeSlug}/blog/${b.slug}`,
      };
    });
  })();

  const scopedCss = `
    .pba-section { margin-bottom: ${marginBottom}; }
    .pba-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .pba-card { overflow: hidden; }
    .pba-img-wrap { position: relative; overflow: hidden; margin-bottom: 15px; aspect-ratio: 588/598; }
    .pba-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.5s ease;
    }
    .pba-card:hover .pba-img { transform: scale(1.05); }
    .pba-cats { margin-bottom: 6px; display: flex; gap: 5px; flex-wrap: wrap; }
    .pba-cat {
      font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor};
      text-transform: uppercase; letter-spacing: 1px;
    }
    .pba-title {
      font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 22px;
      color: ${TOKENS.titleColor}; margin: 0 0 8px; line-height: 1.3;
    }
    .pba-title a { color: inherit; text-decoration: none; }
    .pba-title a:hover { opacity: 0.7; }
    .pba-date {
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
    }
    .pba-link { position: absolute; inset: 0; z-index: 2; }
    @media (max-width: 1024px) {
      .pba-grid { grid-template-columns: repeat(3, 1fr); }
      .pba-title { font-size: 18px; }
    }
    @media (max-width: 767px) {
      .pba-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    }
  `;

  return (
    <div className="pba-section" style={containerStyle}>
      <ScopedStyles id="blog-articles" css={scopedCss} />
      {sectionTitle && <PerfumesSectionTitle title={sectionTitle} />}
      <div className="pba-grid">
        {posts.map((p, i) => (
          <article key={i} className="pba-card">
            <div className="pba-img-wrap">
              <img src={p.image} alt={p.title} className="pba-img" loading="lazy"  onError={(e) => onImgError(e, p.title)} />
              <Link href={resolveStoreLink(p.link, storeCtx?.storeSlug)} className="pba-link" aria-label={p.title} />
            </div>
            <div className="pba-cats">
              {p.categories.map((c, ci) => (
                <span key={ci} className="pba-cat">{c}</span>
              ))}
            </div>
            <h3 className="pba-title"><Link href={p.link}>{p.title}</Link></h3>
            <div className="pba-date">{p.date}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. PERFUMES INSTAGRAM
   "Connect to our Instagram" — left side with title + handle,
   right side with square image carousel/grid.
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesInstagramItem {
  image: string;
  link: string;
}

export interface PerfumesInstagramProps {
  handle?: string;
  handleLink?: string;
  items: PerfumesInstagramItem[];
  marginBottom?: string;
}

export function PerfumesInstagram({ handle = "@xtemos.studio", handleLink = "https://www.instagram.com/", items, marginBottom = "0" }: PerfumesInstagramProps) {
  const scopedCss = `
    .pi-section { margin-bottom: ${marginBottom}; }
    .pi-layout { display: flex; gap: 30px; align-items: center; }
    .pi-left { flex: 0 0 30%; }
    .pi-right { flex: 1; overflow: hidden; }
    .pi-title {
      font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 48px;
      color: ${TOKENS.titleColor}; line-height: 1.2; margin: 0 0 15px;
    }
    .pi-handle {
      font-family: ${TOKENS.bodyFont}; font-size: 20px; font-weight: 600;
      color: ${TOKENS.titleColor}; text-decoration: none;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .pi-handle:hover { opacity: 0.7; }
    .pi-handle-arrow { font-size: 16px; }
    .pi-grid { display: flex; gap: 10px; }
    .pi-item {
      flex: 0 0 auto; width: calc(100% / 3.5); aspect-ratio: 1;
      overflow: hidden; border-radius: 0;
    }
    .pi-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.5s;
    }
    .pi-item:hover .pi-img { transform: scale(1.08); }
    .pi-link { display: block; width: 100%; height: 100%; }
    @media (max-width: 1024px) {
      .pi-title { font-size: 36px; }
      .pi-left { flex: 0 0 40%; }
    }
    @media (max-width: 767px) {
      .pi-layout { flex-direction: column; }
      .pi-left { flex: none; width: 100%; text-align: center; }
      .pi-title { font-size: 28px; }
      .pi-item { width: calc(100% / 2.5); }
    }
  `;

  return (
    <div className="pi-section" style={containerStyle}>
      <ScopedStyles id="instagram" css={scopedCss} />
      <div className="pi-layout">
        <div className="pi-left">
          <h2 className="pi-title">Connect to our Instagram</h2>
          <a href={handleLink} className="pi-handle" target="_blank" rel="noopener noreferrer">
            {handle} <span className="pi-handle-arrow">→</span>
          </a>
        </div>
        <div className="pi-right">
          <div className="pi-grid">
            {items.map((item, i) => (
              <div key={i} className="pi-item">
                <a href={item.link} className="pi-link" target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${i + 1}`}>
                  <img src={item.image} alt="" className="pi-img" loading="lazy"  onError={(e) => onImgError(e, "fallback")} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */

export interface PerfumesFooterProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  description?: string | null;
}

export function PerfumesFooter({ storeName, storeSlug, logo, description }: PerfumesFooterProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const resolvedStoreSlug = storeCtx?.storeSlug || storeSlug;
  const footerCss = `
    .pfx-footer {
      background: #111;
      color: #fff;
      margin-top: 80px;
    }
    .pfx-inner {
      max-width: 1320px; margin: 0 auto; padding: 80px 15px 0;
    }
    .pfx-top {
      display: grid; grid-template-columns: 1fr 1.1fr 1fr; gap: 40px; align-items: start;
      padding-bottom: 40px;
    }
    .pfx-brand {
      display: inline-flex; align-items: center; margin-bottom: 18px;
      font-family: ${TOKENS.titleFont}; font-size: 28px; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase; color: #fff;
    }
    .pfx-lead {
      font-family: ${TOKENS.titleFont}; font-size: 30px; line-height: 1.2; margin: 0; max-width: 620px;
      color: #fff;
    }
    .pfx-newsletter h3, .pfx-links h3 {
      margin: 0 0 16px; font-family: ${TOKENS.titleFont}; font-size: 28px; font-weight: 600;
    }
    .pfx-newsletter p, .pfx-links a, .pfx-copy {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.82);
    }
    .pfx-form {
      display: grid; grid-template-columns: 1fr auto; gap: 10px; margin: 18px 0 20px;
    }
    .pfx-form input {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
      padding: 12px 14px; color: #fff; font-family: ${TOKENS.bodyFont};
    }
    .pfx-form input::placeholder { color: rgba(255,255,255,0.45); }
    .pfx-form button {
      border: 0; background: #fff; color: #111; font-weight: 700; padding: 12px 18px; cursor: pointer;
      font-family: ${TOKENS.bodyFont};
    }
    .pfx-links-grid {
      display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px;
    }
    .pfx-link-col {
      padding-left: 24px; border-left: 1px solid rgba(255,255,255,0.1);
    }
    .pfx-links-list { display: grid; gap: 10px; }
    .pfx-links-list a { text-decoration: none; }
    .pfx-links-list a:hover { opacity: 0.75; }
    .pfx-bottom {
      border-top: 2px solid rgba(255,255,255,0.14);
      padding: 20px 0 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px;
      flex-wrap: wrap;
    }
    .pfx-payments { max-width: 350px; width: 100%; height: auto; }
    .pfx-socials { display: flex; gap: 12px; margin-top: 18px; }
    .pfx-socials a {
      display: inline-flex; width: 36px; height: 36px; align-items: center; justify-content: center;
      border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); color: #fff; text-decoration: none;
      background: rgba(255,255,255,0.03);
    }
    .pfx-socials svg { width: 16px; height: 16px; }
    @media (max-width: 1024px) {
      .pfx-top { grid-template-columns: 1fr; gap: 28px; }
      .pfx-lead { font-size: 24px; }
      .pfx-links h3, .pfx-newsletter h3 { font-size: 24px; }
    }
    @media (max-width: 767px) {
      .pfx-inner { padding-top: 56px; }
      .pfx-links-grid { grid-template-columns: 1fr; }
      .pfx-link-col { padding-left: 0; border-left: 0; }
      .pfx-form { grid-template-columns: 1fr; }
      .pfx-bottom { align-items: flex-start; }
    }
  `;

  const footerLinks = [
    { label: "About Us", href: `/store/${resolvedStoreSlug}/about-us` },
    { label: "Contact Us", href: `/store/${resolvedStoreSlug}/contact-us` },
    { label: "FAQ", href: `/store/${resolvedStoreSlug}/contact-us` },
    { label: "Blog", href: `/store/${resolvedStoreSlug}/journal` },
  ];

  const policyLinks = [
    { label: "Terms of use", href: `/store/${resolvedStoreSlug}/terms` },
    { label: "Refund policy", href: `/store/${resolvedStoreSlug}/terms#returns` },
    { label: "Cookies", href: `/store/${resolvedStoreSlug}/terms#cookies` },
    { label: "Privacy policy", href: `/store/${resolvedStoreSlug}/terms#privacy` },
  ];

  return (
    <footer className="pfx-footer">
      <ScopedStyles id="footer" css={footerCss} />
      <div className="pfx-inner">
        <div className="pfx-top">
          <div>
            <Link href={`/store/${resolvedStoreSlug}`} className="pfx-brand" aria-label={storeName}>
              {storeName}
            </Link>
            <p className="pfx-lead">
              {description || "Discover a curated collection of modern fragrances designed to hold memory, emotion, and identity in every bottle."}
            </p>
            <div className="pfx-socials" aria-label="Social links">
              <a href="https://www.facebook.com/xtemos.studio" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
              <a href="https://x.com/xtemos_studio" target="_blank" rel="noopener noreferrer" aria-label="X">x</a>
              <a href="https://www.instagram.com/xtemos.studio/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">ig</a>
              <a href="https://www.youtube.com/channel/UCu3loFwqqOQ9z-YTcnplK8w" target="_blank" rel="noopener noreferrer" aria-label="YouTube">yt</a>
            </div>
          </div>

          <div className="pfx-newsletter">
            <h3>Insider Access</h3>
            <p>Receive exclusive content and be the first to know about product launches and special announcements.</p>
            <form className="pfx-form" onSubmit={(event) => event.preventDefault()}>
              <input type="email" placeholder="Your email address" aria-label="Email address" />
              <button type="submit">Sign up</button>
            </form>
          </div>

          <div className="pfx-links">
            <h3>Quick Links</h3>
            <div className="pfx-links-grid">
              <div className="pfx-link-col">
                <div className="pfx-links-list">
                  {footerLinks.map((link) => (
                    <Link key={link.label} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="pfx-link-col">
                <div className="pfx-links-list">
                  {policyLinks.map((link) => (
                    <Link key={link.label} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pfx-bottom">
          <p className="pfx-copy">{storeName} © {new Date().getFullYear()}. All Rights Reserved.</p>
          <img
            src="https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/ps-mtds.png.webp"
            alt="Payment methods"
            className="pfx-payments"
          />
        </div>
      </div>
    </footer>
  );
}


/* ═══════════════════════════════════════════════════════════════
   PERFUMES SUB-PAGE BLOCKS
   Block versions of previously hardcoded About, Contact,
   Fragrances, and Journal pages.
   ═══════════════════════════════════════════════════════════════ */

/* ─── ABOUT: WELCOME ────────────────────────────────────────── */
export interface PerfumesAboutWelcomeProps {
  title?: string;
  text?: string;
  image?: string;
}
export function PerfumesAboutWelcome({ title = "Welcome to Our Fragrances", text = "", image = `${IMG_BASE}/2025/11/prf-about-us-1.jpg` }: PerfumesAboutWelcomeProps) {
  const css = `
    .pa-welcome { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 80px 15px 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
    .pa-welcome-title { font-family: ${TOKENS.titleFont}; font-size: 42px; font-weight: 400; color: ${TOKENS.primaryColor}; margin: 0 0 25px; line-height: 1.2; }
    .pa-welcome-text { font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 1.8; color: ${TOKENS.textColor}; margin: 0; }
    .pa-welcome-img { width: 100%; height: auto; display: block; }
    @media (max-width: 1024px) { .pa-welcome { grid-template-columns: 1fr; gap: 30px; } }
    @media (max-width: 767px) { .pa-welcome-title { font-size: 32px; } }
  `;
  return (
    <div>
      <ScopedStyles id="about-welcome" css={css} />
      <div className="pa-welcome">
        <div>
          <h1 className="pa-welcome-title">{title}</h1>
          <p className="pa-welcome-text">{text}</p>
        </div>
        <img src={image} alt="About us" className="pa-welcome-img" />
      </div>
    </div>
  );
}

/* ─── ABOUT: MARQUEE ────────────────────────────────────────── */
export interface PerfumesAboutMarqueeProps {
  items?: string[];
}
export function PerfumesAboutMarquee({ items = ["Ethereal", "Sensory", "Signature"] }: PerfumesAboutMarqueeProps) {
  const css = `
    .pa-marquee-wrap { overflow: hidden; padding: 35px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-bottom: 80px; }
    .pa-marquee { display: flex; gap: 60px; animation: pa-scroll 45s linear infinite; white-space: nowrap; }
    .pa-marquee-item { font-family: ${TOKENS.titleFont}; font-size: 28px; font-weight: 400; color: ${TOKENS.primaryColor}; display: flex; align-items: center; gap: 30px; }
    .pa-marquee-sep { width: 8px; height: 8px; background: ${TOKENS.accentColor}; border-radius: 50%; flex-shrink: 0; }
    @keyframes pa-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  `;
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div>
      <ScopedStyles id="about-marquee" css={css} />
      <div className="pa-marquee-wrap">
        <div className="pa-marquee">
          {repeated.map((item, i) => (
            <span key={i} className="pa-marquee-item"><span className="pa-marquee-sep" />{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── ABOUT: STORY + FAQ ────────────────────────────────────── */
export interface PerfumesAboutStoryProps {
  title?: string;
  text?: string;
  faqItems?: Array<{ q: string; a: string }>;
}
export function PerfumesAboutStory({ title = "Our Story", text = "", faqItems = [] }: PerfumesAboutStoryProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const css = `
    .pa-story { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px 80px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
    .pa-story-title { font-family: ${TOKENS.titleFont}; font-size: 42px; font-weight: 400; color: ${TOKENS.primaryColor}; margin: 0 0 25px; }
    .pa-story-text { font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 1.8; color: ${TOKENS.textColor}; margin: 0 0 30px; }
    .pa-faq { border-top: 1px solid #eee; }
    .pa-faq-item { border-bottom: 1px solid #eee; }
    .pa-faq-q { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; cursor: pointer; font-family: ${TOKENS.bodyFont}; font-size: 15px; font-weight: 500; color: ${TOKENS.primaryColor}; }
    .pa-faq-q:hover { color: ${TOKENS.accentColor}; }
    .pa-faq-toggle { font-size: 20px; color: ${TOKENS.textColor}; transition: transform 0.3s; }
    .pa-faq-toggle.pa-open { transform: rotate(45deg); }
    .pa-faq-a { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.7; color: ${TOKENS.textColor}; padding: 0 0 18px; margin: 0; }
    @media (max-width: 1024px) { .pa-story { grid-template-columns: 1fr; gap: 30px; } }
    @media (max-width: 767px) { .pa-story-title { font-size: 32px; } }
  `;
  return (
    <div>
      <ScopedStyles id="about-story" css={css} />
      <div className="pa-story">
        <div>
          <h2 className="pa-story-title">{title}</h2>
          <p className="pa-story-text">{text}</p>
        </div>
        <div className="pa-faq">
          {faqItems.map((item, i) => (
            <div key={i} className="pa-faq-item">
              <div className="pa-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {item.q}
                <span className={`pa-faq-toggle ${openFaq === i ? "pa-open" : ""}`}>+</span>
              </div>
              {openFaq === i && <p className="pa-faq-a">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── ABOUT: WHY CHOOSE US ──────────────────────────────────── */
export interface PerfumesWhyChooseUsProps {
  title?: string;
  items?: Array<{ icon: string; title: string; desc: string }>;
}
export function PerfumesWhyChooseUs({ title = "Why Choose Us?", items = [] }: PerfumesWhyChooseUsProps) {
  const css = `
    .pa-why { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px 80px; }
    .pa-why-title { font-family: ${TOKENS.titleFont}; font-size: 42px; font-weight: 400; color: ${TOKENS.primaryColor}; margin: 0 0 50px; text-align: center; }
    .pa-why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
    .pa-why-card { text-align: center; }
    .pa-why-icon { width: 60px; height: 60px; margin: 0 auto 20px; }
    .pa-why-card-title { font-family: ${TOKENS.titleFont}; font-size: 22px; font-weight: 500; color: ${TOKENS.primaryColor}; margin: 0 0 12px; }
    .pa-why-card-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.7; color: ${TOKENS.textColor}; margin: 0; }
    @media (max-width: 1024px) { .pa-why-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .pa-why-grid { grid-template-columns: 1fr; } .pa-why-title { font-size: 32px; } }
  `;
  return (
    <div>
      <ScopedStyles id="about-why" css={css} />
      <div className="pa-why">
        <h2 className="pa-why-title">{title}</h2>
        <div className="pa-why-grid">
          {items.map((item, i) => (
            <div key={i} className="pa-why-card">
              <img src={item.icon} alt={item.title} className="pa-why-icon" />
              <h3 className="pa-why-card-title">{item.title}</h3>
              <p className="pa-why-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CONTACT: HERO ─────────────────────────────────────────── */
export interface PerfumesContactHeroProps {
  title?: string;
}
export function PerfumesContactHero({ title = "Contact Us" }: PerfumesContactHeroProps) {
  const css = `
    .pc-hero { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 80px 15px 60px; text-align: center; }
    .pc-title { font-family: ${TOKENS.titleFont}; font-size: 52px; font-weight: 400; color: ${TOKENS.primaryColor}; margin: 0 0 50px; letter-spacing: -1px; }
    @media (max-width: 767px) { .pc-title { font-size: 36px; } }
  `;
  return (
    <div>
      <ScopedStyles id="contact-hero" css={css} />
      <div className="pc-hero"><h1 className="pc-title">{title}</h1></div>
    </div>
  );
}

/* ─── CONTACT: INFO CARDS ───────────────────────────────────── */
export interface PerfumesContactInfoProps {
  items?: Array<{ label: string; value: string; type?: string }>;
}
export function PerfumesContactInfo({ items = [] }: PerfumesContactInfoProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const socialIcons: Record<string, string> = { facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶", tiktok: "♪" };
  const css = `
    .pc-info-grid { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px 60px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
    .pc-info-card { text-align: center; }
    .pc-info-label { font-family: ${TOKENS.titleFont}; font-size: 22px; font-weight: 500; color: ${TOKENS.primaryColor}; margin: 0 0 15px; }
    .pc-info-value { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.7; color: ${TOKENS.textColor}; margin: 0; }
    .pc-social-row { display: flex; justify-content: center; gap: 12px; margin-top: 10px; }
    .pc-social-icon { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; color: ${TOKENS.textColor}; text-decoration: none; font-size: 14px; transition: all 0.2s; }
    .pc-social-icon:hover { border-color: ${TOKENS.primaryColor}; color: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) { .pc-info-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .pc-info-grid { grid-template-columns: 1fr; } }
  `;
  const socialLinks = storeCtx?.socialLinks || [];
  return (
    <div>
      <ScopedStyles id="contact-info" css={css} />
      <div className="pc-info-grid">
        {items.map((item, i) => (
          <div key={i} className="pc-info-card">
            <h3 className="pc-info-label">{item.label}</h3>
            {item.type === "social" ? (
              <div className="pc-social-row">
                {socialLinks.length > 0 ? socialLinks.map((s, si) => (
                  <a key={si} href={s.url} className="pc-social-icon" target="_blank" rel="noopener noreferrer">{socialIcons[s.platform] || s.platform[0]?.toUpperCase()}</a>
                )) : (<><a href="#" className="pc-social-icon">f</a><a href="#" className="pc-social-icon">𝕏</a><a href="#" className="pc-social-icon">📷</a><a href="#" className="pc-social-icon">▶</a></>)}
              </div>
            ) : (
              <p className="pc-info-value" dangerouslySetInnerHTML={{ __html: item.value }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CONTACT: FORM ─────────────────────────────────────────── */
export interface PerfumesContactFormProps {
  title?: string;
  description?: string;
}
export function PerfumesContactForm({ title = "Get In Touch", description = "" }: PerfumesContactFormProps) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const css = `
    .pc-form-section { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px 80px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: flex-start; }
    .pc-form-title { font-family: ${TOKENS.titleFont}; font-size: 36px; font-weight: 400; color: ${TOKENS.primaryColor}; margin: 0 0 10px; }
    .pc-form-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.7; color: ${TOKENS.textColor}; margin: 0 0 30px; }
    .pc-form { display: flex; flex-direction: column; gap: 18px; }
    .pc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .pc-input { width: 100%; padding: 14px 18px; border: 1px solid #ddd; font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none; color: ${TOKENS.primaryColor}; transition: border-color 0.2s; background: #fff; }
    .pc-input:focus { border-color: ${TOKENS.primaryColor}; }
    .pc-textarea { width: 100%; padding: 14px 18px; border: 1px solid #ddd; font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none; color: ${TOKENS.primaryColor}; min-height: 140px; resize: vertical; transition: border-color 0.2s; }
    .pc-textarea:focus { border-color: ${TOKENS.primaryColor}; }
    .pc-submit { padding: 14px 40px; background: ${TOKENS.primaryColor}; color: #fff; border: none; font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; cursor: pointer; transition: background 0.2s; align-self: flex-start; }
    .pc-submit:hover { background: ${TOKENS.accentColor}; }
    .pc-success { font-family: ${TOKENS.bodyFont}; font-size: 15px; color: #16a34a; font-weight: 500; }
    @media (max-width: 1024px) { .pc-form-section { grid-template-columns: 1fr; } }
    @media (max-width: 767px) { .pc-form-row { grid-template-columns: 1fr; } }
  `;
  return (
    <div>
      <ScopedStyles id="contact-form" css={css} />
      <div className="pc-form-section">
        <div>
          <h2 className="pc-form-title">{title}</h2>
          <p className="pc-form-desc">{description}</p>
        </div>
        <div>
          {submitted ? (
            <p className="pc-success">Thank you for your message! We&apos;ll get back to you soon.</p>
          ) : (
            <form className="pc-form" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
              <div className="pc-form-row">
                <input className="pc-input" placeholder="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                <input className="pc-input" placeholder="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
              </div>
              <input className="pc-input" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              <textarea className="pc-textarea" placeholder="Your Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              <button type="submit" className="pc-submit">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── CONTACT: BRANDED STORES ───────────────────────────────── */
export interface PerfumesBrandedStoresProps {
  title?: string;
  stores?: Array<{ name: string; phone: string; address: string }>;
}
export function PerfumesBrandedStores({ title = "Our Branded Stores", stores = [] }: PerfumesBrandedStoresProps) {
  const css = `
    .pc-stores { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px 80px; }
    .pc-stores-title { font-family: ${TOKENS.titleFont}; font-size: 36px; font-weight: 400; color: ${TOKENS.primaryColor}; margin: 0 0 40px; text-align: center; }
    .pc-stores-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
    .pc-store-card { text-align: center; padding: 35px 25px; border: 1px solid #eee; }
    .pc-store-name { font-family: ${TOKENS.titleFont}; font-size: 24px; font-weight: 500; color: ${TOKENS.primaryColor}; margin: 0 0 18px; }
    .pc-store-detail { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; margin: 0 0 8px; line-height: 1.6; }
    .pc-store-detail strong { color: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) { .pc-stores-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .pc-stores-grid { grid-template-columns: 1fr; } }
  `;
  return (
    <div>
      <ScopedStyles id="branded-stores" css={css} />
      <div className="pc-stores">
        <h2 className="pc-stores-title">{title}</h2>
        <div className="pc-stores-grid">
          {stores.map((s, i) => (
            <div key={i} className="pc-store-card">
              <h3 className="pc-store-name">{s.name}</h3>
              <p className="pc-store-detail"><strong>Call Us:</strong> {s.phone}</p>
              <p className="pc-store-detail"><strong>Address:</strong> {s.address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── FRAGRANCES: HERO ──────────────────────────────────────── */
export interface PerfumesPageHeroProps {
  title?: string;
  subtitle?: string;
}
export function PerfumesPageHero({ title = "Fragrances", subtitle }: PerfumesPageHeroProps) {
  const css = `
    .pfr-hero { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 80px 15px 60px; text-align: center; }
    .pfr-hero-title { font-family: ${TOKENS.titleFont}; font-size: 52px; font-weight: 400; color: ${TOKENS.primaryColor}; margin: 0 0 15px; letter-spacing: -1px; }
    .pfr-hero-subtitle { font-family: ${TOKENS.bodyFont}; font-size: 16px; color: ${TOKENS.textColor}; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
    @media (max-width: 1024px) { .pfr-hero-title { font-size: 40px; } }
    @media (max-width: 767px) { .pfr-hero-title { font-size: 32px; } .pfr-hero { padding: 50px 15px 40px; } }
  `;
  return (
    <div>
      <ScopedStyles id="page-hero" css={css} />
      <div className="pfr-hero">
        <h1 className="pfr-hero-title">{title}</h1>
        {subtitle && <p className="pfr-hero-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─── FRAGRANCES: COLLECTIONS GRID ──────────────────────────── */
export interface PerfumesCollectionsGridProps {
  collections?: Array<{ name: string; slug: string; description: string }>;
}
export function PerfumesCollectionsGrid({ collections = [] }: PerfumesCollectionsGridProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const products = storeCtx?.products || [];
  const currency = storeCtx?.currency || "USD";
  const storeSlug = storeCtx?.storeSlug || "";
  const currencySymbols: Record<string, string> = { GHS: "GH₵", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const formatPrice = (price: number, cur: string) => `${currencySymbols[cur] || cur}${price.toLocaleString()}`;

  const getCollectionProducts = (collSlug: string) => {
    const match = products.filter((p: any) => p.category?.slug?.toLowerCase() === collSlug || p.category?.name?.toLowerCase().replace(/\s+/g, "-") === collSlug);
    return match.length > 0 ? match.slice(0, 8) : [];
  };
  const hasMatched = collections.some(c => getCollectionProducts(c.slug).length > 0);
  const chunk = Math.ceil(products.length / Math.max(collections.length, 1));

  const css = `
    .pfr-section { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px 80px; }
    .pfr-collection-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 35px; gap: 40px; }
    .pfr-col-name { font-family: ${TOKENS.titleFont}; font-size: 36px; font-weight: 400; color: ${TOKENS.primaryColor}; margin: 0; }
    .pfr-col-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.7; color: ${TOKENS.textColor}; max-width: 500px; margin: 0; }
    .pfr-view-link { font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; color: ${TOKENS.primaryColor}; text-decoration: none; border-bottom: 1px solid ${TOKENS.primaryColor}; padding-bottom: 2px; white-space: nowrap; transition: color 0.2s; }
    .pfr-view-link:hover { color: ${TOKENS.accentColor}; border-color: ${TOKENS.accentColor}; }
    .pfr-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .pfr-card { position: relative; }
    .pfr-card-img-wrap { position: relative; overflow: hidden; margin-bottom: 15px; background: #f8f8f8; }
    .pfr-card-img { width: 100%; aspect-ratio: 430 / 491; object-fit: cover; display: block; transition: transform 0.5s ease; }
    .pfr-card:hover .pfr-card-img { transform: scale(1.03); }
    .pfr-card-actions { position: absolute; bottom: 10px; left: 10px; right: 10px; display: flex; gap: 6px; opacity: 0; transform: translateY(8px); transition: all 0.3s ease; }
    .pfr-card:hover .pfr-card-actions { opacity: 1; transform: translateY(0); }
    .pfr-card-btn { flex: 1; padding: 10px; background: #fff; border: none; cursor: pointer; font-family: ${TOKENS.bodyFont}; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: ${TOKENS.primaryColor}; text-align: center; text-decoration: none; display: block; transition: background 0.2s; }
    .pfr-card-btn:hover { background: ${TOKENS.primaryColor}; color: #fff; }
    .pfr-card-name { font-family: ${TOKENS.bodyFont}; font-size: 14px; font-weight: 500; color: ${TOKENS.primaryColor}; margin: 0 0 6px; }
    .pfr-card-name a { color: inherit; text-decoration: none; }
    .pfr-card-name a:hover { color: ${TOKENS.accentColor}; }
    .pfr-card-price { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; }
    .pfr-card-price-old { text-decoration: line-through; margin-right: 8px; color: #bbb; }
    .pfr-divider { max-width: ${TOKENS.containerWidth}; margin: 0 auto 60px; padding: 0 15px; border: none; border-top: 1px solid #eee; }
    .pfr-empty { text-align: center; padding: 40px; font-family: ${TOKENS.bodyFont}; color: ${TOKENS.textColor}; }
    @media (max-width: 1024px) { .pfr-grid { grid-template-columns: repeat(3, 1fr); } .pfr-col-name { font-size: 28px; } .pfr-collection-header { flex-direction: column; gap: 15px; } }
    @media (max-width: 767px) { .pfr-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
  `;

  return (
    <div>
      <ScopedStyles id="collections-grid" css={css} />
      {products.length === 0 ? (<div className="pfr-empty">No fragrances available yet.</div>) : (
        collections.map((col, ci) => {
          const colProducts = hasMatched ? getCollectionProducts(col.slug) : products.slice(ci * chunk, (ci + 1) * chunk);
          if (colProducts.length === 0 && hasMatched) return null;
          return (
            <div key={col.slug}>
              {ci > 0 && <hr className="pfr-divider" />}
              <div className="pfr-section">
                <div className="pfr-collection-header">
                  <div><h2 className="pfr-col-name">{col.name}</h2><p className="pfr-col-desc">{col.description}</p></div>
                  <Link href={resolveStoreLink(`/shop?category=${col.slug}`, storeSlug)} className="pfr-view-link">View Collection</Link>
                </div>
                <div className="pfr-grid">
                  {colProducts.map((p: any) => (
                    <div key={p.id} className="pfr-card">
                      <div className="pfr-card-img-wrap">
                        <Link href={resolveStoreLink(`/product/${p.slug}`, storeSlug)}><img src={p.images?.[0]?.url || safeSrc(null, p.name)} alt={p.name} className="pfr-card-img" loading="lazy" onError={(e: any) => onImgError(e, p.name)} /></Link>
                        <div className="pfr-card-actions"><Link href={resolveStoreLink(`/product/${p.slug}`, storeSlug)} className="pfr-card-btn">View</Link></div>
                      </div>
                      <h3 className="pfr-card-name"><Link href={resolveStoreLink(`/product/${p.slug}`, storeSlug)}>{p.name}</Link></h3>
                      <div className="pfr-card-price">
                        {p.compareAtPrice && <span className="pfr-card-price-old">{formatPrice(p.compareAtPrice, currency)}</span>}
                        {formatPrice(p.price, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

/* ─── JOURNAL: GRID ─────────────────────────────────────────── */
export interface PerfumesJournalGridProps {
  columns?: number;
}
export function PerfumesJournalGrid({ columns = 3 }: PerfumesJournalGridProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const blogs = storeCtx?.blogs || [];
  const storeSlug = storeCtx?.storeSlug || "";
  const placeholders = Array.from({ length: 6 }, (_, i) => `${IMG_BASE}/2025/11/prf-blog-${i + 1}-588x598.jpg`);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

  const css = `
    .pj-grid { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px 80px; display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 25px; }
    .pj-card { position: relative; overflow: hidden; }
    .pj-card-img { width: 100%; aspect-ratio: 1 / 1.02; object-fit: cover; display: block; transition: transform 0.5s ease; }
    .pj-card:hover .pj-card-img { transform: scale(1.03); }
    .pj-card-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 30px 25px; background: linear-gradient(transparent, rgba(0,0,0,0.6)); }
    .pj-card-date { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .pj-card-title { font-family: ${TOKENS.titleFont}; font-size: 24px; font-weight: 500; color: #fff; margin: 0; }
    .pj-card-title a { color: #fff; text-decoration: none; }
    .pj-empty { text-align: center; padding: 60px 20px; font-family: ${TOKENS.bodyFont}; color: ${TOKENS.textColor}; }
    @media (max-width: 1024px) { .pj-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .pj-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <div>
      <ScopedStyles id="journal-grid" css={css} />
      {blogs.length === 0 ? (<div className="pj-empty">No journal entries yet.</div>) : (
        <div className="pj-grid">
          {blogs.map((post: any, i: number) => (
            <div key={post.id} className="pj-card">
              <img src={post.coverImage || placeholders[i % 6]} alt={post.title} className="pj-card-img" loading="lazy" />
              <div className="pj-card-overlay">
                <div className="pj-card-date">{formatDate(post.publishedAt || post.createdAt)}</div>
                <h3 className="pj-card-title"><Link href={resolveStoreLink(`/blog/${post.slug}`, storeSlug)}>{post.title}</Link></h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── REVIEWS: HERO ─────────────────────────────────────────── */
export interface PerfumesReviewsHeroProps {
  title?: string;
}
export function PerfumesReviewsHero({ title = "Reviews" }: PerfumesReviewsHeroProps) {
  const css = `
    .pr-hero { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 80px 15px 60px; text-align: center; }
    .pr-hero-title { font-family: ${TOKENS.titleFont}; font-size: 52px; font-weight: 400; color: ${TOKENS.primaryColor}; margin: 0; letter-spacing: -1px; }
    @media (max-width: 767px) { .pr-hero-title { font-size: 36px; } }
  `;
  return (
    <div>
      <ScopedStyles id="reviews-hero" css={css} />
      <div className="pr-hero">
        <h1 className="pr-hero-title">{title}</h1>
      </div>
    </div>
  );
}

/* ─── REVIEWS: GRID ─────────────────────────────────────────── */
export interface PerfumesReviewsGridProps {
  columns?: number;
}
export function PerfumesReviewsGrid({ columns = 3 }: PerfumesReviewsGridProps) {
  const css = `
    .pr-grid { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px 80px; display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 30px; }
    .pr-card { background: #f8f8f8; padding: 35px 30px; }
    .pr-stars { color: #EABE12; font-size: 18px; margin-bottom: 15px; letter-spacing: 2px; }
    .pr-text { font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 1.7; color: ${TOKENS.textColor}; margin-bottom: 20px; }
    .pr-author { font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px; color: ${TOKENS.primaryColor}; }
    .pr-date { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: #999; margin-top: 5px; }
    .pr-empty { text-align: center; padding: 60px 20px; font-family: ${TOKENS.bodyFont}; color: ${TOKENS.textColor}; }
    @media (max-width: 1024px) { .pr-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .pr-grid { grid-template-columns: 1fr; } }
  `;
  
  const placeholderReviews = [
    { name: "Sarah M.", text: "Absolutely love the Opus Essence fragrance. It's become my signature scent and I receive compliments everywhere I go.", rating: 5, date: "2 weeks ago" },
    { name: "James L.", text: "The Velours Noir collection is exquisite. Deep, mysterious, and long-lasting. Highly recommend for evening wear.", rating: 5, date: "1 month ago" },
    { name: "Emma R.", text: "Étheria is light and airy - perfect for everyday wear. The packaging is also beautiful.", rating: 4, date: "3 weeks ago" },
    { name: "Michael K.", text: "Exceptional quality and customer service. The Celeste Aura fragrance is my new favorite.", rating: 5, date: "2 months ago" },
    { name: "Lisa T.", text: "Nocturne Essence captures the essence of nightfall perfectly. Subtle yet sophisticated.", rating: 5, date: "1 month ago" },
    { name: "David W.", text: "Elysian Bloom is fresh and green - exactly what I was looking for. Will definitely order again.", rating: 4, date: "3 weeks ago" },
  ];

  return (
    <div>
      <ScopedStyles id="reviews-grid" css={css} />
      <div className="pr-grid">
        {placeholderReviews.map((review, i) => (
          <div key={i} className="pr-card">
            <div className="pr-stars">{"★".repeat(review.rating)}</div>
            <p className="pr-text">"{review.text}"</p>
            <div className="pr-author">{review.name}</div>
            <div className="pr-date">{review.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── FRAGRANCES: FEATURED PRODUCTS ─────────────────────────── */
export interface PerfumesFeaturedProductsProps {
  title?: string;
  subtitle?: string;
}
export function PerfumesFeaturedProducts({ title = "Featured Fragrances", subtitle = "Our most beloved scents" }: PerfumesFeaturedProductsProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const products = storeCtx?.products || [];
  const storeSlug = storeCtx?.storeSlug || "";
  const currency = storeCtx?.currency || "USD";
  const featuredProducts = products.slice(0, 6);
  const formatPrice = (price: number) => `${currency} ${price.toFixed(2)}`;

  const css = `
    .pfp-section { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px 80px; }
    .pfp-header { text-align: center; margin-bottom: 50px; }
    .pfp-title { font-family: ${TOKENS.titleFont}; font-size: 42px; font-weight: 400; color: ${TOKENS.primaryColor}; margin: 0 0 15px; }
    .pfp-subtitle { font-family: ${TOKENS.bodyFont}; font-size: 16px; color: ${TOKENS.textColor}; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
    .pfp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
    .pfp-card { background: #fff; }
    .pfp-card-img-wrap { position: relative; overflow: hidden; aspect-ratio: 1; }
    .pfp-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .pfp-card:hover .pfp-card-img { transform: scale(1.05); }
    .pfp-card-name { font-family: ${TOKENS.titleFont}; font-size: 20px; font-weight: 500; color: ${TOKENS.primaryColor}; margin: 20px 0 10px; }
    .pfp-card-price { font-family: ${TOKENS.bodyFont}; font-size: 16px; color: ${TOKENS.textColor}; }
    .pfp-empty { text-align: center; padding: 60px 20px; font-family: ${TOKENS.bodyFont}; color: ${TOKENS.textColor}; }
    @media (max-width: 1024px) { .pfp-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .pfp-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <div>
      <ScopedStyles id="featured-products" css={css} />
      <div className="pfp-section">
        <div className="pfp-header">
          <h2 className="pfp-title">{title}</h2>
          <p className="pfp-subtitle">{subtitle}</p>
        </div>
        {featuredProducts.length === 0 ? (
          <div className="pfp-empty">No featured products available yet.</div>
        ) : (
          <div className="pfp-grid">
            {featuredProducts.map((p: any) => (
              <div key={p.id} className="pfp-card">
                <div className="pfp-card-img-wrap">
                  <Link href={resolveStoreLink(`/product/${p.slug}`, storeSlug)}>
                    <img src={p.images?.[0]?.url || safeSrc(null, p.name)} alt={p.name} className="pfp-card-img" loading="lazy" onError={(e: any) => onImgError(e, p.name)} />
                  </Link>
                </div>
                <h3 className="pfp-card-name"><Link href={resolveStoreLink(`/product/${p.slug}`, storeSlug)}>{p.name}</Link></h3>
                <div className="pfp-card-price">{formatPrice(p.price)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── JOURNAL: FEATURED POSTS ───────────────────────────────── */
export interface PerfumesFeaturedPostsProps {
  title?: string;
  subtitle?: string;
}
export function PerfumesFeaturedPosts({ title = "Latest Stories", subtitle = "Discover the art of fragrance" }: PerfumesFeaturedPostsProps) {
  const storeCtx = useContext(PerfumesStoreContext);
  const blogs = storeCtx?.blogs || [];
  const storeSlug = storeCtx?.storeSlug || "";
  const featuredPosts = blogs.slice(0, 3);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

  const css = `
    .pfp-posts-section { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px 80px; }
    .pfp-posts-header { text-align: center; margin-bottom: 50px; }
    .pfp-posts-title { font-family: ${TOKENS.titleFont}; font-size: 42px; font-weight: 400; color: ${TOKENS.primaryColor}; margin: 0 0 15px; }
    .pfp-posts-subtitle { font-family: ${TOKENS.bodyFont}; font-size: 16px; color: ${TOKENS.textColor}; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
    .pfp-posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
    .pfp-post-card { background: #fff; }
    .pfp-post-img-wrap { position: relative; overflow: hidden; aspect-ratio: 1; }
    .pfp-post-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .pfp-post-card:hover .pfp-post-img { transform: scale(1.05); }
    .pfp-post-title { font-family: ${TOKENS.titleFont}; font-size: 22px; font-weight: 500; color: ${TOKENS.primaryColor}; margin: 20px 0 10px; }
    .pfp-post-date { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; }
    .pfp-posts-empty { text-align: center; padding: 60px 20px; font-family: ${TOKENS.bodyFont}; color: ${TOKENS.textColor}; }
    @media (max-width: 1024px) { .pfp-posts-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .pfp-posts-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <div>
      <ScopedStyles id="featured-posts" css={css} />
      <div className="pfp-posts-section">
        <div className="pfp-posts-header">
          <h2 className="pfp-posts-title">{title}</h2>
          <p className="pfp-posts-subtitle">{subtitle}</p>
        </div>
        {featuredPosts.length === 0 ? (
          <div className="pfp-posts-empty">No journal posts available yet.</div>
        ) : (
          <div className="pfp-posts-grid">
            {featuredPosts.map((post: any) => (
              <div key={post.id} className="pfp-post-card">
                <div className="pfp-post-img-wrap">
                  <Link href={resolveStoreLink(`/blog/${post.slug}`, storeSlug)}>
                    <img src={post.coverImage || safeSrc(null, post.title)} alt={post.title} className="pfp-post-img" loading="lazy" onError={(e: any) => onImgError(e, post.title)} />
                  </Link>
                </div>
                <h3 className="pfp-post-title"><Link href={resolveStoreLink(`/blog/${post.slug}`, storeSlug)}>{post.title}</Link></h3>
                <div className="pfp-post-date">{formatDate(post.publishedAt || post.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
