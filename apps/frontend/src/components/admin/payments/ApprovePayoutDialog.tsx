import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ApprovePayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onSubmit: (transactionRef: string, note: string) => void;
}

export function ApprovePayoutDialog({
  open,
  onOpenChange,
  isSubmitting,
  onSubmit,
}: ApprovePayoutDialogProps) {
  const [transactionRef, setTransactionRef] = useState("");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    if (!open) {
      setTransactionRef("");
      setAdminNote("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      toast.error("Vui lòng điền mã giao dịch ngân hàng đối soát.");
      return;
    }
    onSubmit(transactionRef, adminNote);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              Xác nhận Đối soát Quyết toán
            </DialogTitle>
            <DialogDescription className="text-xs">
              Vui lòng điền thông tin chứng từ chứng minh bạn đã chuyển tiền thành công cho chủ sân.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="txRef" className="text-xs font-medium">
                Mã giao dịch ngân hàng (Transaction Ref) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="txRef"
                placeholder="Ví dụ: FT26140XXXXX hoặc mã giao dịch bank"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                required
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-xs font-medium">
                Ghi chú phản hồi
              </Label>
              <Textarea
                id="note"
                placeholder="Ví dụ: Quyết toán toàn bộ doanh thu đợt booking VNPAY..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold px-4 text-white"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận & Hoàn tất"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-8 rounded-full text-xs font-semibold px-3"
            >
              Hủy
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
