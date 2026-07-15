"use client";
import { ChevronRight, X } from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [user, loading, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-10 border-4 border-accent-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Mobile sidebar toggle — small arrow on left edge */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 lg:hidden flex items-center justify-center h-12 w-8 bg-accent-600 text-white rounded-r-lg shadow-lg active:bg-accent-700 transition-colors"
          aria-label="Open sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Mobile top bar — minimal, just logo */}
      <div className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-surface-200 bg-white px-4 lg:hidden">
        <img src="/visic-logo.png" alt="Visic" className="h-30 w-30 object-contain" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Mobile close button */}
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-3 -right-10 z-50 lg:hidden flex items-center justify-center h-8 w-8 bg-white rounded-full shadow-lg text-surface-600"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      <main className={`${collapsed ? "lg:pl-[72px]" : "lg:pl-64"} min-h-screen transition-all duration-300`}>
        {children}
      </main>
    </div>
  );
}
