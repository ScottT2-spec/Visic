"use client";
import { FashionFooter } from "./FashionTemplateBlocks";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";

/* ═══════════════════════════════════════════════════════════════
   HEALTH (PILLS & SUPPLEMENTS) TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Pills template sections.
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
  borderRadius: "15px",
  titleFont: "'Geologica', Arial, Helvetica, sans-serif",
  bodyFont: "'Cabin', Arial, Helvetica, sans-serif",
  altFont: "'Lato', Arial, Helvetica, sans-serif",
  bgLight: "#f7f7f7",
};

const IMG = "https://woodmart.xtemos.com/pills/wp-content/uploads/sites/15";

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function HealthFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Geologica:wght@500&family=Cabin:wght@400;600&family=Lato:wght@400&display=swap');
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
  return <style data-health-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
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
   STORE CONTEXT
   ═══════════════════════════════════════════════════════════════ */

export interface HealthProduct {
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
  tags?: string[];
}

export interface HealthStoreContextData {
  storeSlug?: string;
  products?: HealthProduct[];
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

export const HealthStoreContext = createContext<HealthStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. HEALTH HERO SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface HealthHeroProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
}

export function HealthHero({
  title = "Feel Healthy and Energetic With Our Vitamins",
  subtitle = "Our mission is to make you healthy and happy, for this we use only natural and high-quality ingredients necessary to achieve an extraordinary effect.",
  buttonText = "Shop Now",
  buttonLink = "#",
  backgroundImage = `${IMG}/2023/08/w-pas-first-screen.jpg`,
}: HealthHeroProps) {
  const storeCtx = useContext(HealthStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const css = `
    .hh-hero { position: relative; width: 100%; min-height: 660px; display: flex; align-items: center; overflow: hidden; background: ${TOKENS.bgLight}; }
    .hh-hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; }
    .hh-hero-content { position: relative; z-index: 2; max-width: 760px; }
    .hh-hero-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 58px; line-height: 68px; color: ${TOKENS.titleColor}; margin: 0 0 20px; }
    .hh-hero-sub { font-family: ${TOKENS.bodyFont}; font-size: 22px; line-height: 32px; color: ${TOKENS.textColor}; max-width: 780px; margin: 0 0 30px; }
    .hh-hero-btn { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 35px; text-transform: uppercase; letter-spacing: 0.5px; transition: background 0.3s; }
    .hh-hero-btn:hover { filter: brightness(0.9); }
    @media (max-width: 1024px) { .hh-hero { min-height: 500px; } .hh-hero-title { font-size: 42px; line-height: 52px; } .hh-hero-sub { font-size: 20px; line-height: 30px; } }
    @media (max-width: 767px) { .hh-hero { min-height: 400px; } .hh-hero-title { font-size: 32px; line-height: 42px; } .hh-hero-sub { font-size: 18px; line-height: 28px; } }
  `;

  return (
    <div className="hh-hero">
      <ScopedStyles id="hero" css={css} />
      <div className="hh-hero-bg" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div style={containerStyle}>
        <div className="hh-hero-content">
          <h1 className="hh-hero-title">{title}</h1>
          <p className="hh-hero-sub">{subtitle}</p>
          <Link href={fixLink(buttonLink)} className="hh-hero-btn">{buttonText}</Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. MARQUEE BANNER
   ═══════════════════════════════════════════════════════════════ */

export interface HealthMarqueeProps {
  items?: string[];
  speed?: number;
}

export function HealthMarquee({ items = ["Free Shipping from $30!", "Lots of vitamins and supplements"], speed = 10 }: HealthMarqueeProps) {
  const css = `
    .hh-marquee-wrap { overflow: hidden; padding: 12px 0; border-bottom: 1px solid #eee; }
    .hh-marquee { display: flex; animation: hhMarquee ${speed}s linear infinite; white-space: nowrap; }
    .hh-marquee-item { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.titleColor}; padding: 0 40px; flex-shrink: 0; display: flex; align-items: center; gap: 40px; }
    .hh-marquee-dot { width: 5px; height: 5px; border-radius: 50%; background: ${TOKENS.titleColor}; display: inline-block; }
    @keyframes hhMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  `;
  const doubled = [...items, ...items, ...items, ...items];
  return (
    <div className="hh-marquee-wrap">
      <ScopedStyles id="marquee" css={css} />
      <div className="hh-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="hh-marquee-item">
            <span className="hh-marquee-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. PROMO BANNERS
   ═══════════════════════════════════════════════════════════════ */

export interface HealthPromoBanner {
  image: string;
  subtitle?: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  colorScheme?: "light" | "dark";
  height?: string;
}

export interface HealthPromoBannersProps {
  banners?: HealthPromoBanner[];
}

export function HealthPromoBanners({ banners }: HealthPromoBannersProps) {
  const storeCtx = useContext(HealthStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const defaultBanners: HealthPromoBanner[] = [
    { image: `${IMG}/2024/03/w-pas-banner-1.jpg`, subtitle: "Save 15%", title: "Bundles", buttonText: "Shop by Need", buttonLink: "#", colorScheme: "light", height: "456px" },
    { image: `${IMG}/2024/03/w-pas-dropdown-banner-gummy.jpg`, title: "Sleep Easy Gummies", description: "Supports an optimal sleep cycle", buttonLink: "#", colorScheme: "dark", height: "200px" },
    { image: `${IMG}/2024/03/w-pas-dropdown-banner-capsule.jpg`, title: "Capsules for Skin", description: "Supports an optimal sleep cycle", buttonLink: "#", colorScheme: "dark", height: "200px" },
  ];

  const items = banners || defaultBanners;

  const css = `
    .hh-banners { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 50px; }
    .hh-banner { position: relative; border-radius: 10px; overflow: hidden; cursor: pointer; }
    .hh-banner:hover .hh-banner-img { transform: scale(1.05); }
    .hh-banner-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; display: block; }
    .hh-banner-content { position: absolute; padding: 25px; z-index: 2; }
    .hh-banner-subtitle { font-family: ${TOKENS.bodyFont}; font-size: 16px; margin-bottom: 5px; }
    .hh-banner-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 26px; margin: 0; }
    .hh-banner-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; margin-top: 5px; }
    .hh-banner-link { position: absolute; inset: 0; z-index: 3; }
    .hh-banner-left { grid-row: 1 / 3; }
    @media (max-width: 767px) { .hh-banners { grid-template-columns: 1fr; } .hh-banner-left { grid-row: auto; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="banners" css={css} />
      <div className="hh-banners">
        {items.map((b, i) => {
          const isLight = b.colorScheme === "light";
          const textColor = isLight ? "#fff" : "#000";
          return (
            <div key={i} className={`hh-banner ${i === 0 ? "hh-banner-left" : ""}`} style={{ height: i === 0 ? "auto" : b.height }}>
              <img className="hh-banner-img" src={b.image} alt={b.title}  onError={(e) => onImgError(e, b.title)} />
              <div className="hh-banner-content" style={{ bottom: i === 0 ? "20px" : "auto", top: i === 0 ? "auto" : "50%", transform: i === 0 ? "none" : "translateY(-50%)", right: i !== 0 ? "20px" : "auto", textAlign: i !== 0 ? "left" : "left", left: i === 0 ? "20px" : "auto" }}>
                {b.subtitle && <div className="hh-banner-subtitle" style={{ color: textColor }}>{b.subtitle}</div>}
                <h4 className="hh-banner-title" style={{ color: textColor }}>{b.title}</h4>
                {b.description && <div className="hh-banner-desc" style={{ color: textColor, opacity: 0.7 }}>{b.description}</div>}
              </div>
              <Link href={fixLink(b.buttonLink || "#")} className="hh-banner-link" aria-label={b.title} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface HealthSectionTitleProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  maxWidth?: string;
  titleSize?: string;
}

export function HealthSectionTitle({ subtitle, title, description, align = "center", maxWidth = "100%", titleSize = "38px" }: HealthSectionTitleProps) {
  return (
    <div style={{ ...containerStyle, textAlign: align, marginBottom: "30px" }}>
      <div style={{ maxWidth, margin: align === "center" ? "0 auto" : "0" }}>
        {subtitle && <div style={{ fontFamily: TOKENS.bodyFont, fontSize: "14px", color: TOKENS.textColor, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{subtitle}</div>}
        <h4 style={{ fontFamily: TOKENS.titleFont, fontWeight: 500, fontSize: titleSize, lineHeight: "1.3", color: TOKENS.titleColor, margin: "0 0 10px" }}>{title}</h4>
        {description && <p style={{ fontFamily: TOKENS.bodyFont, fontSize: "16px", lineHeight: "26px", color: TOKENS.textColor, margin: 0 }}>{description}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. CATEGORY CARDS (Carousel-style grid)
   ═══════════════════════════════════════════════════════════════ */

export interface HealthCategoryCard {
  name: string;
  image: string;
  link?: string;
}

export interface HealthCategoryCardsProps {
  categories?: HealthCategoryCard[];
  columns?: number;
  sectionTitle?: string;
  marginBottom?: string;
}

export function HealthCategoryCards({ categories, columns = 4, sectionTitle = "Popular Categories", marginBottom = "80px" }: HealthCategoryCardsProps) {
  const storeCtx = useContext(HealthStoreContext);
  const fixLink = (link?: string) => resolveStoreLink(link || "#", storeCtx?.storeSlug);

  const defaultCats: HealthCategoryCard[] = [
    { name: "Allergy Relief", image: `${IMG}/2023/08/w-pas-category-allergy.jpg` },
    { name: "Anxiety", image: `${IMG}/2023/08/w-pas-anx.jpg` },
    { name: "Depression", image: `${IMG}/2023/08/w-pas-depression.jpg` },
    { name: "Eye & Vision", image: `${IMG}/2023/08/w-pas-eye-vision.jpg` },
    { name: "Hair", image: `${IMG}/2023/08/w-pas-hair.jpg` },
    { name: "Pregnancy", image: `${IMG}/2023/08/w-pas-pregnancy.jpg` },
    { name: "Skin", image: `${IMG}/2023/08/w-pas-skin.jpg` },
    { name: "Sleep", image: `${IMG}/2023/08/w-pas-sleep.jpg` },
  ];
  const items = categories || defaultCats;

  const css = `
    .hh-cats { display: grid; gap: 20px; }
    .hh-cat { position: relative; border-radius: 10px; overflow: hidden; cursor: pointer; aspect-ratio: 0.77; }
    .hh-cat:hover .hh-cat-img { transform: scale(1.05); }
    .hh-cat-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; display: block; }
    .hh-cat-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%); z-index: 1; }
    .hh-cat-name { position: absolute; bottom: 20px; left: 20px; z-index: 2; font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 28px; color: #fff; text-transform: capitalize; }
    .hh-cat-link { position: absolute; inset: 0; z-index: 3; }
    @media (max-width: 1024px) { .hh-cat-name { font-size: 22px; } }
    @media (max-width: 767px) { .hh-cat-name { font-size: 20px; } }
  `;

  return (
    <div style={{ ...containerStyle, marginBottom }}>
      {sectionTitle && <HealthSectionTitle title={sectionTitle} />}
      <ScopedStyles id="cats" css={css} />
      <div className="hh-cats" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {items.map((cat, i) => (
          <div key={i} className="hh-cat">
            <img className="hh-cat-img" src={cat.image} alt={cat.name}  onError={(e) => onImgError(e, cat.name)} />
            <div className="hh-cat-overlay" />
            <h3 className="hh-cat-name">{cat.name}</h3>
            <Link href={fixLink(cat.link)} className="hh-cat-link" aria-label={cat.name} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */

export interface HealthProductGridProps {
  products?: HealthProduct[];
  columns?: number;
  sectionTitle?: string;
  marginBottom?: string;
  maxProducts?: number;
  showCategory?: boolean;
  showHoverImage?: boolean;
  bgColor?: string;
}

export function HealthProductGrid({
  products: propProducts,
  columns = 3,
  sectionTitle = "Bestsellers",
  marginBottom = "80px",
  maxProducts = 6,
  showCategory = true,
  showHoverImage = true,
  bgColor,
}: HealthProductGridProps) {
  const storeCtx = useContext(HealthStoreContext);
  const fixLink = (slug: string) => {
    if (storeCtx?.storeSlug) return `/store/${storeCtx.storeSlug}/product/${slug}`;
    return `#`;
  };

  const defaultProducts: HealthProduct[] = [
    { id: 112, name: "Allergy Relief 30 Tablets", slug: "allergy-relief-30-tablets", price: "15.00", image: `${IMG}/2023/08/w-pas-ar-30-tablets-1.jpg`, hoverImage: `${IMG}/2023/08/w-pas-ar-30-tablets-2.jpg`, category: "Allergy Relief", rating: 5, reviewCount: 3 },
    { id: 246, name: "Depression 60 Tablets", slug: "depression-60-tablets", price: "25.00", image: `${IMG}/2023/08/w-pas-dp-60-tablets-1.jpg`, hoverImage: `${IMG}/2023/08/w-pas-dp-30-tablets-2.jpg`, category: "Depression", rating: 5, reviewCount: 2 },
    { id: 451, name: "Skin 30 Gummies", slug: "skin-30-gummies", price: "12.00", image: `${IMG}/2023/08/w-pas-sk-30-gummies-1.jpg`, hoverImage: `${IMG}/2023/08/w-pas-sk-30-gummies-2.jpg`, category: "Skin", rating: 4, reviewCount: 1 },
    { id: 356, name: "Hair 60 Capsules", slug: "hair-60-capsules", price: "25.00", image: `${IMG}/2023/08/w-pas-hr-60-capsules-1.jpg`, hoverImage: `${IMG}/2023/08/w-pas-hr-30-capsules-2.jpg`, category: "Hair", rating: 5, reviewCount: 4 },
    { id: 493, name: "Sleep 30 Capsules", slug: "sleep-30-capsules", price: "15.00", image: `${IMG}/2023/08/w-pas-sl-30-capsules-1.jpg`, hoverImage: `${IMG}/2023/08/w-pas-sl-30-capsules-2.jpg`, category: "Sleep", rating: 5, reviewCount: 2 },
    { id: 308, name: "Eye & Vision 60 Softgels", slug: "eye-vision-60-softgels", price: "18.00", image: `${IMG}/2023/08/w-pas-ev-60-softgel-1.jpg`, hoverImage: `${IMG}/2023/08/w-pas-ev-30-softgel-2.jpg`, category: "Eye & Vision", rating: 4, reviewCount: 3 },
  ];

  const items = (propProducts || storeCtx?.products || defaultProducts).slice(0, maxProducts);

  const css = `
    .hh-products { display: grid; gap: 20px; }
    .hh-prod { background: ${bgColor || "#fff"}; border-radius: 10px; overflow: hidden; transition: box-shadow 0.3s; position: relative; }
    .hh-prod:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .hh-prod-img-wrap { position: relative; overflow: hidden; aspect-ratio: 1; background: ${TOKENS.bgLight}; }
    .hh-prod-img { width: 100%; height: 100%; object-fit: contain; transition: opacity 0.4s; display: block; padding: 15px; }
    .hh-prod-hover { position: absolute; inset: 0; opacity: 0; transition: opacity 0.4s; }
    .hh-prod:hover .hh-prod-hover { opacity: 1; }
    .hh-prod:hover .hh-prod-main-img { opacity: 0; }
    .hh-prod-info { padding: 15px 20px 20px; text-align: center; }
    .hh-prod-cat { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; margin-bottom: 5px; }
    .hh-prod-name { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 16px; color: ${TOKENS.entityTitleColor}; margin: 0 0 8px; }
    .hh-prod-name a { color: inherit; text-decoration: none; }
    .hh-prod-name a:hover { color: ${TOKENS.primaryColor}; }
    .hh-prod-price { font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 16px; color: ${TOKENS.primaryColor}; }
    .hh-prod-stars { color: ${TOKENS.starColor}; font-size: 12px; letter-spacing: 2px; margin-bottom: 5px; }
    .hh-prod-btn { display: inline-block; margin-top: 10px; padding: 8px 20px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 12px; text-decoration: none; border-radius: 25px; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.3s; }
    .hh-prod-btn:hover { filter: brightness(0.9); }
  `;

  const renderStars = (rating: number = 5) => "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div style={{ ...containerStyle, marginBottom }}>
      {sectionTitle && <HealthSectionTitle title={sectionTitle} titleSize="38px" />}
      <ScopedStyles id="products" css={css} />
      <div className="hh-products" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {items.map((p) => (
          <div key={p.id} className="hh-prod">
            <div className="hh-prod-img-wrap">
              <img className="hh-prod-img hh-prod-main-img" src={p.image || safeSrc(null, p.name)} alt={p.name} onError={(e) => onImgError(e, p.name)} />
              {showHoverImage && p.hoverImage && (
                <img className="hh-prod-img hh-prod-hover" src={p.hoverImage} alt={p.name}  onError={(e) => onImgError(e, p.name)} />
              )}
            </div>
            <div className="hh-prod-info">
              {showCategory && <div className="hh-prod-cat">{p.category}</div>}
              <h3 className="hh-prod-name"><Link href={fixLink(p.slug)}>{p.name}</Link></h3>
              <div className="hh-prod-stars">{renderStars(p.rating)}</div>
              <div className="hh-prod-price">${p.price}</div>
              <button className="hh-prod-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. VIDEO SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface HealthVideoSectionProps {
  videoSrc?: string;
  title?: string;
  subtitle?: string;
  height?: string;
}

export function HealthVideoSection({
  videoSrc = `${IMG}/2023/08/w-pas-video-desktop.mp4`,
  title = "Effective Vitamins For Your Health",
  subtitle = "Our vitamins and supplements are designed to provide essential nutrients that may be lacking in our diet. These products are tested to ensure their safety and quality.",
  height = "660px",
}: HealthVideoSectionProps) {
  return (
    <div style={{ position: "relative", width: "100%", height, overflow: "hidden", marginBottom: "80px", borderRadius: TOKENS.borderRadius }}>
      <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}>
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "40px", textAlign: "center" }}>
        <h4 style={{ fontFamily: TOKENS.titleFont, fontWeight: 500, fontSize: "52px", lineHeight: "62px", color: "#fff", maxWidth: "535px", margin: "0 0 20px" }}>{title}</h4>
        <p style={{ fontFamily: TOKENS.bodyFont, fontSize: "22px", lineHeight: "32px", color: "rgba(255,255,255,0.85)", maxWidth: "625px", margin: 0 }}>{subtitle}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. INGREDIENTS / FEATURE SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface HealthFeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface HealthFeatureSectionProps {
  title?: string;
  subtitle?: string;
  features?: HealthFeatureItem[];
  image?: string;
  helpAvatars?: string;
  helpText?: string;
}

export function HealthFeatureSection({
  title = "Supplements And Ingredients You Can Trust",
  subtitle = "Need help choosing?",
  features,
  image = `${IMG}/2023/08/w-pas-iron-72x72.jpg`,
  helpAvatars = `${IMG}/2023/08/w-pas-avatars-help-153x42.png`,
  helpText = "Need help choosing?",
}: HealthFeatureSectionProps) {
  const storeCtx = useContext(HealthStoreContext);
  const defaultFeatures: HealthFeatureItem[] = [
    { icon: `${IMG}/2023/08/w-pas-m-icon-1.svg`, title: "Used In", description: "Chances are, you've probably heard of the nutrient iron before. As a kid, you may remember the not-so-pleasant finger pricks at the doctor's office to check your iron levels." },
    { icon: `${IMG}/2023/08/w-pas-m-icon-2.svg`, title: "Found In", description: "Chances are, you've probably heard of the nutrient iron before. As a kid, you may remember the not-so-pleasant finger pricks at the doctor's office to check your iron levels." },
    { icon: `${IMG}/2023/08/w-pas-m-icon-3.svg`, title: "Learn All Ingredients In Our Guide.", description: "" },
  ];

  const items = features || defaultFeatures;

  const css = `
    .hh-feat { background: ${TOKENS.bgLight}; border-radius: ${TOKENS.borderRadius}; padding: 80px 65px; margin-bottom: 80px; display: flex; gap: 60px; align-items: center; }
    .hh-feat-left { flex: 1; }
    .hh-feat-right { flex: 1; display: flex; flex-direction: column; gap: 30px; }
    .hh-feat-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 52px; line-height: 62px; color: ${TOKENS.titleColor}; margin: 0 0 20px; max-width: 490px; }
    .hh-feat-desc { font-family: ${TOKENS.bodyFont}; font-size: 18px; line-height: 28px; color: ${TOKENS.textColor}; max-width: 490px; }
    .hh-feat-item { display: flex; gap: 15px; align-items: flex-start; }
    .hh-feat-icon { width: 50px; height: 50px; flex-shrink: 0; }
    .hh-feat-item-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; color: ${TOKENS.titleColor}; margin: 0 0 5px; }
    .hh-feat-item-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 22px; color: ${TOKENS.textColor}; margin: 0; }
    .hh-feat-help { display: flex; align-items: center; gap: 15px; margin-top: 20px; }
    .hh-feat-avatars { height: 42px; }
    .hh-feat-help-text { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.titleColor}; }
    .hh-feat-help-link { display: inline-block; margin-top: 5px; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px; color: ${TOKENS.primaryColor}; text-decoration: underline; }
    @media (max-width: 1024px) { .hh-feat { flex-direction: column; padding: 60px 45px; } .hh-feat-title { font-size: 34px; line-height: 44px; } }
    @media (max-width: 767px) { .hh-feat { padding: 30px; } .hh-feat-title { font-size: 22px; line-height: 32px; } .hh-feat-desc { font-size: 14px; line-height: 24px; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="features" css={css} />
      <div className="hh-feat">
        <div className="hh-feat-left">
          <h4 className="hh-feat-title">{title}</h4>
          <p className="hh-feat-desc">{subtitle}</p>
          <div className="hh-feat-help">
            <img className="hh-feat-avatars" src={helpAvatars} alt="Support team"  onError={(e) => onImgError(e, "fallback")} />
            <div>
              <div className="hh-feat-help-text">{helpText}</div>
              <Link href={resolveStoreLink("#", storeCtx?.storeSlug)} className="hh-feat-help-link">Contact Us →</Link>
            </div>
          </div>
        </div>
        <div className="hh-feat-right">
          {items.map((f, i) => (
            <div key={i} className="hh-feat-item">
              <img className="hh-feat-icon" src={f.icon} alt={f.title}  onError={(e) => onImgError(e, f.title)} />
              <div>
                <h5 className="hh-feat-item-title">{f.title}</h5>
                {f.description && <p className="hh-feat-item-desc">{f.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. TESTIMONIALS
   ═══════════════════════════════════════════════════════════════ */

export interface HealthTestimonial {
  name: string;
  image: string;
  text: string;
  rating?: number;
}

export interface HealthTestimonialsProps {
  title?: string;
  trustpilotImage?: string;
  trustpilotRating?: string;
  reviewCount?: string;
  testimonials?: HealthTestimonial[];
}

export function HealthTestimonials({
  title = "Feedback From Real Customers",
  trustpilotImage = `${IMG}/2023/08/w-pas-trustpilot-1.svg`,
  trustpilotRating = "Rated 4.9",
  reviewCount = "Based on 374 reviews",
  testimonials,
}: HealthTestimonialsProps) {
  const defaultTestimonials: HealthTestimonial[] = [
    { name: "Customer 1", image: `${IMG}/2023/08/w-pas-customer-1.jpg`, text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.", rating: 5 },
    { name: "Customer 2", image: `${IMG}/2023/08/w-pas-customer-2.jpg`, text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.", rating: 5 },
    { name: "Customer 3", image: `${IMG}/2023/08/w-pas-customer-3.jpg`, text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.", rating: 5 },
    { name: "Customer 4", image: `${IMG}/2023/08/w-pas-customer-4.jpg`, text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.", rating: 5 },
    { name: "Customer 5", image: `${IMG}/2023/08/w-pas-customer-5.jpg`, text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.", rating: 5 },
    { name: "Customer 6", image: `${IMG}/2023/08/w-pas-customer-6.jpg`, text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.", rating: 5 },
  ];

  const items = testimonials || defaultTestimonials;

  const css = `
    .hh-testim-section { margin-bottom: 80px; }
    .hh-testim-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; flex-wrap: wrap; gap: 15px; }
    .hh-testim-tp { display: flex; align-items: center; gap: 15px; }
    .hh-testim-tp img { height: 24px; }
    .hh-testim-tp-info { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; }
    .hh-testim-tp-rating { font-weight: 600; color: ${TOKENS.titleColor}; }
    .hh-testim-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .hh-testim-card { background: ${TOKENS.bgLight}; border-radius: 10px; padding: 30px; }
    .hh-testim-stars { color: ${TOKENS.starColor}; font-size: 14px; letter-spacing: 2px; margin-bottom: 15px; }
    .hh-testim-text { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 24px; color: ${TOKENS.textColor}; margin: 0 0 20px; }
    .hh-testim-author { display: flex; align-items: center; gap: 12px; }
    .hh-testim-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
    .hh-testim-name { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 14px; color: ${TOKENS.titleColor}; }
    @media (max-width: 767px) { .hh-testim-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="testimonials" css={css} />
      <div className="hh-testim-section">
        <div className="hh-testim-header">
          <HealthSectionTitle title={title} align="left" titleSize="38px" />
          <div className="hh-testim-tp">
            <img src={trustpilotImage} alt="Trustpilot"  onError={(e) => onImgError(e, "fallback")} />
            <div className="hh-testim-tp-info">
              <span className="hh-testim-tp-rating">{trustpilotRating}</span>
              <br />{reviewCount}
            </div>
          </div>
        </div>
        <div className="hh-testim-grid">
          {items.slice(0, 6).map((t, i) => (
            <div key={i} className="hh-testim-card">
              <div className="hh-testim-stars">{"★".repeat(t.rating || 5)}</div>
              <p className="hh-testim-text">{t.text}</p>
              <div className="hh-testim-author">
                <img className="hh-testim-avatar" src={t.image} alt={t.name}  onError={(e) => onImgError(e, t.name)} />
                <span className="hh-testim-name">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. BLOG POSTS
   ═══════════════════════════════════════════════════════════════ */

export interface HealthBlogPost {
  title: string;
  image: string;
  date: string;
  author?: string;
  link?: string;
  category?: string;
}

export interface HealthBlogPostsProps {
  posts?: HealthBlogPost[];
  columns?: number;
  sectionTitle?: string;
  marginBottom?: string;
}

export function HealthBlogPosts({ posts, columns = 3, sectionTitle, marginBottom = "60px" }: HealthBlogPostsProps) {
  const defaultPosts: HealthBlogPost[] = [
    { title: "What is fiber and why is it important for health?", image: `${IMG}/2023/09/w-pas-blog-1-400x247.jpg`, date: "September 5, 2023", author: "Admin", category: "Health" },
    { title: "5 ways to celebrate your mom on Mother's Day", image: `${IMG}/2023/09/w-pas-blog-2-400x247.jpg`, date: "September 4, 2023", author: "Admin", category: "Health" },
    { title: "Syncing Up for an Integrated Brain", image: `${IMG}/2023/09/w-pas-blog-3-400x247.jpg`, date: "September 4, 2023", author: "Admin", category: "Health" },
  ];

  const items = posts || defaultPosts;

  const css = `
    .hh-blog-grid { display: grid; gap: 20px; }
    .hh-blog-card { border-radius: 10px; overflow: hidden; background: #fff; }
    .hh-blog-img-wrap { position: relative; overflow: hidden; }
    .hh-blog-img { width: 100%; height: 247px; object-fit: cover; display: block; transition: transform 0.5s; }
    .hh-blog-card:hover .hh-blog-img { transform: scale(1.05); }
    .hh-blog-date { position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.6); color: #fff; padding: 5px 12px; border-radius: 5px; font-family: ${TOKENS.bodyFont}; font-size: 12px; }
    .hh-blog-content { padding: 20px; }
    .hh-blog-cat { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.primaryColor}; background: rgba(136,173,153,0.1); display: inline-block; padding: 3px 10px; border-radius: 3px; margin-bottom: 10px; }
    .hh-blog-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; line-height: 1.4; color: ${TOKENS.titleColor}; margin: 0; }
    .hh-blog-title:hover { color: ${TOKENS.primaryColor}; }
    .hh-blog-meta { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; margin-top: 10px; }
  `;

  return (
    <div style={{ ...containerStyle, marginBottom }}>
      {sectionTitle && <HealthSectionTitle title={sectionTitle} />}
      <ScopedStyles id="blog" css={css} />
      <div className="hh-blog-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {items.map((post, i) => (
          <div key={i} className="hh-blog-card">
            <div className="hh-blog-img-wrap">
              <img className="hh-blog-img" src={post.image} alt={post.title}  onError={(e) => onImgError(e, post.title)} />
              <div className="hh-blog-date">{post.date}</div>
            </div>
            <div className="hh-blog-content">
              {post.category && <span className="hh-blog-cat">{post.category}</span>}
              <h3 className="hh-blog-title">{post.title}</h3>
              <div className="hh-blog-meta">by {post.author || "Admin"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. NEWSLETTER
   ═══════════════════════════════════════════════════════════════ */

export interface HealthNewsletterProps {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
}

export function HealthNewsletter({
  title = "Sign Up And Connect to WoodMart",
  subtitle = "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal and mental health.",
  backgroundColor = TOKENS.bgLight,
}: HealthNewsletterProps) {
  const [email, setEmail] = useState("");
  const storeCtx = useContext(HealthStoreContext);
  const { subscribe, status: nlStatus } = useNewsletterSubscribe(storeCtx?.storeSlug || "");

  const css = `
    .hh-newsletter { background: ${backgroundColor}; padding: 80px 40px; text-align: center; margin-bottom: 80px; border-radius: ${TOKENS.borderRadius}; }
    .hh-nl-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 58px; line-height: 68px; color: ${TOKENS.titleColor}; margin: 0 0 15px; max-width: 622px; margin-left: auto; margin-right: auto; }
    .hh-nl-sub { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 26px; color: ${TOKENS.textColor}; max-width: 500px; margin: 0 auto 30px; }
    .hh-nl-form { display: flex; max-width: 450px; margin: 0 auto; gap: 0; }
    .hh-nl-input { flex: 1; padding: 14px 20px; border: 1px solid #ddd; border-radius: 35px 0 0 35px; font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none; border-right: none; }
    .hh-nl-input:focus { border-color: ${TOKENS.primaryColor}; }
    .hh-nl-btn { padding: 14px 30px; background: ${TOKENS.primaryColor}; color: #fff; border: none; border-radius: 0 35px 35px 0; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; }
    .hh-nl-btn:hover { filter: brightness(0.9); }
    @media (max-width: 1024px) { .hh-nl-title { font-size: 34px; line-height: 44px; } }
    @media (max-width: 767px) { .hh-nl-title { font-size: 22px; line-height: 32px; } .hh-newsletter { padding: 40px 20px; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id="newsletter" css={css} />
      <div className="hh-newsletter">
        <h4 className="hh-nl-title">{title}</h4>
        <p className="hh-nl-sub">{subtitle}</p>
        {nlStatus === "success" ? (
          <p style={{ fontFamily: TOKENS.bodyFont, fontSize: "16px", color: TOKENS.primaryColor, marginTop: "20px" }}>Thanks for subscribing! 🎉</p>
        ) : (
        <form className="hh-nl-form" onSubmit={(e) => { e.preventDefault(); subscribe(email).then(() => setEmail("")); }}>
          <input className="hh-nl-input" type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="hh-nl-btn" type="submit" disabled={nlStatus === "loading"}>{nlStatus === "loading" ? "Signing up..." : "Subscribe"}</button>
        </form>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   12. BRAND MARQUEE (Logos scroll)
   ═══════════════════════════════════════════════════════════════ */

export interface HealthBrandMarqueeProps {
  speed?: number;
  reverse?: boolean;
}

export function HealthBrandMarquee({ speed = 70, reverse = false }: HealthBrandMarqueeProps) {
  const css = `
    .hh-brand-marquee { overflow: hidden; padding: 30px 0; }
    .hh-brand-track { display: flex; animation: hhBrandScroll ${speed}s linear infinite; gap: 70px; ${reverse ? "animation-direction: reverse;" : ""} }
    @keyframes hhBrandScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .hh-brand-item { flex-shrink: 0; height: 30px; opacity: 0.5; transition: opacity 0.3s; }
    .hh-brand-item:hover { opacity: 1; }
  `;

  const brands = [
    `${IMG}/2023/08/w-pas-trustpilot-1.svg`,
    `${IMG}/2023/08/w-pas-logo-color.svg`,
    `${IMG}/2023/08/w-pas-trustpilot-1.svg`,
    `${IMG}/2023/08/w-pas-logo-color.svg`,
  ];
  const doubled = [...brands, ...brands, ...brands, ...brands];

  return (
    <>
      <ScopedStyles id={`brand-marquee-${reverse ? "r" : "f"}`} css={css} />
      <div className="hh-brand-marquee">
        <div className="hh-brand-track">
          {doubled.map((src, i) => <img key={i} className="hh-brand-item" src={src} alt="Brand"  onError={(e) => onImgError(e, "fallback")} />)}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEALTH HEADER
   Clean, modern health/wellness header matching WoodMart Pills.
   Left: Shop · About Us · Search
   Center: Logo
   Right: Login · Wishlist · Cart
   ═══════════════════════════════════════════════════════════════ */

export interface HealthHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  cartCount?: number;
  wishlistCount?: number;
  onSearch?: (q: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  topBarText?: string;
}

export function HealthHeader({
  storeName, storeSlug, logo, cartCount = 0, wishlistCount = 0,
  onSearch, searchQuery = "", onSearchChange,
  topBarText = "Free shipping on all orders over $30!",
}: HealthHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState(searchQuery);
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

  const css = `
    .hh-topbar{background:${TOKENS.primaryColor};color:#fff;font-family:${TOKENS.bodyFont};font-size:13px;text-align:center;padding:8px 15px;font-weight:500}
    .hh-hdr{background:#fff;border-bottom:1px solid #eee;font-family:${TOKENS.bodyFont};position:sticky;top:0;z-index:100}
    .hh-inner{max-width:${TOKENS.containerWidth};margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 15px;height:75px}
    .hh-nav{display:flex;align-items:center;gap:24px}
    .hh-nav a,.hh-nav button{font-size:14px;font-weight:600;color:${TOKENS.titleColor};text-decoration:none;background:none;border:none;cursor:pointer;padding:0;transition:color .2s;font-family:${TOKENS.bodyFont}}
    .hh-nav a:hover,.hh-nav button:hover{color:${TOKENS.primaryColor}}
    .hh-logo{display:flex;align-items:center;gap:8px;text-decoration:none}
    .hh-logo img{height:38px;width:auto}
    .hh-logo-text{font-family:${TOKENS.titleFont};font-size:22px;font-weight:700;color:${TOKENS.titleColor}}
    .hh-icons{display:flex;align-items:center;gap:18px}
    .hh-icon{position:relative;background:none;border:none;cursor:pointer;padding:4px;color:${TOKENS.titleColor};text-decoration:none;transition:color .2s;display:flex;align-items:center}
    .hh-icon:hover{color:${TOKENS.primaryColor}}
    .hh-icon svg{width:21px;height:21px}
    .hh-badge{position:absolute;top:-4px;right:-6px;background:${TOKENS.primaryColor};color:#fff;font-size:10px;font-weight:700;min-width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center}
    .hh-search-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:flex-start;justify-content:center;padding-top:110px}
    .hh-search-box{background:#fff;border-radius:${TOKENS.borderRadius};padding:28px;width:90%;max-width:560px;box-shadow:0 16px 48px rgba(0,0,0,.12)}
    .hh-search-box form{display:flex;gap:10px}
    .hh-search-box input{flex:1;border:2px solid #e8e8e8;border-radius:10px;padding:12px 16px;font-size:15px;font-family:${TOKENS.bodyFont};outline:none;transition:border-color .2s}
    .hh-search-box input:focus{border-color:${TOKENS.primaryColor}}
    .hh-search-box button[type=submit]{background:${TOKENS.primaryColor};color:#fff;border:none;border-radius:10px;padding:12px 22px;font-weight:600;cursor:pointer;font-family:${TOKENS.bodyFont};transition:background .2s}
    .hh-search-box button[type=submit]:hover{filter:brightness(0.9)}
    .hh-mob-tog{display:none;background:none;border:none;cursor:pointer;padding:4px;color:${TOKENS.titleColor}}
    .hh-mob-tog svg{width:24px;height:24px}
    .hh-mob-menu{display:none;background:#fff;border-bottom:1px solid #eee;padding:15px}
    .hh-mob-menu a{display:block;padding:10px 0;font-size:15px;font-weight:600;color:${TOKENS.titleColor};text-decoration:none;border-bottom:1px solid #f5f5f5}
    .hh-mob-menu a:last-child{border-bottom:none}
    @media(max-width:768px){.hh-nav{display:none}.hh-mob-tog{display:block}.hh-mob-menu.hh-open{display:block}.hh-inner{height:58px}.hh-icons{gap:12px}.hh-icon svg{width:19px;height:19px}}
  `;

  const searchIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
  const userIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  const heartIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
  const cartIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="hh-topbar">{topBarText}</div>
      <header className="hh-hdr">
        <div className="hh-inner">
          <button className="hh-mob-tog" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>}
          </button>
          <nav className="hh-nav">
            <Link href={`${base}/shop`}>Shop</Link>
            <Link href={`${base}/shop`}>About Us</Link>
            <button onClick={() => setSearchOpen(true)} aria-label="Search">{searchIcon}</button>
          </nav>
          <Link href={base} className="hh-logo">
            {logo ? <img src={logo} alt={storeName} /> : <span className="hh-logo-text">{storeName}</span>}
          </Link>
          <div className="hh-icons">
            <Link href={`${base}/my-account`} className="hh-icon" aria-label="Account">{userIcon}</Link>
            <Link href={`${base}/wishlist`} className="hh-icon" aria-label="Wishlist">
              {heartIcon}
              {wishlistCount > 0 && <span className="hh-badge">{wishlistCount}</span>}
            </Link>
            <Link href={`${base}/cart`} className="hh-icon" aria-label="Cart">
              {cartIcon}
              {cartCount > 0 && <span className="hh-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
        <div className={`hh-mob-menu ${mobileOpen ? "hh-open" : ""}`}>
          <Link href={base} onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href={`${base}/shop`} onClick={() => setMobileOpen(false)}>Shop</Link>
          <Link href={`${base}/shop`} onClick={() => setMobileOpen(false)}>About Us</Link>
          <Link href={`${base}/blog`} onClick={() => setMobileOpen(false)}>Blog</Link>
          <Link href={`${base}/wishlist`} onClick={() => setMobileOpen(false)}>Wishlist</Link>
          <Link href={`${base}/my-account`} onClick={() => setMobileOpen(false)}>My Account</Link>
        </div>
      </header>
      {searchOpen && (
        <div className="hh-search-ov" onClick={() => setSearchOpen(false)}>
          <div className="hh-search-box" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit}>
              <input type="text" placeholder="Search products..." value={searchVal} onChange={e => setSearchVal(e.target.value)} autoFocus />
              <button type="submit">Search</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEALTH FOOTER (Custom WoodMart Pills-style)
   Clean, calm wellness footer with proper store links
   ═══════════════════════════════════════════════════════════════ */

export interface HealthFooterFullProps {
  storeName?: string;
  storeSlug?: string;
  logo?: string | null;
  description?: string;
  contact?: { address?: string; phone?: string; email?: string };
  socialLinks?: Array<{ platform: string; url: string }>;
  copyrightText?: string;
}

export function HealthFooterFull({
  storeName = "Health Store",
  storeSlug: storeSlugProp,
  logo,
  description = "Your trusted source for vitamins, supplements, and wellness products. Naturally better.",
  contact = { address: "123 Wellness Ave, Portland, OR 97201", phone: "(503) 555-0123", email: "hello@store.com" },
  socialLinks = [],
  copyrightText,
}: HealthFooterFullProps) {
  const storeCtx = useContext(HealthStoreContext);
  const slug = storeSlugProp || storeCtx?.storeSlug;
  const base = slug ? `/store/${slug}` : "/";
  const activeSocials = socialLinks.filter(s => s.url && s.url !== "#");
  const socialIcons: Record<string, string> = { facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶", tiktok: "♪", whatsapp: "💬" };

  const css = `
    .hf-footer{background:#f7f7f7;font-family:${TOKENS.bodyFont};color:${TOKENS.textColor}}
    .hf-main{max-width:${TOKENS.containerWidth};margin:0 auto;padding:60px 15px 40px;display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px}
    .hf-brand p{font-size:14px;line-height:1.8;margin:14px 0}
    .hf-social{display:flex;gap:10px;margin-top:14px}
    .hf-social a{width:34px;height:34px;border-radius:50%;background:${TOKENS.primaryColor};color:#fff;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:13px;font-weight:700;transition:background .2s}
    .hf-social a:hover{filter:brightness(0.9)}
    .hf-col-title{font-family:${TOKENS.titleFont};font-size:15px;font-weight:700;color:${TOKENS.titleColor};text-transform:uppercase;margin-bottom:18px;letter-spacing:.3px}
    .hf-links{list-style:none;margin:0;padding:0}
    .hf-links li{margin-bottom:10px}
    .hf-links a{font-size:14px;color:${TOKENS.textColor};text-decoration:none;transition:color .2s}
    .hf-links a:hover{color:${TOKENS.primaryColor}}
    .hf-contact{font-size:14px;margin-bottom:10px;display:flex;align-items:flex-start;gap:8px}
    .hf-bottom{border-top:1px solid #e0e0e0;max-width:${TOKENS.containerWidth};margin:0 auto;padding:18px 15px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
    .hf-bottom small{font-size:13px;color:${TOKENS.textColor}}
    .hf-bottom small a{color:${TOKENS.textColor};text-decoration:none}
    @media(max-width:768px){.hf-main{grid-template-columns:1fr;gap:28px;padding:36px 15px 28px}}
    @media(min-width:769px) and (max-width:1024px){.hf-main{grid-template-columns:1fr 1fr}}
  `;

  return (
    <footer className="hf-footer">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="hf-main">
        <div className="hf-brand">
          <Link href={base} style={{ textDecoration: "none" }}>
            {logo ? <img src={logo} alt={storeName} style={{ maxWidth: "170px", height: "auto" }} /> : <span style={{ fontFamily: TOKENS.titleFont, fontSize: "20px", fontWeight: 700, color: TOKENS.titleColor }}>{storeName}</span>}
          </Link>
          <p>{description}</p>
          {contact?.phone && <div className="hf-contact">📞 {contact.phone}</div>}
          {contact?.email && <div className="hf-contact">✉️ {contact.email}</div>}
          {contact?.address && <div className="hf-contact">📍 {contact.address}</div>}
          {activeSocials.length > 0 && (
            <div className="hf-social">
              {activeSocials.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform}>{socialIcons[s.platform] || s.platform[0]?.toUpperCase()}</a>)}
            </div>
          )}
        </div>
        <div>
          <h4 className="hf-col-title">Shop</h4>
          <ul className="hf-links">
            <li><Link href={`${base}/shop`}>All Products</Link></li>
            <li><Link href={`${base}/shop?sort=newest`}>New Arrivals</Link></li>
            <li><Link href={`${base}/shop?sort=popular`}>Best Sellers</Link></li>
            <li><Link href={`${base}/shop?sort=price_asc`}>On Sale</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="hf-col-title">Information</h4>
          <ul className="hf-links">
            <li><Link href={`${base}/shop`}>About Us</Link></li>
            <li><Link href={`${base}/shop`}>Contact Us</Link></li>
            <li><Link href={`${base}/blog`}>Blog</Link></li>
            <li><Link href={`${base}/shop`}>Shipping & Returns</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="hf-col-title">My Account</h4>
          <ul className="hf-links">
            <li><Link href={`${base}/my-account`}>Sign In</Link></li>
            <li><Link href={`${base}/wishlist`}>Wishlist</Link></li>
            <li><Link href={`${base}/cart`}>Cart</Link></li>
            <li><Link href={`${base}/compare`}>Compare</Link></li>
            <li><Link href={`${base}/order-tracking`}>Order Tracking</Link></li>
          </ul>
        </div>
      </div>
      <div className="hf-bottom">
        <small><Link href={base}>{copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}</Link></small>
        <img src="https://woodmart.xtemos.com/wp-content/uploads/2018/08/payment.png" alt="Payment methods" style={{ height: "21px" }} loading="lazy" />
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ABOUT US PAGE
   Full health-styled about page with hero, story, mission, team.
   ═══════════════════════════════════════════════════════════════ */

export interface HealthAboutFeature {
  icon: string;
  title: string;
  description: string;
}

export interface HealthTeamMember {
  name: string;
  role: string;
  image?: string;
}

export interface HealthAboutPageProps {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  storyTitle?: string;
  storyText?: string;
  storyImage?: string;
  missionTitle?: string;
  missionText?: string;
  features?: HealthAboutFeature[];
  teamTitle?: string;
  teamSubtitle?: string;
  team?: HealthTeamMember[];
}

export function HealthAboutPage({
  heroTitle = "About Us",
  heroSubtitle = "Our mission is to make you healthy and happy, for this we use only natural and high-quality ingredients necessary to achieve an extraordinary effect.",
  heroImage = `${IMG}/2023/08/w-pas-first-screen.jpg`,
  storyTitle = "Our Story",
  storyText = "We started with a simple belief: everyone deserves access to clean, effective supplements. Our team of nutritionists and wellness experts carefully selects every ingredient, ensuring that each product meets the highest standards of quality and purity. From sourcing to formulation, we prioritize transparency and trust.",
  storyImage = `${IMG}/2023/08/w-pas-iron-72x72.jpg`,
  missionTitle = "Our Mission",
  missionText = "Help customers build healthy routines without confusion or hype. We believe in science-backed formulas, honest labeling, and supplements that actually work.",
  features,
  teamTitle = "Medical Experts",
  teamSubtitle = "Meet the professionals behind our formulations",
  team,
}: HealthAboutPageProps) {
  const defaultFeatures: HealthAboutFeature[] = [
    { icon: "🧪", title: "Tested Formulas", description: "Every product is third-party tested for purity, potency, and safety before it reaches you." },
    { icon: "🌿", title: "Natural Ingredients", description: "We prioritize plant-based, non-GMO ingredients sourced from trusted global suppliers." },
    { icon: "🛡️", title: "Quality Guaranteed", description: "GMP-certified manufacturing ensures consistent quality in every batch we produce." },
    { icon: "💚", title: "Daily Wellness", description: "Designed for everyday use to support energy, sleep, immunity, and overall balance." },
  ];

  const defaultTeam: HealthTeamMember[] = [
    { name: "Dr. Sarah Mitchell", role: "Chief Nutritionist", image: `${IMG}/2023/08/w-pas-customer-1.jpg` },
    { name: "Dr. James Carter", role: "Formulation Specialist", image: `${IMG}/2023/08/w-pas-customer-2.jpg` },
    { name: "Emily Rodriguez", role: "Wellness Advisor", image: `${IMG}/2023/08/w-pas-customer-3.jpg` },
    { name: "Dr. Michael Chen", role: "Quality Assurance", image: `${IMG}/2023/08/w-pas-customer-4.jpg` },
  ];

  const featureItems = features || defaultFeatures;
  const teamItems = team || defaultTeam;

  const css = `
    .hh-about-hero { position: relative; min-height: 400px; display: flex; align-items: center; overflow: hidden; background: ${TOKENS.bgLight}; margin-bottom: 80px; }
    .hh-about-hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
    .hh-about-hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.35); }
    .hh-about-hero-content { position: relative; z-index: 2; text-align: center; max-width: 700px; margin: 0 auto; padding: 80px 20px; }
    .hh-about-hero-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 52px; line-height: 62px; color: #fff; margin: 0 0 20px; }
    .hh-about-hero-sub { font-family: ${TOKENS.bodyFont}; font-size: 18px; line-height: 28px; color: rgba(255,255,255,0.9); margin: 0; }
    .hh-about-story { display: flex; gap: 60px; align-items: center; margin-bottom: 80px; }
    .hh-about-story-img { flex: 0 0 45%; border-radius: ${TOKENS.borderRadius}; overflow: hidden; }
    .hh-about-story-img img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 350px; }
    .hh-about-story-text { flex: 1; }
    .hh-about-story-label { font-family: ${TOKENS.bodyFont}; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: ${TOKENS.primaryColor}; margin-bottom: 10px; }
    .hh-about-story-h { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 38px; line-height: 48px; color: ${TOKENS.titleColor}; margin: 0 0 20px; }
    .hh-about-story-p { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 28px; color: ${TOKENS.textColor}; margin: 0; }
    .hh-about-mission { background: ${TOKENS.bgLight}; border-radius: ${TOKENS.borderRadius}; padding: 60px; text-align: center; margin-bottom: 80px; }
    .hh-about-mission h3 { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 38px; color: ${TOKENS.titleColor}; margin: 0 0 15px; }
    .hh-about-mission p { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 28px; color: ${TOKENS.textColor}; max-width: 600px; margin: 0 auto; }
    .hh-about-features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; margin-bottom: 80px; }
    .hh-about-feat-card { text-align: center; padding: 30px 20px; border-radius: 10px; background: #fff; border: 1px solid #f0f0f0; transition: box-shadow 0.3s; }
    .hh-about-feat-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.06); }
    .hh-about-feat-icon { font-size: 36px; margin-bottom: 15px; }
    .hh-about-feat-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; color: ${TOKENS.titleColor}; margin: 0 0 10px; }
    .hh-about-feat-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 22px; color: ${TOKENS.textColor}; margin: 0; }
    .hh-about-team { margin-bottom: 80px; }
    .hh-about-team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px; }
    .hh-about-team-card { text-align: center; }
    .hh-about-team-img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 15px; display: block; border: 3px solid ${TOKENS.primaryColor}; }
    .hh-about-team-name { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 16px; color: ${TOKENS.titleColor}; margin: 0 0 5px; }
    .hh-about-team-role { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; }
    @media (max-width: 1024px) { .hh-about-hero-title { font-size: 38px; line-height: 48px; } .hh-about-story { flex-direction: column; gap: 30px; } .hh-about-features { grid-template-columns: repeat(2, 1fr); } .hh-about-team-grid { grid-template-columns: repeat(2, 1fr); } .hh-about-mission { padding: 40px 25px; } }
    @media (max-width: 767px) { .hh-about-hero-title { font-size: 28px; line-height: 38px; } .hh-about-features { grid-template-columns: 1fr; } .hh-about-team-grid { grid-template-columns: 1fr 1fr; } }
  `;

  return (
    <>
      <ScopedStyles id="about-page" css={css} />
      {/* Hero */}
      <div className="hh-about-hero">
        <div className="hh-about-hero-bg" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="hh-about-hero-overlay" />
        <div className="hh-about-hero-content">
          <h1 className="hh-about-hero-title">{heroTitle}</h1>
          <p className="hh-about-hero-sub">{heroSubtitle}</p>
        </div>
      </div>

      {/* Story */}
      <div style={containerStyle}>
        <div className="hh-about-story">
          <div className="hh-about-story-img">
            <img src={storyImage} alt={storyTitle} onError={(e) => onImgError(e, storyTitle)} />
          </div>
          <div className="hh-about-story-text">
            <div className="hh-about-story-label">Who We Are</div>
            <h2 className="hh-about-story-h">{storyTitle}</h2>
            <p className="hh-about-story-p">{storyText}</p>
          </div>
        </div>

        {/* Mission */}
        <div className="hh-about-mission">
          <h3>{missionTitle}</h3>
          <p>{missionText}</p>
        </div>

        {/* Features */}
        <HealthSectionTitle title="Why Choose Us" subtitle="TRUSTED BY THOUSANDS" />
        <div className="hh-about-features">
          {featureItems.map((f, i) => (
            <div key={i} className="hh-about-feat-card">
              <div className="hh-about-feat-icon">{f.icon}</div>
              <h4 className="hh-about-feat-title">{f.title}</h4>
              <p className="hh-about-feat-desc">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <div className="hh-about-team">
          <HealthSectionTitle title={teamTitle} subtitle={teamSubtitle} />
          <div className="hh-about-team-grid">
            {teamItems.map((m, i) => (
              <div key={i} className="hh-about-team-card">
                <img className="hh-about-team-img" src={m.image || `${IMG}/2023/08/w-pas-customer-${(i % 6) + 1}.jpg`} alt={m.name} onError={(e) => onImgError(e, m.name)} />
                <h5 className="hh-about-team-name">{m.name}</h5>
                <div className="hh-about-team-role">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT US PAGE
   Health-styled contact page with info, FAQ, and form.
   ═══════════════════════════════════════════════════════════════ */

export interface HealthContactFaq {
  question: string;
  answer: string;
}

export interface HealthContactPageProps {
  heroTitle?: string;
  heroSubtitle?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  formTitle?: string;
  formSubtitle?: string;
  faqTitle?: string;
  faqs?: HealthContactFaq[];
}

export function HealthContactPage({
  heroTitle = "Contact Us",
  heroSubtitle = "Have a question about our products or need help with your order? We're here to help you on your wellness journey.",
  address = "123 Wellness Ave, Portland, OR 97201",
  phone = "(503) 555-0123",
  email = "hello@store.com",
  hours = "Monday - Saturday, 9:00 AM - 6:00 PM",
  formTitle = "Send Us a Message",
  formSubtitle = "We typically respond within 24 hours",
  faqTitle = "Frequently Asked Questions",
  faqs,
}: HealthContactPageProps) {
  const storeCtx = useContext(HealthStoreContext);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const defaultFaqs: HealthContactFaq[] = [
    { question: "Can you recommend a supplement routine?", answer: "Describe your needs and our wellness team can suggest a simple starting point tailored to your goals." },
    { question: "Do you offer bulk or subscription pricing?", answer: "Yes! We offer discounts on repeat orders and bulk purchases. Contact us for custom pricing." },
    { question: "How do I know which vitamins to take?", answer: "We recommend reading our ingredient guides and speaking with a healthcare professional for personalized advice." },
    { question: "What is your return policy?", answer: "We accept returns within 30 days of purchase for unopened products. Contact us to initiate a return." },
    { question: "Do you ship internationally?", answer: "Currently we ship within the US. International shipping is coming soon — subscribe to our newsletter for updates." },
  ];

  const faqItems = faqs || defaultFaqs;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const css = `
    .hh-contact-hero { background: ${TOKENS.primaryColor}; padding: 80px 20px; text-align: center; margin-bottom: 60px; }
    .hh-contact-hero-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 48px; color: #fff; margin: 0 0 15px; }
    .hh-contact-hero-sub { font-family: ${TOKENS.bodyFont}; font-size: 18px; line-height: 28px; color: rgba(255,255,255,0.9); max-width: 600px; margin: 0 auto; }
    .hh-contact-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 50px; margin-bottom: 80px; }
    .hh-contact-info-card { background: ${TOKENS.bgLight}; border-radius: ${TOKENS.borderRadius}; padding: 40px; }
    .hh-contact-info-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 24px; color: ${TOKENS.titleColor}; margin: 0 0 25px; }
    .hh-contact-info-item { display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px; font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor}; line-height: 24px; }
    .hh-contact-info-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
    .hh-contact-info-label { font-weight: 600; color: ${TOKENS.titleColor}; display: block; margin-bottom: 3px; font-size: 14px; }
    .hh-contact-form-wrap { background: #fff; border: 1px solid #eee; border-radius: ${TOKENS.borderRadius}; padding: 40px; }
    .hh-contact-form-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 24px; color: ${TOKENS.titleColor}; margin: 0 0 5px; }
    .hh-contact-form-sub { font-family: ${TOKENS.bodyFont}; font-size: 14px; color: ${TOKENS.textColor}; margin: 0 0 25px; }
    .hh-contact-field { margin-bottom: 18px; }
    .hh-contact-label { display: block; font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 600; color: ${TOKENS.titleColor}; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .hh-contact-input { width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-family: ${TOKENS.bodyFont}; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
    .hh-contact-input:focus { border-color: ${TOKENS.primaryColor}; }
    .hh-contact-textarea { min-height: 120px; resize: vertical; }
    .hh-contact-submit { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; border: none; border-radius: 35px; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: background 0.3s; }
    .hh-contact-submit:hover { filter: brightness(0.9); }
    .hh-contact-success { text-align: center; padding: 40px 20px; }
    .hh-contact-success-icon { font-size: 48px; margin-bottom: 15px; }
    .hh-contact-success h3 { font-family: ${TOKENS.titleFont}; font-size: 24px; color: ${TOKENS.titleColor}; margin: 0 0 10px; }
    .hh-contact-success p { font-family: ${TOKENS.bodyFont}; font-size: 15px; color: ${TOKENS.textColor}; }
    .hh-faq-section { margin-bottom: 80px; }
    .hh-faq-item { border-bottom: 1px solid #eee; }
    .hh-faq-q { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; cursor: pointer; font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 16px; color: ${TOKENS.titleColor}; transition: color 0.2s; }
    .hh-faq-q:hover { color: ${TOKENS.primaryColor}; }
    .hh-faq-toggle { font-size: 20px; color: ${TOKENS.primaryColor}; flex-shrink: 0; margin-left: 15px; transition: transform 0.3s; }
    .hh-faq-a { padding: 0 0 20px; font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 26px; color: ${TOKENS.textColor}; }
    @media (max-width: 768px) { .hh-contact-grid { grid-template-columns: 1fr; gap: 30px; } .hh-contact-hero-title { font-size: 32px; } .hh-contact-hero { padding: 50px 20px; } }
  `;

  return (
    <>
      <ScopedStyles id="contact-page" css={css} />
      {/* Hero */}
      <div className="hh-contact-hero">
        <h1 className="hh-contact-hero-title">{heroTitle}</h1>
        <p className="hh-contact-hero-sub">{heroSubtitle}</p>
      </div>

      <div style={containerStyle}>
        {/* Info + Form Grid */}
        <div className="hh-contact-grid">
          <div className="hh-contact-info-card">
            <h3 className="hh-contact-info-title">Get In Touch</h3>
            <div className="hh-contact-info-item">
              <span className="hh-contact-info-icon">📍</span>
              <div><span className="hh-contact-info-label">Address</span>{address}</div>
            </div>
            <div className="hh-contact-info-item">
              <span className="hh-contact-info-icon">📞</span>
              <div><span className="hh-contact-info-label">Phone</span>{phone}</div>
            </div>
            <div className="hh-contact-info-item">
              <span className="hh-contact-info-icon">✉️</span>
              <div><span className="hh-contact-info-label">Email</span>{email}</div>
            </div>
            <div className="hh-contact-info-item">
              <span className="hh-contact-info-icon">🕐</span>
              <div><span className="hh-contact-info-label">Working Hours</span>{hours}</div>
            </div>
          </div>

          <div className="hh-contact-form-wrap">
            {submitted ? (
              <div className="hh-contact-success">
                <div className="hh-contact-success-icon">✅</div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <>
                <h3 className="hh-contact-form-title">{formTitle}</h3>
                <p className="hh-contact-form-sub">{formSubtitle}</p>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                    <div className="hh-contact-field">
                      <label className="hh-contact-label">Name</label>
                      <input className="hh-contact-input" type="text" placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="hh-contact-field">
                      <label className="hh-contact-label">Email</label>
                      <input className="hh-contact-input" type="email" placeholder="Your email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                  </div>
                  <div className="hh-contact-field">
                    <label className="hh-contact-label">Subject</label>
                    <input className="hh-contact-input" type="text" placeholder="How can we help?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                  </div>
                  <div className="hh-contact-field">
                    <label className="hh-contact-label">Message</label>
                    <textarea className="hh-contact-input hh-contact-textarea" placeholder="Tell us more..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
                  </div>
                  <button className="hh-contact-submit" type="submit">Send Message</button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="hh-faq-section">
          <HealthSectionTitle title={faqTitle} />
          {faqItems.map((faq, i) => (
            <div key={i} className="hh-faq-item">
              <div className="hh-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.question}
                <span className="hh-faq-toggle" style={{ transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
              </div>
              {openFaq === i && <div className="hh-faq-a">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLOG / EDITORIAL PAGE
   Health-styled blog listing page with categories and posts.
   ═══════════════════════════════════════════════════════════════ */

export interface HealthBlogPagePost {
  title: string;
  image: string;
  date: string;
  author?: string;
  excerpt?: string;
  category?: string;
  link?: string;
}

export interface HealthBlogPageProps {
  heroTitle?: string;
  heroSubtitle?: string;
  featuredPost?: HealthBlogPagePost;
  posts?: HealthBlogPagePost[];
  categories?: string[];
}

export function HealthBlogPage({
  heroTitle = "Health & Wellness Blog",
  heroSubtitle = "Expert advice on vitamins, supplements, and building a healthier lifestyle.",
  featuredPost,
  posts,
  categories,
}: HealthBlogPageProps) {
  const defaultFeatured: HealthBlogPagePost = {
    title: "What is fiber and why is it important for health?",
    image: `${IMG}/2023/09/w-pas-blog-1.jpg`,
    date: "September 5, 2023",
    author: "Wellness Team",
    excerpt: "Fiber is one of the most underrated nutrients. Learn how it supports digestion, heart health, and sustained energy throughout the day.",
    category: "Nutrition",
  };

  const defaultPosts: HealthBlogPagePost[] = [
    { title: "5 ways to celebrate your mom on Mother's Day", image: `${IMG}/2023/09/w-pas-blog-2-400x247.jpg`, date: "September 4, 2023", author: "Admin", category: "Motivation", excerpt: "Simple, meaningful gestures that go beyond flowers and cards." },
    { title: "Syncing Up for an Integrated Brain", image: `${IMG}/2023/09/w-pas-blog-3-400x247.jpg`, date: "September 4, 2023", author: "Admin", category: "Health", excerpt: "How sleep, nutrition, and movement work together for cognitive clarity." },
    { title: "The Complete Guide to Vitamin D", image: `${IMG}/2023/08/w-pas-ev-60-softgel-1.jpg`, date: "August 28, 2023", author: "Dr. Sarah M.", category: "Vitamins", excerpt: "Why vitamin D matters, how much you need, and the best ways to get it." },
    { title: "Understanding Melatonin and Sleep Quality", image: `${IMG}/2023/08/w-pas-sl-30-capsules-1.jpg`, date: "August 20, 2023", author: "Wellness Team", category: "Sleep", excerpt: "A closer look at how melatonin supplements can support your natural sleep cycle." },
    { title: "Top 5 Supplements for Hair Health", image: `${IMG}/2023/08/w-pas-hr-60-capsules-1.jpg`, date: "August 15, 2023", author: "Admin", category: "Hair", excerpt: "From biotin to collagen — the supplements that actually support healthy hair growth." },
    { title: "Allergy Season: Natural Relief Options", image: `${IMG}/2023/08/w-pas-ar-30-tablets-1.jpg`, date: "August 10, 2023", author: "Admin", category: "Health", excerpt: "Explore natural approaches to managing seasonal allergies alongside traditional treatments." },
  ];

  const defaultCategories = ["All", "Health", "Nutrition", "Vitamins", "Sleep", "Motivation"];

  const featured = featuredPost || defaultFeatured;
  const postItems = posts || defaultPosts;
  const catItems = categories || defaultCategories;
  const [activeCat, setActiveCat] = useState("All");

  const filteredPosts = activeCat === "All" ? postItems : postItems.filter(p => p.category === activeCat);

  const css = `
    .hh-blog-hero { background: ${TOKENS.bgLight}; padding: 60px 20px; text-align: center; margin-bottom: 60px; }
    .hh-blog-hero-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 48px; color: ${TOKENS.titleColor}; margin: 0 0 15px; }
    .hh-blog-hero-sub { font-family: ${TOKENS.bodyFont}; font-size: 18px; color: ${TOKENS.textColor}; max-width: 600px; margin: 0 auto; }
    .hh-blog-featured { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; margin-bottom: 60px; border-radius: ${TOKENS.borderRadius}; overflow: hidden; background: #fff; border: 1px solid #f0f0f0; }
    .hh-blog-featured-img { overflow: hidden; }
    .hh-blog-featured-img img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 350px; transition: transform 0.5s; }
    .hh-blog-featured:hover .hh-blog-featured-img img { transform: scale(1.03); }
    .hh-blog-featured-content { padding: 40px; display: flex; flex-direction: column; justify-content: center; }
    .hh-blog-featured-cat { display: inline-block; padding: 4px 12px; background: rgba(136,173,153,0.12); color: ${TOKENS.primaryColor}; font-family: ${TOKENS.bodyFont}; font-size: 12px; font-weight: 600; border-radius: 4px; margin-bottom: 12px; text-transform: uppercase; width: fit-content; }
    .hh-blog-featured-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 28px; line-height: 38px; color: ${TOKENS.titleColor}; margin: 0 0 15px; }
    .hh-blog-featured-excerpt { font-family: ${TOKENS.bodyFont}; font-size: 15px; line-height: 26px; color: ${TOKENS.textColor}; margin: 0 0 20px; }
    .hh-blog-featured-meta { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; }
    .hh-blog-featured-read { display: inline-block; margin-top: 20px; padding: 10px 25px; background: ${TOKENS.primaryColor}; color: #fff; border-radius: 25px; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; text-decoration: none; text-transform: uppercase; transition: background 0.3s; }
    .hh-blog-featured-read:hover { filter: brightness(0.9); }
    .hh-blog-cats { display: flex; gap: 10px; margin-bottom: 40px; flex-wrap: wrap; justify-content: center; }
    .hh-blog-cat-btn { padding: 8px 20px; border: 1px solid #ddd; border-radius: 25px; background: #fff; font-family: ${TOKENS.bodyFont}; font-size: 13px; font-weight: 600; color: ${TOKENS.titleColor}; cursor: pointer; transition: all 0.2s; }
    .hh-blog-cat-btn:hover { border-color: ${TOKENS.primaryColor}; color: ${TOKENS.primaryColor}; }
    .hh-blog-cat-btn.active { background: ${TOKENS.primaryColor}; color: #fff; border-color: ${TOKENS.primaryColor}; }
    .hh-blog-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 80px; }
    .hh-blog-list-card { border-radius: 10px; overflow: hidden; background: #fff; border: 1px solid #f0f0f0; transition: box-shadow 0.3s; }
    .hh-blog-list-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.06); }
    .hh-blog-list-img { width: 100%; height: 200px; object-fit: cover; display: block; transition: transform 0.5s; }
    .hh-blog-list-card:hover .hh-blog-list-img { transform: scale(1.05); }
    .hh-blog-list-body { padding: 20px; }
    .hh-blog-list-cat { font-family: ${TOKENS.bodyFont}; font-size: 11px; color: ${TOKENS.primaryColor}; background: rgba(136,173,153,0.1); display: inline-block; padding: 3px 10px; border-radius: 3px; margin-bottom: 10px; text-transform: uppercase; font-weight: 600; }
    .hh-blog-list-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 17px; line-height: 1.4; color: ${TOKENS.titleColor}; margin: 0 0 8px; }
    .hh-blog-list-excerpt { font-family: ${TOKENS.bodyFont}; font-size: 13px; line-height: 22px; color: ${TOKENS.textColor}; margin: 0 0 12px; }
    .hh-blog-list-meta { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; }
    @media (max-width: 1024px) { .hh-blog-featured { grid-template-columns: 1fr; } .hh-blog-list { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .hh-blog-hero-title { font-size: 32px; } .hh-blog-list { grid-template-columns: 1fr; } }
  `;

  return (
    <>
      <ScopedStyles id="blog-page" css={css} />
      {/* Hero */}
      <div className="hh-blog-hero">
        <h1 className="hh-blog-hero-title">{heroTitle}</h1>
        <p className="hh-blog-hero-sub">{heroSubtitle}</p>
      </div>

      <div style={containerStyle}>
        {/* Featured Post */}
        <div className="hh-blog-featured">
          <div className="hh-blog-featured-img">
            <img src={featured.image} alt={featured.title} onError={(e) => onImgError(e, featured.title)} />
          </div>
          <div className="hh-blog-featured-content">
            {featured.category && <span className="hh-blog-featured-cat">{featured.category}</span>}
            <h2 className="hh-blog-featured-title">{featured.title}</h2>
            {featured.excerpt && <p className="hh-blog-featured-excerpt">{featured.excerpt}</p>}
            <div className="hh-blog-featured-meta">by {featured.author || "Admin"} · {featured.date}</div>
            <span className="hh-blog-featured-read">Read Article</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="hh-blog-cats">
          {catItems.map((cat) => (
            <button key={cat} className={`hh-blog-cat-btn ${activeCat === cat ? "active" : ""}`} onClick={() => setActiveCat(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {/* Post Grid */}
        <div className="hh-blog-list">
          {filteredPosts.map((post, i) => (
            <div key={i} className="hh-blog-list-card">
              <div style={{ overflow: "hidden" }}>
                <img className="hh-blog-list-img" src={post.image} alt={post.title} onError={(e) => onImgError(e, post.title)} />
              </div>
              <div className="hh-blog-list-body">
                {post.category && <span className="hh-blog-list-cat">{post.category}</span>}
                <h3 className="hh-blog-list-title">{post.title}</h3>
                {post.excerpt && <p className="hh-blog-list-excerpt">{post.excerpt}</p>}
                <div className="hh-blog-list-meta">by {post.author || "Admin"} · {post.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INGREDIENTS PAGE
   Health-styled ingredients/transparency page.
   ═══════════════════════════════════════════════════════════════ */

export interface HealthIngredient {
  name: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface HealthIngredientsPageProps {
  heroTitle?: string;
  heroSubtitle?: string;
  introTitle?: string;
  introText?: string;
  ingredients?: HealthIngredient[];
  ctaTitle?: string;
  ctaText?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
}

export function HealthIngredientsPage({
  heroTitle = "Our Ingredients",
  heroSubtitle = "Transparency is at the heart of everything we do. Learn about the natural ingredients behind our supplements.",
  introTitle = "What Goes Into Our Products",
  introText = "Every ingredient is carefully selected for its proven benefits and sourced from trusted suppliers. We never use artificial fillers, synthetic dyes, or unnecessary additives.",
  ingredients,
  ctaTitle = "Ready to Start Your Wellness Journey?",
  ctaText = "Explore our full range of supplements made with these trusted ingredients.",
  ctaButtonText = "Shop All Products",
  ctaButtonLink = "/shop",
}: HealthIngredientsPageProps) {
  const storeCtx = useContext(HealthStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const defaultIngredients: HealthIngredient[] = [
    { name: "Vitamin D3", icon: "☀️", description: "Essential for bone health, immune function, and mood regulation. Sourced from lanolin (sheep's wool) for high bioavailability." },
    { name: "Vitamin K2 (MK-7)", icon: "🌿", description: "Works synergistically with D3 to direct calcium to bones and teeth. Derived from fermented natto for maximum absorption." },
    { name: "Omega-3 (EPA & DHA)", icon: "🐟", description: "Premium fish oil supporting heart, brain, and joint health. Molecularly distilled to remove contaminants." },
    { name: "Melatonin", icon: "🌙", description: "A natural hormone that supports healthy sleep cycles. Our low-dose formula promotes restful sleep without grogginess." },
    { name: "Biotin (B7)", icon: "💇", description: "Supports healthy hair, skin, and nails. Water-soluble B vitamin that aids in keratin production." },
    { name: "Marine Collagen", icon: "✨", description: "Type I collagen peptides from wild-caught fish. Supports skin elasticity, joint comfort, and gut health." },
    { name: "Ashwagandha", icon: "🧘", description: "Adaptogenic herb used for centuries to support stress management, energy, and cognitive clarity." },
    { name: "Zinc Picolinate", icon: "🛡️", description: "Highly absorbable form of zinc supporting immune function, wound healing, and cellular metabolism." },
  ];

  const items = ingredients || defaultIngredients;

  const css = `
    .hh-ingr-hero { background: linear-gradient(135deg, ${TOKENS.primaryColor} 0%, rgb(80,130,100) 100%); padding: 80px 20px; text-align: center; margin-bottom: 60px; }
    .hh-ingr-hero-title { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 48px; color: #fff; margin: 0 0 15px; }
    .hh-ingr-hero-sub { font-family: ${TOKENS.bodyFont}; font-size: 18px; line-height: 28px; color: rgba(255,255,255,0.9); max-width: 650px; margin: 0 auto; }
    .hh-ingr-intro { text-align: center; margin-bottom: 60px; }
    .hh-ingr-intro h2 { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 34px; color: ${TOKENS.titleColor}; margin: 0 0 15px; }
    .hh-ingr-intro p { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 28px; color: ${TOKENS.textColor}; max-width: 650px; margin: 0 auto; }
    .hh-ingr-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 80px; }
    .hh-ingr-card { display: flex; gap: 20px; padding: 30px; background: ${TOKENS.bgLight}; border-radius: 10px; transition: box-shadow 0.3s; align-items: flex-start; }
    .hh-ingr-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.06); }
    .hh-ingr-icon { font-size: 32px; flex-shrink: 0; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 12px; }
    .hh-ingr-name { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 18px; color: ${TOKENS.titleColor}; margin: 0 0 8px; }
    .hh-ingr-desc { font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 24px; color: ${TOKENS.textColor}; margin: 0; }
    .hh-ingr-cta { background: ${TOKENS.bgLight}; border-radius: ${TOKENS.borderRadius}; padding: 60px; text-align: center; margin-bottom: 80px; }
    .hh-ingr-cta h3 { font-family: ${TOKENS.titleFont}; font-weight: 500; font-size: 34px; color: ${TOKENS.titleColor}; margin: 0 0 12px; }
    .hh-ingr-cta p { font-family: ${TOKENS.bodyFont}; font-size: 16px; color: ${TOKENS.textColor}; margin: 0 0 25px; }
    .hh-ingr-cta a { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; border-radius: 35px; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 14px; text-decoration: none; text-transform: uppercase; transition: background 0.3s; }
    .hh-ingr-cta a:hover { filter: brightness(0.9); }
    @media (max-width: 768px) { .hh-ingr-grid { grid-template-columns: 1fr; } .hh-ingr-hero-title { font-size: 32px; } .hh-ingr-hero { padding: 50px 20px; } .hh-ingr-cta { padding: 40px 20px; } }
  `;

  return (
    <>
      <ScopedStyles id="ingredients-page" css={css} />
      <div className="hh-ingr-hero">
        <h1 className="hh-ingr-hero-title">{heroTitle}</h1>
        <p className="hh-ingr-hero-sub">{heroSubtitle}</p>
      </div>

      <div style={containerStyle}>
        <div className="hh-ingr-intro">
          <h2>{introTitle}</h2>
          <p>{introText}</p>
        </div>

        <div className="hh-ingr-grid">
          {items.map((ing, i) => (
            <div key={i} className="hh-ingr-card">
              <div className="hh-ingr-icon">{ing.icon || "💊"}</div>
              <div>
                <h4 className="hh-ingr-name">{ing.name}</h4>
                <p className="hh-ingr-desc">{ing.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="hh-ingr-cta">
          <h3>{ctaTitle}</h3>
          <p>{ctaText}</p>
          <Link href={fixLink(ctaButtonLink)}>{ctaButtonText}</Link>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LEGACY FOOTER (kept for backward compat)
   ═══════════════════════════════════════════════════════════════ */

export function HealthFooter(props: React.ComponentProps<typeof FashionFooter>) {
  const storeCtx = useContext(HealthStoreContext);
  return <FashionFooter {...props} storeSlug={storeCtx?.storeSlug} />;
}
