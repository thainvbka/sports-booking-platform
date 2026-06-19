import { COMPLEX_STATUS_LABELS } from "@/constants";
import {
  FilterFieldWrapper,
  FilterSelectField,
  OwnerFilterActiveBadge,
} from "@/components/owner/OwnerFilterShell";
import { Button } from "@/components/ui/button";
import { ComplexStatus } from "@/types";
import { RotateCcw, Tag } from "lucide-react";

interface ComplexFiltersProps {
  value: ComplexStatus | "ALL";
  isLoading?: boolean;
  onApply: (status: ComplexStatus | "ALL") => void;
  onClear: () => void;
}

const STATUS_OPTIONS: Array<{ value: ComplexStatus | "ALL"; label: string }> = [
  { value: "ALL" as const, label: "Tất cả" },
  { value: ComplexStatus.ACTIVE, label: COMPLEX_STATUS_LABELS[ComplexStatus.ACTIVE] },
  { value: ComplexStatus.PENDING, label: COMPLEX_STATUS_LABELS[ComplexStatus.PENDING] },
  { value: ComplexStatus.INACTIVE, label: COMPLEX_STATUS_LABELS[ComplexStatus.INACTIVE] },
  { value: ComplexStatus.REJECTED, label: COMPLEX_STATUS_LABELS[ComplexStatus.REJECTED] },
];

export function ComplexFilters({
  value,
  isLoading,
  onApply,
  onClear,
}: ComplexFiltersProps) {
  const activeCount = value !== "ALL" ? 1 : 0;

  return (
    <div className="flex flex-col gap-3 w-full">
      <OwnerFilterActiveBadge count={activeCount} />

      <div className="flex flex-wrap items-end gap-3">
        <FilterFieldWrapper label="Trạng thái" icon={Tag} className="min-w-[200px]">
          <FilterSelectField
            value={value}
            onValueChange={(selectedValue) =>
              onApply(selectedValue as ComplexStatus | "ALL")
            }
            options={STATUS_OPTIONS}
            placeholder="Tất cả trạng thái"
            disabled={isLoading}
          />
        </FilterFieldWrapper>

        {activeCount > 0 && (
          <Button
            variant="outline"
            onClick={onClear}
            disabled={isLoading}
            className="rounded-full"
          >
            <RotateCcw data-icon="inline-start" />
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}
