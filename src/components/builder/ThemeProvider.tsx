"use client";

import { useEffect } from "react";
import { DesignSystem } from "@/types";
import { ALL_FONTS, getFontImportUrls } from "@/lib/constants/fonts";

interface ThemeProviderProps {
  designSystem: DesignSystem;
  customCss?: string;
  children: React.ReactNode;
}

const getRadiusValue = (radius: string): string => {
  const radiusMap: Record<string, string> = {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
    full: "9999px",
  };
  return radiusMap[radius] || radius;
};

export default function ThemeProvider({ designSystem, customCss, children }: ThemeProviderProps) {
  useEffect(() => {
    // Dynamic Google Font Loading
    const activeFonts = new Set<string>([
      designSystem.fonts.heading,
      designSystem.fonts.body,
    ]);

    if (designSystem.typography) {
      Object.values(designSystem.typography).forEach((style: any) => {
        if (style?.fontFamily) activeFonts.add(style.fontFamily);
      });
    }

    const fontsToLoad = Array.from(activeFonts)
      .map((name) => ALL_FONTS.find((f) => f.name === name))
      .filter(Boolean);

    fontsToLoad.forEach((font) => {
      if (!font || !font.importUrl) return;
      const importUrl = font.importUrl;
      const exists = document.querySelector(`link[href="${importUrl}"]`);
      if (!exists) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = importUrl;
        document.head.appendChild(link);
      }
    });

    // Cleanup function to remove font links when component unmounts
    return () => {
      fontsToLoad.forEach((font) => {
        if (!font || !font.importUrl) return;
        const importUrl = font.importUrl;
        const link = document.querySelector(`link[href="${importUrl}"]`);
        if (link) {
          document.head.removeChild(link);
        }
      });
    };
  }, [
    designSystem.fonts.heading,
    designSystem.fonts.body,
    JSON.stringify(designSystem.typography),
  ]);

  const styleVariables: Record<string, string> = {
    "--pk-primary": designSystem.colors.primary,
    "--pk-secondary": designSystem.colors.secondary,
    "--pk-accent": designSystem.colors.accent,
    "--pk-bg": designSystem.colors.background,
    "--pk-text": designSystem.colors.text,
    "--pk-muted": designSystem.colors.mutedText,
    "--pk-border": designSystem.colors.border,
    "--pk-font-heading": `'${designSystem.fonts.heading}', sans-serif`,
    "--pk-font-body": `'${designSystem.fonts.body}', sans-serif`,
    "--pk-radius": getRadiusValue(designSystem.borderRadius),
  };

  // Generate dynamic CSS rules for typography
  const generateTypographyCSS = () => {
    if (!designSystem.typography) return "";

    let css = "";
    const typographyMap: Record<string, string> = {
      h1: "h1, .theme-h1",
      h2: "h2, .theme-h2",
      h3: "h3, .theme-h3",
      body: "body, .theme-body",
      button: "button, .theme-button, .btn",
      menu: "nav, .theme-menu, .menu",
    };

    Object.entries(designSystem.typography).forEach(([key, style]: [string, any]) => {
      if (!style) return;
      const selector = typographyMap[key] || `.theme-${key}`;
      
      const fontFamily = style.fontFamily ? `'${style.fontFamily}'` : 'inherit';
      const fontSize = style.fontSize || 'inherit';
      const fontWeight = style.fontWeight || 'inherit';
      const lineHeight = style.lineHeight || 'inherit';
      const letterSpacing = style.letterSpacing || 'inherit';
      const textTransform = style.textTransform || 'none';
      const color = style.color || 'inherit';
      
      css += `
        ${selector} {
          font-family: var(--pk-font-${key}-family, ${fontFamily}) !important;
          font-size: var(--pk-font-${key}-size, ${fontSize}) !important;
          font-weight: var(--pk-font-${key}-weight, ${fontWeight}) !important;
          line-height: var(--pk-font-${key}-line-height, ${lineHeight}) !important;
          letter-spacing: var(--pk-font-${key}-spacing, ${letterSpacing}) !important;
          text-transform: var(--pk-font-${key}-transform, ${textTransform}) !important;
          color: var(--pk-font-${key}-color, ${color}) !important;
        }
      `;
    });

    return css;
  };

  return (
    <div style={styleVariables} className="theme-wrapper">
      <style>{generateTypographyCSS()}</style>
      {customCss && <style>{customCss}</style>}
      {children}
    </div>
  );
}
