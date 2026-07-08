import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminPayoutBatchRecord } from "@/types";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

interface BatchActionButtonsProps {
  batch: AdminPayoutBatchRecord;
  isSubmitting: boolean;
  onProcess: (id: string) => void;
  onApprove: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export function BatchActionButtons({
  batch,
  isSubmitting,
  onProcess,
  onApprove,
  onCancel,
  onClose,
}: BatchActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 pt-2 justify-end border-t border-border mt-4">
      {batch.status === "REQUESTED" && (
        <Button
          onClick={() => onProcess(batch.id)}
          disabled={isSubmitting}
          className="h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
        >
          <RefreshCw className={cn("size-3 mr-1", isSubmitting && "animate-spin")} />
          Bắt đầu Xử lý đợt chi
        </Button>
      )}

      {(batch.status === "REQUESTED" || batch.status === "PROCESSING") && (
        <>
          <Button
            onClick={onApprove}
            className="h-8 rounded-full bg-green-600 hover:bg-green-500 text-xs font-semibold text-white transition-colors"
          >
            <CheckCircle2 className="size-3 mr-1" />
            Xác nhận Đã chuyển khoản
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="h-8 rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold px-3 transition-colors dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          >
            <XCircle className="size-3 mr-1" />
            Từ chối chi trả
          </Button>
        </>
      )}
      <Button
        variant="outline"
        onClick={onClose}
        className="h-8 rounded-full text-xs font-semibold transition-colors"
      >
        Đóng lại
      </Button>
    </div>
  );
}
