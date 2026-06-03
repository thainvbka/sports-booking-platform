import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    RECURRENCE_TYPE_LABELS,
} from "@/lib/constants";
import { type BookingResponse, BookingStatus } from "@/types";
import {
  formatPrice,
  formatDateVn,
  getBookingStatusColor,
  getBookingStatusLabel,
  getRecurringStatusColor,
  getRecurringStatusLabel,
  getSportTypeLabel,
} from "@/utils";
import { format } from "date-fns";
import { Clock, MapPin, Sparkles, Star } from "lucide-react";

interface BookingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingResponse | null;
  onReviewClick?: () => void;
  canCreateReview?: boolean;
  canUpdateReview?: boolean;
}




export function BookingDetailDialog({
  open,
  onOpenChange,
  booking,
  onReviewClick,
  canCreateReview,
  canUpdateReview,
}: BookingDetailDialogProps) {
  if (!booking) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Chi tiết đặt sân
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{booking.complex_name}</h3>
              <Badge
                className={
                  booking.type === "SINGLE"
                    ? getBookingStatusColor(booking.status, "bg-gray-100 text-gray-800")
                    : getRecurringStatusColor(booking.status, "bg-gray-100 text-gray-800")
                }
              >
                {booking.type === "SINGLE"
                  ? getBookingStatusLabel(booking.status, booking.status)
                  : getRecurringStatusLabel(booking.status, booking.status)}
              </Badge>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{booking.sub_field_name}</span>
                <span>•</span>
                <span>{getSportTypeLabel(booking.sport_type)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{booking.complex_address}</span>
              </div>
              {booking.type === "RECURRING" && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {RECURRENCE_TYPE_LABELS[booking.recurrence_type] ||
                      booking.recurrence_type}
                  </span>
                  <span>•</span>
                  <span>
                    {formatDateVn(booking.start_date)} -{" "}
                    {formatDateVn(booking.end_date)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {booking.type === "SINGLE" && (
            <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">
                    Thời gian đặt sân
                  </p>
                  <div className="font-semibold text-base">
                    {formatDateVn(booking.start_time, "EEEE, dd/MM/yyyy")}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {format(new Date(booking.start_time), "HH:mm")} -{" "}
                      {format(new Date(booking.end_time), "HH:mm")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Tổng tiền
                  </p>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(booking.total_price)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {booking.type === "RECURRING" && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <div>
                <p className="text-sm text-muted-foreground">Tổng số buổi</p>
                <p className="text-lg font-bold">{booking.total_slots} buổi</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng tiền</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(booking.total_price)}
                </p>
              </div>
            </div>
          )}

          {booking.type === "RECURRING" && (
            <h4 className="font-semibold mb-3">Danh sách các buổi đã đặt</h4>
          )}

          {booking.type === "RECURRING" && (
            <div className="space-y-2 max-h-75 overflow-y-auto">
              {booking.bookings.map((slot, idx) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium">
                        {formatDateVn(slot.start_time, "EEEE, dd/MM/yyyy")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(slot.start_time), "HH:mm")} -{" "}
                        {format(new Date(slot.end_time), "HH:mm")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      {formatPrice(slot.total_price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {booking.type === "SINGLE" && booking.status === BookingStatus.CONFIRMED && (canCreateReview || canUpdateReview) && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base mb-1">Đánh giá sân</h3>
                  <p className="text-sm text-muted-foreground">
                    {canCreateReview ? "Chia sẻ trải nghiệm của bạn" : "Xem hoặc cập nhật đánh giá"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={canUpdateReview ? "outline" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReviewClick?.();
                  }}
                >
                  {canCreateReview ? (
                    <>
                      <Star className="w-4 h-4 mr-1" />
                      Viết đánh giá
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Xem/Cập nhật
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}