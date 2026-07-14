"use client";
import { ArrowRight, ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import { AlertCircle, Bot, CheckCircle2, ExternalLink, ImagePlus, Send, Sparkles, Wrench, Zap } from "@/components/icons/FilledIcons";

import { useState, useRef, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useSite } from "@/context/StoreContext";
import { useAIAction } from "@/context/AIActionContext";
import { api } from "@/lib/api-client";

// ─── Types ──────────────────────────────────────────────────

interface ToolUsed {
  name: string;
  result: {
    action: string;
    message: string;
    data?: Record<string, unknown>;
    navigateTo?: string;
    prefill?: Record<string, unknown>;
  };
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
  model?: string;
  ragSources?: number;
  images?: string[];
  /** Tools the AI used in this response */
  toolsUsed?: ToolUsed[];
  /** Verification action (navigate to form) */
  verification?: {
    navigateTo: string;
    prefill: Record<string, unknown>;
    entityType?: string;
    summary: string;
  };
}

interface MCPResponse {
  content: string;
  provider: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  ragContext?: {
    sourcesUsed: number;
    documentTypes: string[];
  };
  verification?: {
    navigateTo: string;
    prefill: Record<string, unknown>;
    entityType?: string;
    summary: string;
  };
  toolsUsed?: ToolUsed[];
}

// ─── Suggestions ────────────────────────────────────────────

const suggestions = [
  { text: "Show me my dashboard overview", icon: "📊" },
  { text: "Add a new product to my store", icon: "📦" },
  { text: "Create a 20% off coupon", icon: "🎟️" },
  { text: "Set up delivery zones for Lagos", icon: "🚚" },
  { text: "Start a flash sale this weekend", icon: "⚡" },
  { text: "How are my sales doing this month?", icon: "📈" },
  { text: "Show me pending orders", icon: "🛒" },
  { text: "Set up a loyalty program", icon: "⭐" },
];

// ─── Tool Badge Component ───────────────────────────────────

function ToolBadge({ tools }: { tools: ToolUsed[] }) {
  const [expanded, setExpanded] = useState(false);

  if (tools.length === 0) return null;

  return (
    <div className="mt-2 border-t border-surface-200/50 pt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[10px] text-surface-400 hover:text-surface-600 transition-colors"
      >
        <Wrench className="h-2.5 w-2.5" />
        <span>
          {tools.length} tool{tools.length !== 1 ? "s" : ""} used
        </span>
        {expanded ? (
          <ChevronUp className="h-2.5 w-2.5" />
        ) : (
          <ChevronDown className="h-2.5 w-2.5" />
        )}
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-1">
          {tools.map((t, i) => (
            <div
              key={i}
              className="flex items-start gap-1.5 text-[10px] text-surface-400"
            >
              <span
                className={`mt-0.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                  t.result.action === "error"
                    ? "bg-red-400"
                    : t.result.action === "verify"
                      ? "bg-amber-400"
                      : "bg-green-400"
                }`}
              />
              <span className="font-mono">{t.name}</span>
              <span className="text-surface-300">→</span>
              <span className="truncate">{t.result.message.slice(0, 80)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Verification Card ──────────────────────────────────────

function VerificationCard({
  verification,
  onNavigate,
}: {
  verification: Message["verification"];
  onNavigate: () => void;
}) {
  if (!verification) return null;

  return (
    <div className="mt-3 rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-accent-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600 flex-shrink-0">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-900">
            Ready for your review
          </p>
          <p className="text-xs text-surface-500 mt-0.5">
            {verification.summary}
          </p>
          <button
            onClick={onNavigate}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 transition-colors"
          >
            Review & Save
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Return Banner ──────────────────────────────────────────

function ReturnBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="mx-6 mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="text-green-400 hover:text-green-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function AIPage() {
  const { user } = useAuth();
  const { currentStore } = useSite();
  const {
    setVerification,
    navigateToVerification,
    returnMessage,
    clearReturnMessage,
  } = useAIAction();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "??";

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const maxImages = 4 - attachedImages.length;
    Array.from(files)
      .slice(0, maxImages)
      .forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        if (file.size > 5 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onload = () => {
          setAttachedImages((prev) =>
            [...prev, reader.result as string].slice(0, 4)
          );
        };
        reader.readAsDataURL(file);
      });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Send message
  const sendMessage = async (text: string) => {
    if ((!text.trim() && attachedImages.length === 0) || !currentStore || loading)
      return;

    const currentImages = [...attachedImages];
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content:
        text.trim() ||
        (currentImages.length > 0 ? "What do you think of this?" : ""),
      timestamp: new Date(),
      images: currentImages.length > 0 ? currentImages : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachedImages([]);
    setLoading(true);
    setError("");

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post<MCPResponse>(
        `/api/sites/${currentStore.id}/ai`,
        {
          message:
            text.trim() ||
            (currentImages.length > 0 ? "What do you think of this?" : ""),
          conversationHistory,
          ...(currentImages.length > 0 ? { images: currentImages } : {}),
        }
      );

      if (res.success && res.data) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: res.data.content,
          timestamp: new Date(),
          provider: res.data.provider,
          model: res.data.model,
          ragSources: res.data.ragContext?.sourcesUsed,
          toolsUsed: res.data.toolsUsed,
          verification: res.data.verification,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // If there's a verification action, store it in context
        if (res.data.verification) {
          setVerification({
            navigateTo: res.data.verification.navigateTo,
            prefill: res.data.verification.prefill,
            entityType: res.data.verification.entityType,
            summary: res.data.verification.summary,
          });
        }
      } else {
        const errMsg = res.error || "Something went wrong";

        if (
          errMsg.includes("not configured") ||
          errMsg.includes("API key")
        ) {
          setError(
            "AI is not configured yet. Ask your admin to set up an AI provider."
          );
        } else if (errMsg.includes("unavailable")) {
          setError(
            "AI service is temporarily unavailable. Please try again."
          );
        } else {
          setError(errMsg);
        }

        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ ${errMsg}\n\nPlease try again or rephrase your question.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      setError("Network error — couldn't reach the AI service.");
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "⚠️ Couldn't connect to the AI service. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }

    setLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  // Handle verification navigation
  const handleVerificationNavigate = (
    v: Message["verification"]
  ) => {
    if (!v) return;
    setVerification({
      navigateTo: v.navigateTo,
      prefill: v.prefill,
      entityType: v.entityType,
      summary: v.summary,
    });
    navigateToVerification();
  };

  return (
    <>
      <DashboardHeader
        title="AI Co-Founder"
        subtitle="Your hands-on commerce partner"
        action={
          messages.length > 0
            ? { label: "New Chat", onClick: clearChat }
            : undefined
        }
      />
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Return banner */}
        {returnMessage && (
          <ReturnBanner
            message={returnMessage}
            onDismiss={clearReturnMessage}
          />
        )}

        {/* Error banner */}
        {error && !error.includes("not configured") && (
          <div className="mx-6 mt-4 rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-brand-500/25">
                <Bot className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-surface-900 mb-2">
                Hey {user?.firstName}! I&apos;m your AI co-founder.
              </h2>
              <p className="text-sm text-surface-500 mb-2">
                I don&apos;t just give advice — I take action. I can add products,
                create coupons, set up delivery zones, analyze your sales, and
                manage everything in{" "}
                <strong>{currentStore?.name || "your store"}</strong>.
              </p>
              <p className="text-xs text-surface-400 mb-8">
                When I create something, I&apos;ll take you to the form to review, add
                images, and save.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {suggestions.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => sendMessage(s.text)}
                    className="text-left rounded-xl border border-surface-200 bg-white p-3 text-xs text-surface-600 hover:bg-surface-50 hover:border-surface-300 transition-colors flex items-start gap-2"
                  >
                    <span className="text-sm">{s.icon}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-brand-600 text-white"
                        : "bg-surface-100 text-surface-800"
                    }`}
                  >
                    {/* User images */}
                    {msg.images && msg.images.length > 0 && (
                      <div
                        className={`flex gap-2 mb-2 flex-wrap ${msg.images.length === 1 ? "" : "grid grid-cols-2"}`}
                      >
                        {msg.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Attached ${i + 1}`}
                            className="rounded-lg max-h-48 object-cover border border-white/20"
                          />
                        ))}
                      </div>
                    )}

                    {/* Message content */}
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Verification card */}
                    {msg.verification && (
                      <VerificationCard
                        verification={msg.verification}
                        onNavigate={() =>
                          handleVerificationNavigate(msg.verification)
                        }
                      />
                    )}

                    {/* Tool usage info */}
                    {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                      <ToolBadge tools={msg.toolsUsed} />
                    )}

                    {/* Provider info */}
                    {msg.role === "assistant" &&
                      !msg.toolsUsed?.length &&
                      (msg.provider || msg.ragSources) && (
                        <div className="mt-2 pt-2 border-t border-surface-200/50 flex items-center gap-3 text-[10px] text-surface-400">
                          {msg.provider && (
                            <span className="flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5" />
                              {msg.provider}/{msg.model}
                            </span>
                          )}
                          {msg.ragSources !== undefined &&
                            msg.ragSources > 0 && (
                              <span>
                                {msg.ragSources} store data sources used
                              </span>
                            )}
                        </div>
                      )}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {initials}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-surface-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-surface-400" />
                      <span className="text-xs text-surface-400">
                        Working on it...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-surface-100 p-4 bg-white">
          <div className="max-w-3xl mx-auto">
            {/* Image previews */}
            {attachedImages.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {attachedImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`Upload ${i + 1}`}
                      className="h-16 w-16 rounded-lg object-cover border border-surface-200"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-surface-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || attachedImages.length >= 4}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-surface-200 bg-white text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors disabled:opacity-50 flex-shrink-0"
                title="Attach image"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  attachedImages.length > 0
                    ? "Describe what you want..."
                    : "Tell me what to do..."
                }
                className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                disabled={loading}
                maxLength={5000}
              />
              <button
                type="submit"
                disabled={
                  loading || (!input.trim() && attachedImages.length === 0)
                }
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 disabled:opacity-50 flex-shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
            <p className="text-[10px] text-surface-400 mt-2 text-center">
              I can manage your entire store — products, orders, coupons,
              delivery, analytics, and more
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
