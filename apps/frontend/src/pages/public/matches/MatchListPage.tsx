import { MatchCard } from "@/components/shared/matches/MatchCard";
import {
  MatchFilters,
  type MatchFiltersValue,
} from "@/components/shared/matches/MatchFilters";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { PaginationBar } from "@/components/shared/ui-utility/PaginationBar";
import { SearchBar } from "@/components/shared/ui-utility/SearchBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useMatchStore } from "@/store/useMatchStore";
import { SportType } from "@/types";
import {
  MATCH_DEFAULT_SORT,
  type MatchSortOption,
  type SportType as MatchSportType,
  type MatchStatus,
} from "@/types/match.type";
import {
  ArrowRight,
  CircleAlert,
  Flame,
  Sparkles,
  Trophy,
  UsersRound,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";


const PAGE_SIZE = 8;
interface MatchFilterValues {
  q: string;
  sport_type?: MatchSportType;
  status?: MatchStatus;
  sort: MatchSortOption;
}
const DEFAULT_FILTER: MatchFilterValues = { q: "", sort: MATCH_DEFAULT_SORT };
const VALID_SPORT_TYPES = new Set<string>(Object.values(SportType));
const VALID_MATCH_STATUS = new Set(["OPEN", "FULL", "CLOSED", "EXPIRED", "CANCELED", "COMPLETED"]);
const VALID_MATCH_SORT = new Set(["created_at:desc", "start_time:asc", "start_time:desc"]);

// ── Scoreboard chip (used in cinematic hero) ──────────────────────────────
interface ScoreboardChipProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: "default" | "primary" | "danger" | "success";
  hint?: string;
}

function ScoreboardChip({
  label,
  value,
  icon,
  accent = "default",
  hint,
}: ScoreboardChipProps) {
  const accentRing: Record<NonNullable<ScoreboardChipProps["accent"]>, string> =
    {
      default: "ring-white/10",
      primary: "ring-primary/50",
      danger: "ring-rose-400/60",
      success: "ring-accent-sport/60",
    };
  const accentValue: Record<NonNullable<ScoreboardChipProps["accent"]>, string> =
    {
      default: "text-white",
      primary: "text-primary-foreground",
      danger: "text-rose-300",
      success: "text-accent-sport",
    };
  const accentIcon: Record<NonNullable<ScoreboardChipProps["accent"]>, string> =
    {
      default: "text-white/60",
      primary: "text-primary-foreground/80",
      danger: "text-rose-300/80",
      success: "text-accent-sport/80",
    };

  return (
    <div
      className={cn(
        "relative flex min-w-[128px] flex-col gap-1 rounded-xl bg-white/5 px-4 py-3 ring-1 backdrop-blur-sm",
        accentRing[accent],
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]",
          accentIcon[accent],
        )}
      >
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "italic leading-none tabular-nums text-title",
          accentValue[accent],
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="text-[11px] text-white/50">{hint}</p>
      ) : null}
    </div>
  );
}

// ── Hero section (cinematic matchday) ─────────────────────────────────────
interface MatchesHeroProps {
  total: number;
  openCount: number;
  almostFullCount: number;
  totalSlotsLeft: number;
  isAuthenticated: boolean;
  keyword: string;
  sportValue: string;
  onKeywordChange: (value: string) => void;
  onSportChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}


function MatchesHero({
  total,
  openCount,
  almostFullCount,
  totalSlotsLeft,
  isAuthenticated,
  keyword,
  sportValue,
  onKeywordChange,
  onSportChange,
  onSubmit,
}: MatchesHeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(142_76%_36%/0.35),transparent_55%),radial-gradient(circle_at_85%_30%,hsl(217_91%_60%/0.4),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 sports-field-pattern opacity-[0.08]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/3 size-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-0 size-64 rounded-full bg-accent-sport/25 blur-3xl"
      />

      <div className="page-shell relative flex min-h-[340px] flex-col gap-6 lg:gap-8 pt-10 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 lg:pb-20">
        <Breadcrumb>
          <BreadcrumbList className="text-white/60">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="hover:text-white">
                <Link to="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/30" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white">Kèo đấu</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          {/* LEFT — headline */}
          <div className="flex max-w-2xl flex-col gap-5">
            <h1 className="font-display text-4xl font-black italic leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Kèo đấu{" "}
              <span className="bg-gradient-to-r from-accent-sport via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                bùng nổ
              </span>
              <br className="hidden sm:block" />
              chốt sổ ra sân
            </h1>

            <p className="max-w-xl text-base text-white/70 sm:text-lg">
              Chọn kèo theo môn thể thao, trình độ và khung giờ. Danh sách cập nhật
              liên tục để bạn vào đội nhanh trước khi đội đối thủ kịp chào sân.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Badge
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <Sparkles data-icon="inline-start" />
                Khám phá ngay
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-sm text-white/70">
                <UsersRound className="size-4 text-accent-sport" />
                <span className="font-display font-black italic tabular-nums text-white">
                  {totalSlotsLeft}
                </span>
                <span className="text-white/60">chỗ trống đang chờ bạn</span>
              </span>

              {!isAuthenticated && (
                <Button
                  asChild
                  size="sm"
                  className="ml-auto bg-white text-slate-950 hover:bg-white/90"
                >
                  <Link to="/auth/login">
                    Đăng nhập để tham gia
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* RIGHT — scoreboard */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-xl">
            <ScoreboardChip
              label="Tổng kèo"
              value={total}
              icon={<Trophy className="size-3" />}
              hint="Trên toàn hệ thống"
            />
            <ScoreboardChip
              label="Đang mở"
              value={openCount}
              icon={<Zap className="size-3" />}
              accent="success"
              hint="Sẵn sàng để tham gia ngay"
            />
            <ScoreboardChip
              label="Sắp full"
              value={almostFullCount}
              icon={<Flame className="size-3" />}
              accent="danger"
              hint="Nhanh tay chốt ngay kẻo lỡ"
            />
            <ScoreboardChip
              label="Chỗ trống"
              value={totalSlotsLeft}
              icon={<UsersRound className="size-3" />}
              accent="primary"
              hint="Cơ hội để bạn đặt chân vào đội"
            />
          </div>
        </div>

        <SearchBar
          keyword={keyword}
          onKeywordChange={onKeywordChange}
          sportValue={sportValue}
          onSportChange={(value) =>
            onSportChange(
              value === "ALL" || VALID_SPORT_TYPES.has(value) ? value : "ALL",
            )
          }
          onSubmit={onSubmit}
          placeholder="Tìm kèo theo tiêu đề, sân, khu phức hợp..."
          submitLabel="Tìm kèo"
          allSportsValue="ALL"
          variant="hero"
        />
      </div>

      {/* Bottom fade into page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background"
      />
    </section>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────
function MatchCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex flex-col gap-3">
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
        <Skeleton className="h-14 rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  );
}




// ── Main page ─────────────────────────────────────────────────────────────
export function MatchListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const { matches, pagination, isLoading, error, fetchPublicMatches } =
    useMatchStore();

  const appliedFilters = useMemo<MatchFilterValues>(() => {
    const q = searchParams.get("q") ?? "";
    const sport_type = searchParams.get("sport_type");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort");

    return {
      q,
      sport_type:
        sport_type && VALID_SPORT_TYPES.has(sport_type)
          ? (sport_type as MatchFilterValues["sport_type"])
          : undefined,
      status: status && VALID_MATCH_STATUS.has(status)
        ? (status as MatchFilterValues["status"])
        : undefined,
      sort:
        sort && VALID_MATCH_SORT.has(sort)
          ? (sort as MatchFilterValues["sort"])
          : MATCH_DEFAULT_SORT,
    };
  }, [searchParams]);

  const page = useMemo(() => {
    const raw = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  }, [searchParams]);

  const [filters, setFilters] = useState<MatchFilterValues>(appliedFilters);
  const [keyword, setKeyword] = useState<string>(appliedFilters.q);
  const [sportValue, setSportValue] = useState<string>(
    appliedFilters.sport_type ?? "ALL",
  );

  useEffect(() => {
    setFilters(appliedFilters);
    setKeyword(appliedFilters.q);
    setSportValue(appliedFilters.sport_type ?? "ALL");
  }, [appliedFilters]);

  useEffect(() => {
    void fetchPublicMatches({ ...appliedFilters, page, limit: PAGE_SIZE });
  }, [appliedFilters, page, fetchPublicMatches]);

  useEffect(() => {
    const handleMatchNotification = () => {
      void fetchPublicMatches({ ...appliedFilters, page, limit: PAGE_SIZE });
    };

    window.addEventListener("match_status_changed", handleMatchNotification);
    return () => {
      window.removeEventListener("match_status_changed", handleMatchNotification);
    };
  }, [appliedFilters, page, fetchPublicMatches]);

  const hasData = matches.length > 0;
  const isPlayer = Boolean(user?.roles.includes("PLAYER"));

  const openCount = useMemo(
    () => matches.filter((m) => m.status === "OPEN").length,
    [matches],
  );
  const almostFullCount = useMemo(
    () => matches.filter((m) => m.slots_left > 0 && m.slots_left <= 2).length,
    [matches],
  );
  const totalSlotsLeft = useMemo(
    () => matches.reduce((s, m) => s + m.slots_left, 0),
    [matches],
  );

  const total = pagination?.total_items ?? matches.length;
  const currentPage = pagination?.page ?? page;
  const totalPages = Math.max(pagination?.total_pages ?? 1, 1);

  const applyParams = (next: MatchFilterValues, nextPage = 1) => {
    const params = new URLSearchParams(searchParams);

    if (next.q.trim()) params.set("q", next.q.trim());
    else params.delete("q");

    if (next.sport_type) params.set("sport_type", next.sport_type);
    else params.delete("sport_type");

    if (next.status) params.set("status", next.status);
    else params.delete("status");

    if (next.sort && next.sort !== MATCH_DEFAULT_SORT) {
      params.set("sort", next.sort);
    } else {
      params.delete("sort");
    }

    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");

    setSearchParams(params);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextSportType =
      sportValue !== "ALL" && VALID_SPORT_TYPES.has(sportValue)
        ? (sportValue as MatchFilterValues["sport_type"])
        : undefined;

    const next: MatchFilterValues = {
      ...filters,
      q: keyword.trim(),
      sport_type: nextSportType,
    };

    setFilters(next);
    applyParams(next, 1);
  };

  const handleAdvancedFiltersChange = (next: MatchFiltersValue) => {
    const merged: MatchFilterValues = {
      ...filters,
      status: next.status,
      sort: next.sort,
    };
    setFilters(merged);
    applyParams(merged, 1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTER);
    setKeyword("");
    setSportValue("ALL");
    applyParams(DEFAULT_FILTER, 1);
  };

  return (
    <div className="flex min-h-[60vh] flex-col bg-background">
      <MatchesHero
        total={total}
        openCount={openCount}
        almostFullCount={almostFullCount}
        totalSlotsLeft={totalSlotsLeft}
        isAuthenticated={isAuthenticated}
        keyword={keyword}
        sportValue={sportValue}
        onKeywordChange={setKeyword}
        onSportChange={setSportValue}
        onSubmit={handleSearchSubmit}
      />

      <section className="page-shell py-10">
        <div className="flex flex-col gap-6">
          <MatchFilters
            value={{
              status: filters.status,
              sort: filters.sort,
            }}
            onChange={handleAdvancedFiltersChange}
            disabled={isLoading}
            className="mb-6"
          />

          {error && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>Không thể tải danh sách kèo</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && !hasData && <SkeletonGrid />}

          {!isLoading && !hasData && !error && (
            <EmptyState
              title="Không có kèo phù hợp"
              description="Không tìm thấy kèo nào với bộ lọc hiện tại. Hãy thử thay đổi điều kiện tìm kiếm."
              actionLabel="Đặt lại bộ lọc"
              onAction={handleReset}
            />
          )}

          {hasData && (
            <div
              key={`matches-grid-${currentPage}-${appliedFilters.q}-${appliedFilters.sport_type}-${appliedFilters.status}-${appliedFilters.sort}-${matches.map((m) => m.id).join(",")}`}
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 motion-safe-stagger"
            >
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} isPlayer={isPlayer} />
              ))}
            </div>
          )}

          {pagination ? (
            <PaginationBar
              page={currentPage}
              totalPages={totalPages}
              onPageChange={(nextPage) => applyParams(appliedFilters, nextPage)}
              disabled={isLoading}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
