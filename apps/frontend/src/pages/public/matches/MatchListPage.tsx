import { MatchCard } from "@/components/shared/matches/MatchCard";
import { MatchCardSkeletonGrid } from "@/components/shared/matches/MatchCardSkeleton";
import { MatchListHero } from "@/components/shared/matches/MatchListHero";
import {
  MatchFilters,
  type MatchFiltersValue,
} from "@/components/shared/matches/MatchFilters";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { PaginationBar } from "@/components/shared/ui-utility/PaginationBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthStore } from "@/store/useAuthStore";
import { useMatchStore } from "@/store/useMatchStore";
import { SportType } from "@/types";
import {
  MATCH_DEFAULT_SORT,
  type MatchSortOption,
  type SportType as MatchSportType,
  type MatchStatus,
} from "@/types/match.type";
import { CircleAlert } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

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
  const [sportValue, setSportValue] = useState<string>(appliedFilters.sport_type ?? "ALL");

  useEffect(() => {
    setFilters(appliedFilters);
    setKeyword(appliedFilters.q);
    setSportValue(appliedFilters.sport_type ?? "ALL");
  }, [appliedFilters]);

  useEffect(() => {
    void fetchPublicMatches({ ...appliedFilters, page, limit: PAGE_SIZE });
  }, [appliedFilters, page, fetchPublicMatches]);

  useEffect(() => {
    const handle = () => {
      void fetchPublicMatches({ ...appliedFilters, page, limit: PAGE_SIZE });
    };
    window.addEventListener("match_status_changed", handle);
    return () => window.removeEventListener("match_status_changed", handle);
  }, [appliedFilters, page, fetchPublicMatches]);

  const hasData = matches.length > 0;
  const isPlayer = Boolean(user?.roles.includes("PLAYER"));

  const openCount = useMemo(() => matches.filter((m) => m.status === "OPEN").length, [matches]);
  const almostFullCount = useMemo(() => matches.filter((m) => m.slots_left > 0 && m.slots_left <= 2).length, [matches]);
  const totalSlotsLeft = useMemo(() => matches.reduce((s, m) => s + m.slots_left, 0), [matches]);

  const total = pagination?.total_items ?? matches.length;
  const currentPage = pagination?.page ?? page;
  const totalPages = Math.max(pagination?.total_pages ?? 1, 1);

  const applyParams = (next: MatchFilterValues, nextPage = 1) => {
    const params = new URLSearchParams(searchParams);
    if (next.q.trim()) params.set("q", next.q.trim()); else params.delete("q");
    if (next.sport_type) params.set("sport_type", next.sport_type); else params.delete("sport_type");
    if (next.status) params.set("status", next.status); else params.delete("status");
    if (next.sort && next.sort !== MATCH_DEFAULT_SORT) params.set("sort", next.sort); else params.delete("sort");
    if (nextPage > 1) params.set("page", String(nextPage)); else params.delete("page");
    setSearchParams(params);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSportType =
      sportValue !== "ALL" && VALID_SPORT_TYPES.has(sportValue)
        ? (sportValue as MatchFilterValues["sport_type"])
        : undefined;
    const next: MatchFilterValues = { ...filters, q: keyword.trim(), sport_type: nextSportType };
    setFilters(next);
    applyParams(next, 1);
  };

  const handleAdvancedFiltersChange = (next: MatchFiltersValue) => {
    const merged: MatchFilterValues = { ...filters, status: next.status, sort: next.sort };
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
      <MatchListHero
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
            value={{ status: filters.status, sort: filters.sort }}
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

          {isLoading && !hasData && <MatchCardSkeletonGrid />}

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
