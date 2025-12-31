import { formatPrice } from "@/services/mockData";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import { BookingStatus } from "@/types";
import { bookingService } from "@/services/booking.service";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import type { BookingResponse } from "@/services/booking.service";
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
        setLoading(false);
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
      case BookingStatus.COMPLETED:
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case BookingStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case BookingStatus.CANCELED:
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "Đã xác nhận";
      case BookingStatus.COMPLETED:
        return "Đã thanh toán";
      case BookingStatus.PENDING:
        return "Chờ thanh toán";
      case BookingStatus.CANCELED:
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
  const handlePayment = async (bookingId: string) => {
    const result = await bookingService
      .creatCheckoutSession([bookingId])
      .catch(() => {
        toast.error("Không thể tạo phiên thanh toán. Vui lòng thử lại sau.");
      });
    window.location.href = result.url;
  };

  const handleCancel = async () => {
    if (!selectedBookingId) return;
    await bookingService.cancelBooking(selectedBookingId).catch(() => {
      toast.error("Đã xảy ra lỗi khi hủy đặt sân");
      throw new Error("Cancel booking failed");
    });
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === selectedBookingId
          ? { ...booking, status: BookingStatus.CANCELED }
          : booking
      )
    );
    toast.success("Đã hủy đặt sân thành công");
    setSelectedBookingId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lịch sử đặt sân</h1>

      {loading ? (
        <div className="text-center py-16">Đang tải...</div>
      ) : bookings.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className="overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col"
              >
                <CardHeader className="bg-gradient-to-br from-muted/40 to-muted/20 pb-3 px-4 pt-4 relative">
                  <Badge
                    className={`${getStatusColor(
                      booking.status
                    )} absolute top-3 right-3 text-xs px-2 py-0.5`}
                  >
                    {getStatusLabel(booking.status)}
                  </Badge>
                  <CardTitle className="text-lg font-bold pr-20 leading-tight">
                    {booking.complex_name}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium mt-1">
                    <span className="truncate">{booking.sub_field_name}</span>
                    <span className="text-xs">•</span>
                    <span className="text-xs">
                      {getSportTypeLabel(booking.sport_type)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pt-3 pb-4 flex flex-col gap-3 flex-1">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs">
                        {format(
                          new Date(booking.start_time),
                          "EEE, dd/MM/yyyy",
                          { locale: vi }
                        )}
                        <span className="mx-1">•</span>
                        {format(new Date(booking.start_time), "HH:mm")} -{" "}
                        {format(new Date(booking.end_time), "HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span
                        className="truncate text-xs"
                        title={booking.complex_address}
                      >
                        {booking.complex_address}
                      </span>
                    </div>
                  </div>

                  {booking.status === BookingStatus.PENDING &&
                    booking.expires_at && (
                      <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-md px-2 py-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                        <span className="text-xs text-orange-700 font-medium">
                          Hết hạn:{" "}
                          {format(new Date(booking.expires_at), "HH:mm dd/MM")}
                        </span>
                      </div>
                    )}

                  <div className="mt-auto pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-base font-bold text-green-700">
                          {formatPrice(booking.total_price)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 min-h-[80px] justify-center">
                      {booking.status === BookingStatus.PENDING && (
                        <Button
                          className="w-full py-2 text-sm font-semibold"
                          onClick={() => handlePayment(booking.id)}
                        >
                          Thanh toán ngay
                        </Button>
                      )}

                      {["PENDING", "CONFIRMED", "COMPLETED"].includes(
                        booking.status
                      ) &&
                        new Date(booking.start_time) > new Date() && (
                          <Button
                            variant="outline"
                            className="w-full py-2 text-sm"
                            onClick={() => {
                              setSelectedBookingId(booking.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            Hủy đặt sân
                          </Button>
                        )}

                      {booking.status === BookingStatus.CANCELED && (
                        <div className="text-xs text-muted-foreground text-center italic">
                          Đặt sân đã bị hủy
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
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
                disabled={page >= totalPages}
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
    </div>
  );
}
