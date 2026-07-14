import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Vegetables Template Page Presets
 * Using new rich content block types with EXACT content from hardcoded JSX
 * Content extracted verbatim from VegetableTemplatePages components - no placeholders
 */

export const VEGETABLE_HOME_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "vegetable-hero",
    type: "vegetableHero",
    props: {
      subtitle: "Good Place. Good Food.",
      title: "A really good place to eat in the city.",
      description: "Fresh produce, warm hospitality, and a refined dining room come together in a calm, elegant home page inspired by the reference deli layout.",
      primaryButtonText: "View Menu",
      primaryButtonLink: "/menu",
      secondaryButtonText: "Scroll Down",
      secondaryButtonLink: "/contact#reservation-form",
      images: [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=1200&fit=crop",
      ],
    },
  },
  {
    id: "vegetable-features",
    type: "vegetableFeatures",
    props: {
      subtitle: "Discover the Atmosphere",
      title: "Discover the good atmosphere of the restaurant.",
      description: "Natural materials, quiet textures, and a fresh seasonal menu create a dining room that feels easy to return to.",
      features: [
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
      ],
    },
  },
  {
    id: "vegetable-menu",
    type: "vegetableMenu",
    props: {
      subtitle: "Our Menu",
      title: "Get relaxed. Eat.",
      description: "Seasonal plates and signature dishes presented in a warm, easy-to-scan layout that stays elegant on mobile and desktop.",
      buttonText: "View All Menu",
      buttonLink: "/menu",
      items: [
        { name: "Lemon and Garlic Green Beans", price: 15, description: "Lemon / Garlic / Beans" },
        { name: "Bacon-wrapped Shrimp with Garlic", price: 21.5, description: "Bacon / Shrimp / Garlic" },
        { name: "Lamb Beef Kofta Skewers with Tzatziki", price: 18.5, description: "Lamb / Wine / Butter" },
        { name: "Imported Oysters Grill (5 Pieces)", price: 20, description: "Oysters / Veggie / Ginger" },
      ],
    },
  },
];

export const VEGETABLE_MENU_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "vegetable-menu-sections",
    type: "vegetableMenuSections",
    props: {
      sections: [
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
      ],
      currency: "USD",
    },
  },
];

export const VEGETABLE_RECIPE_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "vegetable-recipe-grid",
    type: "vegetableRecipeGrid",
    props: {
      subtitle: "Recipe Notes",
      title: "Simple, beautiful recipes from the same seasonal kitchen.",
      description: "A curated grid of recipes, organized by category and designed to feel light, editorial, and easy to scan on every screen size.",
      categories: ["All", "Seasonal", "Soups", "Small Plates", "Mains", "Desserts"],
      recipes: [
        { title: "Charred Broccolini with Chili Oil", category: "Seasonal", time: "20 min", difficulty: "Easy", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&h=900&fit=crop", price: 18 },
        { title: "Herb-Forward Tomato Stew", category: "Soups", time: "35 min", difficulty: "Easy", image: "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=900&h=900&fit=crop", price: 18 },
        { title: "Crispy Potato Galette", category: "Small Plates", time: "40 min", difficulty: "Medium", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=900&h=900&fit=crop", price: 18 },
        { title: "Green Lentil Bowl", category: "Mains", time: "30 min", difficulty: "Easy", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&h=900&fit=crop", price: 18 },
        { title: "Stone Fruit Tart", category: "Desserts", time: "55 min", difficulty: "Medium", image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=900&h=900&fit=crop", price: 18 },
        { title: "Roasted Carrot Salad", category: "Seasonal", time: "25 min", difficulty: "Easy", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&h=900&fit=crop", price: 18 },
      ],
      currency: "USD",
      storeSlug: "",
    },
  },
];

export const VEGETABLE_ABOUT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "vegetable-about-hero",
    type: "vegetableAboutHero",
    props: {
      subtitle: "About Us",
      title: "A seasonal kitchen shaped by the field, the fire, and the table.",
      description: "{storeName} brings a calm, elegant restaurant experience to produce-led cooking. We source closely, plate simply, and serve food that feels both nourishing and special.",
      stats: [
        { value: "12+", label: "Years of cooking" },
        { value: "36", label: "Local growers" },
        { value: "4.9/5", label: "Guest rating" },
      ],
      images: [
        "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=900&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&h=700&fit=crop",
      ],
      philosophyText: "Seasonal ingredients, warm hospitality, and a room designed to feel quiet, modern, and memorable.",
    },
  },
  {
    id: "vegetable-team",
    type: "vegetableTeam",
    props: {
      subtitle: "The Team",
      title: "People who care about the plate.",
      description: "A compact team of chefs, hosts, and managers focused on consistency, flavor, and hospitality.",
      team: [
        { name: "Amina Rivera", role: "Executive Chef", image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900&h=1100&fit=crop" },
        { name: "Noah Patel", role: "Pastry Chef", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&h=1100&fit=crop" },
        { name: "Leah Kim", role: "Restaurant Manager", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=1100&fit=crop" },
      ],
    },
  },
];

export const VEGETABLE_CONTACT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "vegetable-contact",
    type: "vegetableContact",
    props: {
      subtitle: "Contact Us",
      title: "Reach the restaurant team, book a table, or plan a private dinner.",
      description: "This layout mirrors the reference contact page with a location block, telephone reservations, a booking form, and a map.",
      address: "3 E 19th St, 123 Fifth Avenue, NY 10160, New York, USA",
      addressDescription: "{storeName} welcomes guests for lunch, dinner, and private celebrations. Call ahead or use the form on the right to reserve your table.",
      phone: "(555) 555-1234",
      email: "reservations@{storeSlug}.com",
      openingHours: [
        "Monday-Friday 9:00 AM - 10:00 PM",
        "Saturday 9:00 AM - 18:00 PM",
        "Sunday Closed",
      ],
      storeSlug: "",
    },
  },
];

export const VEGETABLE_RESERVATION_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "vegetable-reservation",
    type: "vegetableReservation",
    props: {
      subtitle: "Reservations",
      title: "Book your table online now.",
      description: "Fill in the details below and our team will follow up to confirm your reservation.",
      storeSlug: "",
    },
  },
];
