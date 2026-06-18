import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils";
import { Filter, ListChecks, Users, Wallet, X } from "lucide-react";
import type { SportType as SportTypeValue } from "@/types";
import { RangePopover } from "./RangePopover";
import { SportTypePopover } from "./SportTypePopover";
import {
  buildActiveChips,
  countActiveFilters,
  type ChipKey,
  type SearchFiltersValue,
} from "@/utils/search.util";

const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: "< 100K", max: 100_000 },
  { label: "100K – 200K", min: 100_000, max: 200_000 },
  { label: "200K – 400K", min: 200_000, max: 400_000 },
  { label: "400K – 700K", min: 400_000, max: 700_000 },
  { label: "> 700K", min: 700_000 },
];

const CAPACITY_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: "≤ 5 người", max: 5 },
  { label: "5 – 10 người", min: 5, max: 10 },
  { label: "10 – 20 người", min: 10, max: 20 },
  { label: "> 20 người", min: 20 },
];

interface SearchFiltersProps {
  value: SearchFiltersValue;
  onChange: (next: SearchFiltersValue) => void;
  className?: string;
  /** When true, capacity filter is hidden (e.g. only complex search visible) */
  hideCapacity?: boolean;
}

export function SearchFilters({
  value,
  onChange,
  className,
  hideCapacity,
}: SearchFiltersProps) {
  const activeCount = countActiveFilters(value, { hideCapacity });

  const updateRange = (
    key: "price" | "capacity",
    next: { min?: number; max?: number },
  ) => {
    if (key === "price") {
      onChange({ ...value, minPrice: next.min, maxPrice: next.max });
    } else {
      onChange({ ...value, minCapacity: next.min, maxCapacity: next.max });
    }
  };

  const toggleSport = (sport: SportTypeValue) => {
    const exists = value.sportTypes.includes(sport);
    const nextSports = exists
      ? value.sportTypes.filter((s) => s !== sport)
      : [...value.sportTypes, sport];
    onChange({ ...value, sportTypes: nextSports });
  };

  const clearAll = () => {
    onChange({
      location: value.location,
      sportTypes: [],
      minPrice: undefined,
      maxPrice: undefined,
      minCapacity: undefined,
      maxCapacity: undefined,
    });
  };

  const removeChip = (chipKey: ChipKey) => {
    switch (chipKey) {
      case "location":
        onChange({ ...value, location: undefined });
        break;
      case "sport_types":
        onChange({ ...value, sportTypes: [] });
        break;
      case "price":
        onChange({ ...value, minPrice: undefined, maxPrice: undefined });
        break;
      case "capacity":
        onChange({ ...value, minCapacity: undefined, maxCapacity: undefined });
        break;
    }
  };

  const chips = buildActiveChips(value, { hideCapacity });

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 pr-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          Bộ lọc
        </span>

        {/* Sport types multi-select */}
        <SportTypePopover
          values={value.sportTypes}
          onToggle={toggleSport}
          onClear={() => onChange({ ...value, sportTypes: [] })}
        />

        {/* Price range */}
        <RangePopover
          label="Khoảng giá"
          icon={<Wallet className="h-3.5 w-3.5" />}
          min={value.minPrice}
          max={value.maxPrice}
          formatValue={formatPrice}
          presets={PRICE_PRESETS}
          unitSuffix="VND"
          step={50_000}
          minLabel="Giá thấp nhất"
          maxLabel="Giá cao nhất"
          minPlaceholder="0"
          maxPlaceholder="1.000.000"
          onApply={(range) => updateRange("price", range)}
        />

        {/* Capacity range */}
        {!hideCapacity ? (
          <RangePopover
            label="Sức chứa"
            icon={<Users className="h-3.5 w-3.5" />}
            min={value.minCapacity}
            max={value.maxCapacity}
            formatValue={(value) => `${value} người`}
            presets={CAPACITY_PRESETS}
            unitSuffix="người"
            step={1}
            minLabel="Tối thiểu"
            maxLabel="Tối đa"
            minPlaceholder="0"
            maxPlaceholder="30"
            helperText="Chỉ áp dụng cho kết quả sân lẻ."
            onApply={(range) => updateRange("capacity", range)}
          />
        ) : null}

        {activeCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="ml-auto h-8 rounded-full px-3 text-xs"
          >
            <X className="h-3.5 w-3.5" />
            Xóa tất cả ({activeCount})
          </Button>
        ) : null}
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-surface-2/70 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" />
            Đang lọc
          </span>
          {chips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="gap-1.5 rounded-full bg-background px-2.5 py-1 text-xs font-medium shadow-xs"
            >
              {chip.icon}
              {chip.label}
              <button
                type="button"
                onClick={() => removeChip(chip.key)}
                aria-label={`Bỏ lọc ${chip.label}`}
                className="-mr-1 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition hover:bg-foreground hover:text-background"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
export type { SearchFiltersValue };
