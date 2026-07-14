import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

const THEMES = [
  // Restaurant themes
  {
    name: "Panno — Restaurant",
    slug: "panno-restaurant",
    description: "Elegant restaurant theme with warm tones, smooth typography, and a food-focused layout. Perfect for restaurants, cafés, and fine dining.",
    category: "Restaurant",
    industry: "Food & Dining",
    isFeatured: true,
    preview: "https://panno-demo1.myshopify.com/",
    config: {
      colors: { primary: "#2D2926", accent: "#C8A96E", headerBg: "#FFFFFF", footerBg: "#1A1714" },
      fonts: { heading: "Playfair Display", body: "Inter" },
      layout: { style: "elegant", heroStyle: "fullscreen-image" },
    },
    tags: ["restaurant", "food", "elegant", "warm", "dining"],
  },
  {
    name: "Bakery Delight",
    slug: "bakery-delight",
    description: "Sweet and inviting bakery theme with soft pastels and playful elements. Ideal for bakeries, patisseries, and dessert shops.",
    category: "Restaurant",
    industry: "Food & Dining",
    isFeatured: true,
    preview: "https://bakery-demo1.myshopify.com/",
    config: {
      colors: { primary: "#D4956A", accent: "#F5E6D3", headerBg: "#FFF9F5", footerBg: "#3D2B1F" },
      fonts: { heading: "Merriweather", body: "Lato" },
      layout: { style: "warm", heroStyle: "split-image" },
    },
    tags: ["bakery", "pastry", "sweet", "warm", "food"],
  },

  // Accessories
  {
    name: "Veppo — Accessories",
    slug: "veppo-accessories",
    description: "Clean and modern accessories theme with bold product focus. Great for jewelry, watches, bags, and fashion accessories.",
    category: "Accessories",
    industry: "Fashion & Accessories",
    isFeatured: true,
    preview: "https://veppo-demo3.myshopify.com/",
    config: {
      colors: { primary: "#1A1A1A", accent: "#B8860B", headerBg: "#FFFFFF", footerBg: "#111111" },
      fonts: { heading: "Montserrat", body: "Open Sans" },
      layout: { style: "minimal", heroStyle: "product-hero" },
    },
    tags: ["accessories", "jewelry", "watches", "modern", "minimal"],
  },

  // Children shop
  {
    name: "LilNest — Kids Store",
    slug: "lilnest-kids",
    description: "Playful and colorful children's store theme. Bright colors, rounded elements, and fun layouts for kids' clothing, toys, and essentials.",
    category: "Children",
    industry: "Kids & Baby",
    isFeatured: true,
    preview: "https://dt-lilnest.myshopify.com/",
    config: {
      colors: { primary: "#FF6B9D", accent: "#FFD93D", headerBg: "#FFFFFF", footerBg: "#2D2D2D" },
      fonts: { heading: "Quicksand", body: "Nunito" },
      layout: { style: "playful", heroStyle: "colorful-banner" },
    },
    tags: ["kids", "children", "baby", "toys", "playful", "colorful"],
  },
  {
    name: "Jollys — Children",
    slug: "jollys-children",
    description: "Fun and vibrant children's shop theme with animated elements and engaging product displays. Perfect for toy stores and kids' fashion.",
    category: "Children",
    industry: "Kids & Baby",
    isFeatured: false,
    preview: "https://qx-jollys.myshopify.com/",
    config: {
      colors: { primary: "#4ECDC4", accent: "#FF6B6B", headerBg: "#FFFFFF", footerBg: "#2C3E50" },
      fonts: { heading: "Poppins", body: "Nunito Sans" },
      layout: { style: "fun", heroStyle: "animated-banner" },
    },
    tags: ["kids", "children", "toys", "fun", "vibrant"],
  },

  // Product & Services
  {
    name: "Fabulous Ishi — Products",
    slug: "fabulous-ishi-products",
    description: "Sophisticated product showcase theme with clean grid layouts and premium feel. Ideal for curated product collections and service-based businesses.",
    category: "Products & Services",
    industry: "General",
    isFeatured: true,
    preview: "https://fabulous-ishi.myshopify.com/",
    config: {
      colors: { primary: "#2C3E50", accent: "#E67E22", headerBg: "#FFFFFF", footerBg: "#1A252F" },
      fonts: { heading: "Raleway", body: "Source Sans Pro" },
      layout: { style: "professional", heroStyle: "centered-text" },
    },
    tags: ["products", "services", "professional", "clean", "showcase"],
  },
  {
    name: "Cluum — Services",
    slug: "cluum-services",
    description: "Modern service-oriented theme with sleek sections and clear call-to-actions. Great for digital products, SaaS, and service businesses.",
    category: "Products & Services",
    industry: "Digital & Services",
    isFeatured: false,
    preview: "https://cluum-demo1.myshopify.com/",
    config: {
      colors: { primary: "#6C5CE7", accent: "#00B894", headerBg: "#FFFFFF", footerBg: "#2D3436" },
      fonts: { heading: "DM Sans", body: "Inter" },
      layout: { style: "modern", heroStyle: "gradient-hero" },
    },
    tags: ["services", "digital", "modern", "saas", "clean"],
  },

  // Interior Design
  {
    name: "Fabulous Ishi — Interior",
    slug: "fabulous-ishi-interior",
    description: "Elegant interior design theme with muted tones and gallery-style product displays. Perfect for furniture, home décor, and interior design stores.",
    category: "Interior Design",
    industry: "Home & Living",
    isFeatured: true,
    preview: "https://fabulous-ishi.myshopify.com/",
    config: {
      colors: { primary: "#5D4E37", accent: "#C4A77D", headerBg: "#FAF8F5", footerBg: "#2C2419" },
      fonts: { heading: "Cormorant Garamond", body: "Jost" },
      layout: { style: "gallery", heroStyle: "fullscreen-image" },
    },
    tags: ["interior", "furniture", "home", "decor", "elegant", "gallery"],
  },

  // Fashion
  {
    name: "Lusion — Fashion",
    slug: "lusion-fashion",
    description: "High-end fashion theme with bold typography, editorial layouts, and runway-inspired design. For fashion brands, boutiques, and designer stores.",
    category: "Fashion",
    industry: "Fashion & Apparel",
    isFeatured: true,
    preview: "https://lusion2.myshopify.com/",
    config: {
      colors: { primary: "#000000", accent: "#D4AF37", headerBg: "#FFFFFF", footerBg: "#000000" },
      fonts: { heading: "Cormorant", body: "Karla" },
      layout: { style: "editorial", heroStyle: "fullscreen-video" },
    },
    tags: ["fashion", "luxury", "editorial", "boutique", "high-end"],
  },
  {
    name: "Nou — Shoes",
    slug: "nou-shoes",
    description: "Sleek footwear theme with dynamic product imagery and modern grid layouts. Designed for shoe stores, sneaker shops, and footwear brands.",
    category: "Fashion",
    industry: "Footwear",
    isFeatured: true,
    preview: "https://nou-shoes.myshopify.com/?fts=0",
    config: {
      colors: { primary: "#1B1B1B", accent: "#FF4136", headerBg: "#FFFFFF", footerBg: "#111111" },
      fonts: { heading: "Bebas Neue", body: "Roboto" },
      layout: { style: "dynamic", heroStyle: "product-showcase" },
    },
    tags: ["shoes", "footwear", "sneakers", "sporty", "dynamic"],
  },
  {
    name: "Fashion Workdo",
    slug: "fashion-workdo",
    description: "Versatile fashion theme with clean aesthetics and flexible layouts. Great for clothing stores, fashion brands, and multi-category apparel shops.",
    category: "Fashion",
    industry: "Fashion & Apparel",
    isFeatured: false,
    preview: "https://fashion-workdo.myshopify.com/",
    config: {
      colors: { primary: "#333333", accent: "#E8B4B8", headerBg: "#FFFFFF", footerBg: "#222222" },
      fonts: { heading: "Josefin Sans", body: "Work Sans" },
      layout: { style: "versatile", heroStyle: "slideshow" },
    },
    tags: ["fashion", "clothing", "apparel", "versatile", "clean"],
  },
];

// GET /api/admin/themes/seed — seed all template themes
export async function GET(req: NextRequest) {
  // Only allow with admin key or in development
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (key !== "afro-seed-2026" && process.env.NODE_ENV === "production") {
    return error("Unauthorized", 401);
  }

  try {
    const results = [];

    for (const theme of THEMES) {
      const existing = await prisma.theme.findUnique({ where: { slug: theme.slug } });
      if (existing) {
        // Update existing
        const updated = await prisma.theme.update({
          where: { slug: theme.slug },
          data: {
            name: theme.name,
            description: theme.description,
            category: theme.category,
            industry: theme.industry,
            isFeatured: theme.isFeatured,
            preview: theme.preview,
            config: theme.config as any,
            tags: theme.tags,
            isActive: true,
          },
        });
        results.push({ action: "updated", slug: updated.slug });
      } else {
        const created = await prisma.theme.create({
          data: {
            name: theme.name,
            slug: theme.slug,
            description: theme.description,
            category: theme.category,
            industry: theme.industry,
            isFeatured: theme.isFeatured,
            preview: theme.preview,
            config: theme.config as any,
            tags: theme.tags,
            isActive: true,
          },
        });
        results.push({ action: "created", slug: created.slug });
      }
    }

    return success({ seeded: results.length, results });
  } catch (err: any) {
    console.error("Theme seed error:", err);
    return error(`Failed to seed themes: ${err?.message || String(err)}`, 500);
  }
}
