import type { AdminPayoutBatchRecord } from "@/services/payout.service";
import { ExternalLink } from "lucide-react";

interface VietQRGeneratorProps {
  batch: AdminPayoutBatchRecord;
}

export function VietQRGenerator({ batch }: VietQRGeneratorProps) {
  if (batch.status === "PAID" || !batch.owner?.bank_name) return null;

  return (
    <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-4 flex flex-col items-center gap-3 text-xs">
      <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
        <ExternalLink className="size-4" />
        Quét mã chuyển khoản VietQR tự động
      </span>
      <div className="bg-white dark:bg-white p-2.5 rounded-lg shadow-sm border border-border">
        <img
          src={`https://img.vietqr.io/image/${batch.owner.bank_name}-${batch.owner.bank_account_number}-compact.png?amount=${batch.total_payout}&addInfo=${encodeURIComponent(
            batch.payout_period
          )}&accountName=${encodeURIComponent(batch.owner.bank_account_name || "")}`}
          alt="VietQR code"
          className="size-32 object-contain"
        />
      </div>
      <p className="text-[10px] text-center text-muted-foreground leading-normal max-w-xs">
        Mở ứng dụng Mobile Banking của bạn, quét mã QR này để tự động điền thông tin người nhận, số tiền và nội dung chuyển khoản chính xác 100%.
      </p>
    </div>
  );
}
