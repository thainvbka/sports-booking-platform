import type { Column } from "@/components/shared/ui-utility/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { PAYOUT_STATUS_COLORS, PAYOUT_STATUS_LABELS } from "@/lib/constants";
import { formatDateVn, formatPrice, getBankDisplayName } from "@/utils";
import type { AdminPayoutBatchRecord } from "@/services/payout.service";

interface UsePayoutBatchColumnsProps {
  onViewDetail: (batch: AdminPayoutBatchRecord) => void;
}

export function usePayoutBatchColumns({ onViewDetail }: UsePayoutBatchColumnsProps) {
  const columns: Column<AdminPayoutBatchRecord>[] = [
    {
      header: "Đợt yêu cầu",
      className: "w-44",
      cell: (batch) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-foreground">
            {batch.payout_period}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatDateVn(batch.created_at, "HH:mm · dd/MM/yyyy")}
          </span>
        </div>
      ),
    },
    {
      header: "Chủ sân (Owner)",
      className: "w-56",
      cell: (batch) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{batch.owner?.company_name || "N/A"}</span>
          <span className="text-[10.5px] text-muted-foreground">{batch.owner?.account?.email}</span>
        </div>
      ),
    },
    {
      header: "Tài khoản nhận",
      className: "w-64",
      cell: (batch) => {
        if (!batch.owner?.bank_name) {
          return <span className="text-xs italic text-rose-500">Chưa thiết lập</span>;
        }
        return (
          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2 text-xs border border-border/40">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bank:</span>
              <span className="font-semibold">{getBankDisplayName(batch.owner.bank_name)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">STK:</span>
              <span className="font-mono font-bold text-primary">{batch.owner.bank_account_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tên:</span>
              <span className="uppercase font-mono font-semibold">{batch.owner.bank_account_name}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Số tiền quyết toán",
      className: "w-36 text-right",
      cell: (batch) => (
        <div className="text-right font-display text-sm font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
          {formatPrice(Number(batch.total_payout))}
        </div>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (batch) => (
        <Badge
          className={cn(
            "h-5 border-none text-[10px] shadow-none font-semibold uppercase tracking-wider py-0",
            PAYOUT_STATUS_COLORS[batch.status]
          )}
        >
          {PAYOUT_STATUS_LABELS[batch.status]}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-12 text-right",
      cell: (batch) => (
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(batch);
          }}
        >
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ];

  return columns;
}
