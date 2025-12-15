import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete pricing rule:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Xóa khung giờ</DialogTitle>
              <DialogDescription className="mt-1">
                Hành động này không thể hoàn tác
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-4">
          <div className="flex items-start gap-2 rounded-md bg-red-50 p-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa khung giờ{" "}
              <span className="font-semibold text-foreground">{timeRange}</span>
              ? Khách hàng sẽ không thể đặt lịch trong khung giờ này nữa.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa khung giờ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
