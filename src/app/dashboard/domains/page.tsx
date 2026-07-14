"use client";
import { Loader2, Plus, X, Check } from "lucide-react";
import { AlertCircle, CheckCircle2, Copy, ExternalLink, Globe, Shield, Trash2, RefreshCw } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface DomainRecord {
  id: string;
  domain: string;
  type: string;
  status: "PENDING" | "ACTIVE" | "FAILED" | "EXPIRED";
  sslStatus: "PENDING" | "ACTIVE" | "EXPIRED" | "FAILED";
  dnsVerified: boolean;
  isPrimary: boolean;
  verificationToken?: string;
  createdAt: string;
}

interface DnsInstructions {
  aRecord?: { type: string; name: string; value: string; ttl: number } | null;
  cnameRecord?: { type: string; name: string; value: string; ttl: number };
  wwwRecord?: { type: string; name: string; value: string; ttl: number };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50" },
  ACTIVE: { label: "Active", color: "text-green-700", bg: "bg-green-50" },
  FAILED: { label: "Failed", color: "text-red-700", bg: "bg-red-50" },
  EXPIRED: { label: "Expired", color: "text-gray-700", bg: "bg-gray-50" },
};

export default function DomainsPage() {
  const { currentStore } = useSite();
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [subdomain, setSubdomain] = useState("");
  const [dnsInstructions, setDnsInstructions] = useState<DnsInstructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState("");

  const fetchDomains = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ domains: DomainRecord[]; subdomain: string; dnsInstructions: DnsInstructions }>(
      `/api/sites/${currentStore.id}/domains`
    );
    if (res.success && res.data) {
      setDomains(res.data.domains || []);
      setSubdomain(res.data.subdomain || "");
      setDnsInstructions(res.data.dnsInstructions || null);
    }
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchDomains(); }, [fetchDomains]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const connectDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore || !newDomain.trim()) return;
    setConnecting(true);
    setError("");
    setSuccessMsg("");

    const res = await api.post<any>(`/api/sites/${currentStore.id}/domains`, { domain: newDomain.trim() });
    if (res.success) {
      setSuccessMsg("Domain connected! Now configure your DNS records below.");
      setNewDomain("");
      setShowForm(false);
      await fetchDomains();
    } else {
      setError(res.error || "Failed to connect domain");
    }
    setConnecting(false);
  };

  const verifyDomain = async (domainId: string) => {
    if (!currentStore) return;
    setVerifyingId(domainId);
    setError("");
    setSuccessMsg("");

    const res = await api.post<any>(`/api/sites/${currentStore.id}/domains/verify`, { domainId });
    if (res.success && res.data) {
      if (res.data.dnsVerified) {
        setSuccessMsg(res.data.message || "DNS verified successfully!");
      } else {
        setError(res.data.message || "DNS not yet configured.");
      }
      await fetchDomains();
    } else {
      setError(res.error || "Verification failed");
    }
    setVerifyingId(null);
  };

  const deleteDomain = async (domainId: string) => {
    if (!currentStore || !confirm("Disconnect this domain?")) return;
    setDeletingId(domainId);
    await api.delete(`/api/sites/${currentStore.id}/domains?domainId=${domainId}`);
    await fetchDomains();
    setDeletingId(null);
  };

  if (!currentStore) {
    return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Domains</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store URLs and custom domains</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 text-sm font-semibold transition-colors shadow-md shadow-slate-300/40">
          <Plus className="h-4 w-4" /> Add Domain
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {successMsg}
          <button onClick={() => setSuccessMsg("")} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Free Subdomain */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Free Subdomain</h3>
            <p className="text-xs text-gray-500">Always active — included with your store</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">Active</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
          <Globe className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 flex-1">{subdomain || "loading..."}</span>
          <button
            onClick={() => copyToClipboard(`https://${subdomain}`, "subdomain")}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {copied === "subdomain" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
          </button>
          <a href={`https://${subdomain}`} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
            <ExternalLink className="h-4 w-4 text-gray-500" />
          </a>
        </div>
      </div>

      {/* Connect Domain Form */}
      {showForm && (
        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-1">Connect Custom Domain</h3>
          <p className="text-xs text-gray-500 mb-4">Enter the domain you want to connect to your store</p>
          <form onSubmit={connectDomain} className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full rounded-xl border-0 bg-gray-100 pl-12 pr-4 py-4 text-base text-gray-700 placeholder:text-gray-400 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                placeholder="mystore.com"
                autoFocus
              />
            </div>
            <button type="submit" disabled={connecting || !newDomain.trim()} className="rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-semibold px-6 py-4 text-sm transition-colors disabled:opacity-60">
              {connecting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Connect"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setNewDomain(""); }} className="rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-4 text-sm transition-colors">
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Connected Domains */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
      ) : domains.length > 0 ? (
        <div className="space-y-4">
          {domains.map((d) => {
            const status = statusConfig[d.status] || statusConfig.PENDING;
            const sslStatus = statusConfig[d.sslStatus] || statusConfig.PENDING;
            return (
              <div key={d.id} className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${d.status === "ACTIVE" ? "bg-green-50" : "bg-amber-50"}`}>
                    <Globe className={`h-5 w-5 ${d.status === "ACTIVE" ? "text-green-600" : "text-amber-600"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900 truncate">{d.domain}</h3>
                      {d.isPrimary && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Primary</span>}
                    </div>
                    <p className="text-xs text-gray-500">Connected {new Date(d.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>{status.label}</span>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${sslStatus.bg} ${sslStatus.color} flex items-center gap-1`}>
                      <Shield className="h-3 w-3" /> SSL {sslStatus.label}
                    </span>
                  </div>
                </div>

                {/* DNS Status & Actions */}
                {d.status !== "ACTIVE" && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4">
                    <p className="text-sm font-semibold text-amber-800 mb-2">⚡ DNS Configuration Required</p>
                    <p className="text-xs text-amber-700 mb-3">Add one of the following DNS records at your domain registrar:</p>

                    <div className="space-y-2">
                      {dnsInstructions?.aRecord && (
                        <div className="flex items-center gap-2 bg-white rounded-lg p-3 text-xs">
                          <span className="font-semibold text-gray-700 w-14">A Record</span>
                          <span className="text-gray-500">Name: <strong className="text-gray-900">@</strong></span>
                          <span className="text-gray-500 flex-1">Value: <strong className="text-gray-900">{dnsInstructions.aRecord.value}</strong></span>
                          <button onClick={() => copyToClipboard(dnsInstructions.aRecord!.value, `a-${d.id}`)} className="p-1 rounded hover:bg-gray-100">
                            {copied === `a-${d.id}` ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-400" />}
                          </button>
                        </div>
                      )}
                      {dnsInstructions?.cnameRecord && (
                        <div className="flex items-center gap-2 bg-white rounded-lg p-3 text-xs">
                          <span className="font-semibold text-gray-700 w-14">CNAME</span>
                          <span className="text-gray-500">Name: <strong className="text-gray-900">@</strong></span>
                          <span className="text-gray-500 flex-1">Value: <strong className="text-gray-900">{dnsInstructions.cnameRecord.value}</strong></span>
                          <button onClick={() => copyToClipboard(dnsInstructions.cnameRecord!.value, `cname-${d.id}`)} className="p-1 rounded hover:bg-gray-100">
                            {copied === `cname-${d.id}` ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-400" />}
                          </button>
                        </div>
                      )}
                      {dnsInstructions?.wwwRecord && (
                        <div className="flex items-center gap-2 bg-white rounded-lg p-3 text-xs">
                          <span className="font-semibold text-gray-700 w-14">CNAME</span>
                          <span className="text-gray-500">Name: <strong className="text-gray-900">www</strong></span>
                          <span className="text-gray-500 flex-1">Value: <strong className="text-gray-900">{dnsInstructions.wwwRecord.value}</strong></span>
                          <button onClick={() => copyToClipboard(dnsInstructions.wwwRecord!.value, `www-${d.id}`)} className="p-1 rounded hover:bg-gray-100">
                            {copied === `www-${d.id}` ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-400" />}
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-amber-600 mt-2">DNS changes can take up to 48 hours to propagate.</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => verifyDomain(d.id)}
                    disabled={verifyingId === d.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {verifyingId === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {d.status === "ACTIVE" ? "Re-verify" : "Check DNS"}
                  </button>
                  {d.status === "ACTIVE" && (
                    <a
                      href={`https://${d.domain}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 text-sm font-semibold transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" /> Visit
                    </a>
                  )}
                  <button
                    onClick={() => deleteDomain(d.id)}
                    disabled={deletingId === d.id}
                    className="inline-flex items-center gap-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 px-3 py-2.5 text-sm transition-colors ml-auto"
                  >
                    {deletingId === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : !showForm ? (
        <div className="rounded-2xl bg-white border border-gray-200 text-center py-16 px-6 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Globe className="h-7 w-7 text-gray-300" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No custom domains</h3>
          <p className="text-sm text-gray-500 mb-5">Connect your own domain to make your store more professional.</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-600 hover:bg-slate-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors shadow-md shadow-slate-300/40">
            <Plus className="h-4 w-4" /> Connect Domain
          </button>
        </div>
      ) : null}
    </div>
  );
}
