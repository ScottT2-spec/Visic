import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Cosmetics Template — Page-specific block presets
 * Converts the hardcoded bestseller, new-in, skincare, and terms pages
 * into editable block arrays that match the original content exactly.
 */

/* ═══════════════════════════════════════════════════════════════
   BESTSELLER PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_BESTSELLER_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-bestseller-title",
    type: "cosmeticsSectionTitle",
    props: {
      subtitle: "",
      title: "Bestsellers",
      description:
        "Discover our most loved products. These customer favorites have earned their place in our collection.",
      align: "center",
      maxWidth: "60%",
    },
  },
  {
    id: "cosmetics-bestseller-products",
    type: "cosmeticsProductGrid",
    props: {
      columns: 4,
      maxProducts: 12,
      filter: "bestseller",
      showCategory: true,
      showHoverImage: true,
      sectionTitle: {},
      products: [],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   NEW-IN PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_NEW_IN_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-newin-title",
    type: "cosmeticsSectionTitle",
    props: {
      subtitle: "NEW ARRIVALS",
      title: "Just Arrived",
      description:
        "Be the first to discover our latest additions. Limited quantities available.",
      align: "center",
      maxWidth: "60%",
    },
  },
  {
    id: "cosmetics-newin-countdown",
    type: "cosmeticsCountdownBanner",
    props: {
      title: "Limited Time Offer",
      description:
        "Shop our newest arrivals before they sell out. New products added weekly.",
      image: "",
      buttonText: "SHOP ALL NEW ARRIVALS",
      buttonLink: "/shop?sort=newest",
      secondButtonText: "",
      secondButtonLink: "",
    },
  },
  {
    id: "cosmetics-newin-products",
    type: "cosmeticsProductGrid",
    props: {
      columns: 4,
      maxProducts: 12,
      filter: "newest",
      filterTag: "new-arrival",
      showCategory: true,
      showHoverImage: true,
      sectionTitle: {},
      products: [],
    },
  },
  {
    id: "cosmetics-newin-newsletter",
    type: "cosmeticsNewsletter",
    props: {
      backgroundImage: "",
      title: "Stay Updated",
      description:
        "Subscribe to our newsletter and be the first to know about new arrivals and exclusive offers.",
      buttonText: "Subscribe",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   SKINCARE PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_SKINCARE_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-skincare-hero",
    type: "cosmeticsDiscovery",
    props: {
      title: "Premium Skincare Collection",
      description:
        "Discover our curated selection of skincare products designed to nourish, protect, and rejuvenate your skin. From cleansers to serums, find everything you need for your daily routine.",
      image: "",
      features: [
        { icon: "✨", titleLine1: "Nourish", titleLine2: "& Protect" },
        { icon: "🧴", titleLine1: "Daily", titleLine2: "Routine" },
        { icon: "🌿", titleLine1: "Natural", titleLine2: "Care" },
      ],
      buttonText: "SHOP SKINCARE",
      buttonLink: "/shop?category=skincare",
      secondButtonText: "",
      secondButtonLink: "",
    },
  },
  {
    id: "cosmetics-skincare-benefits",
    type: "cosmeticsInfoBoxes",
    props: {
      sectionTitle: { title: "WHY CHOOSE OUR SKINCARE?" },
      boxes: [
        {
          image: "",
          number: "01",
          title: "Natural Ingredients",
          description:
            "Formulated with organic and natural ingredients for gentle care",
        },
        {
          image: "",
          number: "02",
          title: "Dermatologist Tested",
          description:
            "All products are tested and approved by skincare experts",
        },
        {
          image: "",
          number: "03",
          title: "Cruelty Free",
          description:
            "We never test on animals, committed to ethical beauty",
        },
        {
          image: "",
          number: "04",
          title: "Fast Results",
          description:
            "Visible improvements in skin texture and tone within weeks",
        },
      ],
    },
  },
  {
    id: "cosmetics-skincare-products",
    type: "cosmeticsProductGrid",
    props: {
      columns: 4,
      maxProducts: 12,
      filter: "all",
      filterTag: "skincare",
      showCategory: true,
      showHoverImage: true,
      sectionTitle: {
        subtitle: "",
        title: "SKINCARE PRODUCTS",
      },
      products: [],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   TERMS PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_TERMS_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-terms-hero",
    type: "cosmeticsHeroSlider",
    props: {
      slides: [
        {
          subtitle: "LEGAL",
          titleLine1: "Terms and",
          titleLine2: "Conditions",
          description: "Please read our terms and conditions carefully before using our services.",
          buttonLink: "",
          buttonText: "",
          secondButtonLink: "",
          secondButtonText: "",
        },
      ],
      minHeight: "400px",
      autoplaySpeed: 0,
    },
  },
  {
    id: "cosmetics-terms-content",
    type: "cosmeticsInfoBoxes",
    props: {
      sectionTitle: {
        title: "TERMS AND CONDITIONS",
      },
      boxes: [
        {
          image: "",
          number: "01",
          title: "General Terms",
          description: "By placing an order through our website, you warrant that you are at least 18 years old and are legally capable of entering into binding contracts. We reserve the right to refuse service to anyone for any reason at any time. All products are subject to availability.",
        },
        {
          image: "",
          number: "02",
          title: "Products & Pricing",
          description: "We reserve the right to discontinue any product at any time. Prices are subject to change without notice. We make every effort to display accurate pricing, but errors may occur. In the event of a pricing error, we reserve the right to cancel the order.",
        },
        {
          image: "",
          number: "03",
          title: "Orders & Payment",
          description: "When you place an order, you will receive an email confirmation. This does not mean your order has been accepted. We reserve the right to refuse or cancel any order. Payment must be made in full at the time of purchase through our accepted payment methods.",
        },
        {
          image: "",
          number: "04",
          title: "Shipping & Delivery",
          description: "Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers, customs, or events beyond our control. Risk of loss passes to you upon delivery to the carrier.",
        },
        {
          image: "",
          number: "05",
          title: "Returns & Refunds",
          description: "We accept returns within 30 days of delivery for items in their original, unused condition. Refunds will be processed to the original payment method within 5-10 business days. Shipping costs are non-refundable unless the return is due to our error.",
        },
        {
          image: "",
          number: "06",
          title: "Privacy & Data",
          description: "We collect and process personal data in accordance with our Privacy Policy. By using our website, you consent to our data practices as described therein. We do not sell your personal information to third parties.",
        },
        {
          image: "",
          number: "07",
          title: "Cookies",
          description: "We may use cookies and similar technologies to remember preferences, improve site performance, and better understand how visitors use the store. You can manage cookie preferences through your browser settings.",
        },
        {
          image: "",
          number: "08",
          title: "Limitation of Liability",
          description: "To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our products or services. Our liability is limited to the purchase price of the product.",
        },
        {
          image: "",
          number: "09",
          title: "Contact Information",
          description: "If you have any questions about these Terms and Conditions, please contact us through our contact page or email us at support@cosmetics.com. We will respond to your inquiry within 2-3 business days.",
        },
      ],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHOP PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_SHOP_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-shop-header",
    type: "cosmeticsShopPageHeader",
    props: {
      title: "Shop",
      allLabel: "All",
      subtitle: "Browse all products at {store name}",
      emptyState: "No products found",
      filterLabel: "Filters",
      loadMoreText: "Load More",
      categoriesLabel: "Categories",
      sortLabelNewest: "Newest",
      searchPlaceholder: "Search products...",
      sortLabelPriceLow: "Price: Low → High",
      sortLabelPriceHigh: "Price: High → Low",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE
   ═══════════════════════════════════════════════════════════════ */

export const COSMETICS_BLOG_BLOCKS: TemplateBlock[] = [
  {
    id: "cosmetics-blog-header",
    type: "cosmeticsBlogPageHeader",
    props: {
      title: "Blog",
      allLabel: "All",
      subtitle: "Latest news and updates from {site name}",
      emptyState: "No blog posts found",
      searchPlaceholder: "Search blog posts...",
    },
  },
];
