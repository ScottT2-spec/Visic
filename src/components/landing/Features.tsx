"use client";
import { BarChart3, Bot, Clock, CreditCard, Globe, Languages, MessageCircle, MousePointerClick, Palette, Puzzle, Shield, ShoppingBag, Smartphone, Sparkles, Truck, Zap } from "@/components/icons/FilledIcons";

const features = [
  {
    icon: Clock,
    title: "5-Minute Store Launch",
    description:
      "Answer a few questions, let AI generate your entire store — products, pages, checkout, and all. You're selling before your coffee gets cold.",
    color: "brand",
  },
  {
    icon: Sparkles,
    title: "AI Commerce Co-Founder",
    description:
      "Not just a chatbot. An AI that writes product descriptions, creates landing pages, improves conversions, and grows your business.",
    color: "accent",
  },
  {
    icon: MousePointerClick,
    title: "Drag-and-Drop Builder",
    description:
      "Elementor-level visual editing with conversion-focused blocks — countdowns, testimonials, trust badges, sticky buy buttons, and more.",
    color: "brand",
  },
  {
    icon: CreditCard,
    title: "African Payments Built-In",
    description:
      "Monnify, Paystack, Flutterwave — cards, bank transfers, USSD, mobile money. Your customers pay how they want.",
    color: "accent",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp-First Commerce",
    description:
      "WhatsApp order buttons, abandoned cart broadcasts, delivery notifications. Meet your customers where they already are.",
    color: "brand",
  },
  {
    icon: Palette,
    title: "Premium Templates",
    description:
      "Stunning, industry-specific themes designed for African markets. Fashion, food, electronics, beauty — all mobile-first and conversion-optimized.",
    color: "accent",
  },
  {
    icon: Puzzle,
    title: "Plugin Marketplace",
    description:
      "Extend your store with plugins — delivery, reviews, coupons, SEO, affiliates. Or describe a feature in plain English and AI builds it.",
    color: "brand",
  },
  {
    icon: Globe,
    title: "Multi-Site Architecture",
    description:
      "Run multiple stores from one account. Each gets its own subdomain or custom domain, isolated data, shared login.",
    color: "accent",
  },
  {
    icon: Truck,
    title: "Local Delivery Zones",
    description:
      "Set area-based delivery fees — Accra mainland vs island, Accra zones, Nairobi areas. Integrates with dispatch riders.",
    color: "brand",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Know what's selling, who's buying, and where you're losing customers. AI tells you why visitors aren't converting.",
    color: "accent",
  },
  {
    icon: Languages,
    title: "Local Languages",
    description:
      "Pidgin, Yoruba, Hausa, Igbo, Swahili, French — reach every customer in their language. AI translates your entire store.",
    color: "brand",
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description:
      "Verified business badges, fraud detection, secure checkout, SSL certificates. Your customers buy with confidence.",
    color: "accent",
  },
];

export default function Features() {
  return (
    <section id="products" className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 mb-4">
            <Zap className="h-3.5 w-3.5" />
            Everything You Need
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 tracking-tight text-balance">
            Built for How Africa{" "}
            <span className="gradient-text">Actually Does Business</span>
          </h2>
          <p className="mt-4 text-lg text-surface-500 leading-relaxed">
            Not another Silicon Valley tool ported to Africa. Every feature is designed for local payments, WhatsApp commerce, and mobile-first buyers.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isAccent = feature.color === "accent";
            return (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-surface-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1 hover:border-surface-300"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                    isAccent
                      ? "bg-accent-50 text-accent-600"
                      : "bg-brand-50 text-brand-600"
                  } mb-4 transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-surface-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
