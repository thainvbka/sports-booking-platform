import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, CreditCard, ShieldCheck } from "lucide-react";

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (method: "STRIPE" | "VNPAY") => void;
  loading: boolean;
}

export function PaymentMethodDialog({
  open,
  onOpenChange,
  onSelect,
  loading,
}: PaymentMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-6 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-bold tracking-tight">Chọn phương thức thanh toán</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Vui lòng chọn cổng thanh toán phù hợp để tiếp tục giao dịch.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 pt-4">
          <Button
            variant="outline"
            className="flex items-center justify-between p-5 h-auto border-border/80 hover:border-primary/50 hover:bg-primary/5 group transition-all rounded-xl text-left"
            disabled={loading}
            onClick={() => onSelect("STRIPE")}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500/20">
                <CreditCard className="size-6" />
              </div>
              <div>
                <div className="font-bold text-foreground text-sm">Thanh toán Stripe</div>
                <div className="text-xs text-muted-foreground">Hỗ trợ các thẻ quốc tế Visa, Mastercard, JCB</div>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-between p-5 h-auto border-border/80 hover:border-emerald-500/50 hover:bg-emerald-500/5 group transition-all rounded-xl text-left"
            disabled={loading}
            onClick={() => onSelect("VNPAY")}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:bg-emerald-500/20">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <div className="font-bold text-foreground text-sm">Cổng thanh toán VNPAY</div>
                <div className="text-xs text-muted-foreground">ATM nội địa, QR Pay, Ví điện tử</div>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
