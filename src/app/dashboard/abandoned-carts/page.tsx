"use client";
import { Loader2 } from "lucide-react";
import { Clock, DollarSign, Eye, Mail, MessageCircle, RotateCcw, ShoppingCart, Trash2, TrendingUp } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface CartItem { productId: string; name: string; price: number; quantity: number; image?: string }
interface AbandonedCart {
  id: string; email?: string; phone?: string; sessionId?: string;
  items: CartItem[]; totalAmount: number; currency: string;
  status: "ACTIVE" | "REMINDED" | "RECOVERED" | "EXPIRED";
  remindersSent: number; createdAt: string;
  customer?: { id: string; firstName: string; lastName: string; email: string; phone?: string };
}
interface Stats { total: number; active: number; recovered: number; recoveryRate: string; totalValue: number; recoveredValue: number }

export default function AbandonedCartsPage() {
  const { currentStore } = useSite();
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCart, setExpandedCart] = useState<string | null>(null);

  const currency = currentStore?.currency || "GHS";
  const symbol = currency === "GHS" ? "GH₵" : currency === "GHS" ? "₵" : currency;

  const load = useCallback(async () => {
    if (!currentStore) return;
    const res = await api.get<{ carts: AbandonedCart[]; stats: Stats }>(`/api/sites/${currentStore.id}/abandoned-carts`);
    if (res.success && res.data) {
      setCarts(res.data.carts);
      setStats(res.data.stats);
    }
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { load(); }, [load]);

  const sendReminder = async (cart: AbandonedCart) => {
    if (!currentStore) return;
    // Mark as reminded
    await api.patch(`/api/sites/${currentStore.id}/abandoned-carts/${cart.id}`, { status: "REMINDED" });
    // Open WhatsApp with recovery message if phone available
    const contact = cart.phone || cart.customer?.phone;
    if (contact) {
      const items = (cart.items as CartItem[]).map((i) => `• ${i.name} x${i.quantity}`).join("\n");
      const text = `Hi${cart.customer ? ` ${cart.customer.firstName}` : ""}! 👋\n\nYou left some items in your cart at ${currentStore.name}:\n\n${items}\n\nTotal: ${symbol}${cart.totalAmount.toLocaleString()}\n\nComplete your order now! We'd hate for you to miss out. 🛍️`;
      window.open(`https://wa.me/${contact.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`, "_blank");
    }
    await load();
  };

  const deleteCart = async (id: string) => {
    if (!currentStore) return;
    await api.delete(`/api/sites/${currentStore.id}/abandoned-carts/${id}`);
    await load();
  };

  const statCards = stats ? [
    { label: "Total Abandoned", value: stats.total, icon: ShoppingCart, color: "bg-red-50 text-red-600" },
    { label: "Active Carts", value: stats.active, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Recovered", value: `${stats.recovered} (${stats.recoveryRate}%)`, icon: RotateCcw, color: "bg-green-50 text-green-600" },
    { label: "Lost Revenue", value: `${symbol}${(stats.totalValue - stats.recoveredValue).toLocaleString()}`, icon: DollarSign, color: "bg-purple-50 text-purple-600" },
  ] : [];

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-red-50 text-red-700 border-red-200",
    REMINDED: "bg-amber-50 text-amber-700 border-amber-200",
    RECOVERED: "bg-green-50 text-green-700 border-green-200",
    EXPIRED: "bg-surface-100 text-surface-500 border-surface-200",
  };

  if (loading) return (
    <>
      <DashboardHeader title="Abandoned Carts" subtitle="Recover lost sales" />
      <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
    </>
  );

  return (
    <>
      <DashboardHeader title="Abandoned Carts" subtitle="Recover lost sales with WhatsApp follow-ups" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-2xl border border-surface-200 bg-white p-5 hover:shadow-md transition-all">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${s.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-2xl font-bold text-surface-900 font-display">{s.value}</div>
                  <div className="text-xs text-surface-500 mt-0.5">{s.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Carts list */}
        {carts.length === 0 ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <ShoppingCart className="h-12 w-12 text-surface-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 mb-1">No abandoned carts yet</h3>
            <p className="text-sm text-surface-500">When customers leave items in their cart without checking out, they'll appear here.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100">
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Customer</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Items</th>
                    <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Value</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Status</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Date</th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {carts.map((cart) => {
                    const items = cart.items as CartItem[];
                    return (
                      <tr key={cart.id} className="hover:bg-surface-50 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="text-sm font-medium text-surface-900">
                            {cart.customer ? `${cart.customer.firstName} ${cart.customer.lastName}` : cart.email || cart.phone || "Anonymous"}
                          </div>
                          <div className="text-[10px] text-surface-400">{cart.email || cart.phone || cart.sessionId?.slice(0, 8)}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <button onClick={() => setExpandedCart(expandedCart === cart.id ? null : cart.id)} className="text-xs text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {items.length} item{items.length !== 1 ? "s" : ""}
                          </button>
                          {expandedCart === cart.id && (
                            <div className="mt-2 space-y-1">
                              {items.map((item, i) => (
                                <div key={i} className="text-[10px] text-surface-600">• {item.name} × {item.quantity} — {symbol}{Number(item.price * item.quantity).toLocaleString()}</div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm font-semibold text-surface-900">{symbol}{cart.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusColors[cart.status]}`}>{cart.status}</span>
                          {cart.remindersSent > 0 && <span className="text-[9px] text-surface-400 ml-1">({cart.remindersSent} sent)</span>}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-surface-500">{new Date(cart.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {cart.status !== "RECOVERED" && (
                              <button onClick={() => sendReminder(cart)} className="text-[10px] font-semibold text-green-600 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50 flex items-center gap-1" title="Send WhatsApp reminder">
                                <MessageCircle className="h-3 w-3" /> Remind
                              </button>
                            )}
                            <button onClick={() => deleteCart(cart.id)} className="p-1 text-surface-400 hover:text-red-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
