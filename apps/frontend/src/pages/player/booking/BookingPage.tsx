import { BookingAddonsStep } from "@/components/player/booking/BookingAddonsStep";
import { BookingConfirmStep } from "@/components/player/booking/BookingConfirmStep";
import { BookingScheduleStep } from "@/components/player/booking/BookingScheduleStep";
import { BookingSidebar } from "@/components/player/booking/BookingSidebar";
import { BookingStepper } from "@/components/player/booking/BookingStepper";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { ImageFallback } from "@/components/shared/ui-utility/ImageFallback";
import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingTimePricing } from "@/hooks/useBookingTimePricing";
import { useSubfieldData } from "@/hooks/useSubfieldData";
import { useSubfieldReviews } from "@/hooks/useSubfieldReviews";
import { cn } from "@/lib/utils";
import { bookingService } from "@/services/booking.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { ApiError, SubfieldProduct } from "@/types";
import { getSportTypeLabel } from "@/utils";
import { getIsoDateTimeVn } from "@/utils/time.utils";
import { addMonths, format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

  const stepperSteps = hasUpsellStep
    ? [
        { number: 1, label: "Chọn lịch" },
        { number: 2, label: "Add-on" },
        { number: 3, label: "Xác nhận" },
      ]
    : [
        { number: 1, label: "Chọn lịch" },
        { number: 2, label: "Xác nhận" },
      ];

  const displayStep = hasUpsellStep ? currentStep : currentStep === 1 ? 1 : 2;

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

  const addonsPayload = useMemo(
    () =>
      selectedAddons.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    [selectedAddons],
  );

  const totalPrice =
    bookingType === "single"
      ? priceCalculation.totalPrice + addonSubtotal
      : priceCalculation.totalPrice;

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
          ...(addonsPayload.length > 0 ? { addons: addonsPayload } : {}),
        });

        const bookingId = createResponse.data.booking.id;

        toast.success("Tạo booking thành công. Vui lòng thanh toán để giữ chỗ.");
        navigate(`/booking-review/${bookingId}`);
        return;
      }

      if (!endDate) {
        toast.error("Vui lòng chọn ngày kết thúc cho đặt định kỳ");
        return;
      }

      const recurringResponse = await bookingService.createRecurringBooking(
        subfieldId,
        {
          start_time: getIsoDateTimeVn(date, customStartTime),
          end_time: getIsoDateTimeVn(date, customEndTime),
          start_date: format(date, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          recurring_type: recurringType,
          type: "RECURRING",
        },
      );

      toast.success("Tạo lịch đặt định kỳ thành công.");
      navigate(
        `/booking-review/recurring/${recurringResponse.data.recurringBooking.id}`,
      );
    } catch (error: unknown) {
      console.error("Booking submit failed", error);
      const apiError = error as ApiError;
      toast.error(apiError?.message || "Không thể tạo booking");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const stepEyebrow =
    displayStep === 1
      ? "Lựa chọn khung giờ"
      : hasUpsellStep && displayStep === 2
        ? "Phụ kiện · đồ dùng"
        : "Xác nhận & thanh toán";

  const stepTitle =
    displayStep === 1
      ? "Chọn ngày & khung giờ đá"
      : hasUpsellStep && displayStep === 2
        ? "Thêm trang bị cho trận đấu"
        : "Kiểm tra lại thông tin";

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

      <div className="page-shell flex flex-col gap-6 py-8 motion-safe-fade-up">
        {/* ── Breadcrumb ──────────────────────────────────────────── */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/complexes/${subfield.complex.id}`}>
                  {subfield.complex.complex_name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/subfields/${subfield.id}`}>
                  {subfield.sub_field_name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Đặt sân</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* ── Hero ────────────────────────────────────────────────── */}
        <header className="flex flex-wrap items-start gap-5">
          {/* left block */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.26em] text-muted-foreground backdrop-blur-sm">
              <span className="relative inline-flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent-sport/70" />
                <span className="relative inline-block size-1.5 rounded-full bg-accent-sport" />
              </span>
              Matchday · Booking slip
            </span>

            <div className="flex flex-col gap-1">
              <h1 className="leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-5xl text-title">
                Đặt sân{" "}
                <span className="bg-gradient-to-br from-primary via-primary to-accent-sport bg-clip-text italic text-transparent">
                  {subfield.sub_field_name}
                </span>
              </h1>
              <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:text-[15px]">
                <MapPin className="size-4 shrink-0 text-primary/70" />
                <span className="font-semibold text-foreground/85">
                  {subfield.complex.complex_name}
                </span>
                <span className="text-muted-foreground/60">·</span>
                <span className="truncate">
                  {subfield.complex.complex_address}
                </span>
              </p>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary"
              >
                {getSportTypeLabel(subfield.sport_type)}
              </Badge>
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm"
              >
                <Users data-icon="inline-start" />
                Sức chứa {subfield.capacity}
              </Badge>
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-accent-sport/30 bg-accent-sport/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-sport backdrop-blur-sm"
              >
                <ShieldCheck data-icon="inline-start" />
                Giữ chỗ tức thì
              </Badge>
            </div>
          </div>

          {/* right thumb */}
          <div className="relative hidden size-28 shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm sm:block md:size-32">
            {subfield.sub_field_image ? (
              <img
                src={subfield.sub_field_image}
                alt={subfield.sub_field_name}
                className="size-full object-cover"
              />
            ) : (
              <ImageFallback
                title={subfield.sub_field_name}
                showLabel={false}
                className="rounded-none"
              />
            )}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent"
            />
            <span className="absolute bottom-2 left-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/95">
              Pitch · {subfield.sub_field_name}
            </span>
          </div>
        </header>

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
              {currentStep === 1 && (
                <div className="motion-safe-fade-up">
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
                </div>
              )}

              {currentStep === 2 && (
                <div className="motion-safe-fade-up">
                  <BookingAddonsStep
                    hasUpsellStep={hasUpsellStep}
                    products={products}
                    addonQuantities={addonQuantities}
                    onUpdateAddonQuantity={updateAddonQuantity}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="motion-safe-fade-up">
                  <BookingConfirmStep
                    subfieldName={subfield.sub_field_name}
                    bookingType={bookingType}
                    date={date}
                    endDate={endDate}
                    customStartTime={customStartTime}
                    customEndTime={customEndTime}
                    selectedAddons={selectedAddons}
                  />
                </div>
              )}

              {/* Navigation */}
              <div
                className={cn(
                  "mt-6 flex flex-col-reverse items-stretch gap-2 border-t border-dashed border-border/70 pt-4",
                  "sm:flex-row sm:items-center sm:justify-between",
                )}
              >
                <Button
                  variant="outline"
                  onClick={handleBackStep}
                  disabled={currentStep === 1 || isSubmitting}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft data-icon="inline-start" />
                  Quay lại
                </Button>

                {currentStep < 3 ? (
                  <Button
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Tiếp tục
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                ) : (
                  <Button
                    className="w-full sm:w-auto"
                    disabled={
                      isSubmitting ||
                      !validateCustomTime() ||
                      !priceCalculation.breakdown
                    }
                    onClick={handleConfirmBooking}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          data-icon="inline-start"
                          className="animate-spin"
                        />
                        Đang tạo booking...
                      </>
                    ) : (
                      <>
                        Xác nhận & thanh toán
                        <ArrowRight data-icon="inline-end" />
                      </>
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
    </div>
  );
}
