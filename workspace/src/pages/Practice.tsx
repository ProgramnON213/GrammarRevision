import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Flag, Home, XCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import { useGrammarStore } from "@/stores/useGrammarStore";

export default function Practice() {
  const navigate = useNavigate();
  const bank = useGrammarStore((s) => s.bank);
  const session = useGrammarStore((s) => s.session);
  const answerCurrent = useGrammarStore((s) => s.answerCurrent);
  const goNext = useGrammarStore((s) => s.goNext);
  const goPrev = useGrammarStore((s) => s.goPrev);
  const endSession = useGrammarStore((s) => s.endSession);

  const current = useMemo(() => {
    if (!session) return null;
    const id = session.questionIds[session.index];
    return bank.find((q) => q.id === id) ?? null;
  }, [bank, session]);

  const currentId = session ? session.questionIds[session.index] : null;
  const answered = currentId && session ? session.answered[currentId] : null;
  const progressPct = session ? Math.round(((session.index + 1) / session.questionIds.length) * 100) : 0;

  const counts = useMemo(() => {
    if (!session) return { correct: 0, wrong: 0, answered: 0 };
    const vals = Object.values(session.answered);
    const correct = vals.filter((v) => v.correct).length;
    const answeredCount = vals.length;
    return { correct, wrong: answeredCount - correct, answered: answeredCount };
  }, [session]);

  useEffect(() => {
    if (!session || !current || answered) return;
    const handler = (e: KeyboardEvent) => {
      if (!current) return;
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx < 0) return;
      const choice = current.question.options[idx];
      if (choice) answerCurrent(choice);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answerCurrent, answered, current, session]);

  if (!session || !current) {
    return (
      <Card className="p-6">
        <div className="font-[Fraunces] text-xl font-semibold">No active session</div>
        <div className="mt-2 text-sm text-[color:var(--muted)]">
          Start a practice session from the Library page.
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" variant="primary" onClick={() => navigate("/")}>
            <Home size={16} />
            Go to library
          </Button>
        </div>
      </Card>
    );
  }

  const atFirst = session.index === 0;
  const atLast = session.index === session.questionIds.length - 1;
  const canFinish = atLast && !!answered;

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-[Fraunces] text-lg font-semibold">Practice</div>
            <div className="text-sm text-[color:var(--muted)]">
              {session.config.subcategory !== null || !!answered
                ? `${current.question.category} / ${current.question.subcategory}`
                : current.question.category}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Pill>
              <span className="font-semibold">{session.index + 1}</span> / {session.questionIds.length}
            </Pill>
            <Pill className="hidden sm:inline-flex">
              <CheckCircle2 size={14} />
              {counts.correct}
            </Pill>
            <Pill className="hidden sm:inline-flex">
              <XCircle size={14} />
              {counts.wrong}
            </Pill>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-[color:var(--accent)] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">Question</div>
        <div className="mt-2 text-balance font-[Fraunces] text-2xl leading-tight">{current.question.question}</div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {current.question.options.map((opt, idx) => {
            const chosen = answered?.chosen === opt;
            const isCorrect = opt === current.question.correctAnswer;
            const locked = !!answered;

            const tone = locked
              ? isCorrect
                ? "ring-2 ring-emerald-500/70 bg-emerald-500/10"
                : chosen
                  ? "ring-2 ring-rose-500/70 bg-rose-500/10"
                  : "ring-1 ring-[color:var(--border)] bg-white/45 dark:bg-white/5"
              : "ring-1 ring-[color:var(--border)] bg-white/45 hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10";

            return (
              <button
                key={opt}
                type="button"
                disabled={locked}
                onClick={() => answerCurrent(opt)}
                className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition ${tone}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-[color:var(--muted)]">{idx + 1}</div>
                  <div className="text-sm font-medium text-[color:var(--ink)]">{opt}</div>
                </div>
                <div className="text-[color:var(--muted)]">
                  {locked ? (
                    isCorrect ? (
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-300" />
                    ) : chosen ? (
                      <XCircle size={18} className="text-rose-600 dark:text-rose-300" />
                    ) : (
                      <Circle size={18} />
                    )
                  ) : (
                    <Circle size={18} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {answered && session.config.revealExplanation && (
          <div className="mt-6 rounded-2xl bg-black/5 p-4 ring-1 ring-[color:var(--border)] dark:bg-white/5">
            <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">Why</div>
            <div className="mt-2 text-sm text-[color:var(--ink)]">{current.question.explanation}</div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button type="button" variant="secondary" disabled={atFirst} onClick={goPrev}>
              <ArrowLeft size={16} />
              Prev
            </Button>
            <Button type="button" variant="secondary" disabled={atLast} onClick={goNext}>
              Next
              <ArrowRight size={16} />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate("/")}>
              Library
            </Button>
            <Button
              type="button"
              variant={canFinish ? "primary" : "secondary"}
              disabled={!canFinish}
              onClick={() => {
                endSession();
                navigate("/review");
              }}
            >
              <Flag size={16} />
              Finish
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

