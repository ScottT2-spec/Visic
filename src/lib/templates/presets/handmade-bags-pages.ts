import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Handmade Bags template — default page block content.
 * These blocks are seeded into the DB so pages are editable from day one.
 * Matches the hardcoded pages exactly (images, text, structure).
 */

/* ── ABOUT PAGE ─────────────────────────────────────────────── */
export const HANDMADE_BAGS_ABOUT_BLOCKS: TemplateBlock[] = [
  {
    id: "about-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "ABOUT US",
          titleLine1: "Handcrafted",
          titleLine2: "Excellence",
          description:
            "Discover the artistry behind our premium leather goods and the passionate artisans who bring them to life.",
          buttonText: "Shop Collection",
          buttonLink: "/shop",
          colorScheme: "dark",
          textPosition: "center",
          backgroundImage:
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1920&h=900&fit=crop",
        },
      ],
      minHeight: "550px",
      autoplaySpeed: 0,
    },
  },
  {
    id: "about-marquee",
    type: "fashionMarquee",
    props: {
      items: [
        { text: "Handcrafted with Love", icon: "✦" },
        { text: "Premium Leather", icon: "✦" },
        { text: "Sustainable Practices", icon: "✦" },
        { text: "Lifetime Quality", icon: "✦" },
      ],
      speed: "50s",
      gap: "60px",
      backgroundColor: "transparent",
      textColor: "#242424",
      fontSize: "28px",
      fontWeight: "600",
      paddingY: "25px",
      borderTop: "1px solid #c27843",
      marginBottom: "0px",
    },
  },
  {
    id: "about-intro",
    type: "fashionSectionTitle",
    props: {
      subtitle: "WHO WE ARE",
      title: "A Legacy of Craftsmanship",
      description:
        "For over two decades, we have been dedicated to creating exceptional leather goods that combine traditional techniques with contemporary design. Each piece in our collection represents hours of meticulous work by skilled artisans who have mastered their craft through generations of knowledge passed down.",
      align: "center",
      maxWidth: "70%",
      marginBottom: "60px",
    },
  },
  {
    id: "about-image-section",
    type: "fashionCoverBanners",
    props: {
      columns: 2,
      height: "500px",
      marginBottom: "70px",
      banners: [
        {
          image:
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop",
          icon: "",
          title: "Our Workshop",
          description:
            "Where tradition meets innovation in every stitch and detail.",
          overlayOpacity: 0.3,
        },
        {
          image:
            "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&h=1000&fit=crop",
          icon: "",
          title: "Premium Materials",
          description:
            "Sourcing the finest full-grain leathers from ethical suppliers worldwide.",
          overlayOpacity: 0.3,
        },
      ],
    },
  },
  {
    id: "about-mission",
    type: "fashionSectionTitle",
    props: {
      subtitle: "OUR MISSION",
      title: "Creating Timeless Pieces",
      description:
        "We believe that true luxury lies in quality, sustainability, and the human touch. Our mission is to create leather goods that not only serve a functional purpose but also tell a story of artistry and dedication.",
      align: "center",
      maxWidth: "60%",
      marginBottom: "50px",
    },
  },
  {
    id: "about-values",
    type: "fashionFeatures",
    props: {
      columns: 3,
      marginBottom: "70px",
      features: [
        {
          number: "01",
          title: "Artisan Craftsmanship",
          description:
            "Every bag is handcrafted by master artisans with decades of experience, ensuring each piece meets our exacting standards.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "02",
          title: "Sustainable Practices",
          description:
            "We are committed to ethical sourcing, eco-friendly production methods, and creating products that last a lifetime.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "03",
          title: "Customer Excellence",
          description:
            "From design to delivery, every step is guided by our commitment to exceeding customer expectations.",
          buttonText: "",
          buttonLink: "",
        },
      ],
    },
  },
  {
    id: "about-cta",
    type: "fashionNewsletter",
    props: {
      subtitle: "",
      title: "Join Our Journey",
      description:
        "Subscribe to our newsletter for exclusive updates, new arrivals, and behind-the-scenes insights into our craft.",
      buttonText: "Subscribe",
      backgroundColor: "#c27843",
      socialLinks: [],
    },
  },
];

/* ── CONTACT PAGE ───────────────────────────────────────────── */
export const HANDMADE_BAGS_CONTACT_BLOCKS: TemplateBlock[] = [
  {
    id: "contact-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "CONTACT US",
          titleLine1: "Get in",
          titleLine2: "Touch",
          description:
            "We'd love to hear from you. Whether you have a question about our products, need assistance with an order, or just want to say hello.",
          buttonText: "Shop Collection",
          buttonLink: "/shop",
          colorScheme: "dark",
          textPosition: "center",
          backgroundImage:
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=900&fit=crop",
        },
      ],
      minHeight: "550px",
      autoplaySpeed: 0,
    },
  },
  {
    id: "contact-marquee",
    type: "fashionMarquee",
    props: {
      items: [
        { text: "24/7 Support", icon: "✦" },
        { text: "Fast Response", icon: "✦" },
        { text: "Expert Help", icon: "✦" },
        { text: "Satisfaction Guaranteed", icon: "✦" },
      ],
      speed: "50s",
      gap: "60px",
      backgroundColor: "transparent",
      textColor: "#242424",
      fontSize: "28px",
      fontWeight: "600",
      paddingY: "25px",
      borderTop: "1px solid #c27843",
      marginBottom: "0px",
    },
  },
  {
    id: "contact-intro",
    type: "fashionSectionTitle",
    props: {
      subtitle: "REACH OUT",
      title: "We're Here to Help",
      description:
        "Our dedicated customer service team is available to assist you with any questions or concerns. We typically respond within 24 hours.",
      align: "center",
      maxWidth: "60%",
      marginBottom: "60px",
    },
  },
  {
    id: "contact-info",
    type: "fashionFeatures",
    props: {
      columns: 3,
      marginBottom: "70px",
      features: [
        {
          number: "📍",
          title: "Visit Our Store",
          description:
            "451 Wall Street, UK, London. Come visit our flagship store and experience our craftsmanship firsthand.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "📞",
          title: "Call Us",
          description:
            "(064) 332-1233. Our customer service team is available Monday through Friday, 9am to 6pm.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "✉️",
          title: "Email Us",
          description:
            "support@handmadebags.com. Send us an email anytime and we'll get back to you within 24 hours.",
          buttonText: "",
          buttonLink: "",
        },
      ],
    },
  },
  {
    id: "contact-form-section",
    type: "fashionSectionTitle",
    props: {
      subtitle: "SEND A MESSAGE",
      title: "We'd Love to Hear From You",
      description:
        "Fill out the form below and we'll get back to you as soon as possible.",
      align: "center",
      maxWidth: "50%",
      marginBottom: "50px",
    },
  },
  {
    id: "contact-cta",
    type: "fashionNewsletter",
    props: {
      subtitle: "QUICK RESPONSE",
      title: "Need Immediate Assistance?",
      description:
        "For urgent matters, please call our customer service hotline or reach out via WhatsApp for faster response.",
      buttonText: "Call Now",
      backgroundColor: "#c27843",
      socialLinks: [],
    },
  },
];

/* ── OUR STORY PAGE ─────────────────────────────────────────── */
export const HANDMADE_BAGS_OUR_STORY_BLOCKS: TemplateBlock[] = [
  {
    id: "story-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "OUR STORY",
          titleLine1: "From Workshop",
          titleLine2: "To World-Class",
          description:
            "A journey of passion, dedication, and the pursuit of excellence in leather craftsmanship.",
          buttonText: "Explore Collection",
          buttonLink: "/shop",
          colorScheme: "dark",
          textPosition: "center",
          backgroundImage:
            "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=900&fit=crop",
        },
      ],
      minHeight: "550px",
      autoplaySpeed: 0,
    },
  },
  {
    id: "story-marquee",
    type: "fashionMarquee",
    props: {
      items: [
        { text: "Founded 2008", icon: "✦" },
        { text: "30+ Countries", icon: "✦" },
        { text: "100+ Artisans", icon: "✦" },
        { text: "Sustainable", icon: "✦" },
      ],
      speed: "50s",
      gap: "60px",
      backgroundColor: "transparent",
      textColor: "#242424",
      fontSize: "28px",
      fontWeight: "600",
      paddingY: "25px",
      borderTop: "1px solid #c27843",
      marginBottom: "0px",
    },
  },
  {
    id: "story-intro",
    type: "fashionSectionTitle",
    props: {
      subtitle: "THE BEGINNING",
      title: "A Dream in a Small Workshop",
      description:
        "In 2008, in a modest workshop in the heart of the city, our founder set out with a simple yet ambitious vision: to create leather goods that would stand the test of time. With just three artisans and a handful of tools, the first collection was born – five handcrafted bags that would become the foundation of everything we stand for today.",
      align: "center",
      maxWidth: "70%",
      marginBottom: "60px",
    },
  },
  {
    id: "story-timeline",
    type: "fashionSectionTitle",
    props: {
      subtitle: "OUR JOURNEY",
      title: "Milestones That Shaped Us",
      description:
        "Every year brought new challenges, learnings, and opportunities to grow while staying true to our core values.",
      align: "center",
      maxWidth: "60%",
      marginBottom: "50px",
    },
  },
  {
    id: "story-timeline-banners",
    type: "fashionCoverBanners",
    props: {
      columns: 3,
      height: "450px",
      marginBottom: "70px",
      banners: [
        {
          image:
            "https://images.unsplash.com/photo-1473188588951-1d4f0e31f5e0?w=800&h=1000&fit=crop",
          icon: "",
          title: "2008 - The Beginning",
          description:
            "Founded with three artisans and a vision for timeless leather craftsmanship. Our first collection of five bags sold out within weeks.",
          overlayOpacity: 0.35,
        },
        {
          image:
            "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=1000&fit=crop",
          icon: "",
          title: "2012 - First Expansion",
          description:
            "Opened our flagship store and expanded our workshop. Introduced our signature vegetable-tanned leather collection.",
          overlayOpacity: 0.35,
        },
        {
          image:
            "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&h=1000&fit=crop",
          icon: "",
          title: "2018 - Global Reach",
          description:
            "Launched internationally, reaching customers in over 30 countries. Established partnerships with ethical leather suppliers.",
          overlayOpacity: 0.35,
        },
      ],
    },
  },
  {
    id: "story-philosophy",
    type: "fashionSectionTitle",
    props: {
      subtitle: "OUR PHILOSOPHY",
      title: "Craftsmanship With Purpose",
      description:
        "We believe that true luxury is not about labels or price tags – it's about the story behind each piece, the hands that made it, and the values it represents.",
      align: "center",
      maxWidth: "65%",
      marginBottom: "50px",
    },
  },
  {
    id: "story-values",
    type: "fashionFeatures",
    props: {
      columns: 2,
      marginBottom: "70px",
      features: [
        {
          number: "01",
          title: "Heritage Techniques",
          description:
            "We preserve traditional leatherworking methods passed down through generations, combining them with modern innovation for pieces that are both timeless and contemporary.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "02",
          title: "Ethical Sourcing",
          description:
            "Every piece of leather we use comes from suppliers who share our commitment to animal welfare, environmental sustainability, and fair labor practices.",
          buttonText: "",
          buttonLink: "",
        },
      ],
    },
  },
  {
    id: "story-cta",
    type: "fashionNewsletter",
    props: {
      subtitle: "",
      title: "Be Part of Our Story",
      description:
        "Join thousands of customers who have made our pieces part of their journey. Subscribe for exclusive updates and early access to new collections.",
      buttonText: "Subscribe",
      backgroundColor: "#c27843",
      socialLinks: [],
    },
  },
];

/* ── REVIEWS PAGE ───────────────────────────────────────────── */
export const HANDMADE_BAGS_REVIEWS_BLOCKS: TemplateBlock[] = [
  {
    id: "reviews-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "TESTIMONIALS",
          titleLine1: "Customer",
          titleLine2: "Reviews",
          description:
            "See what our customers are saying about their handcrafted leather pieces.",
          buttonText: "Shop Collection",
          buttonLink: "/shop",
          colorScheme: "dark",
          textPosition: "center",
          backgroundImage:
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1920&h=900&fit=crop",
        },
      ],
      minHeight: "550px",
      autoplaySpeed: 0,
    },
  },
  {
    id: "reviews-marquee",
    type: "fashionMarquee",
    props: {
      items: [
        { text: "⭐⭐⭐⭐⭐", icon: "" },
        { text: "Quality Craftsmanship", icon: "✦" },
        { text: "Fast Shipping", icon: "✦" },
        { text: "Excellent Service", icon: "✦" },
        { text: "Premium Leather", icon: "✦" },
        { text: "Satisfied Customers", icon: "✦" },
      ],
      speed: "50s",
      gap: "60px",
      backgroundColor: "transparent",
      textColor: "#242424",
      fontSize: "28px",
      fontWeight: "600",
      paddingY: "25px",
      borderTop: "1px solid #c27843",
      marginBottom: "0px",
    },
  },
  {
    id: "reviews-intro",
    type: "fashionSectionTitle",
    props: {
      subtitle: "WHAT THEY SAY",
      title: "Customer Reviews",
      description:
        "Read honest reviews from our valued customers about their experience with our handcrafted leather goods.",
      align: "center",
      maxWidth: "60%",
      marginBottom: "60px",
    },
  },
  {
    id: "reviews-cta",
    type: "fashionNewsletter",
    props: {
      subtitle: "",
      title: "Love Our Products?",
      description:
        "Share your experience with us. Your feedback helps us continue crafting excellence.",
      buttonText: "Write a Review",
      backgroundColor: "#c27843",
      socialLinks: [],
    },
  },
];

/** Map slug → default blocks for handbag template pages */
export const HANDMADE_BAGS_PAGE_BLOCKS: Record<string, TemplateBlock[]> = {
  about: HANDMADE_BAGS_ABOUT_BLOCKS,
  contact: HANDMADE_BAGS_CONTACT_BLOCKS,
  "our-story": HANDMADE_BAGS_OUR_STORY_BLOCKS,
  reviews: HANDMADE_BAGS_REVIEWS_BLOCKS,
};
