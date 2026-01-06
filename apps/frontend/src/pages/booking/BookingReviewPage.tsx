import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  bookingService,
  type BookingReviewResponse,
} from "@/services/booking.service";
import { formatPrice } from "@/services/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Trophy } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

export default function BookingReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
      try {
        const data = await bookingService.reviewBooking(id);
        setBooking(data);
      } catch (error) {
        toast.error("Không thể tải thông tin đơn hàng");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  const handlePayment = async () => {
    try {
      const result = await bookingService.creatCheckoutSession([booking!.id]);
      if (result?.url) {
        window.location.href = result.url;
      } else {
        toast.error("Không nhận được URL thanh toán. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Create checkout session failed", error);
      toast.error("Không thể tạo phiên thanh toán. Vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Xác nhận đặt sân
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Complex Info */}
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{booking.complex_name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{booking.complex_address}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Booking Details */}
          <div className="grid gap-4 md:grid-cols-2">
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
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Ngày</p>
                  <p className="font-medium">
                    {format(new Date(booking.start_time), "EEEE, dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian</p>
                  <p className="font-medium">
                    {format(new Date(booking.start_time), "HH:mm")} -{" "}
                    {format(new Date(booking.end_time), "HH:mm")}
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
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Tổng thanh toán</span>
              <span className="text-primary text-xl">
                {formatPrice(booking.total_price)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-right italic">
              * Vui lòng kiểm tra kỹ thông tin trước khi thanh toán
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Quay lại
            </Button>
            <Button className="flex-1" onClick={handlePayment}>
              Thanh toán ngay
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
