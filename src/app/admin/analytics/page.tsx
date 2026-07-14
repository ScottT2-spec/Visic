"use client";
import { Loader2 } from "lucide-react";
import { DollarSign, ShoppingCart, Store, Users } from "@/components/icons/FilledIcons";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface AnalyticsData {
  signups: { date: string; count: number }[];
  stores: { date: string; count: number }[];
  sites: { date: string; count: number }[];
  orders: { date: string; count: number }[];
  revenue: { date: string; amount: number }[];
  totals?: { users: number; stores: number; sites: number; orders: number; revenue: number };
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AnalyticsData>("/api/admin/analytics").then((res) => {
      if (res.success && res.data) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-accent-600" /></div>;
  if (!data) return <div className="p-6 text-surface-500">Failed to load analytics.</div>;

  // Compute totals from chart data
  const totalSignups = data.totals?.users ?? data.signups.reduce((s, d) => s + d.count, 0);
  const totalStores = data.totals?.sites ?? (data.sites || data.stores).reduce((s: number, d: { count: number }) => s + d.count, 0);
  const totalOrders = data.totals?.orders ?? data.orders.reduce((s, d) => s + d.count, 0);
  const totalRevenue = data.totals?.revenue ?? data.revenue.reduce((s, d) => s + d.amount, 0);

  const summaryCards = [
    { label: "Total Users", value: totalSignups.toLocaleString(), icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Total Stores", value: totalStores.toLocaleString(), icon: Store, color: "bg-purple-50 text-purple-600" },
    { label: "Total Orders", value: totalOrders.toLocaleString(), icon: ShoppingCart, color: "bg-green-50 text-green-600" },
    { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-amber-50 text-amber-600" },
  ];

  const charts: { title: string; subtitle: string; data: Record<string, string | number>[]; dataKey: string; label: string; format?: (v: number) => string }[] = [
    { title: "User Signups", subtitle: "Last 30 days", data: data.signups, dataKey: "count", label: "Signups" },
    { title: "Stores Created", subtitle: "Last 30 days", data: data.sites || data.stores, dataKey: "count", label: "Stores" },
    { title: "Orders", subtitle: "Last 30 days", data: data.orders, dataKey: "count", label: "Orders" },
    { title: "Revenue", subtitle: "Last 30 days", data: data.revenue, dataKey: "amount", label: "Revenue", format: (v: number) => `₵${v.toLocaleString()}` },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 font-display">Platform Analytics</h1>
        <p className="text-sm text-surface-500 mt-1">Platform-wide growth metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-surface-200 bg-white p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color} mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-surface-900 font-display">{card.value}</div>
              <div className="text-xs text-surface-500 mt-0.5">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart) => (
          <div key={chart.title} className="rounded-2xl border border-surface-200 bg-white p-6">
            <div className="mb-6">
              <h3 className="text-base font-bold text-surface-900">{chart.title}</h3>
              <p className="text-xs text-surface-500 mt-0.5">{chart.subtitle}</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={chart.format || undefined} />
                  <Tooltip formatter={(value) => [chart.format ? chart.format(Number(value)) : value, chart.label]} />
                  <Area type="monotone" dataKey={chart.dataKey} stroke="#1E293B" fill="#1E293B" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
