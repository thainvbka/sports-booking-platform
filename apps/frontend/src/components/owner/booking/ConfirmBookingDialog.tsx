import { ConfirmActionDialog } from "@/components/shared/dialogs/ConfirmActionDialog";
import { CheckCircle2 } from "lucide-react";

interface ConfirmBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function ConfirmBookingDialog({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmBookingDialogProps) {
  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xác nhận đặt sân"
      description="Yêu cầu xác nhận lịch đặt sân đã chọn."
      badgeText="Xác nhận"
      confirmText="Xác nhận"
      confirmingText="Đang xử lý…"
      onConfirm={onConfirm}
      icon={CheckCircle2}
      badgeIcon={CheckCircle2}
      alertIcon={CheckCircle2}
      confirmIcon={CheckCircle2}
      variant="success"
      alertText="Bạn có chắc chắn muốn xác nhận lịch đặt sân này? Khách hàng sẽ nhận được thông báo ngay."
    />
  );
}
