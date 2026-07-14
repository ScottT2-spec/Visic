"use client";
import { Loader2, Plus } from "lucide-react";
import { Activity, BarChart3, CheckCircle2, Eye, MousePointerClick, Pause, Pencil, Play, Trash2, Trophy } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface Variant { id: string; name: string; content?: unknown; weight: number; }
interface ABTestItem {
  id: string; name: string; status: string; pageId: string | null;
  page: { id: string; title: string; slug: string } | null;
  variants: Variant[]; winnerVariantId: string | null;
  startsAt: string | null; endsAt: string | null; createdAt: string;
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-surface-100 text-surface-500", RUNNING: "bg-green-50 text-green-700",
  PAUSED: "bg-amber-50 text-amber-700", COMPLETED: "bg-blue-50 text-blue-700",
};

export default function ABTestsPage() {
  const { currentStore } = useSite();
  const [tests, setTests] = useState<ABTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [variants, setVariants] = useState<Array<{ id: string; name: string; weight: number }>>([
    { id: "a", name: "Variant A", weight: 50 }, { id: "b", name: "Variant B", weight: 50 },
  ]);

  const fetchTests = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ tests: ABTestItem[] }>(`/api/sites/${currentStore.id}/ab-tests`);
    if (res.success && res.data) setTests(res.data.tests || []);
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const resetForm = () => {
    setName(""); setVariants([{ id: "a", name: "Variant A", weight: 50 }, { id: "b", name: "Variant B", weight: 50 }]); setEditingId(null);
  };

  const openEdit = (t: ABTestItem) => {
    setName(t.name); setVariants(t.variants.map((v) => ({ id: v.id, name: v.name, weight: v.weight })));
    setEditingId(t.id); setShowEditor(true);
  };

  const saveTest = async () => {
    if (!currentStore || !name.trim() || variants.length < 2) return;
    setSaving(true);
    const payload = { name: name.trim(), variants };
    if (editingId) await api.patch(`/api/sites/${currentStore.id}/ab-tests/${editingId}`, payload);
    else await api.post(`/api/sites/${currentStore.id}/ab-tests`, payload);
    setShowEditor(false); resetForm(); setSaving(false); fetchTests();
  };

  const deleteTest = async (id: string) => {
    if (!currentStore || !confirm("Delete this A/B test?")) return;
    setDeleteId(id); await api.delete(`/api/sites/${currentStore.id}/ab-tests/${id}`);
    setTests((p) => p.filter((t) => t.id !== id)); setDeleteId(null);
  };

  const changeStatus = async (id: string, status: string) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/ab-tests/${id}`, { status });
    fetchTests();
  };

  const addVariant = () => {
    const letter = String.fromCharCode(97 + variants.length);
    setVariants((v) => [...v, { id: letter, name: `Variant ${letter.toUpperCase()}`, weight: Math.floor(100 / (variants.length + 1)) }]);
  };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-surface-900 font-display">A/B Testing</h1><p className="text-sm text-surface-500 mt-1">Split test pages and content to optimize conversions</p></div>
        <button onClick={() => { resetForm(); setShowEditor(true); }} className="btn-primary text-sm py-2.5 px-4"><Plus className="h-4 w-4" /> New Test</button>
      </div>

      {showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">{editingId ? "Edit" : "New"} A/B Test</h3>
          <div><label className="block text-sm font-medium text-surface-700 mb-1">Test Name *</label><input value={name} onChange={(e) => setName(e.target.value)} className="input-field py-2.5 w-full" placeholder="Homepage Hero Test" autoFocus /></div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Variants</label>
            {variants.map((v, idx) => (
              <div key={idx} className="flex items-center gap-3 mb-2">
                <input value={v.name} onChange={(e) => { const vs = [...variants]; vs[idx] = { ...vs[idx], name: e.target.value }; setVariants(vs); }} className="input-field py-2 text-sm flex-1" placeholder="Variant name" />
                <div className="flex items-center gap-1">
                  <input type="number" value={v.weight} min={0} max={100} onChange={(e) => { const vs = [...variants]; vs[idx] = { ...vs[idx], weight: parseInt(e.target.value) || 0 }; setVariants(vs); }} className="input-field py-2 text-sm w-20 text-center" />
                  <span className="text-xs text-surface-400">%</span>
                </div>
                {variants.length > 2 && <button onClick={() => setVariants((v) => v.filter((_, i) => i !== idx))} className="text-surface-400 hover:text-accent-600"><Trash2 className="h-4 w-4" /></button>}
              </div>
            ))}
            <button onClick={addVariant} className="text-xs text-brand-600 hover:text-brand-700 font-medium mt-1"><Plus className="h-3.5 w-3.5 inline" /> Add Variant</button>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={saveTest} disabled={saving || !name.trim() || variants.length < 2} className="btn-primary text-sm py-2.5 px-6">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}</button>
            <button onClick={() => { setShowEditor(false); resetForm(); }} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : tests.length === 0 && !showEditor ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Activity className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No A/B tests yet</h3>
          <p className="text-sm text-surface-500 mb-5">Create split tests to find what converts best.</p>
          <button onClick={() => { resetForm(); setShowEditor(true); }} className="btn-primary text-sm py-2.5 px-5"><Plus className="h-4 w-4" /> Create First Test</button>
        </div>
      ) : !showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
          {tests.map((t) => {
            const winner = t.winnerVariantId ? t.variants.find((v) => v.id === t.winnerVariantId) : null;
            return (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 group">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0"><Activity className="h-5 w-5 text-indigo-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-surface-900">{t.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[t.status] || "bg-surface-100 text-surface-500"}`}>{t.status}</span>
                    {winner && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex items-center gap-0.5"><Trophy className="h-3 w-3" /> {winner.name}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-surface-400 mt-0.5">
                    <span>{t.variants.length} variants</span>
                    {t.page && <span>· Page: {t.page.title}</span>}
                    <span>· {t.variants.map((v) => `${v.name} (${v.weight}%)`).join(" vs ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t.status === "DRAFT" && <button onClick={() => changeStatus(t.id, "RUNNING")} className="p-2 rounded-lg hover:bg-green-50 text-surface-400 hover:text-green-600"><Play className="h-4 w-4" /></button>}
                  {t.status === "RUNNING" && <button onClick={() => changeStatus(t.id, "PAUSED")} className="p-2 rounded-lg hover:bg-amber-50 text-surface-400 hover:text-amber-600"><Pause className="h-4 w-4" /></button>}
                  {t.status === "PAUSED" && <button onClick={() => changeStatus(t.id, "RUNNING")} className="p-2 rounded-lg hover:bg-green-50 text-surface-400 hover:text-green-600"><Play className="h-4 w-4" /></button>}
                  <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteTest(t.id)} disabled={deleteId === t.id} className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600">
                    {deleteId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
