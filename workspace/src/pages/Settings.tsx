import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Download, Eraser, Upload } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FileDropZone from "@/components/FileDropZone";
import { useGrammarStore } from "@/stores/useGrammarStore";

export default function Settings() {
  const progress = useGrammarStore((s) => s.progress);
  const clearProgress = useGrammarStore((s) => s.clearProgress);
  const bank = useGrammarStore((s) => s.bank);
  const issues = useGrammarStore((s) => s.issues);
  const loadFiles = useGrammarStore((s) => s.loadFiles);
  const loadSample = useGrammarStore((s) => s.loadSample);

  const [importError, setImportError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const exportJson = useMemo(() => JSON.stringify(progress, null, 2), [progress]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <div className="font-[Fraunces] text-xl font-semibold">Settings</div>
        <div className="mt-2 text-sm text-[color:var(--muted)]">Everything is stored in your browser.</div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-[Fraunces] text-lg font-semibold">Progress data</div>
            <div className="mt-1 text-sm text-[color:var(--muted)]">Export a backup or wipe your history.</div>
          </div>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              clearProgress();
              setImportError(null);
            }}
          >
            <Eraser size={16} />
            Clear progress
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-white/45 p-4 ring-1 ring-[color:var(--border)] dark:bg-white/5">
            <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">Export</div>
            <div className="mt-2 text-sm text-[color:var(--muted)]">
              Download a JSON file you can import later.
            </div>
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const blob = new Blob([exportJson], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "grammar-progress.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download size={16} />
                Download backup
              </Button>
            </div>
            <pre className="mt-4 max-h-56 overflow-auto rounded-xl bg-black/5 p-3 text-xs text-[color:var(--muted)] dark:bg-white/5">
              {exportJson}
            </pre>
          </div>

          <div className="rounded-2xl bg-white/45 p-4 ring-1 ring-[color:var(--border)] dark:bg-white/5">
            <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">Import</div>
            <div className="mt-2 text-sm text-[color:var(--muted)]">
              Import a previously exported progress JSON.
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex">
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={async (e) => {
                    setImportError(null);
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const txt = await file.text();
                      const parsed = JSON.parse(txt) as { version: number };
                      if (!parsed || parsed.version !== 1) {
                        setImportError("Invalid progress file (version mismatch).");
                        return;
                      }
                      localStorage.setItem("grammar-progress-v1", JSON.stringify(parsed));
                      window.location.reload();
                    } catch {
                      setImportError("Could not read that file as JSON.");
                    } finally {
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => importInputRef.current?.click()}
                >
                  <Upload size={16} />
                  Choose file
                </Button>
              </div>
              {importError && <span className="text-sm text-rose-600 dark:text-rose-300">{importError}</span>}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div>
          <div className="font-[Fraunces] text-lg font-semibold">Developer & Teacher Tools</div>
          <div className="mt-1 text-sm text-[color:var(--muted)]">
            Manage custom question files, import custom question banks, and review formatting guidelines.
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <FileDropZone
              onFiles={(files) => {
                void loadFiles(files);
              }}
            />
          </div>

          <div className="rounded-2xl bg-white/45 p-4 ring-1 ring-[color:var(--border)] dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Bundled Question Bank</div>
                <div className="mt-1 text-xs text-[color:var(--muted)]">
                  Contains {bank.length} questions loaded from the codebase.
                </div>
              </div>
              <Button type="button" variant="secondary" onClick={loadSample}>
                Reload Bundled Data
              </Button>
            </div>
          </div>

          {issues.length > 0 && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 ring-1 ring-[color:var(--border)]">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="font-[Fraunces] text-base font-semibold text-rose-900 dark:text-rose-200">
                    Import Warnings & Issues ({issues.length})
                  </div>
                  <div className="mt-1 text-xs text-[color:var(--muted)]">
                    Some items were skipped during parsing. Review the logs below:
                  </div>
                </div>
              </div>

              <div className="mt-4 max-h-44 overflow-auto rounded-xl bg-white/45 p-3 text-xs ring-1 ring-[color:var(--border)] dark:bg-white/5">
                <ul className="space-y-1">
                  {issues.slice(0, 50).map((it, idx) => (
                    <li
                      key={`${it.fileName}_${it.itemIndex}_${idx}`}
                      className="break-words text-[color:var(--muted)]"
                    >
                      <span className="text-[color:var(--ink)] font-semibold">{it.fileName}</span>
                      <span> · item </span>
                      <span className="text-[color:var(--ink)]">{it.itemIndex}</span>
                      <span> · </span>
                      <span className="text-rose-600 dark:text-rose-300">{it.message}</span>
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
            </div>
          )}

          <div className="rounded-2xl bg-white/45 p-4 ring-1 ring-[color:var(--border)] dark:bg-white/5">
            <div className="text-sm font-semibold">Expected Question JSON Format</div>
            <div className="mt-2 text-xs text-[color:var(--muted)]">
              Each file must be a JSON array of objects, conforming to the structure below:
            </div>
            <pre className="mt-3 overflow-auto rounded-xl bg-black/5 p-3 text-xs text-[color:var(--muted)] dark:bg-white/5">
{`[
  {
    "category": "Tenses",
    "subcategory": "Past Simple",
    "question": "We _____ (play) soccer at the park yesterday.",
    "options": ["play", "played", "playing", "plays"],
    "correctAnswer": "played",
    "explanation": "For regular verbs in the Past Simple, we add '-ed' to the end of the base verb."
  }
]`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
