"use client";
import { ArrowRight, Loader2, X } from "lucide-react";
import { CheckCircle2, Clock, Package, Search, ShoppingCart, Truck } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  email: string;
  phone?: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: string;
  items: Array<{ id: string; name: string; quantity: number; price: number; total: number; image?: string }>;
  deliveryAddress?: Record<string, string>;
  note?: string;
  createdAt: string;
}

interface OrdersResponse {
  orders: Order[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  PROCESSING: { label: "Processing", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-accent-50 text-accent-700 border-accent-200", icon: X },
};

export default function OrdersPage() {
  const { currentStore } = useSite();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await api.get<OrdersResponse>(`/api/sites/${currentStore.id}/orders?${params}`);
    if (res.success && res.data) {
      setOrders(res.data.orders);
      setTotal(res.data.pagination.total);
    }
    setLoading(false);
  }, [currentStore, page, statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    if (!currentStore) return;
    setUpdatingStatus(true);
    await api.patch(`/api/sites/${currentStore.id}/orders/${orderId}`, { status });
    setUpdatingStatus(false);
    fetchOrders();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status } : null);
    }
  };

  const currency = currentStore?.currency || "NGN";

  return (
    <>
      <DashboardHeader title="Orders" subtitle={`${total} total orders`} />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search by order number or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s ? "bg-brand-50 text-brand-700" : "text-surface-500 hover:bg-surface-100"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <ShoppingCart className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 mb-2">No orders yet</h3>
            <p className="text-sm text-surface-500">Orders will appear here when customers purchase from your store.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Order</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Customer</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400 hidden md:table-cell">Items</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Status</th>
                  <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {orders.map((order) => {
                  const sc = statusConfig[order.status] || statusConfig.PENDING;
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={order.id} className="hover:bg-surface-50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <td className="px-6 py-3.5">
                        <div className="text-sm font-semibold text-surface-900">{order.orderNumber}</div>
                        <div className="text-[10px] text-surface-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-surface-700">{order.email}</td>
                      <td className="px-6 py-3.5 hidden md:table-cell text-xs text-surface-500">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${sc.color}`}>
                          <StatusIcon className="h-3 w-3" />{sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm font-semibold text-surface-900">
                        {formatCurrency(Number(order.total), order.currency)}
                      </td>
                    </tr>
                  );
                })}
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

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-surface-100 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-surface-900">{selectedOrder.orderNumber}</h2>
                <p className="text-xs text-surface-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg hover:bg-surface-100">
                <X className="h-5 w-5 text-surface-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-surface-500 uppercase">Update Status</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      disabled={updatingStatus || selectedOrder.status === s}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors disabled:opacity-50 ${
                        selectedOrder.status === s ? "bg-brand-50 text-brand-700 border-brand-200" : "bg-white text-surface-600 border-surface-200 hover:bg-surface-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer */}
              <div>
                <label className="text-xs font-semibold text-surface-500 uppercase">Customer</label>
                <p className="text-sm text-surface-900 mt-1">{selectedOrder.email}</p>
                {selectedOrder.phone && <p className="text-xs text-surface-500">{selectedOrder.phone}</p>}
              </div>

              {/* Items */}
              <div>
                <label className="text-xs font-semibold text-surface-500 uppercase">Items</label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-surface-50 rounded-xl p-3">
                      <div>
                        <p className="text-sm font-medium text-surface-900">{item.name}</p>
                        <p className="text-[10px] text-surface-500">Qty: {item.quantity} × {formatCurrency(Number(item.price), currency)}</p>
                      </div>
                      <p className="text-sm font-semibold text-surface-900">{formatCurrency(Number(item.total), currency)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-surface-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Subtotal</span>
                  <span className="text-surface-900">{formatCurrency(Number(selectedOrder.subtotal), currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Delivery</span>
                  <span className="text-surface-900">{formatCurrency(Number(selectedOrder.deliveryFee), currency)}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Discount</span>
                    <span className="text-green-600">-{formatCurrency(Number(selectedOrder.discount), currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-surface-100">
                  <span className="text-surface-900">Total</span>
                  <span className="text-surface-900">{formatCurrency(Number(selectedOrder.total), currency)}</span>
                </div>
              </div>

              {/* Delivery address */}
              {selectedOrder.deliveryAddress && (
                <div>
                  <label className="text-xs font-semibold text-surface-500 uppercase">Delivery Address</label>
                  <div className="text-sm text-surface-700 mt-1">
                    {Object.values(selectedOrder.deliveryAddress).filter(Boolean).join(", ")}
                  </div>
                </div>
              )}

              {selectedOrder.note && (
                <div>
                  <label className="text-xs font-semibold text-surface-500 uppercase">Note</label>
                  <p className="text-sm text-surface-700 mt-1">{selectedOrder.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
