"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Dashboard, FileText } from "@/app/components/icons";

const links = [
  { href: "/dashboard", label: "Ringkasan", icon: Dashboard },
  { href: "/dashboard/cv", label: "CV saya", icon: FileText },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi dashboard"
      className="flex gap-1 overflow-x-auto rounded-full border border-brand-100 bg-white p-1"
    >
      {links.map((link) => {
        const active =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
