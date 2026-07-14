/**
 * Comprehensive Font List
 * 
 * Shared font database for Design and Advanced panels.
 * Includes 7 web-safe fonts and 40 Google Fonts across sans-serif, serif, display, and monospace categories.
 */

export interface FontDefinition {
  name: string;
  family?: string;
  importUrl?: string;
  category: 'sans-serif' | 'serif' | 'display' | 'monospace';
  isWebSafe?: boolean;
  isGoogle?: boolean;
}

// ─── WEB SAFE FONTS ─────────────────────────────────────────────
export const WEB_SAFE_FONTS: FontDefinition[] = [
  { name: 'Arial', family: 'Arial, Helvetica, sans-serif', category: 'sans-serif', isWebSafe: true },
  { name: 'Times New Roman', family: 'Times New Roman, Times, serif', category: 'serif', isWebSafe: true },
  { name: 'Courier New', family: 'Courier New, Courier, monospace', category: 'monospace', isWebSafe: true },
  { name: 'Georgia', family: 'Georgia, serif', category: 'serif', isWebSafe: true },
  { name: 'Verdana', family: 'Verdana, Geneva, sans-serif', category: 'sans-serif', isWebSafe: true },
  { name: 'Tahoma', family: 'Tahoma, Geneva, sans-serif', category: 'sans-serif', isWebSafe: true },
  { name: 'Trebuchet MS', family: 'Trebuchet MS, sans-serif', category: 'sans-serif', isWebSafe: true },
];

// ─── GOOGLE FONTS ───────────────────────────────────────────────
export const GOOGLE_FONTS: FontDefinition[] = [
  // Sans-serif (20 fonts)
  { name: 'Inter', importUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Roboto', importUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Open Sans', importUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Lato', importUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Montserrat', importUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Poppins', importUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Raleway', importUrl: 'https://fonts.googleapis.com/css2?family=Raleway:wght@100;200;300;400;500;600;700;800;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Source Sans Pro', importUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@200;300;400;600;700;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Nunito', importUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;600;700;800;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Work Sans', importUrl: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@100;200;300;400;500;600;700;800;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Space Grotesk', importUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Outfit', importUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Cabinet Grotesk', importUrl: 'https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@300;400;500;600;700&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Plus Jakarta Sans', importUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'DM Sans', importUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Figtree', importUrl: 'https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Satoshi', importUrl: 'https://fonts.googleapis.com/css2?family=Satoshi:wght@300;400;500;700;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Urbanist', importUrl: 'https://fonts.googleapis.com/css2?family=Urbanist:wght@100;200;300;400;500;600;700;800;900&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Manrope', importUrl: 'https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap', category: 'sans-serif', isGoogle: true },
  { name: 'Jost', importUrl: 'https://fonts.googleapis.com/css2?family=Jost:wght@100;200;300;400;500;600;700;800;900&display=swap', category: 'sans-serif', isGoogle: true },
  
  // Serif (12 fonts)
  { name: 'Playfair Display', importUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap', category: 'serif', isGoogle: true },
  { name: 'Merriweather', importUrl: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap', category: 'serif', isGoogle: true },
  { name: 'Lora', importUrl: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap', category: 'serif', isGoogle: true },
  { name: 'Crimson Text', importUrl: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap', category: 'serif', isGoogle: true },
  { name: 'Libre Baskerville', importUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap', category: 'serif', isGoogle: true },
  { name: 'PT Serif', importUrl: 'https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap', category: 'serif', isGoogle: true },
  { name: 'Bodoni Moda', importUrl: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600;700;800;900&display=swap', category: 'serif', isGoogle: true },
  { name: 'Cormorant Garamond', importUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap', category: 'serif', isGoogle: true },
  { name: 'EB Garamond', importUrl: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700;800&display=swap', category: 'serif', isGoogle: true },
  { name: 'Source Serif Pro', importUrl: 'https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@200;300;400;600;700;900&display=swap', category: 'serif', isGoogle: true },
  { name: 'Noto Serif', importUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap', category: 'serif', isGoogle: true },
  { name: 'Cardo', importUrl: 'https://fonts.googleapis.com/css2?family=Cardo:wght@400;700&display=swap', category: 'serif', isGoogle: true },
  
  // Display (10 fonts)
  { name: 'Syne', importUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap', category: 'display', isGoogle: true },
  { name: 'Oswald', importUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&display=swap', category: 'display', isGoogle: true },
  { name: 'Bebas Neue', importUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap', category: 'display', isGoogle: true },
  { name: 'Anton', importUrl: 'https://fonts.googleapis.com/css2?family=Anton&display=swap', category: 'display', isGoogle: true },
  { name: 'Righteous', importUrl: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap', category: 'display', isGoogle: true },
  { name: 'Passion One', importUrl: 'https://fonts.googleapis.com/css2?family=Passion+One:wght@400;700;900&display=swap', category: 'display', isGoogle: true },
  { name: 'Abril Fatface', importUrl: 'https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap', category: 'display', isGoogle: true },
  { name: 'Lobster', importUrl: 'https://fonts.googleapis.com/css2?family=Lobster&display=swap', category: 'display', isGoogle: true },
  { name: 'Pacifico', importUrl: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap', category: 'display', isGoogle: true },
  { name: 'Satisfy', importUrl: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap', category: 'display', isGoogle: true },
  
  // Monospace (5 fonts)
  { name: 'JetBrains Mono', importUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap', category: 'monospace', isGoogle: true },
  { name: 'Fira Code', importUrl: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap', category: 'monospace', isGoogle: true },
  { name: 'Source Code Pro', importUrl: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@200;300;400;500;600;700;900&display=swap', category: 'monospace', isGoogle: true },
  { name: 'IBM Plex Mono', importUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&display=swap', category: 'monospace', isGoogle: true },
  { name: 'Space Mono', importUrl: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap', category: 'monospace', isGoogle: true },
];

// ─── ALL FONTS COMBINED ─────────────────────────────────────────
export const ALL_FONTS: FontDefinition[] = [
  ...WEB_SAFE_FONTS,
  ...GOOGLE_FONTS,
];

// ─── FONTS GROUPED BY CATEGORY FOR UI ─────────────────────────────
export const FONTS_BY_CATEGORY: Record<string, FontDefinition[]> = {
  'Web Safe': WEB_SAFE_FONTS,
  'Sans Serif': GOOGLE_FONTS.filter(f => f.category === 'sans-serif'),
  'Serif': GOOGLE_FONTS.filter(f => f.category === 'serif'),
  'Display': GOOGLE_FONTS.filter(f => f.category === 'display'),
  'Monospace': GOOGLE_FONTS.filter(f => f.category === 'monospace'),
};

// ─── FONT LOADER COMPONENT ───────────────────────────────────────
export function getFontImportUrls(fontNames: string[]): string[] {
  const selectedFonts = ALL_FONTS.filter(f => fontNames.includes(f.name) && f.importUrl);
  return selectedFonts.map(f => f.importUrl!);
}

// ─── LEGACY EXPORT FOR BACKWARD COMPATIBILITY ───────────────────
// This maintains the old GOOGLE_FONTS_DATABASE interface for existing code
export const GOOGLE_FONTS_DATABASE = ALL_FONTS.map(f => ({
  name: f.name,
  importUrl: f.importUrl || '',
  category: f.category,
}));
