import { BookingDetailDialog } from "@/components/player/BookingDetailDialog";
import { DeleteBookingDialog } from "@/components/player/DeleteBookingDialog";
import { ReviewDialog } from "@/components/player/ReviewDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBookings } from "@/hooks/useBookings";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  RECURRENCE_TYPE_LABELS,
  RECURRING_STATUS_COLORS,
  RECURRING_STATUS_LABELS,
  SPORT_TYPE_LABELS,
} from "@/lib/constants";
import { bookingService } from "@/services/booking.service";
import { BookingStatus, type BookingResponse } from "@/types";
import { formatPrice } from "@/utils";
import { format } from "date-fns";
import {
  Clock,
  CreditCard,
  Eye,
  MoreHorizontal,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SingleBooking = Extract<BookingResponse, { type: "SINGLE" }>;

const PAGE_SIZE = 8;

export function PlayerBookingsPage() {
  const { bookings, loading, page, totalPages, setPage, updateBookingStatus } =
    useBookings({ pageSize: PAGE_SIZE });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [selectedBookingType, setSelectedBookingType] = useState<
    "SINGLE" | "RECURRING"
  >("SINGLE");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponse | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] =
    useState<SingleBooking | null>(null);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<string>>(
    new Set(),
  );

  const getStatusColor = (status: BookingStatus) => {
    return BOOKING_STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: BookingStatus) => {
    return BOOKING_STATUS_LABELS[status] || status;
  };

  const getRecurringStatusColor = (status: string) => {
    return RECURRING_STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
  };

  const getRecurringStatusLabel = (status: string) => {
    return RECURRING_STATUS_LABELS[status] || status;
  };

  const getSportTypeLabel = (sportType: string) => {
    return (
      SPORT_TYPE_LABELS[sportType as keyof typeof SPORT_TYPE_LABELS] ||
      sportType
    );
  };

  const handlePayment = async (bookingIds: string[]) => {
    try {
      const result = await bookingService.createCheckoutSession(bookingIds);
      window.location.href = result.data.url;
    } catch (err: unknown) {
      console.error("Create checkout session failed", err);
      const apiError = err as { message?: string };
      toast.error(
        apiError?.message ||
          "Không thể tạo phiên thanh toán. Vui lòng thử lại sau.",
      );
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
      await bookingService.cancelRecurringBooking(selectedBookingId).catch(() => {
        toast.error("Đã xảy ra lỗi khi hủy đặt sân định kỳ");
        throw new Error("Cancel recurring booking failed");
      });
    }

    updateBookingStatus(
      selectedBookingId,
      selectedBookingType,
      BookingStatus.CANCELED,
    );

    toast.success("Đã hủy đặt sân thành công");
    setSelectedBookingId(null);
  };

  const handleViewDetails = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const canCancelBooking = (booking: BookingResponse): boolean => {
    if (!["PENDING", "COMPLETED"].includes(booking.status)) {
      return false;
    }

    if (booking.type === "SINGLE") {
      return new Date(booking.start_time) > new Date();
    }

    return new Date(booking.start_date) > new Date();
  };

  const canReviewBooking = (booking: BookingResponse): booking is SingleBooking => {
    return (
      booking.type === "SINGLE" &&
      booking.status === BookingStatus.CONFIRMED &&
      !reviewedBookingIds.has(booking.id)
    );
  };

  const handleOpenReviewDialog = (booking: BookingResponse) => {
    if (!canReviewBooking(booking)) {
      return;
    }

    setSelectedReviewBooking(booking);
    setReviewDialogOpen(true);
  };

  const handleReviewSuccess = (bookingId: string) => {
    setReviewedBookingIds((prev) => {
      const next = new Set(prev);
      next.add(bookingId);
      return next;
    });
  };

  const columns: Column<BookingResponse>[] = [
    {
      header: "STT",
      className: "w-15",
      cell: (_, index) => (
        <span className="font-medium text-muted-foreground">
          {(page - 1) * PAGE_SIZE + index + 1}
        </span>
      ),
    },
    {
      header: "Loại",
      className: "w-25 whitespace-nowrap",
      cell: (booking) => (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            booking.type === "RECURRING" ? "text-blue-600" : "text-green-600"
          }`}
        >
          {booking.type === "RECURRING" ? "Đặt định kỳ" : "Đặt một lần"}
        </div>
      ),
    },
    {
      header: "Sân",
      className: "w-60",
      cell: (booking) => (
        <div className="w-full truncate">
          <div className="font-medium truncate">{booking.complex_name}</div>
          <div className="text-sm text-muted-foreground truncate">
            {booking.sub_field_name} • {getSportTypeLabel(booking.sport_type)}
          </div>
        </div>
      ),
    },
    {
      header: "Thời gian",
      className: "w-55 whitespace-nowrap",
      cell: (booking) => (
        <div>
          {booking.type === "SINGLE" ? (
            <>
              <div className="font-medium text-sm whitespace-nowrap">
                {format(new Date(booking.start_time), "dd/MM/yyyy")}
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(booking.start_time), "HH:mm")} -{" "}
                {format(new Date(booking.end_time), "HH:mm")}
              </div>
            </>
          ) : (
            <>
              <div className="font-medium text-sm whitespace-nowrap">
                {format(new Date(booking.start_date), "dd/MM")} -{" "}
                {format(new Date(booking.end_date), "dd/MM/yyyy")}
              </div>
              {booking.bookings.length > 0 && (
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {format(new Date(booking.bookings[0].start_time), "HH:mm")} -{" "}
                  {format(new Date(booking.bookings[0].end_time), "HH:mm")}
                </div>
              )}
              <div className="text-sm text-blue-600 font-medium whitespace-nowrap">
                {booking.total_slots} buổi •{" "}
                {RECURRENCE_TYPE_LABELS[booking.recurrence_type] ||
                  booking.recurrence_type}
              </div>
            </>
          )}

          {booking.status === BookingStatus.PENDING && booking.expires_at && (
            <div className="flex items-center gap-1 text-orange-600 mt-1">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="text-xs whitespace-nowrap">
                {format(new Date(booking.expires_at), "HH:mm dd/MM")}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Giá tiền",
      className: "w-35 whitespace-nowrap",
      cell: (booking) => (
        <span className="font-bold text-green-700 whitespace-nowrap">
          {formatPrice(booking.total_price)}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-35 whitespace-nowrap",
      cell: (booking) => (
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
      ),
    },
    {
      header: "",
      className: "w-40",
      cell: (booking) => (
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
                <span className="sr-only">Mở menu hành động</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {booking.status === BookingStatus.PENDING && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      if (booking.type === "SINGLE") {
                        handlePayment([booking.id]);
                        return;
                      }

                      handlePayment(booking.bookings.map((slot) => slot.id));
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span>Thanh toán</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                <Eye className="w-4 h-4 mr-2" />
                <span>Xem chi tiết</span>
              </DropdownMenuItem>

              {canReviewBooking(booking) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleOpenReviewDialog(booking)}>
                    <Star className="w-4 h-4 mr-2" />
                    <span>Đánh giá sân</span>
                  </DropdownMenuItem>
                </>
              )}

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
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Lịch sử đặt sân</h1>
        <p className="text-muted-foreground text-sm">
          Theo dõi các booking, thanh toán, hủy lịch và đánh giá sân đã sử dụng.
        </p>
      </div>

      <DataTable
        data={bookings}
        columns={columns}
        isLoading={loading}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
        emptyMessage="Bạn chưa có lịch đặt sân nào."
      />

      <DeleteBookingDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedBookingId(null);
        }}
        bookingId={selectedBookingId || ""}
        onConfirm={handleCancel}
      />

      <ReviewDialog
        open={reviewDialogOpen}
        booking={selectedReviewBooking}
        onOpenChange={(open) => {
          setReviewDialogOpen(open);
          if (!open) {
            setSelectedReviewBooking(null);
          }
        }}
        onSuccess={handleReviewSuccess}
      />

      <BookingDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        booking={selectedBooking}
      />
    </div>
  );
}
