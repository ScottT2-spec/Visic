/**
 * AI Store Generator
 *
 * WordPress-style AI site builder. Given a business type, name, and description,
 * generates a complete set of store pages (Home, About, FAQ, Contact, Policies)
 * using the page builder block system.
 *
 * The AI generates the content; this module structures it into builder blocks
 * and persists the pages to the database.
 */

import { prisma } from "@/lib/db";
import { AIFailover } from "@/lib/failover";
import type { AIProviderConfig } from "@/lib/failover";
import { AICapability } from "@/lib/failover";
import type { BuilderBlock, BlockType } from "@/lib/builder/types";
import { detectIndustry, getRandomIndustryImages } from "@/lib/ai-image-pools";

// ─── Types ──────────────────────────────────────────────────

export interface StoreGeneratorInput {
  siteId: string;
  storeSlug: string;
  storeName: string;
  businessType: string;
  description?: string;
  country?: string;
  currency?: string;
}

/** Randomized image set for this store generation run */
interface StoreImages {
  hero: string;
  about: string;
  lifestyle: string;
  showcase: string[];
  banner: string;
}

export interface GeneratedPage {
  title: string;
  slug: string;
  type: "HOME" | "ABOUT" | "CONTACT" | "FAQ" | "POLICY" | "CUSTOM";
  blocks: BuilderBlock[];
  metaTitle: string;
  metaDescription: string;
}

export interface StoreGeneratorResult {
  pages: Array<{ id: string; title: string; slug: string; type: string }>;
  provider: string;
  model: string;
}

// ─── AI Provider setup (reuses same env vars as ai-service) ─

let aiFailover: AIFailover | null = null;

function getAIProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [];

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o",
      fallbackModels: ["gpt-4o-mini"],
      capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING],
    });
  }
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      provider: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-5-sonnet-20241022",
      fallbackModels: ["claude-3-haiku-20240307"],
      capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING],
    });
  }
  if (process.env.GOOGLE_AI_KEY) {
    providers.push({
      provider: "google",
      apiKey: process.env.GOOGLE_AI_KEY,
      model: "gemini-1.5-pro",
      fallbackModels: ["gemini-1.5-flash"],
      capabilities: [AICapability.CHAT, AICapability.FUNCTION_CALLING],
    });
  }
  // Register all available Groq keys as separate providers for rate-limit failover
  const groqKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_KEY_2,
    process.env.GROQ_KEY_3,
    process.env.GROQ_KEY_4,
  ].filter(Boolean) as string[];

  groqKeys.forEach((key, i) => {
    providers.push({
      provider: i === 0 ? "groq" : `groq_${i + 1}`,
      apiKey: key,
      model: "llama-3.3-70b-versatile",
      capabilities: [AICapability.CHAT],
    });
  });
  if (process.env.DEEPSEEK_API_KEY) {
    providers.push({
      provider: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: "deepseek-chat",
      capabilities: [AICapability.CHAT],
    });
  }
  return providers;
}

function getAI(): AIFailover {
  if (!aiFailover) {
    const providers = getAIProviders();
    if (providers.length === 0) {
      throw new Error("No AI providers configured");
    }
    aiFailover = new AIFailover({
      providers,
      priorityOrder: ["openai", "anthropic", "google", "groq", "groq_2", "groq_3", "groq_4", "deepseek"],
      circuitBreaker: { failureThreshold: 3, recoveryTimeoutMs: 30_000 },
      healthCheckIntervalMs: 0,
      requestTimeoutMs: 90_000, // longer timeout for generation
    });
  }
  return aiFailover;
}

// ─── Helpers ────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

function block(type: BlockType, props: Record<string, unknown>): BuilderBlock {
  return { id: uid(), type, props };
}

// ─── Prompt ─────────────────────────────────────────────────

function buildGenerationPrompt(input: StoreGeneratorInput): string {
  const currency = input.currency || "GHS";
  const country = input.country || "Ghana";

  return `You are a professional ecommerce website content writer for African businesses.

Generate complete website content for this store:
- Store name: "${input.storeName}"
- Business type: ${input.businessType}
- Description: ${input.description || "Not provided"}
- Country: ${country}
- Currency: ${currency}

Generate content for these 5 pages as a JSON object. Be specific to this business — no generic placeholder text. Write like a real brand, warm and professional. Tailor to the African market (mention local delivery, local payment methods like bank transfer/Paystack, WhatsApp ordering, etc where relevant).

Return ONLY valid JSON with this exact structure:
{
  "brand": {
    "tagline": "short catchy tagline for the hero",
    "heroHeading": "compelling hero headline (max 10 words)",
    "heroSubheading": "1-2 sentence value proposition",
    "ctaText": "call to action button text (2-4 words)"
  },
  "about": {
    "headline": "about page headline",
    "story": "2-3 paragraph brand story (use \\n\\n between paragraphs)",
    "values": [
      {"title": "value 1 name", "desc": "1 sentence description"},
      {"title": "value 2 name", "desc": "1 sentence description"},
      {"title": "value 3 name", "desc": "1 sentence description"}
    ]
  },
  "faq": {
    "items": [
      {"question": "question 1", "answer": "detailed answer"},
      {"question": "question 2", "answer": "detailed answer"},
      {"question": "question 3", "answer": "detailed answer"},
      {"question": "question 4", "answer": "detailed answer"},
      {"question": "question 5", "answer": "detailed answer"},
      {"question": "question 6", "answer": "detailed answer"}
    ]
  },
  "policies": {
    "shipping": "2-3 paragraph shipping policy",
    "returns": "2-3 paragraph return/refund policy",
    "privacy": "2-3 paragraph privacy policy summary"
  },
  "contact": {
    "headline": "contact page headline",
    "subtitle": "1 sentence encouraging contact"
  },
  "seo": {
    "homeTitle": "SEO title for home page (50-60 chars)",
    "homeDesc": "SEO meta description for home (150-160 chars)",
    "aboutTitle": "SEO title for about page",
    "aboutDesc": "SEO meta description for about",
    "faqTitle": "SEO title for FAQ page",
    "faqDesc": "SEO meta description for FAQ",
    "contactTitle": "SEO title for contact page",
    "contactDesc": "SEO meta description for contact"
  },
  "testimonials": [
    {"name": "customer name", "text": "realistic testimonial quote", "role": "e.g. Verified Buyer"},
    {"name": "customer name", "text": "realistic testimonial quote", "role": "e.g. Repeat Customer"},
    {"name": "customer name", "text": "realistic testimonial quote", "role": "e.g. First-time Buyer"}
  ],
  "features": [
    {"title": "feature/benefit 1", "desc": "short description"},
    {"title": "feature/benefit 2", "desc": "short description"},
    {"title": "feature/benefit 3", "desc": "short description"}
  ]
}

Rules:
- Use real-sounding Ghanaian/African names for testimonials
- Make FAQ answers specific to ${input.businessType} businesses
- Shipping policy should mention Accra, Kumasi, and nationwide delivery
- Payment section should reference bank transfer, card payment, and pay-on-delivery
- Keep tone warm, confident, and trustworthy
- NO placeholder brackets like [Your Name] — write real content
- Return ONLY the JSON, no markdown fences, no explanation`;
}

// ─── Parse AI response ──────────────────────────────────────

function parseAIResponse(content: string): Record<string, any> {
  // Strip markdown code fences if present
  let cleaned = content.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return JSON.parse(cleaned);
}

// ─── Build pages from AI content ────────────────────────────

function buildHomePage(data: Record<string, any>, storeName: string, storeSlug: string, images: StoreImages): GeneratedPage {
  const brand = data.brand || {};
  const features = data.features || [];
  const testimonials = data.testimonials || [];

  const featureIcons = ["truck", "shield", "headphones", "zap", "heart", "award", "globe", "rocket"];

  const blocks: BuilderBlock[] = [
    // Premium Hero with industry-specific background
    block("hero", {
      heading: brand.heroHeading || `Welcome to ${storeName}`,
      subheading: brand.heroSubheading || brand.tagline || "Discover amazing products",
      buttonText: brand.ctaText || "Shop Now",
      buttonHref: `/store/${storeSlug}/shop`,
      secondaryButtonText: "Learn More",
      secondaryButtonHref: `/store/${storeSlug}/about`,
      badge: brand.tagline || `✨ Welcome to ${storeName}`,
      bgStyle: "image",
      backgroundImage: images.hero,
      align: "center",
    }),
    block("spacer", { height: 56 }),

    // Stats
    block("stats", {
      bgColor: "brand",
      items: [
        { value: "1,000+", label: "Happy Customers", icon: "users" },
        { value: "500+", label: "Products", icon: "package" },
        { value: "4.9", label: "Customer Rating", icon: "star" },
        { value: "24/7", label: "Support", icon: "headphones" },
      ],
    }),
    block("spacer", { height: 56 }),

    // Featured products
    block("productGrid", {
      title: "Our Products",
      subtitle: "Handpicked just for you",
      columns: 3,
      limit: 6,
      showPrice: true,
      category: "",
    }),
    block("spacer", { height: 56 }),

    // Features / Why choose us
    block("features", {
      title: "Why Choose Us",
      subtitle: "Here's what makes us different",
      bgColor: "surface",
      items: features.length >= 3
        ? features.slice(0, 4).map((f: any, i: number) => ({
            icon: featureIcons[i % featureIcons.length],
            title: f.title,
            desc: f.desc,
          }))
        : [
            { icon: "truck", title: "Fast Delivery", desc: "Swift delivery across Ghana" },
            { icon: "shield", title: "Secure Payments", desc: "Pay with card, bank transfer, or on delivery" },
            { icon: "headphones", title: "24/7 Support", desc: "Reach us anytime on WhatsApp" },
            { icon: "refresh", title: "Easy Returns", desc: "Hassle-free returns within 7 days" },
          ],
    }),
    block("spacer", { height: 56 }),
  ];

  // Testimonials grid (not individual cards)
  if (testimonials.length > 0) {
    blocks.push(
      block("testimonials", {
        title: "What Our Customers Say",
        subtitle: "Real reviews from real customers",
        bgColor: "transparent",
        items: testimonials.slice(0, 3).map((t: any) => ({
          name: t.name,
          role: t.role || "Verified Buyer",
          text: t.text,
          rating: 5,
        })),
      })
    );
    blocks.push(block("spacer", { height: 56 }));
  }

  // Newsletter
  blocks.push(
    block("newsletter", {
      title: "Stay Updated",
      subtitle: "Get the latest offers and new arrivals straight to your inbox.",
      bgColor: "brand",
    })
  );
  blocks.push(block("spacer", { height: 40 }));

  // Trust badges
  blocks.push(
    block("trustBadges", {
      items: [
        { icon: "shield", label: "Secure Checkout" },
        { icon: "truck", label: "Nationwide Delivery" },
        { icon: "refresh", label: "Easy Returns" },
        { icon: "headphones", label: "WhatsApp Support" },
      ],
    })
  );

  return {
    title: "Home",
    slug: "home",
    type: "HOME",
    blocks,
    metaTitle: data.seo?.homeTitle || `${storeName} — Official Store`,
    metaDescription: data.seo?.homeDesc || brand.heroSubheading || "",
  };
}

function buildAboutPage(data: Record<string, any>, storeName: string, storeSlug: string, images: StoreImages): GeneratedPage {
  const about = data.about || {};
  const testimonials = data.testimonials || [];
  const valueIcons = ["heart", "award", "globe", "shield", "target", "rocket"];

  // Split story into two halves for image-text sections
  const storyText = about.story || `${storeName} is dedicated to providing the best products and services.`;
  const storyParts = storyText.split(/\n\n+/);
  const firstHalf = storyParts.slice(0, Math.ceil(storyParts.length / 2)).join("\n\n");
  const secondHalf = storyParts.slice(Math.ceil(storyParts.length / 2)).join("\n\n");

  const blocks: BuilderBlock[] = [
    block("hero", {
      heading: about.headline || `About ${storeName}`,
      subheading: "Our story, our mission, our people",
      bgStyle: "gradient",
      buttonText: "",
    }),
    block("spacer", { height: 56 }),

    // Story section 1 with industry image
    block("imageText", {
      badge: "Our Story",
      title: `Why ${storeName}?`,
      text: firstHalf,
      image: images.about,
      imageAlt: `${storeName} - Our Story`,
      reverse: false,
      buttonText: "",
    }),
    block("spacer", { height: 48 }),
  ];

  // Story section 2 with lifestyle image
  if (secondHalf) {
    blocks.push(
      block("imageText", {
        badge: "Our Mission",
        title: "What Drives Us",
        text: secondHalf,
        image: images.lifestyle,
        imageAlt: `${storeName} - Our Mission`,
        reverse: true,
        buttonText: "",
      })
    );
    blocks.push(block("spacer", { height: 48 }));
  }

  // Values
  if (about.values && about.values.length > 0) {
    blocks.push(
      block("features", {
        title: "Our Values",
        subtitle: "The principles that guide everything we do",
        bgColor: "surface",
        items: about.values.map((v: any, i: number) => ({
          icon: valueIcons[i % valueIcons.length],
          title: v.title,
          desc: v.desc,
        })),
      })
    );
    blocks.push(block("spacer", { height: 48 }));
  }

  // Stats
  blocks.push(
    block("stats", {
      title: "Our Impact",
      bgColor: "brand",
      items: [
        { value: "1,000+", label: "Happy Customers", icon: "users" },
        { value: "500+", label: "Products Sold", icon: "package" },
        { value: "4.9", label: "Customer Rating", icon: "star" },
        { value: "24/7", label: "Support", icon: "headphones" },
      ],
    })
  );
  blocks.push(block("spacer", { height: 48 }));

  // Testimonials
  if (testimonials.length > 0) {
    blocks.push(
      block("testimonials", {
        title: "Loved by Our Customers",
        bgColor: "transparent",
        items: testimonials.slice(0, 3).map((t: any) => ({
          name: t.name,
          role: t.role || "Customer",
          text: t.text,
          rating: 5,
        })),
      })
    );
    blocks.push(block("spacer", { height: 48 }));
  }

  // CTA Banner with industry image
  blocks.push(
    block("banner", {
      title: "Ready to Experience the Difference?",
      subtitle: "Join thousands of happy customers today",
      buttonText: "Browse Products",
      buttonHref: `/store/${storeSlug}/shop`,
      bgColor: "dark",
      backgroundImage: images.banner,
    })
  );

  return {
    title: "About Us",
    slug: "about",
    type: "ABOUT",
    blocks,
    metaTitle: data.seo?.aboutTitle || `About — ${storeName}`,
    metaDescription: data.seo?.aboutDesc || "",
  };
}

function buildFAQPage(data: Record<string, any>, storeName: string, storeSlug: string): GeneratedPage {
  const faq = data.faq || {};

  const blocks: BuilderBlock[] = [
    block("hero", {
      heading: "Frequently Asked Questions",
      subheading: "Got questions? We've got answers.",
      bgStyle: "light",
      buttonText: "",
    }),
    block("spacer", { height: 48 }),
    block("faq", {
      title: "",
      items: (faq.items || []).slice(0, 8).map((item: any) => ({
        question: item.question,
        answer: item.answer,
      })),
    }),
    block("spacer", { height: 48 }),
    block("divider", { style: "dots" }),
    block("spacer", { height: 48 }),
    block("contactInfo", {
      title: "Other Ways to Reach Us",
      items: [
        { icon: "message", title: "WhatsApp", value: "Message us for quick help" },
        { icon: "mail", title: "Email", value: "Send us a detailed message" },
        { icon: "phone", title: "Phone", value: "Call during business hours" },
      ],
      hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
    }),
    block("spacer", { height: 48 }),
    block("banner", {
      title: "Still Have Questions?",
      subtitle: "Our friendly team is here to help",
      buttonText: "Contact Us",
      buttonHref: `/store/${storeSlug}/contact`,
      bgColor: "dark",
    }),
  ];

  return {
    title: "FAQ",
    slug: "faq",
    type: "FAQ",
    blocks,
    metaTitle: data.seo?.faqTitle || `FAQ — ${storeName}`,
    metaDescription: data.seo?.faqDesc || "",
  };
}

function buildContactPage(data: Record<string, any>, storeName: string): GeneratedPage {
  const contact = data.contact || {};

  const blocks: BuilderBlock[] = [
    block("hero", {
      heading: contact.headline || "Get in Touch",
      subheading: contact.subtitle || "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      bgStyle: "light",
      buttonText: "",
    }),
    block("spacer", { height: 48 }),
    block("contactInfo", {
      title: "Contact Information",
      items: [
        { icon: "mail", title: "Email", value: "hello@example.com" },
        { icon: "phone", title: "Phone", value: "+234 800 000 0000" },
        { icon: "message", title: "WhatsApp", value: "Quick chat support" },
        { icon: "map-pin", title: "Address", value: "Accra, Ghana" },
      ],
      hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
    }),
    block("spacer", { height: 48 }),
    block("contactForm", {
      title: "Send Us a Message",
      subtitle: "We'll respond within 24 hours",
      fields: ["name", "email", "phone", "message"],
      buttonText: "Send Message",
    }),
    block("spacer", { height: 48 }),
    block("newsletter", {
      title: "Stay in the Loop",
      subtitle: "Get updates on new products and exclusive offers.",
      bgColor: "surface",
    }),
  ];

  return {
    title: "Contact Us",
    slug: "contact",
    type: "CONTACT",
    blocks,
    metaTitle: data.seo?.contactTitle || `Contact — ${storeName}`,
    metaDescription: data.seo?.contactDesc || "",
  };
}

function buildPoliciesPage(data: Record<string, any>, storeName: string): GeneratedPage {
  const policies = data.policies || {};

  const blocks: BuilderBlock[] = [
    block("heading", {
      text: "Store Policies",
      level: "h1",
      align: "center",
      color: "#171717",
      fontSize: "3xl",
    }),
    block("spacer", { height: 32 }),

    // Shipping
    block("heading", {
      text: "📦 Shipping & Delivery",
      level: "h2",
      align: "left",
      color: "#171717",
      fontSize: "xl",
    }),
    block("spacer", { height: 8 }),
    block("text", {
      text: policies.shipping || "We deliver nationwide. Orders within Accra are delivered in 1-2 business days. Other states take 3-5 business days.",
      align: "left",
      color: "#525252",
      fontSize: "base",
    }),
    block("spacer", { height: 24 }),
    block("divider", { color: "#e5e5e5", thickness: 1, style: "solid" }),
    block("spacer", { height: 24 }),

    // Returns
    block("heading", {
      text: "🔄 Returns & Refunds",
      level: "h2",
      align: "left",
      color: "#171717",
      fontSize: "xl",
    }),
    block("spacer", { height: 8 }),
    block("text", {
      text: policies.returns || "We accept returns within 7 days of delivery. Items must be unused and in original packaging. Refunds are processed within 3-5 business days.",
      align: "left",
      color: "#525252",
      fontSize: "base",
    }),
    block("spacer", { height: 24 }),
    block("divider", { color: "#e5e5e5", thickness: 1, style: "solid" }),
    block("spacer", { height: 24 }),

    // Privacy
    block("heading", {
      text: "🔒 Privacy Policy",
      level: "h2",
      align: "left",
      color: "#171717",
      fontSize: "xl",
    }),
    block("spacer", { height: 8 }),
    block("text", {
      text: policies.privacy || "We respect your privacy. Your personal information is used only to process orders and improve your shopping experience. We never share your data with third parties without your consent.",
      align: "left",
      color: "#525252",
      fontSize: "base",
    }),
  ];

  return {
    title: "Policies",
    slug: "policies",
    type: "POLICY",
    blocks,
    metaTitle: `Store Policies — ${storeName}`,
    metaDescription: `Shipping, returns, and privacy policies for ${storeName}.`,
  };
}

// ─── Main generator ─────────────────────────────────────────

export async function generateStore(input: StoreGeneratorInput): Promise<StoreGeneratorResult> {
  const ai = getAI();

  // 1. Call AI to generate content
  const prompt = buildGenerationPrompt(input);

  // Try up to 2 times in case of JSON parse failures
  let data: Record<string, any> | null = null;
  let lastResult: any = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await ai.chat({
      capability: AICapability.CHAT,
      messages: [
        { role: "system" as const, content: "You are a professional ecommerce content generator. Return ONLY valid JSON. No markdown fences, no explanation, no text before or after the JSON." },
        { role: "user" as const, content: prompt },
      ],
      maxTokens: 8000,
      temperature: 0.7,
    });

    lastResult = result;

    if (!result.success || !result.data) {
      const errors = result.failedProviders?.map((f) => `${f.provider}: ${f.error}`).join("; ") || "Unknown error";
      throw new Error(`AI generation failed: ${errors}`);
    }

    try {
      data = parseAIResponse(result.data.content);
      break; // Success
    } catch (parseErr) {
      console.error(`AI response parse error (attempt ${attempt + 1}):`, result.data.content.slice(0, 500));
      if (attempt === 1) {
        throw new Error("AI returned invalid content. Please try again.");
      }
      // Retry on first failure
    }
  }

  if (!data || !lastResult?.data) {
    throw new Error("AI returned invalid content. Please try again.");
  }

  // 3. Detect industry and get randomized images
  const industry = detectIndustry(input.businessType, input.description);
  const images = getRandomIndustryImages(industry);

  // 4. Build pages from the generated content with industry-matched images
  const pages: GeneratedPage[] = [
    buildHomePage(data, input.storeName, input.storeSlug, images),
    buildAboutPage(data, input.storeName, input.storeSlug, images),
    buildFAQPage(data, input.storeName, input.storeSlug),
    buildContactPage(data, input.storeName),
    buildPoliciesPage(data, input.storeName),
  ];

  // 4. Delete any existing auto-generated pages for this store (fresh start)
  await prisma.page.deleteMany({
    where: {
      siteId: input.siteId,
      type: { in: ["HOME", "ABOUT", "FAQ", "CONTACT", "POLICY"] },
    },
  });

  // 5. Persist all pages to the database
  const createdPages = await Promise.all(
    pages.map((page, i) =>
      prisma.page.create({
        data: {
          siteId: input.siteId,
          title: page.title,
          slug: page.slug,
          type: page.type as any,
          content: page.blocks as any,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          isPublished: true,
          position: i,
        },
      })
    )
  );

  return {
    pages: createdPages.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      type: p.type,
    })),
    provider: lastResult.data.provider,
    model: lastResult.data.model,
  };
}
