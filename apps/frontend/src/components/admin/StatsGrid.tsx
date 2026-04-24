import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatColor =
  | "blue"
  | "green"
  | "red"
  | "orange"
  | "purple"
  | "slate"
  | "indigo";

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: StatColor;
  /** Kept for API compatibility; ignored in the compact design. */
  variant?: "solid" | "glass";
}

interface StatsGridProps {
  items: StatItem[];
}

// ── Compact accent tokens ─────────────────────────────────────────────────────
// Each color drives: the left accent bar, the icon tile, and a soft ambient glow.
const ACCENT: Record<
  StatColor,
  {
    bar: string;
    iconWrap: string;
    iconColor: string;
    glow: string;
    valueAccent: string;
  }
> = {
  slate: {
    bar: "bg-gradient-to-b from-slate-500/70 via-slate-500/40 to-transparent",
    iconWrap: "bg-slate-100 border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/30",
    iconColor: "text-slate-600 dark:text-slate-300",
    glow: "bg-slate-500/5",
    valueAccent: "text-foreground",
  },
  blue: {
    bar: "bg-gradient-to-b from-blue-500 via-blue-500/40 to-transparent",
    iconWrap: "bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/30",
    iconColor: "text-blue-600 dark:text-blue-300",
    glow: "bg-blue-500/6",
    valueAccent: "text-foreground",
  },
  green: {
    bar: "bg-gradient-to-b from-emerald-500 via-emerald-500/40 to-transparent",
    iconWrap: "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30",
    iconColor: "text-emerald-600 dark:text-emerald-300",
    glow: "bg-emerald-500/6",
    valueAccent: "text-foreground",
  },
  red: {
    bar: "bg-gradient-to-b from-rose-500 via-rose-500/40 to-transparent",
    iconWrap: "bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/30",
    iconColor: "text-rose-600 dark:text-rose-300",
    glow: "bg-rose-500/6",
    valueAccent: "text-foreground",
  },
  orange: {
    bar: "bg-gradient-to-b from-amber-500 via-amber-500/40 to-transparent",
    iconWrap: "bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/30",
    iconColor: "text-amber-600 dark:text-amber-300",
    glow: "bg-amber-500/6",
    valueAccent: "text-foreground",
  },
  purple: {
    bar: "bg-gradient-to-b from-violet-500 via-violet-500/40 to-transparent",
    iconWrap: "bg-violet-50 border-violet-100 dark:bg-violet-500/10 dark:border-violet-500/30",
    iconColor: "text-violet-600 dark:text-violet-300",
    glow: "bg-violet-500/6",
    valueAccent: "text-foreground",
  },
  indigo: {
    bar: "bg-gradient-to-b from-indigo-500 via-indigo-500/40 to-transparent",
    iconWrap: "bg-indigo-50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/30",
    iconColor: "text-indigo-600 dark:text-indigo-300",
    glow: "bg-indigo-500/6",
    valueAccent: "text-foreground",
  },
};

export function StatsGrid({ items }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        const tone = ACCENT[item.color ?? "slate"];

        return (
          <Card
            key={idx}
            className={cn(
              "relative overflow-hidden rounded-xl border border-border/60 bg-card p-0 shadow-sm transition-all duration-300",
              "hover:-translate-y-0.5 hover:shadow-md",
            )}
          >
            {/* Left accent bar */}
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-y-2 left-0 w-[3px] rounded-r-full",
                tone.bar,
              )}
            />
            {/* Ambient glow */}
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute -top-6 -right-6 size-20 rounded-full blur-2xl",
                tone.glow,
              )}
            />

            <CardContent className="relative flex items-start gap-3 px-3.5 py-3 pl-4">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                  tone.iconWrap,
                )}
              >
                <Icon className={cn("size-4", tone.iconColor)} />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "font-display text-xl font-black italic leading-none tracking-tight tabular-nums md:text-[1.35rem]",
                    tone.valueAccent,
                  )}
                >
                  {item.value}
                </span>
                {item.description && (
                  <span className="truncate text-[10px] text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
