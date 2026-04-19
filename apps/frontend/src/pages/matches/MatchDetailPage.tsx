import { JoinMatchDialog } from "@/components/matches/JoinMatchDialog";
import { MatchParticipantsAvatarGroup } from "@/components/matches/MatchParticipantsAvatarGroup";
import { MatchStatusBadge } from "@/components/matches/MatchStatusBadge";
import { ParticipantList } from "@/components/matches/ParticipantList";
import { ParticipantStatusBadge } from "@/components/matches/ParticipantStatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SPORT_TYPE_LABELS } from "@/lib/constants";
import { useAuthStore } from "@/store/useAuthStore";
import { useMatchStore } from "@/store/useMatchStore";
import { MATCH_LEAVABLE_PARTICIPATION_STATUSES } from "@/types/match.type";
import { getNameInitials } from "@/utils/review.utils";
import { getPlayerProfileId } from "@/utils/userProfile";
import {
    ArrowLeft,
    CalendarClock,
    CircleAlert,
    Lock,
    MapPin,
    ShieldX,
    Sparkles,
    Timer,
    Unlock,
    UserRound,
    Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const PARTICIPANTS_PAGE_SIZE = 10;

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

  return {
    label:
      days > 0
        ? `${days} ngày ${hours} giờ`
        : hours > 0
          ? `${hours} giờ ${minutes} phút`
          : `${Math.max(minutes, 1)} phút`,
    urgent: totalMinutes <= 180,
    expired: false,
  };
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

  const detailScope: "public" | "player" = canUsePlayerScope ? "player" : "public";

  useEffect(() => {
    if (!id) return;

    void fetchMatchById(id, detailScope);
  }, [id, detailScope, fetchMatchById]);

  const isCreator = useMemo(() => {
    if (!currentMatch || !playerId) {
      return false;
    }

    return currentMatch.creator.player_id === playerId;
  }, [currentMatch, playerId]);

  useEffect(() => {
    if (!id || !isCreator) {
      return;
    }

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

    if (!result) {
      return false;
    }

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
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground">ID kèo không hợp lệ.</p>
      </div>
    );
  }

  if (isLoadingDetail && !currentMatch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground">Đang tải chi tiết kèo...</p>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground">Không tìm thấy kèo.</p>
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
  const sportLabel = SPORT_TYPE_LABELS[currentMatch.sport_type] ?? currentMatch.sport_type;
  const acceptedCount = currentMatch.accepted_count;
  const pendingCount = currentMatch.pending_count;
  const slotsLeft =
    currentMatch.participant_summary?.slots_left ??
    Math.max(currentMatch.slots_needed - currentMatch.slots_filled, 0);

  const creatorSlotsFilled = participantsMatch?.slots_filled ?? currentMatch.slots_filled;
  const creatorSlotsNeeded = participantsMatch?.slots_needed ?? currentMatch.slots_needed;
  const creatorFillPercent = Math.min(
    (creatorSlotsFilled / Math.max(creatorSlotsNeeded, 1)) * 100,
    100,
  );
  const joinCountdown = getJoinCountdown(currentMatch.join_deadline);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-105 bg-linear-to-b from-emerald-50 via-green-50/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-105 sports-field-pattern opacity-70" />

      <div className="container relative mx-auto space-y-8 px-4 py-6 md:space-y-10 md:py-10">
        <Button
          asChild
          variant="ghost"
          className="-ml-3 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
        >
          <Link to="/matches">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Quay lại danh sách kèo
          </Link>
        </Button>

        <section className="sports-glow-success relative overflow-hidden rounded-[30px] border border-emerald-200/90 bg-white/95 p-6 shadow-lg shadow-emerald-900/10 md:p-9">
          <div className="pointer-events-none absolute inset-0 sports-field-pattern opacity-75" />
          <div className="pointer-events-none absolute -right-12 top-0 h-52 w-52 rounded-full bg-emerald-300/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-rose-300/25 blur-3xl" />

          <div className="relative grid gap-7 lg:grid-cols-[1.45fr_1fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-linear-to-r from-emerald-500 to-green-600 text-white">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  {sportLabel}
                </Badge>
                <MatchStatusBadge status={currentMatch.status} />
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                  {currentMatch.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 md:text-lg">
                  {currentMatch.description || "Kèo này chưa có mô tả thêm từ creator."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Bắt đầu</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDateTime(currentMatch.booking.start_time)}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Hạn tham gia
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDateTime(currentMatch.join_deadline)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Địa điểm</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {currentMatch.booking.sub_field_name} - {currentMatch.booking.complex_name}
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-3 text-sm shadow-sm sm:col-span-2 ${
                    joinCountdown.expired
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : joinCountdown.urgent
                        ? "border-orange-200 bg-orange-50 text-orange-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <p className="flex items-center gap-1.5 font-medium">
                    <Timer className="h-4 w-4" />
                    Countdown tham gia
                  </p>
                  <p className="mt-1 text-sm font-semibold">{joinCountdown.label}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-white/90 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Người tạo kèo</p>

              <div className="mt-3 flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarImage
                    src={currentMatch.creator.avatar ?? undefined}
                    alt={creatorName}
                  />
                  <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                    {getNameInitials(creatorName, "Creator")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base font-semibold text-slate-900">{creatorName}</p>
                  <p className="text-xs text-slate-500">Creator ID: {currentMatch.creator.player_id}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                Người tham gia
              </p>
              <MatchParticipantsAvatarGroup
                participants={currentMatch.participants_preview}
                slotsFilled={currentMatch.slots_filled}
              />

              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <p className="font-semibold">
                  {currentMatch.slots_filled}/{currentMatch.slots_needed} người
                </p>
                <div className="mt-2 h-2 rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-500 to-green-600"
                    style={{ width: `${Math.min((currentMatch.slots_filled / Math.max(currentMatch.slots_needed, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <Alert variant="destructive">
            <CircleAlert className="h-4 w-4" />
            <AlertTitle>Có lỗi xảy ra</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-emerald-200 bg-emerald-50/85 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700">Đã chấp nhận</CardDescription>
              <CardTitle className="text-2xl text-emerald-700">{acceptedCount}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-amber-200 bg-amber-50/85 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700">Đang chờ duyệt</CardDescription>
              <CardTitle className="text-2xl text-amber-700">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-rose-200 bg-rose-50/85 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-rose-700">Chỗ trống còn lại</CardDescription>
              <CardTitle className="text-2xl text-rose-700">{slotsLeft}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Thông tin trận đấu</CardTitle>
                <CardDescription>
                  Chi tiết đầy đủ về thời gian, địa điểm và lịch trình của kèo này.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2 text-slate-700">
                  <CalendarClock className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <p>
                    <span className="font-semibold">Thời gian thi đấu:</span>{" "}
                    {formatDateTime(currentMatch.booking.start_time)} -{" "}
                    {formatDateTime(currentMatch.booking.end_time)}
                  </p>
                </div>

                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="mt-0.5 h-4 w-4 text-red-500" />
                  <div>
                    <p>
                      <span className="font-semibold">Sân:</span>{" "}
                      {currentMatch.booking.sub_field_name}
                    </p>
                    <p>
                      <span className="font-semibold">Khu phức hợp:</span>{" "}
                      {currentMatch.booking.complex_name}
                    </p>
                    <p className="text-slate-500">{currentMatch.booking.complex_address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-700">
                  <UserRound className="mt-0.5 h-4 w-4 text-indigo-500" />
                  <p>
                    <span className="font-semibold">Creator:</span> {creatorName}
                  </p>
                </div>
              </CardContent>
            </Card>

            {isCreator ? (
              <Card className="border-emerald-200/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Quản lý kèo của bạn</CardTitle>
                  <CardDescription>
                    Duyệt thành viên, đóng mở kèo và cập nhật trạng thái trực tiếp trong trang chi
                    tiết.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-white p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <p className="font-semibold text-emerald-700">Tiến độ đội hình</p>
                      <p className="font-semibold text-emerald-800">
                        {creatorSlotsFilled}/{creatorSlotsNeeded} người
                      </p>
                    </div>
                    <div className="h-2.5 rounded-full bg-emerald-100">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-emerald-500 to-green-600 transition-all"
                        style={{ width: `${creatorFillPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Đã lấp đầy</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {creatorSlotsFilled}/{creatorSlotsNeeded}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Pending</p>
                      <p className="mt-1 font-semibold text-slate-800">{pendingCount}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Accepted</p>
                      <p className="mt-1 font-semibold text-slate-800">{acceptedCount}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      disabled={isLoading || !["OPEN", "FULL"].includes(currentMatch.status)}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Lock className="mr-1.5 h-4 w-4" />
                      Đóng kèo
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleReopen}
                      disabled={isLoading || currentMatch.status !== "CLOSED"}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Unlock className="mr-1.5 h-4 w-4" />
                      Mở lại kèo
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={
                        isLoading ||
                        ["CANCELED", "COMPLETED", "EXPIRED"].includes(currentMatch.status)
                      }
                      className="sports-glow-danger h-11 bg-linear-to-r from-rose-500 to-red-600 px-5 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-500/40"
                    >
                      <ShieldX className="mr-1.5 h-4 w-4" />
                      Hủy kèo
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <h2 className="text-sm font-semibold text-slate-800">Danh sách thành viên</h2>
                    </div>

                    <ParticipantList
                      participants={participants}
                      isLoading={isLoading}
                      canModerate
                      slotsFilled={creatorSlotsFilled}
                      slotsNeeded={creatorSlotsNeeded}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />

                    {participantsPagination ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="text-sm text-slate-600">
                          Trang {participantsPagination.page}/
                          {Math.max(participantsPagination.total_pages, 1)}
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setParticipantPage((previous) => Math.max(1, previous - 1))
                            }
                            disabled={participantPage <= 1 || isLoading}
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            Trang trước
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setParticipantPage((previous) => previous + 1)}
                            disabled={!participantsPagination.has_next || isLoading}
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            Trang sau
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <aside className="space-y-6">
            <Card className="border-emerald-200/70 shadow-sm">
              <CardHeader>
                <CardTitle>Hành động của bạn</CardTitle>
                <CardDescription>
                  Tham gia hoặc rời kèo trực tiếp từ panel này.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {currentMatch.my_participation_status ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                      Trạng thái tham gia của bạn
                    </p>
                    <ParticipantStatusBadge status={currentMatch.my_participation_status} />
                  </div>
                ) : null}

                {isAuthenticated && !isPlayerRole ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    Tài khoản hiện tại chưa có vai trò người chơi nên chưa thể tham gia kèo.
                  </p>
                ) : null}

                {isAuthenticated && isPlayerRole && !playerId ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    Không tìm thấy hồ sơ người chơi. Vui lòng đăng xuất và đăng nhập lại.
                  </p>
                ) : null}

                {canJoin ? (
                  <Button
                    onClick={() => setJoinDialogOpen(true)}
                    disabled={isLoading}
                    className="sports-glow-success h-11 w-full bg-linear-to-r from-emerald-500 to-green-600 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/45"
                  >
                    Tham gia kèo
                  </Button>
                ) : null}

                {canLeave ? (
                  <Button
                    variant="outline"
                    onClick={handleLeave}
                    disabled={isLoading}
                    className="h-11 w-full border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    Rời kèo
                  </Button>
                ) : null}

                {!isAuthenticated ? (
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Link to="/auth/login">Đăng nhập để tham gia</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Thông tin sân</CardTitle>
                <CardDescription>Chi tiết địa điểm tổ chức kèo.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 text-sm text-slate-700">
                <p className="font-medium text-slate-900">{currentMatch.booking.complex_name}</p>
                <p>Sân: {currentMatch.booking.sub_field_name}</p>
                <p>Địa chỉ: {currentMatch.booking.complex_address}</p>
                <p className="text-xs text-slate-500">Booking ID: {currentMatch.booking.id}</p>
              </CardContent>
            </Card>
          </aside>
        </div>

        <JoinMatchDialog
          open={joinDialogOpen}
          onOpenChange={setJoinDialogOpen}
          onConfirm={handleJoin}
          isSubmitting={isLoading}
        />
      </div>
    </div>
  );
}
