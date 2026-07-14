"use client";
import { Loader2, Plus } from "lucide-react";
import { Building2, FileText, Globe, Megaphone, MoreVertical, Settings, ShoppingBag, Users } from "@/components/icons/FilledIcons";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useAuth } from '@/context/AuthContext';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: string;
  status: string;
  _count: { sites: number; members: number };
  sites: Site[];
}

interface Site {
  id: string;
  name: string;
  siteType: 'ECOMMERCE' | 'WEBSITE' | 'LANDING_PAGE';
  slug: string;
  subdomain: string;
  status: string;
  logo: string | null;
}

const siteTypeConfig = {
  ECOMMERCE: { icon: ShoppingBag, label: 'Store', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  WEBSITE: { icon: Globe, label: 'Website', color: 'text-blue-600', bg: 'bg-blue-50' },
  LANDING_PAGE: { icon: FileText, label: 'Landing Page', color: 'text-purple-600', bg: 'bg-purple-50' },
};

export default function WorkspacesPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [settingsWorkspace, setSettingsWorkspace] = useState<Workspace | null>(null);
  const [editName, setEditName] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/workspaces', { headers: { ...getAuthHeaders() } });
        const json = await res.json();
        if (!cancelled && json.success) setWorkspaces(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces', { headers: { ...getAuthHeaders() } });
      const json = await res.json();
      if (json.success) setWorkspaces(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const openSettings = (workspace: Workspace) => {
    setSettingsWorkspace(workspace);
    setEditName(workspace.name);
    setShowDeleteConfirm(false);
  };

  const saveWorkspaceSettings = async () => {
    if (!settingsWorkspace || !editName.trim() || savingSettings) return;
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/workspaces/${settingsWorkspace.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setSettingsWorkspace(null);
        await refreshWorkspaces();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const deleteWorkspace = async () => {
    if (!settingsWorkspace || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/${settingsWorkspace.id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      const json = await res.json();
      if (json.success) {
        setSettingsWorkspace(null);
        setShowDeleteConfirm(false);
        await refreshWorkspaces();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const createWorkspace = async () => {
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreate(false);
        setNewName('');
        await refreshWorkspaces();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const getCustomizeSiteId = (workspace: Workspace) => workspace.sites[0]?.id || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
          <p className="text-gray-500 mt-1">Manage your business workspaces and sites</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Workspace
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Create Workspace</h2>
            <input
              type="text"
              placeholder="e.g. Nike Africa"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createWorkspace()}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowCreate(false); setNewName(''); }} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button
                onClick={createWorkspace}
                disabled={!newName.trim() || creating}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Settings Modal */}
      {settingsWorkspace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-1">Workspace Settings</h2>
            <p className="text-sm text-gray-400 mb-5">Manage {settingsWorkspace.name}</p>

            {/* Rename */}
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Workspace Name</label>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveWorkspaceSettings()}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none mb-5"
            />

            {/* Info */}
            <div className="bg-gray-50 rounded-lg p-3 mb-5 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sites</span>
                <span className="font-medium text-gray-900">{settingsWorkspace._count.sites}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Members</span>
                <span className="font-medium text-gray-900">{settingsWorkspace._count.members}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium text-gray-900 capitalize">{settingsWorkspace.plan.toLowerCase()}</span>
              </div>
            </div>

            {/* Danger Zone */}
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg py-2 transition mb-4"
              >
                Delete Workspace
              </button>
            ) : (
              <div className="border border-red-200 bg-red-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700 font-medium mb-2">
                  Delete &ldquo;{settingsWorkspace.name}&rdquo;? This will remove all sites and data. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteWorkspace}
                    disabled={deleting}
                    className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSettingsWorkspace(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveWorkspaceSettings}
                disabled={!editName.trim() || editName.trim() === settingsWorkspace.name || savingSettings}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
              >
                {savingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspaces Grid */}
      {workspaces.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
          <p className="text-gray-500 mb-6">Create your first workspace to start building sites</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
          >
            Create Workspace
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {workspaces.map(workspace => (
            <div key={workspace.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              {/* Workspace Header */}
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">
                    {workspace.logo ? (
                      <img src={workspace.logo} alt="" className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      workspace.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{workspace.name}</h2>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span>{workspace._count.sites} site{workspace._count.sites !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>{workspace._count.members} member{workspace._count.members !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span className="capitalize">{workspace.plan.toLowerCase()} plan</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/new-site?workspace=${workspace.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Site
                  </button>
                  {getCustomizeSiteId(workspace) && (
                    <Link
                      href={`/dashboard/sites/${getCustomizeSiteId(workspace)}/customize`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition font-medium"
                    >
                      Customize
                    </Link>
                  )}
                  <button
                    onClick={() => openSettings(workspace)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Sites List */}
              {workspace.sites.length === 0 ? (
                <div className="px-6 py-10 text-center text-gray-400">
                  <p className="text-sm">No sites yet. Click &ldquo;Add Site&rdquo; to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {workspace.sites.map(site => {
                    const config = siteTypeConfig[site.siteType];
                    const Icon = config.icon;
                    return (
                      <div
                        key={site.id}
                        className="w-full px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50 transition text-left"
                      >
                        <button
                          onClick={() => {
                            localStorage.setItem(`activeSiteId:${user?.id || "guest"}`, site.id);
                            localStorage.removeItem('activeSiteId');
                            router.push('/dashboard');
                          }}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <div className={`w-9 h-9 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            {site.logo ? (
                              <img src={site.logo} alt="" className="w-full h-full rounded-lg object-cover" />
                            ) : (
                              <Icon className={`w-4 h-4 ${config.color}`} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{site.name}</p>
                            <p className="text-xs text-gray-400 truncate">{site.subdomain}.prokip.site</p>
                          </div>
                        </button>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${site.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                          <Link
                            href={`/dashboard/sites/${site.id}/customize`}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                          >
                            Customize
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
