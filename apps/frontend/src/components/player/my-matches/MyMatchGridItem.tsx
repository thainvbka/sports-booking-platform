import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { MatchCard } from "@/components/matches/MatchCard";
import {
  MATCH_LEAVABLE_PARTICIPATION_STATUSES,
  type Match,
} from "@/types/match.type";

interface MyMatchGridItemProps {
  match: Match;
  playerId: string | null | undefined;
  isLoading: boolean;
  onLeave: (matchId: string) => void | Promise<void>;
}

export function MyMatchGridItem({
  match,
  playerId,
  isLoading,
  onLeave,
}: MyMatchGridItemProps) {
  const isCreator = Boolean(
    playerId && match.creator.player_id === playerId,
  );
  const isStarted = new Date(match.booking.start_time).getTime() <= Date.now();
  const canLeave =
    !isCreator &&
    (match.status === "OPEN" || match.status === "FULL") &&
    !isStarted &&
    Boolean(
      match.my_participation_status &&
        MATCH_LEAVABLE_PARTICIPATION_STATUSES.includes(
          match.my_participation_status,
        ),
    );

  return (
    <MatchCard
      match={match}
      actions={
        <>
          {canLeave ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void onLeave(match.id)}
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
}
