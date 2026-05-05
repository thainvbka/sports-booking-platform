import { JoinMatchDialog } from "@/components/matches/JoinMatchDialog";
import { MatchParticipantsAvatarGroup } from "@/components/matches/MatchParticipantsAvatarGroup";
import { MatchStatusBadge } from "@/components/matches/MatchStatusBadge";
import { ParticipantList } from "@/components/matches/ParticipantList";
import { ParticipantStatusBadge } from "@/components/matches/ParticipantStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { SPORT_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useMatchStore } from "@/store/useMatchStore";
import {
  MATCH_LEAVABLE_PARTICIPATION_STATUSES,
  type MatchStatus,
  type SportType,
} from "@/types/match.type";
import { getNameInitials } from "@/utils/review.utils";
import { getPlayerProfileId } from "@/utils/userProfile";
import {
  CalendarClock,
  CircleAlert,
  Clock,
  LogIn,
  LogOut,
  MapPin,
  ShieldX,
  Sparkles,
  Timer,
  Trophy,
  Unlock,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const PARTICIPANTS_PAGE_SIZE = 10;

const STATUS_ACCENT_BAR: Record<MatchStatus, string> = {
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
  FOOTBALL: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
  BASKETBALL: "bg-orange-500/20 text-orange-200 border-orange-400/30",
  TENNIS: "bg-lime-500/20 text-lime-200 border-lime-400/30",
  BADMINTON: "bg-sky-500/20 text-sky-200 border-sky-400/30",
  VOLLEYBALL: "bg-amber-500/20 text-amber-200 border-amber-400/30",
  PICKLEBALL: "bg-teal-500/20 text-teal-200 border-teal-400/30",
};

const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRangeTime = (start: string | null, end: string | null) => {
  if (!start) return "—";
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return start;
  const startStr = s.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = s.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  if (!end) return `${startStr} · ${dateStr}`;
  const e = new Date(end);
  if (Number.isNaN(e.getTime())) return `${startStr} · ${dateStr}`;
  const endStr = e.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${startStr} → ${endStr} · ${dateStr}`;
};

const getJoinCountdown = (joinDeadline: string | null) => {
  if (!joinDeadline) {
    return { label: "Không giới hạn", urgent: false, expired: false };
  }
  const parsed = new Date(joinDeadline).getTime();
  if (Number.isNaN(parsed)) {
    return { label: joinDeadline, urgent: false, expired: false };
  }
  const diff = parsed - Date.now();
  if (diff <= 0) return { label: "Đã hết hạn", urgent: true, expired: true };

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const label =
    days > 0
      ? `${days} ngày ${hours} giờ`
      : hours > 0
        ? `${hours} giờ ${minutes} phút`
        : `${Math.max(minutes, 1)} phút`;
  return { label, urgent: totalMinutes <= 180, expired: false };
};

export function MatchDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();

  const {
    currentMatch,
    participants,
    participantsMatch,
    participantsPagination,
    isLoading,
    isLoadingDetail,
    error,
    fetchMatchById,
    fetchParticipants,
    joinMatch,
    leaveMatch,
    acceptParticipant,
    rejectParticipant,
    closeMatch,
    reopenMatch,
    cancelMatch,
  } = useMatchStore();

  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [participantPage, setParticipantPage] = useState(1);

  const isPlayerRole = Boolean(user?.roles.includes("PLAYER"));
  const playerId = getPlayerProfileId(user);
  const canUsePlayerScope = Boolean(isAuthenticated && isPlayerRole && playerId);

  const detailScope: "public" | "player" = canUsePlayerScope
    ? "player"
    : "public";

  useEffect(() => {
    if (!id) return;
    void fetchMatchById(id, detailScope);
  }, [id, detailScope, fetchMatchById]);

  const isCreator = useMemo(() => {
    if (!currentMatch || !playerId) return false;
    return currentMatch.creator.player_id === playerId;
  }, [currentMatch, playerId]);

  useEffect(() => {
    if (!id || !isCreator) return;
    void fetchParticipants(id, {
      page: participantPage,
      limit: PARTICIPANTS_PAGE_SIZE,
    });
  }, [id, isCreator, participantPage, fetchParticipants]);

  const refreshCurrentMatch = async () => {
    if (!id) return;
    await fetchMatchById(id, detailScope);
    if (isCreator) {
      await fetchParticipants(id, {
        page: participantPage,
        limit: PARTICIPANTS_PAGE_SIZE,
      });
    }
  };

  const handleJoin = async (introduction?: string) => {
    if (!id) return false;
    const result = await joinMatch(id, introduction);
    if (!result) return false;
    await fetchMatchById(id, "player");
    return true;
  };

  const handleLeave = async () => {
    if (!id) return;
    const result = await leaveMatch(id);
    if (!result) return;
    await refreshCurrentMatch();
  };

  const handleAccept = async (participantId: string) => {
    if (!id) return;
    const result = await acceptParticipant(id, participantId);
    if (!result) return;
    await refreshCurrentMatch();
  };

  const handleReject = async (participantId: string) => {
    if (!id) return;
    const result = await rejectParticipant(id, participantId);
    if (!result) return;
    await refreshCurrentMatch();
  };

  const handleClose = async () => {
    if (!id) return;
    const result = await closeMatch(id);
    if (!result) return;
    await refreshCurrentMatch();
  };

  const handleReopen = async () => {
    if (!id) return;
    const result = await reopenMatch(id);
    if (!result) return;
    await refreshCurrentMatch();
  };

  const handleCancel = async () => {
    if (!id) return;
    const result = await cancelMatch(id);
    if (!result) return;
    await refreshCurrentMatch();
  };

  if (!id) {
    return (
      <div className="page-shell-compact py-16">
        <EmptyState
          title="ID kèo không hợp lệ"
          description="Liên kết bạn truy cập không chứa mã kèo hợp lệ. Hãy quay lại danh sách để chọn lại kèo."
          actionLabel="Về danh sách kèo"
          onAction={() => {
            window.location.href = "/matches";
          }}
        />
      </div>
    );
  }

  if (isLoadingDetail && !currentMatch) {
    return (
      <div className="page-shell py-20">
        <LoadingState text="Đang tải chi tiết kèo..." className="py-16" />
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="page-shell-compact py-16">
        <EmptyState
          title="Không tìm thấy kèo"
          description="Kèo bạn đang tìm không tồn tại hoặc đã bị gỡ khỏi hệ thống."
          actionLabel="Về danh sách kèo"
          onAction={() => {
            window.location.href = "/matches";
          }}
        />
      </div>
    );
  }

  const canJoin =
    canUsePlayerScope &&
    !isCreator &&
    currentMatch.status === "OPEN" &&
    !currentMatch.my_participation_status;

  const canLeave =
    canUsePlayerScope &&
    !isCreator &&
    Boolean(
      currentMatch.my_participation_status &&
        MATCH_LEAVABLE_PARTICIPATION_STATUSES.includes(
          currentMatch.my_participation_status,
        ),
    );

  const creatorName = currentMatch.creator.full_name || "Creator";
  const sportLabel =
    SPORT_TYPE_LABELS[currentMatch.sport_type] ?? currentMatch.sport_type;
  const acceptedCount = currentMatch.accepted_count;
  const pendingCount = currentMatch.pending_count;
  const slotsLeft =
    currentMatch.participant_summary?.slots_left ??
    Math.max(currentMatch.slots_needed - currentMatch.slots_filled, 0);

  const slotsFilled =
    participantsMatch?.slots_filled ?? currentMatch.slots_filled;
  const slotsNeeded =
    participantsMatch?.slots_needed ?? currentMatch.slots_needed;
  const fillPercent = Math.min(
    (slotsFilled / Math.max(slotsNeeded, 1)) * 100,
    100,
  );
  const joinCountdown = getJoinCountdown(currentMatch.join_deadline);

  const actionHint =
    isAuthenticated && isPlayerRole && playerId
      ? isCreator
        ? "Bạn là người tạo kèo. Dùng khối bên dưới để duyệt thành viên và đóng/mở kèo."
        : currentMatch.my_participation_status
          ? null
          : currentMatch.status !== "OPEN"
            ? "Kèo hiện không ở trạng thái mở, nên bạn chưa thể gửi yêu cầu tham gia."
            : "Bạn có thể gửi yêu cầu tham gia ngay."
      : null;

  return (
    <div className="flex min-h-[60vh] flex-col bg-background">
      {/* ─── Cinematic Hero ────────────────────────────────────────── */}
      <MatchHero
        title={currentMatch.title}
        description={currentMatch.description}
        sportLabel={sportLabel}
        sportType={currentMatch.sport_type}
        status={currentMatch.status}
        startTime={currentMatch.booking.start_time}
        endTime={currentMatch.booking.end_time}
        subFieldName={currentMatch.booking.sub_field_name}
        complexName={currentMatch.booking.complex_name}
        joinDeadline={currentMatch.join_deadline}
        countdown={joinCountdown}
        creatorName={creatorName}
        creatorAvatar={currentMatch.creator.avatar}
        slotsFilled={slotsFilled}
        slotsNeeded={slotsNeeded}
        fillPercent={fillPercent}
        participantsPreview={currentMatch.participants_preview}
      />

      {/* ─── Content ────────────────────────────────────────────────── */}
      <section className="page-shell py-10">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <CircleAlert />
            <AlertTitle>Có lỗi xảy ra</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isCreator ? (
          // ── Creator view — dồn toàn bộ không gian vào moderation ──────
          <CreatorPanel
            status={currentMatch.status}
            acceptedCount={acceptedCount}
            pendingCount={pendingCount}
            slotsLeft={slotsLeft}
            slotsFilled={slotsFilled}
            slotsNeeded={slotsNeeded}
            isLoading={isLoading}
            onClose={handleClose}
            onReopen={handleReopen}
            onCancel={handleCancel}
          >
            <ParticipantList
              participants={participants}
              isLoading={isLoading}
              canModerate
              onAccept={handleAccept}
              onReject={handleReject}
            />

            {participantsPagination &&
            Math.max(participantsPagination.total_pages, 1) > 1 ? (
              <PaginationBar
                page={participantsPagination.page}
                totalPages={Math.max(
                  participantsPagination.total_pages,
                  1,
                )}
                onPageChange={setParticipantPage}
                disabled={isLoading}
              />
            ) : null}
          </CreatorPanel>
        ) : (
          // ── Viewer view — info + action panel ─────────────────────────
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex min-w-0 flex-col gap-6">
              <MatchInfoCard
                startTime={currentMatch.booking.start_time}
                endTime={currentMatch.booking.end_time}
                joinDeadline={currentMatch.join_deadline}
                countdown={joinCountdown}
                subFieldName={currentMatch.booking.sub_field_name}
                complexName={currentMatch.booking.complex_name}
                complexAddress={currentMatch.booking.complex_address}
                creatorName={creatorName}
              />
            </div>

            <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <ActionPanel
                isAuthenticated={isAuthenticated}
                isPlayerRole={isPlayerRole}
                playerId={playerId}
                canJoin={canJoin}
                canLeave={canLeave}
                isLoading={isLoading}
                participationStatus={currentMatch.my_participation_status}
                actionHint={actionHint}
                onOpenJoin={() => setJoinDialogOpen(true)}
                onLeave={handleLeave}
              />
            </aside>
          </div>
        )}

        <JoinMatchDialog
          open={joinDialogOpen}
          onOpenChange={setJoinDialogOpen}
          onConfirm={handleJoin}
          isSubmitting={isLoading}
        />
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Hero
// ═══════════════════════════════════════════════════════════════════════════
interface MatchHeroProps {
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
  countdown: { label: string; urgent: boolean; expired: boolean };
  creatorName: string;
  creatorAvatar: string | null;
  slotsFilled: number;
  slotsNeeded: number;
  fillPercent: number;
  participantsPreview?: { player_id: string; full_name: string; avatar: string | null }[];
}

function MatchHero({
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
}: MatchHeroProps) {
  const countdownTone = countdown.expired
    ? "text-rose-300"
    : countdown.urgent
      ? "text-amber-300"
      : "text-accent-sport";

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,hsl(142_76%_36%/0.35),transparent_55%),radial-gradient(circle_at_90%_30%,hsl(217_91%_60%/0.35),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 sports-field-pattern opacity-[0.07]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/4 size-72 rounded-full bg-accent-sport/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 size-64 rounded-full bg-primary/25 blur-3xl"
      />

      {/* Status accent bar */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r",
          STATUS_ACCENT_BAR[status],
        )}
      />

      <div className="page-shell relative pb-14 pt-8 lg:pb-16 lg:pt-10">
        {/* Breadcrumb */}
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
              <BreadcrumbPage className="max-w-[260px] truncate text-white/90">
                {title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

    

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn("border", SPORT_TINT[sportType])}
          >
            <Sparkles data-icon="inline-start" />
            {sportLabel}
          </Badge>
          <MatchStatusBadge status={status} />
        </div>

        {/* Title */}
        <h1 className="mt-4 max-w-4xl font-display text-3xl font-black italic leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm text-white/70 sm:text-base">
            {description}
          </p>
        ) : null}

        {/* Meta strip — Time / Venue / Deadline */}
        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <HeroMetaTile
            icon={<CalendarClock className="size-3.5 text-accent-sport" />}
            label="Thi đấu"
            value={formatRangeTime(startTime, endTime)}
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
                ? `Hạn ${formatDateTime(joinDeadline)}`
                : "Không giới hạn"
            }
          />
        </div>

        {/* Roster scoreboard — progress + creator chip */}
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
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

          <span
            aria-hidden
            className="hidden h-8 w-px bg-white/10 md:block"
          />

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
                  STATUS_PROGRESS[status],
                )}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background"
      />
    </section>
  );
}

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

// ═══════════════════════════════════════════════════════════════════════════
// Match Info Card (consolidated schedule + venue + creator)
// ═══════════════════════════════════════════════════════════════════════════
interface MatchInfoCardProps {
  startTime: string | null;
  endTime: string | null;
  joinDeadline: string | null;
  countdown: { label: string; urgent: boolean; expired: boolean };
  subFieldName: string;
  complexName: string;
  complexAddress: string;
  creatorName: string;
}

function MatchInfoCard({
  startTime,
  endTime,
  joinDeadline,
  countdown,
  subFieldName,
  complexName,
  complexAddress,
  creatorName,
}: MatchInfoCardProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="border-b border-border/70 px-5 py-4">
        <CardTitle className="font-display italic">Thông tin trận</CardTitle>
        <CardDescription>
          Lịch thi đấu, địa điểm và thông tin chủ kèo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 p-0">
        <InfoRow
          icon={<CalendarClock className="size-4 text-primary" />}
          label="Thi đấu"
          value={
            <span className="font-display tabular-nums">
              {formatRangeTime(startTime, endTime)}
            </span>
          }
        />
        <Separator />
        <InfoRow
          icon={<Clock className="size-4 text-amber-500" />}
          label="Hạn tham gia"
          value={
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-display tabular-nums">
                {formatDateTime(joinDeadline)}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px]",
                  countdown.expired
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : countdown.urgent
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700",
                )}
              >
                <Timer data-icon="inline-start" />
                {countdown.label}
              </Badge>
            </div>
          }
        />
        <Separator />
        <InfoRow
          icon={<MapPin className="size-4 text-rose-500" />}
          label="Địa điểm"
          value={
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">{subFieldName}</span>
              <span className="text-sm text-muted-foreground">
                {complexName}
              </span>
              <span className="text-xs text-muted-foreground/80">
                {complexAddress}
              </span>
            </div>
          }
        />
        <Separator />
        <InfoRow
          icon={<UserRound className="size-4 text-indigo-500" />}
          label="Chủ kèo"
          value={<span className="font-semibold">{creatorName}</span>}
        />
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 px-5 py-3.5 sm:grid-cols-[auto_120px_1fr]">
      <span className="mt-0.5">{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:self-center">
        {label}
      </span>
      <div className="col-span-full text-sm text-foreground sm:col-span-1">
        {value}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Creator Panel (creator-only management)
// ═══════════════════════════════════════════════════════════════════════════
interface CreatorPanelProps {
  status: MatchStatus;
  acceptedCount: number;
  pendingCount: number;
  slotsLeft: number;
  slotsFilled: number;
  slotsNeeded: number;
  isLoading: boolean;
  onClose: () => void;
  onReopen: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

function CreatorPanel({
  status,
  acceptedCount,
  pendingCount,
  slotsLeft,
  slotsFilled,
  slotsNeeded,
  isLoading,
  onClose,
  onReopen,
  onCancel,
  children,
}: CreatorPanelProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
        <div>
          <CardTitle className="flex items-center gap-2 font-display italic">
            <Trophy className="size-4 text-primary" />
            Quản lý kèo
          </CardTitle>
          <CardDescription>
            Duyệt thành viên, đóng/mở kèo và cập nhật trạng thái.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 p-5">
        {/* Mini-scoreboard */}
        <div className="grid grid-cols-3 gap-2">
          <RosterStat
            label="Đã duyệt"
            value={acceptedCount}
            accent="success"
          />
          <RosterStat
            label="Chờ duyệt"
            value={pendingCount}
            accent="warning"
          />
          <RosterStat
            label="Chỗ trống"
            value={slotsLeft}
            accent="muted"
          />
        </div>

        {/* Progress strip */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">
              Tiến độ đội hình
            </span>
            <span className="font-display font-black italic tabular-nums">
              {slotsFilled}/{slotsNeeded}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                STATUS_PROGRESS[status],
              )}
              style={{
                width: `${Math.min((slotsFilled / Math.max(slotsNeeded, 1)) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Moderation buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading || !["OPEN", "FULL"].includes(status)}
          >
            <ShieldX data-icon="inline-start" />
            Đóng kèo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReopen}
            disabled={isLoading || status !== "CLOSED"}
          >
            <Unlock data-icon="inline-start" />
            Mở lại
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onCancel}
            disabled={
              isLoading || ["CANCELED", "COMPLETED", "EXPIRED"].includes(status)
            }
            className="ml-auto"
          >
            <ShieldX data-icon="inline-start" />
            Hủy kèo
          </Button>
        </div>

        <Separator />

        {/* Participants header */}
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <h2 className="font-display text-sm font-bold italic text-foreground">
            Danh sách thành viên
          </h2>
        </div>

        {children}
      </CardContent>
    </Card>
  );
}

function RosterStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "success" | "warning" | "muted";
}) {
  const accentBg: Record<"success" | "warning" | "muted", string> = {
    success: "bg-emerald-50/70 border-emerald-200",
    warning: "bg-amber-50/70 border-amber-200",
    muted: "bg-muted/50 border-border",
  };
  const accentText: Record<"success" | "warning" | "muted", string> = {
    success: "text-emerald-700",
    warning: "text-amber-700",
    muted: "text-foreground",
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border px-3 py-2.5",
        accentBg[accent],
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "font-display text-2xl font-black italic leading-none tabular-nums",
          accentText[accent],
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Action Panel (right sidebar)
// ═══════════════════════════════════════════════════════════════════════════
interface ActionPanelProps {
  isAuthenticated: boolean;
  isPlayerRole: boolean;
  playerId: string | null | undefined;
  canJoin: boolean;
  canLeave: boolean;
  isLoading: boolean;
  participationStatus: import("@/types/match.type").ParticipantStatus | null;
  actionHint: string | null;
  onOpenJoin: () => void;
  onLeave: () => void;
}

function ActionPanel({
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
}: ActionPanelProps) {
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
            className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
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

// ═══════════════════════════════════════════════════════════════════════════
// Pagination bar (shared style with SearchPage / ReviewsList)
// ═══════════════════════════════════════════════════════════════════════════
function PaginationBar({
  page,
  totalPages,
  onPageChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (totalPages <= 1) return null;

  const items = buildPageList(page, totalPages);

  const go = (event: React.MouseEvent, target: number) => {
    event.preventDefault();
    if (disabled) return;
    if (target < 1 || target > totalPages || target === page) return;
    onPageChange(target);
  };

  return (
    <Pagination className="pt-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1 || disabled}
            className={cn(
              (page === 1 || disabled) && "pointer-events-none opacity-50",
            )}
            onClick={(event) => go(event, page - 1)}
          />
        </PaginationItem>
        {items.map((item, idx) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === page}
                onClick={(event) => go(event, item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === totalPages || disabled}
            className={cn(
              (page === totalPages || disabled) &&
                "pointer-events-none opacity-50",
            )}
            onClick={(event) => go(event, page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildPageList(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | "ellipsis")[] = [1];
  if (current > 3) items.push("ellipsis");
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  for (let i = from; i <= to; i++) items.push(i);
  if (current < total - 2) items.push("ellipsis");
  items.push(total);
  return items;
}
