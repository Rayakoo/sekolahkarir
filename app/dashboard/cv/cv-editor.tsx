"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  ArrowLeft,
  FileText,
  Plus,
  Printer,
  Trash,
} from "@/app/components/icons";
import { CvPreview } from "@/app/components/cv-preview";
import type { CvData } from "@/lib/cv";

import { saveCv, type SaveCvState } from "./actions";

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-brand-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-brand-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400"
      />
    </label>
  );
}

export function CvEditor({
  cvId,
  initialTitle,
  initialData,
}: {
  cvId?: string;
  initialTitle: string;
  initialData: CvData;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [data, setData] = useState<CvData>(initialData);
  const [skillsText, setSkillsText] = useState(initialData.skills.join(", "));
  const [state, formAction, pending] = useActionState<SaveCvState, FormData>(
    saveCv,
    null,
  );

  const skills = skillsText
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 30);

  const payload: CvData = { ...data, skills };

  function updateField<K extends keyof CvData>(key: K, value: CvData[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={cvId ?? ""} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="data" value={JSON.stringify(payload)} />

      <div className="flex flex-col gap-4 border-b border-brand-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/dashboard/cv"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-700 print:hidden"
          >
            <ArrowLeft className="size-4" />
            Kembali ke CV saya
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
            {cvId ? "Edit CV" : "Buat CV baru"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Data tersimpan di akunmu dan bisa dipakai untuk melamar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-4 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            <Printer className="size-4" />
            Cetak / PDF
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {pending ? (
              <span
                className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
            ) : (
              <FileText className="size-4" />
            )}
            {pending ? "Menyimpan..." : "Simpan CV"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5 print:hidden">
          <section className="rounded-2xl border border-brand-100 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
              Informasi CV
            </h2>
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Nama CV
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={80}
                  placeholder="Contoh: CV Frontend Engineer 2026"
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-brand-950 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Nama lengkap"
                  value={data.fullName}
                  onChange={(value) => updateField("fullName", value)}
                  placeholder="Nama kamu"
                />
                <TextField
                  label="Headline"
                  value={data.headline}
                  onChange={(value) => updateField("headline", value)}
                  placeholder="Frontend Engineer"
                />
                <TextField
                  label="Email"
                  type="email"
                  value={data.email}
                  onChange={(value) => updateField("email", value)}
                  placeholder="nama@email.com"
                />
                <TextField
                  label="Telepon"
                  value={data.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="0812 3456 7890"
                />
                <div className="sm:col-span-2">
                  <TextField
                    label="Lokasi"
                    value={data.location}
                    onChange={(value) => updateField("location", value)}
                    placeholder="Jakarta, Indonesia"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-brand-100 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
              Ringkasan
            </h2>
            <div className="mt-4">
              <TextAreaField
                label="Tentang kamu"
                value={data.summary}
                onChange={(value) => updateField("summary", value)}
                placeholder="Ceritakan pengalaman, kekuatan, dan hal yang kamu cari."
                rows={5}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
                Pengalaman
              </h2>
              <button
                type="button"
                onClick={() =>
                  updateField("experiences", [
                    ...data.experiences,
                    { role: "", company: "", period: "", description: "" },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                <Plus className="size-3.5" />
                Tambah
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {data.experiences.length === 0 ? (
                <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Belum ada pengalaman. Tambahkan pengalaman kerja, magang, atau
                  organisasi.
                </p>
              ) : null}

              {data.experiences.map((experience, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Pengalaman {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          "experiences",
                          data.experiences.filter(
                            (_item, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                      className="text-slate-400 transition-colors hover:text-red-600"
                      aria-label={`Hapus pengalaman ${index + 1}`}
                    >
                      <Trash className="size-4" />
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Posisi"
                      value={experience.role}
                      onChange={(value) =>
                        updateField(
                          "experiences",
                          data.experiences.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, role: value }
                              : item,
                          ),
                        )
                      }
                      placeholder="Frontend Engineer"
                    />
                    <TextField
                      label="Perusahaan"
                      value={experience.company}
                      onChange={(value) =>
                        updateField(
                          "experiences",
                          data.experiences.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, company: value }
                              : item,
                          ),
                        )
                      }
                      placeholder="Nama perusahaan"
                    />
                    <div className="sm:col-span-2">
                      <TextField
                        label="Periode"
                        value={experience.period}
                        onChange={(value) =>
                          updateField(
                            "experiences",
                            data.experiences.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, period: value }
                                : item,
                            ),
                          )
                        }
                        placeholder="Jan 2024 – Sekarang"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <TextAreaField
                        label="Deskripsi"
                        value={experience.description}
                        onChange={(value) =>
                          updateField(
                            "experiences",
                            data.experiences.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, description: value }
                                : item,
                            ),
                          )
                        }
                        placeholder="Gunakan poin-poin singkat tentang pencapaian dan tanggung jawab."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
                Pendidikan
              </h2>
              <button
                type="button"
                onClick={() =>
                  updateField("educations", [
                    ...data.educations,
                    { school: "", degree: "", period: "" },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                <Plus className="size-3.5" />
                Tambah
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {data.educations.map((education, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Pendidikan {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          "educations",
                          data.educations.filter(
                            (_item, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                      className="text-slate-400 transition-colors hover:text-red-600"
                      aria-label={`Hapus pendidikan ${index + 1}`}
                    >
                      <Trash className="size-4" />
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Institusi"
                      value={education.school}
                      onChange={(value) =>
                        updateField(
                          "educations",
                          data.educations.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, school: value }
                              : item,
                          ),
                        )
                      }
                      placeholder="Universitas Indonesia"
                    />
                    <TextField
                      label="Jurusan / gelar"
                      value={education.degree}
                      onChange={(value) =>
                        updateField(
                          "educations",
                          data.educations.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, degree: value }
                              : item,
                          ),
                        )
                      }
                      placeholder="S1 Ilmu Komputer"
                    />
                    <div className="sm:col-span-2">
                      <TextField
                        label="Periode"
                        value={education.period}
                        onChange={(value) =>
                          updateField(
                            "educations",
                            data.educations.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, period: value }
                                : item,
                            ),
                          )
                        }
                        placeholder="2020 – 2024"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-brand-100 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
              Keahlian
            </h2>
            <div className="mt-4">
              <TextField
                label="Pisahkan dengan koma"
                value={skillsText}
                onChange={setSkillsText}
                placeholder="React, TypeScript, Figma, SQL"
              />
              <p className="mt-2 text-xs text-slate-500">
                Maksimal 30 keahlian. Contoh: komunikasi, analisis data, public
                speaking.
              </p>
            </div>
          </section>

          {state?.error ? (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {state.error}
            </p>
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3 print:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Pratinjau langsung
            </p>
            <p className="text-xs text-slate-400">Format A4, satu kolom</p>
          </div>
          <div className="xl:sticky xl:top-24">
            <CvPreview data={payload} title={title} />
          </div>
        </div>
      </div>
    </form>
  );
}
