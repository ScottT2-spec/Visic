"use client";
import { Shield } from "@/components/icons/FilledIcons";

export default function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-surface-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-100">
          <Shield className="h-4 w-4 text-accent-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-surface-900 font-display">{title}</h1>
          {subtitle && <p className="text-xs text-surface-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
