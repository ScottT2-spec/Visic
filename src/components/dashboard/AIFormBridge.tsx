"use client";

/**
 * AI Form Bridge
 *
 * Universal component that bridges AI prefill data into any dashboard form page.
 * Drop this at the top of any page that should support AI pre-filling.
 *
 * It:
 * 1. Shows the AI prefill banner when AI data is available
 * 2. Exposes a callback to return to chat after save
 * 3. Injects prefill data into form fields via a ref-based approach
 *
 * For simple pages (coupons, categories, delivery, etc.) that use inline forms
 * or modals, this component provides the prefill data and handles the return flow.
 *
 * Usage in a page:
 * ```tsx
 * import AIFormBridge from "@/components/dashboard/AIFormBridge";
 *
 * export default function CouponsPage() {
 *   return (
 *     <>
 *       <AIFormBridge page="coupons" onPrefill={(data) => {
 *         // Open create modal with data pre-filled
 *         setFormData(data);
 *         setShowModal(true);
 *       }} />
 *       {/* rest of page *\/}
 *     </>
 *   );
 * }
 * ```
 */

import { useEffect, useRef } from "react";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";

interface AIFormBridgeProps {
  /** Page identifier matching the MCP tool's navigateTo */
  page: string;

  /** Called when AI prefill data is available */
  onPrefill?: (data: Record<string, unknown>) => void;

  /** Called when merchant should return to chat (after save) */
  onReturnToChat?: () => void;
}

export default function AIFormBridge({
  page,
  onPrefill,
}: AIFormBridgeProps) {
  const { prefill, isAIPrefilled, onSaveComplete, onCancel } = useAIPrefill(page);
  const applied = useRef(false);

  useEffect(() => {
    if (prefill && onPrefill && !applied.current) {
      applied.current = true;
      // Small delay to ensure the page has rendered its form
      const timer = setTimeout(() => {
        onPrefill(prefill);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [prefill, onPrefill]);

  // Reset the applied flag when prefill changes
  useEffect(() => {
    if (!prefill) {
      applied.current = false;
    }
  }, [prefill]);

  if (!isAIPrefilled) return null;

  return <AIPrefillBanner page={page} onCancel={onCancel} />;
}

/**
 * Helper: wrap a save handler to auto-return to AI chat after save.
 */
export function withAIReturn(
  saveFn: () => Promise<boolean>,
  isAIPrefilled: boolean,
  onSaveComplete: (msg?: string) => void,
  successMessage?: string
) {
  return async () => {
    const success = await saveFn();
    if (success && isAIPrefilled) {
      onSaveComplete(successMessage || "Saved successfully!");
    }
    return success;
  };
}
