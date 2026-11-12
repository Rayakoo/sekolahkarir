import Link from "next/link";

import { ArrowRight, Check, Clock, FileText, MapPin } from "@/app/components/icons";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/supabase/auth";
import type { ApplicationStage } from "@/lib/types";

export const instant = false;

type ApplicationRow = {
  id: string;
  status: "in_progress" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  cv_title: string;
  jobs: {
    id: string;
    slug: string;
    title: string;
    team: string;
    location: string;
  } | null;
  application_stages: ApplicationStage[] | null;
};

const statusLabel: Record<ApplicationRow["status"], string> = {
  in_progress: "Sedang diproses",
  accepted: "Diterima",
  rejected: "Belum lolos",
  withdrawn: "Dibatalkan",
};

export default async function DashboardPage() {
  const { user, supabase } = await requireUser("/dashboard");

  const [{ data: profile }, { data: applications }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("applications")
      .select(
        "id, status, created_at, cv_title, jobs(id, slug, title, team, location), application_stages(id, title, description, sort_order, status, scheduled_start, scheduled_end, note, completed_at)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const rows = (applications ?? []) as unknown as ApplicationRow[];
  const name =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "Kandidat";
  const firstName = name.split(" ")[0];

  const activeCount = rows.filter((row) => row.status === "in_progress").length;
  const finishedCount = rows.filter(
    (row) => row.status === "accepted" || row.status === "rejected",
  ).length;

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Dashboard kandidat
        </p>
        <h1 className="mt-2 text-balance text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
          Halo, {firstName}. Ini progres kariermu.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Pantau lamaran yang sedang berjalan dan lihat tahap berikutnya. Timeline
          setiap lowongan bisa berbeda, tergantung proses yang ditetapkan tim
          rekrutmen.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Total lamaran</p>
          <p className="mt-2 text-2xl font-bold text-brand-950">{rows.length}</p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Sedang diproses</p>
          <p className="mt-2 text-2xl font-bold text-brand-600">
            {activeCount}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Sudah ada keputusan
          </p>
          <p className="mt-2 text-2xl font-bold text-brand-950">
            {finishedCount}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-white px-6 py-16 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <FileText className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-brand-950">
            Belum ada lamaran
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Temukan posisi yang cocok, siapkan CV, lalu kirim lamaran pertamamu.
          </p>
          <Link
            href="/karier"
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Jelajahi lowongan
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((application) => {
            const stages = [...(application.application_stages ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order,
            );
            const currentStage = stages.find(
              (stage) => stage.status === "current",
            );
            const completed = stages.filter(
              (stage) => stage.status === "completed",
            ).length;
            const progress =
              stages.length > 0
                ? Math.round((completed / stages.length) * 100)
                : 0;
            const job = application.jobs;

            return (
              <li
                key={application.id}
                className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                        {job?.team ?? "SekolahKarir"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          application.status === "accepted"
                            ? "bg-emerald-50 text-emerald-700"
                            : application.status === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-brand-50 text-brand-700"
                        }`}
                      >
                        {statusLabel[application.status]}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-bold tracking-tight text-brand-950">
                      {job?.title ?? "Lowongan SekolahKarir"}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                      {job?.location ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          {job.location}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        Dilamar {formatDate(application.created_at)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/lamaran/${application.id}`}
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
                  >
                    Lihat timeline
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

                <div className="mt-5 rounded-xl bg-brand-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-brand-950">
                      {currentStage
                        ? `Tahap saat ini: ${currentStage.title}`
                        : application.status === "accepted"
                          ? "Selamat, lamaranmu diterima!"
                          : "Menunggu keputusan akhir"}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {completed} dari {stages.length} tahap selesai
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.max(progress, 4)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {stages.map((stage) => (
                      <span
                        key={stage.id}
                        className={`inline-flex items-center gap-1 text-xs ${
                          stage.status === "completed"
                            ? "font-medium text-emerald-700"
                            : stage.status === "current"
                              ? "font-semibold text-brand-700"
                              : "text-slate-400"
                        }`}
                      >
                        {stage.status === "completed" ? (
                          <Check className="size-3" />
                        ) : (
                          <span
                            className={`size-1.5 rounded-full ${
                              stage.status === "current"
                                ? "bg-brand-500"
                                : "bg-slate-300"
                            }`}
                          />
                        )}
                        {stage.title}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
