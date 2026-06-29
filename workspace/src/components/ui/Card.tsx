import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[color:var(--card)] shadow-[var(--shadow)] ring-1 ring-[color:var(--border)] backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

