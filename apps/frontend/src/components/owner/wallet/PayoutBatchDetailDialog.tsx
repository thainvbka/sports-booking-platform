import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatPrice, formatDateVn } from "@/utils";

import type { PayoutBatchRecord } from "@/types";
import type { LucideIcon } from "lucide-react";

interface PayoutBatchDetailDialogProps {
  batch: PayoutBatchRecord;
  tone: { bg: string; border: string; label: string; icon: LucideIcon };
}

export function PayoutBatchDetailDialog({
  batch,
  tone,
}: PayoutBatchDetailDialogProps) {
  const StatusIcon = tone.icon;

  return (
    <DialogContent className="max-w-md rounded-2xl border border-border/60 shadow-lg">
      <DialogHeader>
        <DialogTitle className="text-base font-bold text-foreground">
          Đợt Chi trả Chi tiết
        </DialogTitle>
        <DialogDescription className="text-xs">
          Mã đợt chi: {batch.id}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 pt-2">
        <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nội dung đợt:</span>
            <span className="font-semibold text-foreground">
              {batch.payout_period}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tổng số tiền nhận:</span>
            <span className="font-bold text-primary font-display italic text-sm">
              {formatPrice(Number(batch.total_payout))}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Trạng thái đợt chi:</span>
            <Badge
              variant="outline"
              className={cn(
                "h-5 gap-1 rounded-full px-2 text-[9px] font-semibold uppercase tracking-wider",
                tone.bg,
                tone.border,
              )}
            >
              <StatusIcon className="size-2.5 shrink-0" />
              {tone.label}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Thời gian tạo yêu cầu:</span>
            <span className="text-foreground">
              {formatDateVn(batch.created_at, "HH:mm dd/MM/yyyy")}
            </span>
          </div>
          {batch.paid_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thời gian hoàn tất chi:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {formatDateVn(batch.paid_at, "HH:mm dd/MM/yyyy")}
              </span>
            </div>
          )}
        </div>

        {(batch.transaction_ref || batch.note) && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground/90">
              Chứng từ Quyết toán từ Admin
            </h4>
            <div className="rounded-xl border border-border bg-background p-3.5 space-y-2 text-xs">
              {batch.transaction_ref && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã giao dịch ngân hàng:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {batch.transaction_ref}
                  </span>
                </div>
              )}
              {batch.note && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Ghi chú phản hồi:</span>
                  <p className="bg-muted/35 p-2.5 rounded-lg text-[11px] text-muted-foreground italic leading-normal border border-border/40">
                    {batch.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="pt-2">
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-full text-xs font-semibold px-4"
          >
            Đóng lại
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
