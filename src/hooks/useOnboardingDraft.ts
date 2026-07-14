"use client";

import { useSyncExternalStore } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  loadOnboardingDraft,
  onboardingDraftChangeEventName,
  type StoredOnboardingDraft,
} from "@/lib/onboarding-draft";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const changeEventName = onboardingDraftChangeEventName();
  window.addEventListener("storage", callback);
  window.addEventListener(changeEventName, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(changeEventName, callback);
  };
}

export function useOnboardingDraft() {
  const { user } = useAuth();
  return useSyncExternalStore(
    subscribe,
    () => loadOnboardingDraft(user?.id),
    () => null,
  );
}
