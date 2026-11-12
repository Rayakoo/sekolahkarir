"use client";

import { useActionState, useRef, useState } from "react";

import { FileText, Upload } from "@/app/components/icons";
import { formatDateTime } from "@/lib/format";
import { uploadFileToStorage } from "@/services/file-upload";

import { submitStage, type StageSubmissionState } from "./actions";

type InitialSubmission = {
  file_url: string | null;
  link_url: string | null;
  note: string | null;
  submitted_at: string;
};

const initialState: StageSubmissionState = null;
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "image/png",
  "image/jpeg",
];

export function StageSubmissionForm({
  stageId,
  initialSubmission,
}: {
  stageId: string;
  initialSubmission?: InitialSubmission | null;
}) {
  const [fileUrl, setFileUrl] = useState(initialSubmission?.file_url ?? "");
  const [fileName, setFileName] = useState(
    initialSubmission?.file_url
      ? (initialSubmission.file_url.split("/").pop() ?? "File jawaban")
      : "",
  );
  const [linkUrl, setLinkUrl] = useState(initialSubmission?.link_url ?? "");
  const [note, setNote] = useState(initialSubmission?.note ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(
    submitStage,
    initialState,
  );

  const hasAnswer = Boolean(fileUrl || linkUrl.trim());

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploaded = await uploadFileToStorage(file, {
        maxSizeMb: 10,
        allowedTypes: ACCEPTED_TYPES,
        label: "File jawaban",
      });
      setFileUrl(uploaded.url);
      setFileName(uploaded.fileName);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Gagal mengunggah file.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <form
      action={formAction}
      className="mt-4 rounded-xl border border-brand-200 bg-white p-4 sm:p-5"
    >
      <input type="hidden" name="stageId" value={stageId} />
      <input type="hidden" name="fileUrl" value={fileUrl} />

      {initialSubmission ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800">
          Jawaban sudah dikirim{" "}
          {formatDateTime(initialSubmission.submitted_at)}. Kamu masih bisa
          memperbaruinya selama tahap ini berlangsung.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-slate-600">Upload file</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          {fileUrl ? (
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5">
              <FileText className="size-4 shrink-0 text-brand-700" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-xs font-medium text-brand-800 hover:underline"
              >
                {fileName || "Lihat file jawaban"}
              </a>
              <button
                type="button"
                onClick={() => {
                  setFileUrl("");
                  setFileName("");
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Hapus
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-1.5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white px-3 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <span
                  className="size-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700"
                  aria-hidden="true"
                />
              ) : (
                <Upload className="size-4" />
              )}
              {uploading ? "Mengunggah..." : "Pilih file"}
            </button>
          )}

          <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
            PDF, DOC, DOCX, ZIP, PNG, atau JPG. Maksimal 10 MB.
          </p>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-slate-600">
            Atau link jawaban
          </span>
          <input
            type="url"
            name="linkUrl"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="https://drive.google.com/..."
            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-brand-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400"
          />
          <span className="mt-1.5 block text-[11px] leading-5 text-slate-500">
            Gunakan link yang dapat diakses tim rekrutmen.
          </span>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-semibold text-slate-600">
          Catatan tambahan
        </span>
        <textarea
          name="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Opsional. Jelaskan singkat isi jawaban atau kendala yang kamu hadapi."
          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-brand-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400"
        />
      </label>

      {uploadError ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {uploadError}
        </p>
      ) : null}

      {state?.error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-5 text-slate-500">
          File atau link akan disimpan sebagai jawaban tes.
        </p>
        <button
          type="submit"
          disabled={!hasAnswer || pending || uploading}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {pending ? (
            <span
              className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
          ) : null}
          {pending
            ? "Mengirim..."
            : initialSubmission
              ? "Perbarui jawaban"
              : "Kirim jawaban"}
        </button>
      </div>
    </form>
  );
}
