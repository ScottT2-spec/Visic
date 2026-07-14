import { asRecord } from "@/lib/json";
import type { ThemeData } from "@/components/storefront/ThemeProvider";
import type { CSSProperties } from "react";
import type { PageSettings } from "@/lib/page-content";

export interface SiteCustomizationThemeSettings {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
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
  };
  typography?: {
    headingFont?: string;
    bodyFont?: string;
    buttonFont?: string;
    fontWeight?: string;
    fontSizeScale?: number;
    lineHeight?: number;
    letterSpacing?: string;
    textTransform?: string;
    alignment?: string;
    googleFonts?: string[];
    variableFonts?: string[];
  };
  layout?: {
    radius?: string;
    shadows?: boolean;
    spacingScale?: number;
    maxWidth?: string;
    buttonStyle?: string;
    linkStyle?: string;
  };
}

export interface SiteCustomizationPageSettings {
  title?: string;
  slug?: string;
  isPublished?: boolean;
  hidden?: boolean;
  showInNavigation?: boolean;
  showInFooter?: boolean;
  backgroundColor?: string | null;
  backgroundImage?: string | null;
  backgroundSize?: "cover" | "contain" | "auto";
  backgroundPosition?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface SiteCustomizationRevision {
  version: number;
  savedAt: string;
  note?: string | null;
  snapshot: SiteCustomizationDocument;
}

export interface SiteCustomizationDocument {
  themeSettings: SiteCustomizationThemeSettings;
  pageSettings: Record<string, SiteCustomizationPageSettings>;
  sectionSettings: Record<string, Record<string, unknown>>;
  blockSettings: Record<string, Record<string, unknown>>;
  navigationSettings: Record<string, unknown>;
  footerSettings: Record<string, unknown>;
  headerSettings: Record<string, unknown>;
  mediaAssets: Array<Record<string, unknown>>;
  seoSettings: Record<string, unknown>;
  customCss: string;
  customJs: string;
  revisionHistory: SiteCustomizationRevision[];
  currentVersion: number;
  publishedVersion: number;
  lastPublishedAt: string | null;
}

const EMPTY_CUSTOMIZATION: SiteCustomizationDocument = {
  themeSettings: {},
  pageSettings: {},
  sectionSettings: {},
  blockSettings: {},
  navigationSettings: {},
  footerSettings: {},
  headerSettings: {},
  mediaAssets: [],
  seoSettings: {},
  customCss: "",
  customJs: "",
  revisionHistory: [],
  currentVersion: 1,
  publishedVersion: 1,
  lastPublishedAt: null,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function escapeInlineScript(value: string): string {
  return value.replace(/<\/script/gi, "<\\/script");
}

function escapeInlineStyle(value: string): string {
  return value.replace(/<\/style/gi, "<\\/style");
}

export function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === undefined) return base;
  if (Array.isArray(base) || Array.isArray(patch)) {
    return clone((Array.isArray(patch) ? patch : base) as T);
  }

  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return clone((patch as T) ?? base);
  }

  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const current = result[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = deepMerge(current, value);
    } else if (Array.isArray(value)) {
      result[key] = clone(value);
    } else if (value !== undefined) {
      result[key] = value;
    }
  }

  return result as T;
}

export function normalizeSiteCustomization(value: unknown): SiteCustomizationDocument {
  if (!isPlainObject(value)) {
    return clone(EMPTY_CUSTOMIZATION);
  }

  const currentVersion = typeof value.currentVersion === "number" ? value.currentVersion : EMPTY_CUSTOMIZATION.currentVersion;
  const publishedVersion = typeof value.publishedVersion === "number" ? value.publishedVersion : EMPTY_CUSTOMIZATION.publishedVersion;

  return {
    themeSettings: isPlainObject(value.themeSettings) ? (value.themeSettings as SiteCustomizationThemeSettings) : {},
    pageSettings: isPlainObject(value.pageSettings) ? (value.pageSettings as Record<string, SiteCustomizationPageSettings>) : {},
    sectionSettings: isPlainObject(value.sectionSettings) ? (value.sectionSettings as Record<string, Record<string, unknown>>) : {},
    blockSettings: isPlainObject(value.blockSettings) ? (value.blockSettings as Record<string, Record<string, unknown>>) : {},
    navigationSettings: isPlainObject(value.navigationSettings) ? (value.navigationSettings as Record<string, unknown>) : {},
    footerSettings: isPlainObject(value.footerSettings) ? (value.footerSettings as Record<string, unknown>) : {},
    headerSettings: isPlainObject(value.headerSettings) ? (value.headerSettings as Record<string, unknown>) : {},
    mediaAssets: Array.isArray(value.mediaAssets) ? (value.mediaAssets as Array<Record<string, unknown>>) : [],
    seoSettings: isPlainObject(value.seoSettings) ? (value.seoSettings as Record<string, unknown>) : {},
    customCss: typeof value.customCss === "string" ? value.customCss : "",
    customJs: typeof value.customJs === "string" ? value.customJs : "",
    revisionHistory: Array.isArray(value.revisionHistory) ? (value.revisionHistory as SiteCustomizationRevision[]) : [],
    currentVersion,
    publishedVersion,
    lastPublishedAt:
      value.lastPublishedAt instanceof Date
        ? value.lastPublishedAt.toISOString()
        : typeof value.lastPublishedAt === "string"
        ? value.lastPublishedAt
        : null,
  };
}

export function mergeSiteCustomization(base: SiteCustomizationDocument, patch: Partial<SiteCustomizationDocument>): SiteCustomizationDocument {
  const next = normalizeSiteCustomization(base);
  const incoming = normalizeSiteCustomization({ ...EMPTY_CUSTOMIZATION, ...patch });

  return {
    ...next,
    themeSettings: deepMerge(next.themeSettings, incoming.themeSettings),
    pageSettings: deepMerge(next.pageSettings, incoming.pageSettings),
    sectionSettings: deepMerge(next.sectionSettings, incoming.sectionSettings),
    blockSettings: deepMerge(next.blockSettings, incoming.blockSettings),
    navigationSettings: deepMerge(next.navigationSettings, incoming.navigationSettings),
    footerSettings: deepMerge(next.footerSettings, incoming.footerSettings),
    headerSettings: deepMerge(next.headerSettings, incoming.headerSettings),
    mediaAssets: incoming.mediaAssets.length ? incoming.mediaAssets : next.mediaAssets,
    seoSettings: deepMerge(next.seoSettings, incoming.seoSettings),
    customCss: typeof patch.customCss === "string" ? patch.customCss : next.customCss,
    customJs: typeof patch.customJs === "string" ? patch.customJs : next.customJs,
    revisionHistory: incoming.revisionHistory.length ? incoming.revisionHistory : next.revisionHistory,
    currentVersion: typeof patch.currentVersion === "number" ? patch.currentVersion : next.currentVersion,
    publishedVersion: typeof patch.publishedVersion === "number" ? patch.publishedVersion : next.publishedVersion,
    lastPublishedAt: typeof patch.lastPublishedAt === "string" ? patch.lastPublishedAt : next.lastPublishedAt,
  };
}

export function buildThemeDataWithCustomization(theme: ThemeData | null, customization: SiteCustomizationDocument | null): ThemeData | null {
  if (!theme) return null;

  const themeConfig = theme.config || {};
  const themeSettings = customization?.themeSettings || {};
  const colors = deepMerge(asRecord(themeConfig.colors), asRecord(themeSettings.colors));
  const fonts = deepMerge(asRecord(themeConfig.fonts), asRecord(themeSettings.typography ? {
    heading: themeSettings.typography.headingFont,
    body: themeSettings.typography.bodyFont,
  } : {}));
  const layout = deepMerge(asRecord(themeConfig.layout), asRecord(themeSettings.layout));

  return {
    ...theme,
    config: {
      ...themeConfig,
      colors,
      fonts,
      layout,
    },
  };
}

export function getPageCustomization(customization: SiteCustomizationDocument | null, page: { id: string; slug: string; title?: string }): SiteCustomizationPageSettings | null {
  if (!customization) return null;
  return customization.pageSettings[page.id] || customization.pageSettings[page.slug] || customization.pageSettings[(page.title || "").trim()] || null;
}

export function applyPageCustomization<T extends { id: string; slug: string; title?: string; metaTitle?: string | null; metaDescription?: string | null; isPublished?: boolean }>(
  page: T,
  customization: SiteCustomizationDocument | null
): T {
  const override = getPageCustomization(customization, page);
  if (!override) return page;

  return {
    ...page,
    title: override.title || page.title,
    slug: override.slug || page.slug,
    isPublished: typeof override.isPublished === "boolean" ? override.isPublished : page.isPublished,
    metaTitle: override.metaTitle ?? page.metaTitle,
    metaDescription: override.metaDescription ?? page.metaDescription,
  };
}

export function getResolvedPageSettings(
  page: { id: string; slug: string; title?: string },
  baseSettings: PageSettings | Record<string, unknown> | undefined,
  customization: SiteCustomizationDocument | null
): PageSettings {
  const override = getPageCustomization(customization, page) as SiteCustomizationPageSettings | null;
  const base = (baseSettings || {}) as PageSettings;
  if (!override) return base;

  return {
    ...base,
    backgroundColor: override.backgroundColor ?? base.backgroundColor,
    backgroundImage: override.backgroundImage ?? base.backgroundImage,
    backgroundSize: override.backgroundSize ?? base.backgroundSize,
    backgroundPosition: override.backgroundPosition ?? base.backgroundPosition,
  };
} 

export function buildPageBackgroundStyle(settings: PageSettings | Record<string, unknown>): CSSProperties {
  const backgroundImage = typeof settings.backgroundImage === "string" ? settings.backgroundImage : "";
  const backgroundColor = typeof settings.backgroundColor === "string" ? settings.backgroundColor : "";
  const backgroundSize = typeof settings.backgroundSize === "string" ? settings.backgroundSize : undefined;
  const backgroundPosition = typeof settings.backgroundPosition === "string" ? settings.backgroundPosition : undefined;
  const backgroundRepeat = typeof settings.backgroundRepeat === "string" ? settings.backgroundRepeat : undefined;
  const backgroundAttachment = typeof settings.backgroundAttachment === "string" ? settings.backgroundAttachment : undefined;
  const overlayColor = typeof settings.overlayColor === "string" ? settings.overlayColor : undefined;
  const overlayOpacity = typeof settings.overlayOpacity === "number" ? settings.overlayOpacity : undefined;
  const style: CSSProperties & Record<string, string | number> = {
    ...(backgroundImage
      ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: backgroundSize || "cover",
          backgroundPosition: backgroundPosition || "center center",
          backgroundRepeat: backgroundRepeat || "no-repeat",
          backgroundAttachment: backgroundAttachment || "scroll",
        }
      : {}),
    ...(backgroundColor ? { backgroundColor } : {}),
  };

  if (overlayColor) style["--afro-page-overlay-color"] = overlayColor;
  if (typeof overlayOpacity === "number") style["--afro-page-overlay-opacity"] = overlayOpacity;

  return style;
}

export function filterVisiblePages<T extends { id: string; slug: string; title?: string }>(
  pages: T[],
  customization: SiteCustomizationDocument | null
): T[] {
  return pages.filter((page) => {
    const override = getPageCustomization(customization, page);
    if (!override) return true;
    if (override.hidden) return false;
    if (override.showInNavigation === false) return false;
    return true;
  });
}

export function buildCustomizationCss(customization: SiteCustomizationDocument | null): string {
  if (!customization) return "";

  const colors = customization.themeSettings.colors || {};
  const typography = customization.themeSettings.typography || {};
  const layout = customization.themeSettings.layout || {};
  const rules: string[] = [":root{"];

  const setVar = (name: string, value: string | number | boolean | undefined | null) => {
    if (value === undefined || value === null || value === "") return;
    rules.push(`${name}:${String(value)};`);
  };

  setVar("--afro-primary", colors.primary);
  setVar("--afro-secondary", colors.secondary);
  setVar("--afro-accent", colors.accent);
  setVar("--afro-background", colors.background);
  setVar("--afro-surface", colors.surface);
  setVar("--afro-border", colors.border);
  setVar("--afro-text", colors.text);
  setVar("--afro-success", colors.success);
  setVar("--afro-warning", colors.warning);
  setVar("--afro-error", colors.error);
  setVar("--afro-header-bg", colors.headerBg);
  setVar("--afro-header-text", colors.headerText);
  setVar("--afro-footer-bg", colors.footerBg);
  setVar("--afro-footer-text", colors.footerText);
  setVar("--afro-button-bg", colors.buttonBg);
  setVar("--afro-button-text", colors.buttonText);
  setVar("--afro-font-heading", typography.headingFont ? `'${typography.headingFont}', system-ui, sans-serif` : undefined);
  setVar("--afro-font-body", typography.bodyFont ? `'${typography.bodyFont}', system-ui, sans-serif` : undefined);
  setVar("--afro-font-button", typography.buttonFont ? `'${typography.buttonFont}', system-ui, sans-serif` : undefined);
  setVar("--afro-radius", layout.radius);
  setVar("--afro-spacing-scale", layout.spacingScale);
  rules.push("}");
  rules.push("body{background:var(--afro-background,inherit);color:var(--afro-text,inherit);font-family:var(--afro-font-body,inherit)}");
  rules.push("h1,h2,h3,h4,h5,h6{font-family:var(--afro-font-heading,var(--afro-font-body,inherit))}");
  rules.push("button,.button,.btn,[role='button']{font-family:var(--afro-font-button,var(--afro-font-body,inherit))}");
  if (customization.customCss) {
    rules.push(escapeInlineStyle(customization.customCss));
  }

  return rules.join("\n");
}

export function buildCustomizationBridgeScript(customization: SiteCustomizationDocument | null): string {
  const payload = escapeInlineScript(JSON.stringify(normalizeSiteCustomization(customization)));
  return `
<script>
(function() {
  var currentCustomization = ${payload};

  function applyCustomization(data) {
    if (!data) return;
    currentCustomization = data;
    var root = document.documentElement;
    var colors = (data.themeSettings && data.themeSettings.colors) || {};
    var typography = (data.themeSettings && data.themeSettings.typography) || {};
    var layout = (data.themeSettings && data.themeSettings.layout) || {};
    var set = function(name, value) {
      if (value === undefined || value === null || value === "") return;
      root.style.setProperty(name, String(value));
    };

    set("--afro-primary", colors.primary);
    set("--afro-secondary", colors.secondary);
    set("--afro-accent", colors.accent);
    set("--afro-background", colors.background);
    set("--afro-surface", colors.surface);
    set("--afro-border", colors.border);
    set("--afro-text", colors.text);
    set("--afro-success", colors.success);
    set("--afro-warning", colors.warning);
    set("--afro-error", colors.error);
    set("--afro-header-bg", colors.headerBg);
    set("--afro-header-text", colors.headerText);
    set("--afro-footer-bg", colors.footerBg);
    set("--afro-footer-text", colors.footerText);
    set("--afro-button-bg", colors.buttonBg);
    set("--afro-button-text", colors.buttonText);
    set("--afro-font-heading", typography.headingFont ? ("'" + typography.headingFont + "', system-ui, sans-serif") : "");
    set("--afro-font-body", typography.bodyFont ? ("'" + typography.bodyFont + "', system-ui, sans-serif") : "");
    set("--afro-font-button", typography.buttonFont ? ("'" + typography.buttonFont + "', system-ui, sans-serif") : "");
    set("--afro-radius", layout.radius);
    set("--afro-spacing-scale", layout.spacingScale);

    var styleEl = document.getElementById("afro-site-customization-css");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "afro-site-customization-css";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = (data.customCss || "");
    if (data.customJs) {
      try {
        var existing = document.getElementById("afro-site-customization-js");
        if (existing) existing.remove();
        var js = document.createElement("script");
        js.id = "afro-site-customization-js";
        js.textContent = data.customJs;
        document.body.appendChild(js);
      } catch (err) {
        console.error("Failed to run custom JS", err);
      }
    }
  }

  applyCustomization(currentCustomization);

  window.addEventListener("message", function(event) {
    if (!event.data || event.data.type !== "afro-site-customization-preview") return;
    applyCustomization(event.data.customization || currentCustomization);
  });

  window.parent && window.parent.postMessage({
    type: "afro-site-customization-ready"
  }, "*");
})();
</script>`;
}

export function extractCustomizationFromDb(value: unknown): SiteCustomizationDocument | null {
  if (!value) return null;
  return normalizeSiteCustomization(asRecord(value));
}

function isMissingCustomizationTableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = `${error.name}: ${error.message}`.toLowerCase();
  return message.includes("site_customizations") || message.includes("p2021") || message.includes("p2022");
}

export async function loadSiteCustomizationSafely(loader: Promise<unknown>): Promise<SiteCustomizationDocument | null> {
  try {
    return extractCustomizationFromDb(await loader);
  } catch (error) {
    if (isMissingCustomizationTableError(error)) {
      return null;
    }
    throw error;
  }
}
