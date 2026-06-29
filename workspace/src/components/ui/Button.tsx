import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export default function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]",
        variant === "primary" &&
          "bg-[color:var(--ink)] text-[color:var(--paper)] shadow-[0_10px_30px_rgba(20,18,16,0.18)] hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(20,18,16,0.22)] active:translate-y-0",
        variant === "secondary" &&
          "bg-[color:var(--card)] text-[color:var(--ink)] ring-1 ring-[color:var(--border)] hover:bg-white/70 dark:hover:bg-white/10",
        variant === "ghost" && "text-[color:var(--ink)] hover:bg-black/5 dark:hover:bg-white/10",
        variant === "danger" &&
          "bg-[color:var(--accent-2)] text-[color:var(--paper)] shadow-[0_10px_26px_rgba(255,74,45,0.25)] hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}

