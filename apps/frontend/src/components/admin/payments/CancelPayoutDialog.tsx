import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CancelPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onSubmit: (note: string) => void;
}

export function CancelPayoutDialog({
  open,
  onOpenChange,
  isSubmitting,
  onSubmit,
}: CancelPayoutDialogProps) {
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    if (!open) {
      setAdminNote("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNote.trim()) {
      toast.error("Vui lòng điền lý do từ chối yêu cầu.");
      return;
    }
    onSubmit(adminNote);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <XCircle className="size-4 text-rose-500" />
              Từ chối Yêu cầu Chi trả
            </DialogTitle>
            <DialogDescription className="text-xs">
              Khi từ chối, toàn bộ số dư con sẽ được hoàn trả về trạng thái PENDING khả dụng trong ví chủ sân.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="cancelNote" className="text-xs font-medium">
                Lý do từ chối yêu cầu quyết toán <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="cancelNote"
                placeholder="Ví dụ: Thông tin tài khoản thụ hưởng sai lệch hoặc ngân hàng báo lỗi..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                required
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-xs font-semibold px-4 text-white"
            >
              {isSubmitting ? "Đang xử lý..." : "Từ chối yêu cầu"}
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
