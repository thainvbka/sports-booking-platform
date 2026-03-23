import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { bookingService } from "@/services/booking.service";
import { publicService } from "@/services/public.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { SubField } from "@/types";
import { formatPrice } from "@/utils";
import {
  formatMinutesToTime,
  getIsoDateTimeVn,
  parseRuleTimeToMinutes,
} from "@/utils/time.utils";
import { addMonths, format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TimeSlotsGrid } from "./TimeSlotsGrid";

interface BookingModalProps {
  subField: SubField;
  trigger?: React.ReactNode;
}

export function BookingModal({ subField, trigger }: BookingModalProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [bookingType, setBookingType] = useState("single");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string>("");
  const [isRecurringBooking, setIsRecurringBooking] = useState(false);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    addMonths(new Date(), 1),
  );
  const [recurringType, setRecurringType] = useState<"WEEKLY" | "MONTHLY">(
    "WEEKLY",
  );
  const [customStartTime, setCustomStartTime] = useState<string>("");
  const [customEndTime, setCustomEndTime] = useState<string>("");
  const [fullSubField, setFullSubField] = useState<SubField>(subField);

  useEffect(() => {
    if (
      isOpen &&
      (!subField.pricing_rules || subField.pricing_rules.length === 0)
    ) {
      setIsLoading(true);
      publicService
        .getSubfieldById(subField.id)
        .then((res) => {
          setFullSubField(res.data.subfield as unknown as SubField);
        })
        .catch((err) => {
          console.error("Failed to fetch subfield details", err);
          toast.error("Không thể tải thông tin giá sân");
        })
        .finally(() => setIsLoading(false));
    } else {
      setFullSubField(subField);
    }
  }, [isOpen, subField]);

  const handleBooking = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt sân");
      return;
    }
    if (!date) {
      toast.error("Vui lòng chọn ngày");
      return;
    }
    if (!customStartTime || !customEndTime) {
      toast.error("Vui lòng chọn giờ bắt đầu và kết thúc");
      return;
    }

    setIsLoading(true);
    try {
      if (bookingType === "single") {
        const response = await bookingService.createBooking(subField.id, {
          // FIX: dùng getIsoDateTimeVn thay vì setHours (local time)
          start_time: getIsoDateTimeVn(date, customStartTime),
          end_time: getIsoDateTimeVn(date, customEndTime),
          type: "ONE_TIME",
        });
        toast.success(
          response.message ||
            "Đặt sân thành công! Vui lòng kiểm tra lại thông tin.",
        );
        setCreatedBookingId(response.data.booking.id);
        setIsRecurringBooking(false);
        setIsOpen(false);
        setShowConfirmDialog(true);
      } else {
        if (!endDate) {
          toast.error("Vui lòng chọn ngày kết thúc cho lịch định kỳ");
          return;
        }

        const response = await bookingService.createRecurringBooking(
          subField.id,
          {
            start_time: getIsoDateTimeVn(date, customStartTime),
            end_time: getIsoDateTimeVn(date, customEndTime),
            start_date: format(date, "yyyy-MM-dd"),
            end_date: format(endDate, "yyyy-MM-dd"),
            recurring_type: recurringType,
            type: "RECURRING",
          },
        );
        toast.success(response.message || "Đặt sân định kỳ thành công!");
        setCreatedBookingId(response.data.recurringBooking.id);
        setIsRecurringBooking(true);
        setIsOpen(false);
        setShowConfirmDialog(true);
      }
    } catch (error: unknown) {
      console.error("Booking Error Details:", error);
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Có lỗi xảy ra khi tạo lịch đặt sân";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRuleTime = (time: string | Date) => {
    const mins = parseRuleTimeToMinutes(time);
    if (mins === null) return "--:--";
    return formatMinutesToTime(mins);
  };

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  function getVietnamDayOfWeek(date: Date): number {
    return date.getDay();
  }

  const availableRules = useMemo(
    () =>
      (fullSubField.pricing_rules || [])
        .filter(
          (rule) => date && rule.day_of_week === getVietnamDayOfWeek(date),
        )
        .sort((a, b) => {
          const aMin =
            parseRuleTimeToMinutes(a.start_time) ?? Number.MAX_SAFE_INTEGER;
          const bMin =
            parseRuleTimeToMinutes(b.start_time) ?? Number.MAX_SAFE_INTEGER;
          return aMin - bMin;
        }),
    [fullSubField.pricing_rules, date],
  );

  const priceCalculation = useMemo(() => {
    if (!date || !customStartTime || !customEndTime) {
      return { totalPrice: 0, breakdown: null };
    }

    const startMin = toMinutes(customStartTime);
    const endMin = toMinutes(customEndTime);

    const dayRules = [...availableRules].sort((a, b) => {
      const aMin =
        parseRuleTimeToMinutes(a.start_time) ?? Number.MAX_SAFE_INTEGER;
      const bMin =
        parseRuleTimeToMinutes(b.start_time) ?? Number.MAX_SAFE_INTEGER;
      return aMin - bMin;
    });

    if (dayRules.length === 0) return { totalPrice: 0, breakdown: null };

    let totalPrice = 0;
    let currentMin = startMin;
    const breakdown: Array<{ rule: string; duration: number; price: number }> =
      [];

    for (const rule of dayRules) {
      const ruleStartMin = parseRuleTimeToMinutes(rule.start_time);
      const ruleEndMin = parseRuleTimeToMinutes(rule.end_time);
      if (ruleStartMin === null || ruleEndMin === null) continue;

      const segmentStart = Math.max(currentMin, ruleStartMin);
      const segmentEnd = Math.min(endMin, ruleEndMin);

      if (segmentStart < segmentEnd) {
        const duration = segmentEnd - segmentStart;
        const price = Number(rule.base_price) * (duration / 60);

        totalPrice += price;
        breakdown.push({
          rule: `${formatMinutesToTime(ruleStartMin)}-${formatMinutesToTime(ruleEndMin)}`,
          duration,
          price,
        });
        currentMin = segmentEnd;
      }

      if (currentMin >= endMin) break;
    }

    if (currentMin < endMin) return { totalPrice: 0, breakdown: null };

    return { totalPrice, breakdown };
  }, [date, customStartTime, customEndTime, availableRules]);

  const timeOptions = useMemo(() => {
    if (availableRules.length === 0) return [];

    const allTimes = availableRules.flatMap((rule) => {
      const start = parseRuleTimeToMinutes(rule.start_time);
      const end = parseRuleTimeToMinutes(rule.end_time);
      if (start === null || end === null) return [];
      return [start, end];
    });

    if (allTimes.length === 0) return [];

    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);

    let effectiveStartMin = minTime;
    const now = new Date();
    const isToday =
      date && format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

    if (isToday) {
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const nextSlot = Math.ceil(currentMin / 30) * 30;
      effectiveStartMin = Math.max(minTime, nextSlot);
    }

    // Chỉ giữ lại các mốc thời gian nằm trong ít nhất 1 rule
    // Tránh user chọn start time tại gap giữa 2 rules liền kề
    const isWithinAnyRule = (min: number) =>
      availableRules.some((rule) => {
        const rStart = parseRuleTimeToMinutes(rule.start_time);
        const rEnd = parseRuleTimeToMinutes(rule.end_time);
        if (rStart === null || rEnd === null) return false;
        return min >= rStart && min < rEnd;
      });

    const options: string[] = [];
    for (let min = effectiveStartMin; min <= maxTime; min += 30) {
      // Include nếu là start của 1 rule (valid start) HOẶC end của 1 rule (valid end time)
      const isRuleBoundary = availableRules.some((rule) => {
        const rEnd = parseRuleTimeToMinutes(rule.end_time);
        return rEnd === min;
      });

      if (isWithinAnyRule(min) || isRuleBoundary) {
        options.push(formatMinutesToTime(min));
      }
    }
    return options;
  }, [availableRules, date]);

  const validateCustomTime = () => {
    if (!customStartTime || !customEndTime) return true;
    const duration = toMinutes(customEndTime) - toMinutes(customStartTime);
    return duration > 0 && duration % 30 === 0;
  };

  useEffect(() => {
    if (timeOptions.length >= 2) {
      setCustomStartTime((prev) =>
        prev && timeOptions.includes(prev) ? prev : timeOptions[0],
      );
      setCustomEndTime((prev) => {
        if (prev && timeOptions.includes(prev)) return prev;
        return timeOptions[1];
      });
    } else {
      setCustomStartTime("");
      setCustomEndTime("");
    }
  }, [timeOptions]);

  const handlePayNow = () => {
    setShowConfirmDialog(false);
    if (isRecurringBooking) {
      navigate(`/booking-review/recurring/${createdBookingId}`);
    } else {
      navigate(`/booking-review/${createdBookingId}`);
    }
  };

  const handleViewBookings = () => {
    setShowConfirmDialog(false);
    navigate("/bookings");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || <Button size="sm">Đặt sân</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col h-150">
          <DialogHeader>
            <DialogTitle>Đặt sân {subField.sub_field_name}</DialogTitle>
            <DialogDescription>
              {user
                ? "Chọn lịch thi đấu của bạn."
                : "Vui lòng đăng nhập để thực hiện đặt sân."}
            </DialogDescription>
          </DialogHeader>

          {!user ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-center text-muted-foreground text-sm">
                Bạn cần đăng nhập để sử dụng tính năng này.
              </p>
              <Button onClick={() => navigate("/auth/login")}>
                Đăng nhập ngay
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-1">
              <div className="flex gap-6 md:flex-row flex-col">
                {/* LEFT COLUMN: Time Grid */}
                <div className="w-full md:w-1/3 border-r pr-4 flex flex-col">
                  {date && (
                    <>
                      <Label className="mb-2 font-semibold">
                        Tình trạng sân ({format(date, "dd/MM")})
                      </Label>
                      <TimeSlotsGrid
                        subFieldId={subField.id}
                        date={date}
                        pricingRules={availableRules}
                        selectedStart={customStartTime}
                        selectedEnd={customEndTime}
                      />
                    </>
                  )}
                  {!date && (
                    <div className="text-center text-muted-foreground mt-10">
                      Vui lòng chọn ngày để xem lịch
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Booking Form */}
                <div className="flex-1 flex flex-col">
                  <Tabs
                    defaultValue="single"
                    value={bookingType}
                    onValueChange={setBookingType}
                    className="w-full flex flex-col"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="single">Đặt một lần</TabsTrigger>
                      <TabsTrigger value="recurring">Đặt định kỳ</TabsTrigger>
                    </TabsList>

                    <div className="py-4 space-y-4 pr-2">
                      {/* Date Selection */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Ngày bắt đầu</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !date && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? (
                                  format(date, "dd/MM/yyyy", { locale: vi })
                                ) : (
                                  <span>Chọn ngày</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              side="top"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => {
                                  setDate(d);
                                }}
                                initialFocus
                                disabled={(date) =>
                                  date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {bookingType === "recurring" && (
                          <div className="grid gap-2">
                            <Label>Ngày kết thúc</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {endDate ? (
                                    format(endDate, "dd/MM/yyyy", {
                                      locale: vi,
                                    })
                                  ) : (
                                    <span>Chọn ngày</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                side="top"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={endDate}
                                  onSelect={setEndDate}
                                  initialFocus
                                  disabled={(d) =>
                                    date ? d <= date : d < new Date()
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </div>

                      {bookingType === "recurring" && (
                        <div className="grid gap-2">
                          <Label>Loại lặp lại</Label>
                          <Select
                            value={recurringType}
                            onValueChange={(val: "WEEKLY" | "MONTHLY") =>
                              setRecurringType(val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại lặp lại" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WEEKLY">Hàng tuần</SelectItem>
                              <SelectItem value="MONTHLY">
                                Hàng tháng
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Pricing Rules Display */}
                      {availableRules.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">
                            Bảng giá (
                            {date ? format(date, "EEEE", { locale: vi }) : ""})
                          </Label>
                          <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                            {availableRules.map((rule) => (
                              <div
                                key={rule.id}
                                className="flex justify-between text-xs p-2 bg-white rounded border"
                              >
                                <span className="font-medium text-gray-700">
                                  {formatRuleTime(rule.start_time)} -{" "}
                                  {formatRuleTime(rule.end_time)}
                                </span>
                                <span className="text-blue-600 font-semibold">
                                  {Number(rule.base_price).toLocaleString(
                                    "vi-VN",
                                  )}
                                  ₫/h
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom Time Selection */}
                      {availableRules.length > 0 && (
                        <div className="space-y-3 p-4 border rounded-md bg-muted/20">
                          <Label className="text-base font-semibold">
                            Chọn giờ cụ thể (bội của 30 phút)
                          </Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label className="text-sm">Giờ bắt đầu</Label>
                              <Select
                                value={customStartTime}
                                onValueChange={(value) => {
                                  setCustomStartTime(value);
                                  if (
                                    customEndTime &&
                                    toMinutes(customEndTime) <= toMinutes(value)
                                  ) {
                                    const next = timeOptions.find(
                                      (t) => toMinutes(t) > toMinutes(value),
                                    );
                                    setCustomEndTime(next || "");
                                  }
                                }}
                              >
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
                            <div className="grid gap-2">
                              <Label className="text-sm">Giờ kết thúc</Label>
                              <Select
                                value={customEndTime}
                                onValueChange={setCustomEndTime}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn giờ" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map((time) => (
                                    <SelectItem
                                      key={time}
                                      value={time}
                                      disabled={
                                        !!customStartTime &&
                                        toMinutes(time) <=
                                          toMinutes(customStartTime)
                                      }
                                    >
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {!validateCustomTime() &&
                            customStartTime &&
                            customEndTime && (
                              <p className="text-sm text-red-500">
                                Thời lượng không hợp lệ. Vui lòng chọn thời
                                lượng là bội của 30 phút.
                              </p>
                            )}
                        </div>
                      )}

                      {/* Recurring Note */}
                      {bookingType === "recurring" &&
                        date &&
                        customStartTime &&
                        customEndTime && (
                          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                            <p>
                              Lịch sẽ được tạo{" "}
                              {recurringType === "WEEKLY"
                                ? "hàng tuần"
                                : "hàng tháng"}{" "}
                              vào{" "}
                              <strong>
                                {format(date, "EEEE", { locale: vi })}
                              </strong>
                              , từ {format(date, "dd/MM")} đến{" "}
                              {endDate ? format(endDate, "dd/MM") : "..."}.
                              <br />
                              Thời gian:{" "}
                              <strong>
                                {customStartTime} - {customEndTime}
                              </strong>
                            </p>
                          </div>
                        )}

                      {/* Price Summary */}
                      {date &&
                        customStartTime &&
                        customEndTime &&
                        validateCustomTime() && (
                          <div className="rounded-lg bg-muted p-4 text-sm mt-4">
                            <div className="flex justify-between mb-2">
                              <span>Thời gian:</span>
                              <span className="font-medium">
                                {customStartTime} - {customEndTime}
                              </span>
                            </div>

                            {priceCalculation.breakdown &&
                              priceCalculation.breakdown.length > 1 && (
                                <div className="mb-2">
                                  <div className="text-xs font-semibold mb-1 text-muted-foreground">
                                    Chi tiết giá:
                                  </div>
                                  {priceCalculation.breakdown.map(
                                    (segment, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between text-xs mb-1 pl-2"
                                      >
                                        <span className="text-muted-foreground">
                                          {segment.rule} ({segment.duration}{" "}
                                          phút)
                                        </span>
                                        <span>
                                          {formatPrice(segment.price)}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}

                            <div className="flex justify-between mb-2">
                              <span>Thời lượng:</span>
                              <span className="font-medium">
                                {(() => {
                                  const durationMin =
                                    toMinutes(customEndTime) -
                                    toMinutes(customStartTime);
                                  const hours = Math.floor(durationMin / 60);
                                  const minutes = durationMin % 60;
                                  return `${hours > 0 ? hours + " giờ" : ""} ${
                                    minutes > 0 ? minutes + " phút" : ""
                                  }`.trim();
                                })()}
                              </span>
                            </div>
                            {bookingType === "recurring" && (
                              <div className="flex justify-between mb-2">
                                <span>Lưu ý:</span>
                                <span className="text-muted-foreground italic text-xs">
                                  Giá trên mỗi buổi
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                              <span className="font-bold text-lg">
                                Tổng tiền:
                              </span>
                              <span className="font-bold text-lg text-primary">
                                {formatPrice(priceCalculation.totalPrice)}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>

                    <DialogFooter className="mt-4 pt-4 border-t">
                      <Button
                        onClick={handleBooking}
                        className="w-full sm:w-auto"
                        disabled={
                          isLoading ||
                          !validateCustomTime() ||
                          priceCalculation.breakdown === null
                        }
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          "Đặt sân"
                        )}
                      </Button>
                    </DialogFooter>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Đặt sân thành công!</DialogTitle>
            <DialogDescription className="space-y-2 pt-2" asChild>
              <div>
                <div>
                  Booking của bạn đã được tạo thành công. Bạn có thể xem lại
                  trong mục <strong>Lịch đặt sân</strong> để thanh toán hoặc
                  thanh toán ngay bây giờ.
                </div>
                <div className="text-sm text-amber-600">
                  Lưu ý: Booking sẽ tự động hủy sau 5 phút nếu chưa thanh toán.
                  Xem chi tiết ở phần lịch đặt sân!
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleViewBookings}
              className="w-full sm:w-auto"
            >
              Xem lịch đặt sân
            </Button>
            <Button onClick={handlePayNow} className="w-full sm:w-auto ml-2">
              Thanh toán ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
