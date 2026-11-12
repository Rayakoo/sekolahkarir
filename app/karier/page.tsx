import Link from "next/link";

import { SiteHeader } from "@/app/components/site-header";
import { JobsExplorer } from "@/app/components/jobs-explorer";
import { ArrowRight, Check } from "@/app/components/icons";
import { getOpenJobs } from "@/lib/jobs";

export const instant = false;

export default async function KarierPage() {
  const jobs = await getOpenJobs();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-brand-100 bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-sm font-medium text-brand-800">
                  <span
                    className="size-2 rounded-full bg-brand-500"
                    aria-hidden="true"
                  />
                  {jobs.length} posisi terbuka
                </p>
                <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-brand-950 sm:text-5xl">
                  Temukan peran yang membuat kariermu berarti.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  Jelajahi posisi terbuka di SekolahKarir. Setiap lowongan punya
                  tahapan seleksi yang jelas, jadi kamu selalu tahu sedang berada
                  di mana.
                </p>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
                {["Proses transparan", "Remote-friendly", "Feedback jelas"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <span className="grid size-5 place-items-center rounded-full bg-brand-100 text-brand-700">
                        <Check className="size-3" />
                      </span>
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <JobsExplorer jobs={jobs} />

            <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand-900 px-6 py-7 text-white sm:flex-row sm:items-center sm:px-8">
              <div>
                <h2 className="text-lg font-semibold">
                  Tidak menemukan posisi yang pas?
                </h2>
                <p className="mt-1 text-sm text-brand-100/80">
                  Kirim CV spontan dan ceritakan peran yang ingin kamu bangun.
                </p>
              </div>
              <Link
                href="mailto:karir@sekolahkarir.id?subject=CV%20Spontan%20%E2%80%94%20SekolahKarir"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
              >
                Kirim CV spontan
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
