"use client";
import { Loader2 } from "lucide-react";
import { AlertTriangle, Bell, Globe, MessageCircle, Save, Shield, Store, Trash2, Truck } from "@/components/icons/FilledIcons";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";

export default function SettingsPage() {
  const router = useRouter();
  const { currentStore, stores, setCurrentStore, refreshStores } = useSite();
  const { prefillData, clearPrefill, isFromAI } = useAIPrefill("settings");
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    allowGuestCheckout: true,
    payOnDelivery: true,
    bankTransfer: true,
    whatsappOrdering: true,
    showStockCount: false,
    lowDataMode: false,
    language: "en",
    whatsappNumber: "",
    metaTitle: "",
    metaDescription: "",
    googleAnalyticsId: "",
    facebookPixelId: "",
  });

  useEffect(() => {
    if (!currentStore) return;
    (async () => {
      const res = await api.get<any>(`/api/sites/${currentStore.id}/settings`);
      if (res.success && res.data) {
        // Strip non-settings fields from DB response
        const { id, siteId, createdAt, updatedAt, ...s } = res.data;
        setSettings((prev) => ({ ...prev, ...s }));
      }
      setLoading(false);
    })();
  }, [currentStore]);

  // AI prefill for settings
  useEffect(() => {
    if (prefillData && isFromAI) {
      setSettings((prev) => ({ ...prev, ...(prefillData as any) }));
    }
  }, [prefillData, isFromAI]);

  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    if (!currentStore) return;
    setSaving(true);
    setSaveError("");
    // Only send fields that have actual values (don't send empty strings for optional fields)
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === "boolean") {
        cleaned[key] = value;
      } else if (typeof value === "string" && value.trim()) {
        cleaned[key] = value;
      } else if (typeof value === "string") {
        cleaned[key] = null; // send null instead of empty string
      }
    }
    const res = await api.patch(`/api/sites/${currentStore.id}/settings`, cleaned);
    setSaving(false);
    if (res.success) {
      setSaved(true);
      // Re-fetch settings to confirm they persisted
      const fresh = await api.get<any>(`/api/sites/${currentStore.id}/settings`);
      if (fresh.success && fresh.data) {
        const { id: _id, siteId: _sid, createdAt: _ca, updatedAt: _ua, ...s } = fresh.data;
        setSettings((prev) => ({ ...prev, ...s }));
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setSaved(false), 3000);
      if (isFromAI) { clearPrefill(); router.push("/dashboard/ai"); }
    } else {
      setSaveError(res.error || "Failed to save settings");
    }
  };

  const toggle = (key: string) => setSettings((prev) => ({ ...prev, [key]: !(prev as any)[key] }));
  const update = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  if (loading) return (
    <>
      <DashboardHeader title="Settings" />
      <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
    </>
  );

  return (
    <>
      <DashboardHeader title="Settings" subtitle="Configure your store" />
      <div className="p-6 space-y-6 max-w-3xl">
        {isFromAI && <AIPrefillBanner entityType="settings" onDiscard={() => { clearPrefill(); }} />}
        {saved && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2 animate-pulse">
            ✅ Settings saved successfully!
          </div>
        )}
        {/* Store Info */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2"><Store className="h-5 w-5" />Store Info</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">SEO Title</label>
              <input value={settings.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} className="input-field" placeholder="Your Store Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">SEO Description</label>
              <textarea value={settings.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} className="input-field" rows={3} />
            </div>
          </div>
        </div>

        {/* Checkout */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2"><Shield className="h-5 w-5" />Checkout</h3>
          <div className="space-y-3">
            {[
              { key: "allowGuestCheckout", label: "Allow guest checkout" },
              { key: "payOnDelivery", label: "Pay on delivery" },
              { key: "bankTransfer", label: "Bank transfer checkout" },
              { key: "showStockCount", label: "Show stock count to customers" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-surface-700">{label}</span>
                <button type="button" onClick={() => toggle(key)} className={`relative w-11 h-6 rounded-full transition-colors ${(settings as any)[key] ? "bg-brand-600" : "bg-surface-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${(settings as any)[key] ? "translate-x-5" : ""}`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2"><MessageCircle className="h-5 w-5" />WhatsApp</h3>
          <label className="flex items-center justify-between cursor-pointer mb-4">
            <span className="text-sm text-surface-700">Enable WhatsApp ordering</span>
            <button type="button" onClick={() => toggle("whatsappOrdering")} className={`relative w-11 h-6 rounded-full transition-colors ${settings.whatsappOrdering ? "bg-brand-600" : "bg-surface-300"}`}>
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.whatsappOrdering ? "translate-x-5" : ""}`} />
            </button>
          </label>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">WhatsApp Number</label>
            <input value={settings.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} className="input-field" placeholder="+234 812 345 6789" />
          </div>
        </div>

        {/* Tracking */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2"><Globe className="h-5 w-5" />Tracking & Analytics</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Google Analytics ID</label>
              <input value={settings.googleAnalyticsId} onChange={(e) => update("googleAnalyticsId", e.target.value)} className="input-field" placeholder="G-XXXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Facebook Pixel ID</label>
              <input value={settings.facebookPixelId} onChange={(e) => update("facebookPixelId", e.target.value)} className="input-field" placeholder="1234567890" />
            </div>
          </div>
        </div>

        {/* Save */}
        {saveError && (
          <div className="rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700">{saveError}</div>
        )}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" />{saved ? "Saved!" : "Save Settings"}</>}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-6 mt-8">
          <h3 className="text-base font-bold text-red-700 mb-1 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </h3>
          <p className="text-sm text-red-600/70 mb-4">
            Permanently delete this store and all its data — products, orders, customers, pages, everything. This action cannot be undone.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1">
                Type <span className="font-bold">{currentStore?.name}</span> to confirm
              </label>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                placeholder={currentStore?.name || "Store name"}
              />
            </div>

            {deleteError && (
              <div className="rounded-xl bg-red-100 border border-red-300 px-4 py-2.5 text-sm text-red-700">{deleteError}</div>
            )}

            <button
              onClick={async () => {
                if (!currentStore) return;
                if (deleteConfirm !== currentStore.name) {
                  setDeleteError("Store name doesn't match. Please type it exactly.");
                  return;
                }
                setDeleting(true);
                setDeleteError("");
                const res = await api.delete(`/api/sites/${currentStore.id}`);
                if (res.success) {
                  await refreshStores();
                  const remaining = stores.filter((s: { id: string }) => s.id !== currentStore.id);
                  if (remaining.length > 0) {
                    setCurrentStore(remaining[0]);
                    router.push("/dashboard");
                  } else {
                    router.push("/dashboard/new-site");
                  }
                } else {
                  setDeleteError(res.error || "Failed to delete store");
                  setDeleting(false);
                }
              }}
              disabled={deleting || deleteConfirm !== currentStore?.name}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? "Deleting..." : "Delete This Store"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
