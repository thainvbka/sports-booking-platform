import { StatsGrid } from "@/components/admin/StatsGrid";
import {
  AdminDetailDialog,
  DetailInfoCard,
  DetailSummaryRow,
} from "@/components/admin/details/AdminDetailDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  RECURRENCE_TYPE_LABELS,
  RECURRING_STATUS_COLORS,
  RECURRING_STATUS_LABELS,
  SPORT_TYPE_LABELS,
} from "@/lib/constants";
import { fmtVND } from "@/lib/format";
import { useAdminBookingStore } from "@/store/admin/useAdminBookingStore";
import { useAdminRecurringBookingStore } from "@/store/admin/useAdminRecurringBookingStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  CalendarRange,
  Clock,
  Info,
  LayoutDashboard,
  LayoutList,
  MapPin,
  Repeat2,
  Search,
  Tag,
  Timer,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

// ── Local display types (shapes returned by the admin API) ────────────────────

interface BookingSubField {
  sub_field_name: string;
  sport_type: string;
  complex: { complex_name: string; owner: { company_name: string } };
}

interface BookingPlayer {
  account: { full_name: string; phone_number: string };
}

interface AdminBookingRow {
  id: string;
  status: string;
  total_price: number | string;
  start_time: string;
  end_time: string;
  created_at: string;
  player: BookingPlayer;
  sub_field: BookingSubField;
}

interface ChildBooking {
  id: string;
  status: string;
  total_price: number | string;
  start_time: string;
  end_time: string;
}

interface AdminRecurringRow {
  id: string;
  status: string;
  recurrence_type: string;
  start_date: string;
  end_date: string;
  total_value: number;
  child_count: number;
  status_breakdown: Record<string, number>;
  player: BookingPlayer;
  sub_field: BookingSubField;
  bookings: ChildBooking[];
}

type BookingView = "single" | "recurring";

export default function AdminBookingsPage() {
  const [activeView, setActiveView] = useState<BookingView>("single");
  const [recurringInitialized, setRecurringInitialized] = useState(false);

  // ── Single booking store ────────────────────────────────────────────────────
  const {
    bookings,
    pagination: singlePagination,
    stats: singleStats,
    isLoading: singleLoading,
    filters: singleFilters,
    queryParams: singleParams,
    fetchBookings,
    setFilters: setSingleFilters,
    setPage: setSinglePage,
  } = useAdminBookingStore();

  // ── Recurring booking store ─────────────────────────────────────────────────
  const {
    recurringBookings,
    pagination: recurringPagination,
    stats: recurringStats,
    isLoading: recurringLoading,
    filters: recurringFilters,
    queryParams: recurringParams,
    fetchRecurringBookings,
    setFilters: setRecurringFilters,
    setPage: setRecurringPage,
  } = useAdminRecurringBookingStore();

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [singleSearch, setSingleSearch] = useState(singleFilters.search || "");
  const [recurringSearch, setRecurringSearch] = useState(
    recurringFilters.search || "",
  );
  const [selectedBooking, setSelectedBooking] =
    useState<AdminBookingRow | null>(null);
  const [selectedRecurring, setSelectedRecurring] =
    useState<AdminRecurringRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewChange = (view: BookingView) => {
    setActiveView(view);
    if (view === "recurring" && !recurringInitialized) {
      fetchRecurringBookings();
      setRecurringInitialized(true);
    }
  };

  // ── Debounced search ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (singleSearch !== (singleFilters.search || "")) {
        setSingleFilters({ search: singleSearch });
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleSearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (recurringSearch !== (recurringFilters.search || "")) {
        setRecurringFilters({ search: recurringSearch });
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurringSearch]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const bookingStatusColor = (status: string) =>
    BOOKING_STATUS_COLORS[status as keyof typeof BOOKING_STATUS_COLORS] ||
    "bg-slate-100 text-slate-700";

  const bookingStatusLabel = (status: string) =>
    BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS] ||
    "Không xác định";

  const sportLabel = (sportType: string) =>
    SPORT_TYPE_LABELS[sportType as keyof typeof SPORT_TYPE_LABELS] ||
    "Không xác định";

  // ── SINGLE stats ────────────────────────────────────────────────────────────
  const singleStatItems = [
    {
      label: "Tổng đặt đơn lẻ",
      value: singleStats.total,
      icon: LayoutDashboard,
      color: "blue" as const,
      // variant: "solid" as const,
    },
    {
      label: "Chưa thanh toán",
      value: singleStats.pending,
      icon: Clock,
      color: "orange" as const,
    },
    {
      label: "Chờ xác nhận",
      value: singleStats.completed,
      icon: Timer,
      color: "indigo" as const,
    },
    {
      label: "Đã hủy",
      value: singleStats.canceled,
      icon: XCircle,
      color: "red" as const,
    },
  ];

  // ── RECURRING stats ─────────────────────────────────────────────────────────
  const recurringStatItems = [
    {
      label: "Tổng nhóm định kỳ",
      value: recurringStats.total,
      icon: Repeat2,
      color: "purple" as const,
      // variant: "solid" as const,
    },
    {
      label: "Chờ xác nhận",
      value: recurringStats.pending,
      icon: Clock,
      color: "orange" as const,
    },
    {
      label: "Đang hoạt động",
      value: recurringStats.confirmed,
      icon: CalendarRange,
      color: "green" as const,
    },
    {
      label: "Đã hủy",
      value: recurringStats.canceled,
      icon: XCircle,
      color: "red" as const,
    },
  ];

  // ── SINGLE columns ──────────────────────────────────────────────────────────
  const singleColumns: Column<AdminBookingRow>[] = [
    {
      header: "Mã",
      className: "w-20",
      cell: (b) => (
        <span className="text-[10px] font-mono text-muted-foreground uppercase truncate block w-16">
          {b.id.split("-")[0]}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-52",
      cell: (b) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 font-medium text-sm">
            <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{b.player.account.full_name}</span>
          </div>
          <span className="text-[10px] text-muted-foreground ml-5 truncate">
            {b.player.account.phone_number}
          </span>
        </div>
      ),
    },
    {
      header: "Sân bóng",
      className: "w-56",
      cell: (b) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 font-medium text-sm">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="truncate">{b.sub_field.complex.complex_name}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-5 italic">
            <span>{b.sub_field.sub_field_name}</span>
            <span>•</span>
            <span>{sportLabel(b.sub_field.sport_type)}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Thời gian",
      className: "w-36",
      cell: (b) => (
        <div className="flex flex-col gap-0.5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span>
              {format(new Date(b.start_time), "dd/MM/yyyy", { locale: vi })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {format(new Date(b.start_time), "HH:mm")} –{" "}
              {format(new Date(b.end_time), "HH:mm")}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Thanh toán",
      className: "w-28",
      cell: (b) => (
        <span className="font-bold text-sm text-green-700">
          {fmtVND(Number(b.total_price))}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (b) => (
        <Badge
          className={`${bookingStatusColor(b.status)} border-none text-[10px] py-0 h-5 shadow-none`}
        >
          {bookingStatusLabel(b.status)}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-8",
      cell: () => <Info className="w-4 h-4 text-muted-foreground/50" />,
    },
  ];

  // ── RECURRING columns ───────────────────────────────────────────────────────
  const recurringColumns: Column<AdminRecurringRow>[] = [
    {
      header: "Mã nhóm",
      className: "w-20",
      cell: (rb) => (
        <span className="text-[10px] font-mono text-muted-foreground uppercase truncate block w-16">
          {rb.id.split("-")[0]}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-52",
      cell: (rb) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 font-medium text-sm">
            <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{rb.player.account.full_name}</span>
          </div>
          <span className="text-[10px] text-muted-foreground ml-5 truncate">
            {rb.player.account.phone_number}
          </span>
        </div>
      ),
    },
    {
      header: "Sân bóng",
      className: "w-56",
      cell: (rb) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 font-medium text-sm">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="truncate">
              {rb.sub_field.complex.complex_name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-5 italic">
            <span>{rb.sub_field.sub_field_name}</span>
            <span>•</span>
            <span>{sportLabel(rb.sub_field.sport_type)}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Chu kỳ",
      className: "w-40",
      cell: (rb) => (
        <div className="flex flex-col gap-1">
          <Badge className="bg-purple-100 text-purple-800 border-none text-[10px] py-0 h-5 shadow-none w-fit">
            <Repeat2 className="w-2.5 h-2.5 mr-1" />
            {RECURRENCE_TYPE_LABELS[rb.recurrence_type] ?? rb.recurrence_type}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(rb.start_date), "dd/MM/yy")} →{" "}
            {format(new Date(rb.end_date), "dd/MM/yy")}
          </span>
        </div>
      ),
    },
    {
      header: "Số buổi",
      className: "w-20 text-center",
      cell: (rb) => (
        <div className="text-center">
          <span className="text-sm font-black text-foreground">
            {rb.child_count}
          </span>
          <span className="text-[10px] text-muted-foreground"> buổi</span>
        </div>
      ),
    },
    {
      header: "Tổng tiền",
      className: "w-28",
      cell: (rb) => (
        <span className="font-bold text-sm text-green-700">
          {fmtVND(rb.total_value)}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (rb) => (
        <Badge
          className={`${RECURRING_STATUS_COLORS[rb.status] ?? "bg-slate-100 text-slate-700"} border-none text-[10px] py-0 h-5 shadow-none`}
        >
          {RECURRING_STATUS_LABELS[rb.status] ?? rb.status}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-8",
      cell: () => <Info className="w-4 h-4 text-muted-foreground/50" />,
    },
  ];

  return (
    <div className="px-4 lg:px-6 space-y-6 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Giám sát Đặt sân</h1>
        <p className="text-sm text-muted-foreground">
          Dữ liệu thống kê dựa trên toàn bộ hệ thống.
        </p>
      </div>

      {/* ── Stats ── */}
      <StatsGrid
        items={activeView === "single" ? singleStatItems : recurringStatItems}
      />

      {/* ── Filters + view toggle on same row ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Tab toggle */}
        <div className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 p-0.5 gap-0.5">
          <button
            onClick={() => handleViewChange("single")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
              activeView === "single"
                ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            Đơn lẻ
          </button>
          <button
            onClick={() => handleViewChange("recurring")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
              activeView === "recurring"
                ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Repeat2 className="w-3.5 h-3.5" />
            Định kỳ
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          {activeView === "single" ? (
            <Input
              key="single-search"
              placeholder="Tìm theo Tên khách, Tên sân..."
              className="pl-9 h-9 border-slate-200 shadow-none"
              value={singleSearch}
              onChange={(e) => setSingleSearch(e.target.value)}
            />
          ) : (
            <Input
              key="recurring-search"
              placeholder="Tìm theo Tên khách, Tên sân..."
              className="pl-9 h-9 border-slate-200 shadow-none"
              value={recurringSearch}
              onChange={(e) => setRecurringSearch(e.target.value)}
            />
          )}
        </div>

        {/* Status filter — adapts per tab */}
        {activeView === "single" ? (
          <Select
            value={singleFilters.status || "ALL"}
            onValueChange={(value) =>
              setSingleFilters({ status: value === "ALL" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[180px] h-9 border-slate-200 shadow-none shrink-0">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Select
            value={recurringFilters.status || "ALL"}
            onValueChange={(value) =>
              setRecurringFilters({
                status: value === "ALL" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-[180px] h-9 border-slate-200 shadow-none shrink-0">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {Object.entries(RECURRING_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* ── Table ── */}
      {activeView === "single" ? (
        <DataTable
          data={bookings as AdminBookingRow[]}
          columns={singleColumns}
          isLoading={singleLoading}
          onRowClick={(b) => {
            setSelectedBooking(b);
            setDetailOpen(true);
          }}
          pagination={{
            page: singleParams.page,
            totalPages: singlePagination?.totalPages || 1,
            onPageChange: setSinglePage,
          }}
          emptyMessage="Không tìm thấy lịch đặt sân nào"
        />
      ) : (
        <DataTable
          data={recurringBookings as AdminRecurringRow[]}
          columns={recurringColumns}
          isLoading={recurringLoading}
          onRowClick={(rb) => {
            setSelectedRecurring(rb);
            setDetailOpen(true);
          }}
          pagination={{
            page: recurringParams.page,
            totalPages: recurringPagination?.totalPages || 1,
            onPageChange: setRecurringPage,
          }}
          emptyMessage="Không tìm thấy nhóm đặt định kỳ nào"
        />
      )}

      {/* ── Single booking detail dialog ─────────────────────────────────────── */}
      <AdminDetailDialog
        open={detailOpen && activeView === "single"}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedBooking(null);
        }}
        title="Chi tiết lượt đặt sân"
        icon={Tag}
        statusLabel={
          selectedBooking
            ? bookingStatusLabel(selectedBooking.status)
            : undefined
        }
        statusClassName={
          selectedBooking
            ? bookingStatusColor(selectedBooking.status)
            : undefined
        }
      >
        {selectedBooking && (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto bg-white">
            <DetailSummaryRow
              leftLabel="Tổng chi phí"
              leftValue={
                <p className="text-2xl font-black text-green-700">
                  {fmtVND(Number(selectedBooking.total_price))}
                </p>
              }
              rightLabel="Mã đặt sân"
              rightValue={
                <p className="text-xs font-mono font-bold break-all text-slate-700 max-w-64">
                  {selectedBooking.id}
                </p>
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailInfoCard
                label="Khách hàng"
                value={selectedBooking.player.account.full_name}
                helper={selectedBooking.player.account.phone_number}
              />
              <DetailInfoCard
                label="Đơn vị sở hữu"
                value={selectedBooking.sub_field.complex.owner.company_name}
              />
              <DetailInfoCard
                label="Sân bóng"
                value={selectedBooking.sub_field.complex.complex_name}
                helper={`${selectedBooking.sub_field.sub_field_name} · ${sportLabel(selectedBooking.sub_field.sport_type)}`}
              />
              <DetailInfoCard
                label="Thời gian"
                value={format(
                  new Date(selectedBooking.start_time),
                  "HH:mm – dd/MM/yyyy",
                  { locale: vi },
                )}
                helper={`Kết thúc: ${format(new Date(selectedBooking.end_time), "HH:mm")}`}
              />
              <DetailInfoCard
                label="Ghi nhận hệ thống"
                value={format(
                  new Date(selectedBooking.created_at),
                  "HH:mm dd/MM/yyyy",
                  { locale: vi },
                )}
              />
            </div>
          </div>
        )}
      </AdminDetailDialog>

      {/* ── Recurring booking detail dialog ──────────────────────────────────── */}
      <AdminDetailDialog
        open={detailOpen && activeView === "recurring"}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedRecurring(null);
        }}
        title="Chi tiết nhóm đặt định kỳ"
        icon={Repeat2}
        statusLabel={
          selectedRecurring
            ? RECURRING_STATUS_LABELS[selectedRecurring.status]
            : undefined
        }
        statusClassName={
          selectedRecurring
            ? RECURRING_STATUS_COLORS[selectedRecurring.status]
            : undefined
        }
      >
        {selectedRecurring && (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto bg-white">
            <DetailSummaryRow
              leftLabel="Tổng chi phí nhóm"
              leftValue={
                <p className="text-2xl font-black text-green-700">
                  {fmtVND(selectedRecurring.total_value)}
                </p>
              }
              rightLabel="Mã nhóm"
              rightValue={
                <p className="text-xs font-mono font-bold break-all text-slate-700 max-w-64">
                  {selectedRecurring.id}
                </p>
              }
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailInfoCard
                label="Khách hàng"
                value={selectedRecurring.player.account.full_name}
                helper={selectedRecurring.player.account.phone_number}
              />
              <DetailInfoCard
                label="Đơn vị sở hữu"
                value={selectedRecurring.sub_field.complex.owner.company_name}
              />
              <DetailInfoCard
                label="Sân bóng"
                value={selectedRecurring.sub_field.complex.complex_name}
                helper={`${selectedRecurring.sub_field.sub_field_name} · ${sportLabel(selectedRecurring.sub_field.sport_type)}`}
              />
              <DetailInfoCard
                label="Chu kỳ"
                value={
                  RECURRENCE_TYPE_LABELS[selectedRecurring.recurrence_type] ??
                  selectedRecurring.recurrence_type
                }
              />
              <DetailInfoCard
                label="Thời gian nhóm"
                value={`${format(new Date(selectedRecurring.start_date), "dd/MM/yyyy")} → ${format(new Date(selectedRecurring.end_date), "dd/MM/yyyy")}`}
              />
              <DetailInfoCard
                label="Tổng số buổi"
                value={`${selectedRecurring.child_count} buổi`}
              />
            </div>

            {/* Child booking session list */}
            {selectedRecurring.bookings.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Danh sách buổi ({selectedRecurring.bookings.length})
                </p>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {selectedRecurring.bookings.map((b, idx) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/60 gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[9px] font-bold text-muted-foreground w-4 shrink-0 text-right">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-semibold text-foreground">
                            {format(new Date(b.start_time), "EEEE dd/MM/yyyy", {
                              locale: vi,
                            })}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="w-2.5 h-2.5" />
                            {format(new Date(b.start_time), "HH:mm")} –{" "}
                            {format(new Date(b.end_time), "HH:mm")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          className={`${bookingStatusColor(b.status)} border-none text-[9px] py-0 h-4 shadow-none`}
                        >
                          {bookingStatusLabel(b.status)}
                        </Badge>
                        <span className="text-[11px] font-bold text-foreground tabular-nums">
                          {fmtVND(Number(b.total_price))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status breakdown */}
            {Object.keys(selectedRecurring.status_breakdown).length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Tổng hợp:
                </span>
                {Object.entries(selectedRecurring.status_breakdown).map(
                  ([status, count]) => (
                    <Badge
                      key={status}
                      className={`${bookingStatusColor(status)} border-none text-[9px] py-0 h-4 shadow-none`}
                    >
                      {bookingStatusLabel(status)}: {count}
                    </Badge>
                  ),
                )}
              </div>
            )}
          </div>
        )}
      </AdminDetailDialog>
    </div>
  );
}
