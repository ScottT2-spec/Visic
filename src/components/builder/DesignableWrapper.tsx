"use client";

import { resolveSectionStyleOverrides } from "@/components/storefront/block-style";
import type { SectionStyleOverrides } from "@/types";

interface DesignableWrapperProps {
  children: React.ReactNode;
  styleOverrides?: SectionStyleOverrides;
  blockType?: string;
  className?: string;
}

/**
 * DesignableWrapper - A universal wrapper that applies design settings to any content
 * Used to make Shop/Blog pages and other dynamic content editable in the builder
 */
export function DesignableWrapper({
  children,
  styleOverrides,
  blockType = "default",
  className = "",
}: DesignableWrapperProps) {
  const { styles, classes, overlayStyles } = resolveSectionStyleOverrides(
    styleOverrides as Record<string, unknown> | undefined,
    blockType
  );

  return (
    <div
      className={`relative ${classes} ${className}`}
      style={styles}
    >
      {/* Background overlay if specified */}
      {overlayStyles && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={overlayStyles}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
