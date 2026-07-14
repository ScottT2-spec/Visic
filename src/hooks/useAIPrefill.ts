"use client";

/**
 * useAIPrefill Hook
 *
 * Used by dashboard form pages to:
 * 1. Check if AI has pre-filled data for this page
 * 2. Get the prefill data to populate form fields
 * 3. Handle the save → return-to-chat flow
 *
 * Usage:
 * ```tsx
 * const { prefillData, isFromAI, clearPrefill } = useAIPrefill("flash_sale");
 *
 * useEffect(() => {
 *   if (prefillData && isFromAI) {
 *     setForm(prev => ({ ...prev, ...prefillData }));
 *   }
 * }, [prefillData, isFromAI]);
 *
 * // After successful save:
 * if (isFromAI) { clearPrefill(); router.push("/dashboard/ai"); }
 * ```
 */

import { useCallback, useMemo } from "react";
import { useAIAction } from "@/context/AIActionContext";

export function useAIPrefill(entityType: string) {
  const { verification, getPrefill, completeAndReturn, clearVerification } = useAIAction();

  const prefill = getPrefill(entityType);

  // Also try matching by navigateTo path containing entityType
  const prefillData = useMemo(() => {
    if (prefill) return prefill;
    // Fallback: check if verification navigateTo contains the entityType keyword
    if (verification?.prefillData) {
      const target = verification.navigateTo.toLowerCase().replace(/[-_]/g, "");
      const normalized = entityType.toLowerCase().replace(/[-_]/g, "");
      if (target.includes(normalized)) return verification.prefillData;
    }
    return null;
  }, [prefill, verification, entityType]);

  const isFromAI = !!prefillData;

  /**
   * Clear the AI prefill state. Call after saving or cancelling.
   */
  const clearPrefill = useCallback(() => {
    clearVerification();
  }, [clearVerification]);

  /**
   * Call after successful save to return to chat with a message.
   */
  const onSaveComplete = useCallback(
    (message?: string) => {
      if (isFromAI) {
        completeAndReturn(message || "Saved successfully! Returning to chat.");
      }
    },
    [isFromAI, completeAndReturn]
  );

  /**
   * Call to cancel the AI prefill without saving.
   */
  const onCancel = useCallback(() => {
    clearVerification();
  }, [clearVerification]);

  return {
    /** The pre-fill data object (null if no AI prefill) */
    prefillData,
    /** Whether the current form was pre-filled by AI */
    isFromAI,
    /** Clear the prefill state */
    clearPrefill,
    /** Call after successful save to return to chat */
    onSaveComplete,
    /** Call to cancel the AI prefill */
    onCancel,
    /** The full verification object (for advanced use) */
    verification,
    /** Legacy alias for prefillData */
    prefill: prefillData,
    /** Legacy alias for isFromAI */
    isAIPrefilled: isFromAI,
  };
}
