"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import {
  Check,
  ExternalLink,
  FileText,
  Plus,
  Upload,
} from "@/app/components/icons";
import { uploadCv } from "@/services/cv-upload";

import { applyToJob, type ApplyState } from "./actions";

type CvOption = {
  id: string;
  title: string;
  source: "upload" | "builder";
};

const initialState: ApplyState = null;

export function ApplyForm({
  jobId,
  jobTitle,
  cvs: initialCvs,
}: {
  jobId: string;
  jobTitle: string;
  cvs: CvOption[];
}) {
  const [cvs, setCvs] = useState<CvOption[]>(initialCvs);
  const [selectedCvId, setSelectedCvId] = useState(initialCvs[0]?.id ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(applyToJob, initialState);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const cv = await uploadCv(file);
      setCvs((current) => [
        { id: cv.id, title: cv.title, source: "upload" },
        ...current,
      ]);
      setSelectedCvId(cv.id);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Gagal mengunggah CV.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="cvId" value={selectedCvId} />

      <section className="rounded-2xl border border-brand-100 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-brand-950">Pilih CV</h2>
            <p className="mt-1 text-sm text-slate-500">
              Gunakan CV yang sudah dibuat di portal, atau unggah PDF terbaru.
            </p>
          </div>
          <Link
            href="/dashboard/cv/baru"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <Plus className="size-4" />
            Buat CV baru
          </Link>
        </div>

        {cvs.length > 0 ? (
          <div className="mt-5 space-y-3">
            {cvs.map((cv) => (
              <label
                key={cv.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                  selectedCvId === cv.id
                    ? "border-brand-400 bg-brand-50"
                    : "border-slate-200 bg-white hover:border-brand-200"
                }`}
              >
                <input
                  type="radio"
                  name="cvChoice"
                  value={cv.id}
                  checked={selectedCvId === cv.id}
                  onChange={() => setSelectedCvId(cv.id)}
                  className="size-4 accent-brand-600"
                />
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                  <FileText className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-brand-950">
                    {cv.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {cv.source === "builder"
                      ? "Dibuat di portal SekolahKarir"
                      : "File PDF yang diunggah"}
                  </span>
                </span>
                {selectedCvId === cv.id ? (
                  <span className="grid size-6 place-items-center rounded-full bg-brand-600 text-white">
                    <Check className="size-3.5" />
                  </span>
                ) : null}
              </label>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-brand-950">
              Kamu belum punya CV tersimpan
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Unggah file PDF di bawah, atau buat CV langsung di portal.
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 border-t border-brand-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-950">
              Unggah CV baru
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Format PDF, maksimal 5 MB. File diunggah ke storage rekrutmen.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-4 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <span
                className="size-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700"
                aria-hidden="true"
              />
            ) : (
              <Upload className="size-4" />
            )}
            {uploading ? "Mengunggah..." : "Pilih file PDF"}
          </button>
        </div>

        {uploadError ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {uploadError}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6">
        <label htmlFor="coverLetter" className="block text-lg font-semibold text-brand-950">
          Kenapa kamu cocok untuk peran ini?
        </label>
        <p className="mt-1 text-sm text-slate-500">
          Opsional, tetapi sangat membantu tim rekrutmen. Maksimal 3.000 karakter.
        </p>
        <textarea
          id="coverLetter"
          name="coverLetter"
          rows={5}
          maxLength={3000}
          placeholder={`Ceritakan pengalaman atau motivasimu untuk posisi ${jobTitle}...`}
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-brand-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400"
        />
      </section>

      {state?.error ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs leading-5 text-slate-500">
          Dengan mengirim lamaran, data dan CV kamu akan disimpan untuk proses
          rekrutmen.
        </p>
        <button
          type="submit"
          disabled={!selectedCvId || pending || uploading}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {pending ? (
            <span
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
          ) : (
            <ExternalLink className="size-4" />
          )}
          {pending ? "Mengirim..." : "Kirim lamaran"}
        </button>
      </div>
    </form>
  );
}
