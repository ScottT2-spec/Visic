import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { HandmadeBagsHeader, HandmadeBagsFooter } from "@/components/storefront/HandmadeBagsStoreChrome";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { applyPageCustomization, buildPageBackgroundStyle, filterVisiblePages, getResolvedPageSettings, normalizeSiteCustomization, type SiteCustomizationDocument } from "@/lib/site-customization";
import { parsePageContent } from "@/lib/page-content";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { HANDMADE_BAGS_PRESET } from "@/lib/templates/presets/handmade-bags-preset";
import { RETAIL_ABOUT_BLOCKS } from "@/lib/templates/presets/retail-pages";
import { serializeProductsForClient } from "@/lib/serialize-products";
import { KidsFontLoader, KidsFooterFull, KidsHeader } from "@/components/storefront/KidsTemplateBlocks";
import PerfumesAboutPage from "./perfumes-about";
import { HealthFontLoader, HealthHeader, HealthFooterFull } from "@/components/storefront/HealthTemplateBlocks";

type Props = {
  params: Promise<{ slug: string }>;
};

/* About page blocks - matching Handmade Bags template style (fallback if no custom content) */
const ABOUT_PAGE_BLOCKS: TemplateBlock[] = [
  {
    id: "about-hero",
    type: "fashionHeroSlider",
    props: {
      slides: [
        {
          subtitle: "ABOUT US",
          titleLine1: "Handcrafted",
          titleLine2: "Excellence",
          description: "Discover the artistry behind our premium leather goods and the passionate artisans who bring them to life.",
          buttonText: "Shop Collection",
          buttonLink: "/shop",
          colorScheme: "dark",
          textPosition: "center",
          backgroundImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1920&h=900&fit=crop",
        },
      ],
      minHeight: "550px",
      autoplaySpeed: 0,
    },
  },
  {
    id: "about-marquee",
    type: "fashionMarquee",
    props: {
      items: [
        { text: "Handcrafted with Love", icon: "✦" },
        { text: "Premium Leather", icon: "✦" },
        { text: "Sustainable Practices", icon: "✦" },
        { text: "Lifetime Quality", icon: "✦" },
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
    id: "about-intro",
    type: "fashionSectionTitle",
    props: {
      subtitle: "WHO WE ARE",
      title: "A Legacy of Craftsmanship",
      description: "For over two decades, we have been dedicated to creating exceptional leather goods that combine traditional techniques with contemporary design. Each piece in our collection represents hours of meticulous work by skilled artisans who have mastered their craft through generations of knowledge passed down.",
      align: "center",
      maxWidth: "70%",
      marginBottom: "60px",
    },
  },
  {
    id: "about-image-section",
    type: "fashionCoverBanners",
    props: {
      columns: 2,
      height: "500px",
      marginBottom: "70px",
      banners: [
        {
          image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop",
          icon: "",
          title: "Our Workshop",
          description: "Where tradition meets innovation in every stitch and detail.",
          overlayOpacity: 0.3,
        },
        {
          image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&h=1000&fit=crop",
          icon: "",
          title: "Premium Materials",
          description: "Sourcing the finest full-grain leathers from ethical suppliers worldwide.",
          overlayOpacity: 0.3,
        },
      ],
    },
  },
  {
    id: "about-mission",
    type: "fashionSectionTitle",
    props: {
      subtitle: "OUR MISSION",
      title: "Creating Timeless Pieces",
      description: "We believe that true luxury lies in quality, sustainability, and the human touch. Our mission is to create leather goods that not only serve a functional purpose but also tell a story of artistry and dedication.",
      align: "center",
      maxWidth: "60%",
      marginBottom: "50px",
    },
  },
  {
    id: "about-values",
    type: "fashionFeatures",
    props: {
      columns: 3,
      marginBottom: "70px",
      features: [
        {
          number: "01",
          title: "Artisan Craftsmanship",
          description: "Every bag is handcrafted by master artisans with decades of experience, ensuring each piece meets our exacting standards.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "02",
          title: "Sustainable Practices",
          description: "We are committed to ethical sourcing, eco-friendly production methods, and creating products that last a lifetime.",
          buttonText: "",
          buttonLink: "",
        },
        {
          number: "03",
          title: "Customer Excellence",
          description: "From design to delivery, every step is guided by our commitment to exceeding customer expectations.",
          buttonText: "",
          buttonLink: "",
        },
      ],
    },
  },
  {
    id: "about-cta",
    type: "fashionNewsletter",
    props: {
      subtitle: "",
      title: "Join Our Journey",
      description: "Subscribe to our newsletter for exclusive updates, new arrivals, and behind-the-scenes insights into our craft.",
      buttonText: "Subscribe",
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
        where: { slug: "about" },
        take: 1,
      },
    },
  });

  if (!store) return null;

  // Auto-create About page if it doesn't exist
  if (!store.pages || store.pages.length === 0) {
    try {
      await prisma.page.create({
        data: {
          siteId: store.id,
          title: "About Us",
          slug: "about",
          type: "CUSTOM",
          content: [],
          isPublished: true,
          position: 10,
        },
      });
      // Re-fetch to include the newly created page
      store.pages = await prisma.page.findMany({
        where: { siteId: store.id, slug: "about" },
        take: 1,
      });
    } catch (error) {
      console.error("Failed to auto-create About page:", error);
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

export default async function AboutPage({ params }: Props) {
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
    redirect(`/store/${slug}/about-us`);
  }

  // Serialize products to convert Decimal values to plain numbers for client components
  const serializedProducts = serializeProductsForClient(products);

  const customization = normalizeSiteCustomization(store.customizations as any);
  const visiblePages = filterVisiblePages(store.pages || [], customization);
  const customizedPages = visiblePages.map((page: any) => applyPageCustomization(page, customization));
  const aboutPage = customizedPages.find((p: any) => p.slug === "about");
  
  // Use custom blocks if available, otherwise use preset
  let pageContent;
  const parsedAbout = aboutPage?.content ? parsePageContent(aboutPage.content) : null;
  if (parsedAbout && parsedAbout.blocks.length > 0) {
    pageContent = parsedAbout;
  } else {
    pageContent = { blocks: ABOUT_PAGE_BLOCKS, settings: {} };
  }

  const pageSettings = aboutPage ? getResolvedPageSettings(aboutPage, pageContent.settings, customization) : {};
  const themeData: ThemeData = {
    id: "kids-about-page",
    name: "Kids About Page",
    slug: "kids-about-page",
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
    const parsedAbout = aboutPage?.content ? parsePageContent(aboutPage.content) : null;
    const hasBlocks = parsedAbout && parsedAbout.blocks.length > 0;

    return (
      <div className="min-h-screen bg-[#fffdf7] text-[#242424]">
        <KidsFontLoader />
        {hasBlocks ? (
          <RenderTemplateBlocks blocks={parsedAbout.blocks as TemplateBlock[]} />
        ) : (
          <>
            <KidsHeader
              storeName={store.name}
              storeSlug={slug}
              logo={store.logo}
              templateSlug="kids"
            />
            <main>
              <section className="relative overflow-hidden bg-gradient-to-br from-[#fff5f1] via-white to-[#f8fbff]">
                <div className="mx-auto grid max-w-[1222px] gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:py-24">
                  <div className="flex flex-col justify-center">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#f5857c]">About Us</p>
                    <h1 className="max-w-xl text-4xl font-bold leading-tight text-[#242424] md:text-6xl">We create organic clothes for babies</h1>
                    <p className="mt-6 max-w-xl text-[16px] leading-8 text-[#767676]">
                      Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarks grove right at the coast of the Semantics, a large language ocean. Far far away, behind the word mountains, far from the countries Vokalia, there live the blind texts.
                    </p>
                    <p className="mt-4 max-w-xl text-[16px] leading-8 text-[#767676]">
                      Separated they live in Bookmarks grove right at the coast of the Semantics.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <img src="https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&h=1000&fit=crop" alt="Kids collection" className="h-full w-full rounded-[28px] object-cover shadow-lg" />
                    <div className="grid gap-4">
                      <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&h=480&fit=crop" alt="Kids knitwear" className="h-full w-full rounded-[28px] object-cover shadow-lg" />
                      <div className="rounded-[28px] bg-white p-6 shadow-lg">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f5857c]">Meet our team</p>
                        <p className="mt-3 text-sm leading-7 text-[#767676]">
                          Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure show.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mx-auto max-w-[1222px] px-4 py-16 md:px-6">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { title: "Darlene Robertson", text: "Director" },
                    { title: "Kathryn Murphy", text: "Marketing manager" },
                    { title: "Jenny Wilson", text: "Product designer" },
                    { title: "Kristin Watson", text: "CEO" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[24px] bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
                      <h2 className="text-xl font-bold text-[#242424]">{item.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-[#767676]">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-[#faf8f5]">
                <div className="mx-auto grid max-w-[1222px] gap-10 px-4 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f5857c]">How we work</p>
                    <h2 className="mt-4 text-3xl font-bold text-[#242424] md:text-4xl">How we work</h2>
                  </div>
                  <div className="space-y-5 text-[16px] leading-8 text-[#767676]">
                    <p>
                      If that's what you think how bout the other way around? How can you evaluate content without design? No typography, no colors, no layout, no styles, all those things that convey the important signals that go beyond the mere textual, hierarchies of information, weight, emphasis, oblique stresses, priorities, all those subtle cues that also have visual and emotional.
                    </p>
                    <p>
                      Accept that it's sometimes okay to focus just on the content or just on the design. Rigid proponents of content strategy may shun the use of dummy copy but then designers might want to ask them to provide style sheets with the copy decks they supply that are in tune with the design direction they require. Using dummy content or fake information in the Web design.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mx-auto max-w-[1222px] px-4 py-16 md:px-6">
                <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr]">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f5857c]">What we do</p>
                    <h2 className="mt-4 text-3xl font-bold text-[#242424] md:text-4xl">What we do</h2>
                    <p className="mt-4 text-[16px] leading-8 text-[#767676]">
                      Accept that it's sometimes okay to focus just on the content or just on the design. Rigid proponents of content strategy may shun the use of dummy copy but then designers might want to ask them to provide style sheets with the copy decks they supply that are in tune with the design direction they require. Using dummy content or fake information in the Web design.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[#242424]">Some of your questions answered here</h3>
                    <p className="text-sm leading-7 text-[#767676]">We get a lot of questions about our course. You can get any answers.</p>
                    <div className="space-y-4 rounded-[28px] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
                      {[
                        ["Why choose organic cotton fabrics and certified factories?", "A seemingly elegant design can quickly begin to bloat with unexpected content or break under the weight of actual activity. Fake data can ensure a nice looking layout but it doesn't reflect what a living, breathing application must endure. Real data does."],
                        ["How is your product packaged?", "Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure that you can show different text, different data using the same template. When it's about controlling hundreds of articles, product pages for web shops."],
                        ["What's the best size to buy for a baby shower gift?", "If the copy becomes distracting in the design then you are doing something wrong or they are discussing copy changes. It might be a bit annoying but you could tell them that that discussion would be best suited for another time. At worst the discussion is at least working towards the final goal of your site where questions about lorem ipsum don't."],
                      ].map(([q, a]) => (
                        <div key={q} className="rounded-[22px] border border-[#efe6da] bg-[#fffdf8] p-5">
                          <h4 className="font-semibold text-[#242424]">{q}</h4>
                          <p className="mt-2 text-sm leading-7 text-[#767676]">{a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </main>
            <KidsFooterFull
              storeName={store.name}
              storeSlug={slug}
              templateSlug="kids"
              logo={store.logo}
              description={store.description || "Playful kidswear, gifts, and accessories with a premium WoodMart-inspired finish."}
              contact={{
                address: "913 Wyandotte St, Kansas City, MO 64105",
                phone: "(064) 332-1233",
                email: "hello@store.com",
              }}
            />
          </>
        )}
      </div>
    );
  }

  const isPerfumesTemplate =
    activeTemplateSlug === "perfumes" ||
    slug === "perfumes" ||
    store.slug === "perfumes" ||
    store.name?.toLowerCase().includes("perfumes");

  if (isPerfumesTemplate) {
    return <PerfumesAboutPage />;
  }

  // ─── HEALTH / PILLS ABOUT US ───
  const isHealthTemplate =
    activeTemplateSlug === "pills" ||
    slug === "pills" ||
    store.slug === "pills" ||
    store.name?.toLowerCase().includes("pill") ||
    store.name?.toLowerCase().includes("supplement") ||
    store.name?.toLowerCase().includes("health");

  if (isHealthTemplate) {
    return (
      <div className="min-h-screen bg-white text-[#333]" style={{ fontFamily: "'Cabin', Arial, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600;700;800&family=Cabin:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <HealthHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
        <main>
          {/* Hero */}
          <section style={{ background: "linear-gradient(135deg, #f0f5f2 0%, #fff 50%, #f7f7f7 100%)" }}>
            <div style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px 80px", textAlign: "center" }}>
              <h1 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "48px", fontWeight: 700, color: "#333", marginBottom: "24px" }}>About Us</h1>
              <h2 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "28px", fontWeight: 600, color: "#333", maxWidth: "700px", margin: "0 auto 20px" }}>
                Our Company&apos;s Goal Is to Make You Healthy
              </h2>
              <p style={{ fontSize: "16px", lineHeight: "1.8", color: "#777", maxWidth: "720px", margin: "0 auto 30px" }}>
                The best vitamins and supplements are often backed by scientific research and manufactured by reputable companies. They can play a valuable role in filling nutritional gaps and supporting optimal health when used as part.
              </p>
            </div>
          </section>

          {/* Video placeholder */}
          <section style={{ maxWidth: "1222px", margin: "-40px auto 0", padding: "0 15px 60px", position: "relative", zIndex: 1 }}>
            <div style={{ borderRadius: "15px", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}>
              <img src="https://woodmart.xtemos.com/pills/wp-content/uploads/sites/15/2023/09/w-pas-video-placehollder.jpg" alt="About video" style={{ width: "100%", display: "block" }} />
            </div>
          </section>

          {/* Company Values */}
          <section style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px" }}>
            <h2 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "32px", fontWeight: 700, color: "#333", textAlign: "center", marginBottom: "48px" }}>Company Values</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px" }}>
              {[
                { title: "Focus on the Consumer", text: "Anyway, you still use Lorem Ipsum and rightly so, as it will always have a place in the web workers toolbox, as things happen, not always the way you like it, not always in the preferred order." },
                { title: "Maintain the Highest Standards", text: "No typography, no colors, no layout, no styles, all those things that convey the important signals that go beyond the mere textual, hierarchies of information, weight, emphasis." },
                { title: "Continuous Improvement", text: "That's not so bad, there's dummy copy to the rescue. But worse, what if the fish doesn't fit in the can, the foot's too big for the boot? Or too small?" },
                { title: "Consumer Confidence", text: "The best vitamins and supplements are often backed by scientific research and manufactured by reputable companies. They can play a valuable role in filling nutritional gaps." },
              ].map((v) => (
                <div key={v.title} style={{ background: "#f7f7f7", borderRadius: "15px", padding: "32px" }}>
                  <h3 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "12px" }}>{v.title}</h3>
                  <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#777" }}>{v.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section style={{ background: "#f7f7f7" }}>
            <div style={{ maxWidth: "1222px", margin: "0 auto", padding: "60px 15px" }}>
              <h2 style={{ fontFamily: "'Geologica', sans-serif", fontSize: "32px", fontWeight: 700, color: "#333", textAlign: "center", marginBottom: "48px" }}>Frequently Asked Questions</h2>
              <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  ["How does my subscription work?", "A seemingly elegant design can quickly begin to bloat with unexpected content or break under the weight of actual activity. Fake data can ensure a nice looking layout but it doesn't reflect what a living, breathing application must endure. Real data does."],
                  ["How do I edit what's in my plan?", "Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure that you can show different text, different data using the same template."],
                  ["Can I change my next delivery date?", "A seemingly elegant design can quickly begin to bloat with unexpected content or break under the weight of actual activity. Fake data can ensure a nice looking layout but it doesn't reflect what a living, breathing application must endure."],
                  ["It's been a while since I took the quiz. Can I get a new recommendation?", "Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure that you can show different text, different data using the same template."],
                  ["My order hasn't arrived yet. Where is it?", "If the copy becomes distracting in the design then you are doing something wrong or they are discussing copy changes. It might be a bit annoying but you could tell them that that discussion would be best suited for another time."],
                  ["Do you deliver on public holidays?", "A seemingly elegant design can quickly begin to bloat with unexpected content or break under the weight of actual activity. Fake data can ensure a nice looking layout but it doesn't reflect what a living, breathing application must endure."],
                  ["Is next-day delivery available on all orders?", "If the copy becomes distracting in the design then you are doing something wrong or they are discussing copy changes. It might be a bit annoying but you could tell them that that discussion would be best suited for another time."],
                ].map(([q, a]) => (
                  <details key={q} style={{ background: "#fff", borderRadius: "12px", padding: "20px 24px", cursor: "pointer" }}>
                    <summary style={{ fontFamily: "'Geologica', sans-serif", fontWeight: 600, fontSize: "15px", color: "#333", listStyle: "none" }}>{q}</summary>
                    <p style={{ marginTop: "12px", fontSize: "14px", lineHeight: "1.8", color: "#777" }}>{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </main>
        <HealthFooterFull storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description || "Your trusted source for vitamins, supplements, and wellness products."} contact={{ address: "1901 Thornridge Cir. Shiloh, Hawaii 81063", phone: "(956) 238-7908", email: "hello@store.com" }} />
      </div>
    );
  }

  // ─── RETAIL ABOUT ───
  const isRetailTemplate = activeTemplateSlug === "retail";
  if (isRetailTemplate) {
    const retailBlocks = (aboutPage?.content ? pageContent.blocks : RETAIL_ABOUT_BLOCKS) as BuilderBlock[];
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
        {parsedAbout && parsedAbout.blocks.length > 0 ? (
          <RenderBlocks blocks={pageContent.blocks as BuilderBlock[]} storeSlug={slug} products={serializedProducts} />
        ) : (
          <RenderTemplateBlocks blocks={ABOUT_PAGE_BLOCKS} />
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
