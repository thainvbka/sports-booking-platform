import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  MapPin,
  User,
  Calendar,
  Clock,
  ChevronRight, // Vẫn giữ icon để trang trí cho nút
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSportTypeLabel, formatPrice } from "@/services/mockData";
import type { OwnerBooking, BookingStatus } from "@/types";

interface OwnerBookingCardProps {
  booking: OwnerBooking;
  onViewDetail: (booking: OwnerBooking) => void;
  onConfirm?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
}

const getStatusConfig = (status: BookingStatus) => {
  switch (status) {
    case "PENDING":
      return {
        label: "Chưa thanh toán",
        className: "text-yellow-700 bg-yellow-50 border-yellow-200",
      };
    case "CONFIRMED":
      return {
        label: "Đã xác nhận",
        className: "text-green-700 bg-green-50 border-green-200",
      };
    case "CANCELED":
      return {
        label: "Hủy",
        className: "text-gray-500 bg-gray-50 border-gray-200",
      };
    case "COMPLETED":
      return {
        label: "Đã thanh toán",
        className: "text-blue-700 bg-blue-50 border-blue-200",
      };
    default:
      return {
        label: status,
        className: "text-gray-700 bg-gray-50 border-gray-200",
      };
  }
};

export function OwnerBookingCard({
  booking,
  onViewDetail,
  onConfirm,
  onCancel,
}: OwnerBookingCardProps) {
  const statusConfig = getStatusConfig(booking.status);
  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);

  const canConfirm = booking.status === "COMPLETED";
  const canCancel =
    booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <Card className="group relative overflow-hidden border border-border/60 hover:border-primary/40 transition-all bg-card rounded-lg mb-2 shadow-sm hover:shadow-md">
      {/* Status Bar Indicator (Cột màu trạng thái bên trái) */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
          booking.status === "CONFIRMED"
            ? "bg-green-500"
            : booking.status === "PENDING"
            ? "bg-yellow-500"
            : booking.status === "CANCELED"
            ? "bg-gray-300"
            : "bg-blue-500"
        }`}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-3 pl-4 gap-3 sm:gap-4">
        {/* BLOCK 1: Date & Time (Gọn gàng, rõ ràng) */}
        <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center sm:w-32 shrink-0 gap-2">
          {/* Ngày */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold uppercase">
              {format(startTime, "dd/MM", { locale: vi })}
            </span>
          </div>

          {/* Giờ: Hiển thị cả khung giờ Start - End */}
          <div className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded border border-border/50">
            <Clock className="w-3.5 h-3.5 text-primary sm:hidden" />
            <span className="text-sm sm:text-base font-bold text-foreground font-mono tracking-tight">
              {format(startTime, "HH:mm", { locale: vi })} -{" "}
              {format(endTime, "HH:mm", { locale: vi })}
            </span>
          </div>
        </div>

        {/* Separator mobile */}
        <div className="h-px w-full bg-border/50 sm:hidden" />

        {/* BLOCK 2: Main Info (Sân & Khách) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 items-center">
          {/* Field Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="px-1.5 py-0 h-5 text-[10px] font-normal border-border/50"
              >
                {getSportTypeLabel(booking.sub_field.sport_type)}
              </Badge>
              <h4 className="font-semibold text-sm truncate text-foreground">
                {booking.sub_field.complex.complex_name}
              </h4>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{booking.sub_field.sub_field_name}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="flex items-center gap-2 md:border-l md:pl-3 border-border/50 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">
                {booking.player.account.full_name}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {booking.player.account.phone_number}
              </span>
            </div>
          </div>
        </div>

        {/* BLOCK 3: Price & Actions */}
        <div className="flex flex-row sm:flex-col md:flex-row items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
          {/* Price & Status */}
          <div className="flex flex-col items-start md:items-end gap-0.5 mr-2">
            <span className="font-bold text-sm text-primary">
              {formatPrice(booking.total_price)}
            </span>
            <Badge
              variant="outline"
              className={`${statusConfig.className} px-1.5 py-0 text-[10px] h-4 leading-none`}
            >
              {statusConfig.label}
            </Badge>
          </div>

          {/* Actions Buttons */}
          <div className="flex items-center gap-2">
            {/* Nút Chi Tiết hiện chữ rõ ràng */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => onViewDetail(booking)}
            >
              Chi tiết
            </Button>

            {/* Các nút hành động chính */}
            {(canConfirm || canCancel) && (
              <div className="flex items-center gap-2">
                {canCancel && onCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onCancel(booking.id)}
                  >
                    Hủy
                  </Button>
                )}
                {canConfirm && onConfirm && (
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    onClick={() => onConfirm(booking.id)}
                  >
                    Duyệt
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
