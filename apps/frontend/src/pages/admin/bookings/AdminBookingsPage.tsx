import {
  AdminDetailDialog,
  DetailInfoCard,
  DetailSummaryRow,
} from "@/components/admin/details/AdminDetailDialog";
import { AdminFiltersBar } from "@/components/admin/shell/AdminFiltersBar";
import { AdminPageHeader } from "@/components/admin/shell/AdminPageHeader";
import { AdminTableSection } from "@/components/admin/shell/AdminTableSection";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  BOOKING_STATUS_LABELS,
  RECURRENCE_TYPE_LABELS,
  RECURRING_STATUS_COLORS,
  RECURRING_STATUS_LABELS,
} from "@/lib/constants";

import { useAdminBookingStore } from "@/store/admin/useAdminBookingStore";
import { useAdminRecurringBookingStore } from "@/store/admin/useAdminRecurringBookingStore";
import {
  formatDateVn,
  formatPrice,
  getBookingStatusColor,
  getBookingStatusLabel,
  getSportTypeLabel,
} from "@/utils";
import { format } from "date-fns";
import {
  Calendar,
  CalendarRange,
  Clock,
  Eye,
  LayoutDashboard,
  LayoutList,
  MapPin,
  MoreHorizontal,
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

  const [singleSearch, setSingleSearch] = useState(singleFilters.search || "");
  const [recurringSearch, setRecurringSearch] = useState(
    recurringFilters.search || "",
  );
  const [selectedBooking, setSelectedBooking] =
    useState<AdminBookingRow | null>(null);
  const [selectedRecurring, setSelectedRecurring] =
    useState<AdminRecurringRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

  const bookingStatusColor = (status: string) =>
    getBookingStatusColor(status, "bg-muted text-muted-foreground");

  const bookingStatusLabel = (status: string) =>
    getBookingStatusLabel(status, "Không xác định");

  const sportLabel = (sportType: string) => {
    const label = getSportTypeLabel(sportType);
    return label === sportType ? "Không xác định" : label;
  };

  const singleStatItems = [
    {
      label: "Tổng đặt đơn lẻ",
      value: singleStats.total,
      icon: LayoutDashboard,
      color: "blue" as const,
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

  const recurringStatItems = [
    {
      label: "Tổng nhóm định kỳ",
      value: recurringStats.total,
      icon: Repeat2,
      color: "purple" as const,
    },
    {
      label: "Chưa thanh toán",
      value: recurringStats.pending,
      icon: Clock,
      color: "orange" as const,
    },
    {
      label: "Đã xác nhận",
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

  const singleColumns: Column<AdminBookingRow>[] = [
    {
      header: "Mã",
      className: "w-20",
      cell: (b) => (
        <span className="block w-16 truncate font-mono text-[10px] uppercase text-muted-foreground">
          {b.id.split("-")[0]}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-52",
      cell: (b) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <User className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{b.player.account.full_name}</span>
          </div>
          <span className="ml-5 truncate text-[10px] text-muted-foreground">
            {b.player.account.phone_number}
          </span>
        </div>
      ),
    },
    {
      header: "Khu phức hợp",
      className: "w-56",
      cell: (b) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <MapPin className="size-3.5 shrink-0 text-rose-500" />
            <span className="truncate">{b.sub_field.complex.complex_name}</span>
          </div>
          <div className="ml-5 flex items-center gap-1 text-[10px] italic text-muted-foreground">
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
            <Calendar className="size-3 text-muted-foreground" />
            <span>
              {formatDateVn(b.start_time)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3" />
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
        <span className="font-display text-sm font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
          {formatPrice(Number(b.total_price))}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (b) => (
        <Badge
          className={`${bookingStatusColor(b.status)} h-5 border-none py-0 text-[10px] shadow-none`}
        >
          {bookingStatusLabel(b.status)}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-12 text-right",
      cell: (b) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal />
              <span className="sr-only">Mở menu hành động</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBooking(b);
                  setDetailOpen(true);
                }}
              >
                <Eye /> Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const recurringColumns: Column<AdminRecurringRow>[] = [
    {
      header: "Mã nhóm",
      className: "w-20",
      cell: (rb) => (
        <span className="block w-16 truncate font-mono text-[10px] uppercase text-muted-foreground">
          {rb.id.split("-")[0]}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-52",
      cell: (rb) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <User className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{rb.player.account.full_name}</span>
          </div>
          <span className="ml-5 truncate text-[10px] text-muted-foreground">
            {rb.player.account.phone_number}
          </span>
        </div>
      ),
    },
    {
      header: "Khu phức hợp",
      className: "w-56",
      cell: (rb) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <MapPin className="size-3.5 shrink-0 text-rose-500" />
            <span className="truncate">
              {rb.sub_field.complex.complex_name}
            </span>
          </div>
          <div className="ml-5 flex items-center gap-1 text-[10px] italic text-muted-foreground">
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
          <Badge className="h-5 w-fit gap-1 border-none bg-violet-100 py-0 text-[10px] text-violet-800 shadow-none dark:bg-violet-500/15 dark:text-violet-300">
            <Repeat2 className="size-2.5" />
            {RECURRENCE_TYPE_LABELS[rb.recurrence_type] ?? rb.recurrence_type}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {formatDateVn(rb.start_date, "dd/MM/yy")} →{" "}
            {formatDateVn(rb.end_date, "dd/MM/yy")}
          </span>
        </div>
      ),
    },
    {
      header: "Số buổi",
      className: "w-20 text-center",
      cell: (rb) => (
        <div className="text-center">
          <span className="font-display text-sm font-black italic text-foreground">
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
        <span className="font-display text-sm font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
          {formatPrice(rb.total_value)}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (rb) => (
        <Badge
          className={`${RECURRING_STATUS_COLORS[rb.status] ?? "bg-muted text-muted-foreground"} h-5 border-none py-0 text-[10px] shadow-none`}
        >
          {RECURRING_STATUS_LABELS[rb.status] ?? rb.status}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-12 text-right",
      cell: (rb) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal />
              <span className="sr-only">Mở menu hành động</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRecurring(rb);
                  setDetailOpen(true);
                }}
              >
                <Eye /> Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalCount =
    activeView === "single"
      ? singlePagination?.total ?? singleStats.total
      : recurringPagination?.total ?? recurringStats.total;

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 lg:px-6">
      <AdminPageHeader
        index={3}
        title="Quản lý"
        titleAccent="đặt sân"
        description="Theo dõi mọi lượt đặt sân và nhóm đặt định kỳ trên toàn hệ thống."
      />

      <StatsGrid
        items={activeView === "single" ? singleStatItems : recurringStatItems}
      />

      <AdminFiltersBar
        leading={
          <ToggleGroup
            type="single"
            value={activeView}
            onValueChange={(v) => v && handleViewChange(v as BookingView)}
            variant="outline"
            size="sm"
            className="rounded-lg"
          >
            <ToggleGroupItem
              value="single"
              aria-label="Đơn lẻ"
              className="gap-1.5"
            >
              <LayoutList className="size-3.5" />
              Đơn lẻ
            </ToggleGroupItem>
            <ToggleGroupItem
              value="recurring"
              aria-label="Định kỳ"
              className="gap-1.5"
            >
              <Repeat2 className="size-3.5" />
              Định kỳ
            </ToggleGroupItem>
          </ToggleGroup>
        }
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          {activeView === "single" ? (
            <Input
              key="single-search"
              placeholder="Tìm theo tên khách, tên sân..."
              className="h-9 pl-9"
              value={singleSearch}
              onChange={(e) => setSingleSearch(e.target.value)}
            />
          ) : (
            <Input
              key="recurring-search"
              placeholder="Tìm theo tên khách, tên sân..."
              className="h-9 pl-9"
              value={recurringSearch}
              onChange={(e) => setRecurringSearch(e.target.value)}
            />
          )}
        </div>

        {activeView === "single" ? (
          <Select
            value={singleFilters.status || "ALL"}
            onValueChange={(value) =>
              setSingleFilters({ status: value === "ALL" ? undefined : value })
            }
          >
            <SelectTrigger className="h-9 w-full shrink-0 md:w-[180px]">
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
            <SelectTrigger className="h-9 w-full shrink-0 md:w-[180px]">
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
      </AdminFiltersBar>

      <AdminTableSection
        index={2}
        eyebrow="Data · Table"
        title={
          activeView === "single"
            ? "Lượt đặt sân"
            : "Nhóm đặt định kỳ"
        }
        description={
          activeView === "single"
            ? "Nhấp vào một dòng để xem chi tiết lượt đặt."
            : "Nhấp vào một nhóm để xem danh sách buổi bên trong."
        }
        count={totalCount}
        countLabel={activeView === "single" ? "lượt đặt" : "nhóm"}
      >
        {activeView === "single" ? (
          <DataTable
            data={bookings as AdminBookingRow[]}
            columns={singleColumns}
            isLoading={singleLoading}
            paginationStyle="search"
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
            paginationStyle="search"
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
      </AdminTableSection>

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
          <div className="max-h-[70vh] space-y-5 overflow-y-auto bg-background p-6">
            <DetailSummaryRow
              leftLabel="Tổng chi phí"
              leftValue={
                <p className="font-display text-2xl font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
                  {formatPrice(Number(selectedBooking.total_price))}
                </p>
              }
              rightLabel="Mã đặt sân"
              rightValue={
                <p className="max-w-64 break-all font-mono text-xs font-bold text-foreground">
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
                label="Khu phức hợp"
                value={selectedBooking.sub_field.complex.complex_name}
                helper={`${selectedBooking.sub_field.sub_field_name} · ${sportLabel(selectedBooking.sub_field.sport_type)}`}
              />
              <DetailInfoCard
                label="Thời gian"
                value={formatDateVn(
                  selectedBooking.start_time,
                  "HH:mm – dd/MM/yyyy",
                )}
                helper={`Kết thúc: ${format(new Date(selectedBooking.end_time), "HH:mm")}`}
              />
              <DetailInfoCard
                label="Ghi nhận hệ thống"
                value={formatDateVn(
                  selectedBooking.created_at,
                  "HH:mm dd/MM/yyyy",
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
          <div className="max-h-[70vh] space-y-5 overflow-y-auto bg-background p-6">
            <DetailSummaryRow
              leftLabel="Tổng chi phí nhóm"
              leftValue={
                <p className="font-display text-2xl font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
                  {formatPrice(selectedRecurring.total_value)}
                </p>
              }
              rightLabel="Mã nhóm"
              rightValue={
                <p className="max-w-64 break-all font-mono text-xs font-bold text-foreground">
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
                label="Khu phức hợp"
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
                value={`${formatDateVn(selectedRecurring.start_date)} → ${formatDateVn(selectedRecurring.end_date)}`}
              />
              <DetailInfoCard
                label="Tổng số buổi"
                value={`${selectedRecurring.child_count} buổi`}
              />
            </div>

            {selectedRecurring.bookings.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Danh sách buổi ({selectedRecurring.bookings.length})
                </p>
                <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                  {selectedRecurring.bookings.map((b, idx) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="w-4 shrink-0 text-right text-[9px] font-bold text-muted-foreground">
                          {idx + 1}
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="text-[11px] font-semibold text-foreground">
                            {formatDateVn(b.start_time, "EEEE dd/MM/yyyy")}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="size-2.5" />
                            {format(new Date(b.start_time), "HH:mm")} –{" "}
                            {format(new Date(b.end_time), "HH:mm")}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge
                          className={`${bookingStatusColor(b.status)} h-4 border-none py-0 text-[9px] shadow-none`}
                        >
                          {bookingStatusLabel(b.status)}
                        </Badge>
                        <span className="text-[11px] font-bold tabular-nums text-foreground">
                          {formatPrice(Number(b.total_price))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(selectedRecurring.status_breakdown).length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Tổng hợp:
                </span>
                {Object.entries(selectedRecurring.status_breakdown).map(
                  ([status, count]) => (
                    <Badge
                      key={status}
                      className={`${bookingStatusColor(status)} h-4 border-none py-0 text-[9px] shadow-none`}
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
