import { ConfirmActionDialog } from "@/components/shared/dialogs/ConfirmActionDialog";
import { Power, RotateCcw, Sparkles } from "lucide-react";

interface ReactivateComplexDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complexName: string;
  onConfirm: () => Promise<void>;
}

export function ReactivateComplexDialog({
  open,
  onOpenChange,
  complexName,
  onConfirm,
}: ReactivateComplexDialogProps) {
  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Kích hoạt lại khu phức hợp"
      description="Khu phức hợp sẽ hiển thị trở lại với khách hàng."
      confirmText="Kích hoạt lại"
      confirmingText="Đang xử lý…"
      onConfirm={onConfirm}
      icon={RotateCcw}
      alertIcon={Sparkles}
      confirmIcon={Power}
      variant="success"
      alertText={
        <>
          Bật trở lại <span className="font-semibold">{complexName}</span>?
          Tất cả sân con sẽ được mở lại và khách hàng có thể đặt lịch ngay.
        </>
      }
    />
  );
}
