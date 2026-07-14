"use client";
import { Loader2, Plus, X } from "lucide-react";
import { Bot, CheckCircle2, Puzzle, Trash2, XCircle } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";

interface Plugin {
  id: string; name: string; slug: string; description: string | null; category: string; author: string;
  version: string; isPremium: boolean; isActive: boolean; isAIGenerated: boolean; reviewStatus: string; installs: number; createdAt: string;
}

export default function AdminPluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", category: "payments", author: "AfroStore", version: "1.0.0", isPremium: false });

  const fetchPlugins = useCallback(async () => {
    setLoading(true);
    const res = await api.get<Plugin[]>("/api/admin/plugins");
    if (res.success && res.data) setPlugins(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPlugins(); }, [fetchPlugins]);

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const res = await api.post("/api/admin/plugins", { ...form, slug, permissions: [] });
    if (res.success) { fetchPlugins(); setShowForm(false); setForm({ name: "", slug: "", description: "", category: "payments", author: "AfroStore", version: "1.0.0", isPremium: false }); }
    setSaving(false);
  };

  const updatePlugin = async (id: string, data: Record<string, unknown>) => {
    await api.patch(`/api/admin/plugins/${id}`, data);
    fetchPlugins();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plugin?")) return;
    await api.delete(`/api/admin/plugins/${id}`);
    fetchPlugins();
  };

  const reviewColors: Record<string, string> = { APPROVED: "bg-green-100 text-green-700", PENDING: "bg-yellow-100 text-yellow-700", REJECTED: "bg-accent-100 text-accent-700" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Plugin Management</h1>
          <p className="text-sm text-surface-500 mt-1">Manage and review platform plugins</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-brand-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Plugin
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-surface-900">New Plugin</h3>
            <button onClick={() => setShowForm(false)} className="text-surface-400 hover:text-surface-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Plugin Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500">
              <option value="payments">Payments</option><option value="delivery">Delivery</option><option value="marketing">Marketing</option><option value="analytics">Analytics</option><option value="communication">Communication</option><option value="inventory">Inventory</option><option value="ai">AI</option>
            </select>
            <input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
            <input placeholder="Version" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 md:col-span-2" rows={2} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPremium} onChange={(e) => setForm({ ...form, isPremium: e.target.checked })} className="rounded" /> Premium Plugin</label>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-xl border border-surface-200 hover:bg-surface-50">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name} className="px-4 py-2 text-sm rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-600" /></div>
      ) : plugins.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
          <Puzzle className="h-12 w-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">No plugins yet. Add your first plugin.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plugins.map((p) => (
            <div key={p.id} className="rounded-2xl border border-surface-200 bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white ${p.isAIGenerated ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-gradient-to-br from-blue-500 to-blue-600"}`}>
                    {p.isAIGenerated ? <Bot className="h-5 w-5" /> : <Puzzle className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-surface-900">{p.name}</h3>
                      <span className="text-[10px] text-surface-400">v{p.version}</span>
                      {p.isAIGenerated && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">AI Generated</span>}
                      {p.isPremium && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Premium</span>}
                    </div>
                    <p className="text-xs text-surface-500">{p.category} · by {p.author} · {p.installs} installs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${reviewColors[p.reviewStatus] || ""}`}>{p.reviewStatus}</span>
                  <button onClick={() => updatePlugin(p.id, { isActive: !p.isActive })} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors ${p.isActive ? "bg-green-100 text-green-700" : "bg-surface-100 text-surface-500"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </button>
                  {p.reviewStatus === "PENDING" && (
                    <>
                      <button onClick={() => updatePlugin(p.id, { reviewStatus: "APPROVED" })} className="p-1.5 rounded-lg hover:bg-green-50 text-surface-400 hover:text-green-600"><CheckCircle2 className="h-4 w-4" /></button>
                      <button onClick={() => updatePlugin(p.id, { reviewStatus: "REJECTED" })} className="p-1.5 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600"><XCircle className="h-4 w-4" /></button>
                    </>
                  )}
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
