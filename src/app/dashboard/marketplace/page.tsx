"use client";
import { Loader2, Plus } from "lucide-react";
import { Download, FileText, Filter, Palette, Pencil, Puzzle, Search, Star, Store, Trash2, Zap } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface MarketplaceItem {
  id: string; type: string; name: string; description: string | null;
  price: string; currency: string; authorName: string; thumbnail: string | null;
  downloads: number; rating: string; reviewCount: number; status: string;
  category: string | null; tags: string[]; createdAt: string;
}

const typeIcons: Record<string, typeof Store> = { THEME: Palette, PLUGIN: Puzzle, TEMPLATE: FileText, FUNNEL: Filter, AUTOMATION: Zap };
const typeColors: Record<string, string> = { THEME: "bg-blue-50 text-blue-600", PLUGIN: "bg-green-50 text-green-600", TEMPLATE: "bg-purple-50 text-purple-600", FUNNEL: "bg-amber-50 text-amber-600", AUTOMATION: "bg-red-50 text-red-600" };

export default function MarketplacePage() {
  const { currentStore } = useSite();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showPublish, setShowPublish] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pubName, setPubName] = useState("");
  const [pubType, setPubType] = useState("THEME");
  const [pubDescription, setPubDescription] = useState("");
  const [pubPrice, setPubPrice] = useState("0");
  const [pubCategory, setPubCategory] = useState("");

  const fetchItems = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    const res = await api.get<{ items: MarketplaceItem[] }>(`/api/sites/${currentStore.id}/marketplace?${params}`);
    if (res.success && res.data) setItems(res.data.items || []);
    setLoading(false);
  }, [currentStore, search, typeFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const publishItem = async () => {
    if (!currentStore || !pubName.trim()) return;
    setSaving(true);
    await api.post(`/api/sites/${currentStore.id}/marketplace`, {
      name: pubName.trim(), type: pubType, description: pubDescription.trim() || undefined,
      price: parseFloat(pubPrice) || 0, category: pubCategory.trim() || undefined,
    });
    setShowPublish(false); setPubName(""); setPubDescription(""); setPubPrice("0"); setPubCategory(""); setSaving(false); fetchItems();
  };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-surface-900 font-display">Marketplace</h1><p className="text-sm text-surface-500 mt-1">Browse and publish themes, plugins, templates, and more</p></div>
        <button onClick={() => setShowPublish(true)} className="btn-primary text-sm py-2.5 px-4"><Plus className="h-4 w-4" /> Publish</button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search marketplace..." className="input-field py-2.5 pl-9 w-full" />
        </div>
        {["", "THEME", "PLUGIN", "TEMPLATE", "FUNNEL", "AUTOMATION"].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${typeFilter === t ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-200 text-surface-500"}`}>
            {t || "All"}
          </button>
        ))}
      </div>

      {/* Publish form */}
      {showPublish && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">Publish to Marketplace</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Name *</label><input value={pubName} onChange={(e) => setPubName(e.target.value)} className="input-field py-2.5 w-full" autoFocus /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Type</label>
              <select value={pubType} onChange={(e) => setPubType(e.target.value)} className="input-field py-2.5 w-full">
                <option value="THEME">Theme</option><option value="PLUGIN">Plugin</option><option value="TEMPLATE">Template</option><option value="FUNNEL">Funnel</option><option value="AUTOMATION">Automation</option>
              </select></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Price (NGN)</label><input type="number" value={pubPrice} onChange={(e) => setPubPrice(e.target.value)} className="input-field py-2.5 w-full" min="0" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-surface-700 mb-1">Description</label><textarea value={pubDescription} onChange={(e) => setPubDescription(e.target.value)} className="input-field py-2.5 w-full resize-y" rows={3} /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Category</label><input value={pubCategory} onChange={(e) => setPubCategory(e.target.value)} className="input-field py-2.5 w-full" placeholder="e.g. Commerce, Marketing" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={publishItem} disabled={saving || !pubName.trim()} className="btn-primary text-sm py-2.5 px-6">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for Review"}</button>
            <button onClick={() => setShowPublish(false)} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Items */}
      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : items.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Store className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No marketplace items{typeFilter ? ` of type "${typeFilter}"` : ""}</h3>
          <p className="text-sm text-surface-500 mb-5">Publish your first theme, plugin, or template.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
            const Icon = typeIcons[item.type] || Store;
            const color = typeColors[item.type] || "bg-surface-100 text-surface-600";
            return (
              <div key={item.id} className="rounded-xl border border-surface-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-36 bg-surface-50 flex items-center justify-center">
                  {item.thumbnail ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover" /> : <Icon className="h-12 w-12 text-surface-200" />}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{item.type}</span>
                    {parseFloat(item.price) === 0 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">Free</span>}
                  </div>
                  <h3 className="text-sm font-bold text-surface-900 truncate">{item.name}</h3>
                  <p className="text-xs text-surface-500 mt-0.5">by {item.authorName}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <span className="flex items-center gap-0.5"><Download className="h-3 w-3" /> {item.downloads}</span>
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3" /> {parseFloat(item.rating).toFixed(1)}</span>
                    </div>
                    {parseFloat(item.price) > 0 && <span className="text-sm font-bold text-brand-600">GH₵{parseFloat(item.price).toLocaleString()}</span>}
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
