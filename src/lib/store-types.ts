/**
 * Predefined store/business types for AfroStore.
 * Used in store creation, AI generation, and filtering.
 */

export interface StoreType {
  id: string;
  name: string;
  emoji: string;
  description: string;
  keywords: string[]; // helps AI generate better content
}

export const storeTypes: StoreType[] = [
  {
    id: "fashion",
    name: "Fashion & Clothing",
    emoji: "👗",
    description: "Clothing, shoes, accessories, and fashion items",
    keywords: ["apparel", "wears", "shoes", "bags", "accessories", "ankara", "ready-to-wear"],
  },
  {
    id: "electronics",
    name: "Electronics & Gadgets",
    emoji: "📱",
    description: "Phones, laptops, gadgets, and accessories",
    keywords: ["phones", "laptops", "gadgets", "tech", "chargers", "earbuds", "smart devices"],
  },
  {
    id: "beauty",
    name: "Beauty & Skincare",
    emoji: "💄",
    description: "Cosmetics, skincare, haircare, and beauty products",
    keywords: ["skincare", "makeup", "cosmetics", "haircare", "beauty", "organic", "glow"],
  },
  {
    id: "food",
    name: "Food & Groceries",
    emoji: "🍽️",
    description: "Groceries, snacks, meals, spices, and food items",
    keywords: ["groceries", "snacks", "spices", "meals", "drinks", "organic food", "provisions"],
  },
  {
    id: "health",
    name: "Health & Wellness",
    emoji: "💪",
    description: "Supplements, fitness gear, health products",
    keywords: ["supplements", "vitamins", "fitness", "wellness", "herbal", "health"],
  },
  {
    id: "home",
    name: "Home & Furniture",
    emoji: "🏠",
    description: "Furniture, décor, kitchenware, and home essentials",
    keywords: ["furniture", "décor", "kitchen", "bedding", "home", "interior", "appliances"],
  },
  {
    id: "books",
    name: "Books & Stationery",
    emoji: "📚",
    description: "Books, journals, stationery, and educational materials",
    keywords: ["books", "stationery", "journals", "pens", "educational", "school supplies"],
  },
  {
    id: "kids",
    name: "Baby & Kids",
    emoji: "👶",
    description: "Baby products, kids clothing, toys, and essentials",
    keywords: ["baby", "kids", "toys", "children", "diapers", "baby food", "school items"],
  },
  {
    id: "sports",
    name: "Sports & Outdoor",
    emoji: "⚽",
    description: "Sportswear, equipment, camping, and outdoor gear",
    keywords: ["sports", "fitness", "outdoor", "jerseys", "gym", "camping", "exercise"],
  },
  {
    id: "auto",
    name: "Auto & Vehicles",
    emoji: "🚗",
    description: "Car parts, accessories, and vehicle products",
    keywords: ["car parts", "auto", "vehicle", "accessories", "tires", "engine", "spare parts"],
  },
  {
    id: "art",
    name: "Art & Crafts",
    emoji: "🎨",
    description: "Handmade goods, artwork, crafts, and creative supplies",
    keywords: ["art", "crafts", "handmade", "paintings", "beads", "adire", "pottery"],
  },
  {
    id: "jewelry",
    name: "Jewelry & Watches",
    emoji: "💎",
    description: "Rings, necklaces, watches, and luxury accessories",
    keywords: ["jewelry", "gold", "silver", "watches", "necklaces", "rings", "bracelets"],
  },
  {
    id: "phones",
    name: "Phone Accessories",
    emoji: "📲",
    description: "Cases, chargers, screen protectors, and mobile accessories",
    keywords: ["phone cases", "chargers", "screen protectors", "earphones", "power banks"],
  },
  {
    id: "digital",
    name: "Digital Products",
    emoji: "💻",
    description: "E-books, courses, software, and digital downloads",
    keywords: ["ebooks", "courses", "templates", "software", "digital", "downloads"],
  },
  {
    id: "agriculture",
    name: "Agriculture & Farm",
    emoji: "🌾",
    description: "Farm produce, seeds, equipment, and agro products",
    keywords: ["farm", "seeds", "produce", "agro", "poultry", "livestock", "harvest"],
  },
  {
    id: "services",
    name: "Services",
    emoji: "🛠️",
    description: "Professional services — cleaning, repairs, consulting, etc.",
    keywords: ["services", "cleaning", "repairs", "consulting", "freelance", "professional"],
  },
  {
    id: "general",
    name: "General Store",
    emoji: "🏪",
    description: "Multi-category store selling various products",
    keywords: ["general", "variety", "multi-category", "everything"],
  },
];

export function getStoreType(id: string): StoreType | undefined {
  return storeTypes.find((t) => t.id === id);
}

export function getStoreTypeLabel(id: string): string {
  const t = getStoreType(id);
  return t ? `${t.emoji} ${t.name}` : id;
}
