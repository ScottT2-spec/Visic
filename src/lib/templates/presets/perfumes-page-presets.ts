import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Perfumes Template Page Presets
 * Using new rich content block types with EXACT content from hardcoded JSX
 * Content extracted verbatim from existing perfumes preset files - no placeholders
 */

export const PERFUMES_HOME_PAGE_BLOCKS: TemplateBlock[] = [
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
      items: ["Ember Glow", "Golden Veil", "Midnight Azure", "Nocturne Essence", "Étheria"],
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
    id: "perfumes-footer",
    type: "perfumesFooter",
    props: {
      storeName: "Perfumes",
      storeSlug: "perfumes",
      description: "Discover a curated collection of modern fragrances designed to hold memory, emotion, and identity in every bottle.",
    },
  },
];

export const PERFUMES_ABOUT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "perfumes-about-welcome",
    type: "perfumesAboutWelcome",
    props: {
      title: "Welcome to Our Fragrances",
      text: "At our Fragrances, we believe that scent is more than just an aroma — it's an experience. Inspired by the richness of nature, we craft sophisticated fragrances that bring warmth, elegance, and personality to every moment. Our carefully curated collections blend the finest natural ingredients, creating timeless scents that leave a lasting impression.",
      image: "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-about-us-1.jpg",
    },
  },
  {
    id: "perfumes-about-marquee",
    type: "perfumesAboutMarquee",
    props: {
      items: ["Ethereal", "Sensory", "Signature"],
    },
  },
  {
    id: "perfumes-about-story",
    type: "perfumesAboutStory",
    props: {
      title: "Our Story",
      text: "The journey of our Fragrances began in a small family workshop in Provence, France. Founded by master perfumer Louis Beaumont in 1987, our brand was born from a passion for nature's raw beauty and the art of perfumery. Inspired by the rich scents of wood, earth, and blooming florals, Louis spent years perfecting his craft, blending rare ingredients to create signature fragrances. What started as a modest venture quickly grew into an internationally recognized brand, known for its commitment to quality, sustainability, and innovation. Today, our Fragrances continues this legacy, offering exquisite scents that transport you to a world of timeless elegance.",
      faqItems: [
        { q: "What makes our fragrances unique?", a: "Each fragrance is meticulously crafted using the finest natural ingredients sourced from around the world. Our master perfumers combine traditional techniques with innovative approaches to create scents that are truly one of a kind." },
        { q: "Are your products cruelty-free?", a: "Yes, all our products are 100% cruelty-free. We never test on animals and we work only with suppliers who share our commitment to ethical practices." },
        { q: "How long do your fragrances last?", a: "Our Eau de Parfum formulations are designed to last 8-12 hours on skin. For best results, apply to pulse points and moisturized skin." },
        { q: "Do you offer sample sizes?", a: "Yes! We offer 2ml sample sizes for most of our fragrances so you can discover your perfect scent before committing to a full bottle." },
        { q: "How should I store my perfume?", a: "Store your fragrances in a cool, dry place away from direct sunlight and heat. Keep the bottle tightly closed when not in use to preserve the scent." },
      ],
    },
  },
  {
    id: "perfumes-about-why",
    type: "perfumesWhyChooseUs",
    props: {
      title: "Why Choose Us?",
      items: [
        { icon: "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-infobox-1.svg", title: "Natural Ingredients", desc: "We use responsibly sourced, high-quality natural ingredients for an authentic experience." },
        { icon: "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-infobox-2.svg", title: "Artisanal Craftsmanship", desc: "Each fragrance is carefully developed by expert perfumers with a deep passion for artistry." },
        { icon: "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-infobox-3.svg", title: "Sustainable & Ethical", desc: "We are committed to sustainability, using eco-friendly packaging and ingredients." },
        { icon: "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11/prf-infobox-4.svg", title: "Luxury Experience", desc: "From elegant bottles to exquisite scents, every fragrance is designed to offer a journey." },
      ],
    },
  },
];

export const PERFUMES_CONTACT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "perfumes-contact-hero",
    type: "perfumesContactHero",
    props: {
      title: "Contact Us",
    },
  },
  {
    id: "perfumes-contact-info",
    type: "perfumesContactInfo",
    props: {
      items: [
        { label: "Our Address", value: "123 Perfume Lane, Paris, France" },
        { label: "Phone Number", value: "+33 1 23 45 67 89" },
        { label: "Business Hours", value: "Monday – Friday: 9 AM – 6 PM<br />Saturday–Sunday: Closed" },
        { label: "Follow Us", value: "", type: "social" },
      ],
    },
  },
  {
    id: "perfumes-contact-form",
    type: "perfumesContactForm",
    props: {
      title: "Get In Touch",
      description: "We'd love to hear from you! Whether you have a question, need assistance, or simply want to learn more about our fragrances, reach out to us. Fill in the form below, and we'll get back to you as soon as possible.",
    },
  },
  {
    id: "perfumes-branded-stores",
    type: "perfumesBrandedStores",
    props: {
      title: "Our Branded Stores",
      stores: [
        { name: "Paris Store", phone: "+33 1 23 45 67 89", address: "1 Bd Saint-Germain, 75005 Paris" },
        { name: "Brussels Store", phone: "+33 1 23 45 67 89", address: "Rue du Grand Cerf 2, 1000 Bruxelles, Belgium" },
        { name: "London Store", phone: "+33 1 23 45 67 89", address: "229-247 Regent St., London W1B 2EG, United Kingdom" },
      ],
    },
  },
];

export const PERFUMES_FRAGRANCES_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "perfumes-fragrances-hero",
    type: "perfumesPageHero",
    props: {
      title: "Fragrances",
      subtitle: "Discover Our Collections",
    },
  },
  {
    id: "perfumes-collections-grid",
    type: "perfumesCollectionsGrid",
    props: {
      collections: [
        { name: "Étheria", slug: "etheria", description: "A collection of delicate, weightless fragrances that capture the essence of air and light. Soft florals, sheer musks, and dewy accords." },
        { name: "Celeste Aura", slug: "celeste-aura", description: "Elegant fragrances blending vibrant citrus, shimmering aldehydes, and refined light woods creating an aura of inner glow." },
        { name: "Opus Essence", slug: "opus-essence", description: "Rich, complex compositions. Deep florals, precious woods, and warm ambers create a multidimensional fragrance experience." },
        { name: "Velours Noir", slug: "velours-noir", description: "Dark, velvety fragrances with depth and mystery. Smoky oud, leather accords, and black vanilla." },
        { name: "Nocturne Essence", slug: "nocturne-essence", description: "Fragrances inspired by nightfall. Cool musks, aromatic herbs, and dark spices capture twilight elegance." },
        { name: "Elysian Bloom", slug: "elysian-bloom", description: "Fresh, green fragrances celebrating nature. Dewy petals, crisp leaves, and earthy vetiver." },
      ],
    },
  },
  {
    id: "perfumes-featured-products",
    type: "perfumesFeaturedProducts",
    props: {
      title: "Featured Fragrances",
      subtitle: "Our most beloved scents",
    },
  },
];

export const PERFUMES_JOURNAL_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "perfumes-journal-hero",
    type: "perfumesPageHero",
    props: {
      title: "Journal",
      subtitle: "Explore Our Stories",
    },
  },
  {
    id: "perfumes-journal-grid",
    type: "perfumesJournalGrid",
    props: {
      title: "Journal Articles",
      columns: 3,
    },
  },
  {
    id: "perfumes-featured-posts",
    type: "perfumesFeaturedPosts",
    props: {
      title: "Latest Stories",
      subtitle: "Discover the art of fragrance",
    },
  },
];

export const PERFUMES_REVIEWS_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "perfumes-reviews-hero",
    type: "perfumesReviewsHero",
    props: {
      title: "Reviews",
    },
  },
  {
    id: "perfumes-reviews-grid",
    type: "perfumesReviewsGrid",
    props: {
      columns: 3,
    },
  },
];
