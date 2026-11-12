import Link from "next/link";

import { ArrowRight, Clock, MapPin } from "./icons";
import type { Job } from "@/lib/types";

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-brand-100 bg-white p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/40 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {job.team}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold tracking-tight text-brand-950">
        <Link href={`/karier/${job.slug}`} className="hover:text-brand-700">
          {job.title}
        </Link>
      </h3>

      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4 shrink-0" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4 shrink-0" />
          {job.employment_type}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{job.summary}</p>

      <div className="mt-auto pt-5">
        <Link
          href={`/karier/${job.slug}`}
          className="flex w-full items-center justify-between gap-1.5 border-t border-brand-100 pt-4 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
        >
          Lihat detail
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
