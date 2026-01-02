import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Repeat,
  CalendarRange,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { BookingFilters } from "@/components/owner/BookingFilters";
import { ownerService } from "@/services/owner.service";
import { toast } from "sonner";
import type {
  OwnerBookingResponse,
  BookingStatus,
  RecurringStatus,
} from "@/types";

export function OwnerBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<OwnerBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [selectedBookingType, setSelectedBookingType] = useState<
    "SINGLE" | "RECURRING"
  >("SINGLE");
  const [selectedBooking, setSelectedBooking] =
    useState<OwnerBookingResponse | null>(null);

  // Filter state
  const [filters, setFilters] = useState<{
    status?: BookingStatus;
    dateRange?: DateRange;
    minPrice?: number;
    maxPrice?: number;
  }>({});

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    canceled: 0,
    confirmed: 0,
    completed: 0,
  });

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await ownerService.getOwnerBookingStats();
      setStats({
        total: response.data.total,
        pending: response.data.pending,
        canceled: response.data.canceled,
        confirmed: response.data.confirmed,
        completed: response.data.completed,
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  // Get page from URL
  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page") || "1");
    setPage(urlPage);
  }, []);

  // Debounced fetch bookings
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, page, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const filterParams: any = {};

      if (searchQuery.trim()) {
        filterParams.search = searchQuery.trim();
      }

      if (filters.status) {
        filterParams.status = filters.status;
      }

      if (filters.dateRange?.from) {
        filterParams.start_date = filters.dateRange.from;
      }

      if (filters.dateRange?.to) {
        filterParams.end_date = filters.dateRange.to;
      }

      if (filters.minPrice) {
        filterParams.min_price = filters.minPrice;
      }

      if (filters.maxPrice) {
        filterParams.max_price = filters.maxPrice;
      }

      const response = await ownerService.getOwnerBookings({
        page,
        limit: 8,
        filter: Object.keys(filterParams).length > 0 ? filterParams : undefined,
      });

      setBookings(response.data.bookings || []);
      setTotalPages(response.data.pagination?.totalPages || 1);

      const params = new URLSearchParams();
      if (page > 1) params.set("page", String(page));
      setSearchParams(params);
    } catch (error: any) {
      toast.error("Đã xảy ra lỗi khi tải lịch đặt sân");
      setBookings([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: {
    status?: BookingStatus;
    dateRange?: DateRange;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    setFilters(newFilters);
    setPage(1);
    setSearchParams({ page: "1" });
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery("");
    setPage(1);
    setSearchParams({ page: "1" });
  };

  const handleViewDetail = (booking: OwnerBookingResponse) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleConfirm = (bookingId: string, type: "SINGLE" | "RECURRING") => {
    setSelectedBookingId(bookingId);
    setSelectedBookingType(type);
    setConfirmDialogOpen(true);
  };

  const handleCancel = (bookingId: string, type: "SINGLE" | "RECURRING") => {
    setSelectedBookingId(bookingId);
    setSelectedBookingType(type);
    setCancelDialogOpen(true);
  };

  const confirmBookingAction = async () => {
    if (!selectedBookingId) return;

    try {
      if (selectedBookingType === "SINGLE") {
        await ownerService.confirmBooking(selectedBookingId);
      } else {
        await ownerService.confirmRecurringBooking(selectedBookingId);
      }
      toast.success("Xác nhận đặt sân thành công");
      fetchBookings();
      fetchStats();
      setConfirmDialogOpen(false);
      setSelectedBookingId(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể xác nhận đặt sân"
      );
    }
  };

  const cancelBookingAction = async () => {
    if (!selectedBookingId) return;

    try {
      if (selectedBookingType === "SINGLE") {
        await ownerService.cancelOwnerBooking(selectedBookingId);
      } else {
        await ownerService.cancelOwnerRecurringBooking(selectedBookingId);
      }
      toast.success("Hủy đặt sân thành công");
      fetchBookings();
      fetchStats();
      setCancelDialogOpen(false);
      setSelectedBookingId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể hủy đặt sân");
    }
  };

  const getStatusColor = (status: BookingStatus | RecurringStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "CANCELED":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusLabel = (status: BookingStatus | RecurringStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "COMPLETED":
        return "Chưa xác nhận";
      case "PENDING":
        return "Chưa thanh toán";
      case "CANCELED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getSportTypeLabel = (sportType: string) => {
    switch (sportType) {
      case "FOOTBALL":
        return "Bóng đá";
      case "BASKETBALL":
        return "Bóng rổ";
      case "TENNIS":
        return "Quần vợt";
      case "BADMINTON":
        return "Cầu lông";
      case "VOLLEYBALL":
        return "Bóng chuyền";
      case "PICKLEBALL":
        return "Pickleball";
      default:
        return sportType;
    }
  };

  const getRecurrenceTypeLabel = (type: string) => {
    switch (type) {
      case "WEEKLY":
        return "Hàng tuần";
      case "MONTHLY":
        return "Hàng tháng";
      default:
        return type;
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
    // Không hủy được nếu đã bị hủy
    if (booking.status === "CANCELED") return false;

    // Kiểm tra thời gian
    if (booking.type === "SINGLE") {
      return new Date(booking.start_time) > new Date();
    } else {
      return new Date(booking.start_date) > new Date();
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Quản lý lịch đặt sân
        </h1>
        <p className="text-muted-foreground mt-1">
          Xem và quản lý tất cả các lịch đặt sân của bạn
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-5 md:grid-cols-5">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng số lượt đặt sân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã xác nhận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {stats.confirmed}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {stats.completed}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-yellow-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chưa thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã hủy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.canceled}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm theo tên, sân, khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <BookingFilters
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      </div>

      {/* Bookings Table */}
      {loading && bookings.length === 0 ? (
        <div className="text-center py-16">Đang tải...</div>
      ) : bookings.length > 0 ? (
        <>
          <div className="rounded-md border bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">STT</TableHead>
                    <TableHead className="w-[100px]">Loại</TableHead>
                    <TableHead className="w-48">Khách hàng</TableHead>
                    <TableHead className="w-48">Sân</TableHead>
                    <TableHead className="w-[220px]">Thời gian</TableHead>
                    <TableHead className="w-[140px]">Giá tiền</TableHead>
                    <TableHead className="w-[140px]">Trạng thái</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking, index) => (
                    <TableRow
                      key={booking.id}
                      className={loading ? "opacity-50" : ""}
                    >
                      {/* STT */}
                      <TableCell className="w-[60px] font-medium text-muted-foreground">
                        {(page - 1) * 8 + index + 1}
                      </TableCell>

                      {/* Loại */}
                      <TableCell className="w-[100px] whitespace-nowrap">
                        {booking.type === "RECURRING" ? (
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-800"
                          >
                            Định kỳ
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            Đơn lẻ
                          </Badge>
                        )}
                      </TableCell>

                      {/* Khách hàng */}
                      <TableCell className="w-48">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-medium">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="truncate">
                              {booking.player_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {booking.player_phone}
                          </div>
                        </div>
                      </TableCell>

                      {/* Sân */}
                      <TableCell className="w-48">
                        <div className="space-y-1">
                          <div className="font-medium truncate">
                            {booking.complex_name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {booking.sub_field_name} •{" "}
                            {getSportTypeLabel(booking.sport_type)}
                          </div>
                        </div>
                      </TableCell>

                      {/* Thời gian */}
                      <TableCell className="w-[220px] whitespace-nowrap">
                        {booking.type === "RECURRING" ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm">
                              <CalendarRange className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="font-medium">
                                {getRecurrenceTypeLabel(
                                  booking.recurrence_type
                                )}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(
                                new Date(booking.start_date),
                                "dd/MM/yyyy",
                                { locale: vi }
                              )}{" "}
                              -{" "}
                              {format(
                                new Date(booking.end_date),
                                "dd/MM/yyyy",
                                { locale: vi }
                              )}
                            </div>
                            {booking.bookings &&
                              booking.bookings.length > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {format(
                                    new Date(booking.bookings[0].start_time),
                                    "HH:mm",
                                    {
                                      locale: vi,
                                    }
                                  )}{" "}
                                  -{" "}
                                  {format(
                                    new Date(booking.bookings[0].end_time),
                                    "HH:mm",
                                    {
                                      locale: vi,
                                    }
                                  )}{" "}
                                  • {booking.total_slots} buổi
                                </div>
                              )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              {format(
                                new Date(booking.start_time),
                                "dd/MM/yyyy",
                                { locale: vi }
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {format(new Date(booking.start_time), "HH:mm", {
                                locale: vi,
                              })}{" "}
                              -{" "}
                              {format(new Date(booking.end_time), "HH:mm", {
                                locale: vi,
                              })}
                            </div>
                          </div>
                        )}
                      </TableCell>

                      {/* Giá tiền */}
                      <TableCell className="w-[140px] whitespace-nowrap">
                        <div className="font-semibold text-green-700">
                          {formatPrice(booking.total_price)}
                        </div>
                      </TableCell>

                      {/* Trạng thái */}
                      <TableCell className="w-[140px] whitespace-nowrap">
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </TableCell>

                      {/* Hành động */}
                      <TableCell className="w-16">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetail(booking)}
                            >
                              Xem chi tiết
                            </DropdownMenuItem>
                            {canConfirmBooking(booking) && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleConfirm(booking.id, booking.type)
                                }
                              >
                                Xác nhận
                              </DropdownMenuItem>
                            )}
                            {canCancelBooking(booking) && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCancel(booking.id, booking.type)
                                }
                                className="text-red-600"
                              >
                                Hủy đặt sân
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages || loading}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Không tìm thấy lịch đặt sân
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {searchQuery || Object.keys(filters).length > 0
                ? "Không có lịch đặt sân nào phù hợp với bộ lọc của bạn"
                : "Chưa có lịch đặt sân nào"}
            </p>
            {(searchQuery || Object.keys(filters).length > 0) && (
              <Button variant="outline" onClick={handleClearFilters}>
                Xóa bộ lọc
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      {selectedBooking && (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Chi tiết đặt sân
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Header Info */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {selectedBooking.complex_name}
                  </h3>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {getStatusLabel(selectedBooking.status)}
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {selectedBooking.sub_field_name}
                    </span>
                    <span>•</span>
                    <span>{getSportTypeLabel(selectedBooking.sport_type)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedBooking.complex_address}</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border rounded-lg p-4 bg-white space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">
                  Thông tin khách hàng
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {selectedBooking.player_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{selectedBooking.player_phone}</span>
                  </div>
                </div>
              </div>

              {/* Time & Price Info */}
              {selectedBooking.type === "SINGLE" && (
                <div className="border rounded-lg p-4 bg-white space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">
                        Thời gian đặt sân
                      </p>
                      <div className="font-semibold text-base">
                        {format(
                          new Date(selectedBooking.start_time),
                          "EEEE, dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {format(new Date(selectedBooking.start_time), "HH:mm", {
                          locale: vi,
                        })}{" "}
                        -{" "}
                        {format(new Date(selectedBooking.end_time), "HH:mm", {
                          locale: vi,
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground font-medium mb-1">
                        Tổng tiền
                      </p>
                      <div className="text-xl font-bold text-green-700">
                        {formatPrice(selectedBooking.total_price)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recurring Info */}
              {selectedBooking.type === "RECURRING" && (
                <>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Tổng số buổi
                      </p>
                      <p className="text-lg font-bold">
                        {selectedBooking.total_slots} buổi
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng tiền</p>
                      <p className="text-lg font-bold text-green-700">
                        {formatPrice(selectedBooking.total_price)}
                      </p>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-3">
                    Danh sách các buổi đã đặt
                  </h4>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedBooking.bookings.map((slot, idx) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {format(
                                new Date(slot.start_time),
                                "EEEE, dd/MM/yyyy",
                                { locale: vi }
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(slot.start_time), "HH:mm", {
                                locale: vi,
                              })}{" "}
                              -{" "}
                              {format(new Date(slot.end_time), "HH:mm", {
                                locale: vi,
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(slot.status)}>
                            {getStatusLabel(slot.status)}
                          </Badge>
                          <div className="text-sm font-semibold text-green-700 mt-1">
                            {formatPrice(slot.total_price)}
                          </div>
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

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đặt sân</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xác nhận lịch đặt sân này? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={confirmBookingAction}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy đặt sân</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy lịch đặt sân này? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Không
            </Button>
            <Button onClick={cancelBookingAction} variant="destructive">
              Hủy đặt sân
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
