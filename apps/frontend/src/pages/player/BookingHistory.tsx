import { DeleteBookingDialog } from "@/components/player/DeleteBookingDialog";
import { ReviewDialog } from "@/components/player/ReviewDialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookings } from "@/hooks/useBookings";
import {
  BOOKING_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { bookingService } from "@/services/booking.service";
import {
  BookingStatus,
  type BookingResponse,
  type ReviewItem,
} from "@/types";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  CreditCard,
  ShieldCheck,
  Ticket,
  XCircle,
  Zap
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { BookingCard, type SingleBooking } from "@/components/player/BookingCard";
import { CreateMatchDialog } from "@/components/matches/CreateMatchDialog";

const PAGE_SIZE = 9;

const BOOKING_STATUS_TAB_META: Record<
  BookingStatus,
  {
    icon: LucideIcon;
    label: string;
    tint: string;
    dot: string;
  }
> = {
  [BookingStatus.PENDING]: {
    icon: CreditCard,
    label: "Chờ thanh toán",
    tint: "data-[state=active]:bg-amber-500/10 data-[state=active]:border-amber-400/40",
    dot: "bg-amber-500",
  },
  [BookingStatus.CONFIRMED]: {
    icon: BadgeCheck,
    label: "Đã xác nhận",
    tint: "data-[state=active]:bg-emerald-500/10 data-[state=active]:border-emerald-400/40",
    dot: "bg-emerald-500",
  },
  [BookingStatus.COMPLETED]: {
    icon: Clock,
    label: "Đã hoàn thành",
    tint: "data-[state=active]:bg-sky-500/10 data-[state=active]:border-sky-400/40",
    dot: "bg-sky-500",
  },
  [BookingStatus.CANCELED]: {
    icon: XCircle,
    label: "Đã hủy",
    tint: "data-[state=active]:bg-rose-500/10 data-[state=active]:border-rose-400/40",
    dot: "bg-rose-500",
  },
};

// ─── Main page ─────────────────────────────────────────────────────────────
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [selectedBookingType, setSelectedBookingType] = useState<
    "SINGLE" | "RECURRING"
  >("SINGLE");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] =
    useState<SingleBooking | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  // Payment Dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDialogBookingIds, setPaymentDialogBookingIds] = useState<string[]>([]);
  const [paymentDialogBookingId, setPaymentDialogBookingId] = useState<string | null>(null);

  // Create Match states
  const [createMatchDialogOpen, setCreateMatchDialogOpen] = useState(false);
  const [selectedMatchBooking, setSelectedMatchBooking] = useState<BookingResponse | null>(null);

  // ─── Handlers (logic preserved) ──────────────────────────────────────────
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

  const handleReviewSuccess = (bookingId: string, review: ReviewItem) => {
    updateSingleBookingReview(bookingId, review);
    // Đóng review dialog
    setReviewDialogOpen(false);
    toast.success("Đánh giá của bạn đã được lưu");
  };

  const statusCounts: Record<BookingStatus, number> = summary.byStatus;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[60vh] bg-background">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950/80"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 sports-field-pattern opacity-[0.1]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-8 size-80 rounded-full bg-accent-sport/25 blur-3xl"
        />

        <div className="page-shell relative z-10 flex min-h-85 flex-col gap-8 py-12 sm:min-h-90 sm:py-16 lg:min-h-100 lg:gap-10 lg:py-20">
          <Breadcrumb>
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="hover:text-white">
                  <Link to="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/30" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Lịch sử đặt sân</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="flex flex-col gap-2">
            <div className="flex max-w-2xl flex-col gap-2">
              <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Lịch sử đặt sân{" "}
                <span className="bg-linear-to-br from-primary via-primary to-accent-sport bg-clip-text italic text-transparent">
                  của bạn
                </span>
              </h1>
              <p className="text-base text-white/70 sm:text-lg">
                Mỗi vé là một trận sắp đá, một hóa đơn cần chốt hoặc một kỉ niệm đã
                khép. Theo dõi, thanh toán, hủy lịch và đánh giá sân ở cùng một nơi.
              </p>
            </div>
          </header>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-background"
        />
      </section>

      <section className="page-shell py-10">
        <div className="flex flex-col gap-8">
          {/* ── Status Tabs ───────────────────────────────────────────── */}
          <Tabs
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value as BookingStatus | "ALL");
              setPage(1);
            }}
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-transparent p-0 sm:grid-cols-2 lg:grid-cols-5">
              <TabsTrigger
                value="ALL"
                className={cn(
                  "group flex h-auto flex-col items-start gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm",
                  "data-[state=active]:border-transparent data-[state=active]:shadow-md data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30",
                  "hover:border-border hover:bg-card",
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-muted/70 text-foreground/80">
                      <Zap className="size-3" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Tất cả
                      </span>
                      <span className="font-display text-xs font-bold italic text-foreground">
                        Lịch sử
                      </span>
                    </span>
                  </span>
                  <span className="font-display text-lg font-black italic tabular-nums text-foreground">
                    {summary.total}
                  </span>
                </div>
              </TabsTrigger>
              {Object.entries(BOOKING_STATUS_TAB_META).map(([status, meta]) => {
                const Icon = meta.icon;
                const count = statusCounts[status as BookingStatus] ?? 0;
                return (
                  <TabsTrigger
                    key={status}
                    value={status}
                    className={cn(
                      "group flex h-auto flex-col items-start gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm",
                      "data-[state=active]:border-transparent data-[state=active]:shadow-md",
                      "hover:border-border hover:bg-card",
                      meta.tint,
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-muted/70 text-foreground/80">
                          <Icon className="size-3" />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {meta.label.split(" ")[0]}
                          </span>
                          <span className="font-display text-xs font-bold italic text-foreground">
                            {BOOKING_STATUS_LABELS[status as BookingStatus] ?? status}
                          </span>
                        </span>
                      </span>
                      <span className="font-display text-lg font-black italic tabular-nums text-foreground">
                        {count}
                      </span>
                    </div>
                    <span
                      aria-hidden
                      className={cn(
                        "h-0.5 w-full origin-left rounded-full bg-transparent transition-all",
                        "group-data-[state=active]:bg-gradient-to-r",
                        status === BookingStatus.PENDING && "group-data-[state=active]:from-amber-500 group-data-[state=active]:to-amber-300",
                        status === BookingStatus.CONFIRMED && "group-data-[state=active]:from-emerald-500 group-data-[state=active]:to-emerald-300",
                        status === BookingStatus.COMPLETED && "group-data-[state=active]:from-sky-500 group-data-[state=active]:to-sky-300",
                        status === BookingStatus.CANCELED && "group-data-[state=active]:from-rose-500 group-data-[state=active]:to-rose-300",
                      )}
                    />
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* ── Booking Cards Grid ───────────────────────────────────── */}
          {loading && bookings.length === 0 ? (
            <BookingCardSkeletonGrid />
          ) : bookings.length === 0 ? (
            <EmptyLedger />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
              {bookings.map((booking) => (
                <BookingCard
                  key={`${booking.type}-${booking.id}`}
                  booking={booking}
                  loading={loading}
                  paying={payingBookingId === booking.id}
                  anyPaying={Boolean(payingBookingId)}
                  onPay={handlePayment}
                  onRequestCancel={() => {
                    setSelectedBookingId(booking.id);
                    setSelectedBookingType(booking.type);
                    setDeleteDialogOpen(true);
                  }}
                  onReviewClick={(b) => {
                    setSelectedReviewBooking(b);
                    setReviewDialogOpen(true);
                  }}
                  onCreateMatchClick={(b) => {
                    setSelectedMatchBooking(b);
                    setCreateMatchDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ───────────────────────────────────────────── */}
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

      {/* ── Dialogs (unchanged wiring) ────────────────────────────── */}
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

// ─── Skeleton grid ────────────────────────────────────────────────────────
function BookingCardSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:p-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Title */}
          <Skeleton className="h-5 w-2/3" />

          {/* Address */}
          <Skeleton className="h-4 w-full" />

          {/* Date/Time */}
          <div className="flex gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Price */}
          <Skeleton className="h-6 w-32 mt-1" />

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────
function EmptyLedger() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/70 bg-background/60 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Ticket className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="italic tracking-tight text-heading">
          Chưa có vé nào trong sổ
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Khi bạn đặt sân, mỗi lượt sẽ hiện ở đây như một tấm vé — theo dõi
          thanh toán, thời gian và đánh giá ở cùng một nơi.
        </p>
      </div>
    </div>
  );
}

// ─── Pagination bar ───────────────────────────────────────────────────────
function PaginationBar({
  page,
  totalPages,
  onPageChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  const items = buildPageList(page, totalPages);

  const go = (event: React.MouseEvent, target: number) => {
    event.preventDefault();
    if (disabled) return;
    if (target < 1 || target > totalPages || target === page) return;
    onPageChange(target);
  };

  return (
    <Pagination className="pt-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1 || disabled}
            className={cn((page === 1 || disabled) && "pointer-events-none opacity-50")}
            onClick={(event) => go(event, page - 1)}
          />
        </PaginationItem>
        {items.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          return (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={page === item}
                onClick={(event) => go(event, item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === totalPages || disabled}
            className={cn(
              (page === totalPages || disabled) &&
                "pointer-events-none opacity-50",
            )}
            onClick={(event) => go(event, page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildPageList(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "ellipsis")[] = [1];
  if (current > 3) items.push("ellipsis");
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  for (let i = from; i <= to; i++) items.push(i);
  if (current < total - 2) items.push("ellipsis");
  items.push(total);
  return items;
}

// ─── Payment method dialog component ───────────────────────────────────────
interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (method: "STRIPE" | "VNPAY") => void;
  loading: boolean;
}

function PaymentMethodDialog({
  open,
  onOpenChange,
  onSelect,
  loading,
}: PaymentMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-6 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-bold tracking-tight">Chọn phương thức thanh toán</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Vui lòng chọn cổng thanh toán phù hợp để tiếp tục giao dịch.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 pt-4">
          <Button
            variant="outline"
            className="flex items-center justify-between p-5 h-auto border-border/80 hover:border-primary/50 hover:bg-primary/5 group transition-all rounded-xl text-left"
            disabled={loading}
            onClick={() => onSelect("STRIPE")}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500/20">
                <CreditCard className="size-6" />
              </div>
              <div>
                <div className="font-bold text-foreground text-sm">Thanh toán Stripe</div>
                <div className="text-xs text-muted-foreground">Hỗ trợ các thẻ quốc tế Visa, Mastercard, JCB</div>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-between p-5 h-auto border-border/80 hover:border-emerald-500/50 hover:bg-emerald-500/5 group transition-all rounded-xl text-left"
            disabled={loading}
            onClick={() => onSelect("VNPAY")}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:bg-emerald-500/20">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <div className="font-bold text-foreground text-sm">Cổng thanh toán VNPAY</div>
                <div className="text-xs text-muted-foreground">ATM nội địa, QR Pay, Ví điện tử</div>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
