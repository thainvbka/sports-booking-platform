import { useState, useEffect } from "react";
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

  // States
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    addMonths(new Date(), 1)
  );
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [recurringType, setRecurringType] = useState<"WEEKLY" | "MONTHLY">(
    "WEEKLY"
  );
  
  // Data State for full details (pricing rules)
  const [fullSubField, setFullSubField] = useState<SubField>(subField);

  // Fetch full details if pricing_rules are missing
  useEffect(() => {
    if (isOpen && (!subField.pricing_rules || subField.pricing_rules.length === 0)) {
        setIsLoading(true);
        publicService.getSubfieldById(subField.id)
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
      // navigate("/auth/login"); // Optional: Redirect to login
      return;
    }

    if (!date || !selectedRule) {
      toast.error("Vui lòng chọn ngày và khung giờ");
      return;
    }

    setIsLoading(true);
    try {
      // Helper to combine date + time (from PricingRule ISO string) into ISO Booking Request
      // We interpret the PricingRule time (e.g., 1970-01-01T06:00:00Z) as the "Face Value" time for the slot.
      // So 06:00Z -> 06:00 Local Time for the booking.
      const getIsoDateTime = (baseDate: Date, timeRuleStr: string | Date) => {
        const ruleDate = new Date(timeRuleStr);
        // Use UTC parts to get the "06:00" face value as numbers
        const hours = ruleDate.getUTCHours(); 
        const minutes = ruleDate.getUTCMinutes();
        
        // Use the selected date (which is local 00:00 usually from calendar)
        const newDate = new Date(baseDate);
        // Set the LOCAL time to be 06:00
        newDate.setHours(hours, minutes, 0, 0);
        return newDate.toISOString();
      };

      if (bookingType === "single") {
        const response = await bookingService.createBooking(subField.id, {
          start_time: getIsoDateTime(date, selectedRule.start_time),
          end_time: getIsoDateTime(date, selectedRule.end_time),
          type: "ONE_TIME",
        });
        toast.success("Đặt sân thành công! Vui lòng kiểm tra lại thông tin.");
        setIsOpen(false);
        navigate(`/booking-review/${response.booking_id}`);
      } else {
        if (!endDate) {
          toast.error("Vui lòng chọn ngày kết thúc cho lịch định kỳ");
          return;
        }

        const response = await bookingService.createRecurringBooking(
          subField.id,
          {
            start_time: getIsoDateTime(date, selectedRule.start_time),
            end_time: getIsoDateTime(date, selectedRule.end_time),
            start_date: format(date, "yyyy-MM-dd"),
            end_date: format(endDate, "yyyy-MM-dd"),
            recurring_type: recurringType,
            type: "RECURRING",
          }
        );
        toast.success("Tạo lịch định kỳ thành công!");
        setIsOpen(false);
        navigate(`/booking-review/recurring/${response.recurring_booking_id}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo lịch đặt sân"
      );
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
  const availableRules = (fullSubField.pricing_rules || [])
    .filter((rule) => date && rule.day_of_week === getVietnamDayOfWeek(date))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="sm">Đặt sân</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
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
                 <p className="text-center text-muted-foreground text-sm">Bạn cần đăng nhập để sử dụng tính năng này.</p>
                 <Button onClick={() => navigate("/auth/login")}>Đăng nhập ngay</Button>
             </div>
        ) : (
            <Tabs
            defaultValue="single"
            value={bookingType}
            onValueChange={setBookingType}
            className="w-full"
            >
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Đặt một lần</TabsTrigger>
                <TabsTrigger value="recurring">Đặt định kỳ</TabsTrigger>
            </TabsList>

            <div className="py-4 space-y-4">
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
                        <PopoverContent className="w-auto p-0">
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
                            <PopoverContent className="w-auto p-0">
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

                {/* Time Slots */}
                <div className="space-y-2">
                <Label>
                    Khung giờ trống ({date ? format(date, "EEEE", { locale: vi }) : ""})
                </Label>
                {availableRules.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                    {availableRules.map((rule) => {
                        const price = calculateSlotPrice(rule);
                        return (
                        <Button
                        key={rule.id}
                        variant={
                            selectedRule?.id === rule.id ? "default" : "outline"
                        }
                        className={cn(
                            "flex flex-col items-center justify-center h-auto py-2 px-1",
                            selectedRule?.id === rule.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        )}
                        onClick={() => setSelectedRule(rule)}
                        >
                        <span className="text-sm font-semibold">
                            {formatRuleTime(rule.start_time)} - {formatRuleTime(rule.end_time)}
                        </span>
                        <span className="text-xs opacity-80">
                            {formatPrice(price)}
                        </span>
                        </Button>
                    )})}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-md bg-muted/20">
                     {date ? "Không có lịch trống cho ngày này" : "Vui lòng chọn ngày trước"}
                    </div>
                )}
                </div>

                {/* Recurring Note */}
                {bookingType === "recurring" && date && (
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                    <p>
                    Lịch sẽ được tạo {recurringType === "WEEKLY" ? "hàng tuần" : "hàng tháng"} vào{" "}
                    <strong>{format(date, "EEEE", { locale: vi })}</strong>, từ{" "}
                    {format(date, "dd/MM")} đến {endDate ? format(endDate, "dd/MM") : "..."}.
                    </p>
                </div>
                )}

                {/* Price Summary */}
                {date && selectedRule && (
                <div className="rounded-lg bg-muted p-4 text-sm mt-4">
                    <div className="flex justify-between mb-2">
                    <span>Thời gian:</span>
                    <span className="font-medium">
                        {formatRuleTime(selectedRule.start_time)} - {formatRuleTime(selectedRule.end_time)}
                    </span>
                    </div>
                    {bookingType === "recurring" && (
                         <div className="flex justify-between mb-2">
                            <span>Ước tính:</span>
                            <span className="text-muted-foreground italic">Giá trên mỗi buổi</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                    <span className="font-bold text-lg">Tổng tiền:</span>
                    <span className="font-bold text-lg text-primary">
                        {formatPrice(calculateSlotPrice(selectedRule))}
                    </span>
                    </div>
                </div>
                )}
            </div>

            <DialogFooter>
                <Button onClick={handleBooking} className="w-full sm:w-auto" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        "Tiếp tục"
                    )}
                </Button>
            </DialogFooter>
            </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
