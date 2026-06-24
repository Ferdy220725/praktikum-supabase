import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mapSession } from "@/lib/mappers";
import type { SessionRow } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ExamSessionPickerPage(): Promise<React.JSX.Element> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("status", "aktif")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat sesi: ${error.message}`);
  }

  const sessions = ((data ?? []) as SessionRow[]).map(mapSession);

  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto bg-ink grain">
      <Link href="/" className="text-white/40 text-sm mb-8 hover:text-white inline-block">
        ← kembali
      </Link>
      <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">Langkah 1 dari 3</p>
      <h1 className="font-display text-3xl text-white mb-6">Pilih sesi ujian</h1>

      {sessions.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-md p-8 text-center text-white/45">
          Tidak ada sesi yang aktif saat ini. Hubungi admin laboratorium.
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/exam/${s.id}`}
              className="w-full text-left p-5 rounded-md bg-white/5 border border-white/10 hover:border-amber transition-colors flex items-center justify-between block"
            >
              <span className="font-display text-lg text-white">{s.name}</span>
              <span className="text-amber">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
