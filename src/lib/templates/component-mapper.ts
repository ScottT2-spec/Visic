/**
 * COMPONENT MAPPER
 * 
 * Maps extracted AST nodes to editable database components.
 * This replaces the preset-based system with true template extraction.
 */

import type { ExtractedNode } from './true-template-parser';
import type { TemplateBlock } from '@/components/storefront/TemplateBlockRenderer';

/**
 * Map an extracted node to a TemplateBlock
 */
export function mapExtractedNodeToBlock(node: ExtractedNode, templateSlug: string): TemplateBlock {
  const block: TemplateBlock = {
    id: node.id,
    type: mapComponentToBlockType(node.component, templateSlug),
    props: mapPropsToBlockProps(node),
  };
  
  return block;
}

/**
 * Map component name to block type
 */
function mapComponentToBlockType(componentName: string, templateSlug: string): string {
  // Template-specific mappings
  const templateMappings: Record<string, Record<string, string>> = {
    'perfumes': {
      'PerfumesHeader': 'perfumesHeader',
      'PerfumesHeroSlider': 'perfumesHeroSlider',
      'PerfumesSectionTitle': 'perfumesSectionTitle',
      'PerfumesProductGrid': 'perfumesProductGrid',
      'PerfumesFooter': 'perfumesFooter',
      'PerfumesAboutWelcome': 'perfumesAboutWelcome',
      'PerfumesAboutMarquee': 'perfumesAboutMarquee',
      'PerfumesAboutStory': 'perfumesAboutStory',
      'PerfumesWhyChooseUs': 'perfumesWhyChooseUs',
      'PerfumesContactHero': 'perfumesContactHero',
      'PerfumesContactInfo': 'perfumesContactInfo',
      'PerfumesContactForm': 'perfumesContactForm',
      'PerfumesBrandedStores': 'perfumesBrandedStores',
      'PerfumesPageHero': 'perfumesPageHero',
      'PerfumesCollectionsGrid': 'perfumesCollectionsGrid',
      'PerfumesJournalGrid': 'perfumesJournalGrid',
    },
    'cosmetics': {
      'CosmeticsHeader': 'cosmeticsHeader',
      'CosmeticsHeroSlider': 'cosmeticsHeroSlider',
      'CosmeticsPromoBanners': 'cosmeticsPromoBanners',
      'CosmeticsSectionTitle': 'cosmeticsSectionTitle',
      'CosmeticsProductGrid': 'cosmeticsProductGrid',
      'CosmeticsFooter': 'cosmeticsFooter',
    },
    'kids': {
      'KidsHeader': 'kidsHeader',
      'KidsAnnouncementBar': 'kidsAnnouncementBar',
      'KidsHeroSlider': 'kidsHeroSlider',
      'KidsSectionTitle': 'kidsSectionTitle',
      'KidsCategoryCards': 'kidsCategoryCards',
      'KidsProductGrid': 'kidsProductGrid',
      'KidsFooter': 'kidsFooter',
    },
    'handmade-bags': {
      'HandmadeBagsHeader': 'handmadeBagsHeader',
      'FashionHeroSlider': 'fashionHeroSlider',
      'FashionMarquee': 'fashionMarquee',
      'FashionCategoryCards': 'fashionCategoryCards',
      'FashionProductGrid': 'fashionProductGrid',
      'FashionCoverBanners': 'fashionCoverBanners',
      'FashionBlogPosts': 'fashionBlogPosts',
      'FashionNewsletter': 'fashionNewsletter',
      'HandmadeBagsFooter': 'handmadeBagsFooter',
    },
    't-shirts-prints': {
      'TShirtsPrintsHeader': 'tShirtsPrintsHeader',
      'FashionHeroSlider': 'fashionHeroSlider',
      'FashionMarquee': 'fashionMarquee',
      'FashionCategoryCards': 'fashionCategoryCards',
      'FashionProductGrid': 'fashionProductGrid',
      'FashionCoverBanners': 'fashionCoverBanners',
      'FashionBlogPosts': 'fashionBlogPosts',
      'FashionNewsletter': 'fashionNewsletter',
      'TShirtsPrintsFooter': 'tShirtsPrintsFooter',
    },
  };
  
  // Check template-specific mapping
  if (templateMappings[templateSlug] && templateMappings[templateSlug][componentName]) {
    return templateMappings[templateSlug][componentName];
  }
  
  // Generic mappings for common JSX elements
  const genericMappings: Record<string, string> = {
    'div': 'container',
    'section': 'section',
    'header': 'header',
    'footer': 'footer',
    'nav': 'navigation',
    'img': 'image',
    'h1': 'heading',
    'h2': 'heading',
    'h3': 'heading',
    'h4': 'heading',
    'p': 'text',
    'button': 'button',
    'a': 'link',
    'ul': 'list',
    'li': 'list-item',
    'span': 'text',
  };
  
  return genericMappings[componentName] || componentName.toLowerCase();
}

/**
 * Map extracted props to block props
 */
function mapPropsToBlockProps(node: ExtractedNode): Record<string, any> {
  const props: Record<string, any> = {};
  
  // Copy original props
  Object.assign(props, node.props);
  
  // Add extracted styles
  if (node.styles.inlineStyles) {
    props.styles = node.styles.inlineStyles;
  }
  
  if (node.styles.className) {
    props.className = node.styles.className;
  }
  
  // Add extracted images
  if (node.images.length > 0) {
    props.images = node.images;
  }
  
  // Add extracted typography
  if (Object.keys(node.typography).length > 0) {
    props.typography = node.typography;
  }
  
  // Add extracted layout
  if (Object.keys(node.layout).length > 0) {
    props.layout = node.layout;
  }
  
  // Add extracted animations
  if (node.animations.length > 0) {
    props.animations = node.animations;
  }
  
  // Add children if they exist
  if (node.children.length > 0) {
    props.children = node.children.map(child => mapExtractedNodeToBlock(child, ''));
  }
  
  return props;
}

/**
 * Convert extracted nodes to template blocks array
 */
export function convertExtractionToBlocks(
  extractions: Array<{ nodes: ExtractedNode[]; templateSlug: string }>
): TemplateBlock[] {
  const blocks: TemplateBlock[] = [];
  
  for (const extraction of extractions) {
    for (const node of extraction.nodes) {
      const block = mapExtractedNodeToBlock(node, extraction.templateSlug);
      blocks.push(block);
    }
  }
  
  return blocks;
}

/**
 * Generate template preset from extraction
 */
export function generateTemplatePreset(
  templateSlug: string,
  extractions: Array<{ nodes: ExtractedNode[]; templateSlug: string }>
): TemplateBlock[] {
  const blocks = convertExtractionToBlocks(extractions);
  
  // Order blocks by component type for better structure
  const orderedBlocks = orderBlocksByType(blocks);
  
  return orderedBlocks;
}

/**
 * Order blocks by type for logical structure
 */
function orderBlocksByType(blocks: TemplateBlock[]): TemplateBlock[] {
  const typeOrder = [
    'header',
    'announcement',
    'hero',
    'marquee',
    'section',
    'category',
    'product',
    'banner',
    'blog',
    'newsletter',
    'footer',
  ];
  
  return blocks.sort((a, b) => {
    const aIndex = typeOrder.indexOf(a.type);
    const bIndex = typeOrder.indexOf(b.type);
    
    // If both types are in the order list, sort by that
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in the order list, put it first
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // Otherwise, keep original order
    return 0;
  });
}
