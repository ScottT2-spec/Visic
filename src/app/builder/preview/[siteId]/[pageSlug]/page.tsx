"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RenderBlocks, type BuilderBlock } from "@/components/storefront/BlockRenderer";
import { resolveSectionStyleOverrides } from "@/components/storefront/block-style";
import { PerfumesHeader, PerfumesFooter, PerfumesFontLoader } from "@/components/storefront/PerfumesTemplateBlocks";
import { KidsHeader, KidsFooterFull, KidsFontLoader } from "@/components/storefront/KidsTemplateBlocks";
import { HandmadeBagsHeader, HandmadeBagsFooter } from "@/components/storefront/HandmadeBagsStoreChrome";
import { CosmeticsHeader, CosmeticsFooter, CosmeticsFontLoader } from "@/components/storefront/CosmeticsTemplateBlocks";
import { TShirtsPrintsHeader, TShirtsPrintsFooter } from "@/components/storefront/TShirtsPrintsStoreChrome";
import { VegetableHeader, VegetableFooter } from "@/components/storefront/VegetableStoreChrome";
import { FashionHeader, FashionFooter } from "@/components/storefront/FashionStoreChrome";
import { GardenHeader, GardenFooter } from "@/components/storefront/GardenStoreChrome";
import { HealthHeader, HealthFooterFull, HealthFontLoader } from "@/components/storefront/HealthTemplateBlocks";
import { InteriorHeader, InteriorFooter } from "@/components/storefront/InteriorDesignTemplateBlocks";

// Chrome block types that should not be in the editable block list
const CHROME_BLOCK_TYPES = new Set([
  'perfumesHeader', 'perfumesFooter',
  'handmadeBagsHeader', 'handmadeBagsFooter',
  'cosmeticsHeader', 'cosmeticsFooter',
  'kidsHeader', 'kidsFooter',
  'tShirtsPrintsHeader', 'tShirtsPrintsFooter',
]);

export default function BuilderPreviewPage() {
  const params = useParams();
  const { siteId, pageSlug } = params;
  const [storeData, setStoreData] = useState<any>(null);
  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [productData, setProductData] = useState<any>(null);
  const [blogData, setBlogData] = useState<any>(null);
  const [globalDesignSystem, setGlobalDesignSystem] = useState<any>(null);

  useEffect(() => {
    async function loadStore() {
      try {
        // First, get the site to resolve the actual slug/subdomain
        const siteRes = await fetch(`/api/sites/${siteId}`);
        const siteJson = await siteRes.json();
        
        if (!siteJson.success || !siteJson.data) {
          setError("Site not found");
          setLoading(false);
          return;
        }

        const siteSlug = siteJson.data.slug || siteJson.data.subdomain;
        
        // Load the actual storefront data using the public API with the resolved slug
        const res = await fetch(`/api/storefront/${siteSlug}/pages/${pageSlug}`);
        
        if (!res.ok) {
          console.error(`Failed to fetch page data: ${res.status} ${res.statusText}`);
          // Fallback: use site data directly if page API fails
          setStoreData({
            store: siteJson.data,
            page: {
              id: 'fallback',
              slug: pageSlug,
              title: pageSlug,
              content: { blocks: [] },
            },
            templateSlug: siteJson.data.template?.slug || 'default',
            products: [],
            categories: [],
          });
          setBlocks([]);
          setLoading(false);
          return;
        }
        
        let json;
        try {
          json = await res.json();
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          setError("Invalid response from server");
          setLoading(false);
          return;
        }
        
        if (json.success && json.data) {
          setStoreData(json.data);
          const pageBlocks = (json.data.page.content?.blocks || []) as BuilderBlock[];
          setBlocks(pageBlocks);
        } else {
          console.error("API returned error:", json.error);
          setError(json.error || "Page not found");
        }
      } catch (error) {
        console.error("Failed to load preview data:", error);
        setError("Failed to load preview");
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [siteId, pageSlug]);

  // Fetch product/blog data for cosmetics shop/blog pages
  useEffect(() => {
    if (!storeData) return;
    
    const { store, templateSlug } = storeData;
    const storeSlug = store.slug || store.subdomain;
    
    if (templateSlug === 'cosmetics' && pageSlug === 'shop') {
      fetch(`/api/storefront/${storeSlug}`)
        .then(res => {
          if (!res.ok) {
            console.error('Failed to fetch product data:', res.status);
            return null;
          }
          return res.json();
        })
        .then(json => {
          if (json?.success) setProductData(json.data);
        })
        .catch(err => console.error('Failed to fetch product data:', err));
    }
    
    if (templateSlug === 'cosmetics' && pageSlug === 'blog') {
      fetch(`/api/storefront/${storeSlug}/blogs`)
        .then(res => {
          if (!res.ok) {
            console.error('Failed to fetch blog data:', res.status);
            return null;
          }
          return res.json();
        })
        .then(json => {
          if (json?.success) setBlogData(json.data);
        })
        .catch(err => console.error('Failed to fetch blog data:', err));
    }
  }, [storeData, pageSlug]);

  // Listen for messages from the parent editor
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "builder-section-update") {
        // Handle section updates from editor
        console.log("Section update received:", event.data);
        
        // Update the specific block in local state
        const { sectionId, section } = event.data;
        setBlocks((prevBlocks) => {
          return prevBlocks.map((block) => {
            if (block.id === sectionId) {
              // Merge section.content and section.styleOverrides into block.props
              return {
                ...block,
                props: {
                  ...section.content,
                  ...section.styleOverrides,
                },
              };
            }
            return block;
          });
        });
      }
      if (event.data.type === "builder-theme-update") {
        // Handle theme updates from editor
        console.log("Theme update received:", event.data);
        
        // Store global design system for merging with block overrides
        const { theme } = event.data;
        setGlobalDesignSystem(theme?.designSystem);
        
        // Apply theme CSS variables to the document
        const root = document.documentElement;
        const colors = theme?.designSystem?.colors;
        
        console.log("About to set CSS variables. colors object:", colors);
        
        if (colors) {
          console.log("Setting --color-primary to:", colors.primary);
          root.style.setProperty('--color-primary', colors.primary);
          console.log("Set --color-primary, current value:", root.style.getPropertyValue('--color-primary'));
          
          console.log("Setting --color-secondary to:", colors.secondary);
          root.style.setProperty('--color-secondary', colors.secondary);
          console.log("Set --color-secondary, current value:", root.style.getPropertyValue('--color-secondary'));
          
          console.log("Setting --color-accent to:", colors.accent);
          root.style.setProperty('--color-accent', colors.accent);
          console.log("Set --color-accent, current value:", root.style.getPropertyValue('--color-accent'));
          
          console.log("Setting --color-background to:", colors.background);
          root.style.setProperty('--color-background', colors.background);
          console.log("Set --color-background, current value:", root.style.getPropertyValue('--color-background'));
          
          console.log("Setting --color-text to:", colors.text);
          root.style.setProperty('--color-text', colors.text);
          console.log("Set --color-text, current value:", root.style.getPropertyValue('--color-text'));
          
          console.log("Setting --color-muted-text to:", colors.mutedText || '#6b7280');
          root.style.setProperty('--color-muted-text', colors.mutedText || '#6b7280');
          console.log("Set --color-muted-text, current value:", root.style.getPropertyValue('--color-muted-text'));
          
          console.log("Setting --color-border to:", colors.border || '#e5e7eb');
          root.style.setProperty('--color-border', colors.border || '#e5e7eb');
          console.log("Set --color-border, current value:", root.style.getPropertyValue('--color-border'));
          
          console.log("All CSS variables set. Final root.style properties:", root.style.cssText);
        } else {
          console.log("No colors object found in theme.designSystem");
        }
      }
      if (event.data.type === "builder-viewport-change") {
        // Handle viewport changes
        console.log("Viewport change received:", event.data.viewport);
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Signal to parent that iframe is ready to receive messages
    window.parent.postMessage({ type: "builder-iframe-ready" }, "*");
    
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-surface-500">Loading preview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-red-500 text-center p-8">
          <p className="font-semibold">Preview Error</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-red-500">Failed to load preview data</div>
      </div>
    );
  }

  const { store, page, templateSlug, products, categories } = storeData;
  const storeSlug = store.slug || store.subdomain;
  
  // Filter out chrome blocks from editable content
  const contentBlocks = blocks.filter(b => !CHROME_BLOCK_TYPES.has(b.type));

  // Render product grid for cosmetics shop pages
  const renderProductGrid = () => {
    if (templateSlug !== 'cosmetics' || pageSlug !== 'shop' || !productData) return null;
    const products = productData.products || [];
    const currency = store.currency || 'GHS';
    
    return (
      <div className="max-w-[1222px] mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p: any) => {
            const hasImage = p.images?.length > 0 && p.images[0].url;
            return (
              <div key={p.id} className="group">
                <Link href={`/store/${storeSlug}/product/${p.slug}`} className="block">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-white">
                    {hasImage ? (
                      <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                        <span className="text-white/40 text-4xl font-bold">{p.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                </Link>
                <Link href={`/store/${storeSlug}/product/${p.slug}`}>
                  <h3 className="text-sm font-semibold text-[#242424] group-hover:text-red-600 transition-colors">{p.name}</h3>
                </Link>
                {p.category && <p className="text-[10px] text-[#767676] mt-0.5">{p.category.name}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-base font-bold text-[#242424]">GH₵{Number(p.price).toLocaleString()}</span>
                  {p.compareAtPrice && <span className="text-xs text-[#767676] line-through">GH₵{Number(p.compareAtPrice).toLocaleString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render blog list for cosmetics blog pages
  const renderBlogList = () => {
    if (templateSlug !== 'cosmetics' || pageSlug !== 'blog' || !blogData) return null;
    const blogs = blogData.blogs || [];
    
    return (
      <div className="max-w-[1222px] mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b: any) => (
            <Link key={b.id} href={`/store/${storeSlug}/blog/${b.slug}`} className="block group">
              <div className="rounded-2xl overflow-hidden bg-white shadow-sm transition-transform hover:-translate-y-1">
                {b.coverImage ? (
                  <img src={b.coverImage} alt={b.title} className="w-full aspect-[16/10] object-cover" />
                ) : (
                  <div className="w-full aspect-[16/10] bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                    <span className="text-white/40 text-4xl font-bold">{b.title.charAt(0)}</span>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="font-bold text-lg text-[#242424] group-hover:text-red-600 transition-colors">{b.title}</h2>
                  {b.excerpt && <p className="text-sm text-[#767676] mt-2">{b.excerpt}</p>}
                  <span className="mt-4 inline-flex text-sm font-semibold text-[#242424]">
                    Continue reading →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  // Render template-specific header/footer
  const renderChrome = () => {
    switch (templateSlug) {
      case 'perfumes':
        return (
          <>
            <PerfumesFontLoader />
            <PerfumesHeader
              storeName={store.name}
              storeSlug={storeSlug}
              logo={store.logo}
              categories={categories}
            />
          </>
        );
      case 'kids':
        return (
          <>
            <KidsFontLoader />
            <KidsHeader
              storeName={store.name}
              storeSlug={storeSlug}
              logo={store.logo}
            />
          </>
        );
      case 'handmade-bags':
        return (
          <HandmadeBagsHeader
            storeName={store.name}
            storeSlug={storeSlug}
            logo={store.logo}
          />
        );
      case 'cosmetics':
        return (
          <>
            <CosmeticsFontLoader />
            <CosmeticsHeader
              storeName={store.name}
              storeSlug={storeSlug}
              logo={store.logo}
            />
          </>
        );
      case 't-shirts-prints':
        return (
          <TShirtsPrintsHeader
            storeName={store.name}
            storeSlug={storeSlug}
            logo={store.logo}
          />
        );
      case 'vegetables':
        return (
          <VegetableHeader
            storeName={store.name}
            storeSlug={storeSlug}
            logo={store.logo}
            navItems={[]}
            reservationHref=""
          />
        );
      case 'health':
        return (
          <>
            <HealthFontLoader />
            <HealthHeader
              storeName={store.name}
              storeSlug={storeSlug}
              logo={store.logo}
            />
          </>
        );
      case 'interior':
        return (
          <InteriorHeader
            storeName={store.name}
            storeSlug={storeSlug}
            logo={store.logo}
          />
        );
      default:
        return (
          <FashionHeader
            storeName={store.name}
            storeSlug={storeSlug}
            logo={store.logo}
          />
        );
    }
  };

  const renderFooter = () => {
    switch (templateSlug) {
      case 'perfumes':
        return <PerfumesFooter storeName={store.name} storeSlug={storeSlug} />;
      case 'kids':
        return <KidsFooterFull storeName={store.name} storeSlug={storeSlug} />;
      case 'handmade-bags':
        return <HandmadeBagsFooter storeName={store.name} storeSlug={storeSlug} />;
      case 'cosmetics':
        return <CosmeticsFooter storeName={store.name} storeSlug={storeSlug} />;
      case 't-shirts-prints':
        return <TShirtsPrintsFooter storeName={store.name} storeSlug={storeSlug} />;
      case 'vegetables':
        return <VegetableFooter storeName={store.name} storeSlug={storeSlug} navItems={[]} />;
      case 'health':
        return <HealthFooterFull storeName={store.name} storeSlug={storeSlug} />;
      case 'interior':
        return <InteriorFooter storeSlug={storeSlug} />;
      default:
        return <FashionFooter storeName={store.name} storeSlug={storeSlug} />;
    }
  };

  // Wrap blocks with selectable containers for editor mode
  const wrapBlockForEditor = (block: BuilderBlock, content: React.ReactNode, index: number) => {
    // Extract style overrides from block props
    const props = block.props as Record<string, unknown>;
    
    console.log(`[wrapBlockForEditor] Block ${block.id} (${block.type}) props:`, props);
    
    // Convert global design system to BlockStyleSettings format for merging
    const globalDefaults = globalDesignSystem ? {
      backgroundColor: globalDesignSystem.colors?.background,
      textColor: globalDesignSystem.colors?.text,
      fontFamily: globalDesignSystem.fonts?.body,
      borderRadius: globalDesignSystem.borderRadius,
    } : undefined;
    
    // Resolve styles using the universal resolver
    const { styles, classes, overlayStyles, hoverCss } = resolveSectionStyleOverrides(
      props as Record<string, unknown>,
      block.type,
      globalDefaults
    );
    
    console.log(`[wrapBlockForEditor] Resolved styles for block ${block.id}:`, { styles, classes, overlayStyles, hoverCss });

    // Final wrapper style combining editor outline with resolved styles
    const finalWrapperStyle: React.CSSProperties = {
      outline: '2px solid transparent',
      transition: 'outline 0.15s ease',
      ...styles,
    };

    console.log(`[wrapBlockForEditor] Final <div style={...}> props for block ${block.id}:`, finalWrapperStyle);

    // Generate high-specificity CSS for hover effects and complex rules
    let dynamicCss = '';
    
    // Add hover CSS with block-specific selector
    if (hoverCss) {
      dynamicCss += `[data-block-id="${block.id}"]:hover { ${hoverCss} } `;
    }

    // Generate CSS to override internal block component styles with !important
    // This ensures resolved styles win over hardcoded inline styles in template blocks
    const internalBlockSelector = `[data-block-id="${block.id}"] > .relative.z-10 > *`;
    let overrideCss = '';
    
    // Helper to convert CSSProperties to CSS string with !important
    const styleToCss = (styleObj: React.CSSProperties) => {
      return Object.entries(styleObj).map(([key, value]) => {
        if (!value) return '';
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value} !important; `;
      }).join('');
    };
    
    // Apply ALL resolved styles to internal block elements to override hardcoded styles
    overrideCss += `${internalBlockSelector} { ${styleToCss(styles)} } `;

    return (
      <>
        {/* Inject dynamic CSS for hover effects and style overrides */}
        {(dynamicCss || overrideCss) && (
          <style dangerouslySetInnerHTML={{ __html: dynamicCss + overrideCss }} />
        )}
        <div
          key={block.id}
          data-block-id={block.id}
          data-block-type={block.type}
          data-block-index={index}
          className={`relative group/block builder-block-wrapper ${classes}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Send block selection message to parent editor
            window.parent.postMessage({
              type: 'builder-block-select',
              blockId: block.id,
              blockType: block.type,
              blockProps: block.props,
            }, '*');
          }}
          style={finalWrapperStyle}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.outline = '2px solid #3b82f6';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.outline = '2px solid transparent';
          }}
        >
          {/* Background overlay if needed */}
          {overlayStyles && (
            <div 
              className="absolute inset-0 z-0 pointer-events-none" 
              style={overlayStyles}
            />
          )}
          
          {/* Block content */}
          <div className="relative z-10">
            {content}
          </div>
          
          {/* Block label overlay on hover */}
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/block:opacity-100 transition-opacity pointer-events-none z-20">
            {block.type}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Disable all link navigation in editor mode */}
      <style dangerouslySetInnerHTML={{ __html: `
        .builder-block-wrapper a,
        .builder-block-wrapper button[type="submit"] {
          pointer-events: none !important;
          cursor: default !important;
        }
        .builder-block-wrapper {
          cursor: pointer !important;
        }
      `}} />
      {renderChrome()}
      <RenderBlocks 
        blocks={contentBlocks} 
        storeSlug={storeSlug}
        products={products}
        isEditorMode={true}
        wrapBlock={wrapBlockForEditor}
      />
      {renderProductGrid()}
      {renderBlogList()}
      {renderFooter()}
    </div>
  );
}
