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
import { AlertCircle, RotateCcw } from "lucide-react";

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
  const [isReactivating, setIsReactivating] = useState(false);

  const handleConfirm = async () => {
    setIsReactivating(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to reactivate complex:", error);
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <RotateCcw className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle>Kích hoạt lại khu phức hợp</DialogTitle>
              <DialogDescription className="mt-1">
                Khu phức hợp sẽ hiển thị trở lại với khách hàng
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-4">
          <div className="flex items-start gap-2 rounded-md bg-green-50 p-3">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn kích hoạt lại khu phức hợp{" "}
              <span className="font-semibold text-foreground">
                {complexName}
              </span>
              ? Khu phức hợp và tất cả sân con sẽ được kích hoạt và khách hàng
              có thể đặt lịch trở lại.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isReactivating}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isReactivating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isReactivating ? "Đang xử lý..." : "Kích hoạt lại"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
