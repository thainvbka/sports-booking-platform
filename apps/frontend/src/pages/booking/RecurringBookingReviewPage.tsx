import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { bookingService } from "@/services/booking.service";
import type { ApiError, RecurringBookingReviewResponse } from "@/types";
import { formatPrice } from "@/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Repeat,
  Trophy,
  CreditCard,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";

export default function RecurringBookingReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<RecurringBookingReviewResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "VNPAY">("STRIPE");

  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
      try {
        const response = await bookingService.reviewRecurringBooking(id);
        setBooking(
          response.data.recurringBooking as RecurringBookingReviewResponse,
        );
      } catch {
        toast.error("Không thể tải thông tin đơn hàng định kỳ");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  const handlePayment = async () => {
    if (!booking || booking.slots.length === 0) {
      toast.error("Không có buổi nào khả dụng để thanh toán.");
      return;
    }

    setIsPaying(true);

    try {
      const result =
        paymentMethod === "STRIPE"
          ? await bookingService.createCheckoutSession(booking.slots.map((slot) => slot.id))
          : await bookingService.createVnpayCheckoutSession(booking.slots.map((slot) => slot.id));

      if (result?.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error("Không nhận được URL thanh toán. Vui lòng thử lại.");
      }
    } catch (error: unknown) {
      console.error("Create checkout session failed", error);
      const apiError = error as ApiError;
      toast.error(
        apiError?.message ||
          "Không thể tạo phiên thanh toán. Vui lòng thử lại sau.",
      );
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell-narrow py-10">
        <LoadingState text="Đang tải thông tin đặt sân định kỳ..." className="py-16" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="page-shell-narrow py-10">
        <EmptyState
          title="Không tìm thấy booking định kỳ"
          description="Thông tin lịch đặt định kỳ không còn khả dụng hoặc đã hết hạn thanh toán."
          actionLabel="Quay lại"
          onAction={() => navigate(-1)}
          className="py-16"
        />
      </div>
    );
  }

  const expiresAtDate = booking.expires_at ? new Date(booking.expires_at) : null;
  const hasValidExpiresAt = expiresAtDate && !Number.isNaN(expiresAtDate.getTime());
  const slots = booking.slots || [];

  return (
    <div className="page-shell-narrow py-8">
      <Card className="shadow-card">
        <CardHeader className="space-y-3 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-fit rounded-full"
            onClick={() => navigate(-1)}
            disabled={isPaying}
            aria-label="Quay lại trang trước"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>

          <div className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Xác nhận đặt sân định kỳ</CardTitle>
            <p className="text-sm text-muted-foreground">
              Thanh toán một lần cho toàn bộ lịch đặt đã tạo.
            </p>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
              <h3 className="font-semibold text-lg">{booking.complex_name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{booking.complex_address}</span>
              </div>
            </div>

            <Separator />

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
                <Repeat className="h-5 w-5 text-primary" />
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
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Thời gian áp dụng
                  </p>
                  <p className="font-medium text-sm">
                    {booking.start_date
                      ? format(new Date(booking.start_date), "dd/MM/yyyy")
                      : "N/A"}{" "}
                    -{" "}
                    {booking.end_date
                      ? format(new Date(booking.end_date), "dd/MM/yyyy")
                      : "N/A"}
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

            <Separator />

            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
              disabled={isPaying}
            />

            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <span>Số buổi</span>
                <span className="font-medium">{booking.total_slots} buổi</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Tổng thanh toán</span>
                <span className="text-xl text-primary">{formatPrice(booking.total_price)}</span>
              </div>
            </div>

            <Button
              className="mt-2 w-full text-base"
              onClick={handlePayment}
              loading={isPaying}
              loadingText="Đang chuyển thanh toán..."
              disabled={slots.length === 0}
            >
              Thanh toán ngay
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="mb-4 flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4" /> Danh sách các buổi
            </h4>

            {slots.length > 0 ? (
              <ScrollArea className="h-112 w-full pr-4">
                <div className="space-y-2">
                  {slots.map((slot) => {
                    const startDate = new Date(slot.startTime);
                    const endDate = new Date(slot.endTime);
                    const hasValidDate =
                      !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime());

                    return (
                      <div
                        key={slot.id}
                        className="flex items-start justify-between gap-2 rounded-md bg-muted/50 p-3 text-sm"
                      >
                        <span className="font-medium">
                          {hasValidDate
                            ? `${format(startDate, "EEEE, dd/MM/yyyy", {
                                locale: vi,
                              })} | ${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`
                            : "Đang cập nhật..."}
                        </span>
                        <span className="shrink-0 font-semibold text-primary">
                          {formatPrice(slot.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <EmptyState
                title="Chưa có buổi khả dụng"
                description="Hiện chưa có slot nào để thanh toán cho lịch đặt định kỳ này."
                className="py-10"
              />
            )}

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Các buổi đã được kiểm tra tình trạng sân trống.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
