import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AdminFiltersBarProps {
  children: ReactNode;
  className?: string;
  /** Rendered as a leading slot on the left (e.g. tabs / toggle group). */
  leading?: ReactNode;
  /** Rendered at the far right (e.g. density controls, export). */
  trailing?: ReactNode;
}

export function AdminFiltersBar({
  children,
  className,
  leading,
  trailing,
}: AdminFiltersBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 md:flex-row md:items-center md:gap-2.5",
        className,
      )}
    >
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-2">
        {children}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
