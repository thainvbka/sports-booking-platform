import { MatchCard } from "@/components/matches/MatchCard";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { PaginationBar } from "@/components/shared/ui-utility/PaginationBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useMatchStore } from "@/store/useMatchStore";
import {
  MATCH_LEAVABLE_PARTICIPATION_STATUSES,
  MATCH_STATUS_BADGE_CONFIG,
  MATCH_STATUS_OPTIONS,
  MY_MATCH_TYPES,
  MY_MATCH_TYPE_LABELS,
  type MatchStatus,
  type MyMatchType,
} from "@/types/match.type";
import { getNameInitials } from "@/utils/review.utils";
import { getPlayerProfileId } from "@/utils/userProfile";

import {
  ArrowUpRight,
  CircleAlert,
  Hourglass,
  LogOut,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { Link, useNavigate } from "react-router-dom";

const PAGE_SIZE = 8;

const parseMyMatchType = (value: string): MyMatchType | undefined =>
  MY_MATCH_TYPES.find((item) => item === value);

const parseMatchStatus = (value: string): MatchStatus | "ALL" => {
  if (value === "ALL") return "ALL";
  return MATCH_STATUS_OPTIONS.find((item) => item === value) ?? "ALL";
};

const TAB_META: Record<
  MyMatchType,
  {
    icon: ComponentType<{ className?: string }>;
    description: string;
    tint: string;
    dot: string;
  }
> = {
  created: {
    icon: Trophy,
    description: "Do bạn khởi tạo",
    tint: "data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30",
    dot: "bg-primary",
  },
  joined: {
    icon: UsersRound,
    description: "Đã được duyệt",
    tint: "data-[state=active]:bg-accent-sport/10 data-[state=active]:border-accent-sport/30",
    dot: "bg-accent-sport",
  },
  pending: {
    icon: Hourglass,
    description: "Đang chờ duyệt",
    tint: "data-[state=active]:bg-amber-500/10 data-[state=active]:border-amber-400/40",
    dot: "bg-amber-500",
  },
};

export function MyMatchesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    matches,
    pagination,
    isLoading,
    error,
    myMatchesSummary,
    fetchMyMatches,
    leaveMatch,
  } = useMatchStore();

  const [type, setType] = useState<MyMatchType>("created");
  const [status, setStatus] = useState<MatchStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    void fetchMyMatches({
      type,
      status: status === "ALL" ? undefined : status,
      page,
      limit: PAGE_SIZE,
    });
  }, [type, status, page, fetchMyMatches]);

  const playerId = getPlayerProfileId(user);
  const totalPages = pagination ? Math.max(pagination.total_pages, 1) : 1;

  const handleResetFilters = () => {
    setStatus("ALL");
    setPage(1);
  };

  const handleLeave = async (matchId: string) => {
    const result = await leaveMatch(matchId);
    if (!result) return;

    await fetchMyMatches({
      type,
      status: status === "ALL" ? undefined : status,
      page,
      limit: PAGE_SIZE,
    });
  };

  const displayName = user?.full_name || "Người chơi";

  return (
    <div className="min-h-[60vh] bg-background">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950/80"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(142_76%_36%/0.35),transparent_55%),radial-gradient(circle_at_85%_30%,hsl(217_91%_60%/0.35),transparent_60%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 sports-field-pattern opacity-[0.1]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-accent-sport/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-12 size-80 rounded-full bg-primary/25 blur-3xl"
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
                <BreadcrumbLink asChild className="hover:text-white">
                  <Link to="/matches">Kèo đấu</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/30" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Kèo của tôi</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* ─── Personal Header ──────────────────────────────────────── */}
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3">
              <h1 className="font-display text-4xl font-black italic leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Kèo của{" "}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-accent-sport bg-clip-text text-transparent">
                tôi
              </span>
            </h1>

              <p className="max-w-xl text-base text-white/70 sm:text-lg">
              Sổ tay cá nhân cho các kèo bạn đã tạo, đã tham gia và đang chờ
              chủ kèo duyệt.
            </p>

              <div className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1 pl-1 pr-3 shadow-sm backdrop-blur-sm">
                <Avatar className="size-6 shrink-0 ring-1 ring-white/30">
                  <AvatarImage src={user?.avatar ?? undefined} alt={displayName} />
                  <AvatarFallback className="bg-white/20 text-[10px] font-semibold text-white">
                    {getNameInitials(displayName, "P")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold text-white">
                  {displayName}
                </span>
                <span
                  aria-hidden
                  className="inline-block h-3 w-px bg-white/30"
                />
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/70">
                  Player
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(parseMatchStatus(value));
                  setPage(1);
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="h-10 gap-1.5 rounded-lg border-white/30 bg-white/10 text-sm font-medium text-white"
                >
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  {MATCH_STATUS_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {MATCH_STATUS_BADGE_CONFIG[item].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                asChild
                size="lg"
                className="self-start bg-white text-slate-950 hover:bg-white/90 sm:self-auto"
              >
                <Link to="/matches">
                  <Sparkles data-icon="inline-start" />
                  Khám phá kèo mới
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </header>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background"
        />
      </section>

      <section className="page-shell py-10">
        <div className="flex flex-col gap-8">

        {/* ─── Category Tiles (Tabs) ────────────────────────────────── */}
        <Tabs
          value={type}
          onValueChange={(value) => {
            const nextType = parseMyMatchType(value);
            if (!nextType) return;
            setType(nextType);
            setPage(1);
          }}
        >
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-2xl bg-transparent p-0 sm:grid-cols-3">
            {MY_MATCH_TYPES.map((matchType) => {
              const meta = TAB_META[matchType];
              const Icon = meta.icon;
              const count = myMatchesSummary?.[matchType] ?? 0;
              return (
                <TabsTrigger
                  key={matchType}
                  value={matchType}
                  className={cn(
                    "group flex h-auto flex-col items-start gap-2 rounded-2xl border border-border/70 bg-card/70 px-4 py-3.5 text-left shadow-sm backdrop-blur-sm",
                    "data-[state=active]:border-transparent data-[state=active]:shadow-md",
                    "hover:border-border hover:bg-card",
                    meta.tint,
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-xl bg-muted/70 text-foreground/80 transition-colors group-data-[state=active]:bg-background",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          {meta.description}
                        </span>
                        <span className="font-display text-sm font-bold italic text-foreground">
                          {MY_MATCH_TYPE_LABELS[matchType]}
                        </span>
                      </span>
                    </span>

                    <span className="flex items-baseline gap-1">
                      <span className="font-display text-2xl font-black italic tabular-nums text-foreground">
                        {count ?? "—"}
                      </span>
                    </span>
                  </div>

                  <span
                    aria-hidden
                    className={cn(
                      "h-0.5 w-full origin-left rounded-full bg-transparent transition-all",
                      "group-data-[state=active]:bg-gradient-to-r",
                      matchType === "created" &&
                        "group-data-[state=active]:from-primary group-data-[state=active]:to-blue-400",
                      matchType === "joined" &&
                        "group-data-[state=active]:from-accent-sport group-data-[state=active]:to-emerald-400",
                      matchType === "pending" &&
                        "group-data-[state=active]:from-amber-500 group-data-[state=active]:to-amber-300",
                    )}
                  />
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>



        {/* ─── Error ────────────────────────────────────────────────── */}
        {error && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Không thể tải kèo của bạn</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ─── Loading ──────────────────────────────────────────────── */}
        {isLoading && matches.length === 0 ? (
          <LoadingState
            text="Đang tải danh sách kèo của bạn..."
            className="py-14"
          />
        ) : null}

        {/* ─── Empty ────────────────────────────────────────────────── */}
        {!isLoading && matches.length === 0 ? (
          <EmptyState
            title="Bạn chưa có kèo nào"
            description="Chưa có dữ liệu phù hợp với bộ lọc hiện tại. Bạn có thể xóa lọc hoặc khám phá thêm kèo mới."
            actionLabel={
              status !== "ALL" ? "Xóa lọc trạng thái" : "Xem tất cả kèo"
            }
            onAction={
              status !== "ALL"
                ? handleResetFilters
                : () => {
                    navigate("/matches");
                  }
            }
            className="py-16"
          />
        ) : null}

        {/* ─── Grid ─────────────────────────────────────────────────── */}
        {matches.length > 0 ? (
          <div
            key={`my-matches-grid-${type}-${status}-${page}-${matches.map((m) => m.id).join(",")}`}
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 motion-safe-stagger"
          >
            {matches.map((match) => {
              const isCreator = Boolean(
                playerId && match.creator.player_id === playerId,
              );
              const canLeave =
                !isCreator &&
                Boolean(
                  match.my_participation_status &&
                    MATCH_LEAVABLE_PARTICIPATION_STATUSES.includes(
                      match.my_participation_status,
                    ),
                );

              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  actions={
                    <>
                      {canLeave ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleLeave(match.id)}
                          disabled={isLoading}
                          className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                        >
                          <LogOut data-icon="inline-start" />
                          Rời kèo
                        </Button>
                      ) : null}
                      <Button asChild size="sm">
                        <Link to={`/matches/${match.id}`}>Xem chi tiết</Link>
                      </Button>
                    </>
                  }
                />
              );
            })}
          </div>
        ) : null}

        {/* ─── Pagination ───────────────────────────────────────────── */}
        {pagination && totalPages > 1 ? (
          <PaginationBar
            page={pagination.page}
            totalPages={totalPages}
            onPageChange={setPage}
            disabled={isLoading}
          />
        ) : null}
        </div>
      </section>
      </div>
  );
}




