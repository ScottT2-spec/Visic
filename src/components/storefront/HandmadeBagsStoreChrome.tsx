"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";

/* ═══════════════════════════════════════════════════════════════
   HANDMADE BAGS STORE HEADER + FOOTER
   Matching WoodMart Handmade Bags demo exactly.
   Primary color: #c27843 (warm leather brown)
   ═══════════════════════════════════════════════════════════════ */

const T = {
  primary: "#c27843",
  primaryHover: "#a86538",
  titleColor: "#242424",
  textColor: "#767676",
  linkColor: "#333333",
  footerBg: "#0c0c0c",
  containerWidth: "1222px",
  titleFont: "'Montserrat', Arial, Helvetica, sans-serif",
  bodyFont: "'Lato', Arial, Helvetica, sans-serif",
};

export interface NavItem {
  id: string;
  label: string;
  url: string;
  type: string;
  openInNewTab?: boolean;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

interface HandmadeBagsHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  navPages?: Array<{ id: string; title: string; slug: string }>;
  /** Custom navigation items from navigationSettings — overrides default nav when present */
  customNavItems?: NavItem[];
  /** Product categories for the vertical sidebar menu */
  categories?: StoreCategory[];
  cartCount?: number;
  wishlistCount?: number;
  topBarText?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  onSearch?: (q: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  isLanding?: boolean;
}

/**
 * Resolves a nav item's URL to a full href using the centralized link resolver.
 * This prevents double-prefixing of /store/{slug}.
 */
function resolveNavHref(item: NavItem, storeSlug: string): string {
  return resolveStoreLink(item.url, storeSlug);
}

export function HandmadeBagsHeader({
  storeName, storeSlug, logo, navPages = [], customNavItems, categories = [], cartCount = 0, wishlistCount = 0,
  topBarText = "Free delivery on orders over $200.00",
  socialLinks = [], onSearch, searchQuery = "", onSearchChange, isLanding = false,
}: HandmadeBagsHeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const searchUrl = resolveStoreLink(`/shop?search=${encodeURIComponent(query.trim())}`, storeSlug);
      router.push(searchUrl);
      setShowSearch(false);
      setLocalSearchQuery("");
    }
  };

  const css = `
    .hbh-topbar { background: ${T.primary}; color: #fff; font-family: ${T.bodyFont}; font-size: 12px; padding: 0; }
    .hbh-topbar-inner { max-width: ${T.containerWidth}; margin: 0 auto; padding: 8px 15px; display: flex; align-items: center; justify-content: center; }
    .hbh-topbar-text { font-weight: 600; letter-spacing: 0.3px; text-align: center; }
    .hbh-main { background: #fff; border-bottom: 1px solid #e5e5e5; }
    .hbh-main-inner { max-width: ${T.containerWidth}; margin: 0 auto; padding: 25px 15px; display: flex; align-items: center; justify-content: space-between; }
    .hbh-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
    .hbh-logo-img { height: 45px; width: auto; object-fit: contain; }
    .hbh-logo-text { font-family: ${T.titleFont}; font-weight: 700; font-size: 28px; color: ${T.titleColor}; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; }
    .hbh-icons { display: flex; align-items: center; gap: 8px; }
    .hbh-icon-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; background: none; border: 1px solid #e5e5e5; cursor: pointer; color: ${T.linkColor}; font-size: 18px; text-decoration: none; transition: all 0.2s; border-radius: 0; }
    .hbh-icon-btn:hover { background: ${T.primary}; color: #fff; border-color: ${T.primary}; }
    .hbh-badge { position: absolute; top: -5px; right: -5px; min-width: 18px; height: 18px; border-radius: 50%; background: ${T.primary}; color: #fff; font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; line-height: 1; border: 2px solid #fff; }
    .hbh-nav { background: #fff; border-bottom: 1px solid #e5e5e5; }
    .hbh-nav-inner { max-width: ${T.containerWidth}; margin: 0 auto; padding: 0 15px; display: flex; align-items: center; height: 55px; }
    .hbh-nav-links { display: flex; align-items: center; gap: 0; height: 100%; }
    .hbh-nav-link { display: flex; align-items: center; height: 100%; padding: 0 20px; font-family: ${T.bodyFont}; font-weight: 700; font-size: 13px; color: ${T.linkColor}; text-decoration: none; text-transform: uppercase; transition: color 0.2s; position: relative; letter-spacing: 0.5px; }
    .hbh-nav-link:hover { color: ${T.primary}; }
    .hbh-nav-link.hbh-active { color: ${T.primary}; }
    .hbh-nav-link::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
      background: ${T.primary}; transform: scaleX(0); transition: transform 0.2s;
    }
    .hbh-nav-link:hover::after, .hbh-nav-link.hbh-active::after { transform: scaleX(1); }
    .hbh-search-bar { max-width: ${T.containerWidth}; margin: 0 auto; padding: 15px; background: #fff; border-bottom: 1px solid #e5e5e5; }
    .hbh-search-input { width: 100%; padding: 12px 20px; border: 1px solid #ddd; font-family: ${T.bodyFont}; font-size: 14px; outline: none; background: #f9f9f9; }
    .hbh-search-input:focus { border-color: ${T.primary}; background: #fff; }
    .hbh-mobile-toggle { display: none; background: none; border: none; font-size: 24px; cursor: pointer; color: ${T.linkColor}; padding: 8px; }
    .hbh-mobile-menu { display: none; background: #fff; border-bottom: 1px solid #e5e5e5; padding: 20px; }
    .hbh-mobile-menu a { display: block; padding: 12px 0; font-family: ${T.bodyFont}; font-weight: 700; font-size: 14px; color: ${T.linkColor}; text-decoration: none; text-transform: uppercase; border-bottom: 1px solid #f5f5f5; letter-spacing: 0.5px; }
    .hbh-mobile-menu a:last-child { border-bottom: none; }
    .hbh-mobile-menu a:hover { color: ${T.primary}; }

    @media (max-width: 1024px) {
      .hbh-topbar-inner { padding: 6px 15px; }
      .hbh-main-inner { padding: 15px; }
      .hbh-logo-text { font-size: 22px; }
      .hbh-nav { display: none; }
      .hbh-mobile-toggle { display: block; }
      .hbh-mobile-menu.hbh-open { display: block; }
    }
    @media (max-width: 767px) {
      .hbh-logo-text { font-size: 18px; }
      .hbh-icons { gap: 5px; }
      .hbh-icon-btn { width: 38px; height: 38px; font-size: 16px; }
      .hbh-topbar-text { font-size: 11px; }
    }
  `;

  return (
    <div className="hbh-header">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {/* Top Bar */}
      <div className="hbh-topbar">
        <div className="hbh-topbar-inner">
          <div className="hbh-topbar-text">{topBarText}</div>
        </div>
      </div>

      {/* Main Header */}
      <div className="hbh-main">
        <div className="hbh-main-inner">
          <button className="hbh-mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            {mobileMenu ? "✕" : "☰"}
          </button>
          <Link href={resolveStoreLink("/", storeSlug)} className="hbh-logo">
            {logo ? <img src={logo} alt={storeName} className="hbh-logo-img" /> : null}
            <span className="hbh-logo-text">{storeName}</span>
          </Link>
          <div className="hbh-icons">
            {!isLanding && (
              <>
                <button className="hbh-icon-btn" onClick={() => setShowSearch(!showSearch)} aria-label="Search">🔍</button>
                <Link href={resolveStoreLink("/wishlist", storeSlug)} className="hbh-icon-btn" aria-label="Wishlist">
                  ♡{wishlistCount > 0 && <span className="hbh-badge">{wishlistCount}</span>}
                </Link>
                <Link href={resolveStoreLink("/cart", storeSlug)} className="hbh-icon-btn" aria-label="Cart">
                  🛒{cartCount > 0 && <span className="hbh-badge">{cartCount}</span>}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="hbh-search-bar">
          <input
            autoFocus
            type="text"
            className="hbh-search-input"
            placeholder="Search products..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(localSearchQuery); }}
          />
        </div>
      )}

      {/* Desktop Nav */}
      <nav className="hbh-nav">
        <div className="hbh-nav-inner">
          <div className="hbh-nav-links">
            {customNavItems && customNavItems.length > 0 ? (
              /* Custom navigation — store owner defined these */
              customNavItems.map((item) => {
                const href = resolveNavHref(item, storeSlug);
                const isExternal = item.type === "external" || item.url.startsWith("http");
                return isExternal ? (
                  <a key={item.id} href={href} className="hbh-nav-link" target={item.openInNewTab ? "_blank" : undefined} rel={item.openInNewTab ? "noopener noreferrer" : undefined}>{item.label}</a>
                ) : (
                  <Link key={item.id} href={href} className="hbh-nav-link">{item.label}</Link>
                );
              })
            ) : (
              /* Default navigation — matching reference site */
              <>
                <Link href={resolveStoreLink("/", storeSlug)} className="hbh-nav-link hbh-active">Home</Link>
                {!isLanding && <Link href={resolveStoreLink("/shop?category=women", storeSlug)} className="hbh-nav-link">Women</Link>}
                {!isLanding && <Link href={resolveStoreLink("/shop?category=men", storeSlug)} className="hbh-nav-link">Men</Link>}
                {!isLanding && <Link href={resolveStoreLink("/blog", storeSlug)} className="hbh-nav-link">Blog</Link>}
                <Link href={resolveStoreLink("/about", storeSlug)} className="hbh-nav-link">About Us</Link>
                {!isLanding && <Link href={resolveStoreLink("/contact", storeSlug)} className="hbh-nav-link">Contact Us</Link>}
                {!isLanding && <Link href={resolveStoreLink("/my-account", storeSlug)} className="hbh-nav-link">Login / Register</Link>}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`hbh-mobile-menu ${mobileMenu ? "hbh-open" : ""}`}>
        {customNavItems && customNavItems.length > 0 ? (
          customNavItems.map((item) => {
            const href = resolveNavHref(item, storeSlug);
            const isExternal = item.type === "external" || item.url.startsWith("http");
            return isExternal ? (
              <a key={item.id} href={href} onClick={() => setMobileMenu(false)} target={item.openInNewTab ? "_blank" : undefined} rel={item.openInNewTab ? "noopener noreferrer" : undefined}>{item.label}</a>
            ) : (
              <Link key={item.id} href={href} onClick={() => setMobileMenu(false)}>{item.label}</Link>
            );
          })
        ) : (
          <>
            <Link href={resolveStoreLink("/", storeSlug)} onClick={() => setMobileMenu(false)}>Home</Link>
            {!isLanding && <Link href={resolveStoreLink("/shop?category=women", storeSlug)} onClick={() => setMobileMenu(false)}>Women</Link>}
            {!isLanding && <Link href={resolveStoreLink("/shop?category=men", storeSlug)} onClick={() => setMobileMenu(false)}>Men</Link>}
            {!isLanding && <Link href={resolveStoreLink("/blog", storeSlug)} onClick={() => setMobileMenu(false)}>Blog</Link>}
            <Link href={resolveStoreLink("/about", storeSlug)} onClick={() => setMobileMenu(false)}>About Us</Link>
            {!isLanding && <Link href={resolveStoreLink("/contact", storeSlug)} onClick={() => setMobileMenu(false)}>Contact Us</Link>}
            {!isLanding && <Link href={resolveStoreLink("/my-account", storeSlug)} onClick={() => setMobileMenu(false)}>Login / Register</Link>}
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HANDMADE BAGS FOOTER
   Matching WoodMart Handmade Bags demo footer exactly.
   ═══════════════════════════════════════════════════════════════ */

interface HandmadeBagsFooterProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  navPages?: Array<{ id: string; title: string; slug: string }>;
  description?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  contactInfo?: { address?: string; phone?: string; email?: string };
}

export function HandmadeBagsFooter({
  storeName, storeSlug, logo, navPages = [], description,
  socialLinks = [], contactInfo,
}: HandmadeBagsFooterProps) {
  const css = `
    .hbf-footer { background: ${T.footerBg}; color: rgba(255,255,255,0.6); font-family: ${T.bodyFont}; padding: 70px 0 0; }
    .hbf-inner { max-width: ${T.containerWidth}; margin: 0 auto; padding: 0 15px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 45px; }
    .hbf-col-title { font-family: ${T.titleFont}; font-weight: 700; font-size: 15px; color: #fff; text-transform: uppercase; margin: 0 0 25px; letter-spacing: 1px; }
    .hbf-text { font-size: 14px; line-height: 1.8; color: rgba(255,255,255,0.6); margin-bottom: 20px; }
    .hbf-links { list-style: none; padding: 0; margin: 0; }
    .hbf-links li { margin-bottom: 12px; }
    .hbf-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; transition: color 0.2s; }
    .hbf-links a:hover { color: ${T.primary}; }
    .hbf-contact-item { display: flex; gap: 12px; margin-bottom: 15px; font-size: 14px; line-height: 1.6; }
    .hbf-contact-label { color: #fff; font-weight: 700; min-width: 70px; }
    .hbf-social { display: flex; gap: 12px; margin-top: 20px; }
    .hbf-social-icon { width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; transition: all 0.2s; }
    .hbf-social-icon:hover { border-color: ${T.primary}; background: ${T.primary}; color: #fff; }
    .hbf-bottom { max-width: ${T.containerWidth}; margin: 0 auto; padding: 30px 15px; margin-top: 50px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
    .hbf-copyright { color: rgba(255,255,255,0.4); }
    .hbf-logo-text { font-family: ${T.titleFont}; font-weight: 700; font-size: 22px; color: #fff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; display: inline-block; }
    @media (max-width: 1024px) { .hbf-inner { grid-template-columns: repeat(2, 1fr); gap: 35px; } }
    @media (max-width: 767px) { .hbf-inner { grid-template-columns: 1fr; gap: 30px; } .hbf-bottom { flex-direction: column; gap: 15px; text-align: center; } }
  `;

  const socialIcons: Record<string, string> = {
    facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶", tiktok: "♪",
  };

  return (
    <footer className="hbf-footer">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="hbf-inner">
        {/* Col 1: About */}
        <div>
          <Link href={resolveStoreLink("/", storeSlug)} className="hbf-logo-text">{storeName}</Link>
          <p className="hbf-text">{description || "Handcrafted leather goods made with passion and precision. Every bag tells a story of artisan excellence."}</p>
          <div className="hbf-social">
            {socialLinks.map((s, i) => (
              <a key={i} href={s.url} className="hbf-social-icon" target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                {socialIcons[s.platform] || s.platform[0]?.toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Shop */}
        <div>
          <h4 className="hbf-col-title">Shop</h4>
          <ul className="hbf-links">
            <li><Link href={resolveStoreLink("/shop?category=women", storeSlug)}>Women</Link></li>
            <li><Link href={resolveStoreLink("/shop?category=men", storeSlug)}>Men</Link></li>
            <li><Link href={resolveStoreLink("/shop?tag=bestseller", storeSlug)}>Bestsellers</Link></li>
            <li><Link href={resolveStoreLink("/shop?tag=new-arrival", storeSlug)}>New Arrivals</Link></li>
          </ul>
        </div>

        {/* Col 3: Information */}
        <div>
          <h4 className="hbf-col-title">Information</h4>
          <ul className="hbf-links">
            <li><Link href={resolveStoreLink("/blog", storeSlug)}>Blog</Link></li>
            <li><Link href={resolveStoreLink("/about", storeSlug)}>About Us</Link></li>
            <li><Link href={resolveStoreLink("/our-story", storeSlug)}>Our Story</Link></li>
            <li><Link href={resolveStoreLink("/contact", storeSlug)}>Contact Us</Link></li>
            <li><Link href={resolveStoreLink("/reviews", storeSlug)}>Reviews</Link></li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div>
          <h4 className="hbf-col-title">Contact Us</h4>
          {contactInfo?.address && (
            <div className="hbf-contact-item">
              <span className="hbf-contact-label">Address:</span>
              <span>{contactInfo.address}</span>
            </div>
          )}
          {contactInfo?.phone && (
            <div className="hbf-contact-item">
              <span className="hbf-contact-label">Phone:</span>
              <span>{contactInfo.phone}</span>
            </div>
          )}
          {contactInfo?.email && (
            <div className="hbf-contact-item">
              <span className="hbf-contact-label">Email:</span>
              <span>{contactInfo.email}</span>
            </div>
          )}
        </div>
      </div>

      <div className="hbf-bottom">
        <span className="hbf-copyright">© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
      </div>
    </footer>
  );
}
