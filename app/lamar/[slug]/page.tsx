import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SiteHeader } from "@/app/components/site-header";
import { ArrowLeft, MapPin } from "@/app/components/icons";
import { requireUser } from "@/lib/supabase/auth";
import { getJobBySlug } from "@/lib/jobs";

import { ApplyForm } from "./apply-form";

export const instant = false;

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { user, supabase } = await requireUser(`/lamar/${slug}`);
  const job = await getJobBySlug(slug);

  if (!job) notFound();

  const { data: existingApplication } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", job.id)
    .maybeSingle();

  if (existingApplication) {
    redirect(`/dashboard/lamaran/${existingApplication.id}`);
  }

  const { data: cvs } = await supabase
    .from("candidate_cvs")
    .select("id, title, source")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1 bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <Link
            href={`/karier/${job.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="size-4" />
            Kembali ke detail lowongan
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Form lamaran
                </p>
                <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
                  Lamar sebagai {job.title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Masuk sebagai {user.email}. Pilih CV yang ingin dikirim dan
                  tambahkan catatan singkat untuk tim rekrutmen.
                </p>
              </div>

              <ApplyForm
                jobId={job.id}
                jobTitle={job.title}
                cvs={(cvs ?? []) as { id: string; title: string; source: "upload" | "builder" }[]}
              />
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-brand-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Posisi yang dilamar
                </p>
                <h2 className="mt-3 text-xl font-bold tracking-tight text-brand-950">
                  {job.title}
                </h2>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="size-4" />
                  {job.location}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {job.summary}
                </p>

                <div className="mt-6 border-t border-brand-100 pt-5">
                  <p className="text-sm font-semibold text-brand-950">
                    Tahapan seleksi
                  </p>
                  <ol className="mt-3 space-y-2.5">
                    {job.job_stages.map((stage) => (
                      <li
                        key={stage.id}
                        className="flex items-start gap-2.5 text-sm text-slate-600"
                      >
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-400" />
                        {stage.title}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
