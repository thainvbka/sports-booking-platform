import { BookingAddonsStep } from "@/components/booking/BookingAddonsStep";
import { BookingConfirmStep } from "@/components/booking/BookingConfirmStep";
import { BookingScheduleStep } from "@/components/booking/BookingScheduleStep";
import { BookingSidebar } from "@/components/booking/BookingSidebar";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingTimePricing } from "@/hooks/useBookingTimePricing";
import { useSubfieldData } from "@/hooks/useSubfieldData";
import { useSubfieldReviews } from "@/hooks/useSubfieldReviews";
import { bookingService } from "@/services/booking.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { ApiError, SubfieldProduct } from "@/types";
import { getSportTypeLabel } from "@/utils";
import { getIsoDateTimeVn } from "@/utils/time.utils";
import { addMonths, format } from "date-fns";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

type BookingType = "single" | "recurring";
type Step = 1 | 2 | 3;

export default function BookingPage() {
  const { subfieldId } = useParams<{ subfieldId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    subfield,
    products,
    isLoading: isSubfieldLoading,
    error: subfieldError,
  } = useSubfieldData({
    subfieldId,
    includeProducts: true,
  });

  const { reviews: reviewSnippets, summary: reviewSummary } = useSubfieldReviews({
    subfieldId,
    pageSize: 3,
    initialSortBy: "newest",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bookingType, setBookingType] = useState<BookingType>("single");
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addMonths(new Date(), 1));
  const [recurringType, setRecurringType] = useState<"WEEKLY" | "MONTHLY">(
    "WEEKLY",
  );

  const {
    customStartTime,
    customEndTime,
    availableRules,
    timeOptions,
    priceCalculation,
    setCustomStartTime,
    setCustomEndTime,
    validateCustomTime,
  } = useBookingTimePricing({
    date,
    pricingRules: subfield?.pricing_rules || [],
  });

  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});

  const hasUpsellStep = bookingType === "single" && products.length > 0;

  useEffect(() => {
    if (!subfieldError) return;

    console.error("Failed to fetch subfield", subfieldError);
    toast.error("Không thể tải thông tin sân");
    navigate(-1);
  }, [subfieldError, navigate]);

  useEffect(() => {
    if (!hasUpsellStep && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [hasUpsellStep, currentStep]);

  useEffect(() => {
    if (bookingType === "single") return;
    setAddonQuantities({});
  }, [bookingType]);

  const selectedAddons = useMemo(
    () =>
      products
        .map((product) => ({
          product,
          quantity: addonQuantities[product.id] || 0,
        }))
        .filter((item) => item.quantity > 0),
    [products, addonQuantities],
  );

  const addonSubtotal = useMemo(
    () =>
      selectedAddons.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0,
      ),
    [selectedAddons],
  );

  const totalPrice = bookingType === "single" ? priceCalculation.totalPrice + addonSubtotal : priceCalculation.totalPrice;

  const updateAddonQuantity = (product: SubfieldProduct, delta: number) => {
    setAddonQuantities((prev) => {
      const current = prev[product.id] || 0;
      const next = Math.max(0, Math.min(product.stock, current + delta));
      return {
        ...prev,
        [product.id]: next,
      };
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!date || !customStartTime || !customEndTime || !validateCustomTime()) {
        toast.error("Vui lòng chọn ngày giờ hợp lệ trước khi tiếp tục");
        return;
      }

      if (!priceCalculation.breakdown) {
        toast.error("Khung giờ không nằm trong bảng giá, vui lòng chọn lại");
        return;
      }

      setCurrentStep(hasUpsellStep ? 2 : 3);
      return;
    }

    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBackStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 3) {
      setCurrentStep(hasUpsellStep ? 2 : 1);
    }
  };

  const handleConfirmBooking = async () => {
    if (!subfieldId || !date || !customStartTime || !customEndTime) {
      toast.error("Thiếu thông tin đặt sân");
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt sân");
      navigate("/auth/login");
      return;
    }

    setIsSubmitting(true);

    try {
      if (bookingType === "single") {
        const createResponse = await bookingService.createBooking(subfieldId, {
          start_time: getIsoDateTimeVn(date, customStartTime),
          end_time: getIsoDateTimeVn(date, customEndTime),
          type: "ONE_TIME",
        });

        const bookingId = createResponse.data.booking.id;

        if (selectedAddons.length > 0) {
          await bookingService.syncBookingAddons(bookingId, {
            addons: selectedAddons.map((item) => ({
              product_id: item.product.id,
              quantity: item.quantity,
            })),
          });
        }

        toast.success("Tạo booking thành công. Vui lòng thanh toán để giữ chỗ.");
        navigate(`/booking-review/${bookingId}`);
        return;
      }

      if (!endDate) {
        toast.error("Vui lòng chọn ngày kết thúc cho đặt định kỳ");
        return;
      }

      const recurringResponse = await bookingService.createRecurringBooking(subfieldId, {
        start_time: getIsoDateTimeVn(date, customStartTime),
        end_time: getIsoDateTimeVn(date, customEndTime),
        start_date: format(date, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        recurring_type: recurringType,
        type: "RECURRING",
      });

      toast.success("Tạo lịch đặt định kỳ thành công.");
      navigate(`/booking-review/recurring/${recurringResponse.data.recurringBooking.id}`);
    } catch (error: unknown) {
      console.error("Booking submit failed", error);
      const apiError = error as ApiError;
      toast.error(apiError?.message || "Không thể tạo booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubfieldLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải trang booking...
        </div>
      </div>
    );
  }

  if (!subfield) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-lg font-semibold">Không tìm thấy sân</p>
            <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stepTitle =
    currentStep === 1
      ? "Bước 1 - Chọn lịch"
      : currentStep === 2
        ? "Bước 2 - Chọn add-on"
        : "Bước 3 - Xác nhận";

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Đặt sân {subfield.sub_field_name}</h1>
          <p className="text-sm text-muted-foreground">
            {subfield.complex.complex_name} - {subfield.complex.complex_address}
          </p>
        </div>
        <Badge>{getSportTypeLabel(subfield.sport_type)}</Badge>
      </div>

      <BookingStepper currentStep={currentStep} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{stepTitle}</CardTitle>
          </CardHeader>

          <CardContent>
            {currentStep === 1 && (
              <BookingScheduleStep
                subfieldId={subfield.id}
                date={date}
                onDateChange={setDate}
                bookingType={bookingType}
                onBookingTypeChange={(type) => {
                  setBookingType(type);
                  setCurrentStep(1);
                }}
                endDate={endDate}
                onEndDateChange={setEndDate}
                recurringType={recurringType}
                onRecurringTypeChange={setRecurringType}
                availableRules={availableRules}
                customStartTime={customStartTime}
                customEndTime={customEndTime}
                timeOptions={timeOptions}
                onStartTimeChange={setCustomStartTime}
                onEndTimeChange={setCustomEndTime}
                isCustomTimeValid={validateCustomTime()}
              />
            )}

            {currentStep === 2 && (
              <BookingAddonsStep
                hasUpsellStep={hasUpsellStep}
                products={products}
                addonQuantities={addonQuantities}
                onUpdateAddonQuantity={updateAddonQuantity}
              />
            )}

            {currentStep === 3 && (
              <BookingConfirmStep
                subfieldName={subfield.sub_field_name}
                bookingType={bookingType}
                date={date}
                endDate={endDate}
                customStartTime={customStartTime}
                customEndTime={customEndTime}
                selectedAddons={selectedAddons}
              />
            )}

            <div className="mt-6 border-t pt-4">
              {currentStep < 3 ? (
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBackStep}
                    disabled={currentStep === 1 || isSubmitting}
                  >
                    Quay lại
                  </Button>

                  <Button onClick={handleNextStep} disabled={isSubmitting}>
                    Tiếp tục <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  disabled={
                    isSubmitting || !validateCustomTime() || !priceCalculation.breakdown
                  }
                  onClick={handleConfirmBooking}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo booking...
                    </>
                  ) : (
                    "Xác nhận và tiếp tục thanh toán"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <BookingSidebar
          subfield={subfield}
          customStartTime={customStartTime}
          customEndTime={customEndTime}
          bookingFieldPrice={priceCalculation.totalPrice}
          addonSubtotal={addonSubtotal}
          totalPrice={totalPrice}
          bookingType={bookingType}
          reviewSummary={reviewSummary}
          reviewSnippets={reviewSnippets}
          onViewAllReviews={() => navigate(`/subfields/${subfield.id}`)}
        />
      </div>
    </div>
  );
}
