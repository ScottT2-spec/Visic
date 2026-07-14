"use client";
import { Loader2 } from "lucide-react";
import { AlertTriangle, CheckCircle2, FileText, Globe, Package, Save, Search as SearchIcon } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface SeoItem {
  id: string; type: "page" | "product" | "blog"; name: string; slug: string;
  metaTitle: string | null; metaDescription: string | null; url: string;
}

export default function SeoPage() {
  const { currentStore } = useSite();
  const [items, setItems] = useState<SeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "page" | "product" | "blog">("");
  const [edits, setEdits] = useState<Record<string, { metaTitle?: string; metaDescription?: string }>>({});
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const all: SeoItem[] = [];

    // Fetch pages
    const pagesRes = await api.get<{ pages: Array<{ id: string; title: string; slug: string; metaTitle: string | null; metaDescription: string | null }> }>(`/api/sites/${currentStore.id}/pages`);
    if (pagesRes.success && pagesRes.data) {
      for (const p of (pagesRes.data as any).pages || pagesRes.data as any) {
        all.push({ id: p.id, type: "page", name: p.title, slug: p.slug, metaTitle: p.metaTitle, metaDescription: p.metaDescription, url: `/${p.slug}` });
      }
    }

    // Fetch products
    const prodsRes = await api.get<{ products: Array<{ id: string; name: string; slug: string; metaTitle: string | null; metaDescription: string | null }> }>(`/api/sites/${currentStore.id}/products`);
    if (prodsRes.success && prodsRes.data) {
      for (const p of (prodsRes.data as any).products || prodsRes.data as any) {
        all.push({ id: p.id, type: "product", name: p.name, slug: p.slug, metaTitle: p.metaTitle, metaDescription: p.metaDescription, url: `/products/${p.slug}` });
      }
    }

    // Fetch blogs
    const blogsRes = await api.get<{ blogs: Array<{ id: string; title: string; slug: string; metaTitle: string | null; metaDescription: string | null }> }>(`/api/sites/${currentStore.id}/blogs`);
    if (blogsRes.success && blogsRes.data) {
      for (const b of (blogsRes.data as any).blogs || blogsRes.data as any) {
        all.push({ id: b.id, type: "blog", name: b.title, slug: b.slug, metaTitle: b.metaTitle, metaDescription: b.metaDescription, url: `/blog/${b.slug}` });
      }
    }

    setItems(all);
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const updateEdit = (id: string, field: "metaTitle" | "metaDescription", value: string) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const saveAll = async () => {
    if (!currentStore) return;
    setSaving(true);
    for (const [id, data] of Object.entries(edits)) {
      const item = items.find((i) => i.id === id);
      if (!item) continue;
      const endpoint = item.type === "page" ? "pages" : item.type === "product" ? "products" : "blogs";
      await api.patch(`/api/sites/${currentStore.id}/${endpoint}/${id}`, data);
    }
    setEdits({}); setSaving(false); fetchItems();
  };

  const filtered = items.filter((i) => {
    if (typeFilter && i.type !== typeFilter) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.slug.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const missingMeta = items.filter((i) => !i.metaTitle || !i.metaDescription).length;
  const hasEdits = Object.keys(edits).length > 0;

  const typeIcons = { page: FileText, product: Package, blog: Globe };
  const typeColors = { page: "text-blue-600 bg-blue-50", product: "text-green-600 bg-green-50", blog: "text-purple-600 bg-purple-50" };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">SEO Manager</h1>
          <p className="text-sm text-surface-500 mt-1">Optimize meta titles and descriptions for all content</p>
        </div>
        {hasEdits && <button onClick={saveAll} disabled={saving} className="btn-primary text-sm py-2.5 px-4">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save {Object.keys(edits).length} Changes</>}</button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <p className="text-lg font-bold text-surface-900">{items.length}</p><p className="text-xs text-surface-500">Total Pages</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <p className="text-lg font-bold text-green-600">{items.length - missingMeta}</p><p className="text-xs text-surface-500">Optimized</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <p className="text-lg font-bold text-amber-600">{missingMeta}</p><p className="text-xs text-surface-500">Missing Meta</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <p className="text-lg font-bold text-brand-600">{items.length > 0 ? `${((1 - missingMeta / items.length) * 100).toFixed(0)}%` : "—"}</p><p className="text-xs text-surface-500">SEO Score</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search content..." className="input-field py-2.5 pl-9 w-full" />
        </div>
        {(["", "page", "product", "blog"] as const).map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${typeFilter === t ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-200 text-surface-500"}`}>
            {t || "All"} {t ? `(${items.filter((i) => i.type === t).length})` : `(${items.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : filtered.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <SearchIcon className="h-8 w-8 text-surface-300 mx-auto mb-2" />
          <p className="text-sm text-surface-500">No content found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const Icon = typeIcons[item.type];
            const color = typeColors[item.type];
            const edit = edits[item.id] || {};
            const title = edit.metaTitle ?? item.metaTitle ?? "";
            const desc = edit.metaDescription ?? item.metaDescription ?? "";
            const hasMeta = (item.metaTitle || edit.metaTitle) && (item.metaDescription || edit.metaDescription);

            return (
              <div key={item.id} className="rounded-xl border border-surface-200 bg-white p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}><Icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-surface-900">{item.name}</span>
                      {hasMeta ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                    </div>
                    <span className="text-xs text-surface-400">{item.url}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-surface-600 mb-1">Meta Title <span className="text-surface-400">({title.length}/60)</span></label>
                    <input value={title} maxLength={60} onChange={(e) => updateEdit(item.id, "metaTitle", e.target.value)}
                      className={`input-field py-2 text-sm w-full ${title.length > 60 ? "border-red-300" : title.length > 50 ? "border-amber-300" : ""}`}
                      placeholder="Enter meta title..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-600 mb-1">Meta Description <span className="text-surface-400">({desc.length}/160)</span></label>
                    <input value={desc} maxLength={160} onChange={(e) => updateEdit(item.id, "metaDescription", e.target.value)}
                      className={`input-field py-2 text-sm w-full ${desc.length > 160 ? "border-red-300" : desc.length > 140 ? "border-amber-300" : ""}`}
                      placeholder="Enter meta description..." />
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
