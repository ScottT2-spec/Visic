import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { asRecord } from "@/lib/json";
import { buildThemeDataWithCustomization, loadSiteCustomizationSafely } from "@/lib/site-customization";
import { mergeStoredTemplatePages } from "@/lib/templates/site-instance";
import { ensurePerfumePages } from "@/lib/templates/perfume-pages";
import { ensureVegetablePages } from "@/lib/templates/vegetable-pages";
import { ensureTemplatePages } from "@/lib/templates/template-pages";
import type { PageType, Prisma } from "@/generated/prisma";

type Params = { params: Promise<{ slug: string; pageSlug: string }> };

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function notFound(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

function buildKidsSyntheticPage(pageSlug: string): {
  id: string;
  title: string;
  slug: string;
  type: PageType;
  template: string;
  content: Prisma.JsonValue;
  metaTitle: string;
  metaDescription: string;
} | null {
  if (pageSlug === "about-us") {
    return {
      id: "kids-about-us",
      title: "About Us",
      slug: "about-us",
      type: "CUSTOM" as PageType,
      template: "kids",
      content: { blocks: [], settings: {} },
      metaTitle: "About Us",
      metaDescription: "About the Kids collection",
    };
  }

  if (pageSlug === "contact-us") {
    return {
      id: "kids-contact-us",
      title: "Contact Us",
      slug: "contact-us",
      type: "CUSTOM" as PageType,
      template: "kids",
      content: { blocks: [], settings: {} },
      metaTitle: "Contact Us",
      metaDescription: "Get in touch with the Kids collection",
    };
  }

  return null;
}

function buildCosmeticsSyntheticPage(pageSlug: string): {
  id: string;
  title: string;
  slug: string;
  type: PageType;
  template: string;
  content: Prisma.JsonValue;
  metaTitle: string;
  metaDescription: string;
} | null {
  const cosmeticsPages: Record<string, { title: string; type: PageType; metaDescription: string }> = {
    "home": { title: "Home", type: "HOME" as PageType, metaDescription: "Welcome to our cosmetics store" },
    "shop": { title: "Shop", type: "SHOP" as PageType, metaDescription: "Browse our cosmetics collection" },
    "blog": { title: "Blog", type: "BLOG" as PageType, metaDescription: "Latest beauty tips and trends" },
    "bestseller": { title: "Bestsellers", type: "CUSTOM" as PageType, metaDescription: "Our most loved cosmetics products" },
    "new-in": { title: "New Arrivals", type: "CUSTOM" as PageType, metaDescription: "Just arrived cosmetics and beauty products" },
    "skincare": { title: "Skincare", type: "CUSTOM" as PageType, metaDescription: "Premium skincare collection" },
    "terms": { title: "Terms and Conditions", type: "POLICY" as PageType, metaDescription: "Store terms and conditions" },
    "about-us": { title: "About Us", type: "ABOUT" as PageType, metaDescription: "About our cosmetics store" },
    "contact-us": { title: "Contact Us", type: "CONTACT" as PageType, metaDescription: "Get in touch with us" },
  };

  const pageDef = cosmeticsPages[pageSlug];
  if (!pageDef) return null;

  return {
    id: `cosmetics-${pageSlug}`,
    title: pageDef.title,
    slug: pageSlug,
    type: pageDef.type,
    template: "cosmetics",
    content: { blocks: [], settings: {} },
    metaTitle: pageDef.title,
    metaDescription: pageDef.metaDescription,
  };
}

function buildTShirtsSyntheticPage(pageSlug: string): {
  id: string;
  title: string;
  slug: string;
  type: PageType;
  template: string;
  content: Prisma.JsonValue;
  metaTitle: string;
  metaDescription: string;
} | null {
  if (pageSlug === "about-us") {
    return {
      id: "tshirts-about-us",
      title: "About Us",
      slug: "about-us",
      type: "CUSTOM" as PageType,
      template: "t-shirts-prints",
      content: { blocks: [], settings: {} },
      metaTitle: "About Us",
      metaDescription: "About the T-Shirts & Prints studio",
    };
  }

  if (pageSlug === "contact-us") {
    return {
      id: "tshirts-contact-us",
      title: "Contact Us",
      slug: "contact-us",
      type: "CUSTOM" as PageType,
      template: "t-shirts-prints",
      content: { blocks: [], settings: {} },
      metaTitle: "Contact Us",
      metaDescription: "Contact the T-Shirts & Prints studio",
    };
  }

  return null;
}

// GET /api/storefront/:slug/pages/:pageSlug — public page content + full store context
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug, pageSlug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
      },
    });

    if (!site) return notFound("Store not found");

    const activeTemplate = await prisma.siteTemplate.findFirst({
      where: { siteId: site.id, isActive: true },
      select: {
        variant: true,
        themeConfig: true,
        pages: true,
        customHtml: true,
        template: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (activeTemplate?.template?.slug === "vegetables") {
      await ensureVegetablePages(site.id);
    }

    if (activeTemplate?.template?.slug === "perfumes") {
      await ensurePerfumePages(site.id);
    }

    // Ensure template-specific pages exist for all bespoke templates
    if (activeTemplate?.template?.slug) {
      await ensureTemplatePages(site.id, activeTemplate.template.slug);
    }

    const [
      page,
      settings,
      socialLinks,
      categories,
      deliveryZones,
      allPages,
      activeTheme,
      products,
      blogs,
      customization,
    ] = await Promise.all([
      prisma.page.findFirst({
        where: {
          siteId: site.id,
          slug: pageSlug,
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          template: true,
          content: true,
          metaTitle: true,
          metaDescription: true,
        },
      }),
      prisma.siteSettings.findUnique({
        where: { siteId: site.id },
        select: {
          allowGuestCheckout: true,
          payOnDelivery: true,
          bankTransfer: true,
          whatsappOrdering: true,
          showStockCount: true,
          lowDataMode: true,
          whatsappNumber: true,
          metaTitle: true,
          metaDescription: true,
        },
      }),
      prisma.siteSocialLinks.findUnique({
        where: { siteId: site.id },
        select: {
          whatsapp: true,
          instagram: true,
          facebook: true,
          twitter: true,
          tiktok: true,
        },
      }),
      prisma.category.findMany({
        where: { siteId: site.id },
        select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
        orderBy: { position: "asc" },
      }),
      prisma.deliveryZone.findMany({
        where: { siteId: site.id },
        orderBy: { position: "asc" },
      }),
      prisma.page.findMany({
        where: { siteId: site.id, isPublished: true },
        select: { id: true, title: true, slug: true, type: true, template: true },
        orderBy: { position: "asc" },
      }),
      prisma.siteTheme.findFirst({
        where: { siteId: site.id, isActive: true },
        include: {
          theme: {
            select: { id: true, name: true, slug: true, config: true },
          },
        },
      }),
      prisma.product.findMany({
        where: { siteId: site.id, status: "ACTIVE" },
        include: {
          images: { orderBy: { position: "asc" }, take: 3 },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { position: "asc" }, { createdAt: "desc" }],
        take: 20,
      }),
      prisma.blog.findMany({
        where: { siteId: site.id, status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          author: true,
          category: true,
          tags: true,
          publishedAt: true,
          createdAt: true,
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 12,
      }),
      loadSiteCustomizationSafely(prisma.siteCustomization.findUnique({ where: { siteId: site.id } })),
    ]);

    const resolvedCustomization = customization;
    const templateSlug = activeTemplate?.template?.slug || "";
    const syntheticPage =
      templateSlug === "kids"
        ? buildKidsSyntheticPage(pageSlug)
        : templateSlug === "t-shirts-prints" || slug === "t-shirts-prints" || site.slug === "t-shirts-prints" || site.name?.toLowerCase().includes("t-shirts")
          ? buildTShirtsSyntheticPage(pageSlug)
        : templateSlug === "cosmetics" || templateSlug === "makeup" || slug === "cosmetics" || site.slug === "cosmetics" || site.name?.toLowerCase().includes("cosmetics") || site.name?.toLowerCase().includes("makeup")
          ? buildCosmeticsSyntheticPage(pageSlug)
          : null;
    const mergedPages = mergeStoredTemplatePages(page ? [page] : syntheticPage ? [syntheticPage] : [], activeTemplate?.pages);
    const fallbackPage = mergedPages.find((item) => item.slug === pageSlug) || mergedPages[0];
    if (!fallbackPage) return notFound("Page not found");

    const publicProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      currency: p.currency,
      stock: settings?.showStockCount ? p.stock : undefined,
      inStock: p.stock > 0,
      isFeatured: p.isFeatured,
      tags: p.tags,
      images: p.images,
      category: p.category,
      reviewCount: p._count.reviews,
    }));

    const templateThemeConfig = activeTemplate?.themeConfig as
      | {
          homepage_layout?: string;
          header_style?: string;
          footer_style?: string;
          product_card_style?: string;
          colors?: Record<string, string>;
          fonts?: Record<string, string>;
        }
      | undefined;

    let resolvedTheme: ReturnType<typeof buildThemeDataWithCustomization> = null;
    try {
      resolvedTheme = buildThemeDataWithCustomization(
        activeTheme
          ? {
              id: activeTheme.theme.id,
              name: activeTheme.theme.name,
              slug: activeTheme.theme.slug,
              config: {
                ...asRecord(activeTheme.theme.config),
                ...asRecord(activeTheme.customConfig),
              },
            }
          : activeTemplate
          ? {
              id: activeTemplate.template.id,
              name: activeTemplate.template.name,
              slug: activeTemplate.template.slug,
              config: {
                colors: {
                  primary: templateThemeConfig?.colors?.primary,
                  accent: templateThemeConfig?.colors?.accent,
                  headerBg: templateThemeConfig?.colors?.headerBg || templateThemeConfig?.colors?.background,
                  headerText: templateThemeConfig?.colors?.headerText || templateThemeConfig?.colors?.text,
                  footerBg: templateThemeConfig?.colors?.footerBg || templateThemeConfig?.colors?.secondary,
                  footerText: templateThemeConfig?.colors?.footerText || "#ffffff",
                  buttonBg: templateThemeConfig?.colors?.primary,
                  buttonText: "#ffffff",
                },
                fonts: templateThemeConfig?.fonts,
                layout: {
                  template: templateThemeConfig?.homepage_layout,
                  headerStyle: templateThemeConfig?.header_style,
                  cardStyle: templateThemeConfig?.product_card_style,
                  maxWidth: "72rem",
                  productColumns: 4,
                },
              },
            }
          : null,
        resolvedCustomization,
      );
    } catch (themeError) {
      console.error("Storefront page theme build error:", themeError);
    }

    const publicPages = mergeStoredTemplatePages(allPages, activeTemplate?.pages);

    return success({
      store: {
        id: site.id,
        name: site.name,
        slug: site.slug,
        description: site.description,
        logo: site.logo,
        coverImage: site.coverImage,
        subdomain: site.subdomain,
        customDomain: site.customDomain,
        currency: site.currency,
        country: site.country,
        businessType: site.businessType,
      },
      page: fallbackPage,
      settings: settings || {},
      socialLinks: socialLinks || {},
      products: publicProducts,
      blogs: blogs || [],
      categories,
      deliveryZones,
      pages: publicPages,
      templateSlug: activeTemplate?.template?.slug || null,
      customization: resolvedCustomization,
      theme: resolvedTheme,
    });
  } catch (err) {
    console.error("Storefront page fetch error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
