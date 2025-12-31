import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";

interface BookingFiltersProps {
  onFilterChange: (filters: {
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
  { value: "COMPLETED", label: "Đã thanh toán" },
  { value: "CANCELED", label: "Đã hủy" },
];

export function BookingFilters({
  onFilterChange,
  onClear,
}: BookingFiltersProps) {
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [statusOpen, setStatusOpen] = useState(false);

  const handleApply = () => {
    onFilterChange({
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

  const handleStatusSelect = (value: BookingStatus | "ALL") => {
    setStatus(value);
    setStatusOpen(false);
    setTimeout(() => {
      onFilterChange({
        status: value === "ALL" ? undefined : value,
        dateRange,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      });
    }, 100);
  };

  const currentStatusLabel =
    statusList.find((s) => s.value === status)?.label || "Tất cả";
  const hasStatusFilter = status !== "ALL";
  const hasDateFilter = !!dateRange;
  const hasPriceFilter = !!minPrice || !!maxPrice;
  const hasAnyFilter = hasStatusFilter || hasDateFilter || hasPriceFilter;

  return (
    <div className="flex items-center gap-2">
      {/* Status Filter - Direct dropdown */}
      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasStatusFilter ? "default" : "outline"}
            className="h-9 gap-2"
          >
            {currentStatusLabel}
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="start">
          <div className="space-y-1">
            {statusList.map((item) => (
              <button
                key={item.value}
                onClick={() => handleStatusSelect(item.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left",
                  status === item.value && "bg-accent"
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    status === item.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={hasDateFilter ? "default" : "outline"}
            className="h-9 gap-2"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {hasDateFilter && dateRange?.from
              ? dateRange.to
                ? `${format(dateRange.from, "dd/MM", {
                    locale: vi,
                  })} - ${format(dateRange.to, "dd/MM", { locale: vi })}`
                : format(dateRange.from, "dd/MM", { locale: vi })
              : "Thời gian"}
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(range) => {
              setDateRange(range);
              if (range?.from && range?.to) {
                setTimeout(handleApply, 100);
              }
            }}
            numberOfMonths={2}
            locale={vi}
          />
        </PopoverContent>
      </Popover>

      {/* Price Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={hasPriceFilter ? "default" : "outline"}
            className="h-9 gap-2"
          >
            {hasPriceFilter
              ? minPrice && maxPrice
                ? `${parseInt(minPrice) / 1000}k - ${
                    parseInt(maxPrice) / 1000
                  }k`
                : minPrice
                ? `Từ ${parseInt(minPrice) / 1000}k`
                : `Đến ${parseInt(maxPrice) / 1000}k`
              : "Giá"}
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="end">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-2 block">
                Khoảng giá
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder="Từ"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Đến"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            </div>
            <Button onClick={handleApply} className="w-full h-9">
              Áp dụng
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear All Filters */}
      {hasAnyFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-9 text-xs"
        >
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}
