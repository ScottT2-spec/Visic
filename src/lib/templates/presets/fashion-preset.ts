import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Fashion Template Preset
 * Default block layout + content that recreates the WoodMart Fashion demo.
 * Every value is a placeholder — users swap in their own content.
 */
export const FASHION_TEMPLATE_PRESET: TemplateBlock[] = [
  /* ── 1. Hero Slider ───────────────────────────────────── */
  {
    id: "fashion-hero",
    type: "fashionHeroSlider",
    props: {
      autoplaySpeed: 5000,
      minHeight: "560px",
      slides: [
        {
          subtitle: "YOUR FAVOURITE STORE",
          titleLine1: "Blondes with minimalistic",
          titleLine2: "tendencies to vintage",
          description: "Discover our latest collection of handpicked fashion essentials designed for the modern wardrobe.",
          buttonText: "SHOP NOW",
          buttonLink: "/shop",
          backgroundImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=800&fit=crop",
          textPosition: "center",
          colorScheme: "dark",
        },
        {
          subtitle: "NEW ARRIVALS",
          titleLine1: "Fashionable fit trend style",
          titleLine2: "best sport man wear",
          description: "Explore trending styles curated for every occasion. Quality meets affordability.",
          buttonText: "SHOP NOW",
          buttonLink: "/shop",
          backgroundImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=800&fit=crop",
          textPosition: "center",
          colorScheme: "dark",
        },
        {
          subtitle: "SEASON COLLECTION",
          titleLine1: "Elegant and timeless",
          titleLine2: "pieces for every mood",
          description: "From casual wear to evening elegance — find your perfect look in our new collection.",
          buttonText: "SHOP NOW",
          buttonLink: "/shop",
          backgroundImage: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop",
          textPosition: "center",
          colorScheme: "light",
        },
      ],
    },
  },

  /* ── 2. Promo Banners ─────────────────────────────────── */
  {
    id: "fashion-promos",
    type: "fashionPromoBanners",
    props: {
      banners: [
        {
          image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=267&fit=crop",
          subtitle: "SUMMER NEW",
          title: "AMAZING\nFASHION",
          buttonText: "Shop Now",
          buttonLink: "/shop",
          textAlign: "right",
        },
        {
          image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=267&fit=crop",
          subtitle: "BEST NEW",
          title: "STYLISH\nFASHION",
          buttonText: "Shop Now",
          buttonLink: "/shop",
          textAlign: "center",
        },
        {
          image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=267&fit=crop",
          subtitle: "NEW 2024",
          title: "FASHION\nSTYLE",
          buttonText: "Shop Now",
          buttonLink: "/shop",
          textAlign: "left",
        },
      ],
    },
  },

  /* ── 3. Featured Products ─────────────────────────────── */
  {
    id: "fashion-featured",
    type: "fashionProductGrid",
    props: {
      columns: 4,
      showCategory: true,
      showHoverImage: true,
      marginBottom: "60px",
      maxProducts: 8,
      filter: "featured",
      sectionTitle: {
        subtitle: "WELCOME TO OUR STORE",
        title: "FEATURED PRODUCTS",
        description: "Handpicked items from our latest collections, curated just for you.",
      },
      products: [],
    },
  },

  /* ── 4. Categories ────────────────────────────────────── */
  {
    id: "fashion-categories",
    type: "fashionCategoryCards",
    props: {
      columns: 4,
      marginBottom: "50px",
      sectionTitle: {
        subtitle: "WELCOME TO OUR STORE",
        title: "OUR CATEGORIES",
        description: "Browse through our carefully organized collections to find exactly what you need.",
      },
      categories: [
        { name: "Dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop", productCount: 24, link: "shop" },
        { name: "Tops", image: "https://images.unsplash.com/photo-1434389677669-e08b4cda3b2f?w=300&h=400&fit=crop", productCount: 18, link: "shop" },
        { name: "Accessories", image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=300&h=400&fit=crop", productCount: 12, link: "shop" },
        { name: "Shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=400&fit=crop", productCount: 15, link: "shop" },
      ],
    },
  },

  /* ── 5. Bestsellers (filters by "bestseller" tag, falls back to placeholder) */
  {
    id: "fashion-bestsellers",
    type: "fashionProductGrid",
    props: {
      columns: 4,
      showCategory: true,
      showHoverImage: true,
      marginBottom: "50px",
      maxProducts: 8,
      filter: "bestseller",
      sectionTitle: {
        subtitle: "WELCOME TO OUR STORE",
        title: "OUR BESTSELLERS",
        description: "The most loved items by our customers — tried, tested, and trending.",
      },
      products: [],
    },
  },

  /* ── 6. Testimonials ──────────────────────────────────── */
  {
    id: "fashion-testimonials",
    type: "fashionTestimonials",
    props: {
      title: "CUSTOMERS REVIEWS",
      backgroundImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&h=600&fit=crop",
      testimonials: [
        {
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=70&h=70&fit=crop&crop=face",
          text: "Absolutely love the quality and style of everything I've ordered. The fabrics feel premium and the fit is always perfect. This has become my go-to store for fashion essentials!",
          name: "Sarah Johnson",
          role: "Verified Buyer",
          rating: 5,
        },
        {
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=70&h=70&fit=crop&crop=face",
          text: "Fast shipping, beautiful packaging, and the clothes look exactly like the photos. Customer service was incredibly helpful when I needed to exchange a size. Highly recommend!",
          name: "Marcus Chen",
          role: "Loyal Customer",
          rating: 5,
        },
        {
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=70&h=70&fit=crop&crop=face",
          text: "I've been shopping here for months and the consistency in quality is impressive. Every piece feels like it was made with care. The new collection is absolutely stunning!",
          name: "Amara Williams",
          role: "Fashion Blogger",
          rating: 5,
        },
      ],
    },
  },

  /* ── 7. Latest News / Blog ────────────────────────────── */
  {
    id: "fashion-blog",
    type: "fashionBlogPosts",
    props: {
      columns: 2,
      marginBottom: "30px",
      sectionTitle: {
        subtitle: "WELCOME TO OUR STORE",
        title: "OUR LATEST NEWS",
        description: "Stay updated with the latest fashion trends, style tips, and store announcements.",
      },
      posts: [],
    },
  },

  /* ── 8. Newsletter ────────────────────────────────────── */
  {
    id: "fashion-newsletter",
    type: "fashionNewsletter",
    props: {
      subtitle: "STAY CONNECTED",
      title: "REGISTER FOR OUR NEWSLETTER",
      description: "Sign up for all the news about our last arrivals and get exclusive early access to sales.",
      buttonText: "Sign up",
      socialLinks: [
        { platform: "facebook", url: "#" },
        { platform: "twitter", url: "#" },
        { platform: "instagram", url: "#" },
        { platform: "youtube", url: "#" },
      ],
    },
  },

  /* ── 9. Footer ────────────────────────────────────────── */
  {
    id: "fashion-footer",
    type: "fashionFooter",
    props: {
      logoUrl: "",
      logoAlt: "Store Logo",
      description:
        "Discover a curated collection of modern furniture designed to bring comfort and elegance into your home.",
      contact: {
        address: "451 Wall Street, UK, London",
        phone: "(064) 332-1233",
        fax: "(099) 453-1357",
      },
      recentPosts: [
        {
          title: "A companion for extra sleeping",
          url: "#",
          date: "23 Jul 2026",
          thumbnail: "",
        },
        {
          title: "Outdoor seating collection inspiration",
          url: "#",
          date: "23 Jul 2026",
          thumbnail: "",
        },
      ],
      linkColumns: [
        {
          title: "OUR STORES",
          links: [
            { label: "New York", url: "#" },
            { label: "London SF", url: "#" },
            { label: "Edinburgh", url: "#" },
            { label: "Los Angeles", url: "#" },
            { label: "Chicago", url: "#" },
            { label: "Las Vegas", url: "#" },
          ],
        },
        {
          title: "USEFUL LINKS",
          links: [
            { label: "Privacy Policy", url: "#" },
            { label: "Returns", url: "#" },
            { label: "Terms & Conditions", url: "#" },
            { label: "Contact Us", url: "#" },
            { label: "Latest News", url: "#" },
            { label: "Our Sitemap", url: "#" },
          ],
        },
        {
          title: "FOOTER MENU",
          links: [
            { label: "Instagram profile", url: "#" },
            { label: "New Collection", url: "#" },
            { label: "Woman Dress", url: "#" },
            { label: "Contact Us", url: "#" },
            { label: "Latest News", url: "#" },
            { label: "Purchase Theme", url: "#", emphasized: true },
          ],
        },
      ],
      copyrightText: "© 2026. ALL RIGHTS RESERVED.",
      paymentIconsUrl: "",
    },
  },
];
