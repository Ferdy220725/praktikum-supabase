"use client";

import { useState, useTransition } from "react";
import type { PracticumSession } from "@/types/database";
import { toggleSessionStatusAction, updateSessionCodeAction, deleteSessionAction } from "./actions";

export function SessionRowCard({ session }: { session: PracticumSession }): React.JSX.Element {
  const [code, setCode] = useState(session.uniqueCode);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = (): void => {
    startTransition(async () => {
      const result = await toggleSessionStatusAction(session.id, session.status);
      if (!result.success) setError(result.message ?? "Gagal mengubah status.");
    });
  };

  const handleCodeBlur = (): void => {
    if (code.trim() === session.uniqueCode) return;
    startTransition(async () => {
      const result = await updateSessionCodeAction(session.id, code);
      if (!result.success) setError(result.message ?? "Gagal memperbarui kode.");
    });
  };

  const handleDelete = (): void => {
    startTransition(async () => {
      const result = await deleteSessionAction(session.id);
      if (!result.success) setError(result.message ?? "Gagal menghapus sesi.");
      setConfirmingDelete(false);
    });
  };

  const isActive = session.status === "aktif";

  return (
    <div className="bg-white rounded-md border border-line p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display text-lg">{session.name}</h3>
          <span
            className={`font-mono text-[11px] px-2 py-0.5 rounded-full border ${
              isActive ? "border-ok text-ok" : "border-slate text-slate"
            }`}
          >
            {isActive ? "● aktif" : "○ nonaktif"}
          </span>
        </div>
        <p className="font-mono text-xs text-slate">
          dibuat {new Date(session.createdAt).toLocaleString("id-ID")}
        </p>
        {error && <p className="text-bad text-xs mt-1">{error}</p>}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate font-mono">KODE</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onBlur={handleCodeBlur}
          className="w-32 px-2 py-1.5 rounded-sm border border-line font-mono text-sm focus:border-amber outline-none"
        />
      </div>

      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`px-4 py-2 rounded-sm text-sm font-medium border transition-colors disabled:opacity-50 ${
          isActive
            ? "border-ok text-ok hover:bg-ok/10"
            : "border-slate text-slate hover:bg-slate/10"
        }`}
      >
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </button>

      {confirmingDelete ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-bad">Hapus permanen?</span>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-3 py-1.5 rounded-sm bg-bad text-white text-xs disabled:opacity-50"
          >
            Ya, hapus
          </button>
          <button
            onClick={() => setConfirmingDelete(false)}
            className="px-3 py-1.5 rounded-sm border border-line text-xs"
          >
            Batal
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmingDelete(true)}
          className="text-slate hover:text-bad text-sm"
        >
          Hapus
        </button>
      )}
    </div>
  );
}
