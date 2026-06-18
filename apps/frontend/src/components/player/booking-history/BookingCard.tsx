import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookingStatus,
  type BookingResponse,
} from "@/types";
import {
  canCancelBooking,
  canCreateReviewBooking,
  canUpdateReviewBooking,
  formatPrice,
  getBookingStatusLabel,
  getRecurringStatusLabel,
  getSportTypeLabel,
  type SingleBooking,
} from "@/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  CreditCard,
  MapPin,
  RefreshCcw,
  Ticket,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { ExpiresChip } from "./ExpiresChip";
import { ReviewSectionInline } from "./ReviewSectionInline";
import { SessionsListDialog } from "./SessionsListDialog";

export type { SingleBooking } from "@/utils";

const STATUS_VISUAL: Record<
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
    className: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-700/50 dark:bg-sky-950/40 dark:text-sky-300",
  },
  [BookingStatus.CANCELED]: {
    icon: XCircle,
    className: "status-surface-error",
  },
};


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
    ? getBookingStatusLabel(booking.status)
    : getRecurringStatusLabel(booking.status);

  const sportLabel = getSportTypeLabel(booking.sport_type);

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
        isPending && "ring-1 ring-amber-300/50 dark:ring-amber-700/40",
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
            new Date(booking.start_time) > new Date() &&
            !booking.matchId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateMatchClick}
                disabled={loading || paying}
                className="flex-1 border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 flex items-center justify-center gap-1.5 font-medium dark:border-amber-700/50 dark:text-amber-400 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
              >
                <Trophy className="size-4 text-amber-500" />
                Tạo kèo
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
              className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 flex items-center justify-center gap-1.5 font-medium dark:border-rose-700/50 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
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
