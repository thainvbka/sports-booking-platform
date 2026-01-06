import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { publicService } from "@/services/public.service";
import type { PricingRule } from "@/types";

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
          fmtDate
        );
        // @ts-ignore
        setBookings(data.data.bookings);
      } catch (error) {
        console.error("Failed to fetch availability", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [subFieldId, date]);

  // Generate 30-min slots based on the pricing rules range
  const timeSlots = useMemo(() => {
    if (!pricingRules || pricingRules.length === 0) return [];

    // Find min and max time from rules
    const allTimes = pricingRules.flatMap((rule) => {
      const start = new Date(rule.start_time);
      const end = new Date(rule.end_time);
      return [
        start.getHours() * 60 + start.getMinutes(),
        end.getHours() * 60 + end.getMinutes(),
      ];
    });

    const startOfDay = Math.min(...allTimes);
    const endOfDay = Math.max(...allTimes);

    const slots: number[] = [];
    for (let min = startOfDay; min < endOfDay; min += 30) {
      slots.push(min);
    }
    return slots;
  }, [pricingRules]);

  const getSlotStatus = (
    slotMin: number
  ): "AVAILABLE" | "BOOKED" | "PENDING" | "SELECTED" => {
    const slotStartMin = slotMin;
    const slotEndMin = slotMin + 30;

    // Check Selection
    if (selectedStart && selectedEnd) {
      const [sH, sM] = selectedStart.split(":").map(Number);
      const [eH, eM] = selectedEnd.split(":").map(Number);
      const selStartMin = sH * 60 + sM;
      const selEndMin = eH * 60 + eM;

      // Inclusive start, exclusive end logic for selection visual
      if (slotStartMin >= selStartMin && slotEndMin <= selEndMin) {
        return "SELECTED";
      }
    }

    // Check Bookings
    for (const booking of bookings) {
      const start = new Date(booking.start);
      const end = new Date(booking.end);
      const bStartMin = start.getHours() * 60 + start.getMinutes();
      const bEndMin = end.getHours() * 60 + end.getMinutes();

      // Check overlapping
      // Slot: [slotStartMin, slotEndMin)
      // Booking: [bStartMin, bEndMin)
      if (Math.max(slotStartMin, bStartMin) < Math.min(slotEndMin, bEndMin)) {
        return booking.status === "PENDING" ? "PENDING" : "BOOKED";
      }
    }

    return "AVAILABLE";
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
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
                  "h-14", // Fixed height for consistency
                  status === "AVAILABLE" &&
                    "bg-white hover:border-primary/50 hover:bg-slate-50 text-slate-700 shadow-sm",
                  status === "SELECTED" &&
                    "bg-primary border-primary text-primary-foreground shadow-md scale-105 z-10",
                  status === "PENDING" &&
                    "bg-yellow-50 border-yellow-200 text-yellow-700",
                  status === "BOOKED" &&
                    "bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-90"
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
                <span>{formatTime(time)}</span>
                <span
                  className={cn(
                    "text-[10px] font-normal",
                    status === "SELECTED"
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
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
