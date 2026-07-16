"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { toggleCompare as toggleCompareItem } from "@/lib/compare-utils";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";

/* ═══════════════════════════════════════════════════════════════
   COSMETICS TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Cosmetics template sections.
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
export function CosmeticsFontLoader() {
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
  return <style data-cosmetics-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
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

export interface CosmeticsProduct {
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

export interface CosmeticsStoreContextData {
  products: Array<{
    id: string; name: string; slug: string; price: number; compareAtPrice?: number;
    currency: string; inStock: boolean; isFeatured: boolean; tags?: string[];
    images: Array<{ id: string; url: string; alt?: string }>;
    category?: { id: string; name: string; slug: string };
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
export const CosmeticsStoreContext = createContext<CosmeticsStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. COSMETICS HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsHeroSlide {
  subtitle: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  secondButtonText?: string;
  secondButtonLink?: string;
  backgroundImage: string;
  foregroundImage?: string;
  textPosition?: "left" | "center" | "right";
  colorScheme?: "dark" | "light";
}

export interface CosmeticsHeroSliderProps {
  slides: CosmeticsHeroSlide[];
  autoplaySpeed?: number;
  minHeight?: string;
  resolvedStyles?: React.CSSProperties;
  resolvedClasses?: string;
}

export function CosmeticsHeroSlider({ slides, autoplaySpeed = 5000, minHeight = "560px", resolvedStyles, resolvedClasses }: CosmeticsHeroSliderProps) {
  const storeCtx = useContext(CosmeticsStoreContext);
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

  // Merge resolved styles with default minHeight
  const rootStyle: React.CSSProperties = {
    minHeight,
    ...resolvedStyles,
  };

  const scopedCss = `
    .ch-slider { position: relative; width: 100%; overflow: hidden; background: #f5f0eb; }
    .ch-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .ch-slide.ch-active { opacity: 1; position: relative; }
    .ch-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center center; z-index: 0; }
    .ch-slide-content { position: relative; z-index: 2; width: 100%; }
    .ch-fg-img { position: absolute; bottom: 0; right: 10%; max-height: 90%; z-index: 1; }
    .ch-subtitle {
      color: ${TOKENS.textColor}; text-transform: uppercase; font-weight: 400;
      font-size: 16px; font-family: ${TOKENS.bodyFont}; margin-bottom: 10px;
      letter-spacing: 2px;
    }
    .ch-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 42px;
      line-height: 1.2; margin: 0 0 15px;
    }
    .ch-title-dark { color: ${TOKENS.titleColor}; }
    .ch-title-light { color: #ffffff; }
    .ch-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 1.6;
      max-width: 420px; margin: 0 0 25px;
    }
    .ch-desc-dark { color: ${TOKENS.textColor}; }
    .ch-desc-light { color: rgba(255,255,255,0.85); }
    .ch-btn {
      display: inline-block; padding: 12px 30px;
      background: ${TOKENS.primaryColor}; color: #fff; text-transform: uppercase;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px;
      text-decoration: none; border: none; cursor: pointer; border-radius: 25px;
      transition: background-color 0.3s ease; letter-spacing: 0.5px; margin-right: 10px;
    }
    .ch-btn:hover { filter: brightness(0.9); }
    .ch-btn-outline {
      display: inline-block; padding: 12px 30px;
      background: transparent; color: ${TOKENS.titleColor}; text-transform: uppercase;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px;
      text-decoration: none; border: 2px solid ${TOKENS.titleColor}; cursor: pointer;
      border-radius: 25px; transition: all 0.3s ease; letter-spacing: 0.5px;
    }
    .ch-btn-outline:hover { background: ${TOKENS.titleColor}; color: #fff; }
    .ch-dots {
      position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 10px; z-index: 5;
    }
    .ch-dot {
      width: 10px; height: 10px; border-radius: 50%; border: none; cursor: pointer;
      background: rgba(0,0,0,0.2); transition: background 0.3s ease; padding: 0;
    }
    .ch-dot.ch-dot-active { background: ${TOKENS.primaryColor}; }
    .ch-anim-in { animation: chSlideUp 0.6s ease forwards; opacity: 0; }
    @keyframes chSlideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 1024px) {
      .ch-slider { min-height: 500px !important; }
      .ch-title { font-size: 30px; }
      .ch-fg-img { max-height: 70%; right: 5%; }
    }
    @media (max-width: 767px) {
      .ch-slider { min-height: 400px !important; }
      .ch-title { font-size: 24px; }
      .ch-subtitle { font-size: 13px; }
      .ch-desc { font-size: 14px; }
      .ch-fg-img { display: none; }
    }
  `;

  return (
    <div className={`ch-slider ${resolvedClasses || ''}`} style={rootStyle}>
      <ScopedStyles id="hero-slider" css={scopedCss} />
      {slides.map((slide, i) => {
        const scheme = slide.colorScheme || "dark";
        const align = slide.textPosition || "left";
        return (
          <div key={i} className={`ch-slide ${i === current ? "ch-active" : ""}`}>
            <div className="ch-slide-bg" style={{ backgroundImage: `url(${slide.backgroundImage})` }} />
            {slide.foregroundImage && (
              <img src={slide.foregroundImage} alt="" className="ch-fg-img"  onError={(e) => onImgError(e, "fallback")} />
            )}
            <div className="ch-slide-content">
              <div style={{ ...containerStyle, textAlign: align as React.CSSProperties["textAlign"] }}>
                <div style={{ maxWidth: "50%", padding: "60px 0" }}>
                  {i === current && (
                    <>
                      <div className={`ch-subtitle ch-anim-in`} style={{ animationDelay: "0.2s" }}>{slide.subtitle}</div>
                      <div className={`ch-title ch-title-${scheme} ch-anim-in`} style={{ animationDelay: "0.3s" }}>{slide.titleLine1}</div>
                      <div className={`ch-title ch-title-${scheme} ch-anim-in`} style={{ animationDelay: "0.4s", marginBottom: "20px" }}>{slide.titleLine2}</div>
                      <div className={`ch-desc ch-desc-${scheme} ch-anim-in`} style={{ animationDelay: "0.5s" }}>{slide.description}</div>
                      <div className="ch-anim-in" style={{ animationDelay: "0.6s" }}>
                        <Link href={fixLink(slide.buttonLink)} className="ch-btn">{slide.buttonText}</Link>
                        {slide.secondButtonText && (
                          <Link href={fixLink(slide.secondButtonLink || "#")} className="ch-btn-outline">{slide.secondButtonText}</Link>
                        )}
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
        <div className="ch-dots">
          {slides.map((_, i) => (
            <button key={i} className={`ch-dot ${i === current ? "ch-dot-active" : ""}`} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. COSMETICS PROMO BANNERS
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsPromoBanner {
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface CosmeticsPromoBannersProps {
  banners: CosmeticsPromoBanner[];
}

export function CosmeticsPromoBanners({ banners }: CosmeticsPromoBannersProps) {
  const storeCtx = useContext(CosmeticsStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const scopedCss = `
    .cp-banners { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 60px; }
    .cp-banner { position: relative; overflow: hidden; cursor: pointer; }
    .cp-banner-img-wrap { overflow: hidden; }
    .cp-banner-img {
      width: 100%; height: auto; display: block;
      transition: transform 0.6s ease;
    }
    .cp-banner:hover .cp-banner-img { transform: scale(1.08); }
    .cp-banner-overlay {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%);
      padding: 30px 25px 25px; z-index: 2;
    }
    .cp-banner-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 18px;
      color: #fff; text-transform: uppercase; margin: 0 0 8px; letter-spacing: 1px;
    }
    .cp-banner-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: rgba(255,255,255,0.8);
      margin: 0 0 12px; line-height: 1.5;
    }
    .cp-banner-btn {
      color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 12px;
      text-transform: lowercase; font-weight: 600; text-decoration: none;
      position: relative; display: inline-block; letter-spacing: 0.5px;
    }
    .cp-banner-btn::after {
      content: ''; position: absolute; bottom: -2px; left: 0; width: 100%;
      height: 1px; background: #fff;
      transform: scaleX(0); transform-origin: right; transition: transform 0.3s ease;
    }
    .cp-banner:hover .cp-banner-btn::after { transform: scaleX(1); transform-origin: left; }
    .cp-banner-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) {
      .cp-banners { grid-template-columns: repeat(3, 1fr); gap: 20px; }
      .cp-banner-title { font-size: 16px; }
    }
    @media (max-width: 767px) {
      .cp-banners { grid-template-columns: 1fr; gap: 15px; }
    }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="promo-banners" css={scopedCss} />
      <div className="cp-banners">
        {banners.map((b, i) => (
          <div key={i} className="cp-banner">
            <div className="cp-banner-img-wrap">
              <img src={b.image} alt={b.title} className="cp-banner-img" loading="lazy"  onError={(e) => onImgError(e, b.title)} />
            </div>
            <div className="cp-banner-overlay">
              <h4 className="cp-banner-title">{b.title}</h4>
              <p className="cp-banner-desc">{b.description}</p>
              <Link href={fixLink(b.buttonLink)} className="cp-banner-btn">{b.buttonText}</Link>
            </div>
            <Link href={fixLink(b.buttonLink)} className="cp-banner-link" aria-label={b.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. COSMETICS SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsSectionTitleProps {
  subtitle?: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  align?: "left" | "center" | "right";
  maxWidth?: string;
  titleColor?: "primary" | "dark";
}

export function CosmeticsSectionTitle({ subtitle, title, description, buttonText, buttonLink, align = "center", maxWidth = "50%", titleColor = "dark" }: CosmeticsSectionTitleProps) {
  const storeCtx = useContext(CosmeticsStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const scopedCss = `
    .cst-wrap { margin-bottom: 35px; }
    .cst-subtitle {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor};
      text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; font-weight: 400;
    }
    .cst-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700;
      font-size: 32px; line-height: 1.2; margin: 0 0 15px;
      text-transform: uppercase; letter-spacing: 1px;
    }
    .cst-title-dark { color: ${TOKENS.titleColor}; }
    .cst-title-primary { color: ${TOKENS.primaryColor}; }
    .cst-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor};
      line-height: 1.6; margin: 0 auto 20px;
    }
    .cst-btn {
      display: inline-block; padding: 10px 25px;
      background: ${TOKENS.primaryColor}; color: #fff; text-transform: uppercase;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 12px;
      text-decoration: none; border-radius: 0; transition: background 0.3s;
      letter-spacing: 1px;
    }
    .cst-btn:hover { filter: brightness(0.9); }
    @media (max-width: 767px) {
      .cst-title { font-size: 24px; }
      .cst-wrap { margin-bottom: 25px; }
    }
  `;

  return (
    <div className="cst-wrap" style={{ textAlign: align }}>
      <ScopedStyles id="section-title" css={scopedCss} />
      <div style={{ maxWidth, margin: align === "center" ? "0 auto" : undefined }}>
        {subtitle && <div className="cst-subtitle">{subtitle}</div>}
        <h2 className={`cst-title cst-title-${titleColor}`}>{title}</h2>
        {description && <p className="cst-desc">{description}</p>}
        {buttonText && (
          <Link href={fixLink(buttonLink || "#")} className="cst-btn">{buttonText}</Link>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. COSMETICS PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsProductGridProps {
  products?: CosmeticsProduct[];
  columns?: number;
  showCategory?: boolean;
  showHoverImage?: boolean;
  sectionTitle?: { subtitle?: string; title: string; description?: string; buttonText?: string; buttonLink?: string };
  marginBottom?: string;
  maxProducts?: number;
  filter?: "featured" | "bestseller" | "new-arrival" | "sale" | "all";
  filterTag?: string;
  resolvedStyles?: React.CSSProperties;
  resolvedClasses?: string;
}

export function CosmeticsProductGrid({ products: propProducts, columns = 4, showCategory = true, showHoverImage = true, sectionTitle, marginBottom = "60px", maxProducts = 8, filter, filterTag, resolvedStyles, resolvedClasses }: CosmeticsProductGridProps) {
  const storeCtx = useContext(CosmeticsStoreContext);
  const [, setCompareState] = useState(false);

  // Merge resolved styles with default marginBottom
  const rootStyle: React.CSSProperties = {
    marginBottom,
    ...resolvedStyles,
  };

  const products: CosmeticsProduct[] = (() => {
    if (!storeCtx || !storeCtx.products || storeCtx.products.length === 0) return propProducts || [];

    let storeProducts = storeCtx.products;

    if (filter === "featured") {
      const featured = storeProducts.filter(p => p.isFeatured);
      if (featured.length > 0) storeProducts = featured;
    } else if (filter === "bestseller" || filter === "new-arrival" || filter === "sale") {
      const tagged = storeProducts.filter(p =>
        p.tags?.some((t: string) => t.toLowerCase().replace(/[-_ ]/g, "") === filter!.toLowerCase().replace(/[-_ ]/g, ""))
      );
      if (tagged.length > 0) storeProducts = tagged;
    }
    if (filterTag) {
      const tagged = storeProducts.filter(p =>
        p.tags?.some((t: string) => t.toLowerCase() === filterTag.toLowerCase())
      );
      if (tagged.length > 0) storeProducts = tagged;
    }

    if (storeProducts.length === 0) return propProducts || [];

    const currencySymbols: Record<string, string> = { GHS: "GH₵", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
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
    }));
  })();

  const scopedCss = `
    .cpg-section { margin-bottom: ${marginBottom}; }
    .cpg-grid {
      display: grid; grid-template-columns: repeat(${columns}, 1fr);
      gap: 20px;
    }
    .cpg-card { position: relative; }
    .cpg-thumb { position: relative; overflow: hidden; margin-bottom: 12px; }
    .cpg-img { width: 100%; height: auto; display: block; transition: opacity 0.5s ease; }
    .cpg-hover-img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      opacity: 0; transition: opacity 0.5s ease;
    }
    .cpg-card:hover .cpg-hover-img { opacity: 1; }
    .cpg-card:hover .cpg-main-img { opacity: 0; }
    .cpg-actions {
      position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column;
      gap: 5px; opacity: 0; transform: translateX(10px); transition: all 0.3s ease; z-index: 3;
    }
    .cpg-card:hover .cpg-actions { opacity: 1; transform: translateX(0); }
    .cpg-action-btn {
      width: 35px; height: 35px; border-radius: 50%; background: #fff;
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: background 0.2s; font-size: 14px;
    }
    .cpg-action-btn:hover { background: ${TOKENS.primaryColor}; color: #fff; }
    .cpg-name {
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 14px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 4px; line-height: 1.4;
    }
    .cpg-name a { color: inherit; text-decoration: none; transition: color 0.2s; }
    .cpg-name a:hover { color: rgba(51,51,51,0.65); }
    .cpg-cat {
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
      margin-bottom: 6px;
    }
    .cpg-cat a { color: inherit; text-decoration: none; }
    .cpg-price {
      color: ${TOKENS.primaryColor}; font-weight: 600; font-size: 14px;
      font-family: ${TOKENS.bodyFont};
    }
    .cpg-price-old {
      text-decoration: line-through; color: #999; font-weight: 400;
      margin-right: 8px; font-size: 13px;
    }
    .cpg-badge {
      position: absolute; top: 10px; left: 10px; background: ${TOKENS.primaryColor};
      color: #fff; font-size: 11px; font-weight: 600; text-transform: uppercase;
      padding: 3px 10px; z-index: 3;
    }
    .cpg-add-btn {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: ${TOKENS.primaryColor}; color: #fff; border: none;
      padding: 10px; text-transform: uppercase; font-weight: 600; font-size: 12px;
      font-family: ${TOKENS.bodyFont}; cursor: pointer; opacity: 0;
      transform: translateY(100%); transition: all 0.3s ease;
    }
    .cpg-card:hover .cpg-add-btn { opacity: 1; transform: translateY(0); }
    @media (max-width: 1024px) { .cpg-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .cpg-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  `;

  const resolveLink = (link: string, productName: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `/store/${storeCtx.storeSlug}/product/${slug}`;
    }
    return resolveStoreLink(link, storeCtx?.storeSlug);
  };

  if (products.length === 0) {
    return (
      <div className={`cpg-section ${resolvedClasses || ''}`} style={rootStyle}>
        <ScopedStyles id="product-grid" css={scopedCss} />
        {sectionTitle && (
          <CosmeticsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} description={sectionTitle.description} buttonText={sectionTitle.buttonText} buttonLink={sectionTitle.buttonLink} />
        )}
        <div style={{ textAlign: "center", padding: "40px 20px", color: TOKENS.textColor, fontFamily: TOKENS.bodyFont }}>
          <p>No products yet. Add products from your dashboard to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`cpg-section ${resolvedClasses || ''}`} style={rootStyle}>
      <ScopedStyles id="product-grid" css={scopedCss} />
      {sectionTitle && (
        <CosmeticsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} description={sectionTitle.description} buttonText={sectionTitle.buttonText} buttonLink={sectionTitle.buttonLink} />
      )}
      <div className="cpg-grid">
        {products.map((p) => {
          const productLink = resolveLink(p.link, p.name);
          return (
            <div key={p.id} className="cpg-card">
              <div className="cpg-thumb">
                <Link href={productLink}>
                  <img src={p.image || safeSrc(null, p.name)} alt={p.name} className="cpg-img cpg-main-img" loading="lazy" onError={(e) => onImgError(e, p.name)} />
                  {showHoverImage && p.hoverImage && (
                    <img src={p.hoverImage} alt={p.name} className="cpg-hover-img" loading="lazy"  onError={(e) => onImgError(e, p.name)} />
                  )}
                </Link>
                {p.badge && <span className="cpg-badge">{p.badge}</span>}
                <div className="cpg-actions">
                  <button className="cpg-action-btn" title="Compare" aria-label="Compare" onClick={() => { toggleCompareItem({ id: String(p.id), name: p.name, slug: (p as any).slug || p.name, price: p.price, image: p.image }, storeCtx?.storeSlug); setCompareState(prev => !prev); }}>⇌</button>
                  <button className="cpg-action-btn" title="Quick view" aria-label="Quick view" onClick={() => storeCtx?.onQuickView?.(String(p.id))}>👁</button>
                  <button className="cpg-action-btn" title="Wishlist" aria-label="Wishlist" onClick={() => storeCtx?.toggleWishlist?.(String(p.id))} style={storeCtx?.isWishlisted?.(String(p.id)) ? { color: "red" } : undefined}>{storeCtx?.isWishlisted?.(String(p.id)) ? "♥" : "♡"}</button>
                </div>
                <button className="cpg-add-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
              </div>
              <h3 className="cpg-name"><Link href={productLink}>{p.name}</Link></h3>
              {showCategory && p.category && (
                <div className="cpg-cat"><Link href={resolveStoreLink(p.categoryLink, storeCtx?.storeSlug)}>{p.category}</Link></div>
              )}
              <div className="cpg-price">
                {p.salePrice && <span className="cpg-price-old">{p.price}</span>}
                <span>{p.salePrice || p.price}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. COSMETICS CATEGORY CARDS
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsCategoryCard {
  name: string;
  image: string;
  productCount?: number;
  link: string;
}

export interface CosmeticsCategoryCardsProps {
  categories: CosmeticsCategoryCard[];
  sectionTitle?: { subtitle?: string; title: string; description?: string };
  marginBottom?: string;
}

export function CosmeticsCategoryCards({ categories, sectionTitle, marginBottom = "60px" }: CosmeticsCategoryCardsProps) {
  const storeCtx = useContext(CosmeticsStoreContext);
  const resolveLink = (link: string, catName: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `/store/${storeCtx.storeSlug}/shop?category=${catSlug}`;
    }
    return resolveStoreLink(link, storeCtx?.storeSlug);
  };

  const scopedCss = `
    .ccc-section { margin-bottom: ${marginBottom}; }
    .ccc-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: auto auto;
      gap: 20px;
    }
    .ccc-card {
      position: relative; overflow: hidden; cursor: pointer;
    }
    .ccc-card-tall { grid-row: span 1; }
    .ccc-card-short { grid-row: span 1; }
    .ccc-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.6s ease; min-height: 250px;
    }
    .ccc-card:hover .ccc-img { transform: scale(1.05); }
    .ccc-overlay {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 20px; z-index: 2;
      background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%);
    }
    .ccc-name {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 18px;
      color: #fff; text-transform: uppercase; margin: 0 0 5px;
    }
    .ccc-count {
      font-family: ${TOKENS.bodyFont}; font-size: 13px;
      color: rgba(255,255,255,0.85);
    }
    .ccc-count a { color: inherit; text-decoration: none; }
    .ccc-count a:hover { text-decoration: underline; }
    .ccc-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) {
      .ccc-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 767px) {
      .ccc-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    }
  `;

  return (
    <div className="ccc-section" style={containerStyle}>
      <ScopedStyles id="category-cards" css={scopedCss} />
      {sectionTitle && (
        <CosmeticsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} description={sectionTitle.description} />
      )}
      <div className="ccc-grid">
        {categories.map((c, i) => (
          <div key={i} className={`ccc-card ${i < 3 ? "ccc-card-tall" : "ccc-card-short"}`}>
            <img src={c.image} alt={c.name} className="ccc-img" loading="lazy"  onError={(e) => onImgError(e, c.name)} />
            <div className="ccc-overlay">
              <h3 className="ccc-name">{c.name}</h3>
              {c.productCount !== undefined && (
                <div className="ccc-count">
                  <Link href={resolveLink(c.link, c.name)}>{c.productCount} products</Link>
                </div>
              )}
            </div>
            <Link href={resolveLink(c.link, c.name)} className="ccc-link" aria-label={c.name} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. COSMETICS DISCOVERY SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsDiscoveryFeature {
  icon: string;
  titleLine1: string;
  titleLine2: string;
}

export interface CosmeticsDiscoveryProps {
  image: string;
  title: string;
  description: string;
  features: CosmeticsDiscoveryFeature[];
  buttonText?: string;
  buttonLink?: string;
  secondButtonText?: string;
  secondButtonLink?: string;
  marginBottom?: string;
}

export function CosmeticsDiscovery({ image, title, description, features, buttonText = "SHOP NOW", buttonLink, secondButtonText = "READ MORE", secondButtonLink, marginBottom = "60px" }: CosmeticsDiscoveryProps) {
  const storeCtx = useContext(CosmeticsStoreContext);
  const fixLink = (link?: string) => resolveStoreLink(link || "#", storeCtx?.storeSlug);
  const { ref, inView } = useInView();

  const scopedCss = `
    .cd-section { margin-bottom: ${marginBottom}; overflow: hidden; }
    .cd-grid { display: flex; align-items: center; gap: 60px; }
    .cd-img-col { flex: 0 0 45%; }
    .cd-img { width: 100%; height: auto; display: block; }
    .cd-content-col { flex: 1; }
    .cd-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px;
      color: ${TOKENS.titleColor}; line-height: 1.3; margin: 0 0 20px;
    }
    .cd-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor};
      line-height: 1.7; margin: 0 0 30px;
    }
    .cd-features { display: flex; gap: 30px; margin-bottom: 30px; }
    .cd-feature { text-align: center; }
    .cd-feature-icon { width: 50px; height: 50px; margin: 0 auto 12px; }
    .cd-feature-icon img { width: 100%; height: 100%; object-fit: contain; }
    .cd-feature-title {
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 14px;
      color: ${TOKENS.titleColor}; line-height: 1.4;
    }
    .cd-btn {
      display: inline-block; padding: 12px 30px;
      background: ${TOKENS.primaryColor}; color: #fff; text-transform: uppercase;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px;
      text-decoration: none; border-radius: 0; transition: background 0.3s;
      letter-spacing: 0.5px; margin-right: 10px;
    }
    .cd-btn:hover { filter: brightness(0.9); }
    .cd-btn-outline {
      display: inline-block; padding: 12px 30px;
      background: transparent; color: ${TOKENS.titleColor}; text-transform: uppercase;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px;
      text-decoration: none; border: 2px solid #ddd; transition: all 0.3s;
      letter-spacing: 0.5px;
    }
    .cd-btn-outline:hover { border-color: ${TOKENS.titleColor}; }
    .cd-animate { opacity: 0; transform: translateY(30px); transition: all 0.6s ease; }
    .cd-animate.cd-visible { opacity: 1; transform: translateY(0); }
    @media (max-width: 1024px) {
      .cd-grid { gap: 30px; }
      .cd-title { font-size: 24px; }
    }
    @media (max-width: 767px) {
      .cd-grid { flex-direction: column; gap: 30px; }
      .cd-img-col { flex: none; width: 100%; }
      .cd-features { flex-wrap: wrap; gap: 20px; }
      .cd-feature { flex: 1; min-width: 80px; }
    }
  `;

  return (
    <div className="cd-section" ref={ref} style={containerStyle}>
      <ScopedStyles id="discovery" css={scopedCss} />
      <div className="cd-grid">
        <div className={`cd-img-col cd-animate ${inView ? "cd-visible" : ""}`}>
          <img src={image} alt="Discovery" className="cd-img" loading="lazy"  onError={(e) => onImgError(e, "fallback")} />
        </div>
        <div className={`cd-content-col cd-animate ${inView ? "cd-visible" : ""}`} style={{ transitionDelay: "0.2s" }}>
          <h3 className="cd-title">{title}</h3>
          <p className="cd-desc">{description}</p>
          <div className="cd-features">
            {features.map((f, i) => (
              <div key={i} className="cd-feature">
                <div className="cd-feature-icon">
                  <img src={f.icon} alt={f.titleLine1}  onError={(e) => onImgError(e, f.titleLine1)} />
                </div>
                <div className="cd-feature-title">{f.titleLine1}<br />{f.titleLine2}</div>
              </div>
            ))}
          </div>
          <div>
            <Link href={fixLink(buttonLink)} className="cd-btn">{buttonText}</Link>
            {secondButtonText && (
              <Link href={fixLink(secondButtonLink)} className="cd-btn-outline">{secondButtonText}</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. COSMETICS PROMO BANNER WITH COUNTDOWN
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsCountdownBannerProps {
  title: string;
  description: string;
  image: string;
  targetDate?: string;
  buttonText?: string;
  buttonLink?: string;
  secondButtonText?: string;
  secondButtonLink?: string;
  marginBottom?: string;
}

export function CosmeticsCountdownBanner({ title, description, image, targetDate, buttonText = "SHOP NOW", buttonLink, secondButtonText = "READ MORE", secondButtonLink, marginBottom = "60px" }: CosmeticsCountdownBannerProps) {
  const storeCtx = useContext(CosmeticsStoreContext);
  const fixLink = (link?: string) => resolveStoreLink(link || "#", storeCtx?.storeSlug);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const scopedCss = `
    .ccb-section { margin-bottom: ${marginBottom}; background: #f5f0eb; overflow: hidden; }
    .ccb-grid { display: flex; align-items: center; }
    .ccb-content { flex: 1; padding: 60px 50px; }
    .ccb-img-col { flex: 0 0 45%; }
    .ccb-img { width: 100%; height: auto; display: block; }
    .ccb-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px;
      color: ${TOKENS.titleColor}; line-height: 1.3; margin: 0 0 15px;
    }
    .ccb-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor};
      line-height: 1.7; margin: 0 0 25px;
    }
    .ccb-timer { display: flex; gap: 15px; margin-bottom: 25px; }
    .ccb-timer-unit { text-align: center; }
    .ccb-timer-num {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 36px;
      color: ${TOKENS.titleColor}; line-height: 1;
    }
    .ccb-timer-label {
      font-family: ${TOKENS.bodyFont}; font-size: 11px; color: ${TOKENS.textColor};
      text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;
    }
    .ccb-btn {
      display: inline-block; padding: 12px 30px;
      background: ${TOKENS.primaryColor}; color: #fff; text-transform: uppercase;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px;
      text-decoration: none; transition: background 0.3s; margin-right: 10px;
    }
    .ccb-btn:hover { filter: brightness(0.9); }
    .ccb-btn-outline {
      display: inline-block; padding: 12px 30px;
      background: transparent; color: ${TOKENS.titleColor}; text-transform: uppercase;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px;
      text-decoration: none; border: 2px solid #ddd; transition: all 0.3s;
    }
    .ccb-btn-outline:hover { border-color: ${TOKENS.titleColor}; }
    @media (max-width: 767px) {
      .ccb-grid { flex-direction: column-reverse; }
      .ccb-content { padding: 30px 20px; }
      .ccb-img-col { flex: none; width: 100%; }
      .ccb-title { font-size: 22px; }
      .ccb-timer-num { font-size: 28px; }
    }
  `;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="ccb-section">
      <ScopedStyles id="countdown-banner" css={scopedCss} />
      <div className="ccb-grid">
        <div className="ccb-content">
          <h3 className="ccb-title">{title}</h3>
          <p className="ccb-desc">{description}</p>
          {targetDate && (
            <div className="ccb-timer">
              <div className="ccb-timer-unit">
                <div className="ccb-timer-num">{timeLeft.days}</div>
                <div className="ccb-timer-label">days</div>
              </div>
              <div className="ccb-timer-unit">
                <div className="ccb-timer-num">{pad(timeLeft.hours)}</div>
                <div className="ccb-timer-label">hr</div>
              </div>
              <div className="ccb-timer-unit">
                <div className="ccb-timer-num">{pad(timeLeft.minutes)}</div>
                <div className="ccb-timer-label">min</div>
              </div>
              <div className="ccb-timer-unit">
                <div className="ccb-timer-num">{pad(timeLeft.seconds)}</div>
                <div className="ccb-timer-label">sc</div>
              </div>
            </div>
          )}
          <div>
            <Link href={fixLink(buttonLink)} className="ccb-btn">{buttonText}</Link>
            {secondButtonText && (
              <Link href={fixLink(secondButtonLink)} className="ccb-btn-outline">{secondButtonText}</Link>
            )}
          </div>
        </div>
        <div className="ccb-img-col">
          <img src={image} alt="Promo" className="ccb-img" loading="lazy"  onError={(e) => onImgError(e, "fallback")} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. COSMETICS INFO BOXES
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsInfoBox {
  image: string;
  number: string;
  title: string;
  description: string;
}

export interface CosmeticsInfoBoxesProps {
  sectionTitle?: { subtitle?: string; title: string; description?: string };
  boxes: CosmeticsInfoBox[];
  marginBottom?: string;
}

export function CosmeticsInfoBoxes({ sectionTitle, boxes, marginBottom = "60px" }: CosmeticsInfoBoxesProps) {
  const { ref, inView } = useInView();

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>, boxTitle?: string) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
    console.warn(`Image failed to load for info box: ${boxTitle || "unknown"}`);
  };

  const scopedCss = `
    .cib-section { margin-bottom: ${marginBottom}; }
    .cib-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
    .cib-card { text-align: center; }
    .cib-img-wrap { overflow: hidden; margin-bottom: 20px; min-height: 120px; display: flex; align-items: center; justify-content: center; background: #f9f9f9; }
    .cib-img { width: 100%; height: auto; display: block; transition: transform 0.6s ease; }
    .cib-card:hover .cib-img { transform: scale(1.05); }
    .cib-number {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 24px;
      color: ${TOKENS.primaryColor}; margin-bottom: 8px;
    }
    .cib-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 16px;
      color: ${TOKENS.titleColor}; text-transform: uppercase; margin: 0 0 10px;
      letter-spacing: 1px;
    }
    .cib-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor};
      line-height: 1.6;
    }
    .cib-animate { opacity: 0; transform: translateY(20px); transition: all 0.5s ease; }
    .cib-animate.cib-visible { opacity: 1; transform: translateY(0); }
    @media (max-width: 767px) {
      .cib-grid { grid-template-columns: 1fr; gap: 30px; }
    }
  `;

  return (
    <div className="cib-section" ref={ref} style={containerStyle}>
      <ScopedStyles id="info-boxes" css={scopedCss} />
      {sectionTitle && (
        <CosmeticsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} description={sectionTitle.description} />
      )}
      <div className="cib-grid">
        {boxes.map((box, i) => (
          <div key={i} className={`cib-card cib-animate ${inView ? "cib-visible" : ""}`} style={{ transitionDelay: `${i * 0.15}s` }}>
            <div className="cib-img-wrap">
              {box.image && box.image.trim() !== "" ? (
                <img 
                  src={box.image} 
                  alt={box.title || ""} 
                  className="cib-img" 
                  loading="lazy" 
                  onError={(e) => onImgError(e, box.title)} 
                />
              ) : null}
            </div>
            <div className="cib-number">{box.number}</div>
            <h4 className="cib-title">{box.title}</h4>
            <p className="cib-desc">{box.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. COSMETICS BLOG POSTS
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsBlogPost {
  image: string;
  title: string;
  excerpt: string;
  date: { day: string; month: string };
  categories: string[];
  author: { name: string; avatar?: string };
  link: string;
  commentCount?: number;
}

export interface CosmeticsBlogPostsProps {
  posts: CosmeticsBlogPost[];
  columns?: number;
  sectionTitle?: { subtitle?: string; title: string; description?: string };
  marginBottom?: string;
}

export function CosmeticsBlogPosts({ posts: propPosts, columns = 2, sectionTitle, marginBottom = "60px" }: CosmeticsBlogPostsProps) {
  const storeCtx = useContext(CosmeticsStoreContext);

  const posts: CosmeticsBlogPost[] = (() => {
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
    .cbp-section { margin-bottom: ${marginBottom}; }
    .cbp-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .cbp-card { display: flex; overflow: hidden; background: #fff; }
    .cbp-card:nth-child(even) { flex-direction: row-reverse; }
    .cbp-img-wrap { position: relative; flex: 0 0 45%; overflow: hidden; }
    .cbp-img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 250px; }
    .cbp-date-badge {
      position: absolute; top: 15px; left: 15px; background: ${TOKENS.primaryColor};
      color: #fff; text-align: center; padding: 8px 12px; z-index: 2;
    }
    .cbp-date-day { display: block; font-size: 20px; font-weight: 700; line-height: 1; font-family: ${TOKENS.bodyFont}; }
    .cbp-date-month { display: block; font-size: 11px; text-transform: uppercase; font-family: ${TOKENS.bodyFont}; }
    .cbp-content { flex: 1; padding: 25px 20px; display: flex; flex-direction: column; justify-content: center; }
    .cbp-cats { margin-bottom: 8px; display: flex; gap: 5px; flex-wrap: wrap; }
    .cbp-cat {
      background: #f0f0f0; color: ${TOKENS.entityTitleColor}; font-size: 11px;
      padding: 3px 10px; text-transform: uppercase; font-weight: 600;
      text-decoration: none; font-family: ${TOKENS.bodyFont};
    }
    .cbp-title {
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 16px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 10px; line-height: 1.4;
    }
    .cbp-title a { color: inherit; text-decoration: none; }
    .cbp-title a:hover { color: rgba(51,51,51,0.65); }
    .cbp-meta {
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
      font-size: 12px; color: ${TOKENS.textColor}; font-family: ${TOKENS.bodyFont};
    }
    .cbp-meta-avatar { width: 18px; height: 18px; border-radius: 50%; }
    .cbp-excerpt {
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
      line-height: 1.6; margin-bottom: 12px;
    }
    .cbp-read-more {
      color: ${TOKENS.entityTitleColor}; font-size: 13px; font-weight: 600;
      text-decoration: none; font-family: ${TOKENS.bodyFont};
    }
    .cbp-read-more:hover { color: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) { .cbp-grid { grid-template-columns: 1fr; } }
    @media (max-width: 767px) {
      .cbp-card, .cbp-card:nth-child(even) { flex-direction: column; }
      .cbp-img-wrap { flex: none; }
      .cbp-img { min-height: 200px; }
    }
  `;

  return (
    <div className="cbp-section" style={containerStyle}>
      <ScopedStyles id="blog-posts" css={scopedCss} />
      {sectionTitle && (
        <CosmeticsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} description={sectionTitle.description} />
      )}
      <div className="cbp-grid">
        {posts.map((p, i) => (
          <article key={i} className="cbp-card">
            <div className="cbp-img-wrap">
              <img src={p.image} alt={p.title} className="cbp-img" loading="lazy"  onError={(e) => onImgError(e, p.title)} />
              <div className="cbp-date-badge">
                <span className="cbp-date-day">{p.date.day}</span>
                <span className="cbp-date-month">{p.date.month}</span>
              </div>
              <Link href={resolveStoreLink(p.link, storeCtx?.storeSlug)} style={{ position: "absolute", inset: 0, zIndex: 3 }} aria-label={p.title} />
            </div>
            <div className="cbp-content">
              <div className="cbp-cats">
                {p.categories.map((c, ci) => (
                  <span key={ci} className="cbp-cat">{c}</span>
                ))}
              </div>
              <h3 className="cbp-title"><Link href={p.link}>{p.title}</Link></h3>
              <div className="cbp-meta">
                {p.author.avatar && <img src={p.author.avatar} alt={p.author.name} className="cbp-meta-avatar"  onError={(e) => onImgError(e, p.author.name)} />}
                <span>Posted by <strong>{p.author.name}</strong></span>
                {p.commentCount !== undefined && <span>💬 {p.commentCount}</span>}
              </div>
              <p className="cbp-excerpt">{p.excerpt}</p>
              <Link href={p.link} className="cbp-read-more">Continue reading</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. COSMETICS INSTAGRAM FEED
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsInstagramItem {
  image: string;
  likes: number;
  comments: number;
  link: string;
}

export interface CosmeticsInstagramProps {
  items: CosmeticsInstagramItem[];
  marginBottom?: string;
}

export function CosmeticsInstagram({ items, marginBottom = "0px" }: CosmeticsInstagramProps) {
  const scopedCss = `
    .ci-section { margin-bottom: ${marginBottom}; }
    .ci-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0; }
    .ci-item { position: relative; overflow: hidden; cursor: pointer; aspect-ratio: 1; }
    .ci-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
    .ci-item:hover .ci-img { transform: scale(1.1); }
    .ci-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; gap: 15px;
      opacity: 0; transition: opacity 0.3s ease; z-index: 2;
    }
    .ci-item:hover .ci-overlay { opacity: 1; }
    .ci-stat {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; font-weight: 700;
      color: #fff; display: flex; align-items: center; gap: 5px;
    }
    .ci-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { .ci-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .ci-grid { grid-template-columns: repeat(2, 1fr); } }
  `;

  return (
    <div className="ci-section">
      <ScopedStyles id="instagram" css={scopedCss} />
      <div className="ci-grid">
        {items.map((item, i) => (
          <div key={i} className="ci-item">
            <img src={item.image} alt={`Instagram ${i + 1}`} className="ci-img" loading="lazy"  onError={(e) => onImgError(e, `Instagram ${i + 1}`)} />
            <div className="ci-overlay">
              <span className="ci-stat">❤ {item.likes.toLocaleString()}</span>
              <span className="ci-stat">💬 {item.comments}</span>
            </div>
            <a href={item.link} className="ci-link" target="_blank" rel="noopener noreferrer" aria-label={`Instagram post ${i + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. COSMETICS NEWSLETTER
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsNewsletterProps {
  backgroundImage?: string;
  subtitle?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  onSubmit?: (email: string) => void;
  resolvedStyles?: React.CSSProperties;
  resolvedClasses?: string;
}

export function CosmeticsNewsletter({
  backgroundImage = "https://woodmart.xtemos.com/wp-content/uploads/2017/01/newsletter-wood-3.jpg",
  subtitle = "Subscribe",
  title = "SIGN UP FOR OUR NEWSLETTER",
  description = "Get the latest updates on new products and upcoming sales.",
  buttonText = "Sign up",
  onSubmit,
  resolvedStyles,
  resolvedClasses,
}: CosmeticsNewsletterProps) {
  const [email, setEmail] = useState("");
  const storeCtx = useContext(CosmeticsStoreContext);
  const { subscribe, status: nlStatus } = useNewsletterSubscribe(storeCtx?.storeSlug || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) { onSubmit(email); setEmail(""); return; }
    subscribe(email).then(() => setEmail(""));
  };

  // Merge resolved styles with default background image
  const rootStyle: React.CSSProperties = {
    backgroundImage: `url(${backgroundImage})`,
    ...resolvedStyles,
  };

  const scopedCss = `
    .cn-section {
      padding: 60px 40px; text-align: center;
      background-size: cover; background-position: center; background-repeat: no-repeat;
      position: relative;
    }
    .cn-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.35); z-index: 1; }
    .cn-content { position: relative; z-index: 2; }
    .cn-subtitle {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: rgba(255,255,255,0.7);
      text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;
    }
    .cn-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px;
      color: #fff; margin: 0 0 12px; text-transform: uppercase;
    }
    .cn-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; color: rgba(255,255,255,0.8);
      margin: 0 auto 25px; max-width: 500px;
    }
    .cn-form {
      display: flex; max-width: 450px; margin: 0 auto; gap: 0;
    }
    .cn-input {
      flex: 1; padding: 14px 18px; border: 2px solid rgba(255,255,255,0.3);
      font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none;
      background: transparent; color: #fff; border-right: none;
    }
    .cn-input::placeholder { color: rgba(255,255,255,0.5); }
    .cn-input:focus { border-color: ${TOKENS.primaryColor}; }
    .cn-submit {
      padding: 14px 25px; background: ${TOKENS.primaryColor}; color: #fff;
      border: 2px solid ${TOKENS.primaryColor}; font-family: ${TOKENS.bodyFont};
      font-weight: 600; font-size: 13px; text-transform: uppercase; cursor: pointer;
      transition: background 0.3s;
    }
    .cn-submit:hover { filter: brightness(0.9); }
    @media (max-width: 767px) {
      .cn-form { flex-direction: column; gap: 10px; }
      .cn-input { border-right: 2px solid rgba(255,255,255,0.3); }
      .cn-section { padding: 40px 20px; }
      .cn-title { font-size: 22px; }
    }
  `;

  return (
    <div className={`cn-section ${resolvedClasses || ''}`} style={rootStyle}>
      <ScopedStyles id="newsletter" css={scopedCss} />
      <div className="cn-overlay" />
      <div className="cn-content">
        <div className="cn-subtitle">{subtitle}</div>
        <h3 className="cn-title">{title}</h3>
        <p className="cn-desc">{description}</p>
        {nlStatus === "success" ? (
          <p style={{ fontFamily: TOKENS.bodyFont, fontSize: "16px", color: "#fff", marginTop: "20px" }}>Thanks for subscribing! 🎉</p>
        ) : (
        <form className="cn-form" onSubmit={handleSubmit}>
          <input type="email" className="cn-input" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="cn-submit" disabled={nlStatus === "loading"}>{nlStatus === "loading" ? "Signing up..." : buttonText}</button>
        </form>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COSMETICS HEADER
   Clean and minimal header matching WoodMart Cosmetics demo.
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  cartCount?: number;
  wishlistCount?: number;
  onSearch?: (q: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  isLanding?: boolean;
}

export function CosmeticsHeader({
  storeName,
  storeSlug,
  logo,
  cartCount = 0,
  wishlistCount = 0,
  onSearch,
  searchQuery = "",
  onSearchChange,
  isLanding = false,
}: CosmeticsHeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const searchUrl = resolveStoreLink(`/shop?search=${encodeURIComponent(query.trim())}`, storeSlug);
      router.push(searchUrl);
      setShowSearch(false);
      setLocalSearchQuery("");
    }
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Blog", href: "/blog" },
    { label: "Terms and Conditions", href: "/terms" },
  ];

  const iconLinks: Array<{ icon: string; label: string; action?: () => void; href?: string; count?: number }> = [
    { icon: "🔍", label: "Search", action: () => setShowSearch(!showSearch) },
    { icon: "♡", label: "Wishlist", href: "/wishlist", count: wishlistCount },
    { icon: "🛒", label: "Cart", href: "/cart", count: cartCount },
  ].filter(link => !isLanding || (link.label !== "Search" && link.label !== "Wishlist" && link.label !== "Cart"));

  const scopedCss = `
    .ch-header { background: #fff; border-bottom: 1px solid #e5e5e5; }
    .ch-top-bar { background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 12px; padding: 8px 0; text-align: center; }
    .ch-main { padding: 20px 15px; }
    .ch-main-inner { max-width: ${TOKENS.containerWidth}; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
    .ch-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
    .ch-logo-img { height: 45px; width: auto; object-fit: contain; }
    .ch-logo-text { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 26px; color: ${TOKENS.titleColor}; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; }
    .ch-icons { display: flex; align-items: center; gap: 8px; }
    .ch-icon-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; background: none; border: 1px solid #e5e5e5; cursor: pointer; color: ${TOKENS.linkColor}; font-size: 18px; text-decoration: none; transition: all 0.2s; border-radius: 0; }
    .ch-icon-btn:hover { background: ${TOKENS.primaryColor}; color: #fff; border-color: ${TOKENS.primaryColor}; }
    .ch-badge { position: absolute; top: -5px; right: -5px; min-width: 18px; height: 18px; border-radius: 50%; background: ${TOKENS.primaryColor}; color: #fff; font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; line-height: 1; border: 2px solid #fff; }
    .ch-nav { background: #fff; border-bottom: 1px solid #e5e5e5; }
    .ch-nav-inner { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px; display: flex; align-items: center; height: 55px; }
    .ch-nav-links { display: flex; align-items: center; gap: 0; height: 100%; }
    .ch-nav-link { display: flex; align-items: center; height: 100%; padding: 0 25px; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; color: ${TOKENS.linkColor}; text-decoration: none; text-transform: uppercase; transition: color 0.2s; position: relative; letter-spacing: 0.5px; }
    .ch-nav-link:hover { color: ${TOKENS.primaryColor}; }
    .ch-nav-link::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: ${TOKENS.primaryColor}; transform: scaleX(0); transition: transform 0.2s; }
    .ch-nav-link:hover::after { transform: scaleX(1); }
    .ch-search-bar { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 15px; background: #fff; border-bottom: 1px solid #e5e5e5; }
    .ch-search-input { width: 100%; padding: 12px 20px; border: 1px solid #ddd; font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none; background: #f9f9f9; }
    .ch-search-input:focus { border-color: ${TOKENS.primaryColor}; background: #fff; }
    .ch-mobile-toggle { display: none; background: none; border: none; font-size: 24px; cursor: pointer; color: ${TOKENS.linkColor}; padding: 8px; }
    .ch-mobile-menu { display: none; background: #fff; border-bottom: 1px solid #e5e5e5; padding: 20px; }
    .ch-mobile-menu a { display: block; padding: 12px 0; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px; color: ${TOKENS.linkColor}; text-decoration: none; text-transform: uppercase; border-bottom: 1px solid #f5f5f5; letter-spacing: 0.5px; }
    .ch-mobile-menu a:last-child { border-bottom: none; }
    .ch-mobile-menu a:hover { color: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) {
      .ch-main-inner { padding: 15px; }
      .ch-logo-text { font-size: 22px; }
      .ch-nav { display: none; }
      .ch-mobile-toggle { display: block; }
      .ch-mobile-menu.ch-open { display: block; }
    }
    @media (max-width: 767px) {
      .ch-logo-text { font-size: 18px; }
      .ch-icons { gap: 5px; }
      .ch-icon-btn { width: 38px; height: 38px; font-size: 16px; }
    }
  `;

  return (
    <div className="ch-header">
      <ScopedStyles id="cosmetics-header" css={scopedCss} />
      {/* Top Bar */}
      <div className="ch-top-bar">
        <div className="ch-main-inner">
          <div>Free shipping on orders over $50.00</div>
        </div>
      </div>

      {/* Main Header */}
      <div className="ch-main">
        <div className="ch-main-inner">
          <button className="ch-mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            {mobileMenu ? "✕" : "☰"}
          </button>
          <Link href={resolveStoreLink("/", storeSlug)} className="ch-logo">
            {logo ? <img src={logo} alt={storeName} className="ch-logo-img" /> : null}
            <span className="ch-logo-text">{storeName}</span>
          </Link>
          <div className="ch-icons">
            {iconLinks.map((link, i) => (
              link.action ? (
                <button key={i} className="ch-icon-btn" onClick={link.action} aria-label={link.label}>
                  {link.icon}{link.count && link.count > 0 && <span className="ch-badge">{link.count}</span>}
                </button>
              ) : (
                <Link key={i} href={resolveStoreLink(link.href || "#", storeSlug)} className="ch-icon-btn" aria-label={link.label}>
                  {link.icon}{link.count && link.count > 0 && <span className="ch-badge">{link.count}</span>}
                </Link>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="ch-search-bar">
          <input
            autoFocus
            type="text"
            className="ch-search-input"
            placeholder="Search products..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(localSearchQuery); }}
          />
        </div>
      )}

      {/* Desktop Nav */}
      <nav className="ch-nav">
        <div className="ch-nav-inner">
          <div className="ch-nav-links">
            {navItems.map((item) => (
              <Link key={item.href} href={resolveStoreLink(item.href, storeSlug)} className="ch-nav-link">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`ch-mobile-menu ${mobileMenu ? "ch-open" : ""}`}>
        {navItems.map((item) => (
          <Link key={item.href} href={resolveStoreLink(item.href, storeSlug)} onClick={() => setMobileMenu(false)}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COSMETICS FOOTER
   Matching WoodMart Cosmetics demo footer exactly.
   ═══════════════════════════════════════════════════════════════ */

export interface CosmeticsFooterProps {
  storeName?: string;
  logo?: string | null;
  description?: string;
  contactInfo?: { address?: string; phone?: string; email?: string };
  socialLinks?: Array<{ platform: string; url: string }>;
  navPages?: Array<{ id: string; title: string; slug: string }>;
  copyrightText?: string;
  paymentIconsUrl?: string;
  storeSlug?: string;
}

export function CosmeticsFooter({
  storeName = "Cosmetics Store",
  logo,
  description = "Premium cosmetics and skincare products for natural beauty. Discover our curated collection of high-quality beauty products.",
  contactInfo = {},
  socialLinks = [],
  navPages = [],
  copyrightText,
  paymentIconsUrl,
  storeSlug: storeSlugProp,
}: CosmeticsFooterProps) {
  const storeCtx = useContext(CosmeticsStoreContext);
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

  const scopedCss = `
    .cf-footer { background: #1a1a1a; color: rgba(255,255,255,0.7); font-family: ${TOKENS.bodyFont}; padding: 80px 0 0; }
    .cf-inner { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 0 15px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
    .cf-col-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 14px; color: #fff; text-transform: uppercase; margin: 0 0 25px; letter-spacing: 1.5px; }
    .cf-text { font-size: 14px; line-height: 1.8; color: rgba(255,255,255,0.7); margin-bottom: 20px; }
    .cf-links { list-style: none; padding: 0; margin: 0; }
    .cf-links li { margin-bottom: 12px; }
    .cf-links a { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; transition: color 0.2s; }
    .cf-links a:hover { color: ${TOKENS.primaryColor}; }
    .cf-contact-item { display: flex; gap: 12px; margin-bottom: 15px; font-size: 14px; line-height: 1.6; }
    .cf-contact-label { color: #fff; font-weight: 700; min-width: 70px; }
    .cf-social { display: flex; gap: 10px; margin-top: 20px; }
    .cf-social-icon { width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; transition: all 0.2s; }
    .cf-social-icon:hover { border-color: ${TOKENS.primaryColor}; background: ${TOKENS.primaryColor}; color: #fff; }
    .cf-bottom { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 25px 15px; margin-top: 60px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
    .cf-copyright { color: rgba(255,255,255,0.5); }
    .cf-logo-text { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 20px; color: #fff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; display: inline-block; }
    .cf-toggle-head { display: none; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; padding: 0; }
    .cf-toggle-content { display: block; }
    .cf-newsletter-input { width: 100%; padding: 12px 15px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff; font-size: 14px; outline: none; margin-bottom: 10px; }
    .cf-newsletter-input::placeholder { color: rgba(255,255,255,0.5); }
    .cf-newsletter-input:focus { border-color: ${TOKENS.primaryColor}; }
    .cf-newsletter-btn { width: 100%; padding: 12px; background: ${TOKENS.primaryColor}; color: #fff; border: none; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; transition: background 0.3s; }
    .cf-newsletter-btn:hover { filter: brightness(0.9); }
    @media (max-width: 1024px) { .cf-inner { grid-template-columns: repeat(2, 1fr); gap: 35px; } }
    @media (max-width: 767px) {
      .cf-inner { grid-template-columns: 1fr; gap: 30px; }
      .cf-bottom { flex-direction: column; gap: 15px; text-align: center; }
      .cf-toggle-head { display: flex; }
      .cf-toggle-content { display: none; }
      .cf-toggle-content.cf-open { display: block; }
      .cf-col-title { margin-bottom: 0; }
      .cf-toggle-head.cf-open .cf-col-title { margin-bottom: 15px; }
    }
  `;

  const socialIcons: Record<string, string> = {
    facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶", tiktok: "♪",
  };

  return (
    <footer className="cf-footer">
      <ScopedStyles id="cosmetics-footer" css={scopedCss} />
      <div className="cf-inner">
        {/* Col 1: About */}
        <div>
          <div className="cf-toggle-head" onClick={() => toggleColumn(0)}>
            <h4 className="cf-col-title">About</h4>
            <span>{openColumns.has(0) ? "−" : "+"}</span>
          </div>
          <div className={`cf-toggle-content ${openColumns.has(0) ? "cf-open" : ""}`}>
            <h4 className="cf-col-title">About</h4>
            <Link href={resolveStoreLink("/", resolvedSlug)} className="cf-logo-text">{storeName}</Link>
            <p className="cf-text">{description}</p>
            <div className="cf-social">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} className="cf-social-icon" target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                  {socialIcons[s.platform] || s.platform[0]?.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: Shop */}
        <div>
          <div className="cf-toggle-head" onClick={() => toggleColumn(1)}>
            <h4 className="cf-col-title">Shop</h4>
            <span>{openColumns.has(1) ? "−" : "+"}</span>
          </div>
          <div className={`cf-toggle-content ${openColumns.has(1) ? "cf-open" : ""}`}>
            <h4 className="cf-col-title">Shop</h4>
            <ul className="cf-links">
              <li><Link href={resolveStoreLink("/shop", resolvedSlug)}>All Products</Link></li>
              <li><Link href={resolveStoreLink("/shop?category=skincare", resolvedSlug)}>Skincare</Link></li>
              <li><Link href={resolveStoreLink("/shop?tag=bestseller", resolvedSlug)}>Bestsellers</Link></li>
              <li><Link href={resolveStoreLink("/shop?tag=new-arrival", resolvedSlug)}>New Arrivals</Link></li>
            </ul>
          </div>
        </div>

        {/* Col 3: Information */}
        <div>
          <div className="cf-toggle-head" onClick={() => toggleColumn(2)}>
            <h4 className="cf-col-title">Information</h4>
            <span>{openColumns.has(2) ? "−" : "+"}</span>
          </div>
          <div className={`cf-toggle-content ${openColumns.has(2) ? "cf-open" : ""}`}>
            <h4 className="cf-col-title">Information</h4>
            <ul className="cf-links">
              <li><Link href={resolveStoreLink("/blog", resolvedSlug)}>Blog</Link></li>
              <li><Link href={resolveStoreLink("/terms", resolvedSlug)}>Terms & Conditions</Link></li>
              <li><Link href={resolveStoreLink("/terms", resolvedSlug)}>Privacy Policy</Link></li>
              <li><Link href={resolveStoreLink("/my-account", resolvedSlug)}>Shipping Info</Link></li>
            </ul>
          </div>
        </div>

        {/* Col 4: Newsletter */}
        <div>
          <div className="cf-toggle-head" onClick={() => toggleColumn(3)}>
            <h4 className="cf-col-title">Newsletter</h4>
            <span>{openColumns.has(3) ? "−" : "+"}</span>
          </div>
          <div className={`cf-toggle-content ${openColumns.has(3) ? "cf-open" : ""}`}>
            <h4 className="cf-col-title">Newsletter</h4>
            <p className="cf-text">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="cf-newsletter-input"
            />
            <button className="cf-newsletter-btn">Subscribe</button>
          </div>
        </div>
      </div>

      <div className="cf-bottom">
        <span className="cf-copyright">{copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}</span>
        {paymentIconsUrl && <img src={paymentIconsUrl} alt="Payment methods" style={{ height: "25px", width: "auto" }} />}
      </div>
    </footer>
  );
}
