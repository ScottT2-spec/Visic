import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildThemeDataWithCustomization,
  mergeSiteCustomization,
  normalizeSiteCustomization,
} from "@/lib/site-customization";

test("normalizeSiteCustomization returns defaults for null", () => {
  const customization = normalizeSiteCustomization(null);
  assert.deepEqual(customization.themeSettings, {});
  assert.deepEqual(customization.pageSettings, {});
  assert.equal(customization.currentVersion, 1);
});

test("mergeSiteCustomization deep merges theme and page overrides", () => {
  const base = normalizeSiteCustomization({
    themeSettings: {
      colors: { primary: "#111111", accent: "#222222" },
      typography: { headingFont: "Inter" },
    },
    pageSettings: {
      home: { title: "Home", hidden: false },
    },
    customCss: ".hero { color: red; }",
  });

  const next = mergeSiteCustomization(base, {
    themeSettings: {
      colors: { accent: "#ff0000" },
      layout: { radius: "24px" },
    },
    pageSettings: {
      home: { hidden: true },
    },
    customCss: ".hero { color: blue; }",
  });

  assert.equal(next.themeSettings.colors?.primary, "#111111");
  assert.equal(next.themeSettings.colors?.accent, "#ff0000");
  assert.equal(next.themeSettings.layout?.radius, "24px");
  assert.equal(next.pageSettings.home?.hidden, true);
  assert.equal(next.customCss, ".hero { color: blue; }");
});

test("buildThemeDataWithCustomization merges colors into theme config", () => {
  const theme = {
    id: "theme-1",
    name: "Theme",
    slug: "theme",
    config: {
      colors: { primary: "#111111", headerBg: "#ffffff" },
      fonts: { heading: "Inter", body: "Inter" },
      layout: { maxWidth: "72rem" },
    },
  };

  const customization = normalizeSiteCustomization({
    themeSettings: {
      colors: { primary: "#ff6600", text: "#222222" },
      typography: { bodyFont: "Poppins" },
    },
  });

  const merged = buildThemeDataWithCustomization(theme, customization);

  assert.equal(merged?.config.colors?.primary, "#ff6600");
  assert.equal(merged?.config.colors?.text, "#222222");
  assert.equal(merged?.config.fonts?.body, "Poppins");
  assert.equal(merged?.config.layout?.maxWidth, "72rem");
});
