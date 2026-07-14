/**
 * Fashion Template — Sample Blog Posts
 * Created as real Blog records when merchant picks the Fashion template.
 * Matches the original WoodMart Fashion template blog posts.
 */

export interface SampleBlog {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
}

export const FASHION_SAMPLE_BLOGS: SampleBlog[] = [
  {
    title: "Exterior ideas: 10 colored garden seats",
    slug: "exterior-ideas-10-colored-garden-seats",
    excerpt: "A sed a risusat luctus esta anibh rhoncus hendrerit blandit nam rutrum sitmiad hac. Crass a vestibul...",
    content: "A sed a risusat luctus esta anibh rhoncus hendrerit blandit nam rutrum sitmiad hac. Crass a vestibulum massa a at lacinia. Phasellus a felis at est dictum vestibulum quisque ullamcorper a scelerisque dictum parturient duis.\n\nA suspendisse sed parturient condimentum adipiscing a a velit vestibulum ullamcorper purus parturient nec a adipiscing arcu ante sed. Fames interdum scelerisque phasellus suspendisse vestibulum eros volutpat eu adipiscing vestibulum.\n\nA faucibus ullamcorper metus class suspendisse scelerisque dui a eget amet pulvinar purus elementum scelerisque massa cursus dolor turpis facilisis a adipiscing penatibus.",
    coverImage: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=600&fit=crop",
    author: "S. Rogers",
    category: "Design trends",
    tags: ["furniture", "style"],
  },
  {
    title: "How to choose the perfect summer outfit",
    slug: "how-to-choose-the-perfect-summer-outfit",
    excerpt: "Discover the latest summer fashion trends and learn how to put together the perfect outfit for any warm-weather occasion...",
    content: "Discover the latest summer fashion trends and learn how to put together the perfect outfit for any warm-weather occasion.\n\nSummer is the perfect time to experiment with bold colours, light fabrics, and statement accessories. Whether you're heading to a beach party, a rooftop dinner, or just a casual day out, your outfit should reflect confidence and comfort.\n\nStart with breathable fabrics like linen, cotton, and chambray. These materials keep you cool while looking effortlessly chic. Pair a flowy midi skirt with a tucked-in blouse for a look that transitions seamlessly from day to night.\n\nDon't forget accessories — a wide-brimmed hat, oversized sunglasses, and strappy sandals can elevate even the simplest outfit. And when it comes to colours, this season is all about pastels, earth tones, and vibrant tropical prints.",
    coverImage: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop",
    author: "Style Team",
    category: "Fashion Trends",
    tags: ["summer", "outfits", "style"],
  },
  {
    title: "Building a capsule wardrobe: The complete guide",
    slug: "building-a-capsule-wardrobe-the-complete-guide",
    excerpt: "Learn how to create a versatile wardrobe with just 30 essential pieces that mix and match for any occasion...",
    content: "A capsule wardrobe is a curated collection of essential clothing items that don't go out of fashion. These versatile pieces can be mixed and matched to create a variety of outfits suitable for any occasion.\n\nThe concept was popularised by Susie Faux, a London boutique owner, in the 1970s. The idea is simple: invest in fewer, higher-quality pieces that you truly love and that work together harmoniously.\n\nStart by identifying your personal style. Look through your current wardrobe and note which pieces you wear most often. These items likely reflect your true preferences.\n\nA good capsule wardrobe typically includes:\n- 2-3 pairs of well-fitted jeans or trousers\n- 5-7 tops in neutral and complementary colours\n- 2-3 dresses\n- 1-2 blazers or jackets\n- 2 pairs of versatile shoes\n- A few key accessories\n\nThe key is quality over quantity. Each piece should be something you feel confident wearing.",
    coverImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop",
    author: "Fashion Team",
    category: "Style Guide",
    tags: ["capsule wardrobe", "tips", "essentials"],
  },
  {
    title: "Top accessories trends this season",
    slug: "top-accessories-trends-this-season",
    excerpt: "From chunky gold chains to minimalist leather bags, discover which accessories are dominating the fashion scene...",
    content: "Accessories can make or break an outfit. This season, the fashion world is embracing a mix of bold statement pieces and understated elegance.\n\nChunky gold chains continue to dominate, adding instant glamour to any look. Layer multiple necklaces of varying lengths for maximum impact, or let a single bold piece be the star of your outfit.\n\nMinimalist leather bags in earthy tones are another key trend. Think structured crossbody bags, soft hobo styles, and compact clutches in shades of tan, olive, and cream.\n\nOversized sunglasses are making a strong comeback. Choose frames that complement your face shape — round faces look great in angular frames, while square faces suit rounder styles.\n\nDon't overlook the power of a good belt. Whether it's a thin leather belt to cinch a dress or a chunky chain belt to add edge to jeans, this accessory is having a major moment.",
    coverImage: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&h=600&fit=crop",
    author: "S. Rogers",
    category: "Accessories",
    tags: ["accessories", "trends", "fashion"],
  },
];
