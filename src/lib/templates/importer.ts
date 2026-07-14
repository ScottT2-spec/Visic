import { prisma } from "@/lib/db";
import { TEMPLATES } from "@/lib/templates/catalog";
import { FASHION_TEMPLATE_PRESET } from "@/lib/templates/presets/fashion-preset";
import { FASHION_COLORED_PRESET } from "@/lib/templates/presets/fashion-colored-preset";
import { HANDMADE_BAGS_PRESET } from "@/lib/templates/presets/handmade-bags-preset";
import { T_SHIRTS_PRINTS_PRESET } from "@/lib/templates/presets/t-shirts-prints-preset";
import { ELECTRONICS_TEMPLATE_PRESET } from "@/lib/templates/presets/electronics-preset";
import { BAKERY_TEMPLATE_PRESET } from "@/lib/templates/presets/bakery-preset";
import { COSMETICS_TEMPLATE_PRESET } from "@/lib/templates/presets/cosmetics-preset";
import { GROCERY_TEMPLATE_PRESET } from "@/lib/templates/presets/grocery-preset";
import { HEALTH_TEMPLATE_PRESET } from "@/lib/templates/presets/health-preset";
import { INTERIOR_DECOR_PRESET, INTERIOR_RETAIL_PRESET } from "@/lib/templates/presets/interior-preset";
import { KIDS_TEMPLATE_PRESET } from "@/lib/templates/presets/kids-preset";
import { MAKEUP_TEMPLATE_PRESET } from "@/lib/templates/presets/makeup-preset";
import { PERFUMES_TEMPLATE_PRESET } from "@/lib/templates/presets/perfumes-preset";
import { FASHION_SAMPLE_PRODUCTS } from "@/lib/templates/presets/fashion-sample-products";
import { FASHION_SAMPLE_BLOGS } from "@/lib/templates/presets/fashion-sample-blogs";
import { TEMPLATE_SAMPLE_DATA } from "@/lib/templates/presets/template-sample-data";
import { ensureVegetablePages } from "@/lib/templates/vegetable-pages";
import { ensureTemplatePages } from "@/lib/templates/template-pages";

/**
 * Import a template into a site by:
 * 1. Upserting a Template record in the DB
 * 2. Creating a SiteTemplate linking the site to that template
 * 3. Creating a HOME page with editable blocks (or htmlEmbed fallback)
 * 4. Creating sample products so the store isn't empty
 */
export async function importTemplateToSite(
  siteId: string,
  input: {
    templateId?: string | null;
    templateSlug?: string | null;
    variant?: string | null;
  }
) {
  const slug = input.templateSlug || input.templateId;
  if (!slug) {
    return { template: null, siteTemplate: null, pages: [], themeConfig: {}, reused: false };
  }

  // Find the template in our catalog
  const catalogEntry = TEMPLATES.find((t) => t.slug === slug);
  if (!catalogEntry) {
    console.warn(`Template "${slug}" not found in catalog`);
    return { template: null, siteTemplate: null, pages: [], themeConfig: {}, reused: false };
  }

  // Upsert the Template record in DB
  const template = await prisma.template.upsert({
    where: { slug: catalogEntry.slug },
    update: {
      name: catalogEntry.name,
      category: catalogEntry.category,
      description: catalogEntry.description,
      previewImage: catalogEntry.previewImage,
      previewUrl: `/templates/${catalogEntry.file}`,
    },
    create: {
      name: catalogEntry.name,
      slug: catalogEntry.slug,
      category: catalogEntry.category,
      description: catalogEntry.description,
      previewImage: catalogEntry.previewImage,
      previewUrl: `/templates/${catalogEntry.file}`,
      recommendationKeywords: catalogEntry.industries,
      themeConfig: {},
      active: true,
    },
  });

  // Check if SiteTemplate already exists (avoid duplicates)
  const existing = await prisma.siteTemplate.findUnique({
    where: { siteId_templateId: { siteId, templateId: template.id } },
  });

  let siteTemplate;
  if (existing) {
    siteTemplate = existing;
  } else {
    // Deactivate any other active templates for this site
    await prisma.siteTemplate.updateMany({
      where: { siteId, isActive: true },
      data: { isActive: false },
    });

    siteTemplate = await prisma.siteTemplate.create({
      data: {
        siteId,
        templateId: template.id,
        variant: input.variant || null,
        themeConfig: {},
        isActive: true,
        customHtml: null,
      },
    });
  }

  if (catalogEntry.slug === "vegetables") {
    await ensureVegetablePages(siteId);
  }

  // Ensure template-specific pages exist in DB for the page editor
  await ensureTemplatePages(siteId, catalogEntry.slug);

  // Build blocks for the HOME page
  // For templates with editable block presets, use those instead of htmlEmbed
  const TEMPLATE_PRESETS: Record<string, typeof FASHION_TEMPLATE_PRESET> = {
    fashion: FASHION_TEMPLATE_PRESET,
    "fashion-colored": FASHION_COLORED_PRESET,
    "handmade-bags": HANDMADE_BAGS_PRESET,
    "t-shirts-prints": T_SHIRTS_PRINTS_PRESET,
    electronics: ELECTRONICS_TEMPLATE_PRESET,
    "electronics-accessories": ELECTRONICS_TEMPLATE_PRESET,
    hardware: ELECTRONICS_TEMPLATE_PRESET,
    tools: ELECTRONICS_TEMPLATE_PRESET,
    "sweets-bakery": BAKERY_TEMPLATE_PRESET,
    cosmetics: COSMETICS_TEMPLATE_PRESET,
    grocery: GROCERY_TEMPLATE_PRESET,
    vegetables: GROCERY_TEMPLATE_PRESET,
    pills: HEALTH_TEMPLATE_PRESET,
    decor: INTERIOR_DECOR_PRESET,
    retail: INTERIOR_RETAIL_PRESET,
    kids: KIDS_TEMPLATE_PRESET,
    toys: KIDS_TEMPLATE_PRESET,
    makeup: MAKEUP_TEMPLATE_PRESET,
    perfumes: PERFUMES_TEMPLATE_PRESET,
  };

  const preset = TEMPLATE_PRESETS[catalogEntry.slug];
  const homeBlocks = preset
    ? preset
    : [
        {
          id: `htmlEmbed-${template.slug}`,
          type: "htmlEmbed",
          props: {
            src: `/templates/${catalogEntry.file}`,
            minHeight: "100vh",
            title: `${catalogEntry.name} Template`,
          },
        },
      ];

  const homeContent = JSON.parse(JSON.stringify({ blocks: homeBlocks, settings: {} }));

  // Create or update the HOME page
  const existingHome = await prisma.page.findFirst({
    where: { siteId, type: "HOME" },
  });

  let homePage;
  if (existingHome) {
    // Only update if the page has no content yet
    const existingContent = existingHome.content as Record<string, unknown> | null;
    const existingBlocks = Array.isArray(existingContent)
      ? existingContent
      : Array.isArray((existingContent as Record<string, unknown>)?.blocks)
        ? (existingContent as Record<string, unknown>).blocks
        : [];

    if (!Array.isArray(existingBlocks) || (existingBlocks as unknown[]).length === 0) {
      homePage = await prisma.page.update({
        where: { id: existingHome.id },
        data: {
          content: homeContent,
          isPublished: true,
        },
      });
    } else {
      homePage = existingHome;
    }
  } else {
    homePage = await prisma.page.create({
      data: {
        siteId,
        title: "Home",
        slug: "home",
        type: "HOME",
        content: homeContent,
        isPublished: true,
        position: 0,
      },
    });
  }

  // ── Seed sample data (categories, products, blogs) ──────────
  let sampleProducts: unknown[] = [];
  let sampleBlogs: unknown[] = [];
  let sampleCategories: unknown[] = [];

  // Get the site's currency
  const site = await prisma.site.findUnique({ where: { id: siteId }, select: { currency: true } });
  const currency = site?.currency || "USD";

  // Fashion uses its own dedicated sample files; all others use the unified data
  const isFashionFamily = catalogEntry.slug === "fashion" || catalogEntry.slug === "fashion-colored" || catalogEntry.slug === "handmade-bags" || catalogEntry.slug === "t-shirts-prints";
  const templateData = TEMPLATE_SAMPLE_DATA[catalogEntry.slug];

  // ── Categories ──────────────────────────────────────────────
  const categoriesToSeed = templateData?.categories || [];
  if (categoriesToSeed.length > 0) {
    const existingCatCount = await prisma.category.count({ where: { siteId } });
    if (existingCatCount === 0) {
      for (const cat of categoriesToSeed) {
        const created = await prisma.category.create({
          data: {
            siteId,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || "",
            image: cat.image || null,
            position: cat.position ?? 0,
          },
        });
        sampleCategories.push(created);
      }
    }
  }

  // Build slug→id map for linking products to categories
  const allCategories = await prisma.category.findMany({ where: { siteId }, select: { id: true, slug: true } });
  const catSlugToId: Record<string, string> = {};
  for (const c of allCategories) catSlugToId[c.slug] = c.id;

  // ── Products ────────────────────────────────────────────────
  const productsToSeed = isFashionFamily ? FASHION_SAMPLE_PRODUCTS : (templateData?.products || []);
  if (productsToSeed.length > 0) {
    const existingProductCount = await prisma.product.count({ where: { siteId } });
    if (existingProductCount === 0) {
      for (const sample of productsToSeed) {
        const categoryId = (sample as any).category ? catSlugToId[(sample as any).category] || null : null;
        const product = await prisma.product.create({
          data: {
            siteId,
            name: sample.name,
            slug: sample.slug,
            description: sample.description || "",
            price: sample.price,
            compareAtPrice: sample.compareAtPrice || null,
            currency,
            stock: sample.stock ?? 10,
            status: "ACTIVE",
            isFeatured: sample.isFeatured ?? false,
            tags: sample.tags || [],
            position: sample.position ?? 0,
            ...(categoryId ? { categoryId } : {}),
          },
        });

        // Create product images
        if (sample.images && sample.images.length > 0) {
          for (let i = 0; i < sample.images.length; i++) {
            await prisma.productImage.create({
              data: {
                productId: product.id,
                url: sample.images[i],
                alt: sample.name,
                position: i,
              },
            });
          }
        }

        sampleProducts.push(product);
      }
    }
  }

  // ── Blogs ───────────────────────────────────────────────────
  const blogsToSeed = isFashionFamily ? FASHION_SAMPLE_BLOGS : (templateData?.blogs || []);
  if (blogsToSeed.length > 0) {
    const existingBlogCount = await prisma.blog.count({ where: { siteId } });
    if (existingBlogCount === 0) {
      for (const sample of blogsToSeed) {
        const blog = await prisma.blog.create({
          data: {
            siteId,
            title: sample.title,
            slug: sample.slug,
            excerpt: sample.excerpt,
            content: { text: sample.content },
            contentHtml: sample.content.split("\n\n").map((p: string) => `<p>${p}</p>`).join(""),
            coverImage: sample.coverImage,
            author: sample.author,
            category: sample.category,
            tags: sample.tags,
            status: "PUBLISHED",
            publishedAt: new Date(),
          },
        });
        sampleBlogs.push(blog);
      }
    }
  }

  return {
    template,
    siteTemplate,
    pages: [homePage],
    sampleCategories,
    sampleProducts,
    sampleBlogs,
    themeConfig: {},
    reused: !!existing,
  };
}
