"use client";
import { FashionFooter } from "./FashionTemplateBlocks";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { toggleCompare as toggleCompareItem } from "@/lib/compare-utils";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";

/* ═══════════════════════════════════════════════════════════════
   MAKEUP TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Makeup template sections.
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
  titleFont: "'Inter', Arial, Helvetica, sans-serif",
  bodyFont: "'Inter', Arial, Helvetica, sans-serif",
};

const IMG_BASE = "https://woodmart.xtemos.com/makeup/wp-content/uploads/sites/22/2024/10";

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function MakeupFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
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
  return <style data-makeup-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
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

export interface MakeupProduct {
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

export interface MakeupStoreContextData {
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
export const MakeupStoreContext = createContext<MakeupStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. MAKEUP HERO SLIDER
   3 slides with left-aligned text, full-width background images,
   rounded bottom corners, slide animation, "Shop Now" CTA.
   ═══════════════════════════════════════════════════════════════ */

export interface MakeupHeroSlide {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  colorScheme?: "dark" | "light";
}

export interface MakeupHeroSliderProps {
  slides: MakeupHeroSlide[];
  autoplaySpeed?: number;
  minHeight?: string;
  marqueeText?: string;
}

export function MakeupHeroSlider({ slides, autoplaySpeed = 5000, minHeight = "500px", marqueeText = "Free Shipping On Orders Over $100" }: MakeupHeroSliderProps) {
  const storeCtx = useContext(MakeupStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, autoplaySpeed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, autoplaySpeed]);

  const scopedCss = `
    .mh-slider { position: relative; width: 100%; overflow: hidden; background: #f3f3f3; }
    .mh-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .mh-slide.mh-active { opacity: 1; position: relative; }
    .mh-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; }
    .mh-slide-content { position: relative; z-index: 2; width: 100%; }
    .mh-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 52px;
      line-height: 1.2; margin: 0 0 20px; max-width: 615px;
    }
    .mh-title-light { color: #fff; }
    .mh-title-dark { color: ${TOKENS.titleColor}; }
    .mh-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 1.6;
      max-width: 527px; margin: 0 0 25px;
    }
    .mh-desc-light { color: rgba(255,255,255,0.85); }
    .mh-desc-dark { color: ${TOKENS.textColor}; }
    .mh-btn {
      display: inline-block; padding: 14px 32px;
      background: ${TOKENS.primaryColor}; color: #fff; text-transform: none;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px;
      text-decoration: none; border: none; cursor: pointer; border-radius: 25px;
      transition: background-color 0.3s ease;
    }
    .mh-btn:hover { filter: brightness(0.9); }
    .mh-dots {
      position: absolute; bottom: 40px; left: 50px;
      display: flex; gap: 10px; z-index: 5;
    }
    .mh-dot {
      width: 10px; height: 10px; border-radius: 50%; border: none; cursor: pointer;
      background: rgba(255,255,255,0.4); transition: background 0.3s; padding: 0;
    }
    .mh-dot.mh-dot-active { background: #fff; }
    .mh-anim-in { animation: mhSlideUp 0.6s ease forwards; opacity: 0; }
    @keyframes mhSlideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .mh-marquee {
      position: absolute; bottom: 0; left: 0; right: 0; z-index: 10;
      background: #010101; border-radius: 0 0 ${TOKENS.borderRadius} ${TOKENS.borderRadius};
      overflow: hidden; padding: 5px 0;
    }
    .mh-marquee-track {
      display: flex; gap: 20px; animation: mhMarquee 35s linear infinite;
      white-space: nowrap;
    }
    .mh-marquee-item {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; color: #fefefe;
      flex-shrink: 0; padding: 0 10px;
    }
    @keyframes mhMarquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @media (max-width: 1024px) {
      .mh-slider { min-height: 450px !important; }
      .mh-title { font-size: 42px; max-width: 520px; }
    }
    @media (max-width: 767px) {
      .mh-slider { min-height: 380px !important; }
      .mh-title { font-size: 28px; max-width: 100%; }
      .mh-desc { font-size: 14px; }
      .mh-dots { left: 20px; bottom: 50px; }
    }
  `;

  const marqueeItems = Array.from({ length: 6 }, (_, i) =>
    i % 2 === 0 ? marqueeText : "🚚"
  );

  return (
    <div className="mh-slider" style={{ minHeight }}>
      <ScopedStyles id="hero-slider" css={scopedCss} />
      {slides.map((slide, i) => {
        const scheme = slide.colorScheme || "light";
        return (
          <div key={i} className={`mh-slide ${i === current ? "mh-active" : ""}`}>
            <div className="mh-slide-bg" style={{ backgroundImage: `url(${slide.backgroundImage})` }} />
            <div className="mh-slide-content">
              <div style={containerStyle}>
                <div style={{ padding: "60px 0", maxWidth: "60%" }}>
                  {i === current && (
                    <>
                      <h2 className={`mh-title mh-title-${scheme} mh-anim-in`} style={{ animationDelay: "0.2s" }}>{slide.title}</h2>
                      <p className={`mh-desc mh-desc-${scheme} mh-anim-in`} style={{ animationDelay: "0.4s" }}>{slide.description}</p>
                      <div className="mh-anim-in" style={{ animationDelay: "0.5s" }}>
                        <Link href={fixLink(slide.buttonLink)} className="mh-btn">{slide.buttonText}</Link>
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
        <div className="mh-dots">
          {slides.map((_, i) => (
            <button key={i} className={`mh-dot ${i === current ? "mh-dot-active" : ""}`} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
      {marqueeText && (
        <div className="mh-marquee">
          <div className="mh-marquee-track">
            {[...marqueeItems, ...marqueeItems].map((text, i) => (
              <span key={i} className="mh-marquee-item">{text}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. MAKEUP CATEGORY SIDEBAR
   Vertical list of categories with small icons, used alongside
   product carousels. Each item: icon + name.
   ═══════════════════════════════════════════════════════════════ */

export interface MakeupSidebarCategory {
  name: string;
  icon: string;
  link: string;
}

export interface MakeupCategorySidebarProps {
  categories: MakeupSidebarCategory[];
  marginBottom?: string;
}

export function MakeupCategorySidebar({ categories, marginBottom = "80px" }: MakeupCategorySidebarProps) {
  const storeCtx = useContext(MakeupStoreContext);
  const fixLink = (link: string, name: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `/store/${storeCtx.storeSlug}/shop?category=${slug}`;
    }
    return resolveStoreLink(link, storeCtx?.storeSlug);
  };

  const scopedCss = `
    .mcs-list { list-style: none; margin: 0; padding: 0; }
    .mcs-item {
      display: flex; align-items: center; gap: 15px; padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .mcs-item:last-child { border-bottom: none; }
    .mcs-icon { width: 65px; height: 55px; object-fit: contain; flex-shrink: 0; }
    .mcs-link {
      font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 34px;
      color: ${TOKENS.titleColor}; text-decoration: none; transition: color 0.2s;
    }
    .mcs-link:hover { color: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) {
      .mcs-link { font-size: 24px; }
      .mcs-icon { width: 45px; height: 38px; }
    }
    @media (max-width: 767px) {
      .mcs-link { font-size: 18px; }
    }
  `;

  return (
    <div style={{ marginBottom }}>
      <ScopedStyles id="category-sidebar" css={scopedCss} />
      <ul className="mcs-list">
        {categories.map((cat, i) => (
          <li key={i} className="mcs-item">
            <img src={cat.icon} alt={cat.name} className="mcs-icon" loading="lazy"  onError={(e) => onImgError(e, cat.name)} />
            <Link href={fixLink(cat.link, cat.name)} className="mcs-link">{cat.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. MAKEUP SECTION TITLE
   Reusable section header with title + optional "More products" button.
   ═══════════════════════════════════════════════════════════════ */

export interface MakeupSectionTitleProps {
  title: string;
  buttonText?: string;
  buttonLink?: string;
  align?: "left" | "center" | "between";
  marginBottom?: string;
}

export function MakeupSectionTitle({ title, buttonText, buttonLink, align = "between", marginBottom = "25px" }: MakeupSectionTitleProps) {
  const storeCtx = useContext(MakeupStoreContext);
  const fixLink = (link?: string) => resolveStoreLink(link || "#", storeCtx?.storeSlug);

  const scopedCss = `
    .mst-wrap {
      display: flex; align-items: center; flex-wrap: wrap; gap: 15px;
      margin-bottom: ${marginBottom};
    }
    .mst-between { justify-content: space-between; }
    .mst-center { justify-content: center; }
    .mst-left { justify-content: flex-start; }
    .mst-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px;
      color: ${TOKENS.titleColor}; margin: 0;
    }
    .mst-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 22px; background: ${TOKENS.primaryColor}; color: #fff;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px;
      text-decoration: none; border-radius: 25px; transition: background 0.3s;
    }
    .mst-btn:hover { filter: brightness(0.9); }
    .mst-btn-arrow { font-size: 12px; }
    @media (max-width: 1024px) { .mst-title { font-size: 24px; } }
    @media (max-width: 767px) { .mst-title { font-size: 22px; } }
  `;

  return (
    <div className={`mst-wrap mst-${align}`}>
      <ScopedStyles id="section-title" css={scopedCss} />
      <h2 className="mst-title">{title}</h2>
      {buttonText && (
        <Link href={fixLink(buttonLink)} className="mst-btn">
          <span>{buttonText}</span>
          <span className="mst-btn-arrow">→</span>
        </Link>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. MAKEUP PRODUCT GRID
   Products with rounded images, white card backgrounds, hover
   actions, "Add to cart" on hover, category + price.
   ═══════════════════════════════════════════════════════════════ */

export interface MakeupProductGridProps {
  products?: MakeupProduct[];
  columns?: number;
  showCategory?: boolean;
  showHoverImage?: boolean;
  sectionTitle?: { title: string; buttonText?: string; buttonLink?: string };
  marginBottom?: string;
  maxProducts?: number;
  filter?: "featured" | "bestseller" | "new-arrival" | "sale" | "all";
  filterTag?: string;
}

export function MakeupProductGrid({ products: propProducts, columns = 4, showCategory = true, showHoverImage = true, sectionTitle, marginBottom = "80px", maxProducts = 8, filter, filterTag }: MakeupProductGridProps) {
  const storeCtx = useContext(MakeupStoreContext);
  const [, setCompareState] = useState(false);

  const products: MakeupProduct[] = (() => {
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
      badge: p.compareAtPrice ? "SALE" : undefined,
    }));
  })();

  const scopedCss = `
    .mpg-section { margin-bottom: ${marginBottom}; }
    .mpg-grid {
      display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px;
    }
    .mpg-card { position: relative; background: #fff; border-radius: ${TOKENS.borderRadius}; overflow: hidden; padding: 10px; }
    .mpg-thumb { position: relative; overflow: hidden; margin-bottom: 12px; border-radius: 8px; }
    .mpg-img { width: 100%; height: auto; display: block; transition: opacity 0.5s ease; }
    .mpg-hover-img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      opacity: 0; transition: opacity 0.5s ease;
    }
    .mpg-card:hover .mpg-hover-img { opacity: 1; }
    .mpg-card:hover .mpg-main-img { opacity: 0; }
    .mpg-actions {
      position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column;
      gap: 5px; opacity: 0; transform: translateX(10px); transition: all 0.3s ease; z-index: 3;
    }
    .mpg-card:hover .mpg-actions { opacity: 1; transform: translateX(0); }
    .mpg-action-btn {
      width: 35px; height: 35px; border-radius: 50%; background: #fff;
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: background 0.2s; font-size: 14px;
    }
    .mpg-action-btn:hover { background: ${TOKENS.primaryColor}; color: #fff; }
    .mpg-name {
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 4px; line-height: 1.4;
    }
    .mpg-name a { color: inherit; text-decoration: none; transition: color 0.2s; }
    .mpg-name a:hover { color: ${TOKENS.primaryColor}; }
    .mpg-cat {
      font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor};
      margin-bottom: 6px;
    }
    .mpg-cat a { color: inherit; text-decoration: none; }
    .mpg-price {
      font-weight: 600; font-size: 14px; font-family: ${TOKENS.bodyFont};
      color: ${TOKENS.titleColor};
    }
    .mpg-price-old {
      text-decoration: line-through; color: #999; font-weight: 400;
      margin-right: 8px; font-size: 13px;
    }
    .mpg-price-sale { color: #c00; }
    .mpg-badge {
      position: absolute; top: 10px; left: 10px; background: #c00;
      color: #fff; font-size: 11px; font-weight: 600; text-transform: uppercase;
      padding: 3px 10px; border-radius: 4px; z-index: 3;
    }
    .mpg-add-btn {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: ${TOKENS.primaryColor}; color: #fff; border: none;
      padding: 10px; text-transform: none; font-weight: 600; font-size: 13px;
      font-family: ${TOKENS.bodyFont}; cursor: pointer; opacity: 0;
      transform: translateY(100%); transition: all 0.3s ease; border-radius: 0 0 8px 8px;
    }
    .mpg-card:hover .mpg-add-btn { opacity: 1; transform: translateY(0); }
    @media (max-width: 1024px) { .mpg-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .mpg-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
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
      <div className="mpg-section" style={containerStyle}>
        <ScopedStyles id="product-grid" css={scopedCss} />
        {sectionTitle && <MakeupSectionTitle title={sectionTitle.title} buttonText={sectionTitle.buttonText} buttonLink={sectionTitle.buttonLink} />}
        <div style={{ textAlign: "center", padding: "40px 20px", color: TOKENS.textColor, fontFamily: TOKENS.bodyFont }}>
          <p>No products yet. Add products from your dashboard to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mpg-section" style={containerStyle}>
      <ScopedStyles id="product-grid" css={scopedCss} />
      {sectionTitle && <MakeupSectionTitle title={sectionTitle.title} buttonText={sectionTitle.buttonText} buttonLink={sectionTitle.buttonLink} />}
      <div className="mpg-grid">
        {products.map((p) => {
          const productLink = resolveLink(p.link, p.name);
          return (
            <div key={p.id} className="mpg-card">
              <div className="mpg-thumb">
                <Link href={productLink}>
                  <img src={p.image || safeSrc(null, p.name)} alt={p.name} className="mpg-img mpg-main-img" loading="lazy" onError={(e) => onImgError(e, p.name)} />
                  {showHoverImage && p.hoverImage && (
                    <img src={p.hoverImage} alt={p.name} className="mpg-hover-img" loading="lazy"  onError={(e) => onImgError(e, p.name)} />
                  )}
                </Link>
                {p.badge && <span className="mpg-badge">{p.badge}</span>}
                <div className="mpg-actions">
                  <button className="mpg-action-btn" title="Compare" aria-label="Compare" onClick={() => { toggleCompareItem({ id: String(p.id), name: p.name, slug: (p as any).slug || p.name, price: p.price, image: p.image }, storeCtx?.storeSlug); setCompareState(prev => !prev); }}>⇌</button>
                  <button className="mpg-action-btn" title="Quick view" aria-label="Quick view" onClick={() => storeCtx?.onQuickView?.(String(p.id))}>👁</button>
                  <button className="mpg-action-btn" title="Wishlist" aria-label="Wishlist" onClick={() => storeCtx?.toggleWishlist?.(String(p.id))} style={storeCtx?.isWishlisted?.(String(p.id)) ? { color: "red" } : undefined}>{storeCtx?.isWishlisted?.(String(p.id)) ? "♥" : "♡"}</button>
                </div>
                <button className="mpg-add-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
              </div>
              <h3 className="mpg-name"><Link href={productLink}>{p.name}</Link></h3>
              {showCategory && p.category && (
                <div className="mpg-cat"><Link href={resolveStoreLink(p.categoryLink || "#", storeCtx?.storeSlug)}>{p.category}</Link></div>
              )}
              <div className="mpg-price">
                {p.salePrice && <span className="mpg-price-old">{p.price}</span>}
                <span className={p.salePrice ? "mpg-price-sale" : ""}>{p.salePrice || p.price}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. MAKEUP PRODUCT TYPE CARDS
   5 banner-style cards showing product categories with images.
   Each card: rounded image, category name overlaid at bottom.
   ═══════════════════════════════════════════════════════════════ */

export interface MakeupProductTypeCard {
  name: string;
  image: string;
  link: string;
  productCount?: number;
}

export interface MakeupProductTypeCardsProps {
  cards: MakeupProductTypeCard[];
  sectionTitle?: { title: string; buttonText?: string; buttonLink?: string };
  marginBottom?: string;
}

export function MakeupProductTypeCards({ cards, sectionTitle, marginBottom = "80px" }: MakeupProductTypeCardsProps) {
  const storeCtx = useContext(MakeupStoreContext);
  const fixLink = (link: string, name: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `/store/${storeCtx.storeSlug}/shop?category=${slug}`;
    }
    return resolveStoreLink(link, storeCtx?.storeSlug);
  };

  const scopedCss = `
    .mpt-section { margin-bottom: ${marginBottom}; }
    .mpt-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; }
    .mpt-card { position: relative; overflow: hidden; border-radius: ${TOKENS.borderRadius}; cursor: pointer; }
    .mpt-img {
      width: 100%; height: auto; display: block; aspect-ratio: 474/330;
      object-fit: cover; transition: transform 0.6s ease;
    }
    .mpt-card:hover .mpt-img { transform: scale(1.05); }
    .mpt-overlay {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 15px; z-index: 2;
      background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%);
      border-radius: 0 0 ${TOKENS.borderRadius} ${TOKENS.borderRadius};
    }
    .mpt-name {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 16px;
      color: #fff; margin: 0;
    }
    .mpt-count {
      font-family: ${TOKENS.bodyFont}; font-size: 12px; color: rgba(255,255,255,0.8);
    }
    .mpt-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { .mpt-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .mpt-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  `;

  return (
    <div className="mpt-section" style={containerStyle}>
      <ScopedStyles id="product-types" css={scopedCss} />
      {sectionTitle && <MakeupSectionTitle title={sectionTitle.title} buttonText={sectionTitle.buttonText} buttonLink={sectionTitle.buttonLink} />}
      <div className="mpt-grid">
        {cards.map((c, i) => (
          <div key={i} className="mpt-card">
            <img src={c.image} alt={c.name} className="mpt-img" loading="lazy"  onError={(e) => onImgError(e, c.name)} />
            <div className="mpt-overlay">
              <h3 className="mpt-name">{c.name}</h3>
              {c.productCount !== undefined && <span className="mpt-count">{c.productCount} products</span>}
            </div>
            <Link href={fixLink(c.link, c.name)} className="mpt-link" aria-label={c.name} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. MAKEUP BEFORE/AFTER COMPARISON
   "Enough With Acne Ruling Your Life" + draggable before/after
   slider comparing two images, with CTA.
   ═══════════════════════════════════════════════════════════════ */

export interface MakeupBeforeAfterProps {
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  buttonText?: string;
  buttonLink?: string;
  badgeText?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  marginBottom?: string;
}

export function MakeupBeforeAfter({ title, description, beforeImage, afterImage, buttonText = "Shop Now", buttonLink, badgeText, backgroundColor = "#bedbe1", backgroundImage, marginBottom = "80px" }: MakeupBeforeAfterProps) {
  const storeCtx = useContext(MakeupStoreContext);
  const fixLink = (link?: string) => resolveStoreLink(link || "#", storeCtx?.storeSlug);
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, x)));
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onUp = () => { isDragging.current = false; };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onUp);
    };
  }, [handleMove]);

  const scopedCss = `
    .mba-section {
      margin-bottom: ${marginBottom}; border-radius: ${TOKENS.borderRadius};
      overflow: hidden; padding: 20px;
      background-size: 280px; background-repeat: no-repeat; background-position: 620px 25px;
    }
    .mba-grid { display: flex; align-items: center; gap: 40px; }
    .mba-content { flex: 0 0 55%; padding: 20px; }
    .mba-compare { flex: 1; }
    .mba-badge {
      display: inline-block; padding: 4px 15px; background: ${TOKENS.primaryColor};
      color: #fff; border-radius: 15px; font-family: ${TOKENS.bodyFont};
      font-size: 13px; font-weight: 600; margin-bottom: 15px;
    }
    .mba-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 46px;
      color: ${TOKENS.titleColor}; line-height: 1.2; margin: 0 0 15px;
      max-width: 429px;
    }
    .mba-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor};
      line-height: 1.6; margin: 0 0 25px; max-width: 553px;
    }
    .mba-btn {
      display: inline-block; padding: 14px 32px;
      background: ${TOKENS.primaryColor}; color: #fff;
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px;
      text-decoration: none; border-radius: 25px; transition: background 0.3s;
    }
    .mba-btn:hover { filter: brightness(0.9); }
    .mba-compare-wrap {
      position: relative; overflow: hidden; border-radius: ${TOKENS.borderRadius};
      cursor: ew-resize; user-select: none; aspect-ratio: 820/500;
    }
    .mba-after-img, .mba-before-img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    }
    .mba-before-wrap {
      position: absolute; top: 0; left: 0; bottom: 0; overflow: hidden; z-index: 2;
    }
    .mba-handle {
      position: absolute; top: 0; bottom: 0; width: 3px;
      background: #fff; z-index: 3; cursor: ew-resize;
    }
    .mba-handle-circle {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 40px; height: 40px; border-radius: 50%; background: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2); display: flex; align-items: center;
      justify-content: center; font-size: 14px; color: #333;
    }
    @media (max-width: 1024px) {
      .mba-title { font-size: 32px; max-width: 100%; }
      .mba-section { background-size: 0; }
    }
    @media (max-width: 767px) {
      .mba-grid { flex-direction: column; gap: 20px; }
      .mba-content { flex: none; width: 100%; padding: 0; }
      .mba-title { font-size: 22px; }
    }
  `;

  return (
    <div className="mba-section" style={{ backgroundColor, backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }} >
      <ScopedStyles id="before-after" css={scopedCss} />
      <div className="mba-grid" style={containerStyle}>
        <div className="mba-content">
          {badgeText && <span className="mba-badge">{badgeText}</span>}
          <h2 className="mba-title">{title}</h2>
          <p className="mba-desc">{description}</p>
          <Link href={fixLink(buttonLink)} className="mba-btn">{buttonText}</Link>
        </div>
        <div className="mba-compare">
          <div className="mba-compare-wrap" ref={containerRef}
            onMouseDown={() => { isDragging.current = true; }}
            onTouchStart={() => { isDragging.current = true; }}
          >
            <img src={afterImage} alt="After" className="mba-after-img"  onError={(e) => onImgError(e, "fallback")} />
            <div className="mba-before-wrap" style={{ width: `${position}%` }}>
              <img src={beforeImage} alt="Before" className="mba-before-img"  onError={(e) => onImgError(e, "fallback")} />
            </div>
            <div className="mba-handle" style={{ left: `${position}%` }}>
              <div className="mba-handle-circle">⟷</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. MAKEUP PROMO BANNER CARDS
   3 product promo cards with colored backgrounds, product name,
   description, and background images. Each has unique accent color.
   ═══════════════════════════════════════════════════════════════ */

export interface MakeupPromoBannerCard {
  title: string;
  description: string;
  backgroundImage: string;
  titleColor: string;
  descColor: string;
  link: string;
}

export interface MakeupPromoBannerCardsProps {
  cards: MakeupPromoBannerCard[];
  marginBottom?: string;
}

export function MakeupPromoBannerCards({ cards, marginBottom = "80px" }: MakeupPromoBannerCardsProps) {
  const storeCtx = useContext(MakeupStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const scopedCss = `
    .mpb-section { margin-bottom: ${marginBottom}; }
    .mpb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .mpb-card {
      position: relative; overflow: hidden; border-radius: ${TOKENS.borderRadius};
      cursor: pointer; aspect-ratio: 540/640;
      background-size: cover; background-position: center;
      display: flex; align-items: flex-end; justify-content: center;
      padding: 30px; text-align: center;
    }
    .mpb-card:hover { opacity: 0.95; }
    .mpb-content { position: relative; z-index: 2; max-width: 270px; }
    .mpb-title {
      font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px;
      margin: 0 0 10px; line-height: 1.2;
    }
    .mpb-desc {
      font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.5;
    }
    .mpb-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) {
      .mpb-title { font-size: 24px; }
    }
    @media (max-width: 767px) {
      .mpb-grid { grid-template-columns: 1fr; }
      .mpb-title { font-size: 22px; }
    }
  `;

  return (
    <div className="mpb-section" style={containerStyle}>
      <ScopedStyles id="promo-banners" css={scopedCss} />
      <div className="mpb-grid">
        {cards.map((card, i) => (
          <div key={i} className="mpb-card" style={{ backgroundImage: `url(${card.backgroundImage})` }}>
            <div className="mpb-content">
              <h3 className="mpb-title" style={{ color: card.titleColor }}>{card.title}</h3>
              <p className="mpb-desc" style={{ color: card.descColor }}>{card.description}</p>
            </div>
            <Link href={fixLink(card.link)} className="mpb-link" aria-label={card.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. MAKEUP VIDEO BLOG
   "Latest Videos on Channel" + 3 video thumbnails with play
   button overlay, opens in lightbox/modal.
   ═══════════════════════════════════════════════════════════════ */

export interface MakeupVideoItem {
  thumbnail: string;
  videoUrl: string;
}

export interface MakeupVideoBlogProps {
  videos: MakeupVideoItem[];
  sectionTitle?: { title: string };
  marginBottom?: string;
}

export function MakeupVideoBlog({ videos, sectionTitle, marginBottom = "80px" }: MakeupVideoBlogProps) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const scopedCss = `
    .mvb-section { margin-bottom: ${marginBottom}; }
    .mvb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .mvb-item {
      position: relative; overflow: hidden; border-radius: ${TOKENS.borderRadius};
      cursor: pointer; aspect-ratio: 16/10;
    }
    .mvb-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.5s ease;
    }
    .mvb-item:hover .mvb-img { transform: scale(1.05); }
    .mvb-play {
      position: absolute; inset: 0; display: flex; align-items: center;
      justify-content: center; z-index: 2;
    }
    .mvb-play-btn {
      width: 62px; height: 62px; border-radius: 50%; background: rgba(255,255,255,0.9);
      display: flex; align-items: center; justify-content: center; font-size: 24px;
      color: ${TOKENS.titleColor}; border: none; cursor: pointer;
      transition: transform 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .mvb-item:hover .mvb-play-btn { transform: scale(1.1); }
    .mvb-modal {
      position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.85);
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .mvb-modal-close {
      position: absolute; top: 20px; right: 20px; background: none; border: none;
      color: #fff; font-size: 32px; cursor: pointer; z-index: 10;
    }
    .mvb-modal-content {
      width: 100%; max-width: 900px; aspect-ratio: 16/9; border-radius: ${TOKENS.borderRadius};
      overflow: hidden;
    }
    .mvb-modal-video { width: 100%; height: 100%; border: none; }
    @media (max-width: 767px) { .mvb-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <div className="mvb-section" style={containerStyle}>
      <ScopedStyles id="video-blog" css={scopedCss} />
      {sectionTitle && <MakeupSectionTitle title={sectionTitle.title} align="left" />}
      <div className="mvb-grid">
        {videos.map((v, i) => (
          <div key={i} className="mvb-item" onClick={() => setActiveVideo(v.videoUrl)}>
            <img src={v.thumbnail} alt={`Video ${i + 1}`} className="mvb-img" loading="lazy"  onError={(e) => onImgError(e, `Video ${i + 1}`)} />
            <div className="mvb-play">
              <button className="mvb-play-btn" aria-label="Play video">▶</button>
            </div>
          </div>
        ))}
      </div>
      {activeVideo && (
        <div className="mvb-modal" onClick={() => setActiveVideo(null)}>
          <button className="mvb-modal-close" onClick={() => setActiveVideo(null)} aria-label="Close">✕</button>
          <div className="mvb-modal-content" onClick={e => e.stopPropagation()}>
            <video className="mvb-modal-video" src={activeVideo} controls autoPlay />
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. MAKEUP BLOG POSTS
   Small design blog posts with thumbnail + title + date inline.
   ═══════════════════════════════════════════════════════════════ */

export interface MakeupBlogPost {
  image: string;
  title: string;
  date: string;
  commentCount?: number;
  link: string;
}

export interface MakeupBlogPostsProps {
  posts: MakeupBlogPost[];
  sectionTitle?: { title: string };
  marginBottom?: string;
}

export function MakeupBlogPosts({ posts: propPosts, sectionTitle, marginBottom = "80px" }: MakeupBlogPostsProps) {
  const storeCtx = useContext(MakeupStoreContext);

  const posts: MakeupBlogPost[] = (() => {
    if (!storeCtx || !storeCtx.blogs || storeCtx.blogs.length === 0) return propPosts || [];
    return storeCtx.blogs.slice(0, 4).map((b) => {
      const pubDate = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
      const formatted = pubDate.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
      return {
        image: b.coverImage || safeSrc(null, b.title),
        title: b.title,
        date: formatted,
        link: `/store/${storeCtx.storeSlug}/blog/${b.slug}`,
        commentCount: 0,
      };
    });
  })();

  const scopedCss = `
    .mblg-section { margin-bottom: ${marginBottom}; padding: 20px; background: #fff; border-radius: ${TOKENS.borderRadius}; }
    .mblg-item { display: flex; gap: 12px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
    .mblg-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .mblg-thumb { width: 127px; height: 90px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
    .mblg-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
    .mblg-title {
      font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px;
      color: ${TOKENS.entityTitleColor}; margin: 0 0 6px; line-height: 1.4;
    }
    .mblg-title a { color: inherit; text-decoration: none; }
    .mblg-title a:hover { color: ${TOKENS.primaryColor}; }
    .mblg-meta {
      font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor};
      display: flex; gap: 10px; align-items: center;
    }
  `;

  return (
    <div className="mblg-section">
      <ScopedStyles id="blog-posts" css={scopedCss} />
      {sectionTitle && <MakeupSectionTitle title={sectionTitle.title} align="left" marginBottom="15px" />}
      {posts.map((p, i) => (
        <div key={i} className="mblg-item">
          {p.image && <img src={p.image} alt={p.title} className="mblg-thumb" loading="lazy"  onError={(e) => onImgError(e, p.title)} />}
          <div className="mblg-content">
            <h3 className="mblg-title"><Link href={p.link}>{p.title}</Link></h3>
            <div className="mblg-meta">
              <span>{p.date}</span>
              {p.commentCount !== undefined && <span>💬 {p.commentCount}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. MAKEUP BRANDS CAROUSEL
   Row of brand logos with white background cards, auto-scrolling.
   ═══════════════════════════════════════════════════════════════ */

export interface MakeupBrand {
  name: string;
  logo: string;
  link: string;
}

export interface MakeupBrandsCarouselProps {
  brands: MakeupBrand[];
  marginBottom?: string;
}

export function MakeupBrandsCarousel({ brands, marginBottom = "80px" }: MakeupBrandsCarouselProps) {
  const storeCtx = useContext(MakeupStoreContext);
  const scopedCss = `
    .mbr-section { margin-bottom: ${marginBottom}; overflow: hidden; }
    .mbr-track {
      display: flex; gap: 20px; align-items: center;
      animation: mbrScroll 30s linear infinite;
    }
    .mbr-item {
      flex-shrink: 0; background: #fefefe; border-radius: ${TOKENS.borderRadius};
      padding: 15px 25px; display: flex; align-items: center; justify-content: center;
      min-width: 160px; height: 80px;
    }
    .mbr-logo { max-height: 50px; max-width: 140px; object-fit: contain; }
    .mbr-link { display: block; }
    @keyframes mbrScroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    .mbr-section:hover .mbr-track { animation-play-state: paused; }
  `;

  return (
    <div className="mbr-section" style={containerStyle}>
      <ScopedStyles id="brands" css={scopedCss} />
      <div className="mbr-track">
        {[...brands, ...brands].map((b, i) => (
          <div key={i} className="mbr-item">
            <Link href={resolveStoreLink(b.link, storeCtx?.storeSlug)} className="mbr-link" title={b.name}>
              <img src={b.logo} alt={b.name} className="mbr-logo" loading="lazy"  onError={(e) => onImgError(e, b.name)} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */

export function MakeupFooter(props: React.ComponentProps<typeof FashionFooter>) {
  const storeCtx = useContext(MakeupStoreContext);
  return <FashionFooter {...props} storeSlug={storeCtx?.storeSlug} />;
}
