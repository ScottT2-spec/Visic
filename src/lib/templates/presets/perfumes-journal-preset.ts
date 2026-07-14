import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

export const PERFUMES_JOURNAL_PRESET: TemplateBlock[] = [
  {
    id: "perfumes-journal-hero",
    type: "perfumesPageHero",
    props: {
      title: "Journal",
    },
  },
  {
    id: "perfumes-journal-grid",
    type: "perfumesJournalGrid",
    props: {
      columns: 3,
    },
  },
];
