import { cn } from "@/lib/utils";
import { publicService } from "@/services/public.service";
import type { PricingRule } from "@/types";
import {
  formatMinutesToTime,
  parseBookingTimeToVnMinutes,
  parseRuleTimeToMinutes,
} from "@/utils/time.utils";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!date || !subFieldId) return;
      setIsLoading(true);
      try {
        const fmtDate = format(date, "yyyy-MM-dd");
        const data = await publicService.getSubfieldAvailability(
          subFieldId,
          fmtDate,
        );
        setBookings(data.data.availability.bookings || []);
      } catch (error) {
        console.error("Failed to fetch availability", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [subFieldId, date]);

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

    // Dùng <= để bôi đen cả slot tại end time (VD: 17:30-18:30 → highlight 17:30, 18:00, 18:30)
    if (selectedStart && selectedEnd) {
      const [sH, sM] = selectedStart.split(":").map(Number);
      const [eH, eM] = selectedEnd.split(":").map(Number);
      const selStartMin = sH * 60 + sM;
      const selEndMin = eH * 60 + eM;

      if (slotStartMin >= selStartMin && slotStartMin <= selEndMin) {
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
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
        Không có lịch trống cho ngày này
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm border bg-white" />
          <span>Trống</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-primary" />
          <span>Đang chọn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-yellow-100 border border-yellow-200" />
          <span>Chờ thanh toán</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="h-3 w-3 rounded-sm bg-red-100 border border-red-200"
            style={{
              backgroundImage:
                "linear-gradient(45deg,rgba(255,255,255,.5) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.5) 50%,rgba(255,255,255,.5) 75%,transparent 75%,transparent)",
              backgroundSize: "8px 8px",
            }}
          />
          <span>Đã đặt</span>
        </div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-4 gap-2 pb-4">
          {timeSlots.map((time) => {
            const status = getSlotStatus(time);
            return (
              <div
                key={time}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-md border p-2 text-xs font-medium transition-all",
                  "h-14",
                  status === "AVAILABLE" &&
                    "bg-white hover:border-primary/50 hover:bg-slate-50 text-slate-700 shadow-sm",
                  status === "SELECTED" &&
                    "bg-primary border-primary text-primary-foreground shadow-md scale-105 z-10",
                  status === "PENDING" &&
                    "bg-yellow-50 border-yellow-200 text-yellow-700",
                  status === "BOOKED" &&
                    "bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-90",
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
                <span>{formatMinutesToTime(time)}</span>
                <span
                  className={cn(
                    "text-[10px] font-normal",
                    status === "SELECTED"
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  {status === "AVAILABLE"
                    ? "Trống"
                    : status === "SELECTED"
                      ? "Chọn"
                      : status === "PENDING"
                        ? "Chờ"
                        : "Đã đặt"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
