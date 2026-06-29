import { useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function FileDropZone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const accept = useMemo(() => ".json,application/json,text/plain", []);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (disabled) return;
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        if (disabled) return;
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter((f) => f.name.toLowerCase().endsWith(".json"));
        if (files.length > 0) onFiles(files);
      }}
      className={cn(
        "relative rounded-2xl p-5 ring-1 ring-[color:var(--border)] transition",
        "bg-white/40 dark:bg-white/5",
        dragOver && "ring-2 ring-[color:var(--accent)] bg-white/60 dark:bg-white/10",
        disabled && "opacity-60"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-black/5 p-2 dark:bg-white/10">
            <Upload size={18} />
          </div>
          <div>
            <div className="font-[Fraunces] text-base font-semibold">Load your JSON question bank</div>
            <div className="mt-1 text-sm text-[color:var(--muted)]">
              Drop one or more .json files here, or choose files. Each file can be an array of objects like your sample.
            </div>
          </div>
        </div>

        <div className="inline-flex">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            disabled={disabled}
            className="hidden"
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              if (files.length > 0) onFiles(files);
              e.currentTarget.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            Choose files
          </Button>
        </div>
      </div>
    </div>
  );
}
