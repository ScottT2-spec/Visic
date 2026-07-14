"use client";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { toggleCompare as toggleCompareItem } from "@/lib/compare-utils";
import { safeSrc, onImgError } from "./image-fallback";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";

/* ═══════════════════════════════════════════════════════════════
   FASHION TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Fashion template sections.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "var(--color-primary)",
  primaryHover: "var(--color-primary)", // Will use CSS filter for hover effect
  titleColor: "var(--color-text)",
  textColor: "var(--color-muted-text)",
  entityTitleColor: "var(--color-text)",
  linkColor: "var(--color-text)",
  starColor: "var(--color-accent)",
  footerBg: "var(--color-background)",
  containerWidth: "1222px",
  borderRadius: "0px",
  titleFont: "'Montserrat', Arial, Helvetica, sans-serif",
  bodyFont: "'Lato', Arial, Helvetica, sans-serif",
};

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function FashionFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Montserrat:wght@700&display=swap');
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
  return <style data-fashion-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
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

/* ═══════════════════════════════════════════════════════════════
   1. FASHION HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */

export interface FashionHeroSlide {
  subtitle: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  textPosition?: "left" | "center" | "right";
  colorScheme?: "dark" | "light";
}

export interface FashionHeroSliderProps {
  slides: FashionHeroSlide[];
  autoplaySpeed?: number;
  minHeight?: string;
}

export function FashionHeroSlider({ slides, autoplaySpeed = 5000, minHeight = "560px" }: FashionHeroSliderProps) {
  const storeCtx = useContext(FashionStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(idx);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, autoplaySpeed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, autoplaySpeed]);

  const scopedCss = `
    .fh-slider { position: relative; width: 100%; overflow: hidden; background: #f9f9f9; }
    .fh-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .fh-slide.fh-active { opacity: 1; position: relative; }
    .fh-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center center; z-index: 0; }
    .fh-slide-content { position: relative; z-index: 2; width: 100%; }
    .fh-subtitle { 
      color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 700; 
      font-size: 18px; font-family: ${TOKENS.bodyFont}; margin-bottom: 20px;
    }
    .fh-title { 
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 38px; 
      line-height: 48px; margin: 0 0 15px; 
    }
    .fh-title-dark { color: ${TOKENS.titleColor}; }
    .fh-title-light { color: #ffffff; }
    .fh-desc { 
      font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 1.6;
      max-width: 380px; margin: 0 auto 20px; 
    }
    .fh-desc-dark { color: ${TOKENS.textColor}; }
    .fh-desc-light { color: rgba(255,255,255,0.85); }
    .fh-btn { 
      display: inline-block; padding: 12px 30px; 
      background: ${TOKENS.primaryColor}; color: #fff; text-transform: uppercase;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px;
      text-decoration: none; border: none; cursor: pointer; border-radius: 25px;
      transition: background-color 0.3s ease; letter-spacing: 0.5px;
    }
    .fh-btn:hover { filter: brightness(0.9); }
    .fh-dots { 
      position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 10px; z-index: 5; 
    }
    .fh-dot { 
      width: 10px; height: 10px; border-radius: 50%; border: none; cursor: pointer;
      background: rgba(255,255,255,0.5); transition: background 0.3s ease; padding: 0;
    }
    .fh-dot.fh-dot-active { background: #ffffff; }
    .fh-anim-in { 
      animation: fhSlideUp 0.6s ease forwards; opacity: 0; 
    }
    @keyframes fhSlideUp { 
      from { opacity: 0; transform: translateY(30px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
    @media (max-width: 1024px) {
      .fh-slider { min-height: 500px !important; }
      .fh-title { font-size: 28px; line-height: 36px; }
    }
    @media (max-width: 767px) {
      .fh-slider { min-height: 400px !important; }
      .fh-title { font-size: 23px; line-height: 33px; }
      .fh-subtitle { font-size: 14px; }
      .fh-desc { font-size: 14px; }
    }
  `;

  return (
    <div className="fh-slider" style={{ minHeight }}>
      <ScopedStyles id="hero-slider" css={scopedCss} />
      {slides.map((slide, i) => {
        const scheme = slide.colorScheme || "dark";
        const align = slide.textPosition || "center";
        return (
          <div key={i} className={`fh-slide ${i === current ? "fh-active" : ""}`}>
            <div className="fh-slide-bg" style={{ backgroundImage: `url(${slide.backgroundImage})` }} />
            <div className="fh-slide-content">
              <div style={{ ...containerStyle, textAlign: align as React.CSSProperties["textAlign"] }}>
                <div style={{ maxWidth: align === "center" ? "65%" : "50%", margin: align === "center" ? "0 auto" : align === "right" ? "0 0 0 auto" : "0", padding: "40px 0" }}>
                  {i === current && (
                    <>
                      <div className="fh-subtitle fh-anim-in" style={{ animationDelay: "0.2s" }}>{slide.subtitle}</div>
                      <div className={`fh-title fh-title-${scheme} fh-anim-in`} style={{ animationDelay: "0.3s" }}>{slide.titleLine1}</div>
                      <div className={`fh-title fh-title-${scheme} fh-anim-in`} style={{ animationDelay: "0.4s" }}>{slide.titleLine2}</div>
                      <div className={`fh-desc fh-desc-${scheme} fh-anim-in`} style={{ animationDelay: "0.5s", marginLeft: align === "center" ? "auto" : undefined, marginRight: align === "center" ? "auto" : undefined }}>{slide.description}</div>
                      <div className="fh-anim-in" style={{ animationDelay: "0.6s" }}>
                        <Link href={fixLink(slide.buttonLink)} className="fh-btn">{slide.buttonText}</Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {slides.length > 1 && (
        <div className="fh-dots">
          {slides.map((_, i) => (
            <button key={i} className={`fh-dot ${i === current ? "fh-dot-active" : ""}`} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. FASHION PROMO BANNERS
   ═══════════════════════════════════════════════════════════════ */

export interface FashionPromoBanner {
  image: string;
  subtitle: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  textAlign?: "left" | "center" | "right";
}

export interface FashionPromoBannersProps {
  banners: FashionPromoBanner[];
}

export function FashionPromoBanners({ banners }: FashionPromoBannersProps) {
  const storeCtx = useContext(FashionStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);
  const scopedCss = `
    .fp-banners { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 80px; }
    .fp-banner { position: relative; overflow: hidden; cursor: pointer; }
    .fp-banner-img-wrap { overflow: hidden; }
    .fp-banner-img { 
      width: 100%; height: auto; display: block; 
      transition: transform 0.6s ease; 
    }
    .fp-banner:hover .fp-banner-img { transform: scale(1.1); }
    .fp-banner-overlay { 
      position: absolute; inset: 0; display: flex; align-items: center;
      z-index: 2; padding: 20px 30px; 
    }
    .fp-banner-subtitle { 
      color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 700;
      font-size: 14px; font-family: ${TOKENS.bodyFont}; margin-bottom: 5px; 
    }
    .fp-banner-title { 
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 26px;
      color: ${TOKENS.titleColor}; line-height: 1.2; margin: 0 0 12px;
      white-space: pre-line;
    }
    .fp-banner-btn { 
      color: ${TOKENS.primaryColor}; font-family: ${TOKENS.bodyFont}; font-size: 13px;
      text-transform: uppercase; font-weight: 600; text-decoration: none;
      position: relative; display: inline-block; letter-spacing: 0.5px;
    }
    .fp-banner-btn::after { 
      content: ''; position: absolute; bottom: -2px; left: 0; width: 100%;
      height: 2px; background: ${TOKENS.primaryColor}; 
      transform: scaleX(0); transform-origin: right; transition: transform 0.3s ease; 
    }
    .fp-banner:hover .fp-banner-btn::after { transform: scaleX(1); transform-origin: left; }
    .fp-banner-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { 
      .fp-banners { grid-template-columns: repeat(3, 1fr); gap: 20px; } 
      .fp-banner-title { font-size: 22px; }
    }
    @media (max-width: 767px) { 
      .fp-banners { grid-template-columns: 1fr; gap: 15px; } 
    }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="promo-banners" css={scopedCss} />
      <div className="fp-banners">
        {banners.map((b, i) => {
          const justify = b.textAlign === "right" ? "flex-end" : b.textAlign === "left" ? "flex-start" : "center";
          return (
            <div key={i} className="fp-banner">
              <div className="fp-banner-img-wrap">
                <img src={b.image} alt={b.title} className="fp-banner-img" loading="lazy" />
              </div>
              <div className="fp-banner-overlay" style={{ justifyContent: justify }}>
                <div style={{ textAlign: b.textAlign || "center" }}>
                  <div className="fp-banner-subtitle">{b.subtitle}</div>
                  <h4 className="fp-banner-title">{b.title}</h4>
                  <div className="fp-banner-btn">{b.buttonText}</div>
                </div>
              </div>
              <Link href={fixLink(b.buttonLink)} className="fp-banner-link" aria-label={b.title} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. FASHION SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface FashionSectionTitleProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  maxWidth?: string;
  titleColor?: "primary" | "white";
}

export function FashionSectionTitle({ subtitle, title, description, align = "center", maxWidth = "40%", titleColor = "primary" }: FashionSectionTitleProps) {
  const scopedCss = `
    .fst-wrapper { margin-bottom: 25px; }
    .fst-subtitle { 
      color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 700;
      font-size: 14px; font-family: ${TOKENS.bodyFont}; margin-bottom: 8px;
    }
    .fst-title { 
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 36px;
      text-transform: uppercase; margin: 0 0 15px; line-height: 1.2;
    }
    .fst-title-primary { color: ${TOKENS.titleColor}; }
    .fst-title-white { color: #ffffff; }
    .fst-desc { 
      font-family: ${TOKENS.bodyFont}; font-size: 16px; color: ${TOKENS.textColor};
      line-height: 1.6; margin: 0;
    }
    .fst-desc-light { color: rgba(255,255,255,0.7); }
    @media (max-width: 1024px) {
      .fst-title { font-size: 28px; }
      .fst-inner { max-width: 70% !important; }
    }
    @media (max-width: 767px) {
      .fst-title { font-size: 22px; }
      .fst-inner { max-width: 90% !important; }
    }
  `;

  return (
    <div className="fst-wrapper" style={{ textAlign: align as React.CSSProperties["textAlign"] }}>
      <ScopedStyles id="section-title" css={scopedCss} />
      <div className="fst-inner" style={{ maxWidth, margin: align === "center" ? "0 auto" : undefined, display: "inline-block", width: "100%" }}>
        {subtitle && <div className="fst-subtitle">{subtitle}</div>}
        <h4 className={`fst-title fst-title-${titleColor}`}>{title}</h4>
        {description && <p className={`fst-desc ${titleColor === "white" ? "fst-desc-light" : ""}`}>{description}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. FASHION PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */

export interface FashionProduct {
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
  variants?: FashionProductVariant[];
}

/** Variant type for product swatches */
export interface FashionProductVariant {
  id: string;
  name: string;
  price: number | null;
  stock: number;
  inStock: boolean;
  options: Record<string, string> | null;
  image: string | null;
}

/** Map color names → hex for swatch rendering */
const COLOR_MAP: Record<string, string> = {
  black: "#000000", white: "#FFFFFF", red: "#DC2626", blue: "#2563EB", green: "#16A34A",
  yellow: "#EAB308", orange: "#EA580C", purple: "#9333EA", pink: "#EC4899", brown: "#92400E",
  grey: "#6B7280", gray: "#6B7280", navy: "#1E3A5F", beige: "#F5F5DC", cream: "#FFFDD0",
  coral: "#FF7F50", maroon: "#800000", teal: "#0D9488", olive: "#808000", gold: "#D4AF37",
  silver: "#C0C0C0", burgundy: "#800020", charcoal: "#36454F", ivory: "#FFFFF0", khaki: "#C3B091",
  lavender: "#E6E6FA", mint: "#98FF98", mustard: "#FFDB58", peach: "#FFCBA4", plum: "#8E4585",
  rust: "#B7410E", sage: "#BCB88A", salmon: "#FA8072", sand: "#C2B280", slate: "#708090",
  tan: "#D2B48C", taupe: "#483C32", turquoise: "#40E0D0", wine: "#722F37", camel: "#C19A6B",
  chocolate: "#7B3F00", copper: "#B87333", denim: "#1560BD", emerald: "#50C878", fuchsia: "#FF00FF",
  indigo: "#4B0082", magenta: "#FF00FF", mauve: "#E0B0FF", rose: "#FF007F", sapphire: "#0F52BA",
  scarlet: "#FF2400", sky: "#87CEEB", stone: "#928E85", violet: "#7F00FF", wheat: "#F5DEB3",
};

function resolveColorHex(colorName: string): string | null {
  const lower = colorName.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  // Check if it's already a hex code
  if (/^#[0-9a-fA-F]{3,8}$/.test(lower)) return lower;
  // Partial match (e.g. "light blue" → "blue")
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

/** Context bridge — lets fashion blocks access real store products and blogs */
export interface FashionStoreContextData {
  products: Array<{
    id: string; name: string; slug: string; price: number; compareAtPrice?: number;
    currency: string; inStock: boolean; isFeatured: boolean; tags?: string[];
    images: Array<{ id: string; url: string; alt?: string }>;
    category?: { id: string; name: string; slug: string };
    variants?: FashionProductVariant[];
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
export const FashionStoreContext = createContext<FashionStoreContextData | null>(null);

export interface FashionProductGridProps {
  products?: FashionProduct[];
  columns?: number;
  showCategory?: boolean;
  showHoverImage?: boolean;
  sectionTitle?: { subtitle?: string; title: string; description?: string };
  marginBottom?: string;
  maxProducts?: number;
  filter?: "featured" | "bestseller" | "new-arrival" | "sale" | "all";
  filterTag?: string;
}

export function FashionProductGrid({ products: propProducts, columns = 4, showCategory = true, showHoverImage = true, sectionTitle, marginBottom = "60px", maxProducts = 8, filter, filterTag }: FashionProductGridProps) {
  const storeCtx = useContext(FashionStoreContext);
  const [, setCompareState] = useState(false);

  // Convert real store products to FashionProduct format
  const products: FashionProduct[] = (() => {
    // If no store context, use placeholder products from props
    if (!storeCtx || !storeCtx.products || storeCtx.products.length === 0) return propProducts || [];
    
    let storeProducts = storeCtx.products;
    
    // Filter by featured flag
    if (filter === "featured") {
      const featured = storeProducts.filter(p => p.isFeatured);
      if (featured.length > 0) storeProducts = featured;
    }
    // Filter by tag (bestseller, new-arrival, etc.)
    else if (filter === "bestseller" || filter === "new-arrival" || filter === "sale") {
      const tagged = storeProducts.filter(p => 
        p.tags?.some((t: string) => t.toLowerCase() === filter!.toLowerCase() || t.toLowerCase().replace(/[-_ ]/g, "") === filter!.toLowerCase().replace(/[-_ ]/g, ""))
      );
      if (tagged.length > 0) storeProducts = tagged;
    }
    // Custom tag filter
    if (filterTag) {
      const tagged = storeProducts.filter(p => 
        p.tags?.some((t: string) => t.toLowerCase() === filterTag.toLowerCase())
      );
      if (tagged.length > 0) storeProducts = tagged;
    }

    // If filtering returned no results, fall back to placeholder products
    if (storeProducts.length === 0) return propProducts || [];

    const currencySymbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
    const sym = currencySymbols[storeCtx.currency] || storeCtx.currency;

    return storeProducts.slice(0, maxProducts).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category?.name,
      categoryLink: p.category?.slug ? `/store/${storeCtx.storeSlug}/shop?category=${p.category.slug}` : undefined,
      price: p.compareAtPrice ? `${sym}${p.compareAtPrice.toLocaleString()}` : `${sym}${p.price.toLocaleString()}`,
      salePrice: p.compareAtPrice ? `${sym}${p.price.toLocaleString()}` : undefined,
      image: p.images[0]?.url || safeSrc(null, p.name),
      hoverImage: p.images[1]?.url,
      link: `/store/${storeCtx.storeSlug}/product/${p.slug}`,
      badge: p.compareAtPrice ? "SALE" : p.isFeatured ? "FEATURED" : undefined,
      variants: (p as any).variants || [],
    }));
  })();
  const scopedCss = `
    .fpg-section { margin-bottom: ${marginBottom}; }
    .fpg-grid { 
      display: grid; grid-template-columns: repeat(${columns}, 1fr); 
      gap: 20px; 
    }
    .fpg-card { position: relative; }
    .fpg-thumb { position: relative; overflow: hidden; margin-bottom: 12px; }
    .fpg-img { width: 100%; height: auto; display: block; transition: opacity 0.5s ease; }
    .fpg-hover-img { 
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      opacity: 0; transition: opacity 0.5s ease; 
    }
    .fpg-card:hover .fpg-hover-img { opacity: 1; }
    .fpg-card:hover .fpg-main-img { opacity: 0; }
    .fpg-actions { 
      position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column;
      gap: 5px; opacity: 0; transform: translateX(10px); transition: all 0.3s ease; z-index: 3;
    }
    .fpg-card:hover .fpg-actions { opacity: 1; transform: translateX(0); }
    .fpg-action-btn { 
      width: 35px; height: 35px; border-radius: 50%; background: #fff;
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: background 0.2s; font-size: 14px;
    }
    .fpg-action-btn:hover { background: ${TOKENS.primaryColor}; color: #fff; }
    .fpg-name { 
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 14px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 4px; line-height: 1.4;
    }
    .fpg-name a { color: inherit; text-decoration: none; transition: color 0.2s; }
    .fpg-name a:hover { color: rgba(51,51,51,0.65); }
    .fpg-cat { 
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
      margin-bottom: 6px;
    }
    .fpg-cat a { color: inherit; text-decoration: none; }
    .fpg-price { 
      color: ${TOKENS.primaryColor}; font-weight: 600; font-size: 14px;
      font-family: ${TOKENS.bodyFont};
    }
    .fpg-price-old { 
      text-decoration: line-through; color: #999; font-weight: 400; 
      margin-right: 8px; font-size: 13px;
    }
    .fpg-badge { 
      position: absolute; top: 10px; left: 10px; background: ${TOKENS.primaryColor};
      color: #fff; font-size: 11px; font-weight: 600; text-transform: uppercase;
      padding: 3px 10px; z-index: 3;
    }
    .fpg-add-btn { 
      position: absolute; bottom: 0; left: 0; right: 0; 
      background: ${TOKENS.primaryColor}; color: #fff; border: none; 
      padding: 10px; text-transform: uppercase; font-weight: 600; font-size: 12px;
      font-family: ${TOKENS.bodyFont}; cursor: pointer; opacity: 0;
      transform: translateY(100%); transition: all 0.3s ease;
    }
    .fpg-card:hover .fpg-add-btn { opacity: 1; transform: translateY(0); }
    .fpg-swatches { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
    .fpg-swatch {
      width: 18px; height: 18px; border-radius: 50%; border: 2px solid #e5e5e5;
      cursor: pointer; transition: border-color 0.2s, transform 0.2s; flex-shrink: 0;
    }
    .fpg-swatch:hover { border-color: ${TOKENS.primaryColor}; transform: scale(1.15); }
    .fpg-size-chips { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
    .fpg-size-chip {
      padding: 2px 8px; font-size: 11px; font-family: ${TOKENS.bodyFont};
      border: 1px solid #ddd; color: ${TOKENS.textColor}; cursor: pointer;
      transition: border-color 0.2s; line-height: 1.4;
    }
    .fpg-size-chip:hover { border-color: ${TOKENS.primaryColor}; color: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) { .fpg-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .fpg-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  `;

  // Fix broken links — ensure they point to proper product pages
  const resolveProductLink = (link: string, productName: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `/store/${storeCtx.storeSlug}/product/${slug}`;
    }
    return resolveStoreLink(link, storeCtx?.storeSlug);
  };

  if (products.length === 0) {
    return (
      <div className="fpg-section" style={containerStyle}>
        <ScopedStyles id="product-grid" css={scopedCss} />
        {sectionTitle && (
          <FashionSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} description={sectionTitle.description} />
        )}
        <div style={{ textAlign: "center", padding: "40px 20px", color: TOKENS.textColor, fontFamily: TOKENS.bodyFont }}>
          <p>No products yet. Add products from your dashboard to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fpg-section" style={containerStyle}>
      <ScopedStyles id="product-grid" css={scopedCss} />
      {sectionTitle && (
        <FashionSectionTitle
          subtitle={sectionTitle.subtitle}
          title={sectionTitle.title}
          description={sectionTitle.description}
        />
      )}
      <div className="fpg-grid">
        {products.map((p) => {
          const productLink = resolveProductLink(p.link, p.name);
          return (
          <div key={p.id} className="fpg-card">
            <div className="fpg-thumb">
              <Link href={productLink}>
                <img src={p.image || safeSrc(null, p.name)} alt={p.name} className="fpg-img fpg-main-img" loading="lazy" onError={(e) => onImgError(e, p.name)} />
                {showHoverImage && p.hoverImage && (
                  <img src={p.hoverImage} alt={p.name} className="fpg-hover-img" loading="lazy" />
                )}
              </Link>
              {p.badge && <span className="fpg-badge">{p.badge}</span>}
              <div className="fpg-actions">
                <button className="fpg-action-btn" title="Compare" aria-label="Compare" onClick={() => { toggleCompareItem({ id: String(p.id), name: p.name, slug: (p as any).slug || p.name, price: p.price, image: p.image }, storeCtx?.storeSlug); setCompareState(prev => !prev); }}>⇌</button>
                <button className="fpg-action-btn" title="Quick view" aria-label="Quick view" onClick={() => storeCtx?.onQuickView?.(String(p.id))}>👁</button>
                <button className="fpg-action-btn" title="Wishlist" aria-label="Wishlist" onClick={() => storeCtx?.toggleWishlist?.(String(p.id))} style={storeCtx?.isWishlisted?.(String(p.id)) ? { color: "red" } : undefined}>{storeCtx?.isWishlisted?.(String(p.id)) ? "♥" : "♡"}</button>
              </div>
              {p.variants && p.variants.length > 0 ? (
                <Link href={productLink} className="fpg-add-btn" style={{ textAlign: "center", textDecoration: "none" }}>Select options</Link>
              ) : (
                <button className="fpg-add-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
              )}
            </div>
            <h3 className="fpg-name"><Link href={productLink}>{p.name}</Link></h3>
            {showCategory && p.category && (
              <div className="fpg-cat">
                <Link href={resolveStoreLink(p.categoryLink, storeCtx?.storeSlug)}>{p.category}</Link>
              </div>
            )}
            <div className="fpg-price">
              {p.salePrice && <span className="fpg-price-old">{p.price}</span>}
              <span>{p.salePrice || p.price}</span>
            </div>
            {(() => {
              if (!p.variants || p.variants.length === 0) return null;
              const colorVariants = p.variants.filter(v => v.options && (v.options.color || v.options.Color || v.options.COLOR));
              const sizeVariants = p.variants.filter(v => v.options && (v.options.size || v.options.Size || v.options.SIZE));
              return (
                <>
                  {colorVariants.length > 0 && (
                    <div className="fpg-swatches">
                      {colorVariants.slice(0, 6).map(v => {
                        const colorName = v.options!.color || v.options!.Color || v.options!.COLOR || "";
                        const hex = resolveColorHex(colorName);
                        return (
                          <Link key={v.id} href={`${productLink}?variant=${v.id}`} title={v.name || colorName}>
                            <span className="fpg-swatch" style={{ background: hex || "#ccc", borderColor: hex === "#FFFFFF" ? "#ccc" : "#e5e5e5" }} />
                          </Link>
                        );
                      })}
                      {colorVariants.length > 6 && <span style={{ fontSize: 11, color: TOKENS.textColor, lineHeight: "18px" }}>+{colorVariants.length - 6}</span>}
                    </div>
                  )}
                  {sizeVariants.length > 0 && colorVariants.length === 0 && (
                    <div className="fpg-size-chips">
                      {sizeVariants.slice(0, 5).map(v => {
                        const sizeName = v.options!.size || v.options!.Size || v.options!.SIZE || "";
                        return (
                          <Link key={v.id} href={`${productLink}?variant=${v.id}`} className="fpg-size-chip" title={v.name || sizeName}>
                            {sizeName}
                          </Link>
                        );
                      })}
                      {sizeVariants.length > 5 && <span style={{ fontSize: 11, color: TOKENS.textColor }}>+{sizeVariants.length - 5}</span>}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. FASHION CATEGORY CARDS
   ═══════════════════════════════════════════════════════════════ */

export interface FashionCategoryCard {
  name: string;
  image: string;
  productCount?: number;
  link: string;
}

export interface FashionCategoryCardsProps {
  categories: FashionCategoryCard[];
  columns?: number;
  sectionTitle?: { subtitle?: string; title: string; description?: string };
  marginBottom?: string;
}

export function FashionCategoryCards({ categories, columns = 4, sectionTitle, marginBottom = "50px" }: FashionCategoryCardsProps) {
  const storeCtx = useContext(FashionStoreContext);

  // Resolve category links to proper store URLs
  const resolveCatLink = (link: string, catName: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `/store/${storeCtx.storeSlug}/shop?category=${catSlug}`;
    }
    return resolveStoreLink(link, storeCtx?.storeSlug);
  };
  const scopedCss = `
    .fcc-section { margin-bottom: ${marginBottom}; }
    .fcc-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .fcc-card { 
      position: relative; overflow: hidden; cursor: pointer;
      aspect-ratio: 3/4;
    }
    .fcc-img { 
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.6s ease;
    }
    .fcc-card:hover .fcc-img { transform: scale(1.05); }
    .fcc-overlay { 
      position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; z-index: 2;
      background: rgba(0,0,0,0); transition: background 0.3s ease;
    }
    .fcc-card:hover .fcc-overlay { background: rgba(0,0,0,0.15); }
    .fcc-name { 
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 18px;
      color: #fff; text-transform: uppercase; margin: 0 0 5px;
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
    }
    .fcc-count { 
      font-family: ${TOKENS.bodyFont}; font-size: 13px; 
      color: rgba(255,255,255,0.85); text-shadow: 0 1px 3px rgba(0,0,0,0.4);
    }
    .fcc-count a { color: inherit; text-decoration: none; }
    .fcc-count a:hover { text-decoration: underline; }
    .fcc-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { .fcc-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .fcc-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  `;

  return (
    <div className="fcc-section" style={containerStyle}>
      <ScopedStyles id="category-cards" css={scopedCss} />
      {sectionTitle && (
        <FashionSectionTitle
          subtitle={sectionTitle.subtitle}
          title={sectionTitle.title}
          description={sectionTitle.description}
        />
      )}
      <div className="fcc-grid">
        {categories.map((c, i) => (
          <div key={i} className="fcc-card">
            <img src={c.image} alt={c.name} className="fcc-img" loading="lazy" />
            <div className="fcc-overlay">
              <h3 className="fcc-name">{c.name}</h3>
              {c.productCount !== undefined && (
                <div className="fcc-count">
                  <Link href={resolveCatLink(c.link, c.name)}>{c.productCount} products</Link>
                </div>
              )}
            </div>
            <Link href={resolveCatLink(c.link, c.name)} className="fcc-link" aria-label={c.name} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. FASHION TESTIMONIALS
   ═══════════════════════════════════════════════════════════════ */

export interface FashionTestimonial {
  avatar: string;
  text: string;
  name: string;
  role: string;
  rating: number;
}

export interface FashionTestimonialsProps {
  title?: string;
  backgroundImage: string;
  testimonials: FashionTestimonial[];
}

export function FashionTestimonials({ title = "CUSTOMERS REVIEWS", backgroundImage, testimonials }: FashionTestimonialsProps) {
  const [current, setCurrent] = useState(0);

  const scopedCss = `
    .ft-section { 
      position: relative; padding: 90px 0 80px; margin-bottom: 0;
      background-size: cover; background-position: center; background-repeat: no-repeat;
    }
    .ft-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); z-index: 1; }
    .ft-content { position: relative; z-index: 2; }
    .ft-title { 
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 36px;
      color: #fff; text-transform: uppercase; text-align: center; margin: 0 0 20px;
    }
    .ft-quote { text-align: center; margin-bottom: 30px; }
    .ft-quote svg { width: 35px; height: 35px; fill: rgba(255,255,255,0.6); }
    .ft-carousel { max-width: 65%; margin: 0 auto; text-align: center; }
    .ft-avatar { 
      width: 70px; height: 70px; border-radius: 50%; object-fit: cover;
      margin: 0 auto 15px; display: block;
    }
    .ft-stars { margin-bottom: 15px; }
    .ft-star { color: ${TOKENS.starColor}; font-size: 16px; letter-spacing: 3px; }
    .ft-star-empty { color: rgba(255,255,255,0.3); }
    .ft-text { 
      font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 1.7;
      color: rgba(255,255,255,0.85); margin-bottom: 20px;
    }
    .ft-author { 
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 15px;
      color: #fff; margin: 0;
    }
    .ft-role { 
      font-family: ${TOKENS.bodyFont}; font-size: 13px; 
      color: rgba(255,255,255,0.6); display: block; margin-top: 3px;
    }
    .ft-nav { display: flex; justify-content: center; gap: 20px; margin-top: 30px; }
    .ft-nav-btn { 
      width: 40px; height: 40px; border: 1px solid rgba(255,255,255,0.3);
      background: transparent; color: #fff; cursor: pointer; font-size: 18px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease; border-radius: 0;
    }
    .ft-nav-btn:hover { background: rgba(255,255,255,0.15); }
    .ft-dots { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
    .ft-tdot { 
      width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer;
      background: rgba(255,255,255,0.3); transition: background 0.3s; padding: 0;
    }
    .ft-tdot.ft-tdot-active { background: #fff; }
    @media (max-width: 1024px) {
      .ft-carousel { max-width: 80%; }
      .ft-title { font-size: 28px; }
    }
    @media (max-width: 767px) {
      .ft-section { padding: 60px 0 50px; }
      .ft-carousel { max-width: 95%; }
      .ft-title { font-size: 22px; }
    }
  `;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "ft-star" : "ft-star ft-star-empty"}>★</span>
    ));
  };

  const t = testimonials[current];
  if (!t) return null;

  return (
    <div className="ft-section" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <ScopedStyles id="testimonials" css={scopedCss} />
      <div className="ft-overlay" />
      <div className="ft-content" style={containerStyle}>
        <h4 className="ft-title">{title}</h4>
        <div className="ft-quote">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
          </svg>
        </div>
        <div className="ft-carousel">
          <img src={t.avatar} alt={t.name} className="ft-avatar" />
          <div className="ft-stars">{renderStars(t.rating)}</div>
          <p className="ft-text">{t.text}</p>
          <p className="ft-author">
            {t.name}
            <span className="ft-role">{t.role}</span>
          </p>
        </div>
        {testimonials.length > 1 && (
          <>
            <div className="ft-nav">
              <button className="ft-nav-btn" onClick={() => setCurrent((current - 1 + testimonials.length) % testimonials.length)} aria-label="Previous">‹</button>
              <button className="ft-nav-btn" onClick={() => setCurrent((current + 1) % testimonials.length)} aria-label="Next">›</button>
            </div>
            <div className="ft-dots">
              {testimonials.map((_, i) => (
                <button key={i} className={`ft-tdot ${i === current ? "ft-tdot-active" : ""}`} onClick={() => setCurrent(i)} aria-label={`Testimonial ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. FASHION BLOG POSTS
   ═══════════════════════════════════════════════════════════════ */

export interface FashionBlogPost {
  image: string;
  title: string;
  excerpt: string;
  date: { day: string; month: string };
  categories: string[];
  author: { name: string; avatar?: string };
  link: string;
  commentCount?: number;
}

export interface FashionBlogPostsProps {
  posts: FashionBlogPost[];
  columns?: number;
  sectionTitle?: { subtitle?: string; title: string; description?: string };
  marginBottom?: string;
}

export function FashionBlogPosts({ posts: propPosts, columns = 2, sectionTitle, marginBottom = "30px" }: FashionBlogPostsProps) {
  const storeCtx = useContext(FashionStoreContext);

  // Convert real store blogs to FashionBlogPost format (same pattern as product grid)
  const posts: FashionBlogPost[] = (() => {
    if (!storeCtx || !storeCtx.blogs || storeCtx.blogs.length === 0) return propPosts || [];

    return storeCtx.blogs.slice(0, columns * 2).map((b) => {
      const pubDate = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
      const day = pubDate.getDate().toString().padStart(2, "0");
      const month = pubDate.toLocaleString("en-US", { month: "short" });

      return {
        image: b.coverImage || "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop",
        title: b.title,
        excerpt: b.excerpt || "",
        date: { day, month },
        categories: b.category ? [b.category] : [],
        author: { name: b.author || "Store Team" },
        link: `/store/${storeCtx.storeSlug}/blog/${b.slug}`,
        commentCount: 0,
      };
    });
  })();
  const scopedCss = `
    .fbp-section { margin-bottom: ${marginBottom}; }
    .fbp-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .fbp-card { display: flex; overflow: hidden; background: #fff; }
    .fbp-card:nth-child(even) { flex-direction: row-reverse; }
    .fbp-img-wrap { position: relative; flex: 0 0 45%; overflow: hidden; }
    .fbp-img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 250px; }
    .fbp-date-badge { 
      position: absolute; top: 15px; left: 15px; background: ${TOKENS.primaryColor};
      color: #fff; text-align: center; padding: 8px 12px; z-index: 2;
    }
    .fbp-date-day { display: block; font-size: 20px; font-weight: 700; line-height: 1; font-family: ${TOKENS.bodyFont}; }
    .fbp-date-month { display: block; font-size: 11px; text-transform: uppercase; font-family: ${TOKENS.bodyFont}; }
    .fbp-content { flex: 1; padding: 25px 20px; display: flex; flex-direction: column; justify-content: center; }
    .fbp-cats { margin-bottom: 8px; display: flex; gap: 5px; flex-wrap: wrap; }
    .fbp-cat { 
      background: #f0f0f0; color: ${TOKENS.entityTitleColor}; font-size: 11px;
      padding: 3px 10px; text-transform: uppercase; font-weight: 600;
      text-decoration: none; font-family: ${TOKENS.bodyFont};
    }
    .fbp-title { 
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 16px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 10px; line-height: 1.4;
    }
    .fbp-title a { color: inherit; text-decoration: none; }
    .fbp-title a:hover { color: rgba(51,51,51,0.65); }
    .fbp-meta { 
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
      font-size: 12px; color: ${TOKENS.textColor}; font-family: ${TOKENS.bodyFont};
    }
    .fbp-meta-avatar { width: 18px; height: 18px; border-radius: 50%; }
    .fbp-excerpt { 
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
      line-height: 1.6; margin-bottom: 12px;
    }
    .fbp-read-more { 
      color: ${TOKENS.entityTitleColor}; font-size: 13px; font-weight: 600;
      text-decoration: none; font-family: ${TOKENS.bodyFont};
    }
    .fbp-read-more:hover { color: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) { 
      .fbp-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 767px) { 
      .fbp-card, .fbp-card:nth-child(even) { flex-direction: column; }
      .fbp-img-wrap { flex: none; }
      .fbp-img { min-height: 200px; }
    }
  `;

  return (
    <div className="fbp-section" style={containerStyle}>
      <ScopedStyles id="blog-posts" css={scopedCss} />
      {sectionTitle && (
        <FashionSectionTitle
          subtitle={sectionTitle.subtitle}
          title={sectionTitle.title}
          description={sectionTitle.description}
        />
      )}
      <div className="fbp-grid">
        {posts.map((p, i) => (
          <article key={i} className="fbp-card">
            <div className="fbp-img-wrap">
              <img src={p.image} alt={p.title} className="fbp-img" loading="lazy" />
              <div className="fbp-date-badge">
                <span className="fbp-date-day">{p.date.day}</span>
                <span className="fbp-date-month">{p.date.month}</span>
              </div>
              <Link href={p.link} style={{ position: "absolute", inset: 0, zIndex: 3 }} aria-label={p.title} />
            </div>
            <div className="fbp-content">
              <div className="fbp-cats">
                {p.categories.map((c, ci) => (
                  <span key={ci} className="fbp-cat">{c}</span>
                ))}
              </div>
              <h3 className="fbp-title"><Link href={p.link}>{p.title}</Link></h3>
              <div className="fbp-meta">
                {p.author.avatar && <img src={p.author.avatar} alt={p.author.name} className="fbp-meta-avatar" />}
                <span>Posted by <strong>{p.author.name}</strong></span>
                {p.commentCount !== undefined && <span>💬 {p.commentCount}</span>}
              </div>
              <p className="fbp-excerpt">{p.excerpt}</p>
              <Link href={p.link} className="fbp-read-more">Continue reading</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. FASHION NEWSLETTER
   ═══════════════════════════════════════════════════════════════ */

export interface FashionNewsletterProps {
  subtitle?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  onSubmit?: (email: string) => void;
}

export function FashionNewsletter({
  subtitle = "TO WOODMART",
  title = "REGISTER FOR OUR NEWSLETTER",
  description = "Sign up for all the news about our last arrivals and get an exclusive early access shopping.",
  buttonText = "Sign up",
  socialLinks = [],
  onSubmit,
}: FashionNewsletterProps) {
  const [email, setEmail] = useState("");
  const storeCtx = useContext(FashionStoreContext);
  const { subscribe, status: nlStatus } = useNewsletterSubscribe(storeCtx?.storeSlug || "");

  // Merge: prefer real social links from store context over preset placeholders
  const resolvedSocialLinks = (() => {
    const ctxLinks = storeCtx?.socialLinks;
    if (ctxLinks && ctxLinks.length > 0) return ctxLinks;
    // Filter out placeholder links (href="#")
    return socialLinks.filter(s => s.url && s.url !== "#");
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) { onSubmit(email); setEmail(""); return; }
    subscribe(email).then(() => setEmail(""));
  };

  const socialIcons: Record<string, string> = {
    facebook: "f",
    twitter: "𝕏",
    instagram: "📷",
    youtube: "▶",
    tiktok: "♪",
    linkedin: "in",
  };

  const scopedCss = `
    .fn-section { 
      padding: 40px; margin-bottom: 30px; text-align: center;
      background: #f9f9f9;
    }
    .fn-form { 
      display: flex; max-width: 500px; margin: 20px auto 0; gap: 10px;
    }
    .fn-input { 
      flex: 1; padding: 12px 15px; border: 1px solid #ddd; 
      font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none;
      border-radius: ${TOKENS.borderRadius}; background: #fff;
    }
    .fn-input:focus { border-color: ${TOKENS.primaryColor}; }
    .fn-submit { 
      padding: 12px 25px; background: ${TOKENS.primaryColor}; color: #fff;
      border: none; font-family: ${TOKENS.bodyFont}; font-weight: 600;
      font-size: 13px; text-transform: uppercase; cursor: pointer;
      border-radius: ${TOKENS.borderRadius}; transition: background 0.3s;
    }
    .fn-submit:hover { filter: brightness(0.9); }
    .fn-separator { 
      display: flex; align-items: center; gap: 15px; margin: 25px auto;
      max-width: 400px; color: ${TOKENS.textColor}; font-size: 14px;
      font-family: ${TOKENS.bodyFont};
    }
    .fn-sep-line { flex: 1; height: 1px; background: #ddd; }
    .fn-social { display: flex; justify-content: center; gap: 8px; }
    .fn-social-icon { 
      width: 35px; height: 35px; border-radius: 50%; border: 1px solid #ccc;
      display: flex; align-items: center; justify-content: center;
      text-decoration: none; color: ${TOKENS.entityTitleColor}; font-size: 13px;
      font-family: ${TOKENS.bodyFont}; font-weight: 700;
      transition: all 0.2s ease;
    }
    .fn-social-icon:hover { 
      border-color: ${TOKENS.primaryColor}; color: ${TOKENS.primaryColor}; 
    }
    @media (max-width: 767px) {
      .fn-form { flex-direction: column; }
      .fn-section { padding: 30px 20px; }
    }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="newsletter" css={scopedCss} />
      <div className="fn-section">
        <FashionSectionTitle subtitle={subtitle} title={title} description={description} maxWidth="70%" />
        {nlStatus === "success" ? (
          <p style={{ fontFamily: TOKENS.bodyFont, fontSize: "16px", color: TOKENS.primaryColor, marginTop: "20px" }}>Thanks for subscribing! 🎉</p>
        ) : (
        <form className="fn-form" onSubmit={handleSubmit}>
          <input type="email" className="fn-input" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="fn-submit" disabled={nlStatus === "loading"}>{nlStatus === "loading" ? "Signing up..." : buttonText}</button>
        </form>
        )}
        {resolvedSocialLinks.length > 0 && (
          <>
            <div className="fn-separator">
              <span className="fn-sep-line" />
              <span>OR FOLLOW US</span>
              <span className="fn-sep-line" />
            </div>
            <div className="fn-social">
              {resolvedSocialLinks.map((s, i) => (
                <a key={i} href={s.url} className="fn-social-icon" target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                  {socialIcons[s.platform] || s.platform[0]?.toUpperCase()}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. FASHION FEATURES (HOW WE WORK)
   Numbered feature boxes (01, 02, 03) with title, description, and CTA.
   Matches WoodMart "How We Work" section from fashion-colored template.
   ═══════════════════════════════════════════════════════════════ */

export interface FashionFeatureItem {
  number: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface FashionFeaturesProps {
  features?: FashionFeatureItem[];
  sectionTitle?: { subtitle?: string; title?: string; description?: string };
  columns?: number;
  marginBottom?: string;
}

export function FashionFeatures({
  features = [
    { number: "01", title: "SHOP FEATURE 1", description: "Massa a erat nam aliquam condi mentu tum in cum proin.", buttonText: "READ MORE", buttonLink: "#" },
    { number: "02", title: "SHOP FEATURE 2", description: "Adipiscing proin lobortis nunc luctus conubia ac facilisi.", buttonText: "READ MORE", buttonLink: "#" },
    { number: "03", title: "SHOP FEATURE 3", description: "Ulamcorper parturient adipiscing nisi rutrum eleifend class.", buttonText: "READ MORE", buttonLink: "#" },
  ],
  sectionTitle,
  columns = 3,
  marginBottom = "50px",
}: FashionFeaturesProps) {
  const storeCtx = useContext(FashionStoreContext);
  const scopedCss = `
    .ff-features { margin-bottom: ${marginBottom}; }
    .ff-features-grid {
      display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 30px;
      max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px;
    }
    .ff-feature {
      display: flex; align-items: flex-start; gap: 16px; padding: 30px;
      background: #f9f9f9; transition: background 0.3s;
    }
    .ff-feature:hover { background: #f0f0f0; }
    .ff-feature-num {
      font-family: ${TOKENS.titleFont}; font-size: 36px; font-weight: 700;
      color: ${TOKENS.primaryColor}; line-height: 1; flex-shrink: 0; opacity: 0.7;
    }
    .ff-feature-content { flex: 1; }
    .ff-feature-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 16px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 10px; text-transform: uppercase;
    }
    .ff-feature-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor};
      line-height: 1.6; margin: 0 0 12px;
    }
    .ff-feature-btn {
      font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 600;
      color: ${TOKENS.primaryColor}; text-decoration: none; text-transform: uppercase;
      display: inline-flex; align-items: center; gap: 4px; transition: opacity 0.2s;
    }
    .ff-feature-btn:hover { opacity: 0.7; }
    @media (max-width: 768px) {
      .ff-features-grid { grid-template-columns: 1fr; }
      .ff-feature { padding: 20px; }
    }
  `;

  return (
    <div className="ff-features">
      <ScopedStyles id="features" css={scopedCss} />
      {sectionTitle?.title && (
        <FashionSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} description={sectionTitle.description} />
      )}
      <div className="ff-features-grid">
        {features.map((f, i) => (
          <div key={i} className="ff-feature">
            <div className="ff-feature-num">{f.number}</div>
            <div className="ff-feature-content">
              <h4 className="ff-feature-title">{f.title}</h4>
              <p className="ff-feature-desc">{f.description}</p>
              {f.buttonText && (
                <Link href={resolveStoreLink(f.buttonLink, storeCtx?.storeSlug)} className="ff-feature-btn">
                  {f.buttonText} →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. FASHION INSTAGRAM GALLERY
   Grid of images with hover overlay showing likes/comments.
   Matches WoodMart "PROKIP ON INSTAGRAM" from fashion-colored.
   ═══════════════════════════════════════════════════════════════ */

export interface FashionInstaImage {
  src: string;
  alt?: string;
  likes?: number;
  comments?: number;
  link?: string;
}

export interface FashionInstagramProps {
  images?: FashionInstaImage[];
  columns?: number;
  sectionTitle?: { subtitle?: string; title?: string; description?: string };
  instagramUrl?: string;
  buttonText?: string;
  marginBottom?: string;
}

export function FashionInstagram({
  images = [],
  columns = 6,
  sectionTitle,
  instagramUrl = "https://www.instagram.com/",
  buttonText = "FOLLOW US ON INSTAGRAM",
  marginBottom = "0px",
}: FashionInstagramProps) {
  const scopedCss = `
    .fi-insta { margin-bottom: ${marginBottom}; }
    .fi-btn-wrap { text-align: center; margin-bottom: 25px; }
    .fi-btn {
      font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 600;
      color: ${TOKENS.entityTitleColor}; text-decoration: none; text-transform: uppercase;
      border-bottom: 1px solid ${TOKENS.entityTitleColor}; padding-bottom: 2px;
      transition: color 0.2s, border-color 0.2s;
    }
    .fi-btn:hover { color: ${TOKENS.primaryColor}; border-color: ${TOKENS.primaryColor}; }
    .fi-grid {
      display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 0;
      width: 100%;
    }
    .fi-item { position: relative; overflow: hidden; aspect-ratio: 1; cursor: pointer; }
    .fi-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
    .fi-item:hover img { transform: scale(1.05); }
    .fi-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center; gap: 15px;
      opacity: 0; transition: opacity 0.3s;
    }
    .fi-item:hover .fi-overlay { opacity: 1; }
    .fi-stat {
      display: flex; align-items: center; gap: 5px; color: #fff;
      font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 600;
    }
    .fi-stat svg { width: 16px; height: 16px; fill: #fff; }
    @media (max-width: 1024px) { .fi-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 768px) { .fi-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 480px) { .fi-grid { grid-template-columns: repeat(2, 1fr); } }
  `;

  const heartSvg = (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  );

  const commentSvg = (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );

  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div className="fi-insta">
      <ScopedStyles id="instagram" css={scopedCss} />
      {sectionTitle?.title && (
        <FashionSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} description={sectionTitle.description} />
      )}
      {buttonText && (
        <div className="fi-btn-wrap">
          <a href={instagramUrl} className="fi-btn" target="_blank" rel="noopener noreferrer">{buttonText}</a>
        </div>
      )}
      <div className="fi-grid">
        {images.map((img, i) => (
          <a key={i} className="fi-item" href={img.link || instagramUrl} target="_blank" rel="noopener noreferrer">
            <img src={img.src} alt={img.alt || `Instagram photo ${i + 1}`} loading="lazy" />
            {(img.likes !== undefined || img.comments !== undefined) && (
              <div className="fi-overlay">
                {img.likes !== undefined && (
                  <span className="fi-stat">{heartSvg} {formatNum(img.likes)}</span>
                )}
                {img.comments !== undefined && (
                  <span className="fi-stat">{commentSvg} {formatNum(img.comments)}</span>
                )}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. FASHION MARQUEE
   Infinite scrolling text banner, matching WoodMart marquee element.
   Used in handmade-bags template for announcements/info bars.
   ═══════════════════════════════════════════════════════════════ */

export interface FashionMarqueeItem {
  text: string;
  icon?: string; // emoji or text icon
}

export interface FashionMarqueeProps {
  items?: FashionMarqueeItem[];
  speed?: string;
  gap?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
  paddingY?: string;
  borderTop?: string;
  borderBottom?: string;
  marginBottom?: string;
}

export function FashionMarquee({
  items = [
    { text: "Free shipping on orders over $200", icon: "✦" },
    { text: "Production time is 5 days", icon: "✦" },
  ],
  speed = "45s",
  gap = "60px",
  backgroundColor = "transparent",
  textColor = "#242424",
  fontSize = "30px",
  fontWeight = "600",
  paddingY = "20px",
  borderTop,
  borderBottom,
  marginBottom = "0px",
}: FashionMarqueeProps) {
  const scopedCss = `
    @keyframes fm-scroll {
      from { transform: translate3d(0, 0, 0); }
      to { transform: translate3d(calc(-100% - ${gap}), 0, 0); }
    }
    .fm-marquee {
      display: flex; overflow: hidden; gap: ${gap}; max-width: 100vw;
      background: ${backgroundColor}; padding: ${paddingY} 0;
      margin-bottom: ${marginBottom};
      ${borderTop ? `border-top: ${borderTop};` : ""}
      ${borderBottom ? `border-bottom: ${borderBottom};` : ""}
    }
    .fm-content {
      display: flex; align-items: center; flex-shrink: 0; gap: ${gap};
      min-width: 100%; white-space: nowrap;
      animation: ${speed} linear infinite normal running fm-scroll;
    }
    .fm-marquee:hover .fm-content { animation-play-state: paused; }
    .fm-item {
      display: flex; gap: 10px; align-items: center;
      font-family: ${TOKENS.titleFont}; font-weight: ${fontWeight};
      font-size: ${fontSize}; line-height: 1; color: ${textColor};
    }
    .fm-item-icon { opacity: 0.5; font-size: 0.6em; }
    @media (max-width: 768px) {
      .fm-item { font-size: 24px; }
      .fm-marquee { padding: 15px 0; }
    }
  `;

  // Double the items for seamless loop
  const allItems = [...items, ...items];

  return (
    <div className="fm-marquee">
      <ScopedStyles id="marquee" css={scopedCss} />
      <div className="fm-content">
        {allItems.map((item, i) => (
          <div key={i} className="fm-item">
            {item.icon && <span className="fm-item-icon">{item.icon}</span>}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      <div className="fm-content" aria-hidden="true">
        {allItems.map((item, i) => (
          <div key={`dup-${i}`} className="fm-item">
            {item.icon && <span className="fm-item-icon">{item.icon}</span>}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   12. FASHION COVER BANNERS
   Large cover image blocks with text overlay (craftmanship story).
   Used in handmade-bags template for the 3-column story section.
   ═══════════════════════════════════════════════════════════════ */

export interface FashionCoverBanner {
  image: string;
  icon?: string; // emoji or SVG
  title: string;
  description: string;
  overlayOpacity?: number;
}

export interface FashionCoverBannersProps {
  banners?: FashionCoverBanner[];
  columns?: number;
  height?: string;
  marginBottom?: string;
}

export function FashionCoverBanners({
  banners = [],
  columns = 3,
  height = "580px",
  marginBottom = "60px",
}: FashionCoverBannersProps) {
  const scopedCss = `
    .fcb-wrap { margin-bottom: ${marginBottom}; }
    .fcb-grid {
      display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 0;
    }
    .fcb-banner {
      position: relative; height: ${height}; overflow: hidden;
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 60px; color: #fff; text-decoration: none;
    }
    .fcb-bg {
      position: absolute; inset: 0; background-size: cover; background-position: center;
      transition: transform 0.6s ease;
    }
    .fcb-banner:hover .fcb-bg { transform: scale(1.05); }
    .fcb-overlay {
      position: absolute; inset: 0; background: #000;
      opacity: 0.3; transition: opacity 0.3s;
    }
    .fcb-banner:hover .fcb-overlay { opacity: 0.45; }
    .fcb-content { position: relative; z-index: 2; }
    .fcb-icon { font-size: 48px; margin-bottom: 15px; opacity: 0.8; }
    .fcb-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 38px;
      margin: 0 0 15px; line-height: 1.2; color: #fff;
    }
    .fcb-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 1.7;
      color: rgba(255,255,255,0.85); max-width: 400px; margin: 0;
    }
    @media (max-width: 1024px) {
      .fcb-grid { grid-template-columns: 1fr; }
      .fcb-banner { height: 480px; padding: 40px; }
      .fcb-title { font-size: 28px; }
    }
    @media (max-width: 768px) {
      .fcb-banner { height: 400px; padding: 30px; }
      .fcb-title { font-size: 22px; }
    }
  `;

  return (
    <div className="fcb-wrap">
      <ScopedStyles id="cover-banners" css={scopedCss} />
      <div className="fcb-grid">
        {banners.map((b, i) => (
          <div key={i} className="fcb-banner">
            <div className="fcb-bg" style={{ backgroundImage: `url(${b.image})` }} />
            <div className="fcb-overlay" style={{ opacity: b.overlayOpacity ?? 0.3 }} />
            <div className="fcb-content">
              {b.icon && <div className="fcb-icon">{b.icon}</div>}
              <h3 className="fcb-title">{b.title}</h3>
              <p className="fcb-desc">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   13. FASHION FOOTER
   Matches WoodMart Fashion footer: 5-column main footer + copyright bar.
   Light-on-dark color scheme with collapsible columns on mobile.
   ═══════════════════════════════════════════════════════════════ */

export interface FooterContactInfo {
  address?: string;
  phone?: string;
  fax?: string;
  email?: string;
}

export interface FooterLinkItem {
  label: string;
  url: string;
  emphasized?: boolean;
}

export interface FooterLinkColumn {
  title: string;
  links: FooterLinkItem[];
}

export interface FooterRecentPost {
  title: string;
  url: string;
  date: string;
  thumbnail?: string;
}

export interface FashionFooterProps {
  /** Store logo URL */
  logoUrl?: string;
  logoAlt?: string;
  /** Short description below logo */
  description?: string;
  /** Contact details */
  contact?: FooterContactInfo;
  /** Recent blog posts column */
  recentPosts?: FooterRecentPost[];
  /** Link columns (Our Stores, Useful Links, Footer Menu, etc.) */
  linkColumns?: FooterLinkColumn[];
  /** Copyright text */
  copyrightText?: string;
  /** Payment icons image URL */
  paymentIconsUrl?: string;
  /** Background color override */
  backgroundColor?: string;
  /** Store slug override (so non-fashion templates can reuse this footer) */
  storeSlug?: string;
}

export function FashionFooter({
  logoUrl,
  logoAlt = "Store Logo",
  description = "Discover a curated collection of modern furniture designed to bring comfort and elegance into your home.",
  contact = {
    address: "451 Wall Street, UK, London",
    phone: "(064) 332-1233",
    fax: "(099) 453-1357",
  },
  recentPosts = [],
  linkColumns = [],
  copyrightText = `© ${new Date().getFullYear()}. ALL RIGHTS RESERVED.`,
  paymentIconsUrl,
  backgroundColor = TOKENS.footerBg,
  storeSlug: storeSlugProp,
}: FashionFooterProps) {
  const storeCtx = useContext(FashionStoreContext);
  const resolvedSlug = storeSlugProp || storeCtx?.storeSlug;
  const [openColumns, setOpenColumns] = useState<Set<number>>(new Set());

  const toggleColumn = (index: number) => {
    setOpenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const footerStyle: React.CSSProperties = {
    backgroundColor,
    color: "rgba(255,255,255,0.66)",
    fontFamily: TOKENS.bodyFont,
    fontSize: "14px",
    lineHeight: "1.7",
  };

  const mainFooterStyle: React.CSSProperties = {
    maxWidth: TOKENS.containerWidth,
    margin: "0 auto",
    padding: "40px 15px",
    display: "flex",
    flexWrap: "wrap",
    gap: "30px",
  };

  const scopedCss = `
    /* Footer links */
    .ff-footer a { color: rgba(255,255,255,0.66); text-decoration: none; transition: color 0.2s; }
    .ff-footer a:hover { color: #fff; }

    /* Column widths on desktop */
    .ff-col-brand { flex: 0 1 25%; min-width: 220px; }
    .ff-col-posts { flex: 0 1 25%; min-width: 220px; }
    .ff-col-links { flex: 0 1 17%; min-width: 140px; }

    /* Toggle headers */
    .ff-col-toggle-head {
      display: flex; justify-content: space-between; align-items: center;
      cursor: pointer; user-select: none; padding: 0;
    }
    .ff-col-toggle-head svg {
      width: 12px; height: 12px; fill: rgba(255,255,255,0.66);
      transition: transform 0.3s;
      display: none;
    }
    .ff-col-toggle-head.ff-open svg { transform: rotate(180deg); }

    /* Column title */
    .ff-col-title {
      font-family: ${TOKENS.titleFont};
      font-weight: 700; font-size: 16px; color: #fff;
      letter-spacing: 0.3px; text-transform: uppercase;
      margin: 0 0 20px 0;
    }

    /* Link lists */
    .ff-link-list { list-style: none; margin: 0; padding: 0; }
    .ff-link-list li { margin-bottom: 10px; }
    .ff-link-list li a { font-size: 14px; }
    .ff-link-list li a em { font-style: italic; }

    /* Contact info */
    .ff-contact-list { list-style: none; margin: 16px 0 0; padding: 0; }
    .ff-contact-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
    .ff-contact-icon { width: 14px; height: 14px; flex-shrink: 0; margin-top: 4px; fill: rgba(255,255,255,0.66); }

    /* Recent posts */
    .ff-post-item { display: flex; gap: 12px; margin-bottom: 15px; }
    .ff-post-thumb { width: 75px; height: 65px; border-radius: 0; object-fit: cover; flex-shrink: 0; }
    .ff-post-title { font-size: 14px; color: rgba(255,255,255,0.85); font-weight: 400; margin: 0 0 4px; line-height: 1.4; }
    .ff-post-title a { color: rgba(255,255,255,0.85); }
    .ff-post-title a:hover { color: #fff; }
    .ff-post-date { font-size: 12px; color: rgba(255,255,255,0.45); }

    /* Copyright bar */
    .ff-copyrights {
      border-top: 1px solid rgba(255,255,255,0.1);
      max-width: ${TOKENS.containerWidth};
      margin: 0 auto;
      padding: 20px 15px;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 10px;
    }
    .ff-copyrights small { font-size: 13px; color: rgba(255,255,255,0.5); }
    .ff-copyrights small a { color: rgba(255,255,255,0.5); }
    .ff-copyrights img { height: 21px; width: auto; }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .ff-main-footer { gap: 0 !important; padding: 0 15px !important; }
      .ff-col-brand, .ff-col-posts, .ff-col-links {
        flex: 0 1 100% !important; min-width: 100% !important;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        padding: 20px 0;
      }
      .ff-col-brand { border-bottom: 1px solid rgba(255,255,255,0.08); padding-top: 30px; }
      .ff-col-toggle-head svg { display: block; }
      .ff-col-toggle-content { overflow: hidden; transition: max-height 0.3s ease; }
      .ff-col-toggle-content.ff-closed { max-height: 0; }
      .ff-col-toggle-content.ff-open { max-height: 500px; }
      .ff-col-title { margin-bottom: 0; }
      .ff-col-toggle-head.ff-open .ff-col-title { margin-bottom: 15px; }
    }

    @media (min-width: 769px) {
      .ff-col-toggle-content { max-height: none !important; }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .ff-col-brand, .ff-col-posts { flex: 0 1 calc(50% - 15px) !important; }
      .ff-col-links { flex: 0 1 calc(33% - 20px) !important; }
    }
  `;

  // SVG icons for contact items
  const contactIcons = {
    address: (
      <svg viewBox="0 0 477 477" className="ff-contact-icon">
        <path d="M238.5 0C146.3 0 71.5 74.8 71.5 167c0 40.7 14.5 78 38.6 107.1L238.5 477l128.4-202.9C391 245 405.5 207.7 405.5 167 405.5 74.8 330.7 0 238.5 0zm0 240c-40.3 0-73-32.7-73-73s32.7-73 73-73 73 32.7 73 73-32.7 73-73 73z"/>
      </svg>
    ),
    phone: (
      <svg viewBox="0 0 27 27" className="ff-contact-icon">
        <path d="M20.4 27c-1.8 0-4.4-.9-8-3.8C8.7 20.4 5 16.5 3 13.3.5 9.4-.2 6.4.1 4.3.4 2.5 1.4 1.3 2.4.5c.6-.5 1.2-.5 1.6-.1l4.2 5c.4.5.3 1-.1 1.4l-1.5 1.3c-.3.3-.3.6-.2.9 1 2 2.7 4.2 5 6.2s4.5 3.4 6.7 4c.3.1.7 0 .9-.2l1.5-1.6c.4-.4 1-.5 1.4-.1l4.7 4.4c.5.4.5 1.1 0 1.6-.8.9-2 1.8-3.8 2.2-.8.3-1.5.4-2.4.4z"/>
      </svg>
    ),
    fax: (
      <svg viewBox="0 0 479 479" className="ff-contact-icon">
        <path d="M434.1 59.7H370V20c0-11-9-20-20-20H129c-11 0-20 9-20 20v39.7H44.9C20.1 59.7 0 79.8 0 104.6v214.6c0 24.8 20.1 44.9 44.9 44.9h64.1V459c0 11 9 20 20 20h221c11 0 20-9 20-20V364.1h64.1c24.8 0 44.9-20.1 44.9-44.9V104.6c0-24.8-20.1-44.9-44.9-44.9zM149 40h181v19.7H149V40zm181 399H149V284.1h181V439zm104.1-119.8c0 2.7-2.2 4.9-4.9 4.9H370V264.1c0-11-9-20-20-20H129c-11 0-20 9-20 20v60h-65.1c-2.7 0-4.9-2.2-4.9-4.9V104.6c0-2.7 2.2-4.9 4.9-4.9h390.2c2.7 0 4.9 2.2 4.9 4.9v214.6z"/>
      </svg>
    ),
    email: (
      <svg viewBox="0 0 479 479" className="ff-contact-icon">
        <path d="M432 59H47C21 59 0 80 0 106v267c0 26 21 47 47 47h385c26 0 47-21 47-47V106c0-26-21-47-47-47zm-6 40L240 259 54 99h372zm6 280H47c-4 0-7-3-7-7V128l197 170c4 3 8 5 13 5s9-2 13-5l187-170v245c0 4-3 7-7 7z"/>
      </svg>
    ),
  };

  const chevronSvg = (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M59.77 20.77c.49-.49.73-1.13.73-1.77s-.24-1.28-.73-1.77a2.5 2.5 0 00-3.54 0L32 41.46 7.77 17.23a2.5 2.5 0 00-3.54 0 2.5 2.5 0 000 3.54l26 26a2.5 2.5 0 003.54 0l26-26z"/>
    </svg>
  );

  // Render togglable link columns
  const renderLinkColumn = (col: FooterLinkColumn, idx: number) => {
    const colIndex = idx + 2; // offset past brand + posts columns
    const isOpen = openColumns.has(colIndex);

    return (
      <div key={idx} className="ff-col-links">
        <div
          className={`ff-col-toggle-head ${isOpen ? "ff-open" : ""}`}
          onClick={() => toggleColumn(colIndex)}
        >
          <h4 className="ff-col-title">{col.title}</h4>
          {chevronSvg}
        </div>
        <div className={`ff-col-toggle-content ${isOpen ? "ff-open" : "ff-closed"}`}>
          <ul className="ff-link-list">
            {col.links.map((link, li) => (
              <li key={li}>
                <Link href={resolveFooterLink(link.url, link.label, resolvedSlug)}>
                  {link.emphasized ? <em>{link.label}</em> : link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <footer className="ff-footer" style={footerStyle}>
      <ScopedStyles id="footer" css={scopedCss} />

      {/* ── Main Footer ── */}
      <div className="ff-main-footer" style={mainFooterStyle}>
        {/* Column 1: Brand + Contact */}
        <div className="ff-col-brand">
          {logoUrl && (
            <div style={{ marginBottom: "16px" }}>
              <Link href={resolvedSlug ? `/store/${resolvedSlug}` : "/"}>
                <img
                  src={logoUrl}
                  alt={logoAlt}
                  style={{ maxWidth: "220px", height: "auto" }}
                />
              </Link>
            </div>
          )}
          <p style={{ margin: "0 0 10px", fontSize: "14px", lineHeight: "1.7" }}>
            {description}
          </p>
          {contact && (
            <ul className="ff-contact-list">
              {contact.address && (
                <li className="ff-contact-item">
                  {contactIcons.address}
                  <span>{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li className="ff-contact-item">
                  {contactIcons.phone}
                  <span>Phone: {contact.phone}</span>
                </li>
              )}
              {contact.fax && (
                <li className="ff-contact-item">
                  {contactIcons.fax}
                  <span>Fax: {contact.fax}</span>
                </li>
              )}
              {contact.email && (
                <li className="ff-contact-item">
                  {contactIcons.email}
                  <span>Email: {contact.email}</span>
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Column 2: Recent Posts */}
        {recentPosts.length > 0 && (
          <div className="ff-col-posts">
            <div
              className={`ff-col-toggle-head ${openColumns.has(1) ? "ff-open" : ""}`}
              onClick={() => toggleColumn(1)}
            >
              <h4 className="ff-col-title">RECENT POSTS</h4>
              {chevronSvg}
            </div>
            <div className={`ff-col-toggle-content ${openColumns.has(1) ? "ff-open" : "ff-closed"}`}>
              {recentPosts.map((post, i) => (
                <div key={i} className="ff-post-item">
                  {post.thumbnail && (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="ff-post-thumb"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <h5 className="ff-post-title">
                      <Link href={resolveStoreLink(post.url, resolvedSlug)}>{post.title}</Link>
                    </h5>
                    <span className="ff-post-date">{post.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Columns 3-5: Link columns */}
        {linkColumns.map(renderLinkColumn)}
      </div>

      {/* ── Copyright Bar ── */}
      <div className="ff-copyrights">
        <div>
          <small>
            <Link href={resolvedSlug ? `/store/${resolvedSlug}` : "/"}>{copyrightText}</Link>
          </small>
        </div>
        {paymentIconsUrl && (
          <div>
            <img
              src={paymentIconsUrl}
              alt="Payment methods"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </footer>
  );
}
