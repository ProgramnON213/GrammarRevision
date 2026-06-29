import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Repeat, TriangleAlert } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import { useGrammarStore } from "@/stores/useGrammarStore";

export default function Review() {
  const navigate = useNavigate();
  const bank = useGrammarStore((s) => s.bank);
  const progress = useGrammarStore((s) => s.progress);
  const lastSessionMissed = useGrammarStore((s) => s.lastSessionMissed);
  const setConfig = useGrammarStore((s) => s.setConfig);
  const startSession = useGrammarStore((s) => s.startSession);

  const [scope, setScope] = useState<"session" | "all">("session");

  const missedIds = useMemo(() => {
    if (scope === "session") return lastSessionMissed;
    return Object.keys(progress.missed);
  }, [lastSessionMissed, progress.missed, scope]);

  const missedItems = useMemo(() => {
    const setIds = new Set(missedIds);
    return bank.filter((q) => setIds.has(q.id));
  }, [bank, missedIds]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-[Fraunces] text-xl font-semibold">Review mistakes</div>
            <div className="mt-1 text-sm text-[color:var(--muted)]">
              See what you missed, then retry those items until they stick.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={scope === "session" ? "primary" : "secondary"}
              onClick={() => setScope("session")}
              disabled={lastSessionMissed.length === 0}
            >
              Last session
            </Button>
            <Button
              type="button"
              variant={scope === "all" ? "primary" : "secondary"}
              onClick={() => setScope("all")}
              disabled={Object.keys(progress.missed).length === 0}
            >
              All-time
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Pill>
            <TriangleAlert size={14} />
            {missedItems.length} missed question{missedItems.length === 1 ? "" : "s"}
          </Pill>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/")}>
              <BookOpen size={16} />
              Library
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={missedItems.length === 0}
              onClick={() => {
                setConfig({ mode: "missed" });
                startSession();
                navigate("/practice");
              }}
            >
              <Repeat size={16} />
              Practice missed
            </Button>
          </div>
        </div>
      </Card>

      {missedItems.length === 0 ? (
        <Card className="p-6">
          <div className="font-[Fraunces] text-lg font-semibold">Nothing to review</div>
          <div className="mt-2 text-sm text-[color:var(--muted)]">
            Answer a few questions first, then your missed items will show up here.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {missedItems.slice(0, 100).map((q) => (
            <Card key={q.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">
                    {q.question.category} / {q.question.subcategory}
                  </div>
                  <div className="font-[Fraunces] text-lg font-semibold">{q.question.question}</div>
                </div>
                <Pill className="shrink-0">
                  Missed <span className="font-semibold">{progress.missed[q.id]?.count ?? 1}</span>x
                </Pill>
              </div>

              <div className="mt-4 rounded-2xl bg-white/45 p-4 ring-1 ring-[color:var(--border)] dark:bg-white/5">
                <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">Answer</div>
                <div className="mt-2 text-sm">
                  <span className="text-[color:var(--muted)]">Correct: </span>
                  <span className="font-semibold text-[color:var(--ink)]">{q.question.correctAnswer}</span>
                </div>
                <div className="mt-2 text-sm text-[color:var(--muted)]">{q.question.explanation}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

