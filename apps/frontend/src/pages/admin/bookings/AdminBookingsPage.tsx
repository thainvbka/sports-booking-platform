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
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  SPORT_TYPE_LABELS,
} from "@/lib/constants";
import { useAdminBookingStore } from "@/store/admin/useAdminBookingStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Search, User, MapPin, Clock, Calendar, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminBookingsPage() {
  const {
    bookings,
    pagination,
    isLoading,
    filters,
    queryParams,
    fetchBookings,
    setFilters,
    setPage,
  } = useAdminBookingStore();

  const [searchValue, setSearchValue] = useState(filters.search || "");

  useEffect(() => {
    fetchBookings();
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
      header: "Mã đặt sân",
      className: "w-32",
      cell: (booking) => (
        <span className="text-xs font-mono text-muted-foreground uppercase truncate block w-24">
          {booking.id.split("-")[0]}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-56",
      cell: (booking) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 font-medium">
            <User className="w-3.5 h-3.5 text-blue-500" />
            <span className="truncate">{booking.player.account.full_name}</span>
          </div>
          <span className="text-xs text-muted-foreground ml-5">
            {booking.player.account.phone_number}
          </span>
        </div>
      ),
    },
    {
      header: "Sân bóng & Khu vực",
      className: "w-64",
      cell: (booking) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 font-medium text-sm">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span className="truncate">{booking.sub_field.complex.complex_name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-5">
            <span>{booking.sub_field.sub_field_name}</span>
            <span>•</span>
            <span>{SPORT_TYPE_LABELS[booking.sub_field.sport_type as any]}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-5 italic">
            <ShieldCheck className="w-2.5 h-2.5" />
            <span>Chủ: {booking.sub_field.complex.owner.company_name}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Thời gian",
      className: "w-48",
      cell: (booking) => (
        <div className="flex flex-col gap-0.5 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{format(new Date(booking.start_time), "dd/MM/yyyy", { locale: vi })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {format(new Date(booking.start_time), "HH:mm")} - {format(new Date(booking.end_time), "HH:mm")}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Thanh toán",
      className: "w-32",
      cell: (booking) => (
        <div className="font-semibold text-green-700">
          {formatPrice(booking.total_price)}
        </div>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (booking) => (
        <Badge className={BOOKING_STATUS_COLORS[booking.status as any]}>
          {BOOKING_STATUS_LABELS[booking.status as any]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Giám sát Đặt sân</h1>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo Mã, Tên khách, hoặc Tên sân..."
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
              {Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={bookings}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          page: queryParams.page,
          totalPages: pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyMessage="Không tìm thấy lịch đặt sân nào"
      />
    </div>
  );
}
