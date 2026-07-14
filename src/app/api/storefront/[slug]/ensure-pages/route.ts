import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { ensureVegetablePages } from "@/lib/templates/vegetable-pages";

type Params = { params: Promise<{ slug: string }> };

// POST /api/storefront/:slug/ensure-pages
// Ensures that About, Our Story, Contact, and Reviews pages exist for the store
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const store = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [
          { slug },
          { subdomain: slug },
          { customDomain: slug },
        ],
      },
      select: { id: true, slug: true },
    });

    if (!store) {
      return error("Store not found", 404);
    }

    const activeTemplate = await prisma.siteTemplate.findFirst({
      where: { siteId: store.id, isActive: true },
      select: { template: { select: { slug: true } } },
    });

    if (activeTemplate?.template?.slug === "vegetables") {
      await ensureVegetablePages(store.id);
      return success({
        message: "Vegetable pages ensured successfully",
        createdPages: [],
        existingSlugs: ["menu", "recipe", "about", "contact"],
      });
    }

    // Check if pages already exist
    const existingPages = await prisma.page.findMany({
      where: {
        siteId: store.id,
        slug: { in: ["about", "our-story", "contact", "reviews"] },
      },
      select: { slug: true },
    });

    const existingSlugs = new Set(existingPages.map((p) => p.slug));
    const createdPages: any[] = [];

    // Create About Us page if it doesn't exist
    if (!existingSlugs.has("about")) {
      const page = await prisma.page.create({
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
      createdPages.push(page);
    }

    // Create Our Story page if it doesn't exist
    if (!existingSlugs.has("our-story")) {
      const page = await prisma.page.create({
        data: {
          siteId: store.id,
          title: "Our Story",
          slug: "our-story",
          type: "CUSTOM",
          content: [],
          isPublished: true,
          position: 11,
        },
      });
      createdPages.push(page);
    }

    // Create Contact Us page if it doesn't exist
    if (!existingSlugs.has("contact")) {
      const page = await prisma.page.create({
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
      createdPages.push(page);
    }

    // Create Reviews page if it doesn't exist
    if (!existingSlugs.has("reviews")) {
      const page = await prisma.page.create({
        data: {
          siteId: store.id,
          title: "Reviews",
          slug: "reviews",
          type: "CUSTOM",
          content: [],
          isPublished: true,
          position: 13,
        },
      });
      createdPages.push(page);
    }

    return success({
      message: "Pages ensured successfully",
      createdPages,
      existingSlugs: Array.from(existingSlugs),
    });
  } catch (err) {
    console.error("Ensure pages error:", err);
    return error("Internal server error", 500);
  }
}
