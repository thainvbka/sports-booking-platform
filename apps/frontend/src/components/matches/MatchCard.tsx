import { MatchParticipantsAvatarGroup } from "@/components/matches/MatchParticipantsAvatarGroup";
import { MatchStatusBadge } from "@/components/matches/MatchStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SPORT_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  MATCH_SKILL_BADGE_STYLES,
  MATCH_SKILL_LABELS,
  type Match,
  type MatchStatus,
} from "@/types/match.type";
import { getNameInitials } from "@/utils/review.utils";
import { CalendarClock, Clock3, MapPin, Timer, Users } from "lucide-react";
import type { ReactNode } from "react";

interface MatchCardProps {
  match: Match;
  actions?: ReactNode;
}

const MATCH_STATUS_ACCENT: Record<MatchStatus, string> = {
  OPEN: "from-emerald-500 via-green-500 to-lime-500",
  FULL: "from-amber-500 via-orange-500 to-yellow-500",
  CLOSED: "from-slate-500 via-slate-600 to-slate-700",
  EXPIRED: "from-orange-500 via-red-500 to-rose-500",
  CANCELED: "from-rose-500 via-red-500 to-red-600",
  COMPLETED: "from-emerald-700 via-cyan-600 to-blue-600",
};

const formatDateTime = (value: string | null) => {
  if (!value) return "Không có";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("vi-VN");
};

const getJoinCountdown = (joinDeadline: string | null) => {
  if (!joinDeadline) {
    return {
      label: "Không giới hạn",
      urgent: false,
      expired: false,
    };
  }

  const parsed = new Date(joinDeadline).getTime();
  if (Number.isNaN(parsed)) {
    return {
      label: joinDeadline,
      urgent: false,
      expired: false,
    };
  }

  const diff = parsed - Date.now();
  if (diff <= 0) {
    return {
      label: "Đã hết hạn",
      urgent: true,
      expired: true,
    };
  }

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const label =
    days > 0
      ? `${days} ngày ${hours} giờ`
      : hours > 0
        ? `${hours} giờ ${minutes} phút`
        : `${Math.max(minutes, 1)} phút`;

  return {
    label,
    urgent: totalMinutes <= 180,
    expired: false,
  };
};

export function MatchCard({ match, actions }: MatchCardProps) {
  const sportLabel = SPORT_TYPE_LABELS[match.sport_type] ?? match.sport_type;
  const slotFillPercent = Math.min(
    100,
    Math.round((match.slots_filled / Math.max(match.slots_needed, 1)) * 100),
  );
  const creatorName = match.creator.full_name || "Người tạo ẩn danh";
  const joinDeadlineLabel = match.join_deadline
    ? formatDateTime(match.join_deadline)
    : "Không giới hạn";
  const joinCountdown = getJoinCountdown(match.join_deadline);
  const statusAccent = MATCH_STATUS_ACCENT[match.status];

  return (
    <Card className="group relative overflow-hidden border border-emerald-100/80 bg-white/95 py-4 shadow-lg shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25 dark:border-emerald-900/40 dark:bg-slate-900/80">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1.5 bg-linear-to-r",
          statusAccent,
        )}
      />
      <div className="pointer-events-none absolute inset-0 sports-field-pattern opacity-35" />
      <div className="pointer-events-none absolute -right-14 top-12 h-36 w-36 rounded-full bg-emerald-300/25 blur-3xl" />

      <CardHeader className="relative space-y-4 px-5 pb-0 pt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={match.creator.avatar ?? undefined} alt={creatorName} />
              <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                {getNameInitials(creatorName, "Người tạo")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                Creator
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {creatorName}
              </p>
            </div>
          </div>

          <MatchStatusBadge status={match.status} className="shrink-0" />
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700"
            >
              {sportLabel}
            </Badge>

            {match.skill_level ? (
              <Badge
                variant="outline"
                className={cn("text-xs font-medium", MATCH_SKILL_BADGE_STYLES[match.skill_level])}
              >
                {MATCH_SKILL_LABELS[match.skill_level]}
              </Badge>
            ) : null}
          </div>

          <CardTitle className="mt-3 line-clamp-2 text-xl leading-snug text-slate-900">
            {match.title}
          </CardTitle>

          <CardDescription className="mt-1 line-clamp-2 text-sm text-slate-600">
            {match.description || "Kèo chưa có mô tả chi tiết. Xem chi tiết để biết thêm."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 px-5 pt-4 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
              Bắt đầu
            </p>
            <div className="flex items-center gap-2 text-slate-700">
              <Clock3 className="h-4 w-4 text-blue-600" />
              <span className="line-clamp-1 text-sm font-medium">
                {formatDateTime(match.booking.start_time)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
              Địa điểm
            </p>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="h-4 w-4 text-red-500" />
              <span className="line-clamp-1 text-sm font-medium">
                {match.booking.sub_field_name}
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
              {match.booking.complex_name}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Users className="h-4 w-4 text-emerald-600" />
              {match.slots_filled}/{match.slots_needed} người
            </p>
            <p className="text-xs font-medium text-slate-500">Còn {match.slots_left} chỗ</p>
          </div>

          <div className="mt-2 h-2 rounded-full bg-slate-200">
            <div
              className={cn(
                "h-full rounded-full bg-linear-to-r transition-all duration-500",
                statusAccent,
              )}
              style={{ width: `${slotFillPercent}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <MatchParticipantsAvatarGroup
              participants={match.participants_preview}
              slotsFilled={match.slots_filled}
            />
            <span className="text-xs font-medium text-slate-500">
              {slotFillPercent}% đã lấp đầy
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          <CalendarClock className="h-4 w-4 text-rose-600" />
          <span className="font-medium">Hạn tham gia:</span>
          <span className="truncate">{joinDeadlineLabel}</span>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
            joinCountdown.expired
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : joinCountdown.urgent
                ? "border-orange-200 bg-orange-50 text-orange-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
          )}
        >
          <Timer className="h-4 w-4" />
          <span className="font-medium">Countdown:</span>
          <span className="ml-auto font-semibold">{joinCountdown.label}</span>
        </div>

        <p className="text-xs text-slate-500">
          Tạo lúc {formatDateTime(match.created_at)}
        </p>
      </CardContent>

      {actions && (
        <CardFooter className="px-5 pt-0">
          <div className="flex w-full items-center justify-end gap-2">{actions}</div>
        </CardFooter>
      )}
    </Card>
  );
}
