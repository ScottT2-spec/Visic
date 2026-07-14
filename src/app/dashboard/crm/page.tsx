"use client";
import { ChevronDown, ChevronRight, Loader2, Plus } from "lucide-react";
import { Activity, ArrowUpDown, Building2, Filter, Mail, Pencil, Phone, Search, Tag, Trash2, Users } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface CrmContact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  status: string;
  score: number;
  tags: string[];
  lastActivityAt: string | null;
  createdAt: string;
  _count?: { activities: number };
}

interface CrmActivity {
  id: string;
  type: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700",
  CONTACTED: "bg-purple-50 text-purple-700",
  QUALIFIED: "bg-green-50 text-green-700",
  PROPOSAL: "bg-amber-50 text-amber-700",
  NEGOTIATION: "bg-orange-50 text-orange-700",
  WON: "bg-emerald-50 text-emerald-700",
  LOST: "bg-red-50 text-red-700",
  UNSUBSCRIBED: "bg-surface-100 text-surface-500",
};

const statusLabels = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "UNSUBSCRIBED"];
const sourceOptions = ["organic", "referral", "ad", "form", "social", "email", "manual", "other"];

export default function CrmPage() {
  const { currentStore } = useSite();
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});

  // Editor
  const [showEditor, setShowEditor] = useState(false);
  const [editingContact, setEditingContact] = useState<CrmContact | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("NEW");
  const [score, setScore] = useState(0);
  const [tagsInput, setTagsInput] = useState("");

  // Activity viewer
  const [viewingContactId, setViewingContactId] = useState<string | null>(null);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const fetchContacts = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", "20");

    const res = await api.get<{ contacts: CrmContact[]; stats: Record<string, number>; pagination: { pages: number; total: number } }>(
      `/api/sites/${currentStore.id}/crm/contacts?${params}`
    );
    if (res.success && res.data) {
      setContacts(res.data.contacts || []);
      setStats(res.data.stats || {});
      setTotalPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
    }
    setLoading(false);
  }, [currentStore, search, statusFilter, page]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const resetForm = () => {
    setEmail(""); setFirstName(""); setLastName(""); setPhone("");
    setCompany(""); setSource(""); setStatus("NEW"); setScore(0);
    setTagsInput(""); setEditingContact(null);
  };

  const openCreate = () => { resetForm(); setShowEditor(true); };

  const openEdit = async (contact: CrmContact) => {
    setEmail(contact.email);
    setFirstName(contact.firstName || "");
    setLastName(contact.lastName || "");
    setPhone(contact.phone || "");
    setCompany(contact.company || "");
    setSource(contact.source || "");
    setStatus(contact.status);
    setScore(contact.score);
    setTagsInput(contact.tags.join(", "));
    setEditingContact(contact);
    setShowEditor(true);
  };

  const saveContact = async () => {
    if (!currentStore || !email.trim()) return;
    setSaving(true);

    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      email: email.trim(),
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      phone: phone.trim() || undefined,
      company: company.trim() || undefined,
      source: source || undefined,
      status,
      score,
      tags,
    };

    if (editingContact) {
      const res = await api.patch(`/api/sites/${currentStore.id}/crm/contacts/${editingContact.id}`, payload);
      if (res.success) { await fetchContacts(); setShowEditor(false); resetForm(); }
    } else {
      const res = await api.post(`/api/sites/${currentStore.id}/crm/contacts`, payload);
      if (res.success) { await fetchContacts(); setShowEditor(false); resetForm(); }
    }
    setSaving(false);
  };

  const deleteContact = async (id: string) => {
    if (!currentStore || !confirm("Delete this contact and all their activity?")) return;
    setDeleteId(id);
    await api.delete(`/api/sites/${currentStore.id}/crm/contacts/${id}`);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  const quickStatusChange = async (contact: CrmContact, newStatus: string) => {
    if (!currentStore) return;
    const res = await api.patch(`/api/sites/${currentStore.id}/crm/contacts/${contact.id}`, { status: newStatus });
    if (res.success) {
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? { ...c, status: newStatus } : c)));
    }
  };

  const viewActivity = async (contactId: string) => {
    if (!currentStore) return;
    if (viewingContactId === contactId) { setViewingContactId(null); return; }
    setViewingContactId(contactId);
    setLoadingActivities(true);
    const res = await api.get<{ activities: CrmActivity[] }>(`/api/sites/${currentStore.id}/crm/contacts/${contactId}`);
    if (res.success && res.data) {
      setActivities((res.data as any).activities || []);
    }
    setLoadingActivities(false);
  };

  if (!currentStore) {
    return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  }

  const totalContacts = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">CRM Contacts</h1>
          <p className="text-sm text-surface-500 mt-1">{totalContacts} total contacts across all stages</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-4">
          <Plus className="h-4 w-4" /> Add Contact
        </button>
      </div>

      {/* Pipeline stats */}
      {totalContacts > 0 && (
        <div className="flex flex-wrap gap-2">
          {statusLabels.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(statusFilter === s ? "" : s); setPage(1); }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                statusFilter === s
                  ? "ring-2 ring-brand-500 " + (statusColors[s] || "bg-surface-100 text-surface-600")
                  : statusColors[s] || "bg-surface-100 text-surface-600"
              }`}
            >
              {s} ({stats[s] || 0})
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      {(totalContacts > 0 || search) && !showEditor && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, email, company..." className="input-field pl-10 py-2.5 w-full" />
        </div>
      )}

      {/* Editor */}
      {showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">{editingContact ? "Edit Contact" : "Add Contact"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Email *</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="input-field py-2.5 w-full" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">First Name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field py-2.5 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Last Name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field py-2.5 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field py-2.5 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Company</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="input-field py-2.5 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className="input-field py-2.5 w-full">
                <option value="">Select source...</option>
                {sourceOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field py-2.5 w-full">
                {statusLabels.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Lead Score</label>
              <input type="number" value={score} onChange={(e) => setScore(parseInt(e.target.value) || 0)} min={0} max={1000} className="input-field py-2.5 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Tags (comma-separated)</label>
              <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="hot-lead, vip, event" className="input-field py-2.5 w-full" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={saveContact} disabled={saving || !email.trim()} className="btn-primary text-sm py-2.5 px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingContact ? "Update Contact" : "Add Contact"}
            </button>
            <button onClick={() => { setShowEditor(false); resetForm(); }} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Contact List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      ) : contacts.length === 0 && !showEditor ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <Users className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No contacts yet</h3>
          <p className="text-sm text-surface-500 mb-5">Add leads and contacts to track your sales pipeline.</p>
          <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-5"><Plus className="h-4 w-4" /> Add First Contact</button>
        </div>
      ) : !showEditor && (
        <>
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div key={contact.id} className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4 group">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-brand-700 font-bold text-sm">
                    {(contact.firstName?.[0] || contact.email[0]).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-surface-900">
                        {contact.firstName || contact.lastName
                          ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                          : contact.email}
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[contact.status] || "bg-surface-100 text-surface-500"}`}>
                        {contact.status}
                      </span>
                      {contact.score > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          ⭐ {contact.score}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {contact.email}</span>
                      {contact.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {contact.phone}</span>}
                      {contact.company && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {contact.company}</span>}
                      {contact.source && <span>via {contact.source}</span>}
                    </div>
                    {contact.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {contact.tags.map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 text-surface-500">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <select
                      value={contact.status}
                      onChange={(e) => quickStatusChange(contact, e.target.value)}
                      className="text-xs border border-surface-200 rounded-lg px-2 py-1.5 bg-white"
                    >
                      {statusLabels.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => viewActivity(contact.id)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors" title="Activity">
                      <Activity className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEdit(contact)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteContact(contact.id)} disabled={deleteId === contact.id} className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600 transition-colors">
                      {deleteId === contact.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Activity timeline */}
                {viewingContactId === contact.id && (
                  <div className="border-t border-surface-100 bg-surface-50 px-5 py-4">
                    {loadingActivities ? (
                      <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-brand-600" /></div>
                    ) : activities.length === 0 ? (
                      <p className="text-sm text-surface-500 text-center py-3">No activity recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Activity Timeline</h4>
                        {activities.map((act) => (
                          <div key={act.id} className="flex items-start gap-3 text-sm">
                            <div className="h-2 w-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="font-medium text-surface-700">{act.type.replace(/_/g, " ")}</span>
                              {act.details && (
                                <span className="text-surface-500 ml-1">
                                  {Object.entries(act.details).map(([k, v]) => `${k}: ${v}`).join(", ")}
                                </span>
                              )}
                              <span className="text-xs text-surface-400 ml-2">{new Date(act.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 px-3 disabled:opacity-50">Previous</button>
              <span className="text-sm text-surface-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm py-2 px-3 disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
