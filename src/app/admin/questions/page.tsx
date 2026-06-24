import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mapQuestion, mapSession } from "@/lib/mappers";
import type { QuestionRow, SessionRow } from "@/types/database";
import { QuestionManager } from "./question-manager";

export const dynamic = "force-dynamic";

export default async function QuestionsPage(): Promise<React.JSX.Element> {
  const supabase = getSupabaseAdmin();

  const [sessionsResult, questionsResult] = await Promise.all([
    supabase.from("sessions").select("*").order("created_at", { ascending: false }),
    supabase.from("questions").select("*").order("created_at", { ascending: true }),
  ]);

  if (sessionsResult.error) {
    throw new Error(`Gagal memuat sesi: ${sessionsResult.error.message}`);
  }
  if (questionsResult.error) {
    throw new Error(`Gagal memuat soal: ${questionsResult.error.message}`);
  }

  const sessions = ((sessionsResult.data ?? []) as SessionRow[]).map(mapSession);
  const questions = ((questionsResult.data ?? []) as QuestionRow[]).map(mapQuestion);

  return (
    <div className="p-8 sm:p-10 max-w-5xl">
      <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">
        02 — Bank Soal Dinamis
      </p>
      <h1 className="font-display text-3xl mb-1">Soal &amp; Kunci Jawaban</h1>
      <p className="text-slate mb-6">
        Pilihan ganda atau isian, lengkap dengan waktu, skor, dan kunci jawaban.
      </p>

      <QuestionManager sessions={sessions} questions={questions} />
    </div>
  );
}
