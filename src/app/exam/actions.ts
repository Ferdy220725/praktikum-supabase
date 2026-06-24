"use server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mapQuestionPublic } from "@/lib/mappers";
import { isAnswerCorrect } from "@/lib/grading";
import type {
  ActionResult,
  ExamResult,
  GradedAnswer,
  PublicQuestion,
  QuestionRow,
  SessionRow,
  SubmittedAnswer,
} from "@/types/database";

interface VerifyCodeSuccess {
  questions: PublicQuestion[];
}

/**
 * Memverifikasi kode unik sesi, lalu mengembalikan soal TANPA kunci
 * jawaban. Ini dipanggil sebelum ujian dimulai — klien tidak pernah
 * menerima `answer_key` sampai ujian benar-benar selesai dinilai.
 */
export async function verifyCodeAndFetchQuestionsAction(
  sessionId: string,
  code: string
): Promise<ActionResult<VerifyCodeSuccess>> {
  const supabase = getSupabaseAdmin();

  const { data: sessionData, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !sessionData) {
    return { success: false, message: "Sesi tidak ditemukan." };
  }

  const session = sessionData as SessionRow;

  if (session.status !== "aktif") {
    return { success: false, message: "Sesi ini sedang tidak aktif." };
  }

  if (session.unique_code !== code.trim()) {
    return { success: false, message: "Kode unik tidak sesuai untuk sesi ini." };
  }

  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .select("id, session_id, type, text, options, duration_sec, score")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (questionError) {
    return { success: false, message: `Gagal memuat soal: ${questionError.message}` };
  }

  const questions = (questionData ?? []).map((row) =>
    mapQuestionPublic({
      id: row.id as string,
      session_id: row.session_id as string,
      type: row.type as PublicQuestion["type"],
      text: row.text as string,
      options: row.options as string[] | null,
      duration_sec: row.duration_sec as number,
      score: row.score as number,
    })
  );

  return { success: true, data: { questions } };
}

/**
 * Menilai dan menyimpan hasil ujian. Mengambil ulang kunci jawaban
 * langsung dari database di sisi server — klien hanya mengirim apa
 * yang diisi praktikan, tidak pernah memegang kunci jawaban.
 */
export async function submitExamAction(
  sessionId: string,
  code: string,
  studentName: string,
  answers: SubmittedAnswer[]
): Promise<ActionResult<ExamResult>> {
  const trimmedName = studentName.trim();
  if (!trimmedName) {
    return { success: false, message: "Nama praktikan wajib diisi." };
  }

  const supabase = getSupabaseAdmin();

  const { data: sessionData, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !sessionData) {
    return { success: false, message: "Sesi tidak ditemukan." };
  }

  const session = sessionData as SessionRow;
  if (session.status !== "aktif" || session.unique_code !== code.trim()) {
    return { success: false, message: "Sesi tidak valid atau sudah berakhir." };
  }

  const { data: questionRows, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("session_id", sessionId);

  if (questionError) {
    return { success: false, message: `Gagal memuat soal: ${questionError.message}` };
  }

  const questions = (questionRows ?? []) as QuestionRow[];
  const questionById = new Map(questions.map((q) => [q.id, q]));

  const gradedAnswers: GradedAnswer[] = answers.map((answer) => {
    const question = questionById.get(answer.questionId);
    if (!question) {
      return { questionId: answer.questionId, givenAnswer: answer.givenAnswer, isCorrect: false, score: 0 };
    }
    const correct = isAnswerCorrect(answer.givenAnswer, question.answer_key);
    return {
      questionId: answer.questionId,
      givenAnswer: answer.givenAnswer,
      isCorrect: correct,
      score: correct ? question.score : 0,
    };
  });

  const totalScore = gradedAnswers.reduce((sum, a) => sum + a.score, 0);
  const maxScore = questions.reduce((sum, q) => sum + q.score, 0);

  const { data: resultRow, error: insertResultError } = await supabase
    .from("exam_results")
    .insert({
      session_id: sessionId,
      student_name: trimmedName,
      code_used: code.trim(),
      total_score: totalScore,
      max_score: maxScore,
    })
    .select("*")
    .single();

  if (insertResultError || !resultRow) {
    return {
      success: false,
      message: `Gagal menyimpan hasil ujian: ${insertResultError?.message ?? "tidak diketahui"}`,
    };
  }

  const resultId = resultRow.id as string;

  if (gradedAnswers.length > 0) {
    const { error: insertAnswersError } = await supabase.from("exam_answers").insert(
      gradedAnswers.map((a) => ({
        result_id: resultId,
        question_id: a.questionId,
        given_answer: a.givenAnswer,
        is_correct: a.isCorrect,
        score: a.score,
      }))
    );

    if (insertAnswersError) {
      return {
        success: false,
        message: `Hasil tersimpan, tetapi detail jawaban gagal disimpan: ${insertAnswersError.message}`,
      };
    }
  }

  return {
    success: true,
    data: {
      id: resultId,
      sessionId,
      studentName: trimmedName,
      codeUsed: code.trim(),
      totalScore,
      maxScore,
      finishedAt: resultRow.finished_at as string,
      answers: gradedAnswers,
    },
  };
}
