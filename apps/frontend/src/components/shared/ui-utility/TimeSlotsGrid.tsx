import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { publicService } from "@/services/public.service";
import type { PricingRule } from "@/types";
import {
  formatMinutesToTime,
  parseBookingTimeToVnMinutes,
  parseRuleTimeToMinutes,
} from "@/utils/time.utils";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

interface BookingSlot {
  start: string;
  end: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED";
}

interface TimeSlotsGridProps {
  subFieldId: string;
  date: Date;
  selectedStart?: string;
  selectedEnd?: string;
  pricingRules: PricingRule[];
}

export function TimeSlotsGrid({
  subFieldId,
  date,
  selectedStart,
  selectedEnd,
  pricingRules,
}: TimeSlotsGridProps) {
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!date || !subFieldId) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const fmtDate = format(date, "yyyy-MM-dd");
      const data = await publicService.getSubfieldAvailability(subFieldId, fmtDate);
      setBookings(data.data.availability.bookings || []);
    } catch (error) {
      console.error("Failed to fetch availability", error);
      setBookings([]);
      setErrorMessage("Không thể tải trạng thái sân cho ngày đã chọn.");
    } finally {
      setIsLoading(false);
    }
  }, [date, subFieldId]);

  useEffect(() => {
    void fetchAvailability();
  }, [fetchAvailability]);

  const timeSlots = useMemo(() => {
    if (!pricingRules || pricingRules.length === 0) return [];

    const allTimes = pricingRules.flatMap((rule) => {
      const start = parseRuleTimeToMinutes(rule.start_time);
      const end = parseRuleTimeToMinutes(rule.end_time);
      if (start === null || end === null) return [];
      return [start, end];
    });

    if (allTimes.length === 0) return [];

    const startOfDay = Math.min(...allTimes);
    const endOfDay = Math.max(...allTimes);

    const slots: number[] = [];
    for (let min = startOfDay; min < endOfDay; min += 30) {
      slots.push(min);
    }
    return slots;
  }, [pricingRules]);

  const getSlotStatus = (
    slotMin: number,
  ): "AVAILABLE" | "BOOKED" | "PENDING" | "SELECTED" => {
    const slotStartMin = slotMin;
    const slotEndMin = slotMin + 30;

    if (selectedStart && selectedEnd) {
      const [sH, sM] = selectedStart.split(":").map(Number);
      const [eH, eM] = selectedEnd.split(":").map(Number);
      const selStartMin = sH * 60 + sM;
      const selEndMin = eH * 60 + eM;

      if (slotStartMin >= selStartMin && slotStartMin < selEndMin) {
        return "SELECTED";
      }
    }

    // FIX: dùng parseBookingTimeToVnMinutes (toZonedTime) thay vì getHours() (local time)
    for (const booking of bookings) {
      const bStartMin = parseBookingTimeToVnMinutes(booking.start);
      const bEndMin = parseBookingTimeToVnMinutes(booking.end);

      if (Math.max(slotStartMin, bStartMin) < Math.min(slotEndMin, bEndMin)) {
        return booking.status === "PENDING" ? "PENDING" : "BOOKED";
      }
    }

    return "AVAILABLE";
  };

  if (isLoading) {
    return <LoadingState text="Đang tải trạng thái sân..." className="py-10" />;
  }

  if (errorMessage) {
    return (
      <EmptyState
        title="Không thể tải trạng thái sân"
        description={errorMessage}
        actionLabel="Thử lại"
        onAction={() => void fetchAvailability()}
        className="py-10"
      />
    );
  }

  if (timeSlots.length === 0) {
    return (
      <EmptyState
        title="Chưa có khung giờ cho ngày này"
        description="Bảng giá của sân chưa cấu hình khung giờ phù hợp. Vui lòng chọn ngày khác."
        className="py-10"
      />
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="outline" className="bg-background text-foreground">
          Trống
        </Badge>
        <Badge className="bg-primary text-primary-foreground">Đang chọn</Badge>
        <Badge
          variant="outline"
          className="status-surface-warning"
        >
          Chờ thanh toán
        </Badge>
        <Badge
          variant="outline"
          className="status-surface-error"
        >
          Đã đặt
        </Badge>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-4 gap-2 pb-4 sm:grid-cols-6">
          {timeSlots.map((time) => {
            const status = getSlotStatus(time);
            return (
              <div
                key={time}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-md border p-1 text-center transition-all",
                  "h-10 text-[10px] font-medium",
                  status === "AVAILABLE" &&
                    "bg-card hover:border-primary/50 hover:bg-muted text-foreground shadow-sm",
                  status === "SELECTED" &&
                    "bg-primary border-primary text-primary-foreground shadow-md scale-105 z-10",
                  status === "PENDING" &&
                    "status-surface-warning",
                  status === "BOOKED" &&
                    "cursor-not-allowed opacity-90 status-surface-error",
                )}
                style={
                  status === "BOOKED"
                    ? {
                        backgroundImage:
                          "linear-gradient(45deg,rgba(255,255,255,.5) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.5) 50%,rgba(255,255,255,.5) 75%,transparent 75%,transparent)",
                        backgroundSize: "8px 8px",
                      }
                    : {}
                }
              >
                <span className="font-bold text-xs leading-none mb-0.5">{formatMinutesToTime(time)}</span>
                <span
                  className={cn(
                    "text-[9px] font-normal leading-none opacity-85",
                    status === "SELECTED"
                      ? "text-primary-foreground/90"
                      : status === "BOOKED"
                        ? "text-rose-600/90 dark:text-rose-200/90"
                        : status === "PENDING"
                          ? "text-amber-600/90 dark:text-amber-200/90"
                          : "text-muted-foreground",
                  )}
                >
                  đến {formatMinutesToTime(time + 30)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
