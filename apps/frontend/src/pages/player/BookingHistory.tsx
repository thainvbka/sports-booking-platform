import { BookingDetailDialog } from "@/components/player/BookingDetailDialog";
import { DeleteBookingDialog } from "@/components/player/DeleteBookingDialog";
import { ReviewDialog } from "@/components/player/ReviewDialog";
import { Badge } from "@/components/ui/badge";
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
import { useBookings } from "@/hooks/useBookings";
import {
  BOOKING_STATUS_LABELS,
  RECURRENCE_TYPE_LABELS,
  RECURRING_STATUS_LABELS,
  SPORT_TYPE_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { bookingService } from "@/services/booking.service";
import {
  BookingStatus,
  SportType,
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
  CalendarRange,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  MoreHorizontal,
  RefreshCcw,
  Ticket,
  X,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SingleBooking = Extract<BookingResponse, { type: "SINGLE" }>;

const PAGE_SIZE = 8;

// ─── Sport visual mapping ──────────────────────────────────────────────────
const SPORT_STUB_STYLE: Record<string, string> = {
  [SportType.FOOTBALL]:
    "bg-gradient-to-br from-emerald-500/95 to-green-600 text-white",
  [SportType.BASKETBALL]:
    "bg-gradient-to-br from-orange-500/95 to-amber-600 text-white",
  [SportType.TENNIS]:
    "bg-gradient-to-br from-lime-500/95 to-yellow-600 text-white",
  [SportType.BADMINTON]:
    "bg-gradient-to-br from-sky-500/95 to-blue-600 text-white",
  [SportType.VOLLEYBALL]:
    "bg-gradient-to-br from-rose-500/95 to-pink-600 text-white",
  [SportType.PICKLEBALL]:
    "bg-gradient-to-br from-violet-500/95 to-purple-600 text-white",
};

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

// ─── Main page ─────────────────────────────────────────────────────────────
export function PlayerBookingsPage() {
  const {
    bookings,
    loading,
    page,
    totalPages,
    setPage,
    updateBookingStatus,
    updateSingleBookingReview,
  } = useBookings({ pageSize: PAGE_SIZE });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [selectedBookingType, setSelectedBookingType] = useState<
    "SINGLE" | "RECURRING"
  >("SINGLE");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponse | null>(null);
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

  const handleViewDetails = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleReviewSuccess = (bookingId: string, review: ReviewItem) => {
    updateSingleBookingReview(bookingId, review);
    if (selectedBooking && selectedBooking.type === "SINGLE" && selectedBooking.id === bookingId) {
      setSelectedBooking({
        ...selectedBooking,
        review,
      });
    }
    // Đóng review dialog
    setReviewDialogOpen(false);
    toast.success("Đánh giá của bạn đã được lưu");
  };

  // ─── Derived counters (of current page) ──────────────────────────────────
  const pendingCount = bookings.filter(
    (b) => b.status === BookingStatus.PENDING,
  ).length;
  const confirmedCount = bookings.filter(
    (b) => b.status === BookingStatus.CONFIRMED,
  ).length;
  const cancellableCount = bookings.filter((b) => canCancelBooking(b)).length;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      {/* decorative backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />
        <div className="absolute inset-0 sports-field-pattern opacity-[0.35]" />
        <div className="absolute left-[-8%] top-[-10%] size-[420px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-6%] top-[5%] size-[340px] rounded-full bg-accent-sport/15 blur-3xl" />
      </div>

      <div className="container mx-auto flex flex-col gap-7 px-4 py-8 lg:px-6">
        {/* ── Hero header ─────────────────────────────────────────────── */}
        <header className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            

            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="flex max-w-2xl flex-col gap-2">
                <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                  Lịch sử đặt sân{" "}
                  <span className="bg-gradient-to-br from-primary via-primary to-accent-sport bg-clip-text italic text-transparent">
                    của bạn
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground sm:text-[15px]">
                  Mỗi vé là một trận sắp đá, một hóa đơn cần chốt hoặc một kỉ
                  niệm đã khép. Theo dõi, thanh toán, hủy lịch và đánh giá sân
                  ở cùng một nơi.
                </p>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap items-center gap-2">
                <StatPill
                  label="Chờ thanh toán"
                  value={pendingCount}
                  tone="amber"
                  icon={CreditCard}
                />
                <StatPill
                  label="Đã xác nhận"
                  value={confirmedCount}
                  tone="emerald"
                  icon={CheckCircle2}
                />
                <StatPill
                  label="Có thể hủy"
                  value={cancellableCount}
                  tone="sky"
                  icon={Clock}
                />
              </div>
            </div>
          </div>

          
        </header>

        {/* ── Ticket list ──────────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          {loading && bookings.length === 0 ? (
            <TicketSkeletonList />
          ) : bookings.length === 0 ? (
            <EmptyLedger />
          ) : (
            bookings.map((booking) => (
              <BookingTicket
                key={`${booking.type}-${booking.id}`}
                booking={booking}
                loading={loading}
                paying={payingBookingId === booking.id}
                anyPaying={Boolean(payingBookingId)}
                onPay={handlePayment}
                onViewDetails={handleViewDetails}
                onRequestCancel={() => {
                  setSelectedBookingId(booking.id);
                  setSelectedBookingType(booking.type);
                  setDeleteDialogOpen(true);
                }}
              />
            ))
          )}
        </section>

        {/* ── Pagination ───────────────────────────────────────────── */}
        {totalPages > 1 && (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            disabled={loading}
          />
        )}
      </div>

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

      <BookingDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        booking={selectedBooking}
        onReviewClick={() => {
          if (selectedBooking && selectedBooking.type === "SINGLE") {
            setSelectedReviewBooking(selectedBooking);
            setReviewDialogOpen(true);
          }
        }}
        canCreateReview={selectedBooking ? canCreateReviewBooking(selectedBooking) : false}
        canUpdateReview={selectedBooking ? canUpdateReviewBooking(selectedBooking) : false}
      />
    </div>
  );
}

// ─── Stat pill (header) ───────────────────────────────────────────────────
function StatPill({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "amber" | "emerald" | "sky";
  icon: LucideIcon;
}) {
  const toneClass: Record<typeof tone, string> = {
    amber:
      "border-amber-200/80 bg-amber-50/90 text-amber-800 [--dot:theme(colors.amber.500)]",
    emerald:
      "border-emerald-200/80 bg-emerald-50/90 text-emerald-800 [--dot:theme(colors.emerald.500)]",
    sky: "border-sky-200/80 bg-sky-50/90 text-sky-800 [--dot:theme(colors.sky.500)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 shadow-sm backdrop-blur-sm",
        toneClass[tone],
      )}
    >
      <span className="grid size-8 place-items-center rounded-xl bg-white/70">
        <Icon className="size-4" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">
          {label}
        </span>
        <span className="font-display text-lg font-black italic tabular-nums">
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── Booking ticket ───────────────────────────────────────────────────────
interface BookingTicketProps {
  booking: BookingResponse;
  loading: boolean;
  paying: boolean;
  anyPaying: boolean;
  onPay: (ids: string[], id: string) => void;
  onViewDetails: (booking: BookingResponse) => void;
  onRequestCancel: () => void;
}

function BookingTicket({
  booking,
  loading,
  paying,
  anyPaying,
  onPay,
  onViewDetails,
  onRequestCancel,
}: BookingTicketProps) {
  const isSingle = booking.type === "SINGLE";
  const statusVisual = STATUS_VISUAL[booking.status];
  const StatusIcon = statusVisual.icon;

  const stubClass =
    SPORT_STUB_STYLE[booking.sport_type] ??
    "bg-gradient-to-br from-slate-700 to-slate-900 text-white";

  const statusLabel = isSingle
    ? BOOKING_STATUS_LABELS[booking.status] ?? booking.status
    : RECURRING_STATUS_LABELS[booking.status] ?? booking.status;

  const sportLabel =
    SPORT_TYPE_LABELS[booking.sport_type as keyof typeof SPORT_TYPE_LABELS] ??
    booking.sport_type;

  // Primary date for stub
  const stubDate = isSingle
    ? new Date(booking.start_time)
    : new Date(booking.start_date);

  const canCancel = canCancelBooking(booking);
  const isPending = booking.status === BookingStatus.PENDING;

  return (
    <article
      onClick={() => onViewDetails(booking)}
      className={cn(
        "group relative isolate flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md sm:flex-row cursor-pointer",
        isPending && "ring-1 ring-amber-200/70",
      )}
    >
      {/* Stub (date) */}
      <div
        className={cn(
          "relative flex w-full shrink-0 items-center justify-between px-5 py-4 sm:w-[148px] sm:flex-col sm:items-start sm:justify-center sm:py-5",
          stubClass,
        )}
      >
        <div className="flex flex-col leading-none">
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
            {format(stubDate, "EEEE", { locale: vi })}
          </span>
          <span className="mt-0.5 font-display text-4xl font-black italic tabular-nums">
            {format(stubDate, "dd")}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/85">
            {format(stubDate, "MMM yyyy", { locale: vi })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-black/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/95 backdrop-blur-sm sm:mt-4 sm:self-start">
          {isSingle ? (
            <CalendarDays className="size-3" />
          ) : (
            <RefreshCcw className="size-3" />
          )}
          {isSingle ? "Một lần" : "Định kỳ"}
        </div>

        {/* perforation (desktop only) */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 top-1/2 hidden size-4 -translate-y-1/2 rounded-full border border-border/70 bg-background sm:block"
        />
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 border-t border-dashed border-border/70 p-4 sm:border-l sm:border-t-0 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/25 bg-primary/5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary"
              >
                <Ticket className="size-3" data-icon="inline-start" />
                {sportLabel}
              </Badge>
              {isPending && booking.expires_at && (
                <ExpiresChip expiresAt={booking.expires_at} />
              )}
            </div>
            <h3 className="truncate font-display text-lg font-bold leading-tight tracking-tight text-foreground">
              {booking.complex_name}
            </h3>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
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

          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              statusVisual.className,
            )}
          >
            <StatusIcon className="size-3.5" data-icon="inline-start" />
            {statusLabel}
          </Badge>
        </div>

        {/* Meta strip */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
          {isSingle ? (
            <MetaItem
              icon={Clock}
              label={`${format(new Date(booking.start_time), "HH:mm")} – ${format(
                new Date(booking.end_time),
                "HH:mm",
              )}`}
            />
          ) : (
            <>
              <MetaItem
                icon={CalendarRange}
                label={`${format(new Date(booking.start_date), "dd/MM")} – ${format(
                  new Date(booking.end_date),
                  "dd/MM/yyyy",
                )}`}
              />
              {booking.bookings.length > 0 && (
                <MetaItem
                  icon={Clock}
                  label={`${format(
                    new Date(booking.bookings[0].start_time),
                    "HH:mm",
                  )} – ${format(
                    new Date(booking.bookings[0].end_time),
                    "HH:mm",
                  )}`}
                />
              )}
              <MetaItem
                icon={RefreshCcw}
                label={`${booking.total_slots} buổi · ${
                  RECURRENCE_TYPE_LABELS[booking.recurrence_type] ??
                  booking.recurrence_type
                }`}
                tone="primary"
              />
            </>
          )}
        </div>
      </div>

      {/* Right cuống — price + actions */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-dashed border-border/70 bg-surface-2/60 px-4 py-3 sm:w-[220px] sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:px-5 sm:py-5">
        <div className="flex flex-col leading-tight sm:items-end sm:text-right">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Tổng tiền
          </span>
          <span className="font-display text-2xl font-black italic tabular-nums text-foreground">
            {formatPrice(booking.total_price)}
          </span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isPending && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
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
              className="h-9"
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
                  <span className="sr-only">Mở menu hành động</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestCancel();
                  }}
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

// ─── Meta item ────────────────────────────────────────────────────────────
function MetaItem({
  icon: Icon,
  label,
  tone = "muted",
}: {
  icon: LucideIcon;
  label: string;
  tone?: "muted" | "primary";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        tone === "primary"
          ? "font-semibold text-primary"
          : "text-muted-foreground",
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
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

// ─── Skeleton list ────────────────────────────────────────────────────────
function TicketSkeletonList() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card sm:flex-row"
        >
          <Skeleton className="h-24 w-full shrink-0 sm:h-auto sm:w-[148px]" />
          <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-dashed border-border/70 bg-surface-2/60 px-4 py-3 sm:w-[220px] sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:py-5">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-9 w-28 rounded-md" />
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
