import { formatPrice } from "@/services/mockData";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Clock,
  Repeat,
  MapPin,
  Eye,
  CreditCard,
  X,
  MoreHorizontal,
} from "lucide-react";
import { BookingStatus, RecurringStatus } from "@/types";
import { bookingService } from "@/services/booking.service";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import type {
  BookingResponse,
  RecurringBookingResponse,
  SingleBookingResponse,
} from "@/services/booking.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DeleteBookingDialog } from "@/components/player/DeleteBookingDialog";

export function PlayerBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [selectedBookingType, setSelectedBookingType] = useState<
    "SINGLE" | "RECURRING"
  >("SINGLE");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponse | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  // Lấy page từ URL khi load lần đầu
  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page") || "1");
    setPage(urlPage);
  }, []);

  // Fetch bookings khi page thay đổi
  useEffect(() => {
    setLoading(true);
    bookingService
      .getAllBookings(page)
      .then((res) => {
        setBookings(res.bookings || []);
        setTotalPages(res.pagination?.totalPages || 1);
      })
      .catch((err) => {
        toast.error("Đã xảy ra lỗi khi tải lịch đặt sân");
        setBookings([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    setSearchParams(params);
  }, [page]);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case BookingStatus.COMPLETED:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case BookingStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case BookingStatus.CANCELED:
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "Đã xác nhận";
      case BookingStatus.COMPLETED:
        return "Chờ xác nhận";
      case BookingStatus.PENDING:
        return "Chờ thanh toán";
      case BookingStatus.CANCELED:
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getRecurringStatusColor = (status: RecurringStatus) => {
    switch (status) {
      case RecurringStatus.CONFIRMED:
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case RecurringStatus.COMPLETED:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case RecurringStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case RecurringStatus.CANCELED:
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getRecurringStatusLabel = (status: RecurringStatus) => {
    switch (status) {
      case RecurringStatus.CONFIRMED:
        return "Đã xác nhận";
      case RecurringStatus.COMPLETED:
        return "Chờ xác nhận";
      case RecurringStatus.PENDING:
        return "Chờ thanh toán";
      case RecurringStatus.CANCELED:
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

  const handlePayment = async (bookingIds: string[]) => {
    try {
      const result = await bookingService.creatCheckoutSession(bookingIds);
      window.location.href = result.url;
    } catch (err) {
      console.error("Create checkout session failed", err);
      toast.error("Không thể tạo phiên thanh toán. Vui lòng thử lại sau.");
    }
  };

  const handleCancel = async () => {
    if (!selectedBookingId) return;
    if (selectedBookingType === "SINGLE") {
      await bookingService.cancelBooking(selectedBookingId).catch(() => {
        toast.error("Đã xảy ra lỗi khi hủy đặt sân");
        throw new Error("Cancel booking failed");
      });
    } else {
      await bookingService
        .cancelRecurringBooking(selectedBookingId)
        .catch(() => {
          toast.error("Đã xảy ra lỗi khi hủy đặt sân định kỳ");
          throw new Error("Cancel recurring booking failed");
        });
    }

    // Cập nhật state dựa trên loại booking
    if (selectedBookingType === "SINGLE") {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBookingId && booking.type === "SINGLE"
            ? { ...booking, status: BookingStatus.CANCELED }
            : booking
        )
      );
    } else {
      // Với recurring booking, cập nhật cả nhóm
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBookingId && booking.type === "RECURRING"
            ? { ...booking, status: BookingStatus.CANCELED }
            : booking
        )
      );
    }

    toast.success("Đã hủy đặt sân thành công");
    setSelectedBookingId(null);
  };

  const handleViewDetails = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
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

  const canCancelBooking = (booking: BookingResponse): boolean => {
    // Chỉ cho phép hủy nếu status là PENDING hoặc chưa COMFIRMED
    if (!["PENDING", "COMPLETED"].includes(booking.status)) {
      return false;
    }

    // Kiểm tra thời gian
    if (booking.type === "SINGLE") {
      return new Date(booking.start_time) > new Date();
    } else {
      return new Date(booking.start_date) > new Date();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lịch sử đặt sân</h1>

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
                    <TableHead className="w-60">Sân</TableHead>
                    <TableHead className="w-[220px]">Thời gian</TableHead>
                    <TableHead className="w-[140px]">Giá tiền</TableHead>
                    <TableHead className="w-[140px]">Trạng thái</TableHead>
                    <TableHead className="w-40"></TableHead>
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
                          <div className="flex items-center gap-1 text-blue-600">
                            <span className="text-xs font-medium">
                              Đặt định kỳ
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600">
                            <span className="text-xs font-medium">
                              Đặt một lần
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Sân */}
                      <TableCell className="w-60">
                        <div className="w-full truncate">
                          <div className="font-medium truncate">
                            {booking.complex_name}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {booking.sub_field_name} •{" "}
                            {getSportTypeLabel(booking.sport_type)}
                          </div>
                        </div>
                      </TableCell>

                      {/* Thời gian */}
                      <TableCell className="w-[220px] whitespace-nowrap">
                        {booking.type === "SINGLE" ? (
                          <div>
                            <div className="font-medium text-sm whitespace-nowrap">
                              {format(
                                new Date(booking.start_time),
                                "dd/MM/yyyy"
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground whitespace-nowrap">
                              {format(new Date(booking.start_time), "HH:mm")} -{" "}
                              {format(new Date(booking.end_time), "HH:mm")}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-sm whitespace-nowrap">
                              {format(new Date(booking.start_date), "dd/MM")} -{" "}
                              {format(new Date(booking.end_date), "dd/MM/yyyy")}
                            </div>
                            {booking.bookings &&
                              booking.bookings.length > 0 && (
                                <div className="text-sm text-muted-foreground whitespace-nowrap">
                                  {format(
                                    new Date(booking.bookings[0].start_time),
                                    "HH:mm"
                                  )}{" "}
                                  -{" "}
                                  {format(
                                    new Date(booking.bookings[0].end_time),
                                    "HH:mm"
                                  )}
                                </div>
                              )}
                            <div className="text-sm text-blue-600 font-medium whitespace-nowrap">
                              {booking.total_slots} buổi •{" "}
                              {getRecurrenceTypeLabel(booking.recurrence_type)}
                            </div>
                          </div>
                        )}
                        {booking.status === BookingStatus.PENDING &&
                          booking.expires_at && (
                            <div className="flex items-center gap-1 text-orange-600 mt-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span className="text-xs whitespace-nowrap">
                                {format(
                                  new Date(booking.expires_at),
                                  "HH:mm dd/MM"
                                )}
                              </span>
                            </div>
                          )}
                      </TableCell>

                      {/* Giá tiền */}
                      <TableCell className="w-[140px] whitespace-nowrap">
                        <div className="font-bold text-green-700 whitespace-nowrap">
                          {formatPrice(booking.total_price)}
                        </div>
                      </TableCell>

                      {/* Trạng thái */}
                      <TableCell className="w-[140px] whitespace-nowrap">
                        <Badge
                          className={
                            booking.type === "SINGLE"
                              ? getStatusColor(booking.status)
                              : getRecurringStatusColor(booking.status)
                          }
                        >
                          {booking.type === "SINGLE"
                            ? getStatusLabel(booking.status)
                            : getRecurringStatusLabel(booking.status)}
                        </Badge>
                      </TableCell>

                      {/* Hành động */}
                      <TableCell className="w-40">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                                disabled={loading}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">
                                  Mở menu hành động
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {booking.status === BookingStatus.PENDING && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      if (booking.type === "SINGLE") {
                                        handlePayment([booking.id]);
                                      } else {
                                        handlePayment(
                                          booking.bookings.map((b) => b.id)
                                        );
                                      }
                                    }}
                                  >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    <span>Thanh toán</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(booking)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                <span>Xem chi tiết</span>
                              </DropdownMenuItem>
                              {canCancelBooking(booking) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBookingId(booking.id);
                                      setSelectedBookingType(booking.type);
                                      setDeleteDialogOpen(true);
                                    }}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    <span>Hủy đặt sân</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          {/* Pagination Controls */}
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
        <div className="text-center py-16 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">Bạn chưa có lịch đặt sân nào.</p>
        </div>
      )}
      <DeleteBookingDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedBookingId(null);
        }}
        bookingId={selectedBookingId || ""}
        onConfirm={handleCancel}
      />

      {/* Booking Detail Modal */}
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
                  <Badge
                    className={
                      selectedBooking.type === "SINGLE"
                        ? getStatusColor(selectedBooking.status)
                        : getRecurringStatusColor(selectedBooking.status)
                    }
                  >
                    {selectedBooking.type === "SINGLE"
                      ? getStatusLabel(selectedBooking.status)
                      : getRecurringStatusLabel(selectedBooking.status)}
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
                  {selectedBooking.type === "RECURRING" && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium ">
                        {getRecurrenceTypeLabel(
                          selectedBooking.recurrence_type
                        )}
                      </span>
                      <span>•</span>
                      <span>
                        {format(
                          new Date(selectedBooking.start_date),
                          "dd/MM/yyyy"
                        )}{" "}
                        -{" "}
                        {format(
                          new Date(selectedBooking.end_date),
                          "dd/MM/yyyy"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Time & Price Info for SINGLE */}
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
                        <span>
                          {format(
                            new Date(selectedBooking.start_time),
                            "HH:mm"
                          )}{" "}
                          -{" "}
                          {format(new Date(selectedBooking.end_time), "HH:mm")}
                        </span>
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

              {/* Summary */}
              {selectedBooking.type === "RECURRING" && (
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
              )}

              {/* Booking List của Recurring */}
              {selectedBooking.type === "RECURRING" && (
                <h4 className="font-semibold mb-3">
                  Danh sách các buổi đã đặt
                </h4>
              )}

              {selectedBooking.type === "RECURRING" && (
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
                          <div className="font-medium">
                            {format(
                              new Date(slot.start_time),
                              "EEEE, dd/MM/yyyy",
                              { locale: vi }
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(slot.start_time), "HH:mm")} -{" "}
                            {format(new Date(slot.end_time), "HH:mm")}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {/* <Badge className={getStatusColor(slot.status)}>
                          {getStatusLabel(slot.status)}
                        </Badge> */}
                        <div className="text-sm font-semibold text-green-700 mt-1">
                          {formatPrice(slot.total_price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
