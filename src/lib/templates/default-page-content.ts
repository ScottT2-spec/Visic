import { blockDefaults, type BuilderBlock, type BlockType } from "@/lib/builder/types";
import { parsePageContent, pickRicherPageDocument, serializePageContent, type PageContentDocument } from "@/lib/page-content";
import { isBespokeTemplateSlug } from "@/lib/templates/bespoke-template-slugs";

export interface DefaultPageContentContext {
  pageSlug: string;
  pageTitle?: string | null;
  pageType?: string | null;
  templateSlug?: string | null;
}

type TemplateFamily =
  | "fashion"
  | "electronics"
  | "beauty"
  | "grocery"
  | "health"
  | "kids"
  | "bakery"
  | "interior"
  | "perfumes"
  | "generic";

interface FamilyCopy {
  about: {
    summary: string;
    story: string;
    support: string;
    mission: string;
    features: Array<{ icon: string; title: string; desc: string }>;
    team: Array<{ name: string; role: string }>;
  };
  contact: {
    summary: string;
    intro: string;
    hours: string;
    faq: Array<{ question: string; answer: string }>;
  };
  editorial: {
    summary: string;
    intro: string;
    highlight: string;
  };
  commerce: {
    summary: string;
    intro: string;
    delivery: string;
    faq: Array<{ question: string; answer: string }>;
  };
  policy: {
    summary: string;
    intro: string;
  };
}

const FAMILY_COPY: Record<TemplateFamily, FamilyCopy> = {
  fashion: {
    about: {
      summary: "A style-led store shaped around seasonal collections, confident dressing, and polished product storytelling.",
      story: "We curate wardrobe essentials, statement pieces, and everyday staples with a strong eye for fabric, fit, and versatility. The goal is a store that feels editorial without losing the practicality shoppers need.",
      support: "Every product page can carry styling notes, fit guidance, and quick answers so customers can buy with confidence.",
      mission: "Make it easy to build a wardrobe that feels current, useful, and personal.",
      features: [
        { icon: "sparkles", title: "Curated Drops", desc: "Collections are grouped by mood, season, and occasion instead of dumped into a flat catalog." },
        { icon: "shield", title: "Fit Confidence", desc: "Clear size guidance and garment notes help shoppers choose the right item the first time." },
        { icon: "truck", title: "Fast Dispatch", desc: "Highlight shipping windows, same-day handoff, and regional delivery options." },
      ],
      team: [
        { name: "Creative Director", role: "Merchandising & Styling" },
        { name: "Operations Lead", role: "Fulfilment & Support" },
        { name: "Customer Stylist", role: "Fit Guidance & Returns" },
      ],
    },
    contact: {
      summary: "Talk to our style team for fit advice, order updates, or help choosing the right look.",
      intro: "We keep the support line simple: quick replies, straightforward shipping updates, and practical sizing help.",
      hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
      faq: [
        { question: "How do I confirm my size?", answer: "Send us your measurements or the item code and we will recommend the best fit." },
        { question: "Do you offer exchanges?", answer: "Yes. Exchanges are available for unworn items within the return window." },
        { question: "Can I order through WhatsApp?", answer: "Yes. Share your cart list and we can help complete the order quickly." },
      ],
    },
    editorial: {
      summary: "Style notes, new arrivals, and collection stories written to feel like a real fashion editorial.",
      intro: "Use this page for launch notes, trend edits, gifting guides, or behind-the-scenes stories from the brand.",
      highlight: "Every article can pair text with image-led storytelling, fit tips, and links back to the relevant collection.",
    },
    commerce: {
      summary: "Curated products, bestsellers, and seasonal highlights that feel like a real boutique rack.",
      intro: "This layout keeps the shopping path focused: the hero points shoppers to the collection, then product blocks, trust signals, and a clear FAQ close the loop.",
      delivery: "Offer local and regional delivery details directly beside the call to action so customers know what to expect.",
      faq: [
        { question: "How soon will my order ship?", answer: "Orders are packed the same day when possible, with tracking sent as soon as the parcel leaves." },
        { question: "Can I pay on delivery?", answer: "Enable cash or card on delivery if your fulfillment flow supports it." },
      ],
    },
    policy: {
      summary: "Straightforward policies that help shoppers understand delivery, exchanges, and returns.",
      intro: "Keep the policy copy specific, short, and easy to scan. Customers should know where to ask questions and how to resolve an issue.",
    },
  },
  electronics: {
    about: {
      summary: "A tech store built around clear specs, practical accessories, and a strong service promise.",
      story: "We focus on the gadgets people actually use every day: phones, laptops, audio, charging, and gaming gear. The presentation is clean, informative, and easy to browse on mobile.",
      support: "Product blocks can surface features, comparisons, and warranty details instead of generic sales copy.",
      mission: "Help shoppers compare devices quickly and order the right tech without friction.",
      features: [
        { icon: "shield", title: "Warranty Support", desc: "Show warranty duration, after-sales care, and repair options clearly." },
        { icon: "truck", title: "Fast Dispatch", desc: "Call out same-day handoff, pickup windows, and delivery tracking." },
        { icon: "credit-card", title: "Flexible Payments", desc: "Mention card, transfer, or pay-on-delivery options where available." },
      ],
      team: [
        { name: "Product Specialist", role: "Tech Advice" },
        { name: "Dispatch Lead", role: "Order Fulfilment" },
        { name: "Support Desk", role: "Setup & Returns" },
      ],
    },
    contact: {
      summary: "Get help with specs, compatibility, bulk orders, or warranty questions.",
      intro: "This contact page gives shoppers a direct route to ask about stock, setup, and delivery before they purchase.",
      hours: "Monday - Saturday, 8:30 AM - 7:00 PM",
      faq: [
        { question: "Do you help with setup?", answer: "Yes. We can walk you through activation, pairing, and first-use setup." },
        { question: "Can I reserve stock?", answer: "If a product is limited, contact us and we will confirm availability before checkout." },
        { question: "Do you offer corporate orders?", answer: "Yes. Bulk quotes and invoice-based purchasing can be arranged on request." },
      ],
    },
    editorial: {
      summary: "Reviews, buying guides, and release notes designed for shoppers comparing real devices.",
      intro: "Use this page for comparisons, top-pick lists, and practical tech explainers that help customers choose the right product.",
      highlight: "Each article should point to a specific category or collection, not a generic blog archive.",
    },
    commerce: {
      summary: "Show the latest gadgets, accessories, and top sellers in a compact tech-first layout.",
      intro: "The focus is product clarity: highlight what is in stock, what is new, and what is on offer.",
      delivery: "Keep delivery timing and warranty details visible beside the product grid.",
      faq: [
        { question: "Are the products original?", answer: "Yes. Use this page to explain sourcing, authenticity, and verification." },
        { question: "Can I track my order?", answer: "Orders should include a tracking number once handed off to the courier." },
      ],
    },
    policy: {
      summary: "A simple policy page for warranty terms, returns, and device support.",
      intro: "Customers buying electronics need clarity on returns, dead-on-arrival handling, and warranty coverage. Keep each answer direct.",
    },
  },
  beauty: {
    about: {
      summary: "A beauty and skincare brand focused on routines, results, and premium presentation.",
      story: "The store is built to support products that need explanation: cleansers, serums, masks, tools, and makeup essentials.",
      support: "Use this space to explain ingredients, texture, routine steps, and how each item fits into a daily regimen.",
      mission: "Make skincare and beauty shopping feel informed, reassuring, and aspirational.",
      features: [
        { icon: "sparkles", title: "Routine Guidance", desc: "Show where each product sits in a morning or evening routine." },
        { icon: "shield", title: "Ingredient Clarity", desc: "Highlight actives, sensitivities, and best-use notes." },
        { icon: "heart", title: "Skin First", desc: "Position the brand around care, confidence, and visible results." },
      ],
      team: [
        { name: "Beauty Advisor", role: "Routine Recommendations" },
        { name: "Content Lead", role: "Product Education" },
        { name: "Customer Care", role: "Orders & Shade Help" },
      ],
    },
    contact: {
      summary: "Get help choosing the right routine, shade, or product bundle.",
      intro: "A beauty contact page should feel like a consultation point, not a formality.",
      hours: "Monday - Saturday, 9:00 AM - 7:00 PM",
      faq: [
        { question: "Can you help me pick the right routine?", answer: "Yes. Tell us your skin type and goals and we will suggest a simple routine." },
        { question: "Do you offer shade matching?", answer: "Shade help can be handled by message or in-store consultation if available." },
        { question: "Are your products authentic?", answer: "Use this space to describe sourcing and authenticity guarantees." },
      ],
    },
    editorial: {
      summary: "Skin routines, ingredient notes, and product stories that read like a real beauty journal.",
      intro: "This page works well for routine guides, ingredient education, and new-drop announcements.",
      highlight: "Give each article a clear angle so it feels like editorial content rather than filler.",
    },
    commerce: {
      summary: "Feature your most requested skincare and makeup essentials with strong visuals and clear routine notes.",
      intro: "The page should explain why each product exists, how to use it, and what it pairs with.",
      delivery: "Beauty shoppers care about packaging and freshness, so call out fulfillment timing and secure packing.",
      faq: [
        { question: "Are samples available?", answer: "If you offer samples or minis, mention them here to reduce purchase hesitation." },
        { question: "Do you accept WhatsApp orders?", answer: "Yes. WhatsApp ordering makes it easier for customers to ask product questions first." },
      ],
    },
    policy: {
      summary: "Keep returns, hygiene policy, and shipping notes concise so beauty shoppers know exactly what applies.",
      intro: "This is where you clarify unopened-item returns, damaged-package handling, and shipping timelines.",
    },
  },
  grocery: {
    about: {
      summary: "A grocery store built around fresh produce, pantry essentials, and fast local delivery.",
      story: "The layout should feel practical and trustworthy, with product stories focused on freshness, availability, and weekly value.",
      support: "Use this page to explain sourcing, delivery coverage, and how customers can reorder essentials quickly.",
      mission: "Make everyday shopping quicker, clearer, and better organized.",
      features: [
        { icon: "truck", title: "Local Delivery", desc: "Show delivery windows and coverage zones clearly." },
        { icon: "check", title: "Fresh Stock", desc: "Call out daily replenishment and seasonal produce." },
        { icon: "credit-card", title: "Easy Checkout", desc: "Support card, transfer, or payment-on-delivery messaging where applicable." },
      ],
      team: [
        { name: "Store Manager", role: "Inventory & Merchandising" },
        { name: "Delivery Desk", role: "Dispatch & Tracking" },
        { name: "Customer Support", role: "Orders & Questions" },
      ],
    },
    contact: {
      summary: "Place bulk or repeat orders, ask about delivery zones, or confirm stock quickly.",
      intro: "A grocery contact page should help shoppers move fast from question to checkout.",
      hours: "Monday - Sunday, 8:00 AM - 8:00 PM",
      faq: [
        { question: "Do you deliver to my area?", answer: "List your delivery zones and same-day cut-off times here." },
        { question: "Can I order in bulk?", answer: "Yes. Use this page to explain case sizes, wholesale options, or office orders." },
        { question: "Is fresh produce replenished daily?", answer: "Explain your restocking rhythm and any market-day delivery schedule." },
      ],
    },
    editorial: {
      summary: "Cooking tips, meal inspiration, and seasonal shopping notes with a practical grocery tone.",
      intro: "Use this page for recipes, weekly specials, and useful shopping advice that feels genuinely helpful.",
      highlight: "Recipe content pairs well with category links, so shoppers can move directly from reading to buying.",
    },
    commerce: {
      summary: "Fresh staples, seasonal produce, and grocery essentials presented in a clean marketplace layout.",
      intro: "Keep the product grid focused on everyday needs, bulk value, and what is available right now.",
      delivery: "Display delivery cut-off times, packaging notes, and zone coverage near the top of the page.",
      faq: [
        { question: "Can I schedule repeat deliveries?", answer: "Use this section to describe recurring orders or weekly basket options." },
        { question: "Do you sell local produce?", answer: "Highlight farm-sourced items and regional suppliers where relevant." },
      ],
    },
    policy: {
      summary: "A short policy page for refunds, substitutions, and delivery rules.",
      intro: "Grocery customers mostly want clarity on missing items, substitutions, and delivery timing. Keep the copy direct.",
    },
  },
  health: {
    about: {
      summary: "A wellness-focused store built around supplements, daily routines, and informed guidance.",
      story: "The page should feel calm and trustworthy, with content that explains why each supplement exists and who it helps.",
      support: "Use the layout to explain ingredients, dosage, and how to shop for vitamins with confidence.",
      mission: "Help customers build healthy routines without confusion or hype.",
      features: [
        { icon: "shield", title: "Trusted Formulas", desc: "Explain sourcing, testing, and product quality clearly." },
        { icon: "heart", title: "Daily Wellness", desc: "Position the store around everyday energy, sleep, and balance." },
        { icon: "truck", title: "Simple Reorder", desc: "Make subscriptions and repeat purchases easy to understand." },
      ],
      team: [
        { name: "Wellness Advisor", role: "Product Education" },
        { name: "Operations Team", role: "Order Fulfilment" },
        { name: "Support Desk", role: "Customer Care" },
      ],
    },
    contact: {
      summary: "Ask about product suitability, ingredient questions, or order support.",
      intro: "This contact page should feel like a helpful point of contact for wellness guidance rather than a generic form.",
      hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
      faq: [
        { question: "Can you recommend a supplement routine?", answer: "Describe your needs and the team can suggest a simple starting point." },
        { question: "Do you offer bulk pricing?", answer: "Use this page to mention repeat-order or wholesale discounts if available." },
        { question: "How do I know what to take?", answer: "Always encourage shoppers to read labels and speak to a qualified professional when needed." },
      ],
    },
    editorial: {
      summary: "Practical health articles about sleep, vitamins, and everyday wellness habits.",
      intro: "Use this page for education-first content that helps visitors make informed choices.",
      highlight: "Keep the writing grounded, specific, and evidence-aware instead of salesy.",
    },
    commerce: {
      summary: "Featured vitamins and supplements organized for quick scanning and easy reordering.",
      intro: "Health shoppers need clarity, so the page should surface categories, benefits, and common questions.",
      delivery: "Mention shipping timelines and secure packaging to reassure customers buying wellness products online.",
      faq: [
        { question: "Are these products suitable for daily use?", answer: "Explain the intended use and encourage buyers to follow label guidance." },
        { question: "Can I buy in bundles?", answer: "Bundle offers work well for daily supplements and should be highlighted clearly." },
      ],
    },
    policy: {
      summary: "A careful policy page for returns, storage instructions, and ingredient questions.",
      intro: "Use short, specific language to keep the policy easy to scan for repeat shoppers.",
    },
  },
  kids: {
    about: {
      summary: "A playful kids store focused on comfort, safe materials, and easy parent shopping.",
      story: "The brand voice should feel warm, reassuring, and practical, with clear attention to sizing and everyday durability.",
      support: "Use the page to explain fabric quality, age ranges, and how the store helps parents shop quickly.",
      mission: "Make shopping for children feel joyful and easy to trust.",
      features: [
        { icon: "shield", title: "Safe Materials", desc: "Highlight soft fabrics, tested toys, and child-friendly details." },
        { icon: "truck", title: "Family Delivery", desc: "Make delivery windows and shipping options obvious for busy parents." },
        { icon: "heart", title: "Easy Gifting", desc: "Gift cards, bundles, and seasonal picks should be easy to find." },
      ],
      team: [
        { name: "Kids Buyer", role: "Product Selection" },
        { name: "Support Desk", role: "Sizing & Orders" },
        { name: "Dispatch Team", role: "Fast Packing" },
      ],
    },
    contact: {
      summary: "Ask about sizing, fabric care, gift orders, or stock availability.",
      intro: "A children’s store needs a friendly, plainspoken contact page that helps parents move quickly.",
      hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
      faq: [
        { question: "How do I choose the right size?", answer: "Share the child’s age or measurements and we can suggest the best fit." },
        { question: "Do you offer gift wrapping?", answer: "Mention any gift packaging or add-on options here." },
        { question: "Can I order by WhatsApp?", answer: "Yes. Many parents prefer a quick message before checking out." },
      ],
    },
    editorial: {
      summary: "Parent-friendly articles about care, play, and building a simple wardrobe.",
      intro: "This page works well for useful parenting tips, collection launches, and seasonal guidance.",
      highlight: "Keep the tone practical and reassuring so it feels genuinely helpful to families.",
    },
    commerce: {
      summary: "Soft essentials, toys, and giftable items presented in a bright, family-friendly layout.",
      intro: "Use product and category blocks to surface what parents actually look for: comfort, safety, and value.",
      delivery: "Mention parcel tracking, delivery cut-off times, and gift-note options where relevant.",
      faq: [
        { question: "Are the toys age appropriate?", answer: "Explain age ranges and safety notes for each toy collection." },
        { question: "Do you sell gift cards?", answer: "Highlight easy gifting options and how to send them." },
      ],
    },
    policy: {
      summary: "A short policy page that explains exchanges, care instructions, and delivery timing.",
      intro: "Parents appreciate clear, direct answers, so keep the language simple and specific.",
    },
  },
  bakery: {
    about: {
      summary: "A bakery and sweets brand built around celebration, freshness, and warm presentation.",
      story: "The page should feel handmade and inviting, with clear emphasis on ingredients, freshness, and special-order craftsmanship.",
      support: "Use the layout for story-led sections about process, celebration cakes, and daily bakes.",
      mission: "Create a bakery experience that feels personal, abundant, and easy to order from.",
      features: [
        { icon: "sparkles", title: "Fresh Bakes", desc: "Use the copy to point to same-day baking or limited daily batches." },
        { icon: "heart", title: "Celebration Ready", desc: "Birthdays, events, and custom orders should be easy to find." },
        { icon: "truck", title: "Local Delivery", desc: "Call out delivery slots and pickup options for custom cakes." },
      ],
      team: [
        { name: "Head Baker", role: "Recipe Development" },
        { name: "Cake Artist", role: "Custom Orders" },
        { name: "Front Counter", role: "Customer Support" },
      ],
    },
    contact: {
      summary: "Order cakes, confirm celebration details, or ask about same-day treats.",
      intro: "This contact page should support custom orders, pickup timing, and simple event coordination.",
      hours: "Monday - Sunday, 8:00 AM - 7:00 PM",
      faq: [
        { question: "Can I order a custom cake?", answer: "Yes. Describe the size, flavour, and date so we can confirm availability." },
        { question: "Do you take same-day orders?", answer: "If your kitchen supports it, mention the cut-off time here." },
        { question: "Can I reserve pastries?", answer: "Use this section to explain reservation or pre-order options." },
      ],
    },
    editorial: {
      summary: "Recipe notes, baking stories, and celebration ideas that make the bakery feel alive.",
      intro: "This page works well for seasonal specials, behind-the-scenes posts, and baking tutorials.",
      highlight: "Mix editorial posts with product stories so each article has a clear purpose.",
    },
    commerce: {
      summary: "Fresh pastries, cakes, and sweet treats shown in a warm, inviting storefront layout.",
      intro: "Use the product grid to surface daily specials, celebration cakes, and popular favourites.",
      delivery: "Mention same-day pickup, order timing, and packaging notes where appropriate.",
      faq: [
        { question: "Do you do custom inscriptions?", answer: "Explain how customers can leave notes for birthday or event cakes." },
        { question: "Can I order in bulk?", answer: "Bulk tray orders and event catering can be described here." },
      ],
    },
    policy: {
      summary: "A short policy page for cake deposits, order changes, and freshness expectations.",
      intro: "Make the rules easy to read so special-order customers know what applies before they pay.",
    },
  },
  interior: {
    about: {
      summary: "An interior and decor brand focused on calm rooms, natural textures, and intentional styling.",
      story: "The store should feel like a design studio: carefully lit, editorial, and rich with texture instead of generic.",
      support: "Use the page to tell the story behind your materials, makers, and room-based collections.",
      mission: "Help customers build homes that feel calm, layered, and personal.",
      features: [
        { icon: "sparkles", title: "Curated Rooms", desc: "Group products by room or mood so the collection feels designed." },
        { icon: "heart", title: "Natural Materials", desc: "Explain the story behind wood, linen, ceramic, and woven textures." },
        { icon: "truck", title: "Careful Delivery", desc: "Highlight handling notes for fragile, oversized, or made-to-order pieces." },
      ],
      team: [
        { name: "Design Lead", role: "Collection Curation" },
        { name: "Operations", role: "Delivery & Logistics" },
        { name: "Style Advisor", role: "Customer Support" },
      ],
    },
    contact: {
      summary: "Ask about room styling, delivery for large items, or custom sourcing.",
      intro: "A decor contact page should be calm, elegant, and practical for both retail and project enquiries.",
      hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
      faq: [
        { question: "Can you help with room styling?", answer: "Yes. Share the room, dimensions, and style direction so we can help." },
        { question: "Do you deliver fragile items?", answer: "Explain your packaging standards and delivery partners here." },
        { question: "Can I order a custom piece?", answer: "If custom sourcing is available, describe the process in clear steps." },
      ],
    },
    editorial: {
      summary: "Decor ideas, styling advice, and home stories that match the original demo’s editorial tone.",
      intro: "Use this page for styling guides, project stories, and new collection updates.",
      highlight: "Interior content works best when the imagery and copy feel like a design magazine spread.",
    },
    commerce: {
      summary: "Furniture and decor presented in a room-led layout that makes products feel styled, not stocky.",
      intro: "The goal is to show how each item lives in a room rather than just listing it in a grid.",
      delivery: "Clarify delivery for large pieces and fragile items right beside the primary call to action.",
      faq: [
        { question: "Do you assemble furniture?", answer: "If assembly is offered, explain whether it is included or optional." },
        { question: "Can I reserve stock?", answer: "Use this section for stock holds or project order notes." },
      ],
    },
    policy: {
      summary: "A concise policy page for returns, lead times, and shipping expectations.",
      intro: "Keep policy copy simple so customers can understand the rules for larger home goods purchases.",
    },
  },
  perfumes: {
    about: {
      summary: "A fragrance brand focused on character, layering, and thoughtful scent discovery.",
      story: "The page should feel luxurious and editorial, with copy that explains scent families, bottle stories, and the mood behind each collection.",
      support: "Use the layout to guide shoppers toward the right note profile instead of generic product copy.",
      mission: "Help each customer find a scent that feels personal and memorable.",
      features: [
        { icon: "sparkles", title: "Scent Families", desc: "Help shoppers browse floral, woody, amber, and fresh profiles." },
        { icon: "heart", title: "Signature Picks", desc: "Position hero fragrances as wardrobe essentials rather than random stock." },
        { icon: "shield", title: "Careful Shipping", desc: "Mention bottle protection and careful packing for fragile fragrance orders." },
      ],
      team: [
        { name: "Fragrance Editor", role: "Scent Curation" },
        { name: "Retail Lead", role: "Orders & Dispatch" },
        { name: "Advisor", role: "Scent Matching" },
      ],
    },
    contact: {
      summary: "Ask for scent guidance, gift recommendations, or order support.",
      intro: "Fragrance shoppers often need help choosing a signature scent, so the contact page should feel consultative.",
      hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
      faq: [
        { question: "Can you help me choose a scent?", answer: "Yes. Share the notes you like and we can suggest options." },
        { question: "Do you offer gift wrapping?", answer: "If gift packaging is available, mention it clearly here." },
        { question: "Can I reorder a scent I liked?", answer: "Use this section to explain how to find previous purchases or favourites." },
      ],
    },
    editorial: {
      summary: "A fragrance journal with scent notes, collection stories, and quiet luxury copy.",
      intro: "This page should read like a perfume journal: polished, descriptive, and easy to skim.",
      highlight: "Good fragrance writing describes mood, texture, and occasion instead of repeating the same adjective.",
    },
    commerce: {
      summary: "Featured fragrances and discovery sets displayed with a premium, gallery-like layout.",
      intro: "Make the product grid feel like a discovery wall by using strong imagery and concise note-based copy.",
      delivery: "Mention protective packaging and careful dispatch for fragile bottles.",
      faq: [
        { question: "Do you sell samples?", answer: "If discovery sets exist, surface them here to reduce hesitation." },
        { question: "How do I choose between families?", answer: "Keep a short guide to floral, woody, amber, and fresh scents." },
      ],
    },
    policy: {
      summary: "A clean policy page for returns, gift rules, and bottle handling.",
      intro: "Keep fragrance policies simple so customers know what applies to unopened bottles and gift orders.",
    },
  },
  generic: {
    about: {
      summary: "A fully editable brand story page that introduces the business with real copy and structured sections.",
      story: "Use this page to explain what the business does, who it serves, and what makes it different.",
      support: "Replace this content with brand-specific details, but keep the structure clear and useful.",
      mission: "Make the business feel credible and easy to understand.",
      features: [
        { icon: "sparkles", title: "Clear Story", desc: "Summarize the brand in plain language." },
        { icon: "shield", title: "Trust", desc: "Share proof points, service notes, or guarantees." },
        { icon: "truck", title: "Delivery", desc: "Explain how orders or enquiries are handled." },
      ],
      team: [
        { name: "Founder", role: "Leadership" },
        { name: "Operations", role: "Fulfilment" },
        { name: "Support", role: "Customer Care" },
      ],
    },
    contact: {
      summary: "A direct contact page with clear support details and a simple message form.",
      intro: "Use this page to help customers reach the right person quickly.",
      hours: "Monday - Friday, 9:00 AM - 5:00 PM",
      faq: [
        { question: "How fast do you reply?", answer: "Add your real response window here." },
        { question: "What channel should I use?", answer: "List phone, email, and WhatsApp as appropriate." },
        { question: "Do you offer business support?", answer: "Add relevant contact or booking notes here." },
      ],
    },
    editorial: {
      summary: "A practical editorial page for updates, stories, announcements, and helpful guides.",
      intro: "Keep the article tone specific to the business instead of filling the page with filler text.",
      highlight: "Each post should point to a clear customer question, product launch, or brand update.",
    },
    commerce: {
      summary: "A clean shopping page with featured products, trust signals, and a clear call to action.",
      intro: "Use this layout when the page should sell a collection or highlight a core category.",
      delivery: "Add shipping, pickup, or service coverage details that match the business model.",
      faq: [
        { question: "How do customers order?", answer: "Explain the purchase or enquiry flow clearly." },
        { question: "Can I pay by WhatsApp?", answer: "Use this section to document any assisted checkout process." },
      ],
    },
    policy: {
      summary: "A short, clear policy page for shipping, returns, and customer support.",
      intro: "Replace this with the real policy copy, but keep the structure readable and specific.",
    },
  },
};

function slugToLabel(slug: string) {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createBlock<T extends BlockType>(type: T, overrides: Record<string, unknown> = {}): BuilderBlock {
  return {
    id: crypto.randomUUID(),
    type,
    props: {
      ...blockDefaults[type](),
      ...overrides,
    },
  };
}

function createRawBlock(type: string, overrides: Record<string, unknown> = {}): BuilderBlock {
  return {
    id: crypto.randomUUID(),
    type: type as BlockType,
    props: {
      ...overrides,
    },
  };
}

function createColumnsBlock(left: string, right: string): BuilderBlock {
  return createBlock("columns", {
    columns: 2,
    gap: 5,
    children: [
      { id: crypto.randomUUID(), type: "text", props: { ...blockDefaults.text(), text: left } },
      { id: crypto.randomUUID(), type: "text", props: { ...blockDefaults.text(), text: right } },
    ],
  });
}

function getTemplateFamily(templateSlug: string): TemplateFamily {
  const slug = templateSlug.toLowerCase();
  if (slug.startsWith("fashion") || slug === "handmade-bags" || slug === "t-shirts-prints" || slug === "jewellery" || slug === "jewellery-elegance") return "fashion";
  if (slug.startsWith("electronics") || slug === "hardware" || slug === "hardware-pro" || slug === "tools") return "electronics";
  if (slug === "cosmetics" || slug === "makeup" || slug.includes("beauty") || slug === "bistro" || slug === "bakery" || slug === "sweets-bakery") return "bakery";
  if (slug === "grocery" || slug === "vegetables" || slug === "grocery-market") return "grocery";
  if (slug === "health" || slug === "pills" || slug === "strada") return "health";
  if (slug === "kids" || slug === "toys" || slug === "children") return "kids";
  if (slug === "interior" || slug === "decor" || slug === "retail" || slug === "interior-design" || slug === "home-decor") return "interior";
  if (slug === "perfumes") return "perfumes";
  return "generic";
}

function buildAboutLayout(title: string, family: TemplateFamily): BuilderBlock[] {
  const copy = FAMILY_COPY[family].about;

  if (family === "health") {
    return [
      createRawBlock("healthAboutPage", {
        heroTitle: title,
        heroSubtitle: copy.summary,
        storyTitle: "Our Story",
        storyText: copy.story,
        missionTitle: "Our Mission",
        missionText: copy.mission,
        features: copy.features.map((f) => ({ icon: f.icon === "shield" ? "🛡️" : f.icon === "heart" ? "💚" : "🚚", title: f.title, description: f.desc })),
        teamTitle: "Our Team",
        teamSubtitle: "Meet the people behind the brand",
        team: copy.team.map((m) => ({ name: m.name, role: m.role })),
      }),
    ];
  }

  if (family === "interior") {
    return [
      createRawBlock("gardenAboutPage", {
        heading: title,
        text: copy.story,
        image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=600&fit=crop",
        values: copy.features.map((feature) => ({ title: feature.title, description: feature.desc })),
      }),
      createRawBlock("interiorInfoBoxes", {
        items: copy.features.map((feature) => ({ icon: "✨", title: feature.title, description: feature.desc })),
      }),
      createBlock("newsletter", {
        title: "Stay close to the collection",
        subtitle: "Hear about room drops, styling notes, and new arrivals first.",
      }),
    ];
  }

  return [
    createBlock("hero", {
      heading: title,
      subheading: copy.summary,
      buttonText: "Explore more",
      buttonHref: "#story",
      bgColor: "var(--afro-brand-primary, #1b2b4b)",
      textColor: "var(--afro-brand-on-primary, #ffffff)",
      align: "center",
    }),
    createColumnsBlock(copy.story, copy.support),
    createBlock("imageText", {
      title: "Our Story",
      text: copy.mission,
      badge: "About",
      reverse: false,
      buttonText: "Learn more",
      buttonHref: "#story",
    }),
    createBlock("features", {
      title: "Why customers choose us",
      items: copy.features,
    }),
    createBlock("team", {
      title: "Meet the team",
      subtitle: "Introduce the people behind the brand.",
      members: copy.team,
    }),
    createBlock("newsletter", {
      title: "Stay in the loop",
      subtitle: "Invite visitors to subscribe for updates, offers, or announcements.",
      bgColor: "var(--afro-surface-100, #f5f5f4)",
    }),
  ];
}

function buildContactLayout(title: string, family: TemplateFamily): BuilderBlock[] {
  const copy = FAMILY_COPY[family].contact;

  if (family === "health") {
    return [
      createRawBlock("healthContactPage", {
        heroTitle: title,
        heroSubtitle: copy.summary,
        hours: copy.hours,
        faqTitle: "Frequently Asked Questions",
        faqs: copy.faq,
      }),
    ];
  }

  if (family === "interior") {
    return [
      createRawBlock("gardenContactPage", {
        heading: title,
        description: copy.summary,
        address: "123/B, Route 66, Downtown, Washington, US",
        phone: "(064) 332-1233",
        email: "hello@example.com",
      }),
      createBlock("faq", {
        title: "Common questions",
        items: copy.faq,
      }),
    ];
  }

  return [
    createBlock("hero", {
      heading: title,
      subheading: copy.summary,
      buttonText: "Get in touch",
      buttonHref: "#contact-form",
      bgColor: "var(--afro-brand-primary, #1b2b4b)",
      textColor: "var(--afro-brand-on-primary, #ffffff)",
      align: "center",
    }),
    createColumnsBlock(copy.intro, `Our team is available ${copy.hours}. Use this space for store hours, WhatsApp support, or short service notes.`),
    createBlock("contactInfo", {
      title: "Contact information",
      hours: copy.hours,
    }),
    createBlock("contactForm", {
      title: "Send us a message",
      subtitle: "We will reply as soon as possible.",
      buttonText: "Send message",
    }),
    createBlock("faq", {
      title: "Common questions",
      items: copy.faq,
    }),
    createBlock("newsletter", {
      title: "Never miss updates",
      subtitle: "Keep visitors connected to promotions, launches, and service updates.",
    }),
  ];
}

function buildEditorialLayout(title: string, family: TemplateFamily): BuilderBlock[] {
  const copy = FAMILY_COPY[family].editorial;

  if (family === "health") {
    return [
      createRawBlock("healthBlogPage", {
        heroTitle: title,
        heroSubtitle: copy.summary,
      }),
    ];
  }

  return [
    createBlock("hero", {
      heading: title,
      subheading: copy.summary,
      buttonText: "Read more",
      buttonHref: "#content",
      bgColor: "var(--afro-brand-primary, #1b2b4b)",
      textColor: "var(--afro-brand-on-primary, #ffffff)",
      align: "center",
    }),
    createBlock("heading", {
      text: "Featured story",
      level: "h2",
      align: "left",
      color: "var(--afro-surface-900, #111827)",
    }),
    createBlock("text", {
      text: copy.intro,
      color: "var(--afro-surface-600, #525252)",
    }),
    createBlock("gallery", {
      title: "Visual highlights",
      images: [
        { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop", alt: "Editorial image 1" },
        { src: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&h=600&fit=crop", alt: "Editorial image 2" },
        { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop", alt: "Editorial image 3" },
      ],
    }),
    createBlock("testimonials", {
      title: "What readers are saying",
      subtitle: copy.highlight,
    }),
    createBlock("newsletter", {
      title: "Subscribe for updates",
      subtitle: "Turn visitors into subscribers with a simple signup section.",
    }),
  ];
}

function buildCommerceLayout(title: string, family: TemplateFamily): BuilderBlock[] {
  const copy = FAMILY_COPY[family].commerce;
  return [
    createBlock("hero", {
      heading: title,
      subheading: copy.summary,
      buttonText: "Shop now",
      buttonHref: "#products",
      bgColor: "var(--afro-brand-primary, #1b2b4b)",
      textColor: "var(--afro-brand-on-primary, #ffffff)",
      align: "center",
    }),
    createBlock("productGrid", {
      title: "Featured products",
      columns: 3,
      limit: 6,
      showPrice: true,
      category: "",
    }),
    createColumnsBlock(copy.intro, copy.delivery),
    createBlock("features", {
      title: "Why shop with us",
      items: [
        { icon: "truck", title: "Fast delivery", desc: copy.delivery },
        { icon: "shield", title: "Secure checkout", desc: "Describe payment and trust details here." },
        { icon: "refresh", title: "Easy returns", desc: "Explain your returns or exchange policy." },
      ],
    }),
    createBlock("faq", {
      title: "Frequently asked questions",
      items: copy.faq,
    }),
    createBlock("newsletter", {
      title: "Join our mailing list",
      subtitle: "Promote offers, product drops, or restocks.",
    }),
  ];
}

function buildPolicyLayout(title: string, family: TemplateFamily): BuilderBlock[] {
  const copy = FAMILY_COPY[family].policy;
  return [
    createBlock("hero", {
      heading: title,
      subheading: copy.summary,
      buttonText: "Read policy",
      buttonHref: "#policy",
      bgColor: "var(--afro-surface-900, #111827)",
      textColor: "var(--afro-brand-on-primary, #ffffff)",
      align: "center",
    }),
    createBlock("heading", {
      text: "Policy details",
      level: "h2",
      color: "var(--afro-surface-900, #111827)",
    }),
    createBlock("text", {
      text: copy.intro,
      color: "var(--afro-surface-600, #525252)",
    }),
    createBlock("faq", {
      title: "Need help understanding this policy?",
      items: [
        { question: "Who can I contact?", answer: "Add your support contact details here." },
        { question: "When was this updated?", answer: "Use this space to note the effective date." },
      ],
    }),
    createBlock("contactInfo", {
      title: "Need further assistance?",
    }),
  ];
}

function buildUtilityLayout(title: string, family: TemplateFamily, pageSlug: string): BuilderBlock[] {
  const copy = FAMILY_COPY[family];
  const normalizedSlug = pageSlug.toLowerCase();
  const isCollectionPage = ["shop", "new-in", "bestseller", "fragrances", "skincare", "menu", "recipe", "products", "catalog", "store", "journal", "blog", "reservations", "gallery", "departments", "doctors", "appointment", "contractor-program", "inspiration", "collections", "deals", "categories", "courses", "instructors", "destinations", "experiences"].includes(normalizedSlug);

  const headlineMap: Record<string, { summary: string; intro: string; features: Array<{ icon: string; title: string; desc: string }> }> = {
    cart: {
      summary: "A quick review area for items, quantities, delivery notes, and payment confidence before checkout.",
      intro: "Use this space to remind customers what is in their basket, how delivery works, and what happens next after payment.",
      features: [
        { icon: "shopping-bag", title: "Review items", desc: "Summarize what shoppers have chosen before they move to checkout." },
        { icon: "truck", title: "Delivery clarity", desc: "Surface shipping windows, pickup options, and any local delivery rules." },
        { icon: "credit-card", title: "Simple payment", desc: "Explain which payment methods are available without clutter." },
      ],
    },
    wishlist: {
      summary: "A focused page for saved items, future purchases, and returning shoppers who want to keep browsing later.",
      intro: "Keep the messaging light and practical. This page should help customers save products, compare options, and continue shopping when ready.",
      features: [
        { icon: "heart", title: "Saved products", desc: "Explain how shoppers can return to favorite items quickly." },
        { icon: "sparkles", title: "Curated picks", desc: "Highlight featured products or collections worth revisiting." },
        { icon: "shopping-bag", title: "Back to shop", desc: "Offer a clear path back into the catalog or latest arrivals." },
      ],
    },
    compare: {
      summary: "A comparison page that helps customers weigh features, prices, and purchase confidence across products.",
      intro: "Use concise comparison copy, practical specs, and clear CTAs so shoppers can choose between similar products without confusion.",
      features: [
        { icon: "target", title: "Side-by-side view", desc: "Compare the most important product details without noise." },
        { icon: "shield", title: "Confidence", desc: "Explain warranties, materials, ingredients, or care notes where relevant." },
        { icon: "refresh", title: "Easy switching", desc: "Let customers change their mind without starting over." },
      ],
    },
    "my-account": {
      summary: "A customer account page for tracking orders, managing addresses, and keeping preferences in one place.",
      intro: "Set expectations for login, order history, saved addresses, and account support so the page feels useful rather than empty.",
      features: [
        { icon: "users", title: "Profile details", desc: "Help customers manage their name, contact info, and saved addresses." },
        { icon: "package", title: "Orders", desc: "Explain how to review order history and delivery status." },
        { icon: "lock", title: "Secure access", desc: "Mention privacy and account recovery options clearly." },
      ],
    },
    "order-tracking": {
      summary: "A tracking page that gives buyers a direct route to check delivery progress and fulfillment updates.",
      intro: "Keep tracking instructions visible, simple, and specific so customers know exactly where to find their order status.",
      features: [
        { icon: "truck", title: "Live progress", desc: "Summarize the main shipping milestones or courier updates." },
        { icon: "clock", title: "Fast lookup", desc: "Guide shoppers toward the order number or phone number they need." },
        { icon: "headphones", title: "Help desk", desc: "Offer support if tracking details are missing or delayed." },
      ],
    },
    faq: {
      summary: "A compact FAQ page that answers the questions shoppers ask before they buy.",
      intro: "Keep answers direct and practical. This is where you handle shipping, payments, returns, and product-specific concerns.",
      features: [
        { icon: "help-circle", title: "Quick answers", desc: "Short responses make scanning easier on mobile." },
        { icon: "shield", title: "Trust building", desc: "Clarify policies, authenticity, or warranties." },
        { icon: "message-circle", title: "Support route", desc: "Send shoppers to live help when a question needs human attention." },
      ],
    },
  };

  const collectionCopy = headlineMap[normalizedSlug] || {
    summary: copy.commerce.summary,
    intro: copy.commerce.intro,
    features: [
      { icon: "truck", title: "Fast fulfilment", desc: copy.commerce.delivery },
      { icon: "shield", title: "Trust signals", desc: "Add guarantees, sourcing notes, or quality assurances." },
      { icon: "sparkles", title: "Fresh selection", desc: "Highlight new arrivals, featured products, or seasonal picks." },
    ],
  };

  const blocks: BuilderBlock[] = [
    createBlock("hero", {
      heading: title,
      subheading: collectionCopy.summary,
      buttonText: isCollectionPage ? "Browse collection" : "Continue",
      buttonHref: isCollectionPage ? "#products" : "#content",
      bgColor: "var(--afro-brand-primary, #1b2b4b)",
      textColor: "var(--afro-brand-on-primary, #ffffff)",
      align: "center",
    }),
    createColumnsBlock(collectionCopy.intro, family === "fashion" ? copy.commerce.delivery : copy.about.story),
    createBlock("productGrid", {
      title: isCollectionPage ? title : "Featured products",
      columns: 3,
      limit: 6,
      showPrice: true,
      category: normalizedSlug === "shop" ? "" : normalizedSlug,
    }),
    createBlock("features", {
      title: "Why this page matters",
      items: collectionCopy.features,
    }),
    createBlock("faq", {
      title: "Common questions",
      items: [
        { question: "Can this page be customized?", answer: "Yes. Every block, image, and text area is editable from the builder." },
        { question: "Does theme styling still apply?", answer: "Yes. Global theme changes are layered on top of this page content cleanly." },
        { question: "Can I reorder sections?", answer: "Yes. Blocks can be reordered, duplicated, or removed at any time." },
      ],
    }),
  ];

  if (normalizedSlug === "wishlist" || normalizedSlug === "cart" || normalizedSlug === "compare" || normalizedSlug === "my-account" || normalizedSlug === "order-tracking") {
    blocks.push(
      createBlock("contactInfo", {
        title: "Need help?",
        hours: copy.contact.hours,
      }),
    );
  }

  blocks.push(
    createBlock("newsletter", {
      title: "Stay connected",
      subtitle: "Use this space for offers, restocks, or service updates.",
    }),
  );

  return blocks;
}

function createGenericLayout(title: string, family: TemplateFamily): BuilderBlock[] {
  const copy = FAMILY_COPY[family].about;
  return [
    createBlock("hero", {
      heading: title,
      subheading: copy.summary,
      buttonText: "Edit page",
      buttonHref: "#content",
      bgColor: "var(--afro-brand-primary, #1b2b4b)",
      textColor: "var(--afro-brand-on-primary, #ffffff)",
      align: "center",
    }),
    createColumnsBlock(copy.story, copy.support),
    createBlock("imageText", {
      title: "Section highlight",
      text: copy.mission,
      badge: "Editable",
    }),
    createBlock("newsletter", {
      title: "Stay connected",
      subtitle: "Use this section for email capture or announcements.",
    }),
  ];
}

export function buildDefaultPageContent(context: DefaultPageContentContext): PageContentDocument {
  const title = context.pageTitle?.trim() || slugToLabel(context.pageSlug);
  const slug = context.pageSlug.toLowerCase();
  const templateSlug = (context.templateSlug || "").toLowerCase();
  const type = (context.pageType || "").toUpperCase();
  const family = getTemplateFamily(templateSlug);

  if (["about", "about-us", "our-story", "story", "company"].includes(slug) || type === "ABOUT") {
    return { blocks: buildAboutLayout(title, family), settings: {} };
  }

  if (["contact", "contact-us", "support", "help"].includes(slug) || type === "CONTACT") {
    return { blocks: buildContactLayout(title, family), settings: {} };
  }

  if (["blog", "journal", "news", "updates", "reviews"].includes(slug)) {
    return { blocks: buildEditorialLayout(title, family), settings: {} };
  }

  if (slug === "ingredients" && family === "health") {
    return { blocks: [createRawBlock("healthIngredientsPage", {})], settings: {} };
  }

  if (["shop", "products", "catalog", "store", "new-in", "bestseller", "wishlist", "cart", "compare", "my-account", "order-tracking", "faq", "support", "fragrances", "skincare", "menu", "recipe", "projects", "services", "blog", "journal", "reservations", "gallery", "departments", "doctors", "appointment", "contractor-program", "inspiration", "collections", "deals", "categories", "courses", "instructors", "destinations", "experiences"].includes(slug)) {
    return { blocks: buildUtilityLayout(title, family, slug), settings: {} };
  }

  if (["menu", "recipe", "recipes", "fragrances", "shop", "products", "catalog", "store", "reservations", "gallery", "departments", "doctors", "appointment", "contractor-program", "inspiration", "collections", "deals", "categories", "courses", "instructors", "destinations", "experiences"].includes(slug)) {
    return { blocks: buildCommerceLayout(title, family), settings: {} };
  }

  if (["terms", "terms-of-service", "privacy", "policy", "refunds", "shipping"].includes(slug) || type === "POLICY") {
    return { blocks: buildPolicyLayout(title, family), settings: {} };
  }

  return { blocks: createGenericLayout(title, family), settings: {} };
}

export function ensurePageContentDocument(content: unknown, context: DefaultPageContentContext): PageContentDocument {
  const parsed = parsePageContent(content, context.templateSlug, context.pageSlug);

  if (context.templateSlug && isBespokeTemplateSlug(context.templateSlug)) {
    return parsed;
  }

  const built = buildDefaultPageContent(context);

  if (parsed.blocks.length === 0) {
    return built;
  }

  return pickRicherPageDocument(parsed, built);
}

export function buildDefaultPageContentJson(context: DefaultPageContentContext): Record<string, unknown> {
  return serializePageContent(buildDefaultPageContent(context));
}
