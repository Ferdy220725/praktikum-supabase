import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mapSession } from "@/lib/mappers";
import type { SessionRow } from "@/types/database";
import { NewSessionForm } from "./new-session-form";
import { SessionRowCard } from "./session-row";

export const dynamic = "force-dynamic";

export default async function SessionsPage(): Promise<React.JSX.Element> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat sesi: ${error.message}`);
  }

  const sessions = ((data ?? []) as SessionRow[]).map(mapSession);

  return (
    <div className="p-8 sm:p-10 max-w-4xl">
      <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">
        01 — Manajemen Sesi
      </p>
      <h1 className="font-display text-3xl mb-1">Sesi Praktikum</h1>
      <p className="text-slate mb-8">
        Buat sesi, atur status aktif, dan tetapkan kode unik untuk siswa.
      </p>

      <div className="mb-8">
        <NewSessionForm />
      </div>

      {sessions.length === 0 ? (
        <div className="border border-dashed border-line rounded-md p-10 text-center text-slate">
          Belum ada sesi. Buat sesi pertama di atas.
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionRowCard key={session.id} session={session} />
          ))}
        </div>
      )}

      <p className="text-xs text-slate mt-4">
        Menghapus sesi akan menghapus seluruh soal, nilai, dan hasil ujian terkait secara
        otomatis di database (foreign key ON DELETE CASCADE) — tidak ada data yang tertinggal.
      </p>
    </div>
  );
}
