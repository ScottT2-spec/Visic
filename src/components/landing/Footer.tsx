"use client";
import { ShoppingBag } from "@/components/icons/FilledIcons";

import Link from "next/link";

const footerLinks = {
  Product: [
    { name: "Ecommerce Store", href: "#" },
    { name: "Landing Pages", href: "#" },
    { name: "Website Builder", href: "#" },
    { name: "AI Assistant", href: "#" },
    { name: "Templates", href: "#templates" },
    { name: "Plugins", href: "#plugins" },
  ],
  Payments: [
    { name: "Monnify", href: "#" },
    { name: "Paystack", href: "#" },
    { name: "Flutterwave", href: "#" },
    { name: "Bank Transfer", href: "#" },
    { name: "Mobile Money", href: "#" },
    { name: "USSD", href: "#" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Partners", href: "#" },
  ],
  Support: [
    { name: "Help Center", href: "#" },
    { name: "Documentation", href: "#" },
    { name: "Community", href: "#" },
    { name: "Status", href: "#" },
    { name: "API", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface-950 text-surface-400">
      <div className="container-max section-padding pb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Afro<span className="text-brand-400">Store</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              The simplest, fastest, most conversion-focused ecommerce platform for African businesses. From idea to selling in 5 minutes.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-500 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-600">
            &copy; {new Date().getFullYear()} AfroStore. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-xs text-surface-600 hover:text-surface-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs text-surface-600 hover:text-surface-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-xs text-surface-600 hover:text-surface-400 transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
