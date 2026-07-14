import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

const IMG = "https://woodmart.xtemos.com/perfumes/wp-content/uploads/sites/32/2025/11";

export const PERFUMES_ABOUT_PRESET: TemplateBlock[] = [
  {
    id: "perfumes-about-welcome",
    type: "perfumesAboutWelcome",
    props: {
      title: "Welcome to Our Fragrances",
      text: "At our Fragrances, we believe that scent is more than just an aroma — it's an experience. Inspired by the richness of nature, we craft sophisticated fragrances that bring warmth, elegance, and personality to every moment. Our carefully curated collections blend the finest natural ingredients, creating timeless scents that leave a lasting impression.",
      image: `${IMG}/prf-about-us-1.jpg`,
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
        { icon: `${IMG}/prf-infobox-1.svg`, title: "Natural Ingredients", desc: "We use responsibly sourced, high-quality natural ingredients for an authentic experience." },
        { icon: `${IMG}/prf-infobox-2.svg`, title: "Artisanal Craftsmanship", desc: "Each fragrance is carefully developed by expert perfumers with a deep passion for artistry." },
        { icon: `${IMG}/prf-infobox-3.svg`, title: "Sustainable & Ethical", desc: "We are committed to sustainability, using eco-friendly packaging and ingredients." },
        { icon: `${IMG}/prf-infobox-4.svg`, title: "Luxury Experience", desc: "From elegant bottles to exquisite scents, every fragrance is designed to offer a journey." },
      ],
    },
  },
];
