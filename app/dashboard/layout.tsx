import Link from "next/link";

import { SiteHeader } from "@/app/components/site-header";
import { LogOut } from "@/app/components/icons";
import { requireUser } from "@/lib/supabase/auth";

import { DashboardNav } from "./dashboard-nav";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, supabase } = await requireUser("/dashboard");
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const name =
    profile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? "Kandidat";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <SiteHeader />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {initials || "SK"}
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-950">{name}</p>
              <p className="text-xs text-slate-500">
                {profile?.email ?? user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DashboardNav />
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:border-brand-200 hover:text-brand-700"
                aria-label="Keluar dari akun"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <Link
            href="/karier"
            className="font-medium text-brand-700 hover:text-brand-800"
          >
            Jelajahi lowongan
          </Link>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">
            Semua progres lamaran diperbarui oleh tim rekrutmen.
          </span>
        </div>

        <main className="mt-8">{children}</main>
      </div>
    </div>
  );
}
