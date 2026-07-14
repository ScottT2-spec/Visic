"use client";
import { Loader2, X } from "lucide-react";
import { Award, Crown, Gift, Settings, Star, ToggleLeft, ToggleRight, TrendingUp, Users } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";
import { useRouter } from "next/navigation";

interface LoyaltyProgram {
  id: string; enabled: boolean; pointsPerCurrency: number; currencyPerPoint: number;
  redemptionRate: number; minRedeemPoints: number; welcomePoints: number; referralPoints: number; reviewPoints: number;
  members: LoyaltyMember[];
}
interface LoyaltyMember {
  id: string; totalPoints: number; availablePoints: number; redeemedPoints: number; tier: string;
  customer: { id: string; firstName: string; lastName: string; email: string };
}
interface Stats { totalMembers: number; totalPointsIssued: number; totalPointsRedeemed: number }

const tierColors: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-800",
  silver: "bg-surface-200 text-surface-700",
  gold: "bg-yellow-100 text-yellow-800",
  platinum: "bg-purple-100 text-purple-800",
};

export default function LoyaltyPage() {
  const { currentStore } = useSite();
  const router = useRouter();
  const { prefillData, clearPrefill, isFromAI } = useAIPrefill("loyalty");
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  const currency = currentStore?.currency || "NGN";
  const symbol = currency === "NGN" ? "₦" : currency === "GHS" ? "₵" : currency;

  const [form, setForm] = useState({
    enabled: true, pointsPerCurrency: 1, currencyPerPoint: 100,
    redemptionRate: 0.01, minRedeemPoints: 100, welcomePoints: 0, referralPoints: 50, reviewPoints: 10,
  });

  const load = useCallback(async () => {
    if (!currentStore) return;
    const res = await api.get<{ program: LoyaltyProgram | null; stats: Stats }>(`/api/sites/${currentStore.id}/loyalty`);
    if (res.success && res.data) {
      setProgram(res.data.program);
      setStats(res.data.stats);
      if (res.data.program) {
        setForm({
          enabled: res.data.program.enabled,
          pointsPerCurrency: res.data.program.pointsPerCurrency,
          currencyPerPoint: res.data.program.currencyPerPoint,
          redemptionRate: res.data.program.redemptionRate,
          minRedeemPoints: res.data.program.minRedeemPoints,
          welcomePoints: res.data.program.welcomePoints,
          referralPoints: res.data.program.referralPoints,
          reviewPoints: res.data.program.reviewPoints,
        });
      }
    }
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { load(); }, [load]);

  // AI prefill
  useEffect(() => {
    if (prefillData && isFromAI) {
      setForm((prev) => ({ ...prev, ...(prefillData as any) }));
      setShowSettings(true);
    }
  }, [prefillData, isFromAI]);

  const saveSettings = async () => {
    if (!currentStore) return;
    setSaving(true);
    await api.post(`/api/sites/${currentStore.id}/loyalty`, form);
    await load();
    setSaving(false);
    setShowSettings(false);
    if (isFromAI) { clearPrefill(); router.push("/dashboard/ai"); }
  };

  if (loading) return (
    <>
      <DashboardHeader title="Loyalty" subtitle="Reward your customers" />
      <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
    </>
  );

  const members = program?.members || [];

  const statCards = stats ? [
    { label: "Total Members", value: stats.totalMembers, icon: Users, color: "bg-brand-50 text-brand-600" },
    { label: "Points Issued", value: stats.totalPointsIssued.toLocaleString(), icon: Star, color: "bg-amber-50 text-amber-600" },
    { label: "Points Redeemed", value: stats.totalPointsRedeemed.toLocaleString(), icon: Gift, color: "bg-green-50 text-green-600" },
    { label: "Reward Value", value: `${symbol}${((stats.totalPointsRedeemed * (program?.redemptionRate || 0.01))).toLocaleString()}`, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
  ] : [];

  return (
    <>
      <DashboardHeader
        title="Loyalty Program"
        subtitle="Reward repeat customers and drive retention"
        action={program ? { label: "Settings", onClick: () => setShowSettings(true) } : undefined}
      />
      <div className="p-6 space-y-6">
        {isFromAI && <AIPrefillBanner entityType="loyalty program" onDiscard={() => { clearPrefill(); setShowSettings(false); }} />}
        {!program ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-surface-900 font-display mb-2">Launch Your Loyalty Program</h2>
            <p className="text-sm text-surface-500 max-w-md mx-auto mb-6">
              Reward customers with points for purchases, reviews, and referrals. Points can be redeemed for discounts on future orders.
            </p>
            <button onClick={() => setShowSettings(true)} className="btn-primary"><Crown className="h-4 w-4" /> Set Up Loyalty Program</button>
          </div>
        ) : (
          <>
            {/* Program status */}
            <div className="rounded-2xl border border-surface-200 bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${program.enabled ? "bg-green-500" : "bg-surface-300"}`} />
                <span className="text-sm font-medium text-surface-900">{program.enabled ? "Program Active" : "Program Paused"}</span>
                <span className="text-xs text-surface-400">
                  {program.pointsPerCurrency} pt per {symbol}{program.currencyPerPoint} spent · 1 pt = {symbol}{program.redemptionRate}
                </span>
              </div>
              <button onClick={() => setShowSettings(true)} className="text-xs text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1">
                <Settings className="h-3.5 w-3.5" /> Settings
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="rounded-2xl border border-surface-200 bg-white p-5 hover:shadow-md transition-all">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${s.color}`}><Icon className="h-5 w-5" /></div>
                    <div className="text-2xl font-bold text-surface-900 font-display">{s.value}</div>
                    <div className="text-xs text-surface-500 mt-0.5">{s.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Earning rules */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-base font-bold text-surface-900 mb-4">How Customers Earn Points</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Purchases", desc: `${program.pointsPerCurrency} pt per ${symbol}${program.currencyPerPoint} spent`, icon: "🛍️" },
                  { label: "Reviews", desc: `${program.reviewPoints} pts per review`, icon: "⭐" },
                  { label: "Referrals", desc: `${program.referralPoints} pts per referral`, icon: "🤝" },
                ].map((r) => (
                  <div key={r.label} className="rounded-xl bg-surface-50 p-4 text-center">
                    <div className="text-2xl mb-2">{r.icon}</div>
                    <div className="text-sm font-bold text-surface-900">{r.label}</div>
                    <div className="text-xs text-surface-500 mt-0.5">{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Members table */}
            <div className="rounded-2xl border border-surface-200 bg-white">
              <div className="p-6 pb-4">
                <h3 className="text-base font-bold text-surface-900">Members</h3>
                <p className="text-xs text-surface-500 mt-0.5">{members.length} member{members.length !== 1 ? "s" : ""}</p>
              </div>
              {members.length === 0 ? (
                <div className="px-6 pb-8 text-center text-sm text-surface-400">No loyalty members yet. Customers join automatically on their first purchase.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-t border-surface-100">
                        <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Member</th>
                        <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Tier</th>
                        <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Total Points</th>
                        <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Available</th>
                        <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Redeemed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold">
                                {m.customer.firstName[0]}{m.customer.lastName[0]}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-surface-900">{m.customer.firstName} {m.customer.lastName}</div>
                                <div className="text-[10px] text-surface-400">{m.customer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${tierColors[m.tier] || tierColors.bronze}`}>
                              <Award className="h-3 w-3" /> {m.tier}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right text-sm font-semibold text-surface-900">{m.totalPoints.toLocaleString()}</td>
                          <td className="px-6 py-3.5 text-right text-sm text-surface-700">{m.availablePoints.toLocaleString()}</td>
                          <td className="px-6 py-3.5 text-right text-sm text-surface-500">{m.redeemedPoints.toLocaleString()}</td>
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
              <h2 className="text-lg font-bold text-surface-900 font-display">Loyalty Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-surface-400 hover:text-surface-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-900">Enable Program</p>
                  <p className="text-xs text-surface-500">Customers earn points on purchases</p>
                </div>
                <button onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}>
                  {form.enabled ? <ToggleRight className="h-8 w-8 text-brand-600" /> : <ToggleLeft className="h-8 w-8 text-surface-300" />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Points Per Purchase</label>
                  <input type="number" value={form.pointsPerCurrency} onChange={(e) => setForm({ ...form, pointsPerCurrency: Number(e.target.value) })} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm" min={0} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Per {symbol} Spent</label>
                  <input type="number" value={form.currencyPerPoint} onChange={(e) => setForm({ ...form, currencyPerPoint: Number(e.target.value) })} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm" min={1} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Point Value ({symbol})</label>
                  <input type="number" step="0.01" value={form.redemptionRate} onChange={(e) => setForm({ ...form, redemptionRate: Number(e.target.value) })} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm" min={0} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Min Points to Redeem</label>
                  <input type="number" value={form.minRedeemPoints} onChange={(e) => setForm({ ...form, minRedeemPoints: Number(e.target.value) })} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm" min={0} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Welcome Bonus</label>
                  <input type="number" value={form.welcomePoints} onChange={(e) => setForm({ ...form, welcomePoints: Number(e.target.value) })} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm" min={0} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Review Pts</label>
                  <input type="number" value={form.reviewPoints} onChange={(e) => setForm({ ...form, reviewPoints: Number(e.target.value) })} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm" min={0} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5">Referral Pts</label>
                  <input type="number" value={form.referralPoints} onChange={(e) => setForm({ ...form, referralPoints: Number(e.target.value) })} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm" min={0} />
                </div>
              </div>
              <button onClick={saveSettings} disabled={saving} className="w-full btn-primary py-2.5 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
