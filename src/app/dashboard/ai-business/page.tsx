"use client";
import { ArrowRight, Loader2 } from "lucide-react";
import { CheckCircle2, FileText, Mail, MessageSquare, Palette, Rocket, Search as SearchIcon, Sparkles, Store } from "@/components/icons/FilledIcons";

import { useState } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface GenerationResult {
  pages?: Array<{ id: string; title: string; slug: string }>;
  brand?: Record<string, string>;
  tagline?: string;
  seo?: { title: string; description: string };
  emailTemplates?: Array<{ name: string; subject: string; bodyPreview: string }>;
  productDescriptions?: Array<{ name: string; shortDescription: string }>;
  launchChecklist?: string[];
  whatsappTemplate?: string;
  socialBio?: string;
}

const INDUSTRIES = [
  "Fashion", "Electronics", "Food & Restaurant", "Beauty & Cosmetics", "Real Estate",
  "Education", "Healthcare", "Agency", "Church & NGO", "Construction",
  "Automotive", "Jewelry", "Pharmacy", "Furniture", "Other",
];

export default function AIBusinessPage() {
  const { currentStore } = useSite();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState("");

  // Form
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [products, setProducts] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const generate = async () => {
    if (!currentStore || !businessName.trim() || !businessType) return;
    setGenerating(true); setError(""); setResult(null);

    const res = await api.post<GenerationResult>(`/api/sites/${currentStore.id}/ai/generate-business`, {
      businessName: businessName.trim(), businessType, products: products.trim(),
      targetAudience: targetAudience.trim(), location: location.trim(), description: description.trim(),
    });

    if (res.success && res.data) { setResult(res.data); setStep(3); }
    else setError((res as any).error || "Generation failed. Check your AI API keys.");
    setGenerating(false);
  };

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-4"><Sparkles className="h-8 w-8 text-white" /></div>
        <h1 className="text-3xl font-bold text-surface-900 font-display">AI Business Mode</h1>
        <p className="text-surface-500 mt-2">Go from idea to online business in under 5 minutes</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-brand-600 text-white" : "bg-surface-200 text-surface-400"}`}>
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-brand-600" : "bg-surface-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Business Info */}
      {step === 1 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-8 space-y-5">
          <h2 className="text-xl font-bold text-surface-900">Tell us about your business</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-surface-700 mb-1">Business Name *</label>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="input-field py-3 w-full text-lg" placeholder="e.g. Kwame Fashion Hub" autoFocus /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-surface-700 mb-1">Industry *</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {INDUSTRIES.map((ind) => (
                  <button key={ind} onClick={() => setBusinessType(ind)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-colors text-center ${businessType === ind ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-200 text-surface-500 hover:bg-surface-50"}`}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="input-field py-2.5 w-full" placeholder="e.g. Lagos, Nigeria" /></div>
            <div><label className="block text-sm font-medium text-surface-700 mb-1">Target Audience</label>
              <input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="input-field py-2.5 w-full" placeholder="e.g. Young professionals, 25-40" /></div>
          </div>
          <button onClick={() => setStep(2)} disabled={!businessName.trim() || !businessType}
            className="btn-primary py-3 px-6 w-full sm:w-auto">Next <ArrowRight className="h-4 w-4" /></button>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-8 space-y-5">
          <h2 className="text-xl font-bold text-surface-900">More details (optional but helpful)</h2>
          <div><label className="block text-sm font-medium text-surface-700 mb-1">Products / Services</label>
            <textarea value={products} onChange={(e) => setProducts(e.target.value)} className="input-field py-2.5 w-full resize-y" rows={3} placeholder="e.g. African print dresses, accessories, custom tailoring..." /></div>
          <div><label className="block text-sm font-medium text-surface-700 mb-1">Business Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field py-2.5 w-full resize-y" rows={3} placeholder="Tell us what makes your business unique..." /></div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>}

          <div className="flex items-center gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary py-3 px-6">Back</button>
            <button onClick={generate} disabled={generating} className="btn-primary py-3 px-6 flex-1 sm:flex-none">
              {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating your business...</> : <><Sparkles className="h-4 w-4" /> Generate My Business</>}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && result && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-surface-900">Your business is ready! 🎉</h2>
            <p className="text-surface-600 mt-1">AI has generated everything you need to launch.</p>
          </div>

          {/* Pages */}
          {result.pages && result.pages.length > 0 && (
            <ResultCard icon={FileText} title="Pages Generated" color="bg-blue-50 text-blue-600">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {result.pages.map((p) => (
                  <div key={p.id} className="rounded-lg bg-surface-50 px-3 py-2 text-sm"><span className="font-semibold text-surface-900">{p.title}</span><br /><span className="text-xs text-surface-400">/{p.slug}</span></div>
                ))}
              </div>
            </ResultCard>
          )}

          {/* Brand Colors */}
          {result.brand && (
            <ResultCard icon={Palette} title="Brand Colors" color="bg-purple-50 text-purple-600">
              <div className="flex gap-3 flex-wrap">
                {Object.entries(result.brand).map(([name, hex]) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg border border-surface-200" style={{ backgroundColor: hex }} />
                    <div><p className="text-xs font-semibold text-surface-700 capitalize">{name}</p><p className="text-[10px] text-surface-400 font-mono">{hex}</p></div>
                  </div>
                ))}
              </div>
            </ResultCard>
          )}

          {/* Tagline & SEO */}
          {(result.tagline || result.seo) && (
            <ResultCard icon={SearchIcon} title="SEO & Branding" color="bg-amber-50 text-amber-600">
              {result.tagline && <p className="text-lg font-semibold text-surface-900 italic">&ldquo;{result.tagline}&rdquo;</p>}
              {result.seo && <div className="mt-2 text-sm text-surface-600"><p><strong>Title:</strong> {result.seo.title}</p><p><strong>Description:</strong> {result.seo.description}</p></div>}
            </ResultCard>
          )}

          {/* Email Templates */}
          {result.emailTemplates && result.emailTemplates.length > 0 && (
            <ResultCard icon={Mail} title="Email Templates" color="bg-green-50 text-green-600">
              {result.emailTemplates.map((t, i) => (
                <div key={i} className="rounded-lg bg-surface-50 px-4 py-3 mb-2">
                  <p className="text-sm font-semibold text-surface-900">{t.name}</p>
                  <p className="text-xs text-surface-500">Subject: {t.subject}</p>
                  <p className="text-xs text-surface-400 mt-1">{t.bodyPreview}</p>
                </div>
              ))}
            </ResultCard>
          )}

          {/* WhatsApp */}
          {result.whatsappTemplate && (
            <ResultCard icon={MessageSquare} title="WhatsApp Template" color="bg-emerald-50 text-emerald-600">
              <p className="text-sm text-surface-700 bg-surface-50 rounded-lg p-3">{result.whatsappTemplate}</p>
            </ResultCard>
          )}

          {/* Launch Checklist */}
          {result.launchChecklist && result.launchChecklist.length > 0 && (
            <ResultCard icon={Rocket} title="Launch Checklist" color="bg-red-50 text-red-600">
              <ol className="space-y-1.5">
                {result.launchChecklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-700">
                    <span className="h-5 w-5 rounded-full bg-surface-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-surface-500">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </ResultCard>
          )}

          <button onClick={() => { setStep(1); setResult(null); }} className="btn-secondary py-2.5 px-4 text-sm">Start Over</button>
        </div>
      )}
    </div>
  );
}

function ResultCard({ icon: Icon, title, color, children }: { icon: typeof Sparkles; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-3"><div className={`h-7 w-7 rounded-lg flex items-center justify-center ${color}`}><Icon className="h-4 w-4" /></div><h3 className="text-sm font-bold text-surface-900">{title}</h3></div>
      {children}
    </div>
  );
}
