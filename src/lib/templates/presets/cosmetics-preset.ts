import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Cosmetics Template Preset
 * Recreates the WoodMart Cosmetics demo layout with editable blocks.
 */
export const COSMETICS_TEMPLATE_PRESET: TemplateBlock[] = [
  {
    id: "cosmetics-hero",
    type: "cosmeticsHeroSlider",
    props: {
      autoplaySpeed: 5000,
      minHeight: "560px",
      slides: [
        {
          subtitle: "Commodo",
          titleLine1: "The Best Natural",
          titleLine2: "& Organic Mascara.",
          description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.",
          buttonText: "View More",
          buttonLink: "/shop",
          secondButtonText: "Read more",
          secondButtonLink: "/about",
        },
        {
          subtitle: "Montesa.",
          titleLine1: "Fix your look",
          titleLine2: "Organic Skincare.",
          description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered altera.",
          buttonText: "View More",
          buttonLink: "/shop",
          secondButtonText: "Read more",
          secondButtonLink: "/about",
        },
        {
          subtitle: "Commodo integer",
          titleLine1: "PROFESSIONAL",
          titleLine2: "SKINCARE",
          description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration.",
          buttonText: "View More",
          buttonLink: "/shop",
          secondButtonText: "Read more",
          secondButtonLink: "/about",
        },
      ],
    },
  },
  {
    id: "cosmetics-promos",
    type: "cosmeticsPromoBanners",
    props: {
      banners: [
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/cosmetics-promo-1.jpg",
          title: "REVITALIZING\nFACE MASKS",
          description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
          buttonText: "SHOP NOW",
          buttonLink: "/shop",
        },
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/cosmetics-promo-2.jpg",
          title: "SERUMS & OILS",
          description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.",
          buttonText: "SHOP NOW",
          buttonLink: "/shop",
        },
      ],
    },
  },
  {
    id: "cosmetics-featured",
    type: "cosmeticsProductGrid",
    props: {
      columns: 4,
      maxProducts: 8,
      filter: "featured",
      sectionTitle: {
        subtitle: "ORGANICS CREAM",
        title: "FACIAL CLEANSER",
        description: "Gravida turpis placerat tristique consectetur a condimentum nostra aliquet adipis.",
      },
      products: [],
    },
  },
  {
    id: "cosmetics-categories",
    type: "cosmeticsCategoryCards",
    props: {
      sectionTitle: {
        title: "SHOP BY CATEGORY",
      },
      categories: [
        { name: "Lighting", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=400&fit=crop", productCount: 12, link: "/shop" },
        { name: "Furniture", image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=400&fit=crop", productCount: 8, link: "/shop" },
        { name: "Cooking", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=400&fit=crop", productCount: 10, link: "/shop" },
        { name: "Clocks", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=300&h=400&fit=crop", productCount: 6, link: "/shop" },
        { name: "Accessories", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=400&fit=crop", productCount: 15, link: "/shop" },
      ],
    },
  },
  {
    id: "cosmetics-discovery",
    type: "cosmeticsDiscovery",
    props: {
      title: "Discover a beautiful you with our new Makeup Essentials",
      description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.",
      image: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/cosmetics-discovery.jpg",
      features: [
        { icon: "✨", titleLine1: "Lasting", titleLine2: "Formulas" },
        { icon: "🛡️", titleLine1: "Face skin", titleLine2: "Protection" },
        { icon: "👁️", titleLine1: "Eye care", titleLine2: "Products" },
      ],
      buttonText: "SHOP NOW",
      buttonLink: "/shop",
      secondButtonText: "READ MORE",
      secondButtonLink: "/about",
    },
  },
  {
    id: "cosmetics-bestsellers",
    type: "cosmeticsProductGrid",
    props: {
      columns: 4,
      maxProducts: 8,
      filter: "bestseller",
      sectionTitle: {
        subtitle: "ORGANIC INGREDIENTS",
        title: "BESTSELLERS",
      },
      products: [],
    },
  },
  {
    id: "cosmetics-countdown",
    type: "cosmeticsCountdownBanner",
    props: {
      title: "Vehicula fermentum",
      description: "The generated Lorem Ipsum is therefore always free from repetition humour.",
      image: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/cosmetics-countdown.jpg",
      buttonText: "SHOP NOW",
      buttonLink: "/shop",
      secondButtonText: "READ MORE",
      secondButtonLink: "/about",
    },
  },
  {
    id: "cosmetics-info",
    type: "cosmeticsInfoBoxes",
    props: {
      sectionTitle: { title: "WHY CHOOSE US" },
      boxes: [
        { image: "", number: "01", title: "Malesuada adipiscing", description: "Even if your less into design and more into content" },
        { image: "", number: "02", title: "Eleifend habitasse", description: "Strategy you may find some redeeming value with" },
        { image: "", number: "03", title: "Cras maecenas", description: "You made all the required mock for commissioned" },
        { image: "", number: "04", title: "Gravida conubia", description: "Layout, got all the approvals, built a tested code base" },
      ],
    },
  },
  {
    id: "cosmetics-blog",
    type: "cosmeticsBlogPosts",
    props: {
      columns: 2,
      sectionTitle: {
        subtitle: "OUR BLOG",
        title: "LATEST NEWS",
      },
      posts: [],
    },
  },
  {
    id: "cosmetics-newsletter",
    type: "cosmeticsNewsletter",
    props: {
      backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2017/01/newsletter-wood-3.jpg",
      title: "JOIN OUR NEWSLETTER",
      description: "Will be used in accordance with our Privacy Policy",
      buttonText: "Sign up",
    },
  },
  // Footer is handled at page level in page.tsx, not in preset
];

// Alias for clarity - COSMETICS_HOME_BLOCKS is the canonical home page preset
export const COSMETICS_HOME_BLOCKS = COSMETICS_TEMPLATE_PRESET;
