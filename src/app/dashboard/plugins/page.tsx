"use client";
import { ChevronRight, Loader2, X } from "lucide-react";
import { CheckCircle2, Clock, Download, ExternalLink, Puzzle, Search, Settings, Shield, Tag, ToggleLeft, ToggleRight, Trash2, Zap } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";

interface Plugin {
  id: string; name: string; slug: string; description?: string; icon?: string;
  category: string; author: string; version: string; isPremium: boolean; installs: number;
  config?: PluginManifest;
  isInstalled?: boolean; isEnabled?: boolean; storePluginId?: string;
}

interface PluginManifest {
  hooks?: { hook: string; priority: number; handler: string; description?: string }[];
  settingsSchema?: SettingsField[];
  defaultSettings?: Record<string, unknown>;
  permissions?: string[];
  tags?: string[];
}

interface SettingsField {
  key: string; label: string; type: string; description?: string;
  placeholder?: string; required?: boolean; default?: unknown;
  options?: { label: string; value: string }[];
  min?: number; max?: number;
  condition?: { field: string; value: unknown };
}

interface PluginSettings {
  pluginId: string; pluginName: string; pluginSlug: string;
  isEnabled: boolean; settingsSchema: SettingsField[];
  settings: Record<string, unknown>; hooks: { hook: string; description?: string }[];
  permissions: string[];
}

const categoryIcons: Record<string, string> = {
  delivery: "🚚", communication: "💬", analytics: "📊", payments: "💰",
  inventory: "📦", marketing: "🎁", design: "🎨", seo: "🔍",
  security: "🛡️", social: "📱", productivity: "⚡", other: "🔌",
};

const categoryLabels: Record<string, string> = {
  delivery: "Delivery & Shipping", communication: "Communication", analytics: "Analytics & Tracking",
  payments: "Payments", inventory: "Inventory", marketing: "Marketing",
  design: "Design & Display", seo: "SEO", security: "Security",
  social: "Social", productivity: "Productivity", other: "Other",
};

export default function PluginsPage() {
  const { currentStore } = useSite();
  const { prefillData, clearPrefill, isFromAI } = useAIPrefill("plugin");
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "installed" | string>("all");
  const [installing, setInstalling] = useState<string | null>(null);

  // Settings panel
  const [settingsPlugin, setSettingsPlugin] = useState<PluginSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsValues, setSettingsValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const fetchPlugins = useCallback(async () => {
    if (!currentStore) return;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await api.get<Plugin[]>(`/api/sites/${currentStore.id}/plugins?${params}`);
    if (res.success && res.data) setPlugins(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, [currentStore, search]);

  useEffect(() => { fetchPlugins(); }, [fetchPlugins]);

  const installPlugin = async (pluginId: string) => {
    if (!currentStore) return;
    setInstalling(pluginId);
    await api.post(`/api/sites/${currentStore.id}/plugins`, { pluginId, action: "install" });
    await fetchPlugins();
    setInstalling(null);
  };

  const togglePlugin = async (pluginId: string) => {
    if (!currentStore) return;
    setInstalling(pluginId);
    await api.post(`/api/sites/${currentStore.id}/plugins`, { pluginId, action: "toggle" });
    await fetchPlugins();
    setInstalling(null);
  };

  const uninstallPlugin = async (pluginId: string) => {
    if (!currentStore) return;
    setInstalling(pluginId);
    await api.post(`/api/sites/${currentStore.id}/plugins`, { pluginId, action: "uninstall" });
    await fetchPlugins();
    setInstalling(null);
  };

  const openSettings = async (plugin: Plugin) => {
    if (!currentStore) return;
    setSettingsLoading(true);
    setSettingsPlugin(null);
    const res = await api.get<PluginSettings>(`/api/sites/${currentStore.id}/plugins/${plugin.id}/settings`);
    if (res.success && res.data) {
      setSettingsPlugin(res.data);
      setSettingsValues(res.data.settings || {});
    }
    setSettingsLoading(false);
  };

  const saveSettings = async () => {
    if (!currentStore || !settingsPlugin) return;
    setSaving(true);
    await api.patch(`/api/sites/${currentStore.id}/plugins/${settingsPlugin.pluginId}/settings`, {
      settings: settingsValues,
    });
    setSaving(false);
    // Refresh
    const res = await api.get<PluginSettings>(`/api/sites/${currentStore.id}/plugins/${settingsPlugin.pluginId}/settings`);
    if (res.success && res.data) {
      setSettingsPlugin(res.data);
      setSettingsValues(res.data.settings || {});
    }
  };

  const toggleEnabled = async () => {
    if (!currentStore || !settingsPlugin) return;
    setSaving(true);
    await api.patch(`/api/sites/${currentStore.id}/plugins/${settingsPlugin.pluginId}/settings`, {
      isEnabled: !settingsPlugin.isEnabled,
    });
    setSaving(false);
    setSettingsPlugin({ ...settingsPlugin, isEnabled: !settingsPlugin.isEnabled });
    await fetchPlugins();
  };

  // Filter logic
  const categories = [...new Set(plugins.map((p) => p.category))].sort();
  const filtered = plugins.filter((p) => {
    if (filter === "installed" && !p.isInstalled) return false;
    if (filter !== "all" && filter !== "installed" && p.category !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const installedCount = plugins.filter((p) => p.isInstalled).length;

  return (
    <>
      <DashboardHeader title="Plugins" subtitle="Extend your store with powerful add-ons" />

      {isFromAI && <div className="px-6 pt-4"><AIPrefillBanner entityType="plugin" onDiscard={() => clearPrefill()} /></div>}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar filters */}
        <div className="hidden lg:block w-56 border-r border-surface-100 bg-white p-4 space-y-1">
          <button onClick={() => setFilter("all")} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${filter === "all" ? "bg-brand-50 text-brand-700" : "text-surface-600 hover:bg-surface-50"}`}>
            All Plugins <span className="text-surface-400 text-xs ml-1">({plugins.length})</span>
          </button>
          <button onClick={() => setFilter("installed")} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${filter === "installed" ? "bg-brand-50 text-brand-700" : "text-surface-600 hover:bg-surface-50"}`}>
            Installed <span className="text-surface-400 text-xs ml-1">({installedCount})</span>
          </button>
          <div className="pt-3 pb-1 px-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">Categories</span>
          </div>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${filter === cat ? "bg-brand-50 text-brand-700" : "text-surface-600 hover:bg-surface-50"}`}>
              <span>{categoryIcons[cat] || "🔌"}</span>
              <span className="truncate">{categoryLabels[cat] || cat}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 flex-1 max-w-md">
              <Search className="h-4 w-4 text-surface-400" />
              <input type="text" placeholder="Search plugins..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none" />
            </div>
            {/* Mobile filter */}
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="lg:hidden rounded-xl border border-surface-200 px-3 py-2 text-sm">
              <option value="all">All</option>
              <option value="installed">Installed</option>
              {categories.map((c) => <option key={c} value={c}>{categoryLabels[c] || c}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
              <Puzzle className="h-12 w-12 text-surface-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-surface-900 mb-2">No plugins found</h3>
              <p className="text-sm text-surface-500">{search ? "Try a different search term." : "No plugins available in this category."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((plugin) => {
                const manifest = plugin.config as PluginManifest | null;
                const hookCount = manifest?.hooks?.length || 0;
                const hasSettings = (manifest?.settingsSchema?.length || 0) > 0;

                return (
                  <div key={plugin.id} className={`rounded-2xl border bg-white p-5 hover:shadow-md transition-all ${plugin.isEnabled ? "border-brand-200 ring-1 ring-brand-50" : "border-surface-200"}`}>
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-11 w-11 rounded-xl bg-surface-50 flex items-center justify-center text-xl flex-shrink-0">
                        {plugin.icon || categoryIcons[plugin.category] || "🔌"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-surface-900 truncate">{plugin.name}</h3>
                          {plugin.isPremium && <span className="text-[9px] font-bold text-accent-600 bg-accent-50 px-1.5 py-0.5 rounded-full flex-shrink-0">PRO</span>}
                        </div>
                        <p className="text-[10px] text-surface-400 mt-0.5">by {plugin.author} · v{plugin.version}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-surface-500 mb-3 line-clamp-2">{plugin.description || "No description"}</p>

                    {/* Hook badges */}
                    {hookCount > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {manifest!.hooks!.slice(0, 3).map((h) => (
                          <span key={h.hook} className="inline-flex items-center gap-1 text-[9px] font-medium text-surface-500 bg-surface-50 px-2 py-0.5 rounded-full">
                            <Zap className="h-2.5 w-2.5" /> {h.hook.replace(":", " → ")}
                          </span>
                        ))}
                        {hookCount > 3 && <span className="text-[9px] text-surface-400 px-1">+{hookCount - 3} more</span>}
                      </div>
                    )}

                    {/* Permissions */}
                    {manifest?.permissions && manifest.permissions.length > 0 && (
                      <div className="flex items-center gap-1 mb-3 text-[9px] text-surface-400">
                        <Shield className="h-3 w-3" />
                        {manifest.permissions.slice(0, 2).join(", ")}
                        {manifest.permissions.length > 2 && ` +${manifest.permissions.length - 2}`}
                      </div>
                    )}

                    {/* Install count + category */}
                    <div className="flex items-center justify-between text-[10px] text-surface-400 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {plugin.installs.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {categoryLabels[plugin.category] || plugin.category}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!plugin.isInstalled ? (
                        <button
                          onClick={() => installPlugin(plugin.id)}
                          disabled={installing === plugin.id}
                          className="flex-1 btn-primary text-xs py-2 disabled:opacity-50"
                        >
                          {installing === plugin.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : "Install"}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => togglePlugin(plugin.id)}
                            disabled={installing === plugin.id}
                            className={`flex-1 text-xs py-2 px-3 rounded-xl font-semibold transition-colors border ${
                              plugin.isEnabled
                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                : "bg-surface-50 text-surface-500 border-surface-200 hover:bg-surface-100"
                            }`}
                          >
                            {installing === plugin.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : (
                              <span className="flex items-center justify-center gap-1">
                                {plugin.isEnabled ? <><CheckCircle2 className="h-3.5 w-3.5" /> Active</> : "Activate"}
                              </span>
                            )}
                          </button>
                          {hasSettings && plugin.isInstalled && (
                            <button onClick={() => openSettings(plugin)} className="p-2 rounded-xl border border-surface-200 text-surface-500 hover:text-brand-600 hover:border-brand-200 transition-colors">
                              <Settings className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => uninstallPlugin(plugin.id)} className="p-2 rounded-xl border border-surface-200 text-surface-400 hover:text-red-500 hover:border-red-200 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel (Slide-over) */}
      {(settingsPlugin || settingsLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => { setSettingsPlugin(null); setSettingsLoading(false); }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {settingsLoading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
            ) : settingsPlugin && (
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-surface-900 font-display">{settingsPlugin.pluginName}</h2>
                    <p className="text-xs text-surface-400 mt-0.5">{settingsPlugin.pluginSlug} · Plugin Settings</p>
                  </div>
                  <button onClick={() => setSettingsPlugin(null)} className="p-2 text-surface-400 hover:text-surface-600 rounded-xl hover:bg-surface-50">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Enable/Disable */}
                <div className="flex items-center justify-between rounded-xl bg-surface-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-surface-900">Plugin Status</p>
                    <p className="text-xs text-surface-500">{settingsPlugin.isEnabled ? "Active — hooks are running" : "Inactive — hooks are paused"}</p>
                  </div>
                  <button onClick={toggleEnabled} disabled={saving}>
                    {settingsPlugin.isEnabled ? <ToggleRight className="h-8 w-8 text-brand-600" /> : <ToggleLeft className="h-8 w-8 text-surface-300" />}
                  </button>
                </div>

                {/* Hooks info */}
                {settingsPlugin.hooks.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-surface-600 uppercase tracking-wider mb-2">Hooks ({settingsPlugin.hooks.length})</h3>
                    <div className="space-y-1.5">
                      {settingsPlugin.hooks.map((h: any) => (
                        <div key={h.hook} className="flex items-start gap-2 text-xs">
                          <Zap className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-mono text-surface-700">{h.hook}</span>
                            {h.description && <p className="text-surface-400 mt-0.5">{h.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Permissions */}
                {settingsPlugin.permissions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-surface-600 uppercase tracking-wider mb-2">Permissions</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {settingsPlugin.permissions.map((p) => (
                        <span key={p} className="inline-flex items-center gap-1 text-[10px] font-medium text-surface-500 bg-surface-50 border border-surface-200 px-2 py-1 rounded-lg">
                          <Shield className="h-3 w-3" /> {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Settings form */}
                {settingsPlugin.settingsSchema.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-surface-600 uppercase tracking-wider mb-3">Configuration</h3>
                    <div className="space-y-4">
                      {settingsPlugin.settingsSchema.map((field) => {
                        // Check condition
                        if (field.condition) {
                          const condVal = settingsValues[field.condition.field];
                          if (condVal !== field.condition.value) return null;
                        }

                        const value = settingsValues[field.key] ?? field.default ?? "";

                        return (
                          <div key={field.key}>
                            <label className="block text-xs font-semibold text-surface-700 mb-1">{field.label}</label>
                            {field.description && <p className="text-[10px] text-surface-400 mb-1.5">{field.description}</p>}

                            {field.type === "toggle" ? (
                              <button onClick={() => setSettingsValues((v) => ({ ...v, [field.key]: !v[field.key] }))}>
                                {value ? <ToggleRight className="h-7 w-7 text-brand-600" /> : <ToggleLeft className="h-7 w-7 text-surface-300" />}
                              </button>
                            ) : field.type === "select" ? (
                              <select
                                value={value as string}
                                onChange={(e) => setSettingsValues((v) => ({ ...v, [field.key]: e.target.value }))}
                                className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-brand-500"
                              >
                                {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                              </select>
                            ) : field.type === "textarea" ? (
                              <textarea
                                value={value as string}
                                onChange={(e) => setSettingsValues((v) => ({ ...v, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                rows={3}
                                className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-brand-500"
                              />
                            ) : field.type === "json" ? (
                              <textarea
                                value={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
                                onChange={(e) => {
                                  try { setSettingsValues((v) => ({ ...v, [field.key]: JSON.parse(e.target.value) })); }
                                  catch { setSettingsValues((v) => ({ ...v, [field.key]: e.target.value })); }
                                }}
                                placeholder={field.placeholder}
                                rows={4}
                                className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm font-mono focus:border-brand-500"
                              />
                            ) : field.type === "number" ? (
                              <input
                                type="number"
                                value={value as number}
                                onChange={(e) => setSettingsValues((v) => ({ ...v, [field.key]: Number(e.target.value) }))}
                                placeholder={field.placeholder}
                                min={field.min}
                                max={field.max}
                                className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-brand-500"
                              />
                            ) : (
                              <input
                                type={field.type === "url" ? "url" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                                value={value as string}
                                onChange={(e) => setSettingsValues((v) => ({ ...v, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-brand-500"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button onClick={saveSettings} disabled={saving} className="w-full btn-primary py-2.5 mt-6 disabled:opacity-50">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Settings"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
