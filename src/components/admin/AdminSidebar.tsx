"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart3, LayoutDashboard, LogOut, Palette, Puzzle, Settings, ShoppingBag, Store, Users } from "@/components/icons/FilledIcons";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Stores", href: "/admin/sites", icon: Store },
  { name: "Themes", href: "/admin/themes", icon: Palette },
  { name: "Plugins", href: "/admin/plugins", icon: Puzzle },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({
  collapsed,
  setCollapsed,
  onNavigate,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "??";

  return (
    <aside
      className={cn(
        "left-0 top-0 z-40 h-screen border-r border-surface-200 bg-white transition-all duration-300 flex flex-col",
        "lg:fixed lg:block",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-surface-100">
        <Link href="/admin" className="flex items-center min-w-0">
          <span className={`${collapsed ? "text-lg" : "text-2xl"} font-bold tracking-tight`}>Afrostore</span>
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Admin badge */}
      <div className="px-3 py-3">
        <div
          className={cn(
            "w-full flex items-center gap-2.5 rounded-xl border border-accent-200 bg-accent-50 p-2.5",
            collapsed && "justify-center p-2"
          )}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 text-white">
            <Settings className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <div className="text-xs font-semibold text-accent-900 truncate">
                Admin Panel
              </div>
              <div className="text-[10px] text-accent-600 truncate">
                Platform Management
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent-50 text-accent-700 shadow-sm"
                  : "text-surface-500 hover:bg-surface-50 hover:text-surface-900",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive ? "text-accent-600" : "")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom - User info + logout */}
      <div className="border-t border-surface-100 px-3 py-3">
        <div className={cn("rounded-xl bg-surface-50 p-2.5", collapsed && "text-center")}>
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-surface-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-surface-500 truncate">{user?.email}</p>
                <p className="text-[10px] text-accent-500 font-medium truncate">Admin</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 transition-colors",
              collapsed ? "mx-auto" : "w-full"
            )}
          >
            <LogOut className="h-[16px] w-[16px]" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
