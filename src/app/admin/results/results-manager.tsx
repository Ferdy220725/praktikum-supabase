"use client";

import { useState } from "react";
import type { ExamResultRow, PracticumSession } from "@/types/database";

export function ResultsManager({
  sessions,
  results,
}: {
  sessions: PracticumSession[];
  results: ExamResultRow[];
}): React.JSX.Element {
  const [sessionId, setSessionId] = useState<string>(sessions[0]?.id ?? "");

// KODE BARU (BENAR)
const rows = results
  .filter((r) => String(r.session_id) === String(sessionId))
    .sort((a, b) => new Date(b.finished_at).getTime() - new Date(a.finished_at).getTime());

  return (
    <div>
      <div className="mb-6">
        <select
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="px-3 py-2 rounded-sm border border-line bg-white text-sm"
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="border border-dashed border-line rounded-md p-10 text-center text-slate">
          Belum ada praktikan yang menyelesaikan ujian pada sesi ini.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="bg-white rounded-md border border-line p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-sm">{r.student_name}</p>
                <p className="font-mono text-xs text-slate">
                  {new Date(r.finished_at).toLocaleString("id-ID")}
                </p>
              </div>
              <span className="font-display text-xl text-amber">
                {r.total_score}/{r.max_score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
