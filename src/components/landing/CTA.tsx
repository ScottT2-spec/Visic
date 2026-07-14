"use client";
import { ArrowRight } from "lucide-react";
import { ShoppingBag, Sparkles, Zap } from "@/components/icons/FilledIcons";

import Link from "next/link";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 py-20 sm:py-28">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-brand-500/20 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-accent-500/15 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,.3) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="container-max relative">
        <div className="mx-auto max-w-3xl text-center px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-6">
            <Zap className="h-3.5 w-3.5" />
            Join 5,000+ African Businesses
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight text-balance leading-tight">
            Your Customers Are Waiting.
            <br />
            <span className="bg-gradient-to-r from-brand-300 to-accent-400 bg-clip-text text-transparent">
              Start Selling Today.
            </span>
          </h2>

          <p className="mt-6 text-lg text-brand-200/70 max-w-xl mx-auto">
            No coding. No design skills. No monthly fees to start. Just tell AI about your business, and you&apos;ll have a live store in 5 minutes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-base font-bold text-brand-900 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1"
            >
              <Sparkles className="h-5 w-5 text-brand-600" />
              Create Your Free Store
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#templates"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/10"
            >
              Browse Templates
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-brand-300/50">
            <span>Free forever plan</span>
            <span className="h-1 w-1 rounded-full bg-brand-400/30" />
            <span>No credit card</span>
            <span className="h-1 w-1 rounded-full bg-brand-400/30" />
            <span>Setup in 5 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
}
