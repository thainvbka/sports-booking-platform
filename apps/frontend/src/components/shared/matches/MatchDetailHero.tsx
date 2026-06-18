import { MatchParticipantsAvatarGroup } from "@/components/shared/matches/MatchParticipantsAvatarGroup";
import { MatchStatusBadge } from "@/components/shared/matches/MatchStatusBadge";
import { PlayerDarkHeroShell } from "@/components/shared/layout/PlayerDarkHeroShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MATCH_SPORT_TINT_DARK,
  MATCH_STATUS_PROGRESS,
} from "@/utils/match-styles.util";
import { cn } from "@/lib/utils";
import {
  type MatchStatus,
  type SportType,
} from "@/types/match.type";
import { formatMatchTimeRange } from "@/utils/time.util";
import { getNameInitials } from "@/utils/review.util";
import type { MatchCountdown } from "@/utils/match.util";
import { CalendarClock, MapPin, Sparkles, Timer } from "lucide-react";
import { formatMatchDateTime } from "@/utils/time.util";

// ── Private: HeroMetaTile ───────────────────────────────────────────────────
function HeroMetaTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 backdrop-blur-sm">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
        {icon}
        {label}
      </span>
      <span className="font-display text-sm font-bold italic leading-snug tabular-nums text-white">
        {value}
      </span>
      {hint ? (
        <span className="truncate text-[11px] text-white/50">{hint}</span>
      ) : null}
    </div>
  );
}

// ── Public: MatchDetailHero ─────────────────────────────────────────────────
export interface MatchDetailHeroProps {
  title: string;
  description: string | null;
  sportLabel: string;
  sportType: SportType;
  status: MatchStatus;
  startTime: string | null;
  endTime: string | null;
  subFieldName: string;
  complexName: string;
  joinDeadline: string | null;
  countdown: MatchCountdown;
  creatorName: string;
  creatorAvatar: string | null;
  slotsFilled: number;
  slotsNeeded: number;
  fillPercent: number;
  participantsPreview?: { player_id: string; full_name: string; avatar: string | null }[];
}

export function MatchDetailHero({
  title,
  description,
  sportLabel,
  sportType,
  status,
  startTime,
  endTime,
  subFieldName,
  complexName,
  joinDeadline,
  countdown,
  creatorName,
  creatorAvatar,
  slotsFilled,
  slotsNeeded,
  fillPercent,
  participantsPreview,
}: MatchDetailHeroProps) {
  const countdownTone = countdown.expired
    ? "text-rose-300"
    : countdown.urgent
      ? "text-amber-300"
      : "text-accent-sport";

  return (
    <PlayerDarkHeroShell
      breadcrumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Kèo đấu", href: "/matches" },
        { label: title },
      ]}
      title={
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Badge
            variant="outline"
            className={cn("border", MATCH_SPORT_TINT_DARK[sportType])}
          >
            <Sparkles data-icon="inline-start" />
            {sportLabel}
          </Badge>
          <MatchStatusBadge status={status} />
        </div>
      }
      description={
        <div className="flex flex-col gap-3">
          <h1 className="max-w-4xl font-display text-4xl font-black italic leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-white">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-base text-white/70 sm:text-lg">
              {description}
            </p>
          ) : null}

          {/* Meta strip — Time / Venue / Deadline */}
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <HeroMetaTile
              icon={<CalendarClock className="size-3.5 text-accent-sport" />}
              label="Thi đấu"
              value={formatMatchTimeRange(startTime, endTime)}
            />
            <HeroMetaTile
              icon={<MapPin className="size-3.5 text-primary-foreground" />}
              label="Địa điểm"
              value={subFieldName}
              hint={complexName}
            />
            <HeroMetaTile
              icon={<Timer className="size-3.5 text-amber-300" />}
              label="Đếm ngược"
              value={
                <span className={cn("font-black italic", countdownTone)}>
                  {countdown.label}
                </span>
              }
              hint={
                joinDeadline
                  ? `Hạn ${formatMatchDateTime(joinDeadline)}`
                  : "Không giới hạn"
              }
            />
          </div>
        </div>
      }
      rightExtra={
        /* Roster scoreboard */
        <div className="mt-2 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm lg:max-w-xl w-full">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar className="size-8 shrink-0 ring-2 ring-white/20">
              <AvatarImage src={creatorAvatar ?? undefined} alt={creatorName} />
              <AvatarFallback className="bg-white/10 text-[10px] font-semibold text-white">
                {getNameInitials(creatorName, "Creator")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                Chủ kèo
              </p>
              <p className="truncate text-sm font-semibold leading-tight text-white">
                {creatorName}
              </p>
            </div>
          </div>

          <span aria-hidden className="hidden h-8 w-px bg-white/10 md:block" />

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MatchParticipantsAvatarGroup
                  participants={participantsPreview}
                  slotsFilled={slotsFilled}
                />
                <span className="text-xs text-white/60">
                  <span className="font-display text-base font-black italic tabular-nums text-white">
                    {slotsFilled}
                  </span>
                  <span className="text-white/40"> / </span>
                  <span className="tabular-nums">{slotsNeeded}</span>
                  <span className="ml-1 text-white/40">người</span>
                </span>
              </div>
              <span className="text-xs font-semibold tabular-nums text-white/70">
                {Math.round(fillPercent)}%
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  MATCH_STATUS_PROGRESS[status],
                )}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
