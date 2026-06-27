import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WEEKDAYS } from "@/constants";
import { Copy } from "lucide-react";
import { getVnDayOfWeek } from "@/utils/time.util";

interface CopyPricingDropdownProps {
  date: Date;
  copyTargetDays: number[];
  setCopyTargetDays: (days: number[]) => void;
  onCopy: (days: number[]) => void;
  isLoading: boolean;
}

export function CopyPricingDropdown({
  date,
  copyTargetDays,
  setCopyTargetDays,
  onCopy,
  isLoading,
}: CopyPricingDropdownProps) {
  const currentDayOfWeek = getVnDayOfWeek(date);

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) setCopyTargetDays([]); }}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-xl border-border/80 bg-background px-3.5 text-xs font-semibold hover:border-primary/30 cursor-pointer"
        >
          <Copy className="size-3.5 text-muted-foreground" />
          Sao chép giá
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5 space-y-1">
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
          Sao chép sang...
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          checked={
            WEEKDAYS.filter((w) => w.dayOfWeek !== currentDayOfWeek).length > 0 &&
            WEEKDAYS.filter((w) => w.dayOfWeek !== currentDayOfWeek).every((w) =>
              copyTargetDays.includes(w.dayOfWeek),
            )
          }
          onCheckedChange={(checked) => {
            if (checked) {
              setCopyTargetDays(
                WEEKDAYS.filter((w) => w.dayOfWeek !== currentDayOfWeek).map(
                  (w) => w.dayOfWeek,
                ),
              );
            } else {
              setCopyTargetDays([]);
            }
          }}
          onSelect={(e) => e.preventDefault()}
          className="text-xs cursor-pointer font-semibold"
        >
          Tất cả các ngày
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {WEEKDAYS.map((w) => {
            const isCurrent = w.dayOfWeek === currentDayOfWeek;
            if (isCurrent) return null;

            const isSelected = copyTargetDays.includes(w.dayOfWeek);
            return (
              <DropdownMenuCheckboxItem
                key={w.dayOfWeek}
                checked={isSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setCopyTargetDays([...copyTargetDays, w.dayOfWeek]);
                  } else {
                    setCopyTargetDays(copyTargetDays.filter((d) => d !== w.dayOfWeek));
                  }
                }}
                onSelect={(e) => e.preventDefault()}
                className="text-xs cursor-pointer"
              >
                {w.full}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <div className="p-1">
          <Button
            size="sm"
            disabled={copyTargetDays.length === 0 || isLoading}
            onClick={() => onCopy(copyTargetDays)}
            className="w-full text-xs h-8 font-bold rounded-lg cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground"
          >
            {isLoading ? "Đang sao chép..." : `Xác nhận sao chép (${copyTargetDays.length})`}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
