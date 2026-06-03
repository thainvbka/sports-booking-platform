import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { bookingService } from "@/services/booking.service";
import type { ApiError, BookingReviewResponse } from "@/types";
import { formatPrice } from "@/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, Calendar, Clock, MapPin, Trophy, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";

export default function BookingReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "VNPAY">("STRIPE");

  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
      try {
        const data = await bookingService.reviewBooking(id);
        const payload = data.data as { booking: BookingReviewResponse };
        setBooking(payload.booking);
      } catch (err: unknown) {
        console.error("Fetch booking failed", err);
        toast.error("Không thể tải thông tin đơn hàng");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  const handlePayment = async () => {
    if (!booking) return;

    setIsPaying(true);

    try {
      const result =
        paymentMethod === "STRIPE"
          ? await bookingService.createCheckoutSession([booking.id])
          : await bookingService.createVnpayCheckoutSession([booking.id]);

      if (result?.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error("Không nhận được URL thanh toán. Vui lòng thử lại.");
      }
    } catch (error: unknown) {
      console.error("Create checkout session failed", error);
      const apiError = error as ApiError;
      toast.error(apiError?.message || "Không thể tạo phiên thanh toán");
    } finally {
      setIsPaying(false);
    }
  };

  const addonTotal =
    booking?.booking_addons?.reduce((sum, addon) => sum + addon.line_total, 0) ?? 0;
  const fieldTotal = Math.max(booking?.total_price ?? 0 - addonTotal, 0);
  const expiresAtDate = booking?.expires_at ? new Date(booking.expires_at) : null;
  const hasValidExpiresAt = expiresAtDate && !Number.isNaN(expiresAtDate.getTime());

  if (loading) {
    return (
      <div className="page-shell-compact py-10">
        <LoadingState text="Đang tải thông tin thanh toán..." className="py-16" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="page-shell-compact py-10">
        <EmptyState
          title="Không tìm thấy booking"
          description="Thông tin booking không còn khả dụng hoặc đã hết hạn thanh toán."
          actionLabel="Quay lại"
          onAction={() => navigate(-1)}
          className="py-16"
        />
      </div>
    );
  }

  return (
    <div className="page-shell-compact py-8">
      <Card className="shadow-card">
        <CardHeader className="space-y-3 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-fit rounded-full"
            onClick={() => navigate(-1)}
            disabled={isPaying}
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>

          <div className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Xác nhận đặt sân</CardTitle>
            <p className="text-sm text-muted-foreground">
              Kiểm tra thông tin và thanh toán để giữ chỗ.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4 rounded-lg border bg-muted/40 p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{booking.complex_name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{booking.complex_address}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Sân</p>
                  <p className="font-medium">
                    {booking.sub_field_name} ({booking.sport_type})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
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
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian</p>
                  <p className="font-medium">
                    {format(new Date(booking.start_time), "HH:mm")} -{" "}
                    {format(new Date(booking.end_time), "HH:mm")}
                  </p>
                </div>
              </div>

              {hasValidExpiresAt ? (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Hạn thanh toán</p>
                    <p className="font-medium text-orange-600">
                      {format(expiresAtDate, "HH:mm dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <Separator />

          {booking.booking_addons && booking.booking_addons.length > 0 ? (
            <>
              <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/6 p-4">
                <p className="text-sm font-semibold text-foreground">
                  Chi tiết add-on
                </p>
                {booking.booking_addons.map((addon) => (
                  <div
                    key={`${addon.product_id}-${addon.product_name}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {addon.product_name} x{addon.quantity}
                    </span>
                    <span className="font-medium">{formatPrice(addon.line_total)}</span>
                  </div>
                ))}
              </div>

              <Separator />
            </>
          ) : null}

          <PaymentMethodSelector
            value={paymentMethod}
            onChange={setPaymentMethod}
            disabled={isPaying}
          />

          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Tiền sân</span>
              <span className="font-medium text-foreground">{formatPrice(fieldTotal)}</span>
            </div>
            {addonTotal > 0 ? (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Add-on</span>
                <span className="font-medium text-foreground">{formatPrice(addonTotal)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t pt-2 text-lg font-bold">
              <span>Tổng thanh toán</span>
              <span className="text-2xl text-primary">{formatPrice(booking.total_price)}</span>
            </div>
            <p className="text-right text-xs italic text-muted-foreground">
              * Vui lòng kiểm tra kỹ thông tin trước khi thanh toán
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <Button
              variant="outline"
              className="sm:flex-1"
              onClick={() => navigate(-1)}
              disabled={isPaying}
            >
              Quay lại
            </Button>
            <Button
              className="sm:flex-1"
              onClick={handlePayment}
              loading={isPaying}
              loadingText="Đang chuyển thanh toán..."
            >
              Thanh toán ngay
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
