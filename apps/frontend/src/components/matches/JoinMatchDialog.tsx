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
import { useEffect, useState } from "react";

interface JoinMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (introduction?: string) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function JoinMatchDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: JoinMatchDialogProps) {
  const [introduction, setIntroduction] = useState("");

  useEffect(() => {
    if (!open) {
      setIntroduction("");
    }
  }, [open]);

  const handleConfirm = async () => {
    const ok = await onConfirm(introduction.trim() || undefined);

    if (ok) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-emerald-200 bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Tham gia kèo</DialogTitle>
          <DialogDescription>
            Bạn có thể để lại một lời giới thiệu ngắn để creator duyệt nhanh hơn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
          <Label htmlFor="join-introduction" className="text-slate-700">
            Lời giới thiệu
          </Label>
          <Textarea
            id="join-introduction"
            value={introduction}
            onChange={(event) => setIntroduction(event.target.value)}
            placeholder="Ví dụ: Mình chơi vị trí hậu vệ, có thể tham gia đúng giờ."
            maxLength={1000}
            className="min-h-28 border-emerald-200 bg-white focus-visible:border-emerald-400 focus-visible:ring-emerald-300"
          />

          <p className="text-right text-xs text-slate-500">{introduction.length}/1000</p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40"
          >
            Gửi yêu cầu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
