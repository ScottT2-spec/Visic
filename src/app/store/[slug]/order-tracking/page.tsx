"use client";
import { ChevronRight, Loader2, Search } from "lucide-react";
import { CheckCircle2, Package, ShoppingBag, Truck } from "@/components/icons/FilledIcons";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { RenderBlocks } from "@/components/storefront/BlockRenderer";
import { RETAIL_ORDER_TRACKING_BLOCKS } from "@/lib/templates/presets/retail-pages";

interface OrderStatus {
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number; image?: string }>;
  timeline: Array<{ status: string; date: string; description: string }>;
  shippingAddress?: { name: string; address: string; city: string };
}

function formatCurrency(amount: number, currency: string = "GHS"): string {
  const symbols: Record<string, string> = { GHS: "GH₵", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  return `${symbols[currency] || currency}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const statusSteps = ["pending", "processing", "shipped", "delivered"];

function getStepIndex(status: string): number {
  const s = status.toLowerCase();
  const idx = statusSteps.indexOf(s);
  return idx >= 0 ? idx : 0;
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "delivered": return CheckCircle2;
    case "shipped": case "in_transit": return Truck;
    default: return Package;
  }
}

export default function OrderTrackingPage() {
  const { slug } = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") || "";

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [searchInput, setSearchInput] = useState(initialOrder);
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const trackOrder = async (num?: string) => {
    const query = num || searchInput.trim();
    if (!query) return;
    setOrderNumber(query);
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await fetch(`/api/storefront/${slug}/orders/${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOrder(json.data);
      } else {
        setOrder(null);
        setError(json.error || "Order not found");
      }
    } catch {
      setOrder(null);
      setError("Failed to look up order. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialOrder) trackOrder(initialOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-4">
          <Link href={`/store/${slug}`} className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <ShoppingBag className="h-5 w-5" /> Store
          </Link>
          <Link href={`/store/${slug}/shop`} className="text-sm text-gray-500 hover:text-gray-900">Shop →</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href={`/store/${slug}`} className="hover:text-gray-600">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-700 font-medium">Order Tracking</span>
        </nav>
      </div>

      <main className="max-w-3xl mx-auto px-4 pb-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Track Your Order</h1>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <p className="text-sm text-gray-600 mb-4">Enter your order number to track your delivery status.</p>
          <form onSubmit={(e) => { e.preventDefault(); trackOrder(); }} className="flex gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="e.g. ORD-12345"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Track
            </button>
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" /></div>
        )}

        {!loading && error && searched && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900 mb-2">Order not found</h2>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        )}

        {!loading && order && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-gray-900">Order #{order.orderNumber}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="font-semibold text-gray-900">{formatCurrency(order.total, order.currency)}</div>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-between mb-2">
                {statusSteps.map((step, i) => {
                  const active = i <= currentStep;
                  const Icon = i === currentStep ? getStatusIcon(order.status) : (i < currentStep ? CheckCircle2 : Package);

  // ─── RETAIL ORDER_TRACKING ───
  const isRetail = storeData?.templateSlug === "retail";
  if (isRetail) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <RenderBlocks blocks={RETAIL_ORDER_TRACKING_BLOCKS} storeSlug={slug} products={products || []} currency={currency} />
        </div>
      </div>
    );
  }

                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-xs mt-2 capitalize ${active ? "text-gray-900 font-medium" : "text-gray-400"}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center mt-1 mx-5">
                {statusSteps.slice(0, -1).map((_, i) => (
                  <div key={i} className={`flex-1 h-1 rounded ${i < currentStep ? "bg-gray-900" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <Package className="h-5 w-5 text-gray-300 m-auto mt-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(item.price * item.quantity, order.currency)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-4">
                  {order.timeline.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-gray-900" : "bg-gray-300"}`} />
                        {i < order.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <div className="text-sm font-medium text-gray-900 capitalize">{event.status}</div>
                        <div className="text-xs text-gray-500">{event.description}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{new Date(event.date).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-12">
            <Truck className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Enter your order number above to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}
