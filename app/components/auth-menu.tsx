"use client";

import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function AuthMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth
      .getUser()
      .then(({ data }: { data: { user: User | null } }) => {
        setUser(data.user);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <span
        className="hidden h-9 w-20 animate-pulse rounded-full bg-brand-50 sm:block"
        aria-hidden="true"
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/masuk"
        className="rounded-full px-2.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-brand-700 sm:px-3"
      >
        Masuk
      </Link>
    );
  }

  const name: string =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    "Kandidat";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-50"
    >
      <span className="grid size-7 place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
        {initials || "SK"}
      </span>
      <span className="hidden sm:inline">Dashboard</span>
    </Link>
  );
}
