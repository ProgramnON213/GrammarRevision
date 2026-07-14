import { useMemo, useState } from "react";
import { BookOpen, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGrammarStore } from "@/stores/useGrammarStore";
import Card from "@/components/ui/Card";
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
          <div className="font-[Fraunces] text-lg font-bold text-[color:var(--ink)]">Library</div>
          <div className="text-xs text-[color:var(--muted)]">{bank.length} questions loaded</div>
        </div>
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
            "mb-4 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition border shadow-xs",
            selectedCategory === null
              ? "bg-[color:var(--ink)] border-transparent text-[color:var(--paper)]"
              : "bg-white/45 dark:bg-white/5 border-[color:var(--border)] text-[color:var(--ink)] hover:bg-black/5 dark:hover:bg-white/10"
          )}
        >
          <span className="flex items-center gap-2">
            <BookOpen size={16} />
            All topics
          </span>
          <span className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            selectedCategory === null ? "bg-white/20 text-white" : "bg-black/5 text-[color:var(--muted)] dark:bg-white/5"
          )}>
            {bank.length}
          </span>
        </button>

        <div className="flex flex-col gap-3">
          {categories.map((cat) => {
            const isOpen = openCats[cat.category] ?? true;
            const isActiveCat = selectedCategory === cat.category;

            return (
              <div
                key={cat.category}
                className={cn(
                  "rounded-2xl transition-all border border-[color:var(--border)] overflow-hidden bg-white/20 dark:bg-white/5",
                  isActiveCat && !selectedSubcategory ? "ring-2 ring-[color:var(--accent)] border-transparent" : ""
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                    isActiveCat ? "bg-black/5 dark:bg-white/10" : ""
                  )}
                >
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-2.5 py-1 text-left select-none text-[color:var(--ink)]"
                    onClick={() => {
                      setSelectedCategory(cat.category);
                      setSelectedSubcategory(null);
                      setOpenCats((p) => ({ ...p, [cat.category]: true }));
                    }}
                  >
                    {isActiveCat ? (
                      <FolderOpen size={16} className="text-[color:var(--accent)] shrink-0" />
                    ) : (
                      <Folder size={16} className="text-[color:var(--muted)] shrink-0" />
                    )}
                    <span className="truncate font-semibold tracking-tight">{cat.category}</span>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-[color:var(--muted)] bg-black/5 px-2 py-0.5 rounded-full dark:bg-white/5">
                      {cat.count}
                    </span>
                    <button
                      type="button"
                      aria-label={isOpen ? "Collapse category" : "Expand category"}
                      className={cn(
                        "rounded-lg p-1.5 transition text-[color:var(--muted)] hover:bg-black/5 dark:hover:bg-white/10",
                        isOpen && "rotate-90"
                      )}
                      onClick={() => setOpenCats((p) => ({ ...p, [cat.category]: !isOpen }))}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-3 pb-3 pt-1 border-t border-[color:var(--border)] bg-black/[0.01] dark:bg-white/[0.01]">
                    {cat.subs.map((sub) => {
                      const active = isActiveCat && selectedSubcategory === sub.subcategory;
                      return (
                        <button
                          key={sub.subcategory}
                          type="button"
                          className={cn(
                            "mt-1.5 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all border",
                            active
                              ? "bg-[color:var(--accent)] border-transparent text-white shadow-sm"
                              : "bg-white/40 dark:bg-white/5 border-[color:var(--border)] text-[color:var(--ink)] hover:bg-black/5 dark:hover:bg-white/10"
                          )}
                          onClick={() => {
                            setSelectedCategory(cat.category);
                            setSelectedSubcategory(sub.subcategory);
                          }}
                        >
                          <span className="truncate pr-2">{sub.subcategory}</span>
                          <span className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-bold shrink-0",
                            active ? "bg-white/20 text-white" : "bg-black/5 text-[color:var(--muted)] dark:bg-white/5"
                          )}>
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
