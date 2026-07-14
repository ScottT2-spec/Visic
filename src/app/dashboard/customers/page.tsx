"use client";
import { Loader2, Plus, X } from "lucide-react";
import { Mail, Phone, Search, ShoppingCart, UserPlus, Users } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

interface CustomersResponse {
  customers: Customer[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export default function CustomersPage() {
  const { currentStore } = useSite();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (search) params.set("search", search);
    const res = await api.get<CustomersResponse>(`/api/sites/${currentStore.id}/customers?${params}`);
    if (res.success && res.data) {
      setCustomers(res.data.customers);
      setTotal(res.data.pagination.total);
    }
    setLoading(false);
  }, [currentStore, page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const currency = currentStore?.currency || "NGN";

  return (
    <>
      <DashboardHeader title="Customers" subtitle={`${total} customers`} />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 max-w-md">
          <Search className="h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
        ) : customers.length === 0 ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <Users className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 mb-2">No customers yet</h3>
            <p className="text-sm text-surface-500">Customers are created when they place orders.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Customer</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400 hidden md:table-cell">Contact</th>
                  <th className="px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">Orders</th>
                  <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-surface-900">{c.firstName} {c.lastName}</div>
                          <div className="text-[10px] text-surface-500">Since {new Date(c.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-surface-500"><Mail className="h-3 w-3" />{c.email}</div>
                      {c.phone && <div className="flex items-center gap-1.5 text-xs text-surface-500 mt-0.5"><Phone className="h-3 w-3" />{c.phone}</div>}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-surface-700"><ShoppingCart className="h-3.5 w-3.5" />{c.totalOrders}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold text-surface-900">
                      {formatCurrency(Number(c.totalSpent), currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 20 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-surface-500">Page {page} of {Math.ceil(total / 20)}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(page + 1)} disabled={page * 20 >= total} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
