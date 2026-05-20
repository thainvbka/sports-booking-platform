import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { payoutService, type OwnerWalletResponse, type PayoutBatchRecord } from "@/services/payout.service";
import { formatPrice } from "@/utils";
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Building,
  TrendingUp,
  FileText,
  User,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_TONES: Record<
  string,
  { bg: string; text: string; border: string; label: string; icon: any }
> = {
  PENDING: {
    bg: "bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-300",
    border: "border-slate-300/60 dark:border-slate-800",
    label: "Tích lũy",
    icon: Clock,
  },
  REQUESTED: {
    bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    border: "border-amber-300/60 dark:border-amber-800",
    label: "Chờ duyệt",
    icon: Clock,
  },
  PROCESSING: {
    bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    border: "border-blue-300/60 dark:border-blue-800",
    label: "Đang xử lý",
    icon: RefreshCw,
  },
  PAID: {
    bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    border: "border-emerald-300/60 dark:border-emerald-800",
    label: "Đã chi trả",
    icon: CheckCircle2,
  },
  CANCELLED: {
    bg: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    border: "border-rose-300/60 dark:border-rose-800",
    label: "Đã từ chối",
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
        const { bankDetails } = response.data;
        setBankName(bankDetails.bank_name || "");
        setBankAccountNumber(bankDetails.bank_account_number || "");
        setBankAccountName(bankDetails.bank_account_name || "");
        setBankBranch(bankDetails.bank_branch || "");
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

    if (!wallet.bankDetails.bank_name || !wallet.bankDetails.bank_account_number) {
      toast.error("Bạn phải cập nhật thông tin tài khoản ngân hàng trước khi gửi yêu cầu rút tiền.");
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
    wallet?.bankDetails.bank_name &&
    wallet?.bankDetails.bank_account_number &&
    wallet?.bankDetails.bank_account_name
  );

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ── HERO HEADER ───────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-background to-accent-sport/5 px-4 py-4 shadow-sm md:px-6 md:py-5">
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
            <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
              Ví doanh thu & <span className="italic text-primary">Đối soát</span>
            </h1>
            <p className="hidden max-w-xl text-xs text-muted-foreground md:block">
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
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-emerald-500/10">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-transparent" />
              <span className="absolute inset-y-0 left-0 w-0.5 bg-emerald-500" />
              <div className="relative flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Số dư khả dụng (Tích lũy)
                  </span>
                  <span className="font-display text-2xl font-black italic tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
                    {formatPrice(wallet?.balances.pending ?? 0)}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground">
                    Có thể yêu cầu chi trả về ngân hàng
                  </span>
                </div>
                <span className="inline-flex size-9 items-center justify-center rounded-xl border border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Wallet className="size-4" />
                </span>
              </div>
              <div className="relative mt-4">
                <Button
                  onClick={handleRequestPayout}
                  disabled={isSubmitting || (wallet?.balances.pending ?? 0) <= 0 || !hasConfiguredBank}
                  className="w-full h-8 rounded-full bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-50"
                >
                  <ArrowUpRight className="size-3.5 mr-1" />
                  Yêu cầu thanh toán ngay
                </Button>
              </div>
            </div>

            {/* Card 2: Đang chờ duyệt */}
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-amber-500/10">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-transparent" />
              <span className="absolute inset-y-0 left-0 w-0.5 bg-amber-500" />
              <div className="relative flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Đang xử lý / Chờ duyệt
                  </span>
                  <span className="font-display text-2xl font-black italic tabular-nums tracking-tight text-amber-600 dark:text-amber-400">
                    {formatPrice(wallet?.balances.requested ?? 0)}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground">
                    Gom các đợt đang chờ Admin duyệt
                  </span>
                </div>
                <span className="inline-flex size-9 items-center justify-center rounded-xl border border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  <Clock className="size-4" />
                </span>
              </div>
              <div className="relative mt-4 text-[10.5px] text-muted-foreground flex items-center gap-1">
                <AlertCircle className="size-3 text-amber-500" />
                Thường được duyệt trong 24 giờ làm việc.
              </div>
            </div>

            {/* Card 3: Đã thanh toán */}
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-blue-500/10">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-transparent" />
              <span className="absolute inset-y-0 left-0 w-0.5 bg-blue-500" />
              <div className="relative flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Đã thanh toán (Paid)
                  </span>
                  <span className="font-display text-2xl font-black italic tabular-nums tracking-tight text-blue-600 dark:text-blue-400">
                    {formatPrice(wallet?.balances.paid ?? 0)}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground">
                    Tổng số tiền đã quyết toán thành công
                  </span>
                </div>
                <span className="inline-flex size-9 items-center justify-center rounded-xl border border-blue-300/60 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                  <CheckCircle2 className="size-4" />
                </span>
              </div>
              <div className="relative mt-4 text-[10.5px] text-muted-foreground flex items-center gap-1">
                <TrendingUp className="size-3 text-blue-500" />
                Đã chuyển khoản trực tiếp vào tài khoản ngân hàng.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* ── BANK DETAILS SETUP ───────────────────────────── */}
            <div className="md:col-span-1">
              <Card className="border border-border/60 shadow-sm overflow-hidden h-full">
                <CardHeader className="border-b border-border/60 bg-muted/20 relative">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CreditCard className="size-4" />
                    </span>
                    <div>
                      <CardTitle className="text-sm font-semibold">Tài khoản Ngân hàng</CardTitle>
                      <CardDescription className="text-xs">Nhận tiền quyết toán doanh thu nội địa</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 pb-5">
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
                        className="h-8 rounded-full bg-primary text-xs font-semibold"
                      >
                        Thiết lập ngay
                      </Button>
                    </div>
                  ) : isEditingBank ? (
                    <form onSubmit={handleUpdateBankDetails} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="bankName" className="text-xs font-medium">Tên Ngân hàng <span className="text-destructive">*</span></Label>
                        <Input
                          id="bankName"
                          placeholder="Ví dụ: Vietcombank, Techcombank..."
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          required
                          className="h-9 text-xs rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bankAccountNumber" className="text-xs font-medium">Số Tài khoản <span className="text-destructive">*</span></Label>
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
                        <Label htmlFor="bankAccountName" className="text-xs font-medium">Tên Chủ Tài khoản <span className="text-destructive">*</span></Label>
                        <Input
                          id="bankAccountName"
                          placeholder="Ví dụ: NGUYEN VAN A (Viết hoa không dấu)"
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                          required
                          className="h-9 text-xs rounded-xl font-mono uppercase"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bankBranch" className="text-xs font-medium">Chi nhánh (Không bắt buộc)</Label>
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
                          <span className="text-xs font-bold text-foreground">{wallet?.bankDetails.bank_name}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Số tài khoản</span>
                          <span className="text-xs font-mono font-bold text-foreground">{wallet?.bankDetails.bank_account_number}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tên thụ hưởng</span>
                          <span className="text-xs font-mono font-bold text-foreground uppercase">{wallet?.bankDetails.bank_account_name}</span>
                        </div>
                        {wallet?.bankDetails.bank_branch && (
                          <div className="flex items-start justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Chi nhánh</span>
                            <span className="text-xs font-medium text-muted-foreground">{wallet?.bankDetails.bank_branch}</span>
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
                    <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2">
                      <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Đã kích hoạt rút tiền</span>
                        <p className="text-[9.5px] text-muted-foreground mt-0.5 leading-relaxed">
                          Tài khoản ngân hàng của bạn đã sẵn sàng để đối soát và nhận tiền chuyển khoản định kỳ của nền tảng.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── PAYOUT HISTORY TABLE ────────────────────────── */}
            <div className="md:col-span-2">
              <Card className="border border-border/60 shadow-sm overflow-hidden h-full">
                <CardHeader className="border-b border-border/60 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-4" />
                      </span>
                      <div>
                        <CardTitle className="text-sm font-semibold">Lịch sử Quyết toán</CardTitle>
                        <CardDescription className="text-xs">Lịch sử các đợt Admin thanh toán công nợ</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
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
                              <TableRow key={batch.id} className="border-b border-border/40 hover:bg-muted/10">
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
                                <TableCell className="py-3 text-xs text-right font-display font-bold italic tabular-nums">
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
                                      <Button variant="ghost" size="sm" className="h-7 text-[10.5px] font-semibold rounded-full px-2.5">
                                        Xem chi tiết
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md rounded-2xl">
                                      <DialogHeader>
                                        <DialogTitle className="text-sm font-semibold">Đợt Chi trả Chi tiết</DialogTitle>
                                        <DialogDescription className="text-xs">Mã đợt chi: {batch.id}</DialogDescription>
                                      </DialogHeader>

                                      <div className="space-y-4 pt-2">
                                        <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2.5 text-xs">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Nội dung đợt:</span>
                                            <span className="font-semibold">{batch.payout_period}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tổng số tiền nhận:</span>
                                            <span className="font-bold text-primary font-display italic text-sm">{formatPrice(Number(batch.total_payout))}</span>
                                          </div>
                                          <div className="flex justify-between">
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
                                            <span>{new Date(batch.created_at).toLocaleString("vi-VN")}</span>
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
                                            <h4 className="text-xs font-semibold">Chứng từ Quyết toán từ Admin</h4>
                                            <div className="rounded-xl border border-border bg-background p-3 space-y-2 text-xs">
                                              {batch.transaction_ref && (
                                                <div className="flex justify-between">
                                                  <span className="text-muted-foreground">Mã giao dịch ngân hàng:</span>
                                                  <span className="font-mono font-semibold">{batch.transaction_ref}</span>
                                                </div>
                                              )}
                                              {batch.note && (
                                                <div className="flex flex-col gap-1">
                                                  <span className="text-muted-foreground">Ghi chú phản hồi:</span>
                                                  <p className="bg-muted/30 p-2 rounded-lg text-[11px] text-muted-foreground italic leading-normal">
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
                                        <Button type="button" variant="outline" className="h-8 rounded-full text-xs font-semibold">
                                          Đóng lại
                                        </Button>
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
