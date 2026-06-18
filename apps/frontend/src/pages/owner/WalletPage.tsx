import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BalanceCards } from "@/components/owner/wallet/BalanceCards";
import { BankDetailsCard } from "@/components/owner/wallet/BankDetailsCard";
import { PayoutHistoryTable } from "@/components/owner/wallet/PayoutHistoryTable";
import { useWallet } from "@/hooks/owner/useWallet";
import { Clock, RefreshCw, ShieldCheck } from "lucide-react";

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
      {/* ── HERO HEADER ───────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-background to-accent-sport/5 px-4 py-3.5 shadow-sm md:px-6 md:py-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-14 size-56 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-10 size-48 rounded-full bg-accent-sport/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
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
            <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl mt-1">
              Ví doanh thu & <span className="italic text-primary">Đối soát</span>
            </h1>
            <p className="hidden max-w-xl text-xs text-muted-foreground md:block mt-0.5">
              Quản lý số dư đặt sân nội địa Việt Nam qua VNPAY, cập nhật tài khoản ngân hàng và thực hiện yêu cầu quyết toán về tài khoản của bạn.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
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
          </div>
        </div>
      </section>

      {isLoading && !wallet ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/40" />
              <CardContent className="h-16 bg-muted/20" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* ── BALANCES CARDS ────────────────────────────────── */}
          <BalanceCards
            wallet={wallet}
            hasConfiguredBank={hasConfiguredBank}
            isSubmitting={isSubmitting}
            onRequestPayout={handleRequestPayout}
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* ── BANK DETAILS SETUP ───────────────────────────── */}
            <div className="md:col-span-1">
              <BankDetailsCard
                wallet={wallet}
                hasConfiguredBank={hasConfiguredBank}
                onSuccess={() => fetchWalletData(true)}
              />
            </div>

            {/* ── PAYOUT HISTORY TABLE ────────────────────────── */}
            <div className="md:col-span-2">
              <PayoutHistoryTable batches={wallet?.batches} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
