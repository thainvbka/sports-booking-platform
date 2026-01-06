import { useState, useEffect, useMemo } from "react";
import { format, addMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import type { SubField, PricingRule } from "@/types";
import { formatPrice } from "@/services/mockData";
import { bookingService } from "@/services/booking.service";
import { publicService } from "@/services/public.service";
import { useNavigate } from "react-router-dom";
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

  // States
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    addMonths(new Date(), 1)
  );
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [recurringType, setRecurringType] = useState<"WEEKLY" | "MONTHLY">(
    "WEEKLY"
  );

  // Custom time selection
  const [customStartTime, setCustomStartTime] = useState<string>("");
  const [customEndTime, setCustomEndTime] = useState<string>("");

  // Data State for full details (pricing rules)
  const [fullSubField, setFullSubField] = useState<SubField>(subField);

  // Fetch full details if pricing_rules are missing
  useEffect(() => {
    if (
      isOpen &&
      (!subField.pricing_rules || subField.pricing_rules.length === 0)
    ) {
      setIsLoading(true);
      publicService
        .getSubfieldById(subField.id)
        .then((res) => {
          setFullSubField(res.data);
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
      // Helper to combine date + custom time into ISO Booking Request
      const getIsoDateTime = (baseDate: Date, timeStr: string) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const newDate = new Date(baseDate);
        newDate.setHours(hours, minutes, 0, 0);
        return newDate.toISOString();
      };

      if (bookingType === "single") {
        const response = await bookingService.createBooking(subField.id, {
          start_time: getIsoDateTime(date, customStartTime),
          end_time: getIsoDateTime(date, customEndTime),
          type: "ONE_TIME",
        });
        toast.success(
          response.message ||
            "Đặt sân thành công! Vui lòng kiểm tra lại thông tin."
        );
        setCreatedBookingId(response.booking_id);
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
            start_time: getIsoDateTime(date, customStartTime),
            end_time: getIsoDateTime(date, customEndTime),
            start_date: format(date, "yyyy-MM-dd"),
            end_date: format(endDate, "yyyy-MM-dd"),
            recurring_type: recurringType,
            type: "RECURRING",
          }
        );
        toast.success(response.message || "Đặt sân định kỳ thành công!");
        setCreatedBookingId(response.recurring_booking_id);
        setIsRecurringBooking(true);
        setIsOpen(false);
        setShowConfirmDialog(true);
      }
    } catch (error: any) {
      console.error("Booking Error Details:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Có lỗi xảy ra khi tạo lịch đặt sân";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format time (HH:mm) from ISO string (Displaying Face Value)
  const formatRuleTime = (time: string | Date) => {
    const d = new Date(time);
    const hours = d.getUTCHours().toString().padStart(2, "0");
    const minutes = d.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Filter available slots based on selected date
  const now = new Date();
  const availableRules = (fullSubField.pricing_rules || [])
    .filter((rule) => date && rule.day_of_week === getVietnamDayOfWeek(date))
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

  function getVietnamDayOfWeek(date: Date): number {
    // Local browser time usually suffices if user is in VN.
    return date.getDay();
  }

  // Calculate price based on duration
  const calculateSlotPrice = (rule: PricingRule) => {
    const start = new Date(rule.start_time);
    const end = new Date(rule.end_time);
    const startMin = start.getUTCHours() * 60 + start.getUTCMinutes();
    const endMin = end.getUTCHours() * 60 + end.getUTCMinutes();
    const durationHours = (endMin - startMin) / 60;
    return Number(rule.base_price) * durationHours;
  };

  // Helper format time - moved before useMemo to avoid hoisting issue
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  // Calculate custom price based on selected time (supports multiple rules)
  // Use useMemo to avoid infinite re-render loop
  const priceCalculation = useMemo(() => {
    if (!date || !customStartTime || !customEndTime) {
      return { totalPrice: 0, breakdown: null };
    }

    const [startH, startM] = customStartTime.split(":").map(Number);
    const [endH, endM] = customEndTime.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    const dayRules = availableRules.sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    if (dayRules.length === 0) {
      return { totalPrice: 0, breakdown: null };
    }

    let totalPrice = 0;
    let currentMin = startMin;
    const breakdown: Array<{ rule: string; duration: number; price: number }> =
      [];

    for (const rule of dayRules) {
      const ruleStart = new Date(rule.start_time);
      const ruleEnd = new Date(rule.end_time);
      const ruleStartMin =
        ruleStart.getUTCHours() * 60 + ruleStart.getUTCMinutes();
      const ruleEndMin = ruleEnd.getUTCHours() * 60 + ruleEnd.getUTCMinutes();

      // Tìm phần giao
      const segmentStart = Math.max(currentMin, ruleStartMin);
      const segmentEnd = Math.min(endMin, ruleEndMin);

      if (segmentStart < segmentEnd) {
        const duration = segmentEnd - segmentStart;
        const hours = duration / 60;
        const price = Number(rule.base_price) * hours;

        totalPrice += price;
        breakdown.push({
          rule: `${formatTime(ruleStartMin)}-${formatTime(ruleEndMin)}`,
          duration,
          price,
        });

        currentMin = segmentEnd;
      }

      if (currentMin >= endMin) break;
    }

    // Kiểm tra có gap không
    if (currentMin < endMin) {
      return { totalPrice: 0, breakdown: null }; // Có khoảng trống không có giá
    }

    return { totalPrice, breakdown };
  }, [date, customStartTime, customEndTime, availableRules]);

  // Generate time options in 30-minute intervals across all rules
  const generateTimeOptions = () => {
    if (availableRules.length === 0) return [];

    // Tìm min/max time của tất cả rules trong ngày
    const allTimes = availableRules.flatMap((rule) => {
      const start = new Date(rule.start_time);
      const end = new Date(rule.end_time);
      return [
        start.getUTCHours() * 60 + start.getUTCMinutes(),
        end.getUTCHours() * 60 + end.getUTCMinutes(),
      ];
    });

    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);

    // Nếu date là hôm nay, lọc ra các mốc thời gian đã qua
    let effectiveStartMin = minTime;
    const isToday =
      date && format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

    if (isToday) {
      const currentMin = now.getHours() * 60 + now.getMinutes();
      // Làm tròn lên mốc 30 phút tiếp theo
      const nextSlot = Math.ceil(currentMin / 30) * 30;
      effectiveStartMin = Math.max(minTime, nextSlot);
    }

    const options: string[] = [];
    for (let min = effectiveStartMin; min <= maxTime; min += 30) {
      const hours = Math.floor(min / 60);
      const minutes = min % 60;
      options.push(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`
      );
    }

    return options;
  };

  // Validate custom time selection
  const validateCustomTime = () => {
    if (!customStartTime || !customEndTime) return true;

    const [startH, startM] = customStartTime.split(":").map(Number);
    const [endH, endM] = customEndTime.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const duration = endMin - startMin;

    // Check if duration is multiple of 30
    if (duration <= 0 || duration % 30 !== 0) {
      return false;
    }

    // Check if price can be calculated (no gaps in rules)
    return priceCalculation.totalPrice > 0;
  };

  // Reset custom times when date or rules change
  useEffect(() => {
    if (availableRules.length > 0) {
      const timeOptions = generateTimeOptions();
      if (timeOptions.length >= 2) {
        setCustomStartTime(timeOptions[0]);
        setCustomEndTime(timeOptions[1]);
      }
    } else {
      setCustomStartTime("");
      setCustomEndTime("");
    }
  }, [date, availableRules.length]);

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
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col h-[600px]">
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
                      <Label className="mb-2 font-semibold">Tình trạng sân ({format(date, "dd/MM")})</Label>
                      <TimeSlotsGrid 
                        subFieldId={subField.id}
                        date={date}
                        pricingRules={availableRules}
                        selectedStart={customStartTime}
                        selectedEnd={customEndTime}
                      />
                    </>
                  )}
                  {!date && <div className="text-center text-muted-foreground mt-10">Vui lòng chọn ngày để xem lịch</div>}
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
                            !date && "text-muted-foreground"
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
                            setSelectedRule(null); // Reset selection on date change
                          }}
                          initialFocus
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
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
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? (
                              format(endDate, "dd/MM/yyyy", { locale: vi })
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
                      onValueChange={(val: any) => setRecurringType(val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại lặp lại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WEEKLY">Hàng tuần</SelectItem>
                        <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
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
                            {Number(rule.base_price).toLocaleString("vi-VN")}₫/h
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
                          onValueChange={setCustomStartTime}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giờ" />
                          </SelectTrigger>
                          <SelectContent>
                            {generateTimeOptions().map((time) => (
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
                            {generateTimeOptions().map((time) => (
                              <SelectItem key={time} value={time}>
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
                          Thời lượng không hợp lệ. Vui lòng chọn thời lượng là
                          bội của 30 phút hoặc không có khoảng trống trong khung
                          giờ.
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
                        <strong>{format(date, "EEEE", { locale: vi })}</strong>,
                        từ {format(date, "dd/MM")} đến{" "}
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

                      {/* Price Breakdown */}
                      {priceCalculation.breakdown &&
                        priceCalculation.breakdown.length > 1 && (
                          <div className="mb-2">
                            <div className="text-xs font-semibold mb-1 text-muted-foreground">
                              Chi tiết giá:
                            </div>
                            {priceCalculation.breakdown.map((segment, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-xs mb-1 pl-2"
                              >
                                <span className="text-muted-foreground">
                                  {segment.rule} ({segment.duration} phút)
                                </span>
                                <span>{formatPrice(segment.price)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                      <div className="flex justify-between mb-2">
                        <span>Thời lượng:</span>
                        <span className="font-medium">
                          {(() => {
                            const [startH, startM] = customStartTime
                              .split(":")
                              .map(Number);
                            const [endH, endM] = customEndTime
                              .split(":")
                              .map(Number);
                            const durationMin =
                              endH * 60 + endM - (startH * 60 + startM);
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
                        <span className="font-bold text-lg">Tổng tiền:</span>
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
                  disabled={isLoading}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Đặt sân thành công!</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <div>
                Booking của bạn đã được tạo thành công. Bạn có thể xem lại trong
                mục <strong>Lịch đặt sân</strong> để thanh toán hoặc thanh toán
                ngay bây giờ.
              </div>
              <div className="text-sm text-amber-600">
                Lưu ý: Booking sẽ tự động hủy sau 5 phút nếu chưa thanh toán.
                Xem chi tiết ở phần lịch đặt sân!
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
