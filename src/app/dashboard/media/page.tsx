"use client";
import { Check, Loader2, Plus, X } from "lucide-react";
import { FileText, Film, FolderOpen, Grid, Image as ImageIcon, List, Music, Pencil, Search, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface MediaItem {
  id: string; name: string; url: string; type: string; mimeType: string | null;
  size: number | null; width: number | null; height: number | null;
  alt: string | null; folder: string | null; createdAt: string;
}

const typeIcons: Record<string, typeof ImageIcon> = { IMAGE: ImageIcon, VIDEO: Film, DOCUMENT: FileText, AUDIO: Music };
const typeColors: Record<string, string> = { IMAGE: "bg-blue-50 text-blue-600", VIDEO: "bg-purple-50 text-purple-600", DOCUMENT: "bg-amber-50 text-amber-600", AUDIO: "bg-green-50 text-green-600" };

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const { currentStore } = useSite();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUpload, setShowUpload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editAlt, setEditAlt] = useState("");

  // Upload form
  const [uploadName, setUploadName] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadType, setUploadType] = useState("IMAGE");
  const [uploadFolder, setUploadFolder] = useState("/");

  const fetchMedia = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    if (folderFilter) params.set("folder", folderFilter);
    const res = await api.get<{ items: MediaItem[]; folders: string[] }>(`/api/sites/${currentStore.id}/media?${params}`);
    if (res.success && res.data) { setItems(res.data.items || []); setFolders(res.data.folders || []); }
    setLoading(false);
  }, [currentStore, search, typeFilter, folderFilter]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const uploadItem = async () => {
    if (!currentStore || !uploadName.trim() || !uploadUrl.trim()) return;
    setSaving(true);
    await api.post(`/api/sites/${currentStore.id}/media`, { name: uploadName.trim(), url: uploadUrl.trim(), type: uploadType, folder: uploadFolder || "/" });
    setShowUpload(false); setUploadName(""); setUploadUrl(""); setUploadType("IMAGE"); setUploadFolder("/"); setSaving(false); fetchMedia();
  };

  const deleteItem = async (id: string) => {
    if (!currentStore || !confirm("Delete this file?")) return;
    setDeleteId(id); await api.delete(`/api/sites/${currentStore.id}/media/${id}`);
    setItems((p) => p.filter((i) => i.id !== id)); setDeleteId(null);
  };

  const startEdit = (item: MediaItem) => { setEditingItem(item); setEditName(item.name); setEditAlt(item.alt || ""); };

  const saveEdit = async () => {
    if (!currentStore || !editingItem) return;
    await api.patch(`/api/sites/${currentStore.id}/media/${editingItem.id}`, { name: editName.trim(), alt: editAlt.trim() || null });
    setEditingItem(null); fetchMedia();
  };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-surface-900 font-display">Media Library</h1><p className="text-sm text-surface-500 mt-1">Manage images, videos, and files</p></div>
        <button onClick={() => setShowUpload(true)} className="btn-primary text-sm py-2.5 px-4"><Plus className="h-4 w-4" /> Add Media</button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..." className="input-field py-2.5 pl-9 w-full" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field py-2.5 text-sm">
          <option value="">All Types</option>
          <option value="IMAGE">Images</option><option value="VIDEO">Videos</option>
          <option value="DOCUMENT">Documents</option><option value="AUDIO">Audio</option>
        </select>
        {folders.length > 0 && (
          <select value={folderFilter} onChange={(e) => setFolderFilter(e.target.value)} className="input-field py-2.5 text-sm">
            <option value="">All Folders</option>
            {folders.map((f) => <option key={f} value={f || "/"}>{f || "/"}</option>)}
          </select>
        )}
        <div className="flex items-center border border-surface-200 rounded-lg overflow-hidden">
          <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-brand-50 text-brand-600" : "text-surface-400 hover:text-surface-600"}`}><Grid className="h-4 w-4" /></button>
          <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-brand-50 text-brand-600" : "text-surface-400 hover:text-surface-600"}`}><List className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">Add Media</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Name *</label><input value={uploadName} onChange={(e) => setUploadName(e.target.value)} className="input-field py-2.5 w-full" autoFocus /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">URL *</label><input value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} className="input-field py-2.5 w-full" placeholder="https://..." /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Type</label>
              <select value={uploadType} onChange={(e) => setUploadType(e.target.value)} className="input-field py-2.5 w-full">
                <option value="IMAGE">Image</option><option value="VIDEO">Video</option><option value="DOCUMENT">Document</option><option value="AUDIO">Audio</option>
              </select></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Folder</label><input value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)} className="input-field py-2.5 w-full" placeholder="/" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={uploadItem} disabled={saving || !uploadName.trim() || !uploadUrl.trim()} className="btn-primary text-sm py-2.5 px-6">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}</button>
            <button onClick={() => setShowUpload(false)} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingItem && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/30 p-5 space-y-3">
          <h4 className="text-sm font-bold text-surface-900">Edit: {editingItem.name}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-surface-600 mb-1">Name</label><input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field py-2 text-sm w-full" /></div>
            <div><label className="block text-xs font-medium text-surface-600 mb-1">Alt Text</label><input value={editAlt} onChange={(e) => setEditAlt(e.target.value)} className="input-field py-2 text-sm w-full" placeholder="Description for accessibility" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} className="btn-primary text-xs py-2 px-4"><Check className="h-3.5 w-3.5" /> Save</button>
            <button onClick={() => setEditingItem(null)} className="btn-secondary text-xs py-2 px-4"><X className="h-3.5 w-3.5" /> Cancel</button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : items.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><ImageIcon className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No media files yet</h3>
          <p className="text-sm text-surface-500 mb-5">Upload images, videos, and documents for your site.</p>
          <button onClick={() => setShowUpload(true)} className="btn-primary text-sm py-2.5 px-5"><Plus className="h-4 w-4" /> Add First File</button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => {
            const Icon = typeIcons[item.type] || FileText;
            return (
              <div key={item.id} className="rounded-xl border border-surface-200 bg-white overflow-hidden group hover:shadow-md transition-shadow">
                <div className="aspect-square bg-surface-50 flex items-center justify-center relative overflow-hidden">
                  {item.type === "IMAGE" ? (
                    <img src={item.url} alt={item.alt || item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <Icon className="h-10 w-10 text-surface-300" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => startEdit(item)} className="p-2 bg-white rounded-lg shadow-sm hover:bg-surface-50"><Pencil className="h-4 w-4 text-surface-700" /></button>
                    <button onClick={() => deleteItem(item.id)} disabled={deleteId === item.id} className="p-2 bg-white rounded-lg shadow-sm hover:bg-red-50">
                      {deleteId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-600" />}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-surface-900 truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[item.type] || "bg-surface-100 text-surface-500"}`}>{item.type}</span>
                    <span className="text-[10px] text-surface-400">{formatSize(item.size)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
          {items.map((item) => {
            const Icon = typeIcons[item.type] || FileText;
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-50 group">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[item.type]}`}>
                  {item.type === "IMAGE" ? <img src={item.url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-900 truncate">{item.name}</p>
                  <div className="flex items-center gap-2 text-xs text-surface-400">
                    <span>{item.type}</span><span>{formatSize(item.size)}</span>
                    {item.width && item.height && <span>{item.width}×{item.height}</span>}
                    <span>{item.folder || "/"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(item)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteItem(item.id)} disabled={deleteId === item.id} className="p-2 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-600">
                    {deleteId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
