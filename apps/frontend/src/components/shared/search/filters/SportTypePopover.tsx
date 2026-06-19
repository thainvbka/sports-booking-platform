import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SPORT_TYPE_OPTIONS } from "@/constants";
import { cn } from "@/lib/utils";
import type { SportType as SportTypeValue } from "@/types";
import { getSportTypeLabel } from "@/utils";
import { Flag } from "lucide-react";

interface SportTypePopoverProps {
  values: SportTypeValue[];
  onToggle: (sport: SportTypeValue) => void;
  onClear: () => void;
}

export function SportTypePopover({
  values,
  onToggle,
  onClear,
}: SportTypePopoverProps) {
  const count = values.length;
  const summary =
    count === 0
      ? "Tất cả môn"
      : count === 1
        ? getSportTypeLabel(values[0])
        : `${count} môn đã chọn`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-9 rounded-full border-border/70 bg-background pl-3 pr-3 text-xs font-medium",
            count > 0 && "border-foreground/80 bg-foreground/[0.04]",
          )}
        >
          <Flag className="h-3.5 w-3.5" />
          {summary}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="flex items-center justify-between pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Môn thể thao
          </p>
          {count > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onClear}
              className="h-6 rounded-full px-2 text-[11px]"
            >
              Bỏ chọn
            </Button>
          ) : null}
        </div>
        <Separator />
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {SPORT_TYPE_OPTIONS.map((sport) => {
            const checked = values.includes(sport);
            return (
              <button
                type="button"
                key={sport}
                onClick={() => onToggle(sport)}
                className={cn(
                  "flex items-center justify-between rounded-md border border-transparent px-2.5 py-1.5 text-left text-xs font-medium transition",
                  checked
                    ? "border-foreground/15 bg-foreground/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {getSportTypeLabel(sport)}
                <span
                  className={cn(
                    "inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border",
                    checked
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background",
                  )}
                  aria-hidden="true"
                >
                  {checked ? <span className="text-[8px] leading-none">✓</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
