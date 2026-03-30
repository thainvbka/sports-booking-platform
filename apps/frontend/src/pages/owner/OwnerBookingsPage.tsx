import { BookingFilters } from "@/components/owner/BookingFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/shared/DataTable";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  RECURRENCE_TYPE_LABELS,
  SPORT_TYPE_LABELS,
} from "@/lib/constants";
import { useBookingStore } from "@/store/owner/useBookingStore";
import type { OwnerBookingResponse } from "@/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  CalendarRange,
  Clock,
  MapPin,
  MoreVertical,
  Phone,
  Search,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export function OwnerBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Store actions and state
  const {
    bookings,
    stats,
    pagination,
    queryParams,
    filters,
    isLoading,
    fetchBookings,
    fetchStats,
    setFilters,
    clearFilters,
    setPage,
    confirmBooking,
    cancelBooking,
  } = useBookingStore();

  // Local Dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [selectedBookingType, setSelectedBookingType] = useState<
    "SINGLE" | "RECURRING"
  >("SINGLE");
  const [selectedBooking, setSelectedBooking] =
    useState<OwnerBookingResponse | null>(null);

  // Initial fetch
  useEffect(() => {
    fetchStats();
    const urlPage = parseInt(searchParams.get("page") || "1");
    if (urlPage !== queryParams.page) {
      setPage(urlPage);
    } else {
      fetchBookings();
    }
  }, []);

  // Update URL when page changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (queryParams.page > 1) {
      params.set("page", String(queryParams.page));
    } else {
      params.delete("page");
    }
    setSearchParams(params);
  }, [queryParams.page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const timer = setTimeout(() => {
      setFilters({ search: value });
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleViewDetail = (booking: OwnerBookingResponse) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleConfirmClick = (bookingId: string, type: "SINGLE" | "RECURRING") => {
    setSelectedBookingId(bookingId);
    setSelectedBookingType(type);
    setConfirmDialogOpen(true);
  };

  const handleCancelClick = (bookingId: string, type: "SINGLE" | "RECURRING") => {
    setSelectedBookingId(bookingId);
    setSelectedBookingType(type);
    setCancelDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedBookingId) return;
    try {
      await confirmBooking(selectedBookingId, selectedBookingType);
      toast.success("Xác nhận đặt sân thành công");
      setConfirmDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Không thể xác nhận đặt sân");
    }
  };

  const handleCancelAction = async () => {
    if (!selectedBookingId) return;
    try {
      await cancelBooking(selectedBookingId, selectedBookingType);
      toast.success("Hủy đặt sân thành công");
      setCancelDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Không thể hủy đặt sân");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const canConfirmBooking = (booking: OwnerBookingResponse): boolean => {
    return booking.status === "COMPLETED";
  };

  const canCancelBooking = (booking: OwnerBookingResponse): boolean => {
    if (booking.status === "CANCELED") return false;
    const startTime = booking.type === "SINGLE" ? booking.start_time : booking.start_date;
    return new Date(startTime) > new Date();
  };

  // Define table columns
  const columns: Column<OwnerBookingResponse>[] = [
    {
      header: "STT",
      className: "w-15",
      cell: (_, index) => (
        <span className="font-medium text-muted-foreground">
          {(queryParams.page - 1) * queryParams.limit + index + 1}
        </span>
      ),
    },
    {
      header: "Loại",
      className: "w-25 whitespace-nowrap",
      cell: (booking) => (
        <Badge
          variant="secondary"
          className={booking.type === "RECURRING" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}
        >
          {booking.type === "RECURRING" ? "Định kỳ" : "Đơn lẻ"}
        </Badge>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-48",
      cell: (booking) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-medium">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="truncate">{booking.player_name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" />
            {booking.player_phone}
          </div>
        </div>
      ),
    },
    {
      header: "Sân",
      className: "w-48",
      cell: (booking) => (
        <div className="space-y-1">
          <div className="font-medium truncate">{booking.complex_name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {booking.sub_field_name} • {SPORT_TYPE_LABELS[booking.sport_type as any]}
          </div>
        </div>
      ),
    },
    {
      header: "Thời gian",
      className: "w-55 whitespace-nowrap",
      cell: (booking) => (
        booking.type === "RECURRING" ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm">
              <CalendarRange className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-medium">
                {RECURRENCE_TYPE_LABELS[booking.recurrence_type]}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(booking.start_date), "dd/MM/yyyy", { locale: vi })} - {format(new Date(booking.end_date), "dd/MM/yyyy", { locale: vi })}
            </div>
            {booking.bookings?.[0] && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {format(new Date(booking.bookings[0].start_time), "HH:mm")} - {format(new Date(booking.bookings[0].end_time), "HH:mm")} • {booking.total_slots} buổi
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              {format(new Date(booking.start_time), "dd/MM/yyyy", { locale: vi })}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {format(new Date(booking.start_time), "HH:mm")} - {format(new Date(booking.end_time), "HH:mm")}
            </div>
          </div>
        )
      ),
    },
    {
      header: "Giá tiền",
      className: "w-35 whitespace-nowrap",
      cell: (booking) => (
        <div className="font-semibold text-green-700">
          {formatPrice(booking.total_price)}
        </div>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-35 whitespace-nowrap",
      cell: (booking) => (
        <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-16",
      cell: (booking) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetail(booking)}>
              Xem chi tiết
            </DropdownMenuItem>
            {canConfirmBooking(booking) && (
              <DropdownMenuItem onClick={() => handleConfirmClick(booking.id, booking.type)}>
                Xác nhận
              </DropdownMenuItem>
            )}
            {canCancelBooking(booking) && (
              <DropdownMenuItem
                onClick={() => handleCancelClick(booking.id, booking.type)}
                className="text-red-600"
              >
                Hủy đặt sân
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Quản lý lịch đặt sân
        </h1>
        <p className="text-muted-foreground mt-1">
          Xem và quản lý tất cả các lịch đặt sân của bạn
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-5 md:grid-cols-5">
        {[
          { label: "Tổng số lượt đặt", value: stats.total, color: "blue" },
          { label: "Đã xác nhận", value: stats.confirmed, color: "green" },
          { label: "Chờ xác nhận", value: stats.completed, color: "purple" },
          { label: "Chưa thanh toán", value: stats.pending, color: "yellow" },
          { label: "Đã hủy", value: stats.canceled, color: "red" },
        ].map((stat, idx) => (
          <Card key={idx} className={`border-none shadow-md bg-linear-to-br from-${stat.color}-50 to-white`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-${stat.color === 'yellow' ? 'yellow-500' : stat.color + '-700'}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm theo tên, sân, khách hàng..."
            defaultValue={filters.search || ""}
            onChange={handleSearchChange}
            className="pl-9 bg-background"
          />
        </div>
        <BookingFilters
          onFilterChange={(newFilters) => setFilters(newFilters)}
          onClear={clearFilters}
        />
      </div>

      {/* Reusable Data Table */}
      <DataTable
        data={bookings}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          page: queryParams.page,
          totalPages: pagination?.totalPages || 1,
          onPageChange: (page) => setPage(page),
        }}
        emptyMessage={
          filters.search || Object.keys(filters).length > 0
            ? "Không có lịch đặt sân nào phù hợp với bộ lọc của bạn"
            : "Chưa có lịch đặt sân nào"
        }
      />

      {/* Dialogs */}
      {selectedBooking && (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Chi tiết đặt sân</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{selectedBooking.complex_name}</h3>
                  <Badge className={BOOKING_STATUS_COLORS[selectedBooking.status]}>
                    {BOOKING_STATUS_LABELS[selectedBooking.status]}
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedBooking.sub_field_name}</span>
                    <span>•</span>
                    <span>{SPORT_TYPE_LABELS[selectedBooking.sport_type as any]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedBooking.complex_address}</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-white space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Thông tin khách hàng</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{selectedBooking.player_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{selectedBooking.player_phone}</span>
                  </div>
                </div>
              </div>

              {selectedBooking.type === "SINGLE" ? (
                <div className="border rounded-lg p-4 bg-white space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Thời gian đặt sân</p>
                      <div className="font-semibold text-base">
                        {format(new Date(selectedBooking.start_time), "EEEE, dd/MM/yyyy", { locale: vi })}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {format(new Date(selectedBooking.start_time), "HH:mm")} - {format(new Date(selectedBooking.end_time), "HH:mm")}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground font-medium mb-1">Tổng tiền</p>
                      <div className="text-xl font-bold text-green-700">{formatPrice(selectedBooking.total_price)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng số buổi</p>
                      <p className="text-lg font-bold">{selectedBooking.total_slots} buổi</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng tiền</p>
                      <p className="text-lg font-bold text-green-700">{formatPrice(selectedBooking.total_price)}</p>
                    </div>
                  </div>
                  <h4 className="font-semibold mb-3">Danh sách các buổi đã đặt</h4>
                  <div className="space-y-2 max-h-75 overflow-y-auto">
                    {selectedBooking.bookings.map((slot, idx) => (
                      <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">{idx + 1}</div>
                          <div>
                            <div className="font-semibold">{format(new Date(slot.start_time), "EEEE, dd/MM/yyyy", { locale: vi })}</div>
                            <div className="text-sm text-muted-foreground">{format(new Date(slot.start_time), "HH:mm")} - {format(new Date(slot.end_time), "HH:mm")}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={BOOKING_STATUS_COLORS[slot.status]}>{BOOKING_STATUS_LABELS[slot.status]}</Badge>
                          <div className="text-sm font-semibold text-green-700 mt-1">{formatPrice(slot.total_price)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm/Cancel Dialogs */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đặt sân</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xác nhận lịch đặt sân này?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleConfirmAction} disabled={isLoading}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy đặt sân</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn hủy lịch đặt sân này? Hành động này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Không</Button>
            <Button onClick={handleCancelAction} variant="destructive" disabled={isLoading}>Hủy đặt sân</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
