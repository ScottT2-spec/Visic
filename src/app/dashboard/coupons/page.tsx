"use client";
import { Check, Loader2, Plus } from "lucide-react";
import { Copy, Pencil, Tag, ToggleLeft, ToggleRight, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import AIFormBridge from "@/components/dashboard/AIFormBridge";
import { useAIPrefill } from "@/hooks/useAIPrefill";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function CouponsPage() {
  const { currentStore } = useSite();
  const { prefill: aiPrefill, isAIPrefilled, onSaveComplete } = useAIPrefill("coupons");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "", type: "PERCENTAGE" as Coupon["type"], value: 10,
    minOrderAmount: "", maxUses: "", expiresAt: "", isActive: true,
  });

  const currency = currentStore?.currency || "NGN";

  const fetchCoupons = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<any>(`/api/sites/${currentStore.id}/coupons`);
    if (res.success && res.data) {
      setCoupons(Array.isArray(res.data) ? res.data : res.data.coupons || []);
    }
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  // AI prefill
  useEffect(() => {
    if (!aiPrefill || aiPrefill._action !== "create") return;
    setForm({
      code: (aiPrefill.code as string) || "",
      type: (aiPrefill.type as Coupon["type"]) || "PERCENTAGE",
      value: (aiPrefill.value as number) || 10,
      minOrderAmount: aiPrefill.minOrderAmount ? String(aiPrefill.minOrderAmount) : "",
      maxUses: aiPrefill.maxUses ? String(aiPrefill.maxUses) : "",
      expiresAt: aiPrefill.expiresAt ? (aiPrefill.expiresAt as string).slice(0, 10) : "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(true);
  }, [aiPrefill]);

  const resetForm = () => {
    setForm({ code: "", type: "PERCENTAGE", value: 10, minOrderAmount: "", maxUses: "", expiresAt: "", isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (c: Coupon) => {
    setForm({
      code: c.code, type: c.type, value: Number(c.value),
      minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : "",
      maxUses: c.maxUses ? String(c.maxUses) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      isActive: c.isActive,
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm((f) => ({ ...f, code }));
  };

  const handleSave = async () => {
    if (!currentStore || !form.code.trim()) return;
    setSaving(true);
    const body = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: form.value,
      minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      isActive: form.isActive,
    };
    if (editingId) {
      await api.patch(`/api/sites/${currentStore.id}/coupons`, { id: editingId, ...body });
    } else {
      await api.post(`/api/sites/${currentStore.id}/coupons`, body);
    }
    setSaving(false);
    if (isAIPrefilled) {
      onSaveComplete(editingId ? "Coupon updated!" : "Coupon created!");
      return;
    }
    resetForm();
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!currentStore || !confirm("Delete this coupon?")) return;
    await api.delete(`/api/sites/${currentStore.id}/coupons?id=${id}`);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleActive = async (c: Coupon) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/coupons`, { id: c.id, isActive: !c.isActive });
    setCoupons((prev) => prev.map((x) => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const formatValue = (c: Coupon) => {
    if (c.type === "PERCENTAGE") return `${c.value}% off`;
    if (c.type === "FREE_SHIPPING") return "Free shipping";
    return `${formatCurrency(Number(c.value), currency)} off`;
  };

  return (
    <div className="p-6 space-y-6">
      <AIFormBridge page="coupons" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Coupons</h1>
          <p className="text-sm text-surface-500 mt-1">Create discount codes for your customers</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); generateCode(); }} className="btn-primary text-sm py-2.5 px-4">
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <h3 className="text-sm font-bold text-surface-900 mb-3">{editingId ? "Edit Coupon" : "New Coupon"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE" className="input-field py-2.5 font-mono uppercase" autoFocus />
              <button onClick={generateCode} className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-brand-600 font-semibold hover:text-brand-700">Generate</button>
            </div>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Coupon["type"] })} className="input-field py-2.5">
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>
            {form.type !== "FREE_SHIPPING" && (
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                placeholder={form.type === "PERCENTAGE" ? "Discount %" : "Amount"} className="input-field py-2.5" />
            )}
            <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="Min order amount (optional)" className="input-field py-2.5" />
            <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Max uses (optional)" className="input-field py-2.5" />
            <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="input-field py-2.5" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} disabled={saving || !form.code.trim()} className="btn-primary text-sm py-2.5 px-5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}
            </button>
            <button onClick={resetForm} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <Tag className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No coupons yet</h3>
          <p className="text-sm text-surface-500 mb-5">Create discount codes to boost sales.</p>
          <button onClick={() => { setShowForm(true); generateCode(); }} className="btn-primary text-sm py-2.5 px-5">
            <Plus className="h-4 w-4" /> Create First Coupon
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Code</th>
                <th className="px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Discount</th>
                <th className="px-5 py-3 text-xs font-semibold text-surface-500 uppercase hidden sm:table-cell">Usage</th>
                <th className="px-5 py-3 text-xs font-semibold text-surface-500 uppercase hidden md:table-cell">Expires</th>
                <th className="px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-surface-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {coupons.map((c) => {
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                return (
                  <tr key={c.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <button onClick={() => copyCode(c.code)} className="flex items-center gap-1.5 font-mono text-sm font-bold text-surface-900 hover:text-brand-600">
                        {c.code}
                        {copied === c.code ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-surface-400" />}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-surface-700">{formatValue(c)}</td>
                    <td className="px-5 py-3.5 text-sm text-surface-500 hidden sm:table-cell">
                      {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""} used
                    </td>
                    <td className="px-5 py-3.5 text-sm hidden md:table-cell">
                      {c.expiresAt ? (
                        <span className={expired ? "text-accent-600" : "text-surface-500"}>
                          {expired ? "Expired" : new Date(c.expiresAt).toLocaleDateString()}
                        </span>
                      ) : <span className="text-surface-400">Never</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => toggleActive(c)} className="flex items-center gap-1.5">
                        {c.isActive && !expired ? (
                          <><ToggleRight className="h-5 w-5 text-green-600" /><span className="text-xs font-semibold text-green-700">Active</span></>
                        ) : (
                          <><ToggleLeft className="h-5 w-5 text-surface-400" /><span className="text-xs font-semibold text-surface-500">Inactive</span></>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(c)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
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
