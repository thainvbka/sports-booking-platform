import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BookingStatus, type BookingResponse } from "@/types";
import { getBookingStatusLabel, toSingleBooking, type SingleBooking, formatDateVn } from "@/utils";
import { Clock, RefreshCcw, Star, Trophy } from "lucide-react";

interface SessionsListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingResponse;
  onReviewClick: (booking: SingleBooking) => void;
  onCreateMatchClick: (booking: BookingResponse) => void;
}

export function SessionsListDialog({
  open,
  onOpenChange,
  booking,
  onReviewClick,
  onCreateMatchClick,
}: SessionsListDialogProps) {
  const isSingle = booking.type === "SINGLE";
  if (isSingle) return null;

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
                slot.status === BookingStatus.COMPLETED) &&
              !slot.matchId;
            const canReview =
              !isSlotFuture &&
              slot.status === BookingStatus.CONFIRMED &&
              !slot.review;
            const hasReview =
              !isSlotFuture &&
              slot.status === BookingStatus.CONFIRMED &&
              !!slot.review;

            const singleBooking = toSingleBooking(slot, booking);

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
                      {getBookingStatusLabel(slot.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Clock className="size-3.5 text-primary/70 shrink-0" />
                    {formatDateVn(slot.start_time, "EEEE, dd/MM/yyyy HH:mm")} –{" "}
                    {formatDateVn(slot.end_time, "HH:mm")}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {canCreateMatch && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCreateMatchClick(singleBooking)}
                      className="h-8 px-3 border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-xs font-semibold gap-1.5 rounded-lg dark:border-amber-700/50 dark:text-amber-400 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
                    >
                      <Trophy className="size-3.5 text-amber-500" />
                      Tạo kèo
                    </Button>
                  )}

                  {canReview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReviewClick(singleBooking)}
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
                      onClick={() => onReviewClick(singleBooking)}
                      className="h-8 px-3 border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100/50 text-xs font-bold gap-1.5 rounded-lg dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50"
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
