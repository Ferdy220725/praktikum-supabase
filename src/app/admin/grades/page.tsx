import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mapGradeRow, mapSession } from "@/lib/mappers";
import type { GradeRowRow, SessionRow } from "@/types/database";
import { GradeManager } from "./grade-manager";

export const dynamic = "force-dynamic";

export default async function GradesPage(): Promise<React.JSX.Element> {
  const supabase = getSupabaseAdmin();

  const [sessionsResult, gradesResult] = await Promise.all([
    supabase.from("sessions").select("*").order("created_at", { ascending: false }),
    supabase.from("grade_rows").select("*").order("student_name", { ascending: true }),
  ]);

  if (sessionsResult.error) {
    throw new Error(`Gagal memuat sesi: ${sessionsResult.error.message}`);
  }
  if (gradesResult.error) {
    throw new Error(`Gagal memuat nilai: ${gradesResult.error.message}`);
  }

  const sessions = ((sessionsResult.data ?? []) as SessionRow[]).map(mapSession);
  const grades = ((gradesResult.data ?? []) as GradeRowRow[]).map(mapGradeRow);

  return (
    <div className="p-8 sm:p-10">
      <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">
        03 — Manajemen Nilai
      </p>
      <h1 className="font-display text-3xl mb-1">Rekap Nilai Akhir</h1>
      <p className="text-slate mb-6">
        Kalkulasi otomatis dari lima komponen berbobot, dihitung langsung oleh database.
      </p>

      <GradeManager sessions={sessions} grades={grades} />
    </div>
  );
}
