import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BOOKING_STATUS_LABELS,
  RECURRING_STATUS_LABELS,
  SPORT_TYPE_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  BookingStatus,
  type BookingResponse,
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
  RefreshCcw,
  Star,
  Ticket,
  XCircle,
  Trophy,
} from "lucide-react";
import { useState } from "react";

export type SingleBooking = Extract<BookingResponse, { type: "SINGLE" }>;

export const STATUS_VISUAL: Record<
  BookingStatus,
  { icon: LucideIcon; className: string }
> = {
  [BookingStatus.PENDING]: {
    icon: CreditCard,
    className: "status-surface-warning",
  },
  [BookingStatus.CONFIRMED]: {
    icon: BadgeCheck,
    className: "status-surface-success",
  },
  [BookingStatus.COMPLETED]: {
    icon: Clock,
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  [BookingStatus.CANCELED]: {
    icon: XCircle,
    className: "status-surface-error",
  },
};

export function canCancelBooking(booking: BookingResponse): boolean {
  if (!["PENDING", "COMPLETED"].includes(booking.status)) return false;
  if (booking.type === "SINGLE") {
    return new Date(booking.start_time) > new Date();
  }
  return new Date(booking.start_date) > new Date();
}

export function canCreateReviewBooking(
  booking: BookingResponse,
): booking is SingleBooking {
  return (
    booking.type === "SINGLE" &&
    booking.status === BookingStatus.CONFIRMED &&
    !booking.review
  );
}

export function canUpdateReviewBooking(
  booking: BookingResponse,
): booking is SingleBooking {
  return (
    booking.type === "SINGLE" &&
    booking.status === BookingStatus.CONFIRMED &&
    !!booking.review
  );
}

interface BookingCardProps {
  booking: BookingResponse;
  loading: boolean;
  paying: boolean;
  anyPaying: boolean;
  onPay: (ids: string[], id: string) => void;
  onRequestCancel: () => void;
  onReviewClick: (booking: SingleBooking) => void;
  onCreateMatchClick: (booking: BookingResponse) => void;
}

export function BookingCard({
  booking,
  loading,
  paying,
  anyPaying,
  onPay,
  onRequestCancel,
  onReviewClick,
  onCreateMatchClick,
}: BookingCardProps) {
  const isSingle = booking.type === "SINGLE";
  const statusVisual = STATUS_VISUAL[booking.status];
  const StatusIcon = statusVisual.icon;
  const canCancel = canCancelBooking(booking);
  const isPending = booking.status === BookingStatus.PENDING;
  const canReview = canCreateReviewBooking(booking);
  const hasReview = canUpdateReviewBooking(booking);

  const [sessionsDialogOpen, setSessionsDialogOpen] = useState(false);

  const statusLabel = isSingle
    ? BOOKING_STATUS_LABELS[booking.status] ?? booking.status
    : RECURRING_STATUS_LABELS[booking.status] ?? booking.status;

  const sportLabel =
    SPORT_TYPE_LABELS[booking.sport_type as keyof typeof SPORT_TYPE_LABELS] ??
    booking.sport_type;

  const stubDate = isSingle
    ? new Date(booking.start_time)
    : new Date(booking.start_date);

  const handleReviewClick = () => {
    if (isSingle) {
      onReviewClick(booking as SingleBooking);
    }
  };

  const handleCreateMatchClick = () => {
    onCreateMatchClick(booking);
  };

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
        {isSingle && (canReview || hasReview) && (
          <ReviewSectionInline
            booking={booking as SingleBooking}
            canCreate={canReview}
            hasExisting={hasReview}
            onEditClick={handleReviewClick}
          />
        )}

        {/* Action buttons - always visible */}
        <div className="flex items-center gap-2 pt-2 w-full flex-wrap sm:flex-nowrap">
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
              className="flex-1"
            >
              <CreditCard data-icon="inline-start" className="mr-1.5 size-4" />
              {paying ? "Đang chuyển..." : "Thanh toán"}
            </Button>
          )}

          {isSingle &&
            (booking.status === BookingStatus.CONFIRMED ||
              booking.status === BookingStatus.COMPLETED) &&
            new Date(booking.start_time) > new Date() && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateMatchClick}
                disabled={loading || paying}
                className="flex-1 border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 flex items-center justify-center gap-1.5 font-medium"
              >
                <Trophy className="size-4 text-amber-500" />
                Tạo kèo ghép
              </Button>
            )}

          {!isSingle && booking.bookings && booking.bookings.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSessionsDialogOpen(true)}
              disabled={loading || paying}
              className="flex-1 border-primary/20 text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5 font-medium"
            >
              <RefreshCcw className="size-4" />
              Chi tiết {booking.bookings.length} buổi đặt
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestCancel}
              disabled={loading || paying}
              className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 flex items-center justify-center gap-1.5 font-medium"
            >
              <XCircle className="size-4" />
              Hủy đặt sân
            </Button>
          )}
        </div>
      </div>

      {/* For recurring bookings: Sessions List Modal */}
      {!isSingle && (
        <SessionsListDialog
          open={sessionsDialogOpen}
          onOpenChange={setSessionsDialogOpen}
          booking={booking}
          onReviewClick={onReviewClick}
          onCreateMatchClick={onCreateMatchClick}
        />
      )}
    </article>
  );
}

interface SessionsListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingResponse;
  onReviewClick: (booking: SingleBooking) => void;
  onCreateMatchClick: (booking: BookingResponse) => void;
}

function SessionsListDialog({
  open,
  onOpenChange,
  booking,
  onReviewClick,
  onCreateMatchClick,
}: SessionsListDialogProps) {
  const isSingle = booking.type === "SINGLE";
  if (isSingle) return null;

  const mockSingleBooking = (
    slot: Extract<BookingResponse, { type: "RECURRING" }>["bookings"][number]
  ): SingleBooking => ({
    type: "SINGLE",
    id: slot.id,
    start_time: slot.start_time,
    end_time: slot.end_time,
    total_price: slot.total_price,
    status: slot.status,
    complex_name: booking.complex_name,
    complex_address: booking.complex_address,
    sport_type: booking.sport_type,
    sub_field_name: booking.sub_field_name,
    expires_at: null,
    created_at: booking.created_at,
    review: slot.review,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-6 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <DialogHeader className="space-y-2 text-left shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <RefreshCcw className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Danh sách buổi đặt định kỳ
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm line-clamp-1">
                Lịch đặt định kỳ tại {booking.complex_name} · {booking.sub_field_name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-3 scrollbar-thin scrollbar-thumb-border">
          {booking.bookings.map((slot, idx) => {
            const slotIndex = booking.bookings.length - idx;
            const slotDate = new Date(slot.start_time);
            const isSlotFuture = slotDate > new Date();
            const canCreateMatch =
              isSlotFuture &&
              (slot.status === BookingStatus.CONFIRMED ||
                slot.status === BookingStatus.COMPLETED);
            const canReview =
              !isSlotFuture &&
              (slot.status === BookingStatus.CONFIRMED ||
                slot.status === BookingStatus.COMPLETED) &&
              !slot.review;
            const hasReview =
              !isSlotFuture &&
              (slot.status === BookingStatus.CONFIRMED ||
                slot.status === BookingStatus.COMPLETED) &&
              !!slot.review;

            const mockSingle = mockSingleBooking(slot);

            return (
              <div
                key={slot.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/20 transition-all text-xs"
              >
                {/* Left: Session Number + Date/Time */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">
                      Buổi #{slotIndex}
                    </span>
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        slot.status === BookingStatus.PENDING && "bg-amber-500",
                        slot.status === BookingStatus.CONFIRMED && "bg-emerald-500",
                        slot.status === BookingStatus.COMPLETED && "bg-sky-500",
                        slot.status === BookingStatus.CANCELED && "bg-rose-500",
                      )}
                    />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">
                      {BOOKING_STATUS_LABELS[slot.status] || slot.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Clock className="size-3.5 text-primary/70 shrink-0" />
                    {format(slotDate, "EEEE, dd/MM/yyyy HH:mm", { locale: vi })} –{" "}
                    {format(new Date(slot.end_time), "HH:mm")}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {canCreateMatch && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCreateMatchClick(mockSingle)}
                      className="h-8 px-3 border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-xs font-semibold gap-1.5 rounded-lg"
                    >
                      <Trophy className="size-3.5 text-amber-500" />
                      Tạo kèo ghép
                    </Button>
                  )}

                  {canReview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReviewClick(mockSingle)}
                      className="h-8 px-3 border-primary/30 text-primary hover:bg-primary/5 text-xs font-semibold gap-1.5 rounded-lg"
                    >
                      <Star className="size-3.5" />
                      Đánh giá buổi chơi
                    </Button>
                  )}

                  {hasReview && slot.review && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReviewClick(mockSingle)}
                      className="h-8 px-3 border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100/50 text-xs font-bold gap-1.5 rounded-lg"
                    >
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span>{slot.review.rating}/5 sao</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
        className="rounded-lg bg-amber-50 border border-amber-200 p-3 transition-all cursor-pointer group animate-fade-in"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="size-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-900">
              {booking.review.rating}/5 sao
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
            className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Chỉnh sửa
          </Button>
        </div>
        {showDetails && booking.review.comment && (
          <p className="text-xs text-amber-800 italic mt-2 animate-fade-in">"{booking.review.comment}"</p>
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

function ExpiresChip({ expiresAt }: { expiresAt: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] animate-pulse status-surface-warning">
      <AlarmClock className="size-3" />
      Hết hạn {format(new Date(expiresAt), "HH:mm dd/MM")}
    </span>
  );
}
