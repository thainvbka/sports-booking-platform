import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatColor = "blue" | "green" | "red" | "orange" | "purple" | "slate" | "indigo";

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: StatColor;
  /** "solid" = gradient hero card; "glass" = light accent card (default) */
  variant?: "solid" | "glass";
}

interface StatsGridProps {
  items: StatItem[];
}

// ── Solid / hero cards (gradient + glow) ──────────────────────────────────────
const SOLID: Record<
  StatColor,
  {
    card: string;
    glow1: string;
    glow2: string;
    iconWrap: string;
    iconColor: string;
    label: string;
    desc: string;
  }
> = {
  slate: {
    card: "bg-linear-to-br from-slate-900 via-slate-800 to-zinc-900 border-0 shadow-lg text-white",
    glow1: "bg-emerald-500/10",
    glow2: "bg-blue-500/5",
    iconWrap: "bg-emerald-500/20 border-emerald-500/30",
    iconColor: "text-emerald-400",
    label: "text-slate-400",
    desc: "text-slate-500",
  },
  blue: {
    card: "bg-linear-to-br from-blue-700 via-blue-800 to-indigo-900 border-0 shadow-lg text-white",
    glow1: "bg-blue-400/20",
    glow2: "bg-indigo-500/10",
    iconWrap: "bg-blue-400/20 border-blue-400/30",
    iconColor: "text-blue-200",
    label: "text-blue-200/80",
    desc: "text-blue-200/60",
  },
  green: {
    card: "bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 border-0 shadow-lg text-white",
    glow1: "bg-emerald-300/20",
    glow2: "bg-teal-500/10",
    iconWrap: "bg-white/15 border-white/20",
    iconColor: "text-white",
    label: "text-emerald-100/80",
    desc: "text-emerald-100/60",
  },
  red: {
    card: "bg-linear-to-br from-rose-600 via-rose-700 to-red-900 border-0 shadow-lg text-white",
    glow1: "bg-rose-300/20",
    glow2: "bg-red-500/10",
    iconWrap: "bg-white/15 border-white/20",
    iconColor: "text-white",
    label: "text-rose-100/80",
    desc: "text-rose-100/60",
  },
  orange: {
    card: "bg-linear-to-br from-amber-500 via-amber-600 to-orange-700 border-0 shadow-lg text-white",
    glow1: "bg-amber-300/20",
    glow2: "bg-orange-500/10",
    iconWrap: "bg-white/15 border-white/20",
    iconColor: "text-white",
    label: "text-amber-100/80",
    desc: "text-amber-100/60",
  },
  purple: {
    card: "bg-linear-to-br from-violet-600 via-purple-700 to-indigo-800 border-0 shadow-lg text-white",
    glow1: "bg-violet-300/20",
    glow2: "bg-indigo-500/10",
    iconWrap: "bg-white/15 border-white/20",
    iconColor: "text-white",
    label: "text-violet-100/80",
    desc: "text-violet-100/60",
  },
  indigo: {
    card: "bg-linear-to-br from-indigo-600 via-indigo-700 to-blue-900 border-0 shadow-lg text-white",
    glow1: "bg-indigo-300/20",
    glow2: "bg-blue-500/10",
    iconWrap: "bg-white/15 border-white/20",
    iconColor: "text-white",
    label: "text-indigo-100/80",
    desc: "text-indigo-100/60",
  },
};

// ── Glass / light accent cards ────────────────────────────────────────────────
const GLASS: Record<
  StatColor,
  { card: string; glow: string; iconWrap: string; iconColor: string }
> = {
  slate: {
    card: "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/30 shadow-sm",
    glow: "bg-slate-500/5",
    iconWrap: "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
    iconColor: "text-slate-600 dark:text-slate-400",
  },
  blue: {
    card: "bg-white dark:bg-slate-900 border border-blue-100/80 dark:border-blue-900/30 shadow-sm",
    glow: "bg-blue-500/6",
    iconWrap: "bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30",
    iconColor: "text-blue-500",
  },
  green: {
    card: "bg-white dark:bg-slate-900 border border-emerald-100/80 dark:border-emerald-900/30 shadow-sm",
    glow: "bg-emerald-500/6",
    iconWrap: "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30",
    iconColor: "text-emerald-500",
  },
  red: {
    card: "bg-white dark:bg-slate-900 border border-rose-100/80 dark:border-rose-900/30 shadow-sm",
    glow: "bg-rose-500/6",
    iconWrap: "bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/30",
    iconColor: "text-rose-500",
  },
  orange: {
    card: "bg-white dark:bg-slate-900 border border-amber-100/80 dark:border-amber-900/30 shadow-sm",
    glow: "bg-amber-500/6",
    iconWrap: "bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30",
    iconColor: "text-amber-500",
  },
  purple: {
    card: "bg-white dark:bg-slate-900 border border-violet-100/80 dark:border-violet-900/30 shadow-sm",
    glow: "bg-violet-500/6",
    iconWrap: "bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/30",
    iconColor: "text-violet-500",
  },
  indigo: {
    card: "bg-white dark:bg-slate-900 border border-indigo-100/80 dark:border-indigo-900/30 shadow-sm",
    glow: "bg-indigo-500/6",
    iconWrap: "bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30",
    iconColor: "text-indigo-500",
  },
};

export function StatsGrid({ items }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        const color = item.color ?? "slate";
        const isSolid = item.variant === "solid";

        if (isSolid) {
          const s = SOLID[color];
          return (
            <Card key={idx} className={cn("relative overflow-hidden", s.card)}>
              <div
                className={cn(
                  "absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl pointer-events-none",
                  s.glow1,
                )}
              />
              <div
                className={cn(
                  "absolute bottom-0 left-0 w-20 h-20 rounded-full blur-xl pointer-events-none",
                  s.glow2,
                )}
              />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <p
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-[0.15em] leading-tight pt-0.5",
                      s.label,
                    )}
                  >
                    {item.label}
                  </p>
                  <div
                    className={cn(
                      "shrink-0 rounded-xl border p-2.5",
                      s.iconWrap,
                    )}
                  >
                    <Icon className={cn("h-4 w-4", s.iconColor)} />
                  </div>
                </div>
                <p className="text-[1.7rem] font-black tracking-tight leading-none mb-2 text-white">
                  {item.value}
                </p>
                {item.description && (
                  <p className={cn("text-[10px]", s.desc)}>{item.description}</p>
                )}
              </CardContent>
            </Card>
          );
        }

        // Glass variant
        const g = GLASS[color];
        return (
          <Card key={idx} className={cn("relative overflow-hidden", g.card)}>
            <div
              className={cn(
                "absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none",
                g.glow,
              )}
            />
            <CardContent className="p-5 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground leading-tight pt-0.5">
                  {item.label}
                </p>
                <div
                  className={cn(
                    "shrink-0 rounded-xl border p-2.5",
                    g.iconWrap,
                  )}
                >
                  <Icon className={cn("h-4 w-4", g.iconColor)} />
                </div>
              </div>
              <p className="text-[1.7rem] font-black tracking-tight leading-none mb-2 text-foreground">
                {item.value}
              </p>
              {item.description && (
                <p className="text-[10px] text-muted-foreground">
                  {item.description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
