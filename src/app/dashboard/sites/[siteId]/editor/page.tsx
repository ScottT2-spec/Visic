"use client";

import { useEffect, useMemo, useRef, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpDown,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Monitor,
  Plus,
  RefreshCw,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { SingleImageUpload } from "@/components/dashboard/ImageUpload";
import {
  applyPageCustomization,
  filterVisiblePages,
  normalizeSiteCustomization,
  type SiteCustomizationDocument,
  type SiteCustomizationPageSettings,
} from "@/lib/site-customization";
import { parsePageContent } from "@/lib/page-content";

interface SiteRecord {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  siteType: "ECOMMERCE" | "WEBSITE" | "LANDING_PAGE";
  businessType?: string | null;
  currency?: string | null;
  customDomain?: string | null;
  settings?: {
    whatsappNumber?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
  } | null;
}

interface PageRecord {
  id: string;
  title: string;
  slug: string;
  type: string;
  content?: unknown;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isPublished: boolean;
  position: number;
  template?: string | null;
}

interface EditorState {
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  businessType: string;
  currency: string;
  customDomain: string;
  whatsappNumber: string;
  metaTitle: string;
  metaDescription: string;
}

const emptyCustomization = normalizeSiteCustomization(null);

function readPersistedEditorState(storageKey: string): {
  siteDraft?: Partial<EditorState>;
  customization?: SiteCustomizationDocument;
  selectedPageId?: string | null;
  previewMode?: "desktop" | "tablet" | "mobile";
} | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as {
      siteDraft?: Partial<EditorState>;
      customization?: SiteCustomizationDocument;
      selectedPageId?: string | null;
      previewMode?: "desktop" | "tablet" | "mobile";
    };
  } catch {
    return null;
  }
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "textarea" | "color";
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-surface-500">{label}</span>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="input-field w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm"
        />
      ) : type === "color" ? (
        <input
          type="color"
          value={value || "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-xl border border-surface-200 bg-white p-1"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="input-field w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm"
        />
      )}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
        checked ? "border-brand-200 bg-brand-50 text-brand-700" : "border-surface-200 bg-white text-surface-700"
      }`}
    >
      <span className="font-medium">{label}</span>
      {checked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  );
}

export default function SiteEditorPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const storageKey = `afrostore_site_editor_state:${siteId}`;
  const persistedEditorState = readPersistedEditorState(storageKey);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeLeftTab, setActiveLeftTab] = useState<"pages" | "sections" | "navigation">("pages");
  const [activeRightTab, setActiveRightTab] = useState<"brand" | "theme" | "page" | "nav" | "seo" | "code" | "media">("brand");
  const [site, setSite] = useState<SiteRecord | null>(null);
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [siteDraft, setSiteDraft] = useState<EditorState>(() => ({
    name: persistedEditorState?.siteDraft?.name || "",
    description: persistedEditorState?.siteDraft?.description || "",
    logo: persistedEditorState?.siteDraft?.logo || "",
    coverImage: persistedEditorState?.siteDraft?.coverImage || "",
    businessType: persistedEditorState?.siteDraft?.businessType || "general",
    currency: persistedEditorState?.siteDraft?.currency || "GHS",
    customDomain: persistedEditorState?.siteDraft?.customDomain || "",
    whatsappNumber: persistedEditorState?.siteDraft?.whatsappNumber || "",
    metaTitle: persistedEditorState?.siteDraft?.metaTitle || "",
    metaDescription: persistedEditorState?.siteDraft?.metaDescription || "",
  }));
  const [customization, setCustomization] = useState<SiteCustomizationDocument>(() => persistedEditorState?.customization ? normalizeSiteCustomization(persistedEditorState.customization) : emptyCustomization);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(() => persistedEditorState?.selectedPageId || null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">(() => persistedEditorState?.previewMode || "desktop");
  const [mediaItems, setMediaItems] = useState<Array<{ id: string; url: string; name: string; type: string; alt?: string | null }>>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    const persist = {
      siteDraft,
      customization,
      selectedPageId,
      previewMode,
    };
    localStorage.setItem(storageKey, JSON.stringify(persist));
  }, [siteDraft, customization, selectedPageId, previewMode, storageKey]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [siteRes, pagesRes, customizationRes, mediaRes] = await Promise.all([
        api.get<{ id: string; name: string; slug: string; description?: string | null; logo?: string | null; coverImage?: string | null; siteType: "ECOMMERCE" | "WEBSITE" | "LANDING_PAGE"; businessType?: string | null; currency?: string | null; customDomain?: string | null; settings?: SiteRecord["settings"] }>(`/api/sites/${siteId}`),
        api.get<{ pages: PageRecord[] }>(`/api/sites/${siteId}/pages?limit=200`),
        api.get<{ customization: SiteCustomizationDocument }>(`/api/sites/${siteId}/customization`),
        api.get<{ items: Array<{ id: string; url: string; name: string; type: string; alt?: string | null }> }>(`/api/sites/${siteId}/media?limit=12`),
      ]);

      if (!siteRes.success || !siteRes.data) throw new Error(siteRes.error || "Failed to load site");
      if (!pagesRes.success || !pagesRes.data) throw new Error(pagesRes.error || "Failed to load pages");
      if (!customizationRes.success || !customizationRes.data) throw new Error(customizationRes.error || "Failed to load customization");

      const siteRecord = siteRes.data as SiteRecord;
      setSite(siteRecord);
      setPages(pagesRes.data.pages || []);
      if (!persistedEditorState?.customization) {
        const customizationData = customizationRes.data as { customization: SiteCustomizationDocument } | undefined;
        if (customizationData?.customization) {
          setCustomization(normalizeSiteCustomization(customizationData.customization));
        }
      }
      if (!persistedEditorState?.siteDraft) {
        setSiteDraft({
          name: siteRecord.name || "",
          description: siteRecord.description || "",
          logo: siteRecord.logo || "",
          coverImage: siteRecord.coverImage || "",
          businessType: siteRecord.businessType || "general",
          currency: siteRecord.currency || "GHS",
          customDomain: siteRecord.customDomain || "",
          whatsappNumber: siteRecord.settings?.whatsappNumber || "",
          metaTitle: siteRecord.settings?.metaTitle || siteRecord.name || "",
          metaDescription: siteRecord.settings?.metaDescription || siteRecord.description || "",
        });
      }
      if (!selectedPageId) {
        const home = (pagesRes.data.pages || []).find((page) => page.type === "HOME") || pagesRes.data.pages?.[0] || null;
        setSelectedPageId(home?.id || null);
      }
      setMediaItems(mediaRes.success && mediaRes.data ? mediaRes.data.items || [] : []);
      setMediaLoading(false);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load editor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loadData();
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data || event.data.type !== "afro-site-customization-preview") return;
      const next = normalizeSiteCustomization(event.data.customization || null);
      setCustomization(next);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const selectedPage = useMemo(() => pages.find((page) => page.id === selectedPageId) || pages.find((page) => page.type === "HOME") || pages[0] || null, [pages, selectedPageId]);
  const selectedPageCustomization = useMemo(() => selectedPage ? customization.pageSettings[selectedPage.id] || {} : {}, [customization.pageSettings, selectedPage]);
  const previewHref = useMemo(() => {
    if (!site) return "";
    const pagePath = selectedPage && selectedPage.type !== "HOME" ? `/${selectedPage.slug}` : "";
    return `/store/${site.slug}${pagePath}?afro_editor=1`;
  }, [selectedPage, site]);
  const sectionBlocks = useMemo(() => selectedPage ? parsePageContent(selectedPage.content).blocks : [], [selectedPage]);
  const visiblePages = useMemo(() => filterVisiblePages(pages, customization), [pages, customization]);
  const canUseTemplatePreview = false;

  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage({
      type: "afro-site-customization-preview",
      customization,
    }, "*");
  }, [customization, previewHref]);

  const saveAll = async () => {
    if (!site) return;
    setSaving(true);
    setError("");
    try {
      const [siteRes, settingsRes, customizationRes] = await Promise.all([
        api.patch(`/api/sites/${siteId}`, {
          name: siteDraft.name,
          description: siteDraft.description,
          logo: siteDraft.logo || null,
          coverImage: siteDraft.coverImage || null,
          businessType: siteDraft.businessType,
          currency: siteDraft.currency,
          customDomain: siteDraft.customDomain || null,
        }),
        api.patch(`/api/sites/${siteId}/settings`, {
          whatsappNumber: siteDraft.whatsappNumber || null,
          metaTitle: siteDraft.metaTitle || null,
          metaDescription: siteDraft.metaDescription || null,
        }),
        api.patch(`/api/sites/${siteId}/customization`, {
          ...customization,
          note: "Saved from visual editor",
        }),
      ]);

      if (!siteRes.success) throw new Error(siteRes.error || "Failed to update site");
      if (!settingsRes.success) throw new Error(settingsRes.error || "Failed to update settings");
      if (!customizationRes.success) throw new Error(customizationRes.error || "Failed to update customization");

      if (siteRes.data) setSite(siteRes.data as SiteRecord);
      if (!persistedEditorState?.customization) {
        const customizationData = customizationRes.data as { customization: SiteCustomizationDocument } | undefined;
        if (customizationData?.customization) setCustomization(normalizeSiteCustomization(customizationData.customization));
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save changes");
    } finally {
      setSaving(false);
    }
  };

  const updatePage = async (pageId: string, update: Partial<PageRecord>) => {
    const page = pages.find((item) => item.id === pageId);
    if (!page) return;
    const res = await api.patch(`/api/sites/${siteId}/pages/${pageId}`, update);
    if (res.success) {
      await loadData();
    } else {
      setError(res.error || "Unable to update page");
    }
  };

  const duplicatePage = async (page: PageRecord) => {
    const res = await api.post(`/api/sites/${siteId}/pages`, {
      title: `${page.title} Copy`,
      type: "CUSTOM",
      content: page.content || { blocks: [] },
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      isPublished: false,
      position: pages.length,
    });
    if (res.success) await loadData();
  };

  const deletePage = async (pageId: string) => {
    if (!confirm("Delete this page?")) return;
    const res = await api.delete(`/api/sites/${siteId}/pages/${pageId}`);
    if (res.success) await loadData();
  };

  const movePage = async (page: PageRecord, direction: -1 | 1) => {
    const visible = [...pages].sort((a, b) => a.position - b.position);
    const index = visible.findIndex((item) => item.id === page.id);
    const target = visible[index + direction];
    if (!target) return;
    await Promise.all([
      api.patch(`/api/sites/${siteId}/pages/${page.id}`, { position: target.position }),
      api.patch(`/api/sites/${siteId}/pages/${target.id}`, { position: page.position }),
    ]);
    await loadData();
  };

  const updatePageSetting = (key: string, value: string | boolean | null) => {
    if (!selectedPage) return;
    setCustomization((prev) => ({
      ...prev,
      pageSettings: {
        ...prev.pageSettings,
        [selectedPage.id]: {
          ...(prev.pageSettings[selectedPage.id] || {}),
          [key]: value,
        } as SiteCustomizationPageSettings,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error || "Site not found."}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* Left */}
      <aside className="w-80 border-r border-surface-200 bg-white">
        <div className="border-b border-surface-200 p-4">
          <Link href={`/dashboard/sites/${siteId}/customize`} className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-800">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-xl font-bold text-surface-900 font-display">{site.name} Editor</h1>
          <p className="mt-1 text-xs text-surface-500">Visual customization stays layered on top of the selected template.</p>
        </div>

        <div className="flex border-b border-surface-200 text-xs font-semibold">
          {(["pages", "sections", "navigation"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveLeftTab(tab)}
              className={`flex-1 px-3 py-3 capitalize ${activeLeftTab === tab ? "bg-brand-50 text-brand-700" : "text-surface-500"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="h-[calc(100vh-9.5rem)] overflow-y-auto p-4">
          {activeLeftTab === "pages" && (
            <div className="space-y-3">
              <button
                onClick={async () => {
                  const res = await api.post(`/api/sites/${siteId}/pages`, {
                    title: "New Page",
                    type: "CUSTOM",
                    content: { blocks: [] },
                    isPublished: false,
                    position: pages.length,
                  });
                  if (res.success) await loadData();
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <Plus className="h-4 w-4" /> Create Page
              </button>

              <div className="space-y-2">
                {pages
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map((page) => {
                    const pagePreview = applyPageCustomization(page, customization);
                    const pageState = customization.pageSettings[page.id];
                    const hidden = pageState?.hidden === true || pageState?.showInNavigation === false;
                    const active = page.id === selectedPage?.id;
                    return (
                      <div
                        key={page.id}
                        className={`rounded-xl border p-3 ${active ? "border-brand-300 bg-brand-50" : "border-surface-200 bg-white"}`}
                      >
                        <button className="w-full text-left" onClick={() => setSelectedPageId(page.id)}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-surface-900">{pagePreview.title || page.title}</p>
                              <p className="text-[11px] text-surface-500">/{page.slug}</p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${page.isPublished ? "bg-green-50 text-green-700" : "bg-surface-100 text-surface-500"}`}>
                              {page.isPublished ? "Published" : "Draft"}
                            </span>
                          </div>
                        </button>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <button onClick={() => movePage(page, -1)} className="rounded-lg border border-surface-200 px-2 py-1 text-[11px] text-surface-600">
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                          <button onClick={() => updatePage(page.id, { isPublished: !page.isPublished })} className="rounded-lg border border-surface-200 px-2 py-1 text-[11px] text-surface-600">
                            {page.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                          <button onClick={() => duplicatePage(page)} className="rounded-lg border border-surface-200 px-2 py-1 text-[11px] text-surface-600">
                            <Copy className="h-3 w-3" />
                          </button>
                          <button onClick={() => deletePage(page.id)} className="rounded-lg border border-surface-200 px-2 py-1 text-[11px] text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <Link href={`/builder/${page.id}`} className="rounded-lg border border-brand-200 px-2 py-1 text-[11px] text-brand-700">
                            Builder
                          </Link>
                        </div>
                        {hidden && <p className="mt-2 text-[11px] text-amber-700">Hidden from navigation</p>}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeLeftTab === "sections" && selectedPage && (
            <div className="space-y-3">
              <div className="rounded-xl border border-surface-200 bg-surface-50 p-3">
                <p className="text-sm font-semibold text-surface-900">{selectedPage.title}</p>
                <p className="text-xs text-surface-500">Sections are edited in the existing builder, with drag-and-drop already enabled there.</p>
              </div>
              {sectionBlocks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-surface-300 bg-white p-4 text-sm text-surface-500">
                  No sections yet. Open the builder to add sections and blocks.
                </div>
              ) : (
                sectionBlocks.map((block, index) => (
                  <div key={block.id} className="rounded-xl border border-surface-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{block.type}</p>
                        <p className="text-[11px] text-surface-500">Section {index + 1}</p>
                      </div>
                      <Link href={`/builder/${selectedPage.id}`} className="text-[11px] font-semibold text-brand-700">
                        Edit
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeLeftTab === "navigation" && (
            <div className="space-y-2">
              {visiblePages.map((page) => {
                const pageState = customization.pageSettings[page.id];
                const hidden = pageState?.hidden === true || pageState?.showInNavigation === false;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => {
                      setSelectedPageId(page.id);
                      setCustomization((prev) => ({
                        ...prev,
                        pageSettings: {
                          ...prev.pageSettings,
                          [page.id]: {
                            ...(prev.pageSettings[page.id] || {}),
                            hidden: false,
                            showInNavigation: true,
                          },
                        },
                      }));
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                      hidden ? "border-surface-200 bg-surface-50 text-surface-500" : "border-brand-200 bg-brand-50 text-brand-700"
                    }`}
                  >
                    <span>{page.title}</span>
                    {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Center */}
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-surface-200 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-surface-900">{selectedPage?.title || "Preview"}</p>
            <p className="text-xs text-surface-500">Preview updates as you edit theme and page settings.</p>
          </div>
          <div className="flex items-center gap-2">
            {(["desktop", "tablet", "mobile"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  previewMode === mode ? "border-brand-300 bg-brand-50 text-brand-700" : "border-surface-200 bg-white text-surface-600"
                }`}
              >
                {mode === "desktop" ? <Monitor className="h-4 w-4" /> : mode === "tablet" ? <Tablet className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
              </button>
            ))}
            <button onClick={() => router.refresh()} className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-surface-600">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center bg-surface-100 p-4">
          <div
            className="overflow-hidden rounded-[2rem] border border-surface-200 bg-white shadow-xl transition-all"
            style={{
              width: previewMode === "mobile" ? "390px" : previewMode === "tablet" ? "900px" : "100%",
              height: "calc(100vh - 9rem)",
              maxWidth: previewMode === "desktop" ? "100%" : undefined,
            }}
          >
            <iframe
              key={previewHref}
              ref={iframeRef}
              src={previewHref}
              className="h-full w-full border-0"
              title="Site preview"
              onLoad={() => {
                iframeRef.current?.contentWindow?.postMessage({
                  type: "afro-site-customization-preview",
                  customization,
                }, "*");
              }}
            />
          </div>
        </div>
      </main>

      {/* Right */}
      <aside className="w-[26rem] border-l border-surface-200 bg-white">
        <div className="border-b border-surface-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-surface-900">Properties</h2>
              <p className="text-xs text-surface-500">Branding, theme, page, SEO, and code.</p>
            </div>
            <button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
          </div>
        </div>

        <div className="flex border-b border-surface-200 text-xs font-semibold">
          {(["brand", "theme", "page", "nav", "seo", "code", "media"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveRightTab(tab)}
              className={`flex-1 px-2 py-3 capitalize ${activeRightTab === tab ? "bg-brand-50 text-brand-700" : "text-surface-500"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="h-[calc(100vh-9.5rem)] overflow-y-auto p-4 space-y-4">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {activeRightTab === "brand" && (
            <section className="space-y-4">
              <Field label="Store name" value={siteDraft.name} onChange={(value) => setSiteDraft((prev) => ({ ...prev, name: value }))} />
              <Field label="Description" type="textarea" value={siteDraft.description} onChange={(value) => setSiteDraft((prev) => ({ ...prev, description: value }))} rows={4} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Business type" value={siteDraft.businessType} onChange={(value) => setSiteDraft((prev) => ({ ...prev, businessType: value }))} />
                <Field label="Currency" value={siteDraft.currency} onChange={(value) => setSiteDraft((prev) => ({ ...prev, currency: value }))} />
              </div>
              <Field label="Custom domain" value={siteDraft.customDomain} onChange={(value) => setSiteDraft((prev) => ({ ...prev, customDomain: value }))} placeholder="yourdomain.com" />
              <Field label="WhatsApp number" value={siteDraft.whatsappNumber} onChange={(value) => setSiteDraft((prev) => ({ ...prev, whatsappNumber: value }))} placeholder="+234..." />
              <div className="grid grid-cols-2 gap-3">
                <SingleImageUpload image={siteDraft.logo || null} onChange={(value) => setSiteDraft((prev) => ({ ...prev, logo: value || "" }))} label="Logo" compact />
                <SingleImageUpload image={siteDraft.coverImage || null} onChange={(value) => setSiteDraft((prev) => ({ ...prev, coverImage: value || "" }))} label="Cover image" compact />
              </div>
            </section>
          )}

          {activeRightTab === "theme" && (
            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Primary" type="color" value={customization.themeSettings.colors?.primary || "#111827"} onChange={(value) => setCustomization((prev) => ({ ...prev, themeSettings: { ...prev.themeSettings, colors: { ...(prev.themeSettings.colors || {}), primary: value } } }))} />
                <Field label="Accent" type="color" value={customization.themeSettings.colors?.accent || "#2563eb"} onChange={(value) => setCustomization((prev) => ({ ...prev, themeSettings: { ...prev.themeSettings, colors: { ...(prev.themeSettings.colors || {}), accent: value } } }))} />
                <Field label="Background" type="color" value={customization.themeSettings.colors?.background || "#ffffff"} onChange={(value) => setCustomization((prev) => ({ ...prev, themeSettings: { ...prev.themeSettings, colors: { ...(prev.themeSettings.colors || {}), background: value } } }))} />
                <Field label="Text" type="color" value={customization.themeSettings.colors?.text || "#111827"} onChange={(value) => setCustomization((prev) => ({ ...prev, themeSettings: { ...prev.themeSettings, colors: { ...(prev.themeSettings.colors || {}), text: value } } }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Header bg" type="color" value={customization.themeSettings.colors?.headerBg || "#ffffff"} onChange={(value) => setCustomization((prev) => ({ ...prev, themeSettings: { ...prev.themeSettings, colors: { ...(prev.themeSettings.colors || {}), headerBg: value } } }))} />
                <Field label="Footer bg" type="color" value={customization.themeSettings.colors?.footerBg || "#111827"} onChange={(value) => setCustomization((prev) => ({ ...prev, themeSettings: { ...prev.themeSettings, colors: { ...(prev.themeSettings.colors || {}), footerBg: value } } }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Heading font" value={customization.themeSettings.typography?.headingFont || "Inter"} onChange={(value) => setCustomization((prev) => ({ ...prev, themeSettings: { ...prev.themeSettings, typography: { ...(prev.themeSettings.typography || {}), headingFont: value } } }))} />
                <Field label="Body font" value={customization.themeSettings.typography?.bodyFont || "Inter"} onChange={(value) => setCustomization((prev) => ({ ...prev, themeSettings: { ...prev.themeSettings, typography: { ...(prev.themeSettings.typography || {}), bodyFont: value } } }))} />
              </div>
            </section>
          )}

          {activeRightTab === "page" && selectedPage && (
            <section className="space-y-4">
              <Field label="Page title" value={selectedPageCustomization.title || selectedPage.title} onChange={(value) => updatePageSetting("title", value)} />
              <Field label="Page slug" value={selectedPageCustomization.slug || selectedPage.slug} onChange={(value) => updatePageSetting("slug", value)} />
              <Field label="Meta title" value={selectedPageCustomization.metaTitle || selectedPage.metaTitle || ""} onChange={(value) => updatePageSetting("metaTitle", value)} />
              <Field label="Meta description" type="textarea" value={selectedPageCustomization.metaDescription || selectedPage.metaDescription || ""} onChange={(value) => updatePageSetting("metaDescription", value)} rows={4} />
              <div className="space-y-2">
                <Toggle label="Published" checked={selectedPageCustomization.isPublished ?? selectedPage.isPublished} onChange={(value) => updatePageSetting("isPublished", value)} />
                <Toggle label="Show in navigation" checked={selectedPageCustomization.showInNavigation !== false} onChange={(value) => updatePageSetting("showInNavigation", value)} />
                <Toggle label="Hidden" checked={selectedPageCustomization.hidden === true} onChange={(value) => updatePageSetting("hidden", value)} />
              </div>
              <Field label="Background color" type="color" value={selectedPageCustomization.backgroundColor || "#ffffff"} onChange={(value) => updatePageSetting("backgroundColor", value)} />
              <SingleImageUpload image={selectedPageCustomization.backgroundImage || null} onChange={(value) => updatePageSetting("backgroundImage", value || null)} label="Background image" compact />
            </section>
          )}

          {activeRightTab === "nav" && (
            <section className="space-y-4">
              <p className="text-xs text-surface-500">
                Define your store's navigation menu. Items appear in the header and mobile menu. Drag to reorder.
              </p>

              {/* Existing nav items */}
              {(() => {
                const navItems = (customization.navigationSettings.items as Array<{ id: string; label: string; url: string; type: string; openInNewTab?: boolean }>) || [];

                const updateNavItems = (items: typeof navItems) => {
                  setCustomization((prev) => ({
                    ...prev,
                    navigationSettings: {
                      ...prev.navigationSettings,
                      items,
                    },
                  }));
                };

                const addNavItem = () => {
                  updateNavItems([
                    ...navItems,
                    { id: crypto.randomUUID(), label: "New Link", url: "/", type: "custom", openInNewTab: false },
                  ]);
                };

                const removeNavItem = (id: string) => {
                  updateNavItems(navItems.filter((item) => item.id !== id));
                };

                const updateNavItem = (id: string, field: string, value: string | boolean) => {
                  updateNavItems(navItems.map((item) => item.id === id ? { ...item, [field]: value } : item));
                };

                const moveNavItem = (index: number, direction: -1 | 1) => {
                  const newItems = [...navItems];
                  const targetIndex = index + direction;
                  if (targetIndex < 0 || targetIndex >= newItems.length) return;
                  [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
                  updateNavItems(newItems);
                };

                // Build page link options for the dropdown
                const pageOptions = pages
                  .filter((p) => p.isPublished || (customization.pageSettings[p.id] as any)?.isPublished)
                  .map((p) => ({
                    label: p.title,
                    value: p.type === "HOME" ? "/" : `/${p.slug}`,
                    type: "page",
                  }));

                return (
                  <div className="space-y-3">
                    {navItems.length === 0 && (
                      <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-4 text-center text-xs text-surface-500">
                        No navigation items yet. Add your first menu link below.
                        <br />
                        <span className="text-[11px] text-surface-400">Default links (Home, Shop, Reviews) will show until you add custom items.</span>
                      </div>
                    )}

                    {navItems.map((item, index) => (
                      <div key={item.id} className="rounded-xl border border-surface-200 bg-white p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-surface-700 truncate flex-1">{item.label || "Untitled"}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveNavItem(index, -1)}
                              disabled={index === 0}
                              className="p-1 text-surface-400 hover:text-surface-700 disabled:opacity-30"
                              title="Move up"
                            >
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeNavItem(item.id)}
                              className="p-1 text-red-400 hover:text-red-600"
                              title="Remove"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <Field
                          label="Label"
                          value={item.label}
                          onChange={(value) => updateNavItem(item.id, "label", value)}
                          placeholder="e.g. Shop, About, Contact"
                        />

                        <label className="block text-xs font-medium text-surface-700">
                          Link type
                          <select
                            value={item.type}
                            onChange={(e) => {
                              const newType = e.target.value;
                              updateNavItem(item.id, "type", newType);
                              if (newType === "home") updateNavItem(item.id, "url", "/");
                              else if (newType === "shop") updateNavItem(item.id, "url", "/shop");
                              else if (newType === "reviews") updateNavItem(item.id, "url", "/reviews");
                            }}
                            className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm"
                          >
                            <option value="custom">Custom URL</option>
                            <option value="home">Home</option>
                            <option value="shop">Shop</option>
                            <option value="reviews">Reviews</option>
                            <option value="page">Page</option>
                            <option value="external">External link</option>
                          </select>
                        </label>

                        {item.type === "page" ? (
                          <label className="block text-xs font-medium text-surface-700">
                            Page
                            <select
                              value={item.url}
                              onChange={(e) => updateNavItem(item.id, "url", e.target.value)}
                              className="mt-1 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm"
                            >
                              <option value="">Select a page...</option>
                              {pageOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </label>
                        ) : item.type === "custom" || item.type === "external" ? (
                          <Field
                            label="URL"
                            value={item.url}
                            onChange={(value) => updateNavItem(item.id, "url", value)}
                            placeholder={item.type === "external" ? "https://example.com" : "/your-page"}
                          />
                        ) : null}

                        {item.type === "external" && (
                          <Toggle
                            label="Open in new tab"
                            checked={item.openInNewTab ?? false}
                            onChange={(value) => updateNavItem(item.id, "openInNewTab", value)}
                          />
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addNavItem}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-300 px-4 py-3 text-sm font-semibold text-surface-600 hover:border-brand-400 hover:text-brand-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add Menu Item
                    </button>

                    {navItems.length > 0 && (
                      <div className="rounded-xl bg-brand-50 border border-brand-200 p-3 text-xs text-brand-700">
                        <strong>💡 Tip:</strong> Links like <code>/shop</code> or <code>/about</code> are relative to your store. External links (starting with <code>https://</code>) open outside your store.
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>
          )}

          {activeRightTab === "seo" && (
            <section className="space-y-4">
              <Field label="Site meta title" value={siteDraft.metaTitle} onChange={(value) => setSiteDraft((prev) => ({ ...prev, metaTitle: value }))} />
              <Field label="Site meta description" type="textarea" value={siteDraft.metaDescription} onChange={(value) => setSiteDraft((prev) => ({ ...prev, metaDescription: value }))} rows={4} />
              <Field label="Canonical URL" value={String(customization.seoSettings.canonicalUrl || "")} onChange={(value) => setCustomization((prev) => ({ ...prev, seoSettings: { ...prev.seoSettings, canonicalUrl: value } }))} placeholder="https://..." />
            </section>
          )}

          {activeRightTab === "code" && (
            <section className="space-y-4">
              <Field label="Custom CSS" type="textarea" value={customization.customCss} onChange={(value) => setCustomization((prev) => ({ ...prev, customCss: value }))} rows={10} />
              <Field label="Custom JavaScript" type="textarea" value={customization.customJs} onChange={(value) => setCustomization((prev) => ({ ...prev, customJs: value }))} rows={10} />
            </section>
          )}

          {activeRightTab === "media" && (
            <section className="space-y-4">
              <div className="rounded-xl border border-surface-200 bg-surface-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-surface-900">
                  <ImageIcon className="h-4 w-4 text-brand-600" /> Media library
                </div>
                <p className="text-xs text-surface-500">Upload and manage files in the dedicated media library.</p>
                <Link href={`/dashboard/media`} className="mt-3 inline-flex rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white">
                  Open media library
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {mediaLoading ? (
                  <div className="col-span-3 flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-brand-600" /></div>
                ) : mediaItems.length === 0 ? (
                  <div className="col-span-3 rounded-xl border border-dashed border-surface-300 bg-white p-4 text-xs text-surface-500">No media items yet.</div>
                ) : (
                  mediaItems.map((item) => (
                    <button key={item.id} type="button" onClick={() => navigator.clipboard?.writeText(item.url)} className="overflow-hidden rounded-xl border border-surface-200 bg-white text-left">
                      <div className="aspect-square bg-surface-50">
                        {item.type === "IMAGE" ? <img src={item.url} alt={item.alt || item.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] text-surface-400">{item.type}</div>}
                      </div>
                      <div className="p-2">
                        <p className="truncate text-[11px] font-medium text-surface-700">{item.name}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>
          )}

          <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-xs text-surface-500">
            {canUseTemplatePreview ? "Template preview is powered by the live storefront renderer." : "This site uses the storefront renderer."}
          </div>
        </div>
      </aside>
    </div>
  );
}
