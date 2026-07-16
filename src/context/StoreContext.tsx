"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export interface StoreLike {
  id: string;
  name: string;
  siteType: 'ECOMMERCE' | 'WEBSITE' | 'LANDING_PAGE';
  slug: string;
  subdomain: string;
  currency: string;
  [key: string]: unknown;
}

export interface SiteContextType {
  siteId: string | null;
  siteName: string | null;
  siteType: 'ECOMMERCE' | 'WEBSITE' | 'LANDING_PAGE' | null;
  slug: string | null;
  currency: string;
  setSiteId: (id: string) => void;
  loading: boolean;
  /** @deprecated Use siteId/siteName/slug directly */
  currentStore: StoreLike | null;
  /** @deprecated */
  stores: StoreLike[];
  /** @deprecated Use setSiteId */
  setCurrentStore: (store: StoreLike) => void;
  /** @deprecated */
  refreshStores: () => Promise<StoreLike[]>;
}

const SiteContext = createContext<SiteContextType>({
  siteId: null,
  siteName: null,
  siteType: null,
  slug: null,
  currency: 'GHS',
  setSiteId: () => {},
  loading: true,
  currentStore: null,
  stores: [],
  setCurrentStore: () => {},
  refreshStores: async () => [],
});

export function SiteProvider({ children }: { children: ReactNode }) {
  const [siteId, setSiteIdState] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);
  const [siteType, setSiteType] = useState<SiteContextType['siteType']>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [currency, setCurrency] = useState('GHS');
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState<Record<string, unknown> | null>(null);
  const [storesList, setStoresList] = useState<StoreLike[]>([]);
  const { user, loading: authLoading } = useAuth();

  const getActiveSiteStorageKey = useCallback((userId?: string | null) => {
    return userId ? `activeSiteId:${userId}` : "activeSiteId";
  }, []);

  const resetSiteState = useCallback(() => {
    setSiteIdState(null);
    setSiteName(null);
    setSiteType(null);
    setSlug(null);
    setSubdomain(null);
    setCurrency("NGN");
    setSiteData(null);
  }, []);

  const setSiteId = (id: string) => {
    setSiteIdState(id);
    localStorage.setItem(getActiveSiteStorageKey(user?.id), id);
    localStorage.removeItem("activeSiteId");
  };

  const fetchSiteData = async (id: string) => {
    try {
      const r = await fetch(`/api/sites/${id}`);
      if (!r.ok) {
        throw new Error(String(r.status));
      }
      const data = await r.json();
      const site = data.data || data.site;
      if (site) {
        setSiteName(site.name);
        setSiteType(site.siteType);
        setSlug(site.slug);
        setSubdomain(site.subdomain || site.slug);
        setCurrency(site.currency || 'GHS');
        setSiteData(site);
      } else {
        resetSiteState();
      }
    } catch {
      resetSiteState();
      localStorage.removeItem(getActiveSiteStorageKey(user?.id));
    }
  };

  const refreshStores = async () => {
    try {
      const r = await fetch('/api/sites');
      const data = await r.json();
      const sites = data.data || data.sites || [];
      setStoresList(sites);
      return sites as StoreLike[];
    } catch {}
    return [] as StoreLike[];
  };

  useEffect(() => {
    setLoading(true);
    if (authLoading) return;

    if (!user) {
      resetSiteState();
      setLoading(false);
      return;
    }

    const stored = localStorage.getItem(getActiveSiteStorageKey(user.id));
    resetSiteState();
    if (stored) {
      setSiteIdState(stored);
    }
    (async () => {
      const sites = await refreshStores();
      if (!stored && sites.length > 0) {
        setSiteId(sites[0].id);
      }
      setLoading(false);
    })();
  }, [authLoading, getActiveSiteStorageKey, resetSiteState, user]);

  useEffect(() => {
    if (!siteId) return;
    fetchSiteData(siteId);
  }, [siteId]);

  const currentStore: StoreLike | null = siteId && siteName ? {
    id: siteId,
    name: siteName,
    siteType: siteType || 'ECOMMERCE',
    slug: slug || '',
    subdomain: subdomain || slug || '',
    currency,
    ...(siteData || {}),
  } : null;

  const setCurrentStore = (store: StoreLike) => {
    setSiteId(store.id);
  };

  return (
    <SiteContext.Provider value={{
      siteId, siteName, siteType, slug, currency, setSiteId, loading,
      currentStore, stores: storesList, setCurrentStore, refreshStores,
    }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);
export default SiteContext;
