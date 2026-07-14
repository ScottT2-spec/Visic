/**
 * Control Registry - Schema-driven control definitions for Design and Advanced panels
 * 
 * This registry defines all available style controls with their types, labels,
 * option sources, and categories. Panels render controls dynamically from this registry
 * filtered by the selected block's schema support.
 */

export type ControlType = 'text' | 'number' | 'color' | 'select' | 'textarea' | 'checkbox' | 'range';

export type ControlCategory = 
  | 'colors'
  | 'background'
  | 'spacing'
  | 'typography'
  | 'layout'
  | 'borders'
  | 'shadows'
  | 'motion'
  | 'responsive'
  | 'customCss';

export interface ControlDefinition {
  id: string;
  type: ControlType;
  label: string;
  category: ControlCategory;
  placeholder?: string;
  options?: string[] | (() => string[]);
  optionsSource?: 'FONT_LIST' | 'WEIGHT_LIST' | 'ALIGN_LIST' | 'TRANSFORM_LIST' | 'DECORATION_LIST' | 'DISPLAY_LIST' | 'FLEX_DIRECTION_LIST' | 'JUSTIFY_LIST' | 'ALIGN_LIST' | 'POSITION_LIST' | 'OVERFLOW_LIST' | 'BORDER_STYLE_LIST' | 'SHADOW_LIST' | 'ANIMATION_LIST' | 'BACKGROUND_POSITION_LIST' | 'BACKGROUND_SIZE_LIST' | 'BACKGROUND_REPEAT_LIST';
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number | boolean;
  unit?: string;
}

// Predefined option lists
const FONT_WEIGHT_OPTIONS = ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold'];
const TEXT_ALIGN_OPTIONS = ['left', 'center', 'right', 'justify'];
const TEXT_TRANSFORM_OPTIONS = ['none', 'uppercase', 'lowercase', 'capitalize'];
const TEXT_DECORATION_OPTIONS = ['none', 'underline', 'line-through', 'overline'];
const DISPLAY_OPTIONS = ['block', 'flex', 'grid', 'inline-block', 'inline-flex', 'none'];
const FLEX_DIRECTION_OPTIONS = ['row', 'row-reverse', 'column', 'column-reverse'];
const JUSTIFY_CONTENT_OPTIONS = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'];
const ALIGN_ITEMS_OPTIONS = ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'];
const POSITION_OPTIONS = ['static', 'relative', 'absolute', 'fixed', 'sticky'];
const OVERFLOW_OPTIONS = ['visible', 'hidden', 'scroll', 'auto'];
const BORDER_STYLE_OPTIONS = ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'];
const SHADOW_OPTIONS = ['none', 'sm', 'md', 'lg', 'xl', '2xl'];
const ANIMATION_OPTIONS = ['none', 'fade-in', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom-in', 'zoom-out', 'bounce', 'pulse'];
const BACKGROUND_POSITION_OPTIONS = ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'];
const BACKGROUND_SIZE_OPTIONS = ['auto', 'cover', 'contain'];
const BACKGROUND_REPEAT_OPTIONS = ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'];

/**
 * All control definitions
 */
export const CONTROL_DEFINITIONS: Record<string, ControlDefinition> = {
  // ─── COLORS ────────────────────────────────────────────────
  backgroundColor: {
    id: 'backgroundColor',
    type: 'color',
    label: 'Background Color',
    category: 'colors',
    defaultValue: '#ffffff',
  },
  textColor: {
    id: 'textColor',
    type: 'color',
    label: 'Text Color',
    category: 'colors',
    defaultValue: '#1f2937',
  },
  primaryColor: {
    id: 'primaryColor',
    type: 'color',
    label: 'Primary Color',
    category: 'colors',
    defaultValue: '#3b82f6',
  },
  secondaryColor: {
    id: 'secondaryColor',
    type: 'color',
    label: 'Secondary Color',
    category: 'colors',
    defaultValue: '#8b5cf6',
  },
  accentColor: {
    id: 'accentColor',
    type: 'color',
    label: 'Accent Color',
    category: 'colors',
    defaultValue: '#f59e0b',
  },
  borderColor: {
    id: 'borderColor',
    type: 'color',
    label: 'Border Color',
    category: 'borders',
    defaultValue: '#e5e7eb',
  },

  // ─── BACKGROUND ────────────────────────────────────────────
  backgroundType: {
    id: 'backgroundType',
    type: 'select',
    label: 'Background Type',
    category: 'background',
    options: ['color', 'gradient', 'image', 'video'],
    defaultValue: 'color',
  },
  backgroundGradient: {
    id: 'backgroundGradient',
    type: 'text',
    label: 'Gradient CSS',
    category: 'background',
    placeholder: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
  },
  backgroundImage: {
    id: 'backgroundImage',
    type: 'text',
    label: 'Image URL',
    category: 'background',
    placeholder: 'https://example.com/image.jpg',
  },
  backgroundVideo: {
    id: 'backgroundVideo',
    type: 'text',
    label: 'Video URL',
    category: 'background',
    placeholder: 'https://example.com/video.mp4',
  },
  backgroundOverlay: {
    id: 'backgroundOverlay',
    type: 'color',
    label: 'Overlay Color',
    category: 'background',
    defaultValue: '#000000',
  },
  backgroundOverlayOpacity: {
    id: 'backgroundOverlayOpacity',
    type: 'range',
    label: 'Overlay Opacity',
    category: 'background',
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 50,
    unit: '%',
  },
  backgroundPosition: {
    id: 'backgroundPosition',
    type: 'select',
    label: 'Background Position',
    category: 'background',
    options: BACKGROUND_POSITION_OPTIONS,
    defaultValue: 'center',
  },
  backgroundSize: {
    id: 'backgroundSize',
    type: 'select',
    label: 'Background Size',
    category: 'background',
    options: BACKGROUND_SIZE_OPTIONS,
    defaultValue: 'cover',
  },
  backgroundRepeat: {
    id: 'backgroundRepeat',
    type: 'select',
    label: 'Background Repeat',
    category: 'background',
    options: BACKGROUND_REPEAT_OPTIONS,
    defaultValue: 'no-repeat',
  },

  // ─── SPACING ────────────────────────────────────────────────
  paddingY: {
    id: 'paddingY',
    type: 'text',
    label: 'Padding Y (Vertical)',
    category: 'spacing',
    placeholder: '4rem',
    defaultValue: '4rem',
  },
  paddingTop: {
    id: 'paddingTop',
    type: 'text',
    label: 'Padding Top',
    category: 'spacing',
    placeholder: '2rem',
  },
  paddingBottom: {
    id: 'paddingBottom',
    type: 'text',
    label: 'Padding Bottom',
    category: 'spacing',
    placeholder: '2rem',
  },
  paddingLeft: {
    id: 'paddingLeft',
    type: 'text',
    label: 'Padding Left',
    category: 'spacing',
    placeholder: '1.5rem',
  },
  paddingRight: {
    id: 'paddingRight',
    type: 'text',
    label: 'Padding Right',
    category: 'spacing',
    placeholder: '1.5rem',
  },
  marginTop: {
    id: 'marginTop',
    type: 'text',
    label: 'Margin Top',
    category: 'spacing',
    placeholder: '0',
  },
  marginBottom: {
    id: 'marginBottom',
    type: 'text',
    label: 'Margin Bottom',
    category: 'spacing',
    placeholder: '0',
  },
  marginLeft: {
    id: 'marginLeft',
    type: 'text',
    label: 'Margin Left',
    category: 'spacing',
    placeholder: '0',
  },
  marginRight: {
    id: 'marginRight',
    type: 'text',
    label: 'Margin Right',
    category: 'spacing',
    placeholder: '0',
  },

  // ─── TYPOGRAPHY ─────────────────────────────────────────────
  fontFamily: {
    id: 'fontFamily',
    type: 'select',
    label: 'Font Family',
    category: 'typography',
    optionsSource: 'FONT_LIST',
    defaultValue: 'Inter',
  },
  fontSize: {
    id: 'fontSize',
    type: 'text',
    label: 'Font Size',
    category: 'typography',
    placeholder: '1rem',
    defaultValue: '1rem',
  },
  fontWeight: {
    id: 'fontWeight',
    type: 'select',
    label: 'Font Weight',
    category: 'typography',
    options: FONT_WEIGHT_OPTIONS,
    defaultValue: '400',
  },
  lineHeight: {
    id: 'lineHeight',
    type: 'text',
    label: 'Line Height',
    category: 'typography',
    placeholder: '1.6',
    defaultValue: '1.6',
  },
  letterSpacing: {
    id: 'letterSpacing',
    type: 'text',
    label: 'Letter Spacing',
    category: 'typography',
    placeholder: '0em',
    defaultValue: '0em',
  },
  textAlign: {
    id: 'textAlign',
    type: 'select',
    label: 'Text Align',
    category: 'typography',
    options: TEXT_ALIGN_OPTIONS,
    defaultValue: 'left',
  },
  textTransform: {
    id: 'textTransform',
    type: 'select',
    label: 'Text Transform',
    category: 'typography',
    options: TEXT_TRANSFORM_OPTIONS,
    defaultValue: 'none',
  },
  textDecoration: {
    id: 'textDecoration',
    type: 'select',
    label: 'Text Decoration',
    category: 'typography',
    options: TEXT_DECORATION_OPTIONS,
    defaultValue: 'none',
  },

  // ─── LAYOUT ─────────────────────────────────────────────────
  display: {
    id: 'display',
    type: 'select',
    label: 'Display',
    category: 'layout',
    options: DISPLAY_OPTIONS,
    defaultValue: 'block',
  },
  flexDirection: {
    id: 'flexDirection',
    type: 'select',
    label: 'Flex Direction',
    category: 'layout',
    options: FLEX_DIRECTION_OPTIONS,
    defaultValue: 'row',
  },
  justifyContent: {
    id: 'justifyContent',
    type: 'select',
    label: 'Justify Content',
    category: 'layout',
    options: JUSTIFY_CONTENT_OPTIONS,
    defaultValue: 'flex-start',
  },
  alignItems: {
    id: 'alignItems',
    type: 'select',
    label: 'Align Items',
    category: 'layout',
    options: ALIGN_ITEMS_OPTIONS,
    defaultValue: 'stretch',
  },
  gap: {
    id: 'gap',
    type: 'text',
    label: 'Gap',
    category: 'layout',
    placeholder: '1rem',
    defaultValue: '1rem',
  },
  maxWidth: {
    id: 'maxWidth',
    type: 'text',
    label: 'Max Width',
    category: 'layout',
    placeholder: '1200px',
  },
  minWidth: {
    id: 'minWidth',
    type: 'text',
    label: 'Min Width',
    category: 'layout',
    placeholder: '0',
  },
  position: {
    id: 'position',
    type: 'select',
    label: 'Position',
    category: 'layout',
    options: POSITION_OPTIONS,
    defaultValue: 'static',
  },
  zIndex: {
    id: 'zIndex',
    type: 'number',
    label: 'Z-Index',
    category: 'layout',
    defaultValue: 0,
  },
  overflow: {
    id: 'overflow',
    type: 'select',
    label: 'Overflow',
    category: 'layout',
    options: OVERFLOW_OPTIONS,
    defaultValue: 'visible',
  },
  gridColumns: {
    id: 'gridColumns',
    type: 'text',
    label: 'Grid Columns',
    category: 'layout',
    placeholder: 'repeat(3, 1fr)',
  },
  gridRows: {
    id: 'gridRows',
    type: 'text',
    label: 'Grid Rows',
    category: 'layout',
    placeholder: 'auto',
  },
  gridTemplateColumns: {
    id: 'gridTemplateColumns',
    type: 'text',
    label: 'Grid Template Columns',
    category: 'layout',
    placeholder: 'repeat(auto-fit, minmax(250px, 1fr))',
  },
  gridTemplateRows: {
    id: 'gridTemplateRows',
    type: 'text',
    label: 'Grid Template Rows',
    category: 'layout',
    placeholder: 'auto',
  },
  gridColumnGap: {
    id: 'gridColumnGap',
    type: 'text',
    label: 'Grid Column Gap',
    category: 'layout',
    placeholder: '1rem',
  },
  gridRowGap: {
    id: 'gridRowGap',
    type: 'text',
    label: 'Grid Row Gap',
    category: 'layout',
    placeholder: '1rem',
  },

  // ─── BORDERS ────────────────────────────────────────────────
  borderStyle: {
    id: 'borderStyle',
    type: 'select',
    label: 'Border Style',
    category: 'borders',
    options: BORDER_STYLE_OPTIONS,
    defaultValue: 'none',
  },
  borderWidth: {
    id: 'borderWidth',
    type: 'text',
    label: 'Border Width',
    category: 'borders',
    placeholder: '1px',
    defaultValue: '1px',
  },
  borderRadius: {
    id: 'borderRadius',
    type: 'text',
    label: 'Border Radius',
    category: 'borders',
    placeholder: '0.5rem',
    defaultValue: '0.5rem',
  },
  borderRadiusTopLeft: {
    id: 'borderRadiusTopLeft',
    type: 'text',
    label: 'Border Radius (Top Left)',
    category: 'borders',
    placeholder: '0.5rem',
  },
  borderRadiusTopRight: {
    id: 'borderRadiusTopRight',
    type: 'text',
    label: 'Border Radius (Top Right)',
    category: 'borders',
    placeholder: '0.5rem',
  },
  borderRadiusBottomLeft: {
    id: 'borderRadiusBottomLeft',
    type: 'text',
    label: 'Border Radius (Bottom Left)',
    category: 'borders',
    placeholder: '0.5rem',
  },
  borderRadiusBottomRight: {
    id: 'borderRadiusBottomRight',
    type: 'text',
    label: 'Border Radius (Bottom Right)',
    category: 'borders',
    placeholder: '0.5rem',
  },

  // ─── SHADOWS ────────────────────────────────────────────────
  boxShadow: {
    id: 'boxShadow',
    type: 'text',
    label: 'Box Shadow',
    category: 'shadows',
    placeholder: '0 4px 6px rgba(0,0,0,0.1)',
  },

  // ─── MOTION / HOVER ───────────────────────────────────────────
  transitionDuration: {
    id: 'transitionDuration',
    type: 'text',
    label: 'Transition Duration',
    category: 'motion',
    placeholder: '0.3s',
    defaultValue: '0.3s',
  },
  transitionTimingFunction: {
    id: 'transitionTimingFunction',
    type: 'select',
    label: 'Transition Timing',
    category: 'motion',
    options: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'],
    defaultValue: 'ease',
  },
  hoverScale: {
    id: 'hoverScale',
    type: 'text',
    label: 'Hover Scale',
    category: 'motion',
    placeholder: '1.05',
  },
  hoverOpacity: {
    id: 'hoverOpacity',
    type: 'text',
    label: 'Hover Opacity',
    category: 'motion',
    placeholder: '0.9',
  },
  hoverShadow: {
    id: 'hoverShadow',
    type: 'select',
    label: 'Hover Shadow',
    category: 'motion',
    options: SHADOW_OPTIONS,
    defaultValue: 'none',
  },
  hoverBackgroundColor: {
    id: 'hoverBackgroundColor',
    type: 'color',
    label: 'Hover Background Color',
    category: 'motion',
  },
  hoverTextColor: {
    id: 'hoverTextColor',
    type: 'color',
    label: 'Hover Text Color',
    category: 'motion',
  },
  animationPreset: {
    id: 'animationPreset',
    type: 'select',
    label: 'Animation Preset',
    category: 'motion',
    options: ANIMATION_OPTIONS,
    defaultValue: 'none',
  },

  // ─── RESPONSIVE ─────────────────────────────────────────────
  responsiveVisibilityDesktop: {
    id: 'responsiveVisibilityDesktop',
    type: 'checkbox',
    label: 'Show on Desktop',
    category: 'responsive',
    defaultValue: true,
  },
  responsiveVisibilityTablet: {
    id: 'responsiveVisibilityTablet',
    type: 'checkbox',
    label: 'Show on Tablet',
    category: 'responsive',
    defaultValue: 'true',
  },
  responsiveVisibilityMobile: {
    id: 'responsiveVisibilityMobile',
    type: 'checkbox',
    label: 'Show on Mobile',
    category: 'responsive',
    defaultValue: 'true',
  },

  // ─── CUSTOM CSS ─────────────────────────────────────────────
  customCss: {
    id: 'customCss',
    type: 'textarea',
    label: 'Custom CSS',
    category: 'customCss',
    placeholder: '.my-class { color: red; }',
  },
};

/**
 * Get controls by category
 */
export function getControlsByCategory(category: ControlCategory): ControlDefinition[] {
  return Object.values(CONTROL_DEFINITIONS).filter(c => c.category === category);
}

/**
 * Get control by ID
 */
export function getControlById(id: string): ControlDefinition | undefined {
  return CONTROL_DEFINITIONS[id];
}

/**
 * Get all control categories
 */
export function getControlCategories(): ControlCategory[] {
  return [
    'colors',
    'background',
    'spacing',
    'typography',
    'layout',
    'borders',
    'shadows',
    'motion',
    'responsive',
    'customCss',
  ];
}
