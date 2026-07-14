"use client";

import { useState, useCallback } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function useNewsletterSubscribe(storeSlug: string) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const subscribe = useCallback(
    async (email: string) => {
      if (!email) return;
      setStatus("loading");
      setErrorMsg("");
      try {
        const res = await fetch(`/api/storefront/${storeSlug}/newsletter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus("success");
        } else {
          setErrorMsg(data.error || "Failed to subscribe");
          setStatus("error");
        }
      } catch {
        setErrorMsg("Network error. Please try again.");
        setStatus("error");
      }
    },
    [storeSlug]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setErrorMsg("");
  }, []);

  return { subscribe, status, errorMsg, reset };
}
