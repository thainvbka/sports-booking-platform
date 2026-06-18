import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPrice } from "@/utils";
import { StatCard } from "@/components/owner/StatCard";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { OwnerWalletResponse } from "@/services/payout.service";

interface BalanceCardsProps {
  wallet: OwnerWalletResponse | null;
  hasConfiguredBank: boolean;
  isSubmitting: boolean;
  onRequestPayout: () => void;
}

export function BalanceCards({
  wallet,
  hasConfiguredBank,
  isSubmitting,
  onRequestPayout,
}: BalanceCardsProps) {
  const pendingAmount = wallet?.balances.pending ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Card 1: Số dư tích lũy */}
      <StatCard
        tone="emerald"
        label="Số dư khả dụng (Tích lũy)"
        value={formatPrice(pendingAmount)}
        hint="Có thể yêu cầu chi trả về ngân hàng"
        icon={Wallet}
        extra={
          <Button
            onClick={onRequestPayout}
            disabled={isSubmitting || pendingAmount <= 0 || !hasConfiguredBank}
            className="w-full h-8 rounded-full bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            <ArrowUpRight className="size-3.5 mr-1" />
            Yêu cầu thanh toán ngay
          </Button>
        }
      />

      {/* Card 2: Đang chờ duyệt */}
      <StatCard
        tone="amber"
        label="Đang xử lý / Chờ duyệt"
        value={formatPrice(wallet?.balances.requested ?? 0)}
        hint="Gom các đợt đang chờ Admin duyệt"
        icon={Clock}
        extra={
          <Alert className="border-amber-500/10 bg-amber-500/5 text-amber-800 dark:text-amber-300 py-1.5 px-3">
            <AlertCircle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
            <AlertDescription className="text-[10px] text-muted-foreground leading-normal">
              Duyệt trong 24 giờ làm việc.
            </AlertDescription>
          </Alert>
        }
      />

      {/* Card 3: Đã thanh toán */}
      <StatCard
        tone="blue"
        label="Đã thanh toán (Paid)"
        value={formatPrice(wallet?.balances.paid ?? 0)}
        hint="Tổng số tiền đã quyết toán thành công"
        icon={CheckCircle2}
        extra={
          <Alert className="border-blue-500/10 bg-blue-500/5 text-blue-800 dark:text-blue-300 py-1.5 px-3">
            <TrendingUp className="size-3.5 text-blue-500 shrink-0 mt-0.5" />
            <AlertDescription className="text-[10px] text-muted-foreground leading-normal">
              Đã chuyển vào tài khoản bank.
            </AlertDescription>
          </Alert>
        }
      />
    </div>
  );
}
