import { EmptyState } from "@/components/shared/EmptyState";
import { TimeSlotsGrid } from "@/components/shared/TimeSlotsGrid";
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
import { formatMinutesToTime, parseRuleTimeToMinutes } from "@/utils/time.utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

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

const dayNames: Record<number, string> = {
  0: "Chủ nhật",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
};

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
  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-2">
        <Label className="block text-sm font-semibold text-foreground">
          Tình trạng sân ({date ? format(date, "dd/MM/yyyy") : "--/--/----"})
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
                  {date ? format(date, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
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
                      ? format(endDate, "dd/MM/yyyy", { locale: vi })
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
                Bảng giá hôm nay ({dayNames[date.getDay()]})
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
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            Thời lượng phải lớn hơn 0 và là bội của 30 phút.
          </p>
        ) : null}
      </div>
    </div>
  );
}
