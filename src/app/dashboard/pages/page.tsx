"use client";
import { Loader2, Plus } from "lucide-react";
import { ExternalLink, Eye, EyeOff, FileText, GripVertical, Layout, MoreHorizontal, Pencil, Search, Sparkles, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";
import { useRouter } from "next/navigation";

interface PageItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const pageTypeLabels: Record<string, string> = {
  HOME: "Home", ABOUT: "About", CONTACT: "Contact", FAQ: "FAQ",
  POLICY: "Policy", CUSTOM: "Custom", LANDING: "Landing",
};

export default function PagesPage() {
  const { currentStore } = useSite();
  const router = useRouter();
  const { prefillData, clearPrefill, isFromAI } = useAIPrefill("page");
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("CUSTOM");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchPages = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ pages: PageItem[] }>(`/api/sites/${currentStore.id}/pages`);
    if (res.success && res.data) {
      setPages(res.data.pages || (Array.isArray(res.data) ? res.data as unknown as PageItem[] : []));
    }
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  // AI prefill
  useEffect(() => {
    if (prefillData && isFromAI) {
      const d = prefillData as any;
      setNewTitle(d.title || "");
      setNewType(d.type || "CUSTOM");
      setShowCreate(true);
    }
  }, [prefillData, isFromAI]);

  const createPage = async () => {
    if (!currentStore || !newTitle.trim()) return;
    setCreating(true);
    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const res = await api.post<PageItem>(`/api/sites/${currentStore.id}/pages`, {
      title: newTitle, slug, type: newType, content: [], isPublished: false,
    });
    if (res.success && res.data) {
      setPages((prev) => [res.data!, ...prev]);
      setNewTitle("");
      setShowCreate(false);
    }
    setCreating(false);
    if (isFromAI) { clearPrefill(); router.push("/dashboard/ai"); }
  };

  const deletePage = async (id: string) => {
    if (!currentStore) return;
    setDeleteId(id);
    await api.delete(`/api/sites/${currentStore.id}/pages/${id}`);
    setPages((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  const regeneratePages = async () => {
    if (!currentStore || regenerating) return;
    if (!confirm("This will regenerate all AI pages (Home, About, FAQ, Contact, Policies) with the latest premium design. Continue?")) return;
    setRegenerating(true);
    try {
      const res = await api.post<{ pages: Array<{ id: string; title: string; slug: string; type: string }> }>(
        `/api/sites/${currentStore.id}/ai/generate-store`,
        { storeName: currentStore.name, businessType: currentStore.businessType || "general", description: currentStore.description || "" }
      );
      if (res.success) {
        await fetchPages();
      } else {
        alert(res.error || "AI generation failed. Please try again.");
      }
    } catch {
      alert("AI generation failed. Please try again.");
    }
    setRegenerating(false);
  };

  const togglePublish = async (page: PageItem) => {
    if (!currentStore) return;
    const res = await api.patch<PageItem>(`/api/sites/${currentStore.id}/pages/${page.id}`, {
      isPublished: !page.isPublished,
    });
    if (res.success) {
      setPages((prev) => prev.map((p) => p.id === page.id ? { ...p, isPublished: !p.isPublished } : p));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {isFromAI && <AIPrefillBanner entityType="page" onDiscard={() => { clearPrefill(); setShowCreate(false); setNewTitle(""); }} />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Pages</h1>
          <p className="text-sm text-surface-500 mt-1">Create and manage store pages with the drag-and-drop builder</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={regeneratePages}
            disabled={regenerating}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors disabled:opacity-50"
          >
            {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {regenerating ? "Generating..." : "Regenerate with AI"}
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm py-2.5 px-4">
            <Plus className="h-4 w-4" /> New Page
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <h3 className="text-sm font-bold text-surface-900 mb-3">Create New Page</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Page title..."
              className="input-field flex-1 py-2.5"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && createPage()}
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="input-field w-40 py-2.5"
            >
              <option value="CUSTOM">Custom</option>
              <option value="LANDING">Landing</option>
              <option value="ABOUT">About</option>
              <option value="CONTACT">Contact</option>
              <option value="FAQ">FAQ</option>
              <option value="POLICY">Policy</option>
            </select>
            <div className="flex gap-2">
              <button onClick={createPage} disabled={creating || !newTitle.trim()} className="btn-primary text-sm py-2.5 px-5">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </button>
              <button onClick={() => { setShowCreate(false); setNewTitle(""); }} className="btn-secondary text-sm py-2.5 px-4">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No pages yet</h3>
          <p className="text-sm text-surface-500 mb-5">Create your first page and design it with the visual builder.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm py-2.5 px-5">
            <Plus className="h-4 w-4" /> Create First Page
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
          <div className="divide-y divide-surface-100">
            {pages.map((page) => (
              <div key={page.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 transition-colors group">
                <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Layout className="h-5 w-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-surface-900 truncate">{page.title}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">
                      {pageTypeLabels[page.type] || page.type}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      page.isPublished ? "bg-green-50 text-green-700" : "bg-surface-100 text-surface-500"
                    }`}>
                      {page.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs text-surface-400 mt-0.5">/{page.slug} · Updated {new Date(page.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/builder/${page.id}`}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-brand-700 transition-colors"
                    title="Customize page design, sections, and content"
                  >
                    <Pencil className="h-3 w-3" /> Customize
                  </Link>
                  <button
                    onClick={() => togglePublish(page)}
                    className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors"
                    title={page.isPublished ? "Unpublish" : "Publish"}
                  >
                    {page.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {currentStore && page.isPublished && (
                    <Link
                      href={`/store/${currentStore.slug}/${page.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors"
                      title="View live page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => { if (confirm("Delete this page?")) deletePage(page.id); }}
                    disabled={deleteId === page.id}
                    className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600 transition-colors"
                  >
                    {deleteId === page.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
