import type { Column } from "@/components/shared/ui-utility/DataTable";
import { formatPrice, getBankDisplayName } from "@/utils";
import type { AdminOwnerWalletRecord } from "@/services/payout.service";

export function useOwnerWalletColumns() {
  const columns: Column<AdminOwnerWalletRecord>[] = [
    {
      header: "Chủ sân (Owner)",
      className: "w-56",
      cell: (w) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{w.company_name}</span>
          <span className="text-[10.5px] text-muted-foreground">{w.account?.email}</span>
          <span className="text-[10px] text-muted-foreground">{w.account?.phone_number}</span>
        </div>
      ),
    },
    {
      header: "Tài khoản nhận",
      className: "w-64",
      cell: (w) => {
        if (!w.bankDetails?.bank_name) {
          return <span className="text-xs italic text-rose-500">Chưa thiết lập ngân hàng</span>;
        }
        return (
          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2 text-xs border border-border/40">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bank:</span>
              <span className="font-semibold">{getBankDisplayName(w.bankDetails.bank_name)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">STK:</span>
              <span className="font-mono font-bold text-primary">{w.bankDetails.bank_account_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tên:</span>
              <span className="uppercase font-mono font-semibold">{w.bankDetails.bank_account_name}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Chưa quyết toán (Tích lũy)",
      className: "w-44 text-right",
      cell: (w) => (
        <div className="text-right font-display text-sm font-black italic tracking-tight text-amber-600 dark:text-amber-400">
          {formatPrice(w.balances.pending)}
        </div>
      ),
    },
    {
      header: "Đang yêu cầu rút",
      className: "w-44 text-right",
      cell: (w) => (
        <div className="text-right font-display text-sm font-black italic tracking-tight text-blue-600 dark:text-blue-400">
          {formatPrice(w.balances.requested)}
        </div>
      ),
    },
    {
      header: "Đã chi trả (Paid)",
      className: "w-44 text-right",
      cell: (w) => (
        <div className="text-right font-display text-sm font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
          {formatPrice(w.balances.paid)}
        </div>
      ),
    },
  ];

  return columns;
}
