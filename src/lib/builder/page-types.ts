/**
 * Page management types matching AI Studio (Visic Sites OS) implementation
 * This provides a simpler, more direct page editing system
 */

export interface SectionStyleOverrides {
  backgroundColor?: string;
  textColor?: string;
  paddingY?: string;
  
  // Advanced spacing controls
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

  // Borders & Shadows
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  borderStyle?: string;
  boxShadow?: string;

  // Background layers
  backgroundType?: 'color' | 'gradient' | 'image' | 'video';
  backgroundGradient?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundOverlay?: string;

  // Animations & FX
  transitionDuration?: string;
  hoverScale?: string;
  hoverOpacity?: string;
  hoverShadow?: string;
  parallaxSpeed?: string;
  shapeDividerTop?: string;
  shapeDividerBottom?: string;

  // Responsive visibility
  responsiveVisibility?: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  customCss?: string;
}

export interface Section {
  id: string;
  type: string;
  order: number;
  props: Record<string, any>;
  styleOverrides?: SectionStyleOverrides;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
  isSystem?: boolean;
  content?: unknown;
  type?: string;
  title?: string;
  isPublished?: boolean;
  position?: number;
  template?: string | null;
}

/**
 * Ensures a site has pages initialized, creating default pages if missing
 * This matches the AI Studio ensurePagesExist function
 */
export function ensurePagesExist(site: any): any {
  if (site.pages && site.pages.length > 0) {
    if (!site.activePageId) {
      site.activePageId = site.pages[0].id;
    }
    return site;
  }
  
  // Home page sections - use existing sections for backward compatibility
  const homePage: Page = {
    id: 'home',
    name: 'Home',
    slug: '/',
    sections: site.sections || [],
    isSystem: true
  };
  
  // Shop page
  const shopPage: Page = {
    id: 'shop',
    name: 'Shop All',
    slug: '/shop',
    sections: [
      { 
        id: 'shop-header', 
        type: 'header', 
        order: 1, 
        props: { 
          announcement: site.sections?.[0]?.props?.announcement || 'Welcome to our store!', 
          showWhatsAppHeader: true 
        } 
      },
      { 
        id: 'shop-grid', 
        type: 'product-grid', 
        order: 2, 
        props: { 
          title: 'All Storefront Items', 
          subtitle: 'Order easily and securely.', 
          displayCount: 8 
        } 
      },
      { 
        id: 'shop-footer', 
        type: 'footer', 
        order: 3, 
        props: { 
          tagline: site.sections?.[site.sections.length - 1]?.props?.tagline || 'Powering African Commerce' 
        } 
      }
    ],
    isSystem: true
  };

  // About Us
  const aboutPage: Page = {
    id: 'about',
    name: 'About Us',
    slug: '/about',
    sections: [
      { 
        id: 'about-header', 
        type: 'header', 
        order: 1, 
        props: { 
          announcement: 'Get to know our local mission', 
          showWhatsAppHeader: true 
        } 
      },
      { 
        id: 'about-hero', 
        type: 'hero', 
        order: 2, 
        props: { 
          title: `Discover ${site.name}`, 
          subtitle: `Our business is dedicated to bringing you the highest quality products. Hand-picked, vetted, and backed by fast local logistics with same-day dispatch options.`, 
          badge: 'OUR MISSION', 
          backgroundImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800' 
        } 
      },
      { 
        id: 'about-footer', 
        type: 'footer', 
        order: 3, 
        props: { 
          tagline: 'Handcrafted with absolute care' 
        } 
      }
    ],
    isSystem: false
  };

  // Contact page
  const contactPage: Page = {
    id: 'contact',
    name: 'Contact Us',
    slug: '/contact',
    sections: [
      { 
        id: 'contact-header', 
        type: 'header', 
        order: 1, 
        props: { 
          announcement: 'Support line open 24/7', 
          showWhatsAppHeader: true 
        } 
      },
      { 
        id: 'contact-whatsapp', 
        type: 'whatsapp-cta', 
        order: 2, 
        props: { 
          title: 'Message our Customer Care Team', 
          subtitle: `Click below to begin chatting directly on WhatsApp. Skip email, phone hold times, or support tickets completely.`, 
          whatsappNumber: site.contactWhatsApp || '2348123456789', 
          buttonText: 'Start Direct WhatsApp Chat' 
        } 
      },
      { 
        id: 'contact-footer', 
        type: 'footer', 
        order: 3, 
        props: { 
          tagline: 'We look forward to serving you' 
        } 
      }
    ],
    isSystem: false
  };

  const pages = [homePage, shopPage, aboutPage, contactPage];
  return {
    ...site,
    pages,
    activePageId: 'home'
  };
}
