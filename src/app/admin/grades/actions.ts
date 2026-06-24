"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { clampScore } from "@/lib/grading";
import type { ActionResult, GradeComponents } from "@/types/database";

export async function addGradeRowAction(
  sessionId: string,
  studentName: string
): Promise<ActionResult> {
  const trimmedName = studentName.trim();
  if (!sessionId || !trimmedName) {
    return { success: false, message: "Pilih sesi dan isi nama praktikan." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("grade_rows").insert({
    session_id: sessionId,
    student_name: trimmedName,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "Praktikan dengan nama ini sudah ada di sesi tersebut." };
    }
    return { success: false, message: `Gagal menambah praktikan: ${error.message}` };
  }

  revalidatePath("/admin/grades");
  return { success: true };
}

export async function updateGradeComponentAction(
  rowId: string,
  componentKey: keyof GradeComponents,
  value: number
): Promise<ActionResult> {
  const columnMap: Record<keyof GradeComponents, string> = {
    activity: "activity",
    preTest: "pre_test",
    lapSem: "lap_sem",
    lapRes: "lap_res",
    uap: "uap",
  };

  const column = columnMap[componentKey];
  const safeValue = clampScore(value);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("grade_rows")
    .update({ [column]: safeValue })
    .eq("id", rowId);

  if (error) {
    return { success: false, message: `Gagal memperbarui nilai: ${error.message}` };
  }

  revalidatePath("/admin/grades");
  return { success: true };
}

export async function deleteGradeRowAction(rowId: string): Promise<ActionResult> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("grade_rows").delete().eq("id", rowId);

  if (error) {
    return { success: false, message: `Gagal menghapus baris: ${error.message}` };
  }

  revalidatePath("/admin/grades");
  return { success: true };
}
