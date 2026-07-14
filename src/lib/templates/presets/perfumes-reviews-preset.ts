import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

export const PERFUMES_REVIEWS_PRESET: TemplateBlock[] = [
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
