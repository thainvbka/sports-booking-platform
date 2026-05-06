import { DeleteBookingDialog } from "@/components/player/DeleteBookingDialog";
import { ReviewDialog } from "@/components/player/ReviewDialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookings } from "@/hooks/useBookings";
import {
  BOOKING_STATUS_LABELS,
  RECURRING_STATUS_LABELS,
  SPORT_TYPE_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { bookingService } from "@/services/booking.service";
import {
  BookingStatus,
  type BookingResponse,
  type ReviewItem,
} from "@/types";
import { formatPrice } from "@/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  BadgeCheck,
  CalendarDays,
  Clock,
  CreditCard,
  MapPin,
  MoreHorizontal,
  RefreshCcw,
  Star,
  Ticket,
  X,
  XCircle,
  Zap
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type SingleBooking = Extract<BookingResponse, { type: "SINGLE" }>;

const PAGE_SIZE = 8;

const STATUS_VISUAL: Record<
  BookingStatus,
  { icon: LucideIcon; className: string }
> = {
  [BookingStatus.PENDING]: {
    icon: CreditCard,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  [BookingStatus.CONFIRMED]: {
    icon: BadgeCheck,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  [BookingStatus.COMPLETED]: {
    icon: Clock,
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  [BookingStatus.CANCELED]: {
    icon: XCircle,
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

const BOOKING_STATUS_TAB_META: Record<
  BookingStatus,
  {
    icon: LucideIcon;
    label: string;
    tint: string;
    dot: string;
  }
> = {
  [BookingStatus.PENDING]: {
    icon: CreditCard,
    label: "Chờ thanh toán",
    tint: "data-[state=active]:bg-amber-500/10 data-[state=active]:border-amber-400/40",
    dot: "bg-amber-500",
  },
  [BookingStatus.CONFIRMED]: {
    icon: BadgeCheck,
    label: "Đã xác nhận",
    tint: "data-[state=active]:bg-emerald-500/10 data-[state=active]:border-emerald-400/40",
    dot: "bg-emerald-500",
  },
  [BookingStatus.COMPLETED]: {
    icon: Clock,
    label: "Đã hoàn thành",
    tint: "data-[state=active]:bg-sky-500/10 data-[state=active]:border-sky-400/40",
    dot: "bg-sky-500",
  },
  [BookingStatus.CANCELED]: {
    icon: XCircle,
    label: "Đã hủy",
    tint: "data-[state=active]:bg-rose-500/10 data-[state=active]:border-rose-400/40",
    dot: "bg-rose-500",
  },
};

// ─── Main page ─────────────────────────────────────────────────────────────
export function PlayerBookingsPage() {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "ALL">(
    "ALL",
  );
  const {
    bookings,
    loading,
    page,
    totalPages,
    summary,
    setPage,
    updateBookingStatus,
    updateSingleBookingReview,
  } = useBookings({ pageSize: PAGE_SIZE, status: selectedStatus });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [selectedBookingType, setSelectedBookingType] = useState<
    "SINGLE" | "RECURRING"
  >("SINGLE");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] =
    useState<SingleBooking | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  // ─── Handlers (logic preserved) ──────────────────────────────────────────
  const handlePayment = async (bookingIds: string[], bookingId: string) => {
    if (payingBookingId) return;
    setPayingBookingId(bookingId);

    try {
      const result = await bookingService.createCheckoutSession(bookingIds);
      const checkoutUrl = result.data?.url;

      if (!checkoutUrl) {
        toast.error("Không nhận được đường dẫn thanh toán. Vui lòng thử lại sau.");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err: unknown) {
      console.error("Create checkout session failed", err);
      const apiError = err as { message?: string };
      toast.error(
        apiError?.message ||
          "Không thể tạo phiên thanh toán. Vui lòng thử lại sau.",
      );
    } finally {
      setPayingBookingId(null);
    }
  };

  const handleCancel = async () => {
    if (!selectedBookingId) return;

    if (selectedBookingType === "SINGLE") {
      await bookingService.cancelBooking(selectedBookingId).catch(() => {
        toast.error("Đã xảy ra lỗi khi hủy đặt sân");
        throw new Error("Cancel booking failed");
      });
    } else {
      await bookingService.cancelRecurringBooking(selectedBookingId).catch(() => {
        toast.error("Đã xảy ra lỗi khi hủy đặt sân định kỳ");
        throw new Error("Cancel recurring booking failed");
      });
    }

    updateBookingStatus(
      selectedBookingId,
      selectedBookingType,
      BookingStatus.CANCELED,
    );

    toast.success("Đã hủy đặt sân thành công");
    setSelectedBookingId(null);
  };

  const handleReviewSuccess = (bookingId: string, review: ReviewItem) => {
    updateSingleBookingReview(bookingId, review);
    // Đóng review dialog
    setReviewDialogOpen(false);
    toast.success("Đánh giá của bạn đã được lưu");
  };

  const statusCounts: Record<BookingStatus, number> = summary.byStatus;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[60vh] bg-background">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950/80"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 sports-field-pattern opacity-[0.1]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-8 size-80 rounded-full bg-accent-sport/25 blur-3xl"
        />

        <div className="page-shell relative z-10 flex min-h-85 flex-col gap-8 py-12 sm:min-h-90 sm:py-16 lg:min-h-100 lg:gap-10 lg:py-20">
          <Breadcrumb>
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="hover:text-white">
                  <Link to="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/30" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Lịch sử đặt sân</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="flex flex-col gap-2">
            <div className="flex max-w-2xl flex-col gap-2">
              <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Lịch sử đặt sân{" "}
                <span className="bg-linear-to-br from-primary via-primary to-accent-sport bg-clip-text italic text-transparent">
                  của bạn
                </span>
              </h1>
              <p className="text-base text-white/70 sm:text-lg">
                Mỗi vé là một trận sắp đá, một hóa đơn cần chốt hoặc một kỉ niệm đã
                khép. Theo dõi, thanh toán, hủy lịch và đánh giá sân ở cùng một nơi.
              </p>
            </div>
          </header>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-background"
        />
      </section>

      <section className="page-shell py-10">
        <div className="flex flex-col gap-8">
          {/* ── Status Tabs ───────────────────────────────────────────── */}
          <Tabs
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value as BookingStatus | "ALL");
              setPage(1);
            }}
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-transparent p-0 sm:grid-cols-2 lg:grid-cols-5">
              <TabsTrigger
                value="ALL"
                className={cn(
                  "group flex h-auto flex-col items-start gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm",
                  "data-[state=active]:border-transparent data-[state=active]:shadow-md data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30",
                  "hover:border-border hover:bg-card",
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-muted/70 text-foreground/80">
                      <Zap className="size-3" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Tất cả
                      </span>
                      <span className="font-display text-xs font-bold italic text-foreground">
                        Lịch sử
                      </span>
                    </span>
                  </span>
                  <span className="font-display text-lg font-black italic tabular-nums text-foreground">
                    {summary.total}
                  </span>
                </div>
              </TabsTrigger>
              {Object.entries(BOOKING_STATUS_TAB_META).map(([status, meta]) => {
                const Icon = meta.icon;
                const count = statusCounts[status as BookingStatus] ?? 0;
                return (
                  <TabsTrigger
                    key={status}
                    value={status}
                    className={cn(
                      "group flex h-auto flex-col items-start gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm",
                      "data-[state=active]:border-transparent data-[state=active]:shadow-md",
                      "hover:border-border hover:bg-card",
                      meta.tint,
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-muted/70 text-foreground/80">
                          <Icon className="size-3" />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {meta.label.split(" ")[0]}
                          </span>
                          <span className="font-display text-xs font-bold italic text-foreground">
                            {BOOKING_STATUS_LABELS[status as BookingStatus] ?? status}
                          </span>
                        </span>
                      </span>
                      <span className="font-display text-lg font-black italic tabular-nums text-foreground">
                        {count}
                      </span>
                    </div>
                    <span
                      aria-hidden
                      className={cn(
                        "h-0.5 w-full origin-left rounded-full bg-transparent transition-all",
                        "group-data-[state=active]:bg-gradient-to-r",
                        status === BookingStatus.PENDING && "group-data-[state=active]:from-amber-500 group-data-[state=active]:to-amber-300",
                        status === BookingStatus.CONFIRMED && "group-data-[state=active]:from-emerald-500 group-data-[state=active]:to-emerald-300",
                        status === BookingStatus.COMPLETED && "group-data-[state=active]:from-sky-500 group-data-[state=active]:to-sky-300",
                        status === BookingStatus.CANCELED && "group-data-[state=active]:from-rose-500 group-data-[state=active]:to-rose-300",
                      )}
                    />
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* ── Booking Cards Grid ───────────────────────────────────── */}
          {loading && bookings.length === 0 ? (
            <BookingCardSkeletonGrid />
          ) : bookings.length === 0 ? (
            <EmptyLedger />
          ) : bookings.length === 0 ? (
            <EmptyLedger />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
              {bookings.map((booking) => (
                <BookingCard
                  key={`${booking.type}-${booking.id}`}
                  booking={booking}
                  loading={loading}
                  paying={payingBookingId === booking.id}
                  anyPaying={Boolean(payingBookingId)}
                  onPay={handlePayment}
                  onRequestCancel={() => {
                    setSelectedBookingId(booking.id);
                    setSelectedBookingType(booking.type);
                    setDeleteDialogOpen(true);
                  }}
                  onReviewClick={() => {
                    if (booking.type === "SINGLE") {
                      setSelectedReviewBooking(booking);
                      setReviewDialogOpen(true);
                    }
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ───────────────────────────────────────────── */}
          {bookings.length > 0 && totalPages > 1 && (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              disabled={loading}
            />
          )}
        </div>
      </section>

      {/* ── Dialogs (unchanged wiring) ────────────────────────────── */}
      <DeleteBookingDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedBookingId(null);
        }}
        bookingId={selectedBookingId || ""}
        onConfirm={handleCancel}
      />

      <ReviewDialog
        open={reviewDialogOpen}
        booking={selectedReviewBooking}
        existingReview={selectedReviewBooking?.review ?? null}
        onOpenChange={(open) => {
          setReviewDialogOpen(open);
          if (!open) setSelectedReviewBooking(null);
        }}
        onSuccess={handleReviewSuccess}
      />


    </div>
  );
}

// ─── Booking card (grid-friendly) ───────────────────────────────────────
interface BookingCardProps {
  booking: BookingResponse;
  loading: boolean;
  paying: boolean;
  anyPaying: boolean;
  onPay: (ids: string[], id: string) => void;
  onRequestCancel: () => void;
  onReviewClick: () => void;
}

function BookingCard({
  booking,
  loading,
  paying,
  anyPaying,
  onPay,
  onRequestCancel,
  onReviewClick,
}: BookingCardProps) {
  const isSingle = booking.type === "SINGLE";
  const statusVisual = STATUS_VISUAL[booking.status];
  const StatusIcon = statusVisual.icon;
  const canCancel = canCancelBooking(booking);
  const isPending = booking.status === BookingStatus.PENDING;
  const canReview = canCreateReviewBooking(booking);
  const hasReview = canUpdateReviewBooking(booking);

  const statusLabel = isSingle
    ? BOOKING_STATUS_LABELS[booking.status] ?? booking.status
    : RECURRING_STATUS_LABELS[booking.status] ?? booking.status;

  const sportLabel =
    SPORT_TYPE_LABELS[booking.sport_type as keyof typeof SPORT_TYPE_LABELS] ??
    booking.sport_type;

  const stubDate = isSingle
    ? new Date(booking.start_time)
    : new Date(booking.start_date);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-primary/40",
        isPending && "ring-1 ring-amber-200/50",
      )}
    >
      {/* ── Main Content ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        {/* Top row: Sport badge + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/25 bg-primary/5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary"
            >
              <Ticket className="size-3" data-icon="inline-start" />
              {sportLabel}
            </Badge>
            {isPending && booking.expires_at && (
              <ExpiresChip expiresAt={booking.expires_at} />
            )}
          </div>
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold shrink-0",
              statusVisual.className,
            )}
          >
            <StatusIcon className="size-3" data-icon="inline-start" />
            {statusLabel}
          </Badge>
        </div>

        {/* Complex name + Address */}
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 font-display text-base font-bold leading-tight tracking-tight text-foreground">
            {booking.complex_name}
          </h3>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground line-clamp-2">
            <MapPin className="size-3.5 shrink-0 text-primary/70" />
            <span className="truncate">
              {booking.sub_field_name}
              {booking.complex_address && (
                <span className="text-muted-foreground/70">
                  {" "}
                  · {booking.complex_address}
                </span>
              )}
            </span>
          </p>
        </div>

        {/* Date/Time + Recurrence info */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <CalendarDays className="size-3.5 text-primary/70" />
            {format(stubDate, "dd MMM yyyy", { locale: vi })}
          </div>
          {isSingle ? (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3.5" />
              {format(new Date(booking.start_time), "HH:mm")} –{" "}
              {format(new Date(booking.end_time), "HH:mm")}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1 text-muted-foreground">
                <RefreshCcw className="size-3.5" />
                {booking.total_slots} buổi
              </div>
              {booking.bookings.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3.5" />
                  {format(
                    new Date(booking.bookings[0].start_time),
                    "HH:mm",
                  )} –{" "}
                  {format(
                    new Date(booking.bookings[0].end_time),
                    "HH:mm",
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 border-t border-border/50 pt-3 mt-1">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tổng:
          </span>
          <span className="font-display text-xl font-black italic tabular-nums text-foreground">
            {formatPrice(booking.total_price)}
          </span>
        </div>

        {/* Review section inline - always visible */}
        {(canReview || hasReview) && (
          <ReviewSectionInline
            booking={booking as SingleBooking}
            canCreate={canReview}
            hasExisting={hasReview}
            onEditClick={onReviewClick}
          />
        )}

        {/* Action buttons - always visible */}
        <div className="flex items-center gap-2 pt-2 flex-wrap">
          {isPending && (
            <Button
              size="sm"
              onClick={() => {
                if (booking.type === "SINGLE") {
                  void onPay([booking.id], booking.id);
                  return;
                }
                void onPay(
                  booking.bookings.map((slot) => slot.id),
                  booking.id,
                );
              }}
              disabled={loading || anyPaying}
              className="flex-1 min-w-32"
            >
              <CreditCard data-icon="inline-start" />
              {paying ? "Đang chuyển..." : "Thanh toán"}
            </Button>
          )}

          {canCancel && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-full"
                  disabled={loading || paying}
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={onRequestCancel}
                  className="text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                >
                  <X data-icon="inline-start" />
                  Hủy đặt sân
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Review section (inline) ──────────────────────────────────────────────
function ReviewSectionInline({
  booking,
  canCreate,
  hasExisting,
  onEditClick,
}: {
  booking: SingleBooking;
  canCreate: boolean;
  hasExisting: boolean;
  onEditClick: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (!hasExisting && !canCreate) return null;

  if (hasExisting && booking.review) {
    return (
      <div
        className="rounded-lg bg-amber-50 border border-amber-200 p-3 transition-all cursor-pointer group"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-amber-900">
              {booking.review.rating}/5 sao
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditClick}
            className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Chỉnh sửa
          </Button>
        </div>
        {showDetails && booking.review.comment && (
          <p className="text-xs text-amber-800 italic mt-2">"{booking.review.comment}"</p>
        )}
      </div>
    );
  }

  if (canCreate) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onEditClick}
        className="w-full justify-center"
      >
        <Star className="size-4" data-icon="inline-start" />
        Thêm đánh giá
      </Button>
    );
  }

  return null;
}

// ─── Expiry chip (for PENDING) ────────────────────────────────────────────
function ExpiresChip({ expiresAt }: { expiresAt: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-amber-800">
      <AlarmClock className="size-3" />
      Hết hạn {format(new Date(expiresAt), "HH:mm dd/MM")}
    </span>
  );
}

// ─── Skeleton grid ────────────────────────────────────────────────────────
function BookingCardSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:p-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Title */}
          <Skeleton className="h-5 w-2/3" />

          {/* Address */}
          <Skeleton className="h-4 w-full" />

          {/* Date/Time */}
          <div className="flex gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Price */}
          <Skeleton className="h-6 w-32 mt-1" />

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────
function EmptyLedger() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/70 bg-background/60 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Ticket className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-xl font-bold italic tracking-tight">
          Chưa có vé nào trong sổ
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Khi bạn đặt sân, mỗi lượt sẽ hiện ở đây như một tấm vé — theo dõi
          thanh toán, thời gian và đánh giá ở cùng một nơi.
        </p>
      </div>
    </div>
  );
}

// ─── Pagination bar ───────────────────────────────────────────────────────
function PaginationBar({
  page,
  totalPages,
  onPageChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  const items = buildPageList(page, totalPages);

  const go = (event: React.MouseEvent, target: number) => {
    event.preventDefault();
    if (disabled) return;
    if (target < 1 || target > totalPages || target === page) return;
    onPageChange(target);
  };

  return (
    <Pagination className="pt-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1 || disabled}
            className={cn(
              (page === 1 || disabled) && "pointer-events-none opacity-50",
            )}
            onClick={(event) => go(event, page - 1)}
          />
        </PaginationItem>
        {items.map((item, idx) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === page}
                onClick={(event) => go(event, item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === totalPages || disabled}
            className={cn(
              (page === totalPages || disabled) &&
                "pointer-events-none opacity-50",
            )}
            onClick={(event) => go(event, page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildPageList(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "ellipsis")[] = [1];
  if (current > 3) items.push("ellipsis");
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  for (let i = from; i <= to; i++) items.push(i);
  if (current < total - 2) items.push("ellipsis");
  items.push(total);
  return items;
}

// ─── Predicate helpers (logic preserved) ──────────────────────────────────
function canCancelBooking(booking: BookingResponse): boolean {
  if (!["PENDING", "COMPLETED"].includes(booking.status)) return false;
  if (booking.type === "SINGLE") {
    return new Date(booking.start_time) > new Date();
  }
  return new Date(booking.start_date) > new Date();
}

function canCreateReviewBooking(
  booking: BookingResponse,
): booking is SingleBooking {
  return (
    booking.type === "SINGLE" &&
    booking.status === BookingStatus.CONFIRMED &&
    !booking.review
  );
}

function canUpdateReviewBooking(
  booking: BookingResponse,
): booking is SingleBooking {
  return (
    booking.type === "SINGLE" &&
    booking.status === BookingStatus.CONFIRMED &&
    !!booking.review
  );
}
