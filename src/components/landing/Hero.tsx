"use client";
import { ArrowRight, X } from "lucide-react";
import { CheckCircle2, Globe, Play, ShoppingBag, Sparkles, Star, Zap } from "@/components/icons/FilledIcons";

import { useState } from "react";
import Link from "next/link";

const trustedBy = [
  "5,000+ African businesses",
  "GH₵2B+ processed",
  "15 countries",
];

// Replace with your actual demo video URL (YouTube or Vimeo)
const DEMO_VIDEO_URL = "https://www.youtube.com/embed/dQw4w9WgXcQ";

function getEmbedUrl(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1`;
  return url;
}

export default function Hero() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-brand-900 to-brand-800 pt-16">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent-500/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-brand-400/5 blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container-max relative">
        <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
          {/* Badge */}
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Commerce for Africa</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up text-center font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl text-balance leading-[1.1]">
            From Idea to{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-accent-300 via-accent-400 to-accent-500 bg-clip-text text-transparent">
                Selling
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
              >
                <path
                  d="M2 8.5C50 2 150 2 198 8.5"
                  stroke="url(#underline)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="underline"
                    x1="0"
                    y1="0"
                    x2="200"
                    y2="0"
                  >
                    <stop stopColor="#F5B731" />
                    <stop offset="1" stopColor="#ca8a04" />
                  </linearGradient>
                </defs>
              </svg>
            </span>{" "}
            in 5 Minutes
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up mt-6 sm:mt-8 text-center text-lg sm:text-xl text-brand-200/80 max-w-2xl leading-relaxed">
            The simplest ecommerce platform built for African businesses. AI creates your store, connects your payments, and starts you selling — no tech skills needed.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-base font-bold text-brand-900 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 hover:bg-brand-50"
            >
              <ShoppingBag className="h-5 w-5 text-brand-600" />
              Create Your Store Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              onClick={() => setShowDemo(true)}
              className="group inline-flex items-center gap-2.5 rounded-2xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-white/30">
                <Play className="h-4 w-4 text-white ml-0.5" />
              </div>
              Watch Demo
            </button>
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-up mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-brand-300/60">
            {trustedBy.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-400/60" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Hero Image/Preview */}
          <div className="animate-fade-up mt-12 sm:mt-16 w-full max-w-5xl">
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm shadow-2xl animate-float" style={{ animationDuration: "2s" }}>
              <div className="rounded-xl bg-gradient-to-br from-surface-900 to-surface-800 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-accent-500/60" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                    <div className="h-3 w-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-1 text-xs text-white/50">
                      <Globe className="h-3 w-3" />
                      yourstore.afrostore.com
                    </div>
                  </div>
                </div>
                {/* Dashboard Preview */}
                <div className="relative aspect-[16/9] bg-gradient-to-br from-surface-50 to-white p-4 sm:p-6 lg:p-8">
                  <div className="grid grid-cols-12 gap-4 h-full">
                    {/* Sidebar */}
                    <div className="col-span-3 hidden sm:block rounded-xl bg-white border border-surface-200 p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-bold text-surface-900">
                          My Store
                        </span>
                      </div>
                      {[
                        "Dashboard",
                        "Products",
                        "Orders",
                        "Customers",
                        "Analytics",
                      ].map((item, i) => (
                        <div
                          key={item}
                          className={`rounded-lg px-3 py-2 mb-1 text-xs font-medium ${
                            i === 0
                              ? "bg-brand-50 text-brand-700"
                              : "text-surface-500"
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    {/* Main */}
                    <div className="col-span-12 sm:col-span-9 space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          { label: "Revenue", value: "GH₵2.4M", change: "+24%" },
                          { label: "Orders", value: "186", change: "+12%" },
                          { label: "Customers", value: "1,249", change: "+8%" },
                          {
                            label: "Conversion",
                            value: "4.2%",
                            change: "+2.1%",
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded-xl bg-white border border-surface-200 p-3 shadow-sm"
                          >
                            <div className="text-[10px] text-surface-500 font-medium">
                              {stat.label}
                            </div>
                            <div className="flex items-end justify-between mt-1">
                              <span className="text-lg font-bold text-surface-900">
                                {stat.value}
                              </span>
                              <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 rounded-full px-1.5 py-0.5">
                                {stat.change}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Chart placeholder */}
                      <div className="rounded-xl bg-white border border-surface-200 p-4 shadow-sm flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-semibold text-surface-900">
                            Revenue Overview
                          </span>
                          <div className="flex items-center gap-1.5">
                            {["7d", "30d", "90d"].map((d) => (
                              <span
                                key={d}
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                                  d === "30d"
                                    ? "bg-brand-50 text-brand-700"
                                    : "text-surface-400"
                                }`}
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-end gap-1 h-24">
                          {[40, 65, 45, 80, 55, 90, 70, 85, 95, 60, 75, 88].map(
                            (h, i) => (
                              <div
                                key={i}
                                className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-600 to-brand-500 opacity-80"
                                style={{ height: `${h}%` }}
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -right-4 top-1/4 hidden lg:flex animate-float">
                <div className="glass rounded-xl p-3 shadow-xl border border-white/30">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-brand-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-surface-900">
                        New Order!
                      </div>
                      <div className="text-[10px] text-surface-500">
                        GH₵45,000 • 2 items
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -left-4 bottom-1/3 hidden lg:flex animate-float" style={{ animationDelay: "3s" }}>
                <div className="glass rounded-xl p-3 shadow-xl border border-white/30">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-6 w-6 rounded-full bg-gradient-to-br from-accent-400 to-brand-600 border-2 border-white"
                        />
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-surface-500">
                        1,249 happy customers
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Demo Video Modal */}
      {showDemo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowDemo(false)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-4xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDemo(false)}
              className="absolute -top-12 right-0 flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              Close <X className="h-5 w-5" />
            </button>
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video">
              <iframe
                src={getEmbedUrl(DEMO_VIDEO_URL)}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="AfroStore Demo"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
