import type { ComponentType, ReactNode, SVGProps } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Sparkles } from "lucide-react";

// Shared Tones
export type StatTone =
  | "primary"
  | "sport"
  | "amber"
  | "rose"
  | "emerald"
  | "blue"
  | "sky"
  | "slate";

// Color Classes for StatCard & StatTile
const STAT_CARD_TONES: Record<
  StatTone,
  { surface: string; iconBg: string; iconFg: string; accent: string }
> = {
  primary: {
    surface: "from-primary/8 via-background to-background",
    iconBg: "bg-primary/10",
    iconFg: "text-primary",
    accent: "bg-primary",
  },
  sport: {
    surface: "from-accent-sport/10 via-background to-background",
    iconBg: "bg-accent-sport/10",
    iconFg: "text-accent-sport",
    accent: "bg-accent-sport",
  },
  amber: {
    surface: "from-amber-500/10 via-background to-background",
    iconBg: "bg-amber-500/10",
    iconFg: "text-amber-600 dark:text-amber-400",
    accent: "bg-amber-500",
  },
  rose: {
    surface: "from-rose-500/10 via-background to-background",
    iconBg: "bg-rose-500/10",
    iconFg: "text-rose-600 dark:text-rose-400",
    accent: "bg-rose-500",
  },
  emerald: {
    surface: "from-emerald-500/8 via-background to-background",
    iconBg: "bg-emerald-500/10",
    iconFg: "text-emerald-600 dark:text-emerald-400",
    accent: "bg-emerald-500",
  },
  blue: {
    surface: "from-blue-500/8 via-background to-background",
    iconBg: "bg-blue-500/10",
    iconFg: "text-blue-600 dark:text-blue-400",
    accent: "bg-blue-500",
  },
  sky: {
    surface: "from-sky-500/8 via-background to-background",
    iconBg: "bg-sky-500/10",
    iconFg: "text-sky-600 dark:text-sky-400",
    accent: "bg-sky-500",
  },
  slate: {
    surface: "from-slate-500/8 via-background to-background",
    iconBg: "bg-slate-500/10",
    iconFg: "text-slate-600 dark:text-slate-400",
    accent: "bg-slate-500",
  },
};

// StatCard Component
export interface StatCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  unit?: string;
  delta?: {
    kind: "percent" | "count";
    value: number;
    hint: string;
  };
  tone?: StatTone;
  extra?: ReactNode;
  hint?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  tone = "primary",
  extra,
  hint,
}: StatCardProps) {
  const t = STAT_CARD_TONES[tone];
  const isUp = (delta?.value ?? 0) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-3 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
      <span
        aria-hidden
        className={cn("absolute inset-x-0 top-0 h-0.5", t.accent)}
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-70",
          t.surface,
        )}
      />

      <div className="relative flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground truncate">
            {label}
          </span>
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md",
              t.iconBg,
            )}
          >
            <Icon className={cn("size-3", t.iconFg)} />
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-display text-lg font-black italic tabular-nums tracking-tight text-foreground">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-muted-foreground">
              {unit}
            </span>
          )}
        </div>

        {hint && !delta && (
          <p className="text-[10px] text-muted-foreground leading-none">
            {hint}
          </p>
        )}

        {delta && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground leading-none">
            <Badge
              variant="outline"
              className={cn(
                "h-4 gap-0.5 rounded-full border-transparent px-1 text-[8.5px] font-semibold tabular-nums",
                delta.kind === "percent"
                  ? isUp
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-accent-sport/10 text-accent-sport",
              )}
            >
              {delta.kind === "percent" ? (
                isUp ? (
                  <TrendingUp className="size-2" />
                ) : (
                  <TrendingDown className="size-2" />
                )
              ) : (
                <Sparkles className="size-2" />
              )}
              {delta.kind === "percent"
                ? `${isUp ? "+" : "−"}${Math.round(Math.abs(delta.value) * 10) / 10}%`
                : `+${delta.value}`}
            </Badge>
            <span className="truncate text-[9.5px]">{delta.hint}</span>
          </div>
        )}
        {extra ? <div className="mt-1">{extra}</div> : null}
      </div>
    </div>
  );
}

// StatTile Component (Compact Version)
export interface StatTileProps {
  icon: ComponentType<any>;
  label: string;
  value: number | string;
  tone?: StatTone;
  hint?: string;
}

export function StatTile({
  icon: Icon,
  label,
  value,
  tone = "primary",
  hint,
}: StatTileProps) {
  const t = STAT_CARD_TONES[tone];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card p-3 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm",
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-x-0 top-0 h-0.5", t.accent)}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70",
          t.surface,
        )}
      />
      
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground truncate">
            {label}
          </span>
          <span
            className={cn(
              "font-display text-lg font-black italic tabular-nums tracking-tight text-foreground",
            )}
          >
            {value}
          </span>
          {hint ? (
            <span className="text-[10px] text-muted-foreground truncate">{hint}</span>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/50",
            t.iconBg,
          )}
        >
          <Icon className={cn("size-3.5", t.iconFg)} />
        </span>
      </div>
    </div>
  );
}
