"use client";
import { ArrowRight } from "lucide-react";
import { CheckCircle2, CreditCard, MessageSquare, Palette, Rocket, Sparkles } from "@/components/icons/FilledIcons";

const steps = [
  {
    step: "01",
    icon: MessageSquare,
    title: "Tell AI About Your Business",
    description:
      "What do you sell? Who are your customers? What style do you like? AI understands your business in seconds.",
    details: [
      "Business type detection",
      "Brand tone analysis",
      "Auto logo generation",
      "Product import from WhatsApp/Instagram",
    ],
  },
  {
    step: "02",
    icon: Palette,
    title: "AI Generates Your Store",
    description:
      "Homepage, product pages, about, checkout, policies, SEO — everything generated in under 60 seconds.",
    details: [
      "Full homepage with hero & CTAs",
      "Product pages with AI descriptions",
      "Mobile-optimized checkout",
      "WhatsApp order integration",
    ],
  },
  {
    step: "03",
    icon: CreditCard,
    title: "Connect Payments",
    description:
      "One-click setup for Monnify, Paystack, or Flutterwave. Cards, bank transfers, USSD, mobile money — all enabled.",
    details: [
      "Monnify for bank transfers & USSD",
      "Paystack for cards & mobile",
      "Flutterwave for international",
      "Pay on delivery toggle",
    ],
  },
  {
    step: "04",
    icon: Rocket,
    title: "Start Selling",
    description:
      "Publish on your free subdomain. Share on WhatsApp, Instagram, and social media. Connect your custom domain anytime.",
    details: [
      "Free yourname.afrostore.com",
      "Custom domain support",
      "Social media sharing tools",
      "WhatsApp catalog sync",
    ],
  },
];

export default function HowItWorks() {
  return (
    <section className="section-padding bg-surface-50">
      <div className="container-max">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Simple as 1-2-3-4
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 tracking-tight">
            Launch Your Store in{" "}
            <span className="gradient-text">4 Easy Steps</span>
          </h2>
          <p className="mt-4 text-lg text-surface-500">
            No coding. No design skills. No headaches. Just answer, customize, connect, and sell.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="group relative rounded-2xl bg-white border border-surface-200 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1"
              >
                {/* Step number */}
                <div className="absolute top-6 right-6 text-6xl font-extrabold text-surface-100 font-display select-none">
                  {step.step}
                </div>

                <div className="relative">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white mb-5 shadow-lg shadow-brand-600/25 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="text-xl font-bold text-surface-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-surface-500 mb-5 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="space-y-2.5">
                    {step.details.map((detail) => (
                      <div
                        key={detail}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-brand-500 flex-shrink-0" />
                        <span className="text-surface-600">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="/auth/signup"
            className="btn-primary text-base py-4 px-10"
          >
            Start Building Now
            <ArrowRight className="h-5 w-5" />
          </a>
          <p className="mt-3 text-sm text-surface-400">
            Free forever plan available. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
