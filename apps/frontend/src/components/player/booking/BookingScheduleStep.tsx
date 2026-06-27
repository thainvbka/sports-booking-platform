import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { TimeSlotsGrid } from "@/components/shared/ui-utility/TimeSlotsGrid";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { PricingRule } from "@/types";
import { DAYS_OF_WEEK_FULL } from "@/constants";
import { formatMinutesToTime, parseRuleTimeToMinutes, formatDateVn, getVnDayOfWeek } from "@/utils/time.util";
import { Calendar as CalendarIcon } from "lucide-react";
import { useMemo } from "react";

type BookingType = "single" | "recurring";

type RecurringType = "WEEKLY" | "MONTHLY";

interface BookingScheduleStepProps {
  subfieldId: string;
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  bookingType: BookingType;
  onBookingTypeChange: (type: BookingType) => void;
  endDate?: Date;
  onEndDateChange: (date: Date | undefined) => void;
  recurringType: RecurringType;
  onRecurringTypeChange: (type: RecurringType) => void;
  availableRules: PricingRule[];
  customStartTime: string;
  customEndTime: string;
  timeOptions: string[];
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  isCustomTimeValid: boolean;
}


const formatRuleTime = (time: string | Date) => {
  const mins = parseRuleTimeToMinutes(time);
  if (mins === null) return "--:--";
  return formatMinutesToTime(mins);
};

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

export function BookingScheduleStep({
  subfieldId,
  date,
  onDateChange,
  bookingType,
  onBookingTypeChange,
  endDate,
  onEndDateChange,
  recurringType,
  onRecurringTypeChange,
  availableRules,
  customStartTime,
  customEndTime,
  timeOptions,
  onStartTimeChange,
  onEndTimeChange,
  isCustomTimeValid,
}: BookingScheduleStepProps) {
  const operatingHoursStr = useMemo(() => {
    if (!availableRules || availableRules.length === 0) return "";
    const allTimes = availableRules.flatMap((rule) => {
      const start = parseRuleTimeToMinutes(rule.start_time);
      const end = parseRuleTimeToMinutes(rule.end_time);
      if (start === null || end === null) return [];
      return [start, end];
    });
    if (allTimes.length === 0) return "";
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);
    return `${formatMinutesToTime(minTime)} - ${formatMinutesToTime(maxTime)}`;
  }, [availableRules]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-2">
        <Label className="block text-sm font-semibold text-foreground">
          Tình trạng sân {date ? `ngày ${formatDateVn(date, "dd/MM/yyyy")}` : ""} {operatingHoursStr ? `(${operatingHoursStr})` : ""}
        </Label>
        <p className="text-xs text-muted-foreground">
          Chọn khung giờ theo trạng thái thực tế của sân ở từng mốc 30 phút.
        </p>
        {date ? (
          <TimeSlotsGrid
            subFieldId={subfieldId}
            date={date}
            pricingRules={availableRules}
            selectedStart={customStartTime}
            selectedEnd={customEndTime}
          />
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Chọn ngày để hiển thị trạng thái sân.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <Tabs value={bookingType} onValueChange={(value) => onBookingTypeChange(value as BookingType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Đặt một lần</TabsTrigger>
            <TabsTrigger value="recurring">Đặt định kỳ</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Ngày bắt đầu</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? formatDateVn(date, "dd/MM/yyyy") : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={onDateChange}
                  disabled={(selectedDate) =>
                    selectedDate < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {bookingType === "recurring" && (
            <div className="space-y-2">
              <Label>Ngày kết thúc</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate
                      ? formatDateVn(endDate, "dd/MM/yyyy")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={onEndDateChange}
                    disabled={(selectedDate) =>
                      date
                        ? selectedDate <= date
                        : selectedDate < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {bookingType === "recurring" && (
          <div className="space-y-2">
            <Label>Tần suất lặp lại</Label>
            <Select
              value={recurringType}
              onValueChange={(value: RecurringType) => onRecurringTypeChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn tần suất" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Hàng tuần</SelectItem>
                <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {date ? (
          availableRules.length > 0 ? (
            <div className="rounded-xl border border-primary/20 bg-linear-to-br from-primary/8 to-primary/3 p-4 shadow-sm">
              <p className="mb-2 text-sm font-semibold text-primary">
                Bảng giá hôm nay ({DAYS_OF_WEEK_FULL[getVnDayOfWeek(date)]})
              </p>
              <div className="space-y-1.5 text-xs">
                {availableRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between rounded-md bg-background/70 px-2 py-1.5"
                  >
                    <span>
                      {formatRuleTime(rule.start_time)} - {formatRuleTime(rule.end_time)}
                    </span>
                    <span className="font-semibold text-primary">
                      {Number(rule.base_price).toLocaleString("vi-VN")}đ/h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Chưa có bảng giá cho ngày đã chọn"
              description="Vui lòng chọn ngày khác hoặc liên hệ chủ sân để cập nhật khung giờ."
              className="py-8"
            />
          )
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Giờ bắt đầu</Label>
            <Select value={customStartTime} onValueChange={onStartTimeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn giờ" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Giờ kết thúc</Label>
            <Select value={customEndTime} onValueChange={onEndTimeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn giờ" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem
                    key={time}
                    value={time}
                    disabled={
                      !!customStartTime && toMinutes(time) <= toMinutes(customStartTime)
                    }
                  >
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isCustomTimeValid && customStartTime && customEndTime ? (
          <p className="rounded-lg px-3 py-2 text-sm status-surface-error">
            Thời lượng phải lớn hơn 0 và là bội của 30 phút.
          </p>
        ) : null}
      </div>
    </div>
  );
}
