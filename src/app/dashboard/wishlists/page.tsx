"use client";
import { Loader2 } from "lucide-react";
import { Heart, Package, TrendingUp, Users } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface WishlistProduct { id: string; name: string; slug: string; price: string; images: string[]; }
interface WishlistItemData { id: string; productId: string; addedAt: string; product: WishlistProduct; }
interface WishlistData {
  id: string; createdAt: string;
  customer: { id: string; firstName: string; lastName: string; email: string };
  items: WishlistItemData[]; _count: { items: number };
}
interface MostWishlisted { id?: string; name?: string; slug?: string; price?: string; images?: string[]; wishlistCount: number; }
interface Stats { totalWishlists: number; totalItems: number; mostWishlisted: MostWishlisted[]; }

export default function WishlistsPage() {
  const { currentStore } = useSite();
  const [wishlists, setWishlists] = useState<WishlistData[]>([]);
  const [stats, setStats] = useState<Stats>({ totalWishlists: 0, totalItems: 0, mostWishlisted: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ wishlists: WishlistData[]; stats: Stats }>(`/api/sites/${currentStore.id}/wishlists`);
    if (res.success && res.data) { setWishlists(res.data.wishlists || []); setStats(res.data.stats); }
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-surface-900 font-display">Wishlists</h1><p className="text-sm text-surface-500 mt-1">See what customers are saving for later</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <div className="h-8 w-8 rounded-lg bg-pink-50 flex items-center justify-center"><Users className="h-4 w-4 text-pink-600" /></div>
          <p className="text-lg font-bold text-surface-900 mt-2">{stats.totalWishlists}</p>
          <p className="text-xs text-surface-500">Customers with wishlists</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center"><Heart className="h-4 w-4 text-rose-600" /></div>
          <p className="text-lg font-bold text-surface-900 mt-2">{stats.totalItems}</p>
          <p className="text-xs text-surface-500">Total items wishlisted</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-4">
          <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-purple-600" /></div>
          <p className="text-lg font-bold text-surface-900 mt-2">{stats.totalWishlists > 0 ? (stats.totalItems / stats.totalWishlists).toFixed(1) : "0"}</p>
          <p className="text-xs text-surface-500">Avg items per wishlist</p>
        </div>
      </div>

      {/* Most Wishlisted Products */}
      {stats.mostWishlisted.length > 0 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <h3 className="text-sm font-bold text-surface-900 mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-purple-600" /> Most Wishlisted Products</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.mostWishlisted.map((p, idx) => (
              <div key={idx} className="rounded-xl border border-surface-100 p-3 text-center">
                {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-16 w-16 object-cover rounded-lg mx-auto mb-2" /> : <div className="h-16 w-16 rounded-lg bg-surface-100 mx-auto mb-2 flex items-center justify-center"><Package className="h-6 w-6 text-surface-300" /></div>}
                <p className="text-xs font-semibold text-surface-900 truncate">{p.name || "Unknown"}</p>
                <p className="text-[10px] text-pink-600 font-bold">{p.wishlistCount} ❤️</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wishlists List */}
      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : wishlists.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Heart className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No wishlists yet</h3>
          <p className="text-sm text-surface-500">Customers' wishlists will appear here when they save products.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
          {wishlists.map((w) => (
            <div key={w.id} className="px-5 py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-pink-50 flex items-center justify-center text-xs font-bold text-pink-600">{w.customer.firstName[0]}{w.customer.lastName[0]}</div>
                <div>
                  <p className="text-sm font-semibold text-surface-900">{w.customer.firstName} {w.customer.lastName}</p>
                  <p className="text-xs text-surface-400">{w.customer.email} · {w._count.items} items</p>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {w.items.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex-shrink-0 w-20">
                    {item.product.images?.[0] ? <img src={item.product.images[0]} alt="" className="h-20 w-20 object-cover rounded-lg" /> : <div className="h-20 w-20 rounded-lg bg-surface-100 flex items-center justify-center"><Package className="h-5 w-5 text-surface-300" /></div>}
                    <p className="text-[10px] text-surface-700 truncate mt-1">{item.product.name}</p>
                  </div>
                ))}
                {w._count.items > 6 && <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-surface-50 flex items-center justify-center text-xs text-surface-400">+{w._count.items - 6} more</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
