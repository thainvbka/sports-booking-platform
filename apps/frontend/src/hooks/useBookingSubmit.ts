import { bookingService } from "@/services/booking.service";
import type { ApiError } from "@/types";
import { getIsoDateTimeVn } from "@/utils/time.utils";
import { format } from "date-fns";
import { useState } from "react";
import { type NavigateFunction } from "react-router-dom";
import { toast } from "sonner";

type BookingType = "single" | "recurring";

interface UseBookingSubmitOptions {
  subfieldId?: string;
  user: any; // Or type from auth store
  date: Date | undefined;
  customStartTime: string;
  customEndTime: string;
  bookingType: BookingType;
  endDate: Date | undefined;
  recurringType: "WEEKLY" | "MONTHLY";
  addonsPayload: { product_id: string; quantity: number }[];
  navigate: NavigateFunction;
}

export function useBookingSubmit({
  subfieldId,
  user,
  date,
  customStartTime,
  customEndTime,
  bookingType,
  endDate,
  recurringType,
  addonsPayload,
  navigate,
}: UseBookingSubmitOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmBooking = async () => {
    if (!subfieldId || !date || !customStartTime || !customEndTime) {
      toast.error("Thiếu thông tin đặt sân");
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt sân");
      navigate("/auth/login");
      return;
    }

    setIsSubmitting(true);

    try {
      if (bookingType === "single") {
        const createResponse = await bookingService.createBooking(subfieldId, {
          start_time: getIsoDateTimeVn(date, customStartTime),
          end_time: getIsoDateTimeVn(date, customEndTime),
          type: "ONE_TIME",
          ...(addonsPayload.length > 0 ? { addons: addonsPayload } : {}),
        });

        const bookingId = createResponse.data.booking.id;

        toast.success("Tạo booking thành công. Vui lòng thanh toán để giữ chỗ.");
        navigate(`/booking-review/${bookingId}`);
        return;
      }

      if (!endDate) {
        toast.error("Vui lòng chọn ngày kết thúc cho đặt định kỳ");
        return;
      }

      const recurringResponse = await bookingService.createRecurringBooking(
        subfieldId,
        {
          start_time: getIsoDateTimeVn(date, customStartTime),
          end_time: getIsoDateTimeVn(date, customEndTime),
          start_date: format(date, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          recurring_type: recurringType,
          type: "RECURRING",
        },
      );

      toast.success("Tạo lịch đặt định kỳ thành công.");
      navigate(
        `/booking-review/recurring/${recurringResponse.data.recurringBooking.id}`,
      );
    } catch (error: unknown) {
      console.error("Booking submit failed", error);
      const apiError = error as ApiError;
      toast.error(apiError?.message || "Không thể tạo booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleConfirmBooking,
  };
}
