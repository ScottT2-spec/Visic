"use client";
import { ArrowRight, ChevronLeft, Loader2, Plus, X } from "lucide-react";
import { AlertCircle, Building2, CheckCircle2, CreditCard, Lock, MapPin, MessageCircle, Minus, Shield, ShoppingBag, ShoppingCart, Smartphone, Tag, Trash2, Truck } from "@/components/icons/FilledIcons";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ───────── Types ───────── */

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: ProductImage[];
  inStock: boolean;
}

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
}

interface DeliveryZone {
  id: string;
  name: string;
  areas: string[];
  fee: number;
  freeAbove?: number;
  estimatedDays?: string;
}

/* ───────── Helpers ───────── */

function formatCurrency(amount: number, currency: string = "GHS"): string {
  const symbols: Record<string, string> = { GHS: "GH₵", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const GRADIENTS = [
  "from-pink-400 to-rose-500", "from-amber-400 to-orange-500", "from-green-400 to-emerald-500",
  "from-blue-400 to-indigo-500", "from-purple-400 to-violet-500", "from-teal-400 to-cyan-500",
];

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

const paymentMethods = [
  { id: "PAYSTACK", name: "Card Payment", desc: "Visa, Mastercard, Verve (Paystack)", icon: CreditCard },
  { id: "MONNIFY", name: "Bank Transfer / USSD", desc: "Pay via bank transfer or USSD (Monnify)", icon: Building2 },
  { id: "FLUTTERWAVE", name: "Flutterwave", desc: "Cards, mobile money, bank transfer", icon: Smartphone },
  { id: "COD", name: "Pay on Delivery", desc: "Pay when your order arrives", icon: Truck },
];

/* ───────── Component ───────── */

export default function CheckoutPage() {
  const router = useRouter();

  // Load cart + store info from localStorage (set by storefront)
  const [activeSlug] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("afrostore_cart_active_slug") || "";
  });
  const cartKey = activeSlug ? `afrostore_cart_${activeSlug}` : "afrostore_cart";
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; }
    } catch { /* ignore */ }
    return [];
  });
  const [siteId, setStoreId] = useState("");
  const [storeSlug, setStoreSlug] = useState(activeSlug);
  const [storeName, setStoreName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PAYSTACK");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  // Status
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; orderId: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setStoreId(localStorage.getItem("afrostore_siteId") || "");
      setStoreSlug(localStorage.getItem("afrostore_storeSlug") || "");
      setStoreName(localStorage.getItem("afrostore_storeName") || "");
      setCurrency(localStorage.getItem("afrostore_currency") || "NGN");
      const dz = localStorage.getItem("afrostore_deliveryZones");
      if (dz) {
        const zones = JSON.parse(dz);
        setDeliveryZones(zones);
        if (zones.length > 0) setSelectedZone(zones[0].id);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Cart helpers
  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter((item) => item.quantity > 0);
      localStorage.setItem(cartKey, JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.productId !== productId);
      localStorage.setItem(cartKey, JSON.stringify(updated));
      return updated;
    });
  };

  const subtotal = cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  const zone = deliveryZones.find((z) => z.id === selectedZone);
  const zoneFreeAbove = zone?.freeAbove ? Number(zone.freeAbove) : null;
  const deliveryFee = zone ? (zoneFreeAbove && subtotal >= zoneFreeAbove ? 0 : Number(zone.fee)) : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!siteId) { setOrderError("Store information missing. Go back to the store and try again."); return; }
    if (!firstName || !lastName || !email || !phone) { setOrderError("Please fill in all contact information."); return; }
    if (!address || !city || !state) { setOrderError("Please fill in your delivery address."); return; }
    if (cart.length === 0) { setOrderError("Your cart is empty."); return; }

    setPlacing(true);
    setOrderError("");

    try {
      // 1. Create the order
      const orderRes = await fetch(`/api/sites/${siteId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.productId,
            variantId: i.variantId || undefined,
            quantity: i.quantity,
          })),
          firstName,
          lastName,
          email,
          phone,
          deliveryAddress: { address, city, state, instructions: deliveryInstructions },
          deliveryZoneId: selectedZone || undefined,
          paymentMethod: paymentMethod === "COD" ? "PAY_ON_DELIVERY" : paymentMethod,
          couponCode: couponCode.trim() || undefined,
          note: deliveryInstructions || undefined,
        }),
      });

      const orderJson = await orderRes.json();

      if (!orderJson.success) {
        setOrderError(orderJson.error || "Failed to place order. Please try again.");
        setPlacing(false);
        return;
      }

      const order = orderJson.data;

      // 2. If pay on delivery, we're done
      if (paymentMethod === "COD") {
        // Clear cart
        localStorage.removeItem(cartKey);
        setCart([]);
        setOrderSuccess({ orderNumber: order.orderNumber, orderId: order.id });
        setPlacing(false);
        return;
      }

      // 3. Initialize payment
      const payRes = await fetch(`/api/sites/${siteId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          provider: paymentMethod,
          callbackUrl: `${window.location.origin}/checkout?status=success&order=${order.orderNumber}`,
        }),
      });

      const payJson = await payRes.json();

      if (payJson.success && payJson.data?.paymentUrl) {
        // Clear cart
        localStorage.removeItem(cartKey);
        setCart([]);
        // Redirect to payment page
        window.location.href = payJson.data.paymentUrl;
        return;
      }

      // Payment init failed but order was created — show partial success
      localStorage.removeItem(cartKey);
      setCart([]);
      setOrderSuccess({ orderNumber: order.orderNumber, orderId: order.id });
      setOrderError("Order placed but payment initialization failed. Please contact the store to complete payment.");
      setPlacing(false);
    } catch (err) {
      setOrderError("Something went wrong. Please try again.");
      setPlacing(false);
    }
  };

  // Check for payment return
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const orderNum = params.get("order");
    if (status === "success" && orderNum) {
      setOrderSuccess({ orderNumber: orderNum, orderId: "" });
      localStorage.removeItem(cartKey);
      setCart([]);
    }
  }, []);

  /* ── Order Success ── */
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-surface-900 mb-2">Order Placed! 🎉</h1>
          <p className="text-surface-500 mb-2">Your order <strong>{orderSuccess.orderNumber}</strong> has been placed.</p>
          {paymentMethod === "COD" && (
            <p className="text-sm text-surface-400 mb-6">You&apos;ll pay when your order is delivered.</p>
          )}
          {orderError && (
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-700 mb-6">{orderError}</div>
          )}
          <div className="flex gap-3 justify-center">
            {storeSlug && (
              <Link href={`/store/${storeSlug}`} className="btn-primary py-3 px-6">
                <ShoppingBag className="h-4 w-4" /> Continue Shopping
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Empty Cart ── */
  if (cart.length === 0 && !placing) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <ShoppingCart className="h-16 w-16 text-surface-300 mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold text-surface-900 mb-2">Your cart is empty</h1>
          <p className="text-surface-500 mb-6">Add some products to get started.</p>
          {storeSlug ? (
            <Link href={`/store/${storeSlug}`} className="btn-primary py-3 px-6">
              <ArrowRight className="h-4 w-4 rotate-180" /> Back to Store
            </Link>
          ) : (
            <Link href="/" className="btn-primary py-3 px-6">
              <ArrowRight className="h-4 w-4 rotate-180" /> Go Home
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            {storeSlug ? (
              <Link href={`/store/${storeSlug}`} className="text-surface-500 hover:text-surface-700 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            ) : (
              <button onClick={() => router.back()} className="text-surface-500 hover:text-surface-700 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-surface-900">Checkout</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-surface-400">
            <Lock className="h-3.5 w-3.5" />
            Secure checkout
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {orderError && !orderSuccess && (
          <div className="rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700 mb-6 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{orderError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Contact Info */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-base font-bold text-surface-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">First name *</label>
                    <input type="text" className="input-field" placeholder="Chioma" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Last name *</label>
                    <input type="text" className="input-field" placeholder="Eze" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Email *</label>
                  <input type="email" className="input-field" placeholder="chioma@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Phone (WhatsApp) *</label>
                  <input type="tel" className="input-field" placeholder="+234 812 345 6789" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-600" /> Delivery Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Address *</label>
                  <input type="text" className="input-field" placeholder="12 Admiralty Way" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">City *</label>
                    <input type="text" className="input-field" placeholder="Lekki Phase 1" value={city} onChange={(e) => setCity(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">State *</label>
                    <input type="text" className="input-field" placeholder="Accra" value={state} onChange={(e) => setState(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Delivery instructions (optional)</label>
                  <textarea className="input-field" placeholder="Gate code, landmark, etc." rows={2} value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Delivery Zone */}
            {deliveryZones.length > 0 && (
              <div className="rounded-2xl border border-surface-200 bg-white p-6">
                <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-brand-600" /> Delivery Option
                </h3>
                <div className="space-y-2">
                  {deliveryZones.map((dz) => {
                    const dzFreeAbove = dz.freeAbove ? Number(dz.freeAbove) : null;
                    const dzFee = dzFreeAbove && subtotal >= dzFreeAbove ? 0 : Number(dz.fee);
                    return (
                      <label key={dz.id} className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${selectedZone === dz.id ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-surface-200 hover:border-surface-300"}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="delivery" checked={selectedZone === dz.id} onChange={() => setSelectedZone(dz.id)} className="accent-brand-600" />
                          <div>
                            <span className="text-sm font-semibold text-surface-900">{dz.name}</span>
                            {dz.estimatedDays && <p className="text-xs text-surface-500">{dz.estimatedDays}</p>}
                            {dz.areas.length > 0 && <p className="text-[10px] text-surface-400">{dz.areas.slice(0, 3).join(", ")}{dz.areas.length > 3 ? "..." : ""}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-surface-900">
                            {dzFee === 0 ? <span className="text-green-600">Free</span> : formatCurrency(dzFee, currency)}
                          </span>
                          {dzFreeAbove && dzFee > 0 && (
                            <p className="text-[10px] text-surface-400">Free above {formatCurrency(dzFreeAbove, currency)}</p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand-600" /> Payment Method
              </h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label key={method.id} className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${paymentMethod === method.id ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-surface-200 hover:border-surface-300"}`}>
                      <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-brand-600" />
                      <Icon className="h-5 w-5 text-surface-500" />
                      <div>
                        <span className="text-sm font-semibold text-surface-900">{method.name}</span>
                        <p className="text-xs text-surface-500">{method.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-base font-bold text-surface-900 mb-4">Order Summary</h3>

              <div className="space-y-4 mb-6">
                {cart.map((item) => {
                  const hasImage = item.product.images?.length > 0 && item.product.images[0]?.url;
                  return (
                    <div key={item.productId} className="flex gap-3">
                      <div className={`h-16 w-16 rounded-xl flex-shrink-0 relative overflow-hidden ${!hasImage ? `bg-gradient-to-br ${getGradient(item.productId)}` : ""}`}>
                        {hasImage ? (
                          <img src={item.product.images[0].url} alt={item.product.name} className="h-full w-full object-cover rounded-xl" />
                        ) : null}
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-surface-700 text-white text-[10px] font-bold flex items-center justify-center">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-surface-900 truncate">{item.product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => updateQty(item.productId, -1)} className="h-6 w-6 rounded border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-surface-50"><Minus className="h-3 w-3" /></button>
                          <span className="text-xs font-bold text-surface-900 w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQty(item.productId, 1)} className="h-6 w-6 rounded border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-surface-50"><Plus className="h-3 w-3" /></button>
                          <button onClick={() => removeItem(item.productId)} className="ml-auto p-1 text-surface-400 hover:text-accent-500"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-surface-900 flex-shrink-0">
                        {formatCurrency(Number(item.product.price) * item.quantity, currency)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1 flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2">
                  <Tag className="h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponApplied(false); }}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => { if (couponCode.trim()) setCouponApplied(true); }}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Apply
                </button>
              </div>
              {couponApplied && couponCode && (
                <p className="text-xs text-surface-500 mb-4 -mt-3">Coupon will be validated when you place the order.</p>
              )}

              {/* Totals */}
              <div className="space-y-2 pb-4 border-b border-surface-100">
                <div className="flex justify-between text-sm text-surface-500">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-sm text-surface-500">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? <span className="text-green-600">Free</span> : formatCurrency(deliveryFee, currency)}</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold text-surface-900 mt-4 mb-6">
                <span>Total</span><span>{formatCurrency(total, currency)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="btn-primary w-full py-4 text-base disabled:opacity-70"
              >
                {placing ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                ) : paymentMethod === "COD" ? (
                  <><CheckCircle2 className="h-5 w-5" /> Place Order — {formatCurrency(total, currency)}</>
                ) : (
                  <><Lock className="h-5 w-5" /> Pay {formatCurrency(total, currency)}</>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-surface-400">
                <Shield className="h-3.5 w-3.5" />
                Secure 256-bit SSL encrypted payment
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-4 border-t border-surface-100 grid grid-cols-3 gap-2">
                {[
                  { icon: CheckCircle2, text: "Verified Store" },
                  { icon: Truck, text: "Tracked Delivery" },
                  { icon: MessageCircle, text: "WhatsApp Updates" },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <div key={t.text} className="flex flex-col items-center gap-1 text-center">
                      <Icon className="h-4 w-4 text-brand-600" />
                      <span className="text-[10px] text-surface-500">{t.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
