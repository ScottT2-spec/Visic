"use client";

import React from "react";

/* ───────── Theme Config Types ───────── */

export interface ThemeColors {
  primary?: string;
  primaryLight?: string;
  primaryDark?: string;
  accent?: string;
  secondary?: string;
  background?: string;
  surface?: string;
  border?: string;
  text?: string;
  success?: string;
  warning?: string;
  error?: string;
  headerBg?: string;
  headerText?: string;
  footerBg?: string;
  footerText?: string;
  buttonBg?: string;
  buttonText?: string;
  saleBadge?: string;
}

export interface ThemeFonts {
  heading?: string;
  body?: string;
}

export interface ThemeLayout {
  maxWidth?: string;
  productColumns?: number;
  showSidebar?: boolean;
  headerStyle?: string;   // future: "standard" | "centered" | "minimal"
  cardStyle?: string;     // future: "modern" | "classic" | "minimal"
  template?: string;      // future: template slug
  radius?: string;
  spacingScale?: number;
  buttonStyle?: string;
  linkStyle?: string;
}

export interface ThemeConfig {
  colors?: ThemeColors;
  fonts?: ThemeFonts;
  layout?: ThemeLayout;
}

export interface ThemeData {
  id: string;
  name: string;
  slug: string;
  config: ThemeConfig;
}

/* ───────── Helpers ───────── */

/** Lighten a hex color by a percentage (0-1) */
function lightenHex(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = Math.min(255, Math.round(parseInt(h.substring(0, 2), 16) + (255 - parseInt(h.substring(0, 2), 16)) * amount));
  const g = Math.min(255, Math.round(parseInt(h.substring(2, 4), 16) + (255 - parseInt(h.substring(2, 4), 16)) * amount));
  const b = Math.min(255, Math.round(parseInt(h.substring(4, 6), 16) + (255 - parseInt(h.substring(4, 6), 16)) * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Darken a hex color by a percentage (0-1) */
function darkenHex(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = Math.max(0, Math.round(parseInt(h.substring(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(h.substring(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(h.substring(4, 6), 16) * (1 - amount)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Convert hex to rgba */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ───────── Component ───────── */

interface ThemeProviderProps {
  theme: ThemeData | null;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const config = theme?.config;
  const colors = config?.colors;
  const fonts = config?.fonts;
  const layout = config?.layout;

  const themeVars: Record<string, string> = {};

  // Colors
  if (colors?.primary) {
    themeVars["--theme-primary"] = colors.primary;
    themeVars["--theme-primary-light"] = colors.primaryLight || lightenHex(colors.primary, 0.4);
    themeVars["--theme-primary-dark"] = colors.primaryDark || darkenHex(colors.primary, 0.25);
    themeVars["--theme-primary-shadow"] = hexToRgba(colors.primary, 0.25);
    themeVars["--theme-primary-shadow-hover"] = hexToRgba(colors.primary, 0.3);
    // Default button to primary if not set
    if (!colors.buttonBg) themeVars["--theme-button-bg"] = colors.primary;
  }
  if (colors?.accent) themeVars["--theme-accent"] = colors.accent;
  if (colors?.headerBg) themeVars["--theme-header-bg"] = colors.headerBg;
  if (colors?.headerText) themeVars["--theme-header-text"] = colors.headerText;
  if (colors?.footerBg) themeVars["--theme-footer-bg"] = colors.footerBg;
  if (colors?.footerText) themeVars["--theme-footer-text"] = colors.footerText;
  if (colors?.buttonBg) themeVars["--theme-button-bg"] = colors.buttonBg;
  if (colors?.buttonText) themeVars["--theme-button-text"] = colors.buttonText;
  if (colors?.saleBadge) themeVars["--theme-sale-badge"] = colors.saleBadge;

  // Fonts
  if (fonts?.heading) themeVars["--theme-font-heading"] = `'${fonts.heading}', system-ui, sans-serif`;
  if (fonts?.body) themeVars["--theme-font-body"] = `'${fonts.body}', system-ui, sans-serif`;

  // Layout
  if (layout?.maxWidth) themeVars["--theme-max-width"] = layout.maxWidth;
  if (layout?.productColumns) themeVars["--theme-product-columns"] = String(layout.productColumns);

  return (
    <div className="theme-root" style={themeVars as React.CSSProperties}>
      {children}
    </div>
  );
}
