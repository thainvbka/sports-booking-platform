import { ParticipantStatusBadge } from "@/components/shared/matches/ParticipantStatusBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ParticipantStatus } from "@/types/match.type";
import { CircleAlert, LogIn, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export interface MatchActionPanelProps {
  isAuthenticated: boolean;
  isPlayerRole: boolean;
  playerId: string | null | undefined;
  canJoin: boolean;
  canLeave: boolean;
  isLoading: boolean;
  participationStatus: ParticipantStatus | null;
  actionHint: string | null;
  onOpenJoin: () => void;
  onLeave: () => void;
}

export function MatchActionPanel({
  isAuthenticated,
  isPlayerRole,
  playerId,
  canJoin,
  canLeave,
  isLoading,
  participationStatus,
  actionHint,
  onOpenJoin,
  onLeave,
}: MatchActionPanelProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardContent className="flex flex-col gap-3 p-5">
        {participationStatus ? (
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Trạng thái
            </span>
            <ParticipantStatusBadge status={participationStatus} />
          </div>
        ) : null}

        {isAuthenticated && !isPlayerRole ? (
          <Alert>
            <CircleAlert />
            <AlertDescription>
              Tài khoản hiện tại chưa có vai trò người chơi nên chưa thể tham
              gia kèo.
            </AlertDescription>
          </Alert>
        ) : null}

        {isAuthenticated && isPlayerRole && !playerId ? (
          <Alert>
            <CircleAlert />
            <AlertDescription>
              Không tìm thấy hồ sơ người chơi. Vui lòng đăng xuất và đăng nhập
              lại.
            </AlertDescription>
          </Alert>
        ) : null}

        {canJoin ? (
          <Button
            size="lg"
            onClick={onOpenJoin}
            disabled={isLoading}
            className="w-full"
          >
            <LogIn data-icon="inline-start" />
            Tham gia kèo
          </Button>
        ) : null}

        {canLeave ? (
          <Button
            variant="outline"
            size="lg"
            onClick={onLeave}
            disabled={isLoading}
            className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          >
            <LogOut data-icon="inline-start" />
            Rời kèo
          </Button>
        ) : null}

        {!isAuthenticated ? (
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/auth/login">
              <LogIn data-icon="inline-start" />
              Đăng nhập để tham gia
            </Link>
          </Button>
        ) : null}

        {actionHint ? (
          <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs leading-relaxed text-primary">
            {actionHint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
