"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PracticumSession, Question, QuestionType } from "@/types/database";
import { createQuestionAction, deleteQuestionAction, updateQuestionAction } from "./actions";

interface QuestionFormState {
  type: QuestionType;
  text: string;
  options: string[];
  answerKey: string;
  durationSec: number;
  score: number;
}

function emptyForm(): QuestionFormState {
  return { type: "pg", text: "", options: ["", "", "", ""], answerKey: "", durationSec: 60, score: 10 };
}

export function QuestionManager({
  sessions,
  questions,
}: {
  sessions: PracticumSession[];
  questions: Question[];
}): React.JSX.Element {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>(sessions[0]?.id ?? "");
  const [form, setForm] = useState<QuestionFormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!sessionId && sessions[0]) setSessionId(sessions[0].id);
  }, [sessions, sessionId]);

  const sessionQuestions = questions.filter((q) => q.sessionId === sessionId);

  const resetForm = (): void => {
    setForm(emptyForm());
    setEditingId(null);
    setError(null);
  };

  const handleSave = (): void => {
    if (!sessionId) {
      setError("Pilih sesi target terlebih dahulu.");
      return;
    }
    startTransition(async () => {
      const payload = {
        sessionId,
        type: form.type,
        text: form.text,
        options: form.type === "pg" ? form.options : null,
        answerKey: form.answerKey,
        durationSec: form.durationSec,
        score: form.score,
      };
      const result = editingId
        ? await updateQuestionAction({ ...payload, id: editingId })
        : await createQuestionAction(payload);

      if (!result.success) {
        setError(result.message ?? "Gagal menyimpan soal.");
        return;
      }
      resetForm();
      router.refresh();
    });
  };

  const handleEdit = (q: Question): void => {
    setEditingId(q.id);
    setForm({
      type: q.type,
      text: q.text,
      options: q.options ?? ["", "", "", ""],
      answerKey: q.answerKey,
      durationSec: q.durationSec,
      score: q.score,
    });
    setError(null);
  };

  const handleDelete = (id: string): void => {
    startTransition(async () => {
      const result = await deleteQuestionAction(id);
      if (!result.success) {
        setError(result.message ?? "Gagal menghapus soal.");
        return;
      }
      if (editingId === id) resetForm();
      router.refresh();
    });
  };

  return (
    <div>
      <div className="mb-6">
        <label className="text-sm text-slate mb-1 block">Sesi target</label>
        <select
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="px-3 py-2 rounded-sm border border-line bg-white text-sm"
        >
          {sessions.length === 0 && <option value="">Belum ada sesi — buat di tab Sesi</option>}
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-md border border-line p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          {(["pg", "isian"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, type: t })}
              className={`px-3 py-1.5 rounded-full text-xs font-mono border ${
                form.type === t ? "bg-ink text-white border-ink" : "border-line text-slate"
              }`}
            >
              {t === "pg" ? "Pilihan Ganda" : "Isian"}
            </button>
          ))}
        </div>

        <textarea
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          placeholder="Tulis pertanyaan…"
          rows={2}
          className="w-full px-3 py-2.5 rounded-sm border border-line text-sm mb-4 focus:border-amber outline-none resize-none"
        />

        {form.type === "pg" && (
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {form.options.map((opt, i) => (
              <input
                key={i}
                value={opt}
                onChange={(e) => {
                  const next = [...form.options];
                  next[i] = e.target.value;
                  setForm({ ...form, options: next });
                }}
                placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                className="px-3 py-2 rounded-sm border border-line text-sm focus:border-amber outline-none"
              />
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-4 gap-3 mb-2">
          <div>
            <label className="text-xs text-slate mb-1 block">Kunci jawaban</label>
            {form.type === "pg" ? (
              <select
                value={form.answerKey}
                onChange={(e) => setForm({ ...form, answerKey: e.target.value })}
                className="w-full px-3 py-2 rounded-sm border border-line text-sm"
              >
                <option value="">pilih opsi benar</option>
                {form.options.map(
                  (opt, i) =>
                    opt.trim() && (
                      <option key={i} value={opt}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </option>
                    )
                )}
              </select>
            ) : (
              <input
                value={form.answerKey}
                onChange={(e) => setForm({ ...form, answerKey: e.target.value })}
                placeholder="jawaban benar"
                className="w-full px-3 py-2 rounded-sm border border-line text-sm font-mono focus:border-amber outline-none"
              />
            )}
          </div>
          <div>
            <label className="text-xs text-slate mb-1 block">Waktu (detik)</label>
            <input
              type="number"
              min={5}
              value={form.durationSec}
              onChange={(e) => setForm({ ...form, durationSec: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-sm border border-line text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate mb-1 block">Skor</label>
            <input
              type="number"
              min={1}
              value={form.score}
              onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-sm border border-line text-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!sessionId || isPending}
              className="flex-1 py-2 rounded-sm bg-ink text-white text-sm font-medium disabled:opacity-40"
            >
              {editingId ? "Simpan perubahan" : "+ Tambah soal"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 rounded-sm border border-line text-sm"
              >
                Batal
              </button>
            )}
          </div>
        </div>
        {error && <p className="text-xs text-bad mt-2">{error}</p>}
      </div>

      {sessionQuestions.length === 0 ? (
        <div className="border border-dashed border-line rounded-md p-10 text-center text-slate">
          Belum ada soal untuk sesi ini.
        </div>
      ) : (
        <div className="space-y-2">
          {sessionQuestions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-md border border-line p-4 flex items-start gap-4">
              <span className="font-mono text-xs text-slate pt-1">{String(idx + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <p className="text-sm mb-1">{q.text}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate font-mono">
                  <span>{q.type === "pg" ? "Pilihan Ganda" : "Isian"}</span>
                  <span>{q.durationSec}s</span>
                  <span>{q.score} poin</span>
                  <span className="text-ok">kunci: {q.answerKey}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(q)} className="text-xs text-slate hover:text-ink">
                  Ubah
                </button>
                <button onClick={() => handleDelete(q.id)} className="text-xs text-slate hover:text-bad">
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
