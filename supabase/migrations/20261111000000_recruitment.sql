-- SekolahKarir — recruitment platform schema
-- Jalankan di Supabase Dashboard → SQL Editor → New query → Run.
--
-- Catatan: ini adalah schema awal. Jika kamu sudah pernah menjalankan
-- versi migration sebelumnya, kosongkan tabel jobs/applications dulu
-- atau gunakan database development yang masih bersih.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$
begin
  create type public.user_role as enum ('candidate', 'admin');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.application_status as enum (
    'in_progress',
    'accepted',
    'rejected',
    'withdrawn'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.stage_status as enum (
    'locked',
    'current',
    'completed',
    'rejected'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.cv_source as enum ('upload', 'builder');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'candidate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Jobs and stage templates
-- ---------------------------------------------------------------------------

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  team text not null,
  location text not null,
  employment_type text not null,
  summary text not null,
  description text not null default '',
  requirements text[] not null default '{}',
  responsibilities text[] not null default '{}',
  benefits text[] not null default '{}',
  salary_range text,
  deadline date,
  is_open boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_stages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  title text not null,
  description text,
  kind text not null default 'other' check (
    kind in ('cv', 'test', 'interview', 'announcement', 'other')
  ),
  meeting_type text check (meeting_type in ('gmeet', 'ai', 'other')),
  meeting_url text,
  sort_order int not null,
  created_at timestamptz not null default now(),
  unique (job_id, sort_order)
);

alter table public.job_stages
  add column if not exists kind text not null default 'other';

alter table public.job_stages
  add column if not exists meeting_type text;

alter table public.job_stages
  add column if not exists meeting_url text;

alter table public.job_stages
  drop constraint if exists job_stages_kind_check;

alter table public.job_stages
  add constraint job_stages_kind_check check (
    kind in ('cv', 'test', 'interview', 'announcement', 'other')
  );

create index if not exists jobs_open_sort_idx
  on public.jobs (is_open, sort_order);

create index if not exists job_stages_job_sort_idx
  on public.job_stages (job_id, sort_order);

-- ---------------------------------------------------------------------------
-- Candidate CVs
-- ---------------------------------------------------------------------------

create table if not exists public.candidate_cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source public.cv_source not null,
  file_url text,
  storage_path text,
  data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint candidate_cvs_source_payload check (
    (source = 'upload' and file_url is not null)
    or (source = 'builder' and data is not null)
  )
);

-- Dukungan untuk database yang sudah menjalankan schema versi sebelumnya.
alter table public.candidate_cvs
  add column if not exists file_url text;

alter table public.candidate_cvs
  drop constraint if exists candidate_cvs_upload_path;

alter table public.candidate_cvs
  drop constraint if exists candidate_cvs_source_payload;

alter table public.candidate_cvs
  add constraint candidate_cvs_source_payload check (
    (source = 'upload' and file_url is not null)
    or (source = 'builder' and data is not null)
  );

create index if not exists candidate_cvs_user_idx
  on public.candidate_cvs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Applications and per-application timeline
-- ---------------------------------------------------------------------------

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete restrict,
  cv_id uuid references public.candidate_cvs(id) on delete set null,
  cv_title text not null,
  cv_source public.cv_source not null,
  cv_file_url text,
  cv_storage_path text,
  cv_data jsonb,
  cover_letter text,
  status public.application_status not null default 'in_progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

alter table public.applications
  add column if not exists cv_file_url text;

create table if not exists public.application_stages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  title text not null,
  description text,
  kind text not null default 'other' check (
    kind in ('cv', 'test', 'interview', 'announcement', 'other')
  ),
  meeting_type text check (meeting_type in ('gmeet', 'ai', 'other')),
  meeting_url text,
  sort_order int not null,
  status public.stage_status not null default 'locked',
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  note text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id, sort_order)
);

alter table public.application_stages
  add column if not exists kind text not null default 'other';

alter table public.application_stages
  add column if not exists meeting_type text;

alter table public.application_stages
  add column if not exists meeting_url text;

alter table public.application_stages
  drop constraint if exists application_stages_kind_check;

alter table public.application_stages
  add constraint application_stages_kind_check check (
    kind in ('cv', 'test', 'interview', 'announcement', 'other')
  );

create table if not exists public.stage_submissions (
  id uuid primary key default gen_random_uuid(),
  application_stage_id uuid not null unique
    references public.application_stages(id) on delete cascade,
  application_id uuid not null
    references public.applications(id) on delete cascade,
  user_id uuid not null
    references auth.users(id) on delete cascade,
  file_url text,
  link_url text,
  note text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stage_submissions_payload check (
    file_url is not null or link_url is not null
  )
);

create index if not exists applications_user_created_idx
  on public.applications (user_id, created_at desc);

create index if not exists applications_job_idx
  on public.applications (job_id);

create index if not exists application_stages_application_sort_idx
  on public.application_stages (application_id, sort_order);

-- Updated-at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists cvs_set_updated_at on public.candidate_cvs;
create trigger cvs_set_updated_at
before update on public.candidate_cvs
for each row execute function public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

drop trigger if exists application_stages_set_updated_at on public.application_stages;
create trigger application_stages_set_updated_at
before update on public.application_stages
for each row execute function public.set_updated_at();

drop trigger if exists stage_submissions_set_updated_at on public.stage_submissions;
create trigger stage_submissions_set_updated_at
before update on public.stage_submissions
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Apply atomically: create application + copy the job timeline
-- ---------------------------------------------------------------------------

create or replace function public.apply_to_job(
  p_job_id uuid,
  p_cv_id uuid,
  p_cover_letter text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_job public.jobs%rowtype;
  v_cv public.candidate_cvs%rowtype;
  v_application_id uuid;
  v_stage record;
  v_position int := 0;
  v_has_stage boolean := false;
begin
  if v_user_id is null then
    raise exception 'Kamu harus masuk terlebih dahulu.';
  end if;

  select * into v_job
  from public.jobs
  where id = p_job_id and is_open = true;

  if not found then
    raise exception 'Lowongan tidak tersedia.';
  end if;

  select * into v_cv
  from public.candidate_cvs
  where id = p_cv_id and user_id = v_user_id;

  if not found then
    raise exception 'CV tidak ditemukan.';
  end if;

  if exists (
    select 1 from public.applications
    where user_id = v_user_id and job_id = p_job_id
  ) then
    raise exception 'Kamu sudah melamar posisi ini.';
  end if;

  insert into public.applications (
    user_id,
    job_id,
    cv_id,
    cv_title,
    cv_source,
    cv_file_url,
    cv_storage_path,
    cv_data,
    cover_letter
  )
  values (
    v_user_id,
    p_job_id,
    v_cv.id,
    v_cv.title,
    v_cv.source,
    v_cv.file_url,
    v_cv.storage_path,
    v_cv.data,
    nullif(trim(p_cover_letter), '')
  )
  returning id into v_application_id;

  for v_stage in
    select *
    from public.job_stages
    where job_id = p_job_id
    order by sort_order
  loop
    v_position := v_position + 1;
    v_has_stage := true;

    insert into public.application_stages (
      application_id,
      title,
      description,
      kind,
      meeting_type,
      meeting_url,
      sort_order,
      status,
      completed_at
    )
    values (
      v_application_id,
      v_stage.title,
      v_stage.description,
      v_stage.kind,
      v_stage.meeting_type,
      v_stage.meeting_url,
      v_stage.sort_order,
      case
        when v_position = 1 then 'completed'::public.stage_status
        when v_position = 2 then 'current'::public.stage_status
        else 'locked'::public.stage_status
      end,
      case when v_position = 1 then now() else null end
    );
  end loop;

  if not v_has_stage then
    raise exception 'Timeline lowongan belum tersedia.';
  end if;

  return v_application_id;
end;
$$;

revoke all on function public.apply_to_job(uuid, uuid, text) from public, anon;
grant execute on function public.apply_to_job(uuid, uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Submit jawaban tes + otomatis lanjut ke tahap berikutnya.
-- Mode demo: setiap jawaban dianggap lolos.
-- ---------------------------------------------------------------------------

create or replace function public.submit_stage_answer(
  p_stage_id uuid,
  p_file_url text,
  p_link_url text,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_stage public.application_stages%rowtype;
begin
  if v_user_id is null then
    raise exception 'Kamu harus masuk terlebih dahulu.';
  end if;

  if coalesce(
    nullif(trim(p_file_url), ''),
    nullif(trim(p_link_url), '')
  ) is null then
    raise exception 'Unggah file atau isi link jawaban terlebih dahulu.';
  end if;

  select s.* into v_stage
  from public.application_stages s
  join public.applications a on a.id = s.application_id
  where s.id = p_stage_id
    and a.user_id = v_user_id
    and s.kind = 'test'
    and s.status = 'current';

  if not found then
    raise exception 'Tahap tes tidak tersedia atau sudah selesai.';
  end if;

  insert into public.stage_submissions (
    application_stage_id,
    application_id,
    user_id,
    file_url,
    link_url,
    note,
    submitted_at
  )
  values (
    v_stage.id,
    v_stage.application_id,
    v_user_id,
    nullif(trim(p_file_url), ''),
    nullif(trim(p_link_url), ''),
    nullif(trim(p_note), ''),
    now()
  )
  on conflict (application_stage_id) do update
  set
    file_url = excluded.file_url,
    link_url = excluded.link_url,
    note = excluded.note,
    submitted_at = now();

  -- Demo: jawaban dianggap lolos, tahap ini langsung selesai.
  update public.application_stages
  set
    status = 'completed',
    completed_at = now()
  where id = v_stage.id;

  -- Buka tahap berikutnya.
  update public.application_stages
  set status = 'current'
  where id = (
    select id
    from public.application_stages
    where application_id = v_stage.application_id
      and status = 'locked'
      and sort_order > v_stage.sort_order
    order by sort_order
    limit 1
  );

  return v_stage.application_id;
end;
$$;

revoke all on function public.submit_stage_answer(uuid, text, text, text)
  from public, anon;

grant execute on function public.submit_stage_answer(uuid, text, text, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Masuk interview + otomatis lanjut ke tahap berikutnya.
-- ---------------------------------------------------------------------------

create or replace function public.advance_interview_stage(
  p_stage_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_stage public.application_stages%rowtype;
begin
  if v_user_id is null then
    raise exception 'Kamu harus masuk terlebih dahulu.';
  end if;

  select s.* into v_stage
  from public.application_stages s
  join public.applications a on a.id = s.application_id
  where s.id = p_stage_id
    and a.user_id = v_user_id
    and s.kind = 'interview'
    and s.status = 'current';

  if not found then
    raise exception 'Tahap interview tidak tersedia atau sudah selesai.';
  end if;

  update public.application_stages
  set
    status = 'completed',
    completed_at = now()
  where id = v_stage.id;

  update public.application_stages
  set status = 'current'
  where id = (
    select id
    from public.application_stages
    where application_id = v_stage.application_id
      and status = 'locked'
      and sort_order > v_stage.sort_order
    order by sort_order
    limit 1
  );

  return v_stage.application_id;
end;
$$;

revoke all on function public.advance_interview_stage(uuid)
  from public, anon;

grant execute on function public.advance_interview_stage(uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.job_stages enable row level security;
alter table public.candidate_cvs enable row level security;
alter table public.applications enable row level security;
alter table public.application_stages enable row level security;

-- Profiles
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Jobs
drop policy if exists "Public can read open jobs" on public.jobs;
create policy "Public can read open jobs"
on public.jobs for select
to anon, authenticated
using (is_open = true or public.is_admin());

drop policy if exists "Admins manage jobs" on public.jobs;
create policy "Admins manage jobs"
on public.jobs for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Job stage templates
drop policy if exists "Public can read stages of open jobs" on public.job_stages;
create policy "Public can read stages of open jobs"
on public.job_stages for select
to anon, authenticated
using (
  exists (
    select 1 from public.jobs
    where jobs.id = job_stages.job_id
      and (jobs.is_open = true or public.is_admin())
  )
);

drop policy if exists "Admins manage job stages" on public.job_stages;
create policy "Admins manage job stages"
on public.job_stages for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Candidate CVs
drop policy if exists "Users can read own CVs" on public.candidate_cvs;
create policy "Users can read own CVs"
on public.candidate_cvs for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can create own CVs" on public.candidate_cvs;
create policy "Users can create own CVs"
on public.candidate_cvs for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own CVs" on public.candidate_cvs;
create policy "Users can update own CVs"
on public.candidate_cvs for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Admins manage CVs" on public.candidate_cvs;
create policy "Admins manage CVs"
on public.candidate_cvs for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Applications
drop policy if exists "Users can read own applications" on public.applications;
create policy "Users can read own applications"
on public.applications for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage applications" on public.applications;
create policy "Admins manage applications"
on public.applications for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Application stages
drop policy if exists "Users can read own application stages" on public.application_stages;
create policy "Users can read own application stages"
on public.application_stages for select
to authenticated
using (
  exists (
    select 1 from public.applications
    where applications.id = application_stages.application_id
      and (applications.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Admins manage application stages" on public.application_stages;
create policy "Admins manage application stages"
on public.application_stages for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Stage submissions (jawaban tes)
alter table public.stage_submissions enable row level security;

drop policy if exists "Users can read own stage submissions" on public.stage_submissions;
create policy "Users can read own stage submissions"
on public.stage_submissions for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "Users can submit current tests" on public.stage_submissions;
create policy "Users can submit current tests"
on public.stage_submissions for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.application_stages s
    join public.applications a on a.id = s.application_id
    where s.id = application_stage_id
      and a.user_id = auth.uid()
      and a.id = application_id
      and s.status = 'current'
      and s.kind = 'test'
  )
);

drop policy if exists "Users can update current tests" on public.stage_submissions;
create policy "Users can update current tests"
on public.stage_submissions for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.application_stages s
    join public.applications a on a.id = s.application_id
    where s.id = application_stage_id
      and a.user_id = auth.uid()
      and a.id = application_id
      and s.status = 'current'
      and s.kind = 'test'
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.application_stages s
    join public.applications a on a.id = s.application_id
    where s.id = application_stage_id
      and a.user_id = auth.uid()
      and a.id = application_id
      and s.status = 'current'
      and s.kind = 'test'
  )
);

drop policy if exists "Admins manage stage submissions" on public.stage_submissions;
create policy "Admins manage stage submissions"
on public.stage_submissions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- File upload
-- ---------------------------------------------------------------------------
-- CV upload memakai Edge Function Omahnalar (uploadfile) yang menyimpan file
-- di Garage dan mengembalikan URL. URL tersebut disimpan di
-- candidate_cvs.file_url, bukan di Supabase Storage.
-- Tidak perlu bucket `cv` atau policy storage untuk alur ini.

-- ---------------------------------------------------------------------------
-- Seed jobs
-- ---------------------------------------------------------------------------

insert into public.jobs (
  slug, title, team, location, employment_type, summary, description,
  requirements, responsibilities, benefits, salary_range, deadline, sort_order
)
values
  (
    'frontend-engineer',
    'Frontend Engineer',
    'Teknologi',
    'Jakarta / Remote',
    'Penuh waktu',
    'Bangun pengalaman belajar yang cepat, aksesibel, dan menyenangkan bagi siswa serta guru.',
    'Kamu akan bekerja bersama tim produk dan desain untuk membangun antarmuka yang digunakan siswa, guru, dan sekolah setiap hari. Kami mencari orang yang peduli pada detail, performa, dan pengalaman pengguna.',
    array[
      'Mahir React, TypeScript, dan Next.js',
      'Paham HTML semantik dan aksesibilitas',
      'Pengalaman minimal 2 tahun membangun aplikasi web',
      'Terbiasa dengan Git, code review, dan testing'
    ],
    array[
      'Membangun dan merawat antarmuka siswa serta sekolah',
      'Berkolaborasi dengan desain untuk menerjemahkan prototipe',
      'Menjaga performa, aksesibilitas, dan kualitas kode',
      'Berpartisipasi dalam perencanaan produk dan code review'
    ],
    array[
      'Remote-friendly dengan jam kerja fleksibel',
      'Anggaran belajar tahunan',
      'Asuransi kesehatan',
      'Cuti tahunan dan cuti sakit'
    ],
    'Rp8.000.000 – Rp14.000.000',
    '2026-12-31',
    1
  ),
  (
    'product-designer',
    'Product Designer',
    'Desain',
    'Remote',
    'Penuh waktu',
    'Rancang alur yang membuat keputusan karier terasa lebih sederhana dan percaya diri.',
    'Kamu akan memimpin proses desain dari riset sampai handoff, bekerja dekat dengan siswa, sekolah, dan tim engineering. Fokus kami adalah membuat bimbingan karier terasa jelas dan manusiawi.',
    array[
      'Portofolio yang menunjukkan proses desain end-to-end',
      'Mahir Figma dan prototyping',
      'Nyaman melakukan riset pengguna',
      'Mampu menjelaskan keputusan desain dengan jelas'
    ],
    array[
      'Melakukan riset dan validasi bersama pengguna',
      'Merancang alur, wireframe, dan prototipe',
      'Menjaga konsistensi design system',
      'Berkolaborasi dengan engineering saat implementasi'
    ],
    array[
      'Remote-friendly',
      'Anggaran riset dan belajar',
      'Asuransi kesehatan',
      'Peralatan kerja'
    ],
    'Rp7.000.000 – Rp12.000.000',
    '2026-12-31',
    2
  ),
  (
    'career-coach',
    'Career Coach',
    'Layanan Karier',
    'Bandung / Hybrid',
    'Penuh waktu',
    'Dampingi siswa dan sekolah menerjemahkan minat menjadi langkah karier yang nyata.',
    'Kamu akan memandu sesi bimbingan karier, membantu siswa memahami minat dan kekuatan mereka, serta bekerja bersama sekolah untuk membuat program yang relevan.',
    array[
      'Pengalaman membimbing remaja atau mahasiswa',
      'Kemampuan komunikasi dan mendengar aktif',
      'Pemahaman dasar tentang dunia kerja dan industri',
      'Bersedia melakukan perjalanan ke sekolah mitra'
    ],
    array[
      'Memfasilitasi sesi bimbingan karier individu dan kelompok',
      'Menyusun materi dan aktivitas eksplorasi karier',
      'Berkolaborasi dengan guru dan orang tua',
      'Mendokumentasikan perkembangan siswa'
    ],
    array[
      'Hybrid di Bandung',
      'Pelatihan dan sertifikasi',
      'Asuransi kesehatan',
      'Tunjangan perjalanan'
    ],
    'Rp6.000.000 – Rp9.000.000',
    '2026-12-31',
    3
  ),
  (
    'partnership-manager',
    'Partnership Manager',
    'Kemitraan',
    'Jakarta',
    'Penuh waktu',
    'Bangun kolaborasi dengan sekolah, kampus, dan industri untuk memperluas dampak kami.',
    'Kamu akan menjadi ujung tombak hubungan dengan sekolah, kampus, dan mitra industri. Peran ini cocok untuk orang yang suka membangun hubungan jangka panjang dan bekerja dengan target yang terukur.',
    array[
      'Pengalaman minimal 3 tahun di partnership atau sales',
      'Jaringan di dunia pendidikan menjadi nilai tambah',
      'Kemampuan negosiasi dan presentasi',
      'Terbiasa mengelola pipeline dan laporan'
    ],
    array[
      'Mengembangkan pipeline sekolah dan mitra industri',
      'Memimpin presentasi dan negosiasi kerja sama',
      'Menjaga hubungan dengan mitra yang sudah ada',
      'Berkolaborasi dengan tim produk dan layanan'
    ],
    array[
      'Bonus berbasis performa',
      'Asuransi kesehatan',
      'Tunjangan transportasi',
      'Jam kerja fleksibel'
    ],
    'Rp9.000.000 – Rp15.000.000',
    '2026-12-31',
    4
  ),
  (
    'content-specialist',
    'Content Specialist',
    'Marketing',
    'Remote',
    'Kontrak 12 bulan',
    'Susun konten yang membantu siswa dan orang tua memahami pilihan karier dengan jernih.',
    'Kamu akan menulis untuk blog, media sosial, dan materi sekolah. Kami mencari penulis yang bisa membuat topik karier terasa dekat, praktis, dan tidak menggurui.',
    array[
      'Portofolio tulisan dalam bahasa Indonesia',
      'Paham SEO dasar dan riset kata kunci',
      'Mampu menyederhanakan topik yang rumit',
      'Teliti pada tata bahasa dan konsistensi gaya'
    ],
    array[
      'Menulis artikel, panduan, dan materi kampanye',
      'Berkolaborasi dengan desain dan tim produk',
      'Menjaga kalender konten',
      'Menganalisis performa konten'
    ],
    array[
      'Remote-friendly',
      'Anggaran belajar',
      'Perpanjangan kontrak berbasis performa',
      'Jam kerja fleksibel'
    ],
    'Rp5.000.000 – Rp8.000.000',
    '2026-12-31',
    5
  ),
  (
    'data-analyst',
    'Data Analyst',
    'Teknologi',
    'Jakarta / Hybrid',
    'Penuh waktu',
    'Ubah data menjadi insight untuk meningkatkan layanan dan pengalaman pengguna.',
    'Kamu akan membantu tim memahami perilaku pengguna dan dampak program. Peran ini menuntut rasa ingin tahu, ketelitian, dan kemampuan menyampaikan temuan dengan sederhana.',
    array[
      'Mahir SQL dan spreadsheet',
      'Pengalaman dengan tools visualisasi data',
      'Paham dasar statistik',
      'Mampu menyampaikan insight ke audiens non-teknis'
    ],
    array[
      'Menyusun query dan dashboard untuk tim',
      'Menganalisis perilaku dan umpan balik pengguna',
      'Menyusun laporan dampak program',
      'Berkolaborasi dengan produk dan layanan'
    ],
    array[
      'Hybrid di Jakarta',
      'Asuransi kesehatan',
      'Anggaran belajar',
      'Jam kerja fleksibel'
    ],
    'Rp7.000.000 – Rp12.000.000',
    '2026-12-31',
    6
  )
on conflict (slug) do nothing;

-- Timeline berbeda untuk setiap lowongan.
insert into public.job_stages (job_id, title, description, sort_order)
select id, s.title, s.description, s.sort_order
from public.jobs
cross join (values
  ('frontend-engineer', 'Unggah CV', 'CV diterima dan tidak dapat diganti setelah tahap berikutnya dimulai.', 1),
  ('frontend-engineer', 'Tes Teknis', 'Tes coding singkat untuk melihat cara kamu memecahkan masalah.', 2),
  ('frontend-engineer', 'Interview HR', 'Percakapan tentang pengalaman, motivasi, dan ekspektasi kerja.', 3),
  ('frontend-engineer', 'Interview User', 'Diskusi teknis dengan calon rekan kerja dan lead engineer.', 4),
  ('frontend-engineer', 'Hasil Akhir', 'Keputusan akhir dan penawaran kerja.', 5)
) as s(slug, title, description, sort_order)
where jobs.slug = s.slug
on conflict (job_id, sort_order) do nothing;

insert into public.job_stages (job_id, title, description, sort_order)
select id, s.title, s.description, s.sort_order
from public.jobs
cross join (values
  ('product-designer', 'Unggah CV', 'Unggah CV dan portofolio dalam satu file PDF.', 1),
  ('product-designer', 'Review Portofolio', 'Tim desain meninjau proses dan hasil karya terbaikmu.', 2),
  ('product-designer', 'Interview HR', 'Percakapan tentang pengalaman dan cara kerja.', 3),
  ('product-designer', 'Studi Kasus', 'Latihan desain bersama tim produk.', 4),
  ('product-designer', 'Hasil Akhir', 'Keputusan akhir dan penawaran kerja.', 5)
) as s(slug, title, description, sort_order)
where jobs.slug = s.slug
on conflict (job_id, sort_order) do nothing;

insert into public.job_stages (job_id, title, description, sort_order)
select id, s.title, s.description, s.sort_order
from public.jobs
cross join (values
  ('career-coach', 'Unggah CV', 'CV diterima dan akan ditinjau oleh tim layanan karier.', 1),
  ('career-coach', 'Sesi Simulasi', 'Simulasi sesi bimbingan untuk melihat gaya pendampinganmu.', 2),
  ('career-coach', 'Interview HR', 'Diskusi tentang pengalaman dan kesiapan mobile.', 3),
  ('career-coach', 'Interview User', 'Bertemu dengan calon rekan tim layanan karier.', 4),
  ('career-coach', 'Hasil Akhir', 'Keputusan akhir dan penawaran kerja.', 5)
) as s(slug, title, description, sort_order)
where jobs.slug = s.slug
on conflict (job_id, sort_order) do nothing;

insert into public.job_stages (job_id, title, description, sort_order)
select id, s.title, s.description, s.sort_order
from public.jobs
cross join (values
  ('partnership-manager', 'Unggah CV', 'CV diterima dan akan ditinjau oleh tim kemitraan.', 1),
  ('partnership-manager', 'Case Study', 'Susun pendekatan untuk membangun kerja sama dengan sekolah.', 2),
  ('partnership-manager', 'Interview HR', 'Diskusi tentang pengalaman dan gaya kerja.', 3),
  ('partnership-manager', 'Interview User', 'Bertemu dengan calon rekan tim kemitraan.', 4),
  ('partnership-manager', 'Hasil Akhir', 'Keputusan akhir dan penawaran kerja.', 5)
) as s(slug, title, description, sort_order)
where jobs.slug = s.slug
on conflict (job_id, sort_order) do nothing;

insert into public.job_stages (job_id, title, description, sort_order)
select id, s.title, s.description, s.sort_order
from public.jobs
cross join (values
  ('content-specialist', 'Unggah CV', 'Unggah CV dan portofolio tulisan dalam PDF.', 1),
  ('content-specialist', 'Tes Menulis', 'Tulis artikel singkat sesuai brief dari tim marketing.', 2),
  ('content-specialist', 'Interview HR', 'Diskusi tentang pengalaman dan cara kerja.', 3),
  ('content-specialist', 'Interview User', 'Bertemu dengan calon rekan tim marketing.', 4),
  ('content-specialist', 'Hasil Akhir', 'Keputusan akhir dan penawaran kerja.', 5)
) as s(slug, title, description, sort_order)
where jobs.slug = s.slug
on conflict (job_id, sort_order) do nothing;

insert into public.job_stages (job_id, title, description, sort_order)
select id, s.title, s.description, s.sort_order
from public.jobs
cross join (values
  ('data-analyst', 'Unggah CV', 'CV diterima dan akan ditinjau oleh tim data.', 1),
  ('data-analyst', 'Tes Teknis', 'Studi kasus SQL dan analisis data singkat.', 2),
  ('data-analyst', 'Interview HR', 'Diskusi tentang pengalaman dan ekspektasi.', 3),
  ('data-analyst', 'Interview User', 'Bertemu dengan calon rekan tim data.', 4),
  ('data-analyst', 'Hasil Akhir', 'Keputusan akhir dan penawaran kerja.', 5)
) as s(slug, title, description, sort_order)
where jobs.slug = s.slug
on conflict (job_id, sort_order) do nothing;

-- Tandai jenis tahapan yang sudah di-seed.
update public.job_stages
set kind = 'cv'
where title = 'Unggah CV';

update public.job_stages
set kind = 'test'
where title in (
  'Tes Teknis',
  'Tes Menulis',
  'Studi Kasus',
  'Case Study',
  'Review Portofolio',
  'Sesi Simulasi'
);

update public.job_stages
set kind = 'interview'
where title like 'Interview%';

update public.job_stages
set kind = 'announcement'
where title = 'Hasil Akhir';

-- Sinkronkan jenis tahapan untuk lamaran yang sudah ada.
update public.application_stages s
set kind = js.kind
from public.applications a, public.job_stages js
where a.id = s.application_id
  and js.job_id = a.job_id
  and js.sort_order = s.sort_order;

-- Contoh link interview. Ganti lewat Table Editor untuk data nyata.
update public.job_stages
set
  meeting_type = 'gmeet',
  meeting_url = 'https://meet.google.com/new'
where title = 'Interview HR';

update public.job_stages
set
  meeting_type = 'ai',
  meeting_url = 'https://interview.example.com'
where title = 'Interview User';

update public.application_stages s
set
  meeting_type = js.meeting_type,
  meeting_url = js.meeting_url
from public.applications a, public.job_stages js
where a.id = s.application_id
  and js.job_id = a.job_id
  and js.sort_order = s.sort_order;

-- Jadikan admin setelah user Google pertama kali masuk:
-- update public.profiles set role = 'admin' where email = 'email-kamu@gmail.com';
