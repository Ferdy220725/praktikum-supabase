import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mapSession } from "@/lib/mappers";
import type { ExamResultRow, SessionRow } from "@/types/database";
import { ResultsManager } from "./results-manager";

export const dynamic = "force-dynamic";
// 1. TAMBAHKAN BARIS INI UNTUK MEMAKSA DATA DI-FETCH ULANG TANPA CACHE
export const revalidate = 0; 

export default async function ResultsPage(): Promise<React.JSX.Element> {
  const supabase = getSupabaseAdmin();

  const [sessionsResult, resultsResult] = await Promise.all([
    supabase.from("sessions").select("*").order("created_at", { ascending: false }),
    supabase.from("exam_results").select("*"),
  ]);

  if (sessionsResult.error) {
    throw new Error(`Gagal memuat sesi: ${sessionsResult.error.message}`);
  }
  if (resultsResult.error) {
    throw new Error(`Gagal memuat hasil ujian: ${resultsResult.error.message}`);
  }

  const sessions = ((sessionsResult.data ?? []) as SessionRow[]).map(mapSession);
  const results = (resultsResult.data ?? []) as ExamResultRow[];

  console.log("=== DEBUG ADMIN RESULTS ===");
  console.log("Data Sesi (sessions):", sessions);
  console.log("Data Hasil dari tabel exam_results (results):", results);

  return (
    <div className="p-8 sm:p-10">
      <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">
        04 — Hasil Ujian
      </p>
      <h1 className="font-display text-3xl mb-1">Rekap Hasil Praktikan</h1>
      <p className="text-slate mb-6">Setiap entri tercatat saat praktikan menyelesaikan ujian.</p>

      {sessions.length === 0 ? (
        <div className="border border-dashed border-line rounded-md p-10 text-center text-slate">
          Belum ada sesi.
        </div>
      ) : (
        <ResultsManager sessions={sessions} results={results} />
      )}
    </div>
  );
}