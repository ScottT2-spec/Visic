"use client";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { ExternalLink, LayoutTemplate, Pencil, Save, Sparkles } from "@/components/icons/FilledIcons";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { SingleImageUpload } from "@/components/dashboard/ImageUpload";

interface SiteRecord {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  siteType: "ECOMMERCE" | "WEBSITE" | "LANDING_PAGE";
  businessType?: string | null;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  customDomain?: string | null;
  currency?: string | null;
  settings?: {
    whatsappNumber?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
  } | null;
  socialLinks?: {
    whatsapp?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    twitter?: string | null;
    tiktok?: string | null;
  } | null;
}

interface PageRecord {
  id: string;
  title: string;
  slug: string;
  type: string;
  isPublished: boolean;
  position?: number;
}

function imageValue(url?: string | null) {
  return url ? [{ url, alt: "" }] : [];
}

export default function SiteCustomizePage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState<SiteRecord | null>(null);
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    businessType: "general",
    currency: "NGN",
    customDomain: "",
    logo: "",
    coverImage: "",
    metaTitle: "",
    metaDescription: "",
    whatsappNumber: "",
  });

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [siteRes, pagesRes] = await Promise.all([
          api.get<{ id: string; name: string; slug: string; subdomain: string; siteType: "ECOMMERCE" | "WEBSITE" | "LANDING_PAGE"; businessType?: string | null; description?: string | null; logo?: string | null; coverImage?: string | null; customDomain?: string | null; currency?: string | null; settings?: SiteRecord["settings"]; socialLinks?: SiteRecord["socialLinks"] }>(`/api/sites/${siteId}`),
          api.get<{ pages: PageRecord[] }>(`/api/sites/${siteId}/pages?limit=100`),
        ]);

        if (!active) return;

        if (siteRes.success && siteRes.data) {
          const record = siteRes.data as SiteRecord;
          setSite(record);
          setForm({
            name: record.name || "",
            description: record.description || "",
            businessType: record.businessType || "general",
            currency: record.currency || "NGN",
            customDomain: record.customDomain || "",
            logo: record.logo || "",
            coverImage: record.coverImage || "",
            metaTitle: record.settings?.metaTitle || record.name || "",
            metaDescription: record.settings?.metaDescription || record.description || "",
            whatsappNumber: record.settings?.whatsappNumber || record.socialLinks?.whatsapp || "",
          });
        } else {
          setError(siteRes.error || "Unable to load this site");
        }

        if (pagesRes.success && pagesRes.data) {
          setPages(pagesRes.data.pages || []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load this site");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [siteId]);

  const homePage = useMemo(() => pages.find((page) => page.type === "HOME" || page.slug === "home") || pages[0] || null, [pages]);

  const saveChanges = async () => {
    setSaving(true);
    setError("");
    try {
      const siteRes = await api.patch(`/api/sites/${siteId}`, {
        name: form.name,
        description: form.description,
        businessType: form.businessType,
        currency: form.currency,
        customDomain: form.customDomain || null,
        logo: form.logo || null,
        coverImage: form.coverImage || null,
      });

      const settingsRes = await api.patch(`/api/sites/${siteId}/settings`, {
        whatsappNumber: form.whatsappNumber || null,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
      });

      if (!siteRes.success) throw new Error(siteRes.error || "Failed to update site");
      if (!settingsRes.success) throw new Error(settingsRes.error || "Failed to update site settings");

      if (siteRes.data) setSite(siteRes.data as SiteRecord);
      setError("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error || "Site not found."}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/new-site" className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-800">
            <ArrowLeft className="h-4 w-4" /> Back to onboarding
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Customize {site.name}</h1>
          <p className="mt-1 text-sm text-surface-500">Update branding, content, pages, and launch details without losing your template setup.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/store/${site.slug}`} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50">
            Live site <ExternalLink className="h-4 w-4" />
          </Link>
          <Link href={`/dashboard/sites/${siteId}/editor`} className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100">
            <LayoutTemplate className="h-4 w-4" /> Open visual editor
          </Link>
          <button onClick={saveChanges} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-bold text-surface-900">Branding & store details</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-surface-700">Store name</label>
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="input-field w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-surface-700">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={4} className="input-field w-full" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Business type</label>
              <input value={form.businessType} onChange={(e) => setForm((prev) => ({ ...prev, businessType: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Currency</label>
              <input value={form.currency} onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">Custom domain</label>
              <input value={form.customDomain} onChange={(e) => setForm((prev) => ({ ...prev, customDomain: e.target.value }))} className="input-field w-full" placeholder="yourdomain.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700">WhatsApp number</label>
              <input value={form.whatsappNumber} onChange={(e) => setForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))} className="input-field w-full" placeholder="+234..." />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-surface-700">Meta title</label>
              <input value={form.metaTitle} onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))} className="input-field w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-surface-700">Meta description</label>
              <textarea value={form.metaDescription} onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))} rows={3} className="input-field w-full" />
            </div>
            <div className="sm:col-span-2 grid gap-4 lg:grid-cols-2">
              <SingleImageUpload
                image={form.logo || null}
                onChange={(image) => setForm((prev) => ({ ...prev, logo: image || "" }))}
                label="Logo"
                compact
              />
              <SingleImageUpload
                image={form.coverImage || null}
                onChange={(image) => setForm((prev) => ({ ...prev, coverImage: image || "" }))}
                label="Cover image"
                compact
              />
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-bold text-surface-900">Quick customizations</h2>
            </div>
            <p className="text-sm text-surface-500">Use the page builder to customize wording, add sections, and swap images inside each page.</p>
            <div className="mt-4 space-y-2">
              {homePage && (
                <Link href={`/builder/${homePage.id}`} className="flex items-center justify-between rounded-xl border border-surface-200 px-4 py-3 text-sm font-medium text-surface-700 hover:bg-surface-50">
                  <span className="inline-flex items-center gap-2"><Pencil className="h-4 w-4 text-brand-600" /> Customize homepage</span>
                  <span className="text-xs text-surface-400">{homePage.slug}</span>
                </Link>
              )}
              <Link href="/dashboard/pages" className="flex items-center justify-between rounded-xl border border-surface-200 px-4 py-3 text-sm font-medium text-surface-700 hover:bg-surface-50">
                <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4 text-brand-600" /> Add new page</span>
                <span className="text-xs text-surface-400">Pages</span>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900">Launch summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4"><dt className="text-surface-500">Preview slug</dt><dd className="font-medium text-surface-900">{site.slug}</dd></div>
              <div className="flex items-center justify-between gap-4"><dt className="text-surface-500">Template flow</dt><dd className="font-medium text-surface-900">Internal only</dd></div>
              <div className="flex items-center justify-between gap-4"><dt className="text-surface-500">Current pages</dt><dd className="font-medium text-surface-900">{pages.length}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      <section className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-surface-900">Pages you can customize</h2>
            <p className="text-sm text-surface-500">Open any page to customize text, sections, images, and layout blocks.</p>
          </div>
          <Link href="/dashboard/pages" className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50">
            Open page manager <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => (
            <div key={page.id} className="rounded-xl border border-surface-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-surface-900">{page.title}</h3>
                  <p className="text-xs text-surface-500">/{page.slug}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${page.isPublished ? "bg-green-50 text-green-700" : "bg-surface-100 text-surface-500"}`}>
                  {page.isPublished ? "Published" : "Draft"}
                </span>
              </div>
              <p className="mt-3 text-xs text-surface-500">Click customize to change wording, swap images, or add sections in the visual builder.</p>
              <div className="mt-4 flex items-center gap-2">
                <Link href={`/builder/${page.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">
                  Customize page <Pencil className="h-3.5 w-3.5" />
                </Link>
                <Link href={`/store/${site.slug}/${page.slug}`} target="_blank" className="inline-flex items-center justify-center rounded-lg border border-surface-200 px-3 py-2 text-xs font-semibold text-surface-600 hover:bg-surface-50">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
