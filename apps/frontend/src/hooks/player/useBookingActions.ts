import { type SingleBooking } from "@/components/player/booking-history/BookingCard";
import { bookingService } from "@/services/booking.service";
import { BookingStatus, type BookingResponse, type ReviewItem } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

interface UseBookingActionsProps {
  updateBookingStatus: (id: string, type: "SINGLE" | "RECURRING", status: BookingStatus) => void;
  updateSingleBookingReview: (id: string, review: ReviewItem) => void;
}

export function useBookingActions({
  updateBookingStatus,
  updateSingleBookingReview,
}: UseBookingActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedBookingType, setSelectedBookingType] = useState<"SINGLE" | "RECURRING">("SINGLE");

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<SingleBooking | null>(null);

  const [createMatchDialogOpen, setCreateMatchDialogOpen] = useState(false);
  const [selectedMatchBooking, setSelectedMatchBooking] = useState<BookingResponse | null>(null);

  const handleCancel = async () => {
    if (!selectedBookingId) return;

    try {
      if (selectedBookingType === "SINGLE") {
        await bookingService.cancelBooking(selectedBookingId);
      } else {
        await bookingService.cancelRecurringBooking(selectedBookingId);
      }

      updateBookingStatus(
        selectedBookingId,
        selectedBookingType,
        BookingStatus.CANCELED,
      );

      toast.success("Đã hủy đặt sân thành công");
      setSelectedBookingId(null);
    } catch {
      const errorMsg =
        selectedBookingType === "SINGLE"
          ? "Đã xảy ra lỗi khi hủy đặt sân"
          : "Đã xảy ra lỗi khi hủy đặt sân định kỳ";
      toast.error(errorMsg);
    }
  };

  const handleReviewSuccess = (bookingId: string, review: ReviewItem) => {
    updateSingleBookingReview(bookingId, review);
    setReviewDialogOpen(false);
    toast.success("Đánh giá của bạn đã được lưu");
  };

  const openCancelDialog = (bookingId: string, type: "SINGLE" | "RECURRING") => {
    setSelectedBookingId(bookingId);
    setSelectedBookingType(type);
    setDeleteDialogOpen(true);
  };

  const openReviewDialog = (booking: SingleBooking) => {
    setSelectedReviewBooking(booking);
    setReviewDialogOpen(true);
  };

  const openCreateMatchDialog = (booking: BookingResponse) => {
    setSelectedMatchBooking(booking);
    setCreateMatchDialogOpen(true);
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedBookingId,
    setSelectedBookingId,
    reviewDialogOpen,
    setReviewDialogOpen,
    selectedReviewBooking,
    setSelectedReviewBooking,
    createMatchDialogOpen,
    setCreateMatchDialogOpen,
    selectedMatchBooking,
    setSelectedMatchBooking,
    handleCancel,
    handleReviewSuccess,
    openCancelDialog,
    openReviewDialog,
    openCreateMatchDialog,
  };
}
