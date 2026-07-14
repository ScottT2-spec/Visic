"use client";
import { Loader2, Plus, X } from "lucide-react";
import { Eye, Palette, Star, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { SingleImageUpload } from "@/components/dashboard/ImageUpload";

interface Theme {
  id: string; name: string; slug: string; description: string | null; category: string; industry: string | null;
  isPremium: boolean; isFeatured: boolean; isActive: boolean; installs: number; createdAt: string;
  config?: ThemeFormConfig;
}

interface ThemeFormConfig {
  colors?: { primary?: string; accent?: string; headerBg?: string; headerText?: string; footerBg?: string; footerText?: string; buttonBg?: string; buttonText?: string; saleBadge?: string };
  fonts?: { heading?: string; body?: string };
  layout?: { maxWidth?: string; productColumns?: number; template?: string };
}

const FONT_OPTIONS = [
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Lora", label: "Lora" },
  { value: "Roboto", label: "Roboto" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Raleway", label: "Raleway" },
  { value: "Nunito", label: "Nunito" },
];

const DEFAULT_CONFIG: ThemeFormConfig = {
  colors: { primary: "#1B2B4B", accent: "#F5B731", headerBg: "#ffffff", headerText: "#171717", footerBg: "#171717", footerText: "#a3a3a3", buttonBg: "", buttonText: "#ffffff", saleBadge: "#ef4444" },
  fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
  layout: { maxWidth: "72rem", productColumns: 4, template: "" },
};

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-surface-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-9 w-9 rounded-lg border border-surface-200 cursor-pointer p-0.5" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className="flex-1 rounded-lg border border-surface-200 px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-500" />
      </div>
    </div>
  );
}

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", category: "ecommerce", industry: "",
    isPremium: false, isFeatured: false, thumbnail: "",
    config: { ...DEFAULT_CONFIG },
  });

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    const res = await api.get<Theme[]>("/api/admin/themes");
    if (res.success && res.data) setThemes(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchThemes(); }, [fetchThemes]);

  const resetForm = () => {
    setForm({
      name: "", slug: "", description: "", category: "ecommerce", industry: "",
      isPremium: false, isFeatured: false, thumbnail: "",
      config: { ...DEFAULT_CONFIG, colors: { ...DEFAULT_CONFIG.colors! }, fonts: { ...DEFAULT_CONFIG.fonts! }, layout: { ...DEFAULT_CONFIG.layout! } },
    });
    setEditingId(null);
    setShowForm(false);
  };

  const updateColor = (key: string, value: string) => {
    setForm((f) => ({ ...f, config: { ...f.config, colors: { ...f.config.colors, [key]: value } } }));
  };

  const updateFont = (key: string, value: string) => {
    setForm((f) => ({ ...f, config: { ...f.config, fonts: { ...f.config.fonts, [key]: value } } }));
  };

  const updateLayout = (key: string, value: string | number) => {
    setForm((f) => ({ ...f, config: { ...f.config, layout: { ...f.config.layout, [key]: value } } }));
  };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { thumbnail, config, ...rest } = form;

    // Clean empty buttonBg — falls back to primary
    const cleanColors = { ...config.colors };
    if (!cleanColors.buttonBg) delete cleanColors.buttonBg;

    const body = {
      ...rest, slug,
      ...(thumbnail ? { thumbnail } : {}),
      config: { colors: cleanColors, fonts: config.fonts, layout: config.layout },
    };

    const res = editingId ? await api.patch(`/api/admin/themes/${editingId}`, body) : await api.post("/api/admin/themes", body);
    if (res.success) { fetchThemes(); resetForm(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this theme?")) return;
    await api.delete(`/api/admin/themes/${id}`);
    fetchThemes();
  };

  const startEdit = (t: Theme) => {
    const c = t.config || {};
    setForm({
      name: t.name, slug: t.slug, description: t.description || "", category: t.category,
      industry: t.industry || "", isPremium: t.isPremium, isFeatured: t.isFeatured, thumbnail: "",
      config: {
        colors: { ...DEFAULT_CONFIG.colors!, ...c.colors },
        fonts: { ...DEFAULT_CONFIG.fonts!, ...c.fonts },
        layout: { ...DEFAULT_CONFIG.layout!, ...c.layout },
      },
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const toggleField = async (id: string, field: string, value: boolean) => {
    await api.patch(`/api/admin/themes/${id}`, { [field]: value });
    fetchThemes();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Theme Management</h1>
          <p className="text-sm text-surface-500 mt-1">Manage marketplace themes</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-brand-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Theme
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-surface-900">{editingId ? "Edit Theme" : "New Theme"}</h3>
            <button onClick={resetForm} className="text-surface-400 hover:text-surface-600"><X className="h-5 w-5" /></button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input placeholder="Theme Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
            <input placeholder="Slug (auto-generated)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500">
              <option value="ecommerce">Ecommerce</option><option value="fashion">Fashion</option><option value="food">Food & Beverage</option><option value="beauty">Beauty</option><option value="tech">Tech</option><option value="general">General</option>
            </select>
            <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500">
              <option value="">Industry (optional)</option>
              <option value="general">General</option><option value="fashion">Fashion</option><option value="food">Food & Beverage</option>
              <option value="beauty">Beauty & Skincare</option><option value="electronics">Electronics & Tech</option>
              <option value="home">Home & Living</option><option value="health">Health & Wellness</option>
              <option value="sports">Sports & Fitness</option><option value="books">Books & Media</option><option value="art">Art & Crafts</option>
            </select>
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 md:col-span-2" rows={2} />
            <div className="md:col-span-2">
              <SingleImageUpload image={form.thumbnail || null} onChange={(url) => setForm({ ...form, thumbnail: url || "" })} label="Thumbnail Preview" compact />
            </div>
          </div>

          {/* Colors */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-surface-900 mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4" /> Colors
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <ColorInput label="Primary" value={form.config.colors?.primary || ""} onChange={(v) => updateColor("primary", v)} />
              <ColorInput label="Accent" value={form.config.colors?.accent || ""} onChange={(v) => updateColor("accent", v)} />
              <ColorInput label="Header Background" value={form.config.colors?.headerBg || ""} onChange={(v) => updateColor("headerBg", v)} />
              <ColorInput label="Header Text" value={form.config.colors?.headerText || ""} onChange={(v) => updateColor("headerText", v)} />
              <ColorInput label="Footer Background" value={form.config.colors?.footerBg || ""} onChange={(v) => updateColor("footerBg", v)} />
              <ColorInput label="Footer Text" value={form.config.colors?.footerText || ""} onChange={(v) => updateColor("footerText", v)} />
              <ColorInput label="Button (empty = primary)" value={form.config.colors?.buttonBg || ""} onChange={(v) => updateColor("buttonBg", v)} />
              <ColorInput label="Button Text" value={form.config.colors?.buttonText || ""} onChange={(v) => updateColor("buttonText", v)} />
              <ColorInput label="Sale Badge" value={form.config.colors?.saleBadge || ""} onChange={(v) => updateColor("saleBadge", v)} />
            </div>
          </div>

          {/* Fonts */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-surface-900 mb-3">Fonts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">Heading Font</label>
                <select value={form.config.fonts?.heading || ""} onChange={(e) => updateFont("heading", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500">
                  {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">Body Font</label>
                <select value={form.config.fonts?.body || ""} onChange={(e) => updateFont("body", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500">
                  {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Layout */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-surface-900 mb-3">Layout</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">Max Width</label>
                <select value={form.config.layout?.maxWidth || "72rem"} onChange={(e) => updateLayout("maxWidth", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500">
                  <option value="64rem">1024px (Compact)</option>
                  <option value="72rem">1152px (Default)</option>
                  <option value="80rem">1280px (Wide)</option>
                  <option value="90rem">1440px (Extra Wide)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">Product Grid Columns</label>
                <select value={form.config.layout?.productColumns || 4} onChange={(e) => updateLayout("productColumns", parseInt(e.target.value))} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500">
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                  <option value={5}>5 Columns</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">Template (future)</label>
                <input type="text" placeholder="e.g. classic, modern, minimal" value={form.config.layout?.template || ""} onChange={(e) => updateLayout("template", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
            </div>
          </div>

          {/* Preview swatch */}
          <div className="mb-6 rounded-xl border border-surface-200 p-4">
            <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Preview</h4>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-8 w-8 rounded-lg border border-surface-200" style={{ backgroundColor: form.config.colors?.primary || "#1B2B4B" }} title="Primary" />
                <div className="h-8 w-8 rounded-lg border border-surface-200" style={{ backgroundColor: form.config.colors?.accent || "#F5B731" }} title="Accent" />
                <div className="h-8 w-8 rounded-lg border border-surface-200" style={{ backgroundColor: form.config.colors?.headerBg || "#ffffff" }} title="Header" />
                <div className="h-8 w-8 rounded-lg border border-surface-200" style={{ backgroundColor: form.config.colors?.footerBg || "#171717" }} title="Footer" />
              </div>
              <div className="h-8 px-4 rounded-lg flex items-center text-xs font-semibold" style={{ backgroundColor: form.config.colors?.buttonBg || form.config.colors?.primary || "#1B2B4B", color: form.config.colors?.buttonText || "#ffffff" }}>
                Button
              </div>
              <span className="text-xs text-surface-400" style={{ fontFamily: `'${form.config.fonts?.heading || "Plus Jakarta Sans"}', sans-serif` }}>
                {form.config.fonts?.heading || "Heading"} / {form.config.fonts?.body || "Body"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPremium} onChange={(e) => setForm({ ...form, isPremium: e.target.checked })} className="rounded" /> Premium</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded" /> Featured</label>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={resetForm} className="px-4 py-2 text-sm rounded-xl border border-surface-200 hover:bg-surface-50">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name} className="px-4 py-2 text-sm rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-600" /></div>
      ) : themes.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
          <Palette className="h-12 w-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">No themes yet. Add your first theme.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((t) => {
            const tc = t.config?.colors;
            return (
              <div key={t.id} className="rounded-2xl border border-surface-200 bg-white p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: tc?.primary || "#7c3aed" }}>
                    <Palette className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    {t.isPremium && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Premium</span>}
                    {t.isFeatured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-surface-900">{t.name}</h3>
                <p className="text-[10px] text-surface-500 mt-0.5">{t.category}{t.industry ? ` · ${t.industry}` : ""}</p>
                {/* Color swatches */}
                {tc && (
                  <div className="flex items-center gap-1 mt-2">
                    {[tc.primary, tc.accent, tc.headerBg, tc.footerBg].filter(Boolean).map((color, i) => (
                      <div key={i} className="h-4 w-4 rounded-full border border-surface-200" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                )}
                {t.description && <p className="text-xs text-surface-400 mt-2 line-clamp-2">{t.description}</p>}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleField(t.id, "isActive", !t.isActive)} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors ${t.isActive ? "bg-green-100 text-green-700" : "bg-surface-100 text-surface-500"}`}>
                      {t.isActive ? "Active" : "Inactive"}
                    </button>
                    <span className="text-[10px] text-surface-400">{t.installs} installs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
