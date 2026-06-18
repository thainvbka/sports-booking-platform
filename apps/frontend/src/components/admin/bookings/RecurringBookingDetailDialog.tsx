import {
  AdminDetailDialog,
  DetailInfoCard,
  DetailSummaryRow,
} from "@/components/admin/details/AdminDetailDialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Repeat2 } from "lucide-react";
import { formatDateVn, formatPrice, bookingStatusColor, bookingStatusLabel, sportLabel } from "@/utils";
import {
  RECURRENCE_TYPE_LABELS,
  RECURRING_STATUS_COLORS,
  RECURRING_STATUS_LABELS,
} from "@/lib/constants";
import type { AdminRecurringRow } from "@/types/admin.types";

interface RecurringBookingDetailDialogProps {
  recurring: AdminRecurringRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecurringBookingDetailDialog({
  recurring,
  open,
  onOpenChange,
}: RecurringBookingDetailDialogProps) {
  return (
    <AdminDetailDialog
      open={open}
      onOpenChange={(openVal) => {
        onOpenChange(openVal);
      }}
      title="Chi tiết nhóm đặt định kỳ"
      icon={Repeat2}
      statusLabel={
        recurring
          ? RECURRING_STATUS_LABELS[recurring.status]
          : undefined
      }
      statusClassName={
        recurring
          ? RECURRING_STATUS_COLORS[recurring.status]
          : undefined
      }
    >
      {recurring && (
        <div className="max-h-[70vh] space-y-5 overflow-y-auto bg-background p-6">
          <DetailSummaryRow
            leftLabel="Tổng chi phí nhóm"
            leftValue={
              <p className="font-display text-2xl font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatPrice(recurring.total_value)}
              </p>
            }
            rightLabel="Mã nhóm"
            rightValue={
              <p className="max-w-64 break-all font-mono text-xs font-bold text-foreground">
                {recurring.id}
              </p>
            }
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailInfoCard
              label="Khách hàng"
              value={recurring.player.account.full_name}
              helper={recurring.player.account.phone_number}
            />
            <DetailInfoCard
              label="Đơn vị sở hữu"
              value={recurring.sub_field.complex.owner.company_name}
            />
            <DetailInfoCard
              label="Khu phức hợp"
              value={recurring.sub_field.complex.complex_name}
              helper={`${recurring.sub_field.sub_field_name} · ${sportLabel(recurring.sub_field.sport_type)}`}
            />
            <DetailInfoCard
              label="Chu kỳ"
              value={
                RECURRENCE_TYPE_LABELS[recurring.recurrence_type] ??
                recurring.recurrence_type
              }
            />
            <DetailInfoCard
              label="Thời gian nhóm"
              value={`${formatDateVn(recurring.start_date)} → ${formatDateVn(recurring.end_date)}`}
            />
            <DetailInfoCard
              label="Tổng số buổi"
              value={`${recurring.child_count} buổi`}
            />
          </div>

          {recurring.bookings.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Danh sách buổi ({recurring.bookings.length})
              </p>
              <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                {recurring.bookings.map((b, idx) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="w-4 shrink-0 text-right text-[9px] font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-[11px] font-semibold text-foreground">
                          {formatDateVn(b.start_time, "EEEE dd/MM/yyyy")}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="size-2.5" />
                          {formatDateVn(b.start_time, "HH:mm")} –{" "}
                          {formatDateVn(b.end_time, "HH:mm")}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        className={`${bookingStatusColor(b.status)} h-4 border-none py-0 text-[9px] shadow-none`}
                      >
                        {bookingStatusLabel(b.status)}
                      </Badge>
                      <span className="text-[11px] font-bold tabular-nums text-foreground">
                        {formatPrice(Number(b.total_price))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(recurring.status_breakdown).length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Tổng hợp:
              </span>
              {Object.entries(recurring.status_breakdown).map(
                ([status, count]) => (
                  <Badge
                    key={status}
                    className={`${bookingStatusColor(status)} h-4 border-none py-0 text-[9px] shadow-none`}
                  >
                    {bookingStatusLabel(status)}: {count}
                  </Badge>
                ),
              )}
            </div>
          )}
        </div>
      )}
    </AdminDetailDialog>
  );
}
