import type { Section } from "@/types";
import type { BuilderBlock } from "@/components/storefront/BlockRenderer";

/**
 * Converts old BuilderBlock format to new Section format for the VisicSite builder
 * This bridges the gap between existing page content and the new TemplateRenderer
 */
export function convertBlocksToSections(blocks: BuilderBlock[]): Section[] {
  if (!Array.isArray(blocks)) return [];

  return blocks.map((block) => {
    const section: Section = {
      id: block.id || crypto.randomUUID(),
      type: mapBlockTypeToSectionType(block.type),
      content: extractBlockContent(block),
      styleOverrides: extractBlockStyles(block),
    };
    return section;
  });
}

/**
 * Converts new Section format back to BuilderBlock format for saving to database
 * This is the reverse operation of convertBlocksToSections
 */
export function convertSectionsToBlocks(sections: Section[]): BuilderBlock[] {
  if (!Array.isArray(sections)) return [];

  return sections.map((section) => {
    const block: BuilderBlock = {
      id: section.id,
      type: section.type,
      props: {
        ...section.content,
        ...section.styleOverrides,
      },
    };
    return block;
  });
}

function mapBlockTypeToSectionType(blockType: string): string {
  // Map old BuilderBlock types to new Section types
  const typeMap: Record<string, string> = {
    // Text blocks
    "heading": "heading",
    "text": "text",
    "subheading": "text",
    
    // Media blocks
    "image": "image",
    "imageHeroBanner": "image",
    "hero": "heading",
    
    // Layout blocks
    "columns": "columns",
    "grid": "grid",
    "spacer": "spacer",
    "divider": "divider",
    
    // Commerce blocks
    "product": "product",
    "products": "products",
    "featured_products": "products",
    "staticProductGrid": "products",
    "productGrid": "products",
    "new_arrivals": "products",
    "best_sellers": "products",
    
    // Social blocks
    "whatsapp": "whatsapp",
    "social": "social",
    
    // Marketing blocks
    "countdown": "countdown",
    "testimonial": "testimonial",
    "cta": "cta",
    
    // Navigation/Cards
    "linkCards": "columns",
    "imageCategoryCards": "grid",
    "imageBrands": "grid",
    "promoSplit": "columns",
  };
  
  return typeMap[blockType] || blockType; // Preserve bespoke block types (health, fashion, etc.)
}

function extractBlockContent(block: BuilderBlock): Record<string, unknown> {
  const content: Record<string, unknown> = {};
  
  // For bespoke/template blocks, preserve ALL props as content
  const knownGenericTypes = new Set(["heading", "text", "subheading", "image", "imageHeroBanner", "hero", "columns", "grid", "spacer", "divider", "product", "products", "featured_products", "staticProductGrid", "productGrid", "new_arrivals", "best_sellers", "whatsapp", "social", "countdown", "testimonial", "cta", "linkCards", "imageCategoryCards", "imageBrands", "promoSplit", "button"]);
  
  if (!knownGenericTypes.has(block.type) && block.props) {
    // Bespoke block — copy all props into content so the editor can access them
    return { ...block.props } as Record<string, unknown>;
  }
  
  // Extract common content fields for generic blocks
  if (block.props) {
    if (block.props.heading) content.heading = block.props.heading;
    if (block.props.text) content.text = block.props.text;
    if (block.props.subheading) content.subheading = block.props.subheading;
    if (block.props.buttonText) content.text = block.props.buttonText;
    if (block.props.url) content.url = block.props.url;
    if (block.props.alt) content.alt = block.props.alt;
    if (block.props.badge) content.badge = block.props.badge;
  }
  
  return content;
}

function extractBlockStyles(block: BuilderBlock): Record<string, unknown> {
  const styles: Record<string, unknown> = {};
  
  if (block.props) {
    if (block.props.backgroundColor) styles.backgroundColor = block.props.backgroundColor;
    if (block.props.textColor) styles.textColor = block.props.textColor;
    if (block.props.padding) styles.paddingY = block.props.padding;
    if (block.props.margin) styles.marginTop = block.props.margin;
    if (block.props.customCss) styles.customCss = block.props.customCss;
  }
  
  return styles;
}
