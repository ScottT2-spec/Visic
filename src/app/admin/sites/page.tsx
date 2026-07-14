"use client";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Search, Store } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  createdAt: string;
  owner: { firstName: string; lastName: string; email: string };
  _count: { products: number; orders: number; customers: number };
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, page: page.toString(), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    if (planFilter) params.set("plan", planFilter);
    const res = await api.get<{ sites: StoreItem[]; total: number; pages: number }>(`/api/admin/sites?${params}`);
    if (res.success && res.data) {
      setStores(res.data.sites);
      setTotalPages(res.data.pages);
    }
    setLoading(false);
  }, [search, statusFilter, planFilter, page]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const updateStatus = async (siteId: string, newStatus: string) => {
    setUpdatingId(siteId);
    const res = await api.patch(`/api/admin/sites/${siteId}`, { status: newStatus });
    if (res.success) {
      setStores((prev) => prev.map((s) => s.id === siteId ? { ...s, status: newStatus } : s));
    }
    setUpdatingId(null);
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PAUSED: "bg-yellow-100 text-yellow-700",
    SUSPENDED: "bg-accent-100 text-accent-700",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 font-display">Store Management</h1>
        <p className="text-sm text-surface-500 mt-1">Manage all stores on the platform</p>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white">
        <div className="p-4 border-b border-surface-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input type="text" placeholder="Search stores..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-surface-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-surface-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500">
            <option value="">All Plans</option>
            <option value="FREE">Free</option>
            <option value="STARTER">Starter</option>
            <option value="BUSINESS">Business</option>
            <option value="GROWTH">Growth</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-600" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100">
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Store</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Owner</th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">Products</th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">Orders</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Plan</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Status</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Created</th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {stores.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white"><Store className="h-4 w-4" /></div>
                          <div>
                            <p className="text-sm font-medium text-surface-900">{s.name}</p>
                            <p className="text-[10px] text-surface-400">{s.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-surface-500">{s.owner.firstName} {s.owner.lastName}</td>
                      <td className="px-6 py-3.5 text-center text-sm font-semibold">{s._count.products}</td>
                      <td className="px-6 py-3.5 text-center text-sm font-semibold">{s._count.orders}</td>
                      <td className="px-6 py-3.5"><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-100 text-surface-700">{s.plan}</span></td>
                      <td className="px-6 py-3.5"><span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusColors[s.status] || ""}`}>{s.status}</span></td>
                      <td className="px-6 py-3.5 text-sm text-surface-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-3.5 text-center">
                        {updatingId === s.id ? <Loader2 className="h-4 w-4 animate-spin text-accent-600 mx-auto" /> : (
                          <select value={s.status} onChange={(e) => updateStatus(s.id, e.target.value)}
                            className="text-xs rounded-lg border border-surface-200 px-2 py-1 focus:outline-none focus:border-brand-500">
                            <option value="ACTIVE">Active</option>
                            <option value="PAUSED">Paused</option>
                            <option value="SUSPENDED">Suspended</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-surface-100">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-sm text-surface-500">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
