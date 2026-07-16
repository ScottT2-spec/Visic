"use client";
import { FashionFooter } from "./FashionTemplateBlocks";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { toggleCompare as toggleCompareItem } from "@/lib/compare-utils";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";

/* ═══════════════════════════════════════════════════════════════
   ELECTRONICS TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Electronics template sections.
   All styling via scoped CSS — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "var(--color-primary)",
  primaryHover: "var(--color-primary)", // Will use CSS filter for hover effect
  alternativeColor: "var(--color-accent)",
  titleColor: "var(--color-text)",
  textColor: "var(--color-muted-text)",
  entityTitleColor: "var(--color-text)",
  linkColor: "var(--color-text)",
  starColor: "var(--color-accent)",
  containerWidth: "1222px",
  borderRadius: "0px",
  titleFont: "'Poppins', Arial, Helvetica, sans-serif",
  bodyFont: "'Lato', Arial, Helvetica, sans-serif",
  titleFontWeight: "600",
  entityTitleFontWeight: "500",
};

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function ElectronicsFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Poppins:wght@400;500;600;700&display=swap');
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
  return <style data-electronics-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
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
export interface ElectronicsStoreContextData {
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
export const ElectronicsStoreContext = createContext<ElectronicsStoreContextData | null>(null);

/* ─── CURRENCY HELPER ───────────────────────────────────────── */
function useCurrencySymbol() {
  const ctx = useContext(ElectronicsStoreContext);
  const currencySymbols: Record<string, string> = { GHS: "GH₵", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const currency = ctx?.currency || "USD";
  return currencySymbols[currency] || currency;
}

function useFixLink() {
  const ctx = useContext(ElectronicsStoreContext);
  return (link: string) => resolveStoreLink(link, ctx?.storeSlug);
}

/* ═══════════════════════════════════════════════════════════════
   ELECTRONICS SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsSectionTitleProps {
  title: string;
  align?: "left" | "center" | "right";
  showLine?: boolean;
}

export function ElectronicsSectionTitle({ title, align = "center", showLine = true }: ElectronicsSectionTitleProps) {
  const scopedCss = `
    .est-wrapper { margin-bottom: 25px; text-align: ${align}; }
    .est-title {
      font-family: ${TOKENS.titleFont}; font-weight: ${TOKENS.titleFontWeight}; font-size: 20px;
      text-transform: uppercase; color: ${TOKENS.titleColor}; display: inline-block;
      position: relative; padding-bottom: 12px; margin: 0; letter-spacing: 0.5px;
    }
    .est-title.est-lined::after {
      content: ''; position: absolute; bottom: 0; left: 50%;
      transform: translateX(-50%); width: 40px; height: 2px;
      background: ${TOKENS.primaryColor};
    }
    .est-title.est-left::after { left: 0; transform: none; }
    .est-title.est-right::after { left: auto; right: 0; transform: none; }
  `;

  return (
    <div className="est-wrapper">
      <ScopedStyles id="section-title" css={scopedCss} />
      <h4 className={`est-title ${showLine ? "est-lined" : ""} ${align !== "center" ? `est-${align}` : ""}`}>
        {title}
      </h4>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. ELECTRONICS HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsHeroSlide {
  subtitle: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  backgroundColor?: string;
  backgroundFit?: "cover" | "contain";
  textPosition?: "left" | "center" | "right";
  colorScheme?: "dark" | "light";
}

export interface ElectronicsHeroSliderProps {
  slides: ElectronicsHeroSlide[];
  autoplaySpeed?: number;
  minHeight?: string;
}

export function ElectronicsHeroSlider({ slides, autoplaySpeed = 5000, minHeight = "500px" }: ElectronicsHeroSliderProps) {
  const fixLink = useFixLink();
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
    .ehs-slider { position: relative; width: 100%; overflow: hidden; background: #f2f2f2; }
    .ehs-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .ehs-slide.ehs-active { opacity: 1; position: relative; }
    .ehs-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center center; z-index: 0; }
    .ehs-slide-bg-contain { background-size: contain; background-repeat: no-repeat; background-position: right center; }
    .ehs-slide-content { position: relative; z-index: 2; width: 100%; }
    .ehs-subtitle {
      color: ${TOKENS.primaryColor}; text-transform: uppercase; font-weight: 700;
      font-size: 20px; line-height: 30px; font-family: ${TOKENS.bodyFont}; margin-bottom: 10px;
    }
    .ehs-subtitle-light { color: ${TOKENS.primaryColor}; }
    .ehs-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 52px;
      line-height: 64px; margin: 0 0 15px;
    }
    .ehs-title-dark { color: ${TOKENS.titleColor}; }
    .ehs-title-light { color: #ffffff; }
    .ehs-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 26px;
      max-width: 90%; margin: 0 0 25px;
    }
    .ehs-desc-dark { color: ${TOKENS.textColor}; }
    .ehs-desc-light { color: rgba(255,255,255,0.75); }
    .ehs-btn {
      display: inline-block; padding: 12px 30px;
      background: ${TOKENS.primaryColor}; color: #fff; text-transform: uppercase;
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 13px;
      text-decoration: none; border: none; cursor: pointer; border-radius: 35px;
      transition: background-color 0.3s ease; letter-spacing: 0.5px;
    }
    .ehs-btn:hover { filter: brightness(0.9); }
    .ehs-dots {
      position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 10px; z-index: 5;
    }
    .ehs-dot {
      width: 12px; height: 12px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.5);
      cursor: pointer; background: transparent; transition: all 0.3s ease; padding: 0;
    }
    .ehs-dot.ehs-dot-active { background: #ffffff; border-color: #fff; }
    .ehs-nav {
      position: absolute; top: 50%; transform: translateY(-50%); z-index: 5;
      width: 40px; height: 40px; background: rgba(0,0,0,0.3); color: #fff; border: none;
      cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;
      transition: background 0.3s; border-radius: ${TOKENS.borderRadius};
    }
    .ehs-nav:hover { background: ${TOKENS.primaryColor}; }
    .ehs-nav-prev { left: 15px; }
    .ehs-nav-next { right: 15px; }
    .ehs-anim-in { animation: ehsSlideUp 0.6s ease forwards; opacity: 0; }
    @keyframes ehsSlideUp {
      from { opacity: 0; transform: translateY(25px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 1024px) {
      .ehs-slider { min-height: 660px !important; }
      .ehs-title { font-size: 36px; line-height: 46px; }
    }
    @media (max-width: 767px) {
      .ehs-slider { min-height: 450px !important; }
      .ehs-title { font-size: 36px; line-height: 46px; }
      .ehs-subtitle { font-size: 16px; line-height: 26px; }
      .ehs-nav { display: none; }
    }
  `;

  return (
    <div className="ehs-slider" style={{ minHeight }}>
      <ScopedStyles id="ehs-hero" css={scopedCss} />
      {slides.map((slide, i) => {
        const scheme = slide.colorScheme || "dark";
        const align = slide.textPosition || "left";
        return (
          <div key={i} className={`ehs-slide ${i === current ? "ehs-active" : ""}`} style={{ backgroundColor: slide.backgroundColor || "#f2f2f2" }}>
            <div className={`ehs-slide-bg ${slide.backgroundFit === "contain" ? "ehs-slide-bg-contain" : ""}`} style={{ backgroundImage: `url(${slide.backgroundImage})` }} />
            <div className="ehs-slide-content">
              <div style={{ ...containerStyle, textAlign: align as React.CSSProperties["textAlign"] }}>
                <div style={{ maxWidth: align === "center" ? "65%" : "50%", margin: align === "center" ? "0 auto" : align === "right" ? "0 0 0 auto" : "0", padding: "40px 0" }}>
                  {i === current && (
                    <>
                      <div className={`ehs-subtitle ${scheme === "light" ? "ehs-subtitle-light" : ""} ehs-anim-in`} style={{ animationDelay: "0.2s" }}>{slide.subtitle}</div>
                      <div className={`ehs-title ehs-title-${scheme} ehs-anim-in`} style={{ animationDelay: "0.3s" }}>{slide.titleLine1}</div>
                      <div className={`ehs-title ehs-title-${scheme} ehs-anim-in`} style={{ animationDelay: "0.4s" }}>{slide.titleLine2}</div>
                      <div className={`ehs-desc ehs-desc-${scheme} ehs-anim-in`} style={{ animationDelay: "0.5s" }}>{slide.description}</div>
                      <div className="ehs-anim-in" style={{ animationDelay: "0.6s" }}>
                        <Link href={fixLink(slide.buttonLink)} className="ehs-btn">{slide.buttonText}</Link>
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
        <>
          <button className="ehs-nav ehs-nav-prev" onClick={() => goTo((current - 1 + slides.length) % slides.length)} aria-label="Previous">‹</button>
          <button className="ehs-nav ehs-nav-next" onClick={() => goTo((current + 1) % slides.length)} aria-label="Next">›</button>
          <div className="ehs-dots">
            {slides.map((_, i) => (
              <button key={i} className={`ehs-dot ${i === current ? "ehs-dot-active" : ""}`} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. ELECTRONICS PROMO BANNERS
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsPromoBanner {
  image: string;
  subtitle: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  colorScheme?: "dark" | "light";
}

export interface ElectronicsPromoBannersProps {
  banners: ElectronicsPromoBanner[];
}

export function ElectronicsPromoBanners({ banners }: ElectronicsPromoBannersProps) {
  const fixLink = useFixLink();
  const scopedCss = `
    .epb-section { padding: 30px 0; }
    .epb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
    .epb-card { position: relative; overflow: hidden; border-radius: ${TOKENS.borderRadius}; cursor: pointer; min-height: 350px; display: flex; align-items: flex-start; }
    .epb-card-dark { background: #1a1a2e; }
    .epb-card-light { background: #f5f5f5; }
    .epb-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; transition: transform 0.6s ease; }
    .epb-card:hover .epb-img { transform: scale(1.05); }
    .epb-content { position: relative; z-index: 2; padding: 30px; max-width: 60%; }
    .epb-subtitle { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 8px; font-family: ${TOKENS.bodyFont}; }
    .epb-subtitle-dark { color: rgba(255,255,255,0.6); }
    .epb-subtitle-light { color: ${TOKENS.textColor}; }
    .epb-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 24px; line-height: 1.2; margin: 0 0 10px; }
    .epb-title-dark { color: #fff; }
    .epb-title-light { color: ${TOKENS.titleColor}; }
    .epb-desc { font-size: 13px; line-height: 1.6; margin-bottom: 15px; font-family: ${TOKENS.bodyFont}; }
    .epb-desc-dark { color: rgba(255,255,255,0.6); }
    .epb-desc-light { color: ${TOKENS.textColor}; }
    .epb-btn {
      display: inline-block; padding: 10px 25px; font-size: 12px; font-weight: 600;
      text-transform: uppercase; text-decoration: none; border-radius: ${TOKENS.borderRadius};
      transition: all 0.3s; font-family: ${TOKENS.bodyFont}; letter-spacing: 0.5px;
    }
    .epb-btn-dark { background: ${TOKENS.primaryColor}; color: #fff; border-radius: 35px; }
    .epb-btn-dark:hover { filter: brightness(0.9); }
    .epb-btn-light { background: #fff; color: ${TOKENS.titleColor}; border-radius: 35px; }
    .epb-btn-light:hover { background: #f0f0f0; }
    .epb-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 767px) {
      .epb-grid { grid-template-columns: 1fr; }
      .epb-card { min-height: 180px; }
      .epb-title { font-size: 20px; }
    }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="epb-banners" css={scopedCss} />
      <div className="epb-section">
        <div className="epb-grid">
          {banners.map((b, i) => {
            const scheme = b.colorScheme || "dark";
            return (
              <div key={i} className={`epb-card epb-card-${scheme}`}>
                {b.image && <img src={b.image} alt={b.title} className="epb-img" loading="lazy"  onError={(e) => onImgError(e, b.title)} />}
                <div className="epb-content">
                  <div className={`epb-subtitle epb-subtitle-${scheme}`}>{b.subtitle}</div>
                  <h4 className={`epb-title epb-title-${scheme}`}>{b.title}</h4>
                  <p className={`epb-desc epb-desc-${scheme}`}>{b.description}</p>
                  <span className={`epb-btn epb-btn-${scheme}`}>{b.buttonText}</span>
                </div>
                <Link href={fixLink(b.buttonLink)} className="epb-link" aria-label={b.title} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. ELECTRONICS PRODUCT TABS
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsProductTabsProps {
  sectionTitle?: string;
  tabs: Array<{ label: string; filter: string }>;
  columns?: number;
  maxProducts?: number;
}

export function ElectronicsProductTabs({ sectionTitle = "ELECTRONICS", tabs, columns = 4, maxProducts = 8 }: ElectronicsProductTabsProps) {
  const storeCtx = useContext(ElectronicsStoreContext);
  const [, setCompareState] = useState(false);
  const sym = useCurrencySymbol();
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);

  const getFilteredProducts = (filter: string) => {
    if (!storeCtx?.products?.length) return [];
    let prods = storeCtx.products;
    if (filter === "featured") {
      const f = prods.filter(p => p.isFeatured);
      if (f.length > 0) prods = f;
    } else if (filter === "new" || filter === "new-arrival") {
      const t = prods.filter(p => p.tags?.some(tag => tag.toLowerCase().replace(/[-_ ]/g, "") === "newarrival"));
      if (t.length > 0) prods = t;
    } else if (filter === "bestseller" || filter === "top-sellers") {
      const t = prods.filter(p => p.tags?.some(tag => tag.toLowerCase().replace(/[-_ ]/g, "") === "bestseller" || tag.toLowerCase().replace(/[-_ ]/g, "") === "topseller"));
      if (t.length > 0) prods = t;
    }
    return prods;
  };

  const filteredProducts = getFilteredProducts(tabs[activeTab]?.filter || "all");
  const totalPages = Math.ceil(filteredProducts.length / maxProducts);
  const displayProducts = filteredProducts.slice(page * maxProducts, (page + 1) * maxProducts);

  const scopedCss = `
    .ept-section { padding: 40px 0 50px; }
    .ept-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px; flex-wrap: wrap; gap: 10px; }
    .ept-tabs { display: flex; gap: 5px; }
    .ept-tab {
      padding: 8px 20px; font-size: 13px; font-weight: 600; font-family: ${TOKENS.bodyFont};
      text-transform: uppercase; border: none; cursor: pointer; background: transparent;
      color: ${TOKENS.textColor}; transition: all 0.3s; border-radius: ${TOKENS.borderRadius};
    }
    .ept-tab:hover { color: ${TOKENS.primaryColor}; }
    .ept-tab.ept-tab-active { background: ${TOKENS.primaryColor}; color: #fff; }
    .ept-grid {
      display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px;
    }
    .ept-card { position: relative; border: 1px solid #eee; border-radius: ${TOKENS.borderRadius}; overflow: hidden; transition: box-shadow 0.3s; }
    .ept-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .ept-thumb { position: relative; overflow: hidden; background: #f9f9f9; aspect-ratio: 1; }
    .ept-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .ept-card:hover .ept-thumb img { transform: scale(1.05); }
    .ept-badge {
      position: absolute; top: 8px; left: 8px; background: ${TOKENS.primaryColor};
      color: #fff; font-size: 11px; font-weight: 600; padding: 3px 8px;
      border-radius: ${TOKENS.borderRadius}; z-index: 2; text-transform: uppercase;
    }
    .ept-actions {
      position: absolute; top: 8px; right: 8px; display: flex; flex-direction: column;
      gap: 4px; opacity: 0; transform: translateX(10px); transition: all 0.3s; z-index: 3;
    }
    .ept-card:hover .ept-actions { opacity: 1; transform: translateX(0); }
    .ept-action-btn {
      width: 32px; height: 32px; border-radius: 50%; background: #fff; border: 1px solid #eee;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 13px; transition: all 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    }
    .ept-action-btn:hover { background: ${TOKENS.primaryColor}; color: #fff; border-color: ${TOKENS.primaryColor}; }
    .ept-info { padding: 12px 15px; }
    .ept-cat { font-size: 12px; color: #999; margin-bottom: 4px; font-family: ${TOKENS.bodyFont}; }
    .ept-name {
      font-family: ${TOKENS.titleFont}; font-weight: ${TOKENS.entityTitleFontWeight}; font-size: 14px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 6px; line-height: 1.3;
    }
    .ept-name a { color: inherit; text-decoration: none; }
    .ept-name a:hover { color: ${TOKENS.primaryColor}; }
    .ept-price { font-weight: 600; font-size: 14px; color: ${TOKENS.primaryColor}; font-family: ${TOKENS.bodyFont}; }
    .ept-price-old { text-decoration: line-through; color: #999; font-weight: 400; margin-right: 8px; font-size: 13px; }
    .ept-add-btn {
      display: block; width: 100%; padding: 10px; background: ${TOKENS.primaryColor}; color: #fff;
      border: none; text-transform: uppercase; font-weight: 600; font-size: 12px;
      font-family: ${TOKENS.bodyFont}; cursor: pointer; opacity: 0;
      transform: translateY(100%); transition: all 0.3s;
    }
    .ept-card:hover .ept-add-btn { opacity: 1; transform: translateY(0); }
    .ept-pagination { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 25px; }
    .ept-page-btn {
      width: 36px; height: 36px; border: 1px solid #ddd; background: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center; border-radius: ${TOKENS.borderRadius};
      font-size: 14px; color: ${TOKENS.textColor}; transition: all 0.3s;
    }
    .ept-page-btn:hover { border-color: ${TOKENS.primaryColor}; color: ${TOKENS.primaryColor}; }
    .ept-page-btn:disabled { opacity: 0.4; cursor: default; }
    .ept-empty { text-align: center; padding: 40px; color: ${TOKENS.textColor}; font-family: ${TOKENS.bodyFont}; }
    @media (max-width: 1024px) { .ept-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .ept-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .ept-header { flex-direction: column; align-items: flex-start; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="ept-tabs" css={scopedCss} />
      <div className="ept-section">
        <div className="ept-header">
          <ElectronicsSectionTitle title={sectionTitle} showLine={true} />
          <div className="ept-tabs">
            {tabs.map((tab, i) => (
              <button key={i} className={`ept-tab ${i === activeTab ? "ept-tab-active" : ""}`} onClick={() => { setActiveTab(i); setPage(0); }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {displayProducts.length === 0 ? (
          <div className="ept-empty">
            <p>No products yet. Add products from your dashboard to see them here.</p>
          </div>
        ) : (
          <>
            <div className="ept-grid">
              {displayProducts.map((p) => {
                const productLink = storeCtx ? `/store/${storeCtx.storeSlug}/product/${p.slug}` : "#";
                return (
                  <div key={p.id} className="ept-card">
                    <div className="ept-thumb">
                      <Link href={productLink}>
                        <img src={safeSrc(p.images[0]?.url, p.name)} alt={p.name} loading="lazy" onError={(e) => onImgError(e, p.name)} />
                      </Link>
                      {p.compareAtPrice && <span className="ept-badge">SALE</span>}
                      {!p.compareAtPrice && p.isFeatured && <span className="ept-badge">HOT</span>}
                      <div className="ept-actions">
                        <button className="ept-action-btn" title="Quick view" aria-label="Quick view" onClick={() => storeCtx?.onQuickView?.(String(p.id))}>👁</button>
                        <button className="ept-action-btn" title="Wishlist" aria-label="Wishlist" onClick={() => storeCtx?.toggleWishlist?.(String(p.id))} style={storeCtx?.isWishlisted?.(String(p.id)) ? { color: "red" } : undefined}>{storeCtx?.isWishlisted?.(String(p.id)) ? "♥" : "♡"}</button>
                        <button className="ept-action-btn" title="Compare" aria-label="Compare" onClick={() => { toggleCompareItem({ id: String(p.id), name: p.name, slug: p.slug, price: p.price, image: p.images?.[0]?.url }, storeCtx?.storeSlug); setCompareState(prev => !prev); }}>⇌</button>
                      </div>
                    </div>
                    <div className="ept-info">
                      {p.category && <div className="ept-cat">{p.category.name}</div>}
                      <h3 className="ept-name"><Link href={productLink}>{p.name}</Link></h3>
                      <div className="ept-price">
                        {p.compareAtPrice && <span className="ept-price-old">{sym}{p.compareAtPrice.toLocaleString()}</span>}
                        <span>{sym}{p.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <button className="ept-add-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="ept-pagination">
                <button className="ept-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className="ept-page-btn" style={i === page ? { background: TOKENS.primaryColor, color: "#fff", borderColor: TOKENS.primaryColor } : {}} onClick={() => setPage(i)}>
                    {i + 1}
                  </button>
                ))}
                <button className="ept-page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. ELECTRONICS BANNER GRID
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsBannerGridItem {
  image: string;
  subtitle: string;
  title: string;
  buttonText?: string;
  buttonLink?: string;
  colorScheme?: "dark" | "light";
}

export interface ElectronicsBannerGridProps {
  banners: ElectronicsBannerGridItem[];
}

export function ElectronicsBannerGrid({ banners }: ElectronicsBannerGridProps) {
  const fixLink = useFixLink();
  // Expected: 4 banners in asymmetric grid: leftTall(4/12), middleTop(5/12), middleBottom(5/12), rightTall(3/12)
  const scopedCss = `
    .ebg-section { padding: 30px 0; }
    .ebg-grid {
      display: grid;
      grid-template-columns: 4fr 5fr 3fr;
      grid-template-rows: 1fr 1fr;
      gap: 15px;
      min-height: 420px;
    }
    .ebg-item { position: relative; overflow: hidden; border-radius: ${TOKENS.borderRadius}; cursor: pointer; }
    .ebg-item-0 { grid-row: 1 / 3; } /* left tall */
    .ebg-item-1 { } /* middle top */
    .ebg-item-2 { } /* middle bottom */
    .ebg-item-3 { grid-row: 1 / 3; } /* right tall */
    .ebg-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s; }
    .ebg-item:hover .ebg-img { transform: scale(1.05); }
    .ebg-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-start; padding: 25px; z-index: 2; }
    .ebg-overlay-dark { }
    .ebg-overlay-light { }
    .ebg-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 5px; font-family: ${TOKENS.bodyFont}; }
    .ebg-sub-dark { color: rgba(255,255,255,0.7); }
    .ebg-sub-light { color: ${TOKENS.textColor}; }
    .ebg-title-text { font-family: ${TOKENS.titleFont}; font-weight: ${TOKENS.titleFontWeight}; font-size: 20px; margin: 0 0 12px; line-height: 1.2; }
    .ebg-item-0 .ebg-title-text, .ebg-item-3 .ebg-title-text { font-size: 26px; }
    .ebg-title-dark { color: #fff; }
    .ebg-title-light { color: ${TOKENS.titleColor}; }
    .ebg-btn {
      display: inline-block; padding: 8px 20px; font-size: 12px; font-weight: 700; text-transform: uppercase;
      color: ${TOKENS.titleColor}; background: #fff; text-decoration: none; font-family: ${TOKENS.bodyFont};
      border-radius: 35px; letter-spacing: 0.5px; transition: all 0.3s;
    }
    .ebg-btn:hover { background: #f0f0f0; }
    .ebg-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) {
      .ebg-grid { grid-template-columns: 1fr 1fr; grid-template-rows: auto; min-height: auto; }
      .ebg-item-0, .ebg-item-3 { grid-row: auto; }
      .ebg-item { min-height: 200px; }
    }
    @media (max-width: 767px) {
      .ebg-grid { grid-template-columns: 1fr; }
    }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="ebg-grid" css={scopedCss} />
      <div className="ebg-section">
        <div className="ebg-grid">
          {banners.slice(0, 4).map((b, i) => {
            const scheme = b.colorScheme || "dark";
            return (
              <div key={i} className={`ebg-item ebg-item-${i}`}>
                <img src={b.image} alt={b.title} className="ebg-img" loading="lazy"  onError={(e) => onImgError(e, b.title)} />
                <div className={`ebg-overlay ebg-overlay-${scheme}`}>
                  <div className={`ebg-sub ebg-sub-${scheme}`}>{b.subtitle}</div>
                  <h4 className={`ebg-title-text ebg-title-${scheme}`}>{b.title}</h4>
                  {b.buttonText && <span className="ebg-btn">{b.buttonText}</span>}
                </div>
                <Link href={fixLink(b.buttonLink || "#")} className="ebg-link" aria-label={b.title} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. ELECTRONICS HOT DEALS
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsHotDealsProps {
  sectionTitle?: string;
  buttonText?: string;
  buttonLink?: string;
  dealEndDate?: string;
  maxProducts?: number;
  columns?: number;
  filter?: string;
  backgroundImage?: string;
}

export function ElectronicsHotDeals({
  sectionTitle = "TODAY HOT DEALS",
  buttonText = "View All Deals",
  buttonLink = "/shop",
  dealEndDate,
  maxProducts = 6,
  columns = 3,
  filter = "sale",
  backgroundImage,
}: ElectronicsHotDealsProps) {
  const storeCtx = useContext(ElectronicsStoreContext);
  const sym = useCurrencySymbol();
  const fixLink = useFixLink();

  const products = (() => {
    if (!storeCtx?.products?.length) return [];
    let prods = storeCtx.products;
    if (filter === "sale") {
      const sale = prods.filter(p => p.compareAtPrice);
      if (sale.length > 0) prods = sale;
    } else if (filter === "featured") {
      const feat = prods.filter(p => p.isFeatured);
      if (feat.length > 0) prods = feat;
    }
    return prods.slice(0, maxProducts);
  })();

  // Countdown timer
  const endDate = dealEndDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, min: 0, sec: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        min: Math.floor((diff % 3600000) / 60000),
        sec: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const scopedCss = `
    .ehd-section { padding: 60px 0 60px; }
    .ehd-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .ehd-card { border: 1px solid #eee; border-radius: ${TOKENS.borderRadius}; overflow: hidden; transition: box-shadow 0.3s; position: relative; }
    .ehd-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .ehd-thumb { position: relative; overflow: hidden; background: #f9f9f9; aspect-ratio: 1; }
    .ehd-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .ehd-card:hover .ehd-thumb img { transform: scale(1.05); }
    .ehd-badge { position: absolute; top: 8px; left: 8px; background: #e74c3c; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: ${TOKENS.borderRadius}; z-index: 2; }
    .ehd-timer {
      position: absolute; bottom: 10px; left: 10px; right: 10px;
      display: flex; gap: 4px; z-index: 2;
    }
    .ehd-timer-unit {
      flex: 1; text-align: center; background: rgba(0,0,0,0.75); color: #fff;
      border-radius: 3px; padding: 6px 2px;
    }
    .ehd-timer-val { font-size: 16px; font-weight: 700; display: block; line-height: 1; font-family: ${TOKENS.titleFont}; }
    .ehd-timer-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; display: block; margin-top: 2px; }
    .ehd-info { padding: 12px 15px; }
    .ehd-name { font-family: ${TOKENS.titleFont}; font-weight: ${TOKENS.entityTitleFontWeight}; font-size: 14px; color: ${TOKENS.entityTitleColor}; margin: 0 0 6px; line-height: 1.3; }
    .ehd-name a { color: inherit; text-decoration: none; }
    .ehd-name a:hover { color: ${TOKENS.primaryColor}; }
    .ehd-price { font-weight: 600; font-size: 14px; color: ${TOKENS.primaryColor}; }
    .ehd-price-old { text-decoration: line-through; color: #999; font-weight: 400; margin-right: 8px; font-size: 13px; }
    .ehd-footer { text-align: center; margin-top: 30px; }
    .ehd-view-btn {
      display: inline-block; padding: 15px 40px; background: ${TOKENS.primaryColor}; color: #fff;
      border: none; font-size: 13px; font-weight: 700; text-transform: uppercase;
      text-decoration: none; border-radius: 35px; transition: all 0.3s;
      font-family: ${TOKENS.bodyFont}; letter-spacing: 0.5px;
    }
    .ehd-view-btn:hover { filter: brightness(0.9); }
    .ehd-empty { text-align: center; padding: 40px; color: ${TOKENS.textColor}; font-family: ${TOKENS.bodyFont}; }
    @media (max-width: 1024px) { .ehd-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .ehd-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  `;

  const wrapperStyle: React.CSSProperties = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }
    : {};

  return (
    <div style={wrapperStyle}>
      <div style={containerStyle}>
      <ScopedStyles id="ehd-deals" css={scopedCss} />
      <div className="ehd-section">
        <ElectronicsSectionTitle title={sectionTitle} />
        {products.length === 0 ? (
          <div className="ehd-empty"><p>No products yet. Add products from your dashboard.</p></div>
        ) : (
          <>
            <div className="ehd-grid">
              {products.map((p) => {
                const productLink = storeCtx ? `/store/${storeCtx.storeSlug}/product/${p.slug}` : "#";
                const discount = p.compareAtPrice ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0;
                return (
                  <div key={p.id} className="ehd-card">
                    <div className="ehd-thumb">
                      <Link href={productLink}>
                        <img src={safeSrc(p.images[0]?.url, p.name)} alt={p.name} loading="lazy" onError={(e) => onImgError(e, p.name)} />
                      </Link>
                      {discount > 0 && <span className="ehd-badge">-{discount}%</span>}
                      <div className="ehd-timer">
                        <div className="ehd-timer-unit"><span className="ehd-timer-val">{String(timeLeft.days).padStart(2, "0")}</span><span className="ehd-timer-label">Days</span></div>
                        <div className="ehd-timer-unit"><span className="ehd-timer-val">{String(timeLeft.hours).padStart(2, "0")}</span><span className="ehd-timer-label">Hrs</span></div>
                        <div className="ehd-timer-unit"><span className="ehd-timer-val">{String(timeLeft.min).padStart(2, "0")}</span><span className="ehd-timer-label">Min</span></div>
                        <div className="ehd-timer-unit"><span className="ehd-timer-val">{String(timeLeft.sec).padStart(2, "0")}</span><span className="ehd-timer-label">Sec</span></div>
                      </div>
                    </div>
                    <div className="ehd-info">
                      <h3 className="ehd-name"><Link href={productLink}>{p.name}</Link></h3>
                      <div className="ehd-price">
                        {p.compareAtPrice && <span className="ehd-price-old">{sym}{p.compareAtPrice.toLocaleString()}</span>}
                        <span>{sym}{p.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="ehd-footer">
              <Link href={fixLink(buttonLink)} className="ehd-view-btn">{buttonText}</Link>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. ELECTRONICS SIDE BANNER + FEATURED PRODUCTS
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsSideBannerProps {
  bannerImage: string;
  bannerSubtitle: string;
  bannerTitle: string;
  bannerButtonText: string;
  bannerButtonLink: string;
  featuredTitle?: string;
  maxFeaturedProducts?: number;
  rightSectionTitle?: string;
  rightTabs?: Array<{ label: string; filter: string }>;
  rightMaxProducts?: number;
}

export function ElectronicsSideBanner({
  bannerImage,
  bannerSubtitle,
  bannerTitle,
  bannerButtonText,
  bannerButtonLink,
  featuredTitle = "FEATURED PRODUCTS",
  maxFeaturedProducts = 4,
  rightSectionTitle = "ELECTRONICS",
  rightTabs,
  rightMaxProducts = 8,
}: ElectronicsSideBannerProps) {
  const storeCtx = useContext(ElectronicsStoreContext);
  const sym = useCurrencySymbol();
  const fixLink = useFixLink();

  const featuredProducts = (() => {
    if (!storeCtx?.products?.length) return [];
    const feat = storeCtx.products.filter(p => p.isFeatured);
    return (feat.length > 0 ? feat : storeCtx.products).slice(0, maxFeaturedProducts);
  })();

  const scopedCss = `
    .esb-section { padding: 40px 0; }
    .esb-layout { display: grid; grid-template-columns: 280px 1fr; gap: 30px; }
    .esb-sidebar { }
    .esb-banner { position: relative; overflow: hidden; border-radius: ${TOKENS.borderRadius}; margin-bottom: 30px; min-height: 320px; display: flex; align-items: flex-end; }
    .esb-banner-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; }
    .esb-banner:hover .esb-banner-img { transform: scale(1.05); }
    .esb-banner-content { position: relative; z-index: 2; padding: 25px; background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%); width: 100%; }
    .esb-banner-sub { font-size: 11px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
    .esb-banner-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 20px; color: #fff; margin: 0 0 12px; line-height: 1.2; }
    .esb-banner-btn {
      display: inline-block; padding: 8px 20px; background: #fff; color: ${TOKENS.titleColor};
      font-size: 11px; font-weight: 700; text-transform: uppercase; text-decoration: none;
      border-radius: 35px; transition: background 0.3s;
    }
    .esb-banner-btn:hover { filter: brightness(0.9); }
    .esb-feat-title {
      font-family: ${TOKENS.titleFont}; font-weight: ${TOKENS.titleFontWeight}; font-size: 16px;
      text-transform: uppercase; color: #fff; margin: 0 0 15px;
      padding: 20px; background: ${TOKENS.primaryColor};
    }
    .esb-feat-list { display: flex; flex-direction: column; gap: 12px; border: 3px solid rgba(119,119,119,0.17); padding: 20px; }
    .esb-feat-item { display: flex; gap: 12px; align-items: center; }
    .esb-feat-img { width: 70px; height: 70px; border-radius: ${TOKENS.borderRadius}; object-fit: cover; border: 1px solid #eee; flex-shrink: 0; }
    .esb-feat-info { flex: 1; }
    .esb-feat-name { font-family: ${TOKENS.titleFont}; font-size: 13px; font-weight: ${TOKENS.entityTitleFontWeight}; color: ${TOKENS.entityTitleColor}; margin: 0 0 4px; line-height: 1.3; }
    .esb-feat-name a { color: inherit; text-decoration: none; }
    .esb-feat-name a:hover { color: ${TOKENS.primaryColor}; }
    .esb-feat-price { font-size: 13px; font-weight: 600; color: ${TOKENS.primaryColor}; }
    .esb-feat-price-old { text-decoration: line-through; color: #999; font-weight: 400; margin-right: 6px; font-size: 12px; }
    @media (max-width: 1024px) { .esb-layout { grid-template-columns: 1fr; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="esb-side" css={scopedCss} />
      <div className="esb-section">
        <div className="esb-layout">
          <div className="esb-sidebar">
            <div className="esb-banner">
              <img src={bannerImage} alt={bannerTitle} className="esb-banner-img" loading="lazy"  onError={(e) => onImgError(e, bannerTitle)} />
              <div className="esb-banner-content">
                <div className="esb-banner-sub">{bannerSubtitle}</div>
                <h4 className="esb-banner-title">{bannerTitle}</h4>
                <Link href={fixLink(bannerButtonLink)} className="esb-banner-btn">{bannerButtonText}</Link>
              </div>
            </div>
            <h4 className="esb-feat-title">{featuredTitle}</h4>
            <div className="esb-feat-list">
              {featuredProducts.map((p) => {
                const productLink = storeCtx ? `/store/${storeCtx.storeSlug}/product/${p.slug}` : "#";
                return (
                  <div key={p.id} className="esb-feat-item">
                    <img src={safeSrc(p.images[0]?.url, p.name)} alt={p.name} className="esb-feat-img" loading="lazy" onError={(e) => onImgError(e, p.name)} />
                    <div className="esb-feat-info">
                      <h5 className="esb-feat-name"><Link href={productLink}>{p.name}</Link></h5>
                      <div className="esb-feat-price">
                        {p.compareAtPrice && <span className="esb-feat-price-old">{sym}{p.compareAtPrice.toLocaleString()}</span>}
                        {sym}{p.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="esb-main">
            <ElectronicsProductTabs
              sectionTitle={rightSectionTitle}
              tabs={rightTabs || [{ label: "New", filter: "new" }, { label: "Featured", filter: "featured" }, { label: "Top Sellers", filter: "top-sellers" }]}
              columns={3}
              maxProducts={rightMaxProducts || 6}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. ELECTRONICS GAMING CTA
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsGamingCTAProps {
  backgroundImage: string;
  subtitle: string;
  title: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  productImage?: string;
}

export function ElectronicsGamingCTA({
  backgroundImage,
  subtitle,
  title,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  productImage,
}: ElectronicsGamingCTAProps) {
  const fixLink = useFixLink();
  const scopedCss = `
    .egc-section {
      position: relative; min-height: 350px; display: flex; align-items: center;
      overflow: hidden; margin: 40px 0;
    }
    .egc-bg {
      position: absolute; inset: 0; background-size: cover; background-position: center;
      z-index: 0;
    }
    .egc-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.55); z-index: 1; }
    .egc-content { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .egc-text { max-width: 50%; }
    .egc-subtitle {
      font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: ${TOKENS.primaryColor};
      font-weight: 600; margin-bottom: 10px; font-family: ${TOKENS.bodyFont};
    }
    .egc-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 32px; color: #fff;
      line-height: 1.2; margin: 0 0 25px;
    }
    .egc-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
    .egc-btn-primary {
      padding: 12px 30px; background: ${TOKENS.primaryColor}; color: #fff;
      font-size: 13px; font-weight: 700; text-transform: uppercase; text-decoration: none;
      border-radius: 35px; transition: background 0.3s; font-family: ${TOKENS.bodyFont};
    }
    .egc-btn-primary:hover { filter: brightness(0.9); }
    .egc-btn-secondary {
      padding: 12px 30px; background: transparent; color: #fff;
      font-size: 13px; font-weight: 700; text-transform: uppercase; text-decoration: none;
      border-radius: 35px; border: none;
      transition: all 0.3s; font-family: ${TOKENS.bodyFont};
    }
    .egc-btn-secondary:hover { border-color: #fff; background: rgba(255,255,255,0.1); }
    .egc-product-img { max-width: 40%; max-height: 280px; object-fit: contain; filter: drop-shadow(0 10px 30px rgba(0,0,0,0.3)); }
    @media (max-width: 1024px) {
      .egc-title { font-size: 26px; }
      .egc-text { max-width: 60%; }
      .egc-product-img { max-width: 35%; }
    }
    @media (max-width: 767px) {
      .egc-content { flex-direction: column; text-align: center; }
      .egc-text { max-width: 100%; }
      .egc-product-img { max-width: 60%; margin-top: 20px; }
      .egc-buttons { justify-content: center; }
    }
  `;

  return (
    <div className="egc-section">
      <ScopedStyles id="egc-cta" css={scopedCss} />
      <div className="egc-bg" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="egc-overlay" />
      <div className="egc-content" style={containerStyle}>
        <div className="egc-text">
          <div className="egc-subtitle">{subtitle}</div>
          <h3 className="egc-title">{title}</h3>
          <div className="egc-buttons">
            <Link href={fixLink(primaryButtonLink)} className="egc-btn-primary">{primaryButtonText}</Link>
            {secondaryButtonText && (
              <Link href={fixLink(secondaryButtonLink || "#")} className="egc-btn-secondary">{secondaryButtonText}</Link>
            )}
          </div>
        </div>
        {productImage && <img src={productImage} alt={title} className="egc-product-img"  onError={(e) => onImgError(e, title)} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. ELECTRONICS BLOG POSTS
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsBlogPost {
  image: string;
  title: string;
  excerpt: string;
  date: { day: string; month: string; year: string };
  category: string;
  author: string;
  link: string;
}

export interface ElectronicsBlogPostsProps {
  sectionTitle?: string;
  posts?: ElectronicsBlogPost[];
  columns?: number;
}

export function ElectronicsBlogPosts({ sectionTitle = "INNOVATIVE GADGETS", posts: propPosts, columns = 3 }: ElectronicsBlogPostsProps) {
  const storeCtx = useContext(ElectronicsStoreContext);
  const [scroll, setScroll] = useState(0);

  const posts: ElectronicsBlogPost[] = (() => {
    if (!storeCtx?.blogs?.length) return propPosts || [];
    return storeCtx.blogs.slice(0, columns * 2).map((b) => {
      const pubDate = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
      return {
        image: b.coverImage || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
        title: b.title,
        excerpt: b.excerpt || "",
        date: {
          day: pubDate.getDate().toString().padStart(2, "0"),
          month: pubDate.toLocaleString("en-US", { month: "short" }),
          year: pubDate.getFullYear().toString(),
        },
        category: b.category || "Tech",
        author: b.author || "Store Team",
        link: `/store/${storeCtx.storeSlug}/blog/${b.slug}`,
      };
    });
  })();

  const scopedCss = `
    .ebp-section { padding: 40px 0 50px; }
    .ebp-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 25px; }
    .ebp-card { border-radius: ${TOKENS.borderRadius}; overflow: hidden; border: 1px solid #eee; transition: box-shadow 0.3s; }
    .ebp-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .ebp-img-wrap { position: relative; overflow: hidden; aspect-ratio: 16/10; }
    .ebp-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .ebp-card:hover .ebp-img { transform: scale(1.05); }
    .ebp-date-badge {
      position: absolute; top: 15px; left: 15px; background: ${TOKENS.primaryColor};
      color: #fff; text-align: center; padding: 8px 10px; border-radius: ${TOKENS.borderRadius}; z-index: 2;
    }
    .ebp-date-day { display: block; font-size: 18px; font-weight: 700; line-height: 1; font-family: ${TOKENS.titleFont}; }
    .ebp-date-month { display: block; font-size: 10px; text-transform: uppercase; font-family: ${TOKENS.bodyFont}; }
    .ebp-content { padding: 20px; }
    .ebp-cat {
      display: inline-block; font-size: 11px; color: ${TOKENS.primaryColor}; font-weight: 600;
      text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;
      font-family: ${TOKENS.bodyFont};
    }
    .ebp-title {
      font-family: ${TOKENS.titleFont}; font-weight: ${TOKENS.entityTitleFontWeight}; font-size: 16px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 10px; line-height: 1.4;
    }
    .ebp-title a { color: inherit; text-decoration: none; }
    .ebp-title a:hover { color: ${TOKENS.primaryColor}; }
    .ebp-meta { font-size: 12px; color: #999; font-family: ${TOKENS.bodyFont}; }
    .ebp-nav { display: flex; justify-content: center; gap: 10px; margin-top: 25px; }
    .ebp-nav-btn {
      width: 36px; height: 36px; border: 1px solid #ddd; background: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center; border-radius: ${TOKENS.borderRadius};
      font-size: 14px; transition: all 0.3s;
    }
    .ebp-nav-btn:hover { border-color: ${TOKENS.primaryColor}; color: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) { .ebp-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .ebp-grid { grid-template-columns: 1fr; } }
  `;

  const displayPosts = posts.slice(scroll, scroll + columns);

  return (
    <div style={containerStyle}>
      <ScopedStyles id="ebp-blog" css={scopedCss} />
      <div className="ebp-section">
        <ElectronicsSectionTitle title={sectionTitle} />
        <div className="ebp-grid">
          {displayPosts.map((p, i) => (
            <article key={i} className="ebp-card">
              <div className="ebp-img-wrap">
                <img src={p.image} alt={p.title} className="ebp-img" loading="lazy"  onError={(e) => onImgError(e, p.title)} />
                <div className="ebp-date-badge">
                  <span className="ebp-date-day">{p.date.day}</span>
                  <span className="ebp-date-month">{p.date.month}</span>
                </div>
                <Link href={resolveStoreLink(p.link, storeCtx?.storeSlug)} style={{ position: "absolute", inset: 0, zIndex: 3 }} aria-label={p.title} />
              </div>
              <div className="ebp-content">
                <span className="ebp-cat">{p.category}</span>
                <h3 className="ebp-title"><Link href={p.link}>{p.title}</Link></h3>
                <div className="ebp-meta">By {p.author}</div>
              </div>
            </article>
          ))}
        </div>
        {posts.length > columns && (
          <div className="ebp-nav">
            <button className="ebp-nav-btn" onClick={() => setScroll(Math.max(0, scroll - columns))} disabled={scroll === 0}>‹</button>
            <button className="ebp-nav-btn" onClick={() => setScroll(Math.min(posts.length - columns, scroll + columns))} disabled={scroll >= posts.length - columns}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. ELECTRONICS PARTNERS
   ═══════════════════════════════════════════════════════════════ */

export interface ElectronicsPartnerLogo {
  name: string;
  logoUrl: string;
  linkUrl?: string;
}

export interface ElectronicsPartnersProps {
  sectionTitle?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  logos: ElectronicsPartnerLogo[];
}

export function ElectronicsPartners({
  sectionTitle = "OUR PARTNERS",
  videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  videoThumbnail,
  logos,
}: ElectronicsPartnersProps) {
  const [playing, setPlaying] = useState(false);

  const embedUrl = (() => {
    if (!videoUrl) return "";
    const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    return videoUrl;
  })();

  const thumbnail = videoThumbnail || (() => {
    const ytMatch = videoUrl?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    return "";
  })();

  const scopedCss = `
    .epr-section { padding: 40px 0 50px; }
    .epr-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; }
    .epr-video { position: relative; border-radius: ${TOKENS.borderRadius}; overflow: hidden; aspect-ratio: 16/9; background: #000; }
    .epr-video-thumb { width: 100%; height: 100%; object-fit: cover; }
    .epr-play-btn {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 60px; height: 60px; border-radius: 50%; background: ${TOKENS.primaryColor};
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 22px; transition: all 0.3s; z-index: 2;
      box-shadow: 0 4px 20px rgba(0,123,196,0.4);
    }
    .epr-play-btn:hover { transform: translate(-50%, -50%) scale(1.1); filter: brightness(0.9); }
    .epr-video iframe { width: 100%; height: 100%; border: 0; }
    .epr-logos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
    .epr-logo {
      border: 1px solid #eee; display: flex; align-items: center; justify-content: center;
      padding: 20px; aspect-ratio: 2/1; transition: all 0.3s;
    }
    .epr-logo:hover { background: #f9f9f9; }
    .epr-logo img { max-width: 80%; max-height: 40px; object-fit: contain; opacity: 0.6; transition: opacity 0.3s; filter: grayscale(100%); }
    .epr-logo:hover img { opacity: 1; filter: grayscale(0%); }
    .epr-logo a { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
    @media (max-width: 1024px) { .epr-layout { grid-template-columns: 1fr; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="epr-partners" css={scopedCss} />
      <div className="epr-section">
        <ElectronicsSectionTitle title={sectionTitle} />
        <div className="epr-layout">
          <div className="epr-video">
            {playing ? (
              <iframe src={embedUrl} allowFullScreen allow="autoplay" title="Partner video" />
            ) : (
              <>
                {thumbnail && <img src={thumbnail} alt="Video thumbnail" className="epr-video-thumb"  onError={(e) => onImgError(e, "fallback")} />}
                <button className="epr-play-btn" onClick={() => setPlaying(true)} aria-label="Play video">▶</button>
              </>
            )}
          </div>
          <div className="epr-logos">
            {logos.map((logo, i) => (
              <div key={i} className="epr-logo">
                {logo.linkUrl ? (
                  <a href={logo.linkUrl} target="_blank" rel="noopener noreferrer" aria-label={logo.name}>
                    <img src={logo.logoUrl} alt={logo.name}  onError={(e) => onImgError(e, logo.name)} />
                  </a>
                ) : (
                  <img src={logo.logoUrl} alt={logo.name}  onError={(e) => onImgError(e, logo.name)} />
                )}
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

export function ElectronicsFooter(props: React.ComponentProps<typeof FashionFooter>) {
  const storeCtx = useContext(ElectronicsStoreContext);
  return <FashionFooter {...props} storeSlug={storeCtx?.storeSlug} />;
}
