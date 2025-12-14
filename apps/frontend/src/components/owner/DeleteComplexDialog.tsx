import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete complex:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <DialogTitle>Ngừng hoạt động khu phức hợp</DialogTitle>
              <DialogDescription className="mt-1">
                Khu phức hợp sẽ không còn hiển thị với khách hàng
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn ngừng hoạt động khu phức hợp{" "}
            <span className="font-semibold text-foreground">{complexName}</span>
            ? Khu phức hợp và tất cả sân con sẽ bị ẩn và không thể đặt lịch cho
            đến khi được kích hoạt lại.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xử lý..." : "Ngừng hoạt động"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
