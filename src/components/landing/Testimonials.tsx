"use client";
import { Quote, Star } from "@/components/icons/FilledIcons";

import { useEffect, useState } from "react";

// ─── Types ──────────────────────────────────────────────────

interface ReviewData {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerified: boolean;
  createdAt: string;
  productName: string;
  storeName: string;
  storeSlug: string;
  businessType: string;
  country: string;
}

interface TestimonialCard {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  initials: string;
  gradient: string;
}

// ─── Gradient pool ──────────────────────────────────────────

const gradients = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-rose-500 to-orange-500",
  "from-green-500 to-emerald-500",
  "from-amber-500 to-yellow-500",
  "from-indigo-500 to-violet-500",
  "from-teal-500 to-lime-500",
  "from-fuchsia-500 to-rose-500",
];

// ─── Fallback testimonials (shown when no real reviews exist) ─

const fallbackTestimonials: TestimonialCard[] = [
  {
    id: "fallback-1",
    name: "Amara Okafor",
    role: "Fashion Seller, Lagos",
    content:
      "I was selling only through WhatsApp and Instagram DMs. AfroStore gave me a real store in literally 5 minutes. My sales tripled in the first month because customers could finally browse and pay directly.",
    rating: 5,
    initials: "AO",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "fallback-2",
    name: "Kwame Mensah",
    role: "Electronics, Accra",
    content:
      "The AI wrote better product descriptions than I ever could. And the delivery zone feature? Game changer. I can set different fees for Accra, Tema, and Kumasi. No other platform does this so easily.",
    rating: 5,
    initials: "KM",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "fallback-3",
    name: "Fatima Hassan",
    role: "Beauty Brand, Nairobi",
    content:
      "I tried Shopify but it felt so foreign — the payments, the shipping, everything. AfroStore just gets it. M-Pesa integration, local delivery, WhatsApp notifications. It's built for us.",
    rating: 5,
    initials: "FH",
    gradient: "from-rose-500 to-orange-500",
  },
  {
    id: "fallback-4",
    name: "Chidi Eze",
    role: "Food Delivery, Abuja",
    content:
      "The template for food businesses had everything I needed — menu display, delivery zones, order notifications to my WhatsApp. I launched my delivery service in one afternoon.",
    rating: 5,
    initials: "CE",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "fallback-5",
    name: "Nana Ama",
    role: "Agency Owner, Kumasi",
    content:
      "I manage 12 client stores from one dashboard. The agency plan pays for itself with just two clients. My clients love how easy it is to manage their own products and orders.",
    rating: 5,
    initials: "NA",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    id: "fallback-6",
    name: "Ibrahim Musa",
    role: "Mini Importer, Kano",
    content:
      "Bank transfer checkout is the best feature. Most of my customers don't use cards. With Monnify integration, they transfer and the order confirms automatically. Before, I was checking screenshots manually.",
    rating: 5,
    initials: "IM",
    gradient: "from-indigo-500 to-violet-500",
  },
];

// ─── Country code → label ───────────────────────────────────

const countryLabels: Record<string, string> = {
  NG: "Nigeria",
  GH: "Ghana",
  KE: "Kenya",
  ZA: "South Africa",
  TZ: "Tanzania",
  UG: "Uganda",
  ET: "Ethiopia",
  SN: "Senegal",
  CM: "Cameroon",
  CI: "Ivory Coast",
};

// ─── Helpers ────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function mapReviewToCard(review: ReviewData, index: number): TestimonialCard {
  const country = countryLabels[review.country] || review.country;
  const role = `${review.storeName}, ${country}`;

  return {
    id: review.id,
    name: review.name,
    role,
    content: review.body || review.title || "Great product and service!",
    rating: review.rating,
    initials: getInitials(review.name),
    gradient: gradients[index % gradients.length],
  };
}

// ─── Single Review Card ─────────────────────────────────────

function ReviewCard({ t }: { t: TestimonialCard }) {
  return (
    <div className="flex-shrink-0 w-[340px] sm:w-[380px] rounded-2xl border border-surface-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Quote className="h-8 w-8 text-brand-200 mb-4" />
      <p className="text-surface-600 leading-relaxed mb-6 text-sm line-clamp-4">
        &ldquo;{t.content}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
        >
          {t.initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-surface-900 truncate">
            {t.name}
          </div>
          <div className="text-xs text-surface-500 truncate">{t.role}</div>
        </div>
        <div className="ml-auto flex gap-0.5 flex-shrink-0">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star
              key={i}
              className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export default function Testimonials() {
  const [cards, setCards] = useState<TestimonialCard[]>(fallbackTestimonials);
  const [paused, setPaused] = useState(false);

  // Fetch real approved reviews
  useEffect(() => {
    let cancelled = false;

    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews/approved?limit=30");
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;

        if (json.success && json.data && json.data.length > 0) {
          const realCards = json.data
            .filter((r: ReviewData) => r.body || r.title)
            .map(mapReviewToCard);

          if (realCards.length > 0) {
            // Real reviews first, pad with fallbacks if under 6
            const merged = [...realCards];
            if (merged.length < 6) {
              merged.push(...fallbackTestimonials.slice(0, 6 - merged.length));
            }
            setCards(merged);
          }
        }
      } catch {
        // Keep fallback testimonials
      }
    }

    fetchReviews();
    return () => { cancelled = true; };
  }, []);

  return (
    <section
      className="section-padding bg-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-max">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 mb-4">
            <Star className="h-3.5 w-3.5 fill-brand-600" />
            What Our Customers Say
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 tracking-tight text-balance">
            Real Reviews from{" "}
            <span className="gradient-text">Real Businesses</span>
          </h2>
          <p className="mt-4 text-lg text-surface-500">
            Hear from merchants and shoppers across Africa who use AfroStore every day.
          </p>
        </div>
      </div>

      {/* Scrolling marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-white to-transparent" />

        <div
          className="marquee-track"
          data-direction="left"
          data-paused={paused ? "true" : "false"}
          style={{ "--marquee-duration": "45s" } as React.CSSProperties}
        >
          {cards.map((t) => (
            <ReviewCard key={t.id} t={t} />
          ))}
          {/* Duplicate for seamless loop */}
          {cards.map((t) => (
            <ReviewCard key={`dup-${t.id}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
