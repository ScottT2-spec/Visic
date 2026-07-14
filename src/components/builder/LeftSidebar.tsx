"use client";

import { useState } from "react";
import { 
  Palette, LayoutGrid, Layers, FileText, Navigation, Sparkles, 
  ChevronDown, ChevronRight, Plus, Copy, Trash2, Edit, 
  Type, Image as ImageIcon, MousePointer, Columns, Grid3X3,
  ShoppingBag, MessageCircle, HelpCircle, Mail, Play, Clock, Shield, User
} from "lucide-react";
import { DesignSystem, Page, Section } from "@/types";
import { ALL_FONTS, FONTS_BY_CATEGORY } from "@/lib/constants/fonts";

interface LeftSidebarProps {
  designSystem: DesignSystem;
  onDesignSystemChange: (designSystem: DesignSystem) => void;
  pages: Page[];
  activePageId: string;
  onPageSelect: (pageId: string) => void;
  onPageCreate: () => void;
  onPageDuplicate: (pageId: string) => void;
  onPageDelete: (pageId: string) => void;
  sections: Section[];
  onSectionSelect: (sectionId: string) => void;
  onAddBlock: (type: string) => void;
  customCss: string;
  onCustomCssChange: (css: string) => void;
}

type SidebarPanel = "design" | "blocks" | "pages" | "navigator" | "ai";

const blockPalette = [
  { type: "heading", label: "Heading", icon: Type, category: "basic" },
  { type: "text", label: "Text", icon: MousePointer, category: "basic" },
  { type: "image", label: "Image", icon: ImageIcon, category: "basic" },
  { type: "button", label: "Button", icon: MousePointer, category: "basic" },
  { type: "columns", label: "Columns", icon: Columns, category: "layout" },
  { type: "grid", label: "Grid", icon: Grid3X3, category: "layout" },
  { type: "spacer", label: "Spacer", icon: LayoutGrid, category: "layout" },
  { type: "divider", label: "Divider", icon: Layers, category: "layout" },
  { type: "product", label: "Product", icon: ShoppingBag, category: "commerce" },
  { type: "products", label: "Products", icon: ShoppingBag, category: "commerce" },
  { type: "whatsapp", label: "WhatsApp", icon: MessageCircle, category: "social" },
  { type: "social", label: "Social", icon: MessageCircle, category: "social" },
  { type: "countdown", label: "Countdown", icon: Clock, category: "marketing" },
  { type: "testimonial", label: "Testimonial", icon: HelpCircle, category: "marketing" },
  { type: "cta", label: "CTA", icon: Mail, category: "marketing" },
  // Cosmetics template blocks
  { type: "cosmeticsHeroSlider", label: "Cosmetics Hero Slider", icon: Sparkles, category: "cosmetics" },
  { type: "cosmeticsPromoBanners", label: "Cosmetics Promo Banners", icon: ImageIcon, category: "cosmetics" },
  { type: "cosmeticsSectionTitle", label: "Cosmetics Section Title", icon: Type, category: "cosmetics" },
  { type: "cosmeticsProductGrid", label: "Cosmetics Product Grid", icon: Grid3X3, category: "cosmetics" },
  { type: "cosmeticsCategoryCards", label: "Cosmetics Category Cards", icon: LayoutGrid, category: "cosmetics" },
  { type: "cosmeticsDiscovery", label: "Cosmetics Discovery", icon: Sparkles, category: "cosmetics" },
  { type: "cosmeticsCountdownBanner", label: "Cosmetics Countdown", icon: Clock, category: "cosmetics" },
  { type: "cosmeticsInfoBoxes", label: "Cosmetics Info Boxes", icon: Shield, category: "cosmetics" },
  { type: "cosmeticsBlogPosts", label: "Cosmetics Blog Posts", icon: FileText, category: "cosmetics" },
  { type: "cosmeticsNewsletter", label: "Cosmetics Newsletter", icon: Mail, category: "cosmetics" },
  { type: "cosmeticsInstagram", label: "Cosmetics Instagram", icon: ImageIcon, category: "cosmetics" },
];

const categories = ["basic", "layout", "commerce", "social", "marketing", "cosmetics"] as const;
const categoryLabels: Record<string, string> = {
  basic: "Basic",
  layout: "Layout",
  commerce: "Commerce",
  social: "Social",
  marketing: "Marketing",
  cosmetics: "Cosmetics",
};

export default function LeftSidebar({
  designSystem,
  onDesignSystemChange,
  pages,
  activePageId,
  onPageSelect,
  onPageCreate,
  onPageDuplicate,
  onPageDelete,
  sections,
  onSectionSelect,
  onAddBlock,
  customCss,
  onCustomCssChange,
}: LeftSidebarProps) {
  const [activePanel, setActivePanel] = useState<SidebarPanel>("design");
  const [pagesExpanded, setPagesExpanded] = useState(true);

  const updateColor = (key: keyof typeof designSystem.colors, value: string) => {
    onDesignSystemChange({
      ...designSystem,
      colors: { ...designSystem.colors, [key]: value },
    });
  };

  const updateFont = (key: keyof typeof designSystem.fonts, value: string) => {
    onDesignSystemChange({
      ...designSystem,
      fonts: { ...designSystem.fonts, [key]: value },
    });
  };

  const updateTypography = (key: string, styleKey: string, value: string) => {
    onDesignSystemChange({
      ...designSystem,
      typography: {
        ...designSystem.typography,
        [key]: {
          ...designSystem.typography?.[key as keyof typeof designSystem.typography],
          [styleKey]: value,
        },
      },
    });
  };

  const updateBorderRadius = (value: string) => {
    onDesignSystemChange({
      ...designSystem,
      borderRadius: value,
    });
  };

  return (
    <div className="w-72 border-r border-surface-200 bg-white h-full flex flex-col">
      {/* Panel Tabs */}
      <div className="flex border-b border-surface-100 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActivePanel("design")}
          className={`flex-1 min-w-max px-3 py-3 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activePanel === "design" ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50" : "text-surface-400 hover:text-surface-600"
          }`}
        >
          <Palette className="h-4 w-4" /> Design
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("blocks")}
          className={`flex-1 min-w-max px-3 py-3 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activePanel === "blocks" ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50" : "text-surface-400 hover:text-surface-600"
          }`}
        >
          <LayoutGrid className="h-4 w-4" /> Blocks
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("navigator")}
          className={`flex-1 min-w-max px-3 py-3 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activePanel === "navigator" ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50" : "text-surface-400 hover:text-surface-600"
          }`}
        >
          <Navigation className="h-4 w-4" /> Navigator
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("ai")}
          className={`flex-1 min-w-max px-3 py-3 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activePanel === "ai" ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50" : "text-surface-400 hover:text-surface-600"
          }`}
        >
          <Sparkles className="h-4 w-4" /> AI
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Design Panel */}
        {activePanel === "design" && (
          <div className="p-4 space-y-6">
            {/* Colors */}
            <div>
              <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Colors</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-surface-700 mb-1">Primary</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designSystem.colors.primary}
                      onChange={(e) => updateColor("primary", e.target.value)}
                      className="h-8 w-8 rounded border border-surface-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designSystem.colors.primary}
                      onChange={(e) => updateColor("primary", e.target.value)}
                      className="flex-1 text-xs border border-surface-200 rounded px-2 py-1.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-700 mb-1">Secondary</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designSystem.colors.secondary}
                      onChange={(e) => updateColor("secondary", e.target.value)}
                      className="h-8 w-8 rounded border border-surface-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designSystem.colors.secondary}
                      onChange={(e) => updateColor("secondary", e.target.value)}
                      className="flex-1 text-xs border border-surface-200 rounded px-2 py-1.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-700 mb-1">Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designSystem.colors.accent}
                      onChange={(e) => updateColor("accent", e.target.value)}
                      className="h-8 w-8 rounded border border-surface-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designSystem.colors.accent}
                      onChange={(e) => updateColor("accent", e.target.value)}
                      className="flex-1 text-xs border border-surface-200 rounded px-2 py-1.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-700 mb-1">Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designSystem.colors.background}
                      onChange={(e) => updateColor("background", e.target.value)}
                      className="h-8 w-8 rounded border border-surface-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designSystem.colors.background}
                      onChange={(e) => updateColor("background", e.target.value)}
                      className="flex-1 text-xs border border-surface-200 rounded px-2 py-1.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-700 mb-1">Text</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designSystem.colors.text}
                      onChange={(e) => updateColor("text", e.target.value)}
                      className="h-8 w-8 rounded border border-surface-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designSystem.colors.text}
                      onChange={(e) => updateColor("text", e.target.value)}
                      className="flex-1 text-xs border border-surface-200 rounded px-2 py-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fonts */}
            <div>
              <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Fonts</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-surface-700 mb-1">Heading Font</label>
                  <select
                    value={designSystem.fonts.heading}
                    onChange={(e) => updateFont("heading", e.target.value)}
                    className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
                  >
                    {Object.entries(FONTS_BY_CATEGORY).map(([category, fonts]) => (
                      <optgroup key={category} label={category}>
                        {fonts.map((font) => (
                          <option key={font.name} value={font.name}>
                            {font.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-700 mb-1">Body Font</label>
                  <select
                    value={designSystem.fonts.body}
                    onChange={(e) => updateFont("body", e.target.value)}
                    className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
                  >
                    {Object.entries(FONTS_BY_CATEGORY).map(([category, fonts]) => (
                      <optgroup key={category} label={category}>
                        {fonts.map((font) => (
                          <option key={font.name} value={font.name}>
                            {font.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Typography</h3>
              <div className="space-y-4">
                {["h1", "h2", "h3", "body", "button"].map((key) => (
                  <div key={key} className="border border-surface-100 rounded-lg p-3">
                    <label className="block text-xs font-semibold text-surface-900 mb-2 capitalize">{key}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-surface-500 mb-0.5">Size</label>
                        <input
                          type="text"
                          value={designSystem.typography?.[key as keyof typeof designSystem.typography]?.fontSize || ""}
                          onChange={(e) => updateTypography(key, "fontSize", e.target.value)}
                          className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                          placeholder="16px"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-surface-500 mb-0.5">Weight</label>
                        <select
                          value={designSystem.typography?.[key as keyof typeof designSystem.typography]?.fontWeight || "400"}
                          onChange={(e) => updateTypography(key, "fontWeight", e.target.value)}
                          className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                        >
                          <option value="300">300</option>
                          <option value="400">400</option>
                          <option value="500">500</option>
                          <option value="600">600</option>
                          <option value="700">700</option>
                          <option value="800">800</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-surface-500 mb-0.5">Line Height</label>
                        <input
                          type="text"
                          value={designSystem.typography?.[key as keyof typeof designSystem.typography]?.lineHeight || ""}
                          onChange={(e) => updateTypography(key, "lineHeight", e.target.value)}
                          className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                          placeholder="1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-surface-500 mb-0.5">Letter Spacing</label>
                        <input
                          type="text"
                          value={designSystem.typography?.[key as keyof typeof designSystem.typography]?.letterSpacing || ""}
                          onChange={(e) => updateTypography(key, "letterSpacing", e.target.value)}
                          className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Border Radius</h3>
              <select
                value={designSystem.borderRadius}
                onChange={(e) => updateBorderRadius(e.target.value)}
                className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
                <option value="2xl">2X Large</option>
                <option value="full">Full</option>
              </select>
            </div>

            {/* Custom CSS */}
            <div>
              <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Custom CSS</h3>
              <textarea
                value={customCss}
                onChange={(e) => onCustomCssChange(e.target.value)}
                className="w-full text-xs border border-surface-200 rounded px-2 py-1.5 h-24 font-mono"
                placeholder="/* Add custom CSS here */"
              />
            </div>
          </div>
        )}

        {/* Blocks Panel */}
        {activePanel === "blocks" && (
          <div className="p-4">
            {categories.map((cat) => {
              const items = blockPalette.filter((p) => p.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} className="mb-4">
                  <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">
                    {categoryLabels[cat]}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => onAddBlock(item.type)}
                          className="flex flex-col items-center gap-1.5 rounded-lg border border-surface-100 bg-surface-50 p-3 text-[11px] font-medium text-surface-600 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Page Manager (Collapsible) */}
        <div className="border-t border-surface-100">
          <button
            type="button"
            onClick={() => setPagesExpanded(!pagesExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-surface-700 hover:bg-surface-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pages
            </div>
            {pagesExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {pagesExpanded && (
            <div className="px-4 pb-4 space-y-1">
              <button
                type="button"
                onClick={onPageCreate}
                className="w-full flex items-center gap-2 text-xs font-medium text-brand-600 hover:bg-brand-50 px-2 py-1.5 rounded transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New Page
              </button>
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`flex items-center justify-between px-2 py-1.5 rounded transition-colors ${
                    activePageId === page.id ? "bg-brand-50 text-brand-700" : "hover:bg-surface-50 text-surface-600"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onPageSelect(page.id)}
                    className="flex-1 text-left text-xs font-medium"
                  >
                    {page.name}
                  </button>
                  {!page.isSystem && (
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => onPageDuplicate(page.id)}
                        className="p-1 hover:bg-surface-200 rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="h-3 w-3 text-surface-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onPageDelete(page.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3 text-surface-400 hover:text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigator Panel */}
        {activePanel === "navigator" && (
          <div className="p-4">
            <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Page Structure</h3>
            <div className="space-y-1">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSectionSelect(section.id)}
                  className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded hover:bg-surface-50 text-xs text-surface-600 transition-colors"
                >
                  <span className="text-surface-400 text-[10px] w-4">{index + 1}</span>
                  <Layers className="h-3.5 w-3.5 text-surface-400" />
                  <span className="capitalize">{section.type}</span>
                </button>
              ))}
              {sections.length === 0 && (
                <p className="text-xs text-surface-400 text-center py-4">No sections yet</p>
              )}
            </div>
          </div>
        )}

        {/* AI Panel */}
        {activePanel === "ai" && (
          <div className="p-4">
            <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">AI Assistant</h3>
            <div className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-lg p-4 border border-brand-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-brand-600" />
                <span className="text-sm font-semibold text-surface-900">AI Theme Generator</span>
              </div>
              <p className="text-xs text-surface-600 mb-3">
                Describe your desired theme and AI will generate colors, fonts, and styling for you.
              </p>
              <textarea
                className="w-full text-xs border border-surface-200 rounded-lg px-3 py-2 h-20 resize-none"
                placeholder="e.g., A modern, minimalist theme with blue accents..."
              />
              <button
                type="button"
                className="w-full mt-2 bg-brand-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-brand-700 transition-colors"
              >
                Generate Theme
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
