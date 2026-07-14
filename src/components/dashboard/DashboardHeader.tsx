"use client";
import { ChevronDown, Plus, X } from "lucide-react";
import { AlertTriangle, Bell, Bot, CheckCircle2, CreditCard, HelpCircle, Info, LogOut, Package, Search, Settings, ShoppingCart, Store, User } from "@/components/icons/FilledIcons";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

// Notification types for the bell menu
interface Notification {
  id: string;
  type: "order" | "product" | "info" | "warning";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Empty state notifications — will show tips until real notifications come in
const defaultNotifications: Notification[] = [
  {
    id: "welcome",
    type: "info",
    title: "Welcome to AfroStore! 🎉",
    message: "Your dashboard is ready. Start by adding products to your store.",
    time: "Just now",
    read: false,
  },
  {
    id: "tip-products",
    type: "info",
    title: "Tip: Add product images",
    message: "Products with images get 3x more views. Upload photos in the Products section.",
    time: "1m ago",
    read: false,
  },
  {
    id: "tip-payments",
    type: "info",
    title: "Set up payments",
    message: "Connect a payment gateway to start accepting orders online.",
    time: "5m ago",
    read: true,
  },
];

const notificationIcons = {
  order: ShoppingCart,
  product: Package,
  info: Info,
  warning: AlertTriangle,
};

const notificationColors = {
  order: "bg-green-50 text-green-600",
  product: "bg-brand-50 text-brand-600",
  info: "bg-blue-50 text-blue-600",
  warning: "bg-amber-50 text-amber-600",
};

export default function DashboardHeader({
  title,
  subtitle,
  action,
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "??";

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleLogout = async () => {
    setShowProfile(false);
    if (logout) {
      await logout();
    }
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-surface-100">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-surface-900">{title}</h1>
            {subtitle && (
              <p className="text-xs text-surface-500">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 w-64">
            <Search className="h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
            />
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md border border-surface-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-surface-400">
              ⌘K
            </kbd>
          </div>

          {/* AI Assistant */}
          <Link
            href="/dashboard/ai"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
            title="AI Assistant"
          >
            <Bot className="h-[18px] w-[18px]" />
          </Link>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 transition-colors"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl border border-surface-200 bg-white shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                  <h3 className="text-sm font-bold text-surface-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell className="h-8 w-8 text-surface-200 mx-auto mb-2" />
                      <p className="text-sm text-surface-500">No notifications</p>
                      <p className="text-xs text-surface-400 mt-0.5">You&apos;re all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const Icon = notificationIcons[notif.type];
                      const colorClass = notificationColors[notif.type];
                      return (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-surface-50 hover:bg-surface-50 transition-colors ${
                            !notif.read ? "bg-brand-50/30" : ""
                          }`}
                        >
                          <div className={`h-8 w-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs font-semibold ${!notif.read ? "text-surface-900" : "text-surface-600"}`}>
                                {notif.title}
                              </p>
                              <button
                                onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id); }}
                                className="text-surface-300 hover:text-surface-500 flex-shrink-0"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-[11px] text-surface-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-surface-400 mt-1">{notif.time}</p>
                          </div>
                          {!notif.read && (
                            <div className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-surface-100 text-center">
                    <button
                      onClick={() => { setNotifications([]); setShowNotifications(false); }}
                      className="text-[11px] font-medium text-surface-400 hover:text-surface-600"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action button (only render if provided) */}
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="btn-primary text-sm py-2 px-4"
              >
                <Plus className="h-4 w-4" />
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="btn-primary text-sm py-2 px-4"
              >
                <Plus className="h-4 w-4" />
                {action.label}
              </button>
            )
          )}

          {/* User Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-surface-50 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-surface-400 hidden sm:block transition-transform ${showProfile ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 top-12 w-64 rounded-2xl border border-surface-200 bg-white shadow-xl overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-surface-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-sm font-bold">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-surface-900 truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-[11px] text-surface-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  {[
                    { icon: User, label: "My Profile", href: "/dashboard/settings" },
                    { icon: Store, label: "My Stores", href: "/dashboard" },
                    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
                    { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
                    { icon: HelpCircle, label: "Help & Support", href: "/dashboard/support" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors"
                    >
                      <item.icon className="h-4 w-4 text-surface-400" />
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-surface-100 py-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4 text-surface-400" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
