"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { GradeComponents, GradeRow, PracticumSession } from "@/types/database";
import { calcFinalScore } from "@/lib/grading";
import { addGradeRowAction, deleteGradeRowAction, updateGradeComponentAction } from "./actions";

const COLUMNS: { key: keyof GradeComponents; label: string; weight: string }[] = [
  { key: "activity", label: "Aktivitas", weight: "20%" },
  { key: "preTest", label: "Pre Test", weight: "15%" },
  { key: "lapSem", label: "Lap. Sem", weight: "15%" },
  { key: "lapRes", label: "Lap. Res", weight: "25%" },
  { key: "uap", label: "UAP", weight: "25%" },
];

export function GradeManager({
  sessions,
  grades,
}: {
  sessions: PracticumSession[];
  grades: GradeRow[];
}): React.JSX.Element {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>(sessions[0]?.id ?? "");
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!sessionId && sessions[0]) setSessionId(sessions[0].id);
  }, [sessions, sessionId]);

  const rows = grades.filter((g) => g.sessionId === sessionId);

  const handleAddRow = (): void => {
    startTransition(async () => {
      const result = await addGradeRowAction(sessionId, studentName);
      if (!result.success) {
        setError(result.message ?? "Gagal menambah praktikan.");
        return;
      }
      setStudentName("");
      setError(null);
      router.refresh();
    });
  };

  const handleComponentChange = (rowId: string, key: keyof GradeComponents, value: string): void => {
    const numeric = Number(value);
    startTransition(async () => {
      const result = await updateGradeComponentAction(rowId, key, numeric);
      if (!result.success) setError(result.message ?? "Gagal memperbarui nilai.");
      router.refresh();
    });
  };

  const handleDelete = (rowId: string): void => {
    startTransition(async () => {
      const result = await deleteGradeRowAction(rowId);
      if (!result.success) setError(result.message ?? "Gagal menghapus baris.");
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="text-xs text-slate mb-1 block">Sesi</label>
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
        <input
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Nama praktikan"
          className="px-3 py-2 rounded-sm border border-line text-sm"
        />
        <button
          onClick={handleAddRow}
          disabled={!sessionId || isPending}
          className="px-4 py-2 rounded-sm bg-ink text-white text-sm font-medium disabled:opacity-40"
        >
          + Tambah praktikan
        </button>
      </div>

      {error && <p className="text-bad text-sm mb-4">{error}</p>}

      {!sessionId ? (
        <div className="border border-dashed border-line rounded-md p-10 text-center text-slate">
          Buat sesi terlebih dahulu di tab Sesi.
        </div>
      ) : rows.length === 0 ? (
        <div className="border border-dashed border-line rounded-md p-10 text-center text-slate">
          Belum ada praktikan pada sesi ini.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-md border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-slate">
                <th className="px-4 py-3 font-medium">Nama</th>
                {COLUMNS.map((c) => (
                  <th key={c.key} className="px-3 py-3 font-medium font-mono">
                    {c.label}
                    <br />
                    <span className="text-[10px]">{c.weight}</span>
                  </th>
                ))}
                <th className="px-4 py-3 font-medium">Nilai Akhir</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => {
                const finalScore = calcFinalScore(g.components);
                return (
                  <tr key={g.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5 font-medium">{g.studentName}</td>
                    {COLUMNS.map((c) => (
                      <td key={c.key} className="px-3 py-2.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          defaultValue={g.components[c.key]}
                          onBlur={(e) => handleComponentChange(g.id, c.key, e.target.value)}
                          className="w-16 px-2 py-1 rounded-sm border border-line font-mono text-sm"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-2.5">
                      <span
                        className={`font-display text-base ${
                          finalScore >= 70 ? "text-ok" : "text-bad"
                        }`}
                      >
                        {finalScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="text-xs text-slate hover:text-bad"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
