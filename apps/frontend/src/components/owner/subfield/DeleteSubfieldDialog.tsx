import { ConfirmActionDialog } from "@/components/shared/dialogs/ConfirmActionDialog";
import { AlertTriangle, CircleDot, Trash2 } from "lucide-react";

interface DeleteSubfieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subfieldName: string;
  onConfirm: () => Promise<void>;
}

export function DeleteSubfieldDialog({
  open,
  onOpenChange,
  subfieldName,
  onConfirm,
}: DeleteSubfieldDialogProps) {
  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xóa sân con"
      description="Toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn."
      badgeText="Không thể hoàn tác"
      confirmText="Xóa sân con"
      confirmingText="Đang xóa…"
      onConfirm={onConfirm}
      icon={Trash2}
      badgeIcon={AlertTriangle}
      alertIcon={CircleDot}
      confirmIcon={Trash2}
      alertText={
        <>
          Xóa sân con <span className="font-semibold">{subfieldName}</span>?
          Bảng giá, lịch đặt và lịch sử vận hành sẽ bị xóa khỏi hệ thống.
        </>
      }
    />
  );
}
