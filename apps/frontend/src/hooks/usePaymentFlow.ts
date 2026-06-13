import { useState } from "react";
import { toast } from "sonner";
import { bookingService } from "@/services/booking.service";

export function usePaymentFlow() {
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDialogBookingIds, setPaymentDialogBookingIds] = useState<string[]>([]);
  const [paymentDialogBookingId, setPaymentDialogBookingId] = useState<string | null>(null);

  const handlePayment = (bookingIds: string[], bookingId: string) => {
    setPaymentDialogBookingIds(bookingIds);
    setPaymentDialogBookingId(bookingId);
    setPaymentDialogOpen(true);
  };

  const handleSelectPaymentMethod = async (method: "STRIPE" | "VNPAY") => {
    if (!paymentDialogBookingId || payingBookingId) return;
    setPayingBookingId(paymentDialogBookingId);
    setPaymentDialogOpen(false);

    try {
      const result = method === "STRIPE"
        ? await bookingService.createCheckoutSession(paymentDialogBookingIds)
        : await bookingService.createVnpayCheckoutSession(paymentDialogBookingIds);
        
      const checkoutUrl = result.data?.url;

      if (!checkoutUrl) {
        toast.error("Không nhận được đường dẫn thanh toán. Vui lòng thử lại sau.");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err: unknown) {
      console.error(`Create ${method} checkout session failed`, err);
      const apiError = err as { message?: string };
      toast.error(
        apiError?.message ||
          "Không thể tạo phiên thanh toán. Vui lòng thử lại sau.",
      );
    } finally {
      setPayingBookingId(null);
      setPaymentDialogBookingId(null);
      setPaymentDialogBookingIds([]);
    }
  };

  return {
    paymentDialogOpen,
    setPaymentDialogOpen,
    payingBookingId,
    handlePayment,
    handleSelectPaymentMethod,
  };
}
