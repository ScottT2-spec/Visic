"use client";
import { ArrowRight, ChevronDown, X } from "lucide-react";
import { Menu, ShoppingBag, Sparkles } from "@/components/icons/FilledIcons";

import { useState } from "react";
import Link from "next/link";

const navigation = [
  {
    name: "Products",
    href: "#products",
    children: [
      { name: "Ecommerce Store", href: "#ecommerce" },
      { name: "Landing Pages", href: "#landing-pages" },
      { name: "Website Builder", href: "#website-builder" },
      { name: "AI Assistant", href: "#ai-assistant" },
    ],
  },
  { name: "Templates", href: "#templates" },
  { name: "Pricing", href: "#pricing" },
  { name: "Plugins", href: "#plugins" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="container-max">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold tracking-tight">Afrostore</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium text-surface-600 transition-colors hover:text-surface-900 hover:bg-surface-100"
                >
                  {item.name}
                  {item.children && (
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  )}
                </Link>
                {item.children && (
                  <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="w-56 rounded-xl border border-surface-200 bg-white p-2 shadow-xl">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="flex items-center rounded-lg px-3 py-2.5 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="btn-ghost text-sm py-2 px-4"
            >
              Log in
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm py-2.5 px-5">
              <Sparkles className="h-4 w-4" />
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-lg p-2 text-surface-600 hover:bg-surface-100"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-3 space-y-2">
              <Link
                href="/auth/login"
                className="btn-secondary w-full text-sm py-2.5"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary w-full text-sm py-2.5"
              >
                <Sparkles className="h-4 w-4" />
                Start Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
