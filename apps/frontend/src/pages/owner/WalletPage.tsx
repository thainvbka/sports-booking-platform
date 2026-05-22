import { Alert, AlertDescription, AlertTitle as UIAlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { payoutService, type OwnerWalletResponse } from "@/services/payout.service";
import { formatPrice, VIETNAM_BANKS, mapToBankBin, getBankDisplayName } from "@/utils";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";



import { PAYOUT_STATUS_COLORS, PAYOUT_STATUS_LABELS } from "@/lib/constants";

const STATUS_TONES: Record<
  string,
  { bg: string; border: string; label: string; icon: any }
> = {
  PENDING: {
    bg: PAYOUT_STATUS_COLORS.PENDING,
    border: "border-slate-300/60 dark:border-slate-800",
    label: PAYOUT_STATUS_LABELS.PENDING,
    icon: Clock,
  },
  REQUESTED: {
    bg: PAYOUT_STATUS_COLORS.REQUESTED,
    border: "border-amber-300/60 dark:border-amber-800",
    label: PAYOUT_STATUS_LABELS.REQUESTED,
    icon: Clock,
  },
  PROCESSING: {
    bg: PAYOUT_STATUS_COLORS.PROCESSING,
    border: "border-blue-300/60 dark:border-blue-800",
    label: PAYOUT_STATUS_LABELS.PROCESSING,
    icon: RefreshCw,
  },
  PAID: {
    bg: PAYOUT_STATUS_COLORS.PAID,
    border: "border-emerald-300/60 dark:border-emerald-800",
    label: PAYOUT_STATUS_LABELS.PAID,
    icon: CheckCircle2,
  },
  CANCELLED: {
    bg: PAYOUT_STATUS_COLORS.CANCELLED,
    border: "border-rose-300/60 dark:border-rose-800",
    label: PAYOUT_STATUS_LABELS.CANCELLED,
    icon: XCircle,
  },
};

export function WalletPage() {
  const [wallet, setWallet] = useState<OwnerWalletResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for bank details
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [isEditingBank, setIsEditingBank] = useState(false);

  const fetchWalletData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await payoutService.getOwnerWallet();
      if (response.success && response.data) {
        setWallet(response.data);
        const bankDetails = response.data.bankDetails;
        setBankName(mapToBankBin(bankDetails?.bank_name || ""));
        setBankAccountNumber(bankDetails?.bank_account_number || "");
        setBankAccountName(bankDetails?.bank_account_name || "");
        setBankBranch(bankDetails?.bank_branch || "");
      }
    } catch (err: any) {
      console.error("Failed to load wallet data:", err);
      toast.error(err.response?.data?.message || "Không thể tải thông tin ví");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleUpdateBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !bankAccountNumber.trim() || !bankAccountName.trim()) {
      toast.error("Vui lòng nhập đầy đủ các trường thông tin bắt buộc.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await payoutService.updateBankDetails({
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName.toUpperCase(),
        bank_branch: bankBranch || undefined,
      });

      if (response.success) {
        toast.success("Cập nhật thông tin tài khoản ngân hàng thành công.");
        setIsEditingBank(false);
        fetchWalletData(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể cập nhật tài khoản ngân hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!wallet) return;

    if (!wallet.bankDetails?.bank_name || !wallet.bankDetails?.bank_account_number) {
      toast.error("Bạn phải cập nhật thông tin tài khoản ngân hàng trước khi gửi yêu cầu chi trả.");
      return;
    }

    if (wallet.balances.pending <= 0) {
      toast.error("Bạn không có số dư khả dụng (Tích lũy) để gửi yêu cầu chi trả.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await payoutService.requestPayout();
      if (response.success) {
        toast.success("Gửi yêu cầu chi trả thành công! Chờ Admin phê duyệt.");
        fetchWalletData(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gửi yêu cầu rút tiền thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasConfiguredBank = Boolean(
    wallet?.bankDetails?.bank_name &&
    wallet?.bankDetails?.bank_account_number &&
    wallet?.bankDetails?.bank_account_name
  );

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Card 1: Số dư tích lũy */}
            <Card className="group relative overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <span className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-background to-background opacity-70" />
              <CardHeader className="relative flex-row items-center justify-between gap-2 px-4 pb-1 pt-3">
                <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Số dư khả dụng (Tích lũy)
                </CardTitle>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Wallet className="size-3.5" />
                </span>
              </CardHeader>
              <CardContent className="relative flex flex-col gap-1 px-4 pb-3">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-2xl font-black italic tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
                    {formatPrice(wallet?.balances.pending ?? 0)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Có thể yêu cầu chi trả về ngân hàng
                </p>
                <div className="mt-3.5">
                  <Button
                    onClick={handleRequestPayout}
                    disabled={isSubmitting || (wallet?.balances.pending ?? 0) <= 0 || !hasConfiguredBank}
                    className="w-full h-8 rounded-full bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                  >
                    <ArrowUpRight className="size-3.5 mr-1" />
                    Yêu cầu thanh toán ngay
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Đang chờ duyệt */}
            <Card className="group relative overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <span className="absolute inset-x-0 top-0 h-0.5 bg-amber-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-background to-background opacity-70" />
              <CardHeader className="relative flex-row items-center justify-between gap-2 px-4 pb-1 pt-3">
                <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Đang xử lý / Chờ duyệt
                </CardTitle>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="size-3.5" />
                </span>
              </CardHeader>
              <CardContent className="relative flex flex-col gap-1 px-4 pb-3">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-2xl font-black italic tabular-nums tracking-tight text-amber-600 dark:text-amber-400">
                    {formatPrice(wallet?.balances.requested ?? 0)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Gom các đợt đang chờ Admin duyệt
                </p>
                <Alert className="mt-3.5 border-amber-500/10 bg-amber-500/5 text-amber-800 dark:text-amber-300 py-1.5 px-3">
                  <AlertCircle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <AlertDescription className="text-[10px] text-muted-foreground leading-normal">
                    Duyệt trong 24 giờ làm việc.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Card 3: Đã thanh toán */}
            <Card className="group relative overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <span className="absolute inset-x-0 top-0 h-0.5 bg-blue-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-background to-background opacity-70" />
              <CardHeader className="relative flex-row items-center justify-between gap-2 px-4 pb-1 pt-3">
                <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Đã thanh toán (Paid)
                </CardTitle>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="size-3.5" />
                </span>
              </CardHeader>
              <CardContent className="relative flex flex-col gap-1 px-4 pb-3">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-2xl font-black italic tabular-nums tracking-tight text-blue-600 dark:text-blue-400">
                    {formatPrice(wallet?.balances.paid ?? 0)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Tổng số tiền đã quyết toán thành công
                </p>
                <Alert className="mt-3.5 border-blue-500/10 bg-blue-500/5 text-blue-800 dark:text-blue-300 py-1.5 px-3">
                  <TrendingUp className="size-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <AlertDescription className="text-[10px] text-muted-foreground leading-normal">
                    Đã chuyển vào tài khoản bank.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* ── BANK DETAILS SETUP ───────────────────────────── */}
            <div className="md:col-span-1">
              <Card className="border border-border/60 shadow-sm overflow-hidden h-full">
                <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CreditCard className="size-4" />
                    </span>
                    <div className="flex flex-col">
                      <CardTitle className="text-base font-bold text-foreground">Tài khoản Ngân hàng</CardTitle>
                      <CardDescription className="mt-0.5 text-xs">Nhận tiền quyết toán doanh thu nội địa</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <Separator className="opacity-60" />
                <CardContent className="p-4 md:p-5">
                  {!hasConfiguredBank && !isEditingBank ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 py-8 border border-dashed border-border rounded-xl bg-background/50">
                      <AlertCircle className="size-8 text-amber-500 stroke-[1.5] mb-2 animate-bounce" />
                      <span className="text-xs font-semibold text-foreground">Chưa cấu hình tài khoản</span>
                      <p className="text-[10.5px] text-muted-foreground max-w-xs mt-1 mb-4">
                        Vui lòng thiết lập tài khoản ngân hàng nội địa để có thể gửi yêu cầu chi trả doanh thu từ hệ thống.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setIsEditingBank(true)}
                        className="h-8 rounded-full bg-primary text-xs font-semibold px-4"
                      >
                        Thiết lập ngay
                      </Button>
                    </div>
                  ) : isEditingBank ? (
                    <form onSubmit={handleUpdateBankDetails} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="bankName" className="text-xs font-medium text-foreground/80">Tên Ngân hàng <span className="text-destructive">*</span></Label>
                        <Select value={bankName} onValueChange={setBankName}>
                          <SelectTrigger className="h-9 text-xs rounded-xl">
                            <SelectValue placeholder="Chọn Ngân hàng của bạn" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl max-h-60">
                            {VIETNAM_BANKS.map((b) => (
                              <SelectItem key={b.code} value={b.code}>
                                {b.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bankAccountNumber" className="text-xs font-medium text-foreground/80">Số Tài khoản <span className="text-destructive">*</span></Label>
                        <Input
                          id="bankAccountNumber"
                          placeholder="Nhập số tài khoản ngân hàng"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          required
                          className="h-9 text-xs rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bankAccountName" className="text-xs font-medium text-foreground/80">Tên Chủ Tài khoản <span className="text-destructive">*</span></Label>
                        <Input
                          id="bankAccountName"
                          placeholder="Ví dụ: NGUYEN VAN A (Viết hoa không dấu)"
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          required
                          className="h-9 text-xs rounded-xl font-mono uppercase"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bankBranch" className="text-xs font-medium text-foreground/80">Chi nhánh (Không bắt buộc)</Label>
                        <Input
                          id="bankBranch"
                          placeholder="Ví dụ: Chi nhánh Hà Nội"
                          value={bankBranch}
                          onChange={(e) => setBankBranch(e.target.value)}
                          className="h-9 text-xs rounded-xl"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 h-8 rounded-full bg-primary text-xs font-semibold"
                        >
                          {isSubmitting ? "Đang lưu..." : "Lưu cài đặt"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setIsEditingBank(false)}
                          className="h-8 rounded-full text-xs font-semibold px-3"
                        >
                          Hủy
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-border bg-background/40 p-3.5 space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ngân hàng</span>
                          <span className="text-xs font-bold text-foreground uppercase">{getBankDisplayName(wallet?.bankDetails?.bank_name || "")}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Số tài khoản</span>
                          <span className="text-xs font-mono font-bold text-foreground">{wallet?.bankDetails?.bank_account_number}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tên thụ hưởng</span>
                          <span className="text-xs font-mono font-bold text-foreground uppercase">{wallet?.bankDetails?.bank_account_name}</span>
                        </div>
                        {wallet?.bankDetails?.bank_branch && (
                          <div className="flex items-start justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Chi nhánh</span>
                            <span className="text-xs font-medium text-muted-foreground">{wallet?.bankDetails?.bank_branch}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingBank(true)}
                        className="w-full h-8 rounded-full border-border/60 text-xs font-semibold"
                      >
                        Chỉnh sửa thông tin bank
                      </Button>
                    </div>
                  )}

                  {hasConfiguredBank && (
                    <Alert className="mt-4 border-emerald-500/10 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="size-4 text-emerald-500" />
                      <UIAlertTitle className="text-[10px] font-bold">Đã kích hoạt rút tiền</UIAlertTitle>
                      <AlertDescription className="text-[9.5px] leading-relaxed text-muted-foreground mt-0.5">
                        Tài khoản ngân hàng của bạn đã sẵn sàng để đối soát và nhận tiền chuyển khoản định kỳ của nền tảng.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── PAYOUT HISTORY TABLE ────────────────────────── */}
            <div className="md:col-span-2">
              <Card className="border border-border/60 shadow-sm overflow-hidden h-full">
                <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="size-4" />
                    </span>
                    <div className="flex flex-col">
                      <CardTitle className="text-base font-bold text-foreground">Lịch sử Quyết toán</CardTitle>
                      <CardDescription className="mt-0.5 text-xs">Lịch sử các đợt Admin thanh toán công nợ</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <Separator className="opacity-60" />
                <CardContent className="p-0">
                  {!wallet?.batches || wallet.batches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 py-16">
                      <FileText className="size-10 text-muted-foreground opacity-30 stroke-[1.5] mb-2" />
                      <span className="text-xs font-semibold text-foreground">Không có lịch sử thanh toán</span>
                      <p className="text-[10.5px] text-muted-foreground max-w-xs mt-1">
                        Khi bạn thực hiện rút số dư khả dụng và được Admin duyệt chi trả, các đợt thanh toán sẽ xuất hiện ở đây.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-b border-border/60">
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-4 py-3">Đợt quyết toán</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3">Ngày gửi</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 text-right">Tổng tiền</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3">Trạng thái</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pr-4 py-3 text-right">Chi tiết</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {wallet.batches.map((batch) => {
                            const tone = STATUS_TONES[batch.status] || STATUS_TONES.PENDING;
                            const StatusIcon = tone.icon;
                            return (
                              <TableRow key={batch.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                                <TableCell className="pl-4 py-3">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-foreground">
                                      {batch.payout_period}
                                    </span>
                                    {batch.transaction_ref && (
                                      <span className="text-[9.5px] font-mono text-muted-foreground mt-0.5">
                                        Ref: {batch.transaction_ref}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="py-3 text-xs text-muted-foreground">
                                  {new Date(batch.created_at).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </TableCell>
                                <TableCell className="py-3 text-xs text-right font-display font-bold italic tabular-nums text-foreground">
                                  {formatPrice(Number(batch.total_payout))}
                                </TableCell>
                                <TableCell className="py-3">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "h-5 gap-1 rounded-full px-2 text-[9.5px] font-semibold uppercase tracking-wider",
                                      tone.bg,
                                      tone.border
                                    )}
                                  >
                                    <StatusIcon className="size-2.5 shrink-0" />
                                    {tone.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="pr-4 py-3 text-right">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-7 text-[10.5px] font-semibold rounded-full px-3 hover:bg-muted">
                                        Xem chi tiết
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md rounded-2xl border border-border/60 shadow-lg">
                                      <DialogHeader>
                                        <DialogTitle className="text-base font-bold text-foreground">Đợt Chi trả Chi tiết</DialogTitle>
                                        <DialogDescription className="text-xs">Mã đợt chi: {batch.id}</DialogDescription>
                                      </DialogHeader>

                                      <div className="space-y-4 pt-2">
                                        <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2.5 text-xs">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Nội dung đợt:</span>
                                            <span className="font-semibold text-foreground">{batch.payout_period}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Tổng số tiền nhận:</span>
                                            <span className="font-bold text-primary font-display italic text-sm">{formatPrice(Number(batch.total_payout))}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Trạng thái đợt chi:</span>
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                "h-5 gap-1 rounded-full px-2 text-[9px] font-semibold uppercase tracking-wider",
                                                tone.bg,
                                                tone.border
                                              )}
                                            >
                                              <StatusIcon className="size-2.5 shrink-0" />
                                              {tone.label}
                                            </Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Thời gian tạo yêu cầu:</span>
                                            <span className="text-foreground">{new Date(batch.created_at).toLocaleString("vi-VN")}</span>
                                          </div>
                                          {batch.paid_at && (
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Thời gian hoàn tất chi:</span>
                                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{new Date(batch.paid_at).toLocaleString("vi-VN")}</span>
                                            </div>
                                          )}
                                        </div>

                                        {(batch.transaction_ref || batch.note || batch.receipt_image) && (
                                          <div className="space-y-2">
                                            <h4 className="text-xs font-semibold text-foreground/90">Chứng từ Quyết toán từ Admin</h4>
                                            <div className="rounded-xl border border-border bg-background p-3.5 space-y-2 text-xs">
                                              {batch.transaction_ref && (
                                                <div className="flex justify-between">
                                                  <span className="text-muted-foreground">Mã giao dịch ngân hàng:</span>
                                                  <span className="font-mono font-semibold text-foreground">{batch.transaction_ref}</span>
                                                </div>
                                              )}
                                              {batch.note && (
                                                <div className="flex flex-col gap-1">
                                                  <span className="text-muted-foreground">Ghi chú phản hồi:</span>
                                                  <p className="bg-muted/35 p-2.5 rounded-lg text-[11px] text-muted-foreground italic leading-normal border border-border/40">
                                                    {batch.note}
                                                  </p>
                                                </div>
                                              )}
                                              {batch.receipt_image && (
                                                <div className="flex flex-col gap-1.5 pt-1.5">
                                                  <span className="text-muted-foreground">Ảnh biên lai giao dịch (UNC):</span>
                                                  <a
                                                    href={batch.receipt_image}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="relative block rounded-lg overflow-hidden border border-border/80 group hover:border-primary/50 transition-colors"
                                                  >
                                                    <img
                                                      src={batch.receipt_image}
                                                      alt="Biên lai UNC"
                                                      className="w-full h-32 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                      <span className="text-[10px] text-white font-bold uppercase tracking-wider">Xem ảnh gốc</span>
                                                    </div>
                                                  </a>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <DialogFooter className="pt-2">
                                        <DialogClose asChild>
                                          <Button type="button" variant="outline" className="h-8 rounded-full text-xs font-semibold px-4">
                                            Đóng lại
                                          </Button>
                                        </DialogClose>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
