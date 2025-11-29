import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, QrCode, CreditCard } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import type { SubField, PricingRule } from "@/types";
import { formatPrice } from "@/services/mockData";

interface BookingModalProps {
  subField: SubField;
  trigger?: React.ReactNode;
}

export function BookingModal({ subField, trigger }: BookingModalProps) {
  const { user } = useAuthStore();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [bookingType, setBookingType] = useState("single");

  // Guest Form State
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const handleBooking = () => {
    if (!date || !selectedRule) {
      toast.error("Vui lòng chọn ngày và khung giờ");
      return;
    }

    if (!user && (!guestName || !guestEmail || !guestPhone)) {
      toast.error("Vui lòng điền đầy đủ thông tin cá nhân");
      return;
    }

    // Mock booking logic
    if (!user) {
      toast.success("Đã tạo mã QR đặt sân! Vui lòng kiểm tra email.");
      // In real app: Call API to create guest booking -> Return QR Code
    } else {
      toast.success("Chuyển đến cổng thanh toán Stripe...");
      // In real app: Call API to create booking -> Return Stripe Checkout URL
    }
    setIsOpen(false);
  };

  // Generate time slots (mock)
  // Filter available slots based on selected date
  const availableRules = subField.pricing_rules
    .filter((rule) => date && rule.day_of_week === date.getDay())
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

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
              : "Nhập thông tin để đặt sân nhanh chóng."}
          </DialogDescription>
        </DialogHeader>

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
            {/* Common Date/Time Selection */}
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
                      format(date, "PPP", { locale: vi })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Khung giờ trống</Label>
              {availableRules.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                  {availableRules.map((rule) => (
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
                        {rule.start_time} - {rule.end_time}
                      </span>
                      <span className="text-xs opacity-80">
                        {formatPrice(rule.base_price)}
                      </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-md bg-muted/20">
                  Không có lịch trống cho ngày này
                </div>
              )}
            </div>

            <TabsContent value="recurring">
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                <p>
                  Lịch đặt sẽ lặp lại hàng tuần vào{" "}
                  {date ? format(date, "EEEE", { locale: vi }) : "ngày đã chọn"}
                  .
                </p>
              </div>
            </TabsContent>

            {/* Guest Info Form */}
            {!user && (
              <div className="space-y-3 pt-2 border-t">
                <Label className="text-base font-semibold">
                  Thông tin người đặt
                </Label>
                <div className="grid gap-2">
                  <Label htmlFor="guestName">Họ và tên</Label>
                  <Input
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="guestEmail">Email</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guestPhone">Số điện thoại</Label>
                    <Input
                      id="guestPhone"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="0912345678"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Price Summary */}
            {date && selectedRule && (
              <div className="rounded-lg bg-muted p-4 text-sm mt-4">
                <div className="flex justify-between mb-2">
                  <span>Thời gian:</span>
                  <span className="font-medium">
                    {selectedRule.start_time} - {selectedRule.end_time}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                  <span className="font-bold text-lg">Tổng cộng:</span>
                  <span className="font-bold text-lg text-primary">
                    {formatPrice(selectedRule.base_price)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleBooking} className="w-full sm:w-auto">
              {!user ? (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Nhận mã QR & Đặt sân
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Thanh toán qua Stripe
                </>
              )}
            </Button>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
