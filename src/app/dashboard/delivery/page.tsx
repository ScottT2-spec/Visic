"use client";
import { Loader2, Plus } from "lucide-react";
import { MapPin, Pencil, ToggleLeft, ToggleRight, Trash2, Truck } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";
import { useRouter } from "next/navigation";

interface DeliveryZone {
  id: string;
  name: string;
  areas: string[];
  fee: number;
  freeAbove: number | null;
  estimatedDays: string | null;
  isActive: boolean;
  position: number;
}

export default function DeliveryPage() {
  const { currentStore } = useSite();
  const router = useRouter();
  const { prefillData, clearPrefill, isFromAI } = useAIPrefill("delivery_zone");
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", areas: "", fee: "", freeAbove: "", estimatedDays: "", isActive: true });

  const currency = currentStore?.currency || "NGN";

  const fetchZones = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<any>(`/api/sites/${currentStore.id}/delivery-zones`);
    if (res.success && res.data) {
      setZones(Array.isArray(res.data) ? res.data : res.data.deliveryZones || []);
    }
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchZones(); }, [fetchZones]);

  // AI prefill
  useEffect(() => {
    if (prefillData && isFromAI) {
      const d = prefillData as any;
      setForm((prev) => ({
        ...prev,
        name: d.name || prev.name,
        areas: Array.isArray(d.areas) ? d.areas.join(", ") : d.areas || prev.areas,
        fee: d.fee != null ? String(d.fee) : prev.fee,
        freeAbove: d.freeAbove != null ? String(d.freeAbove) : prev.freeAbove,
        estimatedDays: d.estimatedDays || prev.estimatedDays,
        isActive: d.isActive ?? prev.isActive,
      }));
      setShowForm(true);
    }
  }, [prefillData, isFromAI]);

  const resetForm = () => {
    setForm({ name: "", areas: "", fee: "", freeAbove: "", estimatedDays: "", isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (z: DeliveryZone) => {
    setForm({
      name: z.name,
      areas: z.areas.join(", "),
      fee: String(z.fee),
      freeAbove: z.freeAbove ? String(z.freeAbove) : "",
      estimatedDays: z.estimatedDays || "",
      isActive: z.isActive,
    });
    setEditingId(z.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!currentStore || !form.name.trim()) return;
    setSaving(true);
    const body = {
      name: form.name,
      areas: form.areas.split(",").map((a) => a.trim()).filter(Boolean),
      fee: parseFloat(form.fee) || 0,
      freeAbove: form.freeAbove ? parseFloat(form.freeAbove) : null,
      estimatedDays: form.estimatedDays || null,
      isActive: form.isActive,
    };
    if (editingId) {
      await api.patch(`/api/sites/${currentStore.id}/delivery-zones`, { id: editingId, ...body });
    } else {
      await api.post(`/api/sites/${currentStore.id}/delivery-zones`, body);
    }
    setSaving(false);
    resetForm();
    fetchZones();
    if (isFromAI) { clearPrefill(); router.push("/dashboard/ai"); }
  };

  const handleDelete = async (id: string) => {
    if (!currentStore || !confirm("Delete this delivery zone?")) return;
    await api.delete(`/api/sites/${currentStore.id}/delivery-zones?id=${id}`);
    setZones((prev) => prev.filter((z) => z.id !== id));
  };

  const toggleActive = async (z: DeliveryZone) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/delivery-zones`, { id: z.id, isActive: !z.isActive });
    setZones((prev) => prev.map((x) => x.id === z.id ? { ...x, isActive: !x.isActive } : x));
  };

  return (
    <div className="p-6 space-y-6">
      {isFromAI && <AIPrefillBanner entityType="delivery zone" onDiscard={() => { clearPrefill(); resetForm(); }} />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Delivery Zones</h1>
          <p className="text-sm text-surface-500 mt-1">Set up delivery areas and fees for your store</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm py-2.5 px-4">
          <Plus className="h-4 w-4" /> Add Zone
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <h3 className="text-sm font-bold text-surface-900 mb-3">{editingId ? "Edit Zone" : "New Delivery Zone"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Zone name (e.g. Lagos Mainland)" className="input-field py-2.5" autoFocus />
            <input value={form.areas} onChange={(e) => setForm({ ...form, areas: e.target.value })} placeholder="Areas (comma-separated: Ikeja, Surulere, Yaba)" className="input-field py-2.5" />
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">Delivery Fee</label>
              <input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} placeholder="0" className="input-field py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">Free delivery above (optional)</label>
              <input type="number" value={form.freeAbove} onChange={(e) => setForm({ ...form, freeAbove: e.target.value })} placeholder="e.g. 50000" className="input-field py-2.5" />
            </div>
            <input value={form.estimatedDays} onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })} placeholder="Estimated days (e.g. 1-2 days)" className="input-field py-2.5" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} disabled={saving || !form.name.trim()} className="btn-primary text-sm py-2.5 px-5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}
            </button>
            <button onClick={resetForm} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : zones.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <Truck className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No delivery zones yet</h3>
          <p className="text-sm text-surface-500 mb-5">Set up delivery areas so customers know their shipping options.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2.5 px-5">
            <Plus className="h-4 w-4" /> Add First Zone
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zones.map((z) => (
            <div key={z.id} className={`rounded-2xl border bg-white p-5 transition-colors ${z.isActive ? "border-surface-200" : "border-surface-100 opacity-60"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900">{z.name}</h3>
                    <p className="text-xs text-surface-400">{z.areas.length} area{z.areas.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(z)} className="p-1.5 rounded-lg hover:bg-surface-100">
                    {z.isActive ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-surface-400" />}
                  </button>
                  <button onClick={() => startEdit(z)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(z.id)} className="p-1.5 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {z.areas.map((area) => (
                  <span key={area} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-100 text-surface-600">{area}</span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-surface-500">
                <span className="font-semibold text-surface-900">{formatCurrency(Number(z.fee), currency)}</span>
                {z.freeAbove && <span>Free above {formatCurrency(Number(z.freeAbove), currency)}</span>}
                {z.estimatedDays && <span>📦 {z.estimatedDays}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
