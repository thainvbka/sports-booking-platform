import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, FilePen, Trash2 } from "lucide-react";
import type { PricingRule } from "@/types";
import {
  formatPrice,
  formatTime,
  getRuleClassification,
  minutesBetween,
  formatDuration,
  PRICING_TIER_CONFIGS,
} from "@/utils";
import type { Column } from "@/components/shared/ui-utility/DataTable";
import { cn } from "@/lib/utils";

interface PricingColumnsProps {
  pricingRules: PricingRule[];
  selectedRuleIds: string[];
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onRuleSelect: (ruleId: string, checked: boolean) => void;
  onEdit: (rule: PricingRule) => void;
  onDelete: (rule: PricingRule) => void;
}

export function usePricingColumns({
  pricingRules,
  selectedRuleIds,
  allSelected,
  onSelectAll,
  onRuleSelect,
  onEdit,
  onDelete,
}: PricingColumnsProps): Column<PricingRule>[] {
  return useMemo(
    () => [
      {
        header: (
          <div className="flex items-center justify-center w-full">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              aria-label="Chọn tất cả khung giờ"
            />
          </div>
        ) as unknown as string,
        className: "w-12 text-center",
        cell: (rule) => {
          const isSelected = selectedRuleIds.includes(rule.id);
          return (
            <div className="flex items-center justify-center w-full">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onRuleSelect(rule.id, checked as boolean)}
                aria-label={`Chọn khung giờ ${formatTime(rule.start_time)} - ${formatTime(rule.end_time)}`}
              />
            </div>
          );
        },
      },
      {
        header: "STT",
        className: "hidden w-16 text-center sm:table-cell text-xs font-semibold tabular-nums text-muted-foreground",
        cell: (_, idx) => `#${idx + 1}`,
      },
      {
        header: "Khung giờ",
        className: "text-left w-[35%]",
        cell: (rule) => {
          const start = formatTime(rule.start_time);
          const end = formatTime(rule.end_time);
          const dur = minutesBetween(start, end);
          const classification = getRuleClassification(rule, pricingRules);
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                <span className="font-display font-bold italic tabular-nums tracking-tight text-foreground sm:text-base">
                  {start} → {end}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:hidden">
                <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
                  {formatDuration(dur)}
                </span>
                <span className="text-muted-foreground/30 text-[10px]">•</span>
                <span className={cn("text-[10px] font-bold", PRICING_TIER_CONFIGS[classification].textClass)}>
                  {PRICING_TIER_CONFIGS[classification].label}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        header: "Phân loại",
        className: "hidden sm:table-cell text-center w-28",
        cell: (rule) => {
          const classification = getRuleClassification(rule, pricingRules);
          return (
            <div className="flex items-center justify-center">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full text-[10px] font-bold px-2 py-0.5",
                  PRICING_TIER_CONFIGS[classification].badgeClass,
                )}
              >
                {PRICING_TIER_CONFIGS[classification].label}
              </Badge>
            </div>
          );
        },
      },
      {
        header: "Đơn giá / giờ",
        className: "text-right w-36",
        cell: (rule) => {
          const price = Number(rule.base_price);
          return (
            <div className="flex flex-col items-end pr-1">
              <span className="font-display text-sm font-black italic tabular-nums tracking-tight text-foreground sm:text-base">
                {formatPrice(price)}
              </span>
              <span className="text-[9px] text-muted-foreground sm:hidden">/ giờ</span>
            </div>
          );
        },
      },
      {
        header: "Thao tác",
        className: "w-28 text-center",
        cell: (rule) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Chỉnh sửa khung giờ"
              className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary cursor-pointer"
              onClick={() => onEdit(rule)}
            >
              <FilePen className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Xóa khung giờ"
              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              onClick={() => onDelete(rule)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [pricingRules, selectedRuleIds, allSelected, onSelectAll, onRuleSelect, onEdit, onDelete],
  );
}
