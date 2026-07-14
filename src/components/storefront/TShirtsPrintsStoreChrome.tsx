"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, ShoppingCart, User } from "lucide-react";

interface TShirtsPrintsHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  cartCount?: number;
  wishlistCount?: number;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

interface SocialLink {
  platform: string;
  url: string;
}

function socialLabel(platform: string) {
  switch (platform.toLowerCase()) {
    case "facebook":
      return "Facebook";
    case "twitter":
    case "x":
      return "X (Twitter)";
    case "instagram":
      return "Instagram";
    case "youtube":
      return "YouTube";
    case "tiktok":
      return "TikTok";
    default:
      return platform;
  }
}

export function TShirtsPrintsHeader({
  storeName,
  storeSlug,
  logo,
  cartCount = 0,
  wishlistCount = 0,
  onSearch,
  searchQuery = "",
  onSearchChange,
}: TShirtsPrintsHeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const navItems = [
    { label: "Home", href: `/store/${storeSlug}` },
    { label: "Shop", href: `/store/${storeSlug}/shop` },
    { label: "Blog", href: `/store/${storeSlug}/blog` },
    { label: "About us", href: `/store/${storeSlug}/about-us` },
    { label: "Contact us", href: `/store/${storeSlug}/contact-us` },
  ];

  const css = `
    .tp-header { position: sticky; top: 0; z-index: 50; background: #fff; border-bottom: 1px solid #ececec; }
    .tp-header-inner { max-width: 1320px; margin: 0 auto; padding: 14px 16px; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 22px; }
    .tp-brand { display: inline-flex; align-items: center; gap: 12px; text-decoration: none; color: #111; min-width: 0; }
    .tp-logo { width: 202px; max-width: 202px; height: auto; object-fit: contain; display: block; }
    .tp-name { font-family: "Manrope", Arial, sans-serif; font-size: 18px; font-weight: 700; letter-spacing: 0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tp-nav { display: flex; align-items: center; justify-content: center; gap: 36px; }
    .tp-nav a { color: #1d1d1d; text-decoration: none; font-family: "Manrope", Arial, sans-serif; font-size: 14px; font-weight: 700; line-height: 1; transition: color 0.15s ease; }
    .tp-nav a:hover { color: #808080; }
    .tp-actions { display: flex; align-items: center; gap: 10px; justify-content: flex-end; }
    .tp-action { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; padding: 0 10px; border: 0; background: transparent; color: #1d1d1d; text-decoration: none; font-family: "Manrope", Arial, sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; }
    .tp-action:hover { color: #808080; }
    .tp-action-icon { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; }
    .tp-badge { position: absolute; top: 1px; right: 2px; min-width: 16px; height: 16px; padding: 0 3px; border-radius: 999px; background: #111; color: #fff; font-size: 10px; font-weight: 700; line-height: 16px; text-align: center; }
    .tp-mobile-toggle { display: none; align-items: center; justify-content: center; width: 40px; height: 40px; border: 0; background: transparent; color: #1d1d1d; cursor: pointer; }
    .tp-mobile-panel { display: none; border-top: 1px solid #ececec; background: #fff; }
    .tp-mobile-panel.tp-open { display: block; }
    .tp-mobile-search { padding: 16px; border-bottom: 1px solid #f2f2f2; }
    .tp-mobile-search input { width: 100%; height: 44px; border: 1px solid #e7e7e7; padding: 0 14px; font-family: "Manrope", Arial, sans-serif; font-size: 14px; outline: none; }
    .tp-mobile-search input:focus { border-color: #111; }
    .tp-mobile-panel a { display: block; padding: 14px 16px; color: #1d1d1d; text-decoration: none; font-family: "Manrope", Arial, sans-serif; font-size: 14px; font-weight: 700; border-bottom: 1px solid #f3f3f3; }
    .tp-mobile-panel a:last-child { border-bottom: none; }
    .tp-mobile-meta { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 16px 16px; border-top: 1px solid #f2f2f2; }
    .tp-mobile-meta a { border: 1px solid #e7e7e7; border-radius: 999px; padding: 10px 14px; font-size: 12px; font-weight: 700; }
    @media (max-width: 1100px) {
      .tp-header-inner { grid-template-columns: auto 1fr auto; gap: 18px; }
      .tp-nav { gap: 18px; }
    }
    @media (max-width: 900px) {
      .tp-header-inner { grid-template-columns: auto 1fr auto; }
      .tp-nav { display: none; }
      .tp-mobile-toggle { display: inline-flex; }
      .tp-action.tp-login { display: none; }
      .tp-action.tp-wishlist-text { display: none; }
    }
    @media (max-width: 640px) {
      .tp-header-inner { padding: 12px 12px; gap: 10px; }
      .tp-name { font-size: 16px; }
      .tp-actions { gap: 4px; }
      .tp-action { min-height: 36px; padding: 0 6px; }
      .tp-action.tp-wishlist-text { display: none; }
    }
  `;

  return (
    <header className="tp-header">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="tp-header-inner">
        <Link href={`/store/${storeSlug}`} className="tp-brand" aria-label={storeName}>
          {logo ? <img src={logo} alt={storeName} className="tp-logo" /> : <span className="tp-name">{storeName}</span>}
        </Link>

        <nav className="tp-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="tp-actions">
          <button className="tp-mobile-toggle" type="button" aria-label="Toggle navigation" onClick={() => setMobileMenu((value) => !value)}>
            <Menu className="h-5 w-5" />
          </button>
          <Link href={`/store/${storeSlug}/my-account`} className="tp-action tp-login" aria-label="Login or register">
            <span className="tp-action-icon" aria-hidden="true">
              <User className="h-4 w-4" />
            </span>
            <span>Login / Register</span>
          </Link>
          <Link href={`/store/${storeSlug}/wishlist`} className="tp-action tp-wishlist-text" aria-label="Wishlist">
            <span className="tp-action-icon" aria-hidden="true">
              <Heart className="h-4 w-4" />
            </span>
            <span>Wishlist</span>
            {wishlistCount > 0 ? <span className="tp-badge">{wishlistCount}</span> : null}
          </Link>
          <Link href={`/store/${storeSlug}/cart`} className="tp-action" aria-label="Cart">
            <span className="tp-action-icon" aria-hidden="true">
              <ShoppingCart className="h-4 w-4" />
            </span>
            <span>Cart</span>
            {cartCount > 0 ? <span className="tp-badge">{cartCount}</span> : null}
          </Link>
        </div>
      </div>

      <div className={`tp-mobile-panel ${mobileMenu ? "tp-open" : ""}`}>
        <div className="tp-mobile-search">
          <input
            type="search"
            placeholder="Search for products"
            value={searchQuery}
            onChange={(event) => onSearchChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearch?.(event.currentTarget.value);
              }
            }}
          />
        </div>
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} onClick={() => setMobileMenu(false)}>
            {item.label}
          </Link>
        ))}
        <div className="tp-mobile-meta">
          <Link href={`/store/${storeSlug}/wishlist`} onClick={() => setMobileMenu(false)}>
            Wishlist
          </Link>
          <Link href={`/store/${storeSlug}/cart`} onClick={() => setMobileMenu(false)}>
            Cart
          </Link>
          <Link href={`/store/${storeSlug}/my-account`} onClick={() => setMobileMenu(false)}>
            Login / Register
          </Link>
        </div>
      </div>
    </header>
  );
}

interface TShirtsPrintsFooterProps {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  socialLinks?: SocialLink[];
}

export function TShirtsPrintsFooter({ storeName, storeSlug, logo, socialLinks = [] }: TShirtsPrintsFooterProps) {
  const fallbackLinks = [
    { platform: "facebook", url: "https://www.facebook.com/xtemos.studio" },
    { platform: "twitter", url: "https://x.com/xtemos_studio" },
    { platform: "instagram", url: "https://www.instagram.com/xtemos.studio/" },
    { platform: "youtube", url: "https://www.youtube.com/channel/UCu3loFwqqOQ9z-YTcnplK8w" },
  ];
  const links = socialLinks.length > 0 ? socialLinks : fallbackLinks;

  const css = `
    .tp-footer { border-top: 1px solid #ececec; background: #fff; color: #1d1d1d; }
    .tp-footer-inner { max-width: 1320px; margin: 0 auto; padding: 28px 16px 18px; display: flex; flex-direction: column; gap: 18px; }
    .tp-footer-top { display: flex; align-items: center; justify-content: space-between; gap: 18px; width: 100%; }
    .tp-footer-brand { display: inline-flex; align-items: center; gap: 12px; text-decoration: none; color: #111; min-width: 0; }
    .tp-footer-logo { width: 202px; max-width: 202px; height: auto; display: block; object-fit: contain; }
    .tp-footer-name { font-family: "Manrope", Arial, sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tp-socials { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; justify-content: flex-end; }
    .tp-socials a { color: #1d1d1d; text-decoration: none; font-family: "Manrope", Arial, sans-serif; font-size: 14px; font-weight: 700; transition: color 0.15s ease; }
    .tp-socials a:hover { color: #808080; }
    .tp-footer-copy { margin: 0; color: #1d1d1d; font-family: "Manrope", Arial, sans-serif; font-size: 14px; line-height: 1.8; text-align: center; }
    .tp-footer-copy a { color: inherit; text-decoration: none; font-weight: 700; }
    .tp-footer-copy a:hover { color: #808080; }
    @media (max-width: 640px) {
      .tp-footer-top { flex-direction: column; align-items: flex-start; }
      .tp-socials { justify-content: flex-start; gap: 14px; }
    }
  `;

  return (
    <footer className="tp-footer">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="tp-footer-inner">
        <div className="tp-footer-top">
          <Link href={`/store/${storeSlug}`} className="tp-footer-brand" aria-label={storeName}>
            {logo ? <img src={logo} alt={storeName} className="tp-footer-logo" /> : <span className="tp-footer-name">{storeName}</span>}
          </Link>

          <div className="tp-socials" aria-label="Social links">
            {links.map((link) => (
              <a key={`${link.platform}-${link.url}`} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.platform}>
                {socialLabel(link.platform)}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
