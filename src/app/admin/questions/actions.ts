"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ActionResult, CreateQuestionInput, UpdateQuestionInput } from "@/types/database";

function validateQuestionInput(input: CreateQuestionInput): string | null {
  if (!input.sessionId) return "Pilih sesi target terlebih dahulu.";
  if (!input.text.trim()) return "Pertanyaan tidak boleh kosong.";
  if (!input.answerKey.trim()) return "Kunci jawaban wajib diisi.";
  if (input.durationSec <= 0) return "Waktu per soal harus lebih dari 0 detik.";
  if (input.score <= 0) return "Skor harus lebih dari 0.";
  if (input.type === "pg") {
    const options = input.options ?? [];
    if (options.length < 2 || options.some((opt) => !opt.trim())) {
      return "Pilihan ganda membutuhkan minimal 2 opsi yang terisi.";
    }
    if (!options.includes(input.answerKey)) {
      return "Kunci jawaban harus salah satu dari opsi yang tersedia.";
    }
  }
  return null;
}

export async function createQuestionAction(input: CreateQuestionInput): Promise<ActionResult> {
  const validationError = validateQuestionInput(input);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("questions").insert({
    session_id: input.sessionId,
    type: input.type,
    text: input.text.trim(),
    options: input.type === "pg" ? input.options : null,
    answer_key: input.answerKey.trim(),
    duration_sec: input.durationSec,
    score: input.score,
  });

  if (error) {
    return { success: false, message: `Gagal menyimpan soal: ${error.message}` };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}

export async function updateQuestionAction(input: UpdateQuestionInput): Promise<ActionResult> {
  const validationError = validateQuestionInput(input);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("questions")
    .update({
      type: input.type,
      text: input.text.trim(),
      options: input.type === "pg" ? input.options : null,
      answer_key: input.answerKey.trim(),
      duration_sec: input.durationSec,
      score: input.score,
    })
    .eq("id", input.id);

  if (error) {
    return { success: false, message: `Gagal memperbarui soal: ${error.message}` };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}

export async function deleteQuestionAction(questionId: string): Promise<ActionResult> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("questions").delete().eq("id", questionId);

  if (error) {
    return { success: false, message: `Gagal menghapus soal: ${error.message}` };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}
