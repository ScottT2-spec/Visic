import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * T-Shirts & Prints template preset — WoodMart "T-Shirts Prints" demo.
 * Extracted from the actual reference site: https://woodmart.xtemos.com/t-shirts-prints/
 * Contains only content from the T-Shirts & Prints template, no cross-template components.
 */
export const T_SHIRTS_PRINTS_PRESET: TemplateBlock[] = [
  {
    id: "tshirts-hero",
    type: "fashionHeroSlider",
    props: {
      autoplaySpeed: 5000,
      minHeight: "560px",
      slides: [
        {
          title: "Unique Prints",
          subtitle: "Express Yourself",
          description: "Stand out with our collection of artistically designed t-shirts featuring unique prints and artwork.",
          buttonText: "Shop Now",
          buttonLink: "/shop",
          backgroundImage: "https://woodmart.xtemos.com/t-shirts/wp-content/uploads/sites/29/2023/05/banner-1.jpg",
        },
      ],
    },
  },
  {
    id: "tshirts-categories",
    type: "fashionCategoryCards",
    props: {
      sectionTitle: {
        subtitle: "EXPLORE",
        title: "Shop by Category",
      },
      categories: [
        { name: "T-Shirts", image: "https://woodmart.xtemos.com/t-shirts/wp-content/uploads/sites/29/2023/05/cat-1.jpg", link: "/shop" },
        { name: "Hoodies", image: "https://woodmart.xtemos.com/t-shirts/wp-content/uploads/sites/29/2023/05/cat-2.jpg", link: "/shop" },
        { name: "Sweatshirts", image: "https://woodmart.xtemos.com/t-shirts/wp-content/uploads/sites/29/2023/05/cat-3.jpg", link: "/shop" },
        { name: "Accessories", image: "https://woodmart.xtemos.com/t-shirts/wp-content/uploads/sites/29/2023/05/cat-4.jpg", link: "/shop" },
      ],
    },
  },
  {
    id: "tshirts-featured",
    type: "fashionProductGrid",
    props: {
      columns: 4,
      maxProducts: 8,
      filter: "featured",
      sectionTitle: {
        subtitle: "NEW ARRIVALS",
        title: "Featured Products",
      },
    },
  },
  {
    id: "tshirts-blog",
    type: "fashionBlogPosts",
    props: {
      columns: 3,
      sectionTitle: {
        title: "Latest Articles",
      },
    },
  },
];
