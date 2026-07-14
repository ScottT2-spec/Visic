"use client";
import { useState } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   GARDEN STORE HEADER + FOOTER
   Home & Garden Decor template chrome — teal / natural aesthetic.
   Reference: websitedemos.net/home-garden-decor-02
   ═══════════════════════════════════════════════════════════════ */

const G = {
  primary: "#038f81",
  primaryHover: "#007065",
  accent: "#18b1a2",
  titleColor: "#000000",
  textColor: "#292929",
  lightText: "#666666",
  footerBg: "#000000",
  white: "#FFFFFF",
  lightBg: "#fbfbfb",
  containerWidth: "1200px",
  headingFont: "'Raleway', sans-serif",
  bodyFont: "'Sora', sans-serif",
};

/* ─── Shared SVG Icons ───────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
);
const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
);
const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

/* ─── Types ──────────────────────────────────────────────────── */
export interface GardenHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  navPages?: Array<{ id: string; title: string; slug: string }>;
  categories?: Array<{ id: string; name: string; slug: string; productCount?: number }>;
  cartCount?: number;
  wishlistCount?: number;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSearch?: (q: string) => void;
  isLanding?: boolean;
}

export interface GardenFooterProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  navPages?: Array<{ id: string; title: string; slug: string }>;
  description?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  contactInfo?: { phone?: string; email?: string; address?: string };
}

/* ═══════════════════════════════════════════════════════════════
   GARDEN HEADER
   ═══════════════════════════════════════════════════════════════ */
export function GardenHeader({
  storeName, storeSlug, logo, navPages = [], cartCount = 0, wishlistCount = 0,
  searchQuery = "", onSearchChange, onSearch, isLanding = false,
}: GardenHeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const base = `/store/${storeSlug}`;

  const navItems = [
    { label: "All Products", href: `${base}/shop` },
    { label: "Garden Decor", href: `${base}/shop?category=garden-decor` },
    { label: "Home Decor", href: `${base}/shop?category=home-decor` },
    { label: "About", href: `${base}/about` },
    { label: "Contact", href: `${base}/contact` },
  ];

  // Add any custom pages
  const extraPages = navPages.filter(p =>
    !["about", "contact"].includes(p.slug) && p.slug !== "home"
  );

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&family=Sora:wght@400;600&display=swap');
    .gh-wrap { position: sticky; top: 0; z-index: 50; background: ${G.white}; }
    .gh-main { border-bottom: 1px solid #e5e5e5; }
    .gh-inner { max-width: ${G.containerWidth}; margin: 0 auto; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; }
    .gh-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
    .gh-logo-img { height: 36px; width: auto; object-fit: contain; }
    .gh-logo-text { font-family: ${G.headingFont}; font-weight: 700; font-size: 22px; color: ${G.titleColor}; text-decoration: none; letter-spacing: 0.5px; }
    .gh-nav { display: flex; align-items: center; gap: 0; }
    .gh-nav-link { font-family: ${G.headingFont}; font-weight: 600; font-size: 15px; color: ${G.titleColor}; text-decoration: none; padding: 8px 16px; transition: color 0.2s; white-space: nowrap; }
    .gh-nav-link:hover { color: ${G.primary}; }
    .gh-icons { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .gh-icon-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: none; border: none; cursor: pointer; color: ${G.titleColor}; transition: color 0.2s; text-decoration: none; }
    .gh-icon-btn:hover { color: ${G.primary}; }
    .gh-badge { position: absolute; top: 2px; right: 2px; min-width: 16px; height: 16px; border-radius: 50%; background: ${G.primary}; color: #fff; font-family: ${G.bodyFont}; font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; line-height: 1; }
    .gh-search-bar { max-width: ${G.containerWidth}; margin: 0 auto; padding: 10px 20px; border-bottom: 1px solid #e5e5e5; }
    .gh-search-wrap { display: flex; align-items: center; gap: 8px; border: 1px solid #ddd; border-radius: 4px; padding: 8px 12px; }
    .gh-search-input { flex: 1; border: none; outline: none; font-family: ${G.bodyFont}; font-size: 14px; color: ${G.textColor}; background: transparent; }
    .gh-search-input::placeholder { color: #999; }
    .gh-mobile-toggle { display: none; background: none; border: none; cursor: pointer; color: ${G.titleColor}; padding: 4px; }
    .gh-mobile-menu { display: none; background: ${G.white}; border-bottom: 1px solid #e5e5e5; padding: 16px 20px; }
    .gh-mobile-menu a { display: block; padding: 12px 0; font-family: ${G.headingFont}; font-weight: 600; font-size: 15px; color: ${G.titleColor}; text-decoration: none; border-bottom: 1px solid #f0f0f0; }
    .gh-mobile-menu a:last-child { border-bottom: none; }
    .gh-mobile-menu a:hover { color: ${G.primary}; }
    @media (max-width: 900px) {
      .gh-nav { display: none; }
      .gh-mobile-toggle { display: flex; }
      .gh-mobile-menu.gh-open { display: block; }
    }
  `;

  return (
    <div className="gh-wrap">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="gh-main">
        <div className="gh-inner">
          {/* Mobile toggle */}
          <button className="gh-mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            {mobileMenu ? <CloseIcon /> : <MenuIcon />}
          </button>

          {/* Logo */}
          <Link href={base} className="gh-logo">
            {logo ? (
              <img src={logo} alt={storeName} className="gh-logo-img" />
            ) : (
              <span className="gh-logo-text">{storeName}</span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="gh-nav">
            {navItems.map((item, i) => (
              <Link key={i} href={item.href} className="gh-nav-link">{item.label}</Link>
            ))}
            {extraPages.slice(0, 2).map(p => (
              <Link key={p.id} href={`${base}/${p.slug}`} className="gh-nav-link">{p.title}</Link>
            ))}
          </nav>

          {/* Icons */}
          {!isLanding && (
            <div className="gh-icons">
              <button className="gh-icon-btn" onClick={() => setShowSearch(!showSearch)} aria-label="Search">
                <SearchIcon />
              </button>
              <Link href={`${base}/wishlist`} className="gh-icon-btn" aria-label="Wishlist">
                <HeartIcon />
                {wishlistCount > 0 && <span className="gh-badge">{wishlistCount}</span>}
              </Link>
              <Link href="/checkout" className="gh-icon-btn" aria-label="Cart">
                <CartIcon />
                {cartCount > 0 && <span className="gh-badge">{cartCount}</span>}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="gh-search-bar">
          <div className="gh-search-wrap">
            <SearchIcon />
            <input
              autoFocus
              className="gh-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSearch?.(searchQuery); }}
              placeholder="Search products..."
            />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      <div className={`gh-mobile-menu ${mobileMenu ? "gh-open" : ""}`}>
        {navItems.map((item, i) => (
          <Link key={i} href={item.href} onClick={() => setMobileMenu(false)}>{item.label}</Link>
        ))}
        {extraPages.map(p => (
          <Link key={p.id} href={`${base}/${p.slug}`} onClick={() => setMobileMenu(false)}>{p.title}</Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GARDEN FOOTER
   ═══════════════════════════════════════════════════════════════ */
export function GardenFooter({
  storeName, storeSlug, logo, navPages = [], description,
  socialLinks = [], contactInfo,
}: GardenFooterProps) {
  const base = `/store/${storeSlug}`;

  const quickLinks = [
    { label: "All Products", href: `${base}/shop` },
    { label: "Garden Decor", href: `${base}/shop?category=garden-decor` },
    { label: "Home Decor", href: `${base}/shop?category=home-decor` },
    { label: "About", href: `${base}/about` },
    { label: "Contact", href: `${base}/contact` },
  ];

  const serviceLinks = [
    { label: "My Account", href: `${base}/my-account` },
    { label: "Order Tracking", href: `${base}/order-tracking` },
    { label: "Wishlist", href: `${base}/wishlist` },
    { label: "Reviews", href: `${base}/reviews` },
  ];

  const css = `
    .gf-wrap { background: ${G.footerBg}; color: #ccc; font-family: ${G.bodyFont}; }
    .gf-inner { max-width: ${G.containerWidth}; margin: 0 auto; padding: 60px 20px 30px; }
    .gf-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.2fr; gap: 40px; margin-bottom: 40px; }
    .gf-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; text-decoration: none; }
    .gf-logo-img { height: 32px; width: auto; filter: brightness(10); }
    .gf-logo-text { font-family: ${G.headingFont}; font-weight: 700; font-size: 20px; color: #fff; }
    .gf-desc { font-size: 14px; line-height: 1.7; color: #aaa; margin: 0; }
    .gf-title { font-family: ${G.headingFont}; font-weight: 600; font-size: 16px; color: #fff; margin: 0 0 20px; letter-spacing: 0.5px; }
    .gf-links { list-style: none; margin: 0; padding: 0; }
    .gf-links li { margin-bottom: 10px; }
    .gf-links a { color: #aaa; text-decoration: none; font-size: 14px; transition: color 0.2s; }
    .gf-links a:hover { color: ${G.accent}; }
    .gf-newsletter-text { font-size: 14px; color: #aaa; margin: 0 0 16px; line-height: 1.6; }
    .gf-newsletter-form { display: flex; gap: 0; }
    .gf-newsletter-input { flex: 1; padding: 10px 14px; border: 1px solid #333; background: transparent; color: #fff; font-family: ${G.bodyFont}; font-size: 13px; outline: none; border-radius: 0; }
    .gf-newsletter-input::placeholder { color: #666; }
    .gf-newsletter-btn { padding: 10px 20px; background: ${G.primary}; color: #fff; border: none; font-family: ${G.headingFont}; font-weight: 600; font-size: 13px; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
    .gf-newsletter-btn:hover { background: ${G.primaryHover}; }
    .gf-social { display: flex; gap: 12px; margin-top: 20px; }
    .gf-social a { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #333; color: #aaa; text-decoration: none; font-size: 14px; transition: all 0.2s; }
    .gf-social a:hover { color: ${G.accent}; border-color: ${G.accent}; }
    .gf-bottom { border-top: 1px solid #222; padding-top: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
    .gf-copy { font-size: 13px; color: #666; }
    .gf-powered { font-size: 13px; color: #666; }
    .gf-powered span { color: ${G.accent}; font-weight: 600; }
    @media (max-width: 900px) { .gf-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 600px) { .gf-grid { grid-template-columns: 1fr; } .gf-bottom { flex-direction: column; text-align: center; } }
  `;

  const socialIcons: Record<string, string> = {
    facebook: "f", instagram: "📷", twitter: "𝕏", tiktok: "♪", youtube: "▶",
  };

  return (
    <footer className="gf-wrap">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="gf-inner">
        <div className="gf-grid">
          {/* Col 1: Logo + description */}
          <div>
            <div className="gf-logo">
              {logo ? (
                <img src={logo} alt={storeName} className="gf-logo-img" />
              ) : (
                <span className="gf-logo-text">{storeName}</span>
              )}
            </div>
            <p className="gf-desc">
              {description || "Discover a curated collection of home and garden décor designed to bring warmth, elegance, and nature into your spaces."}
            </p>
            {socialLinks.length > 0 && (
              <div className="gf-social">
                {socialLinks.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                    {socialIcons[s.platform] || "●"}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="gf-title">Quick Links</h4>
            <ul className="gf-links">
              {quickLinks.map((link, i) => (
                <li key={i}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div>
            <h4 className="gf-title">Customer Service</h4>
            <ul className="gf-links">
              {serviceLinks.map((link, i) => (
                <li key={i}><Link href={link.href}>{link.label}</Link></li>
              ))}
              {navPages.filter(p => !["about", "contact", "home"].includes(p.slug)).slice(0, 3).map(p => (
                <li key={p.id}><Link href={`${base}/${p.slug}`}>{p.title}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="gf-title">Newsletter</h4>
            <p className="gf-newsletter-text">Subscribe for the latest home & garden décor inspiration and exclusive offers.</p>
            <div className="gf-newsletter-form">
              <input className="gf-newsletter-input" type="email" placeholder="Your email address" />
              <button className="gf-newsletter-btn">Subscribe</button>
            </div>
            {contactInfo && (
              <ul className="gf-links" style={{ marginTop: 20 }}>
                {contactInfo.phone && <li style={{ color: "#aaa", fontSize: 13 }}>📞 {contactInfo.phone}</li>}
                {contactInfo.email && <li style={{ color: "#aaa", fontSize: 13 }}>✉ {contactInfo.email}</li>}
                {contactInfo.address && <li style={{ color: "#aaa", fontSize: 13 }}>📍 {contactInfo.address}</li>}
              </ul>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="gf-bottom">
          <span className="gf-copy">© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
          <span className="gf-powered">Powered by <span>AfroStore</span></span>
        </div>
      </div>
    </footer>
  );
}
