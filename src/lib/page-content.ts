import type { BuilderBlock } from "@/components/storefront/BlockRenderer";

export interface PageSettings {
  backgroundColor?: string | null;
  backgroundImage?: string | null;
  backgroundSize?: "cover" | "contain" | "auto";
  backgroundPosition?: string | null;
  backgroundRepeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
  backgroundAttachment?: "scroll" | "fixed";
  overlayColor?: string | null;
  overlayOpacity?: number | null;
}

export interface PageContentDocument {
  blocks: BuilderBlock[];
  settings: PageSettings;
}

const EMPTY_PAGE_CONTENT: PageContentDocument = {
  blocks: [],
  settings: {},
};

function normalizeBlocks(value: unknown): BuilderBlock[] {
  return Array.isArray(value) ? (value as BuilderBlock[]) : [];
}

function normalizeSettings(value: unknown): PageSettings {
  if (!value || typeof value !== "object") return {};
  const settings = value as Record<string, unknown>;
  return {
    backgroundColor: typeof settings.backgroundColor === "string" ? settings.backgroundColor : undefined,
    backgroundImage: typeof settings.backgroundImage === "string" ? settings.backgroundImage : undefined,
    backgroundSize:
      settings.backgroundSize === "cover" || settings.backgroundSize === "contain" || settings.backgroundSize === "auto"
        ? settings.backgroundSize
        : undefined,
    backgroundPosition: typeof settings.backgroundPosition === "string" ? settings.backgroundPosition : undefined,
    backgroundRepeat:
      settings.backgroundRepeat === "no-repeat" ||
      settings.backgroundRepeat === "repeat" ||
      settings.backgroundRepeat === "repeat-x" ||
      settings.backgroundRepeat === "repeat-y"
        ? settings.backgroundRepeat
        : undefined,
    backgroundAttachment: settings.backgroundAttachment === "scroll" || settings.backgroundAttachment === "fixed" ? settings.backgroundAttachment : undefined,
    overlayColor: typeof settings.overlayColor === "string" ? settings.overlayColor : undefined,
    overlayOpacity: typeof settings.overlayOpacity === "number" ? settings.overlayOpacity : undefined,
  };
}

export function parsePageContent(content: unknown): PageContentDocument {
  if (Array.isArray(content)) {
    return { ...EMPTY_PAGE_CONTENT, blocks: normalizeBlocks(content) };
  }

  if (!content || typeof content !== "object") {
    return { ...EMPTY_PAGE_CONTENT };
  }

  const raw = content as Record<string, unknown>;
  const settings = normalizeSettings(raw.settings || raw.pageSettings || raw.background || raw.pageBackground);

  if (Array.isArray(raw.blocks)) {
    return { blocks: normalizeBlocks(raw.blocks), settings };
  }

  return { ...EMPTY_PAGE_CONTENT, settings };
}

export function serializePageContent(document: PageContentDocument): Record<string, unknown> {
  return {
    blocks: document.blocks,
    settings: document.settings || {},
  };
}

const PACKAGE_BLOCK_TYPES = new Set([
  "imageHeroBanner",
  "staticProductGrid",
  "linkCards",
  "imageCategoryCards",
  "promoSplit",
  "imageBrands",
  "featured_products",
]);

const LEGACY_SCAFFOLD_TYPES = new Set([
  "columns",
  "collections",
  "categories",
  "new_arrivals",
  "best_sellers",
  "brands",
]);

export function isLegacyScaffoldBlocks(blocks: BuilderBlock[]): boolean {
  if (blocks.length === 0) return false;

  const types = new Set(blocks.map((block) => block.type));
  let legacyCount = 0;
  let packageCount = 0;

  for (const type of types) {
    if (LEGACY_SCAFFOLD_TYPES.has(type)) legacyCount += 1;
    if (PACKAGE_BLOCK_TYPES.has(type)) packageCount += 1;
  }

  return legacyCount >= 3 && packageCount === 0;
}

export function pickRicherPageDocument(primary: PageContentDocument, secondary: PageContentDocument): PageContentDocument {
  if (primary.blocks.length === 0) return secondary;
  if (secondary.blocks.length === 0) return primary;

  if (isLegacyScaffoldBlocks(primary.blocks) && !isLegacyScaffoldBlocks(secondary.blocks)) {
    return secondary;
  }

  if (secondary.blocks.length > primary.blocks.length) {
    return { blocks: secondary.blocks, settings: { ...primary.settings, ...secondary.settings } };
  }

  const primaryPackageCount = primary.blocks.filter((block) => PACKAGE_BLOCK_TYPES.has(block.type)).length;
  const secondaryPackageCount = secondary.blocks.filter((block) => PACKAGE_BLOCK_TYPES.has(block.type)).length;

  if (secondaryPackageCount > primaryPackageCount) {
    return { blocks: secondary.blocks, settings: { ...primary.settings, ...secondary.settings } };
  }

  return primary;
}

export function pickRicherPageDocumentWithMeta(
  primary: PageContentDocument,
  secondary: PageContentDocument,
): { document: PageContentDocument; usedSecondary: boolean } {
  const document = pickRicherPageDocument(primary, secondary);
  const usedSecondary =
    secondary.blocks.length > 0 &&
    document.blocks.length === secondary.blocks.length &&
    document.blocks.every((block, index) => block.id === secondary.blocks[index]?.id);

  return { document, usedSecondary };
}

export function normalizePageContentRaw(content: unknown): unknown {
  if (Array.isArray(content)) {
    return { blocks: content, settings: {} };
  }
  return content;
}

export function getLinkedPageHref(page: { slug: string; template?: string | null }, storeSlug: string): string {
  if ((page.template || "").toLowerCase() === "crm:blogs" || page.slug.toLowerCase() === "blogs") {
    return `/store/${storeSlug}/blogs`;
  }

  return `/store/${storeSlug}/${page.slug}`;
}

export function getLinkedPageTemplate(page: { slug: string; title?: string }): string | null {
  const slug = page.slug.toLowerCase();
  const title = (page.title || "").trim().toLowerCase();
  if (slug === "blogs" || title === "blogs" || title === "blog") {
    return "crm:blogs";
  }
  return null;
}

export function getLinkedPageBadge(page: { slug: string; template?: string | null }): string | null {
  if ((page.template || "").toLowerCase() === "crm:blogs" || page.slug.toLowerCase() === "blogs") {
    return "CRM Blogs";
  }

  return null;
}
