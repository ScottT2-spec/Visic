"use client";
import { ArrowRight, Loader2 } from "lucide-react";
import { AlertCircle, CheckCircle2, CreditCard, Shield } from "@/components/icons/FilledIcons";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";
import { useRouter } from "next/navigation";

interface Gateway {
  id: string;
  provider: string;
  isEnabled: boolean;
  publicKey?: string;
}

const providerInfo: Record<string, { name: string; desc: string; color: string }> = {
  MONNIFY: { name: "Monnify", desc: "Bank transfers, cards, USSD, mobile money", color: "from-blue-500 to-blue-600" },
  PAYSTACK: { name: "Paystack", desc: "Cards, bank transfers, mobile money", color: "from-teal-500 to-teal-600" },
  FLUTTERWAVE: { name: "Flutterwave", desc: "Cards, bank transfers, mobile money, Barter", color: "from-orange-500 to-orange-600" },
};

export default function PaymentsPage() {
  const { currentStore } = useSite();
  const router = useRouter();
  const { prefillData, clearPrefill, isFromAI } = useAIPrefill("payment_gateway");
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupProvider, setSetupProvider] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [setupError, setSetupError] = useState("");

  useEffect(() => {
    if (!currentStore) return;
    (async () => {
      const res = await api.get<Gateway[]>(`/api/sites/${currentStore.id}/payment-gateways`);
      if (res.success && res.data) setGateways(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    })();
  }, [currentStore]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore || !setupProvider) return;
    setSaving(true);
    setSetupError("");
    const res = await api.post(`/api/sites/${currentStore.id}/payment-gateways`, {
      provider: setupProvider,
      publicKey,
      secretKey,
    });
    if (res.success) {
      setSetupProvider(null);
      setPublicKey("");
      setSecretKey("");
      // Refresh
      const r = await api.get<Gateway[]>(`/api/sites/${currentStore.id}/payment-gateways`);
      if (r.success && r.data) setGateways(Array.isArray(r.data) ? r.data : []);
    } else {
      setSetupError(res.error || "Setup failed");
    }
    setSaving(false);
    if (isFromAI) { clearPrefill(); router.push("/dashboard/ai"); }
  };

  // AI prefill — auto-open setup for a specific provider
  useEffect(() => {
    if (prefillData && isFromAI && (prefillData as any).provider) {
      const d = prefillData as any;
      setSetupProvider(d.provider);
      if (d.publicKey) setPublicKey(d.publicKey);
      if (d.secretKey) setSecretKey(d.secretKey);
    }
  }, [prefillData, isFromAI]);

  if (loading) return (
    <>
      <DashboardHeader title="Payments" />
      <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
    </>
  );

  return (
    <>
      <DashboardHeader title="Payments" subtitle="Connect your payment gateways" />
      <div className="p-6 space-y-4 max-w-3xl">
        {isFromAI && <AIPrefillBanner entityType="payment gateway" onDiscard={() => { clearPrefill(); setSetupProvider(null); }} />}
        {["MONNIFY", "PAYSTACK", "FLUTTERWAVE"].map((provider) => {
          const info = providerInfo[provider];
          const gw = gateways.find((g) => g.provider === provider);
          const connected = gw?.isEnabled;

          return (
            <div key={provider} className="rounded-2xl border border-surface-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white`}>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-surface-900">{info.name}</h3>
                    <p className="text-xs text-surface-500">{info.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {connected ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                    </span>
                  ) : (
                    <button onClick={() => setSetupProvider(provider)} className="btn-primary text-xs py-2 px-4">
                      Connect <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Setup Modal */}
        {setupProvider && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSetupProvider(null)}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-surface-900 mb-1">Connect {providerInfo[setupProvider].name}</h2>
              <p className="text-xs text-surface-500 mb-6">Enter your API keys from {providerInfo[setupProvider].name} dashboard.</p>
              <form onSubmit={handleSetup} className="space-y-4">
                {setupError && <div className="rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700">{setupError}</div>}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Public Key</label>
                  <input value={publicKey} onChange={(e) => setPublicKey(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Secret Key</label>
                  <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="input-field" required />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setSetupProvider(null)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-4">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Shield className="h-4 w-4" /> Connect</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
