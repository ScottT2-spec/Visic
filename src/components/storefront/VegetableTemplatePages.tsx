"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Clock3, MapPin, Phone, Send, Star, UtensilsCrossed } from "lucide-react";

type PageProps = {
  storeName: string;
  storeSlug: string;
  currency: string;
  socialLinks?: Array<{ platform: string; url: string }>;
};

type ContactPageProps = PageProps & {
  storeAddress?: string;
  storePhone?: string;
};

const HOME_FEATURES = [
  {
    title: "Good Vibes",
    text: "A calm, bright room with handcrafted details, natural textures, and a relaxed dining rhythm.",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&h=900&fit=crop",
  },
  {
    title: "Cozy Place",
    text: "A welcoming space that feels easy to settle into, with soft lighting and thoughtful service.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=900&fit=crop",
  },
  {
    title: "Relax Atmosphere",
    text: "A slow, fresh restaurant mood shaped around good ingredients and a peaceful table.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=900&fit=crop",
  },
] as const;

const HOME_MENU_ITEMS = [
  { name: "Lemon and Garlic Green Beans", price: "15.00", description: "Lemon / Garlic / Beans" },
  { name: "Bacon-wrapped Shrimp with Garlic", price: "21.50", description: "Bacon / Shrimp / Garlic" },
  { name: "Lamb Beef Kofta Skewers with Tzatziki", price: "18.50", description: "Lamb / Wine / Butter" },
  { name: "Imported Oysters Grill (5 Pieces)", price: "20.00", description: "Oysters / Veggie / Ginger" },
] as const;

const MENU_SECTIONS = [
  {
    title: "Starters",
    description: "Light plates with garden herbs, citrus, and a clean seasonal finish.",
    items: [
      { name: "Charred Asparagus Salad", price: 14, description: "Lemon vinaigrette, shaved fennel, pistachio crumb.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=900&h=700&fit=crop" },
      { name: "Roasted Tomato Bruschetta", price: 12, description: "Garlic toast, basil oil, whipped ricotta.", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=700&fit=crop" },
      { name: "Seasonal Soup Bowl", price: 11, description: "Silky vegetable soup, sourdough crisp, herb oil.", image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=900&h=700&fit=crop" },
    ],
  },
  {
    title: "Mains",
    description: "Balanced mains with bright sauces and generous farm produce.",
    items: [
      { name: "Garden Risotto", price: 22, description: "Spring vegetables, parmesan, toasted seeds.", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&h=700&fit=crop" },
      { name: "Grilled Cauliflower Steak", price: 24, description: "Smoked paprika butter, chickpea puree, greens.", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&h=700&fit=crop" },
      { name: "Herb Flatbread Plate", price: 20, description: "Whipped feta, olives, tomato relish, market leaves.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&h=700&fit=crop" },
    ],
  },
  {
    title: "Desserts",
    description: "Soft, citrus-led sweets to close the meal.",
    items: [
      { name: "Olive Oil Citrus Cake", price: 10, description: "Whipped cream, candied peel, lemon glaze.", image: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=900&h=700&fit=crop" },
      { name: "Berry Panna Cotta", price: 11, description: "Vanilla cream, berry compote, almond tuile.", image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=900&h=700&fit=crop" },
      { name: "Seasonal Sorbet Trio", price: 9, description: "Mango, raspberry, and lime with mint.", image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=900&h=700&fit=crop" },
    ],
  },
] as const;

const RECIPE_CATEGORIES = ["All", "Seasonal", "Soups", "Small Plates", "Mains", "Desserts"];

const RECIPE_ITEMS = [
  { title: "Charred Broccolini with Chili Oil", category: "Seasonal", time: "20 min", difficulty: "Easy", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&h=900&fit=crop" },
  { title: "Herb-Forward Tomato Stew", category: "Soups", time: "35 min", difficulty: "Easy", image: "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=900&h=900&fit=crop" },
  { title: "Crispy Potato Galette", category: "Small Plates", time: "40 min", difficulty: "Medium", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=900&h=900&fit=crop" },
  { title: "Green Lentil Bowl", category: "Mains", time: "30 min", difficulty: "Easy", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&h=900&fit=crop" },
  { title: "Stone Fruit Tart", category: "Desserts", time: "55 min", difficulty: "Medium", image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=900&h=900&fit=crop" },
  { title: "Roasted Carrot Salad", category: "Seasonal", time: "25 min", difficulty: "Easy", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&h=900&fit=crop" },
] as const;

const TEAM = [
  { name: "Amina Rivera", role: "Executive Chef", image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900&h=1100&fit=crop" },
  { name: "Noah Patel", role: "Pastry Chef", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&h=1100&fit=crop" },
  { name: "Leah Kim", role: "Restaurant Manager", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=1100&fit=crop" },
] as const;

function formatPrice(amount: number, currency: string) {
  const symbolMap: Record<string, string> = { USD: "$", NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", GBP: "£", EUR: "€" };
  return `${symbolMap[currency] || currency}${amount.toFixed(0)}`;
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7f8b73]">{eyebrow}</p>
      <h2 className="mt-4 font-serif text-3xl tracking-tight text-[#243226] sm:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-[#5d6658] sm:text-base">{description}</p>
    </div>
  );
}

export function VegetableHomePage({ storeName, storeSlug }: PageProps) {
  return (
    <div className="bg-[#fff9ef] text-[#2b2419]">
      <section className="px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Good Place. Good Food.</p>
              <h1 className="mt-4 max-w-2xl font-serif text-5xl tracking-tight text-[#2a241a] sm:text-6xl">A really good place to eat in the city.</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#63584b]">
                Fresh produce, warm hospitality, and a refined dining room come together in a calm, elegant home page inspired by the reference deli layout.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={`/store/${storeSlug}/menu`} className="inline-flex items-center rounded-full bg-[#2a241a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#6f8f56]">
                  View Menu
                </Link>
                <Link href={`/store/${storeSlug}/contact#reservation-form`} className="inline-flex items-center rounded-full border border-[#d7c8b6] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#5d5143] transition-colors hover:border-[#9db27d] hover:text-[#33412e]">
                  Scroll Down
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=1200&fit=crop" alt={`${storeName} dining room`} className="h-full min-h-[260px] rounded-[2rem] object-cover" />
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=1200&fit=crop" alt={`${storeName} chef plating`} className="h-full min-h-[260px] rounded-[2rem] object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Discover the Atmosphere</p>
            <h2 className="mt-4 font-serif text-4xl tracking-tight text-[#2a241a]">Discover the good atmosphere of the restaurant.</h2>
            <p className="mt-4 text-sm leading-7 text-[#63584b]">
              Natural materials, quiet textures, and a fresh seasonal menu create a dining room that feels easy to return to.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {HOME_FEATURES.map((feature) => (
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

      <section className="border-y border-[#eadfce] bg-[#f6efe2] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Our Menu</p>
          <h2 className="mt-4 font-serif text-4xl tracking-tight text-[#2a241a]">Get relaxed. Eat.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#63584b]">
            Seasonal plates and signature dishes presented in a warm, easy-to-scan layout that stays elegant on mobile and desktop.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {HOME_MENU_ITEMS.map((item) => (
              <article key={item.name} className="rounded-[1.6rem] border border-[#eadfce] bg-white p-6 shadow-[0_20px_60px_rgba(63,51,31,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl text-[#2a241a]">{item.name}</h3>
                    <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#8f7756]">{item.description}</p>
                  </div>
                  <span className="rounded-full bg-[#2a241a] px-4 py-2 text-xs font-semibold tracking-[0.2em] text-white">${item.price}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10">
            <Link href={`/store/${storeSlug}/menu`} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8f56]">
              View All Menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-[#eadfce] bg-white p-8 shadow-[0_20px_60px_rgba(63,51,31,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Signature Menu</p>
            <h2 className="mt-4 font-serif text-4xl tracking-tight text-[#2a241a]">Handmade food, simple ingredients.</h2>
            <p className="mt-4 text-sm leading-7 text-[#63584b]">
              A concise signature-menu area with calm spacing and soft imagery, built to feel natural and premium.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {["photo-1504674900247-0877df9cc836", "photo-1490645935967-10de6ba17061", "photo-1517248135467-4c7edcad34c4", "photo-1559339352-11d035aa65de"].map((photo) => (
                <img
                  key={photo}
                  src={`https://images.unsplash.com/${photo}?w=900&h=900&fit=crop`}
                  alt="Signature dish"
                  className="h-40 w-full rounded-[1.4rem] object-cover"
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "photo-1483695028939-5bb13f8648b0",
              "photo-1473093295043-cdd812d0e601",
              "photo-1512621776951-a57141f2eefd",
              "photo-1504674900247-0877df9cc836",
              "photo-1482049016688-2d3e1b311543",
              "photo-1547592180-85f173990554",
            ].map((photo) => (
              <img
                key={photo}
                src={`https://images.unsplash.com/${photo}?w=900&h=1100&fit=crop`}
                alt="Gallery"
                className="h-full min-h-[170px] rounded-[1.4rem] object-cover"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#eadfce] bg-[#f6efe2] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Reservation</p>
          <h2 className="mt-4 font-serif text-4xl tracking-tight text-[#2a241a]">Book a table now.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#63584b]">
            Use the reservation button in the header or scroll down to the contact page to send your booking details.
          </p>
          <div className="mt-6">
            <Link href={`/store/${storeSlug}/contact#reservation-form`} className="inline-flex items-center rounded-full bg-[#2a241a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#6f8f56]">
              Book A Table Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function VegetableMenuPage({ currency }: PageProps) {
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
          {MENU_SECTIONS.map((section, index) => (
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

export function VegetableRecipePage({ currency, storeSlug }: PageProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const recipes = useMemo(() => RECIPE_ITEMS.filter((item) => activeCategory === "All" || item.category === activeCategory), [activeCategory]);

  return (
    <div className="bg-[#fffdf7]">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader eyebrow="Recipe Notes" title="Simple, beautiful recipes from the same seasonal kitchen." description="A curated grid of recipes, organized by category and designed to feel light, editorial, and easy to scan on every screen size." />

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {RECIPE_CATEGORIES.map((category) => (
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
            {recipes.map((recipe) => (
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
                    <span className="text-sm font-semibold text-[#243226]">{formatPrice(18, currency)}</span>
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

export function VegetableAboutPage({ storeName }: PageProps) {
  return (
    <div className="bg-[#fffdf7]">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7f8b73]">About Us</p>
            <h1 className="mt-4 max-w-2xl font-serif text-5xl tracking-tight text-[#243226] sm:text-6xl">A seasonal kitchen shaped by the field, the fire, and the table.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#5d6658]">{storeName} brings a calm, elegant restaurant experience to produce-led cooking. We source closely, plate simply, and serve food that feels both nourishing and special.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[["12+", "Years of cooking"], ["36", "Local growers"], ["4.9/5", "Guest rating"]].map(([value, label]) => (
                <div key={label} className="rounded-[1.5rem] border border-[#e5dccd] bg-white p-5">
                  <div className="font-serif text-3xl text-[#243226]">{value}</div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7f8b73]">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <img className="h-full min-h-[240px] rounded-[1.8rem] object-cover" src="https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=900&h=1200&fit=crop" alt="Restaurant interior" />
            <div className="grid gap-4">
              <img className="h-full min-h-[180px] rounded-[1.8rem] object-cover" src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&h=700&fit=crop" alt="Chef plating food" />
              <div className="rounded-[1.8rem] border border-[#e5dccd] bg-[#243226] p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/65">Our Philosophy</p>
                <p className="mt-4 text-lg leading-8 text-white/90">Seasonal ingredients, warm hospitality, and a room designed to feel quiet, modern, and memorable.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e5dccd] bg-[#f8f3ea] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader eyebrow="The Team" title="People who care about the plate." description="A compact team of chefs, hosts, and managers focused on consistency, flavor, and hospitality." />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TEAM.map((member) => (
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
    </div>
  );
}

export function VegetableContactPage({ storeName, storeSlug, storeAddress, storePhone }: ContactPageProps) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [notice, setNotice] = useState("");

  const mapSrc = useMemo(() => {
    const query = encodeURIComponent(storeAddress || `${storeName} restaurant`);
    return `https://maps.google.com/maps?q=${query}&z=14&output=embed`;
  }, [storeAddress, storeName]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setNotice("");

    try {
      const response = await fetch(`/api/storefront/${storeSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to send message");

      setStatus("success");
      setNotice("Message sent. We’ll get back to you shortly.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
      setNotice("Something went wrong. Please try again in a moment.");
    }
  };

  return (
    <div className="bg-[#fff9ef]">
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Contact Us"
            title="Reach the restaurant team, book a table, or plan a private dinner."
            description="This layout mirrors the reference contact page with a location block, telephone reservations, a booking form, and a map."
          />

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-6">
              <div className="rounded-[2rem] border border-[#eadfce] bg-white p-8 shadow-[0_20px_60px_rgba(63,51,31,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Our Location</p>
                <h3 className="mt-4 font-serif text-3xl text-[#2a241a]">{storeAddress || "3 E 19th St, 123 Fifth Avenue, NY 10160, New York, USA"}</h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#63584b]">
                  {storeName} welcomes guests for lunch, dinner, and private celebrations. Call ahead or use the form on the right to reserve your table.
                </p>

                <div className="mt-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Telephone Reservations</p>
                  <div className="mt-3 space-y-2 text-sm leading-7 text-[#4d4338]">
                    <p>{storePhone || "Phone (555) 555-1234"}</p>
                    <p>reservations@{storeSlug}.com</p>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Opening hours</p>
                  <div className="mt-3 space-y-2 text-sm leading-7 text-[#4d4338]">
                    <p>Monday-Friday 9:00 AM - 10:00 PM</p>
                    <p>Saturday 9:00 AM - 18:00 PM</p>
                    <p>Sunday Closed</p>
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
              <form onSubmit={submit} className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
                  <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email address" className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
                </div>
                <textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Your message" rows={7} className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={status === "sending"} className="inline-flex items-center rounded-full bg-[#243226] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#6b8d49] disabled:opacity-50">
                    {status === "sending" ? "Sending..." : "Send Message"}
                    <Send className="ml-2 h-4 w-4" />
                  </button>
                  {notice && <span className={`text-sm ${status === "error" ? "text-red-600" : "text-[#52614f]"}`}>{notice}</span>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function VegetableReservationPage({ storeName, storeSlug }: PageProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    persons: "2",
    reservationDay: "Monday",
    hour: "7:00 pm",
    email: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [notice, setNotice] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setNotice("");

    try {
      const response = await fetch(`/api/storefront/${storeSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email || `${form.phone.replace(/[^\d]/g, "") || "reservation"}@example.com`,
          subject: "Reservation Request",
          message: `Name: ${form.name}\nPhone: ${form.phone}\nPersons: ${form.persons}\nDay: ${form.reservationDay}\nHour: ${form.hour}`,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to send reservation");
      setStatus("success");
      setNotice("Reservation request sent. We’ll confirm shortly.");
      setForm({ name: "", phone: "", persons: "2", reservationDay: "Monday", hour: "7:00 pm", email: "" });
    } catch {
      setStatus("error");
      setNotice("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-[#fff9ef]">
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f7756]">Reservations</p>
          <h1 className="mt-4 font-serif text-5xl tracking-tight text-[#2a241a]">Book your table online now.</h1>
          <p className="mt-4 text-sm leading-7 text-[#63584b]">Fill in the details below and our team will follow up to confirm your reservation.</p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_20px_60px_rgba(63,51,31,0.08)] sm:p-8">
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name *" className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
              <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone *" className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
              <input value={form.persons} onChange={(event) => setForm((current) => ({ ...current, persons: event.target.value }))} placeholder="Number of Persons *" className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select value={form.reservationDay} onChange={(event) => setForm((current) => ({ ...current, reservationDay: event.target.value }))} className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]">
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => <option key={day}>{day}</option>)}
              </select>
              <select value={form.hour} onChange={(event) => setForm((current) => ({ ...current, hour: event.target.value }))} className="rounded-2xl border border-[#d9d2c5] bg-[#fcfaf4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7fa06f]">
                {["10:00 am", "11:00 am", "12:00 pm", "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm", "5:00 pm", "6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm"].map((hour) => <option key={hour}>{hour}</option>)}
              </select>
            </div>
            <button type="submit" disabled={status === "sending"} className="inline-flex items-center justify-center rounded-full bg-[#243226] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#6b8d49] disabled:opacity-50">
              {status === "sending" ? "Sending..." : "Make Reservation"}
            </button>
            {notice && <p className={`text-sm ${status === "error" ? "text-red-600" : "text-[#52614f]"}`}>{notice}</p>}
          </form>
        </div>
      </section>
    </div>
  );
}
