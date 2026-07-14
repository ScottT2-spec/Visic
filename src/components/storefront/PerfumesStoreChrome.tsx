"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resolveStoreLink } from "@/lib/template-link-utils";

const T = {
  primary: "#242424",
  accent: "#8b6798",
  titleColor: "#242424",
  textColor: "#767676",
  linkColor: "#333333",
  footerBg: "#1a1a1a",
  containerWidth: "1320px",
  titleFont: "'Cormorant Garamond', Georgia, serif",
  bodyFont: "'Inter', Arial, Helvetica, sans-serif",
};

export interface NavItem { id: string; label: string; url: string; type: string; openInNewTab?: boolean; }

interface PerfumesHeaderProps {
  storeName: string; storeSlug: string; logo?: string | null;
  cartCount?: number; wishlistCount?: number;
  socialLinks?: Array<{ platform: string; url: string }>;
  isLanding?: boolean;
}

export function PerfumesHeader({ storeName, storeSlug, logo, cartCount = 0, wishlistCount = 0, isLanding = false }: PerfumesHeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (q: string) => {
    if (q.trim()) { router.push(resolveStoreLink(`/shop?search=${encodeURIComponent(q.trim())}`, storeSlug)); setShowSearch(false); setSearchQuery(""); }
  };

  const collections = {
    forHer: [{ name: "Étheria", slug: "etheria" }, { name: "Celeste Aura", slug: "celeste-aura" }, { name: "Opus Essence", slug: "opus-essence" }],
    forHim: [{ name: "Velours Noir", slug: "velours-noir" }, { name: "Nocturne Essence", slug: "nocturne-essence" }, { name: "Elysian Bloom", slug: "elysian-bloom" }],
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
    .pfh-header { position: relative; z-index: 100; }
    .pfh-main { background: #fff; border-bottom: 1px solid #e8e8e8; }
    .pfh-main-inner { max-width: ${T.containerWidth}; margin: 0 auto; padding: 20px 15px; display: flex; align-items: center; justify-content: space-between; }
    .pfh-logo { text-decoration: none; display: flex; align-items: center; gap: 10px; }
    .pfh-logo-img { height: 40px; width: auto; object-fit: contain; }
    .pfh-logo-text { font-family: ${T.titleFont}; font-weight: 600; font-size: 32px; color: ${T.primary}; letter-spacing: -0.5px; }
    .pfh-nav { display: flex; align-items: center; gap: 0; }
    .pfh-nav-link { display: inline-flex; align-items: center; padding: 8px 18px; font-family: ${T.bodyFont}; font-weight: 500; font-size: 13px; color: ${T.linkColor}; text-decoration: none; text-transform: uppercase; letter-spacing: 1.5px; transition: color 0.2s; }
    .pfh-nav-link:hover { color: ${T.accent}; }
    .pfh-icons { display: flex; align-items: center; gap: 6px; }
    .pfh-icon-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: none; border: none; cursor: pointer; color: ${T.linkColor}; font-size: 18px; text-decoration: none; transition: color 0.2s; }
    .pfh-icon-btn:hover { color: ${T.accent}; }
    .pfh-badge { position: absolute; top: 2px; right: 0; min-width: 16px; height: 16px; border-radius: 50%; background: ${T.primary}; color: #fff; font-size: 9px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
    .pfh-mega-wrap { position: relative; }
    .pfh-mega { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); background: #fff; border: 1px solid #e8e8e8; box-shadow: 0 15px 40px rgba(0,0,0,0.08); padding: 35px 40px; min-width: 600px; display: none; z-index: 200; }
    .pfh-mega.pfh-open { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
    .pfh-mega-title { font-family: ${T.bodyFont}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: ${T.primary}; margin: 0 0 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
    .pfh-mega-links { list-style: none; padding: 0; margin: 0; }
    .pfh-mega-links li { margin-bottom: 10px; }
    .pfh-mega-links a { font-family: ${T.bodyFont}; font-size: 14px; color: ${T.textColor}; text-decoration: none; transition: color 0.2s; }
    .pfh-mega-links a:hover { color: ${T.primary}; }
    .pfh-search-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 300; display: flex; align-items: flex-start; justify-content: center; padding-top: 120px; }
    .pfh-search-box { background: #fff; padding: 30px 40px; width: 90%; max-width: 600px; }
    .pfh-search-input { width: 100%; padding: 15px 0; border: none; border-bottom: 2px solid ${T.primary}; font-family: ${T.titleFont}; font-size: 24px; outline: none; color: ${T.primary}; background: transparent; }
    .pfh-search-input::placeholder { color: #bbb; }
    .pfh-mobile-toggle { display: none; background: none; border: none; font-size: 22px; cursor: pointer; color: ${T.linkColor}; padding: 8px; }
    .pfh-mobile-menu { display: none; background: #fff; border-top: 1px solid #e8e8e8; padding: 20px; position: absolute; top: 100%; left: 0; right: 0; z-index: 150; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .pfh-mobile-menu.pfh-open { display: block; }
    .pfh-mobile-menu a { display: block; padding: 12px 0; font-family: ${T.bodyFont}; font-weight: 500; font-size: 14px; color: ${T.linkColor}; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f5f5f5; }
    .pfh-mobile-menu a:hover { color: ${T.accent}; }
    .pfh-mobile-sub { padding-left: 20px; }
    .pfh-mobile-sub a { font-size: 13px; text-transform: none; letter-spacing: 0; color: ${T.textColor}; }
    @media (max-width: 1024px) { .pfh-nav { display: none; } .pfh-mobile-toggle { display: block; } .pfh-logo-text { font-size: 24px; } }
    @media (max-width: 767px) { .pfh-logo-text { font-size: 20px; } .pfh-icons { gap: 2px; } .pfh-icon-btn { width: 36px; height: 36px; font-size: 16px; } }
  `;

  const navLinks = [
    { label: "New", href: resolveStoreLink("/shop?sort=newest", storeSlug) },
    { label: "Fragrances", href: resolveStoreLink("/fragrances", storeSlug), hasMega: true },
    { label: "Journal", href: resolveStoreLink("/journal", storeSlug) },
    { label: "About Us", href: resolveStoreLink("/about", storeSlug) },
  ];

  return (
    <div className="pfh-header">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="pfh-main">
        <div className="pfh-main-inner">
          <button className="pfh-mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">{mobileMenu ? "✕" : "☰"}</button>
          <nav className="pfh-nav">
            {navLinks.slice(0, 2).map((item) =>
              item.hasMega ? (
                <div key={item.label} className="pfh-mega-wrap" onMouseEnter={() => setShowMegaMenu(true)} onMouseLeave={() => setShowMegaMenu(false)}>
                  <Link href={item.href} className="pfh-nav-link">{item.label}</Link>
                  <div className={`pfh-mega ${showMegaMenu ? "pfh-open" : ""}`}>
                    <div>
                      <h4 className="pfh-mega-title">Collections for Her</h4>
                      <ul className="pfh-mega-links">{collections.forHer.map(c => (<li key={c.slug}><Link href={resolveStoreLink(`/shop?category=${c.slug}`, storeSlug)}>{c.name}</Link></li>))}</ul>
                    </div>
                    <div>
                      <h4 className="pfh-mega-title">Collections for Him</h4>
                      <ul className="pfh-mega-links">{collections.forHim.map(c => (<li key={c.slug}><Link href={resolveStoreLink(`/shop?category=${c.slug}`, storeSlug)}>{c.name}</Link></li>))}</ul>
                    </div>
                    <div>
                      <h4 className="pfh-mega-title">All Collections</h4>
                      <ul className="pfh-mega-links">{[...collections.forHer, ...collections.forHim].map(c => (<li key={c.slug}><Link href={resolveStoreLink(`/shop?category=${c.slug}`, storeSlug)}>{c.name}</Link></li>))}</ul>
                    </div>
                  </div>
                </div>
              ) : (<Link key={item.label} href={item.href} className="pfh-nav-link">{item.label}</Link>)
            )}
          </nav>
          <Link href={resolveStoreLink("/", storeSlug)} className="pfh-logo">
            {logo ? <img src={logo} alt={storeName} className="pfh-logo-img" /> : null}
            <span className="pfh-logo-text">{storeName}</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <nav className="pfh-nav">
              {navLinks.slice(2).map((item) => (<Link key={item.label} href={item.href} className="pfh-nav-link">{item.label}</Link>))}
            </nav>
            <div className="pfh-icons">
              {!isLanding && (<>
                <button className="pfh-icon-btn" onClick={() => setShowSearch(true)} aria-label="Search">🔍</button>
                <Link href={resolveStoreLink("/wishlist", storeSlug)} className="pfh-icon-btn" aria-label="Wishlist">♡{wishlistCount > 0 && <span className="pfh-badge">{wishlistCount}</span>}</Link>
                <Link href={resolveStoreLink("/cart", storeSlug)} className="pfh-icon-btn" aria-label="Cart">🛒{cartCount > 0 && <span className="pfh-badge">{cartCount}</span>}</Link>
              </>)}
            </div>
          </div>
        </div>
      </div>
      {showSearch && (
        <div className="pfh-search-overlay" onClick={() => setShowSearch(false)}>
          <div className="pfh-search-box" onClick={e => e.stopPropagation()}>
            <input autoFocus type="text" className="pfh-search-input" placeholder="Search fragrances..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSearch(searchQuery); if (e.key === "Escape") setShowSearch(false); }} />
          </div>
        </div>
      )}
      <div className={`pfh-mobile-menu ${mobileMenu ? "pfh-open" : ""}`}>
        <Link href={resolveStoreLink("/", storeSlug)} onClick={() => setMobileMenu(false)}>Home</Link>
        <Link href={resolveStoreLink("/shop?sort=newest", storeSlug)} onClick={() => setMobileMenu(false)}>New</Link>
        <Link href={resolveStoreLink("/fragrances", storeSlug)} onClick={() => setMobileMenu(false)}>Fragrances</Link>
        <div className="pfh-mobile-sub">
          {collections.forHer.map(c => (<Link key={c.slug} href={resolveStoreLink(`/shop?category=${c.slug}`, storeSlug)} onClick={() => setMobileMenu(false)}>{c.name}</Link>))}
          {collections.forHim.map(c => (<Link key={c.slug} href={resolveStoreLink(`/shop?category=${c.slug}`, storeSlug)} onClick={() => setMobileMenu(false)}>{c.name}</Link>))}
        </div>
        <Link href={resolveStoreLink("/journal", storeSlug)} onClick={() => setMobileMenu(false)}>Journal</Link>
        <Link href={resolveStoreLink("/about", storeSlug)} onClick={() => setMobileMenu(false)}>About Us</Link>
        <Link href={resolveStoreLink("/contact", storeSlug)} onClick={() => setMobileMenu(false)}>Contact Us</Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PERFUMES FOOTER
   ═══════════════════════════════════════════════════════════════ */

interface PerfumesFooterProps {
  storeName: string; storeSlug: string; logo?: string | null;
  description?: string; socialLinks?: Array<{ platform: string; url: string }>;
  contactInfo?: { address?: string; phone?: string; email?: string };
}

export function PerfumesFooter({ storeName, storeSlug, logo, description, socialLinks = [], contactInfo }: PerfumesFooterProps) {
  const css = `
    .pff-footer { background: ${T.footerBg}; color: rgba(255,255,255,0.55); font-family: ${T.bodyFont}; padding: 70px 0 0; }
    .pff-inner { max-width: ${T.containerWidth}; margin: 0 auto; padding: 0 15px; display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 50px; }
    .pff-col-title { font-family: ${T.titleFont}; font-weight: 600; font-size: 22px; color: #fff; margin: 0 0 22px; }
    .pff-text { font-size: 14px; line-height: 1.8; color: rgba(255,255,255,0.55); margin-bottom: 20px; }
    .pff-links { list-style: none; padding: 0; margin: 0; }
    .pff-links li { margin-bottom: 10px; }
    .pff-links a { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 14px; transition: color 0.25s; }
    .pff-links a:hover { color: #fff; }
    .pff-contact-item { margin-bottom: 12px; font-size: 14px; line-height: 1.6; }
    .pff-contact-label { color: rgba(255,255,255,0.8); font-weight: 600; }
    .pff-social { display: flex; gap: 10px; margin-top: 22px; }
    .pff-social-icon { width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.55); text-decoration: none; font-size: 14px; transition: all 0.25s; }
    .pff-social-icon:hover { border-color: #fff; color: #fff; }
    .pff-bottom { max-width: ${T.containerWidth}; margin: 0 auto; padding: 28px 15px; margin-top: 50px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
    .pff-copyright { color: rgba(255,255,255,0.35); }
    .pff-logo-text { font-family: ${T.titleFont}; font-weight: 600; font-size: 26px; color: #fff; text-decoration: none; margin-bottom: 18px; display: inline-block; letter-spacing: -0.5px; }
    .pff-instagram { background: ${T.footerBg}; padding: 50px 0 0; }
    .pff-inst-title { font-family: ${T.titleFont}; font-size: 18px; color: rgba(255,255,255,0.7); text-align: center; margin-bottom: 25px; }
    .pff-inst-title a { color: #fff; text-decoration: none; }
    .pff-inst-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
    .pff-inst-item { aspect-ratio: 1; overflow: hidden; }
    .pff-inst-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s, opacity 0.3s; }
    .pff-inst-item:hover img { transform: scale(1.05); opacity: 0.8; }
    @media (max-width: 1024px) { .pff-inner { grid-template-columns: repeat(2, 1fr); gap: 35px; } .pff-inst-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 767px) { .pff-inner { grid-template-columns: 1fr; gap: 30px; } .pff-bottom { flex-direction: column; gap: 12px; text-align: center; } .pff-inst-grid { grid-template-columns: repeat(2, 1fr); } }
  `;

  const socialIcons: Record<string, string> = { facebook: "f", twitter: "𝕏", instagram: "📷", youtube: "▶", tiktok: "♪" };
  const instagramImages = [
    "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-inst-1-300x300.jpg",
    "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-inst-2-300x300.jpg",
    "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-inst-3-300x300.jpg",
    "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-inst-4-300x300.jpg",
    "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-inst-5-300x300.jpg",
    "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-inst-6-300x300.jpg",
  ];

  return (
    <>
      <div className="pff-instagram">
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <p className="pff-inst-title">Connect to our Instagram — <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">@{storeName.toLowerCase().replace(/\s+/g, "")}</a></p>
        <div className="pff-inst-grid">
          {instagramImages.map((img, i) => (<a key={i} href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="pff-inst-item"><img src={img} alt={`Instagram ${i + 1}`} loading="lazy" /></a>))}
        </div>
      </div>
      <footer className="pff-footer">
        <div className="pff-inner">
          <div>
            <Link href={resolveStoreLink("/", storeSlug)} className="pff-logo-text">{storeName}</Link>
            <p className="pff-text">{description || "Discover a curated collection of luxurious fragrances crafted to bring elegance and personality to every moment."}</p>
            <div className="pff-social">
              {socialLinks.length > 0 ? socialLinks.map((s, i) => (
                <a key={i} href={s.url} className="pff-social-icon" target="_blank" rel="noopener noreferrer" aria-label={s.platform}>{socialIcons[s.platform] || s.platform[0]?.toUpperCase()}</a>
              )) : (<><a href="#" className="pff-social-icon">f</a><a href="#" className="pff-social-icon">𝕏</a><a href="#" className="pff-social-icon">📷</a><a href="#" className="pff-social-icon">▶</a></>)}
            </div>
          </div>
          <div>
            <h4 className="pff-col-title">Shop</h4>
            <ul className="pff-links">
              <li><Link href={resolveStoreLink("/shop?sort=newest", storeSlug)}>New Arrivals</Link></li>
              <li><Link href={resolveStoreLink("/fragrances", storeSlug)}>All Fragrances</Link></li>
              <li><Link href={resolveStoreLink("/shop", storeSlug)}>For Her</Link></li>
              <li><Link href={resolveStoreLink("/shop", storeSlug)}>For Him</Link></li>
              <li><Link href={resolveStoreLink("/shop", storeSlug)}>Bestsellers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="pff-col-title">Information</h4>
            <ul className="pff-links">
              <li><Link href={resolveStoreLink("/about", storeSlug)}>About Us</Link></li>
              <li><Link href={resolveStoreLink("/contact", storeSlug)}>Contact Us</Link></li>
              <li><Link href={resolveStoreLink("/journal", storeSlug)}>Blog</Link></li>
              <li><Link href={resolveStoreLink("/reviews", storeSlug)}>Reviews</Link></li>
              <li><Link href={resolveStoreLink("/contact", storeSlug)}>FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="pff-col-title">Contact Us</h4>
            {contactInfo?.address && <div className="pff-contact-item"><span className="pff-contact-label">Address: </span>{contactInfo.address}</div>}
            {contactInfo?.phone && <div className="pff-contact-item"><span className="pff-contact-label">Phone: </span>{contactInfo.phone}</div>}
            {contactInfo?.email && <div className="pff-contact-item"><span className="pff-contact-label">Email: </span>{contactInfo.email}</div>}
            {!contactInfo?.address && !contactInfo?.phone && !contactInfo?.email && (<>
              <div className="pff-contact-item"><span className="pff-contact-label">Address: </span>123 Perfume Lane, Paris, France</div>
              <div className="pff-contact-item"><span className="pff-contact-label">Phone: </span>+33 1 23 45 67 89</div>
              <div className="pff-contact-item"><span className="pff-contact-label">Hours: </span>Mon–Fri: 9AM – 6PM</div>
            </>)}
          </div>
        </div>
        <div className="pff-bottom"><span className="pff-copyright">© {new Date().getFullYear()} {storeName}. All rights reserved.</span></div>
      </footer>
    </>
  );
}
