import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  MapPin,
  Phone,
  User,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSportTypeLabel, formatPrice } from "@/services/mockData";
import type { OwnerBooking, BookingStatus } from "@/types";

interface OwnerBookingDetailDialogProps {
  booking: OwnerBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
}

const getStatusConfig = (status: BookingStatus) => {
  switch (status) {
    case "PENDING":
      return {
        label: "Chưa thanh toán",
        className: "bg-yellow-100 text-yellow-700 border-none",
      };
    case "CONFIRMED":
      return {
        label: "Đã xác nhận",
        className: "bg-green-100 text-green-700 border-none",
      };
    case "CANCELED":
      return {
        label: "Đã hủy",
        className: "bg-red-100 text-red-700 border-none",
      };
    case "COMPLETED":
      return {
        label: "Đã thanh toán",
        className: "bg-blue-100 text-blue-700 border-none",
      };
    default:
      return {
        label: status,
        className: "bg-gray-100 text-gray-700 border-none",
      };
  }
};

export function OwnerBookingDetailDialog({
  booking,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: OwnerBookingDetailDialogProps) {
  if (!booking) return null;

  const statusConfig = getStatusConfig(booking.status);
  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);

  const canConfirm = booking.status === "COMPLETED";
  const canCancel =
    booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        {/* CONTENT */}
        <div className="px-6 py-5 space-y-5">
          {/* HEADER */}
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                Chi tiết đặt sân
              </DialogTitle>
              <Badge
                className={`text-xs px-2 mr-2 py-0.5 rounded-full ${statusConfig.className}`}
              >
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              #{booking.id.slice(0, 8)}
            </p>
          </DialogHeader>

          {/* TIME */}
          <div className="flex items-start gap-3">
            <CalendarIcon className="w-5 h-5 text-primary mt-1" />
            <div>
              <div className="font-medium text-base">
                {format(startTime, "HH:mm", { locale: vi })} –{" "}
                {format(endTime, "HH:mm", { locale: vi })}
              </div>
              <p className="text-sm text-muted-foreground">
                {format(startTime, "EEEE, dd 'tháng' MM, yyyy", {
                  locale: vi,
                })}
              </p>
            </div>
          </div>

          <Separator />

          {/* CUSTOMER */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Khách hàng
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {booking.player.account.full_name}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  {booking.player.account.phone_number}
                </div>
              </div>
            </div>
          </div>

          {/* VENUE */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Địa điểm
            </h4>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
              <div className="space-y-0.5 flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">
                    {booking.sub_field.complex.complex_name}
                  </p>
                  <Badge variant="outline" className="text-[10px] h-5">
                    {getSportTypeLabel(booking.sub_field.sport_type)}
                  </Badge>
                </div>
                <p className="text-sm">{booking.sub_field.sub_field_name}</p>
                <p className="text-xs text-muted-foreground">
                  {booking.sub_field.complex.complex_address}
                </p>
              </div>
            </div>
          </div>

          {/* PRICE */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              Tổng tiền
            </div>
            <span className="text-lg font-bold text-primary">
              {formatPrice(booking.total_price)}
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-3 border-t flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>

          {canCancel && onCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(booking.id)}
            >
              <XCircle className="w-4 h-4 mr-1" /> Hủy
            </Button>
          )}

          {canConfirm && onConfirm && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onConfirm(booking.id)}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Xác nhận
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
