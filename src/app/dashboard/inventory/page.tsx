"use client";
import { Loader2 } from "lucide-react";
import { AlertTriangle, BarChart3, CheckCircle2, Package, Pencil, Save, Search, XCircle } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface InventoryProduct {
  id: string; name: string; slug: string; sku: string | null;
  stock: number; lowStockAlert: number; price: string; status: string;
  images: string[]; createdAt: string;
}

interface Summary {
  totalTracked: number; inStock: number; lowStock: number; outOfStock: number; totalUnits: number;
}

export default function InventoryPage() {
  const { currentStore } = useSite();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalTracked: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalUnits: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [editStocks, setEditStocks] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const fetchInventory = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter) params.set("filter", filter);
    const res = await api.get<{ products: InventoryProduct[]; summary: Summary }>(`/api/sites/${currentStore.id}/inventory?${params}`);
    if (res.success && res.data) { setProducts(res.data.products || []); setSummary(res.data.summary); }
    setLoading(false);
  }, [currentStore, search, filter]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const startEdit = (p: InventoryProduct) => setEditStocks((prev) => ({ ...prev, [p.id]: p.stock }));
  const cancelEdit = (id: string) => setEditStocks((prev) => { const n = { ...prev }; delete n[id]; return n; });
  const hasEdits = Object.keys(editStocks).length > 0;

  const saveAll = async () => {
    if (!currentStore || !hasEdits) return;
    setSaving(true);
    const updates = Object.entries(editStocks).map(([productId, stock]) => ({ productId, stock }));
    await api.patch(`/api/sites/${currentStore.id}/inventory`, { updates });
    setEditStocks({}); setSaving(false); fetchInventory();
  };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  const statCards = [
    { label: "Total Tracked", value: summary.totalTracked, icon: Package, color: "bg-blue-50 text-blue-600", filterKey: "" },
    { label: "In Stock", value: summary.inStock, icon: CheckCircle2, color: "bg-green-50 text-green-600", filterKey: "" },
    { label: "Low Stock", value: summary.lowStock, icon: AlertTriangle, color: "bg-amber-50 text-amber-600", filterKey: "low_stock" },
    { label: "Out of Stock", value: summary.outOfStock, icon: XCircle, color: "bg-red-50 text-red-600", filterKey: "out_of_stock" },
    { label: "Total Units", value: summary.totalUnits, icon: BarChart3, color: "bg-purple-50 text-purple-600", filterKey: "" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-surface-900 font-display">Inventory</h1><p className="text-sm text-surface-500 mt-1">Track stock levels and manage inventory</p></div>
        {hasEdits && (
          <button onClick={saveAll} disabled={saving} className="btn-primary text-sm py-2.5 px-4">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save {Object.keys(editStocks).length} Changes</>}
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((s) => (
          <button key={s.label} onClick={() => s.filterKey !== undefined ? setFilter(filter === s.filterKey ? "" : s.filterKey) : null}
            className={`rounded-xl border p-4 text-left transition-colors ${filter === s.filterKey && s.filterKey ? "border-brand-500 bg-brand-50" : "border-surface-200 bg-white hover:bg-surface-50"}`}>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="h-4 w-4" /></div>
            <p className="text-lg font-bold text-surface-900 mt-2">{s.value.toLocaleString()}</p>
            <p className="text-xs text-surface-500">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-field py-2.5 pl-9 w-full" />
      </div>

      {/* Product List */}
      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : products.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Package className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No products{filter ? ` matching "${filter}"` : ""}</h3>
          <p className="text-sm text-surface-500">Products with inventory tracking enabled will appear here.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Product</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-surface-500 uppercase">SKU</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-surface-500 uppercase">Stock</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-surface-500 uppercase">Alert At</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {products.map((p) => {
                const isEditing = p.id in editStocks;
                const stockLevel = isEditing ? editStocks[p.id] : p.stock;
                const isLow = p.stock > 0 && p.stock <= p.lowStockAlert;
                const isOut = p.stock <= 0;
                return (
                  <tr key={p.id} className="hover:bg-surface-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-9 w-9 rounded-lg object-cover" /> : <div className="h-9 w-9 rounded-lg bg-surface-100 flex items-center justify-center"><Package className="h-4 w-4 text-surface-400" /></div>}
                        <span className="font-semibold text-surface-900 truncate max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-surface-500 font-mono text-xs">{p.sku || "—"}</td>
                    <td className="px-3 py-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <input type="number" value={stockLevel} min={0} onChange={(e) => setEditStocks((prev) => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))} className="input-field py-1 px-2 w-20 text-center text-sm" />
                          <button onClick={() => cancelEdit(p.id)} className="text-xs text-surface-400 hover:text-surface-600">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(p)} className={`font-bold inline-flex items-center gap-1 ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-surface-900"}`}>
                          {p.stock} <Pencil className="h-3 w-3 text-surface-300" />
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-surface-500">{p.lowStockAlert}</td>
                    <td className="px-3 py-3 text-center">
                      {isOut ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700">Out of Stock</span>
                      : isLow ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Low Stock</span>
                      : <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">In Stock</span>}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-surface-900">${parseFloat(p.price).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
