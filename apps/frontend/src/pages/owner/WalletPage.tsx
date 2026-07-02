import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BankDetailsCard } from "@/components/owner/wallet/BankDetailsCard";
import { PayoutHistoryTable } from "@/components/owner/wallet/PayoutHistoryTable";
import { useWallet } from "@/hooks/owner/useWallet";
import {
  Clock,
  RefreshCw,
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  Wallet as WalletIcon,
  AlertCircle,
} from "lucide-react";
import { OwnerPageHero } from "@/components/owner/OwnerPageHero";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPrice } from "@/utils";

export function WalletPage() {
  const {
    wallet,
    isLoading,
    isSubmitting,
    fetchWalletData,
    handleRequestPayout,
    hasConfiguredBank,
  } = useWallet();

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/*  HERO HEADER & BALANCES  */}
      {isLoading && !wallet ? (
        <div className="animate-pulse rounded-2xl border border-border/60 bg-muted/10 h-[240px]" />
      ) : (
        <OwnerPageHero
          variant="card"
          badge={
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="h-5 gap-1 rounded-full border-border/60 bg-background/70 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm"
              >
                <Clock className="size-2.5" />
                <span>Ví VND (VNPAY)</span>
              </Badge>
              <Badge
                variant="outline"
                className="h-5 gap-1 rounded-full border-emerald-500/30 bg-emerald-500/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400"
              >
                <ShieldCheck className="size-2.5" />
                Hoạt động
              </Badge>
            </div>
          }
          title={
            <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl mt-1">
              Ví doanh thu & <span className="italic text-primary">Đối soát</span>
            </h1>
          }
          description={
            <p className="hidden max-w-xl text-xs text-muted-foreground md:block mt-0.5">
              Quản lý số dư đặt sân nội địa Việt Nam qua VNPAY, cập nhật tài khoản ngân hàng và thực hiện yêu cầu quyết toán về tài khoản của bạn.
            </p>
          }
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchWalletData(false)}
              disabled={isLoading}
              className="h-9 rounded-full border-border/60 bg-background/50 hover:bg-muted"
            >
              <RefreshCw className={cn("size-3.5 mr-2", isLoading && "animate-spin")} />
              Làm mới
            </Button>
          }
          stats={[
            {
              icon: WalletIcon,
              label: "Số dư khả dụng (Tích lũy)",
              value: formatPrice(wallet?.balances.pending ?? 0),
              tone: "emerald",
              hint: "Có thể yêu cầu chi trả về ngân hàng",
              extra: (
                <Button
                  onClick={handleRequestPayout}
                  disabled={isSubmitting || (wallet?.balances.pending ?? 0) <= 0 || !hasConfiguredBank}
                  className="w-full h-8 rounded-full bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors mt-2"
                >
                  <ArrowUpRight className="size-3.5 mr-1" />
                  Yêu cầu thanh toán ngay
                </Button>
              ),
            },
            {
              icon: Clock,
              label: "Đang xử lý / Chờ duyệt",
              value: formatPrice(wallet?.balances.requested ?? 0),
              tone: "amber",
              hint: "Gom các đợt đang chờ Admin duyệt",
              extra: (
                <Alert className="border-amber-500/10 bg-amber-500/5 text-amber-800 dark:text-amber-300 py-1.5 px-3 mt-2">
                  <AlertCircle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <AlertDescription className="text-[10px] text-muted-foreground leading-normal">
                    Duyệt trong 24 giờ làm việc.
                  </AlertDescription>
                </Alert>
              ),
            },
            {
              icon: CheckCircle2,
              label: "Đã thanh toán (Paid)",
              value: formatPrice(wallet?.balances.paid ?? 0),
              tone: "blue",
              hint: "Tổng số tiền đã quyết toán thành công",
              extra: (
                <Alert className="border-blue-500/10 bg-blue-500/5 text-blue-800 dark:text-blue-300 py-1.5 px-3 mt-2">
                  <TrendingUp className="size-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <AlertDescription className="text-[10px] text-muted-foreground leading-normal">
                    Đã chuyển vào tài khoản bank.
                  </AlertDescription>
                </Alert>
              ),
            },
          ]}
        />
      )}

      {/*  LOWER SECTION  */}
      {(!isLoading || wallet) && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/*  BANK DETAILS SETUP  */}
          <div className="md:col-span-1">
            <BankDetailsCard
              wallet={wallet}
              hasConfiguredBank={hasConfiguredBank}
              onSuccess={() => fetchWalletData(true)}
            />
          </div>

          {/*  PAYOUT HISTORY TABLE  */}
          <div className="md:col-span-2">
            <PayoutHistoryTable batches={wallet?.batches} />
          </div>
        </div>
      )}
    </div>
  );
}
