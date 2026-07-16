import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { VisicSite } from "@/types";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/visic-sites/:siteId
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  
  try {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        settings: true,
        socialLinks: true,
        deliveryZones: true,
      },
    });

    if (!site) {
      return error("Site not found", 404);
    }

    // Get theme separately
    const theme = await prisma.siteTheme.findFirst({
      where: { siteId },
    });

    // Convert to VisicSite format
    const visicSite: VisicSite = {
      id: site.id,
      workspaceId: site.workspaceId,
      name: site.name,
      contactWhatsApp: site.socialLinks?.whatsapp ?? undefined,
      businessName: site.name,
      logoUrl: site.logo ?? undefined,
      theme: {
        id: theme?.id || "default",
        name: theme?.name || "Default Theme",
        designSystem: {
          colors: {
            primary: theme?.primaryColor || "#3b82f6",
            secondary: theme?.secondaryColor || "#8b5cf6",
            accent: "#f59e0b",
            background: "#ffffff",
            text: "#1f2937",
            mutedText: "#6b7280",
            border: "#e5e7eb",
          },
          fonts: {
            heading: theme?.fontFamily || "Inter",
            body: theme?.fontFamily || "Inter",
          },
          typography: {},
          borderRadius: "md",
        },
      },
      sections: [],
      pages: [],
      activePageId: "home",
      customCss: "",
      mediaLibrary: [],
      products: [],
      deliveryAreas: site.deliveryZones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        fee: Number(zone.fee),
        estimatedDays: zone.estimatedDays || "2-3",
      })),
      lowDataMode: site.settings?.lowDataMode || false,
    };

    // Load pages
    const pages = await prisma.page.findMany({
      where: { siteId },
      orderBy: { createdAt: "asc" },
    });

    if (pages.length > 0) {
      visicSite.pages = pages.map((page) => ({
        id: page.id,
        name: page.title,
        slug: page.slug,
        sections: [],
        isSystem: page.type === "HOME",
      }));
      visicSite.activePageId = pages[0].id;
    }

    return success(visicSite);
  } catch (err) {
    console.error("Failed to load VisicSite:", err);
    return error("Failed to load site", 500);
  }
}

// PUT /api/visic-sites/:siteId
export async function PUT(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  
  try {
    const body = await req.json();
    const visicSite: VisicSite = body;

    // Update site basic info
    await prisma.site.update({
      where: { id: siteId },
      data: {
        name: visicSite.name,
        logo: visicSite.logoUrl,
      },
    });

    // Update theme
    const theme = await prisma.siteTheme.findFirst({
      where: { siteId },
    });

    if (theme) {
      await prisma.siteTheme.update({
        where: { id: theme.id },
        data: {
          primaryColor: visicSite.theme.designSystem.colors.primary,
          secondaryColor: visicSite.theme.designSystem.colors.secondary,
          fontFamily: visicSite.theme.designSystem.fonts.heading,
        },
      });
    } else {
      await prisma.siteTheme.create({
        data: {
          siteId,
          name: visicSite.theme.name,
          primaryColor: visicSite.theme.designSystem.colors.primary,
          secondaryColor: visicSite.theme.designSystem.colors.secondary,
          fontFamily: visicSite.theme.designSystem.fonts.heading,
          layout: "modern",
        },
      });
    }

    // Try to update settings if they exist
    try {
      await prisma.siteSettings.update({
        where: { siteId },
        data: {
          lowDataMode: visicSite.lowDataMode,
        },
      });
    } catch (settingsErr) {
      // Settings might not exist, that's okay
      console.log("Settings update skipped:", settingsErr);
    }

    // Try to update social links if they exist
    try {
      await prisma.siteSocialLinks.update({
        where: { siteId },
        data: {
          whatsapp: visicSite.contactWhatsApp,
        },
      });
    } catch (socialErr) {
      // Social links might not exist, that's okay
      console.log("Social links update skipped:", socialErr);
    }

    return success({ updated: true });
  } catch (err) {
    console.error("Failed to update VisicSite:", err);
    return error("Failed to update site", 500);
  }
}

// POST /api/visic-sites/:siteId (Create new VisicSite)
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  
  try {
    const body = await req.json();
    const visicSite: VisicSite = body;

    // Check if site exists
    const existingSite = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (existingSite) {
      // Update existing site
      await prisma.site.update({
        where: { id: siteId },
        data: {
          name: visicSite.name,
          logo: visicSite.logoUrl,
        },
      });
    } else {
      // Create new site
      await prisma.site.create({
        data: {
          id: siteId,
          workspaceId: visicSite.workspaceId,
          name: visicSite.name,
          slug: visicSite.name.toLowerCase().replace(/\s+/g, "-"),
          description: "",
          logo: visicSite.logoUrl,
          siteType: "ECOMMERCE",
          subdomain: visicSite.name.toLowerCase().replace(/\s+/g, "-"),
          currency: "GHS",
          country: "GH",
          businessType: "retail",
          status: "ACTIVE",
        },
      });
    }

    // Create/update theme
    const existingTheme = await prisma.siteTheme.findFirst({
      where: { siteId },
    });

    if (existingTheme) {
      await prisma.siteTheme.update({
        where: { id: existingTheme.id },
        data: {
          name: visicSite.theme.name,
          primaryColor: visicSite.theme.designSystem.colors.primary,
          secondaryColor: visicSite.theme.designSystem.colors.secondary,
          fontFamily: visicSite.theme.designSystem.fonts.heading,
        },
      });
    } else {
      await prisma.siteTheme.create({
        data: {
          siteId,
          name: visicSite.theme.name,
          primaryColor: visicSite.theme.designSystem.colors.primary,
          secondaryColor: visicSite.theme.designSystem.colors.secondary,
          fontFamily: visicSite.theme.designSystem.fonts.heading,
          layout: "modern",
        },
      });
    }

    // Create default pages if they don't exist
    if (visicSite.pages) {
      for (const page of visicSite.pages) {
        const existingPage = await prisma.page.findUnique({
          where: { id: page.id },
        });

        if (!existingPage) {
          await prisma.page.create({
            data: {
              id: page.id,
              siteId,
              title: page.name,
              slug: page.slug,
              type: page.name.toUpperCase() as "HOME" | "SHOP" | "ABOUT" | "CONTACT" | "BLOG" | "CUSTOM",
              content: {},
              isPublished: true,
            },
          });
        }
      }
    }

    return success({ created: true });
  } catch (err) {
    console.error("Failed to create VisicSite:", err);
    return error("Failed to create site", 500);
  }
}
