import {
  AdminDetailDialog,
  DetailInfoCard,
  DetailSummaryRow,
} from "@/components/admin/details/AdminDetailDialog";
import { AdminFiltersBar } from "@/components/admin/shell/AdminFiltersBar";
import { AdminPageHeader } from "@/components/admin/shell/AdminPageHeader";
import { AdminTableSection } from "@/components/admin/shell/AdminTableSection";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PAYOUT_STATUS_COLORS, PAYOUT_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  payoutService,
  type AdminOwnerWalletRecord,
  type AdminPayoutBatchRecord,
  type PayoutStatus,
} from "@/services/payout.service";
import { formatDateVn, formatPrice, getBankDisplayName } from "@/utils";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  Receipt,
  RefreshCw,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";





export default function AdminPayoutsPage() {
  const [activeTab, setActiveTab] = useState<"requests" | "wallets">("requests");
  const [batches, setBatches] = useState<AdminPayoutBatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Wallets Overview States
  const [wallets, setWallets] = useState<AdminOwnerWalletRecord[]>([]);
  const [isWalletsLoading, setIsWalletsLoading] = useState(false);
  const [walletSearchTerm, setWalletSearchTerm] = useState("");

  // Dialog States
  const [selectedBatch, setSelectedBatch] = useState<AdminPayoutBatchRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  // Form Fields
  const [transactionRef, setTransactionRef] = useState("");
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

  const loadOwnerWallets = async () => {
    setIsWalletsLoading(true);
    try {
      const response = await payoutService.adminGetOwnerWallets();
      if (response.success && response.data) {
        setWallets(response.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách ví chủ sân");
    } finally {
      setIsWalletsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "requests") {
      loadPayoutBatches();
    }
  }, [statusFilter, activeTab]);

  useEffect(() => {
    if (activeTab === "wallets") {
      loadOwnerWallets();
    }
  }, [activeTab]);

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
        note: adminNote || undefined,
      });

      if (response.success) {
        toast.success("Phê duyệt quyết toán thành công! Trạng thái đã chuyển thành PAID.");
        setApproveOpen(false);
        setDetailOpen(false);
        setTransactionRef("");
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

  const walletColumns: Column<AdminOwnerWalletRecord>[] = [
    {
      header: "Chủ sân (Owner)",
      className: "w-56",
      cell: (w) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{w.company_name}</span>
          <span className="text-[10.5px] text-muted-foreground">{w.account?.email}</span>
          <span className="text-[10px] text-muted-foreground">{w.account?.phone_number}</span>
        </div>
      ),
    },
    {
      header: "Tài khoản nhận",
      className: "w-64",
      cell: (w) => {
        if (!w.bankDetails?.bank_name) {
          return <span className="text-xs italic text-rose-500">Chưa thiết lập ngân hàng</span>;
        }
        return (
          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2 text-xs border border-border/40">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bank:</span>
              <span className="font-semibold">{getBankDisplayName(w.bankDetails.bank_name)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">STK:</span>
              <span className="font-mono font-bold text-primary">{w.bankDetails.bank_account_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tên:</span>
              <span className="uppercase font-mono font-semibold">{w.bankDetails.bank_account_name}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Chưa quyết toán (Tích lũy)",
      className: "w-44 text-right",
      cell: (w) => (
        <div className="text-right font-display text-sm font-black italic tracking-tight text-amber-600 dark:text-amber-400">
          {formatPrice(w.balances.pending)}
        </div>
      ),
    },
    {
      header: "Đang yêu cầu rút",
      className: "w-44 text-right",
      cell: (w) => (
        <div className="text-right font-display text-sm font-black italic tracking-tight text-blue-600 dark:text-blue-400">
          {formatPrice(w.balances.requested)}
        </div>
      ),
    },
    {
      header: "Đã chi trả (Paid)",
      className: "w-44 text-right",
      cell: (w) => (
        <div className="text-right font-display text-sm font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
          {formatPrice(w.balances.paid)}
        </div>
      ),
    },
  ];

  const filteredWallets = wallets.filter((w) => {
    const ownerName = w.company_name || "";
    const bankName = w.bankDetails?.bank_name || "";
    const bankNum = w.bankDetails?.bank_account_number || "";
    const email = w.account?.email || "";
    const s = walletSearchTerm.toLowerCase();

    return (
      ownerName.toLowerCase().includes(s) ||
      bankName.toLowerCase().includes(s) ||
      bankNum.includes(s) ||
      email.toLowerCase().includes(s)
    );
  });

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 lg:px-6">
      <AdminPageHeader
        index={5}
        title="Quản lý"
        titleAccent="công nợ"
        description="Duyệt, quyết toán yêu cầu rút tiền từ VNPAY của các chủ sân."
      />

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-border/60 pb-3">
        <Button
          variant={activeTab === "requests" ? "default" : "ghost"}
          className="rounded-full text-xs font-semibold h-8"
          onClick={() => setActiveTab("requests")}
        >
          Yêu cầu chi trả ({batches.filter(b => b.status === "REQUESTED").length} chờ duyệt)
        </Button>
        <Button
          variant={activeTab === "wallets" ? "default" : "ghost"}
          className="rounded-full text-xs font-semibold h-8"
          onClick={() => setActiveTab("wallets")}
        >
          Số dư & Ví chủ sân ({wallets.length})
        </Button>
      </div>

      {activeTab === "requests" ? (
        <>
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
            description="Nhấp vào bất kỳ dòng nào trên bảng để xem chi tiết đối soát chứng từ và duyệt đợt thanh toán."
            count={filteredBatches.length}
            countLabel="đợt chi trả"
          >
            <DataTable
              data={filteredBatches}
              columns={columns}
              isLoading={isLoading}
              paginationStyle="search"
              onRowClick={(batch) => {
                setSelectedBatch(batch);
                setDetailOpen(true);
              }}
              pagination={{
                page: 1,
                totalPages: 1,
                onPageChange: () => {},
              }}
              emptyMessage="Không tìm thấy yêu cầu chi trả nào phù hợp"
            />
          </AdminTableSection>
        </>
      ) : (
        <>
          <AdminFiltersBar>
            <div className="relative flex-1">
              <Input
                placeholder="Tìm theo tên chủ sân, email, ngân hàng, STK..."
                className="h-9 pl-3 text-xs rounded-xl"
                value={walletSearchTerm}
                onChange={(e) => setWalletSearchTerm(e.target.value)}
              />
            </div>
          </AdminFiltersBar>

          <AdminTableSection
            index={5}
            eyebrow="Owners · Wallets"
            title="Bảng tổng quan ví & số dư chủ sân"
            description="Theo dõi toàn bộ số dư tích lũy chưa quyết toán (nợ đọng), đang yêu cầu rút, và lũy kế đã trả của từng chủ sân."
            count={filteredWallets.length}
            countLabel="chủ sân"
          >
            <DataTable
              data={filteredWallets}
              columns={walletColumns}
              isLoading={isWalletsLoading}
              paginationStyle="search"
              pagination={{
                page: 1,
                totalPages: 1,
                onPageChange: () => {},
              }}
              emptyMessage="Không tìm thấy ví chủ sân nào phù hợp"
            />
          </AdminTableSection>
        </>
      )}

      {/* ── DETAIL DIALOG ─────────────────────────────────── */}
      <AdminDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Chi tiết Đợt Quyết toán"
        icon={Receipt}
        statusLabel={
          selectedBatch
            ? PAYOUT_STATUS_LABELS[selectedBatch.status]
            : undefined
        }
        statusClassName={
          selectedBatch
            ? PAYOUT_STATUS_COLORS[selectedBatch.status]
            : undefined
        }
      >
        {selectedBatch && (
          <div className="max-h-[75vh] space-y-5 overflow-y-auto bg-background p-5 text-xs">
            <DetailSummaryRow
              leftLabel="Chủ sân (Owner)"
              leftValue={
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-foreground">
                    {selectedBatch.owner?.company_name || "N/A"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedBatch.owner?.account?.email}
                  </span>
                </div>
              }
              rightLabel="Số tiền quyết toán"
              rightValue={
                <span className="font-display text-lg font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
                  {formatPrice(Number(selectedBatch.total_payout))}
                </span>
              }
            />

            {/* Bank Account Info Card */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Thông tin Tài khoản Thụ hưởng
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailInfoCard
                  label="Ngân hàng"
                  value={getBankDisplayName(selectedBatch.owner?.bank_name || "")}
                />
                <DetailInfoCard
                  label="Số tài khoản"
                  value={
                    <span className="font-mono font-bold text-primary">
                      {selectedBatch.owner?.bank_account_number || "N/A"}
                    </span>
                  }
                />
                <DetailInfoCard
                  label="Họ và tên thụ hưởng"
                  value={selectedBatch.owner?.bank_account_name || "N/A"}
                />
                {selectedBatch.owner?.bank_branch && (
                  <DetailInfoCard
                    label="Chi nhánh"
                    value={selectedBatch.owner.bank_branch}
                  />
                )}
              </div>
            </div>

            {/* VietQR Quick Generator (WOW factor) */}
            {selectedBatch.status !== "PAID" && selectedBatch.owner?.bank_name && (
              <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-4 flex flex-col items-center gap-3">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
                  <ExternalLink className="size-4" />
                  Quét mã chuyển khoản VietQR tự động
                </span>
                <div className="bg-white dark:bg-white p-2.5 rounded-lg shadow-sm border border-border">
                  <img
                    src={`https://img.vietqr.io/image/${selectedBatch.owner.bank_name}-${selectedBatch.owner.bank_account_number}-compact.png?amount=${selectedBatch.total_payout}&addInfo=${encodeURIComponent(
                      selectedBatch.payout_period
                    )}&accountName=${encodeURIComponent(selectedBatch.owner.bank_account_name || "")}`}
                    alt="VietQR code"
                    className="size-32 object-contain"
                  />
                </div>
                <p className="text-[10px] text-center text-muted-foreground leading-normal max-w-xs">
                  Mở ứng dụng Mobile Banking của bạn, quét mã QR này để tự động điền thông tin người nhận, số tiền và nội dung chuyển khoản chính xác 100%.
                </p>
              </div>
            )}

            {/* Payout batch logs */}
            {selectedBatch.status === "PAID" && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Chứng từ thanh toán
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailInfoCard
                    label="Mã giao dịch đối soát"
                    value={
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {selectedBatch.transaction_ref}
                      </span>
                    }
                  />
                  <DetailInfoCard
                    label="Thời gian hoàn thành chi"
                    value={
                      selectedBatch.paid_at
                        ? formatDateVn(selectedBatch.paid_at, "HH:mm · dd/MM/yyyy")
                        : "N/A"
                    }
                  />
                </div>
                {selectedBatch.note && (
                  <DetailInfoCard
                    label="Ghi chú đối soát"
                    value={
                      <p className="text-xs italic leading-relaxed text-muted-foreground">
                        {selectedBatch.note}
                      </p>
                    }
                  />
                )}
              </div>
            )}

            {/* Action Box based on Status */}
            <div className="flex flex-wrap gap-2 pt-2 justify-end border-t border-border mt-4">
              {selectedBatch.status === "REQUESTED" && (
                <Button
                  onClick={() => handleProcessBatch(selectedBatch.id)}
                  disabled={isSubmitting}
                  className="h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
                >
                  <RefreshCw className={cn("size-3 mr-1", isSubmitting && "animate-spin")} />
                  Bắt đầu Xử lý đợt chi
                </Button>
              )}

              {(selectedBatch.status === "REQUESTED" || selectedBatch.status === "PROCESSING") && (
                <>
                  <Button
                    onClick={() => setApproveOpen(true)}
                    className="h-8 rounded-full bg-green-600 hover:bg-green-500 text-xs font-semibold text-white transition-colors"
                  >
                    <CheckCircle2 className="size-3 mr-1" />
                    Xác nhận Đã chuyển khoản
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCancelOpen(true)}
                    className="h-8 rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold px-3 transition-colors dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                  >
                    <XCircle className="size-3 mr-1" />
                    Từ chối chi trả
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => setDetailOpen(false)}
                className="h-8 rounded-full text-xs font-semibold transition-colors"
              >
                Đóng lại
              </Button>
            </div>
          </div>
        )}
      </AdminDetailDialog>

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
