"use client";
import { Loader2 } from "lucide-react";
import { CheckCircle2, ExternalLink, Eye, Palette } from "@/components/icons/FilledIcons";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";

interface ThemeConfig { colors?: { primary?: string; accent?: string; headerBg?: string; footerBg?: string }; fonts?: { heading?: string; body?: string } }
interface Theme { id: string; name: string; slug: string; description?: string; thumbnail?: string; preview?: string; category: string; industry?: string; isPremium: boolean; isFeatured: boolean; isInstalled?: boolean; isActive?: boolean; config?: ThemeConfig; customConfig?: ThemeConfig | null; }
interface ThemesData { themes: Theme[]; activeThemeId: string | null; }

const CATEGORIES = ["All", "Restaurant", "Accessories", "Children", "Products & Services", "Interior Design", "Fashion"];

export default function ThemesPage() {
  const { currentStore } = useSite();
  const { prefillData, clearPrefill, isFromAI } = useAIPrefill("theme");
  const [data, setData] = useState<ThemesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchThemes = async () => {
    if (!currentStore) return;
    const res = await api.get<ThemesData>(`/api/sites/${currentStore.id}/themes`);
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchThemes(); }, [currentStore]);

  const installTheme = async (themeId: string) => {
    if (!currentStore) return;
    setInstalling(themeId);
    await api.post(`/api/sites/${currentStore.id}/themes`, { themeId, activate: true });
    await fetchThemes();
    setInstalling(null);
  };

  const activeThemeId = data?.activeThemeId;

  const filteredThemes = data?.themes.filter((t) =>
    activeCategory === "All" ? true : t.category === activeCategory
  ) || [];

  return (
    <>
      <DashboardHeader title="Themes" subtitle="Choose a template for your store" />
      <div className="p-6">
        {isFromAI && <AIPrefillBanner entityType="theme" onDiscard={() => clearPrefill()} />}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-brand-600 text-white shadow-md"
                  : "bg-surface-100 text-surface-600 hover:bg-surface-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
        ) : !filteredThemes.length ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <Palette className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 mb-2">
              {activeCategory === "All" ? "No themes available yet" : `No ${activeCategory} themes yet`}
            </h3>
            <p className="text-sm text-surface-500">More themes coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredThemes.map((theme) => {
              const isActive = activeThemeId === theme.id;
              return (
                <div key={theme.id} className="rounded-2xl border border-surface-200 bg-white overflow-hidden hover:shadow-lg transition-all group">
                  {/* Theme preview area */}
                  <div className="relative h-48 bg-gradient-to-br from-surface-50 to-surface-100 overflow-hidden">
                    {theme.thumbnail ? (
                      <img src={theme.thumbnail} alt={theme.name} className="h-full w-full object-cover" />
                    ) : (
                      /* Color-based preview card */
                      <div className="h-full w-full flex flex-col">
                        <div
                          className="h-10 w-full flex items-center px-4"
                          style={{ backgroundColor: theme.config?.colors?.headerBg || "#fff" }}
                        >
                          <div className="flex gap-1.5">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.config?.colors?.primary || "#333" }} />
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.config?.colors?.accent || "#666" }} />
                          </div>
                          <div className="ml-auto h-1.5 w-12 rounded bg-surface-200" />
                        </div>
                        <div className="flex-1 flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${theme.config?.colors?.primary || "#333"}22, ${theme.config?.colors?.accent || "#666"}22)` }}>
                          <div className="text-center">
                            <div className="h-3 w-24 rounded mx-auto mb-2" style={{ backgroundColor: theme.config?.colors?.primary || "#333" }} />
                            <div className="h-2 w-32 rounded mx-auto mb-3 bg-surface-200" />
                            <div className="flex gap-2 justify-center">
                              <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: theme.config?.colors?.accent || "#666", opacity: 0.3 }} />
                              <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: theme.config?.colors?.primary || "#333", opacity: 0.2 }} />
                              <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: theme.config?.colors?.accent || "#666", opacity: 0.3 }} />
                            </div>
                          </div>
                        </div>
                        <div className="h-6 w-full" style={{ backgroundColor: theme.config?.colors?.footerBg || "#111" }} />
                      </div>
                    )}
                    {/* Preview overlay on hover */}
                    {theme.preview && (
                      <a
                        href={theme.preview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <span className="inline-flex items-center gap-2 bg-white text-surface-900 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
                          <Eye className="h-4 w-4" /> Live Preview
                        </span>
                      </a>
                    )}
                    {/* Featured badge */}
                    {theme.isFeatured && (
                      <div className="absolute top-2 left-2 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Theme info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-surface-900">{theme.name}</h3>
                      {theme.isPremium && (
                        <span className="text-[10px] font-semibold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">Premium</span>
                      )}
                    </div>
                    <p className="text-xs text-surface-500 mb-1">
                      {theme.category}{theme.industry ? ` · ${theme.industry}` : ""}
                    </p>
                    {theme.description && (
                      <p className="text-xs text-surface-400 mb-3 line-clamp-2">{theme.description}</p>
                    )}

                    {/* Color swatches */}
                    {theme.config?.colors && (
                      <div className="flex items-center gap-1.5 mb-3">
                        {[theme.config.colors.primary, theme.config.colors.accent, theme.config.colors.headerBg, theme.config.colors.footerBg]
                          .filter(Boolean)
                          .map((color, i) => (
                            <div
                              key={i}
                              className="h-5 w-5 rounded-full border border-surface-200 shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        {theme.config.fonts?.heading && (
                          <span className="text-[10px] text-surface-400 ml-2 italic">{theme.config.fonts.heading}</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 flex-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Active
                        </span>
                      ) : (
                        <button
                          onClick={() => installTheme(theme.id)}
                          disabled={installing === theme.id}
                          className="btn-primary text-xs py-1.5 px-3 flex-1"
                        >
                          {installing === theme.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : "Activate"}
                        </button>
                      )}
                      {theme.preview && (
                        <a
                          href={theme.preview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium py-1.5 px-2 rounded-lg hover:bg-brand-50 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" /> Preview
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
