// ─── GLOBAL BLOCK STYLE SCHEMA ─────────────────────────────────────
// Inspired by Shopify sections + WordPress block supports
// Defines which style properties each block type supports and how to resolve them

import type { CSSProperties } from "react";

/* ─── STYLE PROPERTY DEFINITIONS ─────────────────────────────────── */

export interface BlockStyleSettings {
  // Colors & Background
  backgroundColor?: string;
  textColor?: string;
  backgroundType?: 'color' | 'gradient' | 'image' | 'video';
  backgroundGradient?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundOverlay?: string;
  backgroundOverlayOpacity?: number;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  
  // Spacing
  paddingY?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  
  // Layout & Alignment
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  gap?: string;
  maxWidth?: string;
  minWidth?: string;
  
  // Grid Layout
  gridColumns?: string;
  gridRows?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumnGap?: string;
  gridRowGap?: string;
  
  // Content Layout (for Shop/Blog grids)
  contentColumns?: number; // Number of columns for product/blog grids
  contentGap?: string; // Gap between cards
  contentAlign?: 'left' | 'center' | 'right'; // Alignment of cards
  
  // Borders
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  borderWidth?: string;
  borderColor?: string;
  borderRadius?: string;
  borderRadiusTopLeft?: string;
  borderRadiusTopRight?: string;
  borderRadiusBottomLeft?: string;
  borderRadiusBottomRight?: string;
  
  // Shadows
  boxShadow?: string;
  
  // Motion & Transitions
  transitionDuration?: string;
  transitionTimingFunction?: string;
  hoverScale?: string;
  hoverOpacity?: string;
  hoverShadow?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
  animationPreset?: string;
  
  // Position & Display
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  zIndex?: string | number;
  display?: 'block' | 'flex' | 'grid' | 'inline-block' | 'inline-flex' | 'none';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  // Responsive Visibility
  responsiveVisibility?: {
    desktop?: boolean;
    tablet?: boolean;
    mobile?: boolean;
  };
  
  // Custom CSS
  customCss?: string;
}

/* ─── BLOCK STYLE SCHEMA ─────────────────────────────────────────── */

export interface BlockStyleSchema {
  // Which property groups this block supports
  supports: {
    colors?: boolean;
    background?: boolean;
    spacing?: boolean;
    typography?: boolean;
    layout?: boolean;
    borders?: boolean;
    shadows?: boolean;
    motion?: boolean;
    responsive?: boolean;
    customCss?: boolean;
  };
  
  // Default values for this block type
  defaults?: Partial<BlockStyleSettings>;
}

/* ─── SCHEMA REGISTRY ───────────────────────────────────────────── */

export const BLOCK_STYLE_SCHEMAS: Record<string, BlockStyleSchema> = {
  // ─── BASIC BLOCKS ───────────────────────────────────────────────
  heading: {
    supports: {
      colors: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: false,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
    defaults: {
      textAlign: 'left',
    },
  },
  
  text: {
    supports: {
      colors: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: false,
      shadows: false,
      motion: false,
      responsive: true,
      customCss: true,
    },
    defaults: {
      textAlign: 'left',
    },
  },
  
  image: {
    supports: {
      colors: false,
      spacing: true,
      typography: false,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  button: {
    supports: {
      colors: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  // ─── LAYOUT BLOCKS ─────────────────────────────────────────────
  hero: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  columns: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: false,
      layout: true,
      borders: true,
      shadows: false,
      motion: false,
      responsive: true,
      customCss: true,
    },
  },
  
  grid: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: false,
      layout: true,
      borders: true,
      shadows: false,
      motion: false,
      responsive: true,
      customCss: true,
    },
  },
  
  spacer: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: false,
      layout: false,
      borders: false,
      shadows: false,
      motion: false,
      responsive: true,
      customCss: true,
    },
  },
  
  divider: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: false,
      layout: false,
      borders: true,
      shadows: false,
      motion: false,
      responsive: true,
      customCss: true,
    },
  },
  
  // ─── COMMERCE BLOCKS ───────────────────────────────────────────
  product: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  products: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: false,
      responsive: true,
      customCss: true,
    },
  },
  
  productGrid: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  // ─── SOCIAL BLOCKS ─────────────────────────────────────────────
  whatsapp: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: false,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  social: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: false,
      layout: true,
      borders: false,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  // ─── MARKETING BLOCKS ──────────────────────────────────────────
  countdown: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  testimonial: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  cta: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  // ─── COSMETICS TEMPLATE BLOCKS ─────────────────────────────────
  cosmeticsHeroSlider: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  cosmeticsPromoBanners: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  cosmeticsSectionTitle: {
    supports: {
      colors: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: false,
      shadows: false,
      motion: false,
      responsive: true,
      customCss: true,
    },
  },
  cosmeticsProductGrid: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  cosmeticsCategoryCards: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  cosmeticsDiscovery: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  cosmeticsCountdownBanner: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  cosmeticsInfoBoxes: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  cosmeticsBlogPosts: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  cosmeticsInstagram: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  cosmeticsNewsletter: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  // ─── FASHION TEMPLATE BLOCKS ──────────────────────────────────
  fashionHeroSlider: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  fashionPromoBanners: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  fashionSectionTitle: {
    supports: {
      colors: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: false,
      shadows: false,
      motion: false,
      responsive: true,
      customCss: true,
    },
  },
  fashionProductGrid: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  fashionCategoryCards: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  fashionTestimonials: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  fashionBlogPosts: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  fashionNewsletter: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  fashionFooter: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  fashionFeatures: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  fashionInstagram: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  fashionMarquee: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  fashionCoverBanners: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  // ─── KIDS TEMPLATE BLOCKS ────────────────────────────────────
  kidsAnnouncementBar: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  kidsHeroSlider: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  kidsSectionTitle: {
    supports: {
      colors: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: false,
      shadows: false,
      motion: false,
      responsive: true,
      customCss: true,
    },
  },
  kidsCategoryCards: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  kidsProductGrid: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  kidsBundlePromo: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  kidsBlogPosts: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  kidsInstagram: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  kidsNewsletter: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  kidsFooter: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  // ─── PERFUMES TEMPLATE BLOCKS ─────────────────────────────────
  perfumesHeroSlider: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  perfumesSectionTitle: {
    supports: {
      colors: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: false,
      shadows: false,
      motion: false,
      responsive: true,
      customCss: true,
    },
  },
  perfumesProductGrid: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  perfumesOlfactoryTags: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  perfumesMarquee: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  perfumesFeaturedBanners: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  perfumesTabbedProducts: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  perfumesCollectionBanners: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  perfumesBlogArticles: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  perfumesInstagram: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  perfumesFooter: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  // ─── OTHER TEMPLATE FAMILIES (abbreviated for space) ───────────
  electronicsHeroSlider: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  bakeryHeroSlider: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  groceryHeroSlider: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  healthHero: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  interiorHeroSlider: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  makeupHeroSlider: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  // ─── SHOP/BLOG SPECIAL BLOCKS ─────────────────────────────────
  shopPage: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  blogPage: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
  
  // ─── DEFAULT SCHEMA ───────────────────────────────────────────
  // Template blocks - full support by default
  default: {
    supports: {
      colors: true,
      background: true,
      spacing: true,
      typography: true,
      layout: true,
      borders: true,
      shadows: true,
      motion: true,
      responsive: true,
      customCss: true,
    },
  },
};

/* ─── STYLE RESOLVER FUNCTION ───────────────────────────────────── */

/**
 * Converts BlockStyleSettings into CSSProperties
 * This is the single source of truth for applying styles across all blocks
 */
export function resolveBlockStyles(
  settings: BlockStyleSettings,
  schema: BlockStyleSchema = BLOCK_STYLE_SCHEMAS.default
): CSSProperties {
  const styles: CSSProperties = {};
  const supports = schema.supports;
  
  // Colors & Background
  if (supports.colors || supports.background) {
    if (settings.backgroundColor) styles.backgroundColor = settings.backgroundColor;
    if (settings.textColor) styles.color = settings.textColor;
    
    if (supports.background) {
      if (settings.backgroundType === 'gradient' && settings.backgroundGradient) {
        styles.backgroundImage = settings.backgroundGradient;
      } else if (settings.backgroundType === 'image' && settings.backgroundImage) {
        styles.backgroundImage = `url(${settings.backgroundImage})`;
        styles.backgroundSize = settings.backgroundSize || 'cover';
        styles.backgroundPosition = settings.backgroundPosition || 'center';
        styles.backgroundRepeat = settings.backgroundRepeat || 'no-repeat';
      } else if (settings.backgroundType === 'video' && settings.backgroundVideo) {
        // Video backgrounds need special handling in the component
        (styles as any)['--background-video'] = settings.backgroundVideo;
      }
      
      // Background position, size, repeat for any background type
      if (settings.backgroundPosition) styles.backgroundPosition = settings.backgroundPosition;
      if (settings.backgroundSize) styles.backgroundSize = settings.backgroundSize;
      if (settings.backgroundRepeat) styles.backgroundRepeat = settings.backgroundRepeat;
    }
  }
  
  // Spacing
  if (supports.spacing) {
    if (settings.paddingY) {
      styles.paddingTop = settings.paddingY;
      styles.paddingBottom = settings.paddingY;
    }
    if (settings.paddingTop) styles.paddingTop = settings.paddingTop;
    if (settings.paddingBottom) styles.paddingBottom = settings.paddingBottom;
    if (settings.paddingLeft) styles.paddingLeft = settings.paddingLeft;
    if (settings.paddingRight) styles.paddingRight = settings.paddingRight;
    
    if (settings.marginTop) styles.marginTop = settings.marginTop;
    if (settings.marginBottom) styles.marginBottom = settings.marginBottom;
    if (settings.marginLeft) styles.marginLeft = settings.marginLeft;
    if (settings.marginRight) styles.marginRight = settings.marginRight;
  }
  
  // Typography
  if (supports.typography) {
    if (settings.fontFamily) styles.fontFamily = settings.fontFamily;
    if (settings.fontSize) styles.fontSize = settings.fontSize;
    if (settings.fontWeight) styles.fontWeight = settings.fontWeight;
    if (settings.lineHeight) styles.lineHeight = settings.lineHeight;
    if (settings.letterSpacing) styles.letterSpacing = settings.letterSpacing;
    if (settings.textTransform) styles.textTransform = settings.textTransform;
    if (settings.textAlign) styles.textAlign = settings.textAlign;
    if (settings.textDecoration) styles.textDecoration = settings.textDecoration;
  }
  
  // Layout & Alignment
  if (supports.layout) {
    if (settings.alignContent) styles.alignContent = settings.alignContent;
    if (settings.alignItems) styles.alignItems = settings.alignItems;
    if (settings.justifyContent) styles.justifyContent = settings.justifyContent;
    if (settings.flexDirection) styles.flexDirection = settings.flexDirection;
    if (settings.flexWrap) styles.flexWrap = settings.flexWrap;
    if (settings.gap) styles.gap = settings.gap;
    if (settings.maxWidth) styles.maxWidth = settings.maxWidth;
    if (settings.minWidth) styles.minWidth = settings.minWidth;
    if (settings.display) styles.display = settings.display;
    
    // Grid Layout
    if (settings.gridColumns) styles.gridTemplateColumns = settings.gridColumns;
    if (settings.gridRows) styles.gridTemplateRows = settings.gridRows;
    if (settings.gridTemplateColumns) styles.gridTemplateColumns = settings.gridTemplateColumns;
    if (settings.gridTemplateRows) styles.gridTemplateRows = settings.gridTemplateRows;
    if (settings.gridColumnGap) styles.gridColumnGap = settings.gridColumnGap;
    if (settings.gridRowGap) styles.gridRowGap = settings.gridRowGap;
  }
  
  // Borders
  if (supports.borders) {
    if (settings.borderStyle && settings.borderStyle !== 'none') {
      styles.borderStyle = settings.borderStyle;
      if (settings.borderWidth) styles.borderWidth = settings.borderWidth;
      if (settings.borderColor) styles.borderColor = settings.borderColor;
    }
    if (settings.borderRadius) styles.borderRadius = settings.borderRadius;
    // Per-corner border radius
    if (settings.borderRadiusTopLeft) styles.borderTopLeftRadius = settings.borderRadiusTopLeft;
    if (settings.borderRadiusTopRight) styles.borderTopRightRadius = settings.borderRadiusTopRight;
    if (settings.borderRadiusBottomLeft) styles.borderBottomLeftRadius = settings.borderRadiusBottomLeft;
    if (settings.borderRadiusBottomRight) styles.borderBottomRightRadius = settings.borderRadiusBottomRight;
  }
  
  // Shadows
  if (supports.shadows && settings.boxShadow) {
    styles.boxShadow = settings.boxShadow;
  }
  
  // Motion & Transitions
  if (supports.motion) {
    if (settings.transitionDuration) {
      styles.transitionDuration = settings.transitionDuration;
      styles.transitionTimingFunction = settings.transitionTimingFunction || 'ease';
    }
  }
  
  // Position & Display
  if (settings.position) styles.position = settings.position;
  if (settings.zIndex) styles.zIndex = typeof settings.zIndex === 'number' ? settings.zIndex : parseInt(settings.zIndex);
  if (settings.overflow) styles.overflow = settings.overflow;
  
  // Animation preset
  if (settings.animationPreset && settings.animationPreset !== 'none') {
    (styles as any).animationName = settings.animationPreset;
  }
  
  return styles;
}

/* ─── RESPONSIVE VISIBILITY CLASSES ─────────────────────────────── */

export function getResponsiveVisibilityClasses(
  settings: BlockStyleSettings
): string {
  const visibility = settings.responsiveVisibility;
  if (!visibility) return '';
  
  const classes: string[] = [];
  
  if (visibility.desktop === false) classes.push('hidden', 'lg:hidden');
  if (visibility.tablet === false) classes.push('md:hidden');
  if (visibility.mobile === false) classes.push('hidden', 'sm:block');
  
  return classes.join(' ');
}

/* ─── HOVER STYLES GENERATOR ─────────────────────────────────────── */

export function getHoverStyles(settings: BlockStyleSettings): CSSProperties {
  const hoverStyles: CSSProperties = {};
  
  if (settings.hoverScale) {
    (hoverStyles as any).transform = `scale(${settings.hoverScale})`;
  }
  if (settings.hoverOpacity) {
    hoverStyles.opacity = settings.hoverOpacity;
  }
  if (settings.hoverShadow) {
    hoverStyles.boxShadow = settings.hoverShadow;
  }
  if (settings.hoverBackgroundColor) {
    hoverStyles.backgroundColor = settings.hoverBackgroundColor;
  }
  if (settings.hoverTextColor) {
    hoverStyles.color = settings.hoverTextColor;
  }
  
  return hoverStyles;
}

/* ─── BACKGROUND OVERLAY RESOLVER ─────────────────────────────────── */

export function getBackgroundOverlayStyles(
  settings: BlockStyleSettings
): CSSProperties | null {
  if (!settings.backgroundOverlay) return null;
  
  const opacity = settings.backgroundOverlayOpacity ?? 0.5;
  
  return {
    position: 'absolute',
    inset: 0,
    backgroundColor: settings.backgroundOverlay,
    opacity: opacity > 1 ? opacity / 100 : opacity,
    pointerEvents: 'none',
  } as CSSProperties;
}

/* ─── SCHEMA HELPER FUNCTIONS ───────────────────────────────────── */

export function getBlockSchema(blockType: string): BlockStyleSchema {
  return BLOCK_STYLE_SCHEMAS[blockType] || BLOCK_STYLE_SCHEMAS.default;
}

export function getSupportedProperties(blockType: string): string[] {
  const schema = getBlockSchema(blockType);
  const properties: string[] = [];
  
  if (schema.supports.colors) properties.push('backgroundColor', 'textColor');
  if (schema.supports.background) {
    properties.push('backgroundType', 'backgroundGradient', 'backgroundImage', 'backgroundVideo', 'backgroundOverlay', 'backgroundOverlayOpacity', 'backgroundPosition', 'backgroundSize', 'backgroundRepeat');
  }
  if (schema.supports.spacing) {
    properties.push('paddingY', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight');
    properties.push('marginTop', 'marginBottom', 'marginLeft', 'marginRight');
  }
  if (schema.supports.typography) {
    properties.push('fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform', 'textAlign', 'textDecoration');
  }
  if (schema.supports.layout) {
    properties.push('alignContent', 'alignItems', 'justifyContent', 'flexDirection', 'flexWrap', 'gap', 'maxWidth', 'minWidth', 'display', 'position', 'zIndex', 'overflow');
    properties.push('gridColumns', 'gridRows', 'gridTemplateColumns', 'gridTemplateRows', 'gridColumnGap', 'gridRowGap');
  }
  if (schema.supports.borders) {
    properties.push('borderStyle', 'borderWidth', 'borderColor', 'borderRadius', 'borderRadiusTopLeft', 'borderRadiusTopRight', 'borderRadiusBottomLeft', 'borderRadiusBottomRight');
  }
  if (schema.supports.shadows) properties.push('boxShadow');
  if (schema.supports.motion) {
    properties.push('transitionDuration', 'transitionTimingFunction', 'hoverScale', 'hoverOpacity', 'hoverShadow', 'hoverBackgroundColor', 'hoverTextColor', 'animationPreset');
  }
  if (schema.supports.responsive) properties.push('responsiveVisibility');
  if (schema.supports.customCss) properties.push('customCss');
  
  return properties;
}

/**
 * Merge global design system defaults with per-block overrides
 * Per-block overrides take precedence over global defaults
 */
export function mergeStylesWithDefaults(
  blockOverrides: BlockStyleSettings,
  globalDefaults: BlockStyleSettings,
  schema: BlockStyleSchema
): BlockStyleSettings {
  const merged: BlockStyleSettings = { ...globalDefaults };
  
  // Only merge properties that the block schema supports
  const supportedProps = getSupportedProperties(schema.supports ? 'default' : 'default');
  
  for (const prop of supportedProps) {
    if (blockOverrides[prop as keyof BlockStyleSettings] !== undefined) {
      (merged as any)[prop] = blockOverrides[prop as keyof BlockStyleSettings];
    }
  }
  
  return merged;
}
