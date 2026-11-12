import Link from "next/link";

import { SiteHeader } from "./components/site-header";
import { ArrowRight, Check, Clock, Mail, MapPin } from "./components/icons";

const EMAIL = "karir@sekolahkarir.id";

type Role = {
  slug: string;
  title: string;
  team: string;
  location: string;
  type: string;
  summary: string;
};

const roles: Role[] = [
  {
    slug: "frontend-engineer",
    title: "Frontend Engineer",
    team: "Teknologi",
    location: "Jakarta / Remote",
    type: "Penuh waktu",
    summary:
      "Bangun pengalaman belajar yang cepat, aksesibel, dan menyenangkan bagi siswa serta guru.",
  },
  {
    slug: "product-designer",
    title: "Product Designer",
    team: "Desain",
    location: "Remote",
    type: "Penuh waktu",
    summary:
      "Rancang alur yang membuat keputusan karier terasa lebih sederhana dan percaya diri.",
  },
  {
    slug: "career-coach",
    title: "Career Coach",
    team: "Layanan Karier",
    location: "Bandung / Hybrid",
    type: "Penuh waktu",
    summary:
      "Dampingi siswa dan sekolah menerjemahkan minat menjadi langkah karier yang nyata.",
  },
  {
    slug: "partnership-manager",
    title: "Partnership Manager",
    team: "Kemitraan",
    location: "Jakarta",
    type: "Penuh waktu",
    summary:
      "Bangun kolaborasi dengan sekolah, kampus, dan industri untuk memperluas dampak kami.",
  },
  {
    slug: "content-specialist",
    title: "Content Specialist",
    team: "Marketing",
    location: "Remote",
    type: "Kontrak 12 bulan",
    summary:
      "Susun konten yang membantu siswa dan orang tua memahami pilihan karier dengan jernih.",
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    team: "Teknologi",
    location: "Jakarta / Hybrid",
    type: "Penuh waktu",
    summary:
      "Ubah data menjadi insight untuk meningkatkan layanan dan pengalaman pengguna.",
  },
];

function RoleCard({ role }: { role: Role }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-brand-100 bg-white p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/40 sm:p-6">
      <span className="w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        {role.team}
      </span>

      <h3 className="mt-4 text-lg font-semibold tracking-tight text-brand-950">
        {role.title}
      </h3>

      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4 shrink-0" />
          {role.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4 shrink-0" />
          {role.type}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{role.summary}</p>

      <div className="mt-auto pt-5">
        <a
          href={`/karier/${role.slug}`}
          className="flex w-full items-center justify-between gap-1.5 border-t border-brand-100 pt-4 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
          aria-label={`Lihat detail posisi ${role.title}`}
        >
          Lihat detail
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <a
        href="#posisi"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Lewati ke lowongan
      </a>

      <SiteHeader />

      <main id="utama" className="flex-1">
        {/* Hero */}
        <section className="border-b border-brand-100 bg-surface">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 lg:px-8 lg:py-24">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-sm font-medium text-brand-800">
                <span className="size-2 rounded-full bg-brand-500" aria-hidden="true" />
                Kami sedang merekrut · 6 posisi terbuka
              </p>

              <h1 className="mt-6 max-w-2xl text-balance text-4xl font-bold leading-[1.1] tracking-tight text-brand-950 sm:text-5xl lg:text-6xl">
                Karier yang membantu generasi Indonesia menemukan arah.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Di SekolahKarir, kami mempertemukan siswa, sekolah, dan dunia kerja.
                Bergabunglah dengan tim yang bergerak cepat untuk membuat bimbingan
                karier lebih mudah diakses semua orang.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/karier"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Jelajahi posisi
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#daftar"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-200 bg-white px-6 text-sm font-semibold text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-50"
                >
                  Kirim CV spontan
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
                {["Remote-friendly", "Tunjangan belajar", "Jam kerja fleksibel"].map(
                  (perk) => (
                    <li key={perk} className="inline-flex items-center gap-2">
                      <span className="grid size-5 place-items-center rounded-full bg-brand-100 text-brand-700">
                        <Check className="size-3" />
                      </span>
                      {perk}
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Why join panel */}
            <div
              id="kenapa-kami"
              className="relative scroll-mt-24 overflow-hidden rounded-3xl bg-brand-900 p-7 text-white shadow-xl shadow-brand-900/10 sm:p-9"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full border border-white/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-28 -left-16 size-64 rounded-full border border-white/[0.06]"
              />

              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                  Kenapa bergabung
                </p>

                <ul className="mt-6 space-y-6">
                  {[
                    {
                      title: "Dampak yang terasa",
                      body: "Setiap fitur dan keputusan diarahkan pada hasil nyata untuk siswa dan sekolah.",
                    },
                    {
                      title: "Ruang untuk tumbuh",
                      body: "Anggaran belajar, mentoring, dan jalur karier yang jelas untuk setiap orang.",
                    },
                    {
                      title: "Cara kerja yang sehat",
                      body: "Remote-friendly dengan jam kolaborasi yang menghargai waktu fokus.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-brand-200">
                        <Check className="size-4" />
                      </span>
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-brand-100/80">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
                  <div className="flex -space-x-2" aria-hidden="true">
                    {[
                      ["AR", "bg-brand-500"],
                      ["DP", "bg-brand-400 text-brand-950"],
                      ["SN", "bg-brand-700"],
                      ["RK", "bg-brand-600"],
                    ].map(([initials, color]) => (
                      <span
                        key={initials}
                        className={`grid size-8 place-items-center rounded-full border-2 border-brand-900 text-[10px] font-bold ${color}`}
                      >
                        {initials}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm leading-5 text-brand-100/80">
                    Bergabung dengan 30+ orang yang peduli pendidikan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Open roles */}
        <section
          id="posisi"
          className="scroll-mt-20 bg-white py-16 sm:py-20"
          aria-labelledby="posisi-title"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                  Posisi terbuka
                </p>
                <h2
                  id="posisi-title"
                  className="mt-3 text-balance text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl"
                >
                  Temukan peran yang paling cocok untukmu.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Enam posisi, lima tim, satu tujuan yang sama: membuat arah karier
                  lebih jelas bagi setiap siswa.
                </p>
              </div>

              <Link
                href="/karier"
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
              >
                Lihat semua lowongan
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <li key={role.title} className="min-w-0">
                  <RoleCard role={role} />
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm text-slate-500">
              6 posisi · 5 tim · Penempatan Jakarta, Bandung, atau remote
            </p>
          </div>
        </section>

        {/* CTA */}
        <section id="daftar" className="scroll-mt-20 bg-surface py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full border border-white/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-36 right-24 size-80 rounded-full border border-white/[0.06]"
              />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                    Cara melamar
                  </p>
                  <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                    Siap menumbuhkan karier bersama SekolahKarir?
                  </h2>
                  <p className="mt-4 text-base leading-7 text-brand-100/85">
                    Kirim lamaran untuk posisi yang kamu minati, atau ceritakan peran
                    yang ingin kamu bangun. Tim kami merespons dalam 5 hari kerja.
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <a
                    href={`mailto:${EMAIL}?subject=${encodeURIComponent("Lamaran — SekolahKarir")}`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
                  >
                    <Mail className="size-4" />
                    Kirim lamaran
                  </a>
                  <Link
                    href="/karier"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Lihat semua posisi
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-brand-100 bg-white py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-sm font-bold text-white">
              SK
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight text-brand-950">
                SekolahKarir
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Arah karier yang lebih jelas untuk semua.
              </p>
            </div>
          </div>

          <nav
            aria-label="Navigasi footer"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600"
          >
            <a href="#kenapa-kami" className="transition-colors hover:text-brand-700">
              Kenapa kami
            </a>
            <a href="#posisi" className="transition-colors hover:text-brand-700">
              Posisi terbuka
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-700"
            >
              <Mail className="size-4" />
              {EMAIL}
            </a>
          </nav>
        </div>

        <div className="mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="border-t border-brand-100 pt-6 text-xs text-slate-500">
            © 2026 SekolahKarir. Dibangun dengan niat baik untuk pendidikan Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}
