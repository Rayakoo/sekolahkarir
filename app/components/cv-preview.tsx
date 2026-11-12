import type { CvData } from "@/lib/cv";

export function CvPreview({
  data,
  title,
}: {
  data: CvData;
  title?: string;
}) {
  const contacts = [data.email, data.phone, data.location].filter(Boolean);

  return (
    <article
      className="print-area mx-auto w-full max-w-[794px] rounded-xl border border-slate-200 bg-white px-7 py-8 text-slate-800 shadow-sm sm:px-10 sm:py-10"
      aria-label={title ? `Pratinjau CV ${title}` : "Pratinjau CV"}
    >
      <header className="border-b border-slate-300 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {data.fullName || "Nama Lengkap"}
        </h2>
        {data.headline ? (
          <p className="mt-1 text-sm font-medium text-brand-700">
            {data.headline}
          </p>
        ) : null}
        {contacts.length > 0 ? (
          <p className="mt-3 text-xs leading-5 text-slate-600">
            {contacts.join(" · ")}
          </p>
        ) : null}
      </header>

      {data.summary ? (
        <section className="mt-5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Ringkasan
          </h3>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-slate-700">
            {data.summary}
          </p>
        </section>
      ) : null}

      {data.experiences.length > 0 ? (
        <section className="mt-5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Pengalaman
          </h3>
          <div className="mt-3 space-y-4">
            {data.experiences.map((experience, index) => (
              <div key={`${experience.role}-${index}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                  <p className="text-sm font-bold text-slate-900">
                    {experience.role || "Posisi"}
                  </p>
                  {experience.period ? (
                    <p className="text-xs font-medium text-slate-500">
                      {experience.period}
                    </p>
                  ) : null}
                </div>
                {experience.company ? (
                  <p className="text-xs font-medium text-brand-700">
                    {experience.company}
                  </p>
                ) : null}
                {experience.description ? (
                  <p className="mt-1.5 whitespace-pre-line text-[13px] leading-6 text-slate-700">
                    {experience.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {data.educations.length > 0 ? (
        <section className="mt-5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Pendidikan
          </h3>
          <div className="mt-3 space-y-3">
            {data.educations.map((education, index) => (
              <div
                key={`${education.school}-${index}`}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {education.school || "Institusi"}
                  </p>
                  {education.degree ? (
                    <p className="text-xs text-slate-600">{education.degree}</p>
                  ) : null}
                </div>
                {education.period ? (
                  <p className="text-xs font-medium text-slate-500">
                    {education.period}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {data.skills.length > 0 ? (
        <section className="mt-5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Keahlian
          </h3>
          <p className="mt-2 text-[13px] leading-6 text-slate-700">
            {data.skills.join(", ")}
          </p>
        </section>
      ) : null}
    </article>
  );
}
