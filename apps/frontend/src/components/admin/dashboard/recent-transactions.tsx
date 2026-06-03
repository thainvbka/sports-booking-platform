"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/utils";
import {
  CheckCircle2,
  Clock,
  Eye,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";

export interface RecentPayment {
  id: string;
  status: string;
  amount: number;
  created_at: string;
  bookings?: Array<{
    player?: {
      account?: {
        full_name?: string;
        email?: string;
      };
    };
  }>;
}

interface RecentTransactionsProps {
  payments: RecentPayment[] | undefined;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    Icon: React.ElementType;
    stripe: string;
    rowBg: string;
    textColor: string;
  }
> = {
  SUCCESS: {
    label: PAYMENT_STATUS_LABELS.SUCCESS,
    Icon: CheckCircle2,
    stripe: "bg-emerald-500",
    rowBg:
      "bg-emerald-50/60 dark:bg-emerald-950/15 border-slate-100 dark:border-slate-800",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  PENDING: {
    label: PAYMENT_STATUS_LABELS.PENDING,
    Icon: Clock,
    stripe: "bg-amber-500",
    rowBg:
      "bg-amber-50/60 dark:bg-amber-950/15 border-slate-100 dark:border-slate-800",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  FAILED: {
    label: PAYMENT_STATUS_LABELS.FAILED,
    Icon: XCircle,
    stripe: "bg-rose-500",
    rowBg:
      "bg-rose-50/60 dark:bg-rose-950/15 border-slate-100 dark:border-slate-800",
    textColor: "text-rose-600 dark:text-rose-400",
  },
  REFUNDED: {
    label: PAYMENT_STATUS_LABELS.REFUNDED,
    Icon: RefreshCcw,
    stripe: "bg-blue-500",
    rowBg:
      "bg-blue-50/60 dark:bg-blue-950/15 border-slate-100 dark:border-slate-800",
    textColor: "text-blue-600 dark:text-blue-400",
  },
};

export function RecentTransactions({ payments = [] }: RecentTransactionsProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5 px-6">
        <div>
          <CardTitle className="text-lg">Giao dịch gần đây</CardTitle>
          <CardDescription className="text-[11px]">
            5 giao dịch khách hàng gần nhất
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-[11px] font-medium"
          asChild
        >
          <Link to="/admin/payments">
            <Eye className="h-3 w-3 mr-1.5" />
            Xem tất cả
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-2 px-6 pb-5 pt-1">
        {payments.slice(0, 5).map((payment) => {
          const playerName =
            payment.bookings?.[0]?.player?.account?.full_name || "Khách lẻ";
          const playerEmail =
            payment.bookings?.[0]?.player?.account?.email || "—";
          const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.FAILED;
          const StatusIcon = cfg.Icon;

          return (
            <div
              key={payment.id}
              className={`flex items-stretch gap-0 rounded-lg border overflow-hidden ${cfg.rowBg}`}
            >
              {/* Color stripe */}
              <div className={`w-1 shrink-0 ${cfg.stripe}`} />

              {/* Content */}
              <div className="flex items-center gap-3 flex-1 px-3 py-2.5">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}&background=random&size=64`}
                    alt={playerName}
                  />
                  <AvatarFallback className="text-[10px] font-bold">
                    {playerName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((n: string) => n[0]?.toUpperCase())
                      .join("") || "GU"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">
                      {playerName}
                    </p>
                    <p className="text-sm font-black text-foreground shrink-0 tabular-nums">
                      {formatPrice(payment.amount)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <div
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold ${cfg.textColor}`}
                    >
                      <StatusIcon className="h-2.5 w-2.5" />
                      {cfg.label}
                    </div>
                    <p className="text-[10px] text-muted-foreground tabular-nums">
                      {new Date(payment.created_at).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {payments.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-muted py-8 text-[12px] text-muted-foreground">
            Chưa có giao dịch gần đây
          </div>
        )}
      </CardContent>
    </Card>
  );
}
