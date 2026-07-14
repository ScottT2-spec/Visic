/**
 * Fashion Template — Sample Products
 * These get created as real products in the merchant's store when they pick the Fashion template.
 * Merchants can edit or delete them from their Products dashboard, just like Shopify.
 */

export interface SampleProduct {
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stock?: number;
  isFeatured?: boolean;
  tags?: string[];
  position?: number;
  images?: string[];
}

export const FASHION_SAMPLE_PRODUCTS: SampleProduct[] = [
  // ── Featured Products ──────────────────────────────────
  {
    name: "White Bow Back Shirt",
    slug: "white-bow-back-shirt",
    description: "Elegant white shirt with a decorative bow detail on the back. Perfect for casual and semi-formal occasions.",
    price: 199,
    stock: 15,
    isFeatured: true,
    tags: ["featured", "new-arrival"],
    position: 1,
    images: [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=700&fit=crop",
    ],
  },
  {
    name: "Mint Floral Blouse",
    slug: "mint-floral-blouse",
    description: "Fresh mint-colored blouse with delicate floral patterns. Lightweight and breathable for warm days.",
    price: 199,
    compareAtPrice: 249,
    stock: 8,
    isFeatured: true,
    tags: ["featured", "sale"],
    position: 2,
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=700&fit=crop",
    ],
  },
  {
    name: "Fuller Bust Shirt",
    slug: "fuller-bust-shirt",
    description: "Designed for comfort and style with a fuller bust fit. Made from premium cotton with a modern cut.",
    price: 149,
    stock: 20,
    isFeatured: true,
    tags: ["featured"],
    position: 3,
    images: [
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=700&fit=crop",
    ],
  },
  {
    name: "Check Shirt with Ruffle",
    slug: "check-shirt-with-ruffle",
    description: "Classic check pattern with playful ruffle details. A standout piece for any wardrobe.",
    price: 85,
    stock: 25,
    isFeatured: true,
    tags: ["featured"],
    position: 4,
    images: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=700&fit=crop",
    ],
  },
  {
    name: "Lace Insert Shirt",
    slug: "lace-insert-shirt",
    description: "Sophisticated shirt with elegant lace inserts. Perfect for evening outings and special occasions.",
    price: 99,
    stock: 12,
    isFeatured: true,
    tags: ["featured"],
    position: 5,
    images: [
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&h=700&fit=crop",
    ],
  },
  {
    name: "Bardot Puff Sleeve",
    slug: "bardot-puff-sleeve",
    description: "Trendy off-shoulder design with dramatic puff sleeves. Makes a statement at any event.",
    price: 120,
    stock: 10,
    isFeatured: true,
    tags: ["featured", "new-arrival"],
    position: 6,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=700&fit=crop",
    ],
  },
  {
    name: "Fluted Crop Top",
    slug: "fluted-crop-top",
    description: "Modern crop top with a fluted hem. Pairs beautifully with high-waisted skirts and trousers.",
    price: 66,
    stock: 30,
    isFeatured: true,
    tags: ["featured"],
    position: 7,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=700&fit=crop",
    ],
  },
  {
    name: "Stripe Bow Back Top",
    slug: "stripe-bow-back-top",
    description: "Playful striped top with a charming bow at the back. Casual yet stylish for everyday wear.",
    price: 75,
    stock: 18,
    isFeatured: true,
    tags: ["featured"],
    position: 8,
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=700&fit=crop",
    ],
  },

  // ── Bestsellers ────────────────────────────────────────
  {
    name: "Contrast Collar Blouse",
    slug: "contrast-collar-blouse",
    description: "Elegant blouse with a contrasting collar detail. A customer favorite for its versatile styling.",
    price: 85,
    stock: 22,
    isFeatured: false,
    tags: ["bestseller"],
    position: 9,
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=700&fit=crop",
    ],
  },
  {
    name: "Wrap Front Top",
    slug: "wrap-front-top",
    description: "Flattering wrap-front design that suits every body type. Our most reordered item.",
    price: 45,
    stock: 35,
    isFeatured: false,
    tags: ["bestseller"],
    position: 10,
    images: [
      "https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=600&h=700&fit=crop",
    ],
  },
  {
    name: "Floral Midi Dress",
    slug: "floral-midi-dress",
    description: "Beautiful floral midi dress perfect for brunches, dates, and garden parties.",
    price: 159,
    stock: 14,
    isFeatured: false,
    tags: ["bestseller", "new-arrival"],
    position: 11,
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=700&fit=crop",
    ],
  },
  {
    name: "Classic Denim Jacket",
    slug: "classic-denim-jacket",
    description: "Timeless denim jacket that goes with everything. A wardrobe essential for all seasons.",
    price: 220,
    stock: 10,
    isFeatured: false,
    tags: ["bestseller"],
    position: 12,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=700&fit=crop",
    ],
  },
];
