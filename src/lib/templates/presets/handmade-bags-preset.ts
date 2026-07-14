import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Handmade Bags template preset — WoodMart "Handmade Bags" demo.
 * Warm leather brown primary (#c27843), artisanal/boutique aesthetic.
 * Marquee banners, large category text, cover banners, bordered products.
 */
export const HANDMADE_BAGS_PRESET: TemplateBlock[] = [
  /* ── 1. Hero Slider ───────────────────────────────────────── */
  {
    id: "hb-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "",
          titleLine1: "Handmade Leather",
          titleLine2: "Bags for Every Journey",
          description: "",
          buttonText: "Shop now",
          buttonLink: "/shop",
          colorScheme: "dark",
          textPosition: "center",
          backgroundImage:
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1920&h=800&fit=crop",
        },
      ],
      minHeight: "600px",
      autoplaySpeed: 0,
    },
  },

  /* ── 2. Marquee Bar (announcements) ───────────────────────── */
  {
    id: "hb-marquee-1",
    type: "fashionMarquee",
    props: {
      items: [
        { text: "Free delivery on orders over $200.00", icon: "✦" },
        { text: "Production time is 5 days", icon: "✦" },
        { text: "Free delivery on orders over $200.00", icon: "✦" },
        { text: "Production time is 5 days", icon: "✦" },
      ],
      speed: "45s",
      gap: "60px",
      backgroundColor: "transparent",
      textColor: "#242424",
      fontSize: "30px",
      fontWeight: "600",
      paddingY: "20px",
      borderTop: "1px solid #c27843",
      marginBottom: "0px",
    },
  },

  /* ── 3. Categories Carousel ───────────────────────────────── */
  {
    id: "hb-categories",
    type: "fashionCategoryCards",
    props: {
      columns: 4,
      categories: [
        {
          name: "Tote Bags",
          image:
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop",
          link: "shop",
          productCount: 0,
        },
        {
          name: "Crossbody",
          image:
            "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=500&fit=crop",
          link: "shop",
          productCount: 0,
        },
        {
          name: "Backpacks",
          image:
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
          link: "shop",
          productCount: 0,
        },
        {
          name: "Wallets",
          image:
            "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=500&fit=crop",
          link: "shop",
          productCount: 0,
        },
      ],
      marginBottom: "80px",
    },
  },

  /* ── 4. Latest Products (bordered grid) ───────────────────── */
  {
    id: "hb-products-1",
    type: "fashionProductGrid",
    props: {
      filter: "featured",
      columns: 4,
      products: [],
      maxProducts: 8,
      marginBottom: "60px",
      sectionTitle: {
        subtitle: "",
        title: "Latest Products",
        description: "",
      },
      showCategory: true,
      showHoverImage: true,
    },
  },

  /* ── 5. Cover Banners (Craftmanship Story) ─────────────────── */
  {
    id: "hb-cover-banners",
    type: "fashionCoverBanners",
    props: {
      columns: 3,
      height: "580px",
      marginBottom: "60px",
      banners: [
        {
          image:
            "https://images.unsplash.com/photo-1473188588951-1d4f0e31f5e0?w=800&h=1000&fit=crop",
          icon: "🔨",
          title: "Premium Materials",
          description:
            "Meticulously crafted with premium materials and attention to detail, each piece embodies enduring style and functionality.",
          overlayOpacity: 0.3,
        },
        {
          image:
            "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=1000&fit=crop",
          icon: "✨",
          title: "Artisan Quality",
          description:
            "United by a commitment to unparalleled excellence, our artisans bring ensuring each piece reflects the highest standards of quality and craftsmanship.",
          overlayOpacity: 0.3,
        },
        {
          image:
            "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&h=1000&fit=crop",
          icon: "🪡",
          title: "Precision Details",
          description:
            "At our leather bag boutique, we believe in the power of precision. From the stitching to the finishing touches, every detail is meticulously crafted to perfection.",
          overlayOpacity: 0.3,
        },
      ],
    },
  },

  /* ── 6. Marquee Bar 2 (colored background) ────────────────── */
  {
    id: "hb-marquee-2",
    type: "fashionMarquee",
    props: {
      items: [
        { text: "Free delivery on orders over $200.00", icon: "✦" },
        { text: "Production time is 5 days", icon: "✦" },
        { text: "Free delivery on orders over $200.00", icon: "✦" },
        { text: "Production time is 5 days", icon: "✦" },
      ],
      speed: "65s",
      gap: "60px",
      backgroundColor: "#c27843",
      textColor: "#ffffff",
      fontSize: "30px",
      fontWeight: "600",
      paddingY: "40px",
      marginBottom: "60px",
    },
  },

  /* ── 7. More Products ─────────────────────────────────────── */
  {
    id: "hb-products-2",
    type: "fashionProductGrid",
    props: {
      filter: "all",
      columns: 4,
      products: [],
      maxProducts: 8,
      marginBottom: "60px",
      sectionTitle: {
        subtitle: "",
        title: "New Arrivals",
        description: "",
      },
      showCategory: true,
      showHoverImage: true,
    },
  },

  /* ── 8. Blog Posts ────────────────────────────────────────── */
  {
    id: "hb-blog",
    type: "fashionBlogPosts",
    props: {
      maxPosts: 3,
      sectionTitle: {
        subtitle: "",
        title: "Our Journal",
        description: "",
      },
    },
  },

  /* ── 9. Newsletter ────────────────────────────────────────── */
  {
    id: "hb-newsletter",
    type: "fashionNewsletter",
    props: {
      subtitle: "",
      title: "Subscribe to Our Newsletter",
      description:
        "Sign up for our newsletter to get early access to new arrivals, sales, events. Get 10% off your first order.",
      buttonText: "Sign Up",
      backgroundColor: "#c27843",
      socialLinks: [],
    },
  },
];
