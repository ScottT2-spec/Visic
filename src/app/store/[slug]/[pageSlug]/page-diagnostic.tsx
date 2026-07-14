"use client";
import { ArrowRight, Loader2, X } from "lucide-react";
import { Heart, Menu, MessageCircle, Phone, Search, ShoppingBag, ShoppingCart } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RenderBlocks, type BuilderBlock, type StoreProduct } from "@/components/storefront/BlockRenderer";
import { parsePageContent, getLinkedPageHref } from "@/lib/page-content";
import { mergeBespokeTemplateBlocks } from "@/lib/templates/bespoke-page-content";
import { ThemeProvider, type ThemeData } from "@/components/storefront/ThemeProvider";
import { useWishlist } from "@/hooks/useWishlist";
import { applyPageCustomization, buildPageBackgroundStyle, buildThemeDataWithCustomization, filterVisiblePages, getResolvedPageSettings, normalizeSiteCustomization, type SiteCustomizationDocument } from "@/lib/site-customization";
import { KidsHeader, KidsFooterFull } from "@/components/storefront/KidsTemplateBlocks";

/* ─── TYPES ─────────────────────────────────────────────────── */

interface PageData {
  store: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    currency: string;
    country: string;
    businessType: string;
  };
  page: {
    id: string;
    title: string;
    slug: string;
    type: string;
    content: unknown;
    metaTitle?: string;
    metaDescription?: string;
  };
  settings: {
    whatsappOrdering?: boolean;
    whatsappNumber?: string;
  };
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  products: StoreProduct[];
  categories: Array<{ id: string; name: string; slug: string; _count: { products: number } }>;
  deliveryZones: Array<{ id: string; name: string; fee: number; freeAbove?: number }>;
  pages: Array<{ id: string; title: string; slug: string; type: string }>;
  templateSlug: string | null;
  theme: ThemeData | null;
  customization?: SiteCustomizationDocument | null;
}

/* ─── MAIN PAGE ─────────────────────────────────────────────── */

export default function StorefrontPageDiagnostic() {
  const params = useParams();
  const slug = params.slug as string;
  const pageSlug = params.pageSlug as string;

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draftCustomization, setDraftCustomization] = useState<SiteCustomizationDocument | null>(null);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);

  const addDiagnostic = (stage: string, details: any) => {
    console.log(`[DIAGNOSTIC ${stage}]`, details);
    setDiagnostics(prev => [...prev, { stage, timestamp: new Date().toISOString(), ...details }]);
  };

  const { isWishlisted, toggleWishlist } = useWishlist(data?.store?.id || "");

  useEffect(() => {
    (async () => {
      try {
        addDiagnostic("REQUEST_START", { slug, pageSlug });
        
        const res = await fetch(`/api/storefront/${slug}/pages/${pageSlug}`);
        const json = await res.json();
        
        addDiagnostic("API_RESPONSE", { 
          success: json.success, 
          error: json.error,
          hasData: !!json.data,
          pageId: json.data?.page?.id,
          pageSlug: json.data?.page?.slug,
          pageTitle: json.data?.page?.title,
          pageType: json.data?.page?.type,
          templateSlug: json.data?.templateSlug,
          contentType: typeof json.data?.page?.content,
          hasContent: !!json.data?.page?.content,
          contentKeys: json.data?.page?.content ? Object.keys(json.data?.page?.content) : [],
          contentBlocksType: typeof json.data?.page?.content?.blocks,
          contentBlocksLength: Array.isArray(json.data?.page?.content?.blocks) ? json.data?.page?.content?.blocks.length : 'N/A',
          first5BlockTypes: Array.isArray(json.data?.page?.content?.blocks) ? json.data?.page?.content?.blocks.slice(0, 5).map((b: any) => b.type) : [],
        });
        
        if (json.success && json.data) {
          setData(json.data);
          setDraftCustomization(normalizeSiteCustomization(json.data.customization || null));
          
          const resolvedPage = applyPageCustomization(json.data.page, draftCustomization);
          addDiagnostic("AFTER_CUSTOMIZATION", {
            pageId: resolvedPage.id,
            contentType: typeof resolvedPage.content,
            hasContent: !!resolvedPage.content,
            contentKeys: resolvedPage.content ? Object.keys(resolvedPage.content) : [],
          });
          
          const parsedContent = parsePageContent(resolvedPage.content);
          addDiagnostic("AFTER_PARSE", {
            blocksLength: parsedContent.blocks.length,
            settingsKeys: Object.keys(parsedContent.settings),
            first5BlockTypes: parsedContent.blocks.slice(0, 5).map((b: any) => b.type),
          });
          
          const CHROME_BLOCK_TYPES = new Set([
            'perfumesHeader', 'perfumesFooter',
            'handmadeBagsHeader', 'handmadeBagsFooter',
            'cosmeticsHeader', 'cosmeticsFooter',
            'kidsHeader', 'kidsFooter', 'kidsFooterFull',
            'tShirtsPrintsHeader', 'tShirtsPrintsFooter',
            'fashionFooter', 'bakeryFooter', 'interiorFooter',
            'groceryFooter', 'healthFooterFull', 'healthFooter',
            'electronicsFooter', 'makeupFooter',
          ]);
          
          const parsedBlocks = parsedContent.blocks.filter((block) => !CHROME_BLOCK_TYPES.has(block.type));
          addDiagnostic("AFTER_FILTER_CHROME", {
            originalBlocks: parsedContent.blocks.length,
            filteredBlocks: parsedBlocks.length,
            removedCount: parsedContent.blocks.length - parsedBlocks.length,
          });
          
          const blocks: BuilderBlock[] = parsedBlocks.length > 0
            ? parsedBlocks
            : (mergeBespokeTemplateBlocks(json.data.templateSlug, pageSlug, resolvedPage.content, { pageSlug: pageSlug as string, pageTitle: resolvedPage.title, pageType: resolvedPage.type, templateSlug: json.data.templateSlug }) as unknown as BuilderBlock[]);
          
          addDiagnostic("FINAL_BLOCKS", {
            usedParsed: parsedBlocks.length > 0,
            usedBespokeFallback: parsedBlocks.length === 0,
            finalBlocksLength: blocks.length,
            first5BlockTypes: blocks.slice(0, 5).map((b: any) => b.type),
          });
          
          const title = json.data.page.metaTitle || `${json.data.page.title} — ${json.data.store.name}`;
          document.title = title;
        } else {
          setError(json.error || "Page not found");
        }
      } catch (err) {
        addDiagnostic("ERROR", { error: String(err) });
        setError("Failed to load page");
      }
      setLoading(false);
    })();
  }, [slug, pageSlug]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-surface-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <ShoppingBag className="h-12 w-12 text-surface-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Page not found</h1>
          <p className="text-surface-500 mb-6">{error || "This page doesn't exist."}</p>
          <Link
            href={`/store/${slug}`}
            className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm hover:text-brand-700"
          >
            <ArrowRight className="h-4 w-4 rotate-180" /> Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={data.theme}>
      <div className="min-h-screen bg-[#fffef8] text-[#3b3344]">
        <KidsHeader
          storeName={data.store.name}
          storeSlug={slug}
          logo={data.store.logo}
          templateSlug="kids"
          cartCount={0}
          wishlistCount={0}
        />
        <main>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5857c]">Page</p>
              <h1 className="mt-3 font-serif text-4xl text-[#3b3344]">{data.page.title}</h1>
            </div>
            
            {/* DIAGNOSTICS PANEL */}
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h2 className="text-lg font-bold text-red-900 mb-4">Runtime Diagnostics</h2>
              <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-bold text-blue-900 mb-2">Raw Page Content</h3>
              <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded">
                {JSON.stringify(data.page.content, null, 2)}
              </pre>
            </div>
          </div>
        </main>
        <KidsFooterFull
          storeName={data.store.name}
          storeSlug={slug}
          logo={data.store.logo}
          templateSlug="kids"
          description={data.store.description || "Playful kidswear, gifts, and accessories with a premium WoodMart-inspired finish."}
        />
      </div>
    </ThemeProvider>
  );
}
