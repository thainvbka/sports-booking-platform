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

export function PlayerBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lịch sử đặt sân</h1>

      {loading ? (
        <div className="text-center py-16">Đang tải...</div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    {booking.complex_name}
                    <span className="text-muted-foreground font-normal text-sm">
                      - {booking.sub_field_name}
                    </span>
                  </CardTitle>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {format(new Date(booking.start_time), "EEEE, dd/MM/yyyy", {
                      locale: vi,
                    })}
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
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>{formatPrice(booking.total_price)}</span>
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
    </div>
  );
}
