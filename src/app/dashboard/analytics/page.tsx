"use client";
import { Loader2 } from "lucide-react";
import { BarChart3, Eye, MousePointerClick, ShoppingCart, TrendingUp, Users } from "@/components/icons/FilledIcons";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSiteApi } from "@/hooks/useApiData";
import { useSite } from "@/context/StoreContext";
import { formatCurrency } from "@/lib/utils";

interface AnalyticsData {
  summary: {
    pageViews: number;
    uniqueVisitors: number;
    addToCarts: number;
    purchases: number;
    conversionRate: number;
    revenue: number;
  };
  topPages: Array<{ page: string; views: number }>;
  topProducts: Array<{ productId: string; name: string; views: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  sourceBreakdown: Array<{ source: string; count: number }>;
}

export default function AnalyticsPage() {
  const { currentStore } = useSite();
  const { data, loading } = useSiteApi<AnalyticsData>("/analytics?period=30d");
  const currency = currentStore?.currency || "NGN";

  const summary = data?.summary;

  const statCards = [
    { label: "Page Views", value: summary?.pageViews || 0, icon: Eye, color: "blue" },
    { label: "Unique Visitors", value: summary?.uniqueVisitors || 0, icon: Users, color: "purple" },
    { label: "Add to Carts", value: summary?.addToCarts || 0, icon: ShoppingCart, color: "accent" },
    { label: "Purchases", value: summary?.purchases || 0, icon: MousePointerClick, color: "brand" },
  ];

  return (
    <>
      <DashboardHeader title="Analytics" subtitle="Last 30 days performance" />
      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
        ) : !summary ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <BarChart3 className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 mb-2">No analytics data yet</h3>
            <p className="text-sm text-surface-500">Analytics will appear once your store gets traffic.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                const colorMap: Record<string, string> = {
                  brand: "bg-brand-50 text-brand-600",
                  blue: "bg-blue-50 text-blue-600",
                  purple: "bg-purple-50 text-purple-600",
                  accent: "bg-accent-50 text-accent-600",
                };
                return (
                  <div key={stat.label} className="rounded-2xl border border-surface-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[stat.color]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-surface-900 font-display">{stat.value.toLocaleString()}</div>
                    <div className="text-xs text-surface-500 mt-0.5">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversion */}
              <div className="rounded-2xl border border-surface-200 bg-white p-6">
                <h3 className="text-base font-bold text-surface-900 mb-4">Conversion</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-500">Conversion Rate</span>
                    <span className="text-lg font-bold text-brand-600">{(summary.conversionRate || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-500">Revenue</span>
                    <span className="text-lg font-bold text-surface-900">{formatCurrency(summary.revenue || 0, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Top Pages */}
              <div className="rounded-2xl border border-surface-200 bg-white p-6">
                <h3 className="text-base font-bold text-surface-900 mb-4">Top Pages</h3>
                {data?.topPages && data.topPages.length > 0 ? (
                  <div className="space-y-3">
                    {data.topPages.slice(0, 5).map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-surface-700 truncate">{p.page}</span>
                        <span className="text-xs font-semibold text-surface-500">{p.views}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-500">No page view data yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
