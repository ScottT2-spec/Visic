// ─── BUILDER BLOCK TYPES ─────────────────────────────────────

export type BlockType =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "hero"
  | "spacer"
  | "divider"
  | "columns"
  | "productGrid"
  | "testimonial"
  | "testimonials"
  | "features"
  | "faq"
  | "contactForm"
  | "contactInfo"
  | "video"
  | "countdown"
  | "trustBadges"
  | "stats"
  | "newsletter"
  | "banner"
  | "imageText"
  | "gallery"
  | "team"
  | "brands"
  | "fashionHeroSlider"
  | "fashionPromoBanners"
  | "fashionSectionTitle"
  | "fashionProductGrid"
  | "fashionCategoryCards"
  | "fashionTestimonials"
  | "fashionBlogPosts"
  | "fashionNewsletter"
  | "cosmeticsHeroSlider"
  | "cosmeticsPromoBanners"
  | "cosmeticsSectionTitle"
  | "cosmeticsProductGrid"
  | "cosmeticsCategoryCards"
  | "cosmeticsDiscovery"
  | "cosmeticsCountdownBanner"
  | "cosmeticsInfoBoxes"
  | "cosmeticsBlogPosts"
  | "cosmeticsNewsletter"
  | "cosmeticsInstagram";

export interface BuilderBlock {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
}

// ─── DEFAULT PROPS PER BLOCK TYPE ────────────────────────────

export const blockDefaults: Record<BlockType, () => Record<string, unknown>> = {
  heading: () => ({
    text: "Your Heading",
    level: "h2",
    align: "left",
    color: "#171717",
    fontSize: "2xl",
  }),
  text: () => ({
    text: "Enter your text here. Click to edit.",
    align: "left",
    color: "#525252",
    fontSize: "base",
  }),
  image: () => ({
    src: "",
    alt: "Image description",
    width: "full",
    rounded: "xl",
  }),
  button: () => ({
    text: "Click Me",
    href: "#",
    variant: "primary",
    align: "left",
    size: "md",
  }),
  hero: () => ({
    heading: "Welcome to Our Store",
    subheading: "Discover amazing products at great prices",
    buttonText: "Shop Now",
    buttonHref: "#",
    bgColor: "#1B2B4B",
    textColor: "#ffffff",
    align: "center",
  }),
  spacer: () => ({
    height: 40,
  }),
  divider: () => ({
    color: "#e5e5e5",
    thickness: 1,
    style: "solid",
  }),
  columns: () => ({
    columns: 2,
    gap: 4,
    children: [
      { id: crypto.randomUUID(), type: "text" as BlockType, props: { text: "Column 1 content", align: "left", color: "#525252", fontSize: "base" } },
      { id: crypto.randomUUID(), type: "text" as BlockType, props: { text: "Column 2 content", align: "left", color: "#525252", fontSize: "base" } },
    ],
  }),
  productGrid: () => ({
    title: "Featured Products",
    columns: 3,
    limit: 6,
    showPrice: true,
    category: "",
  }),
  testimonial: () => ({
    name: "Happy Customer",
    role: "Verified Buyer",
    text: "This product is amazing! Great quality and fast delivery.",
    rating: 5,
    avatar: "",
  }),
  features: () => ({
    title: "Why Choose Us",
    items: [
      { icon: "truck", title: "Fast Delivery", desc: "Get your order in 24-48 hours" },
      { icon: "shield", title: "Secure Payments", desc: "100% secure checkout" },
      { icon: "headphones", title: "24/7 Support", desc: "We're always here to help" },
    ],
  }),
  faq: () => ({
    title: "Frequently Asked Questions",
    items: [
      { question: "How do I place an order?", answer: "Simply browse our products, add to cart, and checkout." },
      { question: "What payment methods do you accept?", answer: "We accept card payments, bank transfers, and mobile money." },
      { question: "How long does delivery take?", answer: "Delivery typically takes 24-48 hours within Lagos." },
    ],
  }),
  contactForm: () => ({
    title: "Get in Touch",
    subtitle: "We'd love to hear from you",
    fields: ["name", "email", "message"],
    buttonText: "Send Message",
  }),
  video: () => ({
    url: "",
    title: "Watch Our Story",
    autoplay: false,
  }),
  countdown: () => ({
    title: "Flash Sale Ends In",
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    bgColor: "#1B2B4B",
    textColor: "#ffffff",
  }),
  trustBadges: () => ({
    items: [
      { icon: "shield", label: "Secure Checkout" },
      { icon: "truck", label: "Free Shipping" },
      { icon: "refresh", label: "Easy Returns" },
      { icon: "headphones", label: "24/7 Support" },
    ],
  }),
  testimonials: () => ({
    title: "What Our Customers Say",
    subtitle: "Real reviews from real customers",
    bgColor: "transparent",
    items: [
      { name: "Amara Okafor", text: "Absolutely love the quality! Fast delivery too.", role: "Verified Buyer", rating: 5 },
      { name: "Kwesi Mensah", text: "Great products and excellent customer service.", role: "Repeat Customer", rating: 5 },
      { name: "Fatima Ibrahim", text: "Best shopping experience I've had online.", role: "First-time Buyer", rating: 5 },
    ],
  }),
  stats: () => ({
    title: "Our Impact",
    bgColor: "brand",
    items: [
      { value: "5,000+", label: "Happy Customers", icon: "users" },
      { value: "10,000+", label: "Orders Delivered", icon: "package" },
      { value: "4.9", label: "Average Rating", icon: "star" },
      { value: "24/7", label: "Customer Support", icon: "headphones" },
    ],
  }),
  newsletter: () => ({
    title: "Stay Updated",
    subtitle: "Subscribe to get the latest offers and updates.",
    bgColor: "surface",
  }),
  banner: () => ({
    title: "Special Offer",
    subtitle: "Get 20% off your first order",
    buttonText: "Shop Now",
    buttonHref: "#",
    bgColor: "brand",
  }),
  imageText: () => ({
    title: "Our Story",
    text: "We started with a simple mission: to bring the best products to our customers.",
    image: "",
    imageAlt: "",
    reverse: false,
    badge: "About Us",
    buttonText: "Learn More",
    buttonHref: "#",
  }),
  contactInfo: () => ({
    title: "Contact Information",
    items: [
      { icon: "mail", title: "Email", value: "hello@store.com" },
      { icon: "phone", title: "Phone", value: "+234 800 000 0000" },
      { icon: "map-pin", title: "Address", value: "Lagos, Nigeria" },
      { icon: "message", title: "WhatsApp", value: "+234 800 000 0000" },
    ],
    hours: "Monday - Saturday, 9:00 AM - 6:00 PM",
  }),
  gallery: () => ({
    title: "Gallery",
    images: [],
  }),
  team: () => ({
    title: "Meet Our Team",
    subtitle: "The people behind the brand",
    members: [
      { name: "John Doe", role: "Founder & CEO" },
      { name: "Jane Smith", role: "Head of Design" },
      { name: "Mike Johnson", role: "Operations Manager" },
    ],
  }),
  brands: () => ({
    title: "Trusted By",
    names: ["Brand A", "Brand B", "Brand C", "Brand D", "Brand E"],
  }),
  fashionHeroSlider: () => ({
    autoplaySpeed: 5000,
    minHeight: "560px",
    slides: [
      { subtitle: "YOUR FAVOURITE STORE", titleLine1: "Blondes with minimalistic", titleLine2: "tendencies to vintage", description: "Discover our latest collection of handpicked fashion essentials.", buttonText: "SHOP NOW", buttonLink: "/shop", backgroundImage: "", textPosition: "center", colorScheme: "dark" },
      { subtitle: "NEW ARRIVALS", titleLine1: "Fashionable fit trend style", titleLine2: "best sport man wear", description: "Explore trending styles curated for every occasion.", buttonText: "SHOP NOW", buttonLink: "/shop", backgroundImage: "", textPosition: "center", colorScheme: "dark" },
    ],
  }),
  fashionPromoBanners: () => ({
    banners: [
      { image: "", subtitle: "SUMMER NEW", title: "AMAZING\nFASHION", buttonText: "Shop Now", buttonLink: "/shop", textAlign: "right" },
      { image: "", subtitle: "BEST NEW", title: "STYLISH\nFASHION", buttonText: "Shop Now", buttonLink: "/shop", textAlign: "center" },
      { image: "", subtitle: "NEW 2024", title: "FASHION\nSTYLE", buttonText: "Shop Now", buttonLink: "/shop", textAlign: "left" },
    ],
  }),
  fashionSectionTitle: () => ({
    subtitle: "WELCOME TO OUR STORE",
    title: "SECTION TITLE",
    description: "Add a description for this section.",
    align: "center",
    maxWidth: "40%",
  }),
  fashionProductGrid: () => ({
    columns: 4,
    showCategory: true,
    showHoverImage: true,
    marginBottom: "60px",
    sectionTitle: { subtitle: "WELCOME TO OUR STORE", title: "FEATURED PRODUCTS", description: "Handpicked items from our latest collections." },
    products: [],
  }),
  fashionCategoryCards: () => ({
    columns: 4,
    marginBottom: "50px",
    sectionTitle: { subtitle: "WELCOME TO OUR STORE", title: "OUR CATEGORIES", description: "Browse through our collections." },
    categories: [
      { name: "Category 1", image: "", productCount: 0, link: "/shop" },
      { name: "Category 2", image: "", productCount: 0, link: "/shop" },
      { name: "Category 3", image: "", productCount: 0, link: "/shop" },
      { name: "Category 4", image: "", productCount: 0, link: "/shop" },
    ],
  }),
  fashionTestimonials: () => ({
    title: "CUSTOMERS REVIEWS",
    backgroundImage: "",
    testimonials: [
      { avatar: "", text: "Great quality and fast shipping!", name: "Customer Name", role: "Verified Buyer", rating: 5 },
      { avatar: "", text: "Love the products, will order again.", name: "Customer Name", role: "Loyal Customer", rating: 5 },
    ],
  }),
  fashionBlogPosts: () => ({
    columns: 2,
    marginBottom: "30px",
    sectionTitle: { subtitle: "WELCOME TO OUR STORE", title: "OUR LATEST NEWS", description: "Stay updated with the latest trends." },
    posts: [
      { image: "", title: "Blog Post Title", excerpt: "Post excerpt goes here...", date: { day: "01", month: "Jan" }, categories: ["Fashion"], author: { name: "Author" }, link: "/blog", commentCount: 0 },
    ],
  }),
  fashionNewsletter: () => ({
    subtitle: "STAY CONNECTED",
    title: "REGISTER FOR OUR NEWSLETTER",
    description: "Sign up for news about our latest arrivals.",
    buttonText: "Sign up",
    socialLinks: [
      { platform: "facebook", url: "#" },
      { platform: "instagram", url: "#" },
    ],
  }),
  // ─── COSMETICS TEMPLATE DEFAULTS ─────────────────────────────
  cosmeticsHeroSlider: () => ({
    autoplaySpeed: 5000,
    minHeight: "560px",
    slides: [
      { subtitle: "Commodo", titleLine1: "The Best Natural", titleLine2: "& Organic Mascara.", description: "There are many variations of passages of Lorem Ipsum available.", buttonText: "View More", buttonLink: "/shop", secondButtonText: "Read more", secondButtonLink: "/about" },
    ],
  }),
  cosmeticsPromoBanners: () => ({
    banners: [
      { image: "", title: "REVITALIZING\nFACE MASKS", description: "It is a long established fact that a reader will be distracted.", buttonText: "SHOP NOW", buttonLink: "/shop" },
    ],
  }),
  cosmeticsSectionTitle: () => ({
    subtitle: "",
    title: "Section Title",
    description: "",
    align: "center",
    maxWidth: "50%",
  }),
  cosmeticsProductGrid: () => ({
    columns: 4,
    maxProducts: 8,
    filter: "featured",
    showCategory: true,
    showHoverImage: true,
    sectionTitle: { subtitle: "", title: "PRODUCTS" },
    products: [],
  }),
  cosmeticsCategoryCards: () => ({
    sectionTitle: { title: "SHOP BY CATEGORY" },
    categories: [
      { name: "Category", image: "", productCount: 0, link: "/shop" },
    ],
  }),
  cosmeticsDiscovery: () => ({
    title: "Discover a beautiful you",
    description: "There are many variations of passages of Lorem Ipsum available.",
    image: "",
    features: [
      { icon: "✨", titleLine1: "Lasting", titleLine2: "Formulas" },
    ],
    buttonText: "SHOP NOW",
    buttonLink: "/shop",
    secondButtonText: "READ MORE",
    secondButtonLink: "/about",
  }),
  cosmeticsCountdownBanner: () => ({
    title: "Special Offer",
    description: "The generated Lorem Ipsum is therefore always free from repetition.",
    image: "",
    buttonText: "SHOP NOW",
    buttonLink: "/shop",
    secondButtonText: "READ MORE",
    secondButtonLink: "/about",
  }),
  cosmeticsInfoBoxes: () => ({
    sectionTitle: { title: "WHY CHOOSE US" },
    boxes: [
      { image: "", number: "01", title: "Feature Title", description: "Feature description goes here." },
    ],
  }),
  cosmeticsBlogPosts: () => ({
    columns: 2,
    sectionTitle: { subtitle: "OUR BLOG", title: "LATEST NEWS" },
    posts: [],
  }),
  cosmeticsNewsletter: () => ({
    backgroundImage: "",
    title: "JOIN OUR NEWSLETTER",
    description: "Will be used in accordance with our Privacy Policy",
    buttonText: "Sign up",
  }),
  cosmeticsInstagram: () => ({
    items: [],
    marginBottom: "0px",
  }),
};

// ─── BLOCK PALETTE ───────────────────────────────────────────

export interface PaletteItem {
  type: BlockType;
  label: string;
  icon: string;
  category: "basic" | "layout" | "commerce" | "social" | "marketing";
}

export const blockPalette: PaletteItem[] = [
  { type: "heading", label: "Heading", icon: "type", category: "basic" },
  { type: "text", label: "Text", icon: "align-left", category: "basic" },
  { type: "image", label: "Image", icon: "image", category: "basic" },
  { type: "button", label: "Button", icon: "mouse-pointer", category: "basic" },
  { type: "spacer", label: "Spacer", icon: "move-vertical", category: "basic" },
  { type: "divider", label: "Divider", icon: "minus", category: "basic" },
  { type: "video", label: "Video", icon: "play", category: "basic" },
  { type: "hero", label: "Hero Section", icon: "layout", category: "layout" },
  { type: "columns", label: "Columns", icon: "columns", category: "layout" },
  { type: "features", label: "Features Grid", icon: "grid", category: "layout" },
  { type: "imageText", label: "Image + Text", icon: "image", category: "layout" },
  { type: "gallery", label: "Gallery", icon: "image", category: "layout" },
  { type: "productGrid", label: "Product Grid", icon: "shopping-bag", category: "commerce" },
  { type: "countdown", label: "Countdown", icon: "clock", category: "commerce" },
  { type: "banner", label: "Promo Banner", icon: "zap", category: "commerce" },
  { type: "testimonial", label: "Testimonial", icon: "message-circle", category: "social" },
  { type: "testimonials", label: "Testimonials Grid", icon: "message-circle", category: "social" },
  { type: "faq", label: "FAQ", icon: "help-circle", category: "social" },
  { type: "contactForm", label: "Contact Form", icon: "mail", category: "social" },
  { type: "contactInfo", label: "Contact Info", icon: "map-pin", category: "social" },
  { type: "team", label: "Team", icon: "users", category: "social" },
  { type: "stats", label: "Stats Counter", icon: "trending-up", category: "marketing" },
  { type: "newsletter", label: "Newsletter", icon: "send", category: "marketing" },
  { type: "trustBadges", label: "Trust Badges", icon: "shield", category: "marketing" },
  { type: "brands", label: "Brand Logos", icon: "globe", category: "marketing" },
  // Fashion Template Blocks
  { type: "fashionHeroSlider", label: "Fashion Hero Slider", icon: "layout", category: "layout" },
  { type: "fashionPromoBanners", label: "Fashion Promo Banners", icon: "image", category: "commerce" },
  { type: "fashionSectionTitle", label: "Fashion Section Title", icon: "type", category: "basic" },
  { type: "fashionProductGrid", label: "Fashion Products", icon: "shopping-bag", category: "commerce" },
  { type: "fashionCategoryCards", label: "Fashion Categories", icon: "grid", category: "commerce" },
  { type: "fashionTestimonials", label: "Fashion Testimonials", icon: "message-circle", category: "social" },
  { type: "fashionBlogPosts", label: "Fashion Blog Posts", icon: "layout", category: "social" },
  { type: "fashionNewsletter", label: "Fashion Newsletter", icon: "send", category: "marketing" },
  // Cosmetics Template Blocks
  { type: "cosmeticsHeroSlider", label: "Cosmetics Hero Slider", icon: "layout", category: "layout" },
  { type: "cosmeticsPromoBanners", label: "Cosmetics Promo Banners", icon: "image", category: "commerce" },
  { type: "cosmeticsSectionTitle", label: "Cosmetics Section Title", icon: "type", category: "basic" },
  { type: "cosmeticsProductGrid", label: "Cosmetics Products", icon: "shopping-bag", category: "commerce" },
  { type: "cosmeticsCategoryCards", label: "Cosmetics Categories", icon: "grid", category: "commerce" },
  { type: "cosmeticsDiscovery", label: "Cosmetics Discovery", icon: "sparkles", category: "layout" },
  { type: "cosmeticsCountdownBanner", label: "Cosmetics Countdown", icon: "clock", category: "commerce" },
  { type: "cosmeticsInfoBoxes", label: "Cosmetics Info Boxes", icon: "shield", category: "layout" },
  { type: "cosmeticsBlogPosts", label: "Cosmetics Blog Posts", icon: "layout", category: "social" },
  { type: "cosmeticsNewsletter", label: "Cosmetics Newsletter", icon: "send", category: "marketing" },
  { type: "cosmeticsInstagram", label: "Cosmetics Instagram", icon: "image", category: "social" },
];
