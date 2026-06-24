"use client";

import { useRef, useState, useTransition } from "react";
import { createSessionAction } from "./actions";

export function NewSessionForm(): React.JSX.Element {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createSessionAction(name, code);
      if (!result.success) {
        setError(result.message ?? "Gagal membuat sesi.");
        return;
      }
      setError(null);
      setName("");
      setCode("");
      nameInputRef.current?.focus();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-md border border-line p-5 mb-2">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          ref={nameInputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama sesi, misal: Pre Test 1"
          className="flex-1 px-3 py-2.5 rounded-sm border border-line text-sm focus:border-amber outline-none"
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Kode unik global"
          className="sm:w-48 px-3 py-2.5 rounded-sm border border-line text-sm font-mono focus:border-amber outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-sm bg-ink text-white text-sm font-medium hover:bg-ink/90 disabled:opacity-50 whitespace-nowrap"
        >
          + Buat sesi
        </button>
      </div>
      {error && <p className="text-bad text-sm mt-2">{error}</p>}
    </form>
  );
}
