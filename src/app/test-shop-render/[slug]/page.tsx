"use client";

import { useEffect, useState } from "react";
import { ShopPageContent } from "@/components/storefront/ShopPageContent";

export default function TestShopRenderPage({ params }: { params: { slug: string } }) {
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch storefront data
        const res = await fetch(`/api/storefront/${params.slug}`);
        const json = await res.json();
        
        if (json.success && json.data) {
          setStoreData(json.data);
        }
      } catch (e) {
        console.error("Failed to load data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!storeData) {
    return <div className="min-h-screen flex items-center justify-center">Failed to load</div>;
  }

  return (
    <ShopPageContent
      storeSlug={params.slug}
      storeData={storeData}
    />
  );
}
