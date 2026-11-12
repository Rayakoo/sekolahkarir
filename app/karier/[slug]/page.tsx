import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/app/components/site-header";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  MapPin,
} from "@/app/components/icons";
import { formatDate } from "@/lib/format";
import { getJobBySlug } from "@/lib/jobs";

export const instant = false;

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1 bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <Link
            href="/karier"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="size-4" />
            Semua lowongan
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              <div className="rounded-3xl border border-brand-100 bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {job.team}
                  </span>
                  <span className="rounded-full border border-brand-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {job.employment_type}
                  </span>
                </div>

                <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
                  {job.title}
                </h1>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-brand-600" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4 text-brand-600" />
                    {job.employment_type}
                  </span>
                  {job.deadline ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-4 text-brand-600" />
                      Lamar sebelum {formatDate(job.deadline)}
                    </span>
                  ) : null}
                </div>

                <p className="mt-6 text-base leading-7 text-slate-600">
                  {job.summary}
                </p>

                {job.description ? (
                  <div className="mt-8 border-t border-brand-100 pt-8">
                    <h2 className="text-lg font-semibold text-brand-950">
                      Tentang peran ini
                    </h2>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                      {job.description}
                    </p>
                  </div>
                ) : null}

                {job.responsibilities.length > 0 ? (
                  <div className="mt-8 border-t border-brand-100 pt-8">
                    <h2 className="text-lg font-semibold text-brand-950">
                      Yang akan kamu lakukan
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {job.responsibilities.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-sm leading-6 text-slate-600"
                        >
                          <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                            <Check className="size-3" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {job.requirements.length > 0 ? (
                  <div className="mt-8 border-t border-brand-100 pt-8">
                    <h2 className="text-lg font-semibold text-brand-950">
                      Yang kami cari
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {job.requirements.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-sm leading-6 text-slate-600"
                        >
                          <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                            <Check className="size-3" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {job.benefits.length > 0 ? (
                  <div className="mt-8 border-t border-brand-100 pt-8">
                    <h2 className="text-lg font-semibold text-brand-950">
                      Yang kamu dapatkan
                    </h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {job.benefits.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-900"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-brand-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Ringkasan
                </p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Lokasi</dt>
                    <dd className="text-right font-semibold text-brand-950">
                      {job.location}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Tipe kerja</dt>
                    <dd className="text-right font-semibold text-brand-950">
                      {job.employment_type}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Rentang gaji</dt>
                    <dd className="text-right font-semibold text-brand-950">
                      {job.salary_range ?? "Dibahas saat interview"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Batas lamaran</dt>
                    <dd className="text-right font-semibold text-brand-950">
                      {formatDate(job.deadline) ?? "Terbuka"}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/lamar/${job.slug}`}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Lamar posisi ini
                  <ArrowRight className="size-4" />
                </Link>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Kamu akan diminta masuk dengan Google.
                </p>
              </div>

              <div className="rounded-2xl border border-brand-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Tahapan seleksi
                </p>
                <ol className="mt-4 space-y-0">
                  {job.job_stages.map((stage, index) => (
                    <li key={stage.id} className="relative flex gap-3 pb-5 last:pb-0">
                      {index < job.job_stages.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className="absolute left-[13px] top-7 h-[calc(100%-1rem)] w-px bg-brand-100"
                        />
                      ) : null}
                      <span className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full border border-brand-200 bg-white text-xs font-bold text-brand-700">
                        {index + 1}
                      </span>
                      <div className="pt-0.5">
                        <p className="text-sm font-semibold text-brand-950">
                          {stage.title}
                        </p>
                        {stage.description ? (
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {stage.description}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
