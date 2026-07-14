"use client";
import { ArrowRight } from "lucide-react";
import { CheckCircle2, Sparkles, Star } from "@/components/icons/FilledIcons";

import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    description: "Perfect for trying things out",
    features: [
      "1 store",
      "5 products",
      "Free subdomain",
      "Basic templates",
      "AfroStore branding",
      "Community support",
    ],
    cta: "Start Free",
    popular: false,
    accent: false,
  },
  {
    name: "Starter",
    price: "₦5,000",
    period: "/month",
    description: "For businesses ready to sell",
    features: [
      "1 store",
      "50 products",
      "Custom domain",
      "All free templates",
      "Remove branding",
      "Monnify + Paystack + Flutterwave",
      "WhatsApp ordering",
      "Basic analytics",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
    accent: false,
  },
  {
    name: "Business",
    price: "₦15,000",
    period: "/month",
    description: "Everything you need to grow",
    features: [
      "3 stores",
      "Unlimited products",
      "Custom domain",
      "All templates",
      "Advanced analytics",
      "Coupons & discounts",
      "Abandoned cart recovery",
      "AI product descriptions",
      "Delivery zones",
      "Staff accounts (3)",
      "Priority support",
    ],
    cta: "Start Growing",
    popular: true,
    accent: false,
  },
  {
    name: "Growth",
    price: "₦35,000",
    period: "/month",
    description: "AI-powered growth engine",
    features: [
      "10 stores",
      "Unlimited everything",
      "Premium templates",
      "AI store builder",
      "AI conversion audit",
      "AI ad creatives",
      "A/B testing",
      "Plugin marketplace",
      "Multi-language",
      "Staff accounts (10)",
      "API access",
      "Dedicated support",
    ],
    cta: "Unlock Growth",
    popular: false,
    accent: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="section-padding bg-surface-50">
      <div className="container-max">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Simple Pricing
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 tracking-tight text-balance">
            Plans That Grow{" "}
            <span className="gradient-text">With Your Business</span>
          </h2>
          <p className="mt-4 text-lg text-surface-500">
            Start free. Upgrade when you&apos;re ready. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular
                  ? "border-brand-500 bg-white shadow-lg shadow-brand-500/10 ring-1 ring-brand-500"
                  : "border-surface-200 bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-brand-600/25">
                  <Star className="h-3 w-3 fill-white" />
                  Most Popular
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-lg font-bold text-surface-900">
                  {plan.name}
                </h3>
                <p className="text-sm text-surface-500 mt-0.5">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-surface-900 font-display">
                  {plan.price}
                </span>
                <span className="text-sm text-surface-500 ml-1">
                  {plan.period}
                </span>
              </div>

              <Link
                href="/auth/signup"
                className={`w-full mb-6 ${
                  plan.popular
                    ? "btn-primary"
                    : plan.accent
                      ? "btn-accent"
                      : "btn-secondary"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <CheckCircle2
                      className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                        plan.popular ? "text-brand-500" : "text-surface-400"
                      }`}
                    />
                    <span className="text-surface-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-10 rounded-2xl border border-surface-200 bg-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-surface-900">
              Enterprise & Agency
            </h3>
            <p className="text-surface-500 mt-1">
              White-label, unlimited sites, custom infrastructure, dedicated support, and SLA.
            </p>
          </div>
          <Link href="#" className="btn-secondary whitespace-nowrap">
            Contact Sales
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
