"use client";
import { ChevronDown, ChevronRight, Loader2, Plus } from "lucide-react";
import { AlignLeft, Calendar, CheckCircle2, Copy, ExternalLink, Eye, EyeOff, FileUp, Hash, Inbox, Link2, List, Mail, PenTool, Pencil, Phone, Search, ToggleLeft, Trash2, Type } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: FormField[];
  submitButtonText: string;
  successMessage: string | null;
  isActive: boolean;
  submissionCount: number;
  createdAt: string;
  _count?: { submissions: number };
}

interface Submission {
  id: string;
  data: Record<string, unknown>;
  ip: string | null;
  source: string | null;
  isRead: boolean;
  createdAt: string;
}

const fieldTypeIcons: Record<string, typeof Type> = {
  text: Type, email: Mail, phone: Phone, textarea: AlignLeft, number: Hash,
  select: List, radio: ToggleLeft, checkbox: ToggleLeft, date: Calendar, url: Link2, file: FileUp,
};

const fieldTypeLabels: Record<string, string> = {
  text: "Text", email: "Email", phone: "Phone", textarea: "Text Area", number: "Number",
  select: "Dropdown", radio: "Radio", checkbox: "Checkbox", date: "Date", url: "URL", file: "File",
};

function generateFieldId() {
  return `field_${Math.random().toString(36).slice(2, 8)}`;
}

export default function FormsPage() {
  const { currentStore } = useSite();
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingForm, setEditingForm] = useState<FormItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [submitBtnText, setSubmitBtnText] = useState("Submit");
  const [successMsg, setSuccessMsg] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Submissions viewer
  const [viewingFormId, setViewingFormId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [subsPage, setSubsPage] = useState(1);
  const [subsTotalPages, setSubsTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchForms = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await api.get<{ forms: FormItem[] }>(`/api/sites/${currentStore.id}/forms?${params}`);
    if (res.success && res.data) {
      setForms(res.data.forms || []);
    }
    setLoading(false);
  }, [currentStore, search]);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  const resetForm = () => {
    setFormName("");
    setFormDesc("");
    setFormFields([]);
    setSubmitBtnText("Submit");
    setSuccessMsg("");
    setIsActive(true);
    setEditingForm(null);
  };

  const openCreate = () => {
    resetForm();
    // Start with a basic contact form template
    setFormFields([
      { id: generateFieldId(), type: "text", label: "Name", required: true },
      { id: generateFieldId(), type: "email", label: "Email", required: true },
      { id: generateFieldId(), type: "textarea", label: "Message", required: true },
    ]);
    setShowEditor(true);
  };

  const openEdit = async (form: FormItem) => {
    if (!currentStore) return;
    const res = await api.get<FormItem>(`/api/sites/${currentStore.id}/forms/${form.id}`);
    if (res.success && res.data) {
      const f = res.data;
      setFormName(f.name);
      setFormDesc(f.description || "");
      setFormFields(f.fields || []);
      setSubmitBtnText(f.submitButtonText || "Submit");
      setSuccessMsg(f.successMessage || "");
      setIsActive(f.isActive);
      setEditingForm(f);
      setShowEditor(true);
    }
  };

  const addField = (type: string) => {
    setFormFields((prev) => [
      ...prev,
      {
        id: generateFieldId(),
        type,
        label: fieldTypeLabels[type] || "Field",
        required: false,
        ...(["select", "radio", "checkbox"].includes(type) ? { options: ["Option 1", "Option 2"] } : {}),
      },
    ]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== id));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= formFields.length) return;
    const updated = [...formFields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFormFields(updated);
  };

  const saveForm = async () => {
    if (!currentStore || !formName.trim() || formFields.length === 0) return;
    setSaving(true);

    const payload = {
      name: formName.trim(),
      description: formDesc.trim() || undefined,
      fields: formFields,
      submitButtonText: submitBtnText || "Submit",
      successMessage: successMsg.trim() || undefined,
      isActive,
    };

    if (editingForm) {
      const res = await api.patch(`/api/sites/${currentStore.id}/forms/${editingForm.id}`, payload);
      if (res.success) {
        await fetchForms();
        setShowEditor(false);
        resetForm();
      }
    } else {
      const res = await api.post(`/api/sites/${currentStore.id}/forms`, payload);
      if (res.success) {
        await fetchForms();
        setShowEditor(false);
        resetForm();
      }
    }
    setSaving(false);
  };

  const deleteForm = async (id: string) => {
    if (!currentStore || !confirm("Delete this form and all its submissions?")) return;
    setDeleteId(id);
    await api.delete(`/api/sites/${currentStore.id}/forms/${id}`);
    setForms((prev) => prev.filter((f) => f.id !== id));
    setDeleteId(null);
  };

  const toggleActive = async (form: FormItem) => {
    if (!currentStore) return;
    const res = await api.patch(`/api/sites/${currentStore.id}/forms/${form.id}`, { isActive: !form.isActive });
    if (res.success) {
      setForms((prev) => prev.map((f) => (f.id === form.id ? { ...f, isActive: !f.isActive } : f)));
    }
  };

  // Submissions
  const viewSubmissions = async (formId: string) => {
    if (!currentStore) return;
    if (viewingFormId === formId) { setViewingFormId(null); return; }
    setViewingFormId(formId);
    setLoadingSubs(true);
    setSubsPage(1);
    const res = await api.get<{ submissions: Submission[]; unreadCount: number; pagination: { pages: number } }>(
      `/api/sites/${currentStore.id}/forms/${formId}/submissions?page=1&limit=20`
    );
    if (res.success && res.data) {
      setSubmissions(res.data.submissions || []);
      setUnreadCount(res.data.unreadCount || 0);
      setSubsTotalPages(res.data.pagination?.pages || 1);
    }
    setLoadingSubs(false);
  };

  const markAllRead = async (formId: string) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/forms/${formId}/submissions`, { isRead: true });
    setSubmissions((prev) => prev.map((s) => ({ ...s, isRead: true })));
    setUnreadCount(0);
  };

  const copyEmbedUrl = (form: FormItem) => {
    const url = `${window.location.origin}/api/storefront/${currentStore?.slug}/forms/${form.slug}`;
    navigator.clipboard.writeText(url);
  };

  if (!currentStore) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Forms</h1>
          <p className="text-sm text-surface-500 mt-1">Create forms to collect leads, feedback, and submissions</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-4">
          <Plus className="h-4 w-4" /> New Form
        </button>
      </div>

      {/* Search */}
      {forms.length > 0 && !showEditor && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search forms..."
            className="input-field pl-10 py-2.5 w-full"
          />
        </div>
      )}

      {/* Form Editor */}
      {showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-5">
          <h3 className="text-lg font-bold text-surface-900">
            {editingForm ? "Edit Form" : "New Form"}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Form settings */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Form Name *</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Contact Form" className="input-field py-2.5 w-full" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
                <input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Optional description..." className="input-field py-2.5 w-full" />
              </div>

              {/* Fields */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Fields *</label>
                <div className="space-y-2">
                  {formFields.map((field, idx) => {
                    const Icon = fieldTypeIcons[field.type] || Type;
                    return (
                      <div key={field.id} className="flex items-start gap-2 rounded-xl border border-surface-200 p-3">
                        <div className="flex flex-col gap-1 mt-1">
                          <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className="text-surface-400 hover:text-surface-600 disabled:opacity-30"><ChevronDown className="h-3 w-3 rotate-180" /></button>
                          <button onClick={() => moveField(idx, 1)} disabled={idx === formFields.length - 1} className="text-surface-400 hover:text-surface-600 disabled:opacity-30"><ChevronDown className="h-3 w-3" /></button>
                        </div>
                        <Icon className="h-4 w-4 text-surface-400 mt-2.5 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <input value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} className="input-field py-1.5 text-sm flex-1" placeholder="Label" />
                            <select value={field.type} onChange={(e) => updateField(field.id, { type: e.target.value })} className="input-field py-1.5 text-sm w-32">
                              {Object.entries(fieldTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center gap-3">
                            <input value={field.placeholder || ""} onChange={(e) => updateField(field.id, { placeholder: e.target.value })} className="input-field py-1.5 text-xs flex-1" placeholder="Placeholder text..." />
                            <label className="flex items-center gap-1 text-xs text-surface-600 whitespace-nowrap">
                              <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} className="rounded" />
                              Required
                            </label>
                          </div>
                          {["select", "radio", "checkbox"].includes(field.type) && (
                            <input
                              value={(field.options || []).join(", ")}
                              onChange={(e) => updateField(field.id, { options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean) })}
                              className="input-field py-1.5 text-xs w-full"
                              placeholder="Options (comma-separated)"
                            />
                          )}
                        </div>
                        <button onClick={() => removeField(field.id)} className="p-1 text-surface-400 hover:text-accent-600 mt-1.5"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    );
                  })}
                </div>

                {/* Add field buttons */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {Object.entries(fieldTypeLabels).map(([type, label]) => (
                    <button key={type} onClick={() => addField(type)} className="text-xs px-2.5 py-1.5 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors">
                      + {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Submit Button Text</label>
                <input value={submitBtnText} onChange={(e) => setSubmitBtnText(e.target.value)} className="input-field py-2.5 w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Success Message</label>
                <textarea value={successMsg} onChange={(e) => setSuccessMsg(e.target.value)} rows={3} className="input-field py-2.5 w-full resize-none" placeholder="Thank you for your submission!" />
              </div>
              <label className="flex items-center gap-2 text-sm text-surface-700">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
                Form is active (accepts submissions)
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={saveForm} disabled={saving || !formName.trim() || formFields.length === 0} className="btn-primary text-sm py-2.5 px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingForm ? "Update Form" : "Create Form"}
            </button>
            <button onClick={() => { setShowEditor(false); resetForm(); }} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Form List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : forms.length === 0 && !showEditor ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <PenTool className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No forms yet</h3>
          <p className="text-sm text-surface-500 mb-5">Create forms to collect leads, feedback, and contact requests.</p>
          <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-5">
            <Plus className="h-4 w-4" /> Create First Form
          </button>
        </div>
      ) : !showEditor && (
        <div className="space-y-3">
          {forms.map((form) => (
            <div key={form.id} className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4 group">
                <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <PenTool className="h-5 w-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-surface-900">{form.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${form.isActive ? "bg-green-50 text-green-700" : "bg-surface-100 text-surface-500"}`}>
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-surface-400 mt-0.5">
                    {form.fields?.length || 0} fields · {form._count?.submissions ?? form.submissionCount} submissions · /{form.slug}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => viewSubmissions(form.id)} className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-50 transition-colors">
                    <Inbox className="h-3.5 w-3.5" />
                    {viewingFormId === form.id ? "Hide" : "Submissions"}
                    {viewingFormId === form.id ? <ChevronDown className="h-3 w-3 rotate-180" /> : <ChevronRight className="h-3 w-3" />}
                  </button>
                  <button onClick={() => copyEmbedUrl(form)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors" title="Copy API URL">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button onClick={() => openEdit(form)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => toggleActive(form)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors" title={form.isActive ? "Deactivate" : "Activate"}>
                    {form.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => deleteForm(form.id)} disabled={deleteId === form.id} className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600 transition-colors">
                    {deleteId === form.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submissions panel */}
              {viewingFormId === form.id && (
                <div className="border-t border-surface-100 bg-surface-50 p-5">
                  {loadingSubs ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                    </div>
                  ) : submissions.length === 0 ? (
                    <p className="text-sm text-surface-500 text-center py-6">No submissions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-surface-500">{unreadCount} unread</span>
                        {unreadCount > 0 && (
                          <button onClick={() => markAllRead(form.id)} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Mark all read
                          </button>
                        )}
                      </div>
                      {submissions.map((sub) => (
                        <div key={sub.id} className={`rounded-xl border p-4 text-sm ${sub.isRead ? "border-surface-200 bg-white" : "border-brand-200 bg-brand-50"}`}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(sub.data).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-xs font-medium text-surface-500">{key}:</span>
                                <span className="ml-1 text-surface-900">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                            <span>{new Date(sub.createdAt).toLocaleString()}</span>
                            {sub.source && <span>from: {sub.source}</span>}
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
      )}
    </div>
  );
}
