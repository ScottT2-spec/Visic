import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Interior Design / Decor Template Preset
 * Recreates the WoodMart Decor demo layout with editable blocks.
 */
export const INTERIOR_DECOR_PRESET: TemplateBlock[] = [
  {
    id: "interior-hero",
    type: "interiorHeroSlider",
    props: {
      autoplaySpeed: 5000,
      slides: [
        {
          titleLine1: "Ball-Shaped Table",
          titleLine2: "Night Lamp.",
          subtitle: "$250.00",
          buttonText: "Go To Shop",
          buttonLink: "/shop",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-slide-4-right-img.jpg",
        },
        {
          titleLine1: "Home Flower Plant",
          titleLine2: "Glass Vase.",
          subtitle: "$286.00",
          buttonText: "Go To Shop",
          buttonLink: "/shop",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-slide-3-right-img.jpg",
        },
        {
          titleLine1: "Modern Nordic",
          titleLine2: "Minimalist Cattle.",
          buttonText: "Go To Shop",
          buttonLink: "/shop",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-slide-2-right-img.jpg",
        },
        {
          titleLine1: "Two Bowls Marble",
          titleLine2: "and Brass.",
          buttonText: "Go To Shop",
          buttonLink: "/shop",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-slide-1-right-img.jpg",
        },
      ],
    },
  },
  {
    id: "interior-categories",
    type: "interiorCategoryGrid",
    props: {
      sectionTitle: "TOP CATEGORIES",
      columns: 5,
      categories: [
        { name: "Home Decor", icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-category-plant.svg", image: "", link: "/shop" },
        { name: "Celing Decor", icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-category-lamp.svg", image: "", link: "/shop" },
        { name: "Wall Decor", icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-category-art.svg", image: "", link: "/shop" },
        { name: "Vase Decor", icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-category-vase.svg", image: "", link: "/shop" },
        { name: "Holiday Decor", icon: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-category-baloons.svg", image: "", link: "/shop" },
      ],
    },
  },
  {
    id: "interior-promos",
    type: "interiorPromoBanners",
    props: {
      variant: "garden",
      banners: [
        {
          title: "New Arrivals In Decorations.",
          subtitle: "View More",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-banner-1.jpg",
          buttonText: "View More",
          buttonLink: "/shop",
        },
        {
          title: "Decorative Wall Elements.",
          subtitle: "View More",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-banner-2.jpg",
          buttonText: "View More",
          buttonLink: "/shop",
        },
        {
          title: "Decorations For New Novel.",
          subtitle: "View More",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2018/09/decor-banner-3.jpg",
          buttonText: "View More",
          buttonLink: "/shop",
        },
      ],
    },
  },
  {
    id: "interior-featured",
    type: "interiorProductGrid",
    props: {
      columns: 5,
      maxProducts: 10,
      sectionTitle: "Featured Products",
      products: [],
    },
  },
  {
    id: "interior-info",
    type: "interiorInfoBoxes",
    props: {
      items: [
        { icon: "🏠", title: "Home Modern Decoration Decals.", description: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born." },
        { icon: "✨", title: "New Decoration Solutions for Home.", description: "Supported neglected met she therefore unwilling discovery remainder." },
      ],
    },
  },
  {
    id: "interior-blog",
    type: "interiorBlogPosts",
    props: {
      columns: 4,
      sectionTitle: "OUR BLOG",
      posts: [],
    },
  },
  {
    id: "interior-cta",
    type: "interiorCta",
    props: {
      title: "Summer 25% discount on all last year\u2019s products home decor",
      buttonText: "To Shop",
      buttonLink: "/shop",
      backgroundColor: "#f5f0eb",
    },
  },
  {
    id: "interior-footer", type: "interiorFooter",
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

/**
 * Interior Design / Retail Template Preset
 * Recreates the WoodMart Retail demo layout with editable blocks.
 */
export const INTERIOR_RETAIL_PRESET: TemplateBlock[] = [
  {
    id: "garden-hero",
    type: "gardenHeroBanner",
    props: {
      heading: "Crafted with Care for Memorable Moments",
      subheading: "From timeless pieces to modern accents, create a home that celebrates your unique story.",
      ctaText: "SHOP NOW",
      ctaLink: "/shop",
      image: "https://websitedemos.net/home-garden-decor-02/wp-content/uploads/sites/1034/2025/11/heroimage-1.png",
      exploreBtns: [
        { label: "Explore Indoor", link: "/shop?category=home-decor" },
        { label: "Explore Outdoor", link: "/shop?category=garden-decor" },
      ],
    },
  },
  {
    id: "garden-categories",
    type: "gardenCategoryBanner",
    props: {
      banners: [
        {
          title: "Explore Indoor",
          subtitle: "Home Décor Collection",
          image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=700&h=500&fit=crop",
          link: "/shop?category=home-decor",
        },
        {
          title: "Explore Outdoor",
          subtitle: "Garden Décor Collection",
          image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=700&h=500&fit=crop",
          link: "/shop?category=garden-decor",
        },
      ],
    },
  },
  {
    id: "garden-discount",
    type: "gardenDiscountBanner",
    props: {
      title: "20% OFF On Your First Order",
      ctaText: "SHOP NOW",
      ctaLink: "/shop",
      backgroundColor: "#038f81",
    },
  },
  {
    id: "garden-new-arrivals",
    type: "gardenNewArrivals",
    props: {
      sectionTitle: "New Arrivals",
      viewAllText: "EXPLORE ALL PRODUCTS",
      viewAllLink: "/shop",
      columns: 4,
      maxProducts: 8,
    },
  },
  {
    id: "garden-features",
    type: "gardenFeatures",
    props: {
      features: [
        {
          icon: "✨",
          title: "Unique Designs",
          description: "Every piece in our collection is created with a sense of artistry and purpose.",
        },
        {
          icon: "🌿",
          title: "Sustainable Materials",
          description: "We prioritize eco-friendly and responsibly sourced materials.",
        },
        {
          icon: "❤️",
          title: "Crafted with Love",
          description: "Our artisans bring passion and precision to every product we offer.",
        },
      ],
    },
  },
  {
    id: "garden-testimonials",
    type: "gardenTestimonials",
    props: {
      sectionTitle: "What Our Customers Say",
      testimonials: [
        { name: "Sarah M.", text: "The quality of the garden decor is outstanding. Every piece feels unique and well-crafted.", rating: 5 },
        { name: "James L.", text: "Transformed my living room with their home decor collection. Absolutely love the natural aesthetic.", rating: 5 },
        { name: "Emily R.", text: "Fast shipping and beautiful packaging. The products exceeded my expectations.", rating: 5 },
      ],
    },
  },
];
