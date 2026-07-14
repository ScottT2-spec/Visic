import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * T-Shirts & Prints Template Page Presets
 * Using new rich content block types with EXACT content from hardcoded JSX
 * Content extracted verbatim from page components - no placeholders
 */

export const TSHIRTS_PRINTS_ABOUT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "tshirt-about-hero",
    type: "tshirtAboutHero",
    props: {
      subtitle: "About us",
      title: "Welcome to Print Studio",
      description: "Your go-to destination for high-quality custom prints! Since 2016, we've been transforming t-shirts, sweatshirts, and mugs into unique works of art whether for businesses, special events, or personal expressions.",
    },
  },
  {
    id: "tshirt-about-features",
    type: "tshirtFeatureCards",
    props: {
      columns: 2,
      features: [
        {
          title: "Premium Quality",
          description: "We use top-grade materials long-lasting inks.",
        },
        {
          title: "Eco-Friendly",
          description: "Our sustainable printing methods reduce waste.",
        },
        {
          title: "Fast & Reliable",
          description: "Custom mug or bulk orders for an event!",
        },
        {
          title: "Customization",
          description: "You can bring any idea to life with ease.",
        },
      ],
    },
  },
  {
    id: "tshirt-about-images",
    type: "tshirtImageCallout",
    props: {
      images: [
        "https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/02/ps-right-custom-design.jpg",
        "https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/06/ps-top-image-bg-1-min.jpg",
      ],
      calloutTitle: "You can create custom design",
      calloutDescription: "The price of a T-shirt with an individual design depends on the circulation, the number of images on one product, their size, and the printing method. brand, material and order urgency.",
      buttonText: "Create design",
      buttonLink: "/shop",
    },
  },
  {
    id: "tshirt-about-contact-form",
    type: "tshirtContactFormSection",
    props: {
      subtitle: "We are open for your questions",
      title: "We Are Open for Your Questions!",
      description: "Feel free to communicate with us",
      buttonText: "Ask a Question",
      showPhoneField: true,
      showCompanyField: true,
    },
  },
  {
    id: "tshirt-about-contact-info",
    type: "tshirtContactInfo",
    props: {
      title: "Contact Information",
      address: "1060 Cudahy Pl, San Diego",
      phone: "(686) 492-1041",
      email: "xtemos.studio@gmail.com",
      description: "Do you have questions about how we can help your company? Send us an email and we'll get in touch shortly.",
      socialLinks: [
        { platform: "Facebook", url: "#" },
        { platform: "X (Twitter)", url: "#" },
        { platform: "Instagram", url: "#" },
        { platform: "Youtube", url: "#" },
      ],
    },
  },
  {
    id: "tshirt-about-why-choose",
    type: "tshirtFeatureCards",
    props: {
      columns: 2,
      features: [
        {
          title: "Premium Quality",
          description: "We use top-grade materials long-lasting inks.",
        },
        {
          title: "Eco-Friendly",
          description: "Our sustainable printing methods reduce waste.",
        },
        {
          title: "Fast & Reliable",
          description: "Custom mug or bulk orders for an event!",
        },
        {
          title: "Customization",
          description: "You can bring any idea to life with ease.",
        },
      ],
    },
  },
];

export const TSHIRTS_PRINTS_CONTACT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "tshirt-contact-hero",
    type: "tshirtContactHero",
    props: {
      subtitle: "Contact us",
      title: "Ready to start something together? Get in touch.",
      contactInfo: {
        email: "xtemos.studio@gmail.com",
        phone: "(686) 492-1041",
        address: "1060 Cudahy Pl, San Diego",
        workingHours: "Mon - Fri 10:00am - 10:00pm",
      },
    },
  },
  {
    id: "tshirt-contact-form",
    type: "tshirtContactFormSection",
    props: {
      subtitle: "",
      title: "",
      description: "",
      buttonText: "Ask a Question",
      showPhoneField: true,
      showCompanyField: true,
    },
  },
];

export const TSHIRTS_PRINTS_SHOP_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "tshirt-shop-hero",
    type: "tshirtAboutHero",
    props: {
      subtitle: "Shop",
      title: "All Products",
      description: "Discover our collection of custom t-shirts, sweatshirts, and mugs with unique designs.",
    },
  },
  {
    id: "tshirt-shop-categories",
    type: "fashionCategoryCards",
    props: {
      sectionTitle: {
        subtitle: "EXPLORE",
        title: "Shop by Category",
      },
      categories: [
        { name: "T-Shirts", image: "https://woodmart.xtemos.com/t-shirts/wp-content/uploads/sites/29/2023/05/cat-1.jpg", link: "/shop" },
        { name: "Hoodies", image: "https://woodmart.xtemos.com/t-shirts/wp-content/uploads/sites/29/2023/05/cat-2.jpg", link: "/shop" },
        { name: "Sweatshirts", image: "https://woodmart.xtemos.com/t-shirts/wp-content/uploads/sites/29/2023/05/cat-3.jpg", link: "/shop" },
        { name: "Accessories", image: "https://woodmart.xtemos.com/t-shirts/wp-content/uploads/sites/29/2023/05/cat-4.jpg", link: "/shop" },
      ],
    },
  },
  {
    id: "tshirt-shop-products",
    type: "fashionProductGrid",
    props: {
      columns: 4,
      maxProducts: 12,
      filter: "all",
      sectionTitle: {
        title: "Products",
      },
    },
  },
];

export const TSHIRTS_PRINTS_BLOG_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "tshirt-blog-hero",
    type: "tshirtAboutHero",
    props: {
      subtitle: "Blog",
      title: "Latest Articles",
      description: "Browse the latest T-Shirts & Prints posts for styling tips, design ideas, and practical guides.",
    },
  },
  {
    id: "tshirt-blog-posts",
    type: "tshirtBlogPosts",
    props: {
      columns: 2,
      storeSlug: "",
      posts: [
        {
          id: "tshirts-blog-1",
          title: "The Art of Custom Printing: How to Make Your Design Stand Out",
          slug: "the-art-of-custom-printing-how-to-make-your-design-stand-out",
          excerpt:
            "Creating a custom print is more than just slapping an image on fabric-it's an art! In this post, we'll share expert design tips, from c...",
          badgeDay: "13",
          badgeMonth: "Feb",
          postedDate: "February 13, 2025",
          author: "Mr. Mackay",
          category: "Prints",
          image: "https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/02/ps-right-custom-design.jpg",
        },
        {
          id: "tshirts-blog-2",
          title: "T-Shirts vs. Sweatshirts: Which One Is Best for Your Custom Design?",
          slug: "t-shirts-vs-sweatshirts-which-one-is-best-for-your-custom-design",
          excerpt:
            "Not sure whether to print on a t-shirt or a sweatshirt? We break down the differences in material, durability, and print quality so you...",
          badgeDay: "30",
          badgeMonth: "Jan",
          postedDate: "January 30, 2025",
          author: "Mr. Mackay",
          category: "Prints",
          image: "https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/02/ps-top-image-bg-1-min.jpg",
        },
        {
          id: "tshirts-blog-3",
          title: "Mug Printing 101: The Secret to a Perfect Personalized Gift",
          slug: "mug-printing-101-the-secret-to-a-perfect-personalized-gift",
          excerpt:
            "Custom mugs make the perfect gift, but how do you make sure your design turns out just right? We'll walk you through everything from se...",
          badgeDay: "27",
          badgeMonth: "Jan",
          postedDate: "January 27, 2025",
          author: "Mr. Mackay",
          category: "Prints",
          image: "https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/02/ps-right-custom-design.jpg",
        },
        {
          id: "tshirts-blog-4",
          title: "Eco-Friendly Printing: How We Keep Your Designs Sustainable",
          slug: "eco-friendly-printing-how-we-keep-your-designs-sustainable",
          excerpt:
            "Want amazing prints without harming the planet? At Print Studio, we use eco-friendly inks and sustainable printing methods to minimize ...",
          badgeDay: "23",
          badgeMonth: "Jan",
          postedDate: "January 23, 2025",
          author: "Mr. Mackay",
          category: "Prints",
          image: "https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/02/ps-top-image-bg-1-min.jpg",
        },
        {
          id: "tshirts-blog-5",
          title: "5 Must-Know Trends in Custom Apparel Printing",
          slug: "5-must-know-trends-in-custom-apparel-printing",
          excerpt:
            "The world of custom printing is always evolving! From bold typography to minimalistic designs, we explore the hottest trends in apparel...",
          badgeDay: "16",
          badgeMonth: "Jan",
          postedDate: "January 16, 2025",
          author: "Mr. Mackay",
          category: "Prints",
          image: "https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/02/ps-right-custom-design.jpg",
        },
        {
          id: "tshirts-blog-6",
          title: "Behind the Scenes: How We Bring Your Prints to Life",
          slug: "behind-the-scenes-how-we-bring-your-prints-to-life",
          excerpt:
            "Ever wondered what goes into making your custom-printed apparel or mugs? Take a behind-the-scenes look at our production process-from p...",
          badgeDay: "09",
          badgeMonth: "Jan",
          postedDate: "January 9, 2025",
          author: "Mr. Mackay",
          category: "Prints",
          image: "https://woodmart.xtemos.com/t-shirts-prints/wp-content/uploads/sites/24/2025/02/ps-top-image-bg-1-min.jpg",
        },
      ],
    },
  },
  {
    id: "tshirt-blog-cta",
    type: "tshirtImageCallout",
    props: {
      images: [],
      calloutTitle: "You can create custom design",
      calloutDescription: "The price of a T-shirt with an individual design depends on the circulation, the number of images on one product, their size, and the printing method. brand, material and order urgency.",
      buttonText: "Create design",
      buttonLink: "/shop",
    },
  },
  {
    id: "tshirt-blog-contact-form",
    type: "tshirtContactFormSection",
    props: {
      subtitle: "",
      title: "We Are Open for Your Questions!",
      description: "Feel free to communicate with us",
      buttonText: "Ask a Question",
      showPhoneField: true,
      showCompanyField: true,
    },
  },
  {
    id: "tshirt-blog-contact-info",
    type: "tshirtContactInfo",
    props: {
      title: "Contact Information",
      address: "1060 Cudahy Pl, San Diego",
      phone: "(686) 492-1041",
      email: "xtemos.studio@gmail.com",
      description: "Do you have questions about how we can help your company? Send us an email and we'll get in touch shortly.",
      socialLinks: [
        { platform: "Facebook", url: "#" },
        { platform: "X (Twitter)", url: "#" },
        { platform: "Instagram", url: "#" },
        { platform: "Youtube", url: "#" },
      ],
    },
  },
];
