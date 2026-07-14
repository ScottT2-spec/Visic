import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Electronics Template Preset
 * Default block layout + content that recreates the WoodMart Electronics demo.
 * Every value is a placeholder — merchants swap in their own content.
 */
export const ELECTRONICS_TEMPLATE_PRESET: TemplateBlock[] = [
  /* ── 1. Hero Slider ───────────────────────────────────── */
  {
    id: "electronics-hero",
    type: "electronicsHeroSlider",
    props: {
      autoplaySpeed: 5000,
      minHeight: "500px",
      slides: [
        {
          subtitle: "TOP SMARTPHONES",
          titleLine1: "PERFORMANCE",
          titleLine2: "WONDERFUL",
          description: "A ornare aliquam laoreet adipiscing vestibul integer malesuada ullamcorper suspeid.",
          buttonText: "Buy Now",
          buttonLink: "/shop",
          backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2021/06/w-electronic-slide-1.jpg",
          backgroundColor: "#f2f2f2",
          backgroundFit: "cover",
          textPosition: "left",
          colorScheme: "dark",
        },
        {
          subtitle: "SMART WATCHES",
          titleLine1: "HEALTH CARE",
          titleLine2: "MONITOR",
          description: "A ornare aliquam laoreet adipiscing vestibul integer malesuada ullamcorper suspeid.",
          buttonText: "Buy Now",
          buttonLink: "/shop",
          backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/accessories_large.jpg",
          backgroundColor: "#f2f2f2",
          backgroundFit: "contain",
          textPosition: "left",
          colorScheme: "dark",
        },
        {
          subtitle: "APPLE INNOVATION",
          titleLine1: "HIGHER LEVEL",
          titleLine2: "SMARTPHONE",
          description: "A ornare aliquam laoreet adipiscing vestibul integer malesuada ullamcorper suspeid.",
          buttonText: "Buy Now",
          buttonLink: "/shop",
          backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/hero_large.jpg",
          backgroundColor: "#000000",
          backgroundFit: "contain",
          textPosition: "left",
          colorScheme: "light",
        },
      ],
    },
  },

  /* ── 2. Promo Banners ─────────────────────────────────── */
  {
    id: "electronics-promos",
    type: "electronicsPromoBanners",
    props: {
      banners: [
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/electro-banner10.jpg",
          subtitle: "NEW TECHNOLOGIES",
          title: "WEBCAMS 2024",
          description: "Auctor litora ultrices suscipit\nmalesuada nunc a netus",
          buttonText: "Shop More",
          buttonLink: "/shop",
          colorScheme: "dark",
        },
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/electro-banner11.jpg",
          subtitle: "APPLE ACCESSORIES",
          title: "LEATHER CASES",
          description: "Condimentum curabitur vestibulum\ndapibus porttitor adipiscing",
          buttonText: "SHOP MORE",
          buttonLink: "/shop",
          colorScheme: "light",
        },
      ],
    },
  },

  /* ── 3. Product Tabs ──────────────────────────────────── */
  {
    id: "electronics-products-1",
    type: "electronicsProductTabs",
    props: {
      sectionTitle: "ELECTRONICS",
      tabs: [
        { label: "New", filter: "new" },
        { label: "Featured", filter: "featured" },
        { label: "Top Sellers", filter: "top-sellers" },
      ],
      columns: 4,
      maxProducts: 8,
    },
  },

  /* ── 4. Banner Grid ───────────────────────────────────── */
  {
    id: "electronics-banner-grid",
    type: "electronicsBannerGrid",
    props: {
      banners: [
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/electro-banner1-2.jpg",
          subtitle: "Hich Tech News",
          title: "Monster Beats\nHeadphones",
          buttonText: "Read More",
          buttonLink: "/shop",
          colorScheme: "light",
        },
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/electro-banner3-1.jpg",
          subtitle: "Play The Dream",
          title: "Apple iPhone 7\nColor Red",
          colorScheme: "light",
        },
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/electro-banner3.jpg",
          subtitle: "Minimalism Design",
          title: "Music Makes\nFeel Better",
          colorScheme: "light",
        },
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/electro-banner.jpg",
          subtitle: "Health & Fit",
          title: "Apple iWatch Nike Edition",
          buttonText: "Watch Demo",
          buttonLink: "/shop",
          colorScheme: "light",
        },
      ],
    },
  },

  /* ── 5. Hot Deals ─────────────────────────────────────── */
  {
    id: "electronics-hot-deals",
    type: "electronicsHotDeals",
    props: {
      sectionTitle: "TODAY HOT DEALS",
      buttonText: "View All Deals",
      buttonLink: "/shop",
      backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/bg-electro.jpg",
      maxProducts: 6,
      columns: 3,
      filter: "sale",
    },
  },

  /* ── 6. Side Banner + Featured Products ───────────────── */
  {
    id: "electronics-side-banner",
    type: "electronicsSideBanner",
    props: {
      bannerImage: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/electro-banner1-32.jpg",
      bannerSubtitle: "Hich Tech News",
      bannerTitle: "Google Smart Home 2024",
      bannerButtonText: "Read More",
      bannerButtonLink: "/shop",
      featuredTitle: "FEATURED PRODUCTS",
      maxFeaturedProducts: 4,
      rightSectionTitle: "ELECTRONICS",
      rightTabs: [
        { label: "New", filter: "new" },
        { label: "Featured", filter: "featured" },
        { label: "Top Sellers", filter: "top-sellers" },
      ],
      rightMaxProducts: 6,
    },
  },

  /* ── 7. Gaming CTA ────────────────────────────────────── */
  {
    id: "electronics-gaming-cta",
    type: "electronicsGamingCTA",
    props: {
      backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/electro-dualshok.jpg",
      subtitle: "GAMING COLLECTION",
      title: "Sony Playstation 4 Dualshok Controller",
      primaryButtonText: "Buy Now",
      primaryButtonLink: "/shop",
      secondaryButtonText: "Read More",
      secondaryButtonLink: "/shop",
      productImage: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/dualshok.png",
    },
  },

  /* ── 8. Blog Posts ────────────────────────────────────── */
  {
    id: "electronics-blog",
    type: "electronicsBlogPosts",
    props: {
      sectionTitle: "INNOVATIVE GADGETS",
      columns: 3,
      posts: [
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/electro-blog1.jpg",
          title: "Collar brings back coffee brewing ritual",
          excerpt: "",
          date: { day: "23", month: "Jul", year: "2016" },
          category: "Design trends",
          author: "S. Rogers",
          link: "#",
        },
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/electro-blog2.jpg",
          title: "Exterior ideas: 10 colored garden seats",
          excerpt: "",
          date: { day: "23", month: "Jul", year: "2016" },
          category: "Inspiration",
          author: "S. Rogers",
          link: "#",
        },
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/electro-blog3.jpg",
          title: "Exploring Atlanta\u2019s modern homes",
          excerpt: "",
          date: { day: "23", month: "Jul", year: "2016" },
          category: "Design trends",
          author: "S. Rogers",
          link: "#",
        },
      ],
    },
  },

  /* ── 9. Partners ──────────────────────────────────────── */
  {
    id: "electronics-partners",
    type: "electronicsPartners",
    props: {
      sectionTitle: "OUR PARTNERS",
      videoUrl: "https://www.youtube.com/watch?v=XHOmBV4js_E",
      videoThumbnail: "https://woodmart.xtemos.com/wp-content/uploads/2022/06/electro-video.jpg",
      logos: [
        { name: "Vitra", logoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2016/09/brand-witra.png", linkUrl: "#" },
        { name: "Rosenthal", logoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2016/09/brand-Rosenthal.png", linkUrl: "#" },
        { name: "PackIt", logoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2016/09/brand-PackIt.png", linkUrl: "#" },
        { name: "Niche", logoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/nichemodern.png", linkUrl: "#" },
        { name: "Magisso", logoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2016/09/brand-Magisso.png", linkUrl: "#" },
        { name: "Louis Poulsen", logoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2016/09/brand-Louis-Poulsen.png", linkUrl: "#" },
        { name: "Joseph Joseph", logoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2016/09/brand-Joseph-Joseph.png", linkUrl: "#" },
        { name: "Hay", logoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2016/09/brand-hay.png", linkUrl: "#" },
        { name: "PackIt", logoUrl: "https://woodmart.xtemos.com/wp-content/uploads/2016/09/brand-PackIt.png", linkUrl: "#" },
      ],
    },
  },
  {
    id: "electronics-footer",
    type: "electronicsFooter",
    props: {
      logoUrl: "",
      logoAlt: "Store Logo",
      description: "Discover a curated collection of modern furniture designed to bring comfort and elegance into your home.",
      contact: {
        address: "451 Wall Street, UK, London",
        phone: "(064) 332-1233",
        fax: "(099) 453-1357",
      },
      recentPosts: [],
      linkColumns: [
        { title: "OUR STORES", links: [{ label: "New York", url: "#" }, { label: "London SF", url: "#" }, { label: "Edinburgh", url: "#" }, { label: "Los Angeles", url: "#" }, { label: "Chicago", url: "#" }, { label: "Las Vegas", url: "#" }] },
        { title: "USEFUL LINKS", links: [{ label: "Privacy Policy", url: "#" }, { label: "Returns", url: "#" }, { label: "Terms & Conditions", url: "#" }, { label: "Contact Us", url: "#" }, { label: "Latest News", url: "#" }, { label: "Our Sitemap", url: "#" }] },
        { title: "FOOTER MENU", links: [{ label: "Instagram profile", url: "#" }, { label: "New Collection", url: "#" }, { label: "Contact Us", url: "#" }, { label: "Latest News", url: "#" }, { label: "Our Sitemap", url: "#" }] },
      ],
      copyrightText: "",
      paymentIconsUrl: "https://woodmart.xtemos.com/wp-content/uploads/2018/08/payment.png",
    },
  },
];
