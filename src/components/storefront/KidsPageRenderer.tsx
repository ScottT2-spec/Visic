"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Copy, Clipboard, ArrowUp, ArrowDown, Trash } from 'lucide-react';
import { KidsStoreContext } from './KidsTemplateBlocks';
import {
  KidsAnnouncementBar,
  KidsHeroSlider,
  KidsCategoryCards,
  KidsProductGrid,
  KidsBundlePromo,
  KidsBlogPosts,
  KidsInstagram,
  KidsNewsletter,
} from './KidsTemplateBlocks';

// Section type matching the Visic reference
export interface KidsSection {
  id: string;
  type: string;
  order: number;
  props: Record<string, any>;
  styleOverrides?: Record<string, unknown>;
}

interface KidsPageRendererProps {
  sections: KidsSection[];
  mode: 'live' | 'edit';
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  onDuplicateSection?: (id: string) => void;
  onDeleteSection?: (id: string) => void;
  onMoveSection?: (id: string, direction: 'up' | 'down') => void;
  onCopyStyle?: (id: string) => void;
  onPasteStyle?: (id: string) => void;
  copiedStyleSectionId?: string | null;
}

export const KidsPageRenderer: React.FC<KidsPageRendererProps> = ({
  sections,
  mode,
  selectedSectionId = null,
  onSelectSection,
  onDuplicateSection,
  onDeleteSection,
  onMoveSection,
  onCopyStyle,
  onPasteStyle,
  copiedStyleSectionId = null,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sectionId: string } | null>(null);

  // Use the new universal style resolver
  const { resolveSectionStyleOverrides } = require("@/components/storefront/block-style");

  // Compile section style properties using the new resolver
  const getSectionStyles = (sec: KidsSection): React.CSSProperties => {
    const { styles } = resolveSectionStyleOverrides(sec.styleOverrides, sec.type);
    return styles;
  };

  // Get responsive visibility classes
  const getSectionClasses = (sec: KidsSection): string => {
    const { classes } = resolveSectionStyleOverrides(sec.styleOverrides, sec.type);
    return classes;
  };

  // Get background overlay styles
  const getSectionOverlayStyles = (sec: KidsSection): React.CSSProperties | null => {
    const { overlayStyles } = resolveSectionStyleOverrides(sec.styleOverrides, sec.type);
    return overlayStyles;
  };

  // Helper to safely get style override values
  const getOverride = <T,>(overrides: Record<string, unknown> | undefined, key: string, defaultValue: T): T => {
    return (overrides?.[key] as T) ?? defaultValue;
  };

  // Render individual block based on type
  const renderBlock = (sec: KidsSection) => {
    const { type, props } = sec;

    switch (type) {
      case 'kidsAnnouncementBar':
        return <KidsAnnouncementBar {...props} />;
      case 'kidsHeroSlider':
        return <KidsHeroSlider slides={props.slides as any || []} autoplaySpeed={props.autoplaySpeed} minHeight={props.minHeight} />;
      case 'kidsCategoryCards':
        return <KidsCategoryCards categories={props.categories as any || []} sectionTitle={props.sectionTitle} />;
      case 'kidsProductGrid':
        return <KidsProductGrid {...props} />;
      case 'kidsBundlePromo':
        return <KidsBundlePromo title={props.title as string} productImages={props.productImages as any || []} {...props} />;
      case 'kidsBlogPosts':
        return <KidsBlogPosts posts={props.posts as any || []} columns={props.columns} sectionTitle={props.sectionTitle} />;
      case 'kidsInstagram':
        return <KidsInstagram items={props.items as any || []} sectionTitle={props.sectionTitle} />;
      case 'kidsNewsletter':
        return <KidsNewsletter {...props} />;
      default:
        return <div className="p-8 text-center text-gray-500">Unknown block type: {type}</div>;
    }
  };

  return (
    <div className="relative min-h-screen text-slate-800 flex flex-col">
      
      {/* Dynamic Sections Renderer */}
      <div className="flex-1">
        {sections
          .sort((a, b) => a.order - b.order)
          .map((sec) => {
            const isSelected = selectedSectionId === sec.id;
            const overrides = sec.styleOverrides || {};
            const sectionStyles = getSectionStyles(sec);
            const sectionClasses = getSectionClasses(sec);
            const overlayStyles = getSectionOverlayStyles(sec);

            // Hover effects mapping
            const hoverScale = getOverride<string>(overrides, 'hoverScale', '');
            const hoverOpacity = getOverride<string>(overrides, 'hoverOpacity', '');
            const hoverShadow = getOverride<string>(overrides, 'hoverShadow', '');
            const transitionDuration = getOverride<string>(overrides, 'transitionDuration', '');
            
            const isHoverEnabled = hoverScale || hoverOpacity || hoverShadow;
            const motionProps = isHoverEnabled && mode === 'edit' ? {
              whileHover: {
                scale: hoverScale ? parseFloat(hoverScale) : 1,
                opacity: hoverOpacity ? parseFloat(hoverOpacity) : 1,
                boxShadow: hoverShadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.05)' :
                           hoverShadow === 'md' ? '0 4px 6px rgba(0,0,0,0.1)' :
                           hoverShadow === 'lg' ? '0 10px 15px rgba(0,0,0,0.1)' :
                           hoverShadow === 'xl' ? '0 20px 25px rgba(0,0,0,0.1)' : undefined
              },
              transition: {
                duration: transitionDuration ? parseFloat(transitionDuration) / 1000 : 0.2
              }
            } : {};
            
            // Outer wrapper for each block with editing hover & highlight effects
            return (
              <motion.div
                key={sec.id}
                style={sectionStyles}
                {...motionProps}
                onClick={(e) => {
                  if (mode === 'edit' && onSelectSection) {
                    e.stopPropagation();
                    onSelectSection(sec.id);
                  }
                }}
                onContextMenu={(e) => {
                  if (mode === 'edit') {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      sectionId: sec.id
                    });
                  }
                }}
                className={`relative group transition-all duration-200 ${sectionClasses} ${
                  mode === 'edit' ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:ring-offset-1' : ''
                } ${isSelected && mode === 'edit' ? 'ring-2 ring-indigo-600 ring-offset-2 z-10' : ''}`}
              >
                {/* Active Section Label for Builder Canvas */}
                {isSelected && mode === 'edit' && (
                  <div className="absolute top-0 left-4 -translate-y-1/2 bg-indigo-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow z-20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Active Section: {sec.type}
                  </div>
                )}

                {/* Background overlay div if requested */}
                {overlayStyles && (
                  <div 
                    className="absolute inset-0 z-0 pointer-events-none" 
                    style={overlayStyles}
                  />
                )}

                <div className="relative z-10 w-full">
                  {/* Individual block rendering */}
                  {renderBlock(sec)}
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* RIGHT-CLICK CONTEXT MENU POPUP */}
      <AnimatePresence>
        {contextMenu && mode === 'edit' && (
          <>
            {/* Click-away backdrop */}
            <div 
              className="fixed inset-0 z-50 cursor-default" 
              onClick={() => setContextMenu(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{ 
                position: 'fixed',
                left: Math.min(contextMenu.x, window.innerWidth - 220), 
                top: Math.min(contextMenu.y, window.innerHeight - 320) 
              }}
              className="fixed z-50 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 text-xs text-slate-200 select-none cursor-default"
            >
              <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-850 mb-1.5 flex items-center justify-between">
                <span>Block Actions</span>
                <span className="text-indigo-400 font-mono">
                  {(sections.find(s => s.id === contextMenu.sectionId)?.type || '').toUpperCase()}
                </span>
              </div>
              
              <button
                onClick={() => {
                  if (onSelectSection) onSelectSection(contextMenu.sectionId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-md flex items-center gap-2 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit Properties</span>
              </button>

              <button
                onClick={() => {
                  if (onDuplicateSection) onDuplicateSection(contextMenu.sectionId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-md flex items-center gap-2 transition"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Duplicate Block</span>
              </button>

              {onCopyStyle && (
                <button
                  onClick={() => {
                    onCopyStyle(contextMenu.sectionId);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-md flex items-center gap-2 transition"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Copy Styling Override</span>
                </button>
              )}

              {onPasteStyle && (
                <button
                  onClick={() => {
                    onPasteStyle(contextMenu.sectionId);
                    setContextMenu(null);
                  }}
                  disabled={!copiedStyleSectionId}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-md flex items-center gap-2 transition disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Clipboard className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Paste Styling Override</span>
                </button>
              )}

              <hr className="border-slate-800 my-1" />

              <button
                onClick={() => {
                  if (onMoveSection) onMoveSection(contextMenu.sectionId, 'up');
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-md flex items-center gap-2 transition"
              >
                <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
                <span>Move Level Up</span>
              </button>

              <button
                onClick={() => {
                  if (onMoveSection) onMoveSection(contextMenu.sectionId, 'down');
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-md flex items-center gap-2 transition"
              >
                <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Move Level Down</span>
              </button>

              <hr className="border-slate-800 my-1" />

              <button
                onClick={() => {
                  if (onDeleteSection) onDeleteSection(contextMenu.sectionId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-red-950/50 hover:text-red-300 text-red-400 rounded-md flex items-center gap-2 transition font-medium"
              >
                <Trash className="w-3.5 h-3.5 text-red-500" />
                <span>Delete Block</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
