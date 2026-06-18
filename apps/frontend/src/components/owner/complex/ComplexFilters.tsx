import { OwnerFilterActiveBadge } from "@/components/owner/OwnerFilterShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComplexStatus } from "@/types";
import { RotateCcw, Tag } from "lucide-react";

interface ComplexFiltersProps {
  value: ComplexStatus | "ALL";
  isLoading?: boolean;
  onApply: (status: ComplexStatus | "ALL") => void;
  onClear: () => void;
}

const STATUS_OPTIONS = [
  { id: "ALL" as const, label: "Tất cả" },
  { id: ComplexStatus.ACTIVE, label: "Hoạt động" },
  { id: ComplexStatus.PENDING, label: "Chờ duyệt" },
  { id: ComplexStatus.INACTIVE, label: "Ngừng" },
  { id: ComplexStatus.REJECTED, label: "Từ chối" },
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
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Tag className="size-3" />
            Trạng thái
          </Label>
          <Select
            value={value}
            onValueChange={(selectedValue) =>
              onApply(selectedValue as ComplexStatus | "ALL")
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

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
