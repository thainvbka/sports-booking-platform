import { MatchCard } from "@/components/matches/MatchCard";
import {
  MatchFilterBar,
  type MatchFilterValues,
} from "@/components/matches/MatchFilterBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useMatchStore } from "@/store/useMatchStore";
import { MATCH_DEFAULT_SORT } from "@/types/match.type";
import { ArrowRight, CircleAlert, Clock3, Flame, Sparkles, Trophy, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const PAGE_SIZE = 8;

const DEFAULT_FILTER_VALUES: MatchFilterValues = {
  q: "",
  sort: MATCH_DEFAULT_SORT,
};

export function MatchListPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { matches, pagination, isLoading, error, fetchPublicMatches } = useMatchStore();

  const [filters, setFilters] = useState<MatchFilterValues>(DEFAULT_FILTER_VALUES);
  const [appliedFilters, setAppliedFilters] =
    useState<MatchFilterValues>(DEFAULT_FILTER_VALUES);
  const [page, setPage] = useState(1);

  useEffect(() => {
    void fetchPublicMatches({
      ...appliedFilters,
      page,
      limit: PAGE_SIZE,
    });
  }, [appliedFilters, page, fetchPublicMatches]);

  const hasData = matches.length > 0;
  const isPlayer = Boolean(user?.roles.includes("PLAYER"));

  const canGoPrevious = useMemo(() => page > 1, [page]);
  const canGoNext = useMemo(() => pagination?.has_next ?? false, [pagination]);
  const openMatches = useMemo(
    () => matches.filter((match) => match.status === "OPEN").length,
    [matches],
  );
  const totalSlotsLeft = useMemo(
    () => matches.reduce((total, match) => total + match.slots_left, 0),
    [matches],
  );
  const almostFullMatches = useMemo(
    () => matches.filter((match) => match.slots_left > 0 && match.slots_left <= 2).length,
    [matches],
  );

  const totalResults = pagination?.total_items ?? matches.length;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-linear-to-b from-emerald-50 via-green-50/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 sports-field-pattern opacity-80" />

      <div className="container relative mx-auto space-y-8 px-4 py-6 md:space-y-10 md:py-10">
        <section className="sports-glow-success relative overflow-hidden rounded-[30px] border border-emerald-200/90 bg-white/95 p-6 shadow-lg shadow-emerald-900/10 md:p-10">
          <div className="pointer-events-none absolute inset-0 sports-field-pattern opacity-70" />
          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-emerald-300/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-rose-300/25 blur-3xl" />

          <div className="relative space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <Badge className="border-0 bg-linear-to-r from-emerald-500 to-green-600 px-3 py-1 text-white">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Match Discovery
                </Badge>

                <div className="space-y-3">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                    Kèo đấu sôi động mỗi ngày
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-700 md:text-lg">
                    Chọn kèo theo môn, trình độ và lịch trống của bạn. Tất cả kèo được hiển thị
                    realtime để bạn vào đội nhanh hơn.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
                      1. Chọn bộ lọc
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
                      2. Xem kèo phù hợp
                    </span>
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">
                      3. Tham gia trong 1 chạm
                    </span>
                  </div>
                </div>
              </div>

              {!isAuthenticated ? (
                <Button
                  asChild
                  className="h-11 bg-linear-to-r from-emerald-500 to-green-600 px-5 text-white shadow-lg shadow-emerald-500/35 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/45"
                >
                  <Link to="/auth/login">
                    Đăng nhập để tham gia ngay
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Tổng kèo</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{totalResults}</p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/85 p-4 shadow-sm">
                <p className="flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-emerald-600">
                  <Trophy className="h-3.5 w-3.5" />
                  Đang mở
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">{openMatches}</p>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50/85 p-4 shadow-sm">
                <p className="flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-rose-600">
                  <Flame className="h-3.5 w-3.5" />
                  Kèo sắp full
                </p>
                <p className="mt-2 text-2xl font-bold text-rose-700">{almostFullMatches}</p>
                <p className="mt-1 text-xs text-rose-600">Còn 1-2 slot, vào nhanh để giữ chỗ.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">
                <UsersRound className="h-3.5 w-3.5" />
                {totalSlotsLeft} chỗ trống đang chờ bạn
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700">
                <Clock3 className="h-3.5 w-3.5" />
                Danh sách cập nhật liên tục theo thời gian thực
              </span>
            </div>
          </div>
        </section>

        <MatchFilterBar
          values={filters}
          onValuesChange={setFilters}
          onApply={() => {
            setPage(1);
            setAppliedFilters(filters);
          }}
          onReset={() => {
            setPage(1);
            setFilters(DEFAULT_FILTER_VALUES);
            setAppliedFilters(DEFAULT_FILTER_VALUES);
          }}
          isLoading={isLoading}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Hiển thị <span className="font-semibold text-slate-900">{matches.length}</span> kèo
            trong trang này.
          </p>

          <div className="flex items-center gap-2">
            {appliedFilters.q ? (
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                Từ khóa: {appliedFilters.q}
              </Badge>
            ) : null}
            {isPlayer ? (
              <Button asChild variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <Link to="/player/matches">Kèo của tôi</Link>
              </Button>
            ) : null}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <CircleAlert className="h-4 w-4" />
            <AlertTitle>Không thể tải danh sách kèo</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && !hasData ? (
          <p className="text-sm text-slate-500">Đang tải danh sách kèo...</p>
        ) : null}

        {!isLoading && !hasData ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="text-sm text-slate-600">
              Không có kèo nào phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        ) : null}

        {hasData ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((match) => {
              const canJoinNow = isPlayer && match.status === "OPEN";

              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  actions={
                    <>
                      <Button asChild variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                        <Link to={`/matches/${match.id}`}>Xem chi tiết</Link>
                      </Button>
                      {canJoinNow ? (
                        <Button
                          asChild
                          size="sm"
                          className="bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/40"
                        >
                          <Link to={`/matches/${match.id}`}>Tham gia ngay</Link>
                        </Button>
                      ) : null}
                    </>
                  }
                />
              );
            })}
          </div>
        ) : null}

        {pagination ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-slate-600">
              Trang {pagination.page}/{Math.max(pagination.total_pages, 1)}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                disabled={!canGoPrevious || isLoading}
              >
                Trang trước
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((previous) => previous + 1)}
                disabled={!canGoNext || isLoading}
              >
                Trang sau
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
