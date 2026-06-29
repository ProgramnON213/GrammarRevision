import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function Pill({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-[color:var(--border)]",
        "bg-white/55 text-[color:var(--ink)] dark:bg-white/10",
        className
      )}
      {...props}
    />
  );
}

