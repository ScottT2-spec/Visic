import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { RenderTemplateBlocks, type TemplateBlock } from "@/components/storefront/TemplateBlockRenderer";
import { TShirtsPrintsFooter, TShirtsPrintsHeader } from "@/components/storefront/TShirtsPrintsStoreChrome";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { TShirtsPrintsFontLoader } from "@/components/storefront/TShirtsPrintsTemplateBlocks";
import { buildPageBackgroundStyle } from "@/lib/site-customization";
import { parsePageContent } from "@/lib/page-content";
import { mergeBespokeTemplateBlocks } from "@/lib/templates/bespoke-page-content";
import { ensureTemplatePages } from "@/lib/templates/template-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getStoreData(slug: string) {
  const store = await prisma.site.findFirst({
    where: {
      status: "ACTIVE",
      OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
    },
    include: {
      templates: {
        where: { isActive: true },
        include: { template: true },
      },
      pages: {
        where: { slug: "blog" },
        take: 1,
      },
    },
  });

  if (!store) return null;

  const activeTemplateSlug = store.templates?.[0]?.template?.slug || null;

  // Ensure template pages exist (including blog)
  if (activeTemplateSlug) {
    try {
      await ensureTemplatePages(store.id, activeTemplateSlug, false);
      // Re-fetch to include the newly created page
      store.pages = await prisma.page.findMany({
        where: { siteId: store.id, slug: "blog" },
        take: 1,
      });
    } catch (error) {
      console.error("Failed to auto-create Blog page:", error);
    }
  }

  return { store, templateSlug: activeTemplateSlug };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const data = await getStoreData(slug);

  if (!data) notFound();

  const { store, templateSlug } = data;

  const isTShirtsPrintsTemplate =
    templateSlug === "t-shirts-prints" ||
    slug === "t-shirts-prints" ||
    store.slug === "t-shirts-prints" ||
    store.name?.toLowerCase().includes("t-shirts");

  if (!isTShirtsPrintsTemplate) {
    // For non-tshirt templates, redirect to the dynamic page handler
    redirect(`/store/${slug}/blog`);
  }

  const blogPage = store.pages?.[0];
  if (!blogPage) notFound();

  // Parse page content and merge with template presets
  const parsedContent = blogPage.content ? parsePageContent(blogPage.content) : null;
  let blocks: TemplateBlock[] = [];
  
  if (parsedContent && parsedContent.blocks.length > 0) {
    blocks = parsedContent.blocks;
  } else {
    // Use template presets if no custom blocks
    const presetBlocks = mergeBespokeTemplateBlocks(templateSlug || "", "blog", []);
    blocks = presetBlocks;
  }

  const customization = (store.customizations as any) || null;
  const pageSettings = parsedContent?.settings || {};

  const themeData: ThemeData = {
    id: "tshirts-blog-page",
    name: "T-Shirts Blog Page",
    slug: "tshirts-blog-page",
    config: {
      colors: {
        primary: customization?.themeSettings?.colors?.primary || "#111",
        secondary: customization?.themeSettings?.colors?.secondary || "#333",
        accent: customization?.themeSettings?.colors?.accent || "#666",
        background: customization?.themeSettings?.colors?.background || "#ffffff",
        text: customization?.themeSettings?.colors?.text || "#1d1d1d",
      },
    },
  };

  return (
    <ThemeProvider theme={themeData}>
      <div className="min-h-screen bg-white text-[#1d1d1d]" style={{ fontFamily: "'Manrope', Arial, sans-serif" }}>
        <TShirtsPrintsFontLoader />
        <TShirtsPrintsHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
        <main style={buildPageBackgroundStyle(pageSettings)}>
          <RenderTemplateBlocks blocks={blocks} />
        </main>
        <TShirtsPrintsFooter
          storeName={store.name}
          storeSlug={slug}
          logo={store.logo}
          socialLinks={[
            ...(store.customizations as any)?.socialLinks?.facebook ? [{ platform: "facebook", url: (store.customizations as any).socialLinks.facebook }] : [],
            ...(store.customizations as any)?.socialLinks?.twitter ? [{ platform: "twitter", url: (store.customizations as any).socialLinks.twitter }] : [],
            ...(store.customizations as any)?.socialLinks?.instagram ? [{ platform: "instagram", url: (store.customizations as any).socialLinks.instagram }] : [],
            ...((store.customizations as any)?.socialLinks?.youtube ? [{ platform: "youtube", url: (store.customizations as any).socialLinks.youtube }] : []),
          ]}
        />
      </div>
    </ThemeProvider>
  );
}
