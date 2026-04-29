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
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface JoinMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (introduction?: string) => Promise<boolean>;
  isSubmitting?: boolean;
}

const MAX_LENGTH = 1000;

export function JoinMatchDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: JoinMatchDialogProps) {
  const [introduction, setIntroduction] = useState("");

  useEffect(() => {
    if (!open) setIntroduction("");
  }, [open]);

  const handleConfirm = async () => {
    const ok = await onConfirm(introduction.trim() || undefined);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-accent-sport/30 bg-accent-sport/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-sport">
            <Sparkles className="size-3" />
            Yêu cầu tham gia
          </div>
          <DialogTitle className="font-display text-2xl font-black italic tracking-tight">
            Vào đội ngay
          </DialogTitle>
          <DialogDescription>
            Viết một lời giới thiệu ngắn để chủ kèo duyệt bạn nhanh hơn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="join-introduction"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Lời giới thiệu
          </Label>
          <Textarea
            id="join-introduction"
            value={introduction}
            onChange={(event) => setIntroduction(event.target.value)}
            placeholder="Ví dụ: Mình chơi hậu vệ, đúng giờ, có thể đi trước 10 phút khởi động."
            maxLength={MAX_LENGTH}
            className="min-h-28 resize-none"
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Không bắt buộc — để trống nếu muốn.</span>
            <span className="font-semibold tabular-nums">
              {introduction.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            Gửi yêu cầu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
