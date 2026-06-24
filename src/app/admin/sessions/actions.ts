"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ActionResult, SessionRow } from "@/types/database";

export async function createSessionAction(
  name: string,
  uniqueCode: string
): Promise<ActionResult> {
  const trimmedName = name.trim();
  const trimmedCode = uniqueCode.trim();
  if (!trimmedName || !trimmedCode) {
    return { success: false, message: "Nama sesi dan kode unik wajib diisi." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("sessions")
    .insert({ name: trimmedName, unique_code: trimmedCode, status: "nonaktif" });

  if (error) {
    return { success: false, message: `Gagal membuat sesi: ${error.message}` };
  }

  revalidatePath("/admin/sessions");
  return { success: true };
}

export async function toggleSessionStatusAction(
  sessionId: string,
  currentStatus: SessionRow["status"]
): Promise<ActionResult> {
  const nextStatus = currentStatus === "aktif" ? "nonaktif" : "aktif";
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("sessions")
    .update({ status: nextStatus })
    .eq("id", sessionId);

  if (error) {
    return { success: false, message: `Gagal mengubah status: ${error.message}` };
  }

  revalidatePath("/admin/sessions");
  revalidatePath("/exam");
  return { success: true };
}

export async function updateSessionCodeAction(
  sessionId: string,
  uniqueCode: string
): Promise<ActionResult> {
  const trimmedCode = uniqueCode.trim();
  if (!trimmedCode) {
    return { success: false, message: "Kode unik tidak boleh kosong." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("sessions")
    .update({ unique_code: trimmedCode })
    .eq("id", sessionId);

  if (error) {
    return { success: false, message: `Gagal memperbarui kode: ${error.message}` };
  }

  revalidatePath("/admin/sessions");
  return { success: true };
}

/**
 * Menghapus sesi. Berkat `ON DELETE CASCADE` di skema database, baris
 * questions, grade_rows, exam_results (dan exam_answers via exam_results)
 * yang terkait akan terhapus otomatis oleh PostgreSQL — tidak ada data
 * yatim-piatu, dan tidak perlu logika hapus manual berantai di sini.
 */
export async function deleteSessionAction(sessionId: string): Promise<ActionResult> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);

  if (error) {
    return { success: false, message: `Gagal menghapus sesi: ${error.message}` };
  }

  revalidatePath("/admin/sessions");
  revalidatePath("/admin/questions");
  revalidatePath("/admin/grades");
  revalidatePath("/admin/results");
  revalidatePath("/exam");
  return { success: true };
}
