"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ExamResult, PublicQuestion, SubmittedAnswer } from "@/types/database";
import { verifyCodeAndFetchQuestionsAction, submitExamAction } from "../actions";

type Stage = "code" | "loading" | "exam" | "done";

export function ExamClient({
  sessionId,
  sessionName,
}: {
  sessionId: string;
  sessionName: string;
}): React.JSX.Element {
  const [stage, setStage] = useState<Stage>("code");
  const [studentName, setStudentName] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [result, setResult] = useState<ExamResult | null>(null);

  const handleVerify = async (): Promise<void> => {
    if (!studentName.trim() || !code.trim()) return;
    setStage("loading");
    const response = await verifyCodeAndFetchQuestionsAction(sessionId, code);
    if (!response.success || !response.data) {
      setCodeError(response.message ?? "Kode unik tidak sesuai untuk sesi ini.");
      setStage("code");
      return;
    }
    if (response.data.questions.length === 0) {
      setCodeError("Sesi ini belum memiliki soal. Hubungi admin laboratorium.");
      setStage("code");
      return;
    }
    setQuestions(response.data.questions);
    setStage("exam");
  };

  const handleFinish = async (answers: SubmittedAnswer[]): Promise<void> => {
    setStage("loading");
    const response = await submitExamAction(sessionId, code, studentName, answers);
    if (!response.success || !response.data) {
      setCodeError(response.message ?? "Gagal menyimpan hasil ujian.");
      setStage("code");
      return;
    }
    setResult(response.data);
    setStage("done");
  };

  if (stage === "code" || stage === "loading") {
    return (
      <div className="min-h-screen px-6 py-10 max-w-md mx-auto flex flex-col justify-center bg-ink grain">
        <Link href="/exam" className="text-white/40 text-sm mb-8 hover:text-white self-start">
          ← ganti sesi
        </Link>
        <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">Langkah 2 dari 3</p>
        <h1 className="font-display text-2xl text-white mb-1">{sessionName}</h1>
        <p className="text-white/45 mb-6">Masukkan nama dan kode unik untuk membuka soal.</p>

        <input
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Nama lengkap"
          disabled={stage === "loading"}
          className="w-full px-3 py-2.5 rounded-sm bg-white/5 border border-white/15 text-white placeholder:text-white/30 mb-3 focus:border-amber outline-none disabled:opacity-50"
        />
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setCodeError(null);
          }}
          placeholder="Kode unik"
          disabled={stage === "loading"}
          className="w-full px-3 py-2.5 rounded-sm bg-white/5 border border-white/15 text-white font-mono placeholder:text-white/30 mb-2 focus:border-amber outline-none disabled:opacity-50"
        />
        {codeError ? <p className="text-bad text-sm mb-3">{codeError}</p> : <div className="mb-3" />}

        <button
          onClick={handleVerify}
          disabled={!studentName.trim() || !code.trim() || stage === "loading"}
          className="w-full py-2.5 rounded-sm bg-amber text-ink font-medium disabled:opacity-30"
        >
          {stage === "loading" ? "Memeriksa…" : "Buka soal"}
        </button>
      </div>
    );
  }

  if (stage === "exam") {
    return (
      <ExamRunner questions={questions} studentName={studentName} onFinish={handleFinish} />
    );
  }

  if (stage === "done" && result) {
    const pct = result.maxScore > 0 ? Math.round((result.totalScore / result.maxScore) * 100) : 0;
    return (
      <div className="min-h-screen px-6 py-10 max-w-lg mx-auto flex flex-col justify-center text-center bg-ink grain">
        <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">
          Langkah 3 dari 3 — Selesai
        </p>
        <h1 className="font-display text-3xl text-white mb-4">Ujian selesai, {studentName}.</h1>
        <div className="font-display text-7xl text-amber mb-2">{result.totalScore}</div>
        <p className="text-white/45 mb-8">
          dari maksimal {result.maxScore} poin · {pct}%
        </p>

        <div className="bg-white/5 border border-white/10 rounded-md p-5 mb-8 text-left">
          {result.answers.map((a, i) => (
            <div
              key={a.questionId}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 text-sm"
            >
              <span className="text-white/65">Soal {i + 1}</span>
              <span className={a.isCorrect ? "text-ok" : "text-bad"}>
                {a.isCorrect ? `+${a.score}` : "0"} poin
              </span>
            </div>
          ))}
        </div>

        <Link href="/" className="text-white/50 hover:text-white text-sm">
          ← kembali ke halaman utama
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="text-amberSoft font-mono text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber pulse" />
        memuat…
      </div>
    </div>
  );
}

function ExamRunner({
  questions,
  studentName,
  onFinish,
}: {
  questions: PublicQuestion[];
  studentName: string;
  onFinish: (answers: SubmittedAnswer[]) => void;
}): React.JSX.Element {
  const [idx, setIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const firstQuestion = questions[0];
  const [timeLeft, setTimeLeft] = useState<number>(firstQuestion ? firstQuestion.durationSec : 0);
  const answersRef = useRef<SubmittedAnswer[]>([]);
  const currentAnswerRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);

  const question = questions[idx];

  useEffect(() => {
    currentAnswerRef.current = currentAnswer;
  }, [currentAnswer]);

  const commitAndAdvance = useCallback(
    (rawAnswer: string): void => {
      if (!question || finishedRef.current) return;
      const entry: SubmittedAnswer = { questionId: question.id, givenAnswer: rawAnswer };
      answersRef.current = [...answersRef.current, entry];

      const isLast = idx + 1 >= questions.length;
      if (isLast) {
        finishedRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);
        onFinish(answersRef.current);
        return;
      }

      const next = questions[idx + 1];
      setIdx((i) => i + 1);
      setCurrentAnswer("");
      setTimeLeft(next ? next.durationSec : 0);
    },
    [idx, question, questions, onFinish]
  );

  useEffect(() => {
    if (!question) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          commitAndAdvance(currentAnswerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center bg-ink">
        <p className="text-white/60">Sesi ini belum memiliki soal.</p>
      </div>
    );
  }

  const totalDuration = question.durationSec || 1;
  const pct = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));
  const urgent = pct < 25;

  return (
    <div className="min-h-screen px-6 py-8 max-w-2xl mx-auto flex flex-col bg-ink grain">
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-xs text-white/40">{studentName}</span>
        <span className="font-mono text-xs text-white/40">
          Soal {idx + 1} / {questions.length}
        </span>
      </div>

      <div className="h-1.5 bg-white/10 rounded-full mb-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${urgent ? "bg-bad" : "bg-amber"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-end mb-8">
        <span className={`font-mono text-sm ${urgent ? "text-bad" : "text-white/50"}`}>
          {timeLeft}s tersisa
        </span>
      </div>

      <div className="flex-1">
        <p className="font-mono text-xs text-amber mb-3">{question.score} poin</p>
        <h2 className="font-display text-2xl text-white mb-8 leading-relaxed">{question.text}</h2>

        {question.type === "pg" && question.options ? (
          <div className="space-y-3">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setCurrentAnswer(opt)}
                className={`w-full text-left px-4 py-3.5 rounded-md border transition-colors flex items-center gap-3 ${
                  currentAnswer === opt
                    ? "border-amber bg-amber/10 text-white"
                    : "border-white/15 text-white/70 hover:border-white/30"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Ketik jawaban di sini…"
            autoFocus
            className="w-full px-4 py-3.5 rounded-md bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:border-amber outline-none"
          />
        )}
      </div>

      <button
        onClick={() => commitAndAdvance(currentAnswer)}
        disabled={!currentAnswer.trim()}
        className="mt-8 w-full py-3 rounded-sm bg-amber text-ink font-medium disabled:opacity-30"
      >
        {idx + 1 === questions.length ? "Selesaikan ujian" : "Jawab & lanjut →"}
      </button>
    </div>
  );
}
