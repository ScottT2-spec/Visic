import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Fashion Colored template preset — WoodMart "Fashion Colored" demo.
 * Green primary (#52bd72), parallax hero, collection banners, product grids,
 * category carousel, features section, Instagram gallery, and footer.
 */
export const FASHION_COLORED_PRESET: TemplateBlock[] = [
  /* ── 1. Hero Slider ───────────────────────────────────────── */
  {
    id: "fc-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "",
          titleLine1: "COLOR",
          titleLine2: "",
          description:
            "Convallis interdum purus adipiscing dis parturient posuere ac a quam a eleifend montes parturient posuere curae tempor.",
          buttonText: "Read More",
          buttonLink: "/shop",
          colorScheme: "light",
          textPosition: "center",
          backgroundImage:
            "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&h=800&fit=crop",
        },
        {
          subtitle: "",
          titleLine1: "DENIM",
          titleLine2: "",
          description:
            "Convallis interdum purus adipiscing dis parturient posuere ac a quam a eleifend montes parturient posuere curae tempor.",
          buttonText: "Read More",
          buttonLink: "/shop",
          colorScheme: "light",
          textPosition: "center",
          backgroundImage:
            "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=800&fit=crop",
        },
        {
          subtitle: "",
          titleLine1: "SALES",
          titleLine2: "",
          description:
            "Convallis interdum purus adipiscing dis parturient posuere ac a quam a eleifend montes parturient posuere curae tempor.",
          buttonText: "Read More",
          buttonLink: "/shop",
          colorScheme: "light",
          textPosition: "center",
          backgroundImage:
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=800&fit=crop",
        },
      ],
      minHeight: "560px",
      autoplaySpeed: 18000,
    },
  },

  /* ── 2. Promo Banners (3 Collection Banners) ──────────────── */
  {
    id: "fc-promos",
    type: "fashionPromoBanners",
    props: {
      banners: [
        {
          image:
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
          title: "SPRING\nCOLLECTION",
          subtitle: "NEW SEASON",
          textAlign: "left",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
        {
          image:
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop",
          title: "SUMMER\nCOLLECTION",
          subtitle: "TRENDING",
          textAlign: "center",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
        {
          image:
            "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop",
          title: "AUTUMN\nCOLLECTION",
          subtitle: "BEST PICKS",
          textAlign: "right",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
      ],
    },
  },

  /* ── 3. Latest Products (3-col grid) ──────────────────────── */
  {
    id: "fc-latest-products",
    type: "fashionProductGrid",
    props: {
      filter: "featured",
      columns: 3,
      products: [],
      maxProducts: 6,
      marginBottom: "60px",
      sectionTitle: {
        subtitle: "SEE OUR COLLECTION",
        title: "LATEST PRODUCTS",
        description: "",
      },
      showCategory: true,
      showHoverImage: true,
    },
  },

  /* ── 4. Top Visited Categories (carousel style, 4 cols) ──── */
  {
    id: "fc-categories",
    type: "fashionCategoryCards",
    props: {
      columns: 4,
      categories: [
        {
          name: "Dresses",
          image:
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop",
          link: "shop",
          productCount: 24,
        },
        {
          name: "Tops & Blouses",
          image:
            "https://images.unsplash.com/photo-1434389677669-e08b4cda3b2f?w=300&h=400&fit=crop",
          link: "shop",
          productCount: 18,
        },
        {
          name: "Accessories",
          image:
            "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=300&h=400&fit=crop",
          link: "shop",
          productCount: 12,
        },
        {
          name: "Outerwear",
          image:
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop",
          link: "shop",
          productCount: 15,
        },
      ],
      marginBottom: "50px",
      sectionTitle: {
        subtitle: "SEE OUR COLLECTION",
        title: "TOP VISITED CATEGORIES",
        description: "",
      },
    },
  },

  /* ── 5. More Products (carousel-style, 4-col) ────────────── */
  {
    id: "fc-more-products",
    type: "fashionProductGrid",
    props: {
      filter: "all",
      columns: 4,
      products: [],
      maxProducts: 8,
      marginBottom: "50px",
      sectionTitle: {
        subtitle: "SEE OUR COLLECTION",
        title: "LATEST PRODUCTS",
        description: "",
      },
      showCategory: true,
      showHoverImage: true,
    },
  },

  /* ── 6. How We Work (Features) ────────────────────────────── */
  {
    id: "fc-features",
    type: "fashionFeatures",
    props: {
      sectionTitle: {
        subtitle: "SEE OUR COLLECTION",
        title: "HOW WE WORK",
        description:
          "There are many variations of passages of lorem ipsum available.",
      },
      columns: 3,
      marginBottom: "50px",
      features: [
        {
          number: "01",
          title: "FAST DELIVERY",
          description:
            "We ensure your orders reach you quickly with our reliable delivery partners across the region.",
          buttonText: "READ MORE",
          buttonLink: "#",
        },
        {
          number: "02",
          title: "SECURE PAYMENTS",
          description:
            "Multiple payment options with end-to-end encryption keeping your transactions safe and easy.",
          buttonText: "READ MORE",
          buttonLink: "#",
        },
        {
          number: "03",
          title: "EASY RETURNS",
          description:
            "Not satisfied? Return any item within 14 days for a full refund, no questions asked.",
          buttonText: "READ MORE",
          buttonLink: "#",
        },
      ],
    },
  },

  /* ── 7. Instagram Gallery ─────────────────────────────────── */
  {
    id: "fc-instagram",
    type: "fashionInstagram",
    props: {
      sectionTitle: {
        subtitle: "SEE OUR COLLECTION",
        title: "FOLLOW US ON INSTAGRAM",
        description:
          "There are many variations of passages of lorem ipsum available.",
      },
      buttonText: "FOLLOW US ON INSTAGRAM",
      instagramUrl: "https://www.instagram.com/",
      columns: 6,
      marginBottom: "0px",
      images: [
        {
          src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=640&h=640&fit=crop",
          likes: 9224,
          comments: 960,
        },
        {
          src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=640&h=640&fit=crop",
          likes: 6464,
          comments: 542,
        },
        {
          src: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=640&h=640&fit=crop",
          likes: 3289,
          comments: 27,
        },
        {
          src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=640&h=640&fit=crop",
          likes: 9525,
          comments: 903,
        },
        {
          src: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=640&h=640&fit=crop",
          likes: 7597,
          comments: 639,
        },
        {
          src: "https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=640&h=640&fit=crop",
          likes: 9793,
          comments: 773,
        },
      ],
    },
  },

  /* ── 8. Footer ────────────────────────────────────────────── */
  {
    id: "fc-footer",
    type: "fashionFooter",
    props: {
      logoUrl: "",
      logoAlt: "Store Logo",
      description:
        "Discover a curated collection of colorful fashion designed to bring vibrancy and style into your wardrobe.",
      contact: {
        address: "451 Wall Street, UK, London",
        phone: "(064) 332-1233",
        fax: "(099) 453-1357",
      },
      recentPosts: [],
      linkColumns: [
        {
          title: "OUR STORES",
          links: [
            { label: "New York", url: "#" },
            { label: "London SF", url: "#" },
            { label: "Edinburgh", url: "#" },
            { label: "Los Angeles", url: "#" },
            { label: "Chicago", url: "#" },
          ],
        },
        {
          title: "USEFUL LINKS",
          links: [
            { label: "Privacy Policy", url: "#" },
            { label: "Returns", url: "#" },
            { label: "Terms & Conditions", url: "#" },
            { label: "Contact Us", url: "#" },
            { label: "Our Sitemap", url: "#" },
          ],
        },
        {
          title: "FOOTER MENU",
          links: [
            { label: "Instagram profile", url: "#" },
            { label: "New Collection", url: "#" },
            { label: "Contact Us", url: "#" },
            { label: "Latest News", url: "#" },
          ],
        },
      ],
      copyrightText: "© 2026. ALL RIGHTS RESERVED.",
      paymentIconsUrl: "",
    },
  },
];
