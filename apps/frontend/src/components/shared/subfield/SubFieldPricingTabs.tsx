import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { publicService } from "@/services/public.service";
import type { PricingRule } from "@/types";
import { formatTime, getRuleClassification, parseBookingTimeToVnMinutes, parseRuleTimeToMinutes, PRICING_TIER_CONFIGS, DAYS_OF_WEEK_SHORT, formatDateVn } from "@/utils";
import { getVnDayOfWeek } from "@/utils/time.util";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";


interface BookingAvailability {
  start: string;
  end: string;
  status: string;
}

interface SubfieldPricingTabsProps {
  subfieldId: string;
  pricingRules: PricingRule[];
  onBookNow: (date: Date, startTime: string, endTime: string) => void;
  className?: string;
}

export function SubfieldPricingTabs({
  subfieldId,
  pricingRules,
  onBookNow,
  className,
}: SubfieldPricingTabsProps) {
  const [activePricingDay, setActivePricingDay] = useState("0");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<BookingAvailability[]>([]);

  useEffect(() => {
    if (!subfieldId || !selectedDate) return;
    
    let isMounted = true;
    const fetchAvailability = async () => {
      try {
        const fmtDate = formatDateVn(selectedDate, "yyyy-MM-dd");
        const data = await publicService.getSubfieldAvailability(subfieldId, fmtDate);
        if (isMounted) {
          setBookings(data.data.availability.bookings || []);
        }
      } catch (error) {
        console.error("Failed to fetch availability in PricingTabs", error);
        if (isMounted) {
          setBookings([]);
        }
      }
    };
    
    void fetchAvailability();
    
    return () => {
      isMounted = false;
    };
  }, [subfieldId, selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      setActivePricingDay(String(getVnDayOfWeek(selectedDate)));
    }
  }, [selectedDate]);

  const rulesByDay = useMemo(() => {
    const grouped: Record<number, PricingRule[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };

    for (const rule of pricingRules || []) {
      grouped[rule.day_of_week].push(rule);
    }

    for (const day of Object.keys(grouped)) {
      grouped[Number(day)] = grouped[Number(day)].sort((a, b) => {
        const aMin = parseRuleTimeToMinutes(a.start_time) ?? Number.MAX_SAFE_INTEGER;
        const bMin = parseRuleTimeToMinutes(b.start_time) ?? Number.MAX_SAFE_INTEGER;
        return aMin - bMin;
      });
    }

    return grouped;
  }, [pricingRules]);

  const handleTabClick = (dayNum: number) => {
    const today = new Date();
    const todayDay = getVnDayOfWeek(today);
    const diff = dayNum - todayDay;
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    
    const todayZero = new Date(today.setHours(0,0,0,0));
    const targetZero = new Date(targetDate.setHours(0,0,0,0));
    if (targetZero < todayZero) {
      targetDate.setDate(targetDate.getDate() + 7);
    }
    
    setSelectedDate(targetDate);
  };

  const getRuleSlotStatus = (rule: PricingRule) => {
    const ruleStartMin = parseRuleTimeToMinutes(rule.start_time);
    const ruleEndMin = parseRuleTimeToMinutes(rule.end_time);
    if (ruleStartMin === null || ruleEndMin === null) return "AVAILABLE";

    let hasPending = false;
    let hasBooked = false;

    for (const booking of bookings) {
      const bStartMin = parseBookingTimeToVnMinutes(booking.start);
      const bEndMin = parseBookingTimeToVnMinutes(booking.end);

      if (Math.max(ruleStartMin, bStartMin) < Math.min(ruleEndMin, bEndMin)) {
        if (booking.status === "PENDING") {
          hasPending = true;
        } else if (booking.status === "CONFIRMED" || booking.status === "COMPLETED") {
          hasBooked = true;
        }
      }
    }

    if (hasBooked) return "BOOKED";
    if (hasPending) return "PENDING";
    return "AVAILABLE";
  };

  const selectedDayRules = rulesByDay[Number(activePricingDay)] || [];

  return (
    <Card className={cn("rounded-2xl border border-border/60 bg-card p-6 shadow-xs", className)}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm sm:text-base uppercase font-bold text-foreground">Bảng giá theo khung giờ</h2>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-xl border-border/80 bg-muted/50 px-4 text-xs font-semibold hover:bg-muted/70 cursor-pointer"
              >
                <CalendarIcon className="size-3.5 text-muted-foreground" />
                {formatDateVn(selectedDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tabs Thứ trong tuần */}
      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-border/60 pb-4">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => {
          const hasRules = rulesByDay[day].length > 0;
          const isActive = activePricingDay === String(day);
          return (
            <button
              key={day}
              onClick={() => handleTabClick(day)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {DAYS_OF_WEEK_SHORT[day]}
              {hasRules && !isActive && (
                <span className="ml-1 inline-block size-1 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Grid Slots Giờ */}
      {selectedDayRules.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {selectedDayRules.map((rule) => {
             const rulePrice = Number(rule.base_price);
            const classification = getRuleClassification(rule, selectedDayRules);
            const status = getRuleSlotStatus(rule);

            return (
              <div
                key={rule.id}
                className={cn(
                  "flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card p-5 text-center shadow-xs transition duration-200 hover:shadow-sm",
                  status === "AVAILABLE" && "border-emerald-500/20 bg-emerald-50/5 dark:bg-emerald-950/5",
                  status === "PENDING" && "border-amber-500/20 bg-amber-50/5 dark:bg-amber-950/5",
                  status === "BOOKED" && "border-rose-500/20 bg-rose-50/5 dark:bg-rose-950/5"
                )}
              >
                <div className="flex flex-col items-center gap-1.5">
                  {/* Classification Badge */}
                  <Badge variant="outline" className={cn("rounded-full text-[10px] font-bold px-2 py-0.5", PRICING_TIER_CONFIGS[classification].badgeClass)}>
                    {PRICING_TIER_CONFIGS[classification].label}
                  </Badge>

                  <span className="text-xs font-semibold text-muted-foreground mt-0.5">
                    {formatTime(rule.start_time)} - {formatTime(rule.end_time)}
                  </span>
                  
                  <span className="text-base font-black text-foreground">
                    {rulePrice.toLocaleString("vi-VN")}đ/h
                  </span>

                  {/* Status Label */}
                  {status === "AVAILABLE" && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      ✓ Còn trống
                    </span>
                  )}
                  {status === "PENDING" && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      ⚡ Chờ thanh toán
                    </span>
                  )}
                  {status === "BOOKED" && (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                      🔥 Đã đặt
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => onBookNow(selectedDate, formatTime(rule.start_time), formatTime(rule.end_time))}
                  disabled={status !== "AVAILABLE"}
                  className={cn(
                    "w-full rounded-xl text-xs font-bold text-white transition py-2 h-auto cursor-pointer",
                    status === "AVAILABLE"
                      ? "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800"
                      : "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted hover:text-muted-foreground"
                  )}
                >
                  {status === "AVAILABLE" ? "ĐẶT NGAY" : status === "PENDING" ? "ĐANG GIỮ" : "HẾT CHỖ"}
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border/80 bg-surface-2/20 py-8 px-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nghỉ hoạt động</span>
          <p className="text-xs text-muted-foreground">Không có bảng giá hoặc lịch hoạt động cho ngày này.</p>
        </div>
      )}
    </Card>
  );
}
