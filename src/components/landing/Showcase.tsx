"use client";
import { ArrowRight, ChevronRight } from "lucide-react";
import { BarChart3, Bell, Eye, Globe, Heart, Package, Search, ShoppingBag, ShoppingCart, Star, TrendingUp, Users } from "@/components/icons/FilledIcons";

import Image from "next/image";
import Link from "next/link";

const DESKTOP_PRODUCTS = [
  {
    name: "Ankara Wrap Dress",
    price: "GH₵18,500",
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=200&h=200&fit=crop",
  },
  {
    name: "Beaded Necklace Set",
    price: "GH₵12,000",
    badge: null,
    image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&h=200&fit=crop",
  },
  {
    name: "Silk Head Wrap",
    price: "GH₵8,500",
    badge: "New",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop",
  },
];

// ─── Desktop Storefront ─────────────────────────────────────

function DesktopMockup() {
  return (
    <div className="relative w-full max-w-[520px]">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-1.5 shadow-2xl">
        <div className="flex items-center gap-2 rounded-t-xl bg-surface-900/80 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-1 text-[10px] text-white/50">
              <Globe className="h-2.5 w-2.5" />
              elegance-boutique.afrostore.com
            </div>
          </div>
        </div>

        <div className="rounded-b-xl bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <ShoppingBag className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-surface-900">Elegance Boutique</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-surface-500 font-medium">
              <span>Shop</span>
              <span>New In</span>
              <span>About</span>
              <span>FAQ</span>
              <span>Contact</span>
              <Heart className="h-3.5 w-3.5 cursor-pointer" />
              <div className="relative cursor-pointer">
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="absolute -top-1.5 -right-2 bg-purple-600 text-white text-[7px] font-bold rounded-full h-3 w-3 flex items-center justify-center">3</span>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-pink-800 px-6 py-8">
            <span className="inline-block text-[9px] font-semibold text-pink-300 bg-pink-500/20 rounded-full px-2.5 py-0.5 mb-2">✨ New Collection</span>
            <h2 className="text-lg font-bold text-white leading-tight">Summer Elegance<br />Collection 2026</h2>
            <p className="text-[10px] text-purple-200 mt-1.5 max-w-[200px]">Handcrafted African fashion meets modern style. Free delivery in Accra.</p>
            <button className="mt-3 bg-white text-purple-900 text-[10px] font-bold rounded-lg px-4 py-1.5 flex items-center gap-1">
              Shop Now <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-surface-900">Trending Now 🔥</h3>
              <span className="text-[9px] text-purple-600 font-semibold flex items-center gap-0.5">View All <ChevronRight className="h-2.5 w-2.5" /></span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {DESKTOP_PRODUCTS.map((product, i) => (
                <div key={i} className="group">
                  <div className="aspect-square rounded-lg overflow-hidden relative bg-surface-100">
                    <Image src={product.image} alt={product.name} width={200} height={200} className="w-full h-full object-cover" />
                    {product.badge && (
                      <span className={`absolute top-1 left-1 text-[7px] font-bold px-1.5 py-0.5 rounded-md ${product.badge === "Best Seller" ? "bg-amber-500 text-white" : "bg-purple-600 text-white"}`}>{product.badge}</span>
                    )}
                    <button className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-2.5 w-2.5 text-surface-600" />
                    </button>
                  </div>
                  <p className="text-[9px] font-semibold text-surface-800 mt-1.5 truncate">{product.name}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-surface-900">{product.price}</span>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className="h-2 w-2 fill-amber-400 text-amber-400" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 py-2.5 bg-surface-50 border-t border-surface-100">
            {["🔒 Secure Pay", "🚚 Fast Delivery", "💬 WhatsApp Support"].map((b, i) => (
              <span key={i} className="text-[8px] text-surface-500 font-medium">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phone Merchant Dashboard ───────────────────────────────

function PhoneMockup() {
  return (
    <div className="relative w-[210px] sm:w-[230px]">
      <div className="rounded-[28px] border-[3px] border-surface-700 bg-surface-900 p-1 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-surface-900 rounded-b-2xl z-10" />

        <div className="rounded-[24px] bg-white overflow-hidden">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 pt-6 pb-1 bg-brand-600">
            <span className="text-[8px] text-white/80 font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-3 rounded-sm bg-white/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
            </div>
          </div>

          {/* Dashboard Header */}
          <div className="bg-brand-600 px-4 pb-4 pt-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[8px] text-brand-200">Good morning 👋</p>
                <p className="text-xs font-bold text-white">Amara&apos;s Store</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center relative">
                  <Bell className="h-3 w-3 text-white" />
                  <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border border-brand-600" />
                </div>
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[8px] font-bold text-white">A</div>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="rounded-xl bg-white/15 backdrop-blur-sm p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-brand-200">Today&apos;s Revenue</p>
                  <p className="text-base font-extrabold text-white">GH₵485,200</p>
                </div>
                <div className="flex items-center gap-1 bg-green-500/20 rounded-full px-2 py-0.5">
                  <TrendingUp className="h-2.5 w-2.5 text-green-300" />
                  <span className="text-[8px] font-bold text-green-300">+24%</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10">
                <div>
                  <p className="text-[7px] text-brand-200">Orders</p>
                  <p className="text-[10px] font-bold text-white">47</p>
                </div>
                <div>
                  <p className="text-[7px] text-brand-200">Visitors</p>
                  <p className="text-[10px] font-bold text-white">1,284</p>
                </div>
                <div>
                  <p className="text-[7px] text-brand-200">Conversion</p>
                  <p className="text-[10px] font-bold text-white">3.7%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-3 py-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Package, label: "Products", color: "bg-purple-100 text-purple-600" },
                { icon: ShoppingBag, label: "Orders", color: "bg-blue-100 text-blue-600" },
                { icon: Users, label: "Customers", color: "bg-emerald-100 text-emerald-600" },
                { icon: BarChart3, label: "Analytics", color: "bg-amber-100 text-amber-600" },
              ].map((action, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`h-8 w-8 rounded-xl ${action.color} flex items-center justify-center`}>
                    <action.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[7px] font-medium text-surface-600">{action.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-surface-900">Recent Orders</span>
              <span className="text-[8px] text-brand-600 font-semibold">See all</span>
            </div>
            {[
              { name: "Chioma A.", amount: "GH₵32,500", status: "Delivered", statusColor: "bg-green-100 text-green-700", time: "2h ago" },
              { name: "Emeka O.", amount: "GH₵18,000", status: "Processing", statusColor: "bg-blue-100 text-blue-700", time: "4h ago" },
              { name: "Fatima B.", amount: "GH₵45,800", status: "Pending", statusColor: "bg-amber-100 text-amber-700", time: "5h ago" },
            ].map((order, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-surface-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-surface-100 flex items-center justify-center text-[8px] font-bold text-surface-600">
                    {order.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-surface-800">{order.name}</p>
                    <p className="text-[7px] text-surface-400">{order.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-surface-900">{order.amount}</p>
                  <span className={`text-[7px] font-semibold px-1.5 py-0.5 rounded-full ${order.statusColor}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Nav */}
          <div className="flex items-center justify-around py-2 border-t border-surface-100 bg-white">
            {[
              { icon: BarChart3, label: "Home", active: true },
              { icon: Package, label: "Products", active: false },
              { icon: ShoppingBag, label: "Orders", active: false },
              { icon: Users, label: "More", active: false },
            ].map((nav, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <nav.icon className={`h-3.5 w-3.5 ${nav.active ? "text-brand-600" : "text-surface-400"}`} />
                <span className={`text-[7px] font-medium ${nav.active ? "text-brand-600" : "text-surface-400"}`}>{nav.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ───────────────────────────────────────────

export default function Showcase() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-[#0a1628] to-brand-900 py-20 sm:py-28">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-600/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-500/8 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
      </div>

      <div className="container-max relative px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-sm text-accent-300 mb-6">
            <Eye className="h-3.5 w-3.5" />
            <span>See It In Action</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white max-w-3xl mx-auto leading-tight">
            Beautiful Stores.{" "}
            <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
              Powerful Dashboard.
            </span>
          </h2>
          <p className="mt-4 text-lg text-brand-200/70 max-w-2xl mx-auto">
            Your customers see a stunning storefront. You see real-time analytics, orders, and everything you need to grow — on any device.
          </p>
        </div>

        {/* Desktop only */}
        <div className="flex items-center justify-center">
          <div className="relative animate-fade-up">
            <DesktopMockup />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-accent-500/20 transition-all duration-300 hover:shadow-accent-500/40 hover:-translate-y-1"
          >
            Start Your Free Store
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-3 text-sm text-brand-300/50">
            No credit card needed. Launch in 5 minutes.
          </p>
        </div>
      </div>
    </section>
  );
}
