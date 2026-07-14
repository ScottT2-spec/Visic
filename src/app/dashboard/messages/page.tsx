"use client";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { CheckCheck, Clock, Mail, MailOpen, Trash2, User } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { useAIPrefill } from "@/hooks/useAIPrefill";
import AIPrefillBanner from "@/components/dashboard/AIPrefillBanner";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const { currentStore } = useSite();
  const { isFromAI, clearPrefill } = useAIPrefill("message");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const res = await api.get<{ data: ContactMessage[]; pagination: unknown }>(
      `/api/sites/${currentStore.id}/messages`
    );
    if (res.success && res.data) {
      const msgs = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setMessages(msgs);
    }
    setLoading(false);
  }, [currentStore]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const markRead = async (ids: string[]) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/messages`, { ids, isRead: true });
    setMessages((prev) => prev.map((m) => ids.includes(m.id) ? { ...m, isRead: true } : m));
  };

  const deleteMessage = async (id: string) => {
    if (!currentStore || !confirm("Delete this message?")) return;
    await api.delete(`/api/sites/${currentStore.id}/messages?id=${id}`);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = prev === id ? null : id;
      // Mark as read when expanding
      const msg = messages.find((m) => m.id === id);
      if (msg && !msg.isRead && next === id) {
        markRead([id]);
      }
      return next;
    });
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const markAllRead = async () => {
    const unreadIds = messages.filter((m) => !m.isRead).map((m) => m.id);
    if (unreadIds.length > 0) await markRead(unreadIds);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Messages</h1>
          <p className="text-sm text-surface-500 mt-1">
            Contact form submissions from your store
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No messages yet</h3>
          <p className="text-sm text-surface-500">When customers submit your contact form, their messages will appear here.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
          {messages.map((msg) => {
            const isExpanded = expanded === msg.id;
            return (
              <div key={msg.id} className={`transition-colors ${!msg.isRead ? "bg-brand-50/30" : ""}`}>
                <button
                  onClick={() => toggleExpand(msg.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-50 transition-colors"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!msg.isRead ? "bg-brand-100" : "bg-surface-100"}`}>
                    {!msg.isRead ? <Mail className="h-5 w-5 text-brand-600" /> : <MailOpen className="h-5 w-5 text-surface-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${!msg.isRead ? "font-bold text-surface-900" : "font-semibold text-surface-700"}`}>
                        {msg.name}
                      </span>
                      <span className="text-xs text-surface-400 truncate">&lt;{msg.email}&gt;</span>
                    </div>
                    <p className="text-xs text-surface-500 truncate mt-0.5">
                      {msg.subject ? <span className="font-medium text-surface-700">{msg.subject} — </span> : null}
                      {msg.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-surface-400 whitespace-nowrap">{timeAgo(msg.createdAt)}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-surface-400" /> : <ChevronDown className="h-4 w-4 text-surface-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 ml-14">
                    <div className="rounded-xl bg-surface-50 border border-surface-100 p-4 space-y-3">
                      <div className="flex items-center gap-4 text-xs text-surface-500">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {msg.name}</span>
                        <a href={`mailto:${msg.email}`} className="flex items-center gap-1 text-brand-600 hover:underline">
                          <Mail className="h-3 w-3" /> {msg.email}
                        </a>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      {msg.subject && <p className="text-sm font-semibold text-surface-900">{msg.subject}</p>}
                      <p className="text-sm text-surface-700 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      <div className="flex items-center gap-2 pt-2">
                        <a href={`mailto:${msg.email}?subject=Re: ${msg.subject || "Your message"}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-brand-700 transition-colors">
                          <Mail className="h-3 w-3" /> Reply
                        </a>
                        <button onClick={() => deleteMessage(msg.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-semibold text-surface-500 hover:text-red-600 hover:border-red-200 transition-colors">
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
