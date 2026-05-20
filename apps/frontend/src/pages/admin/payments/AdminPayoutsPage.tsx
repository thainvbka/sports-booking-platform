import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AdminPageHeader } from "@/components/admin/shell/AdminPageHeader";
import { AdminFiltersBar } from "@/components/admin/shell/AdminFiltersBar";
import { AdminTableSection } from "@/components/admin/shell/AdminTableSection";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  payoutService,
  type AdminPayoutBatchRecord,
  type PayoutStatus,
} from "@/services/payout.service";
import { formatPrice } from "@/utils";
import {
  Receipt,
  User,
  CreditCard,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
  FileText,
  Eye,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-800 dark:bg-slate-500/15 dark:text-slate-300",
  REQUESTED: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  PAID: "bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  CANCELLED: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Tích lũy",
  REQUESTED: "Yêu cầu rút",
  PROCESSING: "Đang xử lý",
  PAID: "Đã quyết toán",
  CANCELLED: "Đã từ chối",
};

export default function AdminPayoutsPage() {
  const [batches, setBatches] = useState<AdminPayoutBatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog States
  const [selectedBatch, setSelectedBatch] = useState<AdminPayoutBatchRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  // Form Fields
  const [transactionRef, setTransactionRef] = useState("");
  const [receiptImage, setReceiptImage] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const loadPayoutBatches = async () => {
    setIsLoading(true);
    try {
      const filter = statusFilter === "ALL" ? undefined : (statusFilter as PayoutStatus);
      const response = await payoutService.adminGetPayoutBatches(filter);
      if (response.success && response.data) {
        setBatches(response.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách đợt chi trả");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayoutBatches();
  }, [statusFilter]);

  const handleProcessBatch = async (batchId: string) => {
    setIsSubmitting(true);
    try {
      const response = await payoutService.adminProcessPayoutBatch(batchId);
      if (response.success) {
        toast.success("Đợt chi trả đã chuyển sang trạng thái Đang xử lý");
        loadPayoutBatches();
        setDetailOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể bắt đầu xử lý đợt chi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    if (!transactionRef.trim()) {
      toast.error("Vui lòng điền mã giao dịch ngân hàng đối soát.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await payoutService.adminApprovePayoutBatch(selectedBatch.id, {
        transaction_ref: transactionRef,
        receipt_image: receiptImage || undefined,
        note: adminNote || undefined,
      });

      if (response.success) {
        toast.success("Phê duyệt quyết toán thành công! Trạng thái đã chuyển thành PAID.");
        setApproveOpen(false);
        setDetailOpen(false);
        setTransactionRef("");
        setReceiptImage("");
        setAdminNote("");
        loadPayoutBatches();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Phê duyệt chi trả thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);
    try {
      const response = await payoutService.adminCancelPayoutBatch(selectedBatch.id, adminNote);
      if (response.success) {
        toast.success("Từ chối và hủy đợt chi thành công! Số dư đã trả về ví chủ sân.");
        setCancelOpen(false);
        setDetailOpen(false);
        setAdminNote("");
        loadPayoutBatches();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Từ chối đợt chi thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search local
  const filteredBatches = batches.filter((batch) => {
    const ownerName = batch.owner?.company_name || "";
    const bankName = batch.owner?.bank_name || "";
    const bankNum = batch.owner?.bank_account_number || "";
    const email = batch.owner?.account?.email || "";
    const s = searchTerm.toLowerCase();

    return (
      ownerName.toLowerCase().includes(s) ||
      bankName.toLowerCase().includes(s) ||
      bankNum.includes(s) ||
      email.toLowerCase().includes(s)
    );
  });

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
            {format(new Date(batch.created_at), "HH:mm · dd/MM/yyyy", { locale: vi })}
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
              <span className="font-semibold">{batch.owner.bank_name}</span>
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
            STATUS_COLORS[batch.status]
          )}
        >
          {STATUS_LABELS[batch.status]}
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
          onClick={() => {
            setSelectedBatch(batch);
            setDetailOpen(true);
          }}
        >
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 lg:px-6">
      <AdminPageHeader
        index={5}
        title="Quản lý"
        titleAccent="chi trả (payout)"
        description="Duyệt yêu cầu rút tiền từ VNPAY của các chủ sân, gom giao dịch và ghi nhận đối soát chứng từ."
      />

      <AdminFiltersBar>
        <div className="relative flex-1">
          <Input
            placeholder="Tìm theo chủ sân, ngân hàng, STK thụ hưởng..."
            className="h-9 pl-3 text-xs rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full shrink-0 md:w-[180px] rounded-xl text-xs">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="REQUESTED">Chờ duyệt</SelectItem>
            <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
            <SelectItem value="PAID">Đã quyết toán</SelectItem>
            <SelectItem value="CANCELLED">Đã từ chối</SelectItem>
          </SelectContent>
        </Select>
      </AdminFiltersBar>

      <AdminTableSection
        index={5}
        eyebrow="Payout · Settlement"
        title="Bảng đối soát chi trả"
        description="Nhấp vào biểu tượng con mắt ở cuối dòng để thực hiện chi tiền và duyệt đợt thanh toán."
        count={filteredBatches.length}
        countLabel="đợt chi trả"
      >
        <DataTable
          data={filteredBatches}
          columns={columns}
          isLoading={isLoading}
          paginationStyle="search"
          pagination={{
            page: 1,
            totalPages: 1,
            onPageChange: () => {},
          }}
          emptyMessage="Không tìm thấy yêu cầu chi trả nào phù hợp"
        />
      </AdminTableSection>

      {/* ── DETAIL DIALOG ─────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Receipt className="size-4 text-primary" />
              Chi tiết Đợt Quyết toán
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mã đối soát: {selectedBatch?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedBatch && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/20 p-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Chủ sân</span>
                  <span className="text-sm font-bold text-foreground">{selectedBatch.owner?.company_name}</span>
                  <span className="text-[10px] text-muted-foreground">{selectedBatch.owner?.account?.email}</span>
                </div>
                <div className="flex flex-col gap-0.5 items-end text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Số tiền yêu cầu</span>
                  <span className="font-display text-xl font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
                    {formatPrice(Number(selectedBatch.total_payout))}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5 border-none px-2 mt-1 text-[9.5px] font-semibold uppercase tracking-wider",
                      STATUS_COLORS[selectedBatch.status]
                    )}
                  >
                    {STATUS_LABELS[selectedBatch.status]}
                  </Badge>
                </div>
              </div>

              {/* Bank Account Info Card */}
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-3">
                <h4 className="font-semibold flex items-center gap-1.5 border-b border-border pb-1.5 text-xs">
                  <CreditCard className="size-3.5 text-primary" />
                  Thông tin Tài khoản Thụ hưởng
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[10px] uppercase">Ngân hàng</span>
                    <span className="font-bold">{selectedBatch.owner?.bank_name}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-muted-foreground text-[10px] uppercase">Số tài khoản</span>
                    <span className="font-mono font-bold text-primary">{selectedBatch.owner?.bank_account_number}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-2">
                    <span className="text-muted-foreground text-[10px] uppercase">Họ và tên thụ hưởng</span>
                    <span className="font-mono font-bold uppercase">{selectedBatch.owner?.bank_account_name}</span>
                  </div>
                  {selectedBatch.owner?.bank_branch && (
                    <div className="flex flex-col gap-0.5 text-right mt-2">
                      <span className="text-muted-foreground text-[10px] uppercase">Chi nhánh</span>
                      <span className="font-medium text-muted-foreground">{selectedBatch.owner.bank_branch}</span>
                    </div>
                  )}
                </div>

                {/* VietQR Quick Generator (WOW factor) */}
                {selectedBatch.status !== "PAID" && selectedBatch.owner?.bank_name && (
                  <div className="pt-3 border-t border-dashed border-border/80 flex justify-center">
                    <a
                      href={`https://img.vietqr.io/image/${selectedBatch.owner.bank_name}-${selectedBatch.owner.bank_account_number}-compact.png?amount=${selectedBatch.total_payout}&addInfo=${encodeURIComponent(
                        selectedBatch.payout_period
                      )}&accountName=${encodeURIComponent(selectedBatch.owner.bank_account_name || "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                      Quét mã chuyển khoản VietQR tự động
                    </a>
                  </div>
                )}
              </div>

              {/* Payout batch logs */}
              {selectedBatch.status === "PAID" && (
                <div className="rounded-xl border border-border bg-background p-3.5 space-y-2.5">
                  <h4 className="font-semibold text-xs border-b border-border pb-1.5">Chứng từ thanh toán</h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã giao dịch đối soát:</span>
                    <span className="font-mono font-semibold">{selectedBatch.transaction_ref}</span>
                  </div>
                  {selectedBatch.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thời gian hoàn thành chi:</span>
                      <span>{new Date(selectedBatch.paid_at).toLocaleString("vi-VN")}</span>
                    </div>
                  )}
                  {selectedBatch.note && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Ghi chú đối soát:</span>
                      <p className="bg-muted/40 p-2 rounded-lg text-muted-foreground italic leading-normal">
                        {selectedBatch.note}
                      </p>
                    </div>
                  )}
                  {selectedBatch.receipt_image && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Ảnh ủy nhiệm chi (UNC):</span>
                      <a href={selectedBatch.receipt_image} target="_blank" rel="noopener noreferrer" className="block max-w-xs mt-1">
                        <img src={selectedBatch.receipt_image} alt="UNC Receipt" className="rounded-lg max-h-24 object-cover border border-border" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Action Box based on Status */}
              <div className="flex gap-2 pt-2 justify-end">
                {selectedBatch.status === "REQUESTED" && (
                  <Button
                    onClick={() => handleProcessBatch(selectedBatch.id)}
                    disabled={isSubmitting}
                    className="h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-semibold"
                  >
                    Bắt đầu Xử lý đợt chi
                  </Button>
                )}

                {(selectedBatch.status === "REQUESTED" || selectedBatch.status === "PROCESSING") && (
                  <>
                    <Button
                      onClick={() => setApproveOpen(true)}
                      className="h-8 rounded-full bg-green-600 hover:bg-green-500 text-xs font-semibold"
                    >
                      Xác nhận Đã chuyển khoản
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setCancelOpen(true)}
                      className="h-8 rounded-full text-rose-600 hover:bg-rose-50/50 hover:text-rose-600 text-xs font-semibold px-3"
                    >
                      Từ chối chi trả
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setDetailOpen(false)}
                  className="h-8 rounded-full text-xs font-semibold"
                >
                  Đóng lại
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── APPROVE PAYOUT DIALOG ─────────────────────────── */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <form onSubmit={handleApproveBatch} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Xác nhận Đối soát Quyết toán
              </DialogTitle>
              <DialogDescription className="text-xs">
                Vui lòng điền thông tin chứng từ chứng minh bạn đã chuyển tiền thành công cho chủ sân.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="txRef" className="text-xs font-medium">
                  Mã giao dịch ngân hàng (Transaction Ref) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="txRef"
                  placeholder="Ví dụ: FT26140XXXXX hoặc mã giao dịch bank"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  required
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="receiptImg" className="text-xs font-medium">
                  Đường dẫn ảnh hóa đơn/UNC (Receipt Image)
                </Label>
                <Input
                  id="receiptImg"
                  placeholder="Ví dụ: https://image-url.com/receipt.jpg"
                  value={receiptImage}
                  onChange={(e) => setReceiptImage(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note" className="text-xs font-medium">
                  Ghi chú phản hồi
                </Label>
                <Textarea
                  id="note"
                  placeholder="Ví dụ: Quyết toán toàn bộ doanh thu đợt booking VNPAY..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold px-4"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận & Hoàn tất"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setApproveOpen(false)}
                className="h-8 rounded-full text-xs font-semibold px-3"
              >
                Hủy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── CANCEL PAYOUT DIALOG ──────────────────────────── */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <form onSubmit={handleCancelBatch} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                <XCircle className="size-4 text-rose-500" />
                Từ chối Yêu cầu Chi trả
              </DialogTitle>
              <DialogDescription className="text-xs">
                Khi từ chối, toàn bộ số dư con sẽ được hoàn trả về trạng thái PENDING khả dụng trong ví chủ sân.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="cancelNote" className="text-xs font-medium">
                  Lý do từ chối yêu cầu quyết toán <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="cancelNote"
                  placeholder="Ví dụ: Thông tin tài khoản thụ hưởng sai lệch hoặc ngân hàng báo lỗi..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  required
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-xs font-semibold px-4"
              >
                {isSubmitting ? "Đang xử lý..." : "Từ chối yêu cầu"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCancelOpen(false)}
                className="h-8 rounded-full text-xs font-semibold px-3"
              >
                Hủy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
