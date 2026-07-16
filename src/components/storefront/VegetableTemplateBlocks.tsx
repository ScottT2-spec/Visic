"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { ArrowRight, Clock3, Star } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   VEGETABLE TEMPLATE BLOCKS
   Pixel-perfect replicas of hardcoded VegetableTemplatePages components.
   All content extracted verbatim from live template.
   ═══════════════════════════════════════════════════════════════ */

function formatPrice(amount: number, currency: string) {
  const symbolMap: Record<string, string> = { USD: "$", GHS: "GH₵", KES: "KSh", GHS: "GH₵", ZAR: "R", GBP: "£", EUR: "€" };
  return `${symbolMap[currency] || currency}${amount.toFixed(0)}`;
}

/* ─── VEGETABLE HERO SECTION ───────────────────────────────────── */

export interface VegetableHeroProps {
  subtitle: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  images?: string[];
}

export function VegetableHero({
  subtitle,
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  images = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=1200&fit=crop",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=1200&fit=crop",
  ],
}: VegetableHeroProps) {
  return (
    <section className="px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">{subtitle}</p>
            <h1 className="mt-4 max-w-2xl font-serif text-5xl tracking-tight text-[#2a241a] sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#63584b]">{description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={primaryButtonLink} className="inline-flex items-center rounded-full bg-[#2a241a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#6f8f56]">
                {primaryButtonText}
              </Link>
              {secondaryButtonText && secondaryButtonLink && (
                <Link href={secondaryButtonLink} className="inline-flex items-center rounded-full border border-[#d7c8b6] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#5d5143] transition-colors hover:border-[#9db27d] hover:text-[#33412e]">
                  {secondaryButtonText}
                </Link>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((img, i) => (
              <img key={i} src={img} alt="Restaurant" className="h-full min-h-[260px] rounded-[2rem] object-cover" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── VEGETABLE FEATURE CARDS ─────────────────────────────────── */

export interface VegetableFeatureCard {
  title: string;
  text: string;
  image: string;
}

export interface VegetableFeaturesProps {
  subtitle: string;
  title: string;
  description: string;
  features: VegetableFeatureCard[];
}

export function VegetableFeatures({ subtitle, title, description, features }: VegetableFeaturesProps) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">{subtitle}</p>
          <h2 className="mt-4 font-serif text-4xl tracking-tight text-[#2a241a]">{title}</h2>
          <p className="mt-4 text-sm leading-7 text-[#63584b]">{description}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="overflow-hidden rounded-[1.8rem] border border-[#eadfce] bg-white shadow-[0_20px_60px_rgba(63,51,31,0.08)]">
              <img src={feature.image} alt={feature.title} className="h-56 w-full object-cover" />
              <div className="p-6">
                <h3 className="font-serif text-2xl text-[#2a241a]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#63584b]">{feature.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── VEGETABLE MENU ITEMS ─────────────────────────────────────── */

export interface VegetableMenuItem {
  name: string;
  price: number;
  description: string;
}

export interface VegetableMenuProps {
  subtitle: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  items: VegetableMenuItem[];
}

export function VegetableMenu({ subtitle, title, description, buttonText, buttonLink, items }: VegetableMenuProps) {
  return (
    <section className="border-y border-[#eadfce] bg-[#f6efe2] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">{subtitle}</p>
        <h2 className="mt-4 font-serif text-4xl tracking-tight text-[#2a241a]">{title}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#63584b]">{description}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.name} className="rounded-[1.6rem] border border-[#eadfce] bg-white p-6 shadow-[0_20px_60px_rgba(63,51,31,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl text-[#2a241a]">{item.name}</h3>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#8f7756]">{item.description}</p>
                </div>
                <span className="rounded-full bg-[#2a241a] px-4 py-2 text-xs font-semibold tracking-[0.2em] text-white">${item.price.toFixed(2)}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <Link href={buttonLink} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8f56]">
            {buttonText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── VEGETABLE MENU SECTIONS (Full Menu Page) ─────────────────── */

export interface VegetableMenuSectionItem {
  name: string;
  price: number;
  description: string;
  image: string;
}

export interface VegetableMenuSection {
  title: string;
  description: string;
  items: VegetableMenuSectionItem[];
}

export interface VegetableMenuSectionsProps {
  sections: VegetableMenuSection[];
  currency: string;
}

export function VegetableMenuSections({ sections, currency }: VegetableMenuSectionsProps) {
  return (
    <div className="bg-[#fffdf7]">
      <section className="border-b border-[#e5dccd] bg-[radial-gradient(circle_at_top,#f7f1e4_0%,#fffdf7_58%)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7f8b73]">Seasonal Menu</p>
          <h1 className="mt-4 font-serif text-5xl tracking-tight text-[#243226] sm:text-6xl">Fresh plates, warm service, and elegant pacing.</h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#5d6658]">A calm restaurant menu crafted around produce, fire, and texture. Every section is arranged to feel refined on desktop and effortless on mobile.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="#menu-sections" className="inline-flex items-center rounded-full bg-[#243226] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#6b8d49]">Explore Menu</Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d5cdbf] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#51604f]">
              <Clock3 className="h-4 w-4" /> Lunch 11am - 3pm
            </span>
          </div>
        </div>
      </section>
      <section id="menu-sections" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-16">
          {sections.map((section, index) => (
            <div key={section.title} className={`grid gap-8 lg:grid-cols-[0.9fr_1.1fr] ${index % 2 === 1 ? "lg:grid-cols-[1.1fr_0.9fr]" : ""}`}>
              <div className={`${index % 2 === 1 ? "lg:order-2" : ""} rounded-[2rem] border border-[#e5dccd] bg-white p-8 shadow-[0_30px_80px_rgba(53,69,45,0.08)]`}>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7f8b73]">{section.title}</p>
                <h2 className="mt-4 font-serif text-3xl text-[#243226]">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#5d6658]">{section.description}</p>
                <div className="mt-8 space-y-5">
                  {section.items.map((item) => (
                    <div key={item.name} className="flex items-start gap-4 border-b border-[#efe7db] pb-5 last:border-b-0 last:pb-0">
                      <div className="h-20 w-20 flex-none overflow-hidden rounded-2xl bg-[#f4efe4]">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-serif text-xl text-[#243226]">{item.name}</h3>
                          <span className="rounded-full border border-[#d6cdbf] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5f6d58]">{formatPrice(item.price, currency)}</span>
                        </div>
                        <p className="mt-2 max-w-xl text-sm leading-7 text-[#687465]">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${index % 2 === 1 ? "lg:order-1" : ""} overflow-hidden rounded-[2rem] border border-[#e5dccd] bg-[#dce7cd] shadow-[0_30px_80px_rgba(53,69,45,0.08)]`}>
                <img src={section.items[0].image} alt={section.items[0].name} className="h-full w-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── VEGETABLE RECIPE GRID ────────────────────────────────────── */

export interface VegetableRecipeItem {
  title: string;
  category: string;
  time: string;
  difficulty: string;
  image: string;
  price?: number;
}

export interface VegetableRecipeGridProps {
  subtitle: string;
  title: string;
  description: string;
  categories: string[];
  recipes: VegetableRecipeItem[];
  currency: string;
  storeSlug: string;
}

export function VegetableRecipeGrid({ subtitle, title, description, categories, recipes, currency, storeSlug }: VegetableRecipeGridProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const filteredRecipes = useMemo(() => recipes.filter((item) => activeCategory === "All" || item.category === activeCategory), [recipes, activeCategory]);

  return (
    <div className="bg-[#fffdf7]">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7f8b73]">{subtitle}</p>
            <h2 className="mt-4 font-serif text-3xl tracking-tight text-[#243226] sm:text-4xl">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-[#5d6658] sm:text-base">{description}</p>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                  activeCategory === category ? "border-[#243226] bg-[#243226] text-white" : "border-[#d6cdbf] bg-white text-[#52614f] hover:border-[#96ab86]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <article key={recipe.title} className="overflow-hidden rounded-[1.8rem] border border-[#e5dccd] bg-white shadow-[0_24px_80px_rgba(53,69,45,0.08)] transition-transform hover:-translate-y-1">
                <div className="aspect-[1/1.05] overflow-hidden">
                  <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7f8b73]">{recipe.category}</span>
                    <div className="flex items-center gap-1 text-[#6b8d49]">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-xs font-semibold">4.9</span>
                    </div>
                  </div>
                  <h3 className="mt-4 font-serif text-2xl text-[#243226]">{recipe.title}</h3>
                  <div className="mt-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#6a7565]">
                    <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> {recipe.time}</span>
                    <span className="h-1 w-1 rounded-full bg-[#c2b59b]" />
                    <span>{recipe.difficulty}</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#5d6658]">A warm, produce-led recipe with simple ingredients and a refined finish.</p>
                  <div className="mt-5 flex items-center justify-between">
                    {recipe.price && <span className="text-sm font-semibold text-[#243226]">{formatPrice(recipe.price, currency)}</span>}
                    <Link href={`/store/${storeSlug}/menu`} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b8d49]">
                      View Menu <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── VEGETABLE ABOUT HERO ─────────────────────────────────────── */

export interface VegetableAboutHeroProps {
  subtitle: string;
  title: string;
  description: string;
  stats: Array<{ value: string; label: string }>;
  images: string[];
  philosophyText: string;
}

export function VegetableAboutHero({ subtitle, title, description, stats, images, philosophyText }: VegetableAboutHeroProps) {
  return (
    <div className="bg-[#fffdf7]">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7f8b73]">{subtitle}</p>
            <h1 className="mt-4 max-w-2xl font-serif text-5xl tracking-tight text-[#243226] sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#5d6658]">{description}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[1.5rem] border border-[#e5dccd] bg-white p-5">
                  <div className="font-serif text-3xl text-[#243226]">{stat.value}</div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7f8b73]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <img className="h-full min-h-[240px] rounded-[1.8rem] object-cover" src={images[0]} alt="Restaurant interior" />
            <div className="grid gap-4">
              <img className="h-full min-h-[180px] rounded-[1.8rem] object-cover" src={images[1]} alt="Chef plating food" />
              <div className="rounded-[1.8rem] border border-[#e5dccd] bg-[#243226] p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/65">Our Philosophy</p>
                <p className="mt-4 text-lg leading-8 text-white/90">{philosophyText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── VEGETABLE TEAM SECTION ───────────────────────────────────── */

export interface VegetableTeamMember {
  name: string;
  role: string;
  image: string;
}

export interface VegetableTeamProps {
  subtitle: string;
  title: string;
  description: string;
  team: VegetableTeamMember[];
}

export function VegetableTeam({ subtitle, title, description, team }: VegetableTeamProps) {
  return (
    <section className="border-y border-[#e5dccd] bg-[#f8f3ea] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7f8b73]">{subtitle}</p>
          <h2 className="mt-4 font-serif text-3xl tracking-tight text-[#243226] sm:text-4xl">{title}</h2>
          <p className="mt-4 text-sm leading-7 text-[#5d6658] sm:text-base">{description}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {team.map((member) => (
            <article key={member.name} className="overflow-hidden rounded-[1.8rem] border border-[#e5dccd] bg-white shadow-[0_24px_80px_rgba(53,69,45,0.08)]">
              <img src={member.image} alt={member.name} className="h-[360px] w-full object-cover" />
              <div className="p-6 text-center">
                <h3 className="font-serif text-2xl text-[#243226]">{member.name}</h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#7f8b73]">{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── VEGETABLE CONTACT SECTION ────────────────────────────────── */

export interface VegetableContactProps {
  subtitle: string;
  title: string;
  description: string;
  address: string;
  addressDescription: string;
  phone?: string;
  email?: string;
  openingHours: string[];
  storeSlug: string;
}

export function VegetableContact({ subtitle, title, description, address, addressDescription, phone, email, openingHours, storeSlug }: VegetableContactProps) {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=14&output=embed`;

  return (
    <div className="bg-[#fff9ef]">
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8f7756]">{subtitle}</p>
            <h2 className="mt-4 font-serif text-3xl tracking-tight text-[#2a241a] sm:text-4xl">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-[#63584b] sm:text-base">{description}</p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-6">
              <div className="rounded-[2rem] border border-[#eadfce] bg-white p-8 shadow-[0_20px_60px_rgba(63,51,31,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Our Location</p>
                <h3 className="mt-4 font-serif text-3xl text-[#2a241a]">{address}</h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#63584b]">{addressDescription}</p>
                {(phone || email) && (
                  <div className="mt-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Telephone Reservations</p>
                    <div className="mt-3 space-y-2 text-sm leading-7 text-[#4d4338]">
                      {phone && <p>{phone}</p>}
                      {email && <p>{email}</p>}
                    </div>
                  </div>
                )}
                <div className="mt-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Opening hours</p>
                  <div className="mt-3 space-y-2 text-sm leading-7 text-[#4d4338]">
                    {openingHours.map((hour) => (
                      <p key={hour}>{hour}</p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-white shadow-[0_20px_60px_rgba(63,51,31,0.08)]">
                <iframe title="Map" src={mapSrc} className="h-[320px] w-full border-0" loading="lazy" />
              </div>
            </div>
            <div id="reservation-form" className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_20px_60px_rgba(63,51,31,0.08)] sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Reservations</p>
              <h3 className="mt-4 font-serif text-3xl text-[#2a241a]">Book your table online now.</h3>
              <p className="mt-3 text-sm leading-7 text-[#63584b]">Send your reservation details here and our team will follow up to confirm.</p>
              <form className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input placeholder="Your name" className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
                  <input type="email" placeholder="Email address" className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
                </div>
                <textarea placeholder="Your message" rows={7} className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
                <button type="button" className="inline-flex items-center rounded-full bg-[#243226] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#6b8d49]">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── VEGETABLE RESERVATION FORM ───────────────────────────────── */

export interface VegetableReservationProps {
  subtitle: string;
  title: string;
  description: string;
  storeSlug: string;
}

export function VegetableReservation({ subtitle, title, description, storeSlug }: VegetableReservationProps) {
  return (
    <div className="bg-[#fff9ef]">
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">{subtitle}</p>
          <h1 className="mt-4 font-serif text-5xl tracking-tight text-[#2a241a]">{title}</h1>
          <p className="mt-4 text-sm leading-7 text-[#63584b]">{description}</p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_20px_60px_rgba(63,51,31,0.08)] sm:p-8">
          <form className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input placeholder="Name *" className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
              <input placeholder="Phone *" className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input placeholder="Email" className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
              <input placeholder="Number of Persons *" className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]">
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => <option key={day}>{day}</option>)}
              </select>
              <select className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]">
                {["10:00 am", "11:00 am", "12:00 pm", "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm", "5:00 pm", "6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm"].map((hour) => <option key={hour}>{hour}</option>)}
              </select>
            </div>
            <button type="button" className="inline-flex items-center justify-center rounded-full bg-[#243226] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#6b8d49]">
              Make Reservation
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
