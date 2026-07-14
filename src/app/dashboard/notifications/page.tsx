"use client";
import { Loader2 } from "lucide-react";
import { AlertTriangle, Bell, CheckCircle2, CreditCard, Filter, Mail, Megaphone, MessageSquare, Package, Shield, ShoppingCart, Smartphone, Star, Trash2, Users } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface SiteNotif {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

interface UserNotif {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  channel: string;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  ORDER: ShoppingCart, order: ShoppingCart,
  PAYMENT: CreditCard, payment: CreditCard,
  LOW_STOCK: Package, low_stock: Package,
  REVIEW: Star, review: Star,
  LEAD: Users, lead: Users,
  CAMPAIGN: Megaphone, campaign: Megaphone,
  SYSTEM: Bell, system: Bell,
  SECURITY: Shield, security: Shield,
};

const typeColors: Record<string, string> = {
  ORDER: "bg-blue-50 text-blue-600", order: "bg-blue-50 text-blue-600",
  PAYMENT: "bg-green-50 text-green-600", payment: "bg-green-50 text-green-600",
  LOW_STOCK: "bg-amber-50 text-amber-600", low_stock: "bg-amber-50 text-amber-600",
  REVIEW: "bg-purple-50 text-purple-600", review: "bg-purple-50 text-purple-600",
  LEAD: "bg-indigo-50 text-indigo-600", lead: "bg-indigo-50 text-indigo-600",
  CAMPAIGN: "bg-orange-50 text-orange-600", campaign: "bg-orange-50 text-orange-600",
  SYSTEM: "bg-surface-100 text-surface-600", system: "bg-surface-100 text-surface-600",
  SECURITY: "bg-red-50 text-red-600", security: "bg-red-50 text-red-600",
};

const channelIcons: Record<string, typeof Bell> = {
  in_app: Bell, email: Mail, sms: Smartphone, whatsapp: MessageSquare, push: Bell,
};

type Tab = "site" | "user";

export default function NotificationsPage() {
  const { currentStore } = useSite();
  const [tab, setTab] = useState<Tab>("site");

  // Site notifications
  const [siteNotifs, setSiteNotifs] = useState<SiteNotif[]>([]);
  const [siteLoading, setSiteLoading] = useState(true);
  const [siteUnread, setSiteUnread] = useState(0);
  const [siteUnreadByType, setSiteUnreadByType] = useState<Record<string, number>>({});
  const [siteTypeFilter, setSiteTypeFilter] = useState("");
  const [sitePage, setSitePage] = useState(1);
  const [siteTotalPages, setSiteTotalPages] = useState(1);

  // User notifications
  const [userNotifs, setUserNotifs] = useState<UserNotif[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userUnread, setUserUnread] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  const fetchSiteNotifs = useCallback(async () => {
    if (!currentStore) return;
    setSiteLoading(true);
    const params = new URLSearchParams();
    if (siteTypeFilter) params.set("type", siteTypeFilter);
    params.set("page", String(sitePage));
    params.set("limit", "20");
    const res = await api.get<{
      notifications: SiteNotif[];
      unreadCount: number;
      unreadByType: Record<string, number>;
      pagination: { pages: number };
    }>(`/api/sites/${currentStore.id}/notifications?${params}`);
    if (res.success && res.data) {
      setSiteNotifs(res.data.notifications || []);
      setSiteUnread(res.data.unreadCount || 0);
      setSiteUnreadByType(res.data.unreadByType || {});
      setSiteTotalPages(res.data.pagination?.pages || 1);
    }
    setSiteLoading(false);
  }, [currentStore, siteTypeFilter, sitePage]);

  const fetchUserNotifs = useCallback(async () => {
    setUserLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(userPage));
    params.set("limit", "20");
    const res = await api.get<{
      notifications: UserNotif[];
      unreadCount: number;
      pagination: { pages: number };
    }>(`/api/notifications?${params}`);
    if (res.success && res.data) {
      setUserNotifs(res.data.notifications || []);
      setUserUnread(res.data.unreadCount || 0);
      setUserTotalPages(res.data.pagination?.pages || 1);
    }
    setUserLoading(false);
  }, [userPage]);

  useEffect(() => {
    if (tab === "site") fetchSiteNotifs();
    else fetchUserNotifs();
  }, [tab, fetchSiteNotifs, fetchUserNotifs]);

  const markAllSiteRead = async () => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/notifications`, { isRead: true });
    setSiteNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setSiteUnread(0);
    setSiteUnreadByType({});
  };

  const markSiteRead = async (ids: string[]) => {
    if (!currentStore) return;
    await api.patch(`/api/sites/${currentStore.id}/notifications`, { ids, isRead: true });
    setSiteNotifs((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n)));
    setSiteUnread((prev) => Math.max(0, prev - ids.length));
  };

  const clearSiteRead = async () => {
    if (!currentStore || !confirm("Delete all read notifications?")) return;
    await api.delete(`/api/sites/${currentStore.id}/notifications`);
    setSiteNotifs((prev) => prev.filter((n) => !n.isRead));
  };

  const markAllUserRead = async () => {
    await api.patch(`/api/notifications`, { isRead: true });
    setUserNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUserUnread(0);
  };

  const markUserRead = async (ids: string[]) => {
    await api.patch(`/api/notifications`, { ids, isRead: true });
    setUserNotifs((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n)));
    setUserUnread((prev) => Math.max(0, prev - ids.length));
  };

  const clearUserRead = async () => {
    if (!confirm("Delete all read notifications?")) return;
    await api.delete(`/api/notifications`);
    setUserNotifs((prev) => prev.filter((n) => !n.isRead));
  };

  if (!currentStore) {
    return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  }

  const renderNotifList = (
    notifs: (SiteNotif | UserNotif)[],
    loading: boolean,
    unread: number,
    onMarkRead: (ids: string[]) => void,
    onMarkAllRead: () => void,
    onClearRead: () => void,
    page: number,
    totalPages: number,
    setPage: (p: number) => void,
    isUser?: boolean,
  ) => {
    if (loading) {
      return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
    }

    if (notifs.length === 0) {
      return (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No notifications</h3>
          <p className="text-sm text-surface-500">You&apos;re all caught up!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-500">{unread} unread</span>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button onClick={onMarkAllRead} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
            <button onClick={onClearRead} className="text-xs text-surface-400 hover:text-accent-600 font-medium flex items-center gap-1">
              <Trash2 className="h-3.5 w-3.5" /> Clear read
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden divide-y divide-surface-100">
          {notifs.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            const colorClass = typeColors[notif.type] || "bg-surface-100 text-surface-600";
            const ChannelIcon = isUser ? channelIcons[(notif as UserNotif).channel] || Bell : null;

            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer hover:bg-surface-50 ${!notif.isRead ? "bg-brand-50/30" : ""}`}
                onClick={() => !notif.isRead && onMarkRead([notif.id])}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm ${notif.isRead ? "font-medium text-surface-700" : "font-semibold text-surface-900"}`}>
                      {notif.title}
                    </h3>
                    {!notif.isRead && <div className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-surface-400">{new Date(notif.createdAt).toLocaleString()}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colorClass}`}>{notif.type}</span>
                    {ChannelIcon && (
                      <span className="text-[10px] text-surface-400 flex items-center gap-0.5">
                        <ChannelIcon className="h-3 w-3" /> {(notif as UserNotif).channel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 px-3 disabled:opacity-50">Previous</button>
            <span className="text-sm text-surface-500">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary text-sm py-2 px-3 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Notifications</h1>
          <p className="text-sm text-surface-500 mt-1">Stay on top of orders, leads, reviews, and more</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-surface-200">
        <button
          onClick={() => setTab("site")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "site" ? "border-brand-600 text-brand-700" : "border-transparent text-surface-500 hover:text-surface-700"
          }`}
        >
          Store Notifications
          {siteUnread > 0 && (
            <span className="ml-1.5 text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-full">{siteUnread}</span>
          )}
        </button>
        <button
          onClick={() => setTab("user")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "user" ? "border-brand-600 text-brand-700" : "border-transparent text-surface-500 hover:text-surface-700"
          }`}
        >
          My Notifications
          {userUnread > 0 && (
            <span className="ml-1.5 text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-full">{userUnread}</span>
          )}
        </button>
      </div>

      {/* Type filter for site notifications */}
      {tab === "site" && Object.keys(siteUnreadByType).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setSiteTypeFilter(""); setSitePage(1); }}
            className={`text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors ${
              !siteTypeFilter ? "bg-brand-600 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200"
            }`}
          >
            All
          </button>
          {Object.entries(siteUnreadByType).map(([type, count]) => (
            <button
              key={type}
              onClick={() => { setSiteTypeFilter(siteTypeFilter === type ? "" : type); setSitePage(1); }}
              className={`text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors ${
                siteTypeFilter === type ? "bg-brand-600 text-white" : (typeColors[type] || "bg-surface-100 text-surface-600") + " hover:opacity-80"
              }`}
            >
              {type} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {tab === "site"
        ? renderNotifList(siteNotifs, siteLoading, siteUnread, markSiteRead, markAllSiteRead, clearSiteRead, sitePage, siteTotalPages, setSitePage)
        : renderNotifList(userNotifs, userLoading, userUnread, markUserRead, markAllUserRead, clearUserRead, userPage, userTotalPages, setUserPage, true)
      }
    </div>
  );
}
