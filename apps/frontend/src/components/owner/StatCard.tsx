import type { ComponentType, SVGProps } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Sparkles } from "lucide-react";

export type StatTone = "primary" | "sport" | "amber" | "rose" | "emerald" | "blue";

const STAT_TONE_CLASSES: Record<
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
};

interface StatCardProps {
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
  extra?: React.ReactNode;
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
  const t = STAT_TONE_CLASSES[tone];
  const isUp = (delta?.value ?? 0) >= 0;

  return (
    <Card className="group relative overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
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

      <CardHeader className="relative flex-row items-center justify-between gap-2 px-4 pb-1 pt-3">
        <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </CardTitle>
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg",
            t.iconBg,
          )}
        >
          <Icon className={cn("size-3.5", t.iconFg)} />
        </span>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-1 px-4 pb-3">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl font-black italic tabular-nums tracking-tight text-foreground">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        {hint && (
          <p className="text-[11px] text-muted-foreground">
            {hint}
          </p>
        )}
        {delta && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Badge
              variant="outline"
              className={cn(
                "h-4 gap-0.5 rounded-full border-transparent px-1.5 text-[9.5px] font-semibold tabular-nums",
                delta.kind === "percent"
                  ? isUp
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-accent-sport/10 text-accent-sport",
              )}
            >
              {delta.kind === "percent" ? (
                isUp ? (
                  <TrendingUp className="size-2.5" />
                ) : (
                  <TrendingDown className="size-2.5" />
                )
              ) : (
                <Sparkles className="size-2.5" />
              )}
              {delta.kind === "percent"
                ? `${isUp ? "+" : "−"}${Math.abs(delta.value)}%`
                : `+${delta.value}`}
            </Badge>
            <span className="truncate">{delta.hint}</span>
          </div>
        )}
        {extra ? <div className="mt-3.5">{extra}</div> : null}
      </CardContent>
    </Card>
  );
}
