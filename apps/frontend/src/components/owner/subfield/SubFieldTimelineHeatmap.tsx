import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PricingRule } from "@/types";
import type { PricingTier } from "@/utils";
import {
  formatMinutesToTime,
  formatPrice,
  PRICING_TIER_CONFIGS,
} from "@/utils";
import { Clock } from "lucide-react";
import type { TimelineSegment } from "@/hooks/player/useTimelineSegments";

interface SubFieldTimelineHeatmapProps {
  segments: TimelineSegment[];
  onSegmentClick: (rule: PricingRule) => void;
}

export function SubFieldTimelineHeatmap({
  segments,
  onSegmentClick,
}: SubFieldTimelineHeatmapProps) {
  return (
    <div className="mt-2 border border-border/60 bg-muted/10 p-4 rounded-xl">

      <TooltipProvider delayDuration={50}>
        {/* Timeline container */}
        <div className="relative mt-4 mb-6">
          {/* Ticks grid lines in the background */}
          <div className="absolute inset-0 flex justify-between pointer-events-none" aria-hidden>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-full w-[1px] bg-border/30" />
            ))}
          </div>

          {/* The Track bar */}
          <div className="relative h-7 w-full overflow-hidden rounded-lg border border-border/80 bg-slate-100 dark:bg-slate-900/40 flex">
            {segments.map((seg, idx) => {
              const widthPct = ((seg.end - seg.start) / 1440) * 100;
              const displayStart = formatMinutesToTime(seg.start);
              const displayEnd = formatMinutesToTime(seg.end);

              if (seg.classification === "CLOSED") {
                return (
                  <Tooltip key={`closed-${idx}`}>
                    <TooltipTrigger asChild>
                      <div
                        style={{ width: `${widthPct}%` }}
                        className="h-full border-r border-border/40 last:border-r-0 bg-slate-200/20 dark:bg-slate-800/10 bg-[linear-gradient(45deg,rgba(0,0,0,0.03)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.03)_50%,rgba(0,0,0,0.03)_75%,transparent_75%,transparent)] bg-[size:8px_8px] transition-colors"
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="font-semibold text-[11px] text-foreground">
                        Chưa mở ({displayStart} - {displayEnd})
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              const rule = seg.rule!;
              const price = Number(rule.base_price);
              const config = PRICING_TIER_CONFIGS[seg.classification as PricingTier];
              
              const bgClass = config.colorClass;
              const label = config.label;

              return (
                <Tooltip key={rule.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onSegmentClick(rule)}
                      style={{ width: `${widthPct}%` }}
                      className={cn(
                        "h-full border-r border-black/10 last:border-r-0 cursor-pointer flex items-center justify-center text-[9px] font-black tracking-tighter truncate transition-all duration-200 hover:scale-y-105 active:scale-y-95 shadow-inner",
                        bgClass
                      )}
                    >
                      {widthPct > 6 && `${displayStart}`}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="p-2 space-y-1">
                    <p className="font-bold text-xs text-foreground flex items-center gap-1">
                      <Clock className="size-3 text-primary" />
                      {displayStart} - {displayEnd}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Badge className="text-[9px] font-semibold tracking-wide h-4 py-0 px-1">
                        {label}
                      </Badge>
                      <span className="font-bold text-foreground text-xs tabular-nums">
                        {formatPrice(price)}/h
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic mt-0.5">
                      Nhấp để sửa khung giờ này
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Tick labels */}
          <div className="absolute top-full left-0 right-0 mt-1 flex justify-between px-[2px] text-[10px] font-bold text-muted-foreground/60 tabular-nums">
            <span>00:00</span>
            <span className="hidden sm:inline">03:00</span>
            <span>06:00</span>
            <span className="hidden sm:inline">09:00</span>
            <span>12:00</span>
            <span className="hidden sm:inline">15:00</span>
            <span>18:00</span>
            <span className="hidden sm:inline">21:00</span>
            <span>24:00</span>
          </div>
        </div>
      </TooltipProvider>

      {/* Color legends */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-semibold text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded bg-emerald-500" />
          <span>Giá tiết kiệm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded bg-blue-500" />
          <span>Giờ thường</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded bg-amber-500" />
          <span>Giờ cao điểm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded border border-dashed border-border bg-slate-100 dark:bg-slate-900/40 bg-[linear-gradient(45deg,rgba(0,0,0,0.03)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.03)_50%,rgba(0,0,0,0.03)_75%,transparent_75%,transparent)] bg-[size:5px_5px]" />
          <span>Chưa cấu hình</span>
        </div>
      </div>
    </div>
  );
}
