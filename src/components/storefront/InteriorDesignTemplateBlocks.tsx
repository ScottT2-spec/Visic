"use client";
import { FashionFooter } from "./FashionTemplateBlocks";
import Link from "next/link";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { safeSrc, onImgError } from "./image-fallback";

/* ═══════════════════════════════════════════════════════════════
   INTERIOR DESIGN (RETAIL) TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart Retail template sections.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "var(--color-primary)",
  primaryHover: "var(--color-primary)", // Will use CSS filter for hover effect
  altColor: "var(--color-accent)",
  titleColor: "var(--color-text)",
  textColor: "var(--color-muted-text)",
  entityTitleColor: "var(--color-text)",
  linkColor: "var(--color-text)",
  starColor: "var(--color-accent)",
  footerBg: "var(--color-background)",
  bgWhite: "#ffffff",
  containerWidth: "1222px",
  borderRadius: "0px",
  titleFont: "'Cabin', Arial, Helvetica, sans-serif",
  bodyFont: "'Cabin', Arial, Helvetica, sans-serif",
};

const IMG = "https://woodmart.xtemos.com/wp-content/uploads";

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function InteriorFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&family=Raleway:wght@400;600;700&family=Sora:wght@400;600&display=swap');
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

function ScopedStyles({ id, css }: { id: string; css: string }) {
  return <style data-interior-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
}

/* ═══════════════════════════════════════════════════════════════
   STORE CONTEXT
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  comparePrice?: string;
  image: string;
  hoverImage?: string;
  category: string;
  rating?: number;
  badge?: string;
  tags?: string[];
}

export interface InteriorStoreContextData {
  storeSlug?: string;
  products?: InteriorProduct[];
  storeName?: string;
  storeLogo?: string;
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

export const InteriorStoreContext = createContext<InteriorStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorHeroSlide {
  titleLine1: string;
  titleLine2?: string;
  subtitle?: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  sideImage?: string;
}

export interface InteriorHeroSliderProps {
  slides?: InteriorHeroSlide[];
  autoplaySpeed?: number;
}

export function InteriorHeroSlider({ slides, autoplaySpeed = 5000 }: InteriorHeroSliderProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const defaultSlides: InteriorHeroSlide[] = [
    {
      subtitle: "SALE PRODUCTS",
      titleLine1: "Lamp",
      description: "Explore our curated collection of modern lighting for your home.",
      buttonText: "Shop Now",
      buttonLink: "#",
      image: `${IMG}/2018/08/slide-1.jpg`,
      sideImage: `${IMG}/2018/10/side-product-cutdown-opt.jpg`,
    },
    {
      subtitle: "SALE PRODUCTS",
      titleLine1: "Floor Lamp",
      description: "Elegant floor lamps that blend style with functionality.",
      buttonText: "Shop Now",
      buttonLink: "#",
      image: `${IMG}/2018/08/slide-2.jpg`,
      sideImage: `${IMG}/2018/10/side-product-cutdown-2-opt.jpg`,
    },
    {
      subtitle: "MOST POPULAR",
      titleLine1: "Floor Lamp",
      titleLine2: "",
      description: "Discover our most popular interior design pieces.",
      buttonText: "Shop Now",
      buttonLink: "#",
      image: `${IMG}/2018/08/slide-3.jpg`,
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
    .id-slider { position: relative; width: 100%; min-height: 560px; overflow: hidden; background: #f5f5f5; }
    .id-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; display: flex; align-items: center; }
    .id-slide.id-active { opacity: 1; position: relative; }
    .id-slide-inner { width: 100%; display: flex; align-items: center; }
    .id-slide-text { flex: 1; padding: 60px 0 60px 80px; z-index: 2; }
    .id-slide-subtitle { font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; color: ${TOKENS.primaryColor}; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px; }
    .id-slide-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 72px; line-height: 1.1; color: ${TOKENS.titleColor}; margin: 0 0 15px; }
    .id-slide-desc { font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 26px; color: ${TOKENS.textColor}; margin: 0 0 30px; max-width: 400px; }
    .id-slide-btn { display: inline-block; padding: 14px 35px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; border: none; cursor: pointer; }
    .id-slide-btn:hover { filter: brightness(0.9); }
    .id-slide-img { flex: 1; position: relative; height: 560px; overflow: hidden; }
    .id-slide-img img { width: 100%; height: 100%; object-fit: cover; }
    .id-slide-side { position: absolute; bottom: 30px; left: -60px; width: 200px; height: 200px; border: 5px solid #fff; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
    .id-slide-side img { width: 100%; height: 100%; object-fit: cover; }
    .id-dots { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 5; }
    .id-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid ${TOKENS.primaryColor}; background: transparent; cursor: pointer; padding: 0; transition: all 0.3s; }
    .id-dot.id-active { background: ${TOKENS.primaryColor}; }
    @media (max-width: 1024px) { .id-slide-title { font-size: 48px; } .id-slide-text { padding-left: 40px; } }
    @media (max-width: 767px) { .id-slide-title { font-size: 36px; } .id-slide-img { display: none; } .id-slide-text { padding: 40px 20px; } .id-slider { min-height: 400px; } }
  `;

  return (
    <div className="id-slider">
      <ScopedStyles id="hero-slider" css={css} />
      {items.map((slide, i) => (
        <div key={i} className={`id-slide ${i === current ? "id-active" : ""}`}>
          <div className="id-slide-inner">
            <div className="id-slide-text">
              {slide.subtitle && <div className="id-slide-subtitle">{slide.subtitle}</div>}
              <h2 className="id-slide-title">{slide.titleLine1}{slide.titleLine2 && <><br />{slide.titleLine2}</>}</h2>
              {slide.description && <p className="id-slide-desc">{slide.description}</p>}
              <Link href={fixLink(slide.buttonLink)} className="id-slide-btn">{slide.buttonText}</Link>
            </div>
            <div className="id-slide-img">
              <img src={slide.image} alt={slide.titleLine1}  onError={(e) => onImgError(e, slide.titleLine1)} />
              {slide.sideImage && (
                <div className="id-slide-side"><img src={slide.sideImage} alt="Featured"  onError={(e) => onImgError(e, "fallback")} /></div>
              )}
            </div>
          </div>
        </div>
      ))}
      {items.length > 1 && (
        <div className="id-dots">
          {items.map((_, i) => (
            <button key={i} className={`id-dot ${i === current ? "id-active" : ""}`} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. SECTION TITLE
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorSectionTitleProps {
  title: string;
  align?: "left" | "center" | "right";
  after?: React.ReactNode;
}

export function InteriorSectionTitle({ title, align = "center", after }: InteriorSectionTitleProps) {
  return (
    <div style={{ ...containerStyle, textAlign: align, marginBottom: "30px" }}>
      <h4 style={{ fontFamily: TOKENS.titleFont, fontWeight: 600, fontSize: "22px", lineHeight: "1.3", color: TOKENS.titleColor, margin: "0 0 5px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>{title}</h4>
      {after}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. TOP CATEGORIES GRID
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorCategory {
  name: string;
  image: string;
  icon?: string;
  link?: string;
}

export interface InteriorCategoryGridProps {
  sectionTitle?: string;
  categories?: InteriorCategory[];
  columns?: number;
}

export function InteriorCategoryGrid({ sectionTitle = "TOP CATEGORIES", categories, columns = 6 }: InteriorCategoryGridProps) {
  const defaultCategories: InteriorCategory[] = [
    { name: "Lighting", image: `${IMG}/2018/10/retail-category-1-opt.jpg`, icon: `${IMG}/2025/05/wd-light-bulb.svg` },
    { name: "Clocks", image: `${IMG}/2018/10/retail-category-2-opt.jpg`, icon: `${IMG}/2025/05/wd-clock.svg` },
    { name: "Furniture", image: `${IMG}/2018/10/retail-category-3-opt.jpg`, icon: `${IMG}/2025/05/wd-chair.svg` },
    { name: "Accessories", image: `${IMG}/2018/10/retail-category-4-opt.jpg`, icon: `${IMG}/2025/05/wd-hand-bag.svg` },
    { name: "Cooking", image: `${IMG}/2018/10/retail-category-5-opt.jpg`, icon: `${IMG}/2025/05/wd-knives.svg` },
    { name: "Toys", image: `${IMG}/2018/10/retail-category-6-opt.jpg`, icon: `${IMG}/2025/05/wd-rocking-horse.svg` },
  ];

  const items = categories || defaultCategories;

  const css = `
    .id-cats { margin-bottom: 60px; }
    .id-cats-grid { display: grid; gap: 20px; }
    .id-cat { text-align: center; cursor: pointer; transition: transform 0.3s; }
    .id-cat:hover { transform: translateY(-5px); }
    .id-cat-img-wrap { position: relative; overflow: hidden; margin-bottom: 15px; border-radius: 50%; width: 160px; height: 160px; margin-left: auto; margin-right: auto; }
    .id-cat-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .id-cat:hover .id-cat-img { transform: scale(1.1); }
    .id-cat-name { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 16px; color: ${TOKENS.entityTitleColor}; }
    @media (max-width: 1024px) { .id-cats-grid { grid-template-columns: repeat(3, 1fr) !important; } }
    @media (max-width: 767px) { .id-cats-grid { grid-template-columns: repeat(2, 1fr) !important; } .id-cat-img-wrap { width: 120px; height: 120px; } }
  `;

  return (
    <div className="id-cats">
      <ScopedStyles id="cats" css={css} />
      <div style={containerStyle}>
        <InteriorSectionTitle title={sectionTitle} />
        <div className="id-cats-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((cat, i) => (
            <div key={i} className="id-cat">
              <div className="id-cat-img-wrap">
                <img className="id-cat-img" src={cat.image} alt={cat.name}  onError={(e) => onImgError(e, cat.name)} />
              </div>
              <span className="id-cat-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. PRODUCT GRID
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorProductGridProps {
  products?: InteriorProduct[];
  columns?: number;
  sectionTitle?: string;
  marginBottom?: string;
  maxProducts?: number;
}

export function InteriorProductGrid({
  products: propProducts,
  columns = 4,
  sectionTitle = "SALE PRODUCTS",
  marginBottom = "60px",
  maxProducts = 8,
}: InteriorProductGridProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const fixLink = (slug: string) => storeCtx?.storeSlug ? `/store/${storeCtx.storeSlug}/product/${slug}` : "#";

  const defaultProducts: InteriorProduct[] = [
    { id: 1, name: "Dark Headphones", slug: "dark-headphones", price: "154.00", image: `${IMG}/2018/10/retail-product-1-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 2, name: "Solo Cook Set", slug: "solo-cook-set", price: "215.00", image: `${IMG}/2018/10/retail-product-2-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 3, name: "Gray Shorts", slug: "gray-shorts", price: "169.00", image: `${IMG}/2018/10/retail-product-3-opt-330x340.jpg`, category: "Retail", rating: 4 },
    { id: 4, name: "Gold Laptop", slug: "gold-laptop", price: "273.00", image: `${IMG}/2018/10/retail-product-4-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 5, name: "Kitchen Chair", slug: "kitchen-chair", price: "199.00", image: `${IMG}/2018/10/retail-product-5-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 6, name: "Smartphone Case", slug: "smartphone-case", price: "149.00", image: `${IMG}/2018/10/retail-product-6-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 7, name: "Dark Mice", slug: "dark-mice", price: "112.00", image: `${IMG}/2018/10/retail-product-7-opt-330x340.jpg`, category: "Retail", rating: 4 },
    { id: 8, name: "Red Sneakers", slug: "red-sneakers", price: "155.00", image: `${IMG}/2018/10/retail-product-8-opt-330x340.jpg`, category: "Retail", rating: 5 },
  ];

  const items = (propProducts || storeCtx?.products || defaultProducts).slice(0, maxProducts);

  const css = `
    .id-products { margin-bottom: ${marginBottom}; }
    .id-prod-grid { display: grid; gap: 20px; }
    .id-prod { background: #fff; overflow: hidden; transition: box-shadow 0.3s; position: relative; text-align: center; }
    .id-prod:hover { box-shadow: 0 5px 20px rgba(0,0,0,0.08); }
    .id-prod-img-wrap { position: relative; overflow: hidden; background: #f5f5f5; }
    .id-prod-img { width: 100%; height: auto; display: block; transition: transform 0.5s; }
    .id-prod:hover .id-prod-img { transform: scale(1.05); }
    .id-prod-info { padding: 15px 15px 20px; }
    .id-prod-cat { font-family: ${TOKENS.bodyFont}; font-size: 11px; color: ${TOKENS.textColor}; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
    .id-prod-name { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 15px; color: ${TOKENS.entityTitleColor}; margin: 0 0 6px; }
    .id-prod-name a { color: inherit; text-decoration: none; }
    .id-prod-name a:hover { color: rgba(51,51,51,0.65); }
    .id-prod-price { font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 15px; color: ${TOKENS.titleColor}; }
    .id-prod-price del { color: ${TOKENS.textColor}; font-weight: 400; font-size: 13px; margin-right: 5px; }
    .id-prod-stars { color: ${TOKENS.starColor}; font-size: 11px; letter-spacing: 1px; margin-bottom: 4px; }
    .id-prod-btn { display: inline-block; margin-top: 8px; padding: 8px 20px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 11px; text-decoration: none; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.3s; }
    .id-prod-btn:hover { filter: brightness(0.9); }
    .id-prod-badge { position: absolute; top: 10px; left: 10px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-size: 11px; font-weight: 600; padding: 3px 10px; text-transform: uppercase; z-index: 2; }
    @media (max-width: 1024px) { .id-prod-grid { grid-template-columns: repeat(3, 1fr) !important; } }
    @media (max-width: 767px) { .id-prod-grid { grid-template-columns: repeat(2, 1fr) !important; } }
  `;

  return (
    <div className="id-products">
      <ScopedStyles id="products" css={css} />
      <div style={containerStyle}>
        {sectionTitle && <InteriorSectionTitle title={sectionTitle} />}
        <div className="id-prod-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((p) => (
            <div key={p.id} className="id-prod">
              {p.badge && <span className="id-prod-badge">{p.badge}</span>}
              <div className="id-prod-img-wrap">
                <img className="id-prod-img" src={p.image || safeSrc(null, p.name)} alt={p.name} onError={(e) => onImgError(e, p.name)} />
              </div>
              <div className="id-prod-info">
                <div className="id-prod-cat">{p.category}</div>
                <h3 className="id-prod-name"><Link href={fixLink(p.slug)}>{p.name}</Link></h3>
                <div className="id-prod-stars">{"★".repeat(p.rating || 5)}{"☆".repeat(5 - (p.rating || 5))}</div>
                <div className="id-prod-price">
                  {p.comparePrice && <del>${p.comparePrice}</del>}
                  ${p.price}
                </div>
                <button className="id-prod-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. INFO BOXES (Home Delivery, Order As Gift, High Quality, Buy With Joy)
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorInfoBox {
  icon: string;
  title: string;
  description: string;
}

export interface InteriorInfoBoxesProps {
  items?: InteriorInfoBox[];
}

export function InteriorInfoBoxes({ items }: InteriorInfoBoxesProps) {
  const defaultItems: InteriorInfoBox[] = [
    { icon: `${IMG}/2018/08/retail-free-shipping.svg`, title: "Home Delivery.", description: "The European languages." },
    { icon: `${IMG}/2018/08/retail-payment.svg`, title: "Order As a Gift.", description: "Donec odio etiam sceles." },
    { icon: `${IMG}/2018/08/retail-delivery-man.svg`, title: "High Quality.", description: "Curabitur hac hac maece." },
    { icon: `${IMG}/2018/08/retail-247.svg`, title: "Buy With Joy.", description: "Ullamcorper magna nec." },
  ];

  const boxes = items || defaultItems;

  const css = `
    .id-infoboxes { margin-bottom: 60px; padding: 40px 0; background: #fff; }
    .id-infobox-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; }
    .id-infobox { display: flex; align-items: center; gap: 15px; padding: 0 15px; border-right: 1px solid #eee; }
    .id-infobox:last-child { border-right: none; }
    .id-infobox-icon { width: 45px; height: 45px; flex-shrink: 0; }
    .id-infobox-icon img { width: 100%; height: 100%; }
    .id-infobox-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 16px; color: ${TOKENS.titleColor}; margin: 0 0 3px; }
    .id-infobox-desc { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; margin: 0; }
    @media (max-width: 767px) { .id-infobox-grid { grid-template-columns: 1fr; } .id-infobox { border-right: none; border-bottom: 1px solid #eee; padding-bottom: 15px; } .id-infobox:last-child { border-bottom: none; } }
  `;

  return (
    <div className="id-infoboxes">
      <ScopedStyles id="infoboxes" css={css} />
      <div style={containerStyle}>
        <div className="id-infobox-grid">
          {boxes.map((box, i) => (
            <div key={i} className="id-infobox">
              <div className="id-infobox-icon"><img src={box.icon} alt={box.title}  onError={(e) => onImgError(e, box.title)} /></div>
              <div>
                <h4 className="id-infobox-title">{box.title}</h4>
                <p className="id-infobox-desc">{box.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. OUTDOOR / GARDEN PRODUCTS
   ═══════════════════════════════════════════════════════════════ */

export function InteriorGardenProducts({ products: propProducts, columns = 4, maxProducts = 6 }: { products?: InteriorProduct[]; columns?: number; maxProducts?: number }) {
  const storeCtx = useContext(InteriorStoreContext);

  const defaultProducts: InteriorProduct[] = [
    { id: 21, name: "Transplanting Trowel", slug: "transplanting-trowel", price: "118.00", image: `${IMG}/2018/10/retail-product-13-opt-330x340.jpg`, category: "Best sellers", rating: 5 },
    { id: 22, name: "Gathering Bag", slug: "gathering-bag", price: "173.00", image: `${IMG}/2018/10/retail-product-14-opt-330x340.jpg`, category: "Best sellers", rating: 5 },
    { id: 23, name: "Garden Scissors", slug: "garden-scissors", price: "168.00", image: `${IMG}/2018/10/retail-product-15-opt-330x340.jpg`, category: "Best sellers", rating: 4 },
    { id: 24, name: "Leaf Rake", slug: "leaf-rake", price: "173.00", image: `${IMG}/2018/10/retail-product-16-opt-330x340.jpg`, category: "Best sellers", rating: 5 },
    { id: 25, name: "Penatibus Nibh", slug: "penatibus-nibh", price: "148.00", image: `${IMG}/2018/10/retail-product-17-opt-330x340.jpg`, category: "Best sellers", rating: 5 },
    { id: 26, name: "Shovel", slug: "shovel", price: "112.00", image: `${IMG}/2018/10/retail-product-18-opt-330x340.jpg`, category: "Best sellers", rating: 5 },
  ];

  return (
    <InteriorProductGrid
      products={propProducts || defaultProducts}
      columns={columns}
      sectionTitle="FAVORITE GARDEN"
      maxProducts={maxProducts}
      marginBottom="60px"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. PROMO BANNERS (2-col layout)
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorPromoBanner {
  subtitle?: string;
  title: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface InteriorPromoBannersProps {
  banners?: InteriorPromoBanner[];
  variant?: "garden" | "furniture";
}

export function InteriorPromoBanners({ banners, variant = "garden" }: InteriorPromoBannersProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const gardenBanners: InteriorPromoBanner[] = [
    { subtitle: "Scelerisque fusce", title: "New Arrival of\nModern Garden Gloves.", image: `${IMG}/2018/10/retail-garden-banner-1-1-opt.jpg`, buttonText: "Shop Now" },
    { subtitle: "A nec augue", title: "Discount 30% Garden Equipment.", image: `${IMG}/2018/10/retail-garden-banner-2-1-opt.jpg`, buttonText: "Shop Now" },
  ];

  const furnitureBanners: InteriorPromoBanner[] = [
    { subtitle: "Mollis tortor", title: "25 Ideas For\nModern Interior", image: `${IMG}/2018/10/retail-furniture-banner-1-2-opt.jpg`, buttonText: "Shop Now" },
    { subtitle: "Cubilia ultricies", title: "Beds And Sofas\nWith 15% Discount.", image: `${IMG}/2018/10/retail-furniture-banner-2-2-opt.jpg`, buttonText: "Shop Now" },
  ];

  const items = banners || (variant === "furniture" ? furnitureBanners : gardenBanners);

  const css = `
    .id-banners { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 60px; }
    .id-banner { position: relative; overflow: hidden; cursor: pointer; min-height: 320px; }
    .id-banner-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s; position: absolute; inset: 0; }
    .id-banner:hover .id-banner-img { transform: scale(1.05); }
    .id-banner-content { position: relative; z-index: 2; padding: 40px; }
    .id-banner-sub { font-family: ${TOKENS.bodyFont}; font-size: 13px; color: ${TOKENS.textColor}; margin-bottom: 10px; }
    .id-banner-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px; line-height: 1.3; color: ${TOKENS.titleColor}; margin: 0 0 20px; white-space: pre-line; }
    .id-banner-btn { display: inline-block; padding: 12px 28px; background: ${TOKENS.primaryColor}; color: #fff; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s; }
    .id-banner-btn:hover { filter: brightness(0.9); }
    @media (max-width: 767px) { .id-banners { grid-template-columns: 1fr; } }
  `;

  return (
    <div style={containerStyle}>
      <ScopedStyles id={"banners-" + variant} css={css} />
      <div className="id-banners">
        {items.map((b, i) => (
          <div key={i} className="id-banner">
            <img className="id-banner-img" src={b.image} alt={b.title}  onError={(e) => onImgError(e, b.title)} />
            <div className="id-banner-content">
              {b.subtitle && <div className="id-banner-sub">{b.subtitle}</div>}
              <h4 className="id-banner-title">{b.title}</h4>
              {b.buttonText && <Link href={resolveStoreLink(b.buttonLink, storeCtx?.storeSlug)} className="id-banner-btn">{b.buttonText}</Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. FURNITURE CATEGORIES
   ═══════════════════════════════════════════════════════════════ */

export function InteriorFurnitureCategories({ categories, columns = 6 }: { categories?: InteriorCategory[]; columns?: number }) {
  const defaultCategories: InteriorCategory[] = [
    { name: "Decore", image: `${IMG}/2018/10/retail-category-7-opt.jpg` },
    { name: "Jewelry", image: `${IMG}/2018/10/retail-category-8-opt-1.jpg` },
    { name: "Marketplace", image: `${IMG}/2018/10/retail-category-9-opt.jpg` },
    { name: "Shoes", image: `${IMG}/2018/10/retail-category-10-opt.jpg` },
    { name: "Electronics", image: `${IMG}/2018/10/retail-category-11-opt.jpg` },
    { name: "Retail", image: `${IMG}/2018/10/retail-category-12-opt.jpg` },
  ];

  return <InteriorCategoryGrid sectionTitle="FURNITURE CATEGORIES" categories={categories || defaultCategories} columns={columns} />;
}

/* ═══════════════════════════════════════════════════════════════
   9. FURNITURE PRODUCTS
   ═══════════════════════════════════════════════════════════════ */

export function InteriorFurnitureProducts({ products: propProducts, columns = 4, maxProducts = 8 }: { products?: InteriorProduct[]; columns?: number; maxProducts?: number }) {
  const defaultProducts: InteriorProduct[] = [
    { id: 31, name: "Gray Chair", slug: "gray-chair", price: "189.00", image: `${IMG}/2018/10/retail-product-19-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 32, name: "Two Pafs", slug: "two-pafs", price: "173.00", image: `${IMG}/2018/10/retail-product-20-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 33, name: "Gray Chair", slug: "gray-chair-2", price: "175.00", image: `${IMG}/2018/10/retail-product-21-opt-330x340.jpg`, category: "Retail", rating: 4 },
    { id: 34, name: "Spotight", slug: "spotlight", price: "169.00", image: `${IMG}/2018/10/retail-product-22-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 35, name: "Wooden Table", slug: "wooden-table", price: "215.00", image: `${IMG}/2018/10/retail-product-23-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 36, name: "Wood Wardrobes", slug: "wood-wardrobes", price: "273.00", image: `${IMG}/2018/10/retail-product-24-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 37, name: "Kids Chair", slug: "kids-chair", price: "148.00", image: `${IMG}/2018/10/retail-product-25-opt-330x340.jpg`, category: "Retail", rating: 5 },
    { id: 38, name: "Table Wood Light", slug: "table-wood-light", price: "199.00", image: `${IMG}/2018/10/retail-product-9-opt-330x340.jpg`, category: "Retail", rating: 5 },
  ];

  return (
    <InteriorProductGrid
      products={propProducts || defaultProducts}
      columns={columns}
      sectionTitle=""
      maxProducts={maxProducts}
      marginBottom="60px"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. BLOG POSTS
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorBlogPost {
  title: string;
  image: string;
  date?: string;
  author?: string;
  link?: string;
}

export interface InteriorBlogPostsProps {
  posts?: InteriorBlogPost[];
  columns?: number;
  sectionTitle?: string;
}

export function InteriorBlogPosts({ posts, columns = 4, sectionTitle = "OUR BLOG" }: InteriorBlogPostsProps) {
  const defaultPosts: InteriorBlogPost[] = [
    { title: "Furniture that explores wood as a material", image: `${IMG}/2018/10/retail-blog-img-1-opt.jpg`, date: "October 18, 2018" },
    { title: "The big design: Wall likes pictures", image: `${IMG}/2018/10/retail-blog-img-2-opt.jpg`, date: "October 18, 2018" },
    { title: "New home decor from John Doerson", image: `${IMG}/2018/10/retail-blog-img-3-opt.jpg`, date: "October 18, 2018" },
    { title: "Collar brings back coffee brewing ritual", image: `${IMG}/2018/10/retail-blog-img-4-opt.jpg`, date: "October 18, 2018" },
  ];

  const items = posts || defaultPosts;

  const css = `
    .id-blog { margin-bottom: 60px; }
    .id-blog-grid { display: grid; gap: 20px; }
    .id-blog-card { overflow: hidden; background: #fff; }
    .id-blog-img-wrap { position: relative; overflow: hidden; }
    .id-blog-img { width: 100%; height: 220px; object-fit: cover; display: block; transition: transform 0.5s; }
    .id-blog-card:hover .id-blog-img { transform: scale(1.05); }
    .id-blog-content { padding: 18px 0; }
    .id-blog-date { font-family: ${TOKENS.bodyFont}; font-size: 12px; color: ${TOKENS.textColor}; margin-bottom: 8px; }
    .id-blog-title { font-family: ${TOKENS.titleFont}; font-weight: 600; font-size: 16px; line-height: 1.4; color: ${TOKENS.entityTitleColor}; margin: 0; cursor: pointer; }
    .id-blog-title:hover { color: rgba(51,51,51,0.65); }
    @media (max-width: 767px) { .id-blog-grid { grid-template-columns: 1fr !important; } }
  `;

  return (
    <div className="id-blog">
      <ScopedStyles id="blog" css={css} />
      <div style={containerStyle}>
        <InteriorSectionTitle title={sectionTitle} />
        <div className="id-blog-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((post, i) => (
            <div key={i} className="id-blog-card">
              <div className="id-blog-img-wrap">
                <img className="id-blog-img" src={post.image} alt={post.title}  onError={(e) => onImgError(e, post.title)} />
              </div>
              <div className="id-blog-content">
                {post.date && <div className="id-blog-date">{post.date}</div>}
                <h3 className="id-blog-title">{post.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. BRANDS BAR
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorBrandsBarProps {
  brands?: { name: string; logo: string; link?: string }[];
}

export function InteriorBrandsBar({ brands }: InteriorBrandsBarProps) {
  const defaultBrands = [
    { name: "Alessi", logo: `${IMG}/2016/09/brand-alessi.png` },
    { name: "Eva Solo", logo: `${IMG}/2016/09/brand-Eva-Solo.png` },
    { name: "Flos", logo: `${IMG}/2016/09/brand-flos.png` },
    { name: "Hay", logo: `${IMG}/2016/09/brand-hay.png` },
    { name: "Joseph Joseph", logo: `${IMG}/2016/09/brand-Joseph-Joseph.png` },
    { name: "Louis Poulsen", logo: `${IMG}/2016/09/brand-Louis-Poulsen.png` },
    { name: "Magisso", logo: `${IMG}/2016/09/brand-Magisso.png` },
    { name: "PackIt", logo: `${IMG}/2016/09/brand-PackIt.png` },
    { name: "Rosenthal", logo: `${IMG}/2016/09/brand-Rosenthal.png` },
    { name: "Witra", logo: `${IMG}/2016/09/brand-witra.png` },
  ];

  const items = brands || defaultBrands;

  const css = `
    .id-brands { padding: 40px 0; margin-bottom: 60px; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
    .id-brands-grid { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
    .id-brand { opacity: 0.5; transition: opacity 0.3s; cursor: pointer; }
    .id-brand:hover { opacity: 1; }
    .id-brand img { height: 30px; width: auto; }
    @media (max-width: 767px) { .id-brands-grid { justify-content: center; } }
  `;

  return (
    <div className="id-brands">
      <ScopedStyles id="brands" css={css} />
      <div style={containerStyle}>
        <div className="id-brands-grid">
          {items.map((brand, i) => (
            <div key={i} className="id-brand">
              <img src={brand.logo} alt={brand.name}  onError={(e) => onImgError(e, brand.name)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   12. CTA SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorCtaProps {
  title?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
}

export function InteriorCta({
  title = "DO YOU LIKE THE THEME?\nSHARE WITH YOUR FRIENDS!",
  buttonText = "Buy Theme",
  buttonLink = "#",
  backgroundColor = TOKENS.primaryColor,
}: InteriorCtaProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const css = `
    .id-cta { padding: 60px 40px; text-align: center; margin-bottom: 0; }
    .id-cta-title { font-family: ${TOKENS.titleFont}; font-weight: 700; font-size: 28px; line-height: 1.4; color: #fff; margin: 0 0 25px; white-space: pre-line; text-transform: uppercase; letter-spacing: 1px; }
    .id-cta-btn { display: inline-block; padding: 14px 35px; background: #fff; color: ${TOKENS.titleColor}; font-family: ${TOKENS.bodyFont}; font-weight: 600; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; transition: opacity 0.3s; border: none; cursor: pointer; }
    .id-cta-btn:hover { opacity: 0.9; }
    @media (max-width: 767px) { .id-cta-title { font-size: 22px; } .id-cta { padding: 40px 20px; } }
  `;

  return (
    <div className="id-cta" style={{ backgroundColor }}>
      <ScopedStyles id="cta" css={css} />
      <h4 className="id-cta-title">{title}</h4>
      <Link href={resolveStoreLink(buttonLink, storeCtx?.storeSlug)} className="id-cta-btn">{buttonText}</Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INTERIOR/DECOR HEADER
   Modern furniture aesthetic. Center nav, right utility icons.
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  cartCount?: number;
  wishlistCount?: number;
  onSearch?: (q: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export function InteriorHeader({
  storeName, storeSlug, logo, cartCount = 0, wishlistCount = 0,
  onSearch, searchQuery = "", onSearchChange,
}: InteriorHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState(searchQuery);
  const base = `/store/${storeSlug}`;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch?.(searchVal.trim());
      onSearchChange?.(searchVal.trim());
      setSearchOpen(false);
      window.location.href = `${base}/shop?q=${encodeURIComponent(searchVal.trim())}`;
    }
  };

  const css = `
    .ih-hdr{background:#fff;border-bottom:1px solid #e5e5e5;font-family:${TOKENS.bodyFont};position:sticky;top:0;z-index:100}
    .ih-inner{max-width:${TOKENS.containerWidth};margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 15px;height:78px}
    .ih-logo{display:flex;align-items:center;gap:8px;text-decoration:none;flex-shrink:0}
    .ih-logo img{height:36px;width:auto}
    .ih-logo-text{font-family:${TOKENS.titleFont};font-size:22px;font-weight:700;color:${TOKENS.titleColor};letter-spacing:-.5px}
    .ih-center{display:flex;align-items:center;gap:28px}
    .ih-center a{font-size:14px;font-weight:600;color:${TOKENS.titleColor};text-decoration:none;text-transform:uppercase;letter-spacing:.5px;transition:color .2s}
    .ih-center a:hover{color:${TOKENS.primaryColor}}
    .ih-right{display:flex;align-items:center;gap:16px}
    .ih-right a,.ih-right button{font-size:13px;font-weight:600;color:${TOKENS.titleColor};text-decoration:none;background:none;border:none;cursor:pointer;padding:0;transition:color .2s;font-family:${TOKENS.bodyFont};display:flex;align-items:center;gap:4px}
    .ih-right a:hover,.ih-right button:hover{color:${TOKENS.primaryColor}}
    .ih-right svg{width:20px;height:20px}
    .ih-cart-btn{position:relative;background:${TOKENS.primaryColor}!important;color:#fff!important;padding:10px 18px!important;border-radius:6px;font-weight:700;font-size:13px;transition:background .2s!important}
    .ih-cart-btn:hover{filter:brightness(0.9)!important}
    .ih-cart-btn svg{width:18px;height:18px;stroke:#fff}
    .ih-cart-badge{background:#fff;color:${TOKENS.primaryColor};font-size:10px;font-weight:800;min-width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-left:4px}
    .ih-sep{width:1px;height:20px;background:#ddd}
    .ih-search-ov{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:200;display:flex;align-items:flex-start;justify-content:center;padding-top:100px}
    .ih-search-box{background:#fff;border-radius:8px;padding:28px;width:90%;max-width:550px;box-shadow:0 16px 48px rgba(0,0,0,.12)}
    .ih-search-box form{display:flex;gap:10px}
    .ih-search-box input{flex:1;border:2px solid #e5e5e5;border-radius:6px;padding:12px 16px;font-size:15px;font-family:${TOKENS.bodyFont};outline:none;transition:border-color .2s}
    .ih-search-box input:focus{border-color:${TOKENS.primaryColor}}
    .ih-search-box button[type=submit]{background:${TOKENS.primaryColor};color:#fff;border:none;border-radius:6px;padding:12px 22px;font-weight:700;cursor:pointer;font-family:${TOKENS.bodyFont};transition:background .2s}
    .ih-search-box button[type=submit]:hover{filter:brightness(0.9)}
    .ih-mob-tog{display:none;background:none;border:none;cursor:pointer;padding:4px;color:${TOKENS.titleColor}}
    .ih-mob-tog svg{width:24px;height:24px}
    .ih-mob-menu{display:none;background:#fff;border-bottom:1px solid #e5e5e5;padding:15px}
    .ih-mob-menu a{display:block;padding:10px 0;font-size:14px;font-weight:600;color:${TOKENS.titleColor};text-decoration:none;border-bottom:1px solid #f2f2f2}
    .ih-mob-menu a:last-child{border-bottom:none}
    @media(max-width:900px){.ih-center,.ih-right-links{display:none!important}.ih-mob-tog{display:block}.ih-mob-menu.ih-open{display:block}.ih-inner{height:58px}}
  `;

  const searchSvg = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
  const cartSvg = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <header className="ih-hdr">
        <div className="ih-inner">
          <button className="ih-mob-tog" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>}
          </button>

          {/* Logo */}
          <Link href={base} className="ih-logo">
            {logo ? <img src={logo} alt={storeName} /> : <span className="ih-logo-text">{storeName}</span>}
          </Link>

          {/* Center nav */}
          <nav className="ih-center">
            <Link href={`${base}/shop`}>Shop All</Link>
            <Link href={`${base}/shop`}>Decor</Link>
            <Link href={`${base}/shop`}>Office</Link>
            <Link href={`${base}/shop`}>Living Room</Link>
            <Link href={`${base}/shop`}>Bedroom</Link>
          </nav>

          {/* Right */}
          <div className="ih-right">
            <div className="ih-right-links" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link href={`${base}/shop`}>Our Story</Link>
              <Link href={`${base}/shop`}>Contact</Link>
              <Link href={`${base}/order-tracking`}>Track Order</Link>
              <Link href={`${base}/shop`}>Help</Link>
              <span className="ih-sep" />
              <Link href={`${base}/my-account`}>Login / Register</Link>
            </div>
            <button onClick={() => setSearchOpen(true)} aria-label="Search" style={{ background: "none", border: "none", cursor: "pointer", color: TOKENS.titleColor, padding: "4px" }}>{searchSvg}</button>
            <Link href={`${base}/cart`} className="ih-cart-btn">
              {cartSvg}
              <span>Cart</span>
              {cartCount > 0 && <span className="ih-cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>

        <div className={`ih-mob-menu ${mobileOpen ? "ih-open" : ""}`}>
          <Link href={base} onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href={`${base}/shop`} onClick={() => setMobileOpen(false)}>Shop All</Link>
          <Link href={`${base}/shop`} onClick={() => setMobileOpen(false)}>Decor</Link>
          <Link href={`${base}/shop`} onClick={() => setMobileOpen(false)}>Office</Link>
          <Link href={`${base}/shop`} onClick={() => setMobileOpen(false)}>Living Room</Link>
          <Link href={`${base}/shop`} onClick={() => setMobileOpen(false)}>Bedroom</Link>
          <Link href={`${base}/shop`} onClick={() => setMobileOpen(false)}>Our Story</Link>
          <Link href={`${base}/shop`} onClick={() => setMobileOpen(false)}>Contact</Link>
          <Link href={`${base}/order-tracking`} onClick={() => setMobileOpen(false)}>Track Order</Link>
          <Link href={`${base}/shop`} onClick={() => setMobileOpen(false)}>Help</Link>
          <Link href={`${base}/my-account`} onClick={() => setMobileOpen(false)}>Login / Register</Link>
          <Link href={`${base}/wishlist`} onClick={() => setMobileOpen(false)}>Wishlist</Link>
        </div>
      </header>

      {searchOpen && (
        <div className="ih-search-ov" onClick={() => setSearchOpen(false)}>
          <div className="ih-search-box" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch}>
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
   INTERIOR/DECOR FOOTER
   Modern dark furniture footer with proper store links
   ═══════════════════════════════════════════════════════════════ */

export interface InteriorFooterFullProps {
  storeName?: string;
  storeSlug?: string;
  logo?: string | null;
  description?: string;
  contact?: { address?: string; phone?: string; email?: string };
  socialLinks?: Array<{ platform: string; url: string }>;
  copyrightText?: string;
}

export function InteriorFooterFull({
  storeName = "Furniture Store",
  storeSlug: storeSlugProp,
  logo,
  description = "Modern furniture designed to bring comfort and elegance into your home.",
  contact = { address: "451 Wall Street, London, UK", phone: "(064) 332-1233", email: "hello@store.com" },
  socialLinks = [],
  copyrightText,
}: InteriorFooterFullProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const slug = storeSlugProp || storeCtx?.storeSlug;
  const base = slug ? `/store/${slug}` : "/";
  const activeSocials = socialLinks.filter(s => s.url && s.url !== "#");
  const socialIcons: Record<string, string> = { facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶", tiktok: "♪" };

  const css = `
    .if-footer{background:${TOKENS.footerBg};font-family:${TOKENS.bodyFont};color:rgba(255,255,255,.7)}
    .if-main{max-width:${TOKENS.containerWidth};margin:0 auto;padding:60px 15px 40px;display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px}
    .if-brand p{font-size:14px;line-height:1.8;margin:14px 0}
    .if-social{display:flex;gap:10px;margin-top:14px}
    .if-social a{width:34px;height:34px;border-radius:50%;background:${TOKENS.primaryColor};color:#fff;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:13px;font-weight:700;transition:background .2s}
    .if-social a:hover{filter:brightness(0.9)}
    .if-col-title{font-family:${TOKENS.titleFont};font-size:15px;font-weight:700;color:#fff;text-transform:uppercase;margin-bottom:18px;letter-spacing:.5px}
    .if-links{list-style:none;margin:0;padding:0}
    .if-links li{margin-bottom:10px}
    .if-links a{font-size:14px;color:rgba(255,255,255,.7);text-decoration:none;transition:color .2s}
    .if-links a:hover{color:${TOKENS.primaryColor}}
    .if-contact{font-size:14px;margin-bottom:10px}
    .if-bottom{border-top:1px solid rgba(255,255,255,.1);max-width:${TOKENS.containerWidth};margin:0 auto;padding:18px 15px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
    .if-bottom small{font-size:13px;color:rgba(255,255,255,.5)}
    .if-bottom small a{color:rgba(255,255,255,.5);text-decoration:none}
    @media(max-width:768px){.if-main{grid-template-columns:1fr;gap:28px;padding:36px 15px 28px}}
    @media(min-width:769px) and (max-width:1024px){.if-main{grid-template-columns:1fr 1fr}}
  `;

  return (
    <footer className="if-footer">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="if-main">
        <div className="if-brand">
          <Link href={base} style={{ textDecoration: "none" }}>
            {logo ? <img src={logo} alt={storeName} style={{ maxWidth: "170px", height: "auto" }} /> : <span style={{ fontFamily: TOKENS.titleFont, fontSize: "20px", fontWeight: 700, color: "#fff" }}>{storeName}</span>}
          </Link>
          <p>{description}</p>
          {contact?.phone && <div className="if-contact">📞 {contact.phone}</div>}
          {contact?.email && <div className="if-contact">✉️ {contact.email}</div>}
          {contact?.address && <div className="if-contact">📍 {contact.address}</div>}
          {activeSocials.length > 0 && (
            <div className="if-social">
              {activeSocials.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform}>{socialIcons[s.platform] || s.platform[0]?.toUpperCase()}</a>)}
            </div>
          )}
        </div>
        <div>
          <h4 className="if-col-title">Shop</h4>
          <ul className="if-links">
            <li><Link href={`${base}/shop`}>Shop All</Link></li>
            <li><Link href={`${base}/shop`}>Decor</Link></li>
            <li><Link href={`${base}/shop`}>Office</Link></li>
            <li><Link href={`${base}/shop`}>Living Room</Link></li>
            <li><Link href={`${base}/shop`}>Bedroom</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="if-col-title">Company</h4>
          <ul className="if-links">
            <li><Link href={`${base}/shop`}>Our Story</Link></li>
            <li><Link href={`${base}/shop`}>Contact</Link></li>
            <li><Link href={`${base}/order-tracking`}>Track Order</Link></li>
            <li><Link href={`${base}/shop`}>Help</Link></li>
            <li><Link href={`${base}/blog`}>Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="if-col-title">Account</h4>
          <ul className="if-links">
            <li><Link href={`${base}/my-account`}>Login / Register</Link></li>
            <li><Link href={`${base}/wishlist`}>Wishlist</Link></li>
            <li><Link href={`${base}/cart`}>Cart</Link></li>
            <li><Link href={`${base}/compare`}>Compare</Link></li>
            <li><Link href={`${base}/reviews`}>Reviews</Link></li>
          </ul>
        </div>
      </div>
      <div className="if-bottom">
        <small><Link href={base}>{copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}</Link></small>
        <img src="https://woodmart.xtemos.com/wp-content/uploads/2018/08/payment.png" alt="Payment methods" style={{ height: "21px" }} loading="lazy" />
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LEGACY FOOTER (kept for backward compat)
   ═══════════════════════════════════════════════════════════════ */

export function InteriorFooter(props: React.ComponentProps<typeof FashionFooter>) {
  const storeCtx = useContext(InteriorStoreContext);
  return <FashionFooter {...props} storeSlug={storeCtx?.storeSlug} />;
}

/* ═══════════════════════════════════════════════════════════════
   GARDEN / HOME & GARDEN DECOR BLOCKS
   New block components for the Retail template — garden aesthetic.
   Primary: #038f81, Fonts: Raleway + Sora
   ═══════════════════════════════════════════════════════════════ */

const GD = {
  primary: "var(--color-primary)",
  primaryHover: "var(--color-primary)",
  accent: "var(--color-accent)",
  titleColor: "var(--color-text)",
  textColor: "var(--color-muted-text)",
  lightText: "#666666",
  white: "#FFFFFF",
  lightBg: "#fbfbfb",
  headingFont: "'Raleway', sans-serif",
  bodyFont: "'Sora', sans-serif",
  containerWidth: "1200px",
};

const gdContainer: React.CSSProperties = {
  maxWidth: GD.containerWidth,
  margin: "0 auto",
  padding: "0 20px",
  boxSizing: "border-box" as const,
  width: "100%",
};

/* ─── GARDEN HERO BANNER ────────────────────────────────────── */

export interface GardenHeroBannerProps {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: string;
  exploreBtns?: Array<{ label: string; link: string }>;
}

export function GardenHeroBanner({
  heading = "Crafted with Care for Memorable Moments",
  subheading = "From timeless pieces to modern accents, create a home that celebrates your unique story.",
  ctaText = "SHOP NOW",
  ctaLink = "/shop",
  image = "https://websitedemos.net/home-garden-decor-02/wp-content/uploads/sites/1034/2025/11/heroimage-1.png",
  exploreBtns,
}: GardenHeroBannerProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const css = `
    .gd-hero { background: ${GD.lightBg}; min-height: 560px; display: flex; align-items: center; overflow: hidden; }
    .gd-hero-inner { display: flex; align-items: center; gap: 40px; width: 100%; }
    .gd-hero-text { flex: 1; padding: 60px 0; }
    .gd-hero-heading { font-family: ${GD.headingFont}; font-weight: 600; font-size: 52px; line-height: 1.15; color: ${GD.titleColor}; margin: 0 0 20px; }
    .gd-hero-sub { font-family: ${GD.bodyFont}; font-size: 16px; line-height: 1.7; color: ${GD.lightText}; margin: 0 0 30px; max-width: 480px; }
    .gd-hero-cta { display: inline-block; padding: 15px 35px; background: ${GD.primary}; color: #fff; font-family: ${GD.headingFont}; font-weight: 700; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 1.5px; transition: background 0.3s; border: none; cursor: pointer; }
    .gd-hero-cta:hover { filter: brightness(0.9); }
    .gd-hero-explore { display: flex; gap: 15px; margin-top: 20px; }
    .gd-hero-explore-btn { font-family: ${GD.headingFont}; font-weight: 600; font-size: 14px; color: ${GD.titleColor}; text-decoration: none; padding: 10px 0; border-bottom: 2px solid ${GD.primary}; transition: color 0.2s; }
    .gd-hero-explore-btn:hover { color: ${GD.primary}; }
    .gd-hero-img { flex: 1; position: relative; display: flex; justify-content: center; }
    .gd-hero-img img { max-width: 100%; max-height: 500px; object-fit: contain; }
    @media (max-width: 900px) {
      .gd-hero-inner { flex-direction: column; text-align: center; }
      .gd-hero-heading { font-size: 36px; }
      .gd-hero-sub { margin-left: auto; margin-right: auto; }
      .gd-hero-explore { justify-content: center; }
      .gd-hero-text { padding: 40px 0 20px; }
    }
  `;

  return (
    <div className="gd-hero">
      <ScopedStyles id="gd-hero" css={css} />
      <div style={gdContainer}>
        <div className="gd-hero-inner">
          <div className="gd-hero-text">
            <h1 className="gd-hero-heading">{heading}</h1>
            <p className="gd-hero-sub">{subheading}</p>
            <Link href={fixLink(ctaLink || "/shop")} className="gd-hero-cta">{ctaText}</Link>
            {exploreBtns && exploreBtns.length > 0 && (
              <div className="gd-hero-explore">
                {exploreBtns.map((btn, i) => (
                  <Link key={i} href={fixLink(btn.link)} className="gd-hero-explore-btn">{btn.label}</Link>
                ))}
              </div>
            )}
          </div>
          <div className="gd-hero-img">
            <img src={image} alt={heading} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── GARDEN CATEGORY BANNER ────────────────────────────────── */

export interface GardenCategoryBannerProps {
  banners?: Array<{ title: string; subtitle?: string; image: string; link?: string }>;
}

export function GardenCategoryBanner({ banners }: GardenCategoryBannerProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);

  const defaultBanners = [
    { title: "Explore Indoor", subtitle: "Home Décor Collection", image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=700&h=500&fit=crop", link: "/shop?category=home-decor" },
    { title: "Explore Outdoor", subtitle: "Garden Décor Collection", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=700&h=500&fit=crop", link: "/shop?category=garden-decor" },
  ];
  const items = banners || defaultBanners;

  const css = `
    .gd-catbanner { padding: 60px 0; }
    .gd-catbanner-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .gd-catbanner-card { position: relative; overflow: hidden; min-height: 320px; cursor: pointer; }
    .gd-catbanner-img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; transition: transform 0.6s ease; }
    .gd-catbanner-card:hover .gd-catbanner-img { transform: scale(1.08); }
    .gd-catbanner-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.25); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2; }
    .gd-catbanner-title { font-family: ${GD.headingFont}; font-weight: 700; font-size: 28px; color: #fff; margin: 0 0 8px; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    .gd-catbanner-sub { font-family: ${GD.bodyFont}; font-size: 14px; color: rgba(255,255,255,0.85); }
    @media (max-width: 700px) { .gd-catbanner-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <div className="gd-catbanner">
      <ScopedStyles id="gd-catbanner" css={css} />
      <div style={gdContainer}>
        <div className="gd-catbanner-grid">
          {items.map((b, i) => (
            <Link key={i} href={fixLink(b.link || "#")} style={{ textDecoration: "none" }}>
              <div className="gd-catbanner-card">
                <img className="gd-catbanner-img" src={b.image} alt={b.title} />
                <div className="gd-catbanner-overlay">
                  <h3 className="gd-catbanner-title">{b.title}</h3>
                  {b.subtitle && <span className="gd-catbanner-sub">{b.subtitle}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── GARDEN DISCOUNT BANNER ────────────────────────────────── */

export interface GardenDiscountBannerProps {
  title?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
}

export function GardenDiscountBanner({
  title = "20% OFF On Your First Order",
  ctaText = "SHOP NOW",
  ctaLink = "/shop",
  backgroundColor = GD.primary,
}: GardenDiscountBannerProps) {
  const storeCtx = useContext(InteriorStoreContext);

  const css = `
    .gd-discount { padding: 50px 20px; text-align: center; }
    .gd-discount-title { font-family: ${GD.headingFont}; font-weight: 700; font-size: 32px; color: #fff; margin: 0 0 25px; letter-spacing: 1px; }
    .gd-discount-btn { display: inline-block; padding: 14px 35px; background: #fff; color: ${GD.titleColor}; font-family: ${GD.headingFont}; font-weight: 700; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 1.5px; transition: all 0.3s; border: none; cursor: pointer; }
    .gd-discount-btn:hover { background: rgba(255,255,255,0.9); }
  `;

  return (
    <div className="gd-discount" style={{ backgroundColor }}>
      <ScopedStyles id="gd-discount" css={css} />
      <h3 className="gd-discount-title">{title}</h3>
      <Link href={resolveStoreLink(ctaLink, storeCtx?.storeSlug)} className="gd-discount-btn">{ctaText}</Link>
    </div>
  );
}

/* ─── GARDEN NEW ARRIVALS (Product Grid) ────────────────────── */

export interface GardenNewArrivalsProps {
  sectionTitle?: string;
  viewAllText?: string;
  viewAllLink?: string;
  columns?: number;
  maxProducts?: number;
  products?: InteriorProduct[];
}

export function GardenNewArrivals({
  sectionTitle = "New Arrivals",
  viewAllText = "EXPLORE ALL PRODUCTS",
  viewAllLink = "/shop",
  columns = 4,
  maxProducts = 8,
  products: propProducts,
}: GardenNewArrivalsProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const fixLink = (slug: string) => storeCtx?.storeSlug ? `/store/${storeCtx.storeSlug}/product/${slug}` : "#";

  const defaultProducts: InteriorProduct[] = [
    { id: 101, name: "Terracotta Planter Set", slug: "terracotta-planter", price: "45.00", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=480&fit=crop", category: "Garden Decor", rating: 5 },
    { id: 102, name: "Woven Rattan Basket", slug: "woven-rattan-basket", price: "38.00", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=480&fit=crop", category: "Home Decor", rating: 5 },
    { id: 103, name: "Ceramic Table Vase", slug: "ceramic-table-vase", price: "32.00", image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=480&fit=crop", category: "Home Decor", rating: 4 },
    { id: 104, name: "Garden Wind Chime", slug: "garden-wind-chime", price: "28.00", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=480&fit=crop", category: "Garden Decor", rating: 5 },
    { id: 105, name: "Macrame Wall Hanging", slug: "macrame-wall-hanging", price: "55.00", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=480&fit=crop", category: "Home Decor", rating: 5 },
    { id: 106, name: "Bamboo Lantern Set", slug: "bamboo-lantern-set", price: "42.00", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=480&fit=crop", category: "Garden Decor", rating: 4 },
    { id: 107, name: "Linen Throw Pillow", slug: "linen-throw-pillow", price: "26.00", image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400&h=480&fit=crop", category: "Home Decor", rating: 5 },
    { id: 108, name: "Herb Garden Kit", slug: "herb-garden-kit", price: "35.00", image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=480&fit=crop", category: "Garden Decor", rating: 5 },
  ];

  const items = (propProducts || storeCtx?.products || defaultProducts).slice(0, maxProducts) as InteriorProduct[];

  const css = `
    .gd-arrivals { padding: 60px 0; }
    .gd-arrivals-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 35px; }
    .gd-arrivals-title { font-family: ${GD.headingFont}; font-weight: 600; font-size: 32px; color: ${GD.titleColor}; margin: 0; }
    .gd-arrivals-link { font-family: ${GD.headingFont}; font-weight: 600; font-size: 13px; color: ${GD.primary}; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid ${GD.primary}; padding-bottom: 2px; transition: opacity 0.2s; }
    .gd-arrivals-link:hover { opacity: 0.7; }
    .gd-arrivals-grid { display: grid; gap: 24px; }
    .gd-prod-card { background: #fff; overflow: hidden; transition: box-shadow 0.3s; }
    .gd-prod-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
    .gd-prod-img-wrap { position: relative; overflow: hidden; background: ${GD.lightBg}; aspect-ratio: 5/6; }
    .gd-prod-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .gd-prod-card:hover .gd-prod-img { transform: scale(1.05); }
    .gd-prod-info { padding: 16px 4px; }
    .gd-prod-cat { font-family: ${GD.bodyFont}; font-size: 12px; color: ${GD.lightText}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .gd-prod-name { font-family: ${GD.headingFont}; font-weight: 600; font-size: 15px; color: ${GD.titleColor}; margin: 0 0 6px; }
    .gd-prod-name a { color: inherit; text-decoration: none; }
    .gd-prod-name a:hover { color: ${GD.primary}; }
    .gd-prod-price { font-family: ${GD.bodyFont}; font-weight: 600; font-size: 15px; color: ${GD.titleColor}; }
    .gd-prod-price del { color: ${GD.lightText}; font-weight: 400; margin-right: 6px; }
    .gd-prod-stars { color: #E8B500; font-size: 12px; letter-spacing: 1px; margin-bottom: 4px; }
    .gd-prod-btn { display: inline-block; margin-top: 8px; padding: 8px 20px; background: ${GD.primary}; color: #fff; font-family: ${GD.headingFont}; font-weight: 600; font-size: 11px; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.3s; letter-spacing: 0.5px; }
    .gd-prod-btn:hover { filter: brightness(0.9); }
    @media (max-width: 1024px) { .gd-arrivals-grid { grid-template-columns: repeat(3, 1fr) !important; } }
    @media (max-width: 700px) { .gd-arrivals-grid { grid-template-columns: repeat(2, 1fr) !important; } .gd-arrivals-header { flex-direction: column; gap: 10px; text-align: center; } }
  `;

  return (
    <div className="gd-arrivals">
      <ScopedStyles id="gd-arrivals" css={css} />
      <div style={gdContainer}>
        <div className="gd-arrivals-header">
          <h2 className="gd-arrivals-title">{sectionTitle}</h2>
          {viewAllText && <Link href={resolveStoreLink(viewAllLink || "/shop", storeCtx?.storeSlug)} className="gd-arrivals-link">{viewAllText}</Link>}
        </div>
        <div className="gd-arrivals-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {items.map((p) => (
            <div key={p.id} className="gd-prod-card">
              <div className="gd-prod-img-wrap">
                <img className="gd-prod-img" src={p.image || safeSrc(null, p.name)} alt={p.name} onError={(e) => onImgError(e, p.name)} />
              </div>
              <div className="gd-prod-info">
                <div className="gd-prod-cat">{p.category}</div>
                <h3 className="gd-prod-name"><Link href={fixLink(p.slug)}>{p.name}</Link></h3>
                <div className="gd-prod-stars">{"★".repeat(p.rating || 5)}{"☆".repeat(5 - (p.rating || 5))}</div>
                <div className="gd-prod-price">
                  {p.comparePrice && <del>${p.comparePrice}</del>}
                  ${p.price}
                </div>
                <button className="gd-prod-btn" onClick={() => storeCtx?.addToCart?.(String(p.id))}>Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── GARDEN FEATURES ───────────────────────────────────────── */

export interface GardenFeature {
  icon: string;
  title: string;
  description: string;
}

export interface GardenFeaturesProps {
  features?: GardenFeature[];
}

export function GardenFeatures({ features }: GardenFeaturesProps) {
  const defaultFeatures: GardenFeature[] = [
    { icon: "✨", title: "Unique Designs", description: "Every piece in our collection is created with a sense of artistry and purpose." },
    { icon: "🌿", title: "Sustainable Materials", description: "We prioritize eco-friendly and responsibly sourced materials." },
    { icon: "❤️", title: "Crafted with Love", description: "Our artisans bring passion and precision to every product we offer." },
  ];
  const items = features || defaultFeatures;

  const css = `
    .gd-features { padding: 70px 0; background: ${GD.lightBg}; }
    .gd-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; text-align: center; }
    .gd-feature-icon { font-size: 40px; margin-bottom: 16px; }
    .gd-feature-title { font-family: ${GD.headingFont}; font-weight: 600; font-size: 20px; color: ${GD.titleColor}; margin: 0 0 10px; }
    .gd-feature-desc { font-family: ${GD.bodyFont}; font-size: 14px; line-height: 1.7; color: ${GD.lightText}; margin: 0; max-width: 320px; margin-left: auto; margin-right: auto; }
    @media (max-width: 700px) { .gd-features-grid { grid-template-columns: 1fr; gap: 30px; } }
  `;

  return (
    <div className="gd-features">
      <ScopedStyles id="gd-features" css={css} />
      <div style={gdContainer}>
        <div className="gd-features-grid">
          {items.map((f, i) => (
            <div key={i}>
              <div className="gd-feature-icon">{f.icon}</div>
              <h4 className="gd-feature-title">{f.title}</h4>
              <p className="gd-feature-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── GARDEN TESTIMONIALS ───────────────────────────────────── */

export interface GardenTestimonial {
  name: string;
  text: string;
  rating?: number;
  avatar?: string;
}

export interface GardenTestimonialsProps {
  sectionTitle?: string;
  testimonials?: GardenTestimonial[];
}

export function GardenTestimonials({
  sectionTitle = "What Our Customers Say",
  testimonials,
}: GardenTestimonialsProps) {
  const defaultTestimonials: GardenTestimonial[] = [
    { name: "Sarah M.", text: "The quality of the garden decor is outstanding. Every piece feels unique and well-crafted.", rating: 5 },
    { name: "James L.", text: "Transformed my living room with their home decor collection. Absolutely love the natural aesthetic.", rating: 5 },
    { name: "Emily R.", text: "Fast shipping and beautiful packaging. The products exceeded my expectations.", rating: 5 },
  ];
  const items = testimonials || defaultTestimonials;

  const css = `
    .gd-testimonials { padding: 70px 0; }
    .gd-testimonials-title { font-family: ${GD.headingFont}; font-weight: 600; font-size: 32px; color: ${GD.titleColor}; text-align: center; margin: 0 0 40px; }
    .gd-testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
    .gd-testimonial-card { background: ${GD.lightBg}; padding: 30px; text-align: center; }
    .gd-testimonial-stars { color: #E8B500; font-size: 16px; letter-spacing: 2px; margin-bottom: 16px; }
    .gd-testimonial-text { font-family: ${GD.bodyFont}; font-size: 14px; line-height: 1.8; color: ${GD.textColor}; margin: 0 0 20px; font-style: italic; }
    .gd-testimonial-name { font-family: ${GD.headingFont}; font-weight: 600; font-size: 15px; color: ${GD.titleColor}; }
    @media (max-width: 900px) { .gd-testimonials-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <div className="gd-testimonials">
      <ScopedStyles id="gd-testimonials" css={css} />
      <div style={gdContainer}>
        <h2 className="gd-testimonials-title">{sectionTitle}</h2>
        <div className="gd-testimonials-grid">
          {items.map((t, i) => (
            <div key={i} className="gd-testimonial-card">
              <div className="gd-testimonial-stars">{"★".repeat(t.rating || 5)}</div>
              <p className="gd-testimonial-text">&ldquo;{t.text}&rdquo;</p>
              <div className="gd-testimonial-name">{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── GARDEN ABOUT PAGE ─────────────────────────────────────── */

export interface GardenAboutPageProps {
  heading?: string;
  text?: string;
  image?: string;
  values?: Array<{ title: string; description: string }>;
}

export function GardenAboutPage({
  heading = "About Us",
  text = "We are a passionate home and garden décor brand dedicated to creating spaces that feel alive, warm, and beautifully curated. With a love for nature, craftsmanship, and thoughtful design, we offer pieces that blend indoor comfort with outdoor charm. Our collection is inspired by earthy textures, timeless aesthetics, and the joy of transforming simple spaces into peaceful retreats.",
  image = "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=600&fit=crop",
  values,
}: GardenAboutPageProps) {
  const defaultValues = [
    { title: "Our Mission", description: "To bring nature-inspired beauty into every home through sustainable, handcrafted décor." },
    { title: "Quality Promise", description: "Every product is carefully curated and tested to ensure it meets our high standards." },
    { title: "Sustainability", description: "We are committed to eco-friendly practices and responsibly sourced materials." },
  ];
  const items = values || defaultValues;

  const css = `
    .gd-about { padding: 70px 0; }
    .gd-about-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center; margin-bottom: 60px; }
    .gd-about-heading { font-family: ${GD.headingFont}; font-weight: 600; font-size: 36px; color: ${GD.titleColor}; margin: 0 0 20px; }
    .gd-about-text { font-family: ${GD.bodyFont}; font-size: 15px; line-height: 1.8; color: ${GD.textColor}; margin: 0; }
    .gd-about-img { width: 100%; height: 400px; object-fit: cover; }
    .gd-about-values { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
    .gd-about-value { text-align: center; padding: 30px 20px; background: ${GD.lightBg}; }
    .gd-about-value-title { font-family: ${GD.headingFont}; font-weight: 600; font-size: 18px; color: ${GD.titleColor}; margin: 0 0 10px; }
    .gd-about-value-desc { font-family: ${GD.bodyFont}; font-size: 14px; line-height: 1.7; color: ${GD.lightText}; margin: 0; }
    @media (max-width: 900px) { .gd-about-hero { grid-template-columns: 1fr; } .gd-about-values { grid-template-columns: 1fr; } }
  `;

  return (
    <div className="gd-about">
      <ScopedStyles id="gd-about" css={css} />
      <div style={gdContainer}>
        <div className="gd-about-hero">
          <div>
            <h1 className="gd-about-heading">{heading}</h1>
            <p className="gd-about-text">{text}</p>
          </div>
          <img className="gd-about-img" src={image} alt="About" />
        </div>
        <div className="gd-about-values">
          {items.map((v, i) => (
            <div key={i} className="gd-about-value">
              <h4 className="gd-about-value-title">{v.title}</h4>
              <p className="gd-about-value-desc">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── GARDEN CONTACT PAGE ───────────────────────────────────── */

export interface GardenContactPageProps {
  heading?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export function GardenContactPage({
  heading = "Get In Touch",
  description = "Have questions or need styling guidance? We're here to help you create the perfect home and garden space. Reach out anytime — we'd love to connect and support you.",
  address = "123/B, Route 66, Downtown, Washington, US",
  phone = "+88 - 78542269744",
  email = "info@yourdomain.com",
}: GardenContactPageProps) {
  const css = `
    .gd-contact { padding: 70px 0; }
    .gd-contact-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 50px; }
    .gd-contact-heading { font-family: ${GD.headingFont}; font-weight: 600; font-size: 36px; color: ${GD.titleColor}; margin: 0 0 16px; }
    .gd-contact-desc { font-family: ${GD.bodyFont}; font-size: 15px; line-height: 1.7; color: ${GD.lightText}; margin: 0 0 30px; }
    .gd-contact-form { display: flex; flex-direction: column; gap: 16px; }
    .gd-contact-input { padding: 12px 16px; border: 1px solid #ddd; font-family: ${GD.bodyFont}; font-size: 14px; color: ${GD.textColor}; outline: none; transition: border-color 0.2s; }
    .gd-contact-input:focus { border-color: ${GD.primary}; }
    .gd-contact-textarea { padding: 12px 16px; border: 1px solid #ddd; font-family: ${GD.bodyFont}; font-size: 14px; color: ${GD.textColor}; outline: none; min-height: 120px; resize: vertical; transition: border-color 0.2s; }
    .gd-contact-textarea:focus { border-color: ${GD.primary}; }
    .gd-contact-submit { padding: 14px 35px; background: ${GD.primary}; color: #fff; font-family: ${GD.headingFont}; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border: none; cursor: pointer; transition: background 0.3s; align-self: flex-start; }
    .gd-contact-submit:hover { background: ${GD.primaryHover}; }
    .gd-contact-sidebar-title { font-family: ${GD.headingFont}; font-weight: 600; font-size: 24px; color: ${GD.titleColor}; margin: 0 0 25px; }
    .gd-contact-info { margin-bottom: 20px; }
    .gd-contact-info-label { font-family: ${GD.headingFont}; font-weight: 600; font-size: 16px; color: ${GD.titleColor}; margin: 0 0 6px; }
    .gd-contact-info-value { font-family: ${GD.bodyFont}; font-size: 14px; color: ${GD.lightText}; margin: 0; }
    @media (max-width: 900px) { .gd-contact-grid { grid-template-columns: 1fr; } }
  `;

  return (
    <div className="gd-contact">
      <ScopedStyles id="gd-contact" css={css} />
      <div style={gdContainer}>
        <div className="gd-contact-grid">
          <div>
            <h1 className="gd-contact-heading">{heading}</h1>
            <p className="gd-contact-desc">{description}</p>
            <form className="gd-contact-form" onSubmit={(e) => e.preventDefault()}>
              <input className="gd-contact-input" type="text" placeholder="Your Name *" required />
              <input className="gd-contact-input" type="email" placeholder="Your Email *" required />
              <textarea className="gd-contact-textarea" placeholder="Your Message *" required />
              <button className="gd-contact-submit" type="submit">Send Message</button>
            </form>
          </div>
          <div>
            <h3 className="gd-contact-sidebar-title">Connect With Us</h3>
            <div className="gd-contact-info">
              <h4 className="gd-contact-info-label">Address</h4>
              <p className="gd-contact-info-value">{address}</p>
            </div>
            <div className="gd-contact-info">
              <h4 className="gd-contact-info-label">Call Us</h4>
              <p className="gd-contact-info-value">{phone}</p>
            </div>
            <div className="gd-contact-info">
              <h4 className="gd-contact-info-label">Email</h4>
              <p className="gd-contact-info-value">{email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── GARDEN PRODUCT CATEGORY ───────────────────────────────── */

export interface GardenProductCategoryProps {
  categoryTitle?: string;
  categoryDescription?: string;
  products?: InteriorProduct[];
  columns?: number;
  maxProducts?: number;
}

export function GardenProductCategory({
  categoryTitle = "All Products",
  categoryDescription = "Browse our curated collection of home and garden décor.",
  products: propProducts,
  columns = 4,
  maxProducts = 12,
}: GardenProductCategoryProps) {
  const storeCtx = useContext(InteriorStoreContext);
  const items = (propProducts || storeCtx?.products || []).slice(0, maxProducts) as InteriorProduct[];

  const css = `
    .gd-cat-page { padding: 50px 0; }
    .gd-cat-header { text-align: center; margin-bottom: 40px; padding: 40px 20px; background: ${GD.lightBg}; }
    .gd-cat-title { font-family: ${GD.headingFont}; font-weight: 600; font-size: 36px; color: ${GD.titleColor}; margin: 0 0 10px; }
    .gd-cat-desc { font-family: ${GD.bodyFont}; font-size: 15px; color: ${GD.lightText}; margin: 0; }
  `;

  return (
    <div className="gd-cat-page">
      <ScopedStyles id="gd-cat-page" css={css} />
      <div style={gdContainer}>
        <div className="gd-cat-header">
          <h1 className="gd-cat-title">{categoryTitle}</h1>
          <p className="gd-cat-desc">{categoryDescription}</p>
        </div>
      </div>
      <GardenNewArrivals products={items} columns={columns} maxProducts={maxProducts} sectionTitle="" viewAllText="" />
    </div>
  );
}
