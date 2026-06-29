import { useMemo } from "react";
import { ChartNoAxesColumn, Target } from "lucide-react";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import { useGrammarStore } from "@/stores/useGrammarStore";

export default function Progress() {
  const bank = useGrammarStore((s) => s.bank);
  const progress = useGrammarStore((s) => s.progress);

  const summary = useMemo(() => {
    const ids = Object.keys(progress.answered);
    let attempts = 0;
    let correct = 0;

    for (const id of ids) {
      const r = progress.answered[id];
      attempts += r.attempts;
      correct += r.correct;
    }

    return {
      questionsTouched: ids.length,
      attempts,
      correct,
      accuracy: attempts === 0 ? 0 : Math.round((correct / attempts) * 100),
      missedUnique: Object.keys(progress.missed).length,
    };
  }, [progress.answered, progress.missed]);

  const byCategory = useMemo(() => {
    const map = new Map<string, { attempts: number; correct: number }>();
    const idToQuestion = new Map(bank.map((b) => [b.id, b.question]));
    for (const [id, r] of Object.entries(progress.answered)) {
      const q = idToQuestion.get(id);
      if (!q) continue;
      const prev = map.get(q.category) ?? { attempts: 0, correct: 0 };
      map.set(q.category, { attempts: prev.attempts + r.attempts, correct: prev.correct + r.correct });
    }
    const rows = [...map.entries()].map(([category, v]) => ({
      category,
      attempts: v.attempts,
      correct: v.correct,
      accuracy: v.attempts === 0 ? 0 : Math.round((v.correct / v.attempts) * 100),
    }));
    rows.sort((a, b) => b.attempts - a.attempts);
    return rows;
  }, [bank, progress.answered]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-[Fraunces] text-xl font-semibold">Progress</div>
            <div className="mt-1 text-sm text-[color:var(--muted)]">Stored locally in your browser.</div>
          </div>
          <Pill>
            <ChartNoAxesColumn size={14} />
            {summary.accuracy}% accuracy
          </Pill>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white/45 p-4 ring-1 ring-[color:var(--border)] dark:bg-white/5">
            <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">Attempts</div>
            <div className="mt-2 font-[Fraunces] text-3xl font-semibold">{summary.attempts}</div>
          </div>
          <div className="rounded-2xl bg-white/45 p-4 ring-1 ring-[color:var(--border)] dark:bg-white/5">
            <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">Correct</div>
            <div className="mt-2 font-[Fraunces] text-3xl font-semibold">{summary.correct}</div>
          </div>
          <div className="rounded-2xl bg-white/45 p-4 ring-1 ring-[color:var(--border)] dark:bg-white/5">
            <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">Questions touched</div>
            <div className="mt-2 font-[Fraunces] text-3xl font-semibold">{summary.questionsTouched}</div>
          </div>
          <div className="rounded-2xl bg-white/45 p-4 ring-1 ring-[color:var(--border)] dark:bg-white/5">
            <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">Missed (unique)</div>
            <div className="mt-2 font-[Fraunces] text-3xl font-semibold">{summary.missedUnique}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="font-[Fraunces] text-lg font-semibold">By category</div>
          <Pill>
            <Target size={14} />
            {byCategory.length} categories
          </Pill>
        </div>

        {byCategory.length === 0 ? (
          <div className="mt-4 text-sm text-[color:var(--muted)]">No answers yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {byCategory.slice(0, 20).map((row) => (
              <div key={row.category} className="rounded-2xl bg-white/45 p-4 ring-1 ring-[color:var(--border)] dark:bg-white/5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{row.category}</div>
                  <div className="text-xs text-[color:var(--muted)]">
                    {row.correct}/{row.attempts} · {row.accuracy}%
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-[color:var(--accent)]"
                    style={{ width: `${row.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

