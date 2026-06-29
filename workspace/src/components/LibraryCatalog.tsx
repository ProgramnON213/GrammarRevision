import { useMemo, useState } from "react";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGrammarStore } from "@/stores/useGrammarStore";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import { groupByCategory } from "@/utils/grammarBank";

export default function LibraryCatalog() {
  const bank = useGrammarStore((s) => s.bank);
  const selectedCategory = useGrammarStore((s) => s.selectedCategory);
  const selectedSubcategory = useGrammarStore((s) => s.selectedSubcategory);
  const setSelectedCategory = useGrammarStore((s) => s.setSelectedCategory);
  const setSelectedSubcategory = useGrammarStore((s) => s.setSelectedSubcategory);

  const [query, setQuery] = useState("");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => groupByCategory(bank), [bank]);

  const categories = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out: Array<{
      category: string;
      subs: Array<{ subcategory: string; count: number }>;
      count: number;
    }> = [];

    for (const [cat, subsMap] of grouped.entries()) {
      const subs: Array<{ subcategory: string; count: number }> = [];
      let count = 0;
      for (const [sub, items] of subsMap.entries()) {
        const matches = q.length === 0 || cat.toLowerCase().includes(q) || sub.toLowerCase().includes(q);
        if (!matches) continue;
        subs.push({ subcategory: sub, count: items.length });
        count += items.length;
      }
      if (subs.length > 0) out.push({ category: cat, subs: subs.sort((a, b) => a.subcategory.localeCompare(b.subcategory)), count });
    }

    return out.sort((a, b) => a.category.localeCompare(b.category));
  }, [grouped, query]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-[Fraunces] text-lg font-semibold">Library</div>
          <div className="text-sm text-[color:var(--muted)]">{bank.length} questions loaded</div>
        </div>
        <Pill className="hidden md:inline-flex">
          <span className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
          JSON
        </Pill>
      </div>

      <div className="mt-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories..."
          className={cn(
            "w-full rounded-xl bg-white/55 px-3 py-2 text-sm outline-none ring-1 ring-[color:var(--border)]",
            "placeholder:text-[color:var(--muted)] focus:ring-2 focus:ring-[color:var(--accent)] dark:bg-white/10"
          )}
        />
      </div>

      <div className="mt-4 max-h-[56vh] overflow-auto pr-1">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
          }}
          className={cn(
            "mb-3 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
            selectedCategory === null
              ? "bg-[color:var(--ink)] text-[color:var(--paper)]"
              : "hover:bg-black/5 dark:hover:bg-white/10"
          )}
        >
          <span>All questions</span>
          <span className="text-xs opacity-80">{bank.length}</span>
        </button>

        <div className="flex flex-col gap-2">
          {categories.map((cat) => {
            const isOpen = openCats[cat.category] ?? true;
            const isActiveCat = selectedCategory === cat.category;

            return (
              <div key={cat.category} className="rounded-xl ring-1 ring-[color:var(--border)]">
                <div
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition",
                    isActiveCat ? "bg-black/5 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/10"
                  )}
                >
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-2 rounded-lg py-1 text-left"
                    onClick={() => {
                      setSelectedCategory(cat.category);
                      setOpenCats((p) => ({ ...p, [cat.category]: true }));
                    }}
                  >
                    {isActiveCat ? <FolderOpen size={16} /> : <Folder size={16} />}
                    <span className="truncate">{cat.category}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[color:var(--muted)]">{cat.count}</span>
                    <button
                      type="button"
                      aria-label={isOpen ? "Collapse category" : "Expand category"}
                      className={cn(
                        "rounded-lg p-1 transition hover:bg-black/5 dark:hover:bg-white/10",
                        isOpen && "rotate-90"
                      )}
                      onClick={() => setOpenCats((p) => ({ ...p, [cat.category]: !isOpen }))}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-2 pb-2">
                    {cat.subs.map((sub) => {
                      const active = isActiveCat && selectedSubcategory === sub.subcategory;
                      return (
                        <button
                          key={sub.subcategory}
                          type="button"
                          className={cn(
                            "mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                            active ? "bg-[color:var(--ink)] text-[color:var(--paper)]" : "hover:bg-black/5 dark:hover:bg-white/10"
                          )}
                          onClick={() => {
                            setSelectedCategory(cat.category);
                            setSelectedSubcategory(sub.subcategory);
                          }}
                        >
                          <span className="truncate">{sub.subcategory}</span>
                          <span className={cn("text-xs", active ? "opacity-90" : "text-[color:var(--muted)]")}>
                            {sub.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
