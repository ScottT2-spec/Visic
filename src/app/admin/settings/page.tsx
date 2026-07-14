"use client";
import { Loader2 } from "lucide-react";
import { Bell, CheckCircle2, Globe, Mail, Save, Settings, Shield } from "@/components/icons/FilledIcons";

import { useState } from "react";

interface PlatformSettings {
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  defaultCurrency: string;
  defaultCountry: string;
  maintenanceMode: boolean;
  allowSignups: boolean;
  requireEmailVerification: boolean;
  maxStoresPerUser: number;
  platformFeePercent: number;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  sendFromEmail: string;
  sendFromName: string;
}

const defaults: PlatformSettings = {
  siteName: "AfroStore",
  siteUrl: "https://afrostore.app",
  supportEmail: "support@afrostore.app",
  defaultCurrency: "NGN",
  defaultCountry: "NG",
  maintenanceMode: false,
  allowSignups: true,
  requireEmailVerification: false,
  maxStoresPerUser: 5,
  platformFeePercent: 2.5,
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPass: "",
  sendFromEmail: "",
  sendFromName: "AfroStore",
};

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-surface-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-brand-600" : "bg-surface-300"}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </label>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(defaults);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "email" | "security">("general");

  const update = <K extends keyof PlatformSettings>(key: K, val: PlatformSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Settings API can be wired up later — for now just simulate save
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "general" as const, label: "General", icon: Globe },
    { id: "email" as const, label: "Email", icon: Mail },
    { id: "security" as const, label: "Security", icon: Shield },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Platform Settings</h1>
          <p className="text-sm text-surface-500 mt-1">Configure global platform settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-surface-500 hover:text-surface-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white">
        {/* General */}
        {activeTab === "general" && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Platform Name</label>
                <input value={settings.siteName} onChange={(e) => update("siteName", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Site URL</label>
                <input value={settings.siteUrl} onChange={(e) => update("siteUrl", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Support Email</label>
                <input value={settings.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Default Currency</label>
                <select value={settings.defaultCurrency} onChange={(e) => update("defaultCurrency", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500">
                  <option value="NGN">NGN — Nigerian Naira</option>
                  <option value="KES">KES — Kenyan Shilling</option>
                  <option value="GHS">GHS — Ghanaian Cedi</option>
                  <option value="ZAR">ZAR — South African Rand</option>
                  <option value="USD">USD — US Dollar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Default Country</label>
                <select value={settings.defaultCountry} onChange={(e) => update("defaultCountry", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500">
                  <option value="NG">Nigeria</option>
                  <option value="KE">Kenya</option>
                  <option value="GH">Ghana</option>
                  <option value="ZA">South Africa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Max Stores Per User</label>
                <input type="number" value={settings.maxStoresPerUser} onChange={(e) => update("maxStoresPerUser", parseInt(e.target.value) || 1)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Platform Fee (%)</label>
                <input type="number" step="0.1" value={settings.platformFeePercent} onChange={(e) => update("platformFeePercent", parseFloat(e.target.value) || 0)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
            </div>
            <div className="pt-4 border-t border-surface-100 space-y-4">
              <Toggle label="Maintenance Mode" value={settings.maintenanceMode} onChange={(v) => update("maintenanceMode", v)} />
            </div>
          </div>
        )}

        {/* Email */}
        {activeTab === "email" && (
          <div className="p-6 space-y-5">
            <p className="text-sm text-surface-500 mb-2">Configure SMTP for transactional emails (order confirmations, password resets, etc.)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">SMTP Host</label>
                <input value={settings.smtpHost} onChange={(e) => update("smtpHost", e.target.value)} placeholder="smtp.example.com" className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">SMTP Port</label>
                <input value={settings.smtpPort} onChange={(e) => update("smtpPort", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">SMTP Username</label>
                <input value={settings.smtpUser} onChange={(e) => update("smtpUser", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">SMTP Password</label>
                <input type="password" value={settings.smtpPass} onChange={(e) => update("smtpPass", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Send From Email</label>
                <input value={settings.sendFromEmail} onChange={(e) => update("sendFromEmail", e.target.value)} placeholder="noreply@afrostore.app" className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Send From Name</label>
                <input value={settings.sendFromName} onChange={(e) => update("sendFromName", e.target.value)} className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="p-6 space-y-5">
            <div className="space-y-4">
              <Toggle label="Allow New Signups" value={settings.allowSignups} onChange={(v) => update("allowSignups", v)} />
              <Toggle label="Require Email Verification" value={settings.requireEmailVerification} onChange={(v) => update("requireEmailVerification", v)} />
            </div>
            <div className="pt-4 border-t border-surface-100">
              <div className="rounded-xl bg-accent-50 border border-accent-200 p-4">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-accent-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-surface-900">Security Notifications</h4>
                    <p className="text-xs text-surface-500 mt-1">Admin notifications for suspicious activity, failed logins, and new signups will be sent to the support email configured in General settings.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
