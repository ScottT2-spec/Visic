import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { HandmadeBagsHeader, HandmadeBagsFooter } from "@/components/storefront/HandmadeBagsStoreChrome";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { applyPageCustomization, buildPageBackgroundStyle, filterVisiblePages, getResolvedPageSettings, normalizeSiteCustomization, type SiteCustomizationDocument } from "@/lib/site-customization";
import { parsePageContent } from "@/lib/page-content";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { serializeProductsForClient } from "@/lib/serialize-products";
import { RETAIL_CONTACT_BLOCKS } from "@/lib/templates/presets/retail-pages";
import { VegetableContactPage } from "@/components/storefront/VegetableTemplatePages";
import { VegetableFooter, VegetableHeader } from "@/components/storefront/VegetableStoreChrome";
import { KidsFontLoader, KidsFooterFull, KidsHeader } from "@/components/storefront/KidsTemplateBlocks";
import PerfumesContactPage from "./perfumes-contact";
import { HealthHeader, HealthFooterFull } from "@/components/storefront/HealthTemplateBlocks";
import { GardenHeader, GardenFooter } from "@/components/storefront/GardenStoreChrome";

type Props = {
  params: Promise<{ slug: string }>;
};

/* Contact page blocks - matching Handmade Bags template style (fallback if no custom content) */
const CONTACT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "contact-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "CONTACT US",
          titleLine1: "Get in",
          titleLine2: "Touch",
          description: "We'd love to hear from you. Whether you have a question about our products, need assistance with an order, or just want to say hello.",
          buttonText: "Shop Collection",
          buttonLink: "/shop",
          colorScheme: "dark",
          textPosition: "center",
          backgroundImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=900&fit=crop",
        },
      ],
      minHeight: "550px",
      autoplaySpeed: 0,
    },
  },
  {
    id: "contact-marquee",
    type: "fashionMarquee",
    props: {
      items: [
        { text: "24/7 Support", icon: "✦" },
        { text: "Fast Response", icon: "✦" },
        { text: "Expert Help", icon: "✦" },
        { text: "Satisfaction Guaranteed", icon: "✦" },
      ],
      speed: "50s",
      gap: "60px",
      backgroundColor: "transparent",
      textColor: "#242424",
      fontSize: "28px",
      fontWeight: "600",
      paddingY: "25px",
      borderTop: "1px solid #c27843",
      marginBottom: "0px",
    },
  },
  {
    id: "contact-intro",
    type: "fashionSectionTitle",
    props: {
      subtitle: "REACH OUT",
      title: "We're Here to Help",
      description: "Our dedicated customer service team is available to assist you with any questions or concerns. We typically respond within 24 hours.",
      align: "center",
      maxWidth: "60%",
      marginBottom: "60px",
    },
  },
  {
    id: "contact-info",
    type: "fashionFeatures",
    props: {
      columns: 3,
      marginBottom: "70px",
      features: [
        {
          number: "📍",
          title: "Visit Our Store",
          description: "451 Wall Street, UK, London. Come visit our flagship store and experience our craftsmanship firsthand.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "📞",
          title: "Call Us",
          description: "(064) 332-1233. Our customer service team is available Monday through Friday, 9am to 6pm.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "✉️",
          title: "Email Us",
          description: "support@handmadebags.com. Send us an email anytime and we'll get back to you within 24 hours.",
          buttonText: "",
          buttonLink: "",
        },
      ],
    },
  },
  {
    id: "contact-form-section",
    type: "fashionSectionTitle",
    props: {
      subtitle: "SEND A MESSAGE",
      title: "We'd Love to Hear From You",
      description: "Fill out the form below and we'll get back to you as soon as possible.",
      align: "center",
      maxWidth: "50%",
      marginBottom: "50px",
    },
  },
  {
    id: "contact-cta",
    type: "fashionNewsletter",
    props: {
      subtitle: "QUICK RESPONSE",
      title: "Need Immediate Assistance?",
      description: "For urgent matters, please call our customer service hotline or reach out via WhatsApp for faster response.",
      buttonText: "Call Now",
      backgroundColor: "#c27843",
      socialLinks: [],
    },
  },
];

async function getStoreData(slug: string) {
  const store = await prisma.site.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { slug },
        { subdomain: slug },
        { customDomain: slug },
      ],
    },
    include: {
      customizations: true,
      socialLinks: true,
      templates: {
        include: {
          template: true,
        },
        where: {
          isActive: true,
        },
        take: 1,
      },
      pages: {
        where: { slug: "contact" },
        take: 1,
      },
    },
  });

  if (!store) return null;

  // Auto-create Contact page if it doesn't exist
  if (!store.pages || store.pages.length === 0) {
    try {
      await prisma.page.create({
        data: {
          siteId: store.id,
          title: "Contact Us",
          slug: "contact",
          type: "CUSTOM",
          content: [],
          isPublished: true,
          position: 12,
        },
      });
      // Re-fetch to include the newly created page
      store.pages = await prisma.page.findMany({
        where: { siteId: store.id, slug: "contact" },
        take: 1,
      });
    } catch (error) {
      console.error("Failed to auto-create Contact page:", error);
    }
  }

  // Get products for the store
  const products = await prisma.product.findMany({
    where: { siteId: store.id, status: "ACTIVE" },
    include: {
      images: true,
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Get blog posts
  const blogs = await prisma.blog.findMany({
    where: { siteId: store.id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 10,
  });

  return { store, products, blogs };
}

export default async function ContactPage({ params }: Props) {
  const { slug } = await params;
  const data = await getStoreData(slug);

  if (!data) notFound();

  const { store, products, blogs } = data;

  const activeTemplateSlug = store.templates?.[0]?.template?.slug || null;
  const isTShirtsPrintsTemplate =
    activeTemplateSlug === "t-shirts-prints" ||
    slug === "t-shirts-prints" ||
    store.slug === "t-shirts-prints" ||
    store.name?.toLowerCase().includes("t-shirts");

  if (isTShirtsPrintsTemplate) {
    redirect(`/store/${slug}/contact-us`);
  }

  // Serialize products to convert Decimal values to plain numbers for client components
  const serializedProducts = serializeProductsForClient(products);

  const customization = normalizeSiteCustomization(store.customizations as any);
  const visiblePages = filterVisiblePages(store.pages || [], customization);
  const customizedPages = visiblePages.map((page: any) => applyPageCustomization(page, customization));
  const contactPage = customizedPages.find((p: any) => p.slug === "contact");
  
  // Use custom blocks if available, otherwise use preset
  let pageContent;
  const parsedContact = contactPage?.content ? parsePageContent(contactPage.content) : null;
  if (parsedContact && parsedContact.blocks.length > 0) {
    pageContent = parsedContact;
  } else {
    pageContent = { blocks: CONTACT_PAGE_BLOCKS, settings: {} };
  }

  const pageSettings = contactPage ? getResolvedPageSettings(contactPage, pageContent.settings, customization) : {};
  const themeData: ThemeData = {
    id: "kids-contact-page",
    name: "Kids Contact Page",
    slug: "kids-contact-page",
    config: {
      colors: {
        primary: customization?.themeSettings?.colors?.primary || "#c27843",
        secondary: customization?.themeSettings?.colors?.secondary || "#242424",
        accent: customization?.themeSettings?.colors?.accent || "#767676",
        background: customization?.themeSettings?.colors?.background || "#ffffff",
        text: customization?.themeSettings?.colors?.text || "#242424",
      },
    },
  };

  const isKidsTemplate =
    activeTemplateSlug === "kids" ||
    slug === "kids" ||
    store.slug === "kids" ||
    store.name?.toLowerCase().includes("kids");

  if (isKidsTemplate) {
    const parsedContact = contactPage?.content ? parsePageContent(contactPage.content) : null;
    const hasBlocks = parsedContact && parsedContact.blocks.length > 0;
    const kidsSocialLinks: Array<{ platform: string; url: string }> = [
      ...(store.socialLinks?.facebook ? [{ platform: "facebook", url: store.socialLinks.facebook }] : []),
      ...(store.socialLinks?.instagram ? [{ platform: "instagram", url: store.socialLinks.instagram }] : []),
      ...(store.socialLinks?.twitter ? [{ platform: "twitter", url: store.socialLinks.twitter }] : []),
      ...(store.socialLinks?.tiktok ? [{ platform: "tiktok", url: store.socialLinks.tiktok }] : []),
      ...(store.socialLinks?.whatsapp ? [{ platform: "whatsapp", url: store.socialLinks.whatsapp }] : []),
    ];

    return (
      <div className="min-h-screen bg-[#fffef8] text-[#3b3344]">
        <KidsFontLoader />
        {hasBlocks ? (
          <RenderTemplateBlocks blocks={parsedContact.blocks as TemplateBlock[]} />
        ) : (
          <>
            <KidsHeader
              storeName={store.name}
              storeSlug={slug}
              logo={store.logo}
              templateSlug="kids"
              cartCount={0}
              wishlistCount={0}
            />
            <main>
              <section className="bg-gradient-to-br from-[#fff7df] via-[#fffdf4] to-[#ffeef1] px-4 py-16">
                <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                  <div>
                    <h1 className="max-w-xl font-serif text-4xl leading-tight text-[#3b3344] sm:text-5xl">
                      913 Wyandotte St, Kansas City, MO 64105, United States
                    </h1>
                    <div className="mt-6 rounded-[32px] bg-white p-6 shadow-[0_18px_40px_rgba(59,51,68,0.06)]">
                      <Link href="#map" className="mt-3 inline-flex text-sm font-semibold text-[#f5857c]">
                        Show on a map
                      </Link>
                      <div className="mt-6 space-y-2 text-sm text-[#6d6277]">
                        <p>Call Us: (064) 332-1233</p>
                        <p>Hours: 9:00am - 5:00pm</p>
                        <p>Monday - Friday</p>
                      </div>
                    <div className="mt-6 flex gap-3 text-[#3b3344]">
                      {[
                        { label: "f", href: store.socialLinks?.facebook || "#" },
                        { label: "𝕏", href: store.socialLinks?.twitter || "#" },
                        { label: "📷", href: store.socialLinks?.instagram || "#" },
                        { label: "▶", href: (store.socialLinks as any)?.youtube || "#" },
                      ].map((item) => (
                        <Link key={item.label} href={item.href} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_12px_28px_rgba(59,51,68,0.06)]">
                          <span className="text-sm font-bold">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                    </div>
                  </div>

                  <div className="rounded-[34px] bg-white p-6 shadow-[0_30px_70px_rgba(59,51,68,0.08)] sm:p-8">
                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5857c]">Get in touch</p>
                      <h2 className="mt-2 font-serif text-3xl text-[#3b3344]">Get in touch</h2>
                    </div>
                    <form className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#f5857c]" placeholder="Your name" />
                        <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#f5857c]" placeholder="Email address" />
                      </div>
                      <input className="rounded-2xl border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#f5857c]" placeholder="Subject" />
                      <textarea className="min-h-[160px] rounded-[24px] border border-[#ece4da] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#f5857c]" placeholder="How can we help?" />
                      <button type="button" className="inline-flex items-center justify-center rounded-full bg-[#f5857c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ef7067]">
                        Send message
                      </button>
                    </form>
                  </div>
                </div>
              </section>

              <section id="map" className="px-4 py-16">
                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[34px] border border-[#efe6da] bg-white p-6 shadow-[0_20px_50px_rgba(59,51,68,0.05)] sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5857c]">Opening hours</p>
                    <h2 className="mt-2 font-serif text-3xl text-[#3b3344]">Monday - Friday</h2>
                    <div className="mt-6 space-y-4 text-sm text-[#6d6277]">
                      <div className="flex items-center justify-between border-b border-dashed border-[#efe6da] pb-3">
                        <span>Hours</span>
                        <span className="font-semibold text-[#3b3344]">9:00am - 5:00pm</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-dashed border-[#efe6da] pb-3">
                        <span>Support</span>
                        <span className="font-semibold text-[#3b3344]">(064) 332-1233</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-dashed border-[#efe6da] pb-3">
                        <span>Address</span>
                        <span className="font-semibold text-[#3b3344]">Kansas City, MO</span>
                      </div>
                    </div>
                    <div className="mt-8 rounded-[28px] bg-[#fff7df] p-5">
                      <p className="text-sm leading-7 text-[#6d6277]">
                        Based on WoodMart theme 2025 WooCommerce Themes.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link href={`/store/${slug}/blog`} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#3b3344] transition hover:text-[#f5857c]">
                          Visit the blog
                        </Link>
                        <Link href={`/store/${slug}/shop`} className="rounded-full border border-[#f5857c] px-5 py-2 text-sm font-semibold text-[#f5857c] transition hover:bg-[#fff0ee]">
                          Shop the collection
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[34px] border border-[#efe6da] bg-white shadow-[0_20px_50px_rgba(59,51,68,0.05)]">
                    <iframe
                      title="Kids store map"
                      src="https://www.google.com/maps?q=913%20Wyandotte%20St%2C%20Kansas%20City%2C%20MO%2064105&output=embed"
                      className="h-[520px] w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </section>
            </main>
            <KidsFooterFull
              storeName={store.name}
              storeSlug={slug}
              logo={store.logo}
              templateSlug="kids"
              description={store.description || "Playful kidswear, gifts, and accessories with a bright, premium WoodMart-inspired finish."}
              socialLinks={kidsSocialLinks}
            />
          </>
        )}
      </div>
    );
  }

  // ─── HEALTH / PILLS CONTACT US ───
  const isHealthTemplate =
    activeTemplateSlug === "pills" || slug === "pills" || store.slug === "pills" ||
    store.name?.toLowerCase().includes("pill") || store.name?.toLowerCase().includes("supplement") || store.name?.toLowerCase().includes("health");

  if (isHealthTemplate) {
    return (
      <div className="min-h-screen bg-white text-[#333]" style={{ fontFamily: "'Cabin', Arial, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600;700;800&family=Cabin:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <HealthHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
        <main>
          <section style={{ background: "linear-gradient(135deg, #f0f5f2 0%, #fff 50%, #f7f7f7 100%)" }}>
            <div style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px 80px", textAlign: "center" }}>
              <h1 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "48px", fontWeight: 700, color: "#333", marginBottom: "24px" }}>Contact Us</h1>
            </div>
          </section>
          <section style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "30px", marginBottom: "60px" }}>
              <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "16px" }}>Address</h3>
                <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777" }}>1901 Thornridge Cir. Shiloh, Hawaii 81063</p>
                <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777", marginTop: "12px" }}>Monday – Tuesday 10.00am – 4.00pm (By Appointment Only)<br/>Wednesday – Saturday, 10.00am – 4.00pm<br/>Sunday, Closed</p>
              </div>
              <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "16px" }}>Phone</h3>
                <p style={{ fontSize: "16px", color: "rgb(136,173,153)", fontWeight: 600 }}>(956) 238-7908</p>
              </div>
              <div style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "16px" }}>Email</h3>
                <p style={{ fontSize: "16px", color: "rgb(136,173,153)", fontWeight: 600 }}>hello@store.com</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
              <div>
                <h2 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "28px", fontWeight: 700, color: "#333", marginBottom: "24px" }}>Get in Touch</h2>
                <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <input type="text" placeholder="Your Name *" required style={{ border: "2px solid #e8e8e8", borderRadius: "10px", padding: "14px 16px", fontSize: "14px", fontFamily: "'Cabin', sans-serif", outline: "none" }} />
                    <input type="email" placeholder="Your Email *" required style={{ border: "2px solid #e8e8e8", borderRadius: "10px", padding: "14px 16px", fontSize: "14px", fontFamily: "'Cabin', sans-serif", outline: "none" }} />
                  </div>
                  <input type="text" placeholder="Subject" style={{ border: "2px solid #e8e8e8", borderRadius: "10px", padding: "14px 16px", fontSize: "14px", fontFamily: "'Cabin', sans-serif", outline: "none" }} />
                  <textarea placeholder="Your Message" rows={5} style={{ border: "2px solid #e8e8e8", borderRadius: "10px", padding: "14px 16px", fontSize: "14px", fontFamily: "'Cabin', sans-serif", outline: "none", resize: "vertical" }} />
                  <button type="submit" style={{ background: "rgb(136,173,153)", color: "#fff", border: "none", borderRadius: "10px", padding: "14px 28px", fontSize: "15px", fontWeight: 700, cursor: "pointer", alignSelf: "flex-start", fontFamily: "'Cabin', sans-serif" }}>Send Message</button>
                </form>
              </div>
              <div style={{ background: "#f0f5f2", borderRadius: "15px", padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <p style={{ fontSize: "14px", color: "#777", marginBottom: "8px" }}>Need help choosing?</p>
                <p style={{ fontFamily: "'Geologica', sans-serif", fontSize: "20px", fontWeight: 700, color: "#333", marginBottom: "16px" }}>Contact With Expert</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <span style={{ fontSize: "14px", color: "rgb(136,173,153)", fontWeight: 600 }}>📍 1901 Thornridge Cir. Shiloh, Hawaii 81063</span>
                </div>
                <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "#333", fontSize: "15px" }}>Rated 4.9</p>
                    <p style={{ fontSize: "13px", color: "#777" }}>Based on 374 reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <HealthFooterFull storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description || "Your trusted source for vitamins, supplements, and wellness products."} contact={{ address: "1901 Thornridge Cir. Shiloh, Hawaii 81063", phone: "(956) 238-7908", email: "hello@store.com" }} />
      </div>
    );
  }

  if (activeTemplateSlug === "vegetables") {
    const vegetableNavItems = [
      { label: "Home", href: `/store/${slug}` },
      { label: "Menu", href: `/store/${slug}/menu` },
      { label: "Recipe", href: `/store/${slug}/recipe` },
      { label: "About", href: `/store/${slug}/about` },
      { label: "Contact", href: `/store/${slug}/contact` },
    ];
    const vegetableSocialLinks: Array<{ platform: string; url: string }> = [
      ...(store.socialLinks?.facebook ? [{ platform: "facebook", url: store.socialLinks.facebook }] : []),
      ...(store.socialLinks?.instagram ? [{ platform: "instagram", url: store.socialLinks.instagram }] : []),
      ...(store.socialLinks?.twitter ? [{ platform: "twitter", url: store.socialLinks.twitter }] : []),
      ...(store.socialLinks?.tiktok ? [{ platform: "tiktok", url: store.socialLinks.tiktok }] : []),
    ];

    return (
      <div className="min-h-screen bg-[#fff9ef] text-[#243226]">
        <VegetableHeader storeName={store.name} storeSlug={slug} logo={store.logo} navItems={vegetableNavItems} reservationHref={`/store/${slug}/reservation`} />
        <main>
          <VegetableContactPage
            storeName={store.name}
            storeSlug={slug}
            currency="USD"
            socialLinks={vegetableSocialLinks}
            storeAddress={store.description || `${store.name} restaurant`}
            storePhone={undefined}
          />
        </main>
        <VegetableFooter storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description} navItems={vegetableNavItems} socialLinks={vegetableSocialLinks} />
      </div>
    );
  }

  const isPerfumesTemplate =
    activeTemplateSlug === "perfumes" ||
    slug === "perfumes" ||
    store.slug === "perfumes" ||
    store.name?.toLowerCase().includes("perfumes");

  if (isPerfumesTemplate) {
    return <PerfumesContactPage />;
  }

  // ─── RETAIL / DECOR CONTACT ───
  const isRetailTemplate = activeTemplateSlug === "retail" || activeTemplateSlug === "decor";
  if (isRetailTemplate) {
    const retailBlocks = (contactPage?.content ? pageContent.blocks : RETAIL_CONTACT_BLOCKS) as BuilderBlock[];
    return (
      <ThemeProvider theme={themeData}>
        <HandmadeBagsHeader storeName={store.name} storeSlug={store.slug || slug} logo={store.logo} isLanding={false} />
        <div style={buildPageBackgroundStyle(pageSettings)}>
          <RenderBlocks blocks={retailBlocks} storeSlug={slug} products={serializedProducts} />
        </div>
        <HandmadeBagsFooter storeName={store.name} storeSlug={store.slug || slug} logo={store.logo} description={store.description ?? undefined} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={themeData}>
      <HandmadeBagsHeader
        storeName={store.name}
        storeSlug={store.slug || slug}
        logo={store.logo}
        isLanding={false}
      />
      <div style={buildPageBackgroundStyle(pageSettings)}>
        {parsedContact && parsedContact.blocks.length > 0 ? (
          <RenderBlocks blocks={pageContent.blocks as BuilderBlock[]} storeSlug={slug} products={serializedProducts} />
        ) : (
          <RenderTemplateBlocks blocks={CONTACT_PAGE_BLOCKS} />
        )}
      </div>
      <HandmadeBagsFooter
        storeName={store.name}
        storeSlug={store.slug || slug}
        logo={store.logo}
        description={store.description ?? undefined}
      />
    </ThemeProvider>
  );
}
