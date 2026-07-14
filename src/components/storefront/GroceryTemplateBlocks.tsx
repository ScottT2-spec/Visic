"use client";
import { FashionFooter } from "./FashionTemplateBlocks";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";

/* ═══════════════════════════════════════════════════════════════
   FOOD GROCERY TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Food Market template sections.
   All styling inline — no external CSS dependencies.
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
  footerBg: "var(--color-background)",
  bgWhite: "#ffffff",
  containerWidth: "1222px",
  borderRadius: "0px",
  titleFont: "'Yantramanav', Arial, Helvetica, sans-serif",
  bodyFont: "'Inter', Arial, Helvetica, sans-serif",
  altFont: "'Lato', Arial, Helvetica, sans-serif",
};

const IMG = "https://woodmart.xtemos.com/wp-content/uploads";

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function GroceryFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Yantramanav:wght@400;500;700&family=Lato:wght@400;700&display=swap');
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
  return <style data-grocery-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
}

/* ═══════════════════════════════════════════════════════════════
   STORE CONTEXT
   ═══════════════════════════════════════════════════════════════ */

export interface GroceryProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  comparePrice?: string;
  image: string;
  hoverImage?: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  unit?: string;
  tags?: string[];
}

export interface GroceryStoreContextData {
  storeSlug?: string;
  products?: GroceryProduct[];
  storeName?: string;
  storeLogo?: string;
  announcement?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialLinks?: { platform: string; url: string }[];
  footerLinks?: { title: string; links: { label: string; href: string }[] }[];
  addToCart?: (productId: string, quantity?: number) => void;
  toggleWishlist?: (productId: string) => void;
  isWishlisted?: (productId: string) => boolean;
  onQuickView?: (productId: string) => void;
}

export const GroceryStoreContext = createContext<GroceryStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */

export interface GroceryHeroSlide {
  label?: string;
  titleLine1: string;
  titleLine2: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  productImage: string;
  backgroundImage?: string;
}

export interface GroceryHeroSliderProps {
  slides?: GroceryHeroSlide[];
  autoplaySpeed?: number;
}

export function GroceryHeroSlider({ slides, autoplaySpeed = 5000 }: GroceryHeroSliderProps) {
  const storeCtx = useContext(GroceryStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const defaultSlides: GroceryHeroSlide[] = [
    {
      label: "WEEKLY DISCOUNTS",
      titleLine1: "-30% Discount",
      titleLine2: "Products On Barilla",
      description: "A flavour for everyone. Freshly made, delivered to your door.",
      buttonText: "Shop Now",
      buttonLink: "#",
      backgroundColor: "rgb(42,103,150)",
      productImage: `${IMG}/2021/06/wood-food-market-slider-1-opt.png`,
      backgroundImage: `${IMG}/2020/06/wood-food-market-slider-bg-1-opt-1.jpg`,
    },
    {
      label: "SPECIAL OFFER",
      titleLine1: "Korean Style",
      titleLine2: "Barbecue Sauce",
      description: "Best organic and natural grocery products at your doorstep.",
      buttonText: "Shop Now",
      buttonLink: "#",
      backgroundColor: "rgb(161,37,37)",
      productImage: `${IMG}/2022/06/wood-food-market-slider-2-344x394.png`,
      backgroundImage: `${IMG}/2022/06/wood-food-market-slider-bg-3.jpg`,
    },
    {
      label: "FRESH & NATURAL",
      titleLine1: "Best Juice Is",
      titleLine2: "For Drink For You",
      description: "Organic fresh fruits and vegetables straight from the farm.",
      buttonText: "Shop Now",
      buttonLink: "#",
      backgroundColor: "rgb(245,153,70)",
      productImage: `${IMG}/2021/06/wood-food-market-slider-3-opt.png`,
      backgroundImage: `${IMG}/2020/06/wood-food-market-slider-bg-3-opt.jpg`,
    },
  ];

  const items = slides || defaultSlides;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % items.length), autoplaySpeed);
    return () => clearInterval(t);
  }, [items.length, autoplaySpeed]);

  const css = `
    .gc-slider { position: relative; width: 100%; min-height: 580px; overflow: hidden; }
    .gc-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .gc-slide.gc-active { opacity: 1; position: relative; }
    .gc-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; }
    .gc-slide-inner { position: relative; z-index: 2; width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 0 0 16%; }
    .gc-slide-text { flex: 1; }
    .gc-slide-label { font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 14px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
    .gc-slide-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 50px; line-height: 60px; color: #fff; margin: 0 0 15px; }
    .gc-slide-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 24px; color: rgba(255,255,255,0.8); margin: 0 0 25px; max-width: 380px; }
    .gc-slide-btn { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; border: none; cursor: pointer; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.15); }
    .gc-slide-btn:hover { filter: brightness(0.9); }
    .gc-slide-img { flex: 0 0 auto; max-width: 400px; }
    .gc-slide-img img { max-width: 100%; height: auto; }
    .gc-dots { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 5; }
    .gc-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.6); background: transparent; cursor: pointer; padding: 0; transition: all 0.3s; }
    .gc-dot.gc-active { background: #fff; border-color: #fff; }
    @media (max-width: 1199px) { .gc-slide-title { font-size: 36px; line-height: 46px; } }
    @media (max-width: 767px) { .gc-slide-title { font-size: 32px; line-height: 42px; } .gc-slide-img { display: none; } .gc-slider { min-height: 400px; } .gc-slide-inner { padding: 0 20px; } }
  `;

  return (
    <div className="gc-slider">
      <ScopedStyles id="hero-slider" css={css} />
      {items.map((slide, i) => (
        <div key={i} className={`gc-slide ${i === current ? "gc-active" : ""}`}>
          <div className="gc-slide-bg" style={{ backgroundColor: slide.backgroundColor, backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined }} />
          <div className="gc-slide-inner">
            <div className="gc-slide-text">
              {slide.label && <div className="gc-slide-label">{slide.label}</div>}
              <h2 className="gc-slide-title">{slide.titleLine1}<br />{slide.titleLine2}</h2>
              {slide.description && <p className="gc-slide-desc">{slide.description}</p>}
              <Link href={fixLink(slide.buttonLink)} className="gc-slide-btn">{slide.buttonText}</Link>
            </div>
            <div className="gc-slide-img">
              <img src={slide.productImage} alt={slide.titleLine1}  onError={(e) => onImgError(e, slide.titleLine1)} />
            </div>
          </div>
        </div>
      ))}
      {items.length > 1 && (
        <div className="gc-dots">
          {items.map((_, i) => (
            <button key={i} className={`gc-dot ${i === current ? "gc-active" : ""}`} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. FEATURES BAR (Best Quality, Online Payment, Fast Delivery)
   ═══════════════════════════════════════════════════════════════ */

export interface GroceryFeatureItem {
  icon: string;
  title: string;
  description?: string;
}

export interface GroceryFeaturesBarProps {
  features?: GroceryFeatureItem[];
}

export function GroceryFeaturesBar({ features }: GroceryFeaturesBarProps) {
  const defaultFeatures: GroceryFeatureItem[] = [
    { icon: `${IMG}/2020/06/svg-wood-food-market-1.svg`, title: "Best Quality", description: "Best quality products for you" },
    { icon: `${IMG}/2020/06/svg-wood-food-market-2.svg`, title: "Online Payment", description: "Secure online payment methods" },
    { icon: `${IMG}/2020/06/svg-wood-food-market-3.svg`, title: "Fast Delivery", description: "Fast delivery to your door" },
  ];

  const items = features || defaultFeatures;

  const css = `
    .gc-features { background: #fff; padding: 40px 0; border-bottom: 1px solid #e6e6e6; }
    .gc-features-grid { display: grid; grid-template-columns: repeat(${items.length}, 1fr); gap: 0; }
    .gc-feature { display: flex; align-items: center; gap: 15px; padding: 0 35px; border-right: 1px solid #e6e6e6; }
    .gc-feature:last-child { border-right: none; }
    .gc-feature-icon { width: 50px; height: 50px; flex-shrink: 0; }
    .gc-feature-icon img { width: 100%; height: 100%; }
    .gc-feature-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; color: ${TOKENS.titleColor}; margin: 0 0 2px; }
    .gc-feature-desc { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; margin: 0; }
    @media (max-width: 767px) { .gc-features-grid { grid-template-columns: 1fr; gap: 20px; } .gc-feature { border-right: none; border-bottom: 1px solid #e6e6e6; padding-bottom: 20px; } .gc-feature:last-child { border-bottom: none; } }
  `;

  return (
    <div className="gc-features">
      <ScopedStyles id="features" css={css} />
      <div style={containerStyle}>
        <div className="gc-features-grid">
          {items.map((f, i) => (
            <div key={i} className="gc-feature">
              <div className="gc-feature-icon"><img src={f.icon} alt={f.title}  onError={(e) => onImgError(e, f.title)} /></div>
              <div>
                <h4 className="gc-feature-title">{f.title}</h4>
                {f.description && <p className="gc-feature-desc">{f.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface GrocerySectionTitleProps {
  subtitle?: string;
  title: string;
  align?: "left" | "center" | "right";
  after?: React.ReactNode;
}

export function GrocerySectionTitle({ subtitle, title, align = "center", after }: GrocerySectionTitleProps) {
  return (
    <div style={{ ...containerStyle, textAlign: align, marginBottom: "30px" }}>
      {subtitle && <div style={{ fontFamily: TOKENS.bodyFont, fontSize: "14px", fontWeight: 500, color: TOKENS.primaryColor, textTransform: "uppercase" as const, letterSpacing: "2px", marginBottom: "5px" }}>{subtitle}</div>}
      <h4 style={{ fontFamily: TOKENS.titleFont, fontWeight: 500, fontSize: "30px", lineHeight: "1.3", color: TOKENS.titleColor, margin: "0 0 5px", textTransform: "uppercase" as const }}>{title}</h4>
      {after}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */

export interface GroceryProductGridProps {
  products?: GroceryProduct[];
  columns?: number;
  sectionTitle?: string;
  sectionSubtitle?: string;
  marginBottom?: string;
  maxProducts?: number;
  tabs?: string[];
}

export function GroceryProductGrid({
  products: propProducts,
  columns = 5,
  sectionTitle,
  sectionSubtitle,
  marginBottom = "60px",
  maxProducts = 10,
  tabs,
}: GroceryProductGridProps) {
  const storeCtx = useContext(GroceryStoreContext);
  const fixLink = (slug: string) => {
    if (storeCtx?.storeSlug) return `/store/${storeCtx.storeSlug}/product/${slug}`;
    return `#`;
  };

  const defaultTabs = tabs || ["New", "Featured", "Top sellers"];
  const [activeTab, setActiveTab] = useState(0);

  const defaultProducts: GroceryProduct[] = [
    { id: 1, name: "Fusilli Pasta", slug: "fusilli-pasta", price: "139.99", image: `${IMG}/2020/06/w-food-market-product-1-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 2, name: "Hot Sopressata", slug: "hot-sopressata", price: "115.00", image: `${IMG}/2020/06/w-food-market-product-2-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 3, name: "Dallmayr Prodomo", slug: "dallmayr-prodomo", price: "223.00", image: `${IMG}/2020/06/w-food-market-product-3-opt-430x484.jpg`, category: "Grocery", rating: 4 },
    { id: 4, name: "Sfizioso", slug: "sfizioso", price: "148.00", image: `${IMG}/2020/06/w-food-market-product-4-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 5, name: "Filetto di Pomidoro", slug: "filetto-di-pomidoro", price: "199.99", image: `${IMG}/2020/06/w-food-market-product-5-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 6, name: "Bombay Sapphire", slug: "bombay-sapphire", price: "248.00", image: `${IMG}/2020/06/w-food-market-product-6-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 7, name: "Barilla Penne Rigate", slug: "barilla-penne-rigate", price: "156.00", image: `${IMG}/2020/06/w-food-market-product-8-opt-430x484.jpg`, category: "Grocery", rating: 4 },
    { id: 8, name: "Milk Chocolate", slug: "milk-chocolate", price: "118.00", image: `${IMG}/2020/06/w-food-market-product-9-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 9, name: "Chili Powder", slug: "chili-powder", price: "123.00", image: `${IMG}/2020/06/w-food-market-product-10-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 10, name: "Coffee Mate", slug: "coffee-mate", price: "116.00", image: `${IMG}/2020/06/w-food-market-product-12-opt-430x484.jpg`, category: "Grocery", rating: 5 },
  ];

  const items = (propProducts || storeCtx?.products || defaultProducts).slice(0, maxProducts);

  const css = `
    .gc-products { margin-bottom: ${marginBottom}; }
    .gc-tabs { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; }
    .gc-tab { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; color: ${TOKENS.textColor}; background: none; border: none; cursor: pointer; padding: 5px 15px; border-bottom: 2px solid transparent; transition: all 0.3s; text-transform: uppercase; }
    .gc-tab.gc-active { color: ${TOKENS.primaryColor}; border-bottom-color: ${TOKENS.primaryColor}; }
    .gc-tab:hover { color: ${TOKENS.primaryColor}; }
    .gc-prod-grid { display: grid; gap: 20px; }
    .gc-prod { background: #fff; border: 1px solid #eee; overflow: hidden; transition: box-shadow 0.3s; position: relative; text-align: center; }
    .gc-prod:hover { box-shadow: 0 5px 20px rgba(0,0,0,0.08); }
    .gc-prod-img-wrap { position: relative; overflow: hidden; background: #f9f9f9; }
    .gc-prod-img { width: 100%; height: auto; display: block; transition: transform 0.5s; }
    .gc-prod:hover .gc-prod-img { transform: scale(1.05); }
    .gc-prod-info { padding: 12px 15px 20px; }
    .gc-prod-cat { font-family: ${TOKENS.bodyFont}; font-size: 11px; color: ${TOKENS.textColor}; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
    .gc-prod-name { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 15px; color: ${TOKENS.entityTitleColor}; margin: 0 0 6px; line-height: 1.3; }
    .gc-prod-name a { color: inherit; text-decoration: none; }
    .gc-prod-name a:hover { color: rgba(51,51,51,0.65); }
    .gc-prod-price { font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 15px; color: ${TOKENS.primaryColor}; }
    .gc-prod-price del { color: ${TOKENS.textColor}; font-weight: 400; font-size: 13px; margin-right: 5px; }
    .gc-prod-stars { color: ${TOKENS.starColor}; font-size: 11px; letter-spacing: 1px; margin-bottom: 4px; }
    .gc-prod-btn { display: inline-block; margin-top: 8px; padding: 7px 18px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 11px; text-decoration: none; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.3s; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.15); }
    .gc-prod-btn:hover { filter: brightness(0.9); }
    .gc-prod-badge { position: absolute; top: 10px; left: 10px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 11px; font-weight: 600; padding: 3px 10px; text-transform: uppercase; z-index: 2; }
    @media (max-width: 1024px) { .gc-prod-grid { grid-template-columns: repeat(3, 1fr) !important; } }
    @media (max-width: 767px) { .gc-prod-grid { grid-template-columns: repeat(2, 1fr) !important; } }
  `;

  return (
    <div className="gc-products">
      <ScopedStyles id="products" css={css} />
      <div style={containerStyle}>
        {sectionTitle && <GrocerySectionTitle subtitle={sectionSubtitle} title={sectionTitle} />}
        {defaultTabs.length > 0 && (
          <div className="gc-tabs">
            {defaultTabs.map((tab, i) => (
              <button key={i} className={`gc-tab ${i === activeTab ? "gc-active" : ""}`} onClick={() => setActiveTab(i)}>{tab}</button>
            ))}
          </div>
        )}
        <div className="gc-prod-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((p) => (
            <div key={p.id} className="gc-prod">
              {p.badge && <span className="gc-prod-badge">{p.badge}</span>}
              <div className="gc-prod-img-wrap">
                <img className="gc-prod-img" src={p.image || safeSrc(null, p.name)} alt={p.name} onError={(e) => onImgError(e, p.name)} />
              </div>
              <div className="gc-prod-info">
                <div className="gc-prod-cat">{p.category}</div>
                <h3 className="gc-prod-name"><Link href={fixLink(p.slug)}>{p.name}</Link></h3>
                <div className="gc-prod-stars">{"★".repeat(p.rating || 5)}{"☆".repeat(5 - (p.rating || 5))}</div>
                <div className="gc-prod-price">
                  {p.comparePrice && <del>${p.comparePrice}</del>}
                  ${p.price}
                </div>
                <button className="gc-prod-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. PROMO BANNERS (Roar Ice Cream / Organic Rice)
   ═══════════════════════════════════════════════════════════════ */

export interface GroceryPromoBanner {
  subtitle: string;
  title: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface GroceryPromoBannersProps {
  banners?: GroceryPromoBanner[];
}

export function GroceryPromoBanners({ banners }: GroceryPromoBannersProps) {
  const storeCtx = useContext(GroceryStoreContext);
  const defaultBanners: GroceryPromoBanner[] = [
    { subtitle: "NEW PRODUCTS", title: "Roar Ice Cream", image: `${IMG}/2020/06/wood-food-market-ban-1-opt.jpg`, buttonText: "Shop Now" },
    { subtitle: "VEGAN FOOD", title: "Organic Rice", image: `${IMG}/2020/06/wood-food-market-ban-2-opt.jpg`, buttonText: "Shop Now" },
  ];

  const items = banners || defaultBanners;

  const css = `
    .gc-banners { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 60px; }
    .gc-banner { position: relative; overflow: hidden; cursor: pointer; min-height: 280px; }
    .gc-banner-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s; position: absolute; inset: 0; }
    .gc-banner:hover .gc-banner-img { transform: scale(1.05); }
    .gc-banner-content { position: relative; z-index: 2; padding: 40px; }
    .gc-banner-sub { font-family: ${TOKENS.bodyFont}; font-size: 12px; font-weight: 500; color: ${TOKENS.primaryColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .gc-banner-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 28px; color: ${TOKENS.titleColor}; margin: 0 0 15px; }
    .gc-banner-btn { display: inline-block; padding: 10px 25px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 500; font-size: 12px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.15); }
    .gc-banner-btn:hover { filter: brightness(0.9); }
    @media (max-width: 767px) { .gc-banners { grid-template-columns: 1fr; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="banners" css={css} />
      <div className="gc-banners">
        {items.map((b, i) => (
          <div key={i} className="gc-banner">
            <img className="gc-banner-img" src={b.image} alt={b.title}  onError={(e) => onImgError(e, b.title)} />
            <div className="gc-banner-content">
              <div className="gc-banner-sub">{b.subtitle}</div>
              <h4 className="gc-banner-title">{b.title}</h4>
              {b.buttonText && <Link href={resolveStoreLink(b.buttonLink, storeCtx?.storeSlug)} className="gc-banner-btn">{b.buttonText}</Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. CATEGORY GRID
   ═══════════════════════════════════════════════════════════════ */

export interface GroceryCategory {
  name: string;
  image: string;
  link?: string;
}

export interface GroceryCategoryGridProps {
  sectionTitle?: string;
  categories?: GroceryCategory[];
  columns?: number;
}

export function GroceryCategoryGrid({ sectionTitle = "POPULAR CATEGORIES", categories, columns = 4 }: GroceryCategoryGridProps) {
  const defaultCategories: GroceryCategory[] = [
    { name: "Fresh Food", image: `${IMG}/2020/06/wood-food-market-category-1.jpg` },
    { name: "Bakery", image: `${IMG}/2020/06/wood-food-market-category-2.jpg` },
    { name: "Frozen Food", image: `${IMG}/2020/06/wood-food-market-category-3.jpg` },
    { name: "Drinks", image: `${IMG}/2020/06/wood-food-market-category-4.jpg` },
  ];

  const items = categories || defaultCategories;

  const css = `
    .gc-cats-grid { display: grid; gap: 20px; margin-bottom: 60px; }
    .gc-cat { position: relative; overflow: hidden; border-radius: 0; cursor: pointer; }
    .gc-cat-img { width: 100%; height: 220px; object-fit: cover; display: block; transition: transform 0.5s; }
    .gc-cat:hover .gc-cat-img { transform: scale(1.05); }
    .gc-cat-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; }
    .gc-cat-name { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 22px; color: #fff; text-transform: uppercase; }
    @media (max-width: 767px) { .gc-cats-grid { grid-template-columns: repeat(2, 1fr) !important; } .gc-cat-img { height: 160px; } }
  `;

  return (
    <div style={containerStyle}>
      <GrocerySectionTitle title={sectionTitle} />
      <ScopedStyles id="cats" css={css} />
      <div className="gc-cats-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {items.map((cat, i) => (
          <div key={i} className="gc-cat">
            <img className="gc-cat-img" src={cat.image} alt={cat.name}  onError={(e) => onImgError(e, cat.name)} />
            <div className="gc-cat-overlay">
              <span className="gc-cat-name">{cat.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. NEWSLETTER SIGNUP
   ═══════════════════════════════════════════════════════════════ */

export interface GroceryNewsletterProps {
  title?: string;
  description?: string;
  buttonText?: string;
  backgroundColor?: string;
}

export function GroceryNewsletter({
  title = "HEY YOU, SIGN UP AND CONNECT TO WOODMART!",
  description = "Be the first to learn about our latest trends and get exclusive offers.",
  buttonText = "Sign up",
  backgroundColor = TOKENS.primaryColor,
}: GroceryNewsletterProps) {
  const [email, setEmail] = useState("");
  const storeCtx = useContext(GroceryStoreContext);
  const { subscribe, status: nlStatus } = useNewsletterSubscribe(storeCtx?.storeSlug || "");

  const css = `
    .gc-newsletter { padding: 50px 0; margin-bottom: 60px; }
    .gc-newsletter-inner { display: flex; align-items: center; justify-content: space-between; gap: 30px; flex-wrap: wrap; }
    .gc-newsletter-text { flex: 1; min-width: 300px; }
    .gc-newsletter-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 24px; color: #fff; margin: 0 0 5px; text-transform: uppercase; }
    .gc-newsletter-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: rgba(255,255,255,0.8); margin: 0; }
    .gc-newsletter-form { display: flex; gap: 0; flex: 1; max-width: 500px; }
    .gc-newsletter-input { flex: 1; padding: 14px 18px; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none; }
    .gc-newsletter-input::placeholder { color: rgba(255,255,255,0.6); }
    .gc-newsletter-btn { padding: 14px 30px; background: #fff; color: ${TOKENS.primaryColor}; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; border: none; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; transition: opacity 0.3s; }
    .gc-newsletter-btn:hover { opacity: 0.9; }
    .gc-newsletter-success { font-family: ${TOKENS.bodyFont}; font-size: 16px; color: #fff; }
    @media (max-width: 767px) { .gc-newsletter-inner { flex-direction: column; text-align: center; } .gc-newsletter-form { max-width: 100%; width: 100%; } }
  `;

  return (
    <div className="gc-newsletter" style={{ backgroundColor }}>
      <ScopedStyles id="newsletter" css={css} />
      <div style={containerStyle}>
        <div className="gc-newsletter-inner">
          <div className="gc-newsletter-text">
            <h4 className="gc-newsletter-title">{title}</h4>
            <p className="gc-newsletter-desc">{description}</p>
          </div>
          {nlStatus === "success" ? (
            <div className="gc-newsletter-success">✓ Thank you for subscribing!</div>
          ) : (
            <form className="gc-newsletter-form" onSubmit={(e) => { e.preventDefault(); subscribe(email).then(() => setEmail("")); }}>
              <input className="gc-newsletter-input" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required />
              <button className="gc-newsletter-btn" type="submit" disabled={nlStatus === "loading"}>{nlStatus === "loading" ? "Signing up..." : buttonText}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. SECOND PRODUCT ROW (Best Sellers)
   ═══════════════════════════════════════════════════════════════ */

export function GroceryBestSellers({ products: propProducts, columns = 5, maxProducts = 10 }: { products?: GroceryProduct[]; columns?: number; maxProducts?: number }) {
  const storeCtx = useContext(GroceryStoreContext);
  const fixLink = (slug: string) => {
    if (storeCtx?.storeSlug) return `/store/${storeCtx.storeSlug}/product/${slug}`;
    return `#`;
  };

  const defaultProducts: GroceryProduct[] = [
    { id: 11, name: "Tonno all'Olio di Oliva", slug: "tonno", price: "113.00", image: `${IMG}/2020/06/w-food-market-product-14-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 12, name: "Strolghino", slug: "strolghino", price: "160.95", image: `${IMG}/2020/06/w-food-market-product-17-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 13, name: "Filetto di Pomidoro", slug: "filetto-di-pomidoro-2", price: "199.99", image: `${IMG}/2020/06/w-food-market-product-5-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 14, name: "Milk Chocolate", slug: "milk-chocolate-2", price: "118.00", image: `${IMG}/2020/06/w-food-market-product-9-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 15, name: "Fusilli Pasta", slug: "fusilli-pasta-2", price: "139.99", image: `${IMG}/2020/06/w-food-market-product-1-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 16, name: "Tomato Sauce", slug: "tomato-sauce", price: "160.00", image: `${IMG}/2020/06/w-food-market-product-21-opt-430x484.jpg`, category: "Grocery", rating: 4 },
    { id: 17, name: "Dallmayr Prodomo", slug: "dallmayr-prodomo-2", price: "223.00", image: `${IMG}/2020/06/w-food-market-product-3-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 18, name: "Chili Powder", slug: "chili-powder-2", price: "123.00", image: `${IMG}/2020/06/w-food-market-product-10-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 19, name: "Hot Sopressata", slug: "hot-sopressata-2", price: "115.00", image: `${IMG}/2020/06/w-food-market-product-2-opt-430x484.jpg`, category: "Grocery", rating: 5 },
    { id: 20, name: "Coffee Mate", slug: "coffee-mate-2", price: "116.00", image: `${IMG}/2020/06/w-food-market-product-12-opt-430x484.jpg`, category: "Grocery", rating: 5 },
  ];

  const items = (propProducts || storeCtx?.products || defaultProducts).slice(0, maxProducts);

  return (
    <GroceryProductGrid
      products={items}
      columns={columns}
      sectionTitle="BEST SELLERS"
      tabs={["New", "Featured", "Top sellers"]}
      marginBottom="60px"
      maxProducts={maxProducts}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */

export function GroceryFooter(props: React.ComponentProps<typeof FashionFooter>) {
  const storeCtx = useContext(GroceryStoreContext);
  return <FashionFooter {...props} storeSlug={storeCtx?.storeSlug} />;
}
