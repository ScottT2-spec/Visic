"use client";
import { ArrowRight, Loader2 } from "lucide-react";
import { Bot, CheckCircle2, Clock, DollarSign, ExternalLink, Globe, MessageCircle, Package, ShoppingCart, Sparkles, Store, TrendingDown, TrendingUp, Truck, Users } from "@/components/icons/FilledIcons";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";
import { useSiteApi } from "@/hooks/useApiData";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardData {
  stats: {
    totalRevenue: number;
    revenueChange: number;
    totalOrders: number;
    ordersChange: number;
    totalCustomers: number;
    customersChange: number;
    totalProducts: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    email: string;
    total: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    _count: { orderItems: number };
  }>;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  PROCESSING: { label: "Processing", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-accent-50 text-accent-700 border-accent-200", icon: Clock },
};

function EmptyDashboard() {
  const router = useRouter();
  return (
    <div className="p-6">
      <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
          <Store className="h-8 w-8 text-brand-600" />
        </div>
        <h2 className="text-xl font-bold text-surface-900 mb-2">Create your first store</h2>
        <p className="text-surface-500 mb-6 max-w-sm mx-auto">
          Get started by creating a store. You&apos;ll be selling in minutes.
        </p>
        <button onClick={() => router.push("/dashboard/new-site")} className="btn-primary">
          <Sparkles className="h-4 w-4" />
          Create Store
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentStore, loading: storeLoading } = useSite();
  const { data, loading, error } = useSiteApi<DashboardData>("/dashboard");

  if (storeLoading) {
    return (
      <>
        <DashboardHeader title="Dashboard" subtitle="Loading..." />
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      </>
    );
  }

  if (!currentStore) {
    return (
      <>
        <DashboardHeader title="Dashboard" subtitle="Welcome to AfroStore!" />
        <EmptyDashboard />
      </>
    );
  }

  const stats = data?.stats;
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];
  const currency = currentStore.currency || "GHS";

  const statCards = [
    {
      label: "Total Revenue",
      value: stats ? formatCurrency(stats.totalRevenue, currency) : "—",
      change: stats ? `${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange.toFixed(1)}%` : "",
      trend: stats ? (stats.revenueChange >= 0 ? "up" : "down") : "up",
      icon: DollarSign,
      color: "brand",
    },
    {
      label: "Orders",
      value: stats?.totalOrders?.toString() || "0",
      change: stats ? `${stats.ordersChange >= 0 ? "+" : ""}${stats.ordersChange.toFixed(1)}%` : "",
      trend: stats ? (stats.ordersChange >= 0 ? "up" : "down") : "up",
      icon: ShoppingCart,
      color: "blue",
    },
    {
      label: "Customers",
      value: stats?.totalCustomers?.toString() || "0",
      change: stats ? `${stats.customersChange >= 0 ? "+" : ""}${stats.customersChange.toFixed(1)}%` : "",
      trend: stats ? (stats.customersChange >= 0 ? "up" : "down") : "up",
      icon: Users,
      color: "purple",
    },
    {
      label: "Products",
      value: stats?.totalProducts?.toString() || "0",
      change: "",
      trend: "up" as const,
      icon: Package,
      color: "accent",
    },
  ];

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.firstName}! Here's what's happening with ${currentStore.name}.`}

      />

      <div className="p-6 space-y-6">
        {/* View Store Banner */}
        <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-accent-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-900">Your store is live!</p>
              <p className="text-xs text-surface-500">{currentStore.subdomain}.afrostore.com</p>
            </div>
          </div>
          <Link
            href={`/store/${currentStore.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors shadow-md shadow-brand-600/20"
          >
            <ExternalLink className="h-4 w-4" />
            View My Store
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const isUp = stat.trend === "up";
            const colorMap: Record<string, string> = {
              brand: "bg-brand-50 text-brand-600",
              blue: "bg-blue-50 text-blue-600",
              purple: "bg-purple-50 text-purple-600",
              accent: "bg-accent-50 text-accent-600",
            };
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-surface-200 bg-white p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[stat.color]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {stat.change && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? "text-green-600" : "text-accent-600"}`}>
                      {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {stat.change}
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-surface-900 font-display">
                  {loading ? <div className="h-7 w-24 bg-surface-100 rounded animate-pulse" /> : stat.value}
                </div>
                <div className="text-xs text-surface-500 mt-0.5">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 rounded-2xl border border-surface-200 bg-white">
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <h3 className="text-base font-bold text-surface-900">Recent Orders</h3>
                <p className="text-xs text-surface-500 mt-0.5">Latest transactions</p>
              </div>
              <Link
                href="/dashboard/orders"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="p-6 pt-0 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-surface-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-6 pt-0 text-center text-sm text-surface-500 py-10">
                No orders yet. Share your store link to start selling!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-t border-surface-100">
                      <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Order</th>
                      <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Customer</th>
                      <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Status</th>
                      <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {recentOrders.map((order) => {
                      const sc = statusConfig[order.status] || statusConfig.PENDING;
                      const StatusIcon = sc.icon;
                      return (
                        <tr key={order.id} className="hover:bg-surface-50 transition-colors cursor-pointer">
                          <td className="px-6 py-3.5">
                            <div className="text-sm font-semibold text-surface-900">{order.orderNumber}</div>
                            <div className="text-[10px] text-surface-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-sm text-surface-700">{order.email}</td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${sc.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right text-sm font-semibold text-surface-900">
                            {formatCurrency(Number(order.total), order.currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AI Assistant Card */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/25">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-surface-900">AI Insights</h3>
                <p className="text-[10px] text-surface-500">Your commerce co-founder</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats && stats.totalProducts === 0 && (
                <div className="rounded-xl border border-surface-100 bg-surface-50 p-3">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-brand-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-surface-600">Add your first products to start selling.</p>
                      <Link href="/dashboard/products" className="mt-2 text-[10px] font-semibold text-brand-600 flex items-center gap-1">
                        Add Products <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              {stats && stats.totalOrders === 0 && stats.totalProducts > 0 && (
                <div className="rounded-xl border border-surface-100 bg-surface-50 p-3">
                  <div className="flex items-start gap-2.5">
                    <MessageCircle className="h-4 w-4 text-brand-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-surface-600">
                        You have products but no orders yet. Share your store link!
                      </p>
                      <p className="mt-1 text-[10px] text-surface-400">
                        {currentStore.subdomain}.afrostore.com
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {stats && stats.totalOrders > 0 && (
                <div className="rounded-xl border border-surface-100 bg-surface-50 p-3">
                  <div className="flex items-start gap-2.5">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                    <p className="text-xs text-surface-600">
                      You have {stats.totalOrders} orders from {stats.totalCustomers} customers. Keep it up!
                    </p>
                  </div>
                </div>
              )}
            </div>
            <Link href="/dashboard/ai" className="mt-4 w-full btn-secondary text-xs py-2">
              <Bot className="h-3.5 w-3.5" />
              Open AI Assistant
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
