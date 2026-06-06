import { ConfirmActionDialog } from "@/components/shared/dialogs/ConfirmActionDialog";
import { AlertTriangle, Building2, PowerOff } from "lucide-react";

interface DeleteComplexDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complexName: string;
  onConfirm: () => Promise<void>;
}

export function DeleteComplexDialog({
  open,
  onOpenChange,
  complexName,
  onConfirm,
}: DeleteComplexDialogProps) {
  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Ngừng hoạt động khu phức hợp"
      description="Khu phức hợp sẽ không còn hiển thị với khách hàng."
      badgeText="Cảnh báo"
      confirmText="Ngừng hoạt động"
      confirmingText="Đang xử lý…"
      onConfirm={onConfirm}
      icon={PowerOff}
      badgeIcon={AlertTriangle}
      alertIcon={Building2}
      confirmIcon={PowerOff}
      alertText={
        <>
          Bạn có chắc chắn muốn ngừng hoạt động{" "}
          <span className="font-semibold">{complexName}</span>? Khu phức hợp
          và tất cả sân con sẽ bị ẩn, không thể đặt lịch cho đến khi được
          kích hoạt lại.
        </>
      }
    />
  );
}
