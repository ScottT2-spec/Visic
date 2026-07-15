"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { 
  ArrowLeft, Undo2, Redo2, Save, Eye, EyeOff, Monitor, Tablet, Smartphone,
  LayoutGrid, Sparkles, Loader2, Check
} from "lucide-react";
import { VisicSite, DesignSystem, Page, Section, SectionStyleOverrides } from "@/types";
import ThemeProvider from "./ThemeProvider";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import MediaLibrary from "./MediaLibrary";

interface BuilderWorkspaceProps {
  site: VisicSite;
  onSiteUpdate: (site: VisicSite) => void;
  onSave: () => Promise<void>;
  onBack: () => void;
}

type Viewport = "desktop" | "tablet" | "mobile";

export default function BuilderWorkspace({
  site,
  onSiteUpdate,
  onSave,
  onBack,
}: BuilderWorkspaceProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaTargetCallback, setMediaTargetCallback] = useState<((url: string) => void) | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [undoStack, setUndoStack] = useState<VisicSite[]>([]);
  const [redoStack, setRedoStack] = useState<VisicSite[]>([]);
  const [copiedStyles, setCopiedStyles] = useState<SectionStyleOverrides | null>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Get active page
  const activePage = site.pages?.find((p) => p.id === site.activePageId) || {
    id: "home",
    name: "Home",
    slug: "/",
    sections: site.sections,
    isSystem: true,
  };

  // Add to undo stack before making changes
  const pushToUndoStack = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-23), JSON.parse(JSON.stringify(site))]);
    setRedoStack([]);
  }, [site]);

  // Handle design system changes
  const handleDesignSystemChange = (designSystem: DesignSystem) => {
    pushToUndoStack();
    onSiteUpdate({
      ...site,
      theme: {
        ...site.theme,
        designSystem,
      },
    });
  };

  // Handle custom CSS changes
  const handleCustomCssChange = (customCss: string) => {
    pushToUndoStack();
    onSiteUpdate({
      ...site,
      customCss,
    });
  };

  // Handle section selection
  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
  };

  // Handle section update
  const handleSectionUpdate = (updatedSection: Section) => {
    pushToUndoStack();
    const updatedSections = activePage.sections.map((s) =>
      s.id === updatedSection.id ? updatedSection : s
    );
    
    const updatedPages = site.pages?.map((p) =>
      p.id === activePage.id ? { ...p, sections: updatedSections } : p
    );

    onSiteUpdate({
      ...site,
      sections: updatedSections,
      pages: updatedPages,
    });
  };

  // Handle section deletion
  const handleSectionDelete = (sectionId: string) => {
    pushToUndoStack();
    const updatedSections = activePage.sections.filter((s) => s.id !== sectionId);
    
    const updatedPages = site.pages?.map((p) =>
      p.id === activePage.id ? { ...p, sections: updatedSections } : p
    );

    onSiteUpdate({
      ...site,
      sections: updatedSections,
      pages: updatedPages,
    });
    setSelectedSectionId(null);
  };

  // Handle section duplication
  const handleSectionDuplicate = (sectionId: string) => {
    pushToUndoStack();
    const section = activePage.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newSection = {
      ...section,
      id: crypto.randomUUID(),
    };

    const sectionIndex = activePage.sections.findIndex((s) => s.id === sectionId);
    const updatedSections = [
      ...activePage.sections.slice(0, sectionIndex + 1),
      newSection,
      ...activePage.sections.slice(sectionIndex + 1),
    ];

    const updatedPages = site.pages?.map((p) =>
      p.id === activePage.id ? { ...p, sections: updatedSections } : p
    );

    onSiteUpdate({
      ...site,
      sections: updatedSections,
      pages: updatedPages,
    });
  };

  // Handle adding blocks
  const handleAddBlock = (type: string) => {
    pushToUndoStack();
    const newSection: Section = {
      id: crypto.randomUUID(),
      type,
      content: {},
      styleOverrides: {},
    };

    const updatedSections = [...activePage.sections, newSection];
    
    const updatedPages = site.pages?.map((p) =>
      p.id === activePage.id ? { ...p, sections: updatedSections } : p
    );

    onSiteUpdate({
      ...site,
      sections: updatedSections,
      pages: updatedPages,
    });
    setSelectedSectionId(newSection.id);
  };

  // Handle page selection
  const handlePageSelect = (pageId: string) => {
    pushToUndoStack();
    setSelectedSectionId(null);
    onSiteUpdate({
      ...site,
      activePageId: pageId,
    });
  };

  // Handle page creation
  const handlePageCreate = () => {
    pushToUndoStack();
    const newPage: Page = {
      id: crypto.randomUUID(),
      name: `Page ${(site.pages?.length || 0) + 1}`,
      slug: `/page-${(site.pages?.length || 0) + 1}`,
      sections: [],
      isSystem: false,
    };

    onSiteUpdate({
      ...site,
      pages: [...(site.pages || []), newPage],
      activePageId: newPage.id,
    });
  };

  // Handle page duplication
  const handlePageDuplicate = (pageId: string) => {
    pushToUndoStack();
    const page = site.pages?.find((p) => p.id === pageId);
    if (!page) return;

    const newPage: Page = {
      ...page,
      id: crypto.randomUUID(),
      name: `${page.name} (Copy)`,
      slug: `${page.slug}-copy`,
      sections: JSON.parse(JSON.stringify(page.sections)),
    };

    onSiteUpdate({
      ...site,
      pages: [...(site.pages || []), newPage],
    });
  };

  // Handle page deletion
  const handlePageDelete = (pageId: string) => {
    const page = site.pages?.find((p) => p.id === pageId);
    if (page?.isSystem) return;

    pushToUndoStack();
    const updatedPages = site.pages?.filter((p) => p.id !== pageId);
    
    onSiteUpdate({
      ...site,
      pages: updatedPages,
      activePageId: updatedPages?.[0]?.id || "home",
    });
  };

  // Handle section reordering (move up/down)
  const handleSectionMove = (sectionId: string, direction: "up" | "down") => {
    pushToUndoStack();
    const index = activePage.sections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= activePage.sections.length) return;

    const updatedSections = [...activePage.sections];
    [updatedSections[index], updatedSections[newIndex]] = [updatedSections[newIndex], updatedSections[index]];

    const updatedPages = site.pages?.map((p) =>
      p.id === activePage.id ? { ...p, sections: updatedSections } : p
    );

    onSiteUpdate({
      ...site,
      sections: updatedSections,
      pages: updatedPages,
    });
  };

  // Handle copy styles
  const handleCopyStyles = (sectionId: string) => {
    const section = activePage.sections.find((s) => s.id === sectionId);
    if (section?.styleOverrides) {
      setCopiedStyles(section.styleOverrides);
    }
  };

  // Handle paste styles
  const handlePasteStyles = (sectionId: string) => {
    if (!copiedStyles) return;
    pushToUndoStack();
    
    const updatedSections = activePage.sections.map((s) =>
      s.id === sectionId ? { ...s, styleOverrides: { ...copiedStyles } } : s
    );

    const updatedPages = site.pages?.map((p) =>
      p.id === activePage.id ? { ...p, sections: updatedSections } : p
    );

    onSiteUpdate({
      ...site,
      sections: updatedSections,
      pages: updatedPages,
    });
  };

  // Handle undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, site]);
    setUndoStack((prev) => prev.slice(0, -1));
    onSiteUpdate(previousState);
  };

  // Handle redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, site]);
    setRedoStack((prev) => prev.slice(0, -1));
    onSiteUpdate(nextState);
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  // Handle media library launch
  const handleLaunchMediaLibrary = (callback: (url: string) => void) => {
    setMediaTargetCallback(() => callback);
    setMediaLibraryOpen(true);
  };

  // Handle image selection from media library
  const handleImageSelect = (imageUrl: string) => {
    if (mediaTargetCallback) {
      mediaTargetCallback(imageUrl);
    }
    setMediaLibraryOpen(false);
  };

  // Handle file upload
  const handleFileUpload = async (file: File): Promise<string> => {
    // Convert to base64 for local storage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Add to media library
        onSiteUpdate({
          ...site,
          mediaLibrary: [...(site.mediaLibrary || []), base64],
        });
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const selectedSection = activePage.sections.find((s) => s.id === selectedSectionId) || null;

  // Handle viewport changes by resizing iframe
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      switch (viewport) {
        case "mobile":
          iframe.style.width = "375px";
          iframe.style.height = "667px";
          break;
        case "tablet":
          iframe.style.width = "768px";
          iframe.style.height = "1024px";
          break;
        default:
          iframe.style.width = "100%";
          iframe.style.height = "100%";
      }
    }
  }, [viewport]);

  // Listen for block selection messages from preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "builder-block-select") {
        const { blockId } = event.data;
        // Find the matching section in our page sections
        const section = activePage.sections.find((s) => s.id === blockId);
        if (section) {
          setSelectedSectionId(blockId);
        }
      }
      if (event.data?.type === "builder-iframe-ready") {
        setIframeReady(true);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [activePage.sections]);

  // Send section updates to iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && selectedSection) {
      iframeRef.current.contentWindow.postMessage({
        type: "builder-section-update",
        sectionId: selectedSection.id,
        section: selectedSection,
      }, "*");
    }
  }, [selectedSection]);

  // Send theme updates to iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && iframeReady) {
      iframeRef.current.contentWindow.postMessage({
        type: "builder-theme-update",
        theme: site.theme,
      }, "*");
    }
  }, [site.theme, iframeReady]);

  // Get the preview URL based on site and page
  // Use the actual page slug from the database, not a hardcoded list
  // Remove leading slash from slug to avoid double slashes in URL
  const normalizedSlug = activePage.slug.startsWith('/') ? activePage.slug.slice(1) : activePage.slug;
  const previewUrl = `/builder/preview/${site.id}/${normalizedSlug || 'home'}`;

  // Reload iframe when page changes
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = previewUrl;
    }
  }, [previewUrl]);

  return (
    <div className="h-screen flex flex-col bg-surface-50">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-surface-500" />
          </button>
          <div className="h-5 w-px bg-surface-200" />
          <div>
            <h1 className="text-sm font-bold text-surface-900">{site.name}</h1>
            <p className="text-[10px] text-surface-500">{activePage.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Undo/Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-30 transition-colors"
            title="Undo (⌘Z)"
          >
            <Undo2 className="h-4 w-4 text-surface-500" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-30 transition-colors"
            title="Redo (⌘⇧Z)"
          >
            <Redo2 className="h-4 w-4 text-surface-500" />
          </button>

          <div className="h-5 w-px bg-surface-200 mx-1" />

          {/* Viewport Controls */}
          <div className="flex items-center rounded-lg border border-surface-200 p-0.5">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`p-1.5 rounded-md transition-colors ${viewport === "desktop" ? "bg-surface-100" : ""}`}
              title="Desktop"
            >
              <Monitor className="h-4 w-4 text-surface-500" />
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={`p-1.5 rounded-md transition-colors ${viewport === "tablet" ? "bg-surface-100" : ""}`}
              title="Tablet"
            >
              <Tablet className="h-4 w-4 text-surface-500" />
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`p-1.5 rounded-md transition-colors ${viewport === "mobile" ? "bg-surface-100" : ""}`}
              title="Mobile"
            >
              <Smartphone className="h-4 w-4 text-surface-500" />
            </button>
          </div>

          <div className="h-5 w-px bg-surface-200 mx-1" />

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? "Saving..." : saved ? "Saved" : "Save"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          designSystem={site.theme.designSystem}
          onDesignSystemChange={handleDesignSystemChange}
          pages={site.pages || []}
          activePageId={site.activePageId || "home"}
          onPageSelect={handlePageSelect}
          onPageCreate={handlePageCreate}
          onPageDuplicate={handlePageDuplicate}
          onPageDelete={handlePageDelete}
          sections={activePage.sections}
          onSectionSelect={handleSectionSelect}
          onAddBlock={handleAddBlock}
          customCss={site.customCss || ""}
          onCustomCssChange={handleCustomCssChange}
        />

        {/* Center Canvas - Iframe Live Preview */}
        <div className="flex-1 overflow-hidden p-6 bg-surface-100 flex items-center justify-center">
          <div className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300" style={{
            width: viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px",
            height: viewport === "desktop" ? "100%" : viewport === "tablet" ? "1024px" : "667px",
          }}>
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-0"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <RightSidebar
          selectedSection={selectedSection}
          onSectionUpdate={handleSectionUpdate}
          onSectionDelete={handleSectionDelete}
          onSectionDuplicate={handleSectionDuplicate}
          onClose={() => setSelectedSectionId(null)}
          onCopyStyles={handleCopyStyles}
          onPasteStyles={handlePasteStyles}
          hasCopiedStyles={copiedStyles !== null}
          mediaLibrary={site.mediaLibrary}
          onUploadImage={handleFileUpload}
        />
      </div>

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelectImage={handleImageSelect}
        mediaLibrary={site.mediaLibrary}
        onUploadImage={handleFileUpload}
      />
    </div>
  );
}
