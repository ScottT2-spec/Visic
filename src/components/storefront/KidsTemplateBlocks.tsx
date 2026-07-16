"use client";
import { FashionFooter } from "./FashionTemplateBlocks";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { toggleCompare as toggleCompareItem } from "@/lib/compare-utils";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";

/* ═══════════════════════════════════════════════════════════════
   KIDS TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Kids template sections.
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
  borderRadius: "10px",
  titleFont: "'Quicksand', Arial, Helvetica, sans-serif",
  bodyFont: "'Quicksand', Arial, Helvetica, sans-serif",
};

const IMG_BASE = "https://woodmart.xtemos.com/kids/wp-content/uploads/sites/13/2023/05";

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function KidsFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
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
  return <style data-kids-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
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

export interface KidsProduct {
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
  colors?: Array<{ name: string; hex: string }>;
}

export interface KidsStoreContextData {
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
export const KidsStoreContext = createContext<KidsStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. KIDS ANNOUNCEMENT BAR
   ═══════════════════════════════════════════════════════════════ */

export interface KidsAnnouncementBarProps {
  text?: string;
  link?: string;
  backgroundColor?: string;
}

export function KidsAnnouncementBar({ text = "Sign up for our newsletter to get 10% off for the week!", link, backgroundColor = TOKENS.primaryColor }: KidsAnnouncementBarProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const scopedCss = `
    .kab-bar {
      padding: 10px 40px; text-align: center; position: relative;
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: #fff;
    }
    .kab-bar a { color: #fff; text-decoration: underline; }
    .kab-close {
      position: absolute; right: 15px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: #fff; cursor: pointer; font-size: 18px;
      opacity: 0.7; transition: opacity 0.2s;
    }
    .kab-close:hover { opacity: 1; }
  `;

  return (
    <div className="kab-bar" style={{ background: backgroundColor }}>
      <ScopedStyles id="announcement" css={scopedCss} />
      {link ? <Link href={resolveStoreLink(link, null)}>{text}</Link> : <span>{text}</span>}
      <button className="kab-close" onClick={() => setVisible(false)} aria-label="Close">✕</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. KIDS HERO SLIDER
   Parallax-style slides with large playful headlines, description,
   "Shop now" button. Pastel/warm backgrounds with kid imagery.
   ═══════════════════════════════════════════════════════════════ */

export interface KidsHeroSlide {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  colorScheme?: "dark" | "light";
}

export interface KidsHeroSliderProps {
  slides: KidsHeroSlide[];
  autoplaySpeed?: number;
  minHeight?: string;
}

export function KidsHeroSlider({ slides, autoplaySpeed = 5000, minHeight = "560px" }: KidsHeroSliderProps) {
  const storeCtx = useContext(KidsStoreContext);
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
    .kh-slider { position: relative; width: 100%; overflow: hidden; }
    .kh-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .kh-slide.kh-active { opacity: 1; position: relative; }
    .kh-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; }
    .kh-slide-content { position: relative; z-index: 2; width: 100%; }
    .kh-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 64px;
      line-height: 74px; margin: 0 0 20px; max-width: 685px;
    }
    .kh-title-light { color: #fff; }
    .kh-title-dark { color: ${TOKENS.titleColor}; }
    .kh-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 1.6;
      max-width: 490px; margin: 0 0 25px;
    }
    .kh-desc-light { color: rgba(255,255,255,0.6); }
    .kh-desc-dark { color: ${TOKENS.textColor}; }
    .kh-btn {
      display: inline-block; padding: 12px 28px;
      background: ${TOKENS.primaryColor}; color: #fff;
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 14px;
      text-decoration: none; border: none; cursor: pointer;
      border-radius: 5px; transition: background-color 0.3s;
    }
    .kh-btn:hover { filter: brightness(0.9); }
    .kh-dots {
      position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 8px; z-index: 5;
    }
    .kh-dot {
      width: 12px; height: 12px; border-radius: 50%; border: none; cursor: pointer;
      background: rgba(255,255,255,0.4); transition: background 0.3s; padding: 0;
    }
    .kh-dot.kh-dot-active { background: ${TOKENS.primaryColor}; }
    .kh-anim-in { animation: khSlideUp 0.6s ease forwards; opacity: 0; }
    @keyframes khSlideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .kh-arrows {
      position: absolute; top: 50%; z-index: 5; display: flex;
      justify-content: space-between; width: 100%; padding: 0 20px;
      transform: translateY(-50%); pointer-events: none;
    }
    .kh-arrow {
      pointer-events: auto; width: 45px; height: 45px; border-radius: 50%;
      border: none; background: rgba(255,255,255,0.8); color: var(--color-text);
      font-size: 18px; cursor: pointer; display: flex; align-items: center;
      justify-content: center; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .kh-arrow:hover { background: #fff; }
    @media (max-width: 1024px) {
      .kh-slider { min-height: 450px !important; }
      .kh-title { font-size: 38px; line-height: 48px; max-width: 450px; }
    }
    @media (max-width: 767px) {
      .kh-slider { min-height: 380px !important; }
      .kh-title { font-size: 28px; line-height: 38px; }
      .kh-desc { font-size: 14px; }
    }
  `;

  return (
    <div className="kh-slider" style={{ minHeight }}>
      <ScopedStyles id="hero-slider" css={scopedCss} />
      {slides.map((slide, i) => {
        const scheme = slide.colorScheme || "light";
        return (
          <div key={i} className={`kh-slide ${i === current ? "kh-active" : ""}`}>
            <div className="kh-slide-bg" style={{ backgroundImage: `url(${slide.backgroundImage})` }} />
            <div className="kh-slide-content">
              <div style={containerStyle}>
                <div style={{ padding: "60px 0", maxWidth: "60%" }}>
                  {i === current && (
                    <>
                      <h2 className={`kh-title kh-title-${scheme} kh-anim-in`} style={{ animationDelay: "0.2s" }}>{slide.title}</h2>
                      <p className={`kh-desc kh-desc-${scheme} kh-anim-in`} style={{ animationDelay: "0.4s" }}>{slide.description}</p>
                      <div className="kh-anim-in" style={{ animationDelay: "0.5s" }}>
                        <Link href={fixLink(slide.buttonLink)} className="kh-btn">{slide.buttonText}</Link>
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
          <div className="kh-arrows">
            <button className="kh-arrow" onClick={() => goTo((current - 1 + slides.length) % slides.length)} aria-label="Previous">←</button>
            <button className="kh-arrow" onClick={() => goTo((current + 1) % slides.length)} aria-label="Next">→</button>
          </div>
          <div className="kh-dots">
            {slides.map((_, i) => (
              <button key={i} className={`kh-dot ${i === current ? "kh-dot-active" : ""}`} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. KIDS SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface KidsSectionTitleProps {
  subtitle?: string;
  title: string;
  align?: "left" | "center";
  marginBottom?: string;
  size?: "default" | "large";
}

export function KidsSectionTitle({ subtitle, title, align = "center", marginBottom = "30px", size = "default" }: KidsSectionTitleProps) {
  const fontSize = size === "large" ? "42px" : "28px";

  const scopedCss = `
    .kst-wrap { margin-bottom: ${marginBottom}; }
    .kst-subtitle {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.primaryColor};
      font-weight: 500; margin-bottom: 5px;
    }
    .kst-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: ${fontSize};
      color: ${TOKENS.titleColor}; margin: 0; line-height: 1.3;
    }
    @media (max-width: 767px) {
      .kst-title { font-size: ${size === "large" ? "28px" : "22px"}; }
    }
  `;

  return (
    <div className="kst-wrap" style={{ textAlign: align }}>
      <ScopedStyles id="section-title" css={scopedCss} />
      {subtitle && <div className="kst-subtitle">{subtitle}</div>}
      <h2 className="kst-title">{title}</h2>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. KIDS CATEGORY CARDS
   Circular zoom-out design with category image, name + count.
   6 categories: Growsuits, Jumpers, Toys, Accessories, Dresses, Leggings
   ═══════════════════════════════════════════════════════════════ */

export interface KidsCategoryCard {
  name: string;
  image: string;
  productCount?: number;
  link: string;
}

export interface KidsCategoryCardsProps {
  categories: KidsCategoryCard[];
  sectionTitle?: { subtitle?: string; title: string };
  marginBottom?: string;
}

export function KidsCategoryCards({ categories, sectionTitle, marginBottom = "60px" }: KidsCategoryCardsProps) {
  const storeCtx = useContext(KidsStoreContext);
  const fixLink = (link: string, name: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `/store/${storeCtx.storeSlug}/shop?category=${slug}`;
    }
    return resolveStoreLink(link, storeCtx?.storeSlug);
  };

  const scopedCss = `
    .kcc-section { margin-bottom: ${marginBottom}; }
    .kcc-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; }
    .kcc-card { text-align: center; cursor: pointer; }
    .kcc-img-wrap {
      position: relative; overflow: hidden; border-radius: 50%;
      aspect-ratio: 1; margin-bottom: 15px;
    }
    .kcc-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.6s ease;
    }
    .kcc-card:hover .kcc-img { transform: scale(0.92); }
    .kcc-name {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 16px;
      color: ${TOKENS.titleColor}; margin: 0 0 3px;
    }
    .kcc-name a { color: inherit; text-decoration: none; }
    .kcc-name a:hover { color: ${TOKENS.primaryColor}; }
    .kcc-count {
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
    }
    .kcc-link { position: absolute; inset: 0; z-index: 2; border-radius: 50%; }
    @media (max-width: 1024px) { .kcc-grid { grid-template-columns: repeat(3, 1fr); gap: 15px; } }
    @media (max-width: 767px) { .kcc-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  `;

  return (
    <div className="kcc-section" style={containerStyle}>
      <ScopedStyles id="category-cards" css={scopedCss} />
      {sectionTitle && <KidsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} />}
      <div className="kcc-grid">
        {categories.map((c, i) => (
          <div key={i} className="kcc-card">
            <div className="kcc-img-wrap">
              <img src={c.image} alt={c.name} className="kcc-img" loading="lazy"  onError={(e) => onImgError(e, c.name)} />
              <Link href={fixLink(c.link, c.name)} className="kcc-link" aria-label={c.name} />
            </div>
            <h3 className="kcc-name"><Link href={fixLink(c.link, c.name)}>{c.name}</Link></h3>
            {c.productCount !== undefined && <span className="kcc-count">{c.productCount} products</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. KIDS PRODUCT GRID
   Rounded product cards with color swatches, hover image swap,
   star ratings, labels (Sale, Hot, New).
   ═══════════════════════════════════════════════════════════════ */

export interface KidsProductGridProps {
  products?: KidsProduct[];
  columns?: number;
  showCategory?: boolean;
  showHoverImage?: boolean;
  sectionTitle?: { subtitle?: string; title: string };
  marginBottom?: string;
  maxProducts?: number;
  filter?: "featured" | "bestseller" | "new-arrival" | "sale" | "all";
  filterTag?: string;
}

export function KidsProductGrid({ products: propProducts, columns = 4, showCategory = true, showHoverImage = true, sectionTitle, marginBottom = "60px", maxProducts = 8, filter, filterTag }: KidsProductGridProps) {
  const storeCtx = useContext(KidsStoreContext);
  const [, setCompareState] = useState(false);

  const products: KidsProduct[] = (() => {
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
      badge: p.compareAtPrice ? "Sale" : p.isFeatured ? "Hot" : undefined,
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
    .kpg-section { margin-bottom: ${marginBottom}; }
    .kpg-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .kpg-card { position: relative; }
    .kpg-thumb { position: relative; overflow: hidden; margin-bottom: 12px; border-radius: ${TOKENS.borderRadius}; background: var(--color-background); }
    .kpg-img { width: 100%; height: auto; display: block; transition: opacity 0.5s; }
    .kpg-hover-img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      opacity: 0; transition: opacity 0.5s;
    }
    .kpg-card:hover .kpg-hover-img { opacity: 1; }
    .kpg-card:hover .kpg-main-img { opacity: 0; }
    .kpg-actions {
      position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column;
      gap: 5px; opacity: 0; transform: translateX(10px); transition: all 0.3s; z-index: 3;
    }
    .kpg-card:hover .kpg-actions { opacity: 1; transform: translateX(0); }
    .kpg-action-btn {
      width: 35px; height: 35px; border-radius: 50%; background: #fff;
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1); font-size: 14px; transition: background 0.2s;
    }
    .kpg-action-btn:hover { background: ${TOKENS.primaryColor}; color: var(--color-background); }
    .kpg-badge {
      position: absolute; top: 10px; left: 10px; z-index: 3;
      padding: 3px 12px; border-radius: 3px; font-size: 12px; font-weight: 700;
      font-family: ${TOKENS.bodyFont}; color: #fff;
    }
    .kpg-badge-sale { background: ${TOKENS.primaryColor}; }
    .kpg-badge-hot { background: #e67e22; }
    .kpg-badge-new { background: #27ae60; }
    .kpg-swatches { display: flex; gap: 5px; margin-bottom: 6px; }
    .kpg-swatch {
      width: 16px; height: 16px; border-radius: 50%; border: 2px solid #e0e0e0;
      cursor: pointer; transition: border-color 0.2s;
    }
    .kpg-swatch:hover { border-color: ${TOKENS.titleColor}; }
    .kpg-cat {
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
      margin-bottom: 4px;
    }
    .kpg-cat a { color: inherit; text-decoration: none; }
    .kpg-name {
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 14px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 4px; line-height: 1.4;
    }
    .kpg-name a { color: inherit; text-decoration: none; }
    .kpg-name a:hover { color: ${TOKENS.primaryColor}; }
    .kpg-price { font-weight: 700; font-size: 14px; font-family: ${TOKENS.bodyFont}; }
    .kpg-price-old { text-decoration: line-through; color: #999; font-weight: 400; margin-right: 8px; }
    .kpg-price-sale { color: ${TOKENS.primaryColor}; }
    .kpg-add-btn {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: ${TOKENS.primaryColor}; color: #fff; border: none;
      padding: 10px; font-weight: 700; font-size: 13px;
      font-family: ${TOKENS.bodyFont}; cursor: pointer; opacity: 0;
      transform: translateY(100%); transition: all 0.3s;
      border-radius: 0 0 ${TOKENS.borderRadius} ${TOKENS.borderRadius};
    }
    .kpg-card:hover .kpg-add-btn { opacity: 1; transform: translateY(0); }
    @media (max-width: 1024px) { .kpg-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .kpg-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  `;

  if (products.length === 0) {
    return (
      <div className="kpg-section" style={containerStyle}>
        <ScopedStyles id="product-grid" css={scopedCss} />
        {sectionTitle && <KidsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} />}
        <div style={{ textAlign: "center", padding: "40px 20px", color: TOKENS.textColor, fontFamily: TOKENS.bodyFont }}>
          <p>No products yet. Add products from your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kpg-section" style={containerStyle}>
      <ScopedStyles id="product-grid" css={scopedCss} />
      {sectionTitle && <KidsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} />}
      <div className="kpg-grid">
        {products.map((p) => {
          const pLink = resolveLink(p.link, p.name);
          const badgeClass = p.badge?.toLowerCase() === "sale" ? "kpg-badge-sale" : p.badge?.toLowerCase() === "hot" ? "kpg-badge-hot" : "kpg-badge-new";
          return (
            <div key={p.id} className="kpg-card">
              <div className="kpg-thumb">
                <Link href={pLink}>
                  <img src={p.image || safeSrc(null, p.name)} alt={p.name} className="kpg-img kpg-main-img" loading="lazy" onError={(e) => onImgError(e, p.name)} />
                  {showHoverImage && p.hoverImage && (
                    <img src={p.hoverImage} alt={p.name} className="kpg-hover-img" loading="lazy"  onError={(e) => onImgError(e, p.name)} />
                  )}
                </Link>
                {p.badge && <span className={`kpg-badge ${badgeClass}`}>{p.badge}</span>}
                <div className="kpg-actions">
                  <button className="kpg-action-btn" title="Quick view" aria-label="Quick view" onClick={() => storeCtx?.onQuickView?.(String(p.id))}>👁</button>
                  <button className="kpg-action-btn" title="Wishlist" aria-label="Wishlist" onClick={() => storeCtx?.toggleWishlist?.(String(p.id))} style={storeCtx?.isWishlisted?.(String(p.id)) ? { color: "red" } : undefined}>{storeCtx?.isWishlisted?.(String(p.id)) ? "♥" : "♡"}</button>
                  <button className="kpg-action-btn" title="Compare" aria-label="Compare" onClick={() => { toggleCompareItem({ id: String(p.id), name: p.name, slug: (p as any).slug || p.name, price: p.price, image: p.image }, storeCtx?.storeSlug); setCompareState(prev => !prev); }}>⇌</button>
                </div>
                <button className="kpg-add-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
              </div>
              {p.colors && p.colors.length > 0 && (
                <div className="kpg-swatches">
                  {p.colors.map((c, ci) => (
                    <span key={ci} className="kpg-swatch" style={{ background: c.hex }} title={c.name} />
                  ))}
                </div>
              )}
              {showCategory && p.category && (
                <div className="kpg-cat"><Link href={resolveStoreLink(p.categoryLink || "#", storeCtx?.storeSlug)}>{p.category}</Link></div>
              )}
              <h3 className="kpg-name"><Link href={pLink}>{p.name}</Link></h3>
              <div className="kpg-price">
                {p.salePrice && <span className="kpg-price-old">{p.price}</span>}
                <span className={p.salePrice ? "kpg-price-sale" : ""}>{p.salePrice || p.price}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. KIDS BUNDLE PROMO
   "Organic and safe clothes set for your baby" — left text with
   "Buy bundle now" CTA, right side product images carousel.
   ═══════════════════════════════════════════════════════════════ */

export interface KidsBundlePromoProps {
  subtitle?: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  productImages: string[];
  backgroundColor?: string;
  marginBottom?: string;
}

export function KidsBundlePromo({ subtitle = "Buy bundle and get a 25% discount", title, description, buttonText = "Buy bundle now", buttonLink, productImages, backgroundColor, marginBottom = "60px" }: KidsBundlePromoProps) {
  const storeCtx = useContext(KidsStoreContext);
  const fixLink = (link?: string) => resolveStoreLink(link || "#", storeCtx?.storeSlug);
  const { ref, inView } = useInView();

  const scopedCss = `
    .kbp-section { margin-bottom: ${marginBottom}; border-radius: ${TOKENS.borderRadius}; overflow: hidden; padding: 50px; }
    .kbp-grid { display: flex; align-items: center; gap: 40px; }
    .kbp-content { flex: 0 0 40%; }
    .kbp-images { flex: 1; display: flex; gap: 15px; overflow-x: auto; }
    .kbp-subtitle {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.primaryColor};
      font-weight: 500; margin-bottom: 5px;
    }
    .kbp-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 42px;
      color: ${TOKENS.titleColor}; line-height: 1.2; margin: 0 0 20px;
    }
    .kbp-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor};
      line-height: 1.6; margin: 0 0 25px;
    }
    .kbp-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 28px; background: ${TOKENS.primaryColor}; color: #fff;
      font-family: ${TOKENS.bodyFont}; font-weight: 700; font-size: 14px;
      text-decoration: none; border-radius: 5px; transition: background 0.3s;
    }
    .kbp-btn:hover { filter: brightness(0.9); }
    .kbp-btn-icon { width: 18px; height: 18px; }
    .kbp-product-img {
      flex: 0 0 auto; width: 200px; border-radius: ${TOKENS.borderRadius};
      object-fit: cover; aspect-ratio: 7/8;
    }
    .kbp-animate { opacity: 0; transform: translateY(20px); transition: all 0.6s ease; }
    .kbp-animate.kbp-visible { opacity: 1; transform: translateY(0); }
    @media (max-width: 1024px) {
      .kbp-title { font-size: 32px; }
      .kbp-section { padding: 30px; }
    }
    @media (max-width: 767px) {
      .kbp-grid { flex-direction: column; gap: 25px; }
      .kbp-content { flex: none; width: 100%; }
      .kbp-title { font-size: 26px; }
      .kbp-product-img { width: 150px; }
    }
  `;

  return (
    <div className="kbp-section" ref={ref} style={{ backgroundColor }} >
      <ScopedStyles id="bundle-promo" css={scopedCss} />
      <div className={`kbp-grid kbp-animate ${inView ? "kbp-visible" : ""}`} style={containerStyle}>
        <div className="kbp-content">
          {subtitle && <div className="kbp-subtitle">{subtitle}</div>}
          <h2 className="kbp-title">{title}</h2>
          {description && <p className="kbp-desc">{description}</p>}
          <Link href={fixLink(buttonLink)} className="kbp-btn">
            <img src={`${IMG_BASE}/bundle.svg`} alt="" className="kbp-btn-icon"  onError={(e) => onImgError(e, "fallback")} />
            {buttonText}
          </Link>
        </div>
        <div className="kbp-images">
          {productImages.map((img, i) => (
            <img key={i} src={img} alt={`Bundle product ${i + 1}`} className="kbp-product-img" loading="lazy"  onError={(e) => onImgError(e, `Bundle product ${i + 1}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. KIDS BLOG POSTS
   Masonry-style blog cards with date badge, category tags,
   author avatar, social share, excerpt.
   ═══════════════════════════════════════════════════════════════ */

export interface KidsBlogPost {
  image: string;
  title: string;
  excerpt: string;
  date: { day: string; month: string };
  categories: string[];
  author: { name: string; avatar?: string };
  link: string;
  commentCount?: number;
}

export interface KidsBlogPostsProps {
  posts: KidsBlogPost[];
  columns?: number;
  sectionTitle?: { subtitle?: string; title: string };
  marginBottom?: string;
}

export function KidsBlogPosts({ posts: propPosts, columns = 3, sectionTitle, marginBottom = "60px" }: KidsBlogPostsProps) {
  const storeCtx = useContext(KidsStoreContext);

  const posts: KidsBlogPost[] = (() => {
    if (!storeCtx || !storeCtx.blogs || storeCtx.blogs.length === 0) return propPosts || [];
    return storeCtx.blogs.slice(0, columns * 2).map(b => {
      const d = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
      return {
        image: b.coverImage || safeSrc(null, b.title),
        title: b.title,
        excerpt: b.excerpt || "",
        date: { day: d.getDate().toString().padStart(2, "0"), month: d.toLocaleString("en-US", { month: "short" }) },
        categories: b.category ? [b.category] : [],
        author: { name: b.author || "Store Team" },
        link: `/store/${storeCtx.storeSlug}/blog/${b.slug}`,
        commentCount: 0,
      };
    });
  })();

  const scopedCss = `
    .kbp2-section { margin-bottom: ${marginBottom}; }
    .kbp2-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; }
    .kbp2-card { overflow: hidden; background: #fff; border-radius: ${TOKENS.borderRadius}; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .kbp2-img-wrap { position: relative; overflow: hidden; }
    .kbp2-img { width: 100%; height: auto; display: block; transition: transform 0.5s; }
    .kbp2-card:hover .kbp2-img { transform: scale(1.05); }
    .kbp2-date-badge {
      position: absolute; top: 15px; left: 15px; background: ${TOKENS.primaryColor};
      color: #fff; text-align: center; padding: 8px 12px; border-radius: 5px; z-index: 2;
    }
    .kbp2-date-day { display: block; font-size: 20px; font-weight: 700; line-height: 1; font-family: ${TOKENS.bodyFont}; }
    .kbp2-date-month { display: block; font-size: 11px; text-transform: uppercase; font-family: ${TOKENS.bodyFont}; }
    .kbp2-content { padding: 20px; }
    .kbp2-cats { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px; }
    .kbp2-cat {
      background: rgba(245,133,124,0.12); color: ${TOKENS.primaryColor}; font-size: 11px;
      padding: 3px 10px; border-radius: 3px; text-transform: uppercase; font-weight: 600;
      font-family: ${TOKENS.bodyFont};
    }
    .kbp2-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 18px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 10px; line-height: 1.4;
    }
    .kbp2-title a { color: inherit; text-decoration: none; }
    .kbp2-title a:hover { color: ${TOKENS.primaryColor}; }
    .kbp2-meta {
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
      font-size: 13px; color: ${TOKENS.textColor}; font-family: ${TOKENS.bodyFont};
    }
    .kbp2-avatar { width: 24px; height: 24px; border-radius: 50%; }
    .kbp2-excerpt {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor};
      line-height: 1.6;
    }
    .kbp2-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { .kbp2-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .kbp2-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <div className="kbp2-section" style={containerStyle}>
      <ScopedStyles id="blog-posts" css={scopedCss} />
      {sectionTitle && <KidsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} />}
      <div className="kbp2-grid">
        {posts.map((p, i) => (
          <article key={i} className="kbp2-card">
            <div className="kbp2-img-wrap">
              <img src={p.image} alt={p.title} className="kbp2-img" loading="lazy"  onError={(e) => onImgError(e, p.title)} />
              <div className="kbp2-date-badge">
                <span className="kbp2-date-day">{p.date.day}</span>
                <span className="kbp2-date-month">{p.date.month}</span>
              </div>
              <Link href={resolveStoreLink(p.link, storeCtx?.storeSlug)} className="kbp2-link" aria-label={p.title} />
            </div>
            <div className="kbp2-content">
              <div className="kbp2-cats">
                {p.categories.map((c, ci) => <span key={ci} className="kbp2-cat">{c}</span>)}
              </div>
              <h3 className="kbp2-title"><Link href={p.link}>{p.title}</Link></h3>
              <div className="kbp2-meta">
                {p.author.avatar && <img src={p.author.avatar} alt={p.author.name} className="kbp2-avatar"  onError={(e) => onImgError(e, p.author.name)} />}
                <span>By <strong>{p.author.name}</strong></span>
                {p.commentCount !== undefined && <span>💬 {p.commentCount}</span>}
              </div>
              <p className="kbp2-excerpt">{p.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. KIDS INSTAGRAM FEED
   5 square images with likes + comments on hover.
   ═══════════════════════════════════════════════════════════════ */

export interface KidsInstagramItem {
  image: string;
  likes: number;
  comments: number;
  link: string;
}

export interface KidsInstagramProps {
  items: KidsInstagramItem[];
  sectionTitle?: { subtitle?: string; title: string };
  marginBottom?: string;
}

export function KidsInstagram({ items, sectionTitle, marginBottom = "60px" }: KidsInstagramProps) {
  const scopedCss = `
    .ki-section { margin-bottom: ${marginBottom}; }
    .ki-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; }
    .ki-item { position: relative; overflow: hidden; border-radius: ${TOKENS.borderRadius}; cursor: pointer; aspect-ratio: 1; }
    .ki-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s; }
    .ki-item:hover .ki-img { transform: scale(1.08); }
    .ki-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.35);
      display: flex; align-items: center; justify-content: center; gap: 15px;
      opacity: 0; transition: opacity 0.3s; z-index: 2; border-radius: ${TOKENS.borderRadius};
    }
    .ki-item:hover .ki-overlay { opacity: 1; }
    .ki-stat {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; font-weight: 700;
      color: #fff; display: flex; align-items: center; gap: 5px;
    }
    .ki-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { .ki-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .ki-grid { grid-template-columns: repeat(2, 1fr); } }
  `;

  return (
    <div className="ki-section" style={containerStyle}>
      <ScopedStyles id="instagram" css={scopedCss} />
      {sectionTitle && <KidsSectionTitle subtitle={sectionTitle.subtitle} title={sectionTitle.title} />}
      <div className="ki-grid">
        {items.map((item, i) => (
          <div key={i} className="ki-item">
            <img src={item.image} alt={`Instagram ${i + 1}`} className="ki-img" loading="lazy"  onError={(e) => onImgError(e, `Instagram ${i + 1}`)} />
            <div className="ki-overlay">
              <span className="ki-stat">❤ {item.likes.toLocaleString()}</span>
              <span className="ki-stat">💬 {item.comments}</span>
            </div>
            <a href={item.link} className="ki-link" target="_blank" rel="noopener noreferrer" aria-label={`Instagram post ${i + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. KIDS NEWSLETTER
   "Join our mailing list" info-box style with email input.
   ═══════════════════════════════════════════════════════════════ */

export interface KidsNewsletterProps {
  title?: string;
  buttonText?: string;
  backgroundColor?: string;
  onSubmit?: (email: string) => void;
}

export function KidsNewsletter({ title = "Join our mailing list to receive any latest updates and promotions", buttonText = "Subscribe", backgroundColor, onSubmit }: KidsNewsletterProps) {
  const [email, setEmail] = useState("");
  const storeCtx = useContext(KidsStoreContext);
  const { subscribe, status: nlStatus } = useNewsletterSubscribe(storeCtx?.storeSlug || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) { onSubmit(email); setEmail(""); return; }
    subscribe(email).then(() => setEmail(""));
  };

  const scopedCss = `
    .kn-section { padding: 40px; border-radius: ${TOKENS.borderRadius}; text-align: center; }
    .kn-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 20px;
      color: ${TOKENS.titleColor}; margin: 0 auto 20px; max-width: 500px;
    }
    .kn-form { display: flex; max-width: 450px; margin: 0 auto; gap: 0; }
    .kn-input {
      flex: 1; padding: 12px 18px; border: 2px solid #e0e0e0;
      font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none;
      border-radius: 5px 0 0 5px; border-right: none; background: #fff;
    }
    .kn-input:focus { border-color: ${TOKENS.primaryColor}; }
    .kn-submit {
      padding: 12px 25px; background: ${TOKENS.primaryColor}; color: #fff;
      border: 2px solid ${TOKENS.primaryColor}; font-family: ${TOKENS.bodyFont};
      font-weight: 700; font-size: 13px; cursor: pointer;
      border-radius: 0 5px 5px 0; transition: background 0.3s;
    }
    .kn-submit:hover { filter: brightness(0.9); }
    @media (max-width: 767px) {
      .kn-form { flex-direction: column; gap: 10px; }
      .kn-input { border-right: 2px solid #e0e0e0; border-radius: 5px; }
      .kn-submit { border-radius: 5px; }
    }
  `;

  return (
    <div className="kn-section" style={{ backgroundColor: backgroundColor || 'var(--color-background)', ...containerStyle }}>
      <ScopedStyles id="newsletter" css={scopedCss} />
      <h3 className="kn-title">{title}</h3>
      {nlStatus === "success" ? (
        <p style={{ fontFamily: TOKENS.bodyFont, fontSize: "16px", color: TOKENS.primaryColor, marginTop: "20px" }}>Thanks for subscribing! 🎉</p>
      ) : (
      <form className="kn-form" onSubmit={handleSubmit}>
        <input type="email" className="kn-input" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required />
        <button type="submit" className="kn-submit" disabled={nlStatus === "loading"}>{nlStatus === "loading" ? "Signing up..." : buttonText}</button>
      </form>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KIDS HEADER
   Full WoodMart Kids-style header with:
   Left: About Us · Contact Us · Blog
   Center: Logo
   Right-center: Shop · Gifts
   Far-right: Search · Sign In · Wishlist · Cart
   ═══════════════════════════════════════════════════════════════ */

export interface KidsHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  templateSlug?: string;
  cartCount?: number;
  wishlistCount?: number;
  onSearch?: (q: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  topBarText?: string;
}

export function KidsHeader({
  storeName,
  storeSlug,
  logo,
  templateSlug,
  cartCount = 0,
  wishlistCount = 0,
  onSearch,
  searchQuery = "",
  onSearchChange,
  topBarText = "Sign up for our newsletter to get 10% off for the week!",
}: KidsHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState(searchQuery);
  const exactKids = templateSlug === "kids";

  const base = `/store/${storeSlug}`;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch?.(searchVal.trim());
      onSearchChange?.(searchVal.trim());
      setSearchOpen(false);
      window.location.href = `${base}/shop?q=${encodeURIComponent(searchVal.trim())}`;
    }
  };

  const headerCss = `
    .kh-topbar { background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 13px; text-align: center; padding: 8px 15px; font-weight: 500; }
    .kh-header { background: #fff; border-bottom: 1px solid #e8e8e8; font-family: ${TOKENS.bodyFont}; position: sticky; top: 0; z-index: 100; }
    .kh-inner { max-width: ${TOKENS.containerWidth}; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; height: 80px; }
    .kh-nav { display: flex; align-items: center; gap: 28px; }
    .kh-nav a { font-size: 14px; font-weight: 600; color: ${TOKENS.titleColor}; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; transition: color 0.2s; }
    .kh-nav a:hover { color: ${TOKENS.primaryColor}; }
    .kh-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .kh-logo img { height: 40px; width: auto; }
    .kh-logo-text { font-family: ${TOKENS.titleFont}; font-size: 24px; font-weight: 700; color: ${TOKENS.titleColor}; }
    .kh-icons { display: flex; align-items: center; gap: 20px; }
    .kh-icon-btn { position: relative; background: none; border: none; cursor: pointer; padding: 4px; color: ${TOKENS.titleColor}; transition: color 0.2s; }
    .kh-icon-btn:hover { color: ${TOKENS.primaryColor}; }
    .kh-icon-btn svg { width: 22px; height: 22px; }
    .kh-account-link { display: inline-flex; align-items: center; gap: 8px; color: ${TOKENS.titleColor}; font-size: 13px; font-weight: 600; white-space: nowrap; text-decoration: none; padding: 4px 2px; }
    .kh-account-link:hover { color: ${TOKENS.primaryColor}; }
    .kh-account-link svg { width: 19px; height: 19px; }
    .kh-badge { position: absolute; top: -4px; right: -6px; background: ${TOKENS.primaryColor}; color: #fff; font-size: 10px; font-weight: 700; min-width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .kh-search-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: flex-start; justify-content: center; padding-top: 120px; }
    .kh-search-box { background: #fff; border-radius: 12px; padding: 30px; width: 90%; max-width: 600px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .kh-search-box form { display: flex; gap: 10px; }
    .kh-search-box input { flex: 1; border: 2px solid #e8e8e8; border-radius: 8px; padding: 12px 16px; font-size: 15px; font-family: ${TOKENS.bodyFont}; outline: none; transition: border-color 0.2s; }
    .kh-search-box input:focus { border-color: ${TOKENS.primaryColor}; }
    .kh-search-box button[type="submit"] { background: ${TOKENS.primaryColor}; color: #fff; border: none; border-radius: 8px; padding: 12px 24px; font-weight: 600; cursor: pointer; font-family: ${TOKENS.bodyFont}; transition: background 0.2s; }
    .kh-search-box button[type="submit"]:hover { filter: brightness(0.9); }
    .kh-mobile-toggle { display: none; background: none; border: none; cursor: pointer; padding: 4px; color: ${TOKENS.titleColor}; }
    .kh-mobile-toggle svg { width: 24px; height: 24px; }
    .kh-mobile-menu { display: none; background: #fff; border-bottom: 1px solid #e8e8e8; padding: 15px; }
    .kh-mobile-menu a { display: block; padding: 10px 0; font-size: 15px; font-weight: 600; color: ${TOKENS.titleColor}; text-decoration: none; border-bottom: 1px solid #f0f0f0; }
    .kh-mobile-menu a:last-child { border-bottom: none; }
    @media (max-width: 768px) {
      .kh-nav { display: none; }
      .kh-mobile-toggle { display: block; }
      .kh-mobile-menu.kh-open { display: block; }
      .kh-inner { height: 60px; }
      .kh-icons { gap: 14px; }
      .kh-icon-btn svg { width: 20px; height: 20px; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: headerCss }} />
      {/* Top bar */}
      <div className="kh-topbar">{topBarText}</div>
      {/* Main header */}
      <header className="kh-header">
        <div className="kh-inner">
          {/* Mobile hamburger */}
          <button className="kh-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            )}
          </button>

          {/* Left nav */}
          <nav className="kh-nav">
            <Link href={exactKids ? `${base}/about` : `${base}/shop`}>About Us</Link>
            <Link href={exactKids ? `${base}/contact` : `${base}/shop`}>Contact Us</Link>
            <Link href={`${base}/blog`}>Blog</Link>
          </nav>

          {/* Center logo */}
          <Link href={base} className="kh-logo">
            {logo ? (
              <img src={logo} alt={storeName} />
            ) : (
              <span className="kh-logo-text">{storeName}</span>
            )}
          </Link>

          {/* Right nav */}
          <nav className="kh-nav">
            <Link href={`${base}/shop`}>Shop</Link>
            <Link href={`${base}/product-category/gifts`}>Gifts</Link>
          </nav>

          {/* Icon actions */}
          <div className="kh-icons">
            {/* Search */}
            <button className="kh-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
            {/* Sign In */}
            <Link href={`${base}/my-account`} className="kh-account-link" aria-label="Sign In / Sign Up" style={{ textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Sign In / Sign Up</span>
            </Link>
            {/* Wishlist */}
            <Link href={`${base}/wishlist`} className="kh-icon-btn" aria-label="Wishlist" style={{ textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {wishlistCount > 0 && <span className="kh-badge">{wishlistCount}</span>}
            </Link>
            {/* Cart */}
            <Link href={`${base}/cart`} className="kh-icon-btn" aria-label="Cart" style={{ textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {cartCount > 0 && <span className="kh-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`kh-mobile-menu ${mobileOpen ? "kh-open" : ""}`}>
          <Link href={base} onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href={`${base}/shop`} onClick={() => setMobileOpen(false)}>Shop</Link>
          <Link href={`${base}/product-category/gifts`} onClick={() => setMobileOpen(false)}>Gifts</Link>
          <Link href={exactKids ? `${base}/about` : `${base}/shop`} onClick={() => setMobileOpen(false)}>About Us</Link>
          <Link href={exactKids ? `${base}/contact` : `${base}/shop`} onClick={() => setMobileOpen(false)}>Contact Us</Link>
          <Link href={`${base}/blog`} onClick={() => setMobileOpen(false)}>Blog</Link>
          <Link href={`${base}/wishlist`} onClick={() => setMobileOpen(false)}>Wishlist</Link>
          <Link href={`${base}/my-account`} onClick={() => setMobileOpen(false)}>My Account</Link>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="kh-search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="kh-search-box" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                autoFocus
              />
              <button type="submit">Search</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KIDS FOOTER (Custom WoodMart Kids-style)
   Playful, warm footer with proper store links
   ═══════════════════════════════════════════════════════════════ */

export interface KidsFooterFullProps {
  storeName?: string;
  storeSlug?: string;
  logo?: string | null;
  templateSlug?: string;
  description?: string;
  contact?: { address?: string; phone?: string; email?: string };
  socialLinks?: Array<{ platform: string; url: string }>;
  copyrightText?: string;
}

export function KidsFooterFull({
  storeName = "Kids Store",
  storeSlug: storeSlugProp,
  logo,
  templateSlug,
  description = "We create organic clothes for babies and children. Quality, comfort, and style in every piece.",
  contact = { address: "913 Wyandotte St, Kansas City, MO 64105", phone: "(064) 332-1233", email: "hello@store.com" },
  socialLinks = [],
  copyrightText,
}: KidsFooterFullProps) {
  const storeCtx = useContext(KidsStoreContext);
  const resolvedSlug = storeSlugProp || storeCtx?.storeSlug;
  const base = resolvedSlug ? `/store/${resolvedSlug}` : "/";
  const exactKids = templateSlug === "kids";

  const activeSocials = socialLinks.filter(s => s.url && s.url !== "#");

  const socialIcons: Record<string, string> = {
    facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶", tiktok: "♪", whatsapp: "💬",
  };

  const footerCss = `
    .kf-footer { background: ${TOKENS.footerBg}; font-family: ${TOKENS.bodyFont}; color: ${TOKENS.textColor}; }
    .kf-main { max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 60px 15px 40px; display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; }
    .kf-brand p { font-size: 14px; line-height: 1.8; margin: 16px 0; }
    .kf-social { display: flex; gap: 10px; margin-top: 16px; }
    .kf-social a { width: 36px; height: 36px; border-radius: 50%; background: ${TOKENS.primaryColor}; color: var(--color-background); display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 14px; font-weight: 700; transition: background 0.2s; }
    .kf-social a:hover { filter: brightness(0.9); }
    .kf-col-title { font-family: ${TOKENS.titleFont}; font-size: 16px; font-weight: 700; color: ${TOKENS.titleColor}; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 0.3px; }
    .kf-links { list-style: none; margin: 0; padding: 0; }
    .kf-links li { margin-bottom: 10px; }
    .kf-links a { font-size: 14px; color: ${TOKENS.textColor}; text-decoration: none; transition: color 0.2s; }
    .kf-links a:hover { color: ${TOKENS.primaryColor}; }
    .kf-contact-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 14px; }
    .kf-contact-icon { width: 16px; height: 16px; flex-shrink: 0; margin-top: 3px; color: ${TOKENS.primaryColor}; }
    .kf-bottom { border-top: 1px solid var(--color-border); max-width: ${TOKENS.containerWidth}; margin: 0 auto; padding: 20px 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .kf-bottom small { font-size: 13px; color: ${TOKENS.textColor}; }
    .kf-bottom small a { color: ${TOKENS.textColor}; text-decoration: none; }
    .kf-payments img { height: 21px; width: auto; }
    @media (max-width: 768px) {
      .kf-main { grid-template-columns: 1fr; gap: 30px; padding: 40px 15px 30px; }
    }
    @media (min-width: 769px) and (max-width: 1024px) {
      .kf-main { grid-template-columns: 1fr 1fr; }
    }
  `;

  return (
    <footer className="kf-footer">
      <style dangerouslySetInnerHTML={{ __html: footerCss }} />
      <div className="kf-main">
        {/* Brand column */}
        <div className="kf-brand">
          <Link href={base} style={{ textDecoration: 'none' }}>
            {logo ? (
              <img src={logo} alt={storeName} style={{ maxWidth: '180px', height: 'auto' }} />
            ) : (
              <span style={{ fontFamily: TOKENS.titleFont, fontSize: '22px', fontWeight: 700, color: TOKENS.titleColor }}>{storeName}</span>
            )}
          </Link>
          <p>{description}</p>
          {contact?.phone && (
            <div className="kf-contact-item">
              <span className="kf-contact-icon">📞</span>
              <span>Phone: {contact.phone}</span>
            </div>
          )}
          {contact?.email && (
            <div className="kf-contact-item">
              <span className="kf-contact-icon">✉️</span>
              <span>Email: {contact.email}</span>
            </div>
          )}
          {contact?.address && (
            <div className="kf-contact-item">
              <span className="kf-contact-icon">📍</span>
              <span>{contact.address}</span>
            </div>
          )}
          {activeSocials.length > 0 && (
            <div className="kf-social">
              {activeSocials.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                  {socialIcons[s.platform] || s.platform[0]?.toUpperCase()}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Shop column */}
        <div>
          <h4 className="kf-col-title">Shop</h4>
          <ul className="kf-links">
            <li><Link href={`${base}/shop`}>Growsuits</Link></li>
            <li><Link href={`${base}/shop`}>Jumpers</Link></li>
            <li><Link href={`${base}/shop`}>Toys</Link></li>
            <li><Link href={`${base}/product-category/gifts`}>Gifts</Link></li>
            <li><Link href={`${base}/shop`}>Accessories</Link></li>
            <li><Link href={`${base}/shop`}>Dresses</Link></li>
            <li><Link href={`${base}/shop`}>Leggings</Link></li>
          </ul>
        </div>

        {/* Information column */}
        <div>
          <h4 className="kf-col-title">Useful links</h4>
          <ul className="kf-links">
            <li><Link href={exactKids ? `${base}/contact` : `${base}/shop`}>Contact Us</Link></li>
            <li><Link href={exactKids ? `${base}/about` : `${base}/shop`}>About Us</Link></li>
            <li><Link href={`${base}/blog`}>Blog</Link></li>
            <li><Link href={`${base}/shop`}>Delivery & Return</Link></li>
          </ul>
        </div>

        {/* Account column */}
        <div>
          <h4 className="kf-col-title">Got a question?</h4>
          <ul className="kf-links">
            <li><Link href={`mailto:hello@kidsstore.com`}>Email: [email protected]</Link></li>
            <li><span>Call Us: (064) 332-1233</span></li>
            <li><span>Monday - Friday</span></li>
            <li><span>Hours: 9:00am - 5:00pm</span></li>
            <li><span>913 Wyandotte St, Kansas City, MO 64105, United States</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="kf-bottom">
        <small>
          <Link href={base}>{copyrightText || `Based on WoodMart theme © ${new Date().getFullYear()} WooCommerce Themes.`}</Link>
        </small>
        <div className="kf-payments">
          <img src="https://woodmart.xtemos.com/wp-content/uploads/2018/08/payment.png" alt="Payment methods" loading="lazy" />
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RICH CONTENT BLOCK TYPES (extracted from hardcoded JSX)
   ═══════════════════════════════════════════════════════════════ */

/* ─── KIDS ABOUT HERO ─────────────────────────────────────────── */
export interface KidsAboutHeroProps {
  subtitle?: string;
  title?: string;
  bodyText?: string[];
  images?: string[];
  calloutText?: string;
  calloutLabel?: string;
}

export function KidsAboutHero({ 
  subtitle = "About Us", 
  title = "We create organic clothes for babies",
  bodyText = [],
  images = [],
  calloutText = "Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure show.",
  calloutLabel = "Meet our team"
}: KidsAboutHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fff5f1] via-white to-[#f8fbff]">
      <div className="mx-auto grid max-w-[1222px] gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:py-24">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#f5857c]">{subtitle}</p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight text-[#242424] md:text-6xl">{title}</h1>
          {bodyText.map((text, i) => (
            <p key={i} className={`mt-${i === 0 ? 6 : 4} max-w-xl text-[16px] leading-8 text-[#767676]`}>{text}</p>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {images[0] && <img src={images[0]} alt="Kids collection" className="h-full w-full rounded-[28px] object-cover shadow-lg" />}
          <div className="grid gap-4">
            {images[1] && <img src={images[1]} alt="Kids knitwear" className="h-full w-full rounded-[28px] object-cover shadow-lg" />}
            <div className="rounded-[28px] bg-white p-6 shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f5857c]">{calloutLabel}</p>
              <p className="mt-3 text-sm leading-7 text-[#767676]">{calloutText}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── KIDS TEAM SECTION ─────────────────────────────────────────── */
export interface KidsTeamMember {
  name: string;
  role: string;
}

export interface KidsTeamSectionProps {
  sectionTitle?: { subtitle?: string; title?: string };
  team: KidsTeamMember[];
}

export function KidsTeamSection({ 
  sectionTitle = { subtitle: "", title: "" },
  team = []
}: KidsTeamSectionProps) {
  return (
    <section className="mx-auto max-w-[1222px] px-4 py-16 md:px-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {team.map((member) => (
          <div key={member.name} className="rounded-[24px] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-bold text-[#242424]">{member.name}</h2>
            <p className="mt-3 text-sm leading-7 text-[#767676]">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── KIDS TEXT SECTION ─────────────────────────────────────────── */
export interface KidsTextSectionProps {
  sectionTitle?: { subtitle?: string; title?: string };
  bodyText?: string[];
  backgroundColor?: string;
}

export function KidsTextSection({ 
  sectionTitle = { subtitle: "", title: "" },
  bodyText = [],
  backgroundColor = "transparent"
}: KidsTextSectionProps) {
  return (
    <section className={backgroundColor === "#faf8f5" ? "bg-[#faf8f5]" : ""}>
      <div className="mx-auto grid max-w-[1222px] gap-10 px-4 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-6">
        <div>
          {sectionTitle.subtitle && <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f5857c]">{sectionTitle.subtitle}</p>}
          <h2 className="mt-4 text-3xl font-bold text-[#242424] md:text-4xl">{sectionTitle.title}</h2>
        </div>
        <div className="space-y-5 text-[16px] leading-8 text-[#767676]">
          {bodyText.map((text, i) => <p key={i}>{text}</p>)}
        </div>
      </div>
    </section>
  );
}

/* ─── KIDS FAQ SECTION ──────────────────────────────────────────── */
export interface KidsFaqItem {
  question: string;
  answer: string;
}

export interface KidsFaqSectionProps {
  sectionTitle?: { subtitle?: string; title?: string };
  subtitle?: string;
  faqs: KidsFaqItem[];
}

export function KidsFaqSection({ 
  sectionTitle = { subtitle: "", title: "" },
  subtitle = "",
  faqs = []
}: KidsFaqSectionProps) {
  return (
    <section className="mx-auto max-w-[1222px] px-4 py-16 md:px-6">
      <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr]">
        <div>
          {sectionTitle.subtitle && <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f5857c]">{sectionTitle.subtitle}</p>}
          <h2 className="mt-4 text-3xl font-bold text-[#242424] md:text-4xl">{sectionTitle.title}</h2>
          <p className="mt-4 text-[16px] leading-8 text-[#767676]">
            {sectionTitle.subtitle && subtitle}
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#242424]">Some of your questions answered here</h3>
          <p className="text-sm leading-7 text-[#767676]">We get a lot of questions about our course. You can get any answers.</p>
          <div className="space-y-4 rounded-[28px] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-[22px] border border-[#efe6da] bg-[#fffdf8] p-5">
                <h4 className="font-semibold text-[#242424]">{faq.question}</h4>
                <p className="mt-2 text-sm leading-7 text-[#767676]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── KIDS CONTACT HERO ─────────────────────────────────────────── */
export interface KidsContactHeroProps {
  address?: string;
  showMapLink?: boolean;
}

export function KidsContactHero({ 
  address = "913 Wyandotte St, Kansas City, MO 64105, United States",
  showMapLink = true
}: KidsContactHeroProps) {
  return (
    <section className="bg-gradient-to-br from-[#fff7df] via-[#fffdf4] to-[#ffeef1] px-4 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <h1 className="max-w-xl font-serif text-4xl leading-tight text-[#3b3344] sm:text-5xl">{address}</h1>
        </div>
      </div>
    </section>
  );
}

/* ─── KIDS CONTACT INFO ─────────────────────────────────────────── */
export interface KidsContactInfoProps {
  phone?: string;
  hours?: string;
  days?: string;
  socialLinks?: { facebook?: string; twitter?: string; instagram?: string; youtube?: string };
  showMapLink?: boolean;
}

export function KidsContactInfo({ 
  phone = "(064) 332-1233",
  hours = "9:00am - 5:00pm",
  days = "Monday - Friday",
  socialLinks = {},
  showMapLink = true
}: KidsContactInfoProps) {
  return (
    <div className="mt-6 rounded-[32px] bg-white p-6 shadow-[0_18px_40px_rgba(59,51,68,0.06)]">
      {showMapLink && (
        <a href="#map" className="mt-3 inline-flex text-sm font-semibold text-[#f5857c]">
          Show on a map
        </a>
      )}
      <div className="mt-6 space-y-2 text-sm text-[#6d6277]">
        <p>Call Us: {phone}</p>
        <p>Hours: {hours}</p>
        <p>{days}</p>
      </div>
      <div className="mt-6 flex gap-3 text-[#3b3344]">
        {[
          { label: "f", href: socialLinks.facebook || "#" },
          { label: "𝕏", href: socialLinks.twitter || "#" },
          { label: "📷", href: socialLinks.instagram || "#" },
          { label: "▶", href: socialLinks.youtube || "#" },
        ].map((item) => (
          <a key={item.label} href={item.href} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_12px_28px_rgba(59,51,68,0.06)]">
            <span className="text-sm font-bold">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─── KIDS CONTACT FORM ─────────────────────────────────────────── */
export interface KidsContactFormProps {
  title?: string;
}

export function KidsContactForm({ title = "Get in touch" }: KidsContactFormProps) {
  return (
    <div className="rounded-[34px] bg-white p-6 shadow-[0_30px_70px_rgba(59,51,68,0.08)] sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5857c]">{title}</p>
        <h2 className="mt-2 font-serif text-3xl text-[#3b3344]">{title}</h2>
      </div>
      <form className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#f5857c]" placeholder="Your name" />
          <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#f5857c]" placeholder="Email address" />
        </div>
        <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#f5857c]" placeholder="Subject" />
        <textarea className="min-h-[160px] rounded-[24px] border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#f5857c]" placeholder="How can we help?" />
        <button type="button" className="inline-flex items-center justify-center rounded-full bg-[#f5857c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ef7067]">
          Send message
        </button>
      </form>
    </div>
  );
}

/* ─── KIDS OPENING HOURS ────────────────────────────────────────── */
export interface KidsHourRow {
  label: string;
  value: string;
}

export interface KidsOpeningHoursProps {
  title?: string;
  hours: KidsHourRow[];
  infoText?: string;
  links?: { label: string; href: string }[];
  storeSlug?: string;
}

export function KidsOpeningHours({ 
  title = "Monday - Friday",
  hours = [],
  infoText = "Based on WoodMart theme 2025 WooCommerce Themes.",
  links = [],
  storeSlug = ""
}: KidsOpeningHoursProps) {
  return (
    <section id="map" className="px-4 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[34px] border border-[#efe6da] bg-white p-6 shadow-[0_20px_50px_rgba(59,51,68,0.05)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5857c]">Opening hours</p>
          <h2 className="mt-2 font-serif text-3xl text-[#3b3344]">{title}</h2>
          <div className="mt-6 space-y-4 text-sm text-[#6d6277]">
            {hours.map((hour) => (
              <div key={hour.label} className="flex items-center justify-between border-b border-dashed border-[#efe6da] pb-3">
                <span>{hour.label}</span>
                <span className="font-semibold text-[#3b3344]">{hour.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[28px] bg-[#fff7df] p-5">
            <p className="text-sm leading-7 text-[#6d6277]">{infoText}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {links.map((link) => (
                <a key={link.href} href={link.href} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#3b3344] transition hover:text-[#f5857c]">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LEGACY FOOTER (kept for backward compat)
   ═══════════════════════════════════════════════════════════════ */

export function KidsFooter(props: React.ComponentProps<typeof FashionFooter>) {
  const storeCtx = useContext(KidsStoreContext);
  return <FashionFooter {...props} storeSlug={storeCtx?.storeSlug} />;
}
