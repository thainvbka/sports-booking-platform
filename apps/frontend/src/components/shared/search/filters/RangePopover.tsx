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
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

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

export function RangePopover({
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
