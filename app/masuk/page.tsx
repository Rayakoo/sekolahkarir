import Link from "next/link";

import { SiteHeader } from "@/app/components/site-header";
import { ArrowLeft, Check } from "@/app/components/icons";

import { GoogleSignInButton } from "./google-sign-in-button";

export const instant = false;

function safeNextPath(value: string | undefined) {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden bg-brand-900 p-10 text-white lg:block">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full border border-white/10"
            />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                  Portal kandidat
                </p>
                <h1 className="mt-4 text-balance text-3xl font-bold leading-tight">
                  Satu tempat untuk melamar dan memantau kariermu.
                </h1>
                <p className="mt-4 max-w-sm text-sm leading-6 text-brand-100/80">
                  Masuk dengan akun Google untuk menyimpan CV, mengirim lamaran,
                  dan melihat progres setiap tahap seleksi.
                </p>
              </div>

              <ul className="mt-12 space-y-4 text-sm text-brand-100/90">
                {[
                  "Bangun CV langsung di dalam portal",
                  "Lamar dengan CV atau file PDF",
                  "Pantau timeline seleksi secara real-time",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="grid size-6 place-items-center rounded-full bg-white/10 text-brand-200">
                      <Check className="size-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <Link
              href="/karier"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-700"
            >
              <ArrowLeft className="size-4" />
              Kembali ke lowongan
            </Link>

            <h2 className="mt-8 text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
              Masuk ke SekolahKarir
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Gunakan akun Google aktif. Kami hanya memakai nama dan email untuk
              keperluan lamaran.
            </p>

            {params.error ? (
              <p
                className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                Login gagal. Pastikan konfigurasi Google OAuth sudah benar, lalu
                coba lagi.
              </p>
            ) : null}

            <div className="mt-8">
              <GoogleSignInButton next={next} />
            </div>

            <p className="mt-6 text-xs leading-5 text-slate-500">
              Dengan masuk, kamu menyetujui data lamaran disimpan untuk proses
              rekrutmen SekolahKarir.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
