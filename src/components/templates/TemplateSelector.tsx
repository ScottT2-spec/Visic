'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Check, Eye, Loader2, Search, Sparkles, X } from 'lucide-react';

const IFRAME_W = 1440;
const IFRAME_H = 1080;

function TemplateThumb({ src, title }: { src: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    setScale(w / IFRAME_W);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-gray-50 overflow-hidden"
      style={{ height: IFRAME_H * scale }}
    >
      <iframe
        src={src}
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: IFRAME_W,
          height: IFRAME_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        title={title}
        loading="lazy"
        sandbox="allow-same-origin"
      />
    </div>
  );
}

interface TemplateItem {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  previewImage: string;
  previewUrl: string;
  industries: string[];
}

interface CategoryItem {
  id: string;
  label: string;
}

interface TemplateSelectorProps {
  industry?: string | null;
  selectedSlug?: string | null;
  onSelect: (template: TemplateItem) => void;
}

export default function TemplateSelector({ industry, selectedSlug, onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Always fetch all templates; industry just sorts relevant ones first
        const url = `/api/templates${industry ? `?industry=${industry}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        setTemplates(data.templates || []);
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [industry]);

  const filtered = useMemo(() => {
    let list = templates;
    if (activeCategory) {
      list = list.filter(t => t.category === activeCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q)
      );
    }
    return list;
  }, [templates, activeCategory, search]);

  // Get categories that have templates
  const availableCategories = useMemo(() => {
    const catIds = new Set(templates.map(t => t.category));
    return categories.filter(c => catIds.has(c.id));
  }, [templates, categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading templates...</span>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No templates available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
            !activeCategory ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({templates.length})
        </button>
        {availableCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              activeCategory === cat.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(template => {
          const isSelected = selectedSlug === template.slug;
          return (
            <div
              key={template.slug}
              className={`relative rounded-xl border-2 overflow-hidden transition ${
                isSelected
                  ? 'border-gray-900 ring-2 ring-gray-900/20'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              {/* Preview iframe thumbnail — CSS container query scales iframe to fill card */}
              <TemplateThumb src={template.previewUrl} title={template.name} />

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-gray-900">{template.name}</h3>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                  {template.categoryLabel}
                </span>

                {/* Action buttons — always visible */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setPreviewSlug(template.slug)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => onSelect(template)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isSelected ? <><Check className="w-3.5 h-3.5" /> Selected</> : <><Sparkles className="w-3.5 h-3.5" /> Use Template</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No templates match your search. Try a different keyword or category.
        </div>
      )}

      {/* Full preview modal */}
      {previewSlug && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
              <span className="text-sm font-medium text-gray-700">
                {templates.find(t => t.slug === previewSlug)?.name} — Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const t = templates.find(t => t.slug === previewSlug);
                    if (t) onSelect(t);
                    setPreviewSlug(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800"
                >
                  <Check className="w-3.5 h-3.5" /> Use This Template
                </button>
                <button
                  onClick={() => setPreviewSlug(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 transition"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            <iframe
              src={templates.find(t => t.slug === previewSlug)?.previewUrl || `/api/templates/${previewSlug}/preview`}
              className="w-full h-full border-0"
              title="Template Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
