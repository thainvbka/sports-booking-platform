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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Calendar as CalendarIcon,
    Coins,
    Filter,
    RotateCcw,
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
      <div className="flex items-center gap-2">
        {activeCount > 0 ? (
          <Badge
            variant="outline"
            className="rounded-full border-primary/30 bg-primary/10 text-[10px] font-semibold uppercase tracking-wider text-primary"
          >
            {activeCount} đang áp dụng
          </Badge>
        ) : null}
        <Separator
          orientation="horizontal"
          className="ml-1 flex-1 bg-border/70"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Tag className="size-3" />
            Trạng thái
          </Label>
          <Select
            value={status}
            onValueChange={(selectedValue) =>
              setStatus(selectedValue as BookingStatus | "ALL")
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statusList.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <CalendarIcon className="size-3" />
            Thời gian
          </Label>
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
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Coins className="size-3" />
            Khoảng giá (VND)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Từ"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              disabled={isLoading}
              className="tabular-nums"
            />
            <Input
              type="number"
              min={0}
              placeholder="Đến"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              disabled={isLoading}
              className="tabular-nums"
            />
          </div>
        </div>

        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-1">
          <Button
            onClick={handleApply}
            disabled={isLoading}
            className="rounded-full"
          >
            <Filter data-icon="inline-start" />
            Áp dụng lọc
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isLoading || activeCount === 0}
            className="rounded-full"
          >
            <RotateCcw data-icon="inline-start" />
            Xóa bộ lọc
          </Button>
        </div>
      </div>
    </div>
  );
}
