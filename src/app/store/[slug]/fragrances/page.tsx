"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PerfumesHeader, PerfumesFooter } from "@/components/storefront/PerfumesStoreChrome";
import { RenderTemplateBlocks } from "@/components/storefront/TemplateBlockRenderer";
import { PerfumesStoreContext } from "@/components/storefront/PerfumesTemplateBlocks";
import { PERFUMES_FRAGRANCES_PAGE_BLOCKS } from "@/lib/templates/presets/perfumes-page-presets";

export default function PerfumesFragrancesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/storefront/${slug}`).then(r => r.json()),
      fetch(`/api/storefront/${slug}/pages/fragrances`).then(r => r.json().catch(() => ({ success: false })))
    ])
      .then(([storeRes, pageRes]) => {
        if (!cancelled) {
          if (storeRes?.success && storeRes?.data) setData(storeRes.data);
          if (pageRes?.success && pageRes?.data) setPageData(pageRes.data);
          else if (!cancelled) setPageData(null);
        }
      })
      .catch(() => { if (!cancelled) { setData(null); setPageData(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', Arial, sans-serif" }}>Loading...</div>;
  if (!data) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', Arial, sans-serif" }}>Store not found</div>;

  const { store } = data;
  const socialLinksArray = Object.entries(data.socialLinks || {}).filter(([, url]) => url).map(([p, u]) => ({ platform: p, url: u as string }));

  const ctxValue = {
    products: data.products || [],
    blogs: data.blogs || [],
    currency: store.currency || "USD",
    storeSlug: slug,
    socialLinks: socialLinksArray,
  };

  // Use blocks from database if available, otherwise use preset
  const blocks = pageData?.content?.blocks && pageData.content.blocks.length > 0 
    ? pageData.content.blocks 
    : PERFUMES_FRAGRANCES_PAGE_BLOCKS;

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <PerfumesHeader storeName={store.name} storeSlug={slug} logo={store.logo} />
      <PerfumesStoreContext.Provider value={ctxValue}>
        <RenderTemplateBlocks blocks={blocks} />
      </PerfumesStoreContext.Provider>
      <PerfumesFooter storeName={store.name} storeSlug={slug} logo={store.logo} description={store.description} socialLinks={socialLinksArray} />
    </div>
  );
}
