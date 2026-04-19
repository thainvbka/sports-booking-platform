import { MatchCard } from "@/components/matches/MatchCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { getPlayerProfileId } from "@/utils/userProfile";
import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PAGE_SIZE = 8;

const parseMyMatchType = (value: string): MyMatchType | undefined => {
  return MY_MATCH_TYPES.find((item) => item === value);
};

const parseMatchStatus = (value: string): MatchStatus | "ALL" => {
  if (value === "ALL") {
    return "ALL";
  }

  return MATCH_STATUS_OPTIONS.find((item) => item === value) ?? "ALL";
};

export function MyMatchesPage() {
  const { user } = useAuthStore();
  const { matches, pagination, isLoading, error, fetchMyMatches, leaveMatch } =
    useMatchStore();

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

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold md:text-3xl">Kèo của tôi</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Theo dõi những kèo bạn đã tạo hoặc đã tham gia.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to="/matches">Xem tất cả kèo</Link>
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border bg-card p-4">
        <Tabs
          value={type}
          onValueChange={(value) => {
            const nextType = parseMyMatchType(value);

            if (!nextType) {
              return;
            }

            setType(nextType);
            setPage(1);
          }}
        >
          <TabsList>
            {MY_MATCH_TYPES.map((matchType) => (
              <TabsTrigger key={matchType} value={matchType}>
                {MY_MATCH_TYPE_LABELS[matchType]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="max-w-55">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(parseMatchStatus(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Lọc trạng thái" />
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
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Không thể tải kèo của bạn</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && matches.length === 0 ? (
        <p className="text-sm text-muted-foreground">Đang tải danh sách kèo...</p>
      ) : null}

      {!isLoading && matches.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bạn chưa có kèo nào trong mục này.</p>
      ) : null}

      {matches.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => {
            const isCreator = Boolean(playerId && match.creator.player_id === playerId);
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
                      >
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

      {pagination ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((previous) => Math.max(1, previous - 1))}
            disabled={page <= 1 || isLoading}
          >
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {pagination.page}/{Math.max(pagination.total_pages, 1)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((previous) => previous + 1)}
            disabled={!pagination.has_next || isLoading}
          >
            Trang sau
          </Button>
        </div>
      ) : null}
    </div>
  );
}
