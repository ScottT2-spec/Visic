"use client";
import { ChevronDown, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Activity, BarChart, BarChart3, Bell, BookOpen, Bot, Building2, Clock, CreditCard, Crown, ExternalLink, File, FileText, Filter, FolderTree, Globe, Heart, HelpCircle, Home, Image as ImageIcon, Info, Layers, LayoutDashboard, Link2, LogOut, Mail, Megaphone, MessageSquare, MousePointer, Package, Palette, PenTool, Phone, Puzzle, Receipt, RotateCcw, ScrollText, Search, Send, Settings, Shield, ShoppingBag, ShoppingCart, Smartphone, Star, Store, Tag, Target, Truck, Undo2, UserPlus, Users, Zap } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSite } from "@/context/StoreContext";
import { cn } from "@/lib/utils";

// ─── Nav types ─────────────────────────────────────────────
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// ─── Site-type-specific navigation ─────────────────────────
// ─── ECOMMERCE: Full store management ──────────────────────
const ecommerceNav: NavGroup[] = [
  { label: "", items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "Commerce",
    items: [
      { name: "Products", href: "/dashboard/products", icon: Package },
      { name: "Categories", href: "/dashboard/categories", icon: FolderTree },
      { name: "Brands", href: "/dashboard/brands", icon: Tag },
      { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
      { name: "Customers", href: "/dashboard/customers", icon: Users },
      { name: "Reviews", href: "/dashboard/reviews", icon: Star },
      { name: "Wishlists", href: "/dashboard/wishlists", icon: Heart },
      { name: "Returns", href: "/dashboard/returns", icon: Undo2 },
      { name: "Inventory", href: "/dashboard/inventory", icon: BarChart3 },
    ],
  },
  {
    label: "Marketing",
    items: [
      { name: "Coupons", href: "/dashboard/coupons", icon: Tag },
      { name: "Flash Sales", href: "/dashboard/flash-sales", icon: Zap },
      { name: "Campaigns", href: "/dashboard/marketing", icon: Megaphone },
      { name: "Abandoned Carts", href: "/dashboard/abandoned-carts", icon: RotateCcw },
      { name: "Loyalty", href: "/dashboard/loyalty", icon: Crown },
      { name: "Referrals", href: "/dashboard/referrals", icon: Link2 },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Pages", href: "/dashboard/pages", icon: FileText },
      { name: "Blogs", href: "/dashboard/blogs", icon: BookOpen },
      { name: "Media Library", href: "/dashboard/media", icon: ImageIcon },
      { name: "SEO", href: "/dashboard/seo", icon: Search },
    ],
  },
  {
    label: "Configuration",
    items: [
      { name: "Delivery", href: "/dashboard/delivery", icon: Truck },
      { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
      { name: "Taxes", href: "/dashboard/taxes", icon: Receipt },
      { name: "Themes", href: "/dashboard/themes", icon: Palette },
      { name: "Plugins", href: "/dashboard/plugins", icon: Puzzle },
      { name: "Domains", href: "/dashboard/domains", icon: Globe },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "Marketplace", href: "/dashboard/marketplace", icon: Store },
      { name: "Audit Log", href: "/dashboard/audit-log", icon: Shield },
      { name: "Team", href: "/dashboard/team", icon: UserPlus },
    ],
  },
  { label: "", items: [
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Messages", href: "/dashboard/messages", icon: Mail },
    { name: "AI Business", href: "/dashboard/ai-business", icon: Bot },
    { name: "AI Assistant", href: "/dashboard/ai", icon: Bot },
  ] },
];

// ─── WEBSITE: Content & blogging focused ───────────────────
const websiteNav: NavGroup[] = [
  { label: "", items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "Content",
    items: [
      { name: "Pages", href: "/dashboard/pages", icon: FileText },
      { name: "Blogs", href: "/dashboard/blogs", icon: BookOpen },
      { name: "Media Library", href: "/dashboard/media", icon: ImageIcon },
      { name: "Forms", href: "/dashboard/forms", icon: PenTool },
    ],
  },
  {
    label: "Marketing",
    items: [
      { name: "Campaigns", href: "/dashboard/marketing", icon: Megaphone },
      { name: "Popups", href: "/dashboard/popups", icon: Layers },
      { name: "SEO", href: "/dashboard/seo", icon: Search },
    ],
  },
  {
    label: "Configuration",
    items: [
      { name: "Themes", href: "/dashboard/themes", icon: Palette },
      { name: "Plugins", href: "/dashboard/plugins", icon: Puzzle },
      { name: "Domains", href: "/dashboard/domains", icon: Globe },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "Audit Log", href: "/dashboard/audit-log", icon: Shield },
      { name: "Team", href: "/dashboard/team", icon: UserPlus },
    ],
  },
  { label: "", items: [
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Messages", href: "/dashboard/messages", icon: Mail },
    { name: "AI Business", href: "/dashboard/ai-business", icon: Bot },
    { name: "AI Assistant", href: "/dashboard/ai", icon: Bot },
  ] },
];

// ─── LANDING PAGE: Conversion & lead gen focused ───────────
const landingPageNav: NavGroup[] = [
  { label: "", items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "Conversion",
    items: [
      { name: "Landing Pages", href: "/dashboard/pages", icon: FileText },
      { name: "Funnels", href: "/dashboard/funnels", icon: Filter },
      { name: "Popups", href: "/dashboard/popups", icon: Layers },
      { name: "A/B Testing", href: "/dashboard/ab-tests", icon: Activity },
    ],
  },
  {
    label: "CRM",
    items: [
      { name: "Contacts", href: "/dashboard/crm", icon: Users },
      { name: "Lead Forms", href: "/dashboard/forms", icon: PenTool },
    ],
  },
  {
    label: "Marketing",
    items: [
      { name: "Campaigns", href: "/dashboard/marketing", icon: Megaphone },
      { name: "Automations", href: "/dashboard/automations", icon: Zap },
      { name: "SEO", href: "/dashboard/seo", icon: Search },
    ],
  },
  {
    label: "Configuration",
    items: [
      { name: "Themes", href: "/dashboard/themes", icon: Palette },
      { name: "Plugins", href: "/dashboard/plugins", icon: Puzzle },
      { name: "Domains", href: "/dashboard/domains", icon: Globe },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "Media Library", href: "/dashboard/media", icon: ImageIcon },
      { name: "Audit Log", href: "/dashboard/audit-log", icon: Shield },
      { name: "Team", href: "/dashboard/team", icon: UserPlus },
    ],
  },
  { label: "", items: [
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Messages", href: "/dashboard/messages", icon: Mail },
    { name: "AI Business", href: "/dashboard/ai-business", icon: Bot },
    { name: "AI Assistant", href: "/dashboard/ai", icon: Bot },
  ] },
];

function getNavForSiteType(siteType: string | null): NavGroup[] {
  switch (siteType) {
    case "WEBSITE": return websiteNav;
    case "LANDING_PAGE": return landingPageNav;
    default: return ecommerceNav;
  }
}

const bottomNav = [
  { name: "Billing", href: "/dashboard/billing", icon: Receipt },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "/dashboard/support", icon: HelpCircle },
];

const siteTypeLabels: Record<string, { label: string; color: string }> = {
  ECOMMERCE: { label: "Store", color: "text-emerald-600" },
  WEBSITE: { label: "Website", color: "text-blue-600" },
  LANDING_PAGE: { label: "Landing Page", color: "text-purple-600" },
};

// ─── Component ─────────────────────────────────────────────

export default function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [siteSwitcherOpen, setSiteSwitcherOpen] = useState(false);
  const [allSites, setAllSites] = useState<Array<{ id: string; name: string; siteType: string; slug: string }>>([]);
  const { user, logout } = useAuth();
  const { siteId, siteName, siteType, slug, setSiteId } = useSite();

  // Fetch all sites for the switcher dropdown
  useEffect(() => {
    if (!siteSwitcherOpen) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/sites", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) setAllSites(json.data);
      })
      .catch(() => {});
  }, [siteSwitcherOpen]);

  const navGroups = getNavForSiteType(siteType);
  const typeInfo = siteTypeLabels[siteType || "ECOMMERCE"];

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "??";

  const renderNavLink = (item: NavItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className="h-[18px] w-[18px] flex-shrink-0" />
        {!collapsed && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "left-0 top-0 z-40 h-screen border-r border-gray-200 bg-white transition-all duration-300 flex flex-col",
        "lg:fixed lg:block",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100">
        <Link href="/dashboard/workspaces" className="flex items-center min-w-0">
          <img src="/prokip-logo.png" alt="Prokip" className={`${collapsed ? "h-16 w-16" : "h-28 w-28"} flex-shrink-0 object-contain`} />
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Site Switcher */}
      <div className="px-3 py-3 border-b border-gray-100 relative">
        <button
          onClick={() => setSiteSwitcherOpen(!siteSwitcherOpen)}
          className={cn(
            "w-full flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 p-2.5 transition-colors hover:bg-gray-100",
            collapsed && "justify-center p-2"
          )}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm">
            {siteName ? siteName.charAt(0).toUpperCase() : "?"}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs font-semibold text-gray-900 truncate">
                  {siteName || "No site selected"}
                </div>
                <div className={`text-[10px] font-medium ${typeInfo.color}`}>
                  {typeInfo.label}
                </div>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform flex-shrink-0", siteSwitcherOpen && "rotate-180")} />
            </>
          )}
        </button>

        {/* Dropdown */}
        {siteSwitcherOpen && !collapsed && (
          <div className="absolute left-3 right-3 top-full mt-1 z-50 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
            <div className="max-h-64 overflow-y-auto py-1">
              {allSites.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-gray-400">No sites found</div>
              ) : (
                allSites.map((site) => {
                  const cfg = siteTypeLabels[site.siteType] || siteTypeLabels.ECOMMERCE;
                  const isActive = site.id === siteId;
                  return (
                    <button
                      key={site.id}
                      onClick={() => {
                        setSiteId(site.id);
                        setSiteSwitcherOpen(false);
                        if (typeof window !== "undefined") {
                          localStorage.setItem(`activeSiteId:${user?.id || "guest"}`, site.id);
                          localStorage.removeItem("activeSiteId");
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                        isActive ? "bg-gray-50" : "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-[10px]">
                        {site.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">{site.name}</div>
                        <div className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</div>
                      </div>
                      {isActive && <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
            <div className="border-t border-gray-100">
              <Link
                href="/dashboard/new-site"
                onClick={() => setSiteSwitcherOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Create new site
              </Link>
              <Link
                href="/dashboard/workspaces"
                onClick={() => setSiteSwitcherOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Store className="h-3.5 w-3.5" /> Manage workspaces
              </Link>
            </div>
          </div>
        )}

        {slug && !collapsed && (
          <Link
            href={`/store/${slug}`}
            target="_blank"
            className="mt-2 w-full flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 text-gray-900 px-3 py-2 transition-colors hover:bg-amber-100"
          >
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs font-semibold">View Live Site</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navGroups.map((group, gi) => (
          <div key={gi} className={cn(group.label ? "mt-4 first:mt-0" : "")}>
            {group.label && !collapsed && (
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {group.label}
              </div>
            )}
            {collapsed && group.label && (
              <div className="my-2 mx-2 border-t border-gray-100" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => renderNavLink(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-100 px-3 py-3 space-y-0.5">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* User */}
        <div className={cn("rounded-xl bg-gray-50 p-2.5 mt-2", collapsed && "text-center")}>
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors",
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
