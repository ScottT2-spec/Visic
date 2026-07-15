// ─── EDITOR TYPES FOR VISIC-STYLE DRAG DROP EDITOR ─────────────────

export interface FontStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textTransform?: string;
  color?: string;
}

export interface TypographySystem {
  h1: FontStyle;
  h2: FontStyle;
  h3: FontStyle;
  h4: FontStyle;
  h5: FontStyle;
  h6: FontStyle;
  body: FontStyle;
  button: FontStyle;
  menu: FontStyle;
}

export interface VisicTheme {
  id: string;
  name: string;
  category: string;
  designSystem: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      cardBackground: string;
      text: string;
      mutedText: string;
      border: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    typography?: TypographySystem;
    borderRadius: string;
    containerWidth: string;
  };
}

export interface SectionStyleOverrides {
  backgroundColor?: string;
  textColor?: string;
  paddingY?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginLock?: boolean;
  paddingLock?: boolean;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  borderStyle?: string;
  boxShadow?: string;
  backgroundType?: 'color' | 'gradient' | 'image' | 'video';
  backgroundGradient?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundOverlay?: string;
  backgroundOverlayOpacity?: number;
  transitionDuration?: string;
  transitionTimingFunction?: string;
  hoverScale?: string;
  hoverOpacity?: string;
  hoverShadow?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
  parallaxSpeed?: string;
  shapeDividerTop?: string;
  shapeDividerBottom?: string;
  responsiveVisibility?: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  customCss?: string;
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  // Layout
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  gap?: string;
  maxWidth?: string;
  minWidth?: string;
  display?: 'block' | 'flex' | 'grid' | 'inline-block' | 'inline-flex' | 'none';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  zIndex?: string | number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  // Grid Layout
  gridColumns?: string;
  gridRows?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumnGap?: string;
  gridRowGap?: string;
  // Content Layout (for Shop/Blog grids)
  contentColumns?: number;
  contentGap?: string;
  contentAlign?: 'left' | 'center' | 'right';
}

export interface Section {
  id: string;
  type: string;
  order: number;
  props: Record<string, any>;
  styleOverrides?: SectionStyleOverrides;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  imageUrl: string;
  stock: number;
  category: string;
  variants?: string[];
}

export interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
}

export interface PaymentSettings {
  monnifyEnabled: boolean;
  paystackEnabled: boolean;
  flutterwaveEnabled: boolean;
  bankTransferEnabled: boolean;
  cashOnDeliveryEnabled: boolean;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
  isSystem?: boolean;
}

export interface Site {
  id: string;
  workspaceId: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  logoUrl?: string;
  contactWhatsApp: string;
  status: 'draft' | 'published';
  createdAt: string;
  theme: VisicTheme;
  sections: Section[];
  pages?: Page[];
  activePageId?: string;
  customCss?: string;
  mediaLibrary?: string[];
  products: Product[];
  paymentSettings: PaymentSettings;
  deliveryAreas: DeliveryArea[];
  deliveryInstructions?: string;
  lowDataMode: boolean;
  template?: string; // Template slug (e.g., 'perfumes', 'kids', 'fashion')
}
