import { ConfirmActionDialog } from "@/components/shared/dialogs/ConfirmActionDialog";
import { AlertCircle, Clock, Trash2 } from "lucide-react";

interface DeletePricingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeRange: string;
  onConfirm: () => Promise<void>;
}

export function DeletePricingRuleDialog({
  open,
  onOpenChange,
  timeRange,
  onConfirm,
}: DeletePricingRuleDialogProps) {
  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xóa khung giờ này?"
      description="Hành động này không thể hoàn tác."
      badgeText="Pricing · Xóa khung giờ"
      confirmText="Xóa khung giờ"
      confirmingText="Đang xóa…"
      onConfirm={onConfirm}
      icon={Trash2}
      badgeIcon={AlertCircle}
      alertIcon={AlertCircle}
      confirmIcon={Trash2}
      alertText="Khách hàng sẽ không thể đặt lịch trong khung giờ này cho đến khi bạn tạo lại rule mới."
    >
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
        <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground">
          <Clock className="size-4" />
        </span>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Khung giờ
          </span>
          <span className="font-display text-base font-bold italic tabular-nums text-foreground">
            {timeRange}
          </span>
        </div>
      </div>
    </ConfirmActionDialog>
  );
}
