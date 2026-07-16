"use client";
import { ChevronRight, Loader2, X } from "lucide-react";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from "@/components/icons/FilledIcons";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: Array<{ url: string; alt?: string }>;
  inStock: boolean;
}

interface CartItem {
  productId: string;
  quantity: number;
  product: CartProduct;
}

function formatCurrency(amount: number, currency: string = "GHS"): string {
  const symbols: Record<string, string> = { GHS: "GH₵", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  return `${symbols[currency] || currency}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function CartPage() {
  const { slug } = useParams() as { slug: string };
  const cartKey = `afrostore_cart_${slug}`;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) setCart(parsed); }
    } catch { /* ignore */ }
    setLoaded(true);
  }, [cartKey]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
      localStorage.setItem("afrostore_cart_active_slug", slug);
    }
  }, [cart, loaded, cartKey, slug]);

  const updateQty = useCallback((productId: string, delta: number) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const currency = cart[0]?.product?.currency || "GHS";
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-4">
          <Link href={`/store/${slug}`} className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <ShoppingBag className="h-5 w-5" /> Store
          </Link>
          <Link href={`/store/${slug}/shop`} className="text-sm text-gray-500 hover:text-gray-900">Continue Shopping →</Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href={`/store/${slug}`} className="hover:text-gray-600">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-700 font-medium">Cart</span>
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart {totalItems > 0 && `(${totalItems} item${totalItems > 1 ? "s" : ""})`}</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Browse our products and add items to your cart.</p>
            <Link href={`/store/${slug}/shop`} className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map(item => {
                const img = item.product.images?.[0]?.url;
                return (
                  <div key={item.productId} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {img ? <img src={img} alt={item.product.name} className="w-full h-full object-cover" /> : <ShoppingBag className="h-8 w-8 text-gray-300 m-auto mt-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/store/${slug}/product/${item.product.slug}`} className="font-medium text-gray-900 hover:text-blue-600 text-sm line-clamp-2">{item.product.name}</Link>
                      <div className="mt-1 text-sm font-semibold text-gray-900">{formatCurrency(item.product.price, currency)}</div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button onClick={() => updateQty(item.productId, -1)} className="p-1.5 hover:bg-gray-50"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="px-3 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                          <button onClick={() => updateQty(item.productId, 1)} className="p-1.5 hover:bg-gray-50"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <button onClick={() => removeItem(item.productId)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 text-sm">{formatCurrency(item.product.price * item.quantity, currency)}</div>
                    </div>
                  </div>
                );
              })}
              <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear Cart</button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-gray-400">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(subtotal, currency)}</span>
                  </div>
                </div>
                <Link href="/checkout" className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                  Proceed to Checkout
                </Link>
                <Link href={`/store/${slug}/shop`} className="mt-3 w-full flex items-center justify-center text-sm text-gray-500 hover:text-gray-900">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
