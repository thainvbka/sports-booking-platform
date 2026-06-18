import { ConfirmActionDialog } from "@/components/shared/dialogs/ConfirmActionDialog";

interface DeleteBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  onConfirm: () => Promise<void> | void;
}

export function DeleteBookingDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteBookingDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Hủy lượt đặt sân"
      description="Bạn có chắc chắn muốn hủy lượt đặt sân này không?"
      alertText="Lượt đặt sân sẽ bị hủy và không thể khôi phục lại"
      confirmText="Hủy đặt sân"
      onConfirm={handleConfirm}
      variant="destructive"
    />
  );
}


