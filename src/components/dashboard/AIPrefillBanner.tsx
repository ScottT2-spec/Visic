"use client";
import { ArrowLeft, X } from "lucide-react";
import { Bot, Sparkles } from "@/components/icons/FilledIcons";

/**
 * AI Prefill Banner
 *
 * Shows at the top of any form page when AI has pre-filled data.
 * Provides context about what was prepared and buttons to save or cancel.
 */

import { useAIAction } from "@/context/AIActionContext";

export interface AIPrefillBannerProps {
  /** What kind of entity (e.g. "product", "coupon", "flash sale") — shown in text */
  entityType?: string;
  /** Legacy: which page this banner is on (e.g., "products/new") */
  page?: string;
  /** Called when merchant cancels/discards the AI prefill */
  onDiscard?: () => void;
  /** Legacy alias for onDiscard */
  onCancel?: () => void;
}

export default function AIPrefillBanner({ entityType, page, onDiscard, onCancel }: AIPrefillBannerProps) {
  const { verification, clearVerification, completeAndReturn } = useAIAction();

  if (!verification) return null;

  const handleCancel = () => {
    clearVerification();
    onDiscard?.();
    onCancel?.();
  };

  const summaryText = verification.summary || (
    entityType
      ? `The AI has pre-filled a ${entityType} for you. Review the details below.`
      : "The AI has pre-filled this form for you."
  );

  return (
    <div className="mb-6 rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 via-white to-accent-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white flex-shrink-0 shadow-md shadow-brand-500/20">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
              AI Pre-filled
            </span>
          </div>
          <p className="text-sm text-surface-700">{summaryText}</p>
          <p className="text-xs text-surface-400 mt-1">
            Review the form below, add images if needed, then save. You&apos;ll be taken
            back to the AI chat.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-50 transition-colors"
            >
              <X className="h-3 w-3" />
              Discard
            </button>
            <button
              onClick={() => completeAndReturn("Returned to chat without saving.")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-50 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
