import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import LibraryCatalog from "@/components/LibraryCatalog";
import { useGrammarStore } from "@/stores/useGrammarStore";

export default function Home() {
  const navigate = useNavigate();
  const bank = useGrammarStore((s) => s.bank);
  const config = useGrammarStore((s) => s.config);
  const selectedCategory = useGrammarStore((s) => s.selectedCategory);
  const selectedSubcategory = useGrammarStore((s) => s.selectedSubcategory);
  const setSelectedCategory = useGrammarStore((s) => s.setSelectedCategory);
  const setSelectedSubcategory = useGrammarStore((s) => s.setSelectedSubcategory);
  const setConfig = useGrammarStore((s) => s.setConfig);
  const startSession = useGrammarStore((s) => s.startSession);
  const progress = useGrammarStore((s) => s.progress);

  const missedCount = useMemo(() => Object.keys(progress.missed).length, [progress.missed]);

  const eligibleQuestions = useMemo(() => {
    let filtered = bank;
    if (selectedCategory) filtered = filtered.filter((q) => q.question.category === selectedCategory);
    if (selectedSubcategory) filtered = filtered.filter((q) => q.question.subcategory === selectedSubcategory);
    return filtered;
  }, [bank, selectedCategory, selectedSubcategory]);

  const maxQuestions = Math.min(50, eligibleQuestions.length);
  const minQuestions = Math.min(5, eligibleQuestions.length);
  const currentCountVal = Math.min(config.questionCount, eligibleQuestions.length) || minQuestions;

  const sampleQuestions = useMemo(() => {
    return eligibleQuestions.slice(0, 3);
  }, [eligibleQuestions]);

  const hasSelection = selectedCategory !== null;

  const previewContent = (
    <div className="flex flex-col h-full gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">Selected Topic</span>
          <h2 className="font-[Fraunces] text-2xl font-bold leading-tight mt-1 truncate text-[color:var(--ink)]">
            {selectedCategory}
          </h2>
          {selectedSubcategory && (
            <div className="text-sm text-[color:var(--muted)] mt-1 truncate">
              Subcategory: <span className="text-[color:var(--ink)] font-semibold">{selectedSubcategory}</span>
            </div>
          )}
        </div>
        <div className="flex items-center shrink-0">
          <Pill>
            {eligibleQuestions.length} questions
          </Pill>
        </div>
      </div>

      {/* Sample Questions Preview */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">Sample Questions</h3>
        <div className="space-y-2">
          {sampleQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="text-sm p-3 rounded-xl bg-white/45 ring-1 ring-[color:var(--border)] dark:bg-white/5 font-[Fraunces] text-[color:var(--ink)]"
            >
              <span className="font-semibold text-xs text-[color:var(--muted)] mr-2">{idx + 1}.</span>
              {q.question.question}
            </div>
          ))}
          {sampleQuestions.length === 0 && (
            <div className="text-xs text-[color:var(--muted)] p-3 text-center">
              No questions found for this selection.
            </div>
          )}
        </div>
      </div>

      {/* Configuration Settings */}
      <div className="space-y-4 rounded-2xl bg-black/5 p-4 dark:bg-white/5 ring-1 ring-[color:var(--border)] mt-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">Session Options</h3>

        {/* Mode Selector - Premium Buttons */}
        <div className="space-y-2">
          <span className="text-xs text-[color:var(--muted)] block">Practice Mode</span>
          <div className="grid grid-cols-2 gap-2 bg-black/5 p-1 rounded-xl dark:bg-white/5">
            <button
              type="button"
              onClick={() => setConfig({ mode: "all" })}
              className={cn(
                "py-1.5 px-3 rounded-lg text-xs font-semibold transition-all",
                config.mode === "all"
                  ? "bg-white text-[color:var(--ink)] shadow-sm dark:bg-white/10 dark:text-white"
                  : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
              )}
            >
              All questions
            </button>
            <button
              type="button"
              disabled={missedCount === 0}
              onClick={() => setConfig({ mode: "missed" })}
              className={cn(
                "py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                config.mode === "missed"
                  ? "bg-white text-[color:var(--ink)] shadow-sm dark:bg-white/10 dark:text-white"
                  : "text-[color:var(--muted)] hover:text-[color:var(--ink)] disabled:opacity-50"
              )}
            >
              Missed only
              {missedCount > 0 && (
                <span className="bg-rose-500 text-white rounded-full px-1.5 py-0.2 text-[9px] font-bold">
                  {missedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Question Count Slider */}
        {maxQuestions > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[color:var(--muted)]">
              <span>Question limit</span>
              <span className="font-semibold text-[color:var(--ink)]">{currentCountVal}</span>
            </div>
            <input
              type="range"
              min={minQuestions}
              max={maxQuestions}
              step={1}
              value={currentCountVal}
              onChange={(e) => setConfig({ questionCount: Number(e.target.value) })}
              className="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[color:var(--accent)] dark:bg-white/10"
            />
          </div>
        )}

        {/* Explanation Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setConfig({ revealExplanation: !config.revealExplanation })}
            className="flex items-center gap-3 w-full text-left"
          >
            <div className={cn(
              "w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 shrink-0",
              config.revealExplanation ? "bg-[color:var(--accent)]" : "bg-black/20 dark:bg-white/25"
            )}>
              <div className={cn(
                "w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
                config.revealExplanation ? "translate-x-4" : "translate-x-0"
              )} />
            </div>
            <span className="text-xs font-medium text-[color:var(--ink)]">Reveal explanations after answering</span>
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-auto pt-4 flex gap-3">
        <Button
          type="button"
          variant="primary"
          className="flex-1 justify-center py-3 text-base rounded-2xl shadow-md"
          disabled={eligibleQuestions.length === 0}
          onClick={() => {
            startSession();
            navigate("/practice");
          }}
        >
          <Play size={18} className="fill-current mr-2" />
          Start Practice
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="px-4 rounded-2xl"
          onClick={() => {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
          }}
        >
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-w-0 flex flex-col gap-6">
      {/* Responsive Grid */}
      <div className="min-w-0 grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
        {/* Left: Library Catalog */}
        <div className={cn("min-w-0", hasSelection ? "hidden lg:block" : "block")}>
          <LibraryCatalog />
        </div>

        {/* Right: Desktop Preview Panel */}
        <div className="hidden lg:block">
          {hasSelection ? (
            <Card className="p-6 h-full border border-[color:var(--border)] min-h-[500px]">
              {previewContent}
            </Card>
          ) : (
            <Card className="p-6 h-full flex flex-col items-center justify-center text-center border border-[color:var(--border)] min-h-[500px] bg-white/35 dark:bg-white/5 backdrop-blur-sm">
              <div className="p-4 rounded-full bg-black/5 dark:bg-white/5 mb-4 text-[color:var(--muted)]">
                <BookOpen size={32} />
              </div>
              <h2 className="font-[Fraunces] text-xl font-bold mb-1">Select a Topic</h2>
              <p className="text-sm text-[color:var(--muted)] max-w-xs">
                Choose a grammar category or subcategory from the library catalog to preview sample questions and start your practice session.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile Drawer Slide-up Sheet */}
      {hasSelection && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSubcategory(null);
            }}
          />
          {/* Drawer sheet container */}
          <div className="relative w-full max-h-[85vh] bg-[color:var(--paper)] text-[color:var(--ink)] rounded-t-[32px] p-6 shadow-2xl overflow-y-auto z-10 border-t border-[color:var(--border)] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Grab bar */}
            <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-5 shrink-0 dark:bg-white/15" />

            <button
              type="button"
              aria-label="Close details"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
              }}
            >
              <X size={18} />
            </button>

            {previewContent}
          </div>
        </div>
      )}
    </div>
  );
}
