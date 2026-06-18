import {
  AdminDetailDialog,
  DetailInfoCard,
  DetailSummaryRow,
} from "@/components/admin/details/AdminDetailDialog";
import { Tag } from "lucide-react";
import { formatDateVn, formatPrice, bookingStatusColor, bookingStatusLabel, sportLabel } from "@/utils";
import type { AdminBookingRow } from "@/types/admin.types";

interface SingleBookingDetailDialogProps {
  booking: AdminBookingRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SingleBookingDetailDialog({
  booking,
  open,
  onOpenChange,
}: SingleBookingDetailDialogProps) {
  return (
    <AdminDetailDialog
      open={open}
      onOpenChange={(openVal) => {
        onOpenChange(openVal);
      }}
      title="Chi tiết lượt đặt sân"
      icon={Tag}
      statusLabel={
        booking
          ? bookingStatusLabel(booking.status)
          : undefined
      }
      statusClassName={
        booking
          ? bookingStatusColor(booking.status)
          : undefined
      }
    >
      {booking && (
        <div className="max-h-[70vh] space-y-5 overflow-y-auto bg-background p-6">
          <DetailSummaryRow
            leftLabel="Tổng chi phí"
            leftValue={
              <p className="font-display text-2xl font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatPrice(Number(booking.total_price))}
              </p>
            }
            rightLabel="Mã đặt sân"
            rightValue={
              <p className="max-w-64 break-all font-mono text-xs font-bold text-foreground">
                {booking.id}
              </p>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailInfoCard
              label="Khách hàng"
              value={booking.player.account.full_name}
              helper={booking.player.account.phone_number}
            />
            <DetailInfoCard
              label="Đơn vị sở hữu"
              value={booking.sub_field.complex.owner.company_name}
            />
            <DetailInfoCard
              label="Khu phức hợp"
              value={booking.sub_field.complex.complex_name}
              helper={`${booking.sub_field.sub_field_name} · ${sportLabel(booking.sub_field.sport_type)}`}
            />
            <DetailInfoCard
              label="Thời gian"
              value={formatDateVn(
                booking.start_time,
                "HH:mm – dd/MM/yyyy",
              )}
              helper={`Kết thúc: ${formatDateVn(booking.end_time, "HH:mm")}`}
            />
            <DetailInfoCard
              label="Ghi nhận hệ thống"
              value={formatDateVn(
                booking.created_at,
                "HH:mm dd/MM/yyyy",
              )}
            />
          </div>
        </div>
      )}
    </AdminDetailDialog>
  );
}
