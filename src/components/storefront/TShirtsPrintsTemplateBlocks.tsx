"use client";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import Link from "next/link";
import { resolveStoreLink } from "@/lib/template-link-utils";

/* ═══════════════════════════════════════════════════════════════
   T-SHIRTS & PRINTS TEMPLATE BLOCKS
   Pixel-perfect replicas of WoodMart T-Shirts & Prints template sections.
   All styling inline — no external CSS dependencies.
   ═══════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const TOKENS = {
  primaryColor: "#111",
  primaryHover: "#333",
  titleColor: "#111",
  textColor: "#666",
  subtitleColor: "#7c7c7c",
  borderColor: "#ececec",
  backgroundColor: "#fff",
  containerWidth: "1320px",
  borderRadius: "28px",
  titleFont: "'Manrope', Arial, sans-serif",
  bodyFont: "'Manrope', Arial, sans-serif",
};

/* ─── FONT LOADER ───────────────────────────────────────────── */
export function TShirtsPrintsFontLoader() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    `}} />
  );
}

/* ─── SHARED STYLES ─────────────────────────────────────────── */
const containerStyle: React.CSSProperties = {
  maxWidth: TOKENS.containerWidth,
  margin: "0 auto",
  padding: "0 16px",
  boxSizing: "border-box" as const,
  width: "100%",
};

/* ─── SCOPED STYLE INJECTOR ─────────────────────────────────── */
function ScopedStyles({ id, css }: { id: string; css: string }) {
  return <style data-tshirt-block={id} dangerouslySetInnerHTML={{ __html: css }} />;
}

/* ─── STORE CONTEXT ─────────────────────────────────────────── */
export interface TShirtsPrintsStoreContextData {
  storeSlug: string;
  storeName: string;
}

export const TShirtsPrintsStoreContext = createContext<TShirtsPrintsStoreContextData | null>(null);

/* ═══════════════════════════════════════════════════════════════
   1. TSHIRT ABOUT HERO SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface TShirtAboutHeroProps {
  subtitle: string;
  title: string;
  description: string;
}

export function TShirtAboutHero({ subtitle, title, description }: TShirtAboutHeroProps) {
  const storeCtx = useContext(TShirtsPrintsStoreContext);
  const scopedCss = `
    .tah-section { padding: 64px 16px; }
    .tah-grid { display: grid; gap: 40px; max-width: 960px; margin: 0 auto; }
    @media (min-width: 1024px) {
      .tah-grid { grid-template-columns: 1.05fr 0.95fr; align-items: start; }
    }
    .tah-subtitle { 
      font-size: 12px; font-weight: 600; text-transform: uppercase; 
      letter-spacing: 0.35em; color: ${TOKENS.subtitleColor}; margin-bottom: 16px;
    }
    .tah-title { 
      font-family: ${TOKENS.titleFont}; font-size: 36px; font-weight: 700; 
      line-height: 1.2; color: ${TOKENS.titleColor}; margin: 0 0 24px;
    }
    @media (min-width: 640px) {
      .tah-title { font-size: 48px; }
    }
    .tah-description { 
      font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 2; 
      color: ${TOKENS.textColor}; margin: 0 0 32px;
    }
  `;

  return (
    <section className="tah-section">
      <ScopedStyles id="tshirt-about-hero" css={scopedCss} />
      <div className="tah-grid">
        <div>
          <p className="tah-subtitle">{subtitle}</p>
          <h1 className="tah-title">{title}</h1>
          <p className="tah-description">{description}</p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. TSHIRT FEATURE CARDS
   ═══════════════════════════════════════════════════════════════ */

export interface TShirtFeatureCard {
  title: string;
  description: string;
}

export interface TShirtFeatureCardsProps {
  features: TShirtFeatureCard[];
  columns?: number;
}

export function TShirtFeatureCards({ features, columns = 2 }: TShirtFeatureCardsProps) {
  const scopedCss = `
    .tfc-grid { 
      display: grid; gap: 16px; margin-top: 32px;
    }
    @media (min-width: 640px) {
      .tfc-grid { grid-template-columns: repeat(${columns}, 1fr); }
    }
    .tfc-card { 
      border-radius: 28px; border: 1px solid ${TOKENS.borderColor}; 
      background: ${TOKENS.backgroundColor}; padding: 24px;
      box-shadow: 0 16px 40px rgba(17,17,17,0.04);
    }
    .tfc-title { 
      font-size: 14px; font-weight: 600; text-transform: uppercase; 
      letter-spacing: 0.25em; color: ${TOKENS.titleColor}; margin: 0 0 12px;
    }
    .tfc-description { 
      font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.75; 
      color: ${TOKENS.textColor}; margin: 0;
    }
  `;

  return (
    <div className="tfc-grid">
      <ScopedStyles id="tshirt-feature-cards" css={scopedCss} />
      {features.map((feature, index) => (
        <div key={index} className="tfc-card">
          <p className="tfc-title">{feature.title}</p>
          <p className="tfc-description">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. TSHIRT IMAGE GRID WITH CALLOUT
   ═══════════════════════════════════════════════════════════════ */

export interface TShirtImageCalloutProps {
  images: string[];
  calloutTitle: string;
  calloutDescription: string;
  buttonText: string;
  buttonLink: string;
}

export function TShirtImageCallout({ images, calloutTitle, calloutDescription, buttonText, buttonLink }: TShirtImageCalloutProps) {
  const storeCtx = useContext(TShirtsPrintsStoreContext);
  const scopedCss = `
    .tic-grid { display: grid; gap: 16px; }
    @media (min-width: 640px) {
      .tic-grid { grid-template-columns: repeat(2, 1fr); }
    }
    .tic-image { 
      width: 100%; height: 100%; object-fit: cover; 
      border-radius: 28px; box-shadow: 0 20px 50px rgba(17,17,17,0.08);
    }
    .tic-callout { 
      border-radius: 28px; border: 1px solid ${TOKENS.borderColor}; 
      background: ${TOKENS.backgroundColor}; padding: 24px;
      box-shadow: 0 16px 40px rgba(17,17,17,0.04);
      display: flex; flex-direction: column; justify-content: center;
    }
    .tic-callout-title { 
      font-size: 14px; font-weight: 600; text-transform: uppercase; 
      letter-spacing: 0.25em; color: ${TOKENS.titleColor}; margin: 0 0 12px;
    }
    .tic-callout-desc { 
      font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.75; 
      color: ${TOKENS.textColor}; margin: 0 0 20px;
    }
    .tic-button { 
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 999px; background: ${TOKENS.primaryColor}; 
      padding: 10px 20px; font-family: ${TOKENS.bodyFont}; font-size: 14px; 
      font-weight: 600; color: #fff; text-decoration: none; 
      transition: background 0.2s;
    }
    .tic-button:hover { background: ${TOKENS.primaryHover}; }
  `;

  return (
    <div className="tic-grid">
      <ScopedStyles id="tshirt-image-callout" css={scopedCss} />
      {images.map((image, index) => (
        <img key={index} src={image} alt="" className="tic-image" />
      ))}
      <div className="tic-callout">
        <p className="tic-callout-title">{calloutTitle}</p>
        <p className="tic-callout-desc">{calloutDescription}</p>
        <Link href={resolveStoreLink(buttonLink, storeCtx?.storeSlug)} className="tic-button">
          {buttonText}
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. TSHIRT CONTACT FORM SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface TShirtContactFormSectionProps {
  subtitle: string;
  title: string;
  description: string;
  buttonText: string;
  showPhoneField?: boolean;
  showCompanyField?: boolean;
}

export function TShirtContactFormSection({ subtitle, title, description, buttonText, showPhoneField = true, showCompanyField = true }: TShirtContactFormSectionProps) {
  const scopedCss = `
    .tcfs-section { border-top: 1px solid ${TOKENS.borderColor}; border-bottom: 1px solid ${TOKENS.borderColor}; padding: 64px 16px; }
    .tcfs-grid { display: grid; gap: 40px; max-width: 960px; margin: 0 auto; }
    @media (min-width: 1024px) {
      .tcfs-grid { grid-template-columns: 0.9fr 1.1fr; align-items: start; }
    }
    .tcfs-subtitle { 
      font-size: 12px; font-weight: 600; text-transform: uppercase; 
      letter-spacing: 0.35em; color: ${TOKENS.subtitleColor}; margin-bottom: 16px;
    }
    .tcfs-title { 
      font-family: ${TOKENS.titleFont}; font-size: 36px; font-weight: 700; 
      line-height: 1.2; color: ${TOKENS.titleColor}; margin: 0 0 16px;
    }
    @media (min-width: 640px) {
      .tcfs-title { font-size: 48px; }
    }
    .tcfs-description { 
      font-family: ${TOKENS.bodyFont}; font-size: 16px; line-height: 2; 
      color: ${TOKENS.textColor}; margin: 0 0 24px;
    }
    .tcfs-button { 
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 999px; border: 1px solid ${TOKENS.primaryColor}; 
      padding: 10px 20px; font-family: ${TOKENS.bodyFont}; font-size: 14px; 
      font-weight: 600; color: ${TOKENS.primaryColor}; text-decoration: none; 
      transition: all 0.2s; cursor: pointer;
    }
    .tcfs-button:hover { background: ${TOKENS.primaryColor}; color: #fff; }
    .tcfs-form-card { 
      border-radius: 34px; border: 1px solid ${TOKENS.borderColor}; 
      background: ${TOKENS.backgroundColor}; padding: 32px;
      box-shadow: 0 30px 70px rgba(17,17,17,0.05);
    }
    @media (min-width: 640px) {
      .tcfs-form-card { padding: 40px; }
    }
    .tcfs-form-title { 
      font-family: ${TOKENS.titleFont}; font-size: 24px; font-weight: 700; 
      color: ${TOKENS.titleColor}; margin: 0 0 24px;
    }
    .tcfs-form-grid { display: grid; gap: 16px; }
    @media (min-width: 640px) {
      .tcfs-form-row { grid-template-columns: repeat(2, 1fr); }
    }
    .tcfs-input { 
      width: 100%; border-radius: 16px; border: 1px solid ${TOKENS.borderColor}; 
      background: #fbfbfb; padding: 12px 16px; font-family: ${TOKENS.bodyFont}; 
      font-size: 14px; outline: none; box-sizing: border-box;
    }
    .tcfs-input:focus { border-color: ${TOKENS.primaryColor}; }
    .tcfs-textarea { 
      min-height: 180px; border-radius: 24px; resize: vertical;
    }
    .tcfs-submit { 
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 999px; background: ${TOKENS.primaryColor}; 
      padding: 12px 24px; font-family: ${TOKENS.bodyFont}; font-size: 14px; 
      font-weight: 600; color: #fff; cursor: pointer; border: none;
    }
  `;

  return (
    <section className="tcfs-section">
      <ScopedStyles id="tshirt-contact-form-section" css={scopedCss} />
      <div className="tcfs-grid">
        <div>
          <p className="tcfs-subtitle">{subtitle}</p>
          <h2 className="tcfs-title">{title}</h2>
          <p className="tcfs-description">{description}</p>
          <button type="button" className="tcfs-button">{buttonText}</button>
        </div>
        <div className="tcfs-form-card">
          <h3 className="tcfs-form-title">Send Us a Message</h3>
          <form className="tcfs-form-grid">
            <div className="tcfs-form-row tcfs-form-grid">
              <input className="tcfs-input" placeholder="Your Name" />
              <input className="tcfs-input" placeholder="Your Email" />
            </div>
            {showPhoneField && showCompanyField && (
              <div className="tcfs-form-row tcfs-form-grid">
                <input className="tcfs-input" placeholder="Phone Number" />
                <input className="tcfs-input" placeholder="Company" />
              </div>
            )}
            <textarea className="tcfs-input tcfs-textarea" placeholder="Your Message" />
            <button type="button" className="tcfs-submit">{buttonText}</button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. TSHIRT BLOG POSTS GRID
   ═══════════════════════════════════════════════════════════════ */

export interface TShirtBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  badgeDay: string;
  badgeMonth: string;
  postedDate: string;
  author: string;
  category: string;
  image: string;
}

export interface TShirtBlogPostsProps {
  posts: TShirtBlogPost[];
  columns?: number;
  storeSlug?: string;
}

export function TShirtBlogPosts({ posts, columns = 2, storeSlug = "" }: TShirtBlogPostsProps) {
  const scopedCss = `
    .tbp-section { padding: 40px 0; }
    .tbp-grid { display: grid; gap: 32px; max-width: 1320px; margin: 0 auto; }
    @media (min-width: 1280px) {
      .tbp-grid { grid-template-columns: repeat(${columns}, 1fr); }
    }
    .tbp-article { display: flex; flex-direction: column; }
    .tbp-img-wrap { position: relative; overflow-hidden; }
    .tbp-img { height: 360px; width: 100%; object-fit: cover; transition: transform 0.5s; }
    .tbp-article:hover .tbp-img { transform: scale(1.05); }
    .tbp-date-badge { 
      position: absolute; left: 0; top: 0; background: #fff; 
      padding: 8px 12px; text-align: center; color: #111;
    }
    .tbp-date-day { display: block; font-size: 28px; font-weight: 600; line-height: 1; }
    .tbp-date-month { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; }
    .tbp-content { padding: 16px 0; }
    .tbp-category { 
      font-size: 11px; font-weight: 600; text-transform: uppercase; 
      letter-spacing: 0.22em; color: #111;
    }
    .tbp-meta { 
      display: flex; align-items: center; gap: 8px; margin-top: 8px; 
      font-size: 12px; color: #7c7c7c;
    }
    .tbp-author { font-weight: 600; color: #111; }
    .tbp-comments { margin-top: 4px; font-size: 12px; color: #7c7c7c; }
    .tbp-title { 
      margin-top: 12px; font-size: 23px; font-weight: 600; line-height: 1.2; color: #111;
    }
    .tbp-title a { color: inherit; text-decoration: none; }
    .tbp-title a:hover { color: #7c7c7c; }
    .tbp-excerpt { 
      margin-top: 12px; font-size: 14px; line-height: 1.75; color: #666;
    }
    .tbp-link { 
      display: inline-flex; margin-top: 16px; font-size: 14px; font-weight: 600; 
      color: #111; text-decoration: none;
    }
    .tbp-link:hover { color: #7c7c7c; }
  `;

  return (
    <section className="tbp-section">
      <ScopedStyles id="tshirt-blog-posts" css={scopedCss} />
      <div className="tbp-grid">
        {posts.map((post) => (
          <article key={post.id} className="tbp-article">
            <div className="tbp-img-wrap">
              <img src={post.image} alt={post.title} className="tbp-img" loading="lazy" />
              <span className="tbp-date-badge">
                <span className="tbp-date-day">{post.badgeDay}</span>
                <span className="tbp-date-month">{post.badgeMonth}</span>
              </span>
            </div>
            <div className="tbp-content">
              <div className="tbp-category">{post.category}</div>
              <div className="tbp-meta">
                <span>Posted by</span>
                <span className="tbp-author">{post.author}</span>
                <span>{post.postedDate}</span>
              </div>
              <div className="tbp-comments">0</div>
              <h2 className="tbp-title">
                <a href={`/store/${storeSlug}/blog/${post.slug}`}>{post.title}</a>
              </h2>
              <p className="tbp-excerpt">{post.excerpt}</p>
              <a href={`/store/${storeSlug}/blog/${post.slug}`} className="tbp-link">
                Continue reading
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. TSHIRT CONTACT INFO SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface TShirtContactInfoProps {
  title: string;
  address: string;
  phone: string;
  email: string;
  workingHours?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  description?: string;
}

export function TShirtContactInfo({ title, address, phone, email, workingHours, socialLinks = [], description }: TShirtContactInfoProps) {
  const scopedCss = `
    .tci-section { padding: 64px 16px; }
    .tci-grid { display: grid; gap: 40px; max-width: 960px; margin: 0 auto; }
    @media (min-width: 1024px) {
      .tci-grid { grid-template-columns: 0.9fr 1.1fr; align-items: start; }
    }
    .tci-card { 
      border-radius: 34px; border: 1px solid ${TOKENS.borderColor}; 
      background: ${TOKENS.backgroundColor}; padding: 32px;
      box-shadow: 0 20px 50px rgba(17,17,17,0.05);
    }
    .tci-card-alt { 
      background: #fffdf8; box-shadow: 0 20px 50px rgba(17,17,17,0.04);
    }
    .tci-title { 
      font-family: ${TOKENS.titleFont}; font-size: 24px; font-weight: 700; 
      color: ${TOKENS.titleColor}; margin: 0 0 24px;
    }
    .tci-info { 
      font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.75; 
      color: ${TOKENS.textColor}; margin: 0 0 16px;
    }
    .tci-info-label { font-weight: 600; color: ${TOKENS.titleColor}; }
    .tci-description { 
      font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.75; 
      color: ${TOKENS.textColor}; margin: 24px 0;
    }
    .tci-social { display: flex; flex-wrap: wrap; gap: 12px; }
    .tci-social-link { 
      border-radius: 999px; border: 1px solid ${TOKENS.borderColor}; 
      padding: 8px 16px; font-family: ${TOKENS.bodyFont}; font-size: 14px; 
      font-weight: 600; color: ${TOKENS.titleColor}; text-decoration: none;
      transition: all 0.2s;
    }
    .tci-social-link:hover { border-color: ${TOKENS.primaryColor}; }
    .tci-features { display: grid; gap: 16px; }
    @media (min-width: 640px) {
      .tci-features { grid-template-columns: repeat(2, 1fr); }
    }
    .tci-feature { 
      border-radius: 24px; background: ${TOKENS.backgroundColor}; 
      padding: 20px; box-shadow: 0 10px 30px rgba(17,17,17,0.04);
    }
    .tci-feature-title { 
      font-size: 14px; font-weight: 600; text-transform: uppercase; 
      letter-spacing: 0.2em; color: ${TOKENS.titleColor}; margin: 0 0 8px;
    }
    .tci-feature-desc { 
      font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.75; 
      color: ${TOKENS.textColor}; margin: 0;
    }
  `;

  return (
    <section className="tci-section">
      <ScopedStyles id="tshirt-contact-info" css={scopedCss} />
      <div className="tci-grid">
        <div className="tci-card">
          <h2 className="tci-title">{title}</h2>
          <div className="tci-info">
            <p><span className="tci-info-label">Address:</span> {address}</p>
            <p><span className="tci-info-label">Call Us:</span> {phone}</p>
            <p><span className="tci-info-label">Email:</span> {email}</p>
            {workingHours && <p><span className="tci-info-label">Working Hours:</span> {workingHours}</p>}
          </div>
          {description && <p className="tci-description">{description}</p>}
          {socialLinks.length > 0 && (
            <div className="tci-social">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="tci-social-link">
                  {social.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. TSHIRT CONTACT HERO SECTION
   ═══════════════════════════════════════════════════════════════ */

export interface TShirtContactHeroProps {
  subtitle: string;
  title: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    workingHours?: string;
  };
}

export function TShirtContactHero({ subtitle, title, contactInfo }: TShirtContactHeroProps) {
  const scopedCss = `
    .tch-section { border-bottom: 1px solid ${TOKENS.borderColor}; padding: 64px 16px; }
    .tch-grid { display: grid; gap: 40px; max-width: 960px; margin: 0 auto; }
    @media (min-width: 1024px) {
      .tch-grid { grid-template-columns: 0.9fr 1.1fr; align-items: start; }
    }
    .tch-subtitle { 
      font-size: 12px; font-weight: 600; text-transform: uppercase; 
      letter-spacing: 0.35em; color: ${TOKENS.subtitleColor}; margin-bottom: 16px;
    }
    .tch-title { 
      font-family: ${TOKENS.titleFont}; font-size: 36px; font-weight: 700; 
      line-height: 1.2; color: ${TOKENS.titleColor}; margin: 0 0 24px;
    }
    @media (min-width: 640px) {
      .tch-title { font-size: 48px; }
    }
    .tch-info { 
      font-family: ${TOKENS.bodyFont}; font-size: 14px; line-height: 1.75; 
      color: ${TOKENS.textColor}; margin: 0; display: flex; flex-direction: column; gap: 12px;
    }
    .tch-info-item { display: flex; gap: 8px; }
    .tch-info-label { font-weight: 600; color: ${TOKENS.titleColor}; }
  `;

  return (
    <section className="tch-section">
      <ScopedStyles id="tshirt-contact-hero" css={scopedCss} />
      <div className="tch-grid">
        <div>
          <p className="tch-subtitle">{subtitle}</p>
          <h1 className="tch-title">{title}</h1>
          <div className="tch-info">
            <p className="tch-info-item"><span className="tch-info-label">Email:</span> {contactInfo.email}</p>
            <p className="tch-info-item"><span className="tch-info-label">Call Us:</span> {contactInfo.phone}</p>
            <p className="tch-info-item"><span className="tch-info-label">Address:</span> {contactInfo.address}</p>
            {contactInfo.workingHours && (
              <p className="tch-info-item"><span className="tch-info-label">Working Hours:</span> {contactInfo.workingHours}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
