"use client";
import { Check, ChevronRight, Loader2, Plus, X } from "lucide-react";
import { FolderTree, GripVertical, Image as ImageIcon, Package, Pencil, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { SingleImageUpload } from "@/components/dashboard/ImageUpload";
import AIFormBridge from "@/components/dashboard/AIFormBridge";
import { useAIPrefill } from "@/hooks/useAIPrefill";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  position: number;
  _count?: { products: number };
  children?: Category[];
}

export default function CategoriesPage() {
  const { currentStore } = useSite();
  const { prefill: aiPrefill, isAIPrefilled, onSaveComplete } = useAIPrefill("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", image: "", parentId: "" });

  const fetchCategories = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<Category[]>(`/api/sites/${currentStore.id}/categories`);
    if (res.success && res.data) {
      const data = Array.isArray(res.data) ? res.data : (res.data as any).categories || [];
      setCategories(data);
    }
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // AI prefill
  useEffect(() => {
    if (!aiPrefill) return;
    if (aiPrefill._action === "create") {
      setForm({
        name: (aiPrefill.name as string) || "",
        slug: "",
        description: (aiPrefill.description as string) || "",
        image: (aiPrefill.image as string) || "",
        parentId: (aiPrefill.parentId as string) || "",
      });
      setEditingId(null);
      setShowForm(true);
    }
  }, [aiPrefill]);

  const resetForm = () => {
    setForm({ name: "", slug: "", description: "", image: "", parentId: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      parentId: cat.parentId || "",
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!currentStore || !form.name.trim()) return;
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const body = { ...form, slug, parentId: form.parentId || null };

    if (editingId) {
      const res = await api.patch(`/api/sites/${currentStore.id}/categories`, { id: editingId, ...body });
      if (res.success) fetchCategories();
    } else {
      const res = await api.post(`/api/sites/${currentStore.id}/categories`, body);
      if (res.success) fetchCategories();
    }
    setSaving(false);
    if (isAIPrefilled) {
      onSaveComplete(editingId ? "Category updated!" : "Category created!");
      return;
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!currentStore || !confirm("Delete this category? Products in it will become uncategorized.")) return;
    await api.delete(`/api/sites/${currentStore.id}/categories?id=${id}`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Build tree for display
  const topLevel = categories.filter((c) => !c.parentId);
  const getChildren = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  return (
    <div className="p-6 space-y-6">
      <AIFormBridge page="categories" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Categories</h1>
          <p className="text-sm text-surface-500 mt-1">Organize your products into categories</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm py-2.5 px-4">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <h3 className="text-sm font-bold text-surface-900 mb-3">{editingId ? "Edit Category" : "New Category"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
              placeholder="Category name"
              className="input-field py-2.5"
              autoFocus
            />
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="slug (auto-generated)"
              className="input-field py-2.5"
            />
            <SingleImageUpload
              image={form.image || null}
              onChange={(url) => setForm({ ...form, image: url || "" })}
              label="Category Image"
              compact
            />
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="input-field py-2.5"
            >
              <option value="">No parent (top-level)</option>
              {categories.filter((c) => c.id !== editingId).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)"
              className="input-field py-2.5 md:col-span-2"
              rows={2}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} disabled={saving || !form.name.trim()} className="btn-primary text-sm py-2.5 px-5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}
            </button>
            <button onClick={resetForm} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Category list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <FolderTree className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No categories yet</h3>
          <p className="text-sm text-surface-500 mb-5">Create categories to organize your products.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2.5 px-5">
            <Plus className="h-4 w-4" /> Create First Category
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
          <div className="divide-y divide-surface-100">
            {topLevel.map((cat) => (
              <CategoryRow key={cat.id} category={cat} depth={0} children={getChildren(cat.id)} allCategories={categories} onEdit={startEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryRow({ category: cat, depth, children, allCategories, onEdit, onDelete }: {
  category: Category; depth: number; children: Category[]; allCategories: Category[];
  onEdit: (c: Category) => void; onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const getChildren = (parentId: string) => allCategories.filter((c) => c.parentId === parentId);
  const productCount = cat._count?.products ?? 0;

  return (
    <>
      <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-50 transition-colors group" style={{ paddingLeft: `${20 + depth * 28}px` }}>
        {children.length > 0 ? (
          <button onClick={() => setExpanded(!expanded)} className="p-0.5">
            <ChevronRight className={`h-4 w-4 text-surface-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="w-5" />
        )}
        <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {cat.image ? (
            <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
          ) : (
            <FolderTree className="h-4 w-4 text-brand-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-surface-900">{cat.name}</h3>
          <p className="text-xs text-surface-400">/{cat.slug} · {productCount} product{productCount !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(cat)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(cat.id)} className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {expanded && children.map((child) => (
        <CategoryRow key={child.id} category={child} depth={depth + 1} children={getChildren(child.id)} allCategories={allCategories} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </>
  );
}
