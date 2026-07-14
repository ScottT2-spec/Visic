"use client";
import { Loader2, Plus } from "lucide-react";
import { ExternalLink, Globe, GripVertical, Image as ImageIcon, Package, Pencil, Search, Tag, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  position: number;
  createdAt: string;
  _count?: { products: number };
}

export default function BrandsPage() {
  const { currentStore } = useSite();
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Editor
  const [showEditor, setShowEditor] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");

  const fetchBrands = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await api.get<{ brands: BrandItem[] }>(`/api/sites/${currentStore.id}/brands?${params}`);
    if (res.success && res.data) {
      setBrands(res.data.brands || []);
    }
    setLoading(false);
  }, [currentStore, search]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const resetForm = () => {
    setName("");
    setLogo("");
    setDescription("");
    setWebsite("");
    setEditingBrand(null);
    setDeleteError(null);
  };

  const openCreate = () => {
    resetForm();
    setShowEditor(true);
  };

  const openEdit = (brand: BrandItem) => {
    setName(brand.name);
    setLogo(brand.logo || "");
    setDescription(brand.description || "");
    setWebsite(brand.website || "");
    setEditingBrand(brand);
    setShowEditor(true);
    setDeleteError(null);
  };

  const saveBrand = async () => {
    if (!currentStore || !name.trim()) return;
    setSaving(true);

    const payload = {
      name: name.trim(),
      logo: logo.trim() || null,
      description: description.trim() || undefined,
      website: website.trim() || null,
    };

    if (editingBrand) {
      const res = await api.patch(`/api/sites/${currentStore.id}/brands/${editingBrand.id}`, payload);
      if (res.success) {
        await fetchBrands();
        setShowEditor(false);
        resetForm();
      }
    } else {
      const res = await api.post(`/api/sites/${currentStore.id}/brands`, payload);
      if (res.success) {
        await fetchBrands();
        setShowEditor(false);
        resetForm();
      }
    }
    setSaving(false);
  };

  const deleteBrand = async (id: string) => {
    if (!currentStore || !confirm("Delete this brand?")) return;
    setDeleteId(id);
    setDeleteError(null);
    const res = await api.delete(`/api/sites/${currentStore.id}/brands/${id}`);
    if (res.success) {
      setBrands((prev) => prev.filter((b) => b.id !== id));
    } else {
      setDeleteError(res.error || "Failed to delete brand");
    }
    setDeleteId(null);
  };

  if (!currentStore) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Brands</h1>
          <p className="text-sm text-surface-500 mt-1">Manage product brands for your store</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-4">
          <Plus className="h-4 w-4" /> New Brand
        </button>
      </div>

      {/* Search */}
      {brands.length > 0 && !showEditor && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands..."
            className="input-field pl-10 py-2.5 w-full"
          />
        </div>
      )}

      {/* Delete error banner */}
      {deleteError && (
        <div className="rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700">
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Editor */}
      {showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">
            {editingBrand ? "Edit Brand" : "New Brand"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Brand Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nike, Adidas, etc." className="input-field py-2.5 w-full" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Website</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://brand.com" className="input-field py-2.5 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Logo URL</label>
              <input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." className="input-field py-2.5 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." className="input-field py-2.5 w-full" />
            </div>
          </div>

          {logo && (
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo preview" className="h-12 w-12 rounded-xl object-contain border border-surface-200" />
              <span className="text-xs text-surface-400">Logo preview</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={saveBrand} disabled={saving || !name.trim()} className="btn-primary text-sm py-2.5 px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingBrand ? "Update Brand" : "Create Brand"}
            </button>
            <button onClick={() => { setShowEditor(false); resetForm(); }} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Brand List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : brands.length === 0 && !showEditor ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <Tag className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No brands yet</h3>
          <p className="text-sm text-surface-500 mb-5">Add brands to organize and filter your products.</p>
          <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-5">
            <Plus className="h-4 w-4" /> Add First Brand
          </button>
        </div>
      ) : !showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
          <div className="divide-y divide-surface-100">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 transition-colors group">
                {/* Logo */}
                <div className="h-12 w-12 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-surface-200">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain p-1" />
                  ) : (
                    <Tag className="h-5 w-5 text-surface-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-surface-900">{brand.name}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500 flex items-center gap-1">
                      <Package className="h-3 w-3" /> {brand._count?.products || 0} products
                    </span>
                  </div>
                  {brand.description && (
                    <p className="text-xs text-surface-500 truncate mt-0.5">{brand.description}</p>
                  )}
                  <p className="text-xs text-surface-400 mt-0.5">/{brand.slug}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {brand.website && (
                    <a href={brand.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors" title="Visit website">
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  <button onClick={() => openEdit(brand)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-brand-700 transition-colors">
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => deleteBrand(brand.id)}
                    disabled={deleteId === brand.id}
                    className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600 transition-colors"
                  >
                    {deleteId === brand.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
