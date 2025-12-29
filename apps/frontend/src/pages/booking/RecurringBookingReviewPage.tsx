import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  bookingService,
  type RecurringBookingReviewResponse,
} from "@/services/booking.service";
import { formatPrice } from "@/services/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Repeat,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RecurringBookingReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<RecurringBookingReviewResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
      try {
        const data = await bookingService.reviewRecurringBooking(id);
        setBooking(data);
      } catch (error) {
        toast.error("Không thể tải thông tin đơn hàng định kỳ");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  const handlePayment = () => {
    // Integration with PayOS or Payment Gateway would go here
    toast.success("Chuyển hướng đến cổng thanh toán...");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }

  if (!booking) return null;

  // Use info from the first slot for time display if available, or parsed from stored date
  const firstSlot = booking.slots[0];
  const firstDt = firstSlot?.startTime || (firstSlot as any)?.date;
  const startTimeStr =
    firstDt && !isNaN(new Date(firstDt).getTime())
      ? format(new Date(firstDt), "HH:mm")
      : "";
  // Calculating end time is tricky without explicit end time in slot,
  // but we can infer or just show "Theo lịch"

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-6 top-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-2xl font-bold text-center">
            Xác nhận đặt sân định kỳ
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            {/* Complex Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{booking.complex_name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{booking.complex_address}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Sân</p>
                  <p className="font-medium">
                    {booking.sub_field_name} ({booking.sport_type})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Repeat className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Loại định kỳ</p>
                  <p className="font-medium">
                    {booking.recurrence_type === "WEEKLY"
                      ? "Hàng tuần"
                      : "Hàng tháng"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Thời gian áp dụng
                  </p>
                  <p className="font-medium text-sm">
                    {format(new Date(booking.start_date), "dd/MM/yyyy")} -{" "}
                    {format(new Date(booking.end_date), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
              {/* Hiển thị thời gian hết hạn thanh toán (không có giây) */}
              {booking.expires_at && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Hạn thanh toán
                    </p>
                    <p className="font-medium text-orange-600">
                      {format(new Date(booking.expires_at), "HH:mm dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Payment Summary */}
            <div className="space-y-2 bg-muted/30 p-4 rounded-lg border">
              <div className="flex justify-between items-center text-sm">
                <span>Số buổi</span>
                <span className="font-medium">{booking.total_slots} buổi</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Tổng thanh toán</span>
                <span className="text-primary text-xl">
                  {formatPrice(booking.total_price)}
                </span>
              </div>
            </div>
            <Button
              className="w-full text-lg py-6 mt-2"
              onClick={handlePayment}
            >
              Thanh toán ngay
            </Button>
          </div>

          {/* Slots Detail List */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Danh sách các buổi
            </h4>
            <ScrollArea className="h-[400px] w-full pr-4">
              {booking.slots.map((slot, index) => {
                const start = slot.startTime || (slot as any).date;
                const end = slot.endTime;

                // Debug log
                if (index === 0) console.log("Slot data:", slot);

                const startDate = start ? new Date(start) : null;
                const endDate = end ? new Date(end) : null;
                const isValidDate = startDate && !isNaN(startDate.getTime());

                return (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-muted/50 rounded-md text-sm"
                  >
                    <span className="font-medium">
                      {isValidDate
                        ? `${format(startDate, "EEEE, dd/MM/yyyy", {
                            locale: vi,
                          })} | ${format(startDate, "HH:mm")} - ${
                            endDate ? format(endDate, "HH:mm") : "..."
                          }`
                        : "Đang cập nhật..."}
                    </span>
                    <span className="text-primary font-semibold">
                      {formatPrice(slot.price)}
                    </span>
                  </div>
                );
              })}
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Các buổi đã được kiểm tra tình trạng sân trống.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
