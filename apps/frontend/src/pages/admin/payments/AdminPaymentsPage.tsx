import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminPaymentStore } from "@/store/admin/useAdminPaymentStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Search, Receipt, CreditCard, User, Calendar, 
  CheckCircle2, XCircle, RefreshCcw, TrendingUp, 
  AlertCircle, ArrowRightLeft, Info, MapPin
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-blue-100 text-blue-800",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

export default function AdminPaymentsPage() {
  const {
    payments,
    pagination,
    isLoading,
    filters,
    queryParams,
    fetchPayments,
    setFilters,
    setPage,
  } = useAdminPaymentStore();

  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (filters.search || "")) {
        setFilters({ search: searchValue });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Tính toán stats nhanh từ data hiện tại (Client-side stats cho page này)
  const quickStats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + (p.status === 'SUCCESS' ? Number(p.amount) : 0), 0);
    const failedCount = payments.filter(p => p.status === 'FAILED').length;
    const refundTotal = payments.reduce((sum, p) => sum + (p.status === 'REFUNDED' ? Number(p.amount) : 0), 0);
    
    return { total, failedCount, refundTotal };
  }, [payments]);

  const handleRowClick = (payment: any) => {
    setSelectedPayment(payment);
    setDetailOpen(true);
  };

  const columns: Column<any>[] = [
    {
      header: "Mã giao dịch",
      className: "w-48",
      cell: (payment) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase">
            <Receipt className="w-3.5 h-3.5 text-primary" />
            <span>{payment.transaction_code}</span>
          </div>
          <span className="text-[10px] text-muted-foreground ml-5 italic">
            Created: {format(new Date(payment.created_at), "HH:mm dd/MM")}
          </span>
        </div>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-56",
      cell: (payment) => {
        const player = payment.bookings?.[0]?.player;
        if (!player) return <span className="text-muted-foreground italic">N/A</span>;
        return (
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px]">
              {player.account.full_name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[150px]">{player.account.full_name}</span>
              <span className="text-[10px] text-muted-foreground">{player.account.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Số tiền",
      className: "w-32",
      cell: (payment) => (
        <div className="font-bold text-sm text-foreground">
          {formatPrice(payment.amount)}
        </div>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (payment) => {
        const status = payment.status;
        return (
          <Badge className={`${PAYMENT_STATUS_COLORS[status]} border-none flex items-center gap-1 w-fit shadow-none text-[10px] py-0 h-5`}>
            {PAYMENT_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      header: "",
      className: "w-10",
      cell: () => <Info className="w-4 h-4 text-muted-foreground/50" />,
    }
  ];

  return (
    <div className="px-4 lg:px-6 space-y-6 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Giám sát Thanh toán</h1>
        <p className="text-sm text-muted-foreground text-balance">
          Theo dõi luồng tiền và đối soát giao dịch thời gian thực.
        </p>
      </div>

      {/* Mini Stats Headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-none bg-slate-900 text-white">
          <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Tổng thu (Trang này)</CardTitle>
            <TrendingUp className="size-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(quickStats.total)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Giao dịch lỗi</CardTitle>
            <AlertCircle className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.failedCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Hoàn tiền</CardTitle>
            <ArrowRightLeft className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(quickStats.refundTotal)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo Mã giao dịch, Tên khách, Email..."
            className="pl-9 h-9 shadow-none border-slate-200"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.status || "ALL"}
            onValueChange={(value) => setFilters({ status: value === "ALL" ? undefined : value })}
          >
            <SelectTrigger className="w-[160px] h-9 shadow-none border-slate-200">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={payments}
        columns={columns}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        pagination={{
          page: queryParams.page,
          totalPages: pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyMessage="Không tìm thấy giao dịch nào"
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl overflow-hidden p-0 gap-0">
          <DialogHeader className="p-6 bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Chi tiết giao dịch
              </DialogTitle>
              {selectedPayment && (
                <Badge className={PAYMENT_STATUS_COLORS[selectedPayment.status]}>
                  {PAYMENT_STATUS_LABELS[selectedPayment.status]}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedPayment && (
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Thông tin chính */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Mã giao dịch</p>
                  <p className="text-sm font-mono font-bold break-all">{selectedPayment.transaction_code}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Số tiền</p>
                  <p className="text-xl font-black text-green-700">{formatPrice(selectedPayment.amount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-dashed">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-slate-100"><User className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Khách hàng</p>
                      <p className="text-sm font-semibold">{selectedPayment.bookings?.[0]?.player.account.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-slate-100"><CreditCard className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Phương thức</p>
                      <p className="text-sm font-semibold">{selectedPayment.provider}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-slate-100"><Calendar className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Thời gian</p>
                      <p className="text-sm font-semibold">{format(new Date(selectedPayment.created_at), "HH:mm - dd/MM/yyyy", { locale: vi })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách Booking liên quan */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                  Các mục trong thanh toán ({selectedPayment.bookings?.length})
                </p>
                <div className="space-y-2">
                  {selectedPayment.bookings?.map((booking: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-md bg-white border flex items-center justify-center font-bold text-xs text-slate-400">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500" />
                            {booking.sub_field?.complex?.complex_name || "N/A"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {booking.sub_field?.sub_field_name || "Unknown Field"} • {format(new Date(booking.start_time), "dd/MM HH:mm")}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold">{formatPrice(booking.total_price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
