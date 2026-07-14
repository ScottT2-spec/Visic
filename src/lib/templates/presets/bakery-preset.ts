import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Bakery (Sweets Bakery) Template Preset
 * Recreates the WoodMart Sweets Bakery demo layout with editable blocks.
 */
export const BAKERY_TEMPLATE_PRESET: TemplateBlock[] = [
  {
    id: "bakery-hero",
    type: "bakeryHeroSlider",
    props: {
      autoplaySpeed: 5000,
      slides: [
        {
          subtitle: "Crispy and Delicate",
          titleLine1: "BELGIAN",
          titleLine2: "WAFFLES",
          buttonText: "See Collection",
          buttonLink: "/shop",
          backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/sweets-bakery-slide-bg-1.jpg",
          productImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/sweets-bakery-slide-img-1.png",
          smallImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/sweets-bakery-slide-img-s-1.png",
        },
        {
          subtitle: "A Tasty and Light Dessert",
          titleLine1: "ALMOND",
          titleLine2: "MAFFINS",
          buttonText: "See Collection",
          buttonLink: "/shop",
          backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/sweets-bakery-slide-bg-2.jpg",
          productImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/sweets-bakery-slide-img-2.png",
          smallImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/sweets-bakery-slide-img-s-2.png",
        },
        {
          subtitle: "It Is Worth Tasting",
          titleLine1: "SWEET",
          titleLine2: "DONUTS",
          buttonText: "See Collection",
          buttonLink: "/shop",
          backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/sweets-bakery-slide-bg-3.jpg",
          productImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/sweets-bakery-slide-img-3.png",
          smallImage: "https://woodmart.xtemos.com/wp-content/uploads/2024/02/sweets-bakery-slide-img-s-3.png",
        },
      ],
    },
  },
  {
    id: "bakery-categories",
    type: "bakeryCategoryInfoBoxes",
    props: {
      sectionTitle: "Our Fine Home-Made Chocolate",
      sectionSubtitle: "Sweets Bakery",
      items: [
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/svg-bakery-infobox-1.svg",
          title: "Cupcakes",
          description: "There are some redeeming factors in favor of greeking text",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/svg-bakery-infobox-2.svg",
          title: "Macaroons",
          description: "Merely the symptom of a worse problem to consideration",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/svg-bakery-infobox-3.svg",
          title: "Cakes",
          description: "You sculpt information, you chisel away what\u2019s not needed",
          buttonText: "Shop Now",
          buttonLink: "/shop",
        },
      ],
    },
  },
  {
    id: "bakery-handmade",
    type: "bakeryHandmade",
    props: {
      subtitle: "Sweets Bakery",
      title: "Handmade Cakes\nFor Your Every Taste",
      description: "Anyway, you still use Lorem Ipsum and rightly so, as it will always have a place in the web workers toolbox.",
      image: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/bakery-cyan-cake-opt.jpg",
      buttonText: "See Collection",
      buttonLink: "/shop",
    },
  },
  {
    id: "bakery-products",
    type: "bakeryProductGrid",
    props: {
      columns: 3,
      maxProducts: 6,
      sectionTitle: "Featured Products",
      sectionSubtitle: "Sweet Accessories",
      backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/bakery-product-bg-opt.jpg",
      products: [],
    },
  },
  {
    id: "bakery-process",
    type: "bakeryProcess",
    props: {
      sectionTitle: "How We Made Donuts",
      sectionSubtitle: "We Love What We Do",
      image: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/bakery-donuts-img-opt.png",
      steps: [
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/svg-bakery-infobox-4.svg",
          title: "1. Ingredients",
          description: "Chances are there wasn\u2019t collaboration, communication.",
        },
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/svg-bakery-infobox-5.svg",
          title: "2. Stuffing",
          description: "There wasn\u2019t a process agreed upon or specified with.",
        },
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/svg-bakery-infobox-6.svg",
          title: "3. Cooking",
          description: "But that\u2019s not all that it takes to get things back on track.",
        },
        {
          icon: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/svg-bakery-infobox-7.svg",
          title: "4. Dish Ready",
          description: "The villagers are out there with a vengeance to get that.",
        },
      ],
    },
  },
  {
    id: "bakery-blog",
    type: "bakeryBlogPosts",
    props: {
      columns: 4,
      sectionTitle: "Our New Articles",
      sectionSubtitle: "Sweets Bakery",
      posts: [],
    },
  },
  {
    id: "bakery-cta",
    type: "bakeryCta",
    props: {
      title: "Do You Like the Theme?",
      subtitle: "Share With Your Friends!",
      buttonText: "Buy Now",
      buttonLink: "/shop",
      backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2019/07/bakery-bg-2-opt.png",
    },
  },
  {
    id: "bakery-footer", type: "bakeryFooter",
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
