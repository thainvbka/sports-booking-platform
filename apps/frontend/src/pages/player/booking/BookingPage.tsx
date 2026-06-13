import { BookingPageHero } from "@/components/player/booking/BookingPageHero";
import { BookingSidebar } from "@/components/player/booking/BookingSidebar";
import { BookingStepContent } from "@/components/player/booking/BookingStepContent";
import { BookingStepNavigation } from "@/components/player/booking/BookingStepNavigation";
import { BookingStepper } from "@/components/player/booking/BookingStepper";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingAddons } from "@/hooks/useBookingAddons";
import { useBookingSubmit } from "@/hooks/useBookingSubmit";
import { useBookingTimePricing } from "@/hooks/useBookingTimePricing";
import { useBookingWizard } from "@/hooks/useBookingWizard";
import { useSubfieldData } from "@/hooks/useSubfieldData";
import { useSubfieldReviews } from "@/hooks/useSubfieldReviews";
import { useAuthStore } from "@/store/useAuthStore";
import { addMonths } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type BookingType = "single" | "recurring";

export default function BookingPage() {
  const { subfieldId } = useParams<{ subfieldId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();

  const queryDate = searchParams.get("date");
  const queryStart = searchParams.get("start");
  const queryEnd = searchParams.get("end");

  const {
    subfield,
    products,
    isLoading: isSubfieldLoading,
    error: subfieldError,
    refetch: refetchSubfield,
  } = useSubfieldData({
    subfieldId,
    includeProducts: true,
  });

  const { reviews: reviewSnippets, summary: reviewSummary } = useSubfieldReviews({
    subfieldId,
    pageSize: 3,
    initialSortBy: "newest",
  });

  const [bookingType, setBookingType] = useState<BookingType>("single");

  const [date, setDate] = useState<Date | undefined>(() => {
    if (queryDate) {
      const parsed = new Date(queryDate);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  });
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
    initialStartTime: queryStart || undefined,
    initialEndTime: queryEnd || undefined,
  });

  const {
    addonQuantities,
    selectedAddons,
    addonSubtotal,
    addonsPayload,
    updateAddonQuantity,
  } = useBookingAddons(products, bookingType);

  const hasUpsellStep = bookingType === "single" && products.length > 0;

  const {
    currentStep,
    setCurrentStep,
    displayStep,
    stepperSteps,
    handleNextStep,
    handleBackStep,
    stepEyebrow,
    stepTitle,
  } = useBookingWizard({
    hasUpsellStep,
    onValidateStep1: () => {
      if (!date || !customStartTime || !customEndTime || !validateCustomTime()) {
        return false;
      }
      if (!priceCalculation.breakdown) {
        return false;
      }
      return true;
    },
  });

  const { isSubmitting, handleConfirmBooking } = useBookingSubmit({
    subfieldId,
    user,
    date,
    customStartTime,
    customEndTime,
    bookingType,
    endDate,
    recurringType,
    addonsPayload,
    navigate,
  });

  const totalPrice =
    bookingType === "single"
      ? priceCalculation.totalPrice + addonSubtotal
      : priceCalculation.totalPrice;

  // ─── Loading & error guards ──────────────────────────────────────────────
  if (isSubfieldLoading) {
    return (
      <div className="page-shell py-10">
        <LoadingState text="Đang tải trang booking..." className="py-16" />
      </div>
    );
  }

  if (subfieldError && !subfield) {
    return (
      <div className="page-shell py-10">
        <EmptyState
          title="Không thể tải thông tin sân"
          description="Đã xảy ra lỗi khi tải dữ liệu booking. Vui lòng thử lại."
          actionLabel="Thử lại"
          onAction={() => {
            void refetchSubfield();
          }}
          className="py-16"
        />
      </div>
    );
  }

  if (!subfield) {
    return (
      <div className="page-shell py-10">
        <EmptyState
          title="Không tìm thấy sân"
          description="Sân bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
          actionLabel="Quay lại"
          onAction={() => navigate(-1)}
          className="py-16"
        />
      </div>
    );
  }

  const handleNextStepClick = () => {
    if (currentStep === 1) {
      if (!date || !customStartTime || !customEndTime || !validateCustomTime()) {
        toast.error("Vui lòng chọn ngày giờ hợp lệ trước khi tiếp tục");
        return;
      }
      if (!priceCalculation.breakdown) {
        toast.error("Khung giờ không nằm trong bảng giá, vui lòng chọn lại");
        return;
      }
    }
    handleNextStep();
  };

  return (
    <div className="relative">
      {/* ── Backdrop ──────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute inset-0 sports-field-pattern opacity-[0.32]" />
        <div className="absolute -left-[10%] top-[-12%] size-[440px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-[8%] top-[4%] size-[360px] rounded-full bg-accent-sport/15 blur-3xl" />
      </div>

      <div className="page-shell flex flex-col gap-6 lg:gap-8 pt-10 sm:pt-12 lg:pt-14 pb-8 motion-safe-fade-up">
        <BookingPageHero subfield={subfield} />

        {/* ── Stepper ─────────────────────────────────────────────── */}
        <BookingStepper currentStep={displayStep} steps={stepperSteps} />

        {/* ── Content grid ────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-surface-2/50 px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Bước {displayStep} · {stepEyebrow}
                </span>
                <h2 className="font-display text-lg font-bold italic tracking-tight text-foreground">
                  {stepTitle}
                </h2>
              </div>
              {displayStep === stepperSteps.length ? (
                <Badge
                  variant="outline"
                  className="gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] status-surface-success"
                >
                  <CheckCircle2 data-icon="inline-start" />
                  Sẵn sàng
                </Badge>
              ) : null}
            </div>

            <CardContent className="p-5">
              <BookingStepContent
                currentStep={currentStep}
                subfield={subfield}
                date={date}
                setDate={setDate}
                bookingType={bookingType}
                setBookingType={setBookingType}
                setCurrentStep={setCurrentStep}
                endDate={endDate}
                setEndDate={setEndDate}
                recurringType={recurringType}
                setRecurringType={setRecurringType}
                availableRules={availableRules}
                customStartTime={customStartTime}
                customEndTime={customEndTime}
                timeOptions={timeOptions}
                setCustomStartTime={setCustomStartTime}
                setCustomEndTime={setCustomEndTime}
                validateCustomTime={validateCustomTime}
                hasUpsellStep={hasUpsellStep}
                products={products}
                addonQuantities={addonQuantities}
                updateAddonQuantity={updateAddonQuantity}
                selectedAddons={selectedAddons}
              />

              <BookingStepNavigation
                currentStep={currentStep}
                isSubmitting={isSubmitting}
                canConfirm={validateCustomTime() && !!priceCalculation.breakdown}
                onBack={handleBackStep}
                onNext={handleNextStepClick}
                onConfirm={handleConfirmBooking}
              />
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
    </div>
  );
}
