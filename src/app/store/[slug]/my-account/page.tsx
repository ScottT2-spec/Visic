"use client";
import { ChevronRight, Loader2 } from "lucide-react";
import { Heart, MapPin, Package, ShoppingBag, User } from "@/components/icons/FilledIcons";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RenderBlocks } from "@/components/storefront/BlockRenderer";
import { RETAIL_MY_ACCOUNT_BLOCKS } from "@/lib/templates/presets/retail-pages";

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  itemCount: number;
}

function formatCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  return `${symbols[currency] || currency}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "delivered": return "bg-green-100 text-green-700";
    case "shipped": case "in_transit": return "bg-blue-100 text-blue-700";
    case "processing": return "bg-yellow-100 text-yellow-700";
    case "cancelled": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

type Tab = "orders" | "wishlist" | "addresses" | "settings";

export default function MyAccountPage() {
  const { slug } = useParams() as { slug: string };
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Load customer info from localStorage
  useEffect(() => {
    try {
      const info = localStorage.getItem(`afrostore_customer_${slug}`);
      if (info) {
        const parsed = JSON.parse(info);
        setCustomerName(parsed.name || "");
        setCustomerEmail(parsed.email || "");
        setCustomerPhone(parsed.phone || "");
      }
    } catch { /* ignore */ }

    // Try to load orders
    const loadOrders = async () => {
      try {
        const email = JSON.parse(localStorage.getItem(`afrostore_customer_${slug}`) || "{}").email;
        if (email) {
          const res = await fetch(`/api/storefront/${slug}/orders?email=${encodeURIComponent(email)}`);
          const json = await res.json();
          if (json.success && json.data) setOrders(json.data);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    loadOrders();
  }, [slug]);

  const saveCustomerInfo = () => {
    localStorage.setItem(`afrostore_customer_${slug}`, JSON.stringify({ name: customerName, email: customerEmail, phone: customerPhone }));
  };

  const tabs: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: User },
  ];

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
          <span className="text-gray-700 font-medium">My Account</span>
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <tab.icon className="h-4 w-4" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === "orders" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Order History</h2>
                {loading ? (
                  <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" /></div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">No orders yet</p>
                    <Link href={`/store/${slug}/shop`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Start Shopping →</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => (
                      <Link key={order.id} href={`/store/${slug}/order-tracking?order=${order.orderNumber}`} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">#{order.orderNumber}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()} · {order.itemCount} item{order.itemCount > 1 ? "s" : ""}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 text-sm">{formatCurrency(order.total, order.currency)}</div>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Wishlist</h2>
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-4">View and manage your saved items.</p>
                  <Link href={`/store/${slug}/wishlist`} className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800">
                    <Heart className="h-4 w-4" /> Go to Wishlist
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Saved Addresses</h2>
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Your delivery addresses will appear here after your first order.</p>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Account Settings</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" placeholder="+234..." />
                  </div>
                  <button onClick={saveCustomerInfo} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
