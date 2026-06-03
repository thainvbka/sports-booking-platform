import { ComplexFilters } from "@/components/owner/ComplexFilters";
import { OwnerFilterShell } from "@/components/owner/OwnerFilterShell";
import { ComplexFormDialog } from "@/components/shared/ComplexFormDialog";
import { OwnerComplexCard } from "@/components/shared/OwnerComplexCard";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useComplexStore } from "@/store/owner/useComplexStore";
import { ComplexStatus } from "@/types";
import {
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  LayoutGrid,
  MinusCircle,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";


type StatusFilter = "ALL" | ComplexStatus;


export function ComplexesPage() {
  const {
    complexes,
    pagination,
    isLoading,
    setPage,
    setSearch,
    queryParams,
    setParams,
  } = useComplexStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // seed initial state from URL
  const initialSearch = searchParams.get("search") || "";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // Debounce server-side search so we do not spam the API while typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, setSearch]);

  // Init store once on mount from URL.
  useEffect(() => {
    setParams({ page: initialPage, search: initialSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync with store params.
  useEffect(() => {
    const params: Record<string, string> = {};
    if (queryParams.page > 1) params.page = queryParams.page.toString();
    if (queryParams.search) params.search = queryParams.search;
    setSearchParams(params);
  }, [queryParams.page, queryParams.search, setSearchParams]);

  // Client-side status bucket counters (operate on the current page only —
  // the server is the source of truth for `pagination.total`).
  const statusCounts = useMemo(() => {
    const counts: Record<ComplexStatus, number> = {
      [ComplexStatus.ACTIVE]: 0,
      [ComplexStatus.PENDING]: 0,
      [ComplexStatus.INACTIVE]: 0,
      [ComplexStatus.REJECTED]: 0,
      [ComplexStatus.DRAFT]: 0,
    };
    for (const c of complexes) counts[c.status] = (counts[c.status] ?? 0) + 1;
    return counts;
  }, [complexes]);

  // Client-side status filter on top of server-paginated list.
  const visibleComplexes = useMemo(() => {
    if (statusFilter === "ALL") return complexes;
    return complexes.filter((c) => c.status === statusFilter);
  }, [complexes, statusFilter]);

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? 1;

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setPage(page);
  };

  const hasComplexes = complexes.length > 0;
  const hasQuery = Boolean(searchTerm) || statusFilter !== "ALL";

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-background to-accent-sport/5 px-4 py-4 shadow-sm md:px-6 md:py-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-14 size-48 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-10 size-40 rounded-full bg-accent-sport/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">

            <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
              Danh mục khu phức hợp{" "}
              <span className="italic text-primary">vận hành</span>
            </h1>
            <p className="hidden max-w-xl text-xs text-muted-foreground md:block">
              Theo dõi trạng thái khai thác, tiến độ duyệt và khả năng phục vụ của
              toàn bộ cơ sở trong một khung quản trị duy nhất.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ComplexFormDialog />
          </div>
        </div>

        {/* Stat strip — compact */}
        <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile
            icon={Layers}
            label="Tổng khu"
            value={pagination?.total ?? complexes.length}
            tone="slate"
            hint="Toàn bộ cơ sở"
          />
          <StatTile
            icon={CheckCircle2}
            label="Hoạt động"
            value={statusCounts[ComplexStatus.ACTIVE]}
            tone="emerald"
            hint="Đang nhận đặt"
          />
          <StatTile
            icon={Clock}
            label="Chờ duyệt"
            value={statusCounts[ComplexStatus.PENDING]}
            tone="amber"
            hint="Đợi admin duyệt"
          />
          <StatTile
            icon={MinusCircle}
            label="Đã ngừng"
            value={statusCounts[ComplexStatus.INACTIVE]}
            tone="rose"
            hint="Tạm dừng vận hành"
          />
        </div>
      </section>

      {/* ── TOOLBAR ───────────────────────────────────────────── */}
      <OwnerFilterShell
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Tìm kiếm khu phức hợp…"
        searchClassName="relative w-full md:max-w-sm"
        inline
      >
        <ComplexFilters
          value={statusFilter}
          isLoading={isLoading}
          onApply={setStatusFilter}
          onClear={() => setStatusFilter("ALL")}
        />
      </OwnerFilterShell>

      {/* ── LIST ──────────────────────────────────────────────── */}
      {isLoading && !hasComplexes ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-sm"
            >
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="flex flex-col gap-2 px-4 pb-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleComplexes.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-2 px-0.5">
            {hasQuery ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                }}
                className="h-7 rounded-full px-2 text-[11px] font-semibold"
              >
                <X data-icon="inline-start" />
                Đặt lại
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleComplexes.map((complex) => (
              <OwnerComplexCard key={complex.id} complex={complex} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && totalPages > 1 ? (
            <PaginationBar
              page={currentPage}
              totalPages={totalPages}
              onPageChange={goTo}
            />
          ) : null}
        </>
      ) : (
        <EmptyComplexState
          hasQuery={hasQuery}
          onReset={() => {
            setSearchTerm("");
            setStatusFilter("ALL");
          }}
        />
      )}
    </div>
  );
}

// ── Small building blocks ──────────────────────────────────────
type StatTone = "slate" | "emerald" | "amber" | "rose";

const STAT_TONE: Record<
  StatTone,
  { chip: string; value: string; bar: string; bg: string; ring: string }
> = {
  slate: {
    chip: "dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 status-surface-neutral",
    value: "text-slate-900 dark:text-slate-100",
    bar: "bg-slate-400",
    bg: "from-slate-500/8 via-transparent to-transparent",
    ring: "ring-slate-500/10",
  },
  emerald: {
    chip: "dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 status-surface-success",
    value: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
    bg: "from-emerald-500/10 via-transparent to-transparent",
    ring: "ring-emerald-500/15",
  },
  amber: {
    chip: "dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 status-surface-warning",
    value: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
    bg: "from-amber-500/10 via-transparent to-transparent",
    ring: "ring-amber-500/15",
  },
  rose: {
    chip: "dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 status-surface-error",
    value: "text-rose-700 dark:text-rose-300",
    bar: "bg-rose-500",
    bg: "from-rose-500/10 via-transparent to-transparent",
    ring: "ring-rose-500/15",
  },
};

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: StatTone;
  hint?: string;
}) {
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

function EmptyComplexState({
  hasQuery,
  onReset,
}: {
  hasQuery: boolean;
  onReset: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/70 bg-gradient-to-br from-muted/40 via-background to-muted/10 px-6 py-14 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-12 size-48 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-6 size-48 rounded-full bg-accent-sport/10 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          {hasQuery ? (
            <LayoutGrid className="size-6" />
          ) : (
            <Building2 className="size-6" />
          )}
        </div>
        <h3 className="font-display text-lg font-bold italic tracking-tight text-foreground">
          {hasQuery
            ? "Không tìm thấy kết quả"
            : "Chưa có khu phức hợp nào"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasQuery
            ? "Thử xóa bộ lọc, đổi từ khóa, hoặc chọn trạng thái khác để xem thêm khu phức hợp."
            : "Bắt đầu bằng việc tạo khu phức hợp đầu tiên — bạn có thể thêm sân con và bảng giá sau."}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {hasQuery ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="rounded-full"
            >
              <X data-icon="inline-start" />
              Xóa bộ lọc
            </Button>
          ) : null}
          <ComplexFormDialog />
        </div>
      </div>
    </div>
  );
}
