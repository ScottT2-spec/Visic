"use client";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Plus, X } from "lucide-react";
import { AlertCircle, BarChart3, Copy, GripVertical, ImageIcon, Layers, Package, Save, Settings2, Sparkles, Tag, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";
import ImageUpload, { SingleImageUpload } from "@/components/dashboard/ImageUpload";

// ─── Types ──────────────────────────────────────────────────

interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
}

interface Attribute {
  id: string;
  name: string;
  values: string[];
}

interface Variant {
  id?: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
  image: string;
  options: Record<string, string>;
  expanded?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
}

interface ProductData {
  id?: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  sku?: string;
  stock: number;
  trackInventory: boolean;
  lowStockAlert?: number;
  categoryId?: string | null;
  status: string;
  isFeatured: boolean;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  images: Array<{ id?: string; url: string; alt?: string }>;
  variants: Array<{
    id?: string;
    name: string;
    sku?: string;
    price?: number;
    stock: number;
    options: Record<string, string>;
  }>;
}

interface ProductFormProps {
  productId?: string; // if editing
}

// ─── Tab Config ─────────────────────────────────────────────

const TABS = [
  { id: "general", label: "General", icon: Package },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "inventory", label: "Inventory", icon: BarChart3 },
  { id: "variations", label: "Attributes & Variations", icon: Layers },
  { id: "seo", label: "SEO", icon: Tag },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Helpers ────────────────────────────────────────────────

function generateId() {
  return `_${Math.random().toString(36).slice(2, 9)}`;
}

function generateVariantCombinations(attributes: Attribute[]): Variant[] {
  const validAttrs = attributes.filter((a) => a.name && a.values.length > 0);
  if (validAttrs.length === 0) return [];

  const combinations: Record<string, string>[][] = [[]];

  for (const attr of validAttrs) {
    const newCombos: Record<string, string>[][] = [];
    for (const combo of combinations) {
      for (const val of attr.values) {
        newCombos.push([...combo, { [attr.name]: val }]);
      }
    }
    combinations.length = 0;
    combinations.push(...newCombos);
  }

  return combinations.map((combo) => {
    const options = Object.assign({}, ...combo);
    const name = Object.values(options).join(" / ");
    return {
      id: generateId(),
      name,
      sku: "",
      price: "",
      stock: "0",
      image: "",
      options,
      expanded: false,
    };
  });
}

// ─── Component ──────────────────────────────────────────────

export default function ProductForm({ productId }: ProductFormProps) {
  const { currentStore } = useSite();
  const router = useRouter();
  const isEditing = !!productId;
  const prefillPage = isEditing ? `products/${productId}/edit` : "products/new";
  const { prefill: aiPrefill, isAIPrefilled, onSaveComplete } = useAIPrefill(prefillPage);

  // Form state
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [productType, setProductType] = useState<"simple" | "variable">("simple");
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEditing);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // General
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Images
  const [images, setImages] = useState<ProductImage[]>([]);

  // Inventory
  const [stock, setStock] = useState("0");
  const [trackInventory, setTrackInventory] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState("5");

  // Attributes & Variations
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  // SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);

  const currency = currentStore?.currency || "NGN";

  // ─── Load categories ───────────────────────────────────────

  useEffect(() => {
    if (!currentStore) return;
    api.get<{ categories: Category[] }>(`/api/sites/${currentStore.id}/categories`).then((res) => {
      if (res.success && res.data) {
        const cats = Array.isArray(res.data) ? res.data : (res.data as any).categories || [];
        setCategories(cats);
      }
    });
  }, [currentStore]);

  // ─── Load existing product (edit mode) ─────────────────────

  useEffect(() => {
    if (!isEditing || !currentStore || !productId) return;
    setLoadingProduct(true);
    api.get<ProductData>(`/api/sites/${currentStore.id}/products/${productId}`).then((res) => {
      if (res.success && res.data) {
        const p = res.data;
        setName(p.name);
        setDescription(p.description || "");
        setPrice(String(p.price));
        setCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : "");
        setCostPrice(p.costPrice ? String(p.costPrice) : "");
        setSku(p.sku || "");
        setStock(String(p.stock));
        setTrackInventory(p.trackInventory);
        setLowStockAlert(String(p.lowStockAlert || 5));
        setCategoryId(p.categoryId || "");
        setStatus(p.status);
        setIsFeatured(p.isFeatured);
        setTags(p.tags || []);
        setMetaTitle(p.metaTitle || "");
        setMetaDescription(p.metaDescription || "");
        setImages(p.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt })));

        if (p.variants && p.variants.length > 0) {
          setProductType("variable");
          // Reconstruct attributes from variant options
          const attrMap = new Map<string, Set<string>>();
          for (const v of p.variants) {
            if (v.options && typeof v.options === "object") {
              for (const [key, val] of Object.entries(v.options as Record<string, string>)) {
                if (!attrMap.has(key)) attrMap.set(key, new Set());
                attrMap.get(key)!.add(val);
              }
            }
          }
          setAttributes(
            Array.from(attrMap.entries()).map(([attrName, vals]) => ({
              id: generateId(),
              name: attrName,
              values: Array.from(vals),
            }))
          );
          setVariants(
            p.variants.map((v: any) => ({
              id: v.id,
              name: v.name,
              sku: v.sku || "",
              price: v.price ? String(v.price) : "",
              stock: String(v.stock),
              image: v.image || "",
              options: (v.options as Record<string, string>) || {},
              expanded: false,
            }))
          );
        }
      }
      setLoadingProduct(false);
    });
  }, [isEditing, currentStore, productId]);

  // ─── AI Prefill ────────────────────────────────────────────

  useEffect(() => {
    if (!aiPrefill || isEditing) return;

    // Populate form from AI-generated data
    if (aiPrefill.name) setName(aiPrefill.name as string);
    if (aiPrefill.description) setDescription(aiPrefill.description as string);
    if (aiPrefill.price) setPrice(String(aiPrefill.price));
    if (aiPrefill.compareAtPrice) setCompareAtPrice(String(aiPrefill.compareAtPrice));
    if (aiPrefill.costPrice) setCostPrice(String(aiPrefill.costPrice));
    if (aiPrefill.sku) setSku(aiPrefill.sku as string);
    if (aiPrefill.stock !== undefined) setStock(String(aiPrefill.stock));
    if (aiPrefill.trackInventory !== undefined) setTrackInventory(aiPrefill.trackInventory as boolean);
    if (aiPrefill.categoryId) setCategoryId(aiPrefill.categoryId as string);
    if (aiPrefill.status) setStatus(aiPrefill.status as string);
    if (aiPrefill.isFeatured !== undefined) setIsFeatured(aiPrefill.isFeatured as boolean);
    if (aiPrefill.tags) setTags(aiPrefill.tags as string[]);
    if (aiPrefill.metaTitle) setMetaTitle(aiPrefill.metaTitle as string);
    if (aiPrefill.metaDescription) setMetaDescription(aiPrefill.metaDescription as string);

    // Images (AI might not have images, merchant adds them)
    if (aiPrefill.images && Array.isArray(aiPrefill.images) && (aiPrefill.images as any[]).length > 0) {
      setImages(aiPrefill.images as ProductImage[]);
    }

    // Variants
    if (aiPrefill.variants && Array.isArray(aiPrefill.variants) && (aiPrefill.variants as any[]).length > 0) {
      setProductType("variable");
      const prefillVariants = aiPrefill.variants as any[];

      // Reconstruct attributes from variant options
      const attrMap = new Map<string, Set<string>>();
      for (const v of prefillVariants) {
        if (v.options && typeof v.options === "object") {
          for (const [key, val] of Object.entries(v.options as Record<string, string>)) {
            if (!attrMap.has(key)) attrMap.set(key, new Set());
            attrMap.get(key)!.add(val);
          }
        }
      }
      setAttributes(
        Array.from(attrMap.entries()).map(([attrName, vals]) => ({
          id: generateId(),
          name: attrName,
          values: Array.from(vals),
        }))
      );
      setVariants(
        prefillVariants.map((v: any) => ({
          id: v.id || generateId(),
          name: v.name,
          sku: v.sku || "",
          price: v.price ? String(v.price) : "",
          stock: String(v.stock || 0),
          image: v.image || "",
          options: v.options || {},
          expanded: false,
        }))
      );
    }

    // Auto-switch to images tab if no images (hint to add them)
    if (!aiPrefill.images || (aiPrefill.images as any[]).length === 0) {
      // Stay on general tab first so they can review, but we could hint
    }
  }, [aiPrefill, isEditing]);

  // ─── Attributes ────────────────────────────────────────────

  const addAttribute = () => {
    setAttributes([...attributes, { id: generateId(), name: "", values: [] }]);
  };

  const updateAttributeName = (id: string, name: string) => {
    setAttributes(attributes.map((a) => (a.id === id ? { ...a, name } : a)));
  };

  const addAttributeValue = (attrId: string, value: string) => {
    if (!value.trim()) return;
    setAttributes(
      attributes.map((a) =>
        a.id === attrId && !a.values.includes(value.trim())
          ? { ...a, values: [...a.values, value.trim()] }
          : a
      )
    );
  };

  const removeAttributeValue = (attrId: string, value: string) => {
    setAttributes(
      attributes.map((a) =>
        a.id === attrId ? { ...a, values: a.values.filter((v) => v !== value) } : a
      )
    );
  };

  const removeAttribute = (id: string) => {
    setAttributes(attributes.filter((a) => a.id !== id));
  };

  const generateVariations = () => {
    const newVariants = generateVariantCombinations(attributes);
    // Preserve existing variant data where options match
    const merged = newVariants.map((nv) => {
      const existing = variants.find(
        (ev) => JSON.stringify(ev.options) === JSON.stringify(nv.options)
      );
      if (existing) {
        return { ...nv, sku: existing.sku, price: existing.price, stock: existing.stock, image: existing.image, id: existing.id };
      }
      return nv;
    });
    setVariants(merged);
  };

  // Images are now managed by the ImageUpload component

  // ─── Tags ──────────────────────────────────────────────────

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  // ─── Save ──────────────────────────────────────────────────

  const handleSave = async () => {
    if (!currentStore) return;
    if (!name.trim()) { setError("Product name is required"); setActiveTab("general"); return; }
    if (!price || parseFloat(price) <= 0) { setError("Price must be greater than 0"); setActiveTab("general"); return; }

    setSaving(true);
    setError("");
    setSuccessMsg("");

    const payload: Record<string, unknown> = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      costPrice: null,
      sku: sku || undefined,
      stock: parseInt(stock) || 0,
      trackInventory,
      lowStockAlert: parseInt(lowStockAlert) || 5,
      categoryId: categoryId || null,
      status,
      isFeatured,
      tags,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      images: images.map((img) => ({ url: img.url, alt: img.alt || undefined })),
      variants:
        productType === "variable"
          ? variants.map((v) => ({
              name: v.name,
              sku: v.sku || undefined,
              price: v.price ? parseFloat(v.price) : undefined,
              stock: parseInt(v.stock) || 0,
              image: v.image || null,
              options: v.options,
            }))
          : [],
    };

    const res = isEditing
      ? await api.patch(`/api/sites/${currentStore.id}/products/${productId}`, payload)
      : await api.post(`/api/sites/${currentStore.id}/products`, payload);

    if (res.success) {
      setSuccessMsg(isEditing ? "Product updated!" : "Product created!");
      if (isAIPrefilled) {
        // Return to AI chat after saving
        setTimeout(() => onSaveComplete(isEditing ? "Product updated successfully!" : "Product created successfully!"), 600);
      } else {
        setTimeout(() => router.push("/dashboard/products"), 800);
      }
    } else {
      setError(res.error || "Failed to save product");
    }
    setSaving(false);
  };

  // ─── Loading state ────────────────────────────────────────

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-surface-100">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/products")}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-surface-900">
                {isEditing ? "Edit Product" : "Add Product"}
              </h1>
              <p className="text-xs text-surface-500">
                {isEditing ? `Editing: ${name || "..."}` : "Create a new product"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/products")}
              className="btn-secondary text-sm py-2 px-4"
            >
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2 px-4">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? "Update" : "Save Product"}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* AI Prefill Banner */}
        <AIPrefillBanner page={prefillPage} />

        {/* Messages */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError("")} className="ml-auto"><X className="h-4 w-4" /></button>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            ✓ {successMsg}
          </div>
        )}

        {/* Product Type */}
        <div className="mb-6 rounded-2xl border border-surface-200 bg-white p-5">
          <label className="block text-sm font-semibold text-surface-900 mb-3">Product Type</label>
          <div className="flex gap-3">
            <button
              onClick={() => setProductType("simple")}
              className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${
                productType === "simple"
                  ? "border-brand-600 bg-brand-50"
                  : "border-surface-200 hover:border-surface-300"
              }`}
            >
              <Package className={`h-5 w-5 mb-2 ${productType === "simple" ? "text-brand-600" : "text-surface-400"}`} />
              <div className="text-sm font-semibold text-surface-900">Simple Product</div>
              <div className="text-xs text-surface-500 mt-0.5">A single product with no variations</div>
            </button>
            <button
              onClick={() => setProductType("variable")}
              className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${
                productType === "variable"
                  ? "border-brand-600 bg-brand-50"
                  : "border-surface-200 hover:border-surface-300"
              }`}
            >
              <Layers className={`h-5 w-5 mb-2 ${productType === "variable" ? "text-brand-600" : "text-surface-400"}`} />
              <div className="text-sm font-semibold text-surface-900">Variable Product</div>
              <div className="text-xs text-surface-500 mt-0.5">Product with variations like size, color</div>
            </button>
          </div>
        </div>

        {/* Tabs + Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tab Navigation (sidebar style) */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden lg:sticky lg:top-24">
              {TABS.filter((t) => t.id !== "variations" || productType === "variable").map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-surface-100 last:border-0 ${
                      activeTab === tab.id
                        ? "bg-brand-50 text-brand-700"
                        : "text-surface-600 hover:bg-surface-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            {/* ─── GENERAL TAB ──────────────────────── */}
            {activeTab === "general" && (
              <div className="space-y-6">
                {/* Name & Description */}
                <div className="rounded-2xl border border-surface-200 bg-white p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="e.g. Ankara Maxi Dress"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-field"
                      rows={5}
                      placeholder="Describe your product in detail..."
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="rounded-2xl border border-surface-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-surface-900 mb-4">Pricing</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">
                        Regular Price ({currency}) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="input-field"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">
                        Sale Price ({currency})
                      </label>
                      <input
                        type="number"
                        value={compareAtPrice}
                        onChange={(e) => setCompareAtPrice(e.target.value)}
                        className="input-field"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-[10px] text-surface-400 mt-1">
                        Original/compare-at price (shows as crossed out)
                      </p>
                    </div>
                    {/* Cost price removed */}
                  </div>
                </div>

                {/* Organization */}
                <div className="rounded-2xl border border-surface-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-surface-900 mb-4">Organization</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="input-field"
                      >
                        <option value="">Uncategorized</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">SKU</label>
                      <input
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="input-field"
                        placeholder="e.g. ANK-MAXI-001"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-surface-700 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-700"
                        >
                          {tag}
                          <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); addTag(); }
                        }}
                        className="input-field flex-1"
                        placeholder="Add a tag and press Enter"
                      />
                      <button onClick={addTag} className="btn-secondary text-sm py-2 px-3">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status & Visibility */}
                <div className="rounded-2xl border border-surface-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-surface-900 mb-4">Status & Visibility</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="input-field"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active (Published)</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <button
                        type="button"
                        onClick={() => setIsFeatured(!isFeatured)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isFeatured ? "bg-brand-600" : "bg-surface-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isFeatured ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <div>
                        <span className="text-sm font-medium text-surface-700">Featured Product</span>
                        <p className="text-[10px] text-surface-400">Show in featured sections</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── IMAGES TAB ───────────────────────── */}
            {activeTab === "images" && (
              <div className="rounded-2xl border border-surface-200 bg-white p-5 space-y-4">
                <h3 className="text-sm font-semibold text-surface-900">Product Images</h3>
                <p className="text-xs text-surface-500">
                  Upload images from your device. The first image is used as the main product image.
                </p>
                <ImageUpload
                  images={images}
                  onChange={setImages}
                  multiple
                  max={20}
                  showMainBadge
                />
              </div>
            )}

            {/* ─── INVENTORY TAB ────────────────────── */}
            {activeTab === "inventory" && (
              <div className="rounded-2xl border border-surface-200 bg-white p-5 space-y-4">
                <h3 className="text-sm font-semibold text-surface-900">Inventory</h3>
                {productType === "variable" && (
                  <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-700">
                    💡 For variable products, stock is managed per variation. The values here act as defaults.
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      value={lowStockAlert}
                      onChange={(e) => setLowStockAlert(e.target.value)}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setTrackInventory(!trackInventory)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        trackInventory ? "bg-brand-600" : "bg-surface-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          trackInventory ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-surface-700">Track Inventory</span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── ATTRIBUTES & VARIATIONS TAB ──────── */}
            {activeTab === "variations" && productType === "variable" && (
              <div className="space-y-6">
                {/* Attributes */}
                <div className="rounded-2xl border border-surface-200 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-surface-900">Attributes</h3>
                      <p className="text-xs text-surface-500 mt-0.5">
                        Define attributes like Size, Color, Material, etc.
                      </p>
                    </div>
                    <button onClick={addAttribute} className="btn-secondary text-xs py-1.5 px-3">
                      <Plus className="h-3.5 w-3.5" /> Add Attribute
                    </button>
                  </div>

                  {attributes.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-surface-200 p-6 text-center">
                      <Settings2 className="h-8 w-8 text-surface-300 mx-auto mb-2" />
                      <p className="text-sm text-surface-500">No attributes defined</p>
                      <p className="text-xs text-surface-400">
                        Add attributes to create product variations
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {attributes.map((attr) => (
                        <AttributeRow
                          key={attr.id}
                          attribute={attr}
                          onUpdateName={(name) => updateAttributeName(attr.id, name)}
                          onAddValue={(val) => addAttributeValue(attr.id, val)}
                          onRemoveValue={(val) => removeAttributeValue(attr.id, val)}
                          onRemove={() => removeAttribute(attr.id)}
                        />
                      ))}
                    </div>
                  )}

                  {attributes.length > 0 && (
                    <button onClick={generateVariations} className="btn-primary text-sm py-2 px-4 w-full">
                      <Sparkles className="h-4 w-4" />
                      Generate Variations ({attributes.reduce((acc, a) => acc * Math.max(a.values.length, 1), 1)})
                    </button>
                  )}
                </div>

                {/* Variations */}
                {variants.length > 0 && (
                  <div className="rounded-2xl border border-surface-200 bg-white p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-surface-900">
                          Variations ({variants.length})
                        </h3>
                        <p className="text-xs text-surface-500 mt-0.5">
                          Set individual price, stock, SKU, and image for each variation
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setVariants(variants.map((v) => ({ ...v, expanded: !variants.every((x) => x.expanded) })))
                        }
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        {variants.every((v) => v.expanded) ? "Collapse All" : "Expand All"}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {variants.map((variant, vi) => (
                        <VariantRow
                          key={variant.id || vi}
                          variant={variant}
                          index={vi}
                          currency={currency}
                          defaultPrice={price}
                          onUpdate={(field, value) => {
                            setVariants(
                              variants.map((v, i) => (i === vi ? { ...v, [field]: value } : v))
                            );
                          }}
                          onToggle={() => {
                            setVariants(
                              variants.map((v, i) =>
                                i === vi ? { ...v, expanded: !v.expanded } : v
                              )
                            );
                          }}
                          onRemove={() => setVariants(variants.filter((_, i) => i !== vi))}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── SEO TAB ──────────────────────────── */}
            {activeTab === "seo" && (
              <div className="rounded-2xl border border-surface-200 bg-white p-5 space-y-4">
                <h3 className="text-sm font-semibold text-surface-900">Search Engine Optimization</h3>
                <p className="text-xs text-surface-500">
                  Customize how this product appears in search engine results.
                </p>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Meta Title</label>
                  <input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="input-field"
                    placeholder={name || "Product title"}
                    maxLength={70}
                  />
                  <p className="text-[10px] text-surface-400 mt-1">{metaTitle.length}/70 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Brief description for search results..."
                    maxLength={160}
                  />
                  <p className="text-[10px] text-surface-400 mt-1">{metaDescription.length}/160 characters</p>
                </div>

                {/* Preview */}
                <div className="rounded-xl bg-surface-50 border border-surface-200 p-4">
                  <p className="text-xs text-surface-400 mb-2">Search Preview</p>
                  <div className="text-blue-700 text-sm font-medium truncate">
                    {metaTitle || name || "Product Title"}
                  </div>
                  <div className="text-green-700 text-xs truncate">
                    yourstore.com/product/{name ? name.toLowerCase().replace(/\s+/g, "-") : "product-slug"}
                  </div>
                  <div className="text-xs text-surface-600 mt-1 line-clamp-2">
                    {metaDescription || description || "Product description will appear here..."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Attribute Row Component ────────────────────────────────

function AttributeRow({
  attribute,
  onUpdateName,
  onAddValue,
  onRemoveValue,
  onRemove,
}: {
  attribute: Attribute;
  onUpdateName: (name: string) => void;
  onAddValue: (value: string) => void;
  onRemoveValue: (value: string) => void;
  onRemove: () => void;
}) {
  const [valueInput, setValueInput] = useState("");

  return (
    <div className="rounded-xl border border-surface-200 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <input
          value={attribute.name}
          onChange={(e) => onUpdateName(e.target.value)}
          className="input-field flex-1 text-sm font-semibold"
          placeholder="Attribute name (e.g. Size, Color)"
        />
        <button
          onClick={onRemove}
          className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Values */}
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {attribute.values.map((val) => (
            <span
              key={val}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-50 border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700"
            >
              {val}
              <button onClick={() => onRemoveValue(val)} className="hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddValue(valueInput);
                setValueInput("");
              }
            }}
            className="input-field flex-1 text-xs"
            placeholder="Type a value and press Enter (e.g. Small, Medium, Large)"
          />
          <button
            onClick={() => {
              onAddValue(valueInput);
              setValueInput("");
            }}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Variant Row Component ──────────────────────────────────

function VariantRow({
  variant,
  index,
  currency,
  defaultPrice,
  onUpdate,
  onToggle,
  onRemove,
}: {
  variant: Variant;
  index: number;
  currency: string;
  defaultPrice: string;
  onUpdate: (field: string, value: string) => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-surface-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-50 hover:bg-surface-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {variant.image ? (
            <img
              src={variant.image}
              alt={variant.name}
              className="h-8 w-8 rounded-lg object-cover border border-surface-200"
            />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-surface-200 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-surface-400" />
            </div>
          )}
          <div className="text-left">
            <span className="text-sm font-semibold text-surface-900">{variant.name}</span>
            <div className="flex items-center gap-2 text-[10px] text-surface-500">
              {variant.price && <span>{currency} {variant.price}</span>}
              {variant.stock && <span>· Stock: {variant.stock}</span>}
              {variant.sku && <span>· SKU: {variant.sku}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {variant.expanded ? (
            <ChevronUp className="h-4 w-4 text-surface-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-surface-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {variant.expanded && (
        <div className="px-4 py-4 space-y-4 border-t border-surface-100">
          {/* Options display */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(variant.options).map(([key, value]) => (
              <span
                key={key}
                className="rounded-full bg-surface-100 px-2.5 py-0.5 text-[10px] font-medium text-surface-600"
              >
                {key}: <strong>{value}</strong>
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1">
                Price ({currency})
              </label>
              <input
                type="number"
                value={variant.price}
                onChange={(e) => onUpdate("price", e.target.value)}
                className="input-field text-sm"
                placeholder={defaultPrice || "0.00"}
                min="0"
                step="0.01"
              />
              <p className="text-[10px] text-surface-400 mt-0.5">
                Leave empty to use regular price
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1">Stock</label>
              <input
                type="number"
                value={variant.stock}
                onChange={(e) => onUpdate("stock", e.target.value)}
                className="input-field text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1">SKU</label>
              <input
                value={variant.sku}
                onChange={(e) => onUpdate("sku", e.target.value)}
                className="input-field text-sm"
                placeholder="e.g. ANK-RED-M"
              />
            </div>
          </div>

          {/* Variant image */}
          <SingleImageUpload
            image={variant.image || null}
            onChange={(url) => onUpdate("image", url || "")}
            label="Variation Image"
            compact
          />
          <p className="text-[10px] text-surface-400 -mt-2">
            Image specific to this variation (e.g. different color)
          </p>
        </div>
      )}
    </div>
  );
}
