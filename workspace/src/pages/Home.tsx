import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Play, Sparkles } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import LibraryCatalog from "@/components/LibraryCatalog";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import { useGrammarStore } from "@/stores/useGrammarStore";

export default function Home() {
  const navigate = useNavigate();
  const bank = useGrammarStore((s) => s.bank);
  const issues = useGrammarStore((s) => s.issues);
  const config = useGrammarStore((s) => s.config);
  const selectedCategory = useGrammarStore((s) => s.selectedCategory);
  const selectedSubcategory = useGrammarStore((s) => s.selectedSubcategory);
  const setConfig = useGrammarStore((s) => s.setConfig);
  const loadFiles = useGrammarStore((s) => s.loadFiles);
  const loadSample = useGrammarStore((s) => s.loadSample);
  const startSession = useGrammarStore((s) => s.startSession);
  const progress = useGrammarStore((s) => s.progress);

  const missedCount = useMemo(() => Object.keys(progress.missed).length, [progress.missed]);
  const eligibleCount = useMemo(() => {
    let filtered = bank;
    if (config.category) filtered = filtered.filter((q) => q.question.category === config.category);
    if (config.subcategory) filtered = filtered.filter((q) => q.question.subcategory === config.subcategory);
    if (config.mode === "missed") {
      const missed = new Set(Object.keys(progress.missed));
      filtered = filtered.filter((q) => missed.has(q.id));
    }
    return filtered.length;
  }, [bank, config.category, config.mode, config.subcategory, progress.missed]);

  return (
    <div className="min-w-0 flex flex-col gap-6">
      <div className="hidden">
        <FileDropZone
          onFiles={(files) => {
            void loadFiles(files);
          }}
        />
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-[Fraunces] text-xl font-semibold">Bundled question bank</div>
            <div className="mt-1 text-sm text-[color:var(--muted)]">
              Questions are loaded automatically from <code className="text-[color:var(--ink)]">src/data/*.json</code>.
              Add more JSON files there to expand the library.
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={loadSample}>
            Reload bundled data
          </Button>
        </div>
      </Card>

      {issues.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-black/5 p-2 dark:bg-white/10">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="font-[Fraunces] text-base font-semibold">Some items were skipped</div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">
                  {issues.length} issue{issues.length === 1 ? "" : "s"} found while parsing your JSON data.
                </div>
              </div>
            </div>
            <Button type="button" variant="secondary" onClick={loadSample}>
              Reload bundled data
            </Button>
          </div>

          <div className="mt-4 max-h-44 overflow-auto rounded-xl bg-white/45 p-3 text-xs ring-1 ring-[color:var(--border)] dark:bg-white/5">
            <ul className="space-y-1">
              {issues.slice(0, 50).map((it, idx) => (
                <li
                  key={`${it.fileName}_${it.itemIndex}_${idx}`}
                  className="break-words text-[color:var(--muted)]"
                >
                  <span className="text-[color:var(--ink)]">{it.fileName}</span>
                  <span> · item </span>
                  <span className="text-[color:var(--ink)]">{it.itemIndex}</span>
                  <span> · </span>
                  <span>{it.message}</span>
                  {it.rawPreview ? (
                    <>
                      <span> · object </span>
                      <code className="break-all text-[color:var(--ink)]">{it.rawPreview}</code>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      <div className="min-w-0 grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <LibraryCatalog />

        <div className="min-w-0 flex flex-col gap-6">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-[Fraunces] text-xl font-semibold">Start a session</div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">
                  {selectedCategory ? (
                    <span>
                      Focus: <span className="text-[color:var(--ink)]">{selectedCategory}</span>
                      {selectedSubcategory ? (
                        <span>
                          {" "}
                          / <span className="text-[color:var(--ink)]">{selectedSubcategory}</span>
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <span>Focus: All categories</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Pill>
                  <Sparkles size={14} />
                  {bank.length} ready
                </Pill>
                <Pill className={missedCount > 0 ? "" : "opacity-60"}>
                  Missed: <span className="font-semibold">{missedCount}</span>
                </Pill>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <div className="text-xs font-medium text-[color:var(--muted)]">Mode</div>
                <select
                  value={config.mode}
                  onChange={(e) => setConfig({ mode: e.target.value === "missed" ? "missed" : "all" })}
                  className="w-full rounded-xl bg-white/55 px-3 py-2 text-sm ring-1 ring-[color:var(--border)] outline-none focus:ring-2 focus:ring-[color:var(--accent)] dark:bg-white/10"
                >
                  <option value="all">All questions</option>
                  <option value="missed" disabled={missedCount === 0}>
                    Missed only
                  </option>
                </select>
              </label>

              <label className="space-y-2">
                <div className="text-xs font-medium text-[color:var(--muted)]">Questions</div>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={config.questionCount}
                  onChange={(e) => setConfig({ questionCount: Number(e.target.value) || 1 })}
                  className="w-full rounded-xl bg-white/55 px-3 py-2 text-sm ring-1 ring-[color:var(--border)] outline-none focus:ring-2 focus:ring-[color:var(--accent)] dark:bg-white/10"
                />
              </label>

              <label className="col-span-1 flex items-center gap-3 rounded-xl bg-white/45 px-3 py-2 ring-1 ring-[color:var(--border)] dark:bg-white/5 md:col-span-2">
                <input
                  type="checkbox"
                  checked={config.revealExplanation}
                  onChange={(e) => setConfig({ revealExplanation: e.target.checked })}
                  className="h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--accent)]"
                />
                <div className="text-sm">
                  Reveal explanation after each answer <span className="text-xs text-[color:var(--muted)]">(recommended)</span>
                </div>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="primary"
                disabled={eligibleCount === 0}
                onClick={() => {
                  startSession();
                  navigate("/practice");
                }}
              >
                <Play size={16} />
                Start practice
              </Button>

              <Button type="button" variant="ghost" onClick={() => navigate("/review")}>
                Go to review
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="font-[Fraunces] text-lg font-semibold">Expected JSON format</div>
            <div className="mt-2 text-sm text-[color:var(--muted)]">
              Each file can be a JSON array of objects, each object like:
            </div>
            <pre className="mt-3 overflow-auto rounded-xl bg-white/45 p-3 text-xs ring-1 ring-[color:var(--border)] dark:bg-white/5">
{`{
  "category": "Tenses",
  "subcategory": "Past Simple",
  "question": "We _____ (play) soccer at the park yesterday.",
  "options": ["play", "played", "playing", "plays"],
  "correctAnswer": "played",
  "explanation": "For regular verbs in the Past Simple, we add '-ed' to the end of the base verb."
}`}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}
