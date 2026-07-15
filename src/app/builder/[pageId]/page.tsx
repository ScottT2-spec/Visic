"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";
import { VisicSite, DesignSystem, Page, Section } from "@/types";
import BuilderWorkspace from "@/components/builder/BuilderWorkspace";
import { Loader2 } from "lucide-react";
import { convertBlocksToSections, convertSectionsToBlocks } from "@/lib/content-converter";

// Default design system
const defaultDesignSystem: DesignSystem = {
  colors: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    accent: "#f59e0b",
    background: "#ffffff",
    text: "#1f2937",
    mutedText: "#6b7280",
    border: "#e5e7eb",
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
  },
  typography: {
    h1: {
      fontSize: "2.5rem",
      fontWeight: "600",
      lineHeight: "1.2",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: "600",
      lineHeight: "1.3",
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: "600",
      lineHeight: "1.4",
    },
    body: {
      fontSize: "1rem",
      fontWeight: "400",
      lineHeight: "1.6",
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: "600",
      lineHeight: "1.5",
    },
  },
  borderRadius: "md",
};

// Default pages
const defaultPages: Page[] = [
  {
    id: "home",
    name: "Home",
    slug: "/",
    sections: [],
    isSystem: true,
  },
  {
    id: "about",
    name: "About",
    slug: "/about",
    sections: [],
    isSystem: true,
  },
  {
    id: "contact",
    name: "Contact",
    slug: "/contact",
    sections: [],
    isSystem: true,
  },
];

export default function BuilderPage({ params }: { params: Promise<{ pageId: string }> }) {
  const resolvedParams = use(params);
  const { pageId } = resolvedParams;
  const { user } = useAuth();
  const router = useRouter();
  const [site, setSite] = useState<VisicSite | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    let cancelled = false;

    const loadSite = async () => {
      if (cancelled) return;
      
      try {
        setLoading(true);
        setError(null);

        // First, get the page to find the site ID
        const pageRes = await api.get<{ siteId: string }>(`/api/pages/${pageId}`);
        if (cancelled) return;
        
        if (!pageRes.success || !pageRes.data?.siteId) {
          setError("Failed to get page information");
          setLoading(false);
          return;
        }

        const resolvedSiteId = pageRes.data.siteId;
        setSiteId(resolvedSiteId);

        // Load the existing site data from the sites API
        const siteRes = await api.get<any>(`/api/sites/${resolvedSiteId}`);
        if (cancelled) return;
        
        // Load pages to get actual content
        const pagesRes = await api.get<any>(`/api/sites/${resolvedSiteId}/pages`);
        if (cancelled) return;
        
        if (siteRes.success && siteRes.data) {
          // Convert existing pages to VisicSite format
          const convertedPages = (pagesRes.data?.pages || []).map((page: any) => ({
            id: page.id,
            name: page.title,
            slug: page.slug,
            sections: page.content ? convertBlocksToSections((page.content as any).blocks || []) : [],
            isSystem: page.type === "HOME" || page.type === "LANDING",
          }));
          
          // Find the current page
          const currentPage = convertedPages.find((p: Page) => p.id === pageId) || convertedPages[0];
          
          // Convert existing site data to VisicSite format
          const siteData: VisicSite = {
            id: resolvedSiteId,
            workspaceId: siteRes.data.workspaceId || user.id,
            name: siteRes.data.name || "My Site",
            contactWhatsApp: siteRes.data.contactWhatsApp || "",
            businessName: siteRes.data.businessName || "",
            logoUrl: siteRes.data.logo || "",
            theme: {
              id: "default",
              name: "Default Theme",
              designSystem: defaultDesignSystem,
            },
            sections: currentPage?.sections || [],
            pages: convertedPages.length > 0 ? convertedPages : defaultPages,
            activePageId: currentPage?.id || "home",
            customCss: "",
            mediaLibrary: [],
            products: [],
            deliveryAreas: [],
            lowDataMode: false,
          };
          setSite(siteData);
        } else {
          setError("Failed to load site");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load site:", err);
          setError("Failed to load site");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSite();

    return () => {
      cancelled = true;
    };
  }, [pageId, user, router]);

  const handleSiteUpdate = (updatedSite: VisicSite) => {
    setSite(updatedSite);
  };

  const handleSave = async () => {
    if (!site || !siteId) return;
    
    try {
      // Convert all pages' sections back to blocks format
      const pagesToUpdate = site.pages.map((page) => {
        const blocks = convertSectionsToBlocks(page.sections);
        console.log(`[Save] Converting page ${page.id} (${page.name}):`, {
          sectionsCount: page.sections.length,
          blocksCount: blocks.length,
          firstBlock: blocks[0] ? { id: blocks[0].id, type: blocks[0].type, props: blocks[0].props } : null,
        });
        return {
          id: page.id,
          title: page.name,
          slug: page.slug,
          type: page.isSystem ? "HOME" : "CUSTOM",
          content: { blocks },
          isPublished: true,
        };
      });

      // Update each page individually using the pages API
      for (const pageData of pagesToUpdate) {
        const res = await api.patch(`/api/sites/${siteId}/pages/${pageData.id}`, pageData);
        if (!res.success) {
          throw new Error(`Failed to save page ${pageData.id}`);
        }
      }

      console.log("All pages saved successfully");
    } catch (err) {
      console.error("Failed to save pages:", err);
      throw err;
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error || "Site not found"}</p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-4 text-brand-600 hover:underline"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <BuilderWorkspace
      site={site}
      onSiteUpdate={handleSiteUpdate}
      onSave={handleSave}
      onBack={handleBack}
    />
  );
}
