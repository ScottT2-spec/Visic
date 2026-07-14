"use client";
import { ChevronRight, Loader2, Plus } from "lucide-react";
import { BarChart3, Building2, Globe, Search, Settings, ShieldCheck, Trash2, Users } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";

interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  logo: string | null;
  createdAt: string;
  sites: Array<{ id: string; name: string; slug: string; siteType: string; status: string; createdAt: string }>;
  members: Array<{ id: string; role: string; user: { id: string; firstName: string; lastName: string; email: string } }>;
  _count: { sites: number; members: number };
}

interface AgencyStats {
  totalWorkspaces: number;
  totalSites: number;
  totalMembers: number;
  planCounts: Record<string, number>;
}

export default function AgencyPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newPlan, setNewPlan] = useState("STARTER");
  const [createSite, setCreateSite] = useState(true);
  const [siteName, setSiteName] = useState("");
  const [siteType, setSiteType] = useState("ECOMMERCE");
  const [creating, setCreating] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    const res = await api.get<{ workspaces: WorkspaceData[]; stats: AgencyStats }>("/api/agency?limit=50");
    if (res.success && res.data) {
      setWorkspaces(res.data.workspaces);
      setStats(res.data.stats);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  const handleCreate = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    setCreating(true);
    const res = await api.post("/api/agency", {
      name: newName.trim(), slug: newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      plan: newPlan, createSite, siteName: siteName.trim() || newName.trim(), siteType,
    });
    if (res.success) {
      setShowCreate(false); setNewName(""); setNewSlug(""); setSiteName("");
      await fetchWorkspaces();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this workspace and all its sites? This cannot be undone.")) return;
    await api.delete(`/api/agency/${id}`);
    await fetchWorkspaces();
  };

  const filtered = workspaces.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) || w.slug.includes(search.toLowerCase())
  );

  const planColor: Record<string, string> = {
    FREE: "bg-gray-100 text-gray-700", STARTER: "bg-blue-100 text-blue-700",
    BUSINESS: "bg-purple-100 text-purple-700", GROWTH: "bg-green-100 text-green-700",
    AGENCY: "bg-amber-100 text-amber-700", ENTERPRISE: "bg-red-100 text-red-700",
  };

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display flex items-center gap-2"><Building2 className="h-6 w-6 text-brand-600" /> Agency Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">Manage client workspaces and sites</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary py-2.5 px-4 text-sm"><Plus className="h-4 w-4" /> New Client</button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Building2} label="Workspaces" value={stats.totalWorkspaces} />
          <StatCard icon={Globe} label="Total Sites" value={stats.totalSites} />
          <StatCard icon={Users} label="Team Members" value={stats.totalMembers} />
          <StatCard icon={BarChart3} label="Plans" value={Object.keys(stats.planCounts).length} />
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">Create Client Workspace</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Client / Company Name *</label>
              <input value={newName} onChange={(e) => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }}
                className="input-field py-2.5 w-full" placeholder="e.g. Acme Corp" /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Slug *</label>
              <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} className="input-field py-2.5 w-full" placeholder="acme-corp" /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Plan</label>
              <select value={newPlan} onChange={(e) => setNewPlan(e.target.value)} className="input-field py-2.5 w-full">
                <option value="FREE">Free</option><option value="STARTER">Starter</option>
                <option value="BUSINESS">Business</option><option value="GROWTH">Growth</option>
              </select></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Site Type</label>
              <select value={siteType} onChange={(e) => setSiteType(e.target.value)} className="input-field py-2.5 w-full">
                <option value="ECOMMERCE">Ecommerce</option><option value="WEBSITE">Website</option>
                <option value="LANDING_PAGE">Landing Page</option>
              </select></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-surface-700">
            <input type="checkbox" checked={createSite} onChange={(e) => setCreateSite(e.target.checked)} className="rounded" />
            Create initial site
          </label>
          {createSite && (
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Site Name</label>
              <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="input-field py-2.5 w-full" placeholder="Leave empty to use client name" /></div>
          )}
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={creating || !newName.trim() || !newSlug.trim()} className="btn-primary py-2.5 px-6 text-sm">
              {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Workspace"}
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary py-2.5 px-4 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workspaces..."
          className="input-field py-2.5 pl-10 w-full" />
      </div>

      {/* Workspace list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-surface-400">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-semibold">No workspaces yet</p>
            <p className="text-sm mt-1">Create your first client workspace to get started</p>
          </div>
        ) : filtered.map((w) => (
          <div key={w.id} className="rounded-xl border border-surface-200 bg-white overflow-hidden">
            <button onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-surface-900">{w.name}</p>
                  <p className="text-xs text-surface-400">/{w.slug} · {w._count.sites} sites · {w._count.members} members</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${planColor[w.plan] || "bg-surface-100 text-surface-600"}`}>{w.plan}</span>
                <ChevronRight className={`h-4 w-4 text-surface-400 transition-transform ${expandedId === w.id ? "rotate-90" : ""}`} />
              </div>
            </button>
            {expandedId === w.id && (
              <div className="border-t border-surface-100 px-5 py-4 space-y-4">
                {/* Sites */}
                <div>
                  <h4 className="text-sm font-semibold text-surface-700 mb-2 flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Sites</h4>
                  {w.sites.length === 0 ? <p className="text-xs text-surface-400">No sites</p> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {w.sites.map((s) => (
                        <div key={s.id} className="rounded-lg bg-surface-50 px-3 py-2 text-sm">
                          <p className="font-medium text-surface-800">{s.name}</p>
                          <p className="text-xs text-surface-400">{s.siteType} · {s.status}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Members */}
                <div>
                  <h4 className="text-sm font-semibold text-surface-700 mb-2 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Members</h4>
                  {w.members.length === 0 ? <p className="text-xs text-surface-400">No members</p> : (
                    <div className="space-y-1">
                      {w.members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between text-sm">
                          <span className="text-surface-700">{m.user.firstName} {m.user.lastName} <span className="text-surface-400">({m.user.email})</span></span>
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-100 text-surface-600">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-surface-100">
                  <button className="btn-secondary py-1.5 px-3 text-xs"><Settings className="h-3 w-3" /> Settings</button>
                  <button onClick={() => handleDelete(w.id)} className="py-1.5 px-3 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="h-3 w-3" /> Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-1"><Icon className="h-4 w-4 text-brand-600" /><span className="text-xs text-surface-500">{label}</span></div>
      <p className="text-2xl font-bold text-surface-900">{value}</p>
    </div>
  );
}
