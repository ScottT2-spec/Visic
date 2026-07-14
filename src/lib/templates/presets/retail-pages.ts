import type { BuilderBlock } from "@/components/storefront/BlockRenderer";

/**
 * Retail Template – Page Block Presets
 * 
 * These replicate the hardcoded page content as editable BuilderBlocks
 * so store owners can customise them through the page builder.
 * Theme: Home & Garden Decor (WoodMart Retail demo style)
 */

/* ═══════════════════════════════════════════════════════════════
   ABOUT PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_ABOUT_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-about-hero",
    type: "hero",
    props: {
      heading: "Our Story",
      subheading: "We believe your home should tell your story. Since 2018, we've been curating beautiful, functional pieces that transform spaces into sanctuaries.",
      buttonText: "Shop Collection",
      buttonHref: "/shop",
      bgImage: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1920&h=900&fit=crop",
      bgStyle: "custom",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
      overlayColor: "#000000",
      overlayOpacity: 0.45,
      layout: "center",
      badge: "ABOUT US",
    },
  },
  {
    id: "retail-about-spacer-1",
    type: "spacer",
    props: { height: 60 },
  },
  {
    id: "retail-about-intro-heading",
    type: "heading",
    props: {
      text: "Crafted for Living",
      level: "h2",
      fontSize: "3xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-about-intro-text",
    type: "text",
    props: {
      text: "Every item in our collection is chosen with intention. We partner with artisans and sustainable makers who share our belief that beautiful design should be accessible, ethical, and built to last.\n\nFrom hand-thrown ceramics to woven textiles, each piece carries the mark of its maker and the warmth of natural materials. Our goal is simple: help you create a home that feels genuinely yours.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-about-spacer-2",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-about-values",
    type: "features",
    props: {
      title: "What We Stand For",
      columns: 3,
      items: [
        {
          icon: "heart",
          title: "Handcrafted Quality",
          description: "Every product is made by skilled artisans using time-honoured techniques and premium natural materials.",
        },
        {
          icon: "globe",
          title: "Sustainably Sourced",
          description: "We work with ethical suppliers committed to fair wages, eco-friendly production, and minimal waste.",
        },
        {
          icon: "award",
          title: "Curated with Care",
          description: "Each piece is personally selected to ensure it meets our standards for design, durability, and beauty.",
        },
      ],
    },
  },
  {
    id: "retail-about-spacer-3",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-about-image-1",
    type: "image",
    props: {
      src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=600&fit=crop",
      alt: "Our curated home decor collection",
      rounded: "2xl",
    },
  },
  {
    id: "retail-about-spacer-4",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-about-mission-heading",
    type: "heading",
    props: {
      text: "Our Mission",
      level: "h2",
      fontSize: "3xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-about-mission-text",
    type: "text",
    props: {
      text: "We started with a simple idea: your living space shapes how you feel. A well-chosen vase, a handwoven throw, a terracotta planter with character — these small details create an atmosphere of calm, warmth, and personality.\n\nToday we serve customers across Africa and beyond, delivering pieces that bridge traditional craftsmanship with modern living. We're not just selling decor — we're helping you build a home that breathes.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-about-spacer-5",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-about-stats",
    type: "stats",
    props: {
      title: "By the Numbers",
      items: [
        { value: "2018", label: "Founded" },
        { value: "500+", label: "Products" },
        { value: "30+", label: "Artisan Partners" },
        { value: "10K+", label: "Happy Homes" },
      ],
    },
  },
  {
    id: "retail-about-spacer-6",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-about-newsletter",
    type: "newsletter",
    props: {
      title: "Join Our Community",
      subtitle: "Get styling tips, new arrivals, and exclusive offers delivered to your inbox.",
      buttonText: "Subscribe",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONTACT PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_CONTACT_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-contact-hero",
    type: "hero",
    props: {
      heading: "Get in Touch",
      subheading: "We'd love to hear from you. Whether you have a question about our products, need help with an order, or just want to say hello — we're here.",
      bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=900&fit=crop",
      bgStyle: "custom",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
      overlayColor: "#000000",
      overlayOpacity: 0.45,
      layout: "center",
      badge: "CONTACT US",
    },
  },
  {
    id: "retail-contact-spacer-1",
    type: "spacer",
    props: { height: 60 },
  },
  {
    id: "retail-contact-info",
    type: "features",
    props: {
      title: "How to Reach Us",
      columns: 3,
      items: [
        {
          icon: "map-pin",
          title: "Visit Our Store",
          description: "451 Wall Street, UK, London. Come experience our collection in person and get expert styling advice.",
        },
        {
          icon: "phone",
          title: "Call Us",
          description: "(064) 332-1233\nMonday – Friday, 9am – 6pm.\nWe're happy to help with any questions.",
        },
        {
          icon: "mail",
          title: "Email Us",
          description: "hello@store.com\nWe typically respond within 24 hours. For urgent orders, please call.",
        },
      ],
    },
  },
  {
    id: "retail-contact-spacer-2",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-contact-heading",
    type: "heading",
    props: {
      text: "Send Us a Message",
      level: "h2",
      fontSize: "3xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-contact-text",
    type: "text",
    props: {
      text: "Fill out the form below and we'll get back to you as soon as possible. For order-related inquiries, please include your order number.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-contact-spacer-3",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-contact-faq",
    type: "faq",
    props: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "What are your delivery times?",
          answer: "Standard delivery takes 3-5 business days within the country. International shipping takes 7-14 business days depending on destination.",
        },
        {
          question: "Do you offer returns?",
          answer: "Yes! We offer a 30-day return policy on all items in original condition. Simply contact us with your order number to initiate a return.",
        },
        {
          question: "Can I visit your showroom?",
          answer: "Absolutely! Our showroom is open Monday to Friday, 9am to 6pm, and Saturdays 10am to 4pm. No appointment needed.",
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, we ship to over 30 countries. Shipping rates and delivery times vary by destination. Contact us for a quote on your specific location.",
        },
      ],
    },
  },
  {
    id: "retail-contact-spacer-4",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-contact-newsletter",
    type: "newsletter",
    props: {
      title: "Need Immediate Assistance?",
      subtitle: "For urgent matters, please call our customer service hotline or reach out via WhatsApp for a faster response.",
      buttonText: "Call Now",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   OUR STORY PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_OUR_STORY_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-story-hero",
    type: "hero",
    props: {
      heading: "From a Small Idea\nto Your Home",
      subheading: "A journey of passion, craftsmanship, and the belief that everyone deserves a beautiful living space.",
      buttonText: "Explore Collection",
      buttonHref: "/shop",
      bgImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=900&fit=crop",
      bgStyle: "custom",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
      overlayColor: "#000000",
      overlayOpacity: 0.45,
      layout: "center",
      badge: "OUR STORY",
    },
  },
  {
    id: "retail-story-spacer-1",
    type: "spacer",
    props: { height: 60 },
  },
  {
    id: "retail-story-intro-heading",
    type: "heading",
    props: {
      text: "How It All Started",
      level: "h2",
      fontSize: "3xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-story-intro-text",
    type: "text",
    props: {
      text: "In 2018, in a modest studio filled with ceramic samples and fabric swatches, our founder set out with a simple vision: to make thoughtfully designed home goods accessible to everyone.\n\nWhat began as a weekend market stall quickly grew into something bigger. Customers kept coming back — not just for the products, but for the stories behind them. The potter in Abeokuta. The weaver in Kigali. The woodworker in Cape Town. Every piece had a maker, and every maker had a story worth sharing.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-story-spacer-2",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-story-gallery",
    type: "gallery",
    props: {
      title: "Milestones",
      columns: 3,
      items: [
        {
          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=1000&fit=crop",
          title: "2018 — The Beginning",
          description: "Started at weekend markets with a curated collection of handmade home goods from local artisans.",
        },
        {
          image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=1000&fit=crop",
          title: "2020 — Online Launch",
          description: "Brought our full collection online, reaching customers across the country and beyond.",
        },
        {
          image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=1000&fit=crop",
          title: "2023 — Growing Together",
          description: "Expanded to 30+ artisan partners and opened our first permanent showroom.",
        },
      ],
    },
  },
  {
    id: "retail-story-spacer-3",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-story-philosophy-heading",
    type: "heading",
    props: {
      text: "What Drives Us",
      level: "h2",
      fontSize: "3xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-story-philosophy-text",
    type: "text",
    props: {
      text: "We believe that true quality isn't about luxury price tags — it's about the care that goes into making something. It's the potter who fires each piece twice for durability. The weaver who selects every strand by hand. The commitment to materials that age beautifully rather than fall apart.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-story-spacer-4",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-story-values",
    type: "features",
    props: {
      columns: 2,
      items: [
        {
          icon: "heart",
          title: "Heritage Techniques",
          description: "We preserve traditional craftsmanship methods passed down through generations, combining them with modern design for pieces that are both timeless and contemporary.",
        },
        {
          icon: "globe",
          title: "Ethical Sourcing",
          description: "Every material we use comes from suppliers who share our commitment to fair labour, environmental sustainability, and community development.",
        },
      ],
    },
  },
  {
    id: "retail-story-spacer-5",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-story-newsletter",
    type: "newsletter",
    props: {
      title: "Be Part of Our Story",
      subtitle: "Join thousands of customers who have made our pieces part of their homes. Subscribe for exclusive updates and early access to new collections.",
      buttonText: "Subscribe",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   TERMS & CONDITIONS PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_TERMS_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-terms-heading",
    type: "heading",
    props: {
      text: "Terms & Conditions",
      level: "h1",
      fontSize: "4xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-terms-spacer-1",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-terms-intro",
    type: "text",
    props: {
      text: "Welcome to our store. By accessing or using our website, you agree to be bound by these Terms and Conditions. Please read them carefully before making a purchase.",
      align: "left",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-spacer-2",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-general-h",
    type: "heading",
    props: { text: "1. General Terms", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-general",
    type: "text",
    props: {
      text: "By placing an order through our website, you warrant that you are at least 18 years old and are legally capable of entering into binding contracts. We reserve the right to refuse service to anyone for any reason at any time.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s3",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-products-h",
    type: "heading",
    props: { text: "2. Products & Pricing", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-products",
    type: "text",
    props: {
      text: "All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice. We make every effort to display accurate pricing, but errors may occur. In the event of a pricing error, we reserve the right to cancel the order.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s4",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-orders-h",
    type: "heading",
    props: { text: "3. Orders & Payment", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-orders",
    type: "text",
    props: {
      text: "When you place an order, you will receive an email confirmation. This does not mean your order has been accepted. We reserve the right to refuse or cancel any order. Payment must be made in full at the time of purchase through our accepted payment methods.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s5",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-shipping-h",
    type: "heading",
    props: { text: "4. Shipping & Delivery", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-shipping",
    type: "text",
    props: {
      text: "Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers, customs, or events beyond our control. Risk of loss passes to you upon delivery to the carrier.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s6",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-returns-h",
    type: "heading",
    props: { text: "5. Returns & Refunds", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-returns",
    type: "text",
    props: {
      text: "We accept returns within 30 days of delivery for items in their original, unused condition. Refunds will be processed to the original payment method within 5-10 business days. Shipping costs are non-refundable unless the return is due to our error.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s7",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-privacy-h",
    type: "heading",
    props: { text: "6. Privacy & Data", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-privacy",
    type: "text",
    props: {
      text: "We collect and process personal data in accordance with our Privacy Policy. By using our website, you consent to our data practices as described therein. We do not sell your personal information to third parties.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s8",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-cookies-h",
    type: "heading",
    props: { text: "7. Cookies", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-cookies",
    type: "text",
    props: {
      text: "We may use cookies and similar technologies to remember preferences, improve site performance, and better understand how visitors use the store.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s9",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-contact-h",
    type: "heading",
    props: { text: "8. Contact Information", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-contact",
    type: "text",
    props: {
      text: "If you have any questions about these Terms and Conditions, please contact us through our contact page or email us at support@store.com.",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-terms-s10",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-terms-changes-h",
    type: "heading",
    props: { text: "9. Changes to Terms", level: "h2", fontSize: "2xl", color: "#1a1a1a" },
  },
  {
    id: "retail-terms-changes",
    type: "text",
    props: {
      text: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website following the posting of changes constitutes your acceptance of such changes.",
      fontSize: "base",
      color: "#555555",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   REVIEWS PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_REVIEWS_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-reviews-hero",
    type: "hero",
    props: {
      heading: "What Our Customers Say",
      subheading: "Real reviews from real people who've made our pieces part of their homes.",
      bgStyle: "gradient",
      layout: "center",
      badge: "REVIEWS",
    },
  },
  {
    id: "retail-reviews-spacer-1",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-reviews-testimonials",
    type: "testimonials",
    props: {
      title: "Customer Reviews",
      style: "marquee",
      items: [
        { name: "Amara O.", text: "The terracotta planters are absolutely gorgeous. They look even better in person and the quality is outstanding.", role: "Verified Buyer", rating: 5 },
        { name: "David K.", text: "Fast delivery and beautiful packaging. The rattan basket is now my favourite piece in the living room.", role: "Verified Buyer", rating: 5 },
        { name: "Fatima N.", text: "I've ordered three times now and every piece has exceeded my expectations. The ceramic vases are stunning.", role: "Repeat Customer", rating: 5 },
        { name: "James M.", text: "Great customer service too — they helped me choose the right pieces for my apartment. Highly recommend!", role: "Verified Buyer", rating: 4 },
        { name: "Zuri A.", text: "The macramé wall hanging transformed my bedroom. It's the perfect statement piece.", role: "Verified Buyer", rating: 5 },
        { name: "Chen W.", text: "Love the sustainability focus. Every product feels intentional and well-made. Will definitely be back.", role: "Verified Buyer", rating: 5 },
      ],
    },
  },
  {
    id: "retail-reviews-spacer-2",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-reviews-stats",
    type: "stats",
    props: {
      items: [
        { value: "4.8", label: "Average Rating" },
        { value: "2,500+", label: "Happy Customers" },
        { value: "98%", label: "Would Recommend" },
        { value: "500+", label: "5-Star Reviews" },
      ],
    },
  },
  {
    id: "retail-reviews-spacer-3",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-reviews-cta",
    type: "newsletter",
    props: {
      title: "Love Your Purchase?",
      subtitle: "Leave a review and help other customers find their perfect home pieces.",
      buttonText: "Write a Review",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   BESTSELLER PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_BESTSELLER_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-best-hero",
    type: "hero",
    props: {
      heading: "Bestsellers",
      subheading: "Our most-loved pieces — tried, tested, and adored by our customers.",
      bgStyle: "gradient",
      layout: "center",
      badge: "TOP PICKS",
    },
  },
  {
    id: "retail-best-spacer-1",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-best-products",
    type: "best_sellers",
    props: {
      title: "Customer Favourites",
      subtitle: "The pieces our customers keep coming back for.",
      columns: 4,
      limit: 8,
      showFeatured: false,
    },
  },
  {
    id: "retail-best-spacer-2",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-best-banner",
    type: "banner",
    props: {
      title: "New Arrivals Every Month",
      subtitle: "Subscribe to get notified when new pieces drop.",
      buttonText: "Shop All",
      buttonHref: "/shop",
      bgColor: "#f5f0eb",
      textColor: "#1a1a1a",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   NEW IN PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_NEW_IN_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-new-hero",
    type: "hero",
    props: {
      heading: "New Arrivals",
      subheading: "Fresh finds for your home — just landed in our collection.",
      bgStyle: "gradient",
      layout: "center",
      badge: "JUST IN",
    },
  },
  {
    id: "retail-new-spacer-1",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-new-products",
    type: "new_arrivals",
    props: {
      title: "Latest Additions",
      subtitle: "Freshly curated pieces added to our collection.",
      columns: 4,
      limit: 8,
    },
  },
  {
    id: "retail-new-spacer-2",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-new-newsletter",
    type: "newsletter",
    props: {
      title: "Never Miss a Drop",
      subtitle: "Be the first to know when new pieces arrive. Subscribe for early access.",
      buttonText: "Subscribe",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   ORDER TRACKING PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_ORDER_TRACKING_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-tracking-heading",
    type: "heading",
    props: {
      text: "Track Your Order",
      level: "h1",
      fontSize: "4xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-tracking-spacer-1",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-tracking-text",
    type: "text",
    props: {
      text: "Enter your order number below to check the status of your delivery. You can find your order number in the confirmation email we sent you.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-tracking-spacer-2",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-tracking-features",
    type: "features",
    props: {
      title: "Delivery Process",
      columns: 4,
      items: [
        { icon: "check", title: "Order Confirmed", description: "We've received your order and it's being prepared." },
        { icon: "package", title: "Being Packed", description: "Your items are being carefully packed for shipping." },
        { icon: "truck", title: "On Its Way", description: "Your order is with our delivery partner and en route." },
        { icon: "heart", title: "Delivered", description: "Your order has arrived. Enjoy your new pieces!" },
      ],
    },
  },
  {
    id: "retail-tracking-spacer-3",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-tracking-faq",
    type: "faq",
    props: {
      title: "Shipping FAQ",
      items: [
        { question: "How long does delivery take?", answer: "Standard delivery takes 3-5 business days. Express delivery is 1-2 business days. International orders take 7-14 business days." },
        { question: "Can I change my delivery address?", answer: "You can change your delivery address within 2 hours of placing your order. Contact our support team for assistance." },
        { question: "What if my order is damaged?", answer: "If your order arrives damaged, please contact us within 48 hours with photos. We'll arrange a replacement or refund immediately." },
      ],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   MY ACCOUNT PAGE (placeholder blocks — actual logic is dynamic)
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_MY_ACCOUNT_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-account-heading",
    type: "heading",
    props: {
      text: "My Account",
      level: "h1",
      fontSize: "4xl",
      align: "center",
      color: "#1a1a1a",
    },
  },
  {
    id: "retail-account-spacer-1",
    type: "spacer",
    props: { height: 20 },
  },
  {
    id: "retail-account-text",
    type: "text",
    props: {
      text: "Manage your account, view orders, and update your details.",
      align: "center",
      fontSize: "base",
      color: "#555555",
    },
  },
  {
    id: "retail-account-spacer-2",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-account-features",
    type: "features",
    props: {
      columns: 3,
      items: [
        { icon: "package", title: "My Orders", description: "View and track your recent orders." },
        { icon: "heart", title: "Wishlist", description: "Browse items you've saved for later." },
        { icon: "map-pin", title: "Addresses", description: "Manage your delivery addresses." },
      ],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   SKINCARE / CATEGORY LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_SKINCARE_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-skincare-hero",
    type: "hero",
    props: {
      heading: "Home Care Essentials",
      subheading: "Natural, effective products for a clean and fresh home.",
      bgStyle: "light",
      layout: "center",
      badge: "COLLECTION",
    },
  },
  {
    id: "retail-skincare-spacer-1",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-skincare-products",
    type: "featured_products",
    props: {
      title: "Featured in This Collection",
      columns: 4,
      limit: 8,
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   FRAGRANCES / CATEGORY LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_FRAGRANCES_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-fragrances-hero",
    type: "hero",
    props: {
      heading: "Home Fragrances",
      subheading: "Candles, diffusers, and scented accents to set the mood in every room.",
      bgStyle: "light",
      layout: "center",
      badge: "COLLECTION",
    },
  },
  {
    id: "retail-fragrances-spacer-1",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-fragrances-products",
    type: "featured_products",
    props: {
      title: "Explore Our Fragrances",
      columns: 4,
      limit: 8,
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   JOURNAL / BLOG LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_JOURNAL_BLOCKS: BuilderBlock[] = [
  {
    id: "retail-journal-hero",
    type: "hero",
    props: {
      heading: "Journal",
      subheading: "Tips, stories, and inspiration for making your house a home.",
      bgStyle: "light",
      layout: "center",
      badge: "OUR BLOG",
    },
  },
  {
    id: "retail-journal-spacer-1",
    type: "spacer",
    props: { height: 50 },
  },
  {
    id: "retail-journal-text",
    type: "text",
    props: {
      text: "From styling guides to artisan spotlights, our journal is your source for home inspiration. Explore our latest posts below.",
      align: "center",
      fontSize: "lg",
      color: "#555555",
    },
  },
  {
    id: "retail-journal-spacer-2",
    type: "spacer",
    props: { height: 40 },
  },
  {
    id: "retail-journal-newsletter",
    type: "newsletter",
    props: {
      title: "Get Inspired Weekly",
      subtitle: "Subscribe for styling tips, new arrivals, and stories from our artisan partners.",
      buttonText: "Subscribe",
      bgColor: "#2c2c2c",
      textColor: "#ffffff",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   ALL RETAIL PAGE PRESETS (convenience export)
   ═══════════════════════════════════════════════════════════════ */
export const RETAIL_PAGE_PRESETS: Record<string, BuilderBlock[]> = {
  about: RETAIL_ABOUT_BLOCKS,
  contact: RETAIL_CONTACT_BLOCKS,
  "our-story": RETAIL_OUR_STORY_BLOCKS,
  terms: RETAIL_TERMS_BLOCKS,
  reviews: RETAIL_REVIEWS_BLOCKS,
  bestseller: RETAIL_BESTSELLER_BLOCKS,
  "new-in": RETAIL_NEW_IN_BLOCKS,
  "order-tracking": RETAIL_ORDER_TRACKING_BLOCKS,
  "my-account": RETAIL_MY_ACCOUNT_BLOCKS,
  skincare: RETAIL_SKINCARE_BLOCKS,
  fragrances: RETAIL_FRAGRANCES_BLOCKS,
  journal: RETAIL_JOURNAL_BLOCKS,
};
