"use client";
import { ChevronDown, ChevronRight, Loader2, Plus } from "lucide-react";
import { Archive, ArrowDown, BarChart3, Eye, EyeOff, Filter, Layers, MousePointerClick, Pause, Pencil, Play, Search, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface FunnelStep {
  id: string;
  name: string;
  type: string;
  position: number;
  conversionCount: number;
  viewCount: number;
}

interface FunnelItem {
  id: string;
  name: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
  isActive: boolean;
  steps: FunnelStep[];
  createdAt: string;
  stats?: { totalViews: number; totalConversions: number; overallRate: number };
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-surface-100 text-surface-500",
  ACTIVE: "bg-green-50 text-green-700",
  PAUSED: "bg-amber-50 text-amber-700",
  ARCHIVED: "bg-surface-100 text-surface-400",
};

const statusIcons: Record<string, typeof Play> = {
  DRAFT: Pencil, ACTIVE: Play, PAUSED: Pause, ARCHIVED: Archive,
};

const stepTypeLabels: Record<string, string> = {
  LANDING: "Landing Page", LEAD_FORM: "Lead Form", THANK_YOU: "Thank You",
  CHECKOUT: "Checkout", UPSELL: "Upsell", DOWNSELL: "Downsell",
  CONFIRMATION: "Confirmation", WEBINAR: "Webinar", VIDEO: "Video",
};

const stepTypeColors: Record<string, string> = {
  LANDING: "bg-blue-100 text-blue-700", LEAD_FORM: "bg-purple-100 text-purple-700",
  THANK_YOU: "bg-green-100 text-green-700", CHECKOUT: "bg-amber-100 text-amber-700",
  UPSELL: "bg-orange-100 text-orange-700", DOWNSELL: "bg-red-100 text-red-700",
  CONFIRMATION: "bg-emerald-100 text-emerald-700", WEBINAR: "bg-indigo-100 text-indigo-700",
  VIDEO: "bg-pink-100 text-pink-700",
};

export default function FunnelsPage() {
  const { currentStore } = useSite();
  const [funnels, setFunnels] = useState<FunnelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Editor
  const [showEditor, setShowEditor] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<FunnelItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form
  const [funnelName, setFunnelName] = useState("");
  const [funnelDesc, setFunnelDesc] = useState("");

  // Expanded funnel (step editor)
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingStep, setAddingStep] = useState(false);
  const [newStepName, setNewStepName] = useState("");
  const [newStepType, setNewStepType] = useState("LANDING");

  const fetchFunnels = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await api.get<{ funnels: FunnelItem[] }>(`/api/sites/${currentStore.id}/funnels?${params}`);
    if (res.success && res.data) setFunnels(res.data.funnels || []);
    setLoading(false);
  }, [currentStore, search, statusFilter]);

  useEffect(() => { fetchFunnels(); }, [fetchFunnels]);

  const openCreate = () => {
    setFunnelName("");
    setFunnelDesc("");
    setEditingFunnel(null);
    setShowEditor(true);
  };

  const openEdit = (funnel: FunnelItem) => {
    setFunnelName(funnel.name);
    setFunnelDesc(funnel.description || "");
    setEditingFunnel(funnel);
    setShowEditor(true);
  };

  const saveFunnel = async () => {
    if (!currentStore || !funnelName.trim()) return;
    setSaving(true);
    const payload = { name: funnelName.trim(), description: funnelDesc.trim() || undefined };

    if (editingFunnel) {
      const res = await api.patch(`/api/sites/${currentStore.id}/funnels/${editingFunnel.id}`, payload);
      if (res.success) { await fetchFunnels(); setShowEditor(false); }
    } else {
      const res = await api.post(`/api/sites/${currentStore.id}/funnels`, payload);
      if (res.success) { await fetchFunnels(); setShowEditor(false); }
    }
    setSaving(false);
  };

  const deleteFunnel = async (id: string) => {
    if (!currentStore || !confirm("Delete this funnel and all its steps?")) return;
    setDeleteId(id);
    await api.delete(`/api/sites/${currentStore.id}/funnels/${id}`);
    setFunnels((prev) => prev.filter((f) => f.id !== id));
    setDeleteId(null);
  };

  const changeStatus = async (funnel: FunnelItem, newStatus: string) => {
    if (!currentStore) return;
    const res = await api.patch(`/api/sites/${currentStore.id}/funnels/${funnel.id}`, { status: newStatus });
    if (res.success) {
      setFunnels((prev) => prev.map((f) => (f.id === funnel.id ? { ...f, status: newStatus as FunnelItem["status"] } : f)));
    }
  };

  const toggleExpand = async (funnelId: string) => {
    if (expandedId === funnelId) { setExpandedId(null); return; }
    setExpandedId(funnelId);
    // Fetch full funnel with step details
    if (!currentStore) return;
    const res = await api.get<FunnelItem>(`/api/sites/${currentStore.id}/funnels/${funnelId}`);
    if (res.success && res.data) {
      setFunnels((prev) => prev.map((f) => (f.id === funnelId ? { ...f, ...res.data!, steps: (res.data as FunnelItem).steps } : f)));
    }
  };

  const addStep = async (funnelId: string) => {
    if (!currentStore || !newStepName.trim()) return;
    const res = await api.post(`/api/sites/${currentStore.id}/funnels/${funnelId}/steps`, {
      name: newStepName.trim(),
      type: newStepType,
    });
    if (res.success) {
      setNewStepName("");
      setNewStepType("LANDING");
      setAddingStep(false);
      // Refresh funnel
      const updated = await api.get<FunnelItem>(`/api/sites/${currentStore.id}/funnels/${funnelId}`);
      if (updated.success && updated.data) {
        setFunnels((prev) => prev.map((f) => (f.id === funnelId ? { ...f, steps: (updated.data as FunnelItem).steps } : f)));
      }
    }
  };

  const deleteStep = async (funnelId: string, stepId: string) => {
    if (!currentStore || !confirm("Delete this step?")) return;
    await api.delete(`/api/sites/${currentStore.id}/funnels/${funnelId}/steps/${stepId}`);
    setFunnels((prev) =>
      prev.map((f) => (f.id === funnelId ? { ...f, steps: f.steps.filter((s) => s.id !== stepId) } : f))
    );
  };

  if (!currentStore) {
    return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Funnels</h1>
          <p className="text-sm text-surface-500 mt-1">Build conversion funnels to guide visitors from landing to purchase</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-4">
          <Plus className="h-4 w-4" /> New Funnel
        </button>
      </div>

      {/* Filters */}
      {funnels.length > 0 && !showEditor && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search funnels..." className="input-field pl-10 py-2.5 w-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field py-2.5 w-40">
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      )}

      {/* Editor */}
      {showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">{editingFunnel ? "Edit Funnel" : "New Funnel"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Funnel Name *</label>
              <input value={funnelName} onChange={(e) => setFunnelName(e.target.value)} placeholder="Product Launch Funnel" className="input-field py-2.5 w-full" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
              <input value={funnelDesc} onChange={(e) => setFunnelDesc(e.target.value)} placeholder="What this funnel is for..." className="input-field py-2.5 w-full" />
            </div>
          </div>
          {!editingFunnel && (
            <p className="text-xs text-surface-500">A default funnel template (Landing → Lead Form → Thank You) will be created. You can customize steps after.</p>
          )}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={saveFunnel} disabled={saving || !funnelName.trim()} className="btn-primary text-sm py-2.5 px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingFunnel ? "Update Funnel" : "Create Funnel"}
            </button>
            <button onClick={() => setShowEditor(false)} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Funnel List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : funnels.length === 0 && !showEditor ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <Filter className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No funnels yet</h3>
          <p className="text-sm text-surface-500 mb-5">Create funnels to convert visitors into leads and customers.</p>
          <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-5"><Plus className="h-4 w-4" /> Create First Funnel</button>
        </div>
      ) : !showEditor && (
        <div className="space-y-3">
          {funnels.map((funnel) => {
            const isExpanded = expandedId === funnel.id;
            const totalViews = funnel.steps.reduce((s, st) => s + st.viewCount, 0);
            const totalConversions = funnel.steps.reduce((s, st) => s + st.conversionCount, 0);
            const StatusIcon = statusIcons[funnel.status] || Pencil;

            return (
              <div key={funnel.id} className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
                {/* Funnel header */}
                <div className="flex items-center gap-4 px-5 py-4 group">
                  <button onClick={() => toggleExpand(funnel.id)} className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 hover:bg-brand-100 transition-colors">
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-brand-600" /> : <ChevronRight className="h-5 w-5 text-brand-600" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-surface-900">{funnel.name}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusStyles[funnel.status]}`}>
                        <StatusIcon className="h-3 w-3" /> {funnel.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-surface-400 mt-0.5">
                      <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {funnel.steps.length} steps</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {totalViews} views</span>
                      <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> {totalConversions} conversions</span>
                      {totalViews > 0 && (
                        <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> {(totalConversions / totalViews * 100).toFixed(1)}%</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <select
                      value={funnel.status}
                      onChange={(e) => changeStatus(funnel, e.target.value)}
                      className="text-xs border border-surface-200 rounded-lg px-2 py-1.5 bg-white"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active</option>
                      <option value="PAUSED">Paused</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                    <button onClick={() => openEdit(funnel)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteFunnel(funnel.id)} disabled={deleteId === funnel.id} className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600 transition-colors">
                      {deleteId === funnel.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded: Visual funnel steps */}
                {isExpanded && (
                  <div className="border-t border-surface-100 bg-surface-50 p-5">
                    <div className="flex flex-col items-center gap-1">
                      {funnel.steps.map((step, idx) => {
                        const rate = step.viewCount > 0 ? Math.round((step.conversionCount / step.viewCount) * 100) : 0;
                        return (
                          <div key={step.id} className="w-full max-w-lg">
                            <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 group/step">
                              <div className="text-xs font-bold text-surface-300 w-6 text-center">{idx + 1}</div>
                              <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stepTypeColors[step.type] || "bg-surface-100 text-surface-600"}`}>
                                {stepTypeLabels[step.type] || step.type}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-surface-900">{step.name}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-surface-400">
                                <span>{step.viewCount} views</span>
                                <span>{step.conversionCount} conv.</span>
                                {step.viewCount > 0 && <span className="font-semibold text-surface-700">{rate}%</span>}
                              </div>
                              <button
                                onClick={() => deleteStep(funnel.id, step.id)}
                                className="p-1 rounded hover:bg-accent-50 text-surface-300 hover:text-accent-600 opacity-0 group-hover/step:opacity-100 transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {idx < funnel.steps.length - 1 && (
                              <div className="flex justify-center py-1">
                                <ArrowDown className="h-4 w-4 text-surface-300" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add step */}
                    <div className="flex justify-center mt-4">
                      {addingStep && expandedId === funnel.id ? (
                        <div className="flex items-center gap-2 w-full max-w-lg">
                          <input value={newStepName} onChange={(e) => setNewStepName(e.target.value)} placeholder="Step name..." className="input-field py-2 text-sm flex-1" autoFocus />
                          <select value={newStepType} onChange={(e) => setNewStepType(e.target.value)} className="input-field py-2 text-sm w-36">
                            {Object.entries(stepTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                          <button onClick={() => addStep(funnel.id)} disabled={!newStepName.trim()} className="btn-primary text-xs py-2 px-3">Add</button>
                          <button onClick={() => { setAddingStep(false); setNewStepName(""); }} className="btn-secondary text-xs py-2 px-3">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setAddingStep(true)} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                          <Plus className="h-3.5 w-3.5" /> Add Step
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
