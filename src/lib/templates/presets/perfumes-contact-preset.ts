import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

export const PERFUMES_CONTACT_PRESET: TemplateBlock[] = [
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
