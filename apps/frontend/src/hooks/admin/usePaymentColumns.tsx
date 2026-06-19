import type { Column } from "@/components/shared/ui-utility/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/constants";
import type { AdminPayment } from "@/types/admin.types";
import { formatDateVn, formatPrice } from "@/utils";
import { CreditCard, Eye, MoreHorizontal, Receipt } from "lucide-react";

interface UsePaymentColumnsProps {
  onViewDetail: (payment: AdminPayment) => void;
}

export function usePaymentColumns({ onViewDetail }: UsePaymentColumnsProps) {
  const columns: Column<AdminPayment>[] = [
    {
      header: "Mã giao dịch",
      className: "w-48",
      cell: (payment) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase">
            <Receipt className="size-3.5 text-primary" />
            <span className="truncate">{payment.transaction_code}</span>
          </div>
          <span className="ml-5 text-[10px] italic text-muted-foreground">
            {formatDateVn(payment.created_at, "HH:mm · dd/MM")}
          </span>
        </div>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-56",
      cell: (payment) => {
        const player = payment.bookings?.[0]?.player;
        if (!player)
          return <span className="italic text-muted-foreground">N/A</span>;
        return (
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full border border-border/60 bg-primary/5 text-[11px] font-bold text-primary">
              {player.account.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {player.account.full_name}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {player.account.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Phương thức",
      className: "w-36",
      cell: (payment) => (
        <div className="flex items-center gap-1.5 text-xs">
          <CreditCard className="size-3.5 text-sky-500" />
          <span className="font-medium uppercase tracking-wide">
            {payment.provider}
          </span>
        </div>
      ),
    },
    {
      header: "Số tiền",
      className: "w-32",
      cell: (payment) => (
        <div className="font-display text-sm font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
          {formatPrice(Number(payment.amount))}
        </div>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (payment) => {
        const status = payment.status;
        return (
          <Badge
            className={`${PAYMENT_STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"} h-5 w-fit border-none py-0 text-[10px] shadow-none`}
          >
            {PAYMENT_STATUS_LABELS[status] ?? status}
          </Badge>
        );
      },
    },
    {
      header: "",
      className: "w-12 text-right",
      cell: (payment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal />
              <span className="sr-only">Mở menu hành động</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(payment);
                }}
              >
                <Eye /> Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return columns;
}
