import {
  AdminDetailDialog,
  DetailInfoCard,
  DetailSummaryRow,
} from "@/components/admin/details/AdminDetailDialog";
import { PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import type { AdminPayment } from "@/types/admin.types";
import { formatDateVn, formatPrice } from "@/utils";
import { Receipt } from "lucide-react";
import { LinkedBookingsList } from "./LinkedBookingsList";

interface PaymentDetailDialogProps {
  payment: AdminPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailDialog({
  payment,
  open,
  onOpenChange,
}: PaymentDetailDialogProps) {
  const linkedBookings = payment?.bookings || [];

  return (
    <AdminDetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết giao dịch"
      icon={Receipt}
      statusLabel={
        payment
          ? PAYMENT_STATUS_LABELS[payment.status]
          : undefined
      }
      statusClassName={
        payment
          ? PAYMENT_STATUS_COLORS[payment.status]
          : undefined
      }
    >
      {payment && (
        <div className="max-h-[70vh] space-y-6 overflow-y-auto bg-background p-6">
          <DetailSummaryRow
            leftLabel="Tổng số tiền"
            leftValue={
              <p className="font-display text-2xl font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatPrice(Number(payment.amount))}
              </p>
            }
            rightLabel="Mã giao dịch"
            rightValue={
              <p className="max-w-64 break-all font-mono text-xs font-bold text-foreground">
                {payment.transaction_code}
              </p>
            }
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailInfoCard
              label="Khách hàng"
              value={linkedBookings[0]?.player?.account?.full_name || "N/A"}
            />
            <DetailInfoCard
              label="Phương thức"
              value={payment.provider}
            />
            <DetailInfoCard
              label="Thời gian giao dịch"
              value={formatDateVn(
                payment.created_at,
                "HH:mm · dd/MM/yyyy",
              )}
            />
            <DetailInfoCard
              label="Số lượt đặt liên kết"
              value={linkedBookings.length}
            />
          </div>

          <LinkedBookingsList bookings={linkedBookings} />
        </div>
      )}
    </AdminDetailDialog>
  );
}
