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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete subfield:", error);
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
              <DialogTitle>Xóa sân con</DialogTitle>
              <DialogDescription className="mt-1">
                Hành động này không thể hoàn tác
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa sân con{" "}
            <span className="font-semibold text-foreground">
              {subfieldName}
            </span>
            ? Tất cả dữ liệu liên quan bao gồm bảng giá và lịch đặt sẽ bị xóa.
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
            {isDeleting ? "Đang xóa..." : "Xóa sân con"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
