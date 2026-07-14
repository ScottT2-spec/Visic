"use client";
import { Loader2, Plus } from "lucide-react";
import { BarChart3, Eye, EyeOff, Layers, Monitor, MousePointerClick, Pencil, Smartphone, Tablet, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface PopupItem {
  id: string; name: string; type: string;
  trigger: { type: string; config?: Record<string, unknown> } | null;
  displayRules: { pages?: string[]; frequency?: string; devices?: string[] } | null;
  isActive: boolean; views: number; conversions: number; createdAt: string;
}

const typeLabels: Record<string, string> = { MODAL: "Modal", BANNER: "Banner", SLIDE_IN: "Slide-in", FULL_SCREEN: "Full Screen", COUNTDOWN: "Countdown", NOTIFICATION_BAR: "Notification Bar" };
const triggerLabels: Record<string, string> = { exit_intent: "Exit Intent", scroll: "Scroll", time_delay: "Time Delay", click: "Click", page_load: "Page Load" };

export default function PopupsPage() {
  const { currentStore } = useSite();
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("MODAL");
  const [triggerType, setTriggerType] = useState("page_load");
  const [frequency, setFrequency] = useState("session");
  const [devices, setDevices] = useState<string[]>(["desktop", "mobile", "tablet"]);

  const fetchPopups = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ popups: PopupItem[] }>(`/api/sites/${currentStore.id}/popups`);
    if (res.success && res.data) setPopups(res.data.popups || []);
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchPopups(); }, [fetchPopups]);

  const resetForm = () => { setName(""); setType("MODAL"); setTriggerType("page_load"); setFrequency("session"); setDevices(["desktop", "mobile", "tablet"]); setEditingId(null); };

  const openEdit = (p: PopupItem) => {
    setName(p.name); setType(p.type); setTriggerType(p.trigger?.type || "page_load");
    setFrequency(p.displayRules?.frequency || "session"); setDevices(p.displayRules?.devices || ["desktop", "mobile", "tablet"]);
    setEditingId(p.id); setShowEditor(true);
  };

  const savePopup = async () => {
    if (!currentStore || !name.trim()) return;
    setSaving(true);
    const payload = { name: name.trim(), type, trigger: { type: triggerType }, displayRules: { frequency, devices } };
    if (editingId) await api.patch(`/api/sites/${currentStore.id}/popups/${editingId}`, payload);
    else await api.post(`/api/sites/${currentStore.id}/popups`, payload);
    setShowEditor(false); resetForm(); setSaving(false); fetchPopups();
  };

  const deletePopup = async (id: string) => {
    if (!currentStore || !confirm("Delete this popup?")) return;
    setDeleteId(id); await api.delete(`/api/sites/${currentStore.id}/popups/${id}`);
    setPopups((p) => p.filter((x) => x.id !== id)); setDeleteId(null);
  };

  const toggleActive = async (p: PopupItem) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/popups/${p.id}`, { isActive: !p.isActive });
    setPopups((prev) => prev.map((x) => (x.id === p.id ? { ...x, isActive: !x.isActive } : x)));
  };

  const toggleDevice = (d: string) => setDevices((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-surface-900 font-display">Popups</h1><p className="text-sm text-surface-500 mt-1">Create popups to capture leads and boost conversions</p></div>
        <button onClick={() => { resetForm(); setShowEditor(true); }} className="btn-primary text-sm py-2.5 px-4"><Plus className="h-4 w-4" /> New Popup</button>
      </div>

      {showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">{editingId ? "Edit" : "New"} Popup</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Name *</label><input value={name} onChange={(e) => setName(e.target.value)} className="input-field py-2.5 w-full" autoFocus /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input-field py-2.5 w-full">{Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Trigger</label>
              <select value={triggerType} onChange={(e) => setTriggerType(e.target.value)} className="input-field py-2.5 w-full">{Object.entries(triggerLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="input-field py-2.5 w-full"><option value="once">Once</option><option value="session">Per Session</option><option value="always">Always</option></select></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Devices</label>
              <div className="flex gap-2 mt-1">
                {[{k: "desktop", icon: Monitor, l: "Desktop"}, {k: "mobile", icon: Smartphone, l: "Mobile"}, {k: "tablet", icon: Tablet, l: "Tablet"}].map(({k, icon: I, l}) => (
                  <button key={k} onClick={() => toggleDevice(k)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-colors ${devices.includes(k) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-200 text-surface-500"}`}><I className="h-3.5 w-3.5" /> {l}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={savePopup} disabled={saving || !name.trim()} className="btn-primary text-sm py-2.5 px-6">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}</button>
            <button onClick={() => { setShowEditor(false); resetForm(); }} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : popups.length === 0 && !showEditor ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Layers className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No popups yet</h3>
          <p className="text-sm text-surface-500 mb-5">Create popups to engage visitors and capture leads.</p>
          <button onClick={() => { resetForm(); setShowEditor(true); }} className="btn-primary text-sm py-2.5 px-5"><Plus className="h-4 w-4" /> Create First Popup</button>
        </div>
      ) : !showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
          {popups.map((p) => {
            const rate = p.views > 0 ? (p.conversions / p.views * 100).toFixed(1) : "0.0";
            return (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 group">
                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0"><Layers className="h-5 w-5 text-purple-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-surface-900">{p.name}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">{typeLabels[p.type]}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-50 text-green-700" : "bg-surface-100 text-surface-500"}`}>{p.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                    <span>{triggerLabels[p.trigger?.type || ""] || "No trigger"}</span>
                    <span><Eye className="h-3 w-3 inline" /> {p.views} views</span>
                    <span><MousePointerClick className="h-3 w-3 inline" /> {p.conversions} conv.</span>
                    <span><BarChart3 className="h-3 w-3 inline" /> {rate}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleActive(p)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700">{p.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deletePopup(p.id)} disabled={deleteId === p.id} className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600">
                    {deleteId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
