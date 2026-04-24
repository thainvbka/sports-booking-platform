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
import { Loader2, Power, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";

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
      <DialogContent className="overflow-hidden p-0 sm:max-w-[26rem]">
        <div
          aria-hidden
          className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500"
        />

        <div className="flex flex-col gap-4 px-6 py-5">
          <DialogHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100 text-emerald-600">
                <RotateCcw className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Badge
                  variant="outline"
                  className="h-5 w-fit gap-1 rounded-full border-emerald-300/50 bg-emerald-100 px-2 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-emerald-700"
                >
                  <span className="relative inline-flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Go live
                </Badge>
                <DialogTitle className="font-display text-lg font-black italic tracking-tight">
                  Kích hoạt lại khu phức hợp
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Khu phức hợp sẽ hiển thị trở lại với khách hàng.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Alert className="border-emerald-200 bg-emerald-50">
            <Sparkles className="size-4 text-emerald-600" />
            <AlertDescription className="text-[13px] leading-relaxed text-foreground">
              Bật trở lại <span className="font-semibold">{complexName}</span>?
              Tất cả sân con sẽ được mở lại và khách hàng có thể đặt lịch ngay.
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isReactivating}
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isReactivating}
              className="rounded-full bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500"
            >
              {isReactivating ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Đang xử lý…
                </>
              ) : (
                <>
                  <Power data-icon="inline-start" />
                  Kích hoạt lại
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
