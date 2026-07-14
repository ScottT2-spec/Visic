"use client";
import { ArrowRight } from "lucide-react";
import { Book, Mail, MessageCircle, Search, Video } from "@/components/icons/FilledIcons";

import DashboardHeader from "@/components/dashboard/DashboardHeader";

const resources = [
  { icon: Book, title: "Documentation", desc: "Guides for setting up your store", href: "#" },
  { icon: Video, title: "Video Tutorials", desc: "Step-by-step walkthroughs", href: "#" },
  { icon: MessageCircle, title: "Live Chat", desc: "Chat with our support team", href: "#" },
  { icon: Mail, title: "Email Support", desc: "support@afrostore.com", href: "mailto:support@afrostore.com" },
];

export default function SupportPage() {
  return (
    <>
      <DashboardHeader title="Help & Support" subtitle="Get help with your store" />
      <div className="p-6 space-y-6 max-w-3xl">
        <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-3">
          <Search className="h-5 w-5 text-surface-400" />
          <input type="text" placeholder="Search help articles..." className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resources.map((r) => {
            const Icon = r.icon;
            return (
              <a key={r.title} href={r.href} className="rounded-2xl border border-surface-200 bg-white p-6 hover:shadow-md transition-shadow group">
                <Icon className="h-8 w-8 text-brand-600 mb-3" />
                <h3 className="text-base font-bold text-surface-900 mb-1 group-hover:text-brand-600 transition-colors">{r.title}</h3>
                <p className="text-xs text-surface-500">{r.desc}</p>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}
