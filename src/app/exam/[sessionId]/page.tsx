import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { SessionRow } from "@/types/database";
import { ExamClient } from "./exam-client";

export const dynamic = "force-dynamic";

export default async function ExamSessionPage({
  params,
}: {
  params: { sessionId: string };
}): Promise<React.JSX.Element> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.sessionId)
    .single();

  const session = !error ? (data as SessionRow | null) : null;

  if (!session || session.status !== "aktif") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center bg-ink grain">
        <p className="text-white/60 max-w-sm">
          Sesi ini tidak tersedia atau sudah tidak aktif. Hubungi admin laboratorium.
        </p>
      </div>
    );
  }

  return <ExamClient sessionId={session.id} sessionName={session.name} />;
}
