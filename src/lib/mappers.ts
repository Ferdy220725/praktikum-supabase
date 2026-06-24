import type {
  SessionRow,
  PracticumSession,
  QuestionRow,
  QuestionRowPublic,
  Question,
  PublicQuestion,
  GradeRowRow,
  GradeRow,
} from "@/types/database";

export function mapSession(row: SessionRow): PracticumSession {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    uniqueCode: row.unique_code,
    createdAt: row.created_at,
  };
}

export function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    sessionId: row.session_id,
    type: row.type,
    text: row.text,
    options: row.options,
    answerKey: row.answer_key,
    durationSec: row.duration_sec,
    score: row.score,
  };
}

/** Versi aman untuk dikirim ke klien selama ujian — tanpa kunci jawaban. */
export function mapQuestionPublic(row: QuestionRowPublic): PublicQuestion {
  return {
    id: row.id,
    sessionId: row.session_id,
    type: row.type,
    text: row.text,
    options: row.options,
    durationSec: row.duration_sec,
    score: row.score,
  };
}

export function mapGradeRow(row: GradeRowRow): GradeRow {
  return {
    id: row.id,
    sessionId: row.session_id,
    studentName: row.student_name,
    components: {
      activity: Number(row.activity),
      preTest: Number(row.pre_test),
      lapSem: Number(row.lap_sem),
      lapRes: Number(row.lap_res),
      uap: Number(row.uap),
    },
    finalScore: Number(row.final_score),
  };
}
