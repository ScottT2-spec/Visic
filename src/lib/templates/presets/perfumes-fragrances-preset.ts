import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

export const PERFUMES_FRAGRANCES_PRESET: TemplateBlock[] = [
  {
    id: "perfumes-fragrances-hero",
    type: "perfumesPageHero",
    props: {
      title: "Fragrances",
    },
  },
  {
    id: "perfumes-collections-grid",
    type: "perfumesCollectionsGrid",
    props: {
      collections: [
        { name: "Étheria", slug: "etheria", description: "A collection of light, almost weightless fragrances. Airy florals, sheer musks, and fresh morning dew evoke purity and clarity." },
        { name: "Celeste Aura", slug: "celeste-aura", description: "Elegant fragrances blending vibrant citrus, shimmering aldehydes, and refined light woods creating an aura of inner glow." },
        { name: "Opus Essence", slug: "opus-essence", description: "Rich, complex compositions. Deep florals, precious woods, and warm ambers create a multidimensional fragrance experience." },
        { name: "Velours Noir", slug: "velours-noir", description: "Dark, velvety fragrances with depth and mystery. Smoky oud, leather accords, and black vanilla." },
        { name: "Nocturne Essence", slug: "nocturne-essence", description: "Fragrances inspired by nightfall. Cool musks, aromatic herbs, and dark spices capture twilight elegance." },
        { name: "Elysian Bloom", slug: "elysian-bloom", description: "Fresh, green fragrances celebrating nature. Dewy petals, crisp leaves, and earthy vetiver." },
      ],
    },
  },
];
