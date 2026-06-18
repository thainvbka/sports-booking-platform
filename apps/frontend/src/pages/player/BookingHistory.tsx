import { DeleteBookingDialog } from "@/components/player/booking-history/DeleteBookingDialog";
import { ReviewDialog } from "@/components/player/review/ReviewDialog";
import { PaginationBar } from "@/components/shared/ui-utility/PaginationBar";
import { useBookingActions } from "@/hooks/player/useBookingActions";
import { useBookings } from "@/hooks/player/useBookings";
import { usePaymentFlow } from "@/hooks/player/usePaymentFlow";
import { BookingStatus } from "@/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { CreateMatchDialog } from "@/components/shared/matches/CreateMatchDialog";
import { BookingCard } from "@/components/player/booking-history/BookingCard";
import { BookingHistoryHero } from "@/components/player/booking-history/BookingHistoryHero";
import { BookingCardSkeletonGrid, EmptyLedger } from "@/components/player/booking-history/BookingsPageStates";
import { BookingStatusTabs } from "@/components/player/booking-history/BookingStatusTabs";
import { PaymentMethodDialog } from "@/components/player/booking-history/PaymentMethodDialog";

const PAGE_SIZE = 9;

export function PlayerBookingsPage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "ALL">(
    "ALL",
  );
  const {
    bookings,
    loading,
    page,
    totalPages,
    summary,
    setPage,
    updateBookingStatus,
    updateSingleBookingReview,
  } = useBookings({ pageSize: PAGE_SIZE, status: selectedStatus });

  const {
    paymentDialogOpen,
    setPaymentDialogOpen,
    payingBookingId,
    handlePayment,
    handleSelectPaymentMethod,
  } = usePaymentFlow();

  const {
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
    handleCancel,
    handleReviewSuccess,
    openCancelDialog,
    openReviewDialog,
    openCreateMatchDialog,
  } = useBookingActions({ updateBookingStatus, updateSingleBookingReview });

  const statusCounts: Record<BookingStatus, number> = summary.byStatus;

  return (
    <div className="min-h-[60vh] bg-background">
      <BookingHistoryHero />

      <section className="page-shell py-10">
        <div className="flex flex-col gap-8">
          <BookingStatusTabs
            selectedStatus={selectedStatus}
            onStatusChange={(status) => {
              setSelectedStatus(status);
              setPage(1);
            }}
            total={summary.total}
            statusCounts={statusCounts}
          />

          {loading && bookings.length === 0 ? (
            <BookingCardSkeletonGrid />
          ) : bookings.length === 0 ? (
            <EmptyLedger />
          ) : (
            <div
              key={`bookings-grid-${selectedStatus}-${page}-${bookings.map((b) => b.id).join(",")}`}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-max motion-safe-stagger"
            >
              {bookings.map((booking) => (
                <BookingCard
                  key={`${booking.type}-${booking.id}`}
                  booking={booking}
                  loading={loading}
                  paying={payingBookingId === booking.id}
                  anyPaying={Boolean(payingBookingId)}
                  onPay={handlePayment}
                  onRequestCancel={() => openCancelDialog(booking.id, booking.type)}
                  onReviewClick={openReviewDialog}
                  onCreateMatchClick={openCreateMatchDialog}
                />
              ))}
            </div>
          )}

          {bookings.length > 0 && totalPages > 1 && (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              disabled={loading}
            />
          )}
        </div>
      </section>

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
        existingReview={selectedReviewBooking?.review ?? null}
        onOpenChange={(open) => {
          setReviewDialogOpen(open);
          if (!open) setSelectedReviewBooking(null);
        }}
        onSuccess={handleReviewSuccess}
      />

      <PaymentMethodDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSelect={handleSelectPaymentMethod}
        loading={Boolean(payingBookingId)}
      />

      <CreateMatchDialog
        open={createMatchDialogOpen}
        booking={selectedMatchBooking}
        onOpenChange={setCreateMatchDialogOpen}
        onSuccess={() => {
          navigate("/player/matches");
        }}
      />
    </div>
  );
}
