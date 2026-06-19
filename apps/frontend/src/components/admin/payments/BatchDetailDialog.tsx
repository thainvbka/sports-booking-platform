import {
  AdminDetailDialog,
  DetailInfoCard,
  DetailSummaryRow,
} from "@/components/admin/details/AdminDetailDialog";
import { PAYOUT_STATUS_COLORS, PAYOUT_STATUS_LABELS } from "@/constants";
import type { AdminPayoutBatchRecord } from "@/services/payout.service";
import { formatDateVn, formatPrice, getBankDisplayName } from "@/utils";
import { Receipt } from "lucide-react";
import { BatchActionButtons } from "./BatchActionButtons";
import { VietQRGenerator } from "./VietQRGenerator";

interface BatchDetailDialogProps {
  batch: AdminPayoutBatchRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onProcess: (id: string) => void;
  onApprove: () => void;
  onCancel: () => void;
}

export function BatchDetailDialog({
  batch,
  open,
  onOpenChange,
  isSubmitting,
  onProcess,
  onApprove,
  onCancel,
}: BatchDetailDialogProps) {
  return (
    <AdminDetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết Đợt Quyết toán"
      icon={Receipt}
      statusLabel={
        batch
          ? PAYOUT_STATUS_LABELS[batch.status]
          : undefined
      }
      statusClassName={
        batch
          ? PAYOUT_STATUS_COLORS[batch.status]
          : undefined
      }
    >
      {batch && (
        <div className="max-h-[75vh] space-y-5 overflow-y-auto bg-background p-5 text-xs">
          <DetailSummaryRow
            leftLabel="Chủ sân (Owner)"
            leftValue={
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-foreground">
                  {batch.owner?.company_name || "N/A"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {batch.owner?.account?.email}
                </span>
              </div>
            }
            rightLabel="Số tiền quyết toán"
            rightValue={
              <span className="font-display text-lg font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatPrice(Number(batch.total_payout))}
              </span>
            }
          />

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Thông tin Tài khoản Thụ hưởng
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailInfoCard
                label="Ngân hàng"
                value={getBankDisplayName(batch.owner?.bank_name || "")}
              />
              <DetailInfoCard
                label="Số tài khoản"
                value={
                  <span className="font-mono font-bold text-primary">
                    {batch.owner?.bank_account_number || "N/A"}
                  </span>
                }
              />
              <DetailInfoCard
                label="Họ và tên thụ hưởng"
                value={batch.owner?.bank_account_name || "N/A"}
              />
              {batch.owner?.bank_branch && (
                <DetailInfoCard
                  label="Chi nhánh"
                  value={batch.owner.bank_branch}
                />
              )}
            </div>
          </div>

          <VietQRGenerator batch={batch} />

          {batch.status === "PAID" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Chứng từ thanh toán
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailInfoCard
                  label="Mã giao dịch đối soát"
                  value={
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {batch.transaction_ref}
                    </span>
                  }
                />
                <DetailInfoCard
                  label="Thời gian hoàn thành chi"
                  value={
                    batch.paid_at
                      ? formatDateVn(batch.paid_at, "HH:mm · dd/MM/yyyy")
                      : "N/A"
                  }
                />
              </div>
              {batch.note && (
                <DetailInfoCard
                  label="Ghi chú đối soát"
                  value={
                    <p className="text-xs italic leading-relaxed text-muted-foreground">
                      {batch.note}
                    </p>
                  }
                />
              )}
            </div>
          )}

          <BatchActionButtons
            batch={batch}
            isSubmitting={isSubmitting}
            onProcess={onProcess}
            onApprove={onApprove}
            onCancel={onCancel}
            onClose={() => onOpenChange(false)}
          />
        </div>
      )}
    </AdminDetailDialog>
  );
}
