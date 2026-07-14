"use client";
import { Check, Loader2, X } from "lucide-react";
import { Copy, DollarSign, Eye, Gift, Link2, MoreHorizontal, MousePointerClick, Settings, ShoppingCart, ToggleLeft, ToggleRight, TrendingUp, UserPlus, Users } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";
import { useRouter } from "next/navigation";

interface ReferralProgram {
  id: string;
  siteId: string;
  enabled: boolean;
  commissionType: "PERCENTAGE" | "FLAT";
  commissionValue: number;
  cookieDays: number;
  minPayoutAmount: number;
  autoApprove: boolean;
  welcomeMessage?: string;
  termsText?: string;
}

interface AffiliateData {
  id: string;
  code: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
  totalClicks: number;
  totalOrders: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  createdAt: string;
  customer: { id: string; firstName: string; lastName: string; email: string };
  _count: { referrals: number; payouts: number };
}

interface ProgramResponse extends ReferralProgram {
  affiliates: AffiliateData[];
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function ReferralsPage() {
  const { currentStore } = useSite();
  const router = useRouter();
  const { prefillData, clearPrefill, isFromAI } = useAIPrefill("referral_program");
  const [program, setProgram] = useState<ProgramResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddAffiliate, setShowAddAffiliate] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [addingAffiliate, setAddingAffiliate] = useState(false);

  // Settings form
  const [settings, setSettings] = useState({
    enabled: true,
    commissionType: "PERCENTAGE" as "PERCENTAGE" | "FLAT",
    commissionValue: 10,
    cookieDays: 30,
    minPayoutAmount: 5000,
    autoApprove: false,
    welcomeMessage: "",
    termsText: "",
  });

  const loadProgram = useCallback(async () => {
    if (!currentStore) return;
    const res = await api.get<ProgramResponse>(`/api/sites/${currentStore.id}/referrals`);
    if (res.success && res.data) {
      setProgram(res.data);
      setSettings({
        enabled: res.data.enabled,
        commissionType: res.data.commissionType,
        commissionValue: res.data.commissionValue,
        cookieDays: res.data.cookieDays,
        minPayoutAmount: res.data.minPayoutAmount,
        autoApprove: res.data.autoApprove,
        welcomeMessage: res.data.welcomeMessage || "",
        termsText: res.data.termsText || "",
      });
    }
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { loadProgram(); }, [loadProgram]);

  // AI prefill
  useEffect(() => {
    if (prefillData && isFromAI) {
      setSettings((prev) => ({ ...prev, ...(prefillData as any) }));
      setShowSettings(true);
    }
  }, [prefillData, isFromAI]);

  const loadCustomers = async () => {
    if (!currentStore) return;
    const res = await api.get<any>(`/api/sites/${currentStore.id}/customers?limit=100`);
    if (res.success && res.data) {
      setCustomers(Array.isArray(res.data) ? res.data : res.data.customers || []);
    }
  };

  const saveSettings = async () => {
    if (!currentStore) return;
    setSaving(true);
    await api.post(`/api/sites/${currentStore.id}/referrals`, settings);
    await loadProgram();
    setSaving(false);
    setShowSettings(false);
    if (isFromAI) { clearPrefill(); router.push("/dashboard/ai"); }
  };

  const addAffiliate = async () => {
    if (!currentStore || !selectedCustomer) return;
    setAddingAffiliate(true);
    await api.post(`/api/sites/${currentStore.id}/referrals/affiliates`, {
      customerId: selectedCustomer,
    });
    await loadProgram();
    setAddingAffiliate(false);
    setShowAddAffiliate(false);
    setSelectedCustomer("");
  };

  const updateAffiliateStatus = async (affiliateId: string, status: string) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/referrals/affiliates/${affiliateId}`, { status });
    await loadProgram();
  };

  const copyLink = (code: string) => {
    const domain = currentStore?.customDomain || `${currentStore?.subdomain}.afrostore.com`;
    navigator.clipboard.writeText(`https://${domain}?ref=${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const currency = currentStore?.currency || "NGN";
  const symbol = currency === "NGN" ? "₦" : currency === "GHS" ? "₵" : currency;

  if (loading) {
    return (
      <>
        <DashboardHeader title="Referrals" subtitle="Manage your affiliate referral program" />
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      </>
    );
  }

  // Stats
  const affiliates = program?.affiliates || [];
  const totalAffiliates = affiliates.length;
  const activeAffiliates = affiliates.filter((a) => a.status === "APPROVED").length;
  const totalClicks = affiliates.reduce((s, a) => s + a.totalClicks, 0);
  const totalOrders = affiliates.reduce((s, a) => s + a.totalOrders, 0);
  const totalEarnings = affiliates.reduce((s, a) => s + a.totalEarnings, 0);
  const totalPending = affiliates.reduce((s, a) => s + a.pendingEarnings, 0);

  const stats = [
    { label: "Affiliates", value: activeAffiliates, icon: Users, color: "brand" },
    { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "blue" },
    { label: "Referred Orders", value: totalOrders, icon: ShoppingCart, color: "purple" },
    { label: "Total Commissions", value: `${symbol}${totalEarnings.toLocaleString()}`, icon: DollarSign, color: "accent" },
  ];

  const colorMap: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    accent: "bg-accent-50 text-accent-600",
  };

  const statusColors: Record<string, string> = {
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    SUSPENDED: "bg-red-50 text-red-700 border-red-200",
    REJECTED: "bg-surface-100 text-surface-500 border-surface-200",
  };

  return (
    <>
      <DashboardHeader
        title="Referrals"
        subtitle="Grow your sales through affiliate referral links"
        action={program ? { label: "Settings", href: "#", onClick: () => setShowSettings(true) } : undefined}
      />

      <div className="p-6 space-y-6">
        {isFromAI && <AIPrefillBanner entityType="referral program" onDiscard={() => { clearPrefill(); setShowSettings(false); }} />}
        {/* No program yet */}
        {!program && (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <Gift className="h-8 w-8 text-brand-600" />
            </div>
            <h2 className="text-xl font-bold text-surface-900 font-display mb-2">
              Launch Your Referral Program
            </h2>
            <p className="text-sm text-surface-500 max-w-md mx-auto mb-6">
              Let your customers earn commissions by referring new buyers. Set a commission rate, share unique links, and watch your sales grow.
            </p>
            <button onClick={() => setShowSettings(true)} className="btn-primary">
              <Link2 className="h-4 w-4" />
              Set Up Referral Program
            </button>
          </div>
        )}

        {/* Program exists */}
        {program && (
          <>
            {/* Program status bar */}
            <div className="rounded-2xl border border-surface-200 bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${program.enabled ? "bg-green-500" : "bg-surface-300"}`} />
                <span className="text-sm font-medium text-surface-900">
                  {program.enabled ? "Program Active" : "Program Paused"}
                </span>
                <span className="text-xs text-surface-400">
                  {program.commissionValue}{program.commissionType === "PERCENTAGE" ? "%" : ` ${currency}`} per referral
                </span>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="text-xs text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-2xl border border-surface-200 bg-white p-5 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[stat.color]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-surface-900 font-display">{stat.value}</div>
                    <div className="text-xs text-surface-500 mt-0.5">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Pending earnings banner */}
            {totalPending > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    {symbol}{totalPending.toLocaleString()} in pending commissions awaiting approval
                  </span>
                </div>
              </div>
            )}

            {/* Affiliates table */}
            <div className="rounded-2xl border border-surface-200 bg-white">
              <div className="flex items-center justify-between p-6 pb-4">
                <div>
                  <h3 className="text-base font-bold text-surface-900">Affiliates</h3>
                  <p className="text-xs text-surface-500 mt-0.5">{totalAffiliates} total affiliate{totalAffiliates !== 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => { setShowAddAffiliate(true); loadCustomers(); }}
                  className="btn-primary text-xs py-2"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Add Affiliate
                </button>
              </div>

              {affiliates.length === 0 ? (
                <div className="px-6 pb-8 text-center text-sm text-surface-400">
                  No affiliates yet. Add your first affiliate to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-t border-surface-100">
                        <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Affiliate</th>
                        <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Code</th>
                        <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Status</th>
                        <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Clicks</th>
                        <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Orders</th>
                        <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Earned</th>
                        <th className="px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {affiliates.map((aff) => (
                        <tr key={aff.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold">
                                {aff.customer.firstName[0]}{aff.customer.lastName[0]}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-surface-900">{aff.customer.firstName} {aff.customer.lastName}</div>
                                <div className="text-[10px] text-surface-400">{aff.customer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono bg-surface-100 px-2 py-0.5 rounded">{aff.code}</code>
                              <button onClick={() => copyLink(aff.code)} className="text-surface-400 hover:text-brand-600">
                                {copiedCode === aff.code ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusColors[aff.status]}`}>
                              {aff.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right text-sm text-surface-700">{aff.totalClicks}</td>
                          <td className="px-6 py-3.5 text-right text-sm text-surface-700">{aff.totalOrders}</td>
                          <td className="px-6 py-3.5 text-right text-sm font-semibold text-surface-900">{symbol}{aff.totalEarnings.toLocaleString()}</td>
                          <td className="px-6 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {aff.status === "PENDING" && (
                                <button
                                  onClick={() => updateAffiliateStatus(aff.id, "APPROVED")}
                                  className="text-[10px] font-semibold text-green-600 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50"
                                >
                                  Approve
                                </button>
                              )}
                              {aff.status === "APPROVED" && (
                                <button
                                  onClick={() => updateAffiliateStatus(aff.id, "SUSPENDED")}
                                  className="text-[10px] font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                                >
                                  Suspend
                                </button>
                              )}
                              {aff.status === "SUSPENDED" && (
                                <button
                                  onClick={() => updateAffiliateStatus(aff.id, "APPROVED")}
                                  className="text-[10px] font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded hover:bg-brand-50"
                                >
                                  Reactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-surface-900 font-display">Referral Program Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-surface-400 hover:text-surface-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Enable toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-900">Enable Program</p>
                  <p className="text-xs text-surface-500">Allow affiliates to earn commissions</p>
                </div>
                <button onClick={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}>
                  {settings.enabled
                    ? <ToggleRight className="h-8 w-8 text-brand-600" />
                    : <ToggleLeft className="h-8 w-8 text-surface-300" />
                  }
                </button>
              </div>

              {/* Commission */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Commission Type</label>
                  <select
                    value={settings.commissionType}
                    onChange={(e) => setSettings((s) => ({ ...s, commissionType: e.target.value as "PERCENTAGE" | "FLAT" }))}
                    className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount ({symbol})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">
                    Commission {settings.commissionType === "PERCENTAGE" ? "(%)" : `(${symbol})`}
                  </label>
                  <input
                    type="number"
                    value={settings.commissionValue}
                    onChange={(e) => setSettings((s) => ({ ...s, commissionValue: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                    min={0}
                    max={settings.commissionType === "PERCENTAGE" ? 100 : undefined}
                  />
                </div>
              </div>

              {/* Cookie & min payout */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Cookie Duration (days)</label>
                  <input
                    type="number"
                    value={settings.cookieDays}
                    onChange={(e) => setSettings((s) => ({ ...s, cookieDays: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Min Payout ({symbol})</label>
                  <input
                    type="number"
                    value={settings.minPayoutAmount}
                    onChange={(e) => setSettings((s) => ({ ...s, minPayoutAmount: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                    min={0}
                  />
                </div>
              </div>

              {/* Auto approve */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-900">Auto-Approve Referrals</p>
                  <p className="text-xs text-surface-500">Automatically approve commissions on purchase</p>
                </div>
                <button onClick={() => setSettings((s) => ({ ...s, autoApprove: !s.autoApprove }))}>
                  {settings.autoApprove
                    ? <ToggleRight className="h-8 w-8 text-brand-600" />
                    : <ToggleLeft className="h-8 w-8 text-surface-300" />
                  }
                </button>
              </div>

              {/* Welcome message */}
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1.5">Welcome Message (optional)</label>
                <textarea
                  value={settings.welcomeMessage}
                  onChange={(e) => setSettings((s) => ({ ...s, welcomeMessage: e.target.value }))}
                  className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                  rows={3}
                  placeholder="Message shown to new affiliates..."
                />
              </div>

              <button
                onClick={saveSettings}
                disabled={saving}
                className="w-full btn-primary py-2.5 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Affiliate Modal */}
      {showAddAffiliate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddAffiliate(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-surface-900 font-display">Add Affiliate</h2>
              <button onClick={() => setShowAddAffiliate(false)} className="text-surface-400 hover:text-surface-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1.5">Select Customer</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                >
                  <option value="">Choose a customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} — {c.email}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={addAffiliate}
                disabled={!selectedCustomer || addingAffiliate}
                className="w-full btn-primary py-2.5 disabled:opacity-50"
              >
                {addingAffiliate ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add as Affiliate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
