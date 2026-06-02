import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodSelectorProps {
  value: "STRIPE" | "VNPAY";
  onChange: (value: "STRIPE" | "VNPAY") => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3 rounded-lg border p-4 bg-card shadow-xs">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <CreditCard className="h-4 w-4 text-primary" />
        Chọn phương thức thanh toán
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("STRIPE")}
          className={cn(
            "flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all gap-1 text-xs font-semibold cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed",
            value === "STRIPE"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:bg-muted/50 text-muted-foreground"
          )}
        >
          <span className="font-bold">Thẻ Quốc Tế (Stripe)</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            Visa, Mastercard, JCB...
          </span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("VNPAY")}
          className={cn(
            "flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all gap-1 text-xs font-semibold cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed",
            value === "VNPAY"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:bg-muted/50 text-muted-foreground"
          )}
        >
          <span className="font-bold">Cổng VNPAY (ATM / QR)</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            Quét mã QR, Thẻ nội địa...
          </span>
        </button>
      </div>
    </div>
  );
}
