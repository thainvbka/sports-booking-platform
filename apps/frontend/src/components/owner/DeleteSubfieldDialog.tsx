import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CircleDot, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

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
      <DialogContent className="overflow-hidden p-0 sm:max-w-[26rem]">
        <div
          aria-hidden
          className="h-1 w-full bg-gradient-to-r from-rose-500 via-destructive to-rose-500"
        />

        <div className="flex flex-col gap-4 px-6 py-5">
          <DialogHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Badge
                  variant="outline"
                  className="h-5 w-fit gap-1 rounded-full border-destructive/30 bg-destructive/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-destructive"
                >
                  <AlertTriangle className="size-2.5" />
                  Không thể hoàn tác
                </Badge>
                <DialogTitle className="font-display text-lg font-black italic tracking-tight">
                  Xóa sân con
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Alert className="border-destructive/25 bg-destructive/5">
            <CircleDot className="size-4 text-destructive" />
            <AlertDescription className="text-[13px] leading-relaxed text-foreground">
              Xóa sân con{" "}
              <span className="font-semibold">{subfieldName}</span>? Bảng giá,
              lịch đặt và lịch sử vận hành sẽ bị xóa khỏi hệ thống.
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="rounded-full"
            >
              {isDeleting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Đang xóa…
                </>
              ) : (
                <>
                  <Trash2 data-icon="inline-start" />
                  Xóa sân con
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
