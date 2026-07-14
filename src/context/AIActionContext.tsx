"use client";

/**
 * AI Action Context
 *
 * Manages the verification flow between the AI chat and dashboard forms.
 *
 * Flow:
 * 1. AI calls a tool that returns action:"verify" with navigateTo + prefill
 * 2. Chat UI stores the prefill data here and navigates to the form
 * 3. Form page reads prefill data from this context
 * 4. Merchant reviews, adds images, makes changes, saves
 * 5. After save, merchant is redirected back to /dashboard/ai
 *
 * Uses sessionStorage for persistence across navigations (but not across tabs/sessions).
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";

// ─── Types ──────────────────────────────────────────────────

export interface AIVerification {
  /** Dashboard route to navigate to (e.g., "/dashboard/products/new") */
  navigateTo: string;
  /** Entity type the AI is creating (e.g., "product", "coupon", "flash_sale") */
  entityType?: string;
  /** Pre-fill data for the form */
  prefill: Record<string, unknown>;
  /** Alias — also accessible as prefillData */
  prefillData: Record<string, unknown>;
  /** Summary of what the AI prepared */
  summary: string;
  /** Timestamp for expiry (5 minutes) */
  createdAt: number;
}

interface AIActionContextType {
  /** Current pending verification (if any) */
  verification: AIVerification | null;

  /** Set a verification action from the AI response */
  setVerification: (v: Omit<AIVerification, "createdAt" | "prefillData"> & { prefillData?: Record<string, unknown> }) => void;

  /** Clear the verification (after form save or cancel) */
  clearVerification: () => void;

  /** Get prefill data for the given entity type or page path (returns null if no match) */
  getPrefill: (entityTypeOrPage: string) => Record<string, unknown> | null;

  /** Navigate to the verification target */
  navigateToVerification: () => void;

  /** Whether there's a pending AI verification */
  isAIPrefilled: boolean;

  /** Mark the current action as completed and return to chat */
  completeAndReturn: (message?: string) => void;

  /** Return message to show in chat after verification */
  returnMessage: string | null;

  /** Clear the return message */
  clearReturnMessage: () => void;
}

const STORAGE_KEY = "afrostore_ai_verification";
const RETURN_MSG_KEY = "afrostore_ai_return_message";
const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Map of entity types to dashboard route keywords for flexible matching.
 */
const ENTITY_ROUTE_MAP: Record<string, string[]> = {
  product: ["products", "product"],
  category: ["categories", "category"],
  coupon: ["coupons", "coupon"],
  flash_sale: ["flash-sales", "flash_sale", "flashsale"],
  delivery_zone: ["delivery", "delivery-zones", "delivery_zone"],
  order: ["orders", "order"],
  customer: ["customers", "customer"],
  settings: ["settings"],
  loyalty: ["loyalty"],
  referral_program: ["referrals", "referral"],
  page: ["pages", "page"],
  theme: ["themes", "theme"],
  plugin: ["plugins", "plugin"],
  payment_gateway: ["payments", "payment-gateways", "payment_gateway"],
  member: ["team", "members", "member"],
  message: ["messages", "message"],
  review: ["reviews", "review"],
  analytics: ["analytics"],
  abandoned_cart: ["abandoned-carts", "abandoned_cart"],
};

// ─── Context ────────────────────────────────────────────────

const AIActionContext = createContext<AIActionContextType | null>(null);

export function AIActionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [verification, setVerificationState] = useState<AIVerification | null>(null);
  const [returnMessage, setReturnMessage] = useState<string | null>(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AIVerification;
        // Check expiry
        if (Date.now() - parsed.createdAt < EXPIRY_MS) {
          // Ensure prefillData alias
          if (!parsed.prefillData) parsed.prefillData = parsed.prefill;
          if (!parsed.prefill) parsed.prefill = parsed.prefillData;
          setVerificationState(parsed);
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }

      const msg = sessionStorage.getItem(RETURN_MSG_KEY);
      if (msg) {
        setReturnMessage(msg);
        sessionStorage.removeItem(RETURN_MSG_KEY);
      }
    } catch {
      // sessionStorage not available
    }
  }, []);

  const setVerification = useCallback((v: Omit<AIVerification, "createdAt" | "prefillData"> & { prefillData?: Record<string, unknown> }) => {
    const prefill = v.prefill || v.prefillData || {};
    const data: AIVerification = {
      ...v,
      prefill,
      prefillData: prefill,
      createdAt: Date.now(),
    };
    setVerificationState(data);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  const clearVerification = useCallback(() => {
    setVerificationState(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const getPrefill = useCallback(
    (entityTypeOrPage: string): Record<string, unknown> | null => {
      if (!verification) return null;

      const target = verification.navigateTo.toLowerCase();
      const query = entityTypeOrPage.toLowerCase().replace(/[-_]/g, "");

      // 1. Direct entity type match
      if (verification.entityType && verification.entityType.toLowerCase().replace(/[-_]/g, "") === query) {
        return verification.prefillData;
      }

      // 2. Check route map for the entity type
      const routeKeywords = ENTITY_ROUTE_MAP[entityTypeOrPage] || [];
      for (const keyword of routeKeywords) {
        if (target.includes(keyword)) {
          return verification.prefillData;
        }
      }

      // 3. Legacy path match
      const targetPath = verification.navigateTo.replace("/dashboard/", "");
      if (targetPath === entityTypeOrPage || verification.navigateTo.endsWith(entityTypeOrPage)) {
        return verification.prefillData;
      }

      // 4. Fuzzy: target URL contains the query
      if (target.includes(query)) {
        return verification.prefillData;
      }

      // 5. If there's a verification active and only one consumer, return it
      // This ensures the prefill data is always accessible
      return null;
    },
    [verification]
  );

  const navigateToVerification = useCallback(() => {
    if (!verification) return;
    router.push(verification.navigateTo);
  }, [verification, router]);

  const completeAndReturn = useCallback(
    (message?: string) => {
      clearVerification();
      if (message) {
        try {
          sessionStorage.setItem(RETURN_MSG_KEY, message);
        } catch {}
      }
      router.push("/dashboard/ai");
    },
    [clearVerification, router]
  );

  const clearReturnMessage = useCallback(() => {
    setReturnMessage(null);
  }, []);

  const isAIPrefilled = !!verification;

  return (
    <AIActionContext.Provider
      value={{
        verification,
        setVerification,
        clearVerification,
        getPrefill,
        navigateToVerification,
        isAIPrefilled,
        completeAndReturn,
        returnMessage,
        clearReturnMessage,
      }}
    >
      {children}
    </AIActionContext.Provider>
  );
}

export function useAIAction() {
  const ctx = useContext(AIActionContext);
  if (!ctx) throw new Error("useAIAction must be used within AIActionProvider");
  return ctx;
}
