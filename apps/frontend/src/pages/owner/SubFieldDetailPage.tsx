import { DeletePricingRuleDialog } from "@/components/owner/DeletePricingRuleDialog";
import { DeleteSubfieldDialog } from "@/components/owner/DeleteSubfieldDialog";
import { EditSubfieldDialog } from "@/components/owner/EditSubfieldDialog";
import { PricingRuleFormDialog } from "@/components/owner/PricingRuleFormDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePricingStore } from "@/store/owner/usePricingStore";
import { useSubfieldStore } from "@/store/owner/useSubfieldStore";
import type { PricingRule } from "@/types";
import { formatPrice, getSportTypeLabel, formatTime } from "@/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarIcon,
  CircleDot,
  Clock,
  Copy,
  FilePen,
  FileWarning,
  Flame,
  ImageIcon,
  Pencil,
  Plus,
  Rows3,
  Ruler,
  Sparkles,
  Timer,
  Trash2,
  Users,
  Wallet,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

interface PricingRuleFormData {
  days: number[];
  time_slots: { start_time: string; end_time: string; base_price: number }[];
}

// ── Duration util (minutes between HH:MM strings, handles overnight) ──────
function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const a = sh * 60 + sm;
  let b = eh * 60 + em;
  if (b <= a) b += 24 * 60;
  return b - a;
}

// ── Weekday strip metadata ────────────────────────────────────────────────
// Display order: Monday → Sunday, but `getDay()` uses Sunday=0
const WEEKDAYS: { dayOfWeek: number; short: string; full: string }[] = [
  { dayOfWeek: 1, short: "T2", full: "Thứ 2" },
  { dayOfWeek: 2, short: "T3", full: "Thứ 3" },
  { dayOfWeek: 3, short: "T4", full: "Thứ 4" },
  { dayOfWeek: 4, short: "T5", full: "Thứ 5" },
  { dayOfWeek: 5, short: "T6", full: "Thứ 6" },
  { dayOfWeek: 6, short: "T7", full: "Thứ 7" },
  { dayOfWeek: 0, short: "CN", full: "Chủ nhật" },
];

export function SubFieldDetailPage() {
  const {
    selectedSubfield,
    isLoading,
    error,
    fetchSubfieldById,
    updateSubfield,
    deleteSubfield,
  } = useSubfieldStore();
  const {
    pricingRules,
    fetchPricingRules,
    addPricingRule,
    updatePricingRule,
    deletePricingRule,
    bulkDeletePricingRules,
    copyPricingRules,
  } = usePricingStore();
  const navigate = useNavigate();
  const { id } = useParams();

  const [date, setDate] = useState<Date>(new Date());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Pricing rule states
  const [isPricingFormOpen, setIsPricingFormOpen] = useState(false);
  const [isPricingDeleteOpen, setIsPricingDeleteOpen] = useState(false);
  const [pricingFormMode, setPricingFormMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<PricingRule | null>(null);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);

  // Fetch subfield details on mount
  useEffect(() => {
    if (id) {
      fetchSubfieldById(id);
    }
  }, [id, fetchSubfieldById]);

  // Fetch pricing rules when date or subfield changes
  useEffect(() => {
    if (id && date) {
      const dayOfWeek = date.getDay();
      fetchPricingRules(id, dayOfWeek);
    }
  }, [id, date, fetchPricingRules]);

  const handleUpdateSubfield = async (data: {
    subfield_name: string;
    sport_type: string;
    capacity: number;
  }) => {
    if (!id) return;
    try {
      await updateSubfield(id, data);
      toast.success("Cập nhật thành công: Thông tin sân con đã được cập nhật.");
    } catch {
      toast.error(
        "Cập nhật thất bại: Có lỗi xảy ra khi cập nhật thông tin sân con.",
      );
    }
  };

  const handleDeleteSubfield = async () => {
    if (!id || !selectedSubfield) return;
    const complexId = selectedSubfield.complex_id;
    try {
      await deleteSubfield(id);
      toast.success("Sân con đã được xóa thành công.");
      navigate(`/owner/complexes/${complexId}`, { replace: true });
    } catch {
      toast.error("Đã có lỗi xảy ra khi xóa sân con. Vui lòng thử lại sau.");
    }
  };

  const handleCreatePricingRule = async (data: PricingRuleFormData) => {
    if (!id) return;
    try {
      await addPricingRule(id, data.days, {
        time_slots: data.time_slots,
      });
      toast.success("Thêm khung giờ thành công.");
      await fetchPricingRules(id, date.getDay());
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể tạo khung giờ";
      toast.error(message);
      throw error;
    }
  };

  const handleEditPricingRule = async (data: PricingRuleFormData) => {
    if (!id || !editingRule) return;
    try {
      const timeSlot = data.time_slots[0];
      await updatePricingRule(editingRule.id, id, date.getDay(), {
        start_time: timeSlot.start_time,
        end_time: timeSlot.end_time,
        base_price: timeSlot.base_price,
      });
      toast.success("Cập nhật khung giờ thành công.");
      setEditingRule(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể cập nhật khung giờ";
      toast.error(message);
      throw error;
    }
  };

  const handleDeletePricingRule = async () => {
    if (!id || !deletingRule) return;
    try {
      await deletePricingRule(deletingRule.id, id, date.getDay());
      toast.success("Xóa khung giờ thành công.");
      setDeletingRule(null);
      setSelectedRuleIds(
        selectedRuleIds.filter((ruleId) => ruleId !== deletingRule.id),
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể xóa khung giờ";
      toast.error(message);
    }
  };

  const handleBulkDelete = async () => {
    if (!id || selectedRuleIds.length === 0) return;
    try {
      await bulkDeletePricingRules(selectedRuleIds, id, date.getDay());
      toast.success("Xóa các khung giờ đã chọn thành công.");
      setSelectedRuleIds([]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể xóa khung giờ";
      toast.error(message);
    }
  };

  const handleCopyPricing = async (targetDays: number[]) => {
    if (!id) return;
    const sourceDay = date.getDay();
    try {
      await copyPricingRules(id, sourceDay, targetDays);
      toast.success("Sao chép giá thành công.");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể sao chép giá";
      toast.error(message);
    }
  };

  const handleRuleSelect = (ruleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRuleIds([...selectedRuleIds, ruleId]);
    } else {
      setSelectedRuleIds(selectedRuleIds.filter((id) => id !== ruleId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && pricingRules) {
      setSelectedRuleIds(pricingRules.map((r) => r.id));
    } else {
      setSelectedRuleIds([]);
    }
  };

  // Derived: quick pricing summary for the current day
  const pricingSummary = useMemo(() => {
    const rules = pricingRules ?? [];
    if (!rules.length) return null;
    const prices = rules.map((r) => Number(r.base_price)).filter(Number.isFinite);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const totalMinutes = rules.reduce(
      (acc, r) =>
        acc + minutesBetween(formatTime(r.start_time), formatTime(r.end_time)),
      0,
    );
    return { count: rules.length, min, max, totalMinutes };
  }, [pricingRules]);

  const dayOfWeek = date.getDay();
  const currentDayLabel = WEEKDAYS.find((w) => w.dayOfWeek === dayOfWeek)?.full;
  const isToday =
    new Date().toDateString() === date.toDateString();

  // ── LOADING ─────────────────────────────────────────────────
  if (isLoading && !selectedSubfield) {
    return (
      <div className="flex flex-col gap-5 pb-10">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  // ── ERROR / NOT FOUND ───────────────────────────────────────
  if (error || !selectedSubfield) {
    return (
      <div className="pb-10">
        <EmptyState
          title="Không tìm thấy sân con"
          description="Sân con bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
          icon={<FileWarning className="size-8 text-destructive/70" />}
          actionLabel="Quay lại danh sách"
          onAction={() => navigate("/owner/complexes")}
          className="py-20"
        />
      </div>
    );
  }

  const sub = selectedSubfield;
  const allSelected =
    pricingRules.length > 0 && selectedRuleIds.length === pricingRules.length;

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ── BREADCRUMB ──────────────────────────────────────── */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/owner/complexes">Khu phức hợp</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/owner/complexes/${sub.complex_id || ""}`}>
                Chi tiết khu phức hợp
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">
              {sub.sub_field_name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── HERO · scoreboard card ──────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        {/* backdrop blur image */}
        {sub.sub_field_image ? (
          <>
            <img
              src={sub.sub_field_image}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 size-full object-cover opacity-[0.18] blur-xl saturate-150"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-background/92 via-background/88 to-background/95"
            />
          </>
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-12 size-56 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-16 size-56 rounded-full bg-accent-sport/10 blur-3xl"
        />

        <div className="relative grid gap-4 p-4 md:grid-cols-[180px_1fr_auto] md:items-center md:gap-5 md:p-5">
          {/* Thumbnail · rounded court card */}
          <div className="relative mx-auto aspect-square w-full max-w-[180px] overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-sm md:mx-0">
            {sub.sub_field_image ? (
              <img
                src={sub.sub_field_image}
                alt={sub.sub_field_name}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-muted via-muted/70 to-muted/40 text-muted-foreground">
                <ImageIcon className="size-8 opacity-50" />
                <span className="text-[10px] uppercase tracking-[0.18em]">
                  No image
                </span>
              </div>
            )}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
            />
            
          </div>

          {/* Identity + stats */}
          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="h-5 gap-1 rounded-full border-primary/30 bg-primary/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-primary"
              >
                <Ruler className="size-2.5" />
                {getSportTypeLabel(sub.sport_type)}
              </Badge>
              <Badge
                variant="outline"
                className="h-5 gap-1 rounded-full border-border/60 bg-background/70 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm"
              >
                <Users className="size-2.5" />
                {sub.capacity} người
              </Badge>
            </div>

            <h1 className="truncate font-display text-2xl font-black leading-tight tracking-tight text-foreground md:text-3xl">
              {sub.sub_field_name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Rows3 className="size-3.5" />
                <span className="font-medium text-foreground tabular-nums">
                  {pricingRules?.length ?? 0}
                </span>{" "}
                khung giờ cho {currentDayLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="size-3.5" />
                {format(date, "EEE, dd/MM/yyyy", { locale: vi })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="h-9 rounded-full border-border/70 bg-background/70 px-4 text-xs font-semibold backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <Pencil data-icon="inline-start" />
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-9 rounded-full border-destructive/30 bg-destructive/5 px-4 text-xs font-semibold text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 data-icon="inline-start" />
              Xóa sân
            </Button>
          </div>
        </div>

        {/* Meta strip */}
        <Separator className="relative" />
        <div className="relative flex items-center justify-between gap-3 px-4 py-2 md:px-5">
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <CircleDot className="size-2.5" />
            Sub · {sub.id.slice(0, 8).toUpperCase()}
          </span>
          {sub.complex_id ? (
            <span className="hidden text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground tabular-nums sm:inline">
              Complex · {sub.complex_id.slice(0, 8).toUpperCase()}
            </span>
          ) : null}
        </div>
      </section>

      {/* ── PRICING CONSOLE ────────────────────────────────── */}
      <Card className="relative overflow-hidden border-border/60 shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary via-accent-sport to-primary"
        />

        <CardHeader className="gap-2 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="h-5 gap-1 rounded-full border-border/60 bg-background/70 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              <Wallet className="size-2.5" />
              Bảng cấu hình giá sân
            </Badge>
            {isToday ? (
              <Badge
                variant="outline"
                className="h-5 gap-1 rounded-full border-emerald-500/40 bg-emerald-500/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400"
              >
                <Sparkles className="size-2.5" />
                Hôm nay
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0 space-y-1">
              <CardTitle className="font-display text-xl font-black italic tracking-tight md:text-2xl">
                Bảng giá theo khung giờ
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Thiết lập mức giá theo từng khung giờ cho{" "}
                <span className="font-semibold text-foreground">
                  {currentDayLabel}
                </span>
                ,{" "}
                <span className="tabular-nums">
                  {format(date, "dd/MM/yyyy")}
                </span>
                .
              </CardDescription>
            </div>

            {/* Date picker + add */}
            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full border-border/70 px-3 text-xs font-semibold"
                  >
                    <CalendarIcon data-icon="inline-start" />
                    {format(date, "dd/MM/yyyy", { locale: vi })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button
                size="sm"
                onClick={() => {
                  setPricingFormMode("create");
                  setEditingRule(null);
                  setIsPricingFormOpen(true);
                }}
                className="group/cta h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow shadow-primary/25 hover:bg-primary/92"
              >
                <Plus data-icon="inline-start" />
                Thêm khung giờ
              </Button>
            </div>
          </div>

          {/* Weekday strip */}
          <div
            role="tablist"
            aria-label="Chọn thứ trong tuần"
            className="mt-2 flex flex-wrap items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 p-1"
          >
            {WEEKDAYS.map((w) => {
              const active = dayOfWeek === w.dayOfWeek;
              return (
                <button
                  key={w.dayOfWeek}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    // Snap current `date` to the nearest matching weekday
                    // (prefer forward) while keeping the same week.
                    const d = new Date(date);
                    const diff =
                      (w.dayOfWeek - d.getDay() + 7) % 7; // 0..6 forward
                    d.setDate(d.getDate() + diff);
                    setDate(d);
                  }}
                  className={cn(
                    "inline-flex h-7 min-w-10 items-center justify-center gap-1 rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    active
                      ? "bg-background text-primary shadow-sm ring-1 ring-primary/25"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  title={w.full}
                >
                  {w.short}
                </button>
              );
            })}
          </div>

          {/* Summary ribbon */}
          {pricingSummary ? (
            <div className="mt-1 grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-muted/30 p-2 sm:grid-cols-4">
              <SummaryCell
                icon={Rows3}
                label="Khung giờ"
                value={pricingSummary.count.toString()}
              />
              <SummaryCell
                icon={Wallet}
                label="Giá thấp nhất"
                value={formatPrice(pricingSummary.min)}
              />
              <SummaryCell
                icon={Flame}
                label="Giá cao nhất"
                value={formatPrice(pricingSummary.max)}
              />
              <SummaryCell
                icon={Timer}
                label="Tổng giờ mở"
                value={formatDuration(pricingSummary.totalMinutes)}
              />
            </div>
          ) : null}
        </CardHeader>

        <Separator />

        <CardContent className="flex flex-col gap-3 pt-4">
          {/* Copy pricing action row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {pricingRules && pricingRules.length > 0
                ? `${pricingRules.length} khung giờ cho ${currentDayLabel}`
                : "Chưa cấu hình"}
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pricingRules || pricingRules.length === 0}
                  className="h-8 rounded-full border-border/70 px-3 text-[11px] font-semibold"
                >
                  <Copy data-icon="inline-start" />
                  Sao chép sang ngày khác
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Chọn ngày đích
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  {WEEKDAYS.filter((w) => w.dayOfWeek !== dayOfWeek).map((w) => (
                    <DropdownMenuItem
                      key={w.dayOfWeek}
                      onClick={() => handleCopyPricing([w.dayOfWeek])}
                      className="cursor-pointer gap-2"
                    >
                      <CalendarIcon className="size-3.5 text-muted-foreground" />
                      <span>{w.full}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() =>
                      handleCopyPricing(
                        WEEKDAYS.map((w) => w.dayOfWeek).filter(
                          (d) => d !== dayOfWeek,
                        ),
                      )
                    }
                    className="cursor-pointer gap-2 text-primary focus:text-primary"
                  >
                    <Sparkles className="size-3.5" />
                    Sang tất cả các ngày khác
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bulk action banner */}
          {selectedRuleIds.length > 0 ? (
            <Alert className="flex items-center justify-between gap-3 border-primary/30 bg-primary/5 text-primary">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4" />
                <AlertDescription className="text-sm font-medium text-primary">
                  Đã chọn{" "}
                  <span className="tabular-nums">
                    {selectedRuleIds.length}
                  </span>{" "}
                  khung giờ
                </AlertDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRuleIds([])}
                  className="h-8 rounded-full px-3 text-xs text-primary hover:bg-primary/10"
                >
                  <X data-icon="inline-start" />
                  Bỏ chọn
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="h-8 rounded-full px-3 text-xs"
                >
                  <Trash2 data-icon="inline-start" />
                  Xóa đã chọn
                </Button>
              </div>
            </Alert>
          ) : null}

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
              ))}
            </div>
          ) : pricingRules && pricingRules.length > 0 ? (
            <>
              {/* Select all */}
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
                <Checkbox
                  id="select-all-rules"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Chọn tất cả khung giờ"
                />
                <label
                  htmlFor="select-all-rules"
                  className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Chọn tất cả
                </label>
              </div>

              <ul className="flex flex-col gap-2">
                {pricingRules.map((rule, idx) => {
                  const start = formatTime(rule.start_time);
                  const end = formatTime(rule.end_time);
                  const dur = minutesBetween(start, end);
                  const price = Number(rule.base_price);
                  const isSelected = selectedRuleIds.includes(rule.id);

                  return (
                    <li
                      key={rule.id}
                      className={cn(
                        "group relative flex items-center gap-3 overflow-hidden rounded-xl border bg-card px-3 py-3 transition-all",
                        isSelected
                          ? "border-primary/40 bg-primary/5 shadow-sm"
                          : "border-border/60 hover:border-primary/30 hover:shadow-sm",
                      )}
                    >
                      {/* accent bar */}
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute inset-y-0 left-0 w-0.5 transition-colors",
                          isSelected ? "bg-primary" : "bg-transparent group-hover:bg-primary/50",
                        )}
                      />

                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleRuleSelect(rule.id, checked as boolean)
                        }
                        aria-label={`Chọn khung giờ ${start} - ${end}`}
                      />

                      {/* Index chip */}
                      <span
                        aria-hidden
                        className="hidden size-8 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-[11px] font-bold tabular-nums text-muted-foreground sm:inline-flex"
                      >
                        #{idx + 1}
                      </span>

                      {/* Time block */}
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 shrink-0 text-primary" />
                          <p className="font-display text-base font-bold italic tabular-nums tracking-tight">
                            {start}
                            <span className="mx-1.5 text-muted-foreground/60">
                              →
                            </span>
                            {end}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="w-fit h-5 gap-1 rounded-full border-border/60 bg-background px-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                        >
                          <Timer className="size-2.5" />
                          {formatDuration(dur)}
                        </Badge>
                      </div>

                      {/* Price */}
                      <div className="flex flex-col items-end gap-0 pr-1 text-right">
                        <span className="font-display text-base font-black italic tabular-nums tracking-tight text-foreground">
                          {formatPrice(price)}
                        </span>
                        <span className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          / giờ
                        </span>
                      </div>

                      {/* Row actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Chỉnh sửa khung giờ"
                          className="rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            setEditingRule(rule);
                            setPricingFormMode("edit");
                            setIsPricingFormOpen(true);
                          }}
                        >
                          <FilePen />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Xóa khung giờ"
                          className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setDeletingRule(rule);
                            setIsPricingDeleteOpen(true);
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <EmptyState
              title={`Chưa có bảng giá cho ${currentDayLabel}`}
              description={`Thiết lập khung giờ và giá để khách hàng có thể đặt sân vào ${format(
                date,
                "EEEE, dd/MM/yyyy",
                { locale: vi },
              )}.`}
              icon={<CalendarIcon className="size-7 text-muted-foreground/70" />}
              actionLabel="Thêm khung giờ đầu tiên"
              onAction={() => {
                setPricingFormMode("create");
                setEditingRule(null);
                setIsPricingFormOpen(true);
              }}
              className="py-12"
            />
          )}
        </CardContent>

          {/* <CardFooter className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Ban className="size-3" />
              Cấu hình chỉ ảnh hưởng {currentDayLabel}
            </span>
            <span className="hidden tabular-nums sm:inline">
              {format(date, "dd · MM · yyyy")}
            </span>
          </CardFooter> */}
      </Card>

      {/* ── Dialogs (logic unchanged) ─────────────────────── */}
      <EditSubfieldDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        subfield={sub}
        onSubmit={handleUpdateSubfield}
      />
      <DeleteSubfieldDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        subfieldName={sub.sub_field_name}
        onConfirm={handleDeleteSubfield}
      />
      <PricingRuleFormDialog
        open={isPricingFormOpen}
        onOpenChange={setIsPricingFormOpen}
        mode={pricingFormMode}
        currentDay={dayOfWeek}
        initialData={
          editingRule
            ? {
                id: editingRule.id,
                day_of_week: editingRule.day_of_week,
                start_time: formatTime(editingRule.start_time),
                end_time: formatTime(editingRule.end_time),
                base_price: Number(editingRule.base_price),
              }
            : undefined
        }
        onSubmit={
          pricingFormMode === "create"
            ? handleCreatePricingRule
            : handleEditPricingRule
        }
      />
      {deletingRule ? (
        <DeletePricingRuleDialog
          open={isPricingDeleteOpen}
          onOpenChange={setIsPricingDeleteOpen}
          timeRange={`${formatTime(deletingRule.start_time)} - ${formatTime(
            deletingRule.end_time,
          )}`}
          onConfirm={handleDeletePricingRule}
        />
      ) : null}
    </div>
  );
}

// ── Building blocks ────────────────────────────────────────────

function SummaryCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-background/80 px-2.5 py-1.5 backdrop-blur-sm">
      <Icon className="size-3.5 shrink-0 text-primary" />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <span className="truncate font-display text-[13px] font-bold italic tabular-nums text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h${String(m).padStart(2, "0")}`;
}
