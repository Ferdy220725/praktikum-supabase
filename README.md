# Pusat Kendali Praktikum

Aplikasi admin + ujian praktikum berbasis Next.js 14 (App Router, TypeScript strict)
dan Supabase Postgres (relasi asli dengan `FOREIGN KEY` + `ON DELETE CASCADE`).

## Arsitektur singkat

- **Database**: Supabase Postgres. Lihat `supabase/schema.sql`.
- **Backend**: Next.js Server Actions yang mengakses Supabase memakai
  *service role key* — kunci ini **tidak pernah** dikirim ke browser.
- **Keamanan ujian**: kunci jawaban (`answer_key`) tidak pernah dikirim ke
  klien selama ujian berlangsung. Koreksi dilakukan di server saat submit.
- **Sesi admin**: cookie httpOnly bertanda tangan HMAC-SHA256 (bukan
  password mentah yang disimpan), diverifikasi oleh `middleware.ts`.

## 1. Siapkan Supabase

1. Buka project Supabase Anda → menu **SQL Editor**.
2. Tempel seluruh isi `supabase/schema.sql`, lalu jalankan (Run).
3. Buka **Project Settings → API**, catat:
   - `Project URL` → untuk `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key (di bagian "Project API keys", **bukan** `anon` key) → untuk `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ `service_role` key punya akses penuh tanpa RLS. Jangan pernah
   menaruhnya di variabel yang diawali `NEXT_PUBLIC_`, dan jangan commit
   ke GitHub.

## 2. Jalankan di VS Code (lokal)

```bash
npm install
cp .env.local.example .env.local
```

Isi `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...       # dari langkah 1
SUPABASE_SERVICE_ROLE_KEY=...      # dari langkah 1
ADMIN_PASSWORD=prak22              # ganti jika perlu
SESSION_SECRET=...                 # generate: openssl rand -base64 32
```

Jalankan:

```bash
npm run dev
```

Buka `http://localhost:3000`.

Cek tipe sebelum push (opsional tapi disarankan):

```bash
npm run typecheck
```

## 3. Push ke GitHub

```bash
git init
git add .
git commit -m "Inisialisasi Pusat Kendali Praktikum"
git branch -M main
git remote add origin <url-repo-github-anda>
git push -u origin main
```

File `.env.local` **tidak akan ter-commit** (sudah ada di `.gitignore`) —
ini sengaja, supaya kredensial tidak bocor ke repo publik.

## 4. Deploy ke Vercel

1. Di dashboard Vercel: **Add New → Project** → impor repo GitHub ini.
2. Saat konfigurasi, buka **Environment Variables** dan isi 4 variabel
   yang sama seperti di `.env.local` (Production, dan opsional Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
3. Klik **Deploy**.

Selesai — Vercel akan otomatis build ulang setiap kali Anda push ke `main`.

## Struktur folder

```
supabase/schema.sql          → skema database (jalankan manual di Supabase)
src/types/database.ts        → seluruh interface TypeScript (tanpa `any`)
src/lib/supabase-admin.ts    → client Supabase server-only (service role)
src/lib/auth.ts               → sesi admin (HMAC, httpOnly cookie)
src/lib/grading.ts            → normalisasi jawaban toleran + kalkulasi nilai
src/middleware.ts             → melindungi /admin/* dari akses tanpa login
src/app/page.tsx              → gerbang utama (pilih Admin / Praktikan)
src/app/admin/                → panel admin (sesi, soal, nilai, hasil)
src/app/exam/                 → alur ujian praktikan
```

## Hal yang perlu Anda sesuaikan sendiri

- **Ganti `ADMIN_PASSWORD`** dari `prak22` ke sesuatu yang lebih kuat untuk
  pemakaian produksi sungguhan.
- Jika jumlah soal per sesi sangat banyak (>200), pertimbangkan paginasi
  di `admin/questions` — saat ini seluruh soal sesi dimuat sekaligus,
  yang cukup untuk skala praktikum biasa.
