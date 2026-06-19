import {
  FilterFieldWrapper,
  FilterSelectField,
  NumericRangeField,
  OwnerFilterActions,
  OwnerFilterActiveBadge,
} from "@/components/owner/OwnerFilterShell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Coins,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

interface BookingFiltersProps {
  value?: {
    status?: BookingStatus;
    dateRange?: DateRange;
    minPrice?: number;
    maxPrice?: number;
  };
  isLoading?: boolean;
  onApply: (filters: {
    status?: BookingStatus;
    dateRange?: DateRange;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
  onClear: () => void;
}

const statusList: Array<{ value: BookingStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chưa thanh toán" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "COMPLETED", label: "Chờ xác nhận" },
  { value: "CANCELED", label: "Đã hủy" },
];

export function BookingFilters({
  value,
  isLoading,
  onApply,
  onClear,
}: BookingFiltersProps) {
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  useEffect(() => {
    if (value) {
      setStatus(value.status ? (value.status as BookingStatus) : "ALL");
      setDateRange(value.dateRange);
      setMinPrice(value.minPrice ? String(value.minPrice) : "");
      setMaxPrice(value.maxPrice ? String(value.maxPrice) : "");
    }
  }, [value]);

  const handleApply = () => {
    onApply({
      status: status === "ALL" ? undefined : status,
      dateRange,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  };

  const handleClear = () => {
    setStatus("ALL");
    setDateRange(undefined);
    setMinPrice("");
    setMaxPrice("");
    onClear();
  };

  const activeCount = [
    status !== "ALL" ? 1 : 0,
    dateRange ? 1 : 0,
    minPrice || maxPrice ? 1 : 0,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 w-full">
      <OwnerFilterActiveBadge count={activeCount} />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FilterFieldWrapper label="Trạng thái" icon={Tag}>
          <FilterSelectField
            value={status}
            onValueChange={(selectedValue) =>
              setStatus(selectedValue as BookingStatus | "ALL")
            }
            options={statusList}
            placeholder="Tất cả trạng thái"
            disabled={isLoading}
          />
        </FilterFieldWrapper>

        <FilterFieldWrapper label="Thời gian" icon={CalendarIcon}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground",
                )}
                disabled={isLoading}
              >
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM", { locale: vi })} –{" "}
                      {format(dateRange.to, "dd/MM", { locale: vi })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM", { locale: vi })
                  )
                ) : (
                  "Chọn ngày"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                }}
                numberOfMonths={2}
                locale={vi}
              />
            </PopoverContent>
          </Popover>
        </FilterFieldWrapper>

        <FilterFieldWrapper label="Khoảng giá (VND)" icon={Coins}>
          <NumericRangeField
            minValue={minPrice}
            maxValue={maxPrice}
            onMinChange={setMinPrice}
            onMaxChange={setMaxPrice}
            disabled={isLoading}
          />
        </FilterFieldWrapper>

        <OwnerFilterActions
          onApply={handleApply}
          onClear={handleClear}
          isLoading={isLoading}
          clearDisabled={activeCount === 0}
          className="md:col-span-2 xl:col-span-1"
        />
      </div>
    </div>
  );
}
