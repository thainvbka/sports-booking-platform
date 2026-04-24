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
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card px-3 py-3 md:px-4",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary/60 via-primary/25 to-transparent"
      />
      <div className="relative flex flex-col gap-3 pl-2 md:flex-row md:items-center md:gap-3">
        {leading && <div className="shrink-0">{leading}</div>}
        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-2">
          {children}
        </div>
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
    </div>
  );
}
