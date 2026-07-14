"use client";
import { Loader2, Plus } from "lucide-react";
import { Pencil, Receipt, Star, ToggleLeft, ToggleRight, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface TaxRule {
  id: string; name: string; rate: string; country: string | null;
  state: string | null; isDefault: boolean; isActive: boolean; createdAt: string;
}

export default function TaxesPage() {
  const { currentStore } = useSite();
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const fetchRules = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ rules: TaxRule[] }>(`/api/sites/${currentStore.id}/taxes`);
    if (res.success && res.data) setRules(res.data.rules || []);
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const resetForm = () => { setName(""); setRate(""); setCountry(""); setState(""); setIsDefault(false); setEditingId(null); };

  const openEdit = (r: TaxRule) => {
    setName(r.name); setRate(parseFloat(r.rate).toString()); setCountry(r.country || ""); setState(r.state || "");
    setIsDefault(r.isDefault); setEditingId(r.id); setShowEditor(true);
  };

  const saveRule = async () => {
    if (!currentStore || !name.trim() || !rate) return;
    setSaving(true);
    const payload = { name: name.trim(), rate: parseFloat(rate), country: country.trim() || null, state: state.trim() || null, isDefault };
    if (editingId) await api.patch(`/api/sites/${currentStore.id}/taxes/${editingId}`, payload);
    else await api.post(`/api/sites/${currentStore.id}/taxes`, payload);
    setShowEditor(false); resetForm(); setSaving(false); fetchRules();
  };

  const deleteRule = async (id: string) => {
    if (!currentStore || !confirm("Delete this tax rule?")) return;
    setDeleteId(id); await api.delete(`/api/sites/${currentStore.id}/taxes/${id}`);
    setRules((p) => p.filter((r) => r.id !== id)); setDeleteId(null);
  };

  const toggleActive = async (r: TaxRule) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/taxes/${r.id}`, { isActive: !r.isActive });
    setRules((p) => p.map((x) => (x.id === r.id ? { ...x, isActive: !x.isActive } : x)));
  };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-surface-900 font-display">Tax Rules</h1><p className="text-sm text-surface-500 mt-1">Configure tax rates by region</p></div>
        <button onClick={() => { resetForm(); setShowEditor(true); }} className="btn-primary text-sm py-2.5 px-4"><Plus className="h-4 w-4" /> New Tax Rule</button>
      </div>

      {showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">{editingId ? "Edit" : "New"} Tax Rule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Name *</label><input value={name} onChange={(e) => setName(e.target.value)} className="input-field py-2.5 w-full" placeholder="VAT Standard" autoFocus /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Rate (%) *</label><input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="input-field py-2.5 w-full" placeholder="15" step="0.01" min="0" max="100" /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Country (2-letter code)</label><input value={country} onChange={(e) => setCountry(e.target.value)} className="input-field py-2.5 w-full" placeholder="US" maxLength={2} /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">State/Region</label><input value={state} onChange={(e) => setState(e.target.value)} className="input-field py-2.5 w-full" placeholder="CA" /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
            <span className="text-sm text-surface-700">Set as default tax rule</span>
          </label>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={saveRule} disabled={saving || !name.trim() || !rate} className="btn-primary text-sm py-2.5 px-6">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}</button>
            <button onClick={() => { setShowEditor(false); resetForm(); }} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : rules.length === 0 && !showEditor ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Receipt className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No tax rules yet</h3>
          <p className="text-sm text-surface-500 mb-5">Set up tax rates for your products by region.</p>
          <button onClick={() => { resetForm(); setShowEditor(true); }} className="btn-primary text-sm py-2.5 px-5"><Plus className="h-4 w-4" /> Create First Rule</button>
        </div>
      ) : !showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
          {rules.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 group">
              <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0"><Receipt className="h-5 w-5 text-teal-600" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-surface-900">{r.name}</h3>
                  <span className="text-sm font-bold text-brand-600">{parseFloat(r.rate).toFixed(2)}%</span>
                  {r.isDefault && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex items-center gap-0.5"><Star className="h-3 w-3" /> Default</span>}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.isActive ? "bg-green-50 text-green-700" : "bg-surface-100 text-surface-500"}`}>{r.isActive ? "Active" : "Inactive"}</span>
                </div>
                <div className="text-xs text-surface-400 mt-0.5">
                  {r.country && <span>Country: {r.country}</span>}{r.state && <span> · State: {r.state}</span>}{!r.country && !r.state && <span>All regions</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleActive(r)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700">
                  {r.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
                <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteRule(r.id)} disabled={deleteId === r.id} className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600">
                  {deleteId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
