import { MatchParticipantsAvatarGroup } from "@/components/shared/matches/MatchParticipantsAvatarGroup";
import { MatchStatusBadge } from "@/components/shared/matches/MatchStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  MATCH_SKILL_BADGE_STYLES,
  MATCH_SKILL_LABELS,
  type Match,
  type MatchStatus,
  type SportType,
} from "@/types/match.type";
import { getSportTypeLabel } from "@/utils";
import { getNameInitials } from "@/utils/review.util";
import {
  CalendarClock,
  CheckCircle2,
  Hourglass,
  MapPin,
  Timer,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface MatchCardProps {
  match: Match;
  /** Custom footer actions — when omitted, a default footer is rendered. */
  actions?: ReactNode;
  /** Whether the viewer is a player (affects default CTA). */
  isPlayer?: boolean;
}

const STATUS_ACCENT: Record<MatchStatus, string> = {
  OPEN: "from-accent-sport to-emerald-400",
  FULL: "from-amber-400 to-amber-300",
  CLOSED: "from-slate-400 to-slate-300",
  EXPIRED: "from-orange-400 to-orange-300",
  CANCELED: "from-rose-500 to-rose-400",
  COMPLETED: "from-blue-500 to-cyan-400",
};

const STATUS_PROGRESS: Record<MatchStatus, string> = {
  OPEN: "bg-accent-sport",
  FULL: "bg-amber-500",
  CLOSED: "bg-slate-400",
  EXPIRED: "bg-orange-500",
  CANCELED: "bg-rose-500",
  COMPLETED: "bg-blue-500",
};

const SPORT_TINT: Record<SportType, string> = {
  FOOTBALL: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700/50",
  BASKETBALL: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-700/50",
  TENNIS: "bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-700/50",
  BADMINTON: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-700/50",
  VOLLEYBALL: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50",
  PICKLEBALL: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-700/50",
};

const formatShortTime = (value: string | null): string => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
  return `${time} · ${date}`;
};

const getCountdown = (deadline: string | null) => {
  if (!deadline) return { label: "Không giới hạn", urgent: false, expired: false };
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { label: "Hết hạn", urgent: true, expired: true };
  const mins = Math.floor(diff / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const label =
    days > 0
      ? `${days}d ${hours}h`
      : hours > 0
        ? `${hours}h ${mins % 60}m`
        : `${Math.max(mins, 1)}m`;
  return { label, urgent: mins <= 180, expired: false };
};

export function MatchCard({ match, actions, isPlayer }: MatchCardProps) {
  const sportLabel = getSportTypeLabel(match.sport_type);
  const fillPct = Math.min(
    100,
    Math.round((match.slots_filled / Math.max(match.slots_needed, 1)) * 100),
  );
  const countdown = getCountdown(match.join_deadline);
  const countdownTone = countdown.expired
    ? "text-rose-600 dark:text-rose-400"
    : countdown.urgent
      ? "text-amber-600 dark:text-amber-400"
      : "text-accent-sport";

  const participation = match.my_participation_status;
  const hasJoined = participation === "ACCEPTED";
  const hasPending = participation === "PENDING";

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-border/80 p-0 shadow-card",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover",
      )}
    >
      {/* Status accent bar */}
      <div
        aria-hidden
        className={cn(
          "h-1 w-full bg-gradient-to-r",
          STATUS_ACCENT[match.status],
        )}
      />

      {/* Header: creator + status */}
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 pb-3 pt-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="size-7 shrink-0 ring-1 ring-border">
            <AvatarImage src={match.creator.avatar ?? undefined} />
            <AvatarFallback className="bg-muted text-[10px] font-semibold">
              {getNameInitials(match.creator.full_name || "", "?")}
            </AvatarFallback>
          </Avatar>
          <p className="truncate text-xs font-semibold text-foreground">
            {match.creator.full_name || "Ẩn danh"}
          </p>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · Chủ kèo
          </span>
        </div>
        <MatchStatusBadge status={match.status} className="shrink-0" />
      </CardHeader>

      {/* Body */}
      <CardContent className="flex flex-1 flex-col gap-3 border-t border-border/70 px-4 py-3.5">
        {/* Chips + Title */}
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                "border text-[10.5px] font-semibold",
                SPORT_TINT[match.sport_type],
              )}
            >
              {sportLabel}
            </Badge>
            {match.skill_level && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10.5px] font-medium",
                  MATCH_SKILL_BADGE_STYLES[match.skill_level],
                )}
              >
                {MATCH_SKILL_LABELS[match.skill_level]}
              </Badge>
            )}
            {hasJoined && (
              <Badge className="border-0 bg-emerald-600 text-white">
                <CheckCircle2 data-icon="inline-start" />
                Đã tham gia
              </Badge>
            )}
            {hasPending && (
              <Badge className="border-0 bg-amber-500 text-white">
                <Hourglass data-icon="inline-start" />
                Chờ duyệt
              </Badge>
            )}
          </div>
          <Link
            to={`/matches/${match.id}`}
            className="group/link block transition-colors"
          >
            <h3 className="font-display text-base font-bold leading-snug tracking-tight text-foreground group-hover/link:text-primary">
              <span className="line-clamp-2">{match.title}</span>
            </h3>
          </Link>
        </div>

        {/* Meta row: when + where (inline, compact) */}
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span className="font-display font-bold italic tabular-nums text-foreground">
              {formatShortTime(match.booking.start_time)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate text-foreground/80">
              <span className="font-semibold text-foreground">
                {match.booking.sub_field_name}
              </span>
              <span className="text-muted-foreground"> · {match.booking.complex_name}</span>
            </span>
          </div>
        </div>

        {/* Roster — progress bar with inline avatars and counts */}
        <div className="flex flex-col gap-1.5 rounded-lg bg-muted/40 px-2.5 py-2 ring-1 ring-border/50">
          <div className="flex items-center justify-between gap-2">
            <MatchParticipantsAvatarGroup
              participants={match.participants_preview}
              slotsFilled={match.slots_filled}
            />
            <div className="flex items-baseline gap-1 text-xs">
              <span className="font-display text-sm font-black italic tabular-nums text-foreground">
                {match.slots_filled}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="tabular-nums text-foreground">
                {match.slots_needed}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="font-semibold tabular-nums text-muted-foreground">
                còn {match.slots_left}
              </span>
            </div>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                STATUS_PROGRESS[match.status],
              )}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className={cn("inline-flex items-center gap-1 font-medium", countdownTone)}>
              <Timer className="size-3" />
              {countdown.label}
            </span>
            <span className="font-semibold tabular-nums">{fillPct}%</span>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-end gap-2 border-t border-border/70 px-4 py-2.5">
        {actions ?? (
          <DefaultMatchActions match={match} isPlayer={Boolean(isPlayer)} />
        )}
      </CardFooter>
    </Card>
  );
}

function DefaultMatchActions({
  match,
  isPlayer,
}: {
  match: Match;
  isPlayer: boolean;
}) {
  const isDeadlinePassed = match.join_deadline
    ? new Date(match.join_deadline).getTime() <= Date.now()
    : false;
  const isStarted = new Date(match.booking.start_time).getTime() <= Date.now();

  const canJoin =
    isPlayer &&
    match.status === "OPEN" &&
    (!match.my_participation_status ||
      ["WITHDRAWN", "REJECTED", "REMOVED"].includes(
        match.my_participation_status as string,
      )) &&
    !isDeadlinePassed &&
    !isStarted;
  const alreadyInvolved =
    Boolean(match.my_participation_status) &&
    !["WITHDRAWN", "REJECTED", "REMOVED"].includes(
      match.my_participation_status as string,
    );

  return (
    <>
      <Button asChild variant="outline" size="sm">
        <Link to={`/matches/${match.id}`}>Xem chi tiết</Link>
      </Button>
      {canJoin ? (
        <Button asChild size="sm">
          <Link to={`/matches/${match.id}`}>Tham gia ngay</Link>
        </Button>
      ) : alreadyInvolved ? (
        <Button asChild variant="secondary" size="sm">
          <Link to={`/matches/${match.id}`}>Xem trạng thái</Link>
        </Button>
      ) : null}
    </>
  );
}
