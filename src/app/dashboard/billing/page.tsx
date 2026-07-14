"use client";
import { CheckCircle2, Crown, Star, Zap } from "@/components/icons/FilledIcons";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";

const plans = [
  { name: "Free", price: "₦0", period: "/month", features: ["Subdomain", "5 products", "Basic analytics", "Platform branding"], icon: Zap },
  { name: "Starter", price: "₦5,000", period: "/month", features: ["Custom domain", "50 products", "Payment gateways", "No branding"], icon: Star, popular: true },
  { name: "Business", price: "₦15,000", period: "/month", features: ["Unlimited products", "Advanced analytics", "Coupons", "Abandoned cart"], icon: Crown },
  { name: "Growth", price: "₦35,000", period: "/month", features: ["Everything in Business", "AI tools", "A/B testing", "Priority support"], icon: Crown },
];

export default function BillingPage() {
  const { currentStore } = useSite();
  const currentPlan = currentStore?.plan || "FREE";

  return (
    <>
      <DashboardHeader title="Billing" subtitle="Manage your subscription" />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isActive = currentPlan === plan.name.toUpperCase();
            const Icon = plan.icon;
            return (
              <div key={plan.name} className={`rounded-2xl border bg-white p-6 relative ${isActive ? "border-brand-600 shadow-lg" : "border-surface-200"} ${plan.popular ? "ring-2 ring-brand-600" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">Most Popular</div>
                )}
                <Icon className="h-8 w-8 text-brand-600 mb-3" />
                <h3 className="text-lg font-bold text-surface-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1 mb-4">
                  <span className="text-2xl font-extrabold text-surface-900">{plan.price}</span>
                  <span className="text-xs text-surface-500">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-surface-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full text-sm py-2.5 rounded-xl font-semibold ${isActive ? "bg-brand-50 text-brand-700 cursor-default" : "btn-primary"}`}
                  disabled={isActive}
                  onClick={() => {
                    if (!isActive) alert(`Upgrade to ${plan.name} coming soon! Contact support@afrostore.com to upgrade.`);
                  }}
                >
                  {isActive ? "Current Plan" : "Upgrade"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
