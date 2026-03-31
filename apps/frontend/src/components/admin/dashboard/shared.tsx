/**
 * Shared micro-components for admin dashboard charts.
 * Import here instead of redefining per-file.
 */
import { TrendingDown, TrendingUp } from "lucide-react";

// ─── TrendBadge ──────────────────────────────────────────────────────────────
// Inline MoM growth pill with up/down icon — used in KPI card footers.

interface TrendBadgeProps {
  growth: number;
  /** Use light-on-dark palette (for dark hero cards) */
  dark?: boolean;
}

export function TrendBadge({ growth, dark = false }: TrendBadgeProps) {
  const up = growth >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
        dark
          ? up
            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            : "bg-rose-500/20 text-rose-300 border-rose-500/30"
          : up
            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
            : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30"
      }`}
    >
      {up ? (
        <TrendingUp className="h-2.5 w-2.5" />
      ) : (
        <TrendingDown className="h-2.5 w-2.5" />
      )}
      {up ? "+" : ""}
      {growth.toFixed(1)}% MoM
    </span>
  );
}

// ─── MomBadge ────────────────────────────────────────────────────────────────
// Block MoM growth badge without icon — used in chart card header corners.

interface MomBadgeProps {
  growth: number;
  className?: string;
}

export function MomBadge({ growth, className = "" }: MomBadgeProps) {
  const up = growth >= 0;
  return (
    <div
      className={`shrink-0 text-right px-3 py-1.5 rounded-xl border text-[10px] font-bold ${
        up
          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800"
          : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800"
      } ${className}`}
    >
      {up ? "+" : ""}
      {growth.toFixed(1)}% MoM
    </div>
  );
}

// ─── DarkTip ─────────────────────────────────────────────────────────────────
// Generic dark-themed Recharts tooltip, used across all dashboard charts.

export interface TipPayloadItem {
  name: string;
  value: number;
  color?: string;
}

interface DarkTipProps {
  active?: boolean;
  payload?: TipPayloadItem[];
  label?: string;
  /** Custom value formatter — defaults to toLocaleString() */
  formatValue?: (name: string, value: number) => string;
  /** Append a total row at the bottom */
  showTotal?: boolean;
  /** Reverse payload order (useful for stacked area charts) */
  reverseOrder?: boolean;
}

export function DarkTip({
  active,
  payload,
  label,
  formatValue,
  showTotal = false,
  reverseOrder = false,
}: DarkTipProps) {
  if (!active || !payload?.length) return null;
  const items = reverseOrder ? [...payload].reverse() : payload;
  const total = showTotal
    ? payload.reduce((s, p) => s + (p.value ?? 0), 0)
    : null;

  return (
    <div className="bg-slate-900 text-white rounded-xl p-3 text-[10px] min-w-[160px] shadow-2xl border border-slate-700">
      <div className="font-bold mb-2 text-slate-400 border-b border-slate-700 pb-1.5 uppercase tracking-wider text-[9px]">
        {label}
      </div>
      {items.map((p, i) => (
        <div key={i} className="flex justify-between gap-4 mb-1 last:mb-0">
          <span
            style={{ color: p.color ?? "#94a3b8" }}
            className="font-medium flex items-center gap-1"
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: p.color ?? "#94a3b8" }}
            />
            {p.name}
          </span>
          <span className="font-bold tabular-nums">
            {formatValue ? formatValue(p.name, p.value) : p.value.toLocaleString()}
          </span>
        </div>
      ))}
      {showTotal && total !== null && (
        <div className="flex justify-between gap-4 mt-1.5 pt-1.5 border-t border-slate-700">
          <span className="text-slate-400">Tổng</span>
          <span className="font-black tabular-nums">{total.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

// ─── StatChip ────────────────────────────────────────────────────────────────
// Small labeled stat tile used in chart summary strips.

type StatChipColor =
  | "primary"
  | "rose"
  | "amber"
  | "emerald"
  | "indigo"
  | "muted";

const CHIP_COLORS: Record<
  StatChipColor,
  { wrap: string; label: string; value: string }
> = {
  primary: {
    wrap: "bg-primary/5 border-primary/15",
    label: "text-muted-foreground",
    value: "text-foreground",
  },
  rose: {
    wrap: "bg-rose-50/60 dark:bg-rose-950/15 border-rose-100 dark:border-rose-900/30",
    label: "text-rose-500",
    value: "text-rose-600 dark:text-rose-400",
  },
  amber: {
    wrap: "bg-amber-50/60 dark:bg-amber-950/15 border-amber-100 dark:border-amber-900/30",
    label: "text-amber-600",
    value: "text-amber-700 dark:text-amber-400",
  },
  emerald: {
    wrap: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30",
    label: "text-emerald-600",
    value: "text-foreground",
  },
  indigo: {
    wrap: "bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30",
    label: "text-indigo-500",
    value: "text-foreground",
  },
  muted: {
    wrap: "bg-muted/30 border-muted/60",
    label: "text-muted-foreground",
    value: "text-foreground",
  },
};

interface StatChipProps {
  label: string;
  value: string;
  color?: StatChipColor;
  center?: boolean;
  className?: string;
}

export function StatChip({
  label,
  value,
  color = "primary",
  center = false,
  className = "",
}: StatChipProps) {
  const c = CHIP_COLORS[color];
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${c.wrap} ${center ? "text-center" : ""} ${className}`}
    >
      <p
        className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${c.label}`}
      >
        {label}
      </p>
      <p className={`text-sm font-black leading-none truncate ${c.value}`}>
        {value}
      </p>
    </div>
  );
}

// ─── ChartLegendItem ─────────────────────────────────────────────────────────
// A single legend entry — line+dot for area/line series, rect for bar series.

interface ChartLegendItemProps {
  label: string;
  /** Full Tailwind bg class, e.g. "bg-indigo-500" or "bg-primary/80" */
  color: string;
  type?: "line" | "bar";
}

export function ChartLegendItem({
  label,
  color,
  type = "line",
}: ChartLegendItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      {type === "line" ? (
        <>
          <span className={`w-3 h-[2px] ${color} shrink-0`} />
          <span className={`w-1.5 h-1.5 rounded-full ${color} shrink-0`} />
        </>
      ) : (
        <span className={`w-3 h-3 rounded-sm ${color} shrink-0`} />
      )}
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
