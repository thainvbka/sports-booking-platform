import { MyMatchesHero } from "@/components/player/my-matches/MyMatchesHero";
import { MyMatchGridItem } from "@/components/player/my-matches/MyMatchGridItem";
import { MyMatchTypeTabs } from "@/components/player/my-matches/MyMatchTypeTabs";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { PaginationBar } from "@/components/shared/ui-utility/PaginationBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMyMatches } from "@/hooks/player/useMyMatches";
import { useAuthStore } from "@/store/useAuthStore";
import {
  type MatchStatus,
  type MyMatchType,
} from "@/types/match.type";
import { getPlayerProfileId } from "@/utils/userProfile.util";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function MyMatchesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [type, setType] = useState<MyMatchType>("created");
  const [status, setStatus] = useState<MatchStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const {
    matches,
    pagination,
    isLoading,
    error,
    myMatchesSummary,
    handleLeave,
  } = useMyMatches({ type, status, page });

  const playerId = getPlayerProfileId(user);
  const totalPages = pagination ? Math.max(pagination.total_pages, 1) : 1;

  const handleResetFilters = () => {
    setStatus("ALL");
    setPage(1);
  };

  const displayName = user?.full_name || "Người chơi";

  return (
    <div className="min-h-[60vh] bg-background">
      <MyMatchesHero
        user={user}
        displayName={displayName}
        status={status}
        onStatusChange={setStatus}
        onPageReset={() => setPage(1)}
      />

      <section className="page-shell py-10">
        <div className="flex flex-col gap-8">
          <MyMatchTypeTabs
            type={type}
            onTypeChange={setType}
            myMatchesSummary={myMatchesSummary}
            onPageReset={() => setPage(1)}
          />

          {error && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>Không thể tải kèo của bạn</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && matches.length === 0 ? (
            <LoadingState
              text="Đang tải danh sách kèo của bạn..."
              className="py-14"
            />
          ) : null}

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

          {matches.length > 0 ? (
            <div
              key={`my-matches-grid-${type}-${status}-${page}-${matches.map((m) => m.id).join(",")}`}
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 motion-safe-stagger"
            >
              {matches.map((match) => (
                <MyMatchGridItem
                  key={match.id}
                  match={match}
                  playerId={playerId}
                  isLoading={isLoading}
                  onLeave={handleLeave}
                />
              ))}
            </div>
          ) : null}

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
