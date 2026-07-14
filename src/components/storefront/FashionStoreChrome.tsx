"use client";
import { useState } from "react";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";

/* ═══════════════════════════════════════════════════════════════
   FASHION STORE HEADER + FOOTER
   Pixel-perfect WoodMart Fashion template chrome.
   ═══════════════════════════════════════════════════════════════ */

const T = {
  primary: "#da3c3c",
  primaryHover: "#c13030",
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

interface FashionHeaderProps {
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

export function FashionHeader({
  storeName, storeSlug, logo, navPages = [], customNavItems, categories = [], cartCount = 0, wishlistCount = 0,
  topBarText = "FREE SHIPPING FOR ALL ORDERS OF $150",
  socialLinks = [], onSearch, searchQuery = "", onSearchChange, isLanding = false,
}: FashionHeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const css = `
    .fsh-topbar { background: ${T.primary}; color: #fff; font-family: ${T.bodyFont}; font-size: 12px; padding: 0; }
    .fsh-topbar-inner { max-width: ${T.containerWidth}; margin: 0 auto; padding: 10px 15px; display: flex; align-items: center; justify-content: space-between; }
    .fsh-topbar-text { font-weight: 700; letter-spacing: 0.5px; text-align: center; flex: 1; }
    .fsh-topbar-social { display: flex; gap: 12px; }
    .fsh-topbar-social a { color: rgba(255,255,255,0.85); text-decoration: none; font-size: 13px; transition: color 0.2s; }
    .fsh-topbar-social a:hover { color: #fff; }
    .fsh-main { background: #fff; border-bottom: 1px solid #eee; }
    .fsh-main-inner { max-width: ${T.containerWidth}; margin: 0 auto; padding: 20px 15px; display: flex; align-items: center; justify-content: space-between; }
    .fsh-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .fsh-logo-img { height: 40px; width: auto; object-fit: contain; }
    .fsh-logo-text { font-family: ${T.titleFont}; font-weight: 700; font-size: 26px; color: ${T.titleColor}; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; }
    .fsh-icons { display: flex; align-items: center; gap: 5px; }
    .fsh-icon-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: none; border: none; cursor: pointer; color: ${T.linkColor}; font-size: 18px; text-decoration: none; transition: color 0.2s; }
    .fsh-icon-btn:hover { color: rgba(51,51,51,0.6); }
    .fsh-badge { position: absolute; top: 2px; right: 2px; min-width: 15px; height: 15px; border-radius: 50%; background: ${T.primary}; color: #fff; font-size: 9px; font-weight: 600; display: flex; align-items: center; justify-content: center; line-height: 1; }
    .fsh-nav { background: #fff; border-bottom: 1px solid #eee; }
    .fsh-nav-inner { max-width: ${T.containerWidth}; margin: 0 auto; padding: 0 15px; display: flex; align-items: center; height: 52px; }
    .fsh-nav-links { display: flex; align-items: center; gap: 0; height: 100%; }
    .fsh-nav-link { display: flex; align-items: center; height: 100%; padding: 0 18px; font-family: ${T.bodyFont}; font-weight: 700; font-size: 13px; color: ${T.linkColor}; text-decoration: none; text-transform: uppercase; transition: color 0.2s; position: relative; }
    .fsh-nav-link:hover { color: rgba(51,51,51,0.6); }
    .fsh-nav-link.fsh-active { color: ${T.primary}; }
    .fsh-search-bar { max-width: ${T.containerWidth}; margin: 0 auto; padding: 10px 15px; }
    .fsh-search-input { width: 100%; padding: 10px 15px; border: 1px solid #ddd; font-family: ${T.bodyFont}; font-size: 14px; outline: none; }
    .fsh-search-input:focus { border-color: ${T.primary}; }
    .fsh-mobile-toggle { display: none; background: none; border: none; font-size: 22px; cursor: pointer; color: ${T.linkColor}; padding: 8px; }
    .fsh-mobile-menu { display: none; background: #fff; border-bottom: 1px solid #eee; padding: 15px; }
    .fsh-mobile-menu a { display: block; padding: 10px 0; font-family: ${T.bodyFont}; font-weight: 700; font-size: 14px; color: ${T.linkColor}; text-decoration: none; text-transform: uppercase; border-bottom: 1px solid #f5f5f5; }
    .fsh-mobile-menu a:last-child { border-bottom: none; }

    /* Categories sidebar toggle */
    .fsh-cat-wrap { position: relative; }
    .fsh-cat-toggle {
      display: flex; align-items: center; gap: 8px; height: 100%; padding: 0 18px;
      font-family: ${T.bodyFont}; font-weight: 700; font-size: 13px; color: #fff;
      background: ${T.primary}; border: none; cursor: pointer; text-transform: uppercase;
      transition: background 0.2s; white-space: nowrap;
    }
    .fsh-cat-toggle:hover { background: ${T.primaryHover}; }
    .fsh-cat-toggle svg { width: 16px; height: 16px; fill: currentColor; }
    .fsh-cat-toggle .fsh-cat-chevron { width: 10px; height: 10px; transition: transform 0.3s; margin-left: 4px; }
    .fsh-cat-toggle.fsh-open .fsh-cat-chevron { transform: rotate(180deg); }
    .fsh-cat-dropdown {
      position: absolute; top: 100%; left: 0; z-index: 100;
      background: #fff; border: 1px solid #eee; border-top: none;
      min-width: 270px; box-shadow: 0 8px 20px rgba(0,0,0,0.08);
      display: none;
    }
    .fsh-cat-dropdown.fsh-open { display: block; }
    .fsh-cat-list { list-style: none; margin: 0; padding: 8px 0; }
    .fsh-cat-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 20px; font-family: ${T.bodyFont}; font-size: 14px;
      color: ${T.linkColor}; text-decoration: none; transition: all 0.15s;
      border-bottom: 1px solid #f5f5f5;
    }
    .fsh-cat-item:last-child { border-bottom: none; }
    .fsh-cat-item:hover { background: #f9f9f9; color: ${T.primary}; padding-left: 25px; }
    .fsh-cat-item .fsh-cat-icon { width: 18px; height: 18px; flex-shrink: 0; opacity: 0.6; }
    .fsh-cat-count { margin-left: auto; font-size: 12px; color: #aaa; }

    /* Mobile categories section */
    .fsh-mobile-cats { padding: 10px 0; border-top: 1px solid #f0f0f0; margin-top: 5px; }
    .fsh-mobile-cats-title {
      font-family: ${T.titleFont}; font-weight: 700; font-size: 11px;
      color: #999; text-transform: uppercase; letter-spacing: 1px;
      padding: 5px 0 8px; margin: 0;
    }
    .fsh-mobile-cats a {
      font-weight: 400 !important; font-size: 14px !important;
      text-transform: none !important; color: ${T.linkColor} !important;
    }

    @media (max-width: 1024px) {
      .fsh-topbar-inner { padding: 8px 15px; }
      .fsh-main-inner { padding: 15px; }
      .fsh-logo-text { font-size: 20px; }
      .fsh-nav { display: none; }
      .fsh-mobile-toggle { display: block; }
      .fsh-mobile-menu.fsh-open { display: block; }
      .fsh-topbar-social { display: none; }
    }
    @media (max-width: 767px) {
      .fsh-logo-text { font-size: 16px; }
      .fsh-icons { gap: 0; }
      .fsh-icon-btn { width: 35px; height: 35px; font-size: 16px; }
    }
  `;

  const socialIcons: Record<string, string> = {
    facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶", tiktok: "♪",
  };

  return (
    <div className="fsh-header">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {/* Top Bar */}
      <div className="fsh-topbar">
        <div className="fsh-topbar-inner">
          <div className="fsh-topbar-social">
            {socialLinks.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                {socialIcons[s.platform] || s.platform[0]?.toUpperCase()}
              </a>
            ))}
          </div>
          <div className="fsh-topbar-text">{topBarText}</div>
          <div style={{ flex: "0 0 auto", width: socialLinks.length > 0 ? "auto" : "0" }} />
        </div>
      </div>

      {/* Main Header */}
      <div className="fsh-main">
        <div className="fsh-main-inner">
          <button className="fsh-mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            {mobileMenu ? "✕" : "☰"}
          </button>
          <Link href={`/store/${storeSlug}`} className="fsh-logo">
            {logo ? <img src={logo} alt={storeName} className="fsh-logo-img" /> : null}
            <span className="fsh-logo-text">{storeName}</span>
          </Link>
          <div className="fsh-icons">
            {!isLanding && (
              <>
                <button className="fsh-icon-btn" onClick={() => setShowSearch(!showSearch)} aria-label="Search">🔍</button>
                <Link href={`/store/${storeSlug}/wishlist`} className="fsh-icon-btn" aria-label="Wishlist">
                  ♡{wishlistCount > 0 && <span className="fsh-badge">{wishlistCount}</span>}
                </Link>
                <Link href={`/store/${storeSlug}/cart`} className="fsh-icon-btn" aria-label="Cart">
                  🛒{cartCount > 0 && <span className="fsh-badge">{cartCount}</span>}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="fsh-search-bar">
          <input
            autoFocus
            type="text"
            className="fsh-search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSearch?.(searchQuery); }}
          />
        </div>
      )}

      {/* Desktop Nav */}
      <nav className="fsh-nav">
        <div className="fsh-nav-inner">
          {/* Categories dropdown toggle — WoodMart style */}
          {!isLanding && categories.length > 0 && (
            <div className="fsh-cat-wrap">
              <button
                className={`fsh-cat-toggle ${showCategories ? "fsh-open" : ""}`}
                onClick={() => setShowCategories(!showCategories)}
                aria-expanded={showCategories}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                Categories
                <svg className="fsh-cat-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className={`fsh-cat-dropdown ${showCategories ? "fsh-open" : ""}`}>
                <ul className="fsh-cat-list">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/store/${storeSlug}/shop?category=${encodeURIComponent(cat.slug)}`}
                      className="fsh-cat-item"
                      onClick={() => setShowCategories(false)}
                    >
                      <svg className="fsh-cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      <span>{cat.name}</span>
                      {cat.productCount !== undefined && cat.productCount > 0 && (
                        <span className="fsh-cat-count">{cat.productCount}</span>
                      )}
                    </Link>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="fsh-nav-links">
            {customNavItems && customNavItems.length > 0 ? (
              /* Custom navigation — store owner defined these */
              customNavItems.map((item) => {
                const href = resolveNavHref(item, storeSlug);
                const isExternal = item.type === "external" || item.url.startsWith("http");
                return isExternal ? (
                  <a key={item.id} href={href} className="fsh-nav-link" target={item.openInNewTab ? "_blank" : undefined} rel={item.openInNewTab ? "noopener noreferrer" : undefined}>{item.label}</a>
                ) : (
                  <Link key={item.id} href={href} className="fsh-nav-link">{item.label}</Link>
                );
              })
            ) : (
              /* Default navigation — auto-generated from pages */
              <>
                <Link href={`/store/${storeSlug}`} className="fsh-nav-link fsh-active">Home</Link>
                {!isLanding && <Link href={`/store/${storeSlug}/shop`} className="fsh-nav-link">Shop</Link>}
                {!isLanding && <Link href={`/store/${storeSlug}/reviews`} className="fsh-nav-link">Reviews</Link>}
                {navPages.map((p) => (
                  <Link key={p.id} href={`/store/${storeSlug}/${p.slug}`} className="fsh-nav-link">{p.title}</Link>
                ))}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fsh-mobile-menu ${mobileMenu ? "fsh-open" : ""}`}>
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
            <Link href={`/store/${storeSlug}`} onClick={() => setMobileMenu(false)}>Home</Link>
            {!isLanding && <Link href={`/store/${storeSlug}/shop`} onClick={() => setMobileMenu(false)}>Shop</Link>}
            {!isLanding && <Link href={`/store/${storeSlug}/reviews`} onClick={() => setMobileMenu(false)}>Reviews</Link>}
            {navPages.map((p) => (
              <Link key={p.id} href={`/store/${storeSlug}/${p.slug}`} onClick={() => setMobileMenu(false)}>{p.title}</Link>
            ))}
          </>
        )}

        {/* Mobile categories */}
        {!isLanding && categories.length > 0 && (
          <div className="fsh-mobile-cats">
            <p className="fsh-mobile-cats-title">Categories</p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/store/${storeSlug}/shop?category=${encodeURIComponent(cat.slug)}`}
                onClick={() => setMobileMenu(false)}
              >
                {cat.name}
                {cat.productCount !== undefined && cat.productCount > 0 && (
                  <span style={{ color: "#aaa", fontWeight: 400, fontSize: "12px", marginLeft: "6px" }}>({cat.productCount})</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FASHION FOOTER
   ═══════════════════════════════════════════════════════════════ */

interface FashionFooterProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  navPages?: Array<{ id: string; title: string; slug: string }>;
  description?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  contactInfo?: { address?: string; phone?: string; email?: string };
}

export function FashionFooter({
  storeName, storeSlug, logo, navPages = [], description,
  socialLinks = [], contactInfo,
}: FashionFooterProps) {
  const css = `
    .fsf-footer { background: ${T.footerBg}; color: rgba(255,255,255,0.6); font-family: ${T.bodyFont}; padding: 60px 0 0; }
    .fsf-inner { max-width: ${T.containerWidth}; margin: 0 auto; padding: 0 15px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
    .fsf-col-title { font-family: ${T.titleFont}; font-weight: 700; font-size: 16px; color: #fff; text-transform: uppercase; margin: 0 0 20px; }
    .fsf-text { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.6); margin-bottom: 15px; }
    .fsf-links { list-style: none; padding: 0; margin: 0; }
    .fsf-links li { margin-bottom: 10px; }
    .fsf-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; transition: color 0.2s; }
    .fsf-links a:hover { color: #fff; }
    .fsf-contact-item { display: flex; gap: 10px; margin-bottom: 12px; font-size: 14px; }
    .fsf-contact-label { color: #fff; font-weight: 700; min-width: 60px; }
    .fsf-social { display: flex; gap: 10px; margin-top: 15px; }
    .fsf-social-icon { width: 35px; height: 35px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 13px; transition: all 0.2s; }
    .fsf-social-icon:hover { border-color: #fff; color: #fff; }
    .fsf-bottom { max-width: ${T.containerWidth}; margin: 0 auto; padding: 25px 15px; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
    .fsf-copyright { color: rgba(255,255,255,0.4); }
    .fsf-logo-text { font-family: ${T.titleFont}; font-weight: 700; font-size: 20px; color: #fff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: inline-block; }
    @media (max-width: 1024px) { .fsf-inner { grid-template-columns: repeat(2, 1fr); gap: 30px; } }
    @media (max-width: 767px) { .fsf-inner { grid-template-columns: 1fr; gap: 25px; } .fsf-bottom { flex-direction: column; gap: 10px; text-align: center; } }
  `;

  const socialIcons: Record<string, string> = {
    facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶", tiktok: "♪",
  };

  return (
    <footer className="fsf-footer">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="fsf-inner">
        {/* Col 1: About */}
        <div>
          <Link href={`/store/${storeSlug}`} className="fsf-logo-text">{storeName}</Link>
          <p className="fsf-text">{description || "Your one-stop destination for the latest fashion trends and timeless style essentials."}</p>
          <div className="fsf-social">
            {socialLinks.map((s, i) => (
              <a key={i} href={s.url} className="fsf-social-icon" target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                {socialIcons[s.platform] || s.platform[0]?.toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="fsf-col-title">Quick Links</h4>
          <ul className="fsf-links">
            <li><Link href={`/store/${storeSlug}`}>Home</Link></li>
            <li><Link href={`/store/${storeSlug}/shop`}>Shop</Link></li>
            <li><Link href={`/store/${storeSlug}/reviews`}>Reviews</Link></li>
            {navPages.slice(0, 4).map((p) => (
              <li key={p.id}><Link href={`/store/${storeSlug}/${p.slug}`}>{p.title}</Link></li>
            ))}
          </ul>
        </div>

        {/* Col 3: More Links */}
        <div>
          <h4 className="fsf-col-title">Information</h4>
          <ul className="fsf-links">
            {navPages.slice(4, 8).map((p) => (
              <li key={p.id}><Link href={`/store/${storeSlug}/${p.slug}`}>{p.title}</Link></li>
            ))}
            <li><Link href={`/store/${storeSlug}/wishlist`}>Wishlist</Link></li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div>
          <h4 className="fsf-col-title">Contact Us</h4>
          {contactInfo?.address && (
            <div className="fsf-contact-item">
              <span className="fsf-contact-label">Address:</span>
              <span>{contactInfo.address}</span>
            </div>
          )}
          {contactInfo?.phone && (
            <div className="fsf-contact-item">
              <span className="fsf-contact-label">Phone:</span>
              <span>{contactInfo.phone}</span>
            </div>
          )}
          {contactInfo?.email && (
            <div className="fsf-contact-item">
              <span className="fsf-contact-label">Email:</span>
              <span>{contactInfo.email}</span>
            </div>
          )}
        </div>
      </div>

      <div className="fsf-bottom">
        <span className="fsf-copyright">© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
      </div>
    </footer>
  );
}
