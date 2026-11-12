import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
} from "@/app/components/icons";
import { formatDate, formatSchedule } from "@/lib/format";
import { requireUser } from "@/lib/supabase/auth";
import type { ApplicationStage } from "@/lib/types";

import { InterviewStageActions } from "./interview-stage-actions";
import { StageSubmissionForm } from "./stage-submission-form";

export const instant = false;

type ApplicationDetail = {
  id: string;
  status: "in_progress" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  cv_title: string;
  cv_source: "upload" | "builder";
  jobs: {
    slug: string;
    title: string;
    team: string;
    location: string;
  } | null;
  application_stages: ApplicationStage[] | null;
};

const overallStatus = {
  in_progress: {
    label: "Sedang diproses",
    className: "bg-brand-50 text-brand-700",
  },
  accepted: {
    label: "Diterima",
    className: "bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Belum lolos",
    className: "bg-red-50 text-red-700",
  },
  withdrawn: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-600",
  },
};

const stageStatus = {
  completed: {
    label: "Selesai",
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-600 text-white",
  },
  current: {
    label: "Saat ini",
    badge: "bg-brand-100 text-brand-700",
    dot: "bg-brand-600 text-white",
  },
  locked: {
    label: "Terkunci",
    badge: "bg-slate-100 text-slate-500",
    dot: "bg-white text-slate-400 border border-slate-300",
  },
  rejected: {
    label: "Tidak lolos",
    badge: "bg-red-50 text-red-700",
    dot: "bg-red-600 text-white",
  },
};

export default async function ApplicationTimelinePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    baru?: string;
    submitted?: string;
    interview?: string;
  }>;
}) {
  const [{ id }, query, { user, supabase }] = await Promise.all([
    params,
    searchParams,
    requireUser("/dashboard"),
  ]);

  const { data } = await supabase
    .from("applications")
    .select(
      "id, status, created_at, cv_title, cv_source, jobs(slug, title, team, location), application_stages(id, title, description, kind, meeting_type, meeting_url, sort_order, status, scheduled_start, scheduled_end, note, completed_at, stage_submissions(id, file_url, link_url, note, submitted_at))",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) notFound();

  const application = data as unknown as ApplicationDetail;
  const stages = [...(application.application_stages ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const job = application.jobs;
  const status = overallStatus[application.status];

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="size-4" />
        Kembali ke dashboard
      </Link>

      {query.baru ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Lamaran berhasil dikirim. Tahap pertama sudah selesai dan tim rekrutmen
          akan meninjau CV-mu.
        </div>
      ) : null}

      {query.submitted ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Jawaban tes berhasil disimpan. Timeline otomatis lanjut ke tahap
          berikutnya.
        </div>
      ) : null}

      {query.interview ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Tahap interview ditandai selesai. Timeline sudah lanjut ke tahap
          berikutnya.
        </div>
      ) : null}

      {application.status === "accepted" ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Selamat! Kamu diterima pada posisi ini. Tim rekrutmen akan menghubungi
          kamu untuk langkah berikutnya.
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-brand-100 bg-white">
        <div className="bg-brand-900 px-6 py-6 text-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-brand-200">
                  <Check className="size-5" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                  Progres lamaran
                </p>
              </div>
              <h1 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
                {job?.title ?? "Lamaran SekolahKarir"}
              </h1>
              <p className="mt-1 text-sm text-brand-100/80">
                {job?.team} · {job?.location}
              </p>
            </div>
            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          </div>
        </div>

        <div className="grid gap-4 border-b border-brand-100 px-6 py-5 sm:grid-cols-3">
          <div className="flex items-start gap-2.5">
            <FileText className="mt-0.5 size-4 shrink-0 text-brand-600" />
            <div>
              <p className="text-xs text-slate-500">CV yang dikirim</p>
              <p className="mt-0.5 text-sm font-semibold text-brand-950">
                {application.cv_title}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 size-4 shrink-0 text-brand-600" />
            <div>
              <p className="text-xs text-slate-500">Tanggal melamar</p>
              <p className="mt-0.5 text-sm font-semibold text-brand-950">
                {formatDate(application.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
            <div>
              <p className="text-xs text-slate-500">Lokasi</p>
              <p className="mt-0.5 text-sm font-semibold text-brand-950">
                {job?.location ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
            Timeline tahapan
          </h2>

          <ol className="mt-5">
            {stages.map((stage, index) => {
              const config = stageStatus[stage.status];
              const schedule = formatSchedule(
                stage.scheduled_start,
                stage.scheduled_end,
              );
              const submission = stage.stage_submissions?.[0] ?? null;
              const isLast = index === stages.length - 1;

              return (
                <li key={stage.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {!isLast ? (
                    <span
                      aria-hidden="true"
                      className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px ${
                        stage.status === "completed"
                          ? "bg-emerald-300"
                          : "bg-slate-200"
                      }`}
                    />
                  ) : null}

                  <span
                    className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${config.dot}`}
                    aria-hidden="true"
                  >
                    {stage.status === "completed" ? (
                      <Check className="size-4" />
                    ) : (
                      <span className="size-2 rounded-full bg-current" />
                    )}
                  </span>

                  <div
                    className={`min-w-0 flex-1 ${
                      stage.status === "current"
                        ? "rounded-xl border border-brand-300 bg-brand-50 p-4 sm:p-5"
                        : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm font-bold sm:text-base ${
                          stage.status === "locked"
                            ? "text-slate-500"
                            : "text-brand-950"
                        }`}
                      >
                        {stage.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.badge}`}
                      >
                        {config.label}
                      </span>
                    </div>

                    {schedule ? (
                      <p className="mt-2 inline-flex items-start gap-1.5 text-xs font-medium text-brand-800">
                        <Calendar className="mt-0.5 size-3.5 shrink-0" />
                        Jadwal: {schedule}
                      </p>
                    ) : null}

                    {stage.note ? (
                      <p
                        className={`mt-2 text-sm leading-6 ${
                          stage.status === "locked"
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        {stage.note}
                      </p>
                    ) : null}

                    {!stage.note && stage.status === "completed" ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Tahap ini sudah selesai.
                        {stage.completed_at
                          ? ` Diselesaikan ${formatDate(stage.completed_at)}.`
                          : ""}
                      </p>
                    ) : null}

                    {!stage.note && stage.status === "current" ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Tim rekrutmen akan memperbarui jadwal dan catatan pada
                        tahap ini.
                      </p>
                    ) : null}

                    {!stage.note && stage.status === "locked" ? (
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {stage.description ??
                          "Terbuka jika kamu lolos tahap sebelumnya."}
                      </p>
                    ) : null}

                    {!stage.note && stage.status === "rejected" ? (
                      <p className="mt-2 text-sm leading-6 text-red-600">
                        Kamu belum lolos pada tahap ini.
                      </p>
                    ) : null}

                    {stage.kind === "test" && stage.status === "current" ? (
                      <StageSubmissionForm
                        stageId={stage.id}
                        initialSubmission={submission}
                      />
                    ) : null}

                    {stage.kind === "interview" &&
                    stage.status === "current" ? (
                      <InterviewStageActions
                        stageId={stage.id}
                        meetingUrl={stage.meeting_url}
                        meetingType={stage.meeting_type}
                      />
                    ) : null}

                    {stage.kind === "announcement" &&
                    stage.status === "current" ? (
                      <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
                        <p className="text-sm font-semibold text-brand-950">
                          Menunggu pengumuman
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Sedang menunggu pengumuman. Semoga Anda mendapatkan
                          hasil yang terbaik.
                        </p>
                      </div>
                    ) : null}

                    {stage.kind === "test" &&
                    stage.status !== "current" &&
                    submission ? (
                      <div className="mt-4 rounded-lg border border-brand-100 bg-white px-4 py-3">
                        <p className="text-xs font-semibold text-brand-950">
                          Jawaban terkirim{" "}
                          {formatDate(submission.submitted_at)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                          {submission.file_url ? (
                            <a
                              href={submission.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800"
                            >
                              <FileText className="size-3.5" />
                              Lihat file
                            </a>
                          ) : null}
                          {submission.link_url ? (
                            <a
                              href={submission.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800"
                            >
                              <ExternalLink className="size-3.5" />
                              Buka link
                            </a>
                          ) : null}
                        </div>
                        {submission.note ? (
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {submission.note}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-2xl border border-brand-100 bg-white px-5 py-4 text-sm sm:flex-row sm:items-center">
        <p className="text-slate-600">
          Ada pertanyaan tentang proses lamaranmu?
        </p>
        <a
          href="mailto:karir@sekolahkarir.id"
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Hubungi tim rekrutmen
        </a>
      </div>
    </div>
  );
}
