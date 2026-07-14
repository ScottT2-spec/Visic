"use client";

import { useState } from "react";
import { X, Settings, Sliders, Copy, Trash2, Sparkles } from "lucide-react";
import { Section, SectionStyleOverrides } from "@/types";
import ImageField from "./ImageField";
import { 
  CONTROL_DEFINITIONS, 
  getControlsByCategory, 
  getControlCategories,
  type ControlCategory 
} from "@/lib/builder/control-registry";
import { getBlockSchema } from "@/lib/builder/block-style-schema";
import { FONTS_BY_CATEGORY } from "@/lib/constants/fonts";

interface RightSidebarProps {
  selectedSection: Section | null;
  onSectionUpdate: (section: Section) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionDuplicate: (sectionId: string) => void;
  onClose: () => void;
  onCopyStyles: (sectionId: string) => void;
  onPasteStyles: (sectionId: string) => void;
  hasCopiedStyles: boolean;
  mediaLibrary?: string[];
  onUploadImage?: (file: File) => Promise<string>;
}

type StylingTab = "content" | "advanced";

export default function RightSidebar({
  selectedSection,
  onSectionUpdate,
  onSectionDelete,
  onSectionDuplicate,
  onClose,
  onCopyStyles,
  onPasteStyles,
  hasCopiedStyles,
  mediaLibrary,
  onUploadImage,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<StylingTab>("content");

  if (!selectedSection) {
    return (
      <div className="w-80 border-l border-surface-200 bg-white h-full flex flex-col">
        <div className="p-4 border-b border-surface-100">
          <h3 className="text-sm font-bold text-surface-900">No Selection</h3>
          <p className="mt-1 text-xs text-surface-500">Click on a section to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateStyleOverride = (key: keyof SectionStyleOverrides, value: any) => {
    console.log('[RightSidebar updateStyleOverride] CALLED:', { key, value, sectionId: selectedSection?.id });
    onSectionUpdate({
      ...selectedSection,
      styleOverrides: {
        ...selectedSection.styleOverrides,
        [key]: value,
      },
    });
  };

  const updateContent = (key: string, value: any) => {
    onSectionUpdate({
      ...selectedSection,
      content: {
        ...selectedSection.content,
        [key]: value,
      },
    });
  };

  return (
    <div className="w-80 border-l border-surface-200 bg-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-surface-900 capitalize">{selectedSection.type}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onCopyStyles(selectedSection.id)}
            className="p-1.5 rounded hover:bg-surface-100 transition-colors"
            title="Copy Styles"
          >
            <Copy className="h-4 w-4 text-surface-400" />
          </button>
          {hasCopiedStyles && (
            <button
              type="button"
              onClick={() => onPasteStyles(selectedSection.id)}
              className="p-1.5 rounded hover:bg-brand-50 transition-colors"
              title="Paste Styles"
            >
              <Copy className="h-4 w-4 text-brand-600" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onSectionDuplicate(selectedSection.id)}
            className="p-1.5 rounded hover:bg-surface-100 transition-colors"
            title="Duplicate"
          >
            <Copy className="h-4 w-4 text-surface-400" />
          </button>
          <button
            type="button"
            onClick={() => onSectionDelete(selectedSection.id)}
            className="p-1.5 rounded hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-surface-400 hover:text-red-600" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-surface-100 transition-colors"
            title="Close"
          >
            <X className="h-4 w-4 text-surface-400" />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-surface-100">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "content" ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50" : "text-surface-400 hover:text-surface-600"
          }`}
        >
          <Settings className="h-4 w-4" /> Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("advanced")}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "advanced" ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50" : "text-surface-400 hover:text-surface-600"
          }`}
        >
          <Sliders className="h-4 w-4" /> Advanced
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "content" ? (
          <ContentTab 
            section={selectedSection} 
            updateContent={updateContent}
            mediaLibrary={mediaLibrary}
            onUploadImage={onUploadImage}
          />
        ) : (
          <AdvancedTab
            styleOverrides={selectedSection.styleOverrides || {}}
            updateStyleOverride={updateStyleOverride}
            sectionType={selectedSection.type}
          />
        )}
      </div>
    </div>
  );
}

function ContentTab({
  section,
  updateContent,
  mediaLibrary,
  onUploadImage,
}: {
  section: Section;
  updateContent: (key: string, value: any) => void;
  mediaLibrary?: string[];
  onUploadImage?: (file: File) => Promise<string>;
}) {
  const content = section.content || {};

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">Content</h3>
        
        {/* Dynamic content fields based on section type */}
        {section.type === "heading" && (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-700 mb-1">Heading Text</label>
              <input
                type="text"
                value={(content.heading as string) || ""}
                onChange={(e) => updateContent("heading", e.target.value)}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                placeholder="Enter heading text"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-700 mb-1">Subheading</label>
              <input
                type="text"
                value={(content.subheading as string) || ""}
                onChange={(e) => updateContent("subheading", e.target.value)}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                placeholder="Enter subheading"
              />
            </div>
          </>
        )}

        {section.type === "text" && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-surface-700 mb-1">Text Content</label>
            <textarea
              value={(content.text as string) || ""}
              onChange={(e) => updateContent("text", e.target.value)}
              className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2 h-32 resize-none"
              placeholder="Enter text content"
            />
          </div>
        )}

        {section.type === "button" && (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-700 mb-1">Button Text</label>
              <input
                type="text"
                value={(content.text as string) || ""}
                onChange={(e) => updateContent("text", e.target.value)}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                placeholder="Button label"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-700 mb-1">Link URL</label>
              <input
                type="text"
                value={(content.url as string) || ""}
                onChange={(e) => updateContent("url", e.target.value)}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                placeholder="https://..."
              />
            </div>
          </>
        )}

        {section.type === "image" && (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-700 mb-1">Image URL</label>
              <input
                type="text"
                value={(content.url as string) || ""}
                onChange={(e) => updateContent("url", e.target.value)}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                placeholder="https://..."
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-surface-700 mb-1">Alt Text</label>
              <input
                type="text"
                value={(content.alt as string) || ""}
                onChange={(e) => updateContent("alt", e.target.value)}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                placeholder="Image description"
              />
            </div>
          </>
        )}

        {/* Bespoke / Template block fields — auto-generated from props */}
        {!["heading", "text", "button", "image"].includes(section.type) && (
          <BespokeBlockEditor 
            content={content} 
            updateContent={updateContent}
            mediaLibrary={mediaLibrary}
            onUploadImage={onUploadImage}
          />
        )}

        {/* Generic fields for all sections */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-surface-700 mb-1">Badge Text</label>
          <input
            type="text"
            value={(content.badge as string) || ""}
            onChange={(e) => updateContent("badge", e.target.value)}
            className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
            placeholder="Optional badge"
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-surface-700 mb-1">Custom CSS Class</label>
          <input
            type="text"
            value={(content.className as string) || ""}
            onChange={(e) => updateContent("className", e.target.value)}
            className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
            placeholder="my-custom-class"
          />
        </div>
      </div>

      {/* AI Improve Button */}
      <div className="pt-4 border-t border-surface-100">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs font-semibold py-2.5 rounded-lg hover:from-brand-700 hover:to-purple-700 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          AI Improve Section
        </button>
      </div>
    </div>
  );
}

function AdvancedTab({
  styleOverrides,
  updateStyleOverride,
  sectionType,
}: {
  styleOverrides: SectionStyleOverrides;
  updateStyleOverride: (key: keyof SectionStyleOverrides, value: any) => void;
  sectionType: string;
}) {
  // Get the block schema to determine which controls to show
  const schema = getBlockSchema(sectionType);
  const categories = getControlCategories();

  // Helper to render a control based on its type
  const renderControl = (controlId: string) => {
    const control = CONTROL_DEFINITIONS[controlId];
    if (!control) return null;

    const value = styleOverrides[controlId as keyof SectionStyleOverrides] ?? control.defaultValue;

    switch (control.type) {
      case 'color':
        return (
          <div key={controlId}>
            <label className="block text-xs font-medium text-surface-700 mb-1">{control.label}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value as string || '#ffffff'}
                onChange={(e) => updateStyleOverride(controlId as keyof SectionStyleOverrides, e.target.value)}
                className="h-8 w-8 rounded border border-surface-200 cursor-pointer"
              />
              <input
                type="text"
                value={value as string || ''}
                onChange={(e) => updateStyleOverride(controlId as keyof SectionStyleOverrides, e.target.value)}
                className="flex-1 text-xs border border-surface-200 rounded px-2 py-1.5"
                placeholder={control.placeholder}
              />
            </div>
          </div>
        );

      case 'select':
        let options: string[] = [];
        if (control.optionsSource === 'FONT_LIST') {
          options = Object.entries(FONTS_BY_CATEGORY).flatMap(([category, fonts]) => 
            fonts.map(f => f.name)
          );
        } else if (Array.isArray(control.options)) {
          options = control.options;
        } else if (typeof control.options === 'function') {
          options = control.options();
        }

        return (
          <div key={controlId}>
            <label className="block text-xs font-medium text-surface-700 mb-1">{control.label}</label>
            <select
              value={value as string || ''}
              onChange={(e) => updateStyleOverride(controlId as keyof SectionStyleOverrides, e.target.value)}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );

      case 'text':
        return (
          <div key={controlId}>
            <label className="block text-xs font-medium text-surface-700 mb-1">{control.label}</label>
            <input
              type="text"
              value={value as string || ''}
              onChange={(e) => updateStyleOverride(controlId as keyof SectionStyleOverrides, e.target.value)}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
              placeholder={control.placeholder}
            />
          </div>
        );

      case 'number':
        return (
          <div key={controlId}>
            <label className="block text-xs font-medium text-surface-700 mb-1">{control.label}</label>
            <input
              type="number"
              value={value as number || 0}
              onChange={(e) => updateStyleOverride(controlId as keyof SectionStyleOverrides, parseFloat(e.target.value))}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5"
              min={control.min}
              max={control.max}
              step={control.step}
            />
          </div>
        );

      case 'range':
        return (
          <div key={controlId}>
            <label className="block text-xs font-medium text-surface-700 mb-1">{control.label}</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={value as number || control.min}
                onChange={(e) => updateStyleOverride(controlId as keyof SectionStyleOverrides, parseFloat(e.target.value))}
                className="flex-1"
                min={control.min}
                max={control.max}
                step={control.step}
              />
              <span className="text-xs text-surface-600 w-12 text-right">{value as number}{control.unit}</span>
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={controlId} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value as boolean || false}
              onChange={(e) => updateStyleOverride(controlId as keyof SectionStyleOverrides, e.target.checked)}
              className="rounded border-surface-300"
            />
            <label className="text-xs font-medium text-surface-700">{control.label}</label>
          </div>
        );

      case 'textarea':
        return (
          <div key={controlId}>
            <label className="block text-xs font-medium text-surface-700 mb-1">{control.label}</label>
            <textarea
              value={value as string || ''}
              onChange={(e) => updateStyleOverride(controlId as keyof SectionStyleOverrides, e.target.value)}
              className="w-full text-xs border border-surface-200 rounded px-2 py-1.5 h-24 font-mono resize-none"
              placeholder={control.placeholder}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Map schema supports to control categories
  const categoryMap: Record<keyof typeof schema.supports, ControlCategory[]> = {
    colors: ['colors'],
    background: ['background'],
    spacing: ['spacing'],
    typography: ['typography'],
    layout: ['layout'],
    borders: ['borders'],
    shadows: ['shadows'],
    motion: ['motion'],
    responsive: ['responsive'],
    customCss: ['customCss'],
  };

  return (
    <div className="p-4 space-y-5">
      {categories.map((category) => {
        // Check if this category is supported by the block schema
        const isSupported = Object.entries(categoryMap).some(([key, cats]) => 
          schema.supports[key as keyof typeof schema.supports] && cats.includes(category)
        );

        if (!isSupported) return null;

        const controls = getControlsByCategory(category);
        if (controls.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <div className="space-y-3">
              {controls.map((control) => renderControl(control.id))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BESPOKE BLOCK EDITOR
   Auto-generates editable fields from block props.
   Handles strings, numbers, booleans, and arrays of objects.
   ═══════════════════════════════════════════════════════════════ */

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function BespokeBlockEditor({
  content,
  updateContent,
  mediaLibrary,
  onUploadImage,
}: {
  content: Record<string, unknown>;
  updateContent: (key: string, value: unknown) => void;
  mediaLibrary?: string[];
  onUploadImage?: (file: File) => Promise<string>;
}) {
  const [expandedArrays, setExpandedArrays] = useState<Record<string, boolean>>({});

  const toggleArray = (key: string) => {
    setExpandedArrays((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const entries = Object.entries(content).filter(
    ([key]) => !["badge", "className"].includes(key)
  );

  if (entries.length === 0) {
    return (
      <p className="text-xs text-surface-400 italic">No editable properties</p>
    );
  }

  // Detect if a key is likely an image field
  const isImageField = (key: string, value: string): boolean => {
    const imageKeywords = ["image", "img", "photo", "picture", "pic", "avatar", "background", "banner", "logo", "icon", "thumbnail", "thumb"];
    const keyLower = key.toLowerCase();
    // Check if key contains image keywords - don't require value to be a URL
    return imageKeywords.some(keyword => keyLower.includes(keyword));
  };

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => {
        // String fields
        if (typeof value === "string") {
          const isLong = value.length > 80;
          const isImage = isImageField(key, value);
          
          return (
            <div key={key} className="mb-2">
              <label className="block text-xs font-medium text-surface-700 mb-1">
                {formatLabel(key)}
              </label>
              {isImage ? (
                <ImageField
                  value={value}
                  onChange={(newValue) => updateContent(key, newValue)}
                  label={formatLabel(key)}
                  mediaLibrary={mediaLibrary}
                  onUploadImage={onUploadImage}
                />
              ) : isLong ? (
                <textarea
                  value={value}
                  onChange={(e) => updateContent(key, e.target.value)}
                  className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2 h-20 resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateContent(key, e.target.value)}
                  className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
                />
              )}
            </div>
          );
        }

        // Number fields
        if (typeof value === "number") {
          return (
            <div key={key} className="mb-2">
              <label className="block text-xs font-medium text-surface-700 mb-1">
                {formatLabel(key)}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => updateContent(key, Number(e.target.value))}
                className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2"
              />
            </div>
          );
        }

        // Boolean fields
        if (typeof value === "boolean") {
          return (
            <div key={key} className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => updateContent(key, e.target.checked)}
                className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <label className="text-xs font-medium text-surface-700">
                {formatLabel(key)}
              </label>
            </div>
          );
        }

        // Array fields (e.g. features, team, faqs, ingredients, posts)
        if (Array.isArray(value)) {
          const isExpanded = expandedArrays[key] ?? false;
          return (
            <div key={key} className="mb-2">
              <button
                type="button"
                onClick={() => toggleArray(key)}
                className="flex items-center justify-between w-full text-xs font-medium text-surface-700 mb-1 hover:text-brand-600"
              >
                <span>{formatLabel(key)} ({value.length} items)</span>
                <span className="text-surface-400">{isExpanded ? "▼" : "▶"}</span>
              </button>
              {isExpanded && (
                <div className="space-y-2 pl-2 border-l-2 border-surface-100">
                  {value.map((item, idx) => {
                    if (typeof item === "object" && item !== null) {
                      return (
                        <div
                          key={idx}
                          className="bg-surface-50 rounded-lg p-2 space-y-1.5"
                        >
                          <div className="text-[10px] font-bold text-surface-400 uppercase">
                            Item {idx + 1}
                          </div>
                          {Object.entries(item as Record<string, unknown>).map(
                            ([subKey, subVal]) => {
                              if (typeof subVal === "string") {
                                const isSubLong = subVal.length > 60;
                                const isSubImage = isImageField(subKey, subVal);
                                
                                return (
                                  <div key={subKey}>
                                    <label className="block text-[10px] font-medium text-surface-500 mb-0.5">
                                      {formatLabel(subKey)}
                                    </label>
                                    {isSubImage ? (
                                      <ImageField
                                        value={subVal}
                                        onChange={(newValue) => {
                                          const newArr = [...value];
                                          newArr[idx] = {
                                            ...(item as Record<string, unknown>),
                                            [subKey]: newValue,
                                          };
                                          updateContent(key, newArr);
                                        }}
                                        label={formatLabel(subKey)}
                                        mediaLibrary={mediaLibrary}
                                        onUploadImage={onUploadImage}
                                      />
                                    ) : isSubLong ? (
                                      <textarea
                                        value={subVal}
                                        onChange={(e) => {
                                          const newArr = [...value];
                                          newArr[idx] = {
                                            ...(item as Record<string, unknown>),
                                            [subKey]: e.target.value,
                                          };
                                          updateContent(key, newArr);
                                        }}
                                        className="w-full text-xs border border-surface-200 rounded px-2 py-1 h-14 resize-none"
                                      />
                                    ) : (
                                      <input
                                        type="text"
                                        value={subVal}
                                        onChange={(e) => {
                                          const newArr = [...value];
                                          newArr[idx] = {
                                            ...(item as Record<string, unknown>),
                                            [subKey]: e.target.value,
                                          };
                                          updateContent(key, newArr);
                                        }}
                                        className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                                      />
                                    )}
                                  </div>
                                );
                              }
                              if (typeof subVal === "number") {
                                return (
                                  <div key={subKey}>
                                    <label className="block text-[10px] font-medium text-surface-500 mb-0.5">
                                      {formatLabel(subKey)}
                                    </label>
                                    <input
                                      type="number"
                                      value={subVal}
                                      onChange={(e) => {
                                        const newArr = [...value];
                                        newArr[idx] = {
                                          ...(item as Record<string, unknown>),
                                          [subKey]: Number(e.target.value),
                                        };
                                        updateContent(key, newArr);
                                      }}
                                      className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                                    />
                                  </div>
                                );
                              }
                              return null;
                            }
                          )}
                        </div>
                      );
                    }
                    if (typeof item === "string") {
                      return (
                        <input
                          key={idx}
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newArr = [...value];
                            newArr[idx] = e.target.value;
                            updateContent(key, newArr);
                          }}
                          className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          );
        }

        // Object fields (e.g. contact, featuredPost)
        if (typeof value === "object" && value !== null) {
          const isExpanded = expandedArrays[key] ?? false;
          return (
            <div key={key} className="mb-2">
              <button
                type="button"
                onClick={() => toggleArray(key)}
                className="flex items-center justify-between w-full text-xs font-medium text-surface-700 mb-1 hover:text-brand-600"
              >
                <span>{formatLabel(key)}</span>
                <span className="text-surface-400">{isExpanded ? "▼" : "▶"}</span>
              </button>
              {isExpanded && (
                <div className="space-y-1.5 pl-2 border-l-2 border-surface-100 bg-surface-50 rounded-lg p-2">
                  {Object.entries(value as Record<string, unknown>).map(
                    ([subKey, subVal]) => {
                      if (typeof subVal === "string") {
                        return (
                          <div key={subKey}>
                            <label className="block text-[10px] font-medium text-surface-500 mb-0.5">
                              {formatLabel(subKey)}
                            </label>
                            <input
                              type="text"
                              value={subVal}
                              onChange={(e) => {
                                updateContent(key, {
                                  ...(value as Record<string, unknown>),
                                  [subKey]: e.target.value,
                                });
                              }}
                              className="w-full text-xs border border-surface-200 rounded px-2 py-1"
                            />
                          </div>
                        );
                      }
                      return null;
                    }
                  )}
                </div>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
