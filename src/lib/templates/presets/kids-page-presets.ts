import type { TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";

/**
 * Kids Template Page Presets
 * Using new rich content block types with EXACT content from hardcoded JSX
 * Content extracted verbatim from page components - no placeholders
 */

export const KIDS_ABOUT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "kids-about-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Sign up for our newsletter to get 10% off for the week!",
      link: "#newsletter",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "kids-about-header",
    type: "kidsHeader",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
  {
    id: "kids-about-hero",
    type: "kidsAboutHero",
    props: {
      subtitle: "About Us",
      title: "We create organic clothes for babies",
      bodyText: [
        "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarks grove right at the coast of the Semantics, a large language ocean. Far far away, behind the word mountains, far from the countries Vokalia, there live the blind texts.",
        "Separated they live in Bookmarks grove right at the coast of the Semantics.",
      ],
      images: [
        "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&h=480&fit=crop",
      ],
      calloutText: "Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure show.",
      calloutLabel: "Meet our team",
    },
  },
  {
    id: "kids-about-team",
    type: "kidsTeamSection",
    props: {
      sectionTitle: {
        subtitle: "",
        title: "",
      },
      team: [
        { name: "Darlene Robertson", role: "Director" },
        { name: "Kathryn Murphy", role: "Marketing manager" },
        { name: "Jenny Wilson", role: "Product designer" },
        { name: "Kristin Watson", role: "CEO" },
      ],
    },
  },
  {
    id: "kids-about-how-we-work",
    type: "kidsTextSection",
    props: {
      sectionTitle: {
        subtitle: "How we work",
        title: "How we work",
      },
      bodyText: [
        "If that's what you think how bout the other way around? How can you evaluate content without design? No typography, no colors, no layout, no styles, all those things that convey the important signals that go beyond the mere textual, hierarchies of information, weight, emphasis, oblique stresses, priorities, all those subtle cues that also have visual and emotional.",
        "Accept that it's sometimes okay to focus just on the content or just on the design. Rigid proponents of content strategy may shun the use of dummy copy but then designers might want to ask them to provide style sheets with the copy decks they supply that are in tune with the design direction they require. Using dummy content or fake information in the Web design.",
      ],
      backgroundColor: "#faf8f5",
    },
  },
  {
    id: "kids-about-what-we-do",
    type: "kidsTextSection",
    props: {
      sectionTitle: {
        subtitle: "What we do",
        title: "What we do",
      },
      bodyText: [
        "Accept that it's sometimes okay to focus just on the content or just on the design. Rigid proponents of content strategy may shun the use of dummy copy but then designers might want to ask them to provide style sheets with the copy decks they supply that are in tune with the design direction they require. Using dummy content or fake information in the Web design.",
      ],
      backgroundColor: "transparent",
    },
  },
  {
    id: "kids-about-faq",
    type: "kidsFaqSection",
    props: {
      sectionTitle: {
        subtitle: "What we do",
        title: "What we do",
      },
      subtitle: "We get a lot of questions about our course. You can get any answers.",
      faqs: [
        {
          question: "Why choose organic cotton fabrics and certified factories?",
          answer: "A seemingly elegant design can quickly begin to bloat with unexpected content or break under the weight of actual activity. Fake data can ensure a nice looking layout but it doesn't reflect what a living, breathing application must endure. Real data does.",
        },
        {
          question: "How is your product packaged?",
          answer: "Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure that you can show different text, different data using the same template. When it's about controlling hundreds of articles, product pages for web shops.",
        },
        {
          question: "What's the best size to buy for a baby shower gift?",
          answer: "If the copy becomes distracting in the design then you are doing something wrong or they are discussing copy changes. It might be a bit annoying but you could tell them that that discussion would be best suited for another time. At worst the discussion is at least working towards the final goal of your site where questions about lorem ipsum don't.",
        },
      ],
    },
  },
  {
    id: "kids-about-footer",
    type: "kidsFooter",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
];

export const KIDS_CONTACT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "kids-contact-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Sign up for our newsletter to get 10% off for the week!",
      link: "#newsletter",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "kids-contact-header",
    type: "kidsHeader",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
  {
    id: "kids-contact-hero",
    type: "kidsContactHero",
    props: {
      address: "913 Wyandotte St, Kansas City, MO 64105, United States",
      showMapLink: true,
    },
  },
  {
    id: "kids-contact-info",
    type: "kidsContactInfo",
    props: {
      phone: "(064) 332-1233",
      hours: "9:00am - 5:00pm",
      days: "Monday - Friday",
      socialLinks: {
        facebook: "#",
        twitter: "#",
        instagram: "#",
        youtube: "#",
      },
      showMapLink: true,
    },
  },
  {
    id: "kids-contact-form",
    type: "kidsContactForm",
    props: {
      title: "Get in touch",
    },
  },
  {
    id: "kids-contact-hours",
    type: "kidsOpeningHours",
    props: {
      title: "Monday - Friday",
      hours: [
        { label: "Hours", value: "9:00am - 5:00pm" },
        { label: "Support", value: "(064) 332-1233" },
        { label: "Address", value: "Kansas City, MO" },
      ],
      infoText: "Based on WoodMart theme 2025 WooCommerce Themes.",
      links: [
        { label: "Visit the blog", href: "/blog" },
        { label: "Shop the collection", href: "/shop" },
      ],
      storeSlug: "kids-store",
    },
  },
  {
    id: "kids-contact-footer",
    type: "kidsFooter",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
];

export const KIDS_BLOG_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "kids-blog-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Sign up for our newsletter to get 10% off for the week!",
      link: "#newsletter",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "kids-blog-header",
    type: "kidsHeader",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
  {
    id: "kids-blog-hero",
    type: "kidsAboutHero",
    props: {
      subtitle: "Kids Blog",
      title: "Ideas, stories, and cheerful inspiration",
      bodyText: [
        "Browse the latest Kids demo posts for styling tips, playful gift ideas, and practical guides for parents.",
      ],
      images: [],
      calloutText: "",
      calloutLabel: "",
    },
  },
  {
    id: "kids-blog-grid",
    type: "kidsBlogPosts",
    props: {
      columns: 3,
      sectionTitle: {
        title: "Latest Articles",
      },
      posts: [],
    },
  },
  {
    id: "kids-blog-footer",
    type: "kidsFooter",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
];

export const KIDS_SHOP_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "kids-shop-announcement",
    type: "kidsAnnouncementBar",
    props: {
      text: "Sign up for our newsletter to get 10% off for the week!",
      link: "#newsletter",
      backgroundColor: "#f5857c",
    },
  },
  {
    id: "kids-shop-header",
    type: "kidsHeader",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
  {
    id: "kids-shop-hero",
    type: "kidsAboutHero",
    props: {
      subtitle: "Kids Shop",
      title: "All Products",
      bodyText: [
        "Discover playful clothing, gifts, and everyday essentials from the Kids collection.",
      ],
      images: [],
      calloutText: "",
      calloutLabel: "",
    },
  },
  {
    id: "kids-shop-categories",
    type: "kidsCategoryCards",
    props: {
      sectionTitle: {
        subtitle: "Shop",
        title: "Shop by category",
      },
      categories: [
        { name: "Growsuits", image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&h=400&fit=crop", productCount: 12, link: "/shop" },
        { name: "Jumpers", image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=400&fit=crop", productCount: 8, link: "/shop" },
        { name: "Toys", image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300&h=400&fit=crop", productCount: 15, link: "/shop" },
        { name: "Accessories", image: "https://images.unsplash.com/photo-1566454419290-57a0589c9b17?w=300&h=400&fit=crop", productCount: 10, link: "/shop" },
        { name: "Dresses", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300&h=400&fit=crop", productCount: 9, link: "/shop" },
        { name: "Leggings", image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=300&h=400&fit=crop", productCount: 7, link: "/shop" },
      ],
    },
  },
  {
    id: "kids-shop-grid",
    type: "kidsProductGrid",
    props: {
      columns: 4,
      maxProducts: 12,
      filter: "all",
      sectionTitle: {
        title: "Products",
      },
    },
  },
  {
    id: "kids-shop-footer",
    type: "kidsFooter",
    props: {
      storeName: "Kids Store",
      storeSlug: "kids-store",
    },
  },
];
