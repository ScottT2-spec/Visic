"use client";
import { Loader2, Plus, X } from "lucide-react";
import { Calendar, Clock, Package, Percent, ToggleLeft, ToggleRight, Trash2, Zap } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";
import { useRouter } from "next/navigation";

interface FlashSale {
  id: string;
  name: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  maxUses?: number;
  usedCount: number;
  products: { id: string; product: { id: string; name: string; slug: string; price: number; images: { url: string }[] } }[];
  _count: { products: number };
}

interface Product { id: string; name: string; price: number }

export default function FlashSalesPage() {
  const { currentStore } = useSite();
  const router = useRouter();
  const { prefillData, clearPrefill, isFromAI } = useAIPrefill("flash_sale");
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: "", description: "", discountType: "PERCENTAGE" as const, discountValue: 20,
    startsAt: "", endsAt: "", maxUses: "", productIds: [] as string[],
  });

  const currency = currentStore?.currency || "GHS";
  const symbol = currency === "GHS" ? "GH₵" : currency === "GHS" ? "₵" : currency;

  const load = useCallback(async () => {
    if (!currentStore) return;
    const res = await api.get<FlashSale[]>(`/api/sites/${currentStore.id}/flash-sales`);
    if (res.success && res.data) setSales(res.data);
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { load(); }, [load]);

  // AI prefill
  useEffect(() => {
    if (prefillData && isFromAI) {
      const d = prefillData as any;
      setForm((prev) => ({
        ...prev,
        name: d.name || prev.name,
        description: d.description || prev.description,
        discountType: d.discountType || prev.discountType,
        discountValue: d.discountValue ?? prev.discountValue,
        startsAt: d.startsAt ? String(d.startsAt).slice(0, 16) : prev.startsAt,
        endsAt: d.endsAt ? String(d.endsAt).slice(0, 16) : prev.endsAt,
        maxUses: d.maxUses ? String(d.maxUses) : prev.maxUses,
        productIds: d.productIds || prev.productIds,
      }));
      setShowCreate(true);
      loadProducts();
    }
  }, [prefillData, isFromAI]);

  const loadProducts = async () => {
    if (!currentStore) return;
    const res = await api.get<any>(`/api/sites/${currentStore.id}/products?limit=100`);
    if (res.success && res.data) {
      setProducts(Array.isArray(res.data) ? res.data : res.data.products || []);
    }
  };

  const create = async () => {
    if (!currentStore) return;
    setSaving(true);
    await api.post(`/api/sites/${currentStore.id}/flash-sales`, {
      ...form,
      discountValue: Number(form.discountValue),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
    });
    await load();
    setSaving(false);
    setShowCreate(false);
    setForm({ name: "", description: "", discountType: "PERCENTAGE", discountValue: 20, startsAt: "", endsAt: "", maxUses: "", productIds: [] });
    if (isFromAI) { clearPrefill(); router.push("/dashboard/ai"); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/flash-sales/${id}`, { isActive: !isActive });
    await load();
  };

  const deleteSale = async (id: string) => {
    if (!currentStore) return;
    await api.delete(`/api/sites/${currentStore.id}/flash-sales/${id}`);
    await load();
  };

  const now = new Date();
  const getStatus = (sale: FlashSale) => {
    if (!sale.isActive) return { label: "Paused", color: "bg-surface-100 text-surface-500" };
    if (new Date(sale.endsAt) < now) return { label: "Ended", color: "bg-surface-100 text-surface-500" };
    if (new Date(sale.startsAt) > now) return { label: "Scheduled", color: "bg-blue-50 text-blue-700" };
    return { label: "Live", color: "bg-green-50 text-green-700" };
  };

  if (loading) return (
    <>
      <DashboardHeader title="Flash Sales" subtitle="Create time-limited deals" />
      <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
    </>
  );

  return (
    <>
      <DashboardHeader title="Flash Sales" subtitle="Create urgency with time-limited deals" action={{ label: "New Flash Sale", onClick: () => { setShowCreate(true); loadProducts(); } }} />
      <div className="p-6 space-y-6">
        {isFromAI && <AIPrefillBanner entityType="flash sale" onDiscard={() => { clearPrefill(); setShowCreate(false); setForm({ name: "", description: "", discountType: "PERCENTAGE", discountValue: 20, startsAt: "", endsAt: "", maxUses: "", productIds: [] }); }} />}
        {sales.length === 0 ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-surface-900 font-display mb-2">No Flash Sales Yet</h2>
            <p className="text-sm text-surface-500 max-w-md mx-auto mb-6">Create time-limited discounts to drive urgency and boost sales. Add a countdown timer to your storefront!</p>
            <button onClick={() => { setShowCreate(true); loadProducts(); }} className="btn-primary"><Zap className="h-4 w-4" /> Create Flash Sale</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sales.map((sale) => {
              const status = getStatus(sale);
              return (
                <div key={sale.id} className="rounded-2xl border border-surface-200 bg-white p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-surface-900">{sale.name}</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold mt-1 ${status.color}`}>{status.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleActive(sale.id, sale.isActive)} className="p-1 text-surface-400 hover:text-brand-600">
                        {sale.isActive ? <ToggleRight className="h-5 w-5 text-brand-600" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                      <button onClick={() => deleteSale(sale.id)} className="p-1 text-surface-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-surface-600">
                    <div className="flex items-center gap-2">
                      <Percent className="h-3.5 w-3.5 text-surface-400" />
                      <span>{sale.discountValue}{sale.discountType === "PERCENTAGE" ? "%" : ` ${symbol}`} off</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-surface-400" />
                      <span>{sale._count.products} product{sale._count.products !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-surface-400" />
                      <span>{new Date(sale.startsAt).toLocaleDateString()} → {new Date(sale.endsAt).toLocaleDateString()}</span>
                    </div>
                    {sale.maxUses && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-surface-400" />
                        <span>{sale.usedCount}/{sale.maxUses} used</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-surface-900 font-display">New Flash Sale</h2>
              <button onClick={() => setShowCreate(false)} className="text-surface-400 hover:text-surface-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1.5">Sale Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Weekend Flash Sale" className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Discount Type</label>
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as any })} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed ({symbol})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Discount Value</label>
                  <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Starts At</label>
                  <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Ends At</label>
                  <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1.5">Max Uses (optional)</label>
                <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Unlimited" className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1.5">Products (select which products to include)</label>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-surface-200 p-2 space-y-1">
                  {products.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.productIds.includes(p.id)}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            productIds: e.target.checked ? [...form.productIds, p.id] : form.productIds.filter((id) => id !== p.id),
                          });
                        }}
                        className="rounded text-brand-600"
                      />
                      <span className="text-xs text-surface-700">{p.name}</span>
                    </label>
                  ))}
                  {products.length === 0 && <p className="text-xs text-surface-400 text-center py-2">No products found</p>}
                </div>
              </div>
              <button onClick={create} disabled={!form.name || !form.startsAt || !form.endsAt || saving} className="w-full btn-primary py-2.5 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Flash Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
