import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingFilters } from "@/components/owner/BookingFilters";
import { OwnerBookingDetailDialog } from "@/components/owner/OwnerBookingDetailDialog";
import { ownerService } from "@/services/owner.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { OwnerBooking, BookingStatus } from "@/types";

export function OwnerBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<OwnerBooking | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [actionBookingId, setActionBookingId] = useState<string | null>(null);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    canceled: 0,
    confirmed: 0,
    completed: 0,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

  // Filter state
  const [filters, setFilters] = useState<{
    status?: BookingStatus;
    dateRange?: DateRange;
    minPrice?: number;
    maxPrice?: number;
  }>({});

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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentPage, filters]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);

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
        page: currentPage,
        limit,
        filter: Object.keys(filterParams).length > 0 ? filterParams : undefined,
      });

      setBookings(response.data.bookings);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách đặt sân"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: {
    status?: BookingStatus;
    dateRange?: DateRange;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setSearchParams({ page: "1" });
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery("");
    setCurrentPage(1);
    setSearchParams({ page: "1" });
  };

  const handleViewDetail = (booking: OwnerBooking) => {
    setSelectedBooking(booking);
    setIsDetailDialogOpen(true);
  };

  const handleConfirmBooking = (bookingId: string) => {
    setActionBookingId(bookingId);
    setConfirmDialogOpen(true);
  };

  const handleCancelBooking = (bookingId: string) => {
    setActionBookingId(bookingId);
    setCancelDialogOpen(true);
  };

  const confirmBookingAction = async () => {
    if (!actionBookingId) return;

    try {
      await ownerService.confirmBooking(actionBookingId);
      toast.success("Xác nhận đặt sân thành công");
      fetchBookings();
      fetchStats();
      setConfirmDialogOpen(false);
      setActionBookingId(null);
    } catch (error: any) {
      console.error("Error confirming booking:", error);
      toast.error(
        error.response?.data?.message || "Không thể xác nhận đặt sân"
      );
    }
  };

  const cancelBookingAction = async () => {
    if (!actionBookingId) return;

    try {
      await ownerService.cancelOwnerBooking(actionBookingId);
      toast.success("Hủy đặt sân thành công");
      fetchBookings();
      fetchStats();
      setCancelDialogOpen(false);
      setActionBookingId(null);
    } catch (error: any) {
      console.error("Error canceling booking:", error);
      toast.error(error.response?.data?.message || "Không thể hủy đặt sân");
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            placeholder="Tìm kiếm theo tên khu phức hợp, sân..."
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : bookings.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead className="w-[130px]">Ngày & Giờ</TableHead>
                  <TableHead className="w-[180px]">Khách hàng</TableHead>
                  <TableHead className="w-[200px]">Địa điểm</TableHead>
                  <TableHead className="w-[110px]">Loại sân</TableHead>
                  <TableHead className="w-[120px]">Giá tiền</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[80px] text-center">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking, index) => {
                  const startTime = new Date(booking.start_time);
                  const endTime = new Date(booking.end_time);
                  const stt = (currentPage - 1) * limit + index + 1;

                  const statusConfig = {
                    PENDING: {
                      label: "Chưa thanh toán",
                      variant: "secondary" as const,
                    },
                    CONFIRMED: {
                      label: "Đã xác nhận",
                      variant: "default" as const,
                    },
                    COMPLETED: {
                      label: "Đã thanh toán",
                      variant: "default" as const,
                    },
                    CANCELED: {
                      label: "Đã hủy",
                      variant: "destructive" as const,
                    },
                  }[booking.status] || {
                    label: booking.status,
                    variant: "secondary" as const,
                  };

                  const canConfirm = booking.status === "COMPLETED";
                  const canCancel =
                    (booking.status === "PENDING" ||
                      booking.status === "CONFIRMED" ||
                      booking.status === "COMPLETED") &&
                    new Date(booking.start_time) > new Date();

                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {stt}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {format(startTime, "dd/MM/yyyy", { locale: vi })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(startTime, "HH:mm", { locale: vi })} -{" "}
                            {format(endTime, "HH:mm", { locale: vi })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {booking.player.account.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.player.account.phone_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {booking.sub_field.complex.complex_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.sub_field.sub_field_name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {" "}
                          {booking.sub_field.sport_type === "BADMINTON" &&
                            "Cầu lông"}
                          {booking.sub_field.sport_type === "TENNIS" &&
                            "Tennis"}
                          {booking.sub_field.sport_type === "BASKETBALL" &&
                            "Bóng rổ"}
                          {booking.sub_field.sport_type === "VOLLEYBALL" &&
                            "Bóng chuyền"}
                          {booking.sub_field.sport_type === "FOOTBALL" &&
                            "Bóng đá"}
                          {booking.sub_field.sport_type === "PICKLEBALL" &&
                            "Pickleball"}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(booking.total_price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetail(booking)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {canConfirm && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleConfirmBooking(booking.id)
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Xác nhận
                                </DropdownMenuItem>
                              </>
                            )}
                            {canCancel && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleCancelBooking(booking.id)
                                  }
                                  className="text-destructive focus:text-destructive"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Hủy đặt sân
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Booking Detail Dialog */}
      <OwnerBookingDetailDialog
        booking={selectedBooking}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelBooking}
      />

      {/* Confirm Booking Dialog */}
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

      {/* Cancel Booking Dialog */}
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
