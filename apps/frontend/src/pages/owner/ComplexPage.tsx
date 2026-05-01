import { ComplexFormDialog } from "@/components/shared/ComplexFormDialog";
import { OwnerComplexCard } from "@/components/shared/OwnerComplexCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { useComplexStore } from "@/store/owner/useComplexStore";
import { ComplexStatus } from "@/types";
import {
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  LayoutGrid,
  MinusCircle,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type StatusFilter = "ALL" | ComplexStatus;

const STATUS_TABS: {
  id: StatusFilter;
  label: string;
  hint: string;
}[] = [
  { id: "ALL", label: "Tất cả", hint: "Toàn bộ khu phức hợp" },
  { id: ComplexStatus.ACTIVE, label: "Hoạt động", hint: "Đang nhận đặt" },
  { id: ComplexStatus.PENDING, label: "Chờ duyệt", hint: "Đợi admin phê duyệt" },
  { id: ComplexStatus.INACTIVE, label: "Ngừng", hint: "Tạm ngừng nhận đặt" },
  { id: ComplexStatus.REJECTED, label: "Từ chối", hint: "Bị từ chối" },
];

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

  const totalItems = pagination?.total ?? complexes.length;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? 1;
  const pageList = buildPageList(currentPage, totalPages);

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setPage(page);
  };

  const hasComplexes = complexes.length > 0;
  const hasQuery = Boolean(searchTerm) || statusFilter !== "ALL";

  return (
    <div className="flex flex-col gap-6 pb-10">
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

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">

            <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
              Khu phức hợp của{" "}
              <span className="italic text-primary">bạn</span>
            </h1>
            <p className="hidden max-w-xl text-xs text-muted-foreground md:block">
              Quản lý danh mục sân — trạng thái, địa chỉ và số sân con — tất cả
              trong một bảng điều khiển duy nhất.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ComplexFormDialog />
          </div>
        </div>

        {/* Stat strip — compact */}
        <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatChip
            icon={CheckCircle2}
            label="Hoạt động"
            value={statusCounts[ComplexStatus.ACTIVE]}
            tone="emerald"
          />
          <StatChip
            icon={Clock}
            label="Chờ duyệt"
            value={statusCounts[ComplexStatus.PENDING]}
            tone="amber"
          />
          <StatChip
            icon={MinusCircle}
            label="Đã ngừng"
            value={statusCounts[ComplexStatus.INACTIVE]}
            tone="slate"
          />
          <StatChip
            icon={XCircle}
            label="Từ chối"
            value={statusCounts[ComplexStatus.REJECTED]}
            tone="rose"
          />
        </div>
      </section>

      {/* ── TOOLBAR ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-xs md:flex-row md:items-center md:justify-between md:p-3.5">
        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <Input
            type="search"
            placeholder="Tìm kiếm khu phức hợp…"
            className="h-10 rounded-full pl-10 pr-10 text-sm shadow-none focus-visible:ring-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Compass className="size-4" />
          </span>
          {searchTerm ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-1.5 top-1/2 size-7 -translate-y-1/2 rounded-full"
              onClick={() => setSearchTerm("")}
              aria-label="Xóa từ khóa"
            >
              <X />
            </Button>
          ) : null}
        </div>

        {/* Status filter */}
        <div
          role="tablist"
          aria-label="Lọc theo trạng thái"
          className="flex w-full flex-wrap items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1 md:w-auto md:justify-end"
        >
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                title={tab.hint}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  active
                    ? "bg-background text-primary shadow-sm ring-1 ring-primary/25"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleComplexes.map((complex) => (
              <OwnerComplexCard key={complex.id} complex={complex} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && totalPages > 1 ? (
            <div className="mt-2">
              <Pagination className="mt-2">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        goTo(currentPage - 1);
                      }}
                      className={cn(
                        currentPage <= 1 &&
                          "pointer-events-none opacity-40",
                      )}
                      aria-disabled={currentPage <= 1}
                    />
                  </PaginationItem>

                  {pageList.map((page, index) =>
                    page === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(event) => {
                            event.preventDefault();
                            goTo(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        goTo(currentPage + 1);
                      }}
                      className={cn(
                        currentPage >= totalPages &&
                          "pointer-events-none opacity-40",
                      )}
                      aria-disabled={currentPage >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
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
type StatTone = "emerald" | "amber" | "slate" | "rose";

function StatChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: StatTone;
}) {
  const toneClasses: Record<StatTone, { wrap: string; icon: string; dot: string }> = {
    emerald: {
      wrap: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      icon: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    amber: {
      wrap: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      icon: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    slate: {
      wrap: "border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300",
      icon: "text-slate-600 dark:text-slate-300",
      dot: "bg-slate-500",
    },
    rose: {
      wrap: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      icon: "text-rose-600 dark:text-rose-400",
      dot: "bg-rose-500",
    },
  };

  const t = toneClasses[tone];

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl border px-3 py-2 backdrop-blur-sm",
        t.wrap,
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.2em] opacity-80">
          <span aria-hidden className={cn("size-1.5 rounded-full", t.dot)} />
          {label}
        </span>
        <span className="font-display text-lg font-black italic leading-none tabular-nums">
          {value}
        </span>
      </div>
      <Icon className={cn("size-4 shrink-0 opacity-90", t.icon)} />
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
