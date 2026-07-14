"use client";
import { ChevronDown, Loader2 } from "lucide-react";
import { CheckCircle2, Clock, DollarSign, Package, Search, Undo2, XCircle } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface ReturnItem {
  id: string; orderId: string; reason: string; status: string;
  refundAmount: string | null; refundMethod: string | null; items: unknown;
  notes: string | null; resolvedAt: string | null; createdAt: string;
  order: { id: string; orderNumber: string; total: string; customer: { id: string; firstName: string; lastName: string; email: string } | null };
}

const statusStyles: Record<string, string> = {
  REQUESTED: "bg-blue-50 text-blue-700", APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700", RECEIVED: "bg-amber-50 text-amber-700",
  REFUNDED: "bg-purple-50 text-purple-700", CLOSED: "bg-surface-100 text-surface-500",
};

const statusIcons: Record<string, typeof Clock> = {
  REQUESTED: Clock, APPROVED: CheckCircle2, REJECTED: XCircle,
  RECEIVED: Package, REFUNDED: DollarSign, CLOSED: CheckCircle2,
};

const STATUSES = ["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED", "CLOSED"] as const;

export default function ReturnsPage() {
  const { currentStore } = useSite();
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchReturns = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await api.get<{ returns: ReturnItem[]; summary: Record<string, number> }>(`/api/sites/${currentStore.id}/returns?${params}`);
    if (res.success && res.data) { setReturns(res.data.returns || []); setSummary(res.data.summary || {}); }
    setLoading(false);
  }, [currentStore, statusFilter]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const updateStatus = async (id: string, status: string) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/returns/${id}`, { status });
    fetchReturns();
  };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  const totalReturns = Object.values(summary).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 font-display">Returns</h1>
        <p className="text-sm text-surface-500 mt-1">Manage return requests and process refunds</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATUSES.map((s) => {
          const Icon = statusIcons[s];
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className={`rounded-xl border p-3 text-left transition-colors ${statusFilter === s ? "border-brand-500 bg-brand-50" : "border-surface-200 bg-white hover:bg-surface-50"}`}>
              <div className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-surface-400" /><span className="text-xs text-surface-500">{s}</span></div>
              <p className="text-lg font-bold text-surface-900 mt-1">{summary[s] || 0}</p>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : returns.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Undo2 className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No returns{statusFilter ? ` with status "${statusFilter}"` : ""}</h3>
          <p className="text-sm text-surface-500">Return requests from customers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((r) => {
            const Icon = statusIcons[r.status] || Clock;
            return (
              <div key={r.id} className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-surface-50" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0"><Undo2 className="h-5 w-5 text-orange-600" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-surface-900">Order #{r.order.orderNumber}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${statusStyles[r.status]}`}><Icon className="h-3 w-3" /> {r.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                      {r.order.customer && <span>{r.order.customer.firstName} {r.order.customer.lastName}</span>}
                      <span>Order total: ${parseFloat(r.order.total).toFixed(2)}</span>
                      {r.refundAmount && <span>Refund: ${parseFloat(r.refundAmount).toFixed(2)}</span>}
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-surface-400 transition-transform ${expandedId === r.id ? "rotate-180" : ""}`} />
                </div>
                {expandedId === r.id && (
                  <div className="border-t border-surface-100 px-5 py-4 space-y-3 bg-surface-50">
                    <div><label className="text-xs font-semibold text-surface-500 uppercase">Reason</label><p className="text-sm text-surface-700 mt-0.5">{r.reason}</p></div>
                    {r.notes && <div><label className="text-xs font-semibold text-surface-500 uppercase">Notes</label><p className="text-sm text-surface-700 mt-0.5">{r.notes}</p></div>}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs text-surface-500">Change status:</span>
                      <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="text-xs border border-surface-200 rounded-lg px-3 py-1.5 bg-white">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
