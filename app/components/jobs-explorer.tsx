"use client";

import { useMemo, useState } from "react";

import { Search } from "@/app/components/icons";
import { JobCard } from "@/app/components/job-card";
import type { Job } from "@/lib/types";

export function JobsExplorer({ jobs }: { jobs: Job[] }) {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState("Semua tim");
  const [location, setLocation] = useState("Semua lokasi");

  const teams = useMemo(
    () => ["Semua tim", ...Array.from(new Set(jobs.map((job) => job.team)))],
    [jobs],
  );
  const locations = useMemo(
    () => [
      "Semua lokasi",
      ...Array.from(new Set(jobs.map((job) => job.location))),
    ],
    [jobs],
  );

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search) ||
        job.team.toLowerCase().includes(search) ||
        job.summary.toLowerCase().includes(search);
      const matchesTeam = team === "Semua tim" || job.team === team;
      const matchesLocation =
        location === "Semua lokasi" || job.location === location;

      return matchesSearch && matchesTeam && matchesLocation;
    });
  }, [jobs, query, team, location]);

  const hasFilters =
    query !== "" || team !== "Semua tim" || location !== "Semua lokasi";

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-brand-950">
          Belum ada lowongan aktif
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Tim rekrutmen sedang menyiapkan posisi baru. Kirim CV spontan agar kami
          bisa menghubungimu ketika ada peran yang cocok.
        </p>
        <a
          href="mailto:karir@sekolahkarir.id?subject=CV%20Spontan%20%E2%80%94%20SekolahKarir"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Kirim CV spontan
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-brand-100 bg-white p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Cari lowongan</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari posisi, tim, atau kata kunci..."
              className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm text-brand-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400"
            />
          </label>

          <label className="block">
            <span className="sr-only">Filter tim</span>
            <select
              value={team}
              onChange={(event) => setTeam(event.target.value)}
              className="h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-brand-400 lg:w-44"
            >
              {teams.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Filter lokasi</span>
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-brand-400 lg:w-48"
            >
              {locations.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-sm text-slate-500" aria-live="polite">
            Menampilkan {filtered.length} dari {jobs.length} posisi
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setTeam("Semua tim");
                setLocation("Semua lokasi");
              }}
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Reset filter
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <li key={job.id} className="min-w-0">
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-14 text-center">
          <h3 className="text-lg font-semibold text-brand-950">
            Belum ada posisi yang cocok
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Coba ubah kata kunci atau filter. Kamu juga bisa mengirim CV spontan
            ke tim rekrutmen kami.
          </p>
          <a
            href="mailto:karir@sekolahkarir.id?subject=CV%20Spontan%20%E2%80%94%20SekolahKarir"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Kirim CV spontan
          </a>
        </div>
      )}
    </div>
  );
}
