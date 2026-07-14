"use client";
import { Loader2, Plus } from "lucide-react";
import { AlertTriangle, BarChart3, CheckCircle2, Clock, Eye, Image as ImageIcon, Mail, MessageSquare, MousePointerClick, Pause, Pencil, Search, Send, Smartphone, Trash2, XCircle } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

// ─── Types ──────────────────────────────────────────────────

interface EmailCampaign {
  id: string; name: string; subject: string; fromName: string | null; fromEmail: string | null;
  status: string; type: string; scheduledAt: string | null; sentAt: string | null;
  totalSent: number; totalOpened: number; totalClicked: number; totalBounced: number;
  createdAt: string; _count?: { recipients: number };
}

interface SmsCampaign {
  id: string; name: string; message: string; status: string;
  scheduledAt: string | null; sentAt: string | null;
  totalSent: number; totalDelivered: number; createdAt: string;
}

interface WhatsAppCampaign {
  id: string; name: string; message: string; mediaUrl: string | null; status: string;
  scheduledAt: string | null; sentAt: string | null;
  totalSent: number; totalDelivered: number; totalRead: number; createdAt: string;
}

type Tab = "email" | "sms" | "whatsapp";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-surface-100 text-surface-500",
  SCHEDULED: "bg-blue-50 text-blue-700",
  SENDING: "bg-amber-50 text-amber-700",
  SENT: "bg-green-50 text-green-700",
  PAUSED: "bg-orange-50 text-orange-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const statusIcons: Record<string, typeof Send> = {
  DRAFT: Pencil, SCHEDULED: Clock, SENDING: Send, SENT: CheckCircle2, PAUSED: Pause, CANCELLED: XCircle,
};

export default function MarketingPage() {
  const { currentStore } = useSite();
  const [tab, setTab] = useState<Tab>("email");

  // Email state
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailSearch, setEmailSearch] = useState("");

  // SMS state
  const [smsCampaigns, setSmsCampaigns] = useState<SmsCampaign[]>([]);
  const [smsLoading, setSmsLoading] = useState(true);

  // WhatsApp state
  const [waCampaigns, setWaCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [waLoading, setWaLoading] = useState(true);

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  // Fetchers
  const fetchEmail = useCallback(async () => {
    if (!currentStore) return;
    setEmailLoading(true);
    const params = new URLSearchParams();
    if (emailSearch) params.set("search", emailSearch);
    const res = await api.get<{ campaigns: EmailCampaign[] }>(`/api/sites/${currentStore.id}/campaigns/email?${params}`);
    if (res.success && res.data) setEmailCampaigns(res.data.campaigns || []);
    setEmailLoading(false);
  }, [currentStore, emailSearch]);

  const fetchSms = useCallback(async () => {
    if (!currentStore) return;
    setSmsLoading(true);
    const res = await api.get<{ campaigns: SmsCampaign[] }>(`/api/sites/${currentStore.id}/campaigns/sms`);
    if (res.success && res.data) setSmsCampaigns(res.data.campaigns || []);
    setSmsLoading(false);
  }, [currentStore]);

  const fetchWa = useCallback(async () => {
    if (!currentStore) return;
    setWaLoading(true);
    const res = await api.get<{ campaigns: WhatsAppCampaign[] }>(`/api/sites/${currentStore.id}/campaigns/whatsapp`);
    if (res.success && res.data) setWaCampaigns(res.data.campaigns || []);
    setWaLoading(false);
  }, [currentStore]);

  useEffect(() => {
    if (tab === "email") fetchEmail();
    else if (tab === "sms") fetchSms();
    else fetchWa();
  }, [tab, fetchEmail, fetchSms, fetchWa]);

  const resetForm = () => {
    setName(""); setSubject(""); setMessage(""); setContentHtml("");
    setFromName(""); setFromEmail(""); setMediaUrl(""); setEditingId(null);
  };

  const openCreate = () => { resetForm(); setShowEditor(true); };

  const openEditEmail = async (c: EmailCampaign) => {
    if (!currentStore) return;
    const res = await api.get<EmailCampaign>(`/api/sites/${currentStore.id}/campaigns/email/${c.id}`);
    if (res.success && res.data) {
      const d = res.data;
      setName(d.name); setSubject(d.subject); setFromName(d.fromName || ""); setFromEmail(d.fromEmail || "");
      setContentHtml((d as any).contentHtml || ""); setEditingId(d.id); setShowEditor(true);
    }
  };

  const openEditSms = (c: SmsCampaign) => {
    setName(c.name); setMessage(c.message); setEditingId(c.id); setShowEditor(true);
  };

  const openEditWa = (c: WhatsAppCampaign) => {
    setName(c.name); setMessage(c.message); setMediaUrl(c.mediaUrl || ""); setEditingId(c.id); setShowEditor(true);
  };

  const saveCampaign = async () => {
    if (!currentStore || !name.trim()) return;
    setSaving(true);

    const endpoint = `/api/sites/${currentStore.id}/campaigns/${tab}`;

    if (tab === "email") {
      const payload = { name: name.trim(), subject: subject.trim() || name.trim(), fromName: fromName.trim() || undefined, fromEmail: fromEmail.trim() || undefined, contentHtml: contentHtml || undefined };
      if (editingId) await api.patch(`${endpoint}/${editingId}`, payload);
      else await api.post(endpoint, payload);
    } else if (tab === "sms") {
      const payload = { name: name.trim(), message: message.trim() };
      if (editingId) await api.patch(`${endpoint}/${editingId}`, payload);
      else await api.post(endpoint, payload);
    } else {
      const payload = { name: name.trim(), message: message.trim(), mediaUrl: mediaUrl.trim() || null };
      if (editingId) await api.patch(`${endpoint}/${editingId}`, payload);
      else await api.post(endpoint, payload);
    }

    setShowEditor(false); resetForm(); setSaving(false);
    if (tab === "email") fetchEmail();
    else if (tab === "sms") fetchSms();
    else fetchWa();
  };

  const deleteCampaign = async (id: string) => {
    if (!currentStore || !confirm("Delete this campaign?")) return;
    setDeleteId(id);
    await api.delete(`/api/sites/${currentStore.id}/campaigns/${tab}/${id}`);
    if (tab === "email") setEmailCampaigns((p) => p.filter((c) => c.id !== id));
    else if (tab === "sms") setSmsCampaigns((p) => p.filter((c) => c.id !== id));
    else setWaCampaigns((p) => p.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  const changeStatus = async (id: string, newStatus: string) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/campaigns/${tab}/${id}`, { status: newStatus });
    if (tab === "email") fetchEmail();
    else if (tab === "sms") fetchSms();
    else fetchWa();
  };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  const tabIcons: Record<Tab, typeof Mail> = { email: Mail, sms: Smartphone, whatsapp: MessageSquare };
  const tabLabels: Record<Tab, string> = { email: "Email", sms: "SMS", whatsapp: "WhatsApp" };

  const renderStatus = (status: string) => {
    const Icon = statusIcons[status] || Pencil;
    return (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${statusStyles[status] || "bg-surface-100 text-surface-500"}`}>
        <Icon className="h-3 w-3" /> {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Marketing</h1>
          <p className="text-sm text-surface-500 mt-1">Create and manage email, SMS, and WhatsApp campaigns</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-4"><Plus className="h-4 w-4" /> New Campaign</button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-surface-200">
        {(["email", "sms", "whatsapp"] as Tab[]).map((t) => {
          const Icon = tabIcons[t];
          const count = t === "email" ? emailCampaigns.length : t === "sms" ? smsCampaigns.length : waCampaigns.length;
          return (
            <button key={t} onClick={() => { setTab(t); setShowEditor(false); resetForm(); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-brand-600 text-brand-700" : "border-transparent text-surface-500 hover:text-surface-700"}`}
            >
              <Icon className="h-4 w-4" /> {tabLabels[t]}
            </button>
          );
        })}
      </div>

      {/* Editor */}
      {showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">{editingId ? "Edit" : "New"} {tabLabels[tab]} Campaign</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Campaign Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Sale" className="input-field py-2.5 w-full" autoFocus />
            </div>
            {tab === "email" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Subject Line *</label>
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Don't miss out!" className="input-field py-2.5 w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">From Name</label>
                  <input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Your Store" className="input-field py-2.5 w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">From Email</label>
                  <input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="hello@store.com" className="input-field py-2.5 w-full" />
                </div>
              </>
            )}
          </div>
          {tab === "email" ? (
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Email Content (HTML)</label>
              <textarea value={contentHtml} onChange={(e) => setContentHtml(e.target.value)} rows={8} className="input-field py-2.5 w-full font-mono text-sm resize-y" placeholder="Write your email content..." />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Message *</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="input-field py-2.5 w-full resize-y"
                placeholder={tab === "sms" ? "Max 1600 characters..." : "Max 4096 characters..."} maxLength={tab === "sms" ? 1600 : 4096} />
              <p className="text-xs text-surface-400 mt-1">{message.length}/{tab === "sms" ? 1600 : 4096}</p>
            </div>
          )}
          {tab === "whatsapp" && (
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Media URL (optional)</label>
              <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://image-or-video-url..." className="input-field py-2.5 w-full" />
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={saveCampaign} disabled={saving || !name.trim() || (tab !== "email" && !message.trim())} className="btn-primary text-sm py-2.5 px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}
            </button>
            <button onClick={() => { setShowEditor(false); resetForm(); }} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Campaign Lists */}
      {tab === "email" && (
        emailLoading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
        : emailCampaigns.length === 0 && !showEditor ? (
          <EmptyState icon={Mail} label="email campaigns" onCreate={openCreate} />
        ) : !showEditor && (
          <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
            {emailCampaigns.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 group">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0"><Mail className="h-5 w-5 text-blue-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-surface-900 truncate">{c.name}</h3>{renderStatus(c.status)}</div>
                  <p className="text-xs text-surface-500 truncate mt-0.5">{c.subject}</p>
                  <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                    <span><Send className="h-3 w-3 inline" /> {c.totalSent} sent</span>
                    <span><Eye className="h-3 w-3 inline" /> {c.totalOpened} opened</span>
                    <span><MousePointerClick className="h-3 w-3 inline" /> {c.totalClicked} clicked</span>
                    {c.totalSent > 0 && <span><BarChart3 className="h-3 w-3 inline" /> {(c.totalOpened/c.totalSent*100).toFixed(1)}% open</span>}
                  </div>
                </div>
                <CampaignActions id={c.id} status={c.status} onEdit={() => openEditEmail(c)} onDelete={() => deleteCampaign(c.id)} onStatusChange={(s) => changeStatus(c.id, s)} deleting={deleteId === c.id} />
              </div>
            ))}
          </div>
        )
      )}

      {tab === "sms" && (
        smsLoading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
        : smsCampaigns.length === 0 && !showEditor ? (
          <EmptyState icon={Smartphone} label="SMS campaigns" onCreate={openCreate} />
        ) : !showEditor && (
          <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
            {smsCampaigns.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 group">
                <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0"><Smartphone className="h-5 w-5 text-green-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-surface-900 truncate">{c.name}</h3>{renderStatus(c.status)}</div>
                  <p className="text-xs text-surface-500 truncate mt-0.5">{c.message.slice(0, 80)}{c.message.length > 80 ? "..." : ""}</p>
                  <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                    <span><Send className="h-3 w-3 inline" /> {c.totalSent} sent</span>
                    <span><CheckCircle2 className="h-3 w-3 inline" /> {c.totalDelivered} delivered</span>
                  </div>
                </div>
                <CampaignActions id={c.id} status={c.status} onEdit={() => openEditSms(c)} onDelete={() => deleteCampaign(c.id)} onStatusChange={(s) => changeStatus(c.id, s)} deleting={deleteId === c.id} />
              </div>
            ))}
          </div>
        )
      )}

      {tab === "whatsapp" && (
        waLoading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
        : waCampaigns.length === 0 && !showEditor ? (
          <EmptyState icon={MessageSquare} label="WhatsApp campaigns" onCreate={openCreate} />
        ) : !showEditor && (
          <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
            {waCampaigns.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 group">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0"><MessageSquare className="h-5 w-5 text-emerald-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-surface-900 truncate">{c.name}</h3>{renderStatus(c.status)}</div>
                  <p className="text-xs text-surface-500 truncate mt-0.5">{c.message.slice(0, 80)}{c.message.length > 80 ? "..." : ""}</p>
                  <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                    <span><Send className="h-3 w-3 inline" /> {c.totalSent} sent</span>
                    <span><CheckCircle2 className="h-3 w-3 inline" /> {c.totalDelivered} delivered</span>
                    <span><Eye className="h-3 w-3 inline" /> {c.totalRead} read</span>
                    {c.mediaUrl && <span><ImageIcon className="h-3 w-3 inline" /> media</span>}
                  </div>
                </div>
                <CampaignActions id={c.id} status={c.status} onEdit={() => openEditWa(c)} onDelete={() => deleteCampaign(c.id)} onStatusChange={(s) => changeStatus(c.id, s)} deleting={deleteId === c.id} />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────

function EmptyState({ icon: Icon, label, onCreate }: { icon: typeof Mail; label: string; onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
      <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Icon className="h-7 w-7 text-surface-300" /></div>
      <h3 className="text-base font-bold text-surface-900 mb-1">No {label} yet</h3>
      <p className="text-sm text-surface-500 mb-5">Create your first campaign to reach your audience.</p>
      <button onClick={onCreate} className="btn-primary text-sm py-2.5 px-5"><Plus className="h-4 w-4" /> Create Campaign</button>
    </div>
  );
}

function CampaignActions({ id, status, onEdit, onDelete, onStatusChange, deleting }: {
  id: string; status: string; onEdit: () => void; onDelete: () => void;
  onStatusChange: (s: string) => void; deleting: boolean;
}) {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <select value={status} onChange={(e) => onStatusChange(e.target.value)} className="text-xs border border-surface-200 rounded-lg px-2 py-1.5 bg-white">
        <option value="DRAFT">Draft</option>
        <option value="SCHEDULED">Scheduled</option>
        <option value="PAUSED">Paused</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <button onClick={onEdit} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors"><Pencil className="h-4 w-4" /></button>
      <button onClick={onDelete} disabled={deleting} className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600 transition-colors">
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
