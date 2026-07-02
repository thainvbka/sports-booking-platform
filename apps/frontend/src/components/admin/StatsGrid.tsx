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
  /** Kept for API compatibility; ignored in the compact ribbon design. */
  variant?: "solid" | "glass";
}

interface StatsGridProps {
  items: StatItem[];
}

// Compact accent tokens 
// Drives the small icon tile (border + bg) and its symbol color. The card body
// stays neutral so the ribbon reads like an operational dashboard, not a
// marketing banner.
const ACCENT: Record<
  StatColor,
  { iconWrap: string; iconColor: string; valueAccent: string }
> = {
  slate: {
    iconWrap:
      "bg-slate-100 border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/30",
    iconColor: "text-slate-600 dark:text-slate-300",
    valueAccent: "text-foreground",
  },
  blue: {
    iconWrap:
      "bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/30",
    iconColor: "text-blue-600 dark:text-blue-300",
    valueAccent: "text-foreground",
  },
  green: {
    iconWrap:
      "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30",
    iconColor: "text-emerald-600 dark:text-emerald-300",
    valueAccent: "text-foreground",
  },
  red: {
    iconWrap:
      "bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/30",
    iconColor: "text-rose-600 dark:text-rose-300",
    valueAccent: "text-foreground",
  },
  orange: {
    iconWrap:
      "bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/30",
    iconColor: "text-amber-600 dark:text-amber-300",
    valueAccent: "text-foreground",
  },
  purple: {
    iconWrap:
      "bg-violet-50 border-violet-100 dark:bg-violet-500/10 dark:border-violet-500/30",
    iconColor: "text-violet-600 dark:text-violet-300",
    valueAccent: "text-foreground",
  },
  indigo: {
    iconWrap:
      "bg-indigo-50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/30",
    iconColor: "text-indigo-600 dark:text-indigo-300",
    valueAccent: "text-foreground",
  },
};

export function StatsGrid({ items }: StatsGridProps) {
  const columnClass =
    items.length === 5
      ? "lg:grid-cols-5"
      : items.length === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-4";

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className={cn("grid grid-cols-2", columnClass)}>
        {items.map((item, idx) => {
          const Icon = item.icon;
          const tone = ACCENT[item.color ?? "slate"];

          return (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5",
                // 2-col grid: vertical divider on the right column
                idx % 2 !== 0 && "border-l border-border/60",
                // 2-col grid: top divider on the second row
                idx >= 2 && "border-t border-border/60",
                // 4-col grid: vertical dividers between every column,
                // resetting top borders since everything sits on one row
                "lg:border-l lg:border-t-0",
                idx === 0 && "lg:border-l-0",
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md border",
                  tone.iconWrap,
                )}
              >
                <Icon className={cn("size-4", tone.iconColor)} />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "font-display text-lg font-black italic leading-none tabular-nums md:text-xl",
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
