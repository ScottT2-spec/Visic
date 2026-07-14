import type { CSSProperties } from "react";
import { 
  resolveBlockStyles, 
  getResponsiveVisibilityClasses,
  getBackgroundOverlayStyles,
  getHoverStyles,
  type BlockStyleSettings,
  getBlockSchema,
  mergeStylesWithDefaults,
  type BlockStyleSchema
} from "@/lib/builder/block-style-schema";

export function resolveOpacity(value: unknown, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return value > 1 ? value / 100 : value;
}

/**
 * Legacy function - now uses the new schema-based resolver
 * Maps old props format to new BlockStyleSettings format
 */
export function getSectionStyle(props: Record<string, unknown>) {
  const backgroundImage = props.bgImage as string | undefined;
  const bgColor = (props.bgColor as string) || undefined;
  const textColor = (props.textColor as string) || undefined;

  return {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: backgroundImage ? "cover" : undefined,
    backgroundPosition: backgroundImage ? "center center" : undefined,
    backgroundRepeat: backgroundImage ? "no-repeat" : undefined,
    backgroundColor: bgColor,
    color: textColor,
  } as CSSProperties;
}

/**
 * New universal style resolver for blocks with styleOverrides
 * Converts SectionStyleOverrides to BlockStyleSettings and resolves styles
 * Optionally merges with global design system defaults
 */
export function resolveSectionStyleOverrides(
  styleOverrides: Record<string, unknown> | undefined,
  blockType: string = 'default',
  globalDefaults?: BlockStyleSettings
): { styles: CSSProperties; classes: string; overlayStyles: CSSProperties | null; hoverCss: string } {
  console.log('[resolveSectionStyleOverrides] INPUT:', { styleOverrides, blockType, globalDefaults });

  if (!styleOverrides && !globalDefaults) {
    return { styles: {}, classes: '', overlayStyles: null, hoverCss: '' };
  }

  // Map SectionStyleOverrides to BlockStyleSettings format
  const blockSettings: BlockStyleSettings = {
    // Colors & Background
    backgroundColor: styleOverrides?.backgroundColor as string,
    textColor: styleOverrides?.textColor as string,
    backgroundType: styleOverrides?.backgroundType as 'color' | 'gradient' | 'image' | 'video',
    backgroundGradient: styleOverrides?.backgroundGradient as string,
    backgroundImage: styleOverrides?.backgroundImage as string,
    backgroundVideo: styleOverrides?.backgroundVideo as string,
    backgroundOverlay: styleOverrides?.backgroundOverlay as string,
    backgroundOverlayOpacity: styleOverrides?.backgroundOverlayOpacity as number,
    backgroundPosition: styleOverrides?.backgroundPosition as string,
    backgroundSize: styleOverrides?.backgroundSize as string,
    backgroundRepeat: styleOverrides?.backgroundRepeat as string,
    
    // Spacing
    paddingY: styleOverrides?.paddingY as string,
    paddingTop: styleOverrides?.paddingTop as string,
    paddingBottom: styleOverrides?.paddingBottom as string,
    paddingLeft: styleOverrides?.paddingLeft as string,
    paddingRight: styleOverrides?.paddingRight as string,
    marginTop: styleOverrides?.marginTop as string,
    marginBottom: styleOverrides?.marginBottom as string,
    marginLeft: styleOverrides?.marginLeft as string,
    marginRight: styleOverrides?.marginRight as string,
    
    // Typography
    fontFamily: styleOverrides?.fontFamily as string,
    fontSize: styleOverrides?.fontSize as string,
    fontWeight: styleOverrides?.fontWeight as string,
    lineHeight: styleOverrides?.lineHeight as string,
    letterSpacing: styleOverrides?.letterSpacing as string,
    textTransform: styleOverrides?.textTransform as string,
    textAlign: styleOverrides?.textAlign as 'left' | 'center' | 'right' | 'justify',
    textDecoration: styleOverrides?.textDecoration as 'none' | 'underline' | 'line-through' | 'overline',
    
    // Layout
    alignContent: styleOverrides?.alignContent as any,
    alignItems: styleOverrides?.alignItems as any,
    justifyContent: styleOverrides?.justifyContent as any,
    flexDirection: styleOverrides?.flexDirection as any,
    flexWrap: styleOverrides?.flexWrap as any,
    gap: styleOverrides?.gap as string,
    maxWidth: styleOverrides?.maxWidth as string,
    minWidth: styleOverrides?.minWidth as string,
    display: styleOverrides?.display as any,
    position: styleOverrides?.position as 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky',
    zIndex: styleOverrides?.zIndex as string | number,
    overflow: styleOverrides?.overflow as 'visible' | 'hidden' | 'scroll' | 'auto',
    
    // Grid Layout
    gridColumns: styleOverrides?.gridColumns as string,
    gridRows: styleOverrides?.gridRows as string,
    gridTemplateColumns: styleOverrides?.gridTemplateColumns as string,
    gridTemplateRows: styleOverrides?.gridTemplateRows as string,
    gridColumnGap: styleOverrides?.gridColumnGap as string,
    gridRowGap: styleOverrides?.gridRowGap as string,
    
    // Content Layout (for Shop/Blog grids)
    contentColumns: styleOverrides?.contentColumns as number,
    contentGap: styleOverrides?.contentGap as string,
    contentAlign: styleOverrides?.contentAlign as 'left' | 'center' | 'right',
    
    // Borders
    borderStyle: styleOverrides?.borderStyle as any,
    borderWidth: styleOverrides?.borderWidth as string,
    borderColor: styleOverrides?.borderColor as string,
    borderRadius: styleOverrides?.borderRadius as string,
    borderRadiusTopLeft: styleOverrides?.borderRadiusTopLeft as string,
    borderRadiusTopRight: styleOverrides?.borderRadiusTopRight as string,
    borderRadiusBottomLeft: styleOverrides?.borderRadiusBottomLeft as string,
    borderRadiusBottomRight: styleOverrides?.borderRadiusBottomRight as string,
    
    // Shadows
    boxShadow: styleOverrides?.boxShadow as string,
    
    // Motion
    transitionDuration: styleOverrides?.transitionDuration as string,
    transitionTimingFunction: styleOverrides?.transitionTimingFunction as string,
    hoverScale: styleOverrides?.hoverScale as string,
    hoverOpacity: styleOverrides?.hoverOpacity as string,
    hoverShadow: styleOverrides?.hoverShadow as string,
    hoverBackgroundColor: styleOverrides?.hoverBackgroundColor as string,
    hoverTextColor: styleOverrides?.hoverTextColor as string,
    animationPreset: styleOverrides?.animationPreset as string,
    
    // Responsive
    responsiveVisibility: styleOverrides?.responsiveVisibility as any,
    
    // Custom CSS
    customCss: styleOverrides?.customCss as string,
  };

  // Get schema for this block type
  const schema = getBlockSchema(blockType);
  
  // Merge with global defaults if provided
  const finalSettings = globalDefaults 
    ? mergeStylesWithDefaults(blockSettings, globalDefaults, schema)
    : blockSettings;
  
  // Resolve styles using the schema
  const styles = resolveBlockStyles(finalSettings, schema);
  
  // Get responsive visibility classes
  const classes = getResponsiveVisibilityClasses(finalSettings);
  
  // Get background overlay styles if needed
  const overlayStyles = getBackgroundOverlayStyles(finalSettings);

  // Generate hover styles CSS if needed
  let hoverCss = '';
  if (finalSettings.hoverScale || finalSettings.hoverOpacity || finalSettings.hoverShadow || 
      finalSettings.hoverBackgroundColor || finalSettings.hoverTextColor) {
    const hoverStyles = getHoverStyles(finalSettings);
    const hoverStyleStr = Object.entries(hoverStyles).map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    }).join(' ');
    hoverCss = `.builder-block-wrapper:hover { ${hoverStyleStr} }`;
  }

  console.log('[resolveSectionStyleOverrides] OUTPUT:', { styles, classes, overlayStyles, hoverCss });

  return { styles, classes, overlayStyles, hoverCss };
}
