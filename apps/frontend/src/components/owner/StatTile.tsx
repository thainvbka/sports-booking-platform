import { cn } from "@/lib/utils";

export type StatTone = "slate" | "emerald" | "sky" | "amber" | "rose";

const STAT_TONE: Record<
  StatTone,
  { chip: string; value: string; bar: string; bg: string; ring: string }
> = {
  slate: {
    chip: "dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 status-surface-neutral",
    value: "text-slate-900 dark:text-slate-100",
    bar: "bg-slate-400",
    bg: "from-slate-500/8 via-transparent to-transparent",
    ring: "ring-slate-500/10",
  },
  emerald: {
    chip: "dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 status-surface-success",
    value: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
    bg: "from-emerald-500/10 via-transparent to-transparent",
    ring: "ring-emerald-500/15",
  },
  sky: {
    chip: "border-sky-300/60 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
    value: "text-sky-700 dark:text-sky-300",
    bar: "bg-sky-500",
    bg: "from-sky-500/10 via-transparent to-transparent",
    ring: "ring-sky-500/15",
  },
  amber: {
    chip: "dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 status-surface-warning",
    value: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
    bg: "from-amber-500/10 via-transparent to-transparent",
    ring: "ring-amber-500/15",
  },
  rose: {
    chip: "dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 status-surface-error",
    value: "text-rose-700 dark:text-rose-300",
    bar: "bg-rose-500",
    bg: "from-rose-500/10 via-transparent to-transparent",
    ring: "ring-rose-500/15",
  },
};

interface StatTileProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: StatTone;
  hint?: string;
}

export function StatTile({
  icon: Icon,
  label,
  value,
  tone,
  hint,
}: StatTileProps) {
  const t = STAT_TONE[tone];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card p-3 shadow-xs ring-1",
        t.ring,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br",
          t.bg,
        )}
      />
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-0.5", t.bar)}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "font-display text-2xl font-black italic tabular-nums tracking-tight",
              t.value,
            )}
          >
            {value}
          </span>
          {hint ? (
            <span className="text-[10.5px] text-muted-foreground">{hint}</span>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-xl border",
            t.chip,
          )}
        >
          <Icon className="size-3.5" />
        </span>
      </div>
    </div>
  );
}
