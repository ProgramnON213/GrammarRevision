import { NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { BookOpen, ChartNoAxesColumn, Cog, Moon, NotebookPen, Sun, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import Button from "@/components/ui/Button";

const nav = [
  { to: "/", label: "Library", icon: BookOpen },
  { to: "/practice", label: "Practice", icon: Swords },
  { to: "/review", label: "Review", icon: NotebookPen },
  { to: "/progress", label: "Progress", icon: ChartNoAxesColumn },
  { to: "/settings", label: "Settings", icon: Cog },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();

  return (
    <div className="min-h-screen overflow-x-clip px-5 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <div className="rounded-xl bg-black/5 px-3 py-2 dark:bg-white/10">
              <span
                className={cn(
                  "block text-lg font-semibold tracking-tight",
                  "font-[Fraunces] text-[color:var(--ink)]"
                )}
              >
                Grammar Workbook
              </span>
            </div>
            <span className="text-sm text-[color:var(--muted)]">Practice from your own JSON question bank.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={toggleTheme}
              className="px-3"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
            </Button>
          </div>
        </header>

        <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav className="h-fit rounded-2xl bg-white/35 p-2 ring-1 ring-[color:var(--border)] backdrop-blur dark:bg-white/5">
            <div className="flex flex-col gap-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-[color:var(--ink)] text-[color:var(--paper)] shadow-[0_10px_28px_rgba(20,18,16,0.22)]"
                        : "text-[color:var(--ink)] hover:bg-black/5 dark:hover:bg-white/10"
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
