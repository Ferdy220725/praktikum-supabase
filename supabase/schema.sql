-- ============================================================
-- SKEMA DATABASE — PUSAT KENDALI ADMIN PRAKTIKUM
-- Jalankan seluruh isi file ini di Supabase SQL Editor.
-- Aman dijalankan ulang (idempotent) berkat IF NOT EXISTS / DROP IF EXISTS.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. SESSIONS — sesi praktikum (mis. "Pre Test 1")
-- ------------------------------------------------------------
create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(trim(name)) > 0),
  status      text not null default 'nonaktif' check (status in ('aktif', 'nonaktif')),
  unique_code text not null check (char_length(trim(unique_code)) > 0),
  created_at  timestamptz not null default now()
);

comment on table sessions is 'Sesi praktikum yang dibuat admin. Menghapus baris ini akan mencascade ke questions, grade_rows, exam_results (dan exam_answers via exam_results).';

-- ------------------------------------------------------------
-- 2. QUESTIONS — bank soal per sesi
-- ------------------------------------------------------------
create table if not exists questions (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references sessions(id) on delete cascade,
  type         text not null check (type in ('pg', 'isian')),
  text         text not null check (char_length(trim(text)) > 0),
  options      jsonb,                         -- hanya dipakai jika type = 'pg': string[]
  answer_key   text not null check (char_length(trim(answer_key)) > 0),
  duration_sec integer not null check (duration_sec > 0),
  score        integer not null check (score > 0),
  created_at   timestamptz not null default now(),
  constraint options_required_for_pg check (
    (type = 'pg' and jsonb_typeof(options) = 'array') or (type = 'isian')
  )
);

create index if not exists idx_questions_session_id on questions(session_id);

comment on column questions.answer_key is 'TIDAK PERNAH dikirim ke klien selama ujian berlangsung — hanya dipakai server saat penilaian.';

-- ------------------------------------------------------------
-- 3. GRADE_ROWS — 5 komponen nilai per praktikan per sesi
-- ------------------------------------------------------------
create table if not exists grade_rows (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references sessions(id) on delete cascade,
  student_name text not null check (char_length(trim(student_name)) > 0),
  activity     numeric(5,2) not null default 0 check (activity between 0 and 100),
  pre_test     numeric(5,2) not null default 0 check (pre_test between 0 and 100),
  lap_sem      numeric(5,2) not null default 0 check (lap_sem between 0 and 100),
  lap_res      numeric(5,2) not null default 0 check (lap_res between 0 and 100),
  uap          numeric(5,2) not null default 0 check (uap between 0 and 100),
  final_score  numeric(5,2) generated always as (
                 round(
                   activity * 0.20 +
                   pre_test * 0.15 +
                   lap_sem  * 0.15 +
                   lap_res  * 0.25 +
                   uap      * 0.25
                 , 2)
               ) stored,
  created_at   timestamptz not null default now(),
  unique (session_id, student_name)
);

create index if not exists idx_grade_rows_session_id on grade_rows(session_id);

comment on column grade_rows.final_score is 'Bobot: Aktivitas 20%, Pre Test 15%, Lap. Sem 15%, Lap. Res 25%, UAP 25%. Dihitung otomatis oleh database (generated column), tidak bisa diisi manual.';

-- ------------------------------------------------------------
-- 4. EXAM_RESULTS — header hasil ujian per praktikan
-- ------------------------------------------------------------
create table if not exists exam_results (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references sessions(id) on delete cascade,
  student_name text not null check (char_length(trim(student_name)) > 0),
  code_used    text not null,
  total_score  integer not null default 0 check (total_score >= 0),
  max_score    integer not null default 0 check (max_score >= 0),
  finished_at  timestamptz not null default now()
);

create index if not exists idx_exam_results_session_id on exam_results(session_id);

-- ------------------------------------------------------------
-- 5. EXAM_ANSWERS — detail jawaban per soal
-- ------------------------------------------------------------
create table if not exists exam_answers (
  id           uuid primary key default gen_random_uuid(),
  result_id    uuid not null references exam_results(id) on delete cascade,
  question_id  uuid references questions(id) on delete set null,
  given_answer text not null default '',
  is_correct   boolean not null default false,
  score        integer not null default 0 check (score >= 0)
);

create index if not exists idx_exam_answers_result_id on exam_answers(result_id);

comment on column exam_answers.question_id is 'ON DELETE SET NULL: jika soal diedit/dihapus, riwayat jawaban tetap ada (tidak yatim-piatu, tapi juga tidak ikut terhapus bersama soal). Riwayat baru hilang jika seluruh SESI dihapus (cascade dari exam_results).';

-- ------------------------------------------------------------
-- KEAMANAN: Row Level Security
-- Semua akses data dilakukan lewat Server Actions Next.js
-- menggunakan SERVICE ROLE KEY (hanya berjalan di server).
-- Browser TIDAK PERNAH memegang kredensial Supabase apa pun,
-- jadi RLS di-enable tanpa policy publik apa pun (deny-all
-- untuk anon/authenticated; service role selalu melewati RLS).
-- ------------------------------------------------------------
alter table sessions      enable row level security;
alter table questions     enable row level security;
alter table grade_rows    enable row level security;
alter table exam_results  enable row level security;
alter table exam_answers  enable row level security;
