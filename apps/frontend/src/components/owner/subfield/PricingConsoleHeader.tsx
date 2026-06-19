import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WEEKDAYS } from "@/constants";
import { cn } from "@/lib/utils";
import type { PricingRule } from "@/types";
import { formatDateVn } from "@/utils";
import { CalendarIcon, Plus } from "lucide-react";
import type { TimelineSegment } from "@/hooks/player/useTimelineSegments";
import { CopyPricingDropdown } from "./CopyPricingDropdown";
import { SubFieldTimelineHeatmap } from "./SubFieldTimelineHeatmap";

interface PricingConsoleHeaderProps {
  date: Date;
  setDate: (date: Date) => void;
  pricingRules: PricingRule[];
  isLoading: boolean;
  copyTargetDays: number[];
  setCopyTargetDays: (days: number[]) => void;
  onCopy: (days: number[]) => void;
  onAddClick: () => void;
  segments: TimelineSegment[];
  onSegmentClick: (rule: PricingRule) => void;
}

export function PricingConsoleHeader({
  date,
  setDate,
  pricingRules,
  isLoading,
  copyTargetDays,
  setCopyTargetDays,
  onCopy,
  onAddClick,
  segments,
  onSegmentClick,
}: PricingConsoleHeaderProps) {
  return (
    <CardHeader className="gap-2 pb-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col">
          <CardTitle className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Cấu hình bảng giá theo giờ
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Thiết lập mức giá linh hoạt cho các khung giờ khác nhau trong ngày.
          </CardDescription>
        </div>

        {/* Date + Action controls row */}
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-xl border-border/80 bg-muted/40 px-3.5 text-xs font-semibold hover:bg-muted/70 cursor-pointer"
              >
                <CalendarIcon className="size-3.5 text-muted-foreground" />
                {formatDateVn(date, "EEEE, dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <CopyPricingDropdown
            date={date}
            copyTargetDays={copyTargetDays}
            setCopyTargetDays={setCopyTargetDays}
            onCopy={onCopy}
            isLoading={isLoading}
          />

          <Button
            size="sm"
            onClick={onAddClick}
            className="h-9 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            Thêm khung giờ
          </Button>
        </div>
      </div>

      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1.5 border-b border-border/40">
        {WEEKDAYS.map((w) => {
          const isActive = w.dayOfWeek === date.getDay();
          return (
            <button
              key={w.dayOfWeek}
              onClick={() => {
                const newD = new Date(date);
                const currentDay = date.getDay();
                const diff = w.dayOfWeek - currentDay;
                newD.setDate(date.getDate() + diff);
                setDate(newD);
              }}
              className={cn(
                "flex-1 min-w-[56px] py-1.5 px-2.5 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer",
                isActive
                  ? "bg-primary border-primary text-primary-foreground shadow-2xs font-extrabold"
                  : "bg-background border-border/80 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
              title={w.full}
            >
              {w.short}
            </button>
          );
        })}
      </div>

      {pricingRules && pricingRules.length > 0 ? (
        <SubFieldTimelineHeatmap
          segments={segments}
          onSegmentClick={onSegmentClick}
        />
      ) : null}
    </CardHeader>
  );
}
