import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Health & Supplements (Pills) Template Preset
 * Recreates the WoodMart Health/Pills demo layout with editable blocks.
 */
export const HEALTH_TEMPLATE_PRESET: TemplateBlock[] = [
  {
    id: "health-hero",
    type: "healthHero",
    props: {
      title: "Feel Healthy and Energetic With Our Vitamins",
      subtitle: "SHOP BY NEED",
      buttonText: "Bestsellers",
      buttonLink: "/shop",
    },
  },
  {
    id: "health-marquee",
    type: "healthMarquee",
    props: {
      items: ["Free Shipping from $30!", "Lots of vitamins and supplements", "First purchase with a 10% discount, use promo code: WDPILLS23"],
      speed: 10,
    },
  },
  {
    id: "health-promos",
    type: "healthPromoBanners",
    props: {
      banners: [
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2023/06/pills-banner-1.jpg",
          subtitle: "Bundles",
          title: "Sleep Easy Gummies",
          description: "Supports an optimal sleep cycle",
          buttonText: "Save 15%",
          buttonLink: "/shop",
          colorScheme: "dark",
        },
        {
          image: "https://woodmart.xtemos.com/wp-content/uploads/2023/06/pills-banner-2.jpg",
          subtitle: "SHOP BY SUPPLEMENTS",
          title: "Capsules for Skin",
          buttonText: "Contact With Expert",
          buttonLink: "/shop",
          colorScheme: "light",
        },
      ],
    },
  },
  {
    id: "health-categories",
    type: "healthCategoryCards",
    props: {
      sectionTitle: "Popular Categories",
      columns: 4,
      categories: [
        { name: "Allergy Relief", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop", link: "/shop" },
        { name: "Anxiety", image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=200&h=200&fit=crop", link: "/shop" },
        { name: "Depression", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&fit=crop", link: "/shop" },
        { name: "Eye & Vision", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop", link: "/shop" },
        { name: "Hair", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&h=200&fit=crop", link: "/shop" },
        { name: "Pregnancy", image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=200&h=200&fit=crop", link: "/shop" },
        { name: "Skin", image: "https://images.unsplash.com/photo-1570194065650-d99fb4a38c5f?w=200&h=200&fit=crop", link: "/shop" },
        { name: "Sleep", image: "https://images.unsplash.com/photo-1515894203077-ced4b63b4e9a?w=200&h=200&fit=crop", link: "/shop" },
      ],
    },
  },
  {
    id: "health-bestsellers",
    type: "healthProductGrid",
    props: {
      columns: 4,
      maxProducts: 8,
      sectionTitle: "Bestsellers",
      products: [],
    },
  },
  {
    id: "health-features",
    type: "healthFeatureSection",
    props: {
      title: "Effective Vitamins For Your Health",
      subtitle: "Supplements And Ingredients You Can Trust",
      features: [
        { icon: "🧪", title: "Used In", description: "Chances are, you\u2019ve probably heard of the nutrient iron before." },
        { icon: "🌿", title: "Found In", description: "Our mission is to make you healthy and happy." },
      ],
      helpText: "Need help choosing?",
    },
  },
  {
    id: "health-testimonials",
    type: "healthTestimonials",
    props: {
      title: "What Our Customers Say",
      trustpilotRating: "4.9",
      reviewCount: "Based on 374 reviews",
      testimonials: [
        { name: "Sarah M.", image: "", text: "The best vitamins and supplements are made from natural ingredients using modern technologies aimed at improving personal health.", rating: 5 },
        { name: "James K.", image: "", text: "Our vitamins and supplements are designed to provide essential nutrients that may be lacking in our diet.", rating: 5 },
      ],
    },
  },
  {
    id: "health-blog",
    type: "healthBlogPosts",
    props: {
      columns: 3,
      sectionTitle: "RECENT POSTS",
      posts: [],
    },
  },
  {
    id: "health-brands",
    type: "healthBrandMarquee",
    props: {
      speed: 70,
      reverse: false,
    },
  },
  {
    id: "health-newsletter",
    type: "healthNewsletter",
    props: {
      title: "Insider Access",
      subtitle: "Learn All Ingredients In Our Guide.",
      backgroundColor: "#2d6a4f",
    },
  },
  {
    id: "health-footer", type: "healthFooterFull",
    props: {
      description: "Your trusted source for vitamins, supplements, and wellness products. Naturally better.",
      contact: {
        address: "123 Wellness Ave, Portland, OR 97201",
        phone: "(503) 555-0123",
        email: "hello@store.com",
      },
    },
  },
];
