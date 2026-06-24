import type { GradeComponents } from "@/types/database";

/**
 * Menormalkan jawaban untuk pencocokan yang toleran:
 * tidak peduli besar/kecil huruf, spasi berlebih, atau tanda baca umum.
 */
export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?'"()]/g, "");
}

export function isAnswerCorrect(given: string, answerKey: string): boolean {
  const normalizedGiven = normalizeAnswer(given);
  if (normalizedGiven.length === 0) return false;
  return normalizedGiven === normalizeAnswer(answerKey);
}

export const GRADE_WEIGHTS = {
  activity: 0.2,
  preTest: 0.15,
  lapSem: 0.15,
  lapRes: 0.25,
  uap: 0.25,
} as const;

/**
 * Kalkulasi nilai akhir di sisi aplikasi (untuk pratinjau UI real-time).
 * Nilai final yang tersimpan permanen dihitung oleh PostgreSQL lewat
 * generated column `final_score` di tabel grade_rows — fungsi ini hanya
 * cermin di sisi klien agar tidak perlu round-trip ke server tiap ketik.
 */
export function calcFinalScore(components: GradeComponents): number {
  const value = (x: number): number => (Number.isFinite(x) ? x : 0);
  const raw =
    value(components.activity) * GRADE_WEIGHTS.activity +
    value(components.preTest) * GRADE_WEIGHTS.preTest +
    value(components.lapSem) * GRADE_WEIGHTS.lapSem +
    value(components.lapRes) * GRADE_WEIGHTS.lapRes +
    value(components.uap) * GRADE_WEIGHTS.uap;
  return Math.round(raw * 100) / 100;
}

export function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}
