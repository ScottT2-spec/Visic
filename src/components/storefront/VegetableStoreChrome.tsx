"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
};

type SocialLink = {
  platform: string;
  url: string;
};

type HeaderProps = {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  navItems: NavItem[];
  reservationHref: string;
};

type FooterProps = {
  storeName: string;
  storeSlug: string;
  logo?: string | null;
  description?: string | null;
  navItems: NavItem[];
  socialLinks?: SocialLink[];
};

function SocialIcon({ platform }: { platform: string }) {
  const key = platform.toLowerCase();
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d6c8b4] text-[#38543d] transition-colors group-hover:border-[#7aa06a] group-hover:text-[#2d4a2f]">
      {key === "facebook" ? "f" : key === "instagram" ? "◎" : key === "twitter" ? "x" : key === "tiktok" ? "♪" : "•"}
    </span>
  );
}

export function VegetableHeader({ storeName, storeSlug, logo, navItems, reservationHref }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const brandInitial = useMemo(() => storeName.trim().charAt(0).toUpperCase() || "V", [storeName]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9d2c5] bg-[#fffdf7]/95 backdrop-blur-xl text-[#243226]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav className="hidden items-center gap-6 text-[13px] font-semibold uppercase tracking-[0.2em] lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-[#6b8d49]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d9d2c5] text-[#243226] lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href={`/store/${storeSlug}`} className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3 text-center">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#d9d2c5] bg-[#f3efe6]">
            {logo ? <img src={logo} alt={storeName} className="h-full w-full object-cover" /> : <span className="font-serif text-lg font-bold text-[#35533a]">{brandInitial}</span>}
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-serif text-lg font-semibold tracking-[0.22em] text-[#243226]">{storeName}</span>
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#7f8b73]">Seasonal Dining</span>
          </span>
        </Link>

        <Link
          href={reservationHref}
          className="inline-flex items-center rounded-full border border-[#243226] bg-[#243226] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#6b8d49] hover:border-[#6b8d49]"
        >
          Make Reservation
        </Link>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#e3dccf] bg-[#fffdf7] px-4 pb-4 pt-3 lg:hidden">
          <nav className="grid gap-2 text-sm font-semibold uppercase tracking-[0.18em]">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl border border-[#e7e0d3] px-4 py-3 transition-colors hover:border-[#c9d5ba] hover:bg-[#f5f8ef]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export function VegetableFooter({ storeName, storeSlug, logo, description, navItems, socialLinks = [] }: FooterProps) {
  const footerNav = navItems.filter((item) => ["Home", "Menu", "About", "Contact"].includes(item.label));

  return (
    <footer className="border-t border-[#ddd5c8] bg-[#f8f3ea] text-[#243226]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_0.9fr_1fr] lg:px-8">
        <div>
          <Link href={`/store/${storeSlug}`} className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#d6cdbf] bg-white">
              {logo ? <img src={logo} alt={storeName} className="h-full w-full object-cover" /> : <span className="font-serif text-lg font-bold text-[#35533a]">{storeName.charAt(0)}</span>}
            </span>
            <span>
              <span className="block font-serif text-2xl tracking-[0.18em]">{storeName}</span>
              <span className="block text-[10px] uppercase tracking-[0.35em] text-[#7d866f]">Fresh seasonal kitchen</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#5d6658]">
            {description || "Seasonal vegetables, elegant plates, and warm hospitality served with a calm, modern restaurant aesthetic."}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7a846f]">Navigation</h3>
          <div className="mt-5 grid gap-3 text-sm font-medium">
            {footerNav.map((item) => (
              <Link key={item.label} href={item.href} className="transition-colors hover:text-[#6b8d49]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7a846f]">Follow</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            {socialLinks.length > 0 ? socialLinks.map((item) => (
              <a key={`${item.platform}-${item.url}`} href={item.url} target="_blank" rel="noreferrer" className="group">
                <SocialIcon platform={item.platform} />
              </a>
            )) : (
              <>
                <a href="#" className="group"><SocialIcon platform="facebook" /></a>
                <a href="#" className="group"><SocialIcon platform="instagram" /></a>
                <a href="#" className="group"><SocialIcon platform="twitter" /></a>
              </>
            )}
          </div>
          <p className="mt-5 text-sm leading-7 text-[#5d6658]">
            {storeName} • a fresh, calm restaurant template for seasonal menus, chef notes, and reservations.
          </p>
        </div>
      </div>
      <div className="border-t border-[#ddd5c8] px-4 py-4 text-center text-xs uppercase tracking-[0.25em] text-[#7c8570] sm:px-6 lg:px-8">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
