import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminPaymentStore } from "@/store/admin/useAdminPaymentStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Search, Receipt, CreditCard, User, Calendar, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetchPayments();
  }, []);

  // Debounce search
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

  const columns: Column<any>[] = [
    {
      header: "Mã giao dịch",
      className: "w-48",
      cell: (payment) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase">
            <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{payment.transaction_code}</span>
          </div>
          <span className="text-[10px] text-muted-foreground ml-5 italic">
            ID: {payment.id.split("-")[0]}...
          </span>
        </div>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-56",
      cell: (payment) => {
        const player = payment.bookings?.[0]?.player;
        if (!player) return <span className="text-muted-foreground">N/A</span>;
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span className="truncate">{player.account.full_name}</span>
            </div>
            <span className="text-xs text-muted-foreground ml-5">
              {player.account.email}
            </span>
          </div>
        );
      },
    },
    {
      header: "Số tiền",
      className: "w-32",
      cell: (payment) => (
        <div className="font-bold text-base text-foreground">
          {formatPrice(payment.amount)}
        </div>
      ),
    },
    {
      header: "Phương thức",
      className: "w-32",
      cell: (payment) => (
        <div className="flex items-center gap-1.5">
          <div className="bg-slate-100 p-1 rounded">
            <CreditCard className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <span className="text-sm font-medium">{payment.provider}</span>
        </div>
      ),
    },
    {
      header: "Thời gian",
      className: "w-40",
      cell: (payment) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{format(new Date(payment.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}</span>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (payment) => {
        const status = payment.status;
        const Icon = status === "SUCCESS" ? CheckCircle2 : status === "FAILED" ? XCircle : RefreshCcw;
        return (
          <Badge className={`${PAYMENT_STATUS_COLORS[status]} border-none flex items-center gap-1 w-fit shadow-none`}>
            <Icon className="w-3 h-3" />
            {PAYMENT_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Giám sát Thanh toán</h1>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo Mã giao dịch..."
            className="pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.status || "ALL"}
            onValueChange={(value) => setFilters({ status: value === "ALL" ? undefined : value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={payments}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          page: queryParams.page,
          totalPages: pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyMessage="Không tìm thấy giao dịch nào"
      />
    </div>
  );
}
