import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SportType, type SportType as SportTypeValue } from "@/types";
import { formatPrice, getSportTypeLabel } from "@/utils";
import {
  Filter,
  Flag,
  ListChecks,
  MapPin,
  Tag,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

const SPORT_TYPE_OPTIONS = Object.values(SportType) as SportTypeValue[];

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

export interface SearchFiltersValue {
  location?: string;
  sportTypes: SportTypeValue[];
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
}

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

/* -------------------------------------------------------------------------- */
/* Sport type multi-select popover                                             */
/* -------------------------------------------------------------------------- */

interface SportTypePopoverProps {
  values: SportTypeValue[];
  onToggle: (sport: SportTypeValue) => void;
  onClear: () => void;
}

function SportTypePopover({ values, onToggle, onClear }: SportTypePopoverProps) {
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

/* -------------------------------------------------------------------------- */
/* Range (price / capacity) popover                                            */
/* -------------------------------------------------------------------------- */

interface RangePopoverProps {
  label: string;
  icon: ReactNode;
  min?: number;
  max?: number;
  formatValue: (value: number) => string;
  presets: { label: string; min?: number; max?: number }[];
  unitSuffix: string;
  step: number;
  minLabel: string;
  maxLabel: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  helperText?: string;
  onApply: (range: { min?: number; max?: number }) => void;
}

function RangePopover({
  label,
  icon,
  min,
  max,
  formatValue,
  presets,
  unitSuffix,
  step,
  minLabel,
  maxLabel,
  minPlaceholder,
  maxPlaceholder,
  helperText,
  onApply,
}: RangePopoverProps) {
  const [open, setOpen] = useState(false);
  const [draftMin, setDraftMin] = useState<string>(min !== undefined ? String(min) : "");
  const [draftMax, setDraftMax] = useState<string>(max !== undefined ? String(max) : "");
  const [error, setError] = useState<string | null>(null);

  // Sync draft with external value when popover (re)opens or value changes externally
  useEffect(() => {
    setDraftMin(min !== undefined ? String(min) : "");
    setDraftMax(max !== undefined ? String(max) : "");
    setError(null);
  }, [min, max, open]);

  const summary = useMemo(() => {
    if (min === undefined && max === undefined) return label;
    if (min !== undefined && max !== undefined) {
      return `${formatValue(min)} – ${formatValue(max)}`;
    }
    if (min !== undefined) return `Từ ${formatValue(min)}`;
    return `Đến ${formatValue(max as number)}`;
  }, [label, min, max, formatValue]);

  const isActive = min !== undefined || max !== undefined;

  const parseDraft = (input: string): number | undefined => {
    const trimmed = input.trim();
    if (!trimmed) return undefined;
    const num = Number(trimmed.replace(/[,_\s]/g, ""));
    return Number.isFinite(num) && num >= 0 ? num : Number.NaN;
  };

  const handleApply = () => {
    const parsedMin = parseDraft(draftMin);
    const parsedMax = parseDraft(draftMax);

    if (Number.isNaN(parsedMin) || Number.isNaN(parsedMax)) {
      setError("Vui lòng nhập số hợp lệ.");
      return;
    }
    if (
      parsedMin !== undefined &&
      parsedMax !== undefined &&
      parsedMin > parsedMax
    ) {
      setError("Giá trị tối thiểu phải nhỏ hơn hoặc bằng tối đa.");
      return;
    }

    setError(null);
    onApply({ min: parsedMin, max: parsedMax });
    setOpen(false);
  };

  const handleReset = () => {
    setDraftMin("");
    setDraftMax("");
    setError(null);
    onApply({ min: undefined, max: undefined });
    setOpen(false);
  };

  const applyPreset = (preset: { min?: number; max?: number }) => {
    setDraftMin(preset.min !== undefined ? String(preset.min) : "");
    setDraftMax(preset.max !== undefined ? String(preset.max) : "");
    setError(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-9 rounded-full border-border/70 bg-background pl-3 pr-3 text-xs font-medium",
            isActive && "border-foreground/80 bg-foreground/[0.04]",
          )}
        >
          {icon}
          {summary}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-4">
        <div className="flex items-center justify-between pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {isActive ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleReset}
              className="h-6 rounded-full px-2 text-[11px]"
            >
              Đặt lại
            </Button>
          ) : null}
        </div>
        <Separator />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {minLabel}
            </Label>
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={step}
                value={draftMin}
                placeholder={minPlaceholder}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraftMin(event.target.value)
                }
                className="h-9 pr-12 text-sm"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                {unitSuffix}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {maxLabel}
            </Label>
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={step}
                value={draftMax}
                placeholder={maxPlaceholder}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraftMax(event.target.value)
                }
                className="h-9 pr-12 text-sm"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                {unitSuffix}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {presets.map((preset) => {
            const matches =
              (preset.min ?? undefined) ===
                (draftMin === "" ? undefined : Number(draftMin)) &&
              (preset.max ?? undefined) ===
                (draftMax === "" ? undefined : Number(draftMax));
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                  matches
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/50 hover:text-foreground",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {error ? (
          <p className="mt-2 text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-2 text-[11px] text-muted-foreground">{helperText}</p>
        ) : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-8 rounded-full px-3 text-xs"
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            className="h-8 rounded-full px-4 text-xs"
          >
            Áp dụng
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------------------------------- */
/* Active filter chip helpers                                                  */
/* -------------------------------------------------------------------------- */

type ChipKey = "location" | "sport_types" | "price" | "capacity";

interface ActiveChip {
  key: ChipKey;
  label: string;
  icon?: ReactNode;
}

function buildActiveChips(
  value: SearchFiltersValue,
  options: { hideCapacity?: boolean } = {},
): ActiveChip[] {
  const chips: ActiveChip[] = [];

  if (value.location) {
    chips.push({
      key: "location",
      label: `“${value.location}”`,
      icon: <MapPin className="h-3 w-3" />,
    });
  }

  if (value.sportTypes.length > 0) {
    const label =
      value.sportTypes.length === 1
        ? getSportTypeLabel(value.sportTypes[0])
        : `${value.sportTypes.length} môn thể thao`;
    chips.push({
      key: "sport_types",
      label,
      icon: <Flag className="h-3 w-3" />,
    });
  }

  if (value.minPrice !== undefined || value.maxPrice !== undefined) {
    const parts: string[] = [];
    if (value.minPrice !== undefined) parts.push(`từ ${formatPrice(value.minPrice)}`);
    if (value.maxPrice !== undefined) parts.push(`đến ${formatPrice(value.maxPrice)}`);
    chips.push({
      key: "price",
      label: `Giá ${parts.join(" ")}`,
      icon: <Tag className="h-3 w-3" />,
    });
  }

  if (
    !options.hideCapacity &&
    (value.minCapacity !== undefined || value.maxCapacity !== undefined)
  ) {
    const parts: string[] = [];
    if (value.minCapacity !== undefined) parts.push(`${value.minCapacity}+`);
    if (value.maxCapacity !== undefined) parts.push(`≤ ${value.maxCapacity}`);
    chips.push({
      key: "capacity",
      label: `Sức chứa ${parts.join(" · ")}`,
      icon: <Users className="h-3 w-3" />,
    });
  }

  return chips;
}

function countActiveFilters(
  value: SearchFiltersValue,
  options: { hideCapacity?: boolean } = {},
): number {
  let count = 0;
  if (value.sportTypes.length > 0) count += 1;
  if (value.minPrice !== undefined || value.maxPrice !== undefined) count += 1;
  if (
    !options.hideCapacity &&
    (value.minCapacity !== undefined || value.maxCapacity !== undefined)
  ) {
    count += 1;
  }
  return count;
}
