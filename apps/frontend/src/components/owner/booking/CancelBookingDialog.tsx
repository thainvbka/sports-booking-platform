import { ConfirmActionDialog } from "@/components/shared/dialogs/ConfirmActionDialog";
import { AlertTriangle, Ban } from "lucide-react";

interface CancelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function CancelBookingDialog({
  open,
  onOpenChange,
  onConfirm,
}: CancelBookingDialogProps) {
  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Hủy đặt sân"
      description="Yêu cầu hủy đặt sân đã chọn."
      badgeText="Hủy lịch"
      confirmText="Hủy đặt sân"
      confirmingText="Đang xử lý…"
      onConfirm={onConfirm}
      icon={Ban}
      badgeIcon={AlertTriangle}
      alertIcon={Ban}
      confirmIcon={Ban}
      alertText="Bạn có chắc chắn muốn hủy lịch đặt sân này? Hành động không thể hoàn tác."
    />
  );
}
