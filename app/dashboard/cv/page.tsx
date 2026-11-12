import Link from "next/link";

import { FileText, Plus, Printer, Upload } from "@/app/components/icons";
import { formatDateTime } from "@/lib/format";
import { requireUser } from "@/lib/supabase/auth";

export const instant = false;

export default async function CvListPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [params, { user, supabase }] = await Promise.all([
    searchParams,
    requireUser("/dashboard/cv"),
  ]);

  const { data: cvs } = await supabase
    .from("candidate_cvs")
    .select("id, title, source, file_url, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = cvs ?? [];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            CV saya
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
            Satu CV, banyak peluang.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Buat CV langsung di portal atau unggah PDF. CV yang tersimpan bisa
            dipilih saat melamar.
          </p>
        </div>

        <Link
          href="/dashboard/cv/baru"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <Plus className="size-4" />
          Buat CV baru
        </Link>
      </div>

      {params.saved ? (
        <p className="mt-6 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          CV berhasil disimpan.
        </p>
      ) : null}

      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-brand-200 bg-white px-6 py-16 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <FileText className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-brand-950">
            Belum ada CV tersimpan
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Mulai dari builder CV sederhana, atau unggah PDF saat mengirim
            lamaran.
          </p>
          <Link
            href="/dashboard/cv/baru"
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Plus className="size-4" />
            Buat CV pertama
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {rows.map((cv) => {
            const isBuilder = cv.source === "builder";
            const fileUrl = cv.file_url;

            return (
              <li
                key={cv.id}
                className="flex flex-col rounded-2xl border border-brand-100 bg-white p-5"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    {isBuilder ? (
                      <FileText className="size-5" />
                    ) : (
                      <Upload className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-brand-950">
                      {cv.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {isBuilder
                        ? "Dibuat di portal"
                        : "File PDF yang diunggah"}
                      {cv.updated_at
                        ? ` · ${formatDateTime(cv.updated_at)}`
                        : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                    {isBuilder ? "Builder" : "PDF"}
                  </span>
                </div>

                <div className="mt-auto flex flex-wrap gap-3 border-t border-brand-100 pt-4 text-sm font-semibold">
                  {isBuilder ? (
                    <Link
                      href={`/dashboard/cv/${cv.id}`}
                      className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800"
                    >
                      <Printer className="size-4" />
                      Edit & cetak
                    </Link>
                  ) : fileUrl ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800"
                    >
                      <FileText className="size-4" />
                      Lihat PDF
                    </a>
                  ) : (
                    <span className="text-slate-400">File tidak tersedia</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50/60 p-5 text-sm leading-6 text-slate-600">
        <p className="font-semibold text-brand-950">Ingin memakai CV lama?</p>
        <p className="mt-1">
          Saat melamar, kamu bisa mengunggah file PDF baru. File akan tersimpan
          otomatis di halaman ini.
        </p>
      </div>
    </div>
  );
}
