"use client";

import { useActionState } from "react";

import { ArrowRight, ExternalLink } from "@/app/components/icons";

import { enterInterview, type InterviewState } from "./actions";

const initialState: InterviewState = null;

export function InterviewStageActions({
  stageId,
  meetingUrl,
  meetingType,
}: {
  stageId: string;
  meetingUrl: string | null;
  meetingType: "gmeet" | "ai" | "other" | null;
}) {
  const [state, formAction, pending] = useActionState(
    enterInterview,
    initialState,
  );

  const label =
    meetingType === "ai"
      ? "Buka Interview AI"
      : meetingType === "gmeet"
        ? "Buka Google Meet"
        : "Buka Link Interview";

  return (
    <form
      action={formAction}
      onSubmit={() => {
        if (meetingUrl) {
          window.open(meetingUrl, "_blank", "noopener,noreferrer");
        }
      }}
      className="mt-4 rounded-xl border border-brand-200 bg-white p-4"
    >
      <input type="hidden" name="stageId" value={stageId} />

      <p className="text-sm font-semibold text-brand-950">
        Saatnya masuk ke sesi interview
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Buka ruang interview terlebih dahulu, lalu tekan Masuk. Proses interview
        akan ditandai selesai dan timeline lanjut ke tahap berikutnya.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        {meetingUrl ? (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-4 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            <ExternalLink className="size-4" />
            {label}
          </a>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {pending ? (
            <span
              className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
          ) : (
            <ArrowRight className="size-4" />
          )}
          {pending ? "Memproses..." : "Masuk"}
        </button>
      </div>

      {state?.error ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
