import Link from "next/link";

import { AuthMenu } from "./auth-menu";
import { ArrowRight } from "./icons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-lg"
          aria-label="SekolahKarir — kembali ke beranda"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-sm font-bold tracking-tight text-white">
            SK
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-base font-bold tracking-tight text-brand-950">
              SekolahKarir
            </span>
            <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:block">
              Karier &amp; Pendidikan
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex"
        >
          <Link href="/karier" className="transition-colors hover:text-brand-700">
            Lowongan
          </Link>
          <Link
            href="/#kenapa-kami"
            className="transition-colors hover:text-brand-700"
          >
            Kenapa kami
          </Link>
          <Link href="/#daftar" className="transition-colors hover:text-brand-700">
            Cara melamar
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <AuthMenu />
          <Link
            href="/karier"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:px-5"
          >
            <span className="sm:hidden">Posisi</span>
            <span className="hidden sm:inline">Lihat posisi</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
