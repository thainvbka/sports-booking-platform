import { BookingFilters } from "@/components/owner/BookingFilters";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  RECURRENCE_TYPE_LABELS,
  SPORT_TYPE_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/store/owner/useBookingStore";
import type { OwnerBookingResponse } from "@/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlarmClock,
  ArrowUpRight,
  Ban,
  Calendar,
  CalendarRange,
  CheckCircle2,
  ChevronsRight,
  CircleDot,
  Clock,
  Layers,
  MapPin,
  MoreVertical,
  Phone,
  Search,
  Sparkles,
  Ticket,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type StatTone = "slate" | "emerald" | "sky" | "amber" | "rose";

const STAT_TONE: Record<
  StatTone,
  { chip: string; value: string; bar: string; bg: string; ring: string }
> = {
  slate: {
    chip: "border-slate-300/60 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200",
    value: "text-slate-900 dark:text-slate-100",
    bar: "bg-slate-400",
    bg: "from-slate-500/8 via-transparent to-transparent",
    ring: "ring-slate-500/10",
  },
  emerald: {
    chip: "border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    value: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
    bg: "from-emerald-500/10 via-transparent to-transparent",
    ring: "ring-emerald-500/15",
  },
  sky: {
    chip: "border-sky-300/60 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
    value: "text-sky-700 dark:text-sky-300",
    bar: "bg-sky-500",
    bg: "from-sky-500/10 via-transparent to-transparent",
    ring: "ring-sky-500/15",
  },
  amber: {
    chip: "border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    value: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
    bg: "from-amber-500/10 via-transparent to-transparent",
    ring: "ring-amber-500/15",
  },
  rose: {
    chip: "border-rose-300/60 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
    value: "text-rose-700 dark:text-rose-300",
    bar: "bg-rose-500",
    bg: "from-rose-500/10 via-transparent to-transparent",
    ring: "ring-rose-500/15",
  },
};

interface StatTileProps {
  icon: IconType;
  label: string;
  value: number;
  tone: StatTone;
  hint?: string;
}

function StatTile({ icon: Icon, label, value, tone, hint }: StatTileProps) {
  const t = STAT_TONE[tone];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card p-3 shadow-xs ring-1",
        t.ring,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br",
          t.bg,
        )}
      />
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-0.5", t.bar)}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "font-display text-2xl font-black italic tabular-nums tracking-tight",
              t.value,
            )}
          >
            {value}
          </span>
          {hint ? (
            <span className="text-[10.5px] text-muted-foreground">{hint}</span>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-xl border",
            t.chip,
          )}
        >
          <Icon className="size-3.5" />
        </span>
      </div>
    </div>
  );
}

export function OwnerBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    bookings,
    stats,
    pagination,
    queryParams,
    filters,
    isLoading,
    fetchBookings,
    fetchStats,
    setFilters,
    clearFilters,
    setPage,
    confirmBooking,
    cancelBooking,
  } = useBookingStore();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [selectedBookingType, setSelectedBookingType] = useState<
    "SINGLE" | "RECURRING"
  >("SINGLE");
  const [selectedBooking, setSelectedBooking] =
    useState<OwnerBookingResponse | null>(null);

  useEffect(() => {
    fetchStats();
    const urlPage = parseInt(searchParams.get("page") || "1");
    if (urlPage !== queryParams.page) {
      setPage(urlPage);
    } else {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (queryParams.page > 1) {
      params.set("page", String(queryParams.page));
    } else {
      params.delete("page");
    }
    setSearchParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const timer = setTimeout(() => {
      setFilters({ search: value });
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleViewDetail = (booking: OwnerBookingResponse) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleConfirmClick = (
    bookingId: string,
    type: "SINGLE" | "RECURRING",
  ) => {
    setSelectedBookingId(bookingId);
    setSelectedBookingType(type);
    setConfirmDialogOpen(true);
  };

  const handleCancelClick = (
    bookingId: string,
    type: "SINGLE" | "RECURRING",
  ) => {
    setSelectedBookingId(bookingId);
    setSelectedBookingType(type);
    setCancelDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedBookingId) return;
    try {
      await confirmBooking(selectedBookingId, selectedBookingType);
      toast.success("Xác nhận đặt sân thành công");
      setConfirmDialogOpen(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể xác nhận đặt sân";
      toast.error(message);
    }
  };

  const handleCancelAction = async () => {
    if (!selectedBookingId) return;
    try {
      await cancelBooking(selectedBookingId, selectedBookingType);
      toast.success("Hủy đặt sân thành công");
      setCancelDialogOpen(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể hủy đặt sân";
      toast.error(message);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const canConfirmBooking = (booking: OwnerBookingResponse): boolean =>
    booking.status === "COMPLETED";

  const canCancelBooking = (booking: OwnerBookingResponse): boolean => {
    if (booking.status === "CANCELED") return false;
    const startTime =
      booking.type === "SINGLE" ? booking.start_time : booking.start_date;
    return new Date(startTime) > new Date();
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.dateRange ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined,
  );

  // ── Table columns ──────────────────────────────────────────────
  const columns: Column<OwnerBookingResponse>[] = [
    {
      header: "#",
      className: "w-12",
      cell: (_, index) => (
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {(queryParams.page - 1) * queryParams.limit + index + 1}
        </span>
      ),
    },
    {
      header: "Loại",
      className: "w-24 whitespace-nowrap",
      cell: (booking) => (
        <Badge
          variant="outline"
          className={cn(
            "h-5 gap-1 rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.14em]",
            booking.type === "RECURRING"
              ? "border-violet-300/60 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300"
              : "border-sky-300/60 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
          )}
        >
          {booking.type === "RECURRING" ? (
            <CalendarRange className="size-2.5" />
          ) : (
            <Ticket className="size-2.5" />
          )}
          {booking.type === "RECURRING" ? "Định kỳ" : "Đơn lẻ"}
        </Badge>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-48",
      cell: (booking) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <User className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{booking.player_name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
            <Phone className="size-3 shrink-0" />
            {booking.player_phone}
          </div>
        </div>
      ),
    },
    {
      header: "Sân",
      className: "w-52",
      cell: (booking) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="truncate text-sm font-medium">
            {booking.complex_name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {booking.sub_field_name} ·{" "}
            {SPORT_TYPE_LABELS[
              booking.sport_type as keyof typeof SPORT_TYPE_LABELS
            ] ?? booking.sport_type}
          </span>
        </div>
      ),
    },
    {
      header: "Thời gian",
      className: "w-56 whitespace-nowrap",
      cell: (booking) =>
        booking.type === "RECURRING" ? (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <CalendarRange className="size-3.5 text-muted-foreground" />
              <span>{RECURRENCE_TYPE_LABELS[booking.recurrence_type]}</span>
              <span className="text-[10px] font-normal text-muted-foreground tabular-nums">
                · {booking.total_slots} buổi
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {format(new Date(booking.start_date), "dd/MM/yyyy")}
              <ChevronsRight className="mx-0.5 inline size-3" />
              {format(new Date(booking.end_date), "dd/MM/yyyy")}
            </span>
            {booking.bookings?.[0] ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
                <Clock className="size-3" />
                {format(new Date(booking.bookings[0].start_time), "HH:mm")}
                {" → "}
                {format(new Date(booking.bookings[0].end_time), "HH:mm")}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span className="tabular-nums">
                {format(new Date(booking.start_time), "EEE, dd/MM/yyyy", {
                  locale: vi,
                })}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
              <Clock className="size-3" />
              {format(new Date(booking.start_time), "HH:mm")} →{" "}
              {format(new Date(booking.end_time), "HH:mm")}
            </span>
          </div>
        ),
    },
    {
      header: "Giá tiền",
      className: "w-32 whitespace-nowrap text-right",
      cell: (booking) => (
        <div className="text-right">
          <span className="font-display text-sm font-black italic tabular-nums tracking-tight text-foreground">
            {formatPrice(booking.total_price)}
          </span>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-36 whitespace-nowrap",
      cell: (booking) => (
        <Badge
          className={cn(
            "h-6 rounded-full px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em]",
            BOOKING_STATUS_COLORS[booking.status],
          )}
        >
          {BOOKING_STATUS_LABELS[booking.status]}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-12",
      cell: (booking) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Thao tác"
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => handleViewDetail(booking)}
              className="cursor-pointer gap-2"
            >
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
              Xem chi tiết
            </DropdownMenuItem>
            {canConfirmBooking(booking) ? (
              <DropdownMenuItem
                onClick={() => handleConfirmClick(booking.id, booking.type)}
                className="cursor-pointer gap-2 text-emerald-700 focus:text-emerald-700 dark:text-emerald-400 dark:focus:text-emerald-400"
              >
                <CheckCircle2 className="size-3.5" />
                Xác nhận
              </DropdownMenuItem>
            ) : null}
            {canCancelBooking(booking) ? (
              <DropdownMenuItem
                onClick={() => handleCancelClick(booking.id, booking.type)}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              >
                <Ban className="size-3.5" />
                Hủy đặt sân
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-background to-accent-sport/5 px-4 py-4 shadow-sm md:px-6 md:py-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-14 size-56 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-10 size-48 rounded-full bg-accent-sport/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">

            <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
              Sổ tay đặt sân của{" "}
              <span className="italic text-primary">bạn</span>
            </h1>
            <p className="hidden max-w-xl text-xs text-muted-foreground md:block">
              Theo dõi, xác nhận và điều phối mọi lượt đặt — đơn lẻ lẫn định kỳ
              — từ một bảng điều khiển duy nhất.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <AlarmClock className="size-3.5" />
            {format(new Date(), "EEE, dd/MM", { locale: vi })}
          </div>
        </div>

        {/* Stat strip */}
        <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile
            icon={Layers}
            label="Tổng"
            value={stats.total}
            tone="slate"
            hint="Tất cả lượt đặt"
          />
          <StatTile
            icon={CheckCircle2}
            label="Đã xác nhận"
            value={stats.confirmed}
            tone="emerald"
            hint="Sẵn sàng đón khách"
          />
          <StatTile
            icon={AlarmClock}
            label="Chờ xác nhận"
            value={stats.completed}
            tone="sky"
            hint="Cần bạn duyệt"
          />
          <StatTile
            icon={Wallet}
            label="Chưa thanh toán"
            value={stats.pending}
            tone="amber"
            hint="Đang chờ ví"
          />
          <StatTile
            icon={Ban}
            label="Đã hủy"
            value={stats.canceled}
            tone="rose"
            hint="Không hoạt động"
          />
        </div>
      </section>

      {/* ── TOOLBAR ──────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-xs md:flex-row md:items-center md:justify-between md:p-3.5">
        <div className="relative w-full md:max-w-sm">
          <Input
            type="search"
            placeholder="Tìm theo khách, sân, khu phức hợp…"
            defaultValue={filters.search || ""}
            onChange={handleSearchChange}
            className="h-10 rounded-full pl-10 pr-10 text-sm shadow-none focus-visible:ring-1"
          />
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <BookingFilters
            onFilterChange={(newFilters) => setFilters(newFilters)}
            onClear={clearFilters}
          />
        </div>
      </section>

      {/* ── TABLE ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Danh sách lịch đặt{" "}
          <span className="tabular-nums text-foreground">
            · {pagination?.total ?? bookings.length}
          </span>
        </span>
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 rounded-full px-2 text-[11px] font-semibold"
          >
            <X data-icon="inline-start" />
            Xóa bộ lọc
          </Button>
        ) : null}
      </div>

      <DataTable
        data={bookings}
        columns={columns}
        isLoading={isLoading}
        paginationStyle="search"
        pagination={{
          page: queryParams.page,
          totalPages: pagination?.totalPages || 1,
          onPageChange: (page) => setPage(page),
        }}
        emptyMessage={
          hasActiveFilters
            ? "Không có lịch đặt phù hợp với bộ lọc của bạn"
            : "Chưa có lịch đặt sân nào — hãy quảng bá khu phức hợp để nhận booking đầu tiên."
        }
      />

      {/* ── Detail Dialog ───────────────────────────────────── */}
      {selectedBooking ? (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto p-0">
            {/* Gradient accent bar */}
            <div
              aria-hidden
              className="h-1 w-full bg-gradient-to-r from-primary via-accent-sport to-primary"
            />

            <div className="flex flex-col gap-4 px-6 py-5">
              <DialogHeader className="gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="h-5 gap-1 rounded-full border-border/60 bg-background px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    <Ticket className="size-2.5" />
                    {selectedBooking.type === "RECURRING"
                      ? "Định kỳ"
                      : "Đơn lẻ"}
                  </Badge>
                  <Badge
                    className={cn(
                      "h-5 rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      BOOKING_STATUS_COLORS[selectedBooking.status],
                    )}
                  >
                    {BOOKING_STATUS_LABELS[selectedBooking.status]}
                  </Badge>
                </div>
                <DialogTitle className="font-display text-xl font-black italic tracking-tight">
                  {selectedBooking.complex_name}
                </DialogTitle>
                <DialogDescription className="flex flex-col gap-1 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <CircleDot className="size-3" />
                    <span className="font-medium text-foreground">
                      {selectedBooking.sub_field_name}
                    </span>
                    <Separator
                      orientation="vertical"
                      className="mx-1 h-3"
                    />
                    <span>
                      {SPORT_TYPE_LABELS[
                        selectedBooking.sport_type as keyof typeof SPORT_TYPE_LABELS
                      ] ?? selectedBooking.sport_type}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3" />
                    {selectedBooking.complex_address}
                  </span>
                </DialogDescription>
              </DialogHeader>

              {/* Customer */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold">
                      {selectedBooking.player_name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                      <Phone className="size-3" />
                      {selectedBooking.player_phone}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Khách
                </span>
              </div>

              {/* Time / price */}
              {selectedBooking.type === "SINGLE" ? (
                <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-4">
                  {/* ticket notches */}
                  <span
                    aria-hidden
                    className="absolute -left-2 top-1/2 size-4 -translate-y-1/2 rounded-full bg-background ring-1 ring-border/60"
                  />
                  <span
                    aria-hidden
                    className="absolute -right-2 top-1/2 size-4 -translate-y-1/2 rounded-full bg-background ring-1 ring-border/60"
                  />

                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Thời gian đặt
                      </span>
                      <span className="font-display text-base font-bold italic tabular-nums tracking-tight">
                        {format(
                          new Date(selectedBooking.start_time),
                          "EEEE, dd/MM/yyyy",
                          { locale: vi },
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                        <Clock className="size-3.5" />
                        {format(
                          new Date(selectedBooking.start_time),
                          "HH:mm",
                        )}{" "}
                        →{" "}
                        {format(new Date(selectedBooking.end_time), "HH:mm")}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Tổng tiền
                      </span>
                      <span className="font-display text-xl font-black italic tabular-nums tracking-tight text-primary">
                        {formatPrice(selectedBooking.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-muted/30 p-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Tổng số buổi
                      </span>
                      <span className="font-display text-lg font-black italic tabular-nums tracking-tight">
                        {selectedBooking.total_slots}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Tổng tiền
                      </span>
                      <span className="font-display text-lg font-black italic tabular-nums tracking-tight text-primary">
                        {formatPrice(selectedBooking.total_price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Danh sách buổi
                    </span>
                  </div>

                  <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
                    {selectedBooking.bookings.map((slot, idx) => (
                      <li
                        key={slot.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-[10px] font-bold tabular-nums text-muted-foreground">
                            #{idx + 1}
                          </span>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-semibold tabular-nums">
                              {format(
                                new Date(slot.start_time),
                                "EEE, dd/MM/yyyy",
                                { locale: vi },
                              )}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                              <Clock className="size-3" />
                              {format(new Date(slot.start_time), "HH:mm")} →{" "}
                              {format(new Date(slot.end_time), "HH:mm")}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            className={cn(
                              "h-5 rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.14em]",
                              BOOKING_STATUS_COLORS[slot.status],
                            )}
                          >
                            {BOOKING_STATUS_LABELS[slot.status]}
                          </Badge>
                          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                            {formatPrice(slot.total_price)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* ── Confirm Dialog ─────────────────────────────────── */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display italic">
              <CheckCircle2 className="size-5 text-emerald-600" />
              Xác nhận đặt sân
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xác nhận lịch đặt sân này? Khách hàng sẽ
              nhận được thông báo ngay.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isLoading}
              className="rounded-full bg-emerald-600 text-white shadow-emerald-600/25 hover:bg-emerald-600/90"
            >
              <CheckCircle2 data-icon="inline-start" />
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Dialog ──────────────────────────────────── */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display italic">
              <Ban className="size-5 text-destructive" />
              Hủy đặt sân
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy lịch đặt sân này? Hành động không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              className="rounded-full"
            >
              Không
            </Button>
            <Button
              onClick={handleCancelAction}
              variant="destructive"
              disabled={isLoading}
              className="rounded-full"
            >
              <Ban data-icon="inline-start" />
              Hủy đặt sân
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
