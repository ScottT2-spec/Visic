"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

function getStorageKey(siteId: string) {
  return `wishlist_${siteId}`;
}

function readWishlist(siteId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(siteId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(siteId: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(siteId), JSON.stringify(ids));
  } catch {
    // localStorage full or unavailable
  }
}

export function useWishlist(siteId: string) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Initialize from localStorage after mount
  useEffect(() => {
    setWishlist(readWishlist(siteId));
  }, [siteId]);

  // Sync across tabs
  useEffect(() => {
    const key = getStorageKey(siteId);
    const handler = (e: StorageEvent) => {
      if (e.key === key) {
        setWishlist(readWishlist(siteId));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [siteId]);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (productId: string): boolean => {
      const current = readWishlist(siteId);
      let next: string[];
      let added: boolean;
      if (current.includes(productId)) {
        next = current.filter((id) => id !== productId);
        added = false;
      } else {
        next = [...current, productId];
        added = true;
      }
      writeWishlist(siteId, next);
      setWishlist(next);
      return added;
    },
    [siteId]
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      const current = readWishlist(siteId);
      const next = current.filter((id) => id !== productId);
      writeWishlist(siteId, next);
      setWishlist(next);
    },
    [siteId]
  );

  const clearWishlist = useCallback(() => {
    writeWishlist(siteId, []);
    setWishlist([]);
  }, [siteId]);

  const wishlistCount = wishlist.length;

  return {
    wishlist,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    wishlistCount,
  };
}
