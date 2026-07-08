import {
  Alert,
  AlertDescription,
  AlertTitle as UIAlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useBankDetailsForm } from "@/hooks/owner/useBankDetailsForm";
import type { OwnerWalletResponse } from "@/types";
import { getBankDisplayName, VIETNAM_BANKS } from "@/utils";
import { AlertCircle, CreditCard, ShieldCheck } from "lucide-react";

interface BankDetailsCardProps {
  wallet: OwnerWalletResponse | null;
  hasConfiguredBank: boolean;
  onSuccess: () => void;
}

export function BankDetailsCard({
  wallet,
  hasConfiguredBank,
  onSuccess,
}: BankDetailsCardProps) {
  const {
    bankName,
    setBankName,
    bankAccountNumber,
    setBankAccountNumber,
    bankAccountName,
    setBankAccountName,
    bankBranch,
    setBankBranch,
    isEditingBank,
    setIsEditingBank,
    isSubmitting,
    handleUpdateBankDetails,
  } = useBankDetailsForm({ wallet, onSuccess });

  return (
    <Card className="border border-border/60 shadow-sm overflow-hidden h-full">
      <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="size-4" />
          </span>
          <div className="flex flex-col">
            <CardTitle className="text-base font-bold text-foreground">
              Tài khoản Ngân hàng
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Nhận tiền quyết toán doanh thu nội địa
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="opacity-60" />
      <CardContent className="p-4 md:p-5">
        {!hasConfiguredBank && !isEditingBank ? (
          <div className="flex flex-col items-center justify-center text-center p-4 py-8 border border-dashed border-border rounded-xl bg-background/50">
            <AlertCircle className="size-8 text-amber-500 stroke-[1.5] mb-2 animate-bounce" />
            <span className="text-xs font-semibold text-foreground">
              Chưa cấu hình tài khoản
            </span>
            <p className="text-[10.5px] text-muted-foreground max-w-xs mt-1 mb-4">
              Vui lòng thiết lập tài khoản ngân hàng nội địa để có thể gửi yêu
              cầu chi trả doanh thu từ hệ thống.
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
              <Label
                htmlFor="bankName"
                className="text-xs font-medium text-foreground/80"
              >
                Tên Ngân hàng <span className="text-destructive">*</span>
              </Label>
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
              <Label
                htmlFor="bankAccountNumber"
                className="text-xs font-medium text-foreground/80"
              >
                Số Tài khoản <span className="text-destructive">*</span>
              </Label>
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
              <Label
                htmlFor="bankAccountName"
                className="text-xs font-medium text-foreground/80"
              >
                Tên Chủ Tài khoản <span className="text-destructive">*</span>
              </Label>
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
              <Label
                htmlFor="bankBranch"
                className="text-xs font-medium text-foreground/80"
              >
                Chi nhánh (Không bắt buộc)
              </Label>
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
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Ngân hàng
                </span>
                <span className="text-xs font-bold text-foreground uppercase">
                  {getBankDisplayName(wallet?.bankDetails?.bank_name || "")}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Số tài khoản
                </span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {wallet?.bankDetails?.bank_account_number}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tên thụ hưởng
                </span>
                <span className="text-xs font-mono font-bold text-foreground uppercase">
                  {wallet?.bankDetails?.bank_account_name}
                </span>
              </div>
              {wallet?.bankDetails?.bank_branch && (
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Chi nhánh
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {wallet?.bankDetails?.bank_branch}
                  </span>
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
            <UIAlertTitle className="text-[10px] font-bold">
              Đã kích hoạt rút tiền
            </UIAlertTitle>
            <AlertDescription className="text-[9.5px] leading-relaxed text-muted-foreground mt-0.5">
              Tài khoản ngân hàng của bạn đã sẵn sàng để đối soát và nhận tiền
              chuyển khoản định kỳ của nền tảng.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
