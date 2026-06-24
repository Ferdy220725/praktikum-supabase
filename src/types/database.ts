/**
 * Tipe domain untuk seluruh entitas aplikasi.
 * Tidak ada penggunaan `any` di file ini maupun di seluruh proyek.
 *
 * Konvensi:
 *  - Tipe `*Row`  -> bentuk baris mentah sebagaimana tersimpan di Postgres (snake_case).
 *  - Tipe tanpa akhiran -> bentuk domain yang dipakai di seluruh aplikasi (camelCase).
 */

export type SessionStatus = "aktif" | "nonaktif";
export type QuestionType = "pg" | "isian";

/* ---------------------- Bentuk baris mentah dari Supabase ---------------------- */

export interface SessionRow {
  id: string;
  name: string;
  status: SessionStatus;
  unique_code: string;
  created_at: string;
}

export interface QuestionRow {
  id: string;
  session_id: string;
  type: QuestionType;
  text: string;
  options: string[] | null;
  answer_key: string;
  duration_sec: number;
  score: number;
  created_at: string;
}

/** Bentuk soal yang AMAN dikirim ke klien selama ujian — tanpa answer_key. */
export interface QuestionRowPublic {
  id: string;
  session_id: string;
  type: QuestionType;
  text: string;
  options: string[] | null;
  duration_sec: number;
  score: number;
}

export interface GradeRowRow {
  id: string;
  session_id: string;
  student_name: string;
  activity: number;
  pre_test: number;
  lap_sem: number;
  lap_res: number;
  uap: number;
  final_score: number;
  created_at: string;
}

export interface ExamResultRow {
  id: string;
  session_id: string;
  student_name: string;
  code_used: string;
  total_score: number;
  max_score: number;
  finished_at: string;
}

export interface ExamAnswerRow {
  id: string;
  result_id: string;
  question_id: string | null;
  given_answer: string;
  is_correct: boolean;
  score: number;
}

/* ---------------------- Bentuk domain (dipakai komponen) ---------------------- */

export interface PracticumSession {
  id: string;
  name: string;
  status: SessionStatus;
  uniqueCode: string;
  createdAt: string;
}

export interface Question {
  id: string;
  sessionId: string;
  type: QuestionType;
  text: string;
  options: string[] | null;
  answerKey: string;
  durationSec: number;
  score: number;
}

export interface PublicQuestion {
  id: string;
  sessionId: string;
  type: QuestionType;
  text: string;
  options: string[] | null;
  durationSec: number;
  score: number;
}

export interface GradeComponents {
  activity: number;
  preTest: number;
  lapSem: number;
  lapRes: number;
  uap: number;
}

export interface GradeRow {
  id: string;
  sessionId: string;
  studentName: string;
  components: GradeComponents;
  finalScore: number;
}

export interface SubmittedAnswer {
  questionId: string;
  givenAnswer: string;
}

export interface GradedAnswer {
  questionId: string;
  givenAnswer: string;
  isCorrect: boolean;
  score: number;
}

export interface ExamResult {
  id: string;
  sessionId: string;
  studentName: string;
  codeUsed: string;
  totalScore: number;
  maxScore: number;
  finishedAt: string;
  answers: GradedAnswer[];
}

/* ---------------------- Input bentuk form (sebelum dikirim ke server) ---------------------- */

export interface CreateSessionInput {
  name: string;
  uniqueCode: string;
}

export interface CreateQuestionInput {
  sessionId: string;
  type: QuestionType;
  text: string;
  options: string[] | null;
  answerKey: string;
  durationSec: number;
  score: number;
}

export type UpdateQuestionInput = CreateQuestionInput & { id: string };

/* ---------------------- Hasil aksi server (untuk umpan balik UI) ---------------------- */

export interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
}
