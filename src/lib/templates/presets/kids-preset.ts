import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Kids Template Preset
 * Recreates the WoodMart Kids demo layout with editable blocks.
 */
export const KIDS_TEMPLATE_PRESET: TemplateBlock[] = [
  {
    id: "kids-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Sign up for our newsletter to get 10% off for the week!",
      link: "#newsletter",
    },
  },
  {
    id: "kids-hero",
    type: "kidsHeroSlider",
    props: {
      autoplaySpeed: 5000,
      minHeight: "560px",
      slides: [
        {
          title: "A new line of overalls for the little ones",
          description: "How can you evaluate content without design? No typography, no colors, no layout, no styles, all those things that convey the message.",
          buttonText: "Shop now",
          buttonLink: "/shop",
          backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2022/01/kids-slide-1.jpg",
          colorScheme: "dark",
        },
        {
          title: "New and comfortable growsuite for your baby",
          description: "It\u2019s content strategy gone awry right from the start. Forswearing the use of Lorem Ipsum wouldn\u2019t have helped, won\u2019t help now.",
          buttonText: "Shop now",
          buttonLink: "/shop",
          backgroundImage: "https://woodmart.xtemos.com/wp-content/uploads/2022/01/kids-slide-2.jpg",
          colorScheme: "dark",
        },
      ],
    },
  },
  {
    id: "kids-categories",
    type: "kidsCategoryCards",
    props: {
      sectionTitle: {
        subtitle: "Toys and accessories",
        title: "Shop by category",
      },
      categories: [
        { name: "Growsuits", image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&h=400&fit=crop", productCount: 12, link: "/shop" },
        { name: "Jumpers", image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=400&fit=crop", productCount: 8, link: "/shop" },
        { name: "Toys", image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300&h=400&fit=crop", productCount: 15, link: "/shop" },
        { name: "Accessories", image: "https://images.unsplash.com/photo-1566454419290-57a0589c9b17?w=300&h=400&fit=crop", productCount: 10, link: "/shop" },
        { name: "Dresses", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300&h=400&fit=crop", productCount: 9, link: "/shop" },
        { name: "Leggings", image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=300&h=400&fit=crop", productCount: 7, link: "/shop" },
      ],
    },
  },
  {
    id: "kids-featured",
    type: "kidsProductGrid",
    props: {
      columns: 4,
      maxProducts: 8,
      filter: "featured",
      sectionTitle: {
        subtitle: "",
        title: "Feature collection",
      },
      products: [],
    },
  },
  {
    id: "kids-bundle",
    type: "kidsBundlePromo",
    props: {
      subtitle: "Buy bundle and get a 25% discount",
      title: "Organic and safe clothes set for your baby",
      description: "When you buy this set, you save 25%. Discounts and promotions are not cumulative with the current discount.",
      buttonText: "Buy bundle now",
      buttonLink: "/shop",
      productImages: [
        "https://woodmart.xtemos.com/wp-content/uploads/2022/01/kids-bundle-1.jpg",
        "https://woodmart.xtemos.com/wp-content/uploads/2022/01/kids-bundle-2.jpg",
        "https://woodmart.xtemos.com/wp-content/uploads/2022/01/kids-bundle-3.jpg",
      ],
      backgroundColor: "#f5f0eb",
    },
  },
  {
    id: "kids-popular",
    type: "kidsProductGrid",
    props: {
      columns: 4,
      maxProducts: 8,
      filter: "bestseller",
      sectionTitle: {
        title: "Popular products",
      },
      products: [],
    },
  },
  {
    id: "kids-blog",
    type: "kidsBlogPosts",
    props: {
      columns: 3,
      sectionTitle: {
        title: "Latest Articles",
      },
      posts: [],
    },
  },
  {
    id: "kids-instagram",
    type: "kidsInstagram",
    props: {
      sectionTitle: {
        title: "@Visic_kids Our instagram",
      },
      items: [],
    },
  },
  {
    id: "kids-newsletter",
    type: "kidsNewsletter",
    props: {
      title: "Join our mailing list to receive any latest updates and promotions",
      buttonText: "Subscribe",
      backgroundColor: "#faf8f5",
    },
  },
];
