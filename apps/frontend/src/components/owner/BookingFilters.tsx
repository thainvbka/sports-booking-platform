import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  Coins,
  Filter,
  RotateCcw,
  Tag,
} from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

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
  { value: "COMPLETED", label: "Chờ xác nhận" },
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
  const [priceOpen, setPriceOpen] = useState(false);

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
  const activeCount = [hasStatusFilter, hasDateFilter, hasPriceFilter].filter(
    Boolean,
  ).length;

  const pillClass = (active: boolean) =>
    cn(
      "h-9 gap-2 rounded-full border px-3.5 text-xs font-medium transition-colors",
      active
        ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
        : "border-border/70 bg-background text-foreground hover:border-primary/30 hover:text-primary",
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 pr-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        <Filter className="size-3" />
        Lọc
        {activeCount > 0 ? (
          <Badge
            variant="outline"
            className="ml-1 h-4 rounded-full border-primary/30 bg-primary/10 px-1.5 text-[9px] font-semibold uppercase tracking-wider text-primary"
          >
            {activeCount}
          </Badge>
        ) : null}
      </span>

      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={pillClass(hasStatusFilter)}
          >
            <Tag data-icon="inline-start" />
            {hasStatusFilter ? currentStatusLabel : "Trạng thái"}
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-1" align="start">
          <div className="flex flex-col gap-0.5">
            {statusList.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleStatusSelect(item.value)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  status === item.value && "bg-accent text-accent-foreground",
                )}
              >
                <Check
                  className={cn(
                    "size-3.5",
                    status === item.value
                      ? "opacity-100 text-primary"
                      : "opacity-0",
                  )}
                />
                {item.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={pillClass(hasDateFilter)}
          >
            <CalendarIcon data-icon="inline-start" />
            {hasDateFilter && dateRange?.from
              ? dateRange.to
                ? `${format(dateRange.from, "dd/MM", {
                    locale: vi,
                  })} – ${format(dateRange.to, "dd/MM", { locale: vi })}`
                : format(dateRange.from, "dd/MM", { locale: vi })
              : "Thời gian"}
            <ChevronDown className="size-3.5 opacity-60" />
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

      <Popover open={priceOpen} onOpenChange={setPriceOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={pillClass(hasPriceFilter)}
          >
            <Coins data-icon="inline-start" />
            {hasPriceFilter
              ? minPrice && maxPrice
                ? `${parseInt(minPrice) / 1000}k – ${parseInt(maxPrice) / 1000}k`
                : minPrice
                  ? `Từ ${parseInt(minPrice) / 1000}k`
                  : `Đến ${parseInt(maxPrice) / 1000}k`
              : "Giá"}
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="end">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Khoảng giá (VND)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-9 tabular-nums"
                />
                <Input
                  type="number"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-9 tabular-nums"
                />
              </div>
            </div>
            <Separator />
            <Button
              onClick={() => {
                handleApply();
                setPriceOpen(false);
              }}
              className="h-9 rounded-full"
            >
              <Filter data-icon="inline-start" />
              Áp dụng
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {hasAnyFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-9 rounded-full text-muted-foreground hover:text-destructive"
        >
          <RotateCcw data-icon="inline-start" />
          Xóa
        </Button>
      )}
    </div>
  );
}
