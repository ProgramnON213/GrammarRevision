import { useMemo, useRef, useState } from "react";
import { Download, Eraser, Upload } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useGrammarStore } from "@/stores/useGrammarStore";

export default function Settings() {
  const progress = useGrammarStore((s) => s.progress);
  const clearProgress = useGrammarStore((s) => s.clearProgress);
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
    </div>
  );
}
