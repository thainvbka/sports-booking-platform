import { formatPrice } from "@/services/mockData";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import { BookingStatus } from "@/types";
import { bookingService } from "@/services/booking.service";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    bookingService.getAllBookings().then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

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
        return "Hoàn thành";
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
  const handlePayment = () => {
    // Integration with PayOS or Payment Gateway would go here
    toast.success("Chuyển hướng đến cổng thanh toán...");
    // navigate("/payment/...");
  };

  const handleCancel = async () => {
    if (!selectedBookingId) return;
    await bookingService.cancleBooking(selectedBookingId);
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200"
            >
              <CardHeader className="bg-muted/40 pb-2 px-6 pt-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    {booking.complex_name}
                  </CardTitle>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-base text-muted-foreground font-medium">
                  <span>{booking.sub_field_name}</span>
                  <span className="mx-1">•</span>
                  <span>{getSportTypeLabel(booking.sport_type)}</span>
                </div>
              </CardHeader>
              <CardContent className="px-6 pt-3 pb-5 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(
                        new Date(booking.start_time),
                        "EEEE, dd/MM/yyyy",
                        { locale: vi }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(new Date(booking.start_time), "HH:mm")} -{" "}
                      {format(new Date(booking.end_time), "HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate" title={booking.complex_address}>
                      {booking.complex_address}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-base font-semibold">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-lg">
                      {formatPrice(booking.total_price)}
                    </span>
                  </div>
                  {booking.status === BookingStatus.PENDING && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="px-4 py-2 text-sm"
                        onClick={() => {
                          setSelectedBookingId(booking.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Hủy đặt sân
                      </Button>
                      <Button
                        className="px-4 py-2 text-sm font-bold"
                        onClick={handlePayment}
                      >
                        Thanh toán
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
