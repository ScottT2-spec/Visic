// Template catalog — maps extracted-templates/ HTML files to browsable templates

export interface TemplateMeta {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  previewImage: string; // og:image or fallback
  file: string; // relative path under extracted-templates/
  industries: string[]; // matching INDUSTRIES ids from new-site page
}

export const TEMPLATE_CATEGORIES = [
  { id: 'fashion', label: 'Fashion & Clothing' },
  { id: 'electronics', label: 'Electronics & Gadgets' },
  { id: 'beauty', label: 'Beauty & Skincare' },
  { id: 'food', label: 'Food & Restaurant' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'children', label: 'Children & Toys' },
  { id: 'beverage', label: 'Beverages' },
  { id: 'bakery', label: 'Bakery & Sweets' },
  { id: 'artsy', label: 'Art & Crafts' },
  { id: 'accessories', label: 'Accessories & Jewellery' },
  { id: 'digital-services', label: 'Digital Services' },
  { id: 'interior-design', label: 'Interior Design' },
  { id: 'food-grocery', label: 'Grocery' },
] as const;

export const TEMPLATES: TemplateMeta[] = [
  // Fashion
  { slug: 'fashion', name: 'Fashion', category: 'fashion', categoryLabel: 'Fashion & Clothing', description: 'Modern fashion store with bold imagery and clean product layouts', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'fashion/fashion.html', industries: ['fashion'] },
  { slug: 'fashion-colored', name: 'Fashion Color', category: 'fashion', categoryLabel: 'Fashion & Clothing', description: 'Vibrant colorful fashion store with eye-catching design', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'fashion/fashion-colored.html', industries: ['fashion'] },
  { slug: 'handmade-bags', name: 'Handmade Bags', category: 'fashion', categoryLabel: 'Fashion & Clothing', description: 'Artisan handmade bags and leather goods store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'fashion/handmade-bags.html', industries: ['fashion', 'art'] },
  { slug: 't-shirts-prints', name: 'T-Shirts & Prints', category: 'fashion', categoryLabel: 'Fashion & Clothing', description: 'Custom t-shirts and print-on-demand store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'fashion/t-shirts-prints.html', industries: ['fashion'] },

  // Electronics
  { slug: 'electronics', name: 'Electronics', category: 'electronics', categoryLabel: 'Electronics & Gadgets', description: 'Tech and electronics store with detailed product specs', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'electronics/electronics.html', industries: ['electronics'] },
  { slug: 'electronics-accessories', name: 'Tech Accessories', category: 'electronics', categoryLabel: 'Electronics & Gadgets', description: 'Phone cases, cables, and tech accessories store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'electronics/accessories.html', industries: ['electronics'] },
  { slug: 'hardware', name: 'Hardware', category: 'electronics', categoryLabel: 'Electronics & Gadgets', description: 'Computer hardware and components store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'electronics/hardware.html', industries: ['electronics'] },
  { slug: 'tools', name: 'Tools', category: 'electronics', categoryLabel: 'Electronics & Gadgets', description: 'Power tools and equipment store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'electronics/tools.html', industries: ['electronics', 'construction'] },

  // Beauty
  { slug: 'cosmetics', name: 'Cosmetics', category: 'beauty', categoryLabel: 'Beauty & Skincare', description: 'Premium cosmetics and skincare product store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'beauty/cosmetics.html', industries: ['beauty'] },
  { slug: 'makeup', name: 'Makeup', category: 'beauty', categoryLabel: 'Beauty & Skincare', description: 'Makeup and beauty products with glamorous design', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'beauty/makeup.html', industries: ['beauty'] },
  { slug: 'perfumes', name: 'Perfumes', category: 'beauty', categoryLabel: 'Beauty & Skincare', description: 'Luxury perfumes and fragrances store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'beauty/perfumes.html', industries: ['beauty'] },

  // Beverages
  { slug: 'drinks', name: 'Drinks', category: 'beverage', categoryLabel: 'Beverages', description: 'Beverage and drinks store with refreshing design', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'beverage/drinks.html', industries: ['food'] },
  { slug: 'wine', name: 'Wine', category: 'beverage', categoryLabel: 'Beverages', description: 'Wine and spirits store with elegant presentation', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'beverage/wine.html', industries: ['food'] },

  // Children
  { slug: 'kids', name: 'Kids', category: 'children', categoryLabel: 'Children & Toys', description: 'Children\'s clothing and accessories store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'children/kids.html', industries: ['fashion'] },
  { slug: 'toys', name: 'Toys', category: 'children', categoryLabel: 'Children & Toys', description: 'Toy store with playful and colorful design', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'children/toys.html', industries: ['other'] },

  // Bakery
  { slug: 'sweets-bakery', name: 'Bakery', category: 'bakery', categoryLabel: 'Bakery & Sweets', description: 'Bakery and sweets store with warm, inviting design', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'bakery/sweets-bakery.html', industries: ['food'] },

  // Artsy
  { slug: 'handmade', name: 'Handmade', category: 'artsy', categoryLabel: 'Art & Crafts', description: 'Handmade and artisan products marketplace', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'artsy/handmade.html', industries: ['art'] },
  { slug: 'pottery', name: 'Pottery', category: 'artsy', categoryLabel: 'Art & Crafts', description: 'Pottery and ceramics store with earthy aesthetic', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'artsy/pottery.html', industries: ['art'] },

  // Accessories
  { slug: 'jewellery', name: 'Jewellery', category: 'accessories', categoryLabel: 'Accessories & Jewellery', description: 'Elegant jewellery store with luxury presentation', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'accessories/jewellery-2.html', industries: ['fashion'] },

  // Digital Services
  { slug: 'event-agency', name: 'Event Agency', category: 'digital-services', categoryLabel: 'Digital Services', description: 'Event planning and agency website', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'digital-services/event-agency.html', industries: ['agency', 'services'] },
  { slug: 'food-delivery', name: 'Food Delivery', category: 'digital-services', categoryLabel: 'Digital Services', description: 'Food delivery service with ordering interface', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'digital-services/food-delivery.html', industries: ['food'] },

  // Interior Design
  { slug: 'decor', name: 'Decor', category: 'interior-design', categoryLabel: 'Interior Design', description: 'Home decor and interior design store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'interior-design/decor.html', industries: ['other'] },
  { slug: 'retail', name: 'Retail', category: 'interior-design', categoryLabel: 'Interior Design', description: 'Retail furniture and home goods store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'interior-design/retail.html', industries: ['other'] },

  // Food & Grocery
  { slug: 'grocery', name: 'Grocery', category: 'food-grocery', categoryLabel: 'Grocery', description: 'Online grocery store with fresh produce', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'food-grocery/grocery.html', industries: ['food'] },
  { slug: 'vegetables', name: 'Vegetables', category: 'food-grocery', categoryLabel: 'Grocery', description: 'Farm-fresh vegetables and organic produce store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'food-grocery/vegetables.html', industries: ['food'] },

  // Health
  { slug: 'pills', name: 'Health & Supplements', category: 'health', categoryLabel: 'Health & Wellness', description: 'Health supplements and pharmacy store', previewImage: 'https://woodmart.xtemos.com/wp-content/uploads/2021/08/01_theme-preview.__large_preview.jpg', file: 'health/pills.html', industries: ['health'] },
];

export function getTemplateBySlug(slug: string): TemplateMeta | undefined {
  return TEMPLATES.find(t => t.slug === slug);
}

export function getTemplatesByCategory(category: string): TemplateMeta[] {
  return TEMPLATES.filter(t => t.category === category);
}

export function getTemplatesByIndustry(industry: string): TemplateMeta[] {
  return TEMPLATES.filter(t => t.industries.includes(industry));
}
