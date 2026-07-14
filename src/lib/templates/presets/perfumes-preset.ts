import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Perfumes Template Preset
 * Recreates the WoodMart Perfumes demo layout with editable blocks.
 */
export const PERFUMES_TEMPLATE_PRESET: TemplateBlock[] = [
  {
    id: "perfumes-hero",
    type: "perfumesHeroSlider",
    props: {
      autoplaySpeed: 6000,
      minHeight: "100vh",
      slides: [
        {
          title: "Opus Essence",
          bottleImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/11/perfumes-slide-bottle-1.png",
          backgroundColor: "#1a1a2e",
          buttonText: "Buy now",
          buttonLink: "/shop",
          buttonStyle: "primary",
        },
        {
          title: "New Fragrance in the Opus Essence",
          bottleImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/11/perfumes-slide-bottle-2.png",
          backgroundColor: "#2d1b4e",
          buttonText: "Buy now",
          buttonLink: "/shop",
          buttonStyle: "primary",
        },
        {
          title: "Deep Fragrance With a Refined Intensity",
          bottleImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/11/perfumes-slide-bottle-3.png",
          backgroundColor: "#0d1b2a",
          buttonText: "Buy now",
          buttonLink: "/shop",
          buttonStyle: "black",
        },
      ],
    },
  },
  {
    id: "perfumes-new-in",
    type: "perfumesProductGrid",
    props: {
      columns: 3,
      maxProducts: 6,
      sectionTitle: "New In",
      filter: "new-arrival",
      products: [],
    },
  },
  {
    id: "perfumes-olfactory",
    type: "perfumesOlfactoryTags",
    props: {
      title: "Shop by Olfactory Family",
      tags: [
        { name: "Floral", link: "/shop" },
        { name: "Woody", link: "/shop" },
        { name: "Amber", link: "/shop" },
        { name: "Chypre", link: "/shop" },
        { name: "Leather", link: "/shop" },
        { name: "Aldehyde", link: "/shop" },
        { name: "Spicy", link: "/shop" },
      ],
    },
  },
  {
    id: "perfumes-marquee",
    type: "perfumesMarquee",
    props: {
      items: ["Ember Glow", "Golden Veil", "Midnight Azure", "Nocturne Essence", "\u00c9theria"],
      speed: "45s",
    },
  },
  {
    id: "perfumes-featured-banners",
    type: "perfumesFeaturedBanners",
    props: {
      banners: [
        {
          title: "Light Fragrance with a Silky Touch",
          subtitle: "A collection of delicate, weightless fragrances",
          description: "A collection of delicate, weightless fragrances that capture the essence of air and light. Soft florals, sheer musks, and gentle citruses.",
          backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/11/perfumes-banner-1.jpg",
          link: "/shop",
        },
        {
          title: "Deep Fragrance With a Refined Intensity",
          subtitle: "A collection of fresh, luminous scents",
          description: "A collection of fresh, luminous scents inspired by the mystery of nightfall. Crisp citruses, airy florals, and cool musks.",
          backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/11/perfumes-banner-2.jpg",
          link: "/shop",
        },
      ],
    },
  },
  {
    id: "perfumes-tabbed",
    type: "perfumesTabbedProducts",
    props: {
      title: "Promotional Offers",
      tabs: [
        { label: "All" },
        { label: "For Her", filterTag: "for-her" },
        { label: "For Him", filterTag: "for-him" },
      ],
      columns: 3,
      maxProducts: 6,
      products: [],
    },
  },
  {
    id: "perfumes-collection-banners",
    type: "perfumesCollectionBanners",
    props: {
      sectionTitle: "Velours Noir SALE Collection",
      banners: [
        {
          title: "Get up to 20% off",
          image: "https://woodmart.xtemos.com/wp-content/uploads/2024/11/perfumes-collection-1.jpg",
          link: "/shop",
        },
      ],
    },
  },
  {
    id: "perfumes-blog",
    type: "perfumesBlogArticles",
    props: {
      sectionTitle: "Journal Articles",
      columns: 5,
      posts: [],
    },
  },
  {
    id: "perfumes-instagram",
    type: "perfumesInstagram",
    props: {
      handle: "@xtemos.studio",
      handleLink: "https://www.instagram.com/",
      items: [],
    },
  },
  {
    id: "perfumes-footer", type: "perfumesFooter",
    props: {
      storeName: "Perfumes",
      storeSlug: "perfumes",
      description: "Discover a curated collection of modern fragrances designed to hold memory, emotion, and identity in every bottle.",
    },
  },
];
